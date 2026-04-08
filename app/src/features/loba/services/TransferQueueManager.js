// app/src/features/loba/services/TransferQueueManager.js
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

/**
 * TransferQueueManager
 * Gère l'ordre des téléchargements P2P pour LOBA.
 * Priorité : Taille croissante (Thumbnails -> Images -> Vidéos).
 */
export const TransferQueueManager = {

  /**
   * Récupère la liste des médias en attente de téléchargement.
   * @returns {Promise<LobaPost[]>}
   */
  async getPendingDownloads() {
    try {
      return await database.get('loba_posts')
        .query(
          Q.where('local_media_path', null),
          Q.where('hash', Q.notEq(null)),
          Q.sortBy('size', Q.asc) // Règle d'or : Taille croissante ↑
        )
        .fetch();
    } catch (e) {
      console.error('[TransferQueueManager] Erreur lecture queue:', e);
      return [];
    }
  },

  /**
   * Filtre les items compatibles avec le rail actif.
   * @param {string} rail - 'ble_mesh' | 'wifi_direct' | 'internet'
   * @param {number} maxSizeMB - Taille max en MB (5 pour BLE, Infinity pour WiFi/Internet)
   */
  async getPendingForRail(rail, maxSizeMB = Infinity) {
    try {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const all = await this.getPendingDownloads();

      if (maxSizeMB === Infinity) return all;

      return all.filter(post => (post.size || 0) <= maxSizeBytes);
    } catch (e) {
      console.error('[TransferQueueManager] getPendingForRail error:', e);
      return [];
    }
  },

  /**
   * Récupère le prochain item à télécharger.
   */
  async getNext() {
    const pending = await this.getPendingDownloads();
    return pending.length > 0 ? pending[0] : null;
  },

  /**
   * Marqué un hash comme téléchargé avec succès.
   * @param {string} hash 
   * @param {string} localPath 
   */
  async markComplete(hash, localPath) {
    try {
      await database.write(async () => {
        const posts = await database.get('loba_posts')
          .query(Q.where('hash', hash))
          .fetch();
        
        if (posts.length > 0) {
          const post = posts[0];
          await post.update(p => {
            p.localMediaPath = localPath;
            p.downloadedAt = Date.now();
            p.isPropagating = false;
          });
        }
      });
    } catch (e) {
      console.error('[TransferQueueManager] Erreur markComplete:', e);
    }
  },

  /**
   * Marque un transfert comme échoué avec retry.
   * @param {string} hash
   * @param {string} error
   */
  async markFailed(hash, error) {
    try {
      // Enregistrer l'échec dans p2p_transfers
      const transfers = await database.get('p2p_transfers')
        .query(Q.where('hash', hash), Q.where('status', Q.oneOf(['pending', 'in_progress'])))
        .fetch();

      if (transfers.length > 0) {
        await database.write(async () => {
          const transfer = transfers[0];
          const retryCount = (transfer.retryCount || 0) + 1;
          
          await transfer.update(t => {
            t.status = retryCount >= 3 ? 'failed' : 'pending'; // Max 3 retries
            t.error = error;
            t.retryCount = retryCount;
          });
        });
      }
    } catch (e) {
      console.error('[TransferQueueManager] Erreur markFailed:', e);
    }
  },

  /**
   * Fournit des statistiques pour l'UI.
   */
  async getStats() {
    try {
      const all = await database.get('loba_posts')
        .query(Q.where('hash', Q.notEq(null)))
        .fetch();
      const downloaded = all.filter(p => p.localMediaPath !== null).length;
      const total = all.length;

      return {
        total,
        downloaded,
        remaining: total - downloaded,
        percent: total > 0 ? (downloaded / total) * 100 : 100,
        pendingBLE: all.filter(p => !p.localMediaPath && (p.size || 0) <= 5 * 1024 * 1024).length,
        pendingWiFi: all.filter(p => !p.localMediaPath && (p.size || 0) > 5 * 1024 * 1024).length,
      };
    } catch (e) {
      console.error('[TransferQueueManager] getStats error:', e);
      return { total: 0, downloaded: 0, remaining: 0, percent: 100, pendingBLE: 0, pendingWiFi: 0 };
    }
  }
};
