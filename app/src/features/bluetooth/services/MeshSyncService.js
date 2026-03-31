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

import Constants from 'expo-constants';
import { database } from '../../../lib/db';

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

let relaySocket = null;

const getRelayUrls = () => {
  let ip = null;
  
  // Stratégie 1: hostUri (Apparait souvent dans Expo)
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;
  if (hostUri) {
    ip = hostUri.split(':')[0];
  }
  
  // Stratégie 2: URL de liaison directe "exp://192.168..."
  if (!ip) {
    const expUrl = Constants.experienceUrl || Constants.linkingUri;
    const match = expUrl?.match(/\/\/([0-9\.]+):/);
    if (match) {
      ip = match[1];
    }
  }

  if (ip && ip.includes('.')) {
    console.log(`[MeshSyncService] LAN Résolu: IP de l'Hôte trouvée: ${ip}`);
    return { ws: `ws://${ip}:4000`, http: `http://${ip}:4000` };
  }
  
  // Fallback 
  console.warn('[MeshSyncService] Aucune IP détectée automatiquement pour LAN. Fallback 192.168...');
  return { ws: 'ws://192.168.1.15:4000', http: 'http://192.168.1.15:4000' };
};

export const MeshSyncService = {
  /**
   * Lance la détection automatique des voisins via le Relay Server (Simulation LAN du Mesh)
   */
  startAutoDiscovery() {
    if (relaySocket) return;
    
    console.log('[MeshSyncService] Connexion au Relay Server P2P...');
    const urls = getRelayUrls();
    
    relaySocket = new WebSocket(urls.ws);

    relaySocket.onopen = () => {
      console.log('[MeshSyncService] Connecté au Mesh Local (Relay).');
      meshConnectionState.isConnected = true;
      meshConnectionState.peerCount = 1; // Arbitraire pour la démo
      MeshConnectionEvents.emit({ ...meshConnectionState });
    };

    relaySocket.onmessage = async (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.action === 'NEW_POST' && msg.payload) {
          console.log('[MeshSyncService] Réception un nouveau post P2P!', msg.payload.username);
          const p = msg.payload;
          
          await database.write(async () => {
            await database.get('loba_posts').create(post => {
              post.username = p.username;
              post.content = p.content;
              post.videoUrl = p.videoUrl;
              post.imageUrl = p.imageUrl;
              post.filterColor = p.filterColor;
              post.isLiked = false;
              post.likes = 0;
              post.comments = 0;
              post.isPropagating = false;
              post.isPropagatedLocally = true;
            });
          });
        }
      } catch (err) {
        console.error('[MeshSyncService] Erreur lors de la réception locale:', err);
      }
    };

    relaySocket.onclose = () => {
      console.log('[MeshSyncService] Déconnecté du Mesh Relay.');
      meshConnectionState.isConnected = false;
      meshConnectionState.peerCount = 0;
      MeshConnectionEvents.emit({ ...meshConnectionState });
      relaySocket = null;
      // Reconnexion auto
      setTimeout(() => this.startAutoDiscovery(), 4000);
    };
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
    
    // Téléchargement (Upload) P2P du fichier vers le Relay
    const urls = getRelayUrls();
    let finalMediaUrl = payload.videoUrl || payload.imageUrl;

    try {
      if (fileUri && fileUri.startsWith('file://')) {
        console.log(`[MeshSyncService] Upload du media vers le Relay P2P...`);
        const formData = new FormData();
        formData.append('media', {
          uri: fileUri,
          name: fileUri.split('/').pop() || 'media.mp4',
          type: type === 'photo' ? 'image/jpeg' : 'video/mp4'
        });

        const uploadRes = await fetch(`${urls.http}/upload`, {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        
        if (uploadData.url) {
          finalMediaUrl = uploadData.url;
        }
      }

      // Modifier le payload avec le bon lien Cloud/Relay
      const sentPayload = { ...payload };
      if (sentPayload.videoUrl) sentPayload.videoUrl = finalMediaUrl;
      else if (sentPayload.imageUrl) sentPayload.imageUrl = finalMediaUrl;

      // Envoi de la notification de nouveau post au réseau pour les autres
      if (relaySocket && relaySocket.readyState === WebSocket.OPEN) {
        relaySocket.send(JSON.stringify({
          action: 'NEW_POST',
          payload: sentPayload
        }));
        console.log(`[MeshSyncService] ${type} diffusé avec succès sur le Relay.`);
        return { success: true, url: finalMediaUrl };
      } else {
        return { success: false, reason: 'NOT_CONNECTED' };
      }

    } catch (e) {
      console.error('[MeshSyncService] Erreur propagation Relay:', e);
      return { success: false, error: e.message };
    }
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
