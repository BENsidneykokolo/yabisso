// app/src/features/bluetooth/services/P2PDailyLimitManager.js
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

/**
 * P2PDailyLimitManager - Gère les limites de partage P2P
 * 200MB par service par jour entre chaque pair
 */
class P2PDailyLimitManagerClass {
  DAILY_LIMIT_BYTES = 200 * 1024 * 1024; // 200MB

  /**
   * Vérifie si l'utilisateur peut encore partager avec ce peer
   */
  async canShare(userId, peerId, service) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const table = database.get('p2p_daily_shares');
      const records = await table.query(
        Q.where('user_id', userId),
        Q.where('peer_id', peerId),
        Q.where('service', service),
        Q.where('date', today)
      ).fetch();

      let totalSent = 0;
      for (const record of records) {
        totalSent += record.bytesSent || 0;
      }

      return totalSent < this.DAILY_LIMIT_BYTES;
    } catch (e) {
      console.warn('[P2PDailyLimitManager] Erreur lecture:', e.message);
      return true; // En cas d'erreur, on permet
    }
  }

  /**
   * Retourne l'espace restant pour aujourd'hui
   */
  async getRemainingBytes(userId, peerId, service) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const table = database.get('p2p_daily_shares');
      const records = await table.query(
        Q.where('user_id', userId),
        Q.where('peer_id', peerId),
        Q.where('service', service),
        Q.where('date', today)
      ).fetch();

      let totalSent = 0;
      for (const record of records) {
        totalSent += record.bytesSent || 0;
      }

      return Math.max(0, this.DAILY_LIMIT_BYTES - totalSent);
    } catch (e) {
      return this.DAILY_LIMIT_BYTES;
    }
  }

  /**
   * Enregistre un partage
   */
  async recordShare(userId, peerId, service, bytes) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const table = database.get('p2p_daily_shares');
      await database.write(async () => {
        await table.create(record => {
          record.userId = userId;
          record.peerId = peerId;
          record.service = service;
          record.date = today;
          record.bytesSent = bytes;
          record.createdAt = Date.now();
        });
      });
      console.log(`[P2PDailyLimitManager] Enregistré: ${bytes} bytes pour ${service}`);
    } catch (e) {
      console.warn('[P2PDailyLimitManager] Erreur enregistrement:', e.message);
    }
  }

  /**
   * Reset les compteurs (appelé automatiquement chaque jour)
   */
  async cleanup() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    try {
      const table = database.get('p2p_daily_shares');
      const oldRecords = await table.query(
        Q.where('date', Q.lt(yesterdayStr))
      ).fetch();

      if (oldRecords.length > 0) {
        await database.write(async () => {
          for (const record of oldRecords) {
            await record.destroyPermanently();
          }
        });
        console.log(`[P2PDailyLimitManager] Nettoyage: ${oldRecords.length} vieux records supprimés`);
      }
    } catch (e) {
      console.warn('[P2PDailyLimitManager] Erreur cleanup:', e.message);
    }
  }
}

export const P2PDailyLimitManager = new P2PDailyLimitManagerClass();