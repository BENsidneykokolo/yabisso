// app/src/features/reservation/services/ReservationService.js
import { database as _database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';

const SECURE_KEY = 'yabisso_reservations_v1';

const getDatabase = () => {
  try {
    if (!_database) return null;
    return _database;
  } catch (e) {
    console.log('[ReservationService] Erreur accès database:', e);
    return null;
  }
};

const getCurrentUserId = async () => {
  try {
    const userStr = await SecureStore.getItemAsync('yabisso_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      return u.id || u.userId || 'local';
    }
    return 'local';
  } catch {
    return 'local';
  }
};

function generateId() {
  return 'res_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

export const ReservationService = {
  async createReservation(payload) {
    try {
      const db = getDatabase();
      const userId = await getCurrentUserId();
      const reservation = {
        id: generateId(),
        user_id: userId,
        service_type: payload.serviceType || 'generic',
        service_id: payload.serviceId || '',
        service_name: payload.serviceName || 'Réservation',
        date: payload.date || Date.now(),
        time: payload.time || '12:00',
        status: 'pending',
        details_json: JSON.stringify(payload.details || {}),
        total_price: String(payload.totalPrice || '0'),
        sync_status: 'pending',
        created_at: Date.now(),
        updated_at: Date.now(),
      };

      if (db) {
        await db.write(async () => {
          await db.get('reservations').create(r => {
            r.userId = reservation.user_id;
            r.serviceType = reservation.service_type;
            r.serviceId = reservation.service_id;
            r.serviceName = reservation.service_name;
            r.date = reservation.date;
            r.time = reservation.time;
            r.status = reservation.status;
            r.detailsJson = reservation.details_json;
            r.totalPrice = reservation.total_price;
            r.syncStatus = reservation.sync_status;
            r.createdAt = reservation.created_at;
            r.updatedAt = reservation.updated_at;
          });
        });
        console.log('[ReservationService] Réservation créée en DB');
      }

      const saved = await this._loadAllSecure();
      saved.unshift(reservation);
      await SecureStore.setItemAsync(SECURE_KEY, JSON.stringify(saved));
      return { success: true, reservation };
    } catch (e) {
      console.error('[ReservationService] Erreur createReservation:', e);
      return { success: false, error: e.message };
    }
  },

  async getMyReservations() {
    try {
      const db = getDatabase();
      const userId = await getCurrentUserId();

      if (db) {
        const items = await db.get('reservations')
          .query(Q.where('user_id', userId), Q.sortBy('date', Q.desc))
          .fetch();
        return items.map(this._mapReservation);
      }

      const all = await this._loadAllSecure();
      return all.filter(r => r.user_id === userId);
    } catch (e) {
      console.error('[ReservationService] Erreur getMyReservations:', e);
      return this._loadAllSecure();
    }
  },

  async getReservationById(id) {
    try {
      const db = getDatabase();
      if (db) {
        const items = await db.get('reservations')
          .query(Q.where('id', id))
          .fetch();
        if (items.length > 0) return this._mapReservation(items[0]);
      }
      const all = await this._loadAllSecure();
      return all.find(r => r.id === id) || null;
    } catch (e) {
      console.error('[ReservationService] Erreur getReservationById:', e);
      return null;
    }
  },

  async updateReservationStatus(id, status) {
    try {
      const db = getDatabase();
      if (db) {
        await db.write(async () => {
          const items = await db.get('reservations').query(Q.where('id', id)).fetch();
          if (items.length > 0) {
            await items[0].update(r => {
              r.status = status;
              r.syncStatus = 'pending';
              r.updatedAt = Date.now();
            });
          }
        });
      }
      const all = await this._loadAllSecure();
      const idx = all.findIndex(r => r.id === id);
      if (idx >= 0) {
        all[idx].status = status;
        all[idx].updated_at = Date.now();
        await SecureStore.setItemAsync(SECURE_KEY, JSON.stringify(all));
      }
      return { success: true };
    } catch (e) {
      console.error('[ReservationService] Erreur updateReservationStatus:', e);
      return { success: false, error: e.message };
    }
  },

  async cancelReservation(id, reason) {
    return this.updateReservationStatus(id, 'cancelled');
  },

  async confirmReservation(id) {
    return this.updateReservationStatus(id, 'confirmed');
  },

  async completeReservation(id) {
    return this.updateReservationStatus(id, 'completed');
  },

  async getReservationsByService(serviceType) {
    try {
      const all = await this.getMyReservations();
      return all.filter(r => r.service_type === serviceType);
    } catch (e) {
      return [];
    }
  },

  async getUpcomingReservations() {
    const all = await this.getMyReservations();
    const now = Date.now();
    return all.filter(r => r.date >= now && r.status !== 'cancelled' && r.status !== 'completed');
  },

  async getPastReservations() {
    const all = await this.getMyReservations();
    const now = Date.now();
    return all.filter(r => r.date < now || r.status === 'completed' || r.status === 'cancelled');
  },

  async getReservationStats() {
    const all = await this.getMyReservations();
    return {
      total: all.length,
      pending: all.filter(r => r.status === 'pending').length,
      confirmed: all.filter(r => r.status === 'confirmed').length,
      completed: all.filter(r => r.status === 'completed').length,
      cancelled: all.filter(r => r.status === 'cancelled').length,
    };
  },

  async syncToCloud() {
    try {
      const db = getDatabase();
      if (!db) return { success: false, error: 'Database non disponible' };

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return { success: false, error: 'Pas de connexion' };
      }

      const pending = await db.get('reservations')
        .query(Q.where('sync_status', 'pending'))
        .fetch();

      for (const item of pending) {
        await db.write(async () => {
          await item.update(r => {
            r.syncStatus = 'synced';
            r.updatedAt = Date.now();
          });
        });
      }
      return { success: true, count: pending.length };
    } catch (e) {
      console.error('[ReservationService] Erreur syncToCloud:', e);
      return { success: false, error: e.message };
    }
  },

  async _loadAllSecure() {
    try {
      const raw = await SecureStore.getItemAsync(SECURE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  _mapReservation(r) {
    let details = {};
    try {
      if (r.detailsJson) details = JSON.parse(r.detailsJson);
    } catch (e) {}

    return {
      id: r.id,
      user_id: r.userId,
      service_type: r.serviceType,
      service_id: r.serviceId,
      service_name: r.serviceName,
      date: r.date,
      time: r.time,
      status: r.status,
      details: details,
      total_price: r.totalPrice,
      sync_status: r.syncStatus,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    };
  },
};

export const RESERVATION_STATUS = {
  pending: { label: 'En attente', color: '#FFA726', icon: 'clock-outline' },
  confirmed: { label: 'Confirmée', color: '#2BEE79', icon: 'check-circle' },
  cancelled: { label: 'Annulée', color: '#FF5252', icon: 'close-circle' },
  completed: { label: 'Terminée', color: '#42A5F5', icon: 'check-decagram' },
};

export const RESERVATION_SERVICE_TYPES = {
  hotel: { label: 'Hôtel', icon: 'bed', color: '#AB47BC' },
  restaurant: { label: 'Restaurant', icon: 'silverware-fork-knife', color: '#FFA726' },
  taxi: { label: 'Taxi', icon: 'car', color: '#42A5F5' },
  transport: { label: 'Transport', icon: 'bus', color: '#26C6DA' },
  delivery: { label: 'Livraison', icon: 'truck-delivery', color: '#7E57C2' },
  event: { label: 'Événement', icon: 'calendar-star', color: '#EC407A' },
  generic: { label: 'Service', icon: 'calendar-check', color: '#2BEE79' },
};

export default ReservationService;
