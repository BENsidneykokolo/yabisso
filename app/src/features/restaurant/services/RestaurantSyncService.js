// app/src/features/restaurant/services/RestaurantSyncService.js
import { database as _database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';

const getDatabase = () => {
  try {
    if (!_database) {
      return null;
    }
    return _database;
  } catch (e) {
    console.log('[RestaurantSync] Erreur accès database:', e);
    return null;
  }
};

export const RestaurantSyncService = {
  async saveRestaurant(restaurantData) {
    try {
      const db = getDatabase();
      if (!db) {
        await SecureStore.setItemAsync('restaurant_shop_info', JSON.stringify(restaurantData));
        console.log('[RestaurantSync] Fallback SecureStore pour saveRestaurant');
        return { success: true };
      }
      
      await db.write(async () => {
        const restaurantsCol = db.get('restaurants');
        const existing = await restaurantsCol.query(Q.where('name', restaurantData.name)).fetch();
        
        if (existing.length > 0) {
          await existing[0].update(r => {
            r.name = restaurantData.name || '';
            r.category = (restaurantData.category?.join?.(',')) || restaurantData.category || '';
            r.cuisine = (restaurantData.category?.join?.(',')) || '';
            r.address = restaurantData.location || '';
            r.phone = restaurantData.phone || '';
            r.description = restaurantData.description || '';
            r.delivery = restaurantData.delivery || false;
            r.openingHours = restaurantData.hours || '';
            r.photosJson = JSON.stringify({
              avatar: restaurantData.avatar,
              banner: restaurantData.banner,
            });
            r.isValidated = false;
            r.syncStatus = 'pending';
            r.updatedAt = Date.now();
          });
        } else {
          await restaurantsCol.create(r => {
            r.name = restaurantData.name || '';
            r.category = (restaurantData.category?.join?.(',')) || restaurantData.category || '';
            r.cuisine = (restaurantData.category?.join?.(',')) || '';
            r.address = restaurantData.location || '';
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
            r.createdAt = Date.now();
            r.updatedAt = Date.now();
          });
        }
      });
      console.log('[RestaurantSync] Restaurant sauvegardé localement');
      return { success: true };
    } catch (e) {
      console.error('[RestaurantSync] Erreur saveRestaurant:', e);
      try {
        await SecureStore.setItemAsync('restaurant_shop_info', JSON.stringify(restaurantData));
      } catch (secureError) {
        console.error('[RestaurantSync] Erreur SecureStore fallback:', secureError);
      }
      return { success: false, error: e.message };
    }
  },

  async loadRestaurants() {
    try {
      const db = getDatabase();
      if (!db) {
        console.log('[RestaurantSync] Database non disponible, fallback SecureStore');
        const saved = await SecureStore.getItemAsync('restaurant_shop_info');
        if (saved) {
          return [JSON.parse(saved)];
        }
        return [];
      }
      
      const restaurants = await db.get('restaurants').query().fetch();
      return restaurants.map(r => {
        let photos = { avatar: null, banner: null };
        try {
          if (r.photosJson) {
            photos = JSON.parse(r.photosJson);
          }
        } catch (e) {}
        
        return {
          id: r.id,
          name: r.name || '',
          category: r.category ? r.category.split(',') : [],
          location: r.address || '',
          phone: r.phone || '',
          description: r.description || '',
          delivery: r.delivery || false,
          deliveryFee: '500',
          minOrder: '1000',
          hours: r.openingHours || '',
          avatar: photos.avatar,
          banner: photos.banner,
          isValidated: r.isValidated || false,
          syncStatus: r.syncStatus || 'pending',
        };
      });
    } catch (e) {
      console.error('[RestaurantSync] Erreur loadRestaurants:', e);
      try {
        const saved = await SecureStore.getItemAsync('restaurant_shop_info');
        if (saved) {
          return [JSON.parse(saved)];
        }
      } catch (secureError) {
        console.error('[RestaurantSync] Erreur SecureStore fallback:', secureError);
      }
      return [];
    }
  },

  async saveProduct(productData, restaurantId) {
    try {
      const db = getDatabase();
      if (!db) {
        const saved = await SecureStore.getItemAsync('restaurant_products');
        const products = saved ? JSON.parse(saved) : [];
        products.push({
          ...productData,
          id: Date.now().toString(),
          categoryName: productData.category,
          sellerId: 'local',
        });
        await SecureStore.setItemAsync('restaurant_products', JSON.stringify(products));
        return { success: true };
      }
      
      await db.write(async () => {
        await db.get('products').create(p => {
          p.name = productData.name || '';
          p.brand = '';
          p.price = productData.price || '0';
          p.category = productData.categoryName || productData.category || '';
          p.isNew = true;
          p.description = productData.description || '';
          p.minPrice = productData.price || '0';
          p.stock = 999;
          p.photosJson = JSON.stringify(productData.photos || []);
          p.condition = 'new';
          p.colorsJson = '[]';
          p.sizesJson = '[]';
          p.tagsJson = JSON.stringify(['restaurant', restaurantId || 'local']);
          p.sellerId = restaurantId || 'local';
          p.sellerName = productData.sellerName || '';
          p.isValidated = false;
          p.productSyncStatus = 'pending';
          p.createdAt = Date.now();
          p.updatedAt = Date.now();
        });
      });
      console.log('[RestaurantSync] Produit sauvegardé localement');
      return { success: true };
    } catch (e) {
      console.error('[RestaurantSync] Erreur saveProduct:', e);
      return { success: false, error: e.message };
    }
  },

  async loadProducts(restaurantId) {
    try {
      const db = getDatabase();
      if (!db) {
        const saved = await SecureStore.getItemAsync('restaurant_products');
        return saved ? JSON.parse(saved) : [];
      }
      
      const allProducts = await db.get('products').query().fetch();
      
      const restaurantProducts = allProducts.filter(p => {
        try {
          const tags = JSON.parse(p.tagsJson || '[]');
          return tags.includes('restaurant');
        } catch (e) {
          return false;
        }
      });
      
      return restaurantProducts.map(p => {
        let photos = [];
        try {
          if (p.photosJson) {
            photos = JSON.parse(p.photosJson);
          }
        } catch (e) {}
        
        return {
          id: p.id,
          name: p.name || '',
          price: p.price || '0',
          description: p.description || '',
          category: p.category || '',
          categoryName: p.category || '',
          photos: photos,
          isValidated: p.isValidated || false,
          syncStatus: p.productSyncStatus || 'pending',
        };
      });
    } catch (e) {
      console.error('[RestaurantSync] Erreur loadProducts:', e);
      try {
        const saved = await SecureStore.getItemAsync('restaurant_products');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (secureError) {
        console.error('[RestaurantSync] Erreur SecureStore fallback:', secureError);
      }
      return [];
    }
  },

  async deleteProduct(productId) {
    try {
      const db = getDatabase();
      if (!db) return { success: false, error: 'Database non disponible' };
      
      await db.write(async () => {
        const product = await db.get('products').find(productId);
        await product.markAsDeleted();
      });
      return { success: true };
    } catch (e) {
      console.error('[RestaurantSync] Erreur deleteProduct:', e);
      return { success: false, error: e.message };
    }
  },

  async addToSyncQueue(action, data) {
    try {
      const db = getDatabase();
      if (!db) return { success: false, error: 'Database non disponible' };
      
      await db.write(async () => {
        await db.get('sync_queue').create(sq => {
          sq.action = action;
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

  async syncToCloud() {
    try {
      const db = getDatabase();
      if (!db) return { success: false, error: 'Database non disponible' };
      
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('[RestaurantSync] Pas de connexion, sync reporté');
        return { success: false, error: 'Pas de connexion' };
      }

      const pendingItems = await db.get('sync_queue')
        .query(Q.where('status', 'pending'))
        .fetch();

      console.log(`[RestaurantSync] ${pendingItems.length} items à sync`);

      for (const item of pendingItems) {
        await db.write(async () => {
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

  async getSyncStatus() {
    try {
      const db = getDatabase();
      if (!db) return { pendingCount: 0 };
      
      const pending = await db.get('sync_queue')
        .query(Q.where('status', 'pending'))
        .fetchCount();
      return { pendingCount: pending };
    } catch (e) {
      return { pendingCount: 0 };
    }
  },
};

export default RestaurantSyncService;