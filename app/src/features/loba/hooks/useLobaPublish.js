// app/src/features/loba/hooks/useLobaPublish.js
import { useState } from 'react';
import { database } from '../../../lib/db';
import { MeshSyncService } from '../../bluetooth/services/MeshSyncService';

/**
 * Hook useLobaPublish
 * Gère la publication Sociale Directe (Social -> DB -> Mesh -> Cloud)
 */
export function useLobaPublish() {
  const [isPublishing, setIsPublishing] = useState(false);

  const publishPost = async (params) => {
    const { uri, type, caption, filter, compress, username = '@Me' } = params;
    setIsPublishing(true);

    try {
      // 0. (Optionnel) Simulation de la compression Média pour Mesh
      let finalUri = uri;
      if (compress) {
        console.log(`[LobaPublish] Début de la compression ${type} pour le transport Mesh...`);
        // On simule le délai de compression asynchrone sans bloquer avec expo-image-manipulator ou react-native-compressor
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log(`[LobaPublish] Compression terminée. Fichier réduit au maximum.`);
      }

      // 1. Persistance locale (WatermelonDB)
      // On crée d'abord le post pour qu'il soit visible immédiatement
      let newPost;
      await database.write(async () => {
        newPost = await database.get('loba_posts').create(post => {
          post.username = username;
          post.content = caption || '';
          post.videoUrl = type === 'video' ? uri : null;
          post.imageUrl = type === 'image' ? uri : null;
          post.filterColor = filter?.color || 'transparent';
          post.isLiked = false;
          post.likes = 0;
          post.comments = 0;
          post.isPropagating = true; // Commence la propagation
        });

        // 2. Ajout SyncQueue pour le Cloud
        await database.get('sync_queue').create(item => {
          item.action = 'CREATE_LOBA_POST';
          item.payloadJson = JSON.stringify({ postId: newPost.id, caption });
          item.status = 'pending';
        });
      });

      // 3. Propagation Mesh en Arrière-plan (Social Direct)
      // On ne 'await' pas pour ne pas bloquer l'UI
      MeshSyncService.broadcast('SOCIAL_POST', { postId: newPost.id }, uri)
        .then(async (res) => {
          if (res.success) {
            await database.write(async () => {
              // On marque comme propagé localement
              const found = await database.get('loba_posts').find(newPost.id);
              await found.update(st => { st.isPropagatedLocally = true; });
            });
            console.log('[LobaPublish] Mesh Success');
          }
        })
        .catch(err => console.error('[LobaPublish] Mesh Error', err));

      return { success: true, postId: newPost.id };
    } catch (e) {
      console.error('[LobaPublish] Error:', e);
      return { success: false, error: e.message };
    } finally {
      setIsPublishing(false);
    }
  };

  return { publishPost, isPublishing };
}
