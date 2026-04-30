op// app/src/lib/services/YabissoStorageService.js
import { database } from '../db';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import { Q } from '@nozbe/watermelondb';

/**
 * YabissoStorageService
 * Implémente la logique de stockage définie dans yabisso_storage_logique.md
 * 
 * 3 types de tiroirs:
 * - Type 1: Public (sync cloud + P2P shareable)
 * - Type 2: Personal (sync cloud, not shareable)  
 * - Type 3: Locked (local only, never leaves device)
 */

const BASE_DIR = FileSystem.documentDirectory;

// Définition des services par type de tiroir
const STORAGE_TYPES = {
  // Type 1: Public - sync to cloud + shareable via P2P
  PUBLIC: {
    label: 'Public (Sync + P2P)',
    services: [
      { key: 'loba', label: 'Loba', dir: 'loba/', dbTable: 'loba_posts' },
      { key: 'marketplace', label: 'Marché', dir: 'marche/', dbTable: 'products' },
      { key: 'restaurant', label: 'Restauration', dir: 'restaurant/', dbTable: 'restaurants' },
      { key: 'hotel', label: 'Hôtel', dir: 'hotel/', dbTable: 'hotels' },
      { key: 'formation', label: 'Formation', dir: 'formation/', dbTable: 'courses' },
      { key: 'immobilier', label: 'Immobilier', dir: 'immobilier/', dbTable: 'properties' },
      { key: 'transport', label: 'Transport', dir: 'transport/', dbTable: 'routes' },
      { key: 'taxi', label: 'Taxi', dir: 'taxi/', dbTable: 'taxi_zones' },
      { key: 'musique', label: 'Musique', dir: 'musique/', dbTable: 'tracks' },
      { key: 'pharmacie', label: 'Pharmacie', dir: 'pharmacie/', dbTable: 'medicaments' },
      { key: 'streaming', label: 'Streaming', dir: 'streaming/', dbTable: 'videos' },
    ],
  },
  // Type 2: Personal - sync to cloud, not shareable
  PERSONAL: {
    label: 'Personnel (Sync only)',
    services: [
      { key: 'meshchat', label: 'Chat', dir: 'meshchat/', dbTable: 'conversations' },
      { key: 'rencontres', label: 'Rencontres', dir: 'rencontres/', dbTable: 'dating_profiles' },
      { key: 'reservations', label: 'Réservations', dir: 'reservations/', dbTable: 'reservations' },
    ],
  },
  // Type 3: Locked - local only, never leaves device
  LOCKED: {
    label: 'Verrouillé (Local only)',
    services: [
      { key: 'wallet', label: 'Portefeuille', dir: 'wallet/', dbTable: 'wallet_transactions' },
      { key: 'ai_chatbot', label: 'Assistant IA', dir: 'ai_chatbot/', dbTable: 'assistant_messages' },
      { key: 'profile', label: 'Profil', dir: 'profile/', dbTable: 'profiles' },
    ],
  },
};

export const YabissoStorageService = {
  /**
   * Retourne la structure complète des tiroirs
   */
  getStorageStructure() {
    return STORAGE_TYPES;
  },

  /**
   * Retourne le type de stockage d'un service
   * @param {string} serviceKey 
   */
  getServiceType(serviceKey) {
    for (const [type, data] of Object.entries(STORAGE_TYPES)) {
      if (data.services.find(s => s.key === serviceKey)) {
        return type;
      }
    }
    return null;
  },

  /**
   * Vérifie si un service est shareable en P2P
   * @param {string} serviceKey 
   */
  isServiceShareable(serviceKey) {
    return this.getServiceType(serviceKey) === 'PUBLIC';
  },

  /**
   * Vérifie si un service est sync vers cloud
   * @param {string} serviceKey 
   */
  isServiceSyncable(serviceKey) {
    const type = this.getServiceType(serviceKey);
    return type === 'PUBLIC' || type === 'PERSONAL';
  },

  /**
   * Vérifie si un service est local only (Type 3)
   * @param {string} serviceKey 
   */
  isServiceLocalOnly(serviceKey) {
    return this.getServiceType(serviceKey) === 'LOCKED';
  },

  /**
   * Initialise les dossiers de stockage pour chaque service
   */
  async initializeStorage() {
    const allServices = [
      ...STORAGE_TYPES.PUBLIC.services,
      ...STORAGE_TYPES.PERSONAL.services,
      ...STORAGE_TYPES.LOCKED.services,
    ];

    for (const service of allServices) {
      const dir = `${BASE_DIR}${service.dir}`;
      try {
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }
      } catch (e) {
        console.error(`[YabissoStorage] Erreur création dossier ${service.key}:`, e);
      }
    }
    
    console.log('[YabissoStorage] Stockage initialisé');
  },

  /**
   * Sauvegarde un fichier dans le dossier du service
   * @param {string} serviceKey - Clé du service
   * @param {string} filename - Nom du fichier
   * @param {string} content - Contenu (base64 ou URI)
   * @returns {Promise<string>} Chemin du fichier sauvegardé
   */
  async saveFile(serviceKey, filename, content) {
    const type = this.getServiceType(serviceKey);
    if (!type) {
      throw new Error(`Service ${serviceKey} non reconnu`);
    }

    const service = this.getServiceByKey(serviceKey);
    const dir = `${BASE_DIR}${service.dir}`;
    
    // Vérifier que le dossier existe
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    const filePath = `${dir}${filename}`;
    
    // Écrire le fichier
    await FileSystem.writeAsStringAsync(filePath, content, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Mettre à jour le manifest
    await this.updateManifest(serviceKey, filename, filePath);

    return filePath;
  },

  /**
   * Lit un fichier depuis le dossier du service
   * @param {string} serviceKey 
   * @param {string} filename 
   * @returns {Promise<string>} Contenu du fichier
   */
  async readFile(serviceKey, filename) {
    const service = this.getServiceByKey(serviceKey);
    const filePath = `${BASE_DIR}${service.dir}${filename}`;
    
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      throw new Error(`Fichier ${filename} non trouvé dans ${serviceKey}`);
    }

    return await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
  },

  /**
   * Supprime un fichier
   * @param {string} serviceKey 
   * @param {string} filename 
   */
  async deleteFile(serviceKey, filename) {
    const service = this.getServiceByKey(serviceKey);
    const filePath = `${BASE_DIR}${service.dir}${filename}`;
    
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
    }

    await this.removeFromManifest(serviceKey, filename);
  },

  /**
   * Retourne la liste des fichiers d'un service
   * @param {string} serviceKey 
   */
  async listFiles(serviceKey) {
    const service = this.getServiceByKey(serviceKey);
    const dir = `${BASE_DIR}${service.dir}`;
    
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      return [];
    }

    return await FileSystem.readDirectoryAsync(dir);
  },

  /**
   * Retourne la taille utilisée par un service
   * @param {string} serviceKey 
   */
  async getServiceSize(serviceKey) {
    const files = await this.listFiles(serviceKey);
    let totalSize = 0;

    for (const file of files) {
      const service = this.getServiceByKey(serviceKey);
      const filePath = `${BASE_DIR}${service.dir}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }

    return totalSize;
  },

  /**
   * Met à jour le manifest (index central)
   * @param {string} serviceKey 
   * @param {string} filename 
   * @param {string} filePath 
   */
  async updateManifest(serviceKey, filename, filePath) {
    try {
      const manifestJson = await SecureStore.getItemAsync('yabisso_manifest');
      let manifest = manifestJson ? JSON.parse(manifestJson) : {};
      
      if (!manifest[serviceKey]) {
        manifest[serviceKey] = [];
      }

      // Ajouter ou mettre à jour l'entrée
      const existingIndex = manifest[serviceKey].findIndex(f => f.filename === filename);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      const entry = {
        filename,
        path: filePath,
        size: fileInfo.size || 0,
        created_at: Date.now(),
      };

      if (existingIndex >= 0) {
        manifest[serviceKey][existingIndex] = entry;
      } else {
        manifest[serviceKey].push(entry);
      }

      await SecureStore.setItemAsync('yabisso_manifest', JSON.stringify(manifest));
    } catch (e) {
      console.error('[YabissoStorage] Erreur manifest:', e);
    }
  },

  /**
   * Retire un fichier du manifest
   * @param {string} serviceKey 
   * @param {string} filename 
   */
  async removeFromManifest(serviceKey, filename) {
    try {
      const manifestJson = await SecureStore.getItemAsync('yabisso_manifest');
      let manifest = manifestJson ? JSON.parse(manifestJson) : {};
      
      if (manifest[serviceKey]) {
        manifest[serviceKey] = manifest[serviceKey].filter(f => f.filename !== filename);
        await SecureStore.setItemAsync('yabisso_manifest', JSON.stringify(manifest));
      }
    } catch (e) {
      console.error('[YabissoStorage] Erreur remove manifest:', e);
    }
  },

  /**
   * Retourne le manifest complet
   */
  async getManifest() {
    try {
      const manifestJson = await SecureStore.getItemAsync('yabisso_manifest');
      return manifestJson ? JSON.parse(manifestJson) : {};
    } catch (e) {
      return {};
    }
  },

  /**
   * Retourne la taille totale par type de stockage
   */
  async getStorageStats() {
    const stats = {
      PUBLIC: { services: 0, size: 0 },
      PERSONAL: { services: 0, size: 0 },
      LOCKED: { services: 0, size: 0 },
    };

    for (const [type, data] of Object.entries(STORAGE)) {
      for (const service of data.services) {
        const size = await this.getServiceSize(service.key);
        stats[type].services++;
        stats[type].size += size;
      }
    }

    return stats;
  },

  /**
   * Helper: retourne le service par clé
   */
  getServiceByKey(serviceKey) {
    for (const [type, data] of Object.entries(STORAGE)) {
      const service = data.services.find(s => s.key === serviceKey);
      if (service) return service;
    }
    return null;
  },

  /**
   * Nettoie les fichiers d'un service (garder les données DB)
   * @param {string} serviceKey 
   */
  async clearServiceFiles(serviceKey) {
    const service = this.getServiceByKey(serviceKey);
    const dir = `${BASE_DIR}${service.dir}`;
    
    try {
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(dir, { idempotent: true });
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      
      // Nettoyer le manifest
      await this.removeFromManifest(serviceKey, '*');
      
      console.log(`[YabissoStorage] Fichiers ${serviceKey} effacés`);
    } catch (e) {
      console.error(`[YabissoStorage] Erreur clear ${serviceKey}:`, e);
    }
  },

  /**
   * Retourne les services qui peuvent être partagés en P2P
   */
  getShareableServices() {
    return STORAGE_TYPES.PUBLIC.services.map(s => s.key);
  },

  /**
   * Retourne les services qui sync vers le cloud
   */
  getSyncableServices() {
    return [
      ...STORAGE_TYPES.PUBLIC.services,
      ...STORAGE_TYPES.PERSONAL.services,
    ].map(s => s.key);
  },

  /**
   * Retourne les services locaux uniquement
   */
  getLocalOnlyServices() {
    return STORAGE_TYPES.LOCKED.services.map(s => s.key);
  },
};

export default YabissoStorageService;