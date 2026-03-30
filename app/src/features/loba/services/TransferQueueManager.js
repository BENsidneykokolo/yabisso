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
          });
        }
      });
    } catch (e) {
      console.error('[TransferQueueManager] Erreur markComplete:', e);
    }
  },

  /**
   * Fournit des statistiques pour l'UI (Progression globale).
   */
  async getStats() {
    const all = await database.get('loba_posts').query(Q.where('hash', Q.notEq(null))).fetch();
    const downloaded = all.filter(p => p.localMediaPath !== null).length;
    const total = all.length;

    return {
      total,
      downloaded,
      remaining: total - downloaded,
      percent: total > 0 ? (downloaded / total) * 100 : 100
    };
  }
};
