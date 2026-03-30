// app/src/lib/services/GlobalStorageService.js
import * as FileSystem from 'expo-file-system/legacy';
import { database } from '../db';
import { Q } from '@nozbe/watermelondb';

const BASE_DIR = FileSystem.documentDirectory;

/**
 * GlobalStorageService
 * Service centralisé de gestion du stockage pour toute l'application Yabisso.
 * Scanne tous les dossiers média par service et fournit des statistiques globales.
 */

// Définition des catégories de stockage par service (alignées sur HomeScreen)
const STORAGE_CATEGORIES = [
  {
    key: 'loba',
    label: 'Loba (Social)',
    icon: 'play-circle',
    color: '#F472B6',
    dir: `${BASE_DIR}loba_media/`,
    clearable: true,
  },
  {
    key: 'marketplace',
    label: 'Marketplace',
    icon: 'storefront-outline',
    color: '#FFD166',
    dir: `${BASE_DIR}marketplace_media/`,
    clearable: true,
  },
  {
    key: 'restaurant',
    label: 'Restauration',
    icon: 'silverware-fork-knife',
    color: '#FF6B6B',
    dir: `${BASE_DIR}restaurant_media/`,
    clearable: true,
  },
  {
    key: 'hotel',
    label: 'Hôtels',
    icon: 'bed-queen',
    color: '#60A5FA',
    dir: `${BASE_DIR}hotel_media/`,
    clearable: true,
  },
  {
    key: 'transport',
    label: 'Taxi & Transport',
    icon: 'taxi',
    color: '#2BEE79',
    dir: `${BASE_DIR}transport_media/`,
    clearable: true,
  },
  {
    key: 'realestate',
    label: 'Immobilier',
    icon: 'home-city',
    color: '#C084FC',
    dir: `${BASE_DIR}realestate_media/`,
    clearable: true,
  },
  {
    key: 'media',
    label: 'Musique & Vidéo',
    icon: 'headphones',
    color: '#F472B6',
    dir: `${BASE_DIR}media_cache/`,
    clearable: true,
  },
  {
    key: 'travel',
    label: 'Vols & Voyages',
    icon: 'airplane',
    color: '#38BDF8',
    dir: `${BASE_DIR}travel_cache/`,
    clearable: true,
  },
  {
    key: 'betting',
    label: 'Paris & Jeux',
    icon: 'dice-5',
    color: '#34D399',
    dir: `${BASE_DIR}betting_cache/`,
    clearable: true,
  },
  {
    key: 'education',
    label: 'Formation & Pro',
    icon: 'school',
    color: '#FB923C',
    dir: `${BASE_DIR}edu_cache/`,
    clearable: true,
  },
  {
    key: 'chat',
    label: 'Chat & Messages',
    icon: 'chatbubble-ellipses-outline',
    color: '#2BEE79',
    dir: `${BASE_DIR}chat_cache/`,
    clearable: true,
  },
  {
    key: 'pharmacy',
    label: 'Pharmacie',
    icon: 'medical-bag',
    color: '#EF4444',
    dir: `${BASE_DIR}pharmacy_cache/`,
    clearable: true,
  },
  {
    key: 'service_perso',
    label: 'Service Personnel',
    icon: 'account-wrench-outline',
    color: '#60A5FA',
    dir: `${BASE_DIR}service_perso_cache/`,
    clearable: true,
  },
  {
    key: 'service_pro',
    label: 'Service Professionnel',
    icon: 'briefcase-check-outline',
    color: '#FB923C',
    dir: `${BASE_DIR}service_pro_cache/`,
    clearable: true,
  },
  {
    key: 'service_digital',
    label: 'Service Digital',
    icon: 'laptop-mac',
    color: '#38BDF8',
    dir: `${BASE_DIR}service_digital_cache/`,
    clearable: true,
  },
  {
    key: 'service_maison',
    label: 'Service Maison',
    icon: 'home-heart',
    color: '#F472B6',
    dir: `${BASE_DIR}service_maison_cache/`,
    clearable: true,
  },
  {
    key: 'info_perso',
    label: 'Info Personnel',
    icon: 'card-account-details-outline',
    color: '#94A3B8',
    dir: `${BASE_DIR}info_perso_cache/`,
    clearable: true,
  },
  {
    key: 'dating',
    label: 'Dating (Rencontres)',
    icon: 'cards-heart',
    color: '#F472B6',
    dir: `${BASE_DIR}dating_cache/`,
    clearable: true,
  },
  {
    key: 'ai',
    label: 'Assistant IA',
    icon: 'robot',
    color: '#A78BFA',
    dir: `${BASE_DIR}ai_cache/`,
    clearable: true,
  },
  {
    key: 'tools',
    label: 'Outils (Wallet, Notes)',
    icon: 'wallet',
    color: '#FBBF24',
    dir: `${BASE_DIR}tools_cache/`,
    clearable: true,
  },
  {
    key: 'mesh',
    label: 'Mesh & Système',
    icon: 'bluetooth',
    color: '#38BDF8',
    dir: `${BASE_DIR}mesh_cache/`,
    clearable: true,
  },
  {
    key: 'database',
    label: 'Base de données',
    icon: 'database',
    color: '#94A3B8',
    dir: null,
    clearable: false,
  },
];

export const GlobalStorageService = {
  /**
   * Retourne la liste des catégories avec leurs tailles.
   */
  async getStorageBreakdown() {
    const results = [];

    for (const cat of STORAGE_CATEGORIES) {
      let sizeBytes = 0;
      let fileCount = 0;

      if (cat.dir) {
        try {
          const dirInfo = await FileSystem.getInfoAsync(cat.dir);
          if (dirInfo.exists) {
            const files = await FileSystem.readDirectoryAsync(cat.dir);
            fileCount = files.length;
            for (const file of files) {
              try {
                const fileInfo = await FileSystem.getInfoAsync(`${cat.dir}${file}`);
                if (fileInfo.exists && fileInfo.size) {
                  sizeBytes += fileInfo.size;
                }
              } catch (_) {
                // skip unreadable files
              }
            }
          }
        } catch (_) {
          // Directory doesn't exist yet — size = 0
        }
      } else if (cat.key === 'database') {
        // Estimation basée sur le nombre d'enregistrements
        try {
          const tables = ['profiles', 'sync_queue', 'products', 'loba_posts', 'wallet_transactions', 'assistant_messages', 'loba_friends', 'user_interests'];
          for (const table of tables) {
            try {
              const count = await database.get(table).query().fetchCount();
              sizeBytes += count * 512; // ~512 bytes par enregistrement estimé
              fileCount += count;
            } catch (_) {}
          }
        } catch (_) {}
      }

      results.push({
        ...cat,
        sizeBytes,
        fileCount,
        sizeFormatted: formatSize(sizeBytes),
      });
    }

    return results;
  },

  /**
   * Retourne le total global de stockage utilisé.
   */
  async getTotalUsage() {
    const breakdown = await this.getStorageBreakdown();
    const total = breakdown.reduce((sum, cat) => sum + cat.sizeBytes, 0);
    return {
      totalBytes: total,
      totalFormatted: formatSize(total),
      categories: breakdown,
    };
  },

  /**
   * Vide le cache d'une catégorie spécifique.
   * @param {string} categoryKey
   */
  async clearCategory(categoryKey) {
    const cat = STORAGE_CATEGORIES.find(c => c.key === categoryKey);
    if (!cat || !cat.clearable || !cat.dir) {
      return { success: false, error: 'Category not clearable' };
    }

    try {
      const dirInfo = await FileSystem.getInfoAsync(cat.dir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(cat.dir, { idempotent: true });
        await FileSystem.makeDirectoryAsync(cat.dir, { intermediates: true });
      }

      // Si c'est Loba, on nettoie aussi les localMediaPath en base
      if (categoryKey === 'loba') {
        await database.write(async () => {
          const posts = await database.get('loba_posts')
            .query(Q.where('local_media_path', Q.notEq(null)))
            .fetch();
          for (const post of posts) {
            await post.update(p => {
              p.localMediaPath = null;
              p.downloadedAt = null;
            });
          }
        });
      }

      console.log(`[GlobalStorageService] Cache ${categoryKey} vidé.`);
      return { success: true };
    } catch (e) {
      console.error(`[GlobalStorageService] Erreur nettoyage ${categoryKey}:`, e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Vide tout le cache de l'application (sauf la base de données).
   */
  async clearAllCache() {
    const clearable = STORAGE_CATEGORIES.filter(c => c.clearable);
    const results = [];
    for (const cat of clearable) {
      const result = await this.clearCategory(cat.key);
      results.push({ key: cat.key, ...result });
    }
    return results;
  },

  /**
   * Retourne la limite de stockage recommandée (2 GB).
   */
  getStorageLimit() {
    return {
      limitBytes: 2 * 1024 * 1024 * 1024,
      limitFormatted: '2 GB',
    };
  },
};

/**
 * Formats bytes to a human-readable string.
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${value} ${units[i]}`;
}
