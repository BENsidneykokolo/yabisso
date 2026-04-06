// app/src/features/loba/hooks/useLobaPublish.js
import { useState } from 'react';
import { database } from '../../../lib/db';
import { MeshSyncService } from '../../bluetooth/services/MeshSyncService';
// import { Video as VideoCompressor, Image as ImageCompressor } from 'react-native-compressor';
const VideoCompressor = null;
const ImageCompressor = null;

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
      // 0. Vraie Compression Média native pour Mesh P2P
      let finalUri = uri;
      if (compress && VideoCompressor && ImageCompressor) {
        console.log(`[LobaPublish] Début de la compression native ${type}...`);
        try {
          if (type === 'video') {
             finalUri = await VideoCompressor.compress(
               uri, 
               { compressionMethod: 'auto', maxSize: 1080 },
               (progress) => { console.log('Compression Vidéo:', Math.round(progress * 100) + '%'); }
             );
          } else if (type === 'image') {
             finalUri = await ImageCompressor.compress(
               uri, 
               { compressionMethod: 'auto', quality: 0.8, maxWidth: 1080 }
             );
          }
          console.log(`[LobaPublish] Compression terminée ! URI compressé : ${finalUri}`);
        } catch(cErr) {
          console.error('[LobaPublish] Erreur pendant la compression native (fallback original) :', cErr);
          finalUri = uri; // Fallback pour ne pas bloquer
        }
      } else if (compress) {
        console.log('[LobaPublish] Compression désactivée (module non lié)');
        finalUri = uri;
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

      // 3. Propagation Mesh en Arrière-plan (Social Direct via Relay)
      // On ne 'await' pas pour ne pas bloquer l'UI
      const p2pPayload = {
        postId: newPost.id,
        username,
        content: caption || '',
        videoUrl: type === 'video' ? finalUri : null,
        imageUrl: type === 'image' ? finalUri : null,
        filterColor: filter?.color || 'transparent'
      };

      MeshSyncService.broadcast('SOCIAL_POST', p2pPayload, finalUri)
        .then(async (res) => {
          if (res.success) {
            await database.write(async () => {
              // On marque comme propagé localement
              const found = await database.get('loba_posts').find(newPost.id);
              if (found) {
                 await found.update(st => {
                   st.isPropagatedLocally = true;
                   st.isPropagating = false;
                   if (res.url) {
                      st.videoUrl = type === 'video' ? res.url : null;
                      st.imageUrl = type === 'image' ? res.url : null;
                   }
                 });
              }
            });
            console.log('[LobaPublish] Mesh/Relay Success:', res.url);
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
