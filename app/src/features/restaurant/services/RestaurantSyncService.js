// app/src/features/restaurant/services/RestaurantSyncService.js
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import NetInfo from '@react-native-community/netinfo';

/**
 * RestaurantSyncService
 * Gère la synchronisation offline-first des restaurants et produits
 */

export const RestaurantSyncService = {
  /**
   * Sauvegarde un restaurant localement (WatermelonDB)
   */
  async saveRestaurant(restaurantData) {
    try {
      await database.write(async () => {
        // Vérifier si le restaurant existe déjà
        const existing = await database.get('restaurants')
          .query(Q.where('name', restaurantData.name))
          .fetch();

        if (existing.length > 0) {
          // Mise à jour
          await existing[0].update(r => {
            r.name = restaurantData.name;
            r.category = restaurantData.category?.join(',') || '';
            r.address = restaurantData.location || '';
            r.phone = restaurantData.phone || '';
            r.description = restaurantData.description || '';
            r.delivery = restaurantData.delivery || false;
            r.deliveryFee = restaurantData.deliveryFee || '0';
            r.minOrder = restaurantData.minOrder || '0';
            r.openingHours = restaurantData.hours || '';
            r.photosJson = JSON.stringify({
              avatar: restaurantData.avatar,
              banner: restaurantData.banner,
            });
            r.syncStatus = 'pending';
          });
        } else {
          // Création
          await database.get('restaurants').create(r => {
            r.name = restaurantData.name;
            r.category = restaurantData.category?.join(',') || '';
            r.address = restaurantData.location || '';
            r.phone = restaurantData.phone || '';
            r.description = restaurantData.description || '';
            r.city = restaurantData.city || '';
            r.latitude = restaurantData.latitude || 0;
            r.longitude = restaurantData.longitude || 0;
            r.rating = 0;
            r.priceRange = 'medium';
            r.delivery = restaurantData.delivery || false;
            r.openingHours = restaurantData.hours || '';
            r.photosJson = JSON.stringify({
              avatar: restaurantData.avatar,
              banner: restaurantData.banner,
            });
            r.isValidated = false;
            r.syncStatus = 'pending';
          });
        }
      });
      console.log('[RestaurantSync] Restaurant sauvegardé localement');
      return { success: true };
    } catch (e) {
      console.error('[RestaurantSync] Erreur saveRestaurant:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Charge tous les restaurants locaux
   */
  async loadRestaurants() {
    try {
      const restaurants = await database.get('restaurants').query().fetch();
      return restaurants.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category?.split(',') || [],
        location: r.address,
        phone: r.phone,
        description: r.description,
        delivery: r.delivery,
        deliveryFee: r.deliveryFee || '0',
        minOrder: r.minOrder || '0',
        hours: r.openingHours,
        avatar: r.photosJson ? JSON.parse(r.photosJson).avatar : null,
        banner: r.photosJson ? JSON.parse(r.photosJson).banner : null,
        isValidated: r.isValidated,
        syncStatus: r.syncStatus,
      }));
    } catch (e) {
      console.error('[RestaurantSync] Erreur loadRestaurants:', e);
      return [];
    }
  },

  /**
   * Sauvegarde un produit (plat) localement
   */
  async saveProduct(productData, restaurantId) {
    try {
      // Créer une table products_restaurant si elle n'existe pas
      // Pour l'instant, on utilise la table products existante avec un type
      await database.write(async () => {
        await database.get('products').create(p => {
          p.name = productData.name;
          p.brand = ''; // unused for restaurant
          p.price = productData.price;
          p.category = productData.category; // dish category
          p.isNew = true;
          p.description = productData.description;
          p.minPrice = productData.price;
          p.stock = 999;
          p.photosJson = JSON.stringify(productData.photos || []);
          p.condition = 'new';
          p.colorsJson = '[]';
          p.sizesJson = '[]';
          p.tagsJson = JSON.stringify(['restaurant', restaurantId]);
          p.sellerId = restaurantId;
          p.sellerName = productData.sellerName || '';
          p.isValidated = false;
          p.productSyncStatus = 'pending';
        });
      });
      console.log('[RestaurantSync] Produit sauvegardé localement');
      return { success: true };
    } catch (e) {
      console.error('[RestaurantSync] Erreur saveProduct:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Charge les produits d'un restaurant
   */
  async loadProducts(restaurantId) {
    try {
      const products = await database.get('products')
        .query(Q.where('seller_id', restaurantId))
        .fetch();
      
      return products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        category: p.category,
        photos: p.photosJson ? JSON.parse(p.photosJson) : [],
        isValidated: p.isValidated,
        syncStatus: p.productSyncStatus,
      }));
    } catch (e) {
      console.error('[RestaurantSync] Erreur loadProducts:', e);
      return [];
    }
  },

  /**
   * Supprime un produit
   */
  async deleteProduct(productId) {
    try {
      await database.write(async () => {
        const product = await database.get('products').find(productId);
        await product.markAsDeleted();
      });
      return { success: true };
    } catch (e) {
      console.error('[RestaurantSync] Erreur deleteProduct:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Ajoute à la sync queue pour sync later
   */
  async addToSyncQueue(action, data) {
    try {
      await database.write(async () => {
        await database.get('sync_queue').create(sq => {
          sq.action = action; // create_restaurant, update_restaurant, create_product
          sq.payloadJson = JSON.stringify(data);
          sq.status = 'pending';
          sq.retryCount = 0;
          sq.createdAt = Date.now();
          sq.updatedAt = Date.now();
        });
      });
      console.log('[RestaurantSync] Ajouté à la sync queue');
      return { success: true };
    } catch (e) {
      console.error('[RestaurantSync] Erreur addToSyncQueue:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Sync vers Supabase (quand internet revient)
   * NOTE: À implémenter avec le vrai client Supabase
   */
  async syncToCloud() {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('[RestaurantSync] Pas de connexion, sync reporté');
      return { success: false, error: 'Pas de connexion' };
    }

    try {
      // Récupérer les items pending
      const pendingItems = await database.get('sync_queue')
        .query(Q.where('status', 'pending'))
        .fetch();

      console.log(`[RestaurantSync] ${pendingItems.length} items à sync`);

      // Pour chaque item, ici onwould call Supabase
      // Pour l'instant, on marque comme synced
      for (const item of pendingItems) {
        await database.write(async () => {
          await item.update(sq => {
            sq.status = 'synced';
            sq.updatedAt = Date.now();
          });
        });
      }

      return { success: true, count: pendingItems.length };
    } catch (e) {
      console.error('[RestaurantSync] Erreur syncToCloud:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Retourne le statut de sync (items pending)
   */
  async getSyncStatus() {
    try {
      const pending = await database.get('sync_queue')
        .query(Q.where('status', 'pending'))
        .fetchCount();
      return { pendingCount: pending };
    } catch (e) {
      return { pendingCount: 0 };
    }
  },
};

export default RestaurantSyncService;