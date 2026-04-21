import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import { LocalStorageManager } from './LocalStorageManager';
import * as FileSystem from 'expo-file-system';

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

     for (const post of manifestPosts) {
         try {
             // 1. Déduplication : Vérification si le post existe déjà
             const existing = await database.get('loba_posts').query(Q.where('hash', post.hash)).fetch();
             if (existing.length > 0) {
                 console.log(`[InterestEngine] Ignoré : ${post.hash} (déjà existant localement).`);
                 continue;
             }
             
             // 2. Filtrage Intelligent (Interests Engine)
             // L'application devient intelligente en analysant le comportement (Likes, Views)
             const isInteresting = await this._evaluateInterest(post.category);
             if (!isInteresting) {
                 console.log(`[InterestEngine] Ignoré : ${post.hash} (sans intérêt pour l'utilisateur).`);
                 continue; 
             }

             // 3. Sauvegarde physique du fichier
             const sourcePath = `${unpackDir}${post.filename}`;
             const fileInfo = await FileSystem.getInfoAsync(sourcePath);
             
             if (!fileInfo.exists) {
                 console.warn(`[InterestEngine] Fichier introuvable dans le pack : ${post.filename}`);
                 continue;
             }

             // On utilise le LocalStorageManager pour stocker durablement et hasher/sécuriser
             const savedPath = await LocalStorageManager.saveMedia(sourcePath, post.hash, post.type === 'video' ? 'mp4' : 'jpg');
             
             if (savedPath) {
                 // 4. Inscription en base de données de la source de vérité
                 await database.write(async () => {
                    await database.get('loba_posts').create(newPost => {
                        newPost.hash = post.hash;
                        newPost.localMediaPath = savedPath;
                        newPost.downloadedAt = Date.now();
                        newPost.username = post.username;
                        newPost.avatar = post.avatar;
                        newPost.content = post.content;
                        // On limite la re-propagation sauvage (Storm control)
                        // On pourra le réactiver plus tard si l'utilisateur l'aime.
                        newPost.isPropagating = false; 
                        newPost.category = post.category || 'general';
                        newPost.size = post.size;
                        newPost.imageUrl = post.type === 'image' ? savedPath : null;
                        newPost.videoUrl = post.type === 'video' ? savedPath : null;
                        newPost.likes = post.likes;
                        newPost.comments = 0;
                        newPost.isLiked = false;
                    });
                 });
                 successCount++;
                 console.log(`[InterestEngine] ✅ Nouveau contenu ajouté : ${post.hash}`);
             }
         } catch (err) {
             console.error(`[InterestEngine] Erreur sur le traitement du post ${post.hash}:`, err);
         }
     }
     
     return successCount;
  }

  /**
   * Évalue dynamiquement si une catégorie intéresse l'utilisateur.
   * Basé sur l'analyse de l'historique de ses likes ("is_liked" = true).
   */
  static async _evaluateInterest(category) {
      if (!category) return true; // Si pas de catégorie, on accepte par défaut
      
      try {
          // Récupère les posts que l'utilisateur a aimés
          const likedPosts = await database.get('loba_posts').query(Q.where('is_liked', true)).fetch();
          
          // PHASE D'APPRENTISSAGE : Si l'utilisateur n'a encore presque rien liké (< 5), on est "ouvert" à tout.
          if (likedPosts.length < 5) return true;

          // Combien de vidéos de cette catégorie l'utilisateur a-t-il aimées ?
          const categoryLikes = likedPosts.filter(p => p.category === category).length;
          
          // Si la catégorie a été likée au moins une fois, l'intérêt est prouvé.
          if (categoryLikes > 0) return true;

          // SÉRENDIPITÉ : On introduit tout de même une chance (20%) de découvrir une nouvelle catégorie.
          // Cela évite la "bulle de filtres".
          return Math.random() < 0.2;
          
      } catch (e) {
          console.warn('[InterestEngine] Erreur d\'évaluation, acceptation par défaut.', e);
          return true; // En cas de doute ou d'erreur SQL, on accepte le contenu.
      }
  }
}
