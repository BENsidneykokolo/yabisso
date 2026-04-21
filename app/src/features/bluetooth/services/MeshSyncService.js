// app/src/features/bluetooth/services/MeshSyncService.js
import { BleManager, State } from 'react-native-ble-plx';
import * as FileSystem from 'expo-file-system/legacy';
import { encode as btoa, decode as atob } from 'base-64';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import { NetworkRailDetector } from './NetworkRailDetector';
import { NetworkPermissionsService } from './NetworkPermissionsService';
import { ManifestService } from '../../loba/services/ManifestService';
import { RecommendationEngine } from '../../loba/services/RecommendationEngine';
import { TransferQueueManager } from '../../loba/services/TransferQueueManager';
import { LocalStorageManager } from '../../loba/services/LocalStorageManager';

// UUIDs Yabisso Mesh
const YABISSO_MESH_SERVICE_UUID = '12345678-1234-1234-1234-123456780001';
const MANIFEST_CHAR_UUID        = '12345678-1234-1234-1234-123456780002';
const DATA_CHAR_UUID            = '12345678-1234-1234-1234-123456780003';
const ACK_CHAR_UUID             = '12345678-1234-1234-1234-123456780004';

const BLE_CHUNK_SIZE = 512; // bytes par chunk BLE
const MAX_BLE_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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

/**
 * MeshSyncService (V2 — Vrai BLE)
 * Gère la synchronisation P2P via Bluetooth Low Energy.
 * - Advertising : s'annonce comme nœud Yabisso
 * - Scanning : cherche les voisins Yabisso
 * - Manifest Exchange : échange de manifestes pour déduplication
 * - Chunked Transfer : transfert de fichiers ≤ 5 MB par chunks BLE
 * - 1-Hop Relay : repartage automatique aux voisins
 */

class MeshSyncServiceClass {
  constructor() {
    this.bleManager = null;
    this.discoveredPeers = new Map(); // deviceId -> { device, lastSeen }
    this.connectedPeers = new Map(); // deviceId -> device
    this.seenHashes = new Set(); // Anti-boucle de relay
    this.isScanning = false;
    this.scanSubscription = null;
    this._incomingChunks = new Map(); // hash -> { chunks: [], totalSize, received }
  }

  /**
   * Initialise le BleManager avec permissions.
   */
  async initialize() {
    if (this.bleManager) return;

    // 1. Demander les permissions Android
    try {
      const hasPermission = await NetworkPermissionsService.requestAll();
      if (!hasPermission) {
        console.error('[MeshSync] Permissions réseau refusées.');
        return;
      }
    } catch (err) {
      console.warn('[MeshSync] Erreur lors de la demande de permissions:', err);
    }

    this.bleManager = new BleManager();

    // Attendre que le BLE soit allumé
    const state = await this.bleManager.state();
    if (state !== State.PoweredOn) {
      console.warn('[MeshSync] BLE non allumé. En attente...');
      return new Promise((resolve) => {
        const sub = this.bleManager.onStateChange((newState) => {
          if (newState === State.PoweredOn) {
            sub.remove();
            console.log('[MeshSync] BLE allumé.');
            resolve();
          }
        }, true);
      });
    }
  }

  async startMeshScanning() {
    if (this.isScanning) return;
    await this.initialize();
    if (!this.bleManager) return;

    // S'assurer qu'aucun scan natif n'est déjà actif avant d'en démarrer un
    try { this.bleManager.stopDeviceScan(); } catch (_) {}

    // Anti-boucle: limiter les retries
    this._scanRetryCount = this._scanRetryCount || 0;
    if (this._scanRetryCount >= 3) {
      console.warn('[MeshSync] Scan BLE: trop de tentatives échouées. Abandon (réessayer manuellement).');
      this._scanRetryCount = 0;
      return;
    }

    this.isScanning = true;
    console.log('[MeshSync] Démarrage du scan Mesh BLE...');

    this.bleManager.startDeviceScan(
      [YABISSO_MESH_SERVICE_UUID],
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.warn('[MeshSync] Erreur scan:', error.message);
          this.isScanning = false;
          this._scanRetryCount = (this._scanRetryCount || 0) + 1;
          // Retry avec backoff exponentiel (5s, 10s, 15s) puis stop
          if (this._scanRetryCount < 3) {
            const delay = this._scanRetryCount * 5000;
            console.log(`[MeshSync] Retry scan dans ${delay/1000}s (tentative ${this._scanRetryCount}/3)...`);
            setTimeout(() => this.startMeshScanning(), delay);
          } else {
            console.warn('[MeshSync] Scan BLE abandonné après 3 tentatives.');
          }
          return;
        }
        // Reset le compteur de retry si le scan fonctionne
        this._scanRetryCount = 0;
        if (!device) return;

        const peerId = device.id;
        if (!this.discoveredPeers.has(peerId)) {
          console.log(`[MeshSync] Nouveau voisin détecté: ${device.name || peerId}`);
          this.discoveredPeers.set(peerId, { device, lastSeen: Date.now() });
          meshConnectionState.peerCount = this.discoveredPeers.size;
          meshConnectionState.isConnected = this.discoveredPeers.size > 0;
          MeshConnectionEvents.emit({ ...meshConnectionState });
          NetworkRailDetector.setBleAvailable(true);
          this.onPeerDetected(peerId, device);
        } else {
          this.discoveredPeers.get(peerId).lastSeen = Date.now();
        }
      }
    );

    this._cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [peerId, peerData] of this.discoveredPeers) {
        if (now - peerData.lastSeen > 60000) {
          this.discoveredPeers.delete(peerId);
          this.connectedPeers.delete(peerId);
        }
      }
      meshConnectionState.peerCount = this.discoveredPeers.size;
      meshConnectionState.isConnected = this.discoveredPeers.size > 0;
      if (!meshConnectionState.isConnected) NetworkRailDetector.setBleAvailable(false);
      MeshConnectionEvents.emit({ ...meshConnectionState });
    }, 30000);
  }

  stopMeshScanning() {
    if (this.bleManager && this.isScanning) {
      this.bleManager.stopDeviceScan();
      this.isScanning = false;
      if (this._cleanupInterval) clearInterval(this._cleanupInterval);
    }
  }

  async onPeerDetected(peerId, device) {
    try {
      const connected = await device.connect({ autoConnect: false, timeout: 10000 });
      const discovered = await connected.discoverAllServicesAndCharacteristics();
      this.connectedPeers.set(peerId, discovered);

      const myManifest = await ManifestService.generateManifest();
      if (myManifest) {
        const manifestJson = JSON.stringify(myManifest);
        const chunks = this._chunkString(manifestJson);
        for (const chunk of chunks) {
          await discovered.writeCharacteristicWithResponseForService(YABISSO_MESH_SERVICE_UUID, MANIFEST_CHAR_UUID, btoa(chunk));
        }
        await discovered.writeCharacteristicWithResponseForService(YABISSO_MESH_SERVICE_UUID, MANIFEST_CHAR_UUID, btoa('__MANIFEST_END__'));
      }

      const manifestChunks = [];
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 15000);
        discovered.monitorCharacteristicForService(YABISSO_MESH_SERVICE_UUID, MANIFEST_CHAR_UUID, (error, char) => {
          if (error) { clearTimeout(timeout); resolve(); return; }
          const decoded = atob(char.value);
          if (decoded === '__MANIFEST_END__') { clearTimeout(timeout); resolve(); }
          else manifestChunks.push(decoded);
        });
      });

      if (manifestChunks.length > 0) {
        const remoteManifest = JSON.parse(manifestChunks.join(''));
        await this.handleManifestReceived(peerId, remoteManifest);
      }
    } catch (e) {
      console.error(`[MeshSync] Erreur échange manifest avec ${peerId}:`, e.message);
      this.connectedPeers.delete(peerId);
    }
  }

  async handleManifestReceived(peerId, remoteManifest) {
    const delta = await ManifestService.calculateDelta(remoteManifest);
    if (delta.length === 0) return;

    const localInterests = remoteManifest.interests || {};
    const prioritized = RecommendationEngine.filterAndPrioritize(delta, localInterests);
    const bleCompatible = prioritized.filter(item => item.size <= MAX_BLE_FILE_SIZE);

    await database.write(async () => {
      for (const item of bleCompatible) {
        const existing = await database.get('loba_posts').query(Q.where('hash', item.hash)).fetch();
        if (existing.length === 0) {
          await database.get('loba_posts').create(post => {
            post.hash = item.hash;
            post.size = item.size;
            post.category = item.category;
            post.localMediaPath = null;
            post.username = item.username || 'Mesh User';
            post.avatar = item.avatar || null;
            post.content = item.content || '';
            post.isPropagating = false;
            post.imageUrl = item.type === 'image' ? `yabisso_mesh://${item.hash}` : null;
            post.videoUrl = item.type === 'video' ? `yabisso_mesh://${item.hash}` : null;
            post.likes = 0;
            post.comments = 0;
            post.isLiked = false;
          });
        }
      }
    });
    await this.downloadFromPeer(peerId, bleCompatible);
  }

  async downloadFromPeer(peerId, items) {
    const peer = this.connectedPeers.get(peerId);
    if (!peer) return;

    for (const item of items) {
      if (this.seenHashes.has(item.hash)) continue;
      try {
        await peer.writeCharacteristicWithResponseForService(YABISSO_MESH_SERVICE_UUID, DATA_CHAR_UUID, btoa(JSON.stringify({ action: 'REQUEST_FILE', hash: item.hash })));
        const fileChunks = [];
        await new Promise((resolve) => {
          const timeout = setTimeout(resolve, 30000);
          peer.monitorCharacteristicForService(YABISSO_MESH_SERVICE_UUID, DATA_CHAR_UUID, (error, char) => {
            if (error) { clearTimeout(timeout); resolve(); return; }
            const decoded = atob(char.value);
            if (decoded === '__FILE_END__') { clearTimeout(timeout); resolve(); }
            else fileChunks.push(decoded);
          });
        });

        if (fileChunks.length > 0) {
          const fileContent = fileChunks.join('');
          const ext = item.type === 'video' ? 'mp4' : 'jpg';
          const tempPath = `${FileSystem.cacheDirectory}${item.hash}.${ext}`;
          await FileSystem.writeAsStringAsync(tempPath, fileContent, { encoding: FileSystem.EncodingType.Base64 });
          const savedPath = await LocalStorageManager.saveMedia(tempPath, item.hash, ext);
          if (savedPath) {
            await TransferQueueManager.markComplete(item.hash, savedPath);
            this.seenHashes.add(item.hash);
            this.relayToNeighbors(item.hash, fileContent, peerId);
          }
        }
      } catch (e) { console.error(`[MeshSync] Erreur téléchargement ${item.hash}:`, e.message); }
    }
  }

  async relayToNeighbors(hash, data, sourcePeerId) {
    if (this.seenHashes.has(`relay_${hash}`)) return;
    this.seenHashes.add(`relay_${hash}`);
    for (const [peerId, peer] of this.connectedPeers) {
      if (peerId === sourcePeerId) continue;
      try {
        const chunks = this._chunkString(data);
        for (const chunk of chunks) await peer.writeCharacteristicWithResponseForService(YABISSO_MESH_SERVICE_UUID, DATA_CHAR_UUID, btoa(chunk));
        await peer.writeCharacteristicWithResponseForService(YABISSO_MESH_SERVICE_UUID, DATA_CHAR_UUID, btoa('__FILE_END__'));
      } catch (e) { console.warn(`[MeshSync] Relay échoué vers ${peerId}:`, e.message); }
    }
  }

  isBroadcastAllowed(type) {
    if (MESH_POLICY.PRIVATE.includes(type)) return false;
    return MESH_POLICY.PUBLIC.includes(type) || type.startsWith('SOCIAL_');
  }

  async broadcast(type, payload, fileUri) {
    if (!this.isBroadcastAllowed(type)) return { success: false, reason: 'POLICY_RESTRICTION' };
    try {
      let localPath = null;
      if (fileUri && fileUri.startsWith('file://')) {
        const hash = await LocalStorageManager.hashFile(fileUri);
        const ext = fileUri.includes('.mp4') || payload.videoUrl ? 'mp4' : 'jpg';
        localPath = await LocalStorageManager.saveMedia(fileUri, hash, ext);
      }
      let sent = false;
      for (const [peerId, peer] of this.connectedPeers) {
        try {
          const chunks = this._chunkString(JSON.stringify(payload));
          for (const chunk of chunks) await peer.writeCharacteristicWithResponseForService(YABISSO_MESH_SERVICE_UUID, MANIFEST_CHAR_UUID, btoa(chunk));
          await peer.writeCharacteristicWithResponseForService(YABISSO_MESH_SERVICE_UUID, MANIFEST_CHAR_UUID, btoa('__MANIFEST_END__'));
          sent = true;
        } catch (e) { console.warn(`[MeshSync] Broadcast vers ${peerId} échoué:`, e.message); }
      }
      return { success: sent || localPath !== null, url: localPath };
    } catch (e) { return { success: false, error: e.message }; }
  }

  async getOptimalChannel(fileUri) {
    try {
      if (!fileUri) return MESH_CHANNEL.BLE;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      return (fileInfo.exists && fileInfo.size / (1024 * 1024) <= 5) ? MESH_CHANNEL.BLE : MESH_CHANNEL.WIFI;
    } catch (e) { return MESH_CHANNEL.BLE; }
  }

  _chunkString(str) {
    const chunks = [];
    for (let i = 0; i < str.length; i += BLE_CHUNK_SIZE) chunks.push(str.slice(i, i + BLE_CHUNK_SIZE));
    return chunks;
  }

  cleanup() {
    this.stopMeshScanning();
    for (const [_, peer] of this.connectedPeers) { try { peer.cancelConnection(); } catch (e) {} }
    this.connectedPeers.clear();
    this.discoveredPeers.clear();
    this.seenHashes.clear();
    if (this.bleManager) { this.bleManager.destroy(); this.bleManager = null; }
  }
}

export const MeshSyncService = new MeshSyncServiceClass();
