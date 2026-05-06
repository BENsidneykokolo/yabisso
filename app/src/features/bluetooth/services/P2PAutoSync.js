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

const P2P_SYNC_INTERVAL_MS = 2000; // 2 secondes pour une réactivité maximale ("Passing by")
const CLOUD_SYNC_INTERVAL_MS = 60000; 

/**
 * P2PAutoSync — L'Orchestrateur Central (V3 - Ultra-Fast & Parallel)
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
    this._log('🚀 Orchestrateur démarré (ULTRA-FAST MODE).');

    NetworkRailDetector.start();
    NetworkRailDetector.onRailChange((rails) => {
      this.stats.activeRails = rails;
    });

    WifiDirectService.setGlobalFileHandler((path, meta) => this._handleReceivedFile(path, meta, 'WifiDirect'));

    NearbyMeshService.MeshLogEvents.subscribe((msg) => {
      this._log(`[MESH] ${msg}`);
    });

    // PARALLÉLISME PROGRESSIF: On laisse WiFi Direct s'initialiser d'abord (plus critique)
    // puis on lance le Mesh après 5 secondes pour éviter les collisions hardware.
    setTimeout(() => {
      if (this._running) {
        NearbyMeshService.startMesh().catch(e => {
          this._log(`[MESH] ❌ Crash initialisation: ${e.message}`);
        });
      }
    }, 5000);

    try {
      // WiFi Direct Discovery doit TOUJOURS tourner en tâche de fond
      const state = WifiDirectService.getState();
      if (state.isAvailable) {
        await WifiDirectService.initialize();
        await WifiDirectService.startDiscovery(true);
      }
      
      this._log('🚀 Orchestrateur démarré (ULTRA-FAST MODE).');
      
      // FIX V1.0.11: Nettoyage impératif pour éviter les fuites de listeners au Reload
      WifiDirectService.removeAllListeners('onPeerFound');
      WifiDirectService.removeAllListeners('onConnectionChange');

      // 1. Ecouteur de peers WiFi Direct
      WifiDirectService.on('onPeerFound', async (peer) => {
        if (WifiDirectService.connectedPeer || WifiDirectService.isConnecting || !this._running) {
          return;
        }

        const myName = (WifiDirectService.deviceName || 'Yabisso_Unknown').toLowerCase();
        const peerName = (peer.deviceName || 'Unknown').toLowerCase();

        // V1.0.16: Extraire le score numérique pour comparaison propre
        const myScore = parseInt(myName.split('_')[0] || '0', 10);
        const peerScore = parseInt(peerName.split('_')[0] || '0', 10);

        // Master = score le plus élevé
        if (myScore > peerScore) {
          this._log(`🤝 [Master] Invitation vers ${peerName} dans 1.5s...`);
          setTimeout(async () => {
            if (!WifiDirectService.connectedPeer && !WifiDirectService.isConnecting && this._running) {
              try {
                await WifiDirectService.connectToPeer(peer);
              } catch (e) {
                this._log(`⚠️ Échec Master-Connect: ${e.message}`);
              }
            }
          }, 1500);
        } else {
          this._log(`⏳ [Slave] Master ${peerName} détecté. En attente d'invitation...`);
        }
      });

      WifiDirectService.on('onConnectionChange', async ({ connected, info }) => {
        if (connected && this._running) {
          this._log('📶 WiFi Direct CONNECTÉ ! Handshake final (1s)...');
          this._sessionSent = false;
          
          setTimeout(() => {
            if (WifiDirectService.connectedPeer && this._running) {
              if (!WifiDirectService.isGroupOwner) {
                this._log('🚀 Envoi immédiat du Pack Loba...');
                this._p2pSyncCycle();
              } else {
                this._log('📡 Mode Réception — Prêt à recevoir des Packs.');
              }
            }
          }, 1000);

        } else {
          WifiDirectService.stopReceiving();
        }
      });

    } catch (e) {
      console.warn('[P2PAutoSync] WiFi Direct init error:', e.message);
    }

    if (this._p2pInterval) clearInterval(this._p2pInterval);
    this._p2pInterval = setInterval(() => this._p2pSyncCycle(), P2P_SYNC_INTERVAL_MS);
    this._p2pSyncCycle();
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
    this._manualTrigger = true;
    this._lastManualSync = Date.now();
    this._log(`⚡ Synchronisation ${category ? category : 'manuelle'} déclenchée...`);
    await this._p2pSyncCycle(category);
    setTimeout(() => {
      this._manualTrigger = false;
    }, 30000);
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
        // NearbyMeshService gère son propre heartbeat, pas de broadcast manuel ici pour l'instant
        this._log('ℹ️ Ping Mesh automatique via Nearby Mesh.');
        return true;
      }
    } catch (e) {
      this._log(`❌ Échec Ping: ${e.message}`);
    }
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
    } catch (e) {
      console.warn('[P2PAutoSync] Erreur arrêt:', e.message);
    }
    
    this._log('🛑 Orchestrateur arrêté.');
  }

  async _p2pSyncCycle(category = null) {
    if (!this._running || this._syncingP2P) return;
    this._syncingP2P = true;

    try {
      // 1. GESTION LIEN WIFI DIRECT (Toujours s'assurer qu'on scanne ou qu'on est connecté)
      const state = WifiDirectService.getState();
      if (state.isAvailable) {
        if (!state.initialized) {
          await WifiDirectService.initialize();
        }
        
        if (!WifiDirectService.connectedPeer && !WifiDirectService.isConnecting) {
          if (!state.isDiscovering) {
             await WifiDirectService.startDiscovery(true);
          }
          
          const availablePeers = WifiDirectService.availablePeers || [];
          if (availablePeers.length > 0) {
            const peer = availablePeers[0];
            const myName = (WifiDirectService.deviceName || 'Yabisso_Unknown').toLowerCase();
            const peerName = (peer.deviceName || 'Unknown').toLowerCase();

            // V1.0.16: Extraire le score numérique pour comparaison propre
            const myScore = parseInt(myName.split('_')[0] || '0', 10);
            const peerScore = parseInt(peerName.split('_')[0] || '0', 10);

            if (myScore > peerScore) {
               this._log(`🔄 Cycle Master: Relance invitation vers ${peerName}...`);
               await WifiDirectService.connectToPeer(peer);
            }
          }
        }
      }

      // 2. LOGIQUE DE TRANSFERT
      const bestP2P = NetworkRailDetector.getBestRail(true);
      if (bestP2P === RAIL_TYPES.OFFLINE || bestP2P === RAIL_TYPES.INTERNET) {
        this._syncingP2P = false;
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
            // Éviter le cycling infini après un trigger manuel: si _manualTrigger=true, on skip le cycle auto pendant 30s
            if (this._manualTrigger && this._sessionSent) {
              this._log('⏳ Cycle ignoré (trigger manuel récent)');
              return;
            }
            if (this._sessionSent && !category) {
               return;
            }
           this._log(`📦 Création du Pack ${category || 'Général'} en cours (Max 50MB)...`);
           WifiDirectService._emit('onSyncStatus', { status: 'PACKING' });
           
           const packPath = await LobaPackService.buildPack(category);
            if (packPath) {
                this._log(`📤 Envoi du Pack ${category || 'Général'} via WiFi Direct...`);
                WifiDirectService._emit('onSyncStatus', { status: 'SENDING' });
                
                let sent = await WifiDirectService.sendFile(packPath, {
                   hash: `pack_${Date.now()}`,
                   type: 'LOBA_PACK',
                   category: category || 'bundle'
                });

                // RETRY LOGIQUE: Si échec (souvent dû à un socket non prêt), on attend 5s et on réessaie une fois.
                if (!sent) {
                   this._log('⚠️ Premier essai échoué. Tentative de secours dans 5s...');
                   await new Promise(r => setTimeout(r, 5000));
                   sent = await WifiDirectService.sendFile(packPath, {
                      hash: `pack_retry_${Date.now()}`,
                      type: 'LOBA_PACK',
                      category: category || 'bundle'
                   });
                }

                if (sent) {
                   this._sessionSent = true;
                   this._log(`✅ Succès: Pack ${category || 'Général'} envoyé !`);
                   WifiDirectService._emit('onSyncStatus', { status: 'SUCCESS' });
                } else {
                   this._log('❌ Échec critique de l\'envoi du Loba Pack après retry.');
                   WifiDirectService._emit('onSyncStatus', { status: 'ERROR', message: 'Échec envoi définitif' });
                   
                   // Si échec définitif, on force une déconnexion pour réinitialiser le hardware
                   setTimeout(() => WifiDirectService.disconnect(), 2000);
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
        // NearbyMeshService propage déjà les métadonnées lors du handshake automatique
        this._log(`📡 Propagation via Mesh (Nearby) planifiée: ${post.hash?.substring(0, 8)}`);
        await this._markAsPropagated(post);
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
      blePeers: NearbyMeshService.connectedPeers?.size || 0,
      wifiDirectPeer: WifiDirectService.connectedPeer ? 1 : 0,
    };
  }

  async _getUnsyncedPosts() {
    try {
      const posts = await database.get('loba_posts')
        .query(
          Q.where('localMediaPath', Q.notEq(null)),
          Q.sortBy('created_at', Q.desc),
          Q.take(20)
        )
        .fetch();
      return posts.filter(p => p.localMediaPath);
    } catch (e) {
      this._log(`⚠️ Erreur getUnsyncedPosts: ${e.message}`);
      return [];
    }
  }
}

export const P2PAutoSync = new P2PAutoSyncClass();
