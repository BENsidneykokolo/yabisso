// app/src/features/bluetooth/services/GlobalManifestService.js
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import { ManifestService } from '../../loba/services/ManifestService';

/**
 * GlobalManifestService
 * Agrège les données validées de TOUS les services (Marché, Restaurants, Hôtels, etc.)
 * en plus de Loba, pour les propager via le réseau Mesh.
 */
export const GlobalManifestService = {
  
  async generateGlobalManifest() {
    try {
      // 1. Récupérer le manifeste Loba classique
      const lobaManifest = await ManifestService.generateManifest();

      // 2. Récupérer les Produits (Marché) validés
      const products = await database.get('products')
        .query(
          Q.where('is_validated', true),
          Q.sortBy('updated_at', Q.desc),
          Q.take(50) // Limite pour ne pas saturer
        ).fetch();

      // TODO: Ajouter restaurants, hotels, etc. de la même manière.
      // Pour l'instant, on se concentre sur les produits (Marché).

      return {
        timestamp: Date.now(),
        loba: lobaManifest.media,
        products: products.map(p => ({
          _raw: p._raw, // Sérialisation WatermelonDB brute pour injection directe
          hash: p.id,
          seller_id: p.sellerId,
        }))
      };
    } catch (e) {
      console.error('[GlobalManifest] Erreur génération:', e.message);
      return null;
    }
  },

  async calculateGlobalDelta(remoteManifest) {
    if (!remoteManifest) return { loba: [], products: [] };

    try {
      // 1. Delta Loba (Réutilisation du code existant, avec limite de 20)
      const lobaDelta = await ManifestService.calculateDelta({ media: remoteManifest.loba });

      // 2. Delta Produits
      let productsDelta = [];
      if (remoteManifest.products && remoteManifest.products.length > 0) {
        const remoteProductIds = remoteManifest.products.map(p => p.hash);
        const localProducts = await database.get('products')
          .query(Q.where('id', Q.oneOf(remoteProductIds)))
          .fetch();
        
        const localIds = new Set(localProducts.map(p => p.id));
        productsDelta = remoteManifest.products.filter(p => !localIds.has(p.hash));
      }

      return {
        loba: lobaDelta,
        products: productsDelta
      };
    } catch (e) {
      console.error('[GlobalManifest] Erreur calcul Global Delta:', e.message);
      return { loba: [], products: [] };
    }
  }
};
