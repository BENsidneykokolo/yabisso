// app/src/features/bluetooth/services/P2PAutoSync.js
import { NetworkRailDetector, RAIL_TYPES } from './NetworkRailDetector';
import { MeshSyncService } from './MeshSyncService';
import { WifiDirectService } from './WifiDirectService';
import { ManifestService } from '../../loba/services/ManifestService';
import { RecommendationEngine } from '../../loba/services/RecommendationEngine';
import { TransferQueueManager } from '../../loba/services/TransferQueueManager';
import { LocalStorageManager } from '../../loba/services/LocalStorageManager';
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
      lastSyncAt: null,
      activeRails: [],
    };
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
      await WifiDirectService.initialize();
      WifiDirectService.startDiscovery();
      
      // Auto-connect aux pairs WiFi Direct détectés pour échange de manifestes
      WifiDirectService.on('onPeerFound', async (peer) => {
        if (!WifiDirectService.connectedPeer && this._running) {
          console.log(`[P2PAutoSync] Pair WiFi trouvé: ${peer.deviceName}. Tentative de connexion...`);
          await WifiDirectService.connectToPeer(peer);
        }
      });

      WifiDirectService.on('onConnectionChange', async ({ connected }) => {
        if (connected) {
          console.log('[P2PAutoSync] WiFi Direct Connecté. Échange de manifestes imminent...');
          // On pourrait déclencher un échange de manifestes spécifique ici si WifiDirectService le supportait
        }
      });

      WifiDirectService.startReceiving(async (filePath, metadata) => {
        await this._handleReceivedFile(filePath, metadata, 'WIFI_DIRECT');
      });
    } catch (e) {
      console.warn('[P2PAutoSync] WiFi Direct init error:', e.message);
    }

    // 3. Lancer les cycles de sync
    this._p2pInterval = setInterval(() => this._p2pSyncCycle(), P2P_SYNC_INTERVAL_MS);
    this._cloudInterval = setInterval(() => this._cloudFallbackCycle(), CLOUD_SYNC_INTERVAL_MS);

    // Sync immédiat
    this._p2pSyncCycle();

    console.log('[P2PAutoSync] Orchestrateur prêt (Mode Cloud Saver Actif).');
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
      
      if (bestP2P === RAIL_TYPES.OFFLINE || bestP2P === RAIL_TYPES.INTERNET) {
        // Pas de peer P2P dispo actuellement
        return;
      }

      console.log(`[P2PAutoSync] Cycle P2P via ${bestP2P}...`);

      // 1. Propager nos nouveaux posts aux voisins
      const pendingUploads = await this._getPendingUploads();
      for (const post of pendingUploads) {
        await this._propagateToPeers(post, bestP2P);
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
      const sent = await WifiDirectService.sendFile(post.localMediaPath, {
        hash: post.hash,
        type: post.videoUrl ? 'video' : 'image',
        category: post.category,
        username: post.username,
        avatar: post.avatar,
        content: post.content,
      });
      if (sent) await this._markAsPropagated(post);
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
      console.log(`[P2PAutoSync] ✅ Contenu reçu via ${source}: ${hash}`);
    } catch (e) {
      console.error('[P2PAutoSync] handleReceivedFile error:', e);
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
