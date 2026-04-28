// app/src/features/loba/services/LocalStorageManager.js
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

const LOBA_CACHE_DIR = `${FileSystem.documentDirectory}loba_media/`;
const LOBA_THUMBS_DIR = `${FileSystem.documentDirectory}loba_thumbs/`;
const MAX_CACHE_SIZE_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB
const MAX_SINGLE_FILE_BYTES = 100 * 1024 * 1024; // 100 MB max per file
const LRU_RETENTION_DAYS = 7;

/**
 * LocalStorageManager
 * Gère l'écriture disque, les thumbnails, le hashing, et le nettoyage LRU.
 * RÈGLE D'OR : le player lit TOUJOURS depuis le stockage local, jamais en streaming.
 */
export const LocalStorageManager = {

  /**
   * Crée les dossiers de cache s'ils n'existent pas.
   */
  async ensureDirs() {
    const mediaDirInfo = await FileSystem.getInfoAsync(LOBA_CACHE_DIR);
    if (!mediaDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOBA_CACHE_DIR, { intermediates: true });
    }
    const thumbsDirInfo = await FileSystem.getInfoAsync(LOBA_THUMBS_DIR);
    if (!thumbsDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOBA_THUMBS_DIR, { intermediates: true });
    }
  },

  /**
   * Calcule le hash d'un fichier pour la déduplication.
   * OOM-Free : au lieu de lire tout le fichier en mémoire (Base64), on utilise le MD5 côté natif.
   * @param {string} uri - Chemin du fichier (file://)
   * @returns {string} Hash string
   */
  async hashFile(uri) {
    try {
      const info = await FileSystem.getInfoAsync(uri, { md5: true });
      if (info.exists && info.md5) {
        return info.md5; // Renvoie l'empreinte native sans JS Memory Impact
      }

      // Si le MD5 échoue, pseudo-hash avec taille au lieu d'un crash OOM
      const fallbackInput = `${uri}_${info.size || 0}`;
      return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        fallbackInput
      );
    } catch (e) {
      console.warn('[LocalStorageManager] Erreur calcul hash natif, fallback UUID:', e.message);
      return `${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    }
  },

  /**
   * Enregistre un média sur le disque permanent.
   * @param {string} tempUri - Chemin temporaire du fichier
   * @param {string} hash - Hash SHA-256 du fichier
   * @param {string} ext - Extension (mp4, jpg, etc.)
   * @returns {string|null} Chemin final ou null en cas d'erreur
   */
  async saveMedia(tempUri, hash, ext = 'mp4') {
    try {
      await this.ensureDirs();

      // Vérification de taille
      const fileInfo = await FileSystem.getInfoAsync(tempUri);
      if (fileInfo.exists && fileInfo.size > MAX_SINGLE_FILE_BYTES) {
        console.warn(`[LocalStorageManager] Fichier trop volumineux: ${(fileInfo.size / 1024 / 1024).toFixed(1)} MB (max ${MAX_SINGLE_FILE_BYTES / 1024 / 1024} MB)`);
        return null;
      }

      // Déduplication: vérifier si le fichier existe déjà
      const dest = `${LOBA_CACHE_DIR}${hash}.${ext}`;
      const existingInfo = await FileSystem.getInfoAsync(dest);
      if (existingInfo.exists) {
        console.log(`[LocalStorageManager] Fichier déjà en cache: ${hash}`);
        return dest;
      }

      await FileSystem.moveAsync({
        from: tempUri,
        to: dest
      });

      console.log(`[LocalStorageManager] Média sauvegardé: ${hash}.${ext} (${(fileInfo.size / 1024).toFixed(1)} KB)`);
      return { path: dest, size: fileInfo.size };
    } catch (e) {
      console.error('[LocalStorageManager] Erreur sauvegarde:', e);
      return null;
    }
  },

  /**
   * Sauvegarde un thumbnail pour un post.
   * @param {string} sourceUri - URI du thumbnail  
   * @param {string} hash - Hash du post associé
   * @returns {string|null} Chemin du thumbnail
   */
  async saveThumbnail(sourceUri, hash) {
    try {
      await this.ensureDirs();
      const dest = `${LOBA_THUMBS_DIR}${hash}_thumb.jpg`;
      
      const existingInfo = await FileSystem.getInfoAsync(dest);
      if (existingInfo.exists) return dest;

      await FileSystem.copyAsync({
        from: sourceUri,
        to: dest
      });
      return dest;
    } catch (e) {
      console.error('[LocalStorageManager] Erreur sauvegarde thumbnail:', e);
      return null;
    }
  },

  /**
   * Vérifie le statut d'un média sur le disque.
   * @param {string} hash - Hash du fichier
   * @returns {'available' | 'downloading' | 'missing'}
   */
  async getMediaStatus(hash) {
    if (!hash) return 'missing';

    try {
      // 1. Vérifier la base de données
      const posts = await database.get('loba_posts')
        .query(Q.where('hash', hash))
        .fetch();

      if (posts.length === 0) return 'missing';
      const post = posts[0];

      // 2. Chemin local présent et fichier existe physiquement?
      if (post.localMediaPath) {
        const fileInfo = await FileSystem.getInfoAsync(post.localMediaPath);
        if (fileInfo.exists) return 'available';
        
        // Le chemin existe en DB mais le fichier a été supprimé → reset
        await database.write(async () => {
          await post.update(p => {
            p.localMediaPath = null;
          });
        });
      }

      // 3. Vérifier s'il y a un transfert en cours
      const transfers = await database.get('p2p_transfers')
        .query(
          Q.where('hash', hash),
          Q.where('status', Q.oneOf(['pending', 'in_progress']))
        )
        .fetch();

      if (transfers.length > 0) return 'downloading';

      return 'missing';
    } catch (e) {
      console.error('[LocalStorageManager] getMediaStatus error:', e);
      return 'missing';
    }
  },

  /**
   * Retourne les statistiques de stockage.
   */
  async getStorageUsage() {
    try {
      const allDownloaded = await database.get('loba_posts')
        .query(Q.where('local_media_path', Q.notEq(null)))
        .fetch();

      let totalSize = 0;
      for (const post of allDownloaded) {
        totalSize += post.size || 0;
      }

      return {
        totalFiles: allDownloaded.length,
        totalSizeBytes: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(1),
        maxSizeMB: (MAX_CACHE_SIZE_BYTES / (1024 * 1024)).toFixed(0),
        percentUsed: MAX_CACHE_SIZE_BYTES > 0 ? ((totalSize / MAX_CACHE_SIZE_BYTES) * 100).toFixed(1) : 0,
      };
    } catch (e) {
      console.error('[LocalStorageManager] getStorageUsage error:', e);
      return { totalFiles: 0, totalSizeBytes: 0, totalSizeMB: '0', maxSizeMB: '10240', percentUsed: 0 };
    }
  },

  /**
   * Applique la politique LRU (Nettoyage automatique).
   * Supprime les fichiers les plus anciens si la limite est atteinte.
   * NE SUPPRIME JAMAIS les favoris (is_liked) ni les fichiers récents (< 7 jours).
   */
  async applyLRUPolicy() {
    try {
      const retentionCutoff = Date.now() - (LRU_RETENTION_DAYS * 24 * 60 * 60 * 1000);

      // Récupérer tous les posts téléchargés, triés par date de download (plus anciens en premier)
      const allDownloaded = await database.get('loba_posts')
        .query(
          Q.where('local_media_path', Q.notEq(null)),
          Q.sortBy('downloaded_at', Q.asc)
        )
        .fetch();

      let currentSize = 0;
      const filesToRemove = [];

      // Calculer la taille totale
      for (const post of allDownloaded) {
        currentSize += post.size || 0;
      }

      // Si on est sous la limite, pas de nettoyage
      if (currentSize <= MAX_CACHE_SIZE_BYTES) {
        console.log(`[LocalStorageManager] LRU: ${(currentSize / 1024 / 1024).toFixed(1)} MB / ${MAX_CACHE_SIZE_BYTES / 1024 / 1024} MB — pas de nettoyage requis.`);
        return;
      }

      // Sélectionner les fichiers à supprimer (plus anciens en premier)
      for (const post of allDownloaded) {
        if (currentSize <= MAX_CACHE_SIZE_BYTES) break;

        // PROTECTION : ne jamais supprimer les favoris
        if (post.isLiked) continue;

        // PROTECTION : ne jamais supprimer les fichiers récents
        if (post.downloadedAt && post.downloadedAt > retentionCutoff) continue;

        filesToRemove.push(post);
        currentSize -= (post.size || 0);
      }

      // Suppression physique et logique
      for (const post of filesToRemove) {
        if (post.localMediaPath) {
          const fileInfo = await FileSystem.getInfoAsync(post.localMediaPath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(post.localMediaPath);
          }
        }
        // Supprimer aussi le thumbnail
        if (post.thumbnailPath) {
          const thumbInfo = await FileSystem.getInfoAsync(post.thumbnailPath);
          if (thumbInfo.exists) {
            await FileSystem.deleteAsync(post.thumbnailPath);
          }
        }

        await database.write(async () => {
          await post.update(p => {
            p.localMediaPath = null;
            p.thumbnailPath = null;
          });
        });
      }

      console.log(`[LocalStorageManager] LRU: ${filesToRemove.length} fichiers supprimés. Nouveau total: ${(currentSize / 1024 / 1024).toFixed(1)} MB`);
    } catch (e) {
      console.error('[LocalStorageManager] Erreur LRU:', e);
    }
  },

  /**
   * Vérifie si un hash est déjà présent localement.
   */
  async hasHash(hash) {
    try {
      const posts = await database.get('loba_posts')
        .query(Q.where('hash', hash))
        .fetch();
      return posts.length > 0;
    } catch (e) {
      return false;
    }
  },

  /**
   * Retourne le chemin du dossier média.
   */
  getCacheDir() {
    return LOBA_CACHE_DIR;
  },

  getThumbsDir() {
    return LOBA_THUMBS_DIR;
  },
};
