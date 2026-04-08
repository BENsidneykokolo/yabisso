// app/src/features/loba/hooks/useLobaPublish.js
import { useState } from 'react';
import { P2PAutoSync } from '../../bluetooth/services/P2PAutoSync';

/**
 * Hook useLobaPublish
 * Gère la publication Sociale Directe via l'orchestrateur P2P.
 * Cycle : Fichier → Hash → Local Storage → DB → SyncQueue → Propagation Mesh
 */
export function useLobaPublish() {
  const [isPublishing, setIsPublishing] = useState(false);

  const publishPost = async (params) => {
    const { uri, type, caption, filter, compress, username = '@Me', category = 'general' } = params;
    setIsPublishing(true);

    try {
      // La compression sera réactivée après le rebuild APK
      // Pour l'instant, on utilise le fichier original
      let finalUri = uri;

      // Utiliser l'orchestrateur P2P pour:
      // 1. Hasher le fichier
      // 2. Sauvegarder localement
      // 3. Créer le post en DB
      // 4. Mettre en queue pour propagation
      const result = await P2PAutoSync.publishLocal({
        uri: finalUri,
        type,
        caption,
        filter,
        username,
        category,
      });

      return result;
    } catch (e) {
      console.error('[LobaPublish] Error:', e);
      return { success: false, error: e.message };
    } finally {
      setIsPublishing(false);
    }
  };

  return { publishPost, isPublishing };
}
