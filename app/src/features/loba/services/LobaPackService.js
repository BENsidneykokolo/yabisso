import * as FileSystem from 'expo-file-system/legacy';
import { zip, unzip } from 'react-native-zip-archive';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import { InterestEngine } from './InterestEngine';
import { WifiDirectService } from '../../bluetooth/services/WifiDirectService';

// Vérification que unzip est disponible
if (!unzip) {
  console.error('[LobaPackService] ERREUR CRITIQUE: react-native-zip-archive n\'est pas lié !');
  console.error('[LobaPackService] Veuillez rebuild l\'APK avec: npx expo run:android');
}

const MAX_PACK_SIZE = 50 * 1024 * 1024; // 50 MB
const PACKS_DIR = `${FileSystem.documentDirectory}loba_packs/`;
const TEMP_UNPACK_DIR = `${FileSystem.documentDirectory}loba_packs_temp/`;

/**
 * Phase 15 Utility: Normalise les chemins pour les bridges natifs Android
 */
const normalizePath = (path) => {
  if (!path) return path;
  if (!path.startsWith('file://')) return `file://${path}`;
  return path;
};

export class LobaPackService {
  /**
   * Initialise les dossiers requis.
   */
  static async initDirectories() {
    const packsDirInfo = await FileSystem.getInfoAsync(PACKS_DIR);
    if (!packsDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(PACKS_DIR, { intermediates: true });
    }
    const tempDirInfo = await FileSystem.getInfoAsync(TEMP_UNPACK_DIR);
    if (!tempDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(TEMP_UNPACK_DIR, { intermediates: true });
    }
  }

  /**
   * Génère un nouveau pack de 50MB maximum avec les publications d'une catégorie spécifique.
   * @param {string|null} category - La catégorie à filtrer (ex: 'marche', 'hotel'). Si null, prend tout.
   * @returns {Promise<string|null>} Le chemin local du fichier ZIP, ou null si rien à envoyer.
   */
  static async buildPack(category = null) {
    await this.initDirectories();

    const timestamp = Date.now();
    const packName = `loba_pack_${timestamp}`;
    const stagingDir = `${PACKS_DIR}${packName}/`;
    
    await FileSystem.makeDirectoryAsync(stagingDir, { intermediates: true });

    try {
      const queryArgs = [
        Q.where('local_media_path', Q.notEq(null)),
        Q.sortBy('created_at', Q.desc),
        Q.take(100)
      ];
      
      if (category && category !== 'general') {
        queryArgs.push(Q.where('category', category));
      }

      const posts = await database.get('loba_posts').query(...queryArgs).fetch();

      let currentSize = 0;
      const manifestList = [];

      // 2. Sélectionner les fichiers jusqu'à 50MB
      for (const post of posts) {
        if (!post.localMediaPath) continue;

        const fileInfo = await FileSystem.getInfoAsync(post.localMediaPath);
        if (!fileInfo.exists) continue;

        const fileSize = fileInfo.size;
        
        // Si on dépasse la taille max du pack en ajoutant ce fichier, on s'arrête là (sauf s'il est tout seul et < 100MB)
        if (currentSize + fileSize > MAX_PACK_SIZE && manifestList.length > 0) {
          continue; // On essaie peut-être de trouver un fichier plus petit après, ou on s'arrête.
        }

        const fileName = post.localMediaPath.split('/').pop();
        const destinationFile = `${stagingDir}${fileName}`;

        // Phase 12: Granular UX - Informer l'utilisateur de la progression du packaging
        WifiDirectService._emit('onSyncStatus', { 
           status: 'PACKING', 
           message: `Préparation: ${manifestList.length + 1}/${posts.length} ...` 
        });

        // Copier le média dans le dossier de staging
        await FileSystem.copyAsync({
          from: post.localMediaPath,
          to: destinationFile
        });

        // Ajouter au manifeste
        manifestList.push({
          id: post.id,
          hash: post.hash,
          type: post.videoUrl ? 'video' : 'image',
          category: post.category,
          username: post.username,
          avatar: post.avatar,
          content: post.content,
          size: fileSize,
          filename: fileName,
          timestamp: post.createdAt,
          likes: post.likes,
          views: post.views || 0,
        });

        currentSize += fileSize;
        
        // On s'arrête si le pack approche les 50MB (marge de 2MB)
        if (currentSize >= (MAX_PACK_SIZE - 2 * 1024 * 1024)) {
          break;
        }
      }

      if (manifestList.length === 0) {
        // Rien à envoyer, on supprime le dossier staging
        await FileSystem.deleteAsync(stagingDir, { idempotent: true });
        return null;
      }

      // 3. Écrire le manifest.json
      const manifestPath = `${stagingDir}manifest.json`;
      const manifestData = {
        version: "1.0",
        type: "LOBA_PACK",
        timestamp: Date.now(),
        count: manifestList.length,
        totalSize: currentSize,
        posts: manifestList
      };
      
      await FileSystem.writeAsStringAsync(manifestPath, JSON.stringify(manifestData));

      // 4. Zipper le dossier de staging
      const zipPath = `${PACKS_DIR}${packName}.zip`;
      await zip(stagingDir, zipPath);
      
      console.log(`[LobaPackService] Pack généré: ${zipPath} (${manifestList.length} items, ${(currentSize/1024/1024).toFixed(1)}MB)`);

      // Nettoyer le dossier de staging (laisser juste le .zip)
      await FileSystem.deleteAsync(stagingDir, { idempotent: true });

      return zipPath;

    } catch (e) {
      console.error('[LobaPackService] Erreur lors de la création du pack:', e);
      // Nettoyage en cas d'erreur
      await FileSystem.deleteAsync(stagingDir, { idempotent: true });
      return null;
    }
  }

/**
    * Traite un pack reçu d'un autre utilisateur.
    * Phase 21: Gère aussi bien les .zip (packs) que les fichiers individuels.
    * @param {string} zipPath - Le chemin du ZIP reçu ou du fichier individuel.
    */
  static async unpackAndProcess(zipPath) {
    if (!zipPath) return false;
    await this.initDirectories();

    const timestamp = Date.now();
    const unpackDir = `${TEMP_UNPACK_DIR}unpack_${timestamp}/`;

    try {
      // Phase 21: Vérifier si c'est un ZIP ou un fichier direct
      const isZipFile = zipPath.endsWith('.zip');

      if (isZipFile) {
        console.log(`[LobaPackService] Pack ZIP détecté: ${zipPath}`);
        const zipInfo = await FileSystem.getInfoAsync(zipPath);
        console.log(`[LobaPackService] ZIP existe: ${zipInfo.exists}, taille: ${zipInfo.size}`);

        const normalizedZip = normalizePath(zipPath);
        const normalizedDest = normalizePath(unpackDir);

        console.log('[LobaPackService] Décompression ZIP...');
        try {
          await unzip(normalizedZip, normalizedDest);
          console.log('[LobaPackService] ZIP décompressé avec succès.');
        } catch (unzipError) {
          console.error('[LobaPackService] Erreur unzip:', unzipError);
          // Phase 21: Essayer de lister le contenu du ZIP directement
          try {
            const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'loba_packs/');
            console.log('[LobaPackService] Contenu du dossier packs:', files);
          } catch (e) {}
          return false;
        }

        const manifestPath = normalizePath(`${unpackDir}manifest.json`);
        const manifestInfo = await FileSystem.getInfoAsync(manifestPath);

        if (!manifestInfo.exists) {
          console.error('[LobaPackService] Archive invalide: manifest.json manquant.');
          return false;
        }

        const manifestContent = await FileSystem.readAsStringAsync(manifestPath);
        const manifestData = JSON.parse(manifestContent);

        if (!manifestData.posts || !Array.isArray(manifestData.posts)) {
          console.error('[LobaPackService] Manifeste invalide.');
          return false;
        }

        console.log(`[LobaPackService] Manifeste: ${manifestData.posts.length} posts à traiter.`);

        const normalizedUnpackDir = normalizePath(unpackDir);
        const successCount = await InterestEngine.processPackContent(normalizedUnpackDir, manifestData.posts);
        console.log(`[LobaPackService] InterestEngine terminé: ${successCount} posts conservés.`);

        return true;
      } else {
        // Phase 21: Fichier individuel (vidéo/image reçue en dehors d'un pack)
        console.log(`[LobaPackService] Fichier individuel détecté: ${zipPath}`);
        const fileInfo = await FileSystem.getInfoAsync(zipPath);
        if (!fileInfo.exists) {
          console.error('[LobaPackService] Fichier individuel introuvable.');
          return false;
        }
        // Traiter comme un seul post
        const singlePost = [{
          hash: Date.now().toString(),
          filename: zipPath.split('/').pop(),
          type: zipPath.endsWith('.mp4') ? 'video' : 'image',
          category: 'general',
          username: 'P2P Peer',
          content: 'Contenu reçu via WiFi Direct',
          size: fileInfo.size,
        }];

        const successCount = await InterestEngine.processPackContent(normalizePath(FileSystem.documentDirectory), singlePost);
        console.log(`[LobaPackService] Fichier individuel traité: ${successCount} posts conservés.`);
        return successCount > 0;
      }

    } catch (e) {
      console.error('[LobaPackService] Erreur lors du traitement de l\'archive:', e);
      return false;
    } finally {
      await FileSystem.deleteAsync(unpackDir, { idempotent: true });
      await FileSystem.deleteAsync(zipPath, { idempotent: true });
    }
  }

  /**
   * Retourne les statistiques des packs disponibles par catégorie.
   */
  static async getAvailablePacks() {
    try {
      const categories = ['marche', 'hotel', 'restauration', 'general'];
      const stats = [];

      for (const cat of categories) {
        const queryArgs = [Q.where('local_media_path', Q.notEq(null))];
        if (cat !== 'general') {
          queryArgs.push(Q.where('category', cat));
        }

        const posts = await database.get('loba_posts').query(...queryArgs).fetch();
        
        let totalSize = 0;
        for (const p of posts) {
          if (p.size) {
            totalSize += p.size;
          } else if (p.localMediaPath) {
            // Fallback dynamique si la taille en base est manquante (Phase 12 Fix)
            const info = await FileSystem.getInfoAsync(p.localMediaPath);
            if (info.exists) totalSize += info.size;
          }
        }

        if (posts.length > 0) {
          stats.push({
            id: cat,
            title: cat === 'general' ? 'Pack Général' : `Pack ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
            count: posts.length,
            sizeMB: (totalSize / 1024 / 1024).toFixed(1),
            category: cat
          });
        }
      }
      return stats;
    } catch (e) {
      console.error('[LobaPackService] Error getting stats:', e);
      return [];
    }
  }
}
