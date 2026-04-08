// app/src/features/loba/services/ManifestService.js
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

/**
 * ManifestService
 * Gère l'inventaire local des médias pour la synchronisation P2P.
 */
export const ManifestService = {
  
  /**
   * Génère le manifeste local pour LOBA.
   * On limite aux 500 derniers items pour optimiser la transmission Mesh.
   */
  async generateManifest() {
    try {
      const posts = await database.get('loba_posts')
        .query(
          Q.where('hash', Q.notEq(null)),
          Q.sortBy('created_at', Q.desc),
          Q.take(500)
        )
        .fetch();

      const interests = await database.get('user_interests')
        .query(Q.where('service', 'loba'))
        .fetch();

      const interestMap = {};
      interests.forEach(i => {
        interestMap[i.category] = i.weight;
      });

      return {
        user_id: 'local_user', // À remplacer par l'ID réel
        timestamp: Date.now(),
        media: posts.map(p => ({
          hash: p.hash,
          size: p.size,
          category: p.category,
          type: p.videoUrl ? 'video' : 'image',
          username: p.username,
          avatar: p.avatar,
          content: p.content
        })),
        interests: interestMap
      };
    } catch (e) {
      console.error('[ManifestService] Erreur génération:', e);
      return null;
    }
  },

  /**
   * Calcule les hashes manquants en comparant avec un manifeste distant.
   * @param {Object} remoteManifest 
   * @returns {Array} Liste des objets média à télécharger
   */
  async calculateDelta(remoteManifest) {
    if (!remoteManifest || !remoteManifest.media) return [];

    try {
      const remoteMedia = remoteManifest.media;
      const remoteHashes = remoteMedia.map(m => m.hash);

      // 1. Cherche quels hashes distants on possède déjà localement
      const localMatches = await database.get('loba_posts')
        .query(Q.where('hash', Q.oneOf(remoteHashes)))
        .fetch();

      const localHashes = new Set(localMatches.map(m => m.hash));

      // 2. Filtre pour ne garder que le Delta (ce qu'on n'a pas)
      const delta = remoteMedia.filter(m => !localHashes.has(m.hash));

      return delta;
    } catch (e) {
      console.error('[ManifestService] Erreur calcul Delta:', e);
      return [];
    }
  }
};
