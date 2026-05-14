// app/src/features/bluetooth/services/P2PAutoSync.js
import { NetworkRailDetector, RAIL_TYPES } from './NetworkRailDetector';
import { NearbyMeshService } from './NearbyMeshService';
import { WifiDirectService } from './WifiDirectService';
import { ManifestService } from '../../loba/services/ManifestService';
import { RecommendationEngine } from '../../loba/services/RecommendationEngine';
import { TransferQueueManager } from '../../loba/services/TransferQueueManager';
import { LocalStorageManager } from '../../loba/services/LocalStorageManager';
import { LobaPackService } from '../../loba/services/LobaPackService';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

const P2P_SYNC_INTERVAL_MS = 3000; 
const CLOUD_SYNC_INTERVAL_MS = 60000; 
const DISCONNECT_COOLDOWN_MS = 5000; 

/**
 * P2PAutoSync — L'Orchestrateur Central (V2.6 - Deep Fix Handshake)
 */
class P2PAutoSyncClass {
  constructor() {
    this._p2pInterval = null;
    this._cloudInterval = null;
    this._running = false;
    this._isStopping = false; 
    this._syncingP2P = false;
    this._syncingCloud = false;
    this._manualTrigger = false; 
    this._lastManualSync = 0; 
    this._connectAttemptPending = false; 
    this._lastSentTo = {};
    this._lastReceivedFrom = {};
    this._lastDisconnectAt = 0; 
    this._pendingPostsCount = 0; 
    this.stats = {
      totalSyncedP2P: 0,
      totalSyncedCloud: 0,
      activeRails: [],
      logs: [],
    };
  }

  _log(msg) {
    const timestamp = new Date().toLocaleTimeString();
    const logLine = `[${timestamp}] ${msg}`;
    console.log(`[P2PAutoSync] ${msg}`);
    this.stats.logs.unshift(logLine);
    if (this.stats.logs.length > 50) this.stats.logs.pop();
    WifiDirectService._emit('onLogUpdate', this.stats.logs);
  }

  onLogUpdate(callback) {
    return WifiDirectService.on('onLogUpdate', (logs) => callback(logs || this.stats.logs));
  }

  _parseScore(name) {
    if (!name) return 0;
    return parseInt(name.split('_')[0], 10) || 0;
  }

  _iAmMasterFor(peerName) {
    const myScore = this._parseScore(WifiDirectService.getDeviceName());
    const peerScore = this._parseScore(peerName);
    
    const iHaveContent = this._pendingPostsCount > 0;

    if (myScore > 0 && peerScore > 0) {
       const lastReceived = this._lastReceivedFrom[peerName] || 0;
       const lastSent = this._lastSentTo[peerName] || 0;
       const fiveMinsAgo = Date.now() - 5 * 60000;
       
       if (iHaveContent && lastReceived > lastSent && lastReceived > fiveMinsAgo) {
           return false;
       }
       
       if (lastSent > lastReceived && lastSent > fiveMinsAgo) {
           return true; 
       }
    }

    return peerScore > 0 ? myScore > peerScore : myScore >= 40;
  }

  async _updatePendingCount() {
    try {
      const count = await database.get('loba_posts').query(Q.where('is_propagating', true)).fetchCount();
      this._pendingPostsCount = count;
    } catch (_) {
      this._pendingPostsCount = 0;
    }
  }

  async start() {
    if (this._running) return;
    this._running = true;

    console.log('[P2PAutoSync] Démarrage de l\'orchestrateur Multi-Rail...');
    this._log('🚀 Orchestrateur démarré (V2.6).');

    NetworkRailDetector.start();
    NetworkRailDetector.onRailChange((rails) => {
      this.stats.activeRails = rails;
    });

    WifiDirectService.setGlobalFileHandler((path, meta) => this._handleReceivedFile(path, meta, 'WifiDirect'));

    NearbyMeshService.MeshLogEvents.subscribe((msg) => {
      this._log(`[MESH] ${msg}`);
    });

    setTimeout(() => {
      if (this._running) {
        NearbyMeshService.startMesh().catch(e => {
          this._log(`[MESH] ❌ Crash initialisation: ${e.message}`);
        });
      }
    }, 2000);

    try {
      const state = WifiDirectService.getState();
      if (state.isAvailable) {
        await WifiDirectService.initialize();
        await WifiDirectService.startDiscovery(true);
      }
      
      WifiDirectService.removeAllListeners('onPeerFound');
      WifiDirectService.removeAllListeners('onConnectionChange');

      WifiDirectService.on('onPeerFound', async (peer) => {
        if (!this._running || WifiDirectService.connectedPeer || WifiDirectService.isConnecting) return;

        const timeSinceDisconnect = Date.now() - this._lastDisconnectAt;
        if (timeSinceDisconnect < DISCONNECT_COOLDOWN_MS) return;

        const peerName = (peer.deviceName || 'Unknown').toLowerCase();
        const isMaster = this._iAmMasterFor(peerName);

        if (isMaster) {
          this._log(`🤝 [Master] Création du groupe...`);
          await WifiDirectService.connectToPeer(peer, 0, 'MASTER');
        } else {
          this._log(`⏳ [Slave] Connexion au Master dans 2s...`);
          setTimeout(async () => {
            if (!WifiDirectService.connectedPeer && !WifiDirectService.isConnecting && this._running) {
              await WifiDirectService.connectToPeer(peer, 0, 'SLAVE');
            }
          }, 2000);
        }
      });

      WifiDirectService.on('onConnectionChange', async ({ connected, info }) => {
        if (connected && this._running) {
          this._log('📶 WiFi Direct CONNECTÉ ! Handshake final (1s)...');
          setTimeout(() => {
            if (WifiDirectService.connectedPeer && this._running) {
              if (!WifiDirectService.isGroupOwner) {
                this._log('🚀 Envoi immédiat du Pack Loba...');
                this._p2pSyncCycle();
              } else {
                this._log('📡 Mode Réception — Prêt.');
              }
            }
          }, 1000);
        } else {
          WifiDirectService.stopReceiving();
          this._lastDisconnectAt = Date.now();
          this._log('🔌 Déconnexion détectée. Cool-down (5s)...');
        }
      });

    } catch (e) {
      console.warn('[P2PAutoSync] WiFi Direct init error:', e.message);
    }

    if (this._p2pInterval) clearInterval(this._p2pInterval);
    this._p2pInterval = setInterval(() => this._p2pSyncCycle(), P2P_SYNC_INTERVAL_MS);
    this._p2pSyncCycle();
  }

  async requestWifiDirectActivation() {
    try {
      const state = WifiDirectService.getState();
      if (!state.initialized) await WifiDirectService.initialize();
      await WifiDirectService.startDiscovery(true);
      this._log('⚡ Activation WiFi Direct demandée par l\'accueil.');
    } catch (e) {}
  }

  async forceRefresh() {
    this._log('🔄 Hard Reset des services P2P...');
    this.stop();
    await new Promise(resolve => setTimeout(resolve, 1500));
    await this.start();
    WifiDirectService.startDiscovery(true);
  }

  async triggerSync(category = null, force = false) {
    if (!this._running) await this.start();
    this._manualTrigger = true;
    this._lastManualSync = Date.now();
    this._log(`⚡ Synchronisation forcée déclenchée...`);

    if (!WifiDirectService.connectedPeer && !WifiDirectService.isConnecting) {
      const timeSinceDisconnect = Date.now() - this._lastDisconnectAt;
      if (!force && timeSinceDisconnect < DISCONNECT_COOLDOWN_MS) return;
      
      if (force) await WifiDirectService.startDiscovery(true);

      await this._updatePendingCount();
      const detectedPeers = WifiDirectService.peers || [];
      if (detectedPeers.length > 0) {
        const isMaster = this._iAmMasterFor(detectedPeers[0].deviceName);
        await WifiDirectService.connectToPeer(detectedPeers[0], 0, isMaster ? 'MASTER' : 'SLAVE');
      }
    }

    await this._p2pSyncCycle(category);
    setTimeout(() => { this._manualTrigger = false; }, 10000);
  }

  async sendTestPing() {
    this._log('📡 Envoi d\'un TEST PING...');
    const bestRail = NetworkRailDetector.getBestRail(true);
    if (bestRail === RAIL_TYPES.OFFLINE) return false;

    try {
      if (bestRail === RAIL_TYPES.WIFI_DIRECT) {
        const success = await WifiDirectService.sendFile(null, {
          type: 'PING',
          timestamp: Date.now(),
          username: 'System Test',
        });
        if (success) this._log('✅ Ping envoyé via WiFi!');
        return success;
      }
    } catch (e) {}
    return false;
  }

  async stop() {
    this._running = false;
    if (this._p2pInterval) clearInterval(this._p2pInterval);
    if (this._cloudInterval) clearInterval(this._cloudInterval);
    this._p2pInterval = null;
    this._cloudInterval = null;

    try {
      NetworkRailDetector.stop();
      await NearbyMeshService.stopMesh();
      await WifiDirectService.stopDiscovery();
      await WifiDirectService.disconnect();
    } catch (e) {}
    this._log('🛑 Orchestrateur arrêté.');
  }

  async _p2pSyncCycle(category = null) {
    if (!this._running || this._syncingP2P) return;
    this._syncingP2P = true;

    try {
      await this._updatePendingCount();
      const state = WifiDirectService.getState();
      if (state.isAvailable) {
        if (!state.initialized) await WifiDirectService.initialize();

        const timeSinceDisconnect = Date.now() - this._lastDisconnectAt;
        if (timeSinceDisconnect < DISCONNECT_COOLDOWN_MS) {
           this._syncingP2P = false;
           return;
        }

        if (!WifiDirectService.connectedPeer && !WifiDirectService.isConnecting) {
          if (!state.isDiscovering) await WifiDirectService.startDiscovery(true);
          
          const detectedPeers = WifiDirectService.peers || [];
          if (detectedPeers.length > 0) {
            const peer = detectedPeers[0];
            const isMaster = this._iAmMasterFor(peer.deviceName);
            await WifiDirectService.connectToPeer(peer, 0, isMaster ? 'MASTER' : 'SLAVE');
          }
        }
      }

      const bestP2P = NetworkRailDetector.getBestRail(true);
      if (bestP2P === RAIL_TYPES.WIFI_DIRECT && WifiDirectService.connectedPeer) {
        if (WifiDirectService.isGroupOwner) {
          this._log('📡 Mode Réception — Prêt.');
        } else {
          this._log('🟢 Slave connecté — envoi du pack...');
          const packPath = await LobaPackService.buildPack(category);
          if (packPath) {
            this._log(`📤 Envoi du Pack...`);
            let sent = await WifiDirectService.sendFile(packPath, {
              hash: `pack_${Date.now()}`,
              type: 'LOBA_PACK',
              category: category || 'bundle',
              senderDevice: WifiDirectService.getDeviceName()
            });

            if (sent) {
              const peerName = (WifiDirectService.connectedPeer?.deviceName || 'Unknown').toLowerCase();
              this._lastSentTo[peerName] = Date.now();
              this._log(`✅ Succès: Pack envoyé !`);
              setTimeout(() => { WifiDirectService.disconnect(); }, 3000);
            }
          }
        }
      } else if (bestP2P === RAIL_TYPES.BLE_MESH) {
        const pendingUploads = await this._getPendingUploads();
        if (pendingUploads.length > 0) {
          for (const post of pendingUploads) await this._propagateToPeers(post, bestP2P);
        }
      }

      await LocalStorageManager.applyLRUPolicy();
      this.stats.lastSyncAt = Date.now();
    } catch (e) {
      console.error('[P2PAutoSync] P2P Cycle Error:', e);
    } finally {
      this._syncingP2P = false;
    }
  }

  async _handleReceivedFile(filePath, metadata, source) {
    try {
      if (!metadata || !metadata.hash) {
        if (metadata?.action === 'PING') {
          this._log(`⭐ REÇU PING via ${source}!`);
          return;
        }
        return;
      }
      
      if (metadata.type === 'LOBA_PACK') {
          this._log(`📥 Reçu Loba Pack. Traitement...`);
          const peerName = (metadata.senderDevice || WifiDirectService.connectedPeer?.deviceName || 'Unknown').toLowerCase();
          this._lastReceivedFrom[peerName] = Date.now();
          const success = await LobaPackService.unpackAndProcess(filePath);
          if (success) {
            this._log(`✅ Pack traité !`);
            this.stats.totalSyncedP2P++;
          }
          setTimeout(() => WifiDirectService.disconnect(), 3000);
          return;
      }
      
      const hash = metadata.hash || await LocalStorageManager.hashFile(filePath);
      const ext = metadata.type === 'video' ? 'mp4' : 'jpg';
      const result = await LocalStorageManager.saveMedia(filePath, hash, ext);
      if (!result || !result.path) return;
      const { path: savedPath, size: savedSize } = result;

      const existing = await database.get('loba_posts').query(Q.where('hash', hash)).fetch();
      await database.write(async () => {
        if (existing.length > 0) {
          await existing[0].update(p => {
            p.localMediaPath = savedPath;
            p.downloadedAt = Date.now();
            p.size = savedSize || p.size || 0;
          });
        } else {
          await database.get('loba_posts').create(post => {
            post.hash = hash;
            post.localMediaPath = savedPath;
            post.downloadedAt = Date.now();
            post.username = metadata.username || `${source} Peer`;
            post.avatar = metadata.avatar || null;
            post.content = metadata.content || '';
            post.isPropagating = false;
            post.category = metadata.category || 'general';
            post.size = savedSize || 0;
            post.imageUrl = metadata.type === 'image' ? savedPath : null;
            post.videoUrl = metadata.type === 'video' ? savedPath : null;
            post.likes = metadata.likes || 0;
            post.comments = metadata.comments || 0;
            post.isLiked = false;
          });
        }
      });
      this.stats.totalSyncedP2P++;
      this._log(`📥 Reçu via ${source}: ${hash.substring(0,8)}...`);
    } catch (e) {
      this._log(`❌ Erreur réception: ${e.message}`);
    }
  }

  async _getPendingUploads() {
    return await database.get('loba_posts').query(Q.where('is_propagating', true), Q.where('local_media_path', Q.notEq(null))).fetch();
  }

  async _markAsPropagated(post) {
    await database.write(async () => { await post.update(p => { p.isPropagating = false; }); });
    this.stats.totalSyncedP2P++;
  }

  async _propagateToPeers(post, rail) {
    try {
      if (!post || !post.localMediaPath) {
        await this._markAsPropagated(post);
        return;
      }
      if (rail === RAIL_TYPES.BLE_MESH) {
        this._log(`📡 Propagation via Mesh: ${post.hash?.substring(0, 8)}`);
        await this._markAsPropagated(post);
      }
    } catch (e) {
      this._log(`❌ Erreur propagation: ${e.message}`);
    }
  }

  async publishLocal(params) {
    const { uri, type, caption, filter, username = '@Me', category = 'general' } = params;
    try {
      const hash = uri ? await LocalStorageManager.hashFile(uri) : null;
      let localPath = null;
      let result = null;
      if (uri) {
        const ext = type === 'video' ? 'mp4' : 'jpg';
        result = await LocalStorageManager.saveMedia(uri, hash, ext);
        if (result) localPath = result.path;
      }

      let newPost;
      await database.write(async () => {
        newPost = await database.get('loba_posts').create(post => {
          post.username = username;
          post.content = caption || '';
          post.hash = hash;
          post.localMediaPath = localPath;
          post.category = category;
          post.isPropagating = true;
          post.downloadedAt = Date.now();
          post.imageUrl = type === 'image' ? (result ? result.path : null) : null;
          post.videoUrl = type === 'video' ? (result ? result.path : null) : null;
          post.filterColor = filter || null;
          post.likes = 0;
          post.comments = 0;
          post.isLiked = false;
          post.size = (result ? result.size : 0) || 0;
        });

        await database.get('sync_queue').create(item => {
          item.action = 'CREATE_LOBA_POST';
          item.payloadJson = JSON.stringify({ postId: newPost.id, hash, type, caption, username, category });
          item.status = 'pending';
          item.retryCount = 0;
          item.createdAt = Date.now();
          item.updatedAt = Date.now();
        });
      });
      return { success: true, postId: newPost.id, hash };
    } catch (e) {
      console.error('[P2PAutoSync] publishLocal error:', e);
      return { success: false, error: e.message };
    }
  }

  getStats() {
    return {
      ...this.stats,
      blePeers: NearbyMeshService.connectedPeers?.size || 0,
      wifiDirectPeer: WifiDirectService.connectedPeer ? 1 : 0,
    };
  }
}

export const P2PAutoSync = new P2PAutoSyncClass();
