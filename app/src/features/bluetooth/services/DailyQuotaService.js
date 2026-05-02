// app/src/features/bluetooth/services/DailyQuotaService.js
import * as FileSystem from 'expo-file-system/legacy';

const QUOTA_FILE = `${FileSystem.documentDirectory}daily_quota.json`;
const DAILY_LIMIT_BYTES = 200 * 1024 * 1024; // 200 MB

class DailyQuotaServiceClass {
  constructor() {
    this._cache = null;
  }

  async _load() {
    try {
      const info = await FileSystem.getInfoAsync(QUOTA_FILE);
      if (info.exists) {
        const content = await FileSystem.readAsStringAsync(QUOTA_FILE);
        this._cache = JSON.parse(content);
      } else {
        this._cache = this._getEmptyState();
      }
    } catch (e) {
      console.error('[DailyQuota] Erreur lecture quota:', e.message);
      this._cache = this._getEmptyState();
    }
  }

  async _save() {
    if (!this._cache) return;
    try {
      await FileSystem.writeAsStringAsync(QUOTA_FILE, JSON.stringify(this._cache));
    } catch (e) {
      console.error('[DailyQuota] Erreur sauvegarde quota:', e.message);
    }
  }

  _getEmptyState() {
    return {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      bytesUsed: 0,
      extraBytes: 0, // Bonus rechargé par Kiosk
    };
  }

  _checkNewDay() {
    const today = new Date().toISOString().split('T')[0];
    if (this._cache && this._cache.date !== today) {
      this._cache = this._getEmptyState();
      this._save();
    }
  }

  /**
   * Initialise le service.
   */
  async initialize() {
    await this._load();
    this._checkNewDay();
  }

  /**
   * Vérifie si on peut accepter un fichier de la taille spécifiée.
   * @param {number} sizeBytes 
   * @returns {boolean}
   */
  async canAcceptBytes(sizeBytes) {
    if (!this._cache) await this.initialize();
    this._checkNewDay();

    const totalAllowed = DAILY_LIMIT_BYTES + this._cache.extraBytes;
    return (this._cache.bytesUsed + sizeBytes) <= totalAllowed;
  }

  /**
   * Ajoute la taille au compteur journalier.
   * @param {number} sizeBytes 
   */
  async addBytes(sizeBytes) {
    if (!this._cache) await this.initialize();
    this._checkNewDay();

    this._cache.bytesUsed += sizeBytes;
    await this._save();
    console.log(`[DailyQuota] Quota utilisé: ${(this._cache.bytesUsed / 1024 / 1024).toFixed(2)} MB`);
  }

  /**
   * Recharge le quota (Appelé par une validation Kiosk Admin).
   * @param {number} megabytes 
   */
  async rechargeQuota(megabytes) {
    if (!this._cache) await this.initialize();
    this._checkNewDay();

    this._cache.extraBytes += (megabytes * 1024 * 1024);
    await this._save();
    console.log(`[DailyQuota] Quota rechargé de ${megabytes} MB.`);
  }

  async getStats() {
    if (!this._cache) await this.initialize();
    this._checkNewDay();
    const totalAllowed = DAILY_LIMIT_BYTES + this._cache.extraBytes;
    return {
      usedMB: (this._cache.bytesUsed / 1024 / 1024).toFixed(2),
      totalMB: (totalAllowed / 1024 / 1024).toFixed(2),
      remainingMB: ((totalAllowed - this._cache.bytesUsed) / 1024 / 1024).toFixed(2)
    };
  }
}

export const DailyQuotaService = new DailyQuotaServiceClass();
