import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import { LocalStorageManager } from './LocalStorageManager';
import * as FileSystem from 'expo-file-system';

const normalizePath = (path) => {
  if (!path) return path;
  if (!path.startsWith('file://')) return `file://${path}`;
  return path;
};

export class InterestEngine {
  /**
   * Traite le contenu d'un manifeste de Pack.
   * Filtre par duplication, par intérêt et sauvegarde en base.
   * 
   * @param {string} unpackDir - Chemin du dossier décompressé
   * @param {Array} manifestPosts - Liste des posts dans le manifeste
   * @returns {number} Nombre de posts sauvegardés
   */
  static async processPackContent(unpackDir, manifestPosts) {
     let successCount = 0;

     console.log(`[InterestEngine] Debut traitement: ${manifestPosts.length} posts, dossier: ${unpackDir}`);

     // Debug: Lister les fichiers dans le dossier décompressé
     try {
       const unpackFiles = await FileSystem.readDirectoryAsync(unpackDir);
       console.log(`[InterestEngine] Fichiers dans unpackDir: ${unpackFiles.join(', ')}`);
     } catch (e) {
       console.log(`[InterestEngine] Impossible de lister unpackDir: ${e.message}`);
     }

     for (let i = 0; i < manifestPosts.length; i++) {
         const post = manifestPosts[i];
         console.log(`[InterestEngine] Traitement post ${i+1}/${manifestPosts.length}: ${post.hash}`);
         
         try {
             // 1. Déduplication : Vérification si le post existe déjà
             const existingCount = await database.get('loba_posts').query(Q.where('hash', post.hash)).count();
             if (existingCount > 0) {
                 console.log(`[InterestEngine] Ignoré : ${post.hash} (déjà existant localement).`);
                 continue;
             }
             
             // 2. Évaluation de l'intérêt (Phase 17: Réactivé avec seuils de volume)
             const isInteresting = await this._evaluateInterest(post.category);
             if (!isInteresting) {
                 console.log(`[InterestEngine] Ignoré : ${post.hash} (sans intérêt pour l'utilisateur).`);
                 continue; 
             }

             // 3. Sauvegarde physique du fichier (Phase 16: Normalisation sourcePath)
             const sourcePath = normalizePath(`${unpackDir}${post.filename}`);
             console.log(`[InterestEngine] Vérification fichier: ${sourcePath}`);
             
             const fileInfo = await FileSystem.getInfoAsync(sourcePath);
             console.log(`[InterestEngine] Fichier existe: ${fileInfo.exists}`);
             
             if (!fileInfo.exists) {
                 console.warn(`[InterestEngine] Fichier introuvable dans le pack : ${post.filename}`);
                 continue;
             }

             // On utilise le LocalStorageManager pour stocker durablement et hasher/sécuriser
             console.log(`[InterestEngine] Sauvegarde media: ${post.hash}`);
             const result = await LocalStorageManager.saveMedia(sourcePath, post.hash, post.type === 'video' ? 'mp4' : 'jpg');
             console.log(`[InterestEngine] saveMedia result:`, result ? 'OK' : 'FAILED');
            
             if (result && result.path) {
                 const { path: savedPath, size: savedSize } = result;
                 // 4. Inscription en base de données de la source de vérité
                 await database.write(async () => {
                    await database.get('loba_posts').create(newPost => {
                        newPost.hash = post.hash;
                        newPost.localMediaPath = savedPath;
                        newPost.downloadedAt = Date.now();
                        newPost.username = post.username;
                        newPost.avatar = post.avatar;
                        newPost.content = post.content;
                        newPost.isPropagating = false; 
                        newPost.category = post.category || 'general';
                        newPost.size = savedSize || post.size || 0;
                        newPost.imageUrl = post.type === 'image' ? savedPath : null;
                        newPost.videoUrl = post.type === 'video' ? savedPath : null;
                        newPost.likes = post.likes;
                        newPost.comments = 0;
                        newPost.isLiked = false;
                    });
                 });
                 successCount++;
                 console.log(`[InterestEngine] ✅ Enregistré en base : ${post.hash} (${post.category})`);
             }
         } catch (err) {
             console.error(`[InterestEngine] Erreur sur le traitement du post ${post.hash}:`, err);
         }
     }
     
     console.log(`[InterestEngine] Fin traitement. ${successCount} posts sauvegardés.`);
     return successCount;
  }

  /**
   * Évalue dynamiquement si une catégorie intéresse l'utilisateur.
   * Basé sur le volume total et l'historique des likes. (Phase 17)
   */
  static async _evaluateInterest(category) {
      try {
          // 1. Vérification du volume total
          const totalPosts = await database.get('loba_posts').query().count();
          
          // MODE APPRENTISSAGE : Pas de tri avant 10 000 vidéos
          if (totalPosts < 10000) {
              return true;
          }

          // 2. Vérification de l'intérêt explicite (Likes)
          if (!category) return true;
          const categoryLikes = await database.get('loba_posts').query(
              Q.where('category', category),
              Q.where('is_liked', true)
          ).count();
          
          if (categoryLikes > 0) return true;

          // 3. Calcul de la chance de découverte (Luck Factor) basé sur les seuils utilisateur
          let luckFactor = 0.8; // Par défaut, on accepte 80% des contenus inconnus

          if (totalPosts >= 10000 && totalPosts < 100000) {
              // Entre 10k et 100k : Filtrage entre 10% et 30% (Luck entre 90% et 70%)
              const progress = (totalPosts - 10000) / 90000;
              luckFactor = 0.9 - (progress * 0.2); 
          } else if (totalPosts >= 100000 && totalPosts < 250000) {
              // Entre 100k et 250k : Transition vers le filtrage à 80% (Luck à 20%)
              const progress = (totalPosts - 100000) / 150000;
              luckFactor = 0.7 - (progress * 0.5);
          } else if (totalPosts >= 250000) {
              // Au delà de 250k : Filtrage à 80% (Luck à 20%)
              luckFactor = 0.2;
          }

          return Math.random() < luckFactor;
          
      } catch (e) {
          console.warn('[InterestEngine] Erreur d\'évaluation, acceptation par défaut.', e);
          return true;
      }
  }
}
