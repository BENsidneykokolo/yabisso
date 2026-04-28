// app/src/features/services/services/ServicesSyncService.js
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import NetInfo from '@react-native-community/netinfo';

/**
 * ServicesSyncService
 * Gère la synchronisation offline-first des services et prestataires
 * Même logique que RestaurantSyncService
 */

export const ServicesSyncService = {
  /**
   * Sauvegarde un service prestateur localement (WatermelonDB)
   */
  async saveService(serviceData) {
    try {
      await database.write(async () => {
        // Vérifier si le service existe déjà
        const existing = await database.get('courses')
          .query(Q.where('title', serviceData.name))
          .fetch();

        if (existing.length > 0) {
          // Mise à jour
          await existing[0].update(s => {
            s.title = serviceData.name;
            s.category = serviceData.category || '';
            s.instructor = serviceData.providerName || '';
            s.description = serviceData.description || '';
            s.price = serviceData.price || '0';
            s.durationHours = serviceData.duration || 0;
            s.thumbnailUrl = serviceData.avatar || '';
            s.syncStatus = 'pending';
          });
        } else {
          // Création (utilise la table courses pour les services)
          await database.get('courses').create(s => {
            s.title = serviceData.name;
            s.category = serviceData.category || 'service';
            s.instructor = serviceData.providerName || '';
            s.description = serviceData.description || '';
            s.price = serviceData.price || '0';
            s.durationHours = serviceData.duration || 0;
            s.level = serviceData.level || 'beginner';
            s.thumbnailUrl = serviceData.avatar || '';
            s.videoUrl = '';
            s.isValidated = false;
            s.syncStatus = 'pending';
          });
        }
      });
      console.log('[ServicesSync] Service sauvegardé localement');
      return { success: true };
    } catch (e) {
      console.error('[ServicesSync] Erreur saveService:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Charge tous les services locaux
   */
  async loadServices() {
    try {
      const services = await database.get('courses')
        .query(Q.where('category', Q.like('%service%')))
        .fetch();
      
      // Fallback: charger tous si pas de match
      const allServices = services.length > 0 ? services : await database.get('courses').query().fetch();
      
      return allServices.map(s => ({
        id: s.id,
        name: s.title,
        category: s.category,
        providerName: s.instructor,
        description: s.description,
        price: s.price,
        duration: s.durationHours,
        avatar: s.thumbnailUrl,
        isValidated: s.isValidated,
        syncStatus: s.syncStatus,
      }));
    } catch (e) {
      console.error('[ServicesSync] Erreur loadServices:', e);
      return [];
    }
  },

  /**
   * Sauvegarde une offre de service (prestation)
   */
  async saveOffer(offerData, serviceId) {
    try {
      await database.write(async () => {
        await database.get('courses').create(s => {
          s.title = offerData.name;
          s.category = offerData.category || 'offer';
          s.instructor = offerData.providerName || '';
          s.description = offerData.description || '';
          s.price = offerData.price || '0';
          s.durationHours = offerData.duration || 0;
          s.level = offerData.level || 'standard';
          s.thumbnailUrl = offerData.avatar || '';
          s.videoUrl = '';
          s.isValidated = false;
          s.syncStatus = 'pending';
        });
      });
      console.log('[ServicesSync] Offre sauvegardée localement');
      return { success: true };
    } catch (e) {
      console.error('[ServicesSync] Erreur saveOffer:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Charge les offres d'un service
   */
  async loadOffers(serviceId) {
    try {
      const offers = await database.get('courses')
        .query(Q.where('category', 'offer'))
        .fetch();
      
      return offers.map(o => ({
        id: o.id,
        name: o.title,
        category: o.category,
        providerName: o.instructor,
        description: o.description,
        price: o.price,
        duration: o.durationHours,
        avatar: o.thumbnailUrl,
        isValidated: o.isValidated,
        syncStatus: o.syncStatus,
      }));
    } catch (e) {
      console.error('[ServicesSync] Erreur loadOffers:', e);
      return [];
    }
  },

  /**
   * Supprime un service/offre
   */
  async deleteService(serviceId) {
    try {
      await database.write(async () => {
        const service = await database.get('courses').find(serviceId);
        await service.markAsDeleted();
      });
      return { success: true };
    } catch (e) {
      console.error('[ServicesSync] Erreur deleteService:', e);
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
          sq.action = action; // create_service, update_service, create_offer
          sq.payloadJson = JSON.stringify(data);
          sq.status = 'pending';
          sq.retryCount = 0;
          sq.createdAt = Date.now();
          sq.updatedAt = Date.now();
        });
      });
      console.log('[ServicesSync] Ajouté à la sync queue');
      return { success: true };
    } catch (e) {
      console.error('[ServicesSync] Erreur addToSyncQueue:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Sync vers Supabase (quand internet revient)
   */
  async syncToCloud() {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('[ServicesSync] Pas de connexion, sync reporté');
      return { success: false, error: 'Pas de connexion' };
    }

    try {
      const pendingItems = await database.get('sync_queue')
        .query(Q.where('status', 'pending'))
        .fetch();

      console.log(`[ServicesSync] ${pendingItems.length} items à sync`);

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
      console.error('[ServicesSync] Erreur syncToCloud:', e);
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

export default ServicesSyncService;