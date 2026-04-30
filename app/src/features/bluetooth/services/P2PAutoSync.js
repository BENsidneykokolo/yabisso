// app/src/features/bluetooth/services/P2PAutoSync.js
import { NetworkRailDetector, RAIL_TYPES } from './NetworkRailDetector';
import { MeshSyncService } from './MeshSyncService';
import { WifiDirectService } from './WifiDirectService';
import { ManifestService } from '../../loba/services/ManifestService';
import { RecommendationEngine } from '../../loba/services/RecommendationEngine';
import { TransferQueueManager } from '../../loba/services/TransferQueueManager';
import { LocalStorageManager } from '../../loba/services/LocalStorageManager';
import { LobaPackService } from '../../loba/services/LobaPackService';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

const P2P_SYNC_INTERVAL_MS = 20000; // 20 secondes pour P2P
const CLOUD_SYNC_INTERVAL_MS = 60000; // 60 secondes pour Cloud Fallback

/**
 * P2PAutoSync — L'Orchestrateur Central (V2 - Cloud Saver)
 */
class P2PAutoSyncClass {
  constructor() {
    this._p2pInterval = null;
    this._cloudInterval = null;
    this._running = false;
    this._syncingP2P = false;
    this._syncingCloud = false;
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

  async start() {
    if (this._running) return;
    this._running = true;

    console.log('[P2PAutoSync] Démarrage de l\'orchestrateur Multi-Rail...');

    NetworkRailDetector.start();
    NetworkRailDetector.onRailChange((rails) => {
      this.stats.activeRails = rails;
      console.log(`[P2PAutoSync] Rails actifs: ${rails.join(', ')}`);
    });

    // Phase 13: Brancher le récepteur global
    WifiDirectService.setGlobalFileHandler((path, meta) => this._handleReceivedFile(path, meta, 'WifiDirect'));

    try {
      await MeshSyncService.initialize();
      MeshSyncService.startMeshScanning();
    } catch (e) {
      console.warn('[P2PAutoSync] Mesh init error:', e.message);
    }

    try {
      if (WifiDirectService.getState().isAvailable) {
        const initOk = await WifiDirectService.initialize();
        if (initOk) {
          await WifiDirectService.startDiscovery();
        } else {
          console.warn('[P2PAutoSync] WiFi Direct init échouée au démarrage, retry dans 5s...');
          setTimeout(async () => {
            const ok = await WifiDirectService.initialize();
            if (ok) await WifiDirectService.startDiscovery();
          }, 5000);
        }
      }
      
      WifiDirectService.on('onPeerFound', async (peer) => {
        if (WifiDirectService.connectedPeer || WifiDirectService.isConnecting || !this._running) {
          return;
        }
        const macSuffix = peer.deviceAddress ? peer.deviceAddress.split(':').pop() : '??';
        this._log(`📡 Peer trouvé: ${peer.deviceName || 'Inconnu'} (${macSuffix}). Attente d'action manuelle.`);
      });

      WifiDirectService.on('onConnectionChange', async ({ connected, info }) => {
        if (connected) {
          this._log('📶 Connexion P2P établie. Attente de la stabilisation GO (5s)...');
          setTimeout(() => {
            if (WifiDirectService.connectedPeer) {
              if (!WifiDirectService.isGroupOwner) {
                // CLIENT: lance le cycle d'envoi (buildPack + sendFile)
                this._log('🚀 Rôle CLIENT — Lancement du cycle d\'envoi P2P...');
                this._p2pSyncCycle();
                // Note: Le CLIENT n'a PAS besoin de startReceiving
                // Le GO reçoit automatiquement via subscribeOnConnectionInfoUpdates → globalFileHandler
              } else {
                // GO: est déjà en mode réception (démarré dans subscribeOnConnectionInfoUpdates)
                this._log('📡 Rôle GROUP OWNER — Mode réception actif, en attente de pack du client...');
              }
            }
          }, 5000);

        } else {
          WifiDirectService.stopReceiving();
        }
      });

    } catch (e) {
      console.warn('[P2PAutoSync] WiFi Direct init error:', e.message);
    }

    this._p2pInterval = setInterval(() => this._p2pSyncCycle(), P2P_SYNC_INTERVAL_MS);
    this._p2pSyncCycle();
    this._log('🚀 Orchestrateur démarré (Mode Cloud Saver).');
  }

  /**
   * Phase 15: Demande hybride pour l'écran LobaHomeScreen.
   * Assure que le service est initialisé et prêt.
   */
  async requestWifiDirectActivation() {
    try {
      const state = WifiDirectService.getState();
      if (!state.initialized) {
        await WifiDirectService.initialize();
      }
      this._log('⚡ Activation WiFi Direct demandée par l\'accueil.');
    } catch (e) {
      console.warn('[P2PAutoSync] Échec activation WiFi:', e.message);
    }
  }

  async forceRefresh() {
    this._log('🔄 Hard Reset des services P2P (Déconnexion)...');
    this.stop();
    await new Promise(resolve => setTimeout(resolve, 1500));
    await this.start();
    WifiDirectService.startDiscovery(true);
  }

  async triggerSync(category = null) {
    if (!this._running) {
       this._log('ℹ️ Orchestrateur non démarré. Démarrage automatique...');
       await this.start();
    }
    this._log(`⚡ Synchronisation ${category ? category : 'manuelle'} déclenchée...`);
    await this._p2pSyncCycle(category);
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
      } else if (bestRail === RAIL_TYPES.BLE_MESH) {
        const result = await MeshSyncService.broadcast('PING', {
          type: 'PING',
          timestamp: Date.now(),
        });
        if (result.success) this._log('✅ Ping envoyé via Mesh!');
        return result.success;
      }
    } catch (e) {
      this._log(`❌ Échec Ping: ${e.message}`);
    }
    return false;
  }

  stop() {
    this._running = false;
    if (this._p2pInterval) clearInterval(this._p2pInterval);
    if (this._cloudInterval) clearInterval(this._cloudInterval);
    NetworkRailDetector.stop();
    MeshSyncService.stopMeshScanning();
    WifiDirectService.stopDiscovery();
    console.log('[P2PAutoSync] Orchestrateur arrêté.');
  }

  async _p2pSyncCycle(category = null) {
    if (!this._running || this._syncingP2P) return;
    this._syncingP2P = true;

    try {
      const bestP2P = NetworkRailDetector.getBestRail(true);
      
      if (bestP2P === RAIL_TYPES.OFFLINE) {
        const state = WifiDirectService.getState();
        if (state.isAvailable && !state.initialized) {
          await WifiDirectService.initialize();
          await WifiDirectService.startDiscovery();
        } else if (!state.isDiscovering && !WifiDirectService.isConnecting) {
          await WifiDirectService.startDiscovery(true);
        }
      }

      if (bestP2P === RAIL_TYPES.OFFLINE || bestP2P === RAIL_TYPES.INTERNET) {
        return;
      }

      this._log(`🔄 Cycle P2P via ${bestP2P}...`);

      if (bestP2P === RAIL_TYPES.WIFI_DIRECT && WifiDirectService.connectedPeer) {
         if (!WifiDirectService.groupOwnerAddress) {
           this._log('⚠️ Connecté mais IP non résolue. Attente du Framework...');
           return;
         }

         if (WifiDirectService.isGroupOwner) {
           if (!this._goLoggedOnce) {
             this._log('📡 Ce device est le Group Owner — mode réception actif. En attente de packs des clients...');
             this._goLoggedOnce = true;
           }
           WifiDirectService._emit('onSyncStatus', { status: 'WAITING_FOR_CLIENT' });
         } else {
           this._goLoggedOnce = false;
           this._log(`📦 Création du Pack ${category || 'Général'} en cours (Max 50MB)...`);
           WifiDirectService._emit('onSyncStatus', { status: 'PACKING' });
           
           const packPath = await LobaPackService.buildPack(category);
           if (packPath) {
               this._log(`📤 Envoi du Pack ${category || 'Général'} via WiFi Direct...`);
               WifiDirectService._emit('onSyncStatus', { status: 'SENDING' });
               const sent = await WifiDirectService.sendFile(packPath, {
                  hash: `pack_${Date.now()}`,
                  type: 'LOBA_PACK',
                  category: category || 'bundle'
               });
               if (sent) {
                  this._log(`✅ Succès: Pack ${category || 'Général'} envoyé !`);
                  WifiDirectService._emit('onSyncStatus', { status: 'SUCCESS' });
                  setTimeout(() => WifiDirectService.disconnect(), 3000);
               } else {
                  this._log('⚠️ Échec de l\'envoi du Loba Pack.');
                  WifiDirectService._emit('onSyncStatus', { status: 'ERROR', message: 'Échec envoi' });
               }
           } else {
               this._log('ℹ️ Rien de nouveau à envoyer dans le Pack.');
               WifiDirectService._emit('onSyncStatus', { status: 'IDLE' });
           }
         }
       } else {
           // Rail BLE Mesh ou autre: pas de transfert de gros packs
           // _propagateToPeers gère uniquement les petits payloads via BLE
           const pendingUploads = await this._getPendingUploads();
           for (const post of pendingUploads) {
             await this._propagateToPeers(post, bestP2P);
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
          this._log(`⭐ REÇU PING via ${source}! (Connecté OK)`);
          return;
        }
        return;
      }
      
      if (metadata.type === 'LOBA_PACK') {
          this._log(`📥 Reçu Loba Pack via ${source}. Décompression & Traitement...`);
          WifiDirectService._emit('onSyncStatus', { status: 'RECEIVING' });
          const success = await LobaPackService.unpackAndProcess(filePath);
          if (success) {
              this._log(`✅ Pack traité avec succès !`);
              this.stats.totalSyncedP2P++;
              WifiDirectService._emit('onSyncStatus', { status: 'SUCCESS' });
              setTimeout(() => WifiDirectService.disconnect(), 3000);
          } else {
              this._log(`❌ Échec du traitement du Pack.`);
              WifiDirectService._emit('onSyncStatus', { status: 'ERROR', message: 'Erreur décompression' });
          }
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
    return await database.get('loba_posts')
      .query(Q.where('is_propagating', true), Q.where('local_media_path', Q.notEq(null)))
      .fetch();
  }

  async _markAsPropagated(post) {
    await database.write(async () => {
      await post.update(p => { p.isPropagating = false; });
    });
    this.stats.totalSyncedP2P++;
  }

  /**
   * Propage un post individuel vers les peers via BLE Mesh (petits payloads < 5MB).
   * Pour les gros fichiers, utiliser le flux WiFi Direct via _p2pSyncCycle.
   */
  async _propagateToPeers(post, rail) {
    try {
      if (!post || !post.localMediaPath) {
        await this._markAsPropagated(post);
        return;
      }

      if (rail === RAIL_TYPES.BLE_MESH) {
        // BLE Mesh: uniquement les petits payloads (métadonnées, pas les fichiers lourds)
        const payload = {
          hash: post.hash,
          type: post.videoUrl ? 'video' : 'image',
          category: post.category || 'general',
          username: post.username || 'Anonymous',
          content: post.content || '',
          timestamp: post.downloadedAt || Date.now(),
        };
        const result = await MeshSyncService.broadcast('LOBA_POST_META', payload);
        if (result?.success) {
          this._log(`📡 Métadonnées propagées via BLE: ${post.hash?.substring(0, 8)}`);
          await this._markAsPropagated(post);
        }
      } else {
        // Autres rails: marquer comme propagé sans envoi (sera géré au prochain cycle WiFi Direct)
        this._log(`ℹ️ Rail ${rail} non supporté pour propagation directe. Attente WiFi Direct.`);
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
          post.imageUrl = type === 'image' ? result.path : null;
          post.videoUrl = type === 'video' ? result.path : null;
          post.filterColor = filter || null;
          post.likes = 0;
          post.comments = 0;
          post.isLiked = false;
          post.size = result.size || 0;
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
      blePeers: MeshSyncService.discoveredPeers?.size || 0,
      wifiDirectPeer: WifiDirectService.connectedPeer ? 1 : 0,
    };
  }
}

export const P2PAutoSync = new P2PAutoSyncClass();
