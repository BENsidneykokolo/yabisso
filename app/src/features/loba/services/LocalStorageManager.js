// app/src/features/loba/services/LocalStorageManager.js
import * as FileSystem from 'expo-file-system/legacy';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

const LOBA_CACHE_DIR = `${FileSystem.documentDirectory}loba_media/`;
const MAX_CACHE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

/**
 * LocalStorageManager
 * Gère l'écriture disque et la politique de nettoyage LRU.
 */
export const LocalStorageManager = {

  /**
   * Créer le dossier s'il n'existe pas.
   */
  async ensureDir() {
    const dirInfo = await FileSystem.getInfoAsync(LOBA_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOBA_CACHE_DIR, { intermediates: true });
    }
  },

  /**
   * Enregistre un média sur le disque permanent.
   */
  async saveMedia(tempUri, hash, ext = 'mp4') {
    try {
      await this.ensureDir();
      const dest = `${LOBA_CACHE_DIR}${hash}.${ext}`;
      
      await FileSystem.moveAsync({
        from: tempUri,
        to: dest
      });

      return dest;
    } catch (e) {
      console.error('[LocalStorageManager] Erreur sauvegarde:', e);
      return null;
    }
  },

  /**
   * Applique la politique LRU (Nettoyage auto).
   * Supprime les fichiers les plus anciens si la limite est atteinte.
   */
  async applyLRUPolicy() {
    try {
      const allDownloaded = await database.get('loba_posts')
        .query(
          Q.where('local_media_path', Q.notEq(null)),
          Q.sortBy('downloaded_at', Q.asc) // Plus anciens en premier
        )
        .fetch();

      let currentSize = 0;
      const filesToRemove = [];

      // 1. Calculer la taille totale actuelle
      for (const post of allDownloaded) {
        currentSize += post.size || 0;
        if (currentSize > MAX_CACHE_SIZE_BYTES) {
          filesToRemove.push(post);
        }
      }

      // 2. Suppression physique et logique
      for (const post of filesToRemove) {
        if (post.localMediaPath) {
          const fileInfo = await FileSystem.getInfoAsync(post.localMediaPath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(post.localMediaPath);
          }
          
          // Mise à jour en base (on garde le post mais on vide le chemin media)
          await database.write(async () => {
            await post.update(p => {
              p.localMediaPath = null;
            });
          });
        }
      }

      console.log(`[LocalStorageManager] LRU: ${filesToRemove.length} fichiers supprimés.`);
    } catch (e) {
      console.error('[LocalStorageManager] Erreur LRU:', e);
    }
  }
};
