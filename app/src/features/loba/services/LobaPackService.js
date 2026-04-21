import * as FileSystem from 'expo-file-system/legacy';
import { zip, unzip } from 'react-native-zip-archive';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import { InterestEngine } from './InterestEngine';

const MAX_PACK_SIZE = 50 * 1024 * 1024; // 50 MB
const PACKS_DIR = `${FileSystem.documentDirectory}loba_packs/`;
const TEMP_UNPACK_DIR = `${FileSystem.documentDirectory}loba_packs_temp/`;

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
   * Génère un nouveau pack de 50MB maximum avec les publications à propager.
   * @returns {Promise<string|null>} Le chemin local du fichier ZIP, ou null si rien à envoyer.
   */
  static async buildPack() {
    await this.initDirectories();

    const timestamp = Date.now();
    const packName = `loba_pack_${timestamp}`;
    const stagingDir = `${PACKS_DIR}${packName}/`;
    
    await FileSystem.makeDirectoryAsync(stagingDir, { intermediates: true });

    try {
      // 1. Récupérer les posts candidats à la propagation
      // Pour maximiser l'échange, on peut prendre tous les posts récents (jusqu'à 100) qui ont un média local
      const posts = await database.get('loba_posts')
        .query(
          Q.where('local_media_path', Q.notEq(null)),
          Q.sortBy('created_at', Q.desc),
          Q.take(100)
        )
        .fetch();

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
   * @param {string} zipPath - Le chemin du ZIP reçu.
   */
  static async unpackAndProcess(zipPath) {
    if (!zipPath) return false;
    await this.initDirectories();

    const timestamp = Date.now();
    const unpackDir = `${TEMP_UNPACK_DIR}unpack_${timestamp}/`;
    
    try {
      console.log(`[LobaPackService] Décompression de ${zipPath}...`);
      
      // 1. Unzip
      await unzip(zipPath, unpackDir);
      
      // 2. Lire le manifeste
      const manifestPath = `${unpackDir}manifest.json`;
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

      console.log(`[LobaPackService] Manifeste lu : ${manifestData.posts.length} posts à traiter.`);

      // 3. Déléguer au moteur d'intelligence (tri, déduplication et sauvegarde locale)
      const successCount = await InterestEngine.processPackContent(unpackDir, manifestData.posts);
      
      console.log(`[LobaPackService] Pack traité avec succès. ${successCount} nouvelles publications conservées.`);
      return true;

    } catch (e) {
      console.error('[LobaPackService] Erreur lors du traitement de l\'archive:', e);
      return false;
    } finally {
      // Nettoyage impératif des fichiers temporaires (zip recu et dossier dézippé)
      await FileSystem.deleteAsync(unpackDir, { idempotent: true });
      await FileSystem.deleteAsync(zipPath, { idempotent: true });
    }
  }
}
