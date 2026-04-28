// app/src/features/kiosque/services/KiosqueService.js
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

/**
 * KiosqueService - Gère les packs compressés pour les kiosques Yabisso
 * Pack compressé illimité (jusqu'à 10GB+) pour vendre data offline
 */
class KiosqueServiceClass {
  KIOSQUE_PACK_DIR = `${FileSystem.documentDirectory}kiosque_packs/`;
  MAX_PACK_SIZE_BYTES = 10 * 1024 * 1024 * 1024; // 10GB

  /**
   * Initialise les dossiers kiosque
   */
  async initDirectories() {
    const dirInfo = await FileSystem.getInfoAsync(this.KIOSQUE_PACK_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.KIOSQUE_PACK_DIR, { intermediates: true });
      console.log('[KiosqueService] Dossier kiosque créé');
    }
  }

  /**
   * Crée un pack compressé pour un service spécifique
   */
  async createServicePack(service, options = {}) {
    await this.initDirectories();
    
    const {
      maxSizeMB = 500, // Taille par défaut 500MB
      includeMedias = true,
      includeProducts = true,
    } = options;

    console.log(`[KiosqueService] Création pack ${service} (max ${maxSizeMB}MB)...`);

    const timestamp = Date.now();
    const packDir = `${this.KIOSQUE_PACK_DIR}${service}_${timestamp}/`;
    await FileSystem.makeDirectoryAsync(packDir, { intermediates: true });

    // Collecter les données selon le service
    let items = [];
    
    if (service === 'loba') {
      items = await this._collectLobaContent(maxSizeMB);
    } else if (service === 'marketplace') {
      items = await this._collectMarketplaceContent(maxSizeMB);
    } else if (service === 'hotel') {
      items = await this._collectHotelContent(maxSizeMB);
    } else if (service === 'all') {
      items = [
        ...await this._collectLobaContent(Math.floor(maxSizeMB / 3)),
        ...await this._collectMarketplaceContent(Math.floor(maxSizeMB / 3)),
        ...await this._collectHotelContent(Math.floor(maxSizeMB / 3)),
      ];
    }

    // Créer le manifest
    const manifest = {
      service,
      createdAt: timestamp,
      items: items.length,
      totalSize: items.reduce((acc, item) => acc + (item.size || 0), 0),
      version: '1.0',
      items: items,
    };

    // Sauvegarder le manifest
    await FileSystem.writeAsStringAsync(
      `${packDir}manifest.json`,
      JSON.stringify(manifest, null, 2)
    );

    // Copier les fichiers
    for (const item of items) {
      if (item.localPath) {
        const destPath = `${packDir}${item.filename}`;
        try {
          await FileSystem.copyAsync({ from: item.localPath, to: destPath });
        } catch (e) {
          console.warn(`[KiosqueService] Erreur copie ${item.filename}:`, e.message);
        }
      }
    }

    // Créer le ZIP (simplifié - en réalité utiliser une lib de compression)
    const zipPath = `${this.KIOSQUE_PACK_DIR}${service}_pack_${timestamp}.zip`;
    
    // Note: Expo n'a pas de zip natif. Pour les gros packs, utiliser:
    // - react-native-zip-archive
    // - OU créer un fichier tar + uuc ou partager sans compression pour le P2P

    console.log(`[KiosqueService] Pack ${service} créé: ${items.length} items`);

    return {
      path: zipPath,
      manifest,
      itemsCount: items.length,
    };
  }

  /**
   * Collecte le contenu Loba (vidéos, images)
   */
  async _collectLobaContent(maxSizeMB) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    let totalSize = 0;
    const items = [];

    try {
      const posts = await database.get('loba_posts').query(
        Q.sortBy('downloadedAt', Q.desc),
        Q.take(100)
      ).fetch();

      for (const post of posts) {
        if (totalSize >= maxBytes) break;
        
        const localPath = post.localMediaPath;
        if (localPath) {
          const fileInfo = await FileSystem.getInfoAsync(localPath);
          if (fileInfo.exists && fileInfo.size) {
            items.push({
              id: post.id,
              hash: post.hash,
              filename: localPath.split('/').pop(),
              localPath,
              size: fileInfo.size,
              type: post.videoUrl ? 'video' : 'image',
              category: 'loba',
            });
            totalSize += fileInfo.size;
          }
        }
      }
    } catch (e) {
      console.warn('[KiosqueService] Erreur collecte Loba:', e.message);
    }

    return items;
  }

  /**
   * Collecte le contenu Marketplace
   */
  async _collectMarketplaceContent(maxSizeMB) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    let totalSize = 0;
    const items = [];

    try {
      const products = await database.get('products').query(
        Q.sortBy('createdAt', Q.desc),
        Q.take(100)
      ).fetch();

      for (const product of products) {
        if (totalSize >= maxBytes) break;
        
        const imagePath = product.localImagePath;
        if (imagePath) {
          const fileInfo = await FileSystem.getInfoAsync(imagePath);
          if (fileInfo.exists && fileInfo.size) {
            items.push({
              id: product.id,
              name: product.name,
              filename: imagePath.split('/').pop(),
              localPath: imagePath,
              size: fileInfo.size,
              type: 'product',
              category: 'marketplace',
            });
            totalSize += fileInfo.size;
          }
        }
      }
    } catch (e) {
      console.warn('[KiosqueService] Erreur collecte Marketplace:', e.message);
    }

    return items;
  }

  /**
   * Collecte le contenu Hôtel
   */
  async _collectHotelContent(maxSizeMB) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    let totalSize = 0;
    const items = [];

    try {
      const rooms = await database.get('hotel_rooms').query(
        Q.sortBy('createdAt', Q.desc),
        Q.take(50)
      ).fetch();

      for (const room of rooms) {
        if (totalSize >= maxBytes) break;
        
        const imagePath = room.localImagePath;
        if (imagePath) {
          const fileInfo = await FileSystem.getInfoAsync(imagePath);
          if (fileInfo.exists && fileInfo.size) {
            items.push({
              id: room.id,
              name: room.name,
              filename: imagePath.split('/').pop(),
              localPath: imagePath,
              size: fileInfo.size,
              type: 'room',
              category: 'hotel',
            });
            totalSize += fileInfo.size;
          }
        }
      }
    } catch (e) {
      console.warn('[KiosqueService] Erreur collecte Hôtel:', e.message);
    }

    return items;
  }

  /**
   * Liste les packs disponibles sur ce kiosque
   */
  async listAvailablePacks() {
    await this.initDirectories();
    
    const files = await FileSystem.readDirectoryAsync(this.KIOSQUE_PACK_DIR);
    const packs = files
      .filter(f => f.endsWith('.zip') || f.endsWith('.json'))
      .map(f => {
        const info = FileSystem.getInfoAsync(`${this.KIOSQUE_PACK_DIR}${f}`);
        return info;
      });

    return packs;
  }

  /**
   * Génère un QR code pour partager le pack
   */
  async generatePackQR(packPath) {
    // Retourne les infos pour générer un QR code
    // Le QR code contiendra le chemin du pack pour transfert rapide
    return {
      packPath,
      hash: await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        packPath
      ),
    };
  }
}

export const KiosqueService = new KiosqueServiceClass();