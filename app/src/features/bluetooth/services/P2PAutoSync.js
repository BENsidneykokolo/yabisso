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
 * 
 * Stratégie de coût :
 * 1. Découverte continue (WiFi Direct / BLE Mesh) même si ONLINE.
 * 2. Échange de manifestes dès qu'un peer est trouvé.
 * 3. Transfert en background via P2P (Priorité aux coûts minimes).
 * 4. Cloud Fallback : Sync avec Supabase uniquement si aucun peer n'a le contenu.
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
    // Émettre un signal via le service WiFi pour rafraîchir l'UI des logs
    WifiDirectService._emit('onLogUpdate', this.stats.logs);
  }

  /**
   * S'abonner aux logs de synchronisation.
   */
  onLogUpdate(callback) {
    return WifiDirectService.on('onLogUpdate', (logs) => callback(logs || this.stats.logs));
  }

  /**
   * Démarre l'orchestrateur.
   */
  async start() {
    if (this._running) return;
    this._running = true;

    console.log('[P2PAutoSync] Démarrage de l\'orchestrateur Multi-Rail...');

    // 1. Initialiser le détecteur de rail
    NetworkRailDetector.start();
    NetworkRailDetector.onRailChange((rails) => {
      this.stats.activeRails = rails;
      console.log(`[P2PAutoSync] Rails actifs: ${rails.join(', ')}`);
    });

    // 2. Initialiser les services P2P (Scan permanent)
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
          // Réessayer après un délai (l'itel peut avoir besoin de plus de temps)
          setTimeout(async () => {
            const ok = await WifiDirectService.initialize();
            if (ok) await WifiDirectService.startDiscovery();
          }, 5000);
        }
      }
      
      // Auto-connect aux pairs WiFi Direct détectés...
      WifiDirectService.on('onPeerFound', async (peer) => {
        // VERROU: ignorer si déjà connecté OU si une connexion est en cours
        if (WifiDirectService.connectedPeer || WifiDirectService.isConnecting || !this._running) {
          return;
        }
        this._log(`📡 Pair WiFi trouvé: ${peer.deviceName || peer.deviceAddress}. Tentative de connexion...`);
        const success = await WifiDirectService.connectToPeer(peer);
        if (success) {
          this._log(`📶 Connexion initiée vers ${peer.deviceName || peer.deviceAddress}. En attente...`);
        } else {
          this._log(`❌ Échec connexion à ${peer.deviceName || peer.deviceAddress}`);
        }
      });

      WifiDirectService.on('onConnectionChange', async ({ connected, info }) => {
        if (connected) {
          this._log('📶 Connexion P2P établie. Attente de la stabilisation IP (2s)...');
          // NOUVEAU: Délai indispensable pour laisser Android assigner les IPs
          // (192.168.49.1 n'est pas joignable instantanément)
          setTimeout(() => {
            if (WifiDirectService.connectedPeer) {
                this._log('🚀 Lancement du cycle de synchronisation P2P...');
                this._p2pSyncCycle();
                
                // Démarrer la réception UNIQUEMENT quand un peer est connecté
                WifiDirectService.startReceiving(async (filePath, metadata) => {
                  await this._handleReceivedFile(filePath, metadata, 'WIFI_DIRECT');
                });
            }
          }, 2000);
        } else {
          // Arrêter la réception quand la connexion est perdue
          WifiDirectService.stopReceiving();
        }
      });

      // NE PAS appeler startReceiving() ici — le MessageServer natif ne doit
      // démarrer QUE quand un peer est connecté (sinon OOM sur appareils à faible RAM)
    } catch (e) {
      console.warn('[P2PAutoSync] WiFi Direct init error:', e.message);
    }

    // 3. Lancer les cycles de sync
    this._p2pInterval = setInterval(() => this._p2pSyncCycle(), P2P_SYNC_INTERVAL_MS);
    // this._cloudInterval = setInterval(() => this._cloudFallbackCycle(), CLOUD_SYNC_INTERVAL_MS);

    // Sync immédiat
    this._p2pSyncCycle();

    this._log('🚀 Orchestrateur démarré (Mode Cloud Saver).');
  }

  /**
   * Redémarrage complet (Hard Reset) suite à une erreur ou demande manuelle.
   */
  async forceRefresh() {
    this._log('🔄 Hard Reset des services P2P...');
    this.stop();
    // Attendre un peu que le hardware se libère
    await new Promise(resolve => setTimeout(resolve, 1500));
    await this.start();
    // Forcer le scan immédiatement
    WifiDirectService.startDiscovery(true);
    // Forcer le popup si nécessaire
    this.requestWifiDirectActivation();
  }

  /**
   * Envoie un petit message de test pour vérifier la connectivité.
   */
  async sendTestPing() {
    this._log('📡 Envoi d\'un TEST PING...');
    const bestRail = NetworkRailDetector.getBestRail(true);
    
    if (bestRail === RAIL_TYPES.OFFLINE) {
      this._log('⚠️ Erreur: Aucun rail actif pour le Ping.');
      return false;
    }

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

  /**
   * Arrête l'orchestrateur.
   */
  stop() {
    this._running = false;
    if (this._p2pInterval) clearInterval(this._p2pInterval);
    if (this._cloudInterval) clearInterval(this._cloudInterval);
    NetworkRailDetector.stop();
    MeshSyncService.stopMeshScanning();
    WifiDirectService.stopDiscovery();
    console.log('[P2PAutoSync] Orchestrateur arrêté.');
  }

  /**
   * Cycle P2P : Échange manifestes et propagation locale.
   */
  async _p2pSyncCycle() {
    if (!this._running || this._syncingP2P) return;
    this._syncingP2P = true;

    try {
      const bestP2P = NetworkRailDetector.getBestRail(true); // Priorité WiFi > BLE
      
      // Si on n'a pas de peer connecté, on vérifie l'état de la découverte
      if (bestP2P === RAIL_TYPES.OFFLINE) {
        const state = WifiDirectService.getState();
        
        // Si pas encore initialisé (échec au démarrage), réessayer
        if (state.isAvailable && !state.initialized) {
          this._log('🔧 Itel/appareil non initialisé — tentative d\'init...');
          const ok = await WifiDirectService.initialize();
          if (ok) await WifiDirectService.startDiscovery();
        } else if (!state.isDiscovering) {
          this._log('💓 Pulsation: Scan inactif, relance automatique...');
          await WifiDirectService.startDiscovery(true);
          this._discoveryRetryCount = 0;
        } else {
          this._discoveryRetryCount = (this._discoveryRetryCount || 0) + 1;
          if (this._discoveryRetryCount >= 2) { // Toutes les 40s
            this._log('💓 Pulsation: Rafraîchissement du scan...');
            this._discoveryRetryCount = 0;
            await WifiDirectService.startDiscovery(true);
          }
        }
      } else {
        this._discoveryRetryCount = 0;
      }

      if (bestP2P === RAIL_TYPES.OFFLINE || bestP2P === RAIL_TYPES.INTERNET) {
        return;
      }

      this._log(`🔄 Cycle P2P via ${bestP2P}...`);

      // 1. Échange de Pack (Loba Packs) via WiFi Direct
      if (bestP2P === RAIL_TYPES.WIFI_DIRECT && WifiDirectService.connectedPeer) {
         // VÉRIFICATION CRÉTIQUE DU RÔLE:
         // Si ce device est le Group Owner, il ne peut PAS envoyer via sendMessage
         // (l'API WiFi P2P cible toujours 192.168.49.1:8988 = le GO lui-même).
         // Le GO doit RECEVOIR. Seul le CLIENT peut envoyer des packs.
         if (WifiDirectService.isGroupOwner) {
           // Le GO écoute en mode réception (déjà actif via startReceiving)
           if (!this._goLoggedOnce) {
             this._log('📡 Ce device est le Group Owner — mode réception actif. En attente de packs des clients...');
             this._goLoggedOnce = true;
           }
         } else {
           // Ce device est le CLIENT — il peut envoyer vers le GO
           this._goLoggedOnce = false;
           this._log('📦 Création du Loba Pack en cours (Max 50MB)...');
           const packPath = await LobaPackService.buildPack();
           if (packPath) {
               this._log('📤 Envoi du Loba Pack via WiFi Direct...');
               const sent = await WifiDirectService.sendFile(packPath, {
                  hash: `pack_${Date.now()}`,
                  type: 'LOBA_PACK',
                  category: 'bundle'
               });
               if (sent) {
                  this._log('✅ Succès: Loba Pack envoyé !');
                  this._log('🔄 Déconnexion automatique (Swap des rôles)...');
                  setTimeout(() => WifiDirectService.disconnect(), 3000);
               } else {
                  this._log('⚠️ Échec de l\'envoi du Loba Pack.');
               }
           } else {
               this._log('ℹ️ Rien de nouveau à envoyer dans le Pack.');
           }
         }
      } else {
          // Fallback BLE Mesh local (envois unitaires 5Mo max)
          const pendingUploads = await this._getPendingUploads();
          for (const post of pendingUploads) {
            await this._propagateToPeers(post, bestP2P);
          }
      }

      // 2. Nettoyage LRU
      await LocalStorageManager.applyLRUPolicy();
      
      this.stats.lastSyncAt = Date.now();
    } catch (e) {
      console.error('[P2PAutoSync] P2P Cycle Error:', e);
    } finally {
      this._syncingP2P = false;
    }
  }

  /**
   * Cycle Cloud Fallback : Sync avec Supabase pour ce qui manque.
   */
  async _cloudFallbackCycle() {
    if (!this._running || this._syncingCloud) return;
    
    // Seulement si on a Internet
    if (!NetworkRailDetector.activeRails.has(RAIL_TYPES.INTERNET)) return;

    this._syncingCloud = true;
    try {
      console.log('[P2PAutoSync] Cloud Fallback Cycle...');
      
      // 1. Chercher les contenus manquants (sans path local)
      const missingMedia = await database.get('loba_posts')
        .query(Q.where('local_media_path', null), Q.take(20))
        .fetch();

      if (missingMedia.length > 0) {
        console.log(`[P2PAutoSync] Tentative de récupération Cloud pour ${missingMedia.length} items.`);
        // Note: Ici on appellerait un SyncEngine.downloadFromCloud(item) 
        // Mais par souci d'économie, on attend quelques cycles pour voir si le P2P le trouve
      }

      // 2. Envoyer SyncQueue à Supabase
      // await SyncEngine.flushSyncQueue();

    } catch (e) {
      console.error('[P2PAutoSync] Cloud Cycle Error:', e);
    } finally {
      this._syncingCloud = false;
    }
  }

  /**
   * Propager un contenu aux peers disponibles.
   */
  async _propagateToPeers(post, rail) {
    if (!post.localMediaPath) return;
    const fileSize = post.size || 0;

    if (rail === RAIL_TYPES.WIFI_DIRECT && WifiDirectService.connectedPeer) {
      this._log(`📤 Tentative d'envoi: ${post.hash.substring(0,8)}...`);
      const sent = await WifiDirectService.sendFile(post.localMediaPath, {
        hash: post.hash,
        type: post.videoUrl ? 'video' : 'image',
        category: post.category,
        username: post.username,
        avatar: post.avatar,
        content: post.content,
      });
      if (sent) {
        this._log(`✅ Succès: ${post.hash.substring(0,8)} envoyé.`);
        await this._markAsPropagated(post);
      } else {
        this._log(`⚠️ Échec envoi: ${post.hash.substring(0,8)}`);
      }
    } else if (rail === RAIL_TYPES.BLE_MESH && fileSize <= 5 * 1024 * 1024) {
      const result = await MeshSyncService.broadcast('SOCIAL_POST', {
        postId: post.id,
        username: post.username,
        avatar: post.avatar,
        content: post.content,
        hash: post.hash,
        type: post.videoUrl ? 'video' : 'image',
        category: post.category,
      }, post.localMediaPath);
      if (result.success) await this._markAsPropagated(post);
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

  async _handleReceivedFile(filePath, metadata, source) {
    try {
      if (!metadata || !metadata.hash) {
        if (metadata?.action === 'PING') {
          this._log(`⭐ REÇU PING via ${source}! (Connecté OK)`);
          return;
        }
        return;
      }
      
      // TRAITEMENT DES LOBA PACKS
      if (metadata.type === 'LOBA_PACK') {
          this._log(`📥 Reçu Loba Pack via ${source}. Décompression & Traitement...`);
          const success = await LobaPackService.unpackAndProcess(filePath);
          if (success) {
              this._log(`✅ Pack traité avec succès !`);
              this.stats.totalSyncedP2P++;
              this._log('🔄 Déconnexion automatique (Swap des rôles)...');
              setTimeout(() => WifiDirectService.disconnect(), 3000);
          } else {
              this._log(`❌ Échec du traitement du Pack.`);
          }
          return; // On sort car c'est un pack, on ne continue pas avec la logique unitaire.
      }
      
      const hash = metadata.hash || await LocalStorageManager.hashFile(filePath);
      const ext = metadata.type === 'video' ? 'mp4' : 'jpg';
      const savedPath = await LocalStorageManager.saveMedia(filePath, hash, ext);
      
      if (!savedPath) return;

      const existing = await database.get('loba_posts').query(Q.where('hash', hash)).fetch();

      await database.write(async () => {
        if (existing.length > 0) {
          await existing[0].update(p => {
            p.localMediaPath = savedPath;
            p.downloadedAt = Date.now();
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
            post.size = metadata.size || 0;
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

  /**
   * Publication locale.
   */
  async publishLocal(params) {
    const { uri, type, caption, filter, username = '@Me', category = 'general' } = params;
    try {
      const hash = uri ? await LocalStorageManager.hashFile(uri) : null;
      let localPath = null;
      if (uri) {
        const ext = type === 'video' ? 'mp4' : 'jpg';
        localPath = await LocalStorageManager.saveMedia(uri, hash, ext);
      }

      let newPost;
      await database.write(async () => {
        newPost = await database.get('loba_posts').create(post => {
          post.username = username;
          post.avatar = null; // User profile avatar should be set here if available
          post.content = caption || '';
          post.hash = hash;
          post.localMediaPath = localPath;
          post.category = category;
          post.isPropagating = true;
          post.downloadedAt = Date.now();
          post.imageUrl = type === 'image' ? localPath : null;
          post.videoUrl = type === 'video' ? localPath : null;
          post.filterColor = filter || null;
          post.likes = 0;
          post.comments = 0;
          post.isLiked = false;
          post.size = 0; // Will be updated by saveMedia if needed
        });

        await database.get('sync_queue').create(item => {
          item.action = 'CREATE_LOBA_POST';
          item.payloadJson = JSON.stringify({ 
            postId: newPost.id, 
            hash,
            type,
            caption,
            username,
            category
          });
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

  /**
   * Demande à l'utilisateur d'activer le WiFi Direct (Popup demandé)
   */
  requestWifiDirectActivation() {
    if (!this._running || !WifiDirectService.getState().isSupported) return;
    
    const state = WifiDirectService.getState();
    // Ne pas déranger si on est déjà en cours ou déjà connecté
    if (state.isDiscovering || state.connectedPeer) return;

    require('react-native').Alert.alert(
      "🚀 Mode Partage Offline",
      "Voulez-vous activer le WiFi Direct pour partager vos contenus sans data avec les utilisateurs proches ?",
      [
        { text: "Plus tard", style: "cancel" },
        { 
          text: "Activer", 
          onPress: async () => {
            const ok = await WifiDirectService.initialize();
            if (ok) WifiDirectService.startDiscovery(true);
          } 
        }
      ]
    );
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
