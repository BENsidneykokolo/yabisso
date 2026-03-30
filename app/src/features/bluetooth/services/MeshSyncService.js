// app/src/features/bluetooth/services/MeshSyncService.js
import * as FileSystem from 'expo-file-system/legacy';

/**
 * MeshSyncService
 * Gère la décision de transport Mesh selon la taille du fichier.
 * BLE Mesh: <= 5MB
 * WiFi Direct: > 5MB
 */

export const MESH_CHANNEL = {
  BLE: 'BLE_MESH',
  WIFI: 'WIFI_DIRECT',
};

export const MESH_POLICY = {
  PUBLIC: ['SOCIAL_POST', 'marketplace_product', 'hotel_room', 'restaurant_dish', 'service_booking'],
  PRIVATE: ['wallet_data', 'ai_assistant_message', 'personal_note'],
};

class SimpleEventEmitter {
  constructor() {
    this.listeners = [];
  }
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
  emit(data) {
    this.listeners.forEach(cb => cb(data));
  }
}

export const meshConnectionState = {
  isConnected: false,
  peerCount: 0,
};
export const MeshConnectionEvents = new SimpleEventEmitter();


export const MeshSyncService = {
  /**
   * Lance la détection automatique des voisins Mesh en tâche de fond.
   */
  startAutoDiscovery() {
    console.log('[MeshSyncService] Démarrage AutoDiscovery en arrière-plan...');
    // Constante simulation pour connecter un voisin rapidement 
    setTimeout(() => {
      meshConnectionState.isConnected = true;
      meshConnectionState.peerCount = 1;
      MeshConnectionEvents.emit({ ...meshConnectionState });
      console.log('[MeshSyncService] Voisin Mesh simulé trouvé. Statut: Connecté.');
    }, 5000);
  },

  /**
   * Vérifie si le type de données est autorisé à la diffusion publique.
   */
  isBroadcastAllowed(type) {
    if (MESH_POLICY.PRIVATE.includes(type)) {
      console.warn(`[MeshSyncService] BLOCKED: Propagation mesh interdite pour les données privées (${type}).`);
      return false;
    }
    return MESH_POLICY.PUBLIC.includes(type) || type.startsWith('SOCIAL_');
  },

  /**
   * Diffuse un message sur le réseau Mesh.
   */
  async broadcast(type, payload, fileUri) {
    if (!this.isBroadcastAllowed(type)) {
      console.warn('[MeshSyncService] Broadcast interdit pour: ' + type);
      return { success: false, reason: 'POLICY_RESTRICTION' };
    }
    
    const channel = await this.getOptimalChannel(fileUri);
    console.log(`[MeshSyncService] Broadcasting ${type} via ${channel}`);
    
    // Simulation du délai réseau
    return new Promise(resolve => setTimeout(() => resolve({ success: true, channel }), 1500));
  },

  /**
   * Détermine le canal de propagation optimal.
   * @param {string} fileUri 
   */
  async getOptimalChannel(fileUri) {
    try {
      if (!fileUri) return MESH_CHANNEL.BLE; // Par défaut pour métadonnées seules

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) return MESH_CHANNEL.BLE;

      const sizeInMB = fileInfo.size / (1024 * 1024);
      console.log(`[MeshSyncService] Taille du média: ${sizeInMB.toFixed(2)} MB`);

      return sizeInMB <= 5 ? MESH_CHANNEL.BLE : MESH_CHANNEL.WIFI;
    } catch (e) {
      console.error('[MeshSyncService] Erreur mesure taille:', e);
      return MESH_CHANNEL.BLE;
    }
  },

  /**
   * Point d'entrée quand un voisin (peer) est détecté.
   * Déclenche l'échange de manifestes.
   */
  async onPeerDetected(peerId) {
    console.log(`[MeshSyncService] Voisin détecté: ${peerId}. Échange de manifestes...`);
    const myManifest = await ManifestService.generateManifest();
    
    // Simulation : On envoie notre manifest et on reçoit le sien
    // En prod: transport via BLE ou WiFi Direct
    this.handleManifestReceived(peerId, { /* remote manifest data */ });
  },

  /**
   * Gère la réception d'un manifeste distant.
   */
  async handleManifestReceived(peerId, remoteManifest) {
    // 1. Calcul du Delta (ce qui nous manque)
    const delta = await ManifestService.calculateDelta(remoteManifest);
    if (delta.length === 0) return;

    // 2. Filtrage par intérêts (95/5) et tri par taille ↑
    const prioritized = RecommendationEngine.filterAndPrioritize(delta, remoteManifest.interests);

    // 3. Ajout à la base locale (statut pending download)
    await database.write(async () => {
      for (const item of prioritized) {
        await database.get('loba_posts').create(post => {
          post.hash = item.hash;
          post.size = item.size;
          post.category = item.category;
          post.localMediaPath = null; // Marqueur de téléchargement en attente
          post.username = 'Utilisateur Mesh';
          post.content = 'Contenu partagé via Mesh';
        });
      }
    });

    // 4. Lancement du cycle de téléchargement
    this.downloadNext();
  },

  /**
   * Gère le téléchargement séquentiel des médias.
   */
  async downloadNext() {
    const nextItem = await TransferQueueManager.getNext();
    if (!nextItem) {
      console.log('[MeshSyncService] Tous les téléchargements terminés.');
      return;
    }

    console.log(`[MeshSyncService] Téléchargement: ${nextItem.hash} (${nextItem.size} bytes)...`);

    // Simulation de transfert binaire
    // En prod : FileSystem.downloadAsync ou transfert chunk BLE
    setTimeout(async () => {
      const localPath = await LocalStorageManager.saveMedia('temp_uri', nextItem.hash);
      if (localPath) {
        await TransferQueueManager.markComplete(nextItem.hash, localPath);
        // On passe au suivant
        this.downloadNext();
      }
    }, 2000);
  }
};
