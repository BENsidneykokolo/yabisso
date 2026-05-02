// app/src/features/bluetooth/services/NearbyMeshService.js
import { 
  startAdvertise, 
  stopAdvertise, 
  startDiscovery, 
  stopDiscovery, 
  Strategy, 
  onPeerFound, 
  onPeerLost,
  onInvitationReceived,
  onConnected,
  onDisconnected,
  onTextReceived,
  sendText,
  acceptConnection,
  disconnect
} from 'expo-nearby-connections';
import * as FileSystem from 'expo-file-system';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import { GlobalManifestService } from './GlobalManifestService';
import { DailyQuotaService } from './DailyQuotaService';
import { NetworkPermissionsService } from './NetworkPermissionsService';
import { LocalStorageManager } from '../../loba/services/LocalStorageManager';

const SERVICE_ID = 'com.benksidney.yabisso.mesh';

// Pour la compatibilité avec le hook useMeshConnection.js
class SimpleEventEmitter {
  constructor() { this.listeners = []; }
  subscribe(callback) {
    this.listeners.push(callback);
    return () => { this.listeners = this.listeners.filter(cb => cb !== callback); };
  }
  emit(data) { this.listeners.forEach(cb => cb(data)); }
}

export const meshConnectionState = { isConnected: false, peerCount: 0, peers: [] };
export const MeshConnectionEvents = new SimpleEventEmitter();

class NearbyMeshServiceClass {
  constructor() {
    this.connectedPeers = new Set();
    this.isAdvertising = false;
    this.isDiscovering = false;
    this._listeners = [];
  }

  /**
   * Démarre le Mesh avec vérification des permissions.
   */
  async startMesh() {
    if (this.isAdvertising || this.isDiscovering) return;

    try {
      const hasPerms = await NetworkPermissionsService.requestAll();
      if (!hasPerms) {
        console.warn('[NearbyMesh] Permissions manquantes, démarrage impossible.');
        return;
      }
      
      await DailyQuotaService.initialize();

      console.log('[NearbyMesh] Initialisation du moteur Nearby Connections...');

      this._setupListeners();

      // 1. Advertising (être visible)
      await startAdvertise(
        'Yabisso_Node',
        Strategy.P2P_CLUSTER
      );
      this.isAdvertising = true;

      // 2. Discovery (chercher les autres)
      await startDiscovery(
        'Yabisso_Node', 
        Strategy.P2P_CLUSTER
      );
      this.isDiscovering = true;

      console.log('[NearbyMesh] Moteur Mesh démarré avec succès.');
    } catch (e) {
      console.error('[NearbyMesh] Échec du démarrage du Mesh:', e.message);
    }
  }

  _setupListeners() {
    // Nettoyer les anciens listeners (ce sont des fonctions de désabonnement)
    this._listeners.forEach(unsub => {
      if (typeof unsub === 'function') unsub();
    });
    this._listeners = [];

    // Découverte d'un pair
    this._listeners.push(onPeerFound((peer) => {
      console.log(`[NearbyMesh] Node détecté : ${peer.name} (${peer.peerId})`);
      // Auto-accept pour le mesh
      acceptConnection(peer.peerId).catch(err => console.warn('[NearbyMesh] acceptConnection failed:', err));
    }));

    // Perte d'un pair
    this._listeners.push(onPeerLost(({ peerId }) => {
      console.log(`[NearbyMesh] Node perdu : ${peerId}`);
      this.connectedPeers.delete(peerId);
      this._updateState();
    }));

    // Invitations
    this._listeners.push(onInvitationReceived((peer) => {
      console.log(`[NearbyMesh] Invitation reçue : ${peer.name}`);
      acceptConnection(peer.peerId).catch(err => console.warn('[NearbyMesh] acceptConnection failed:', err));
    }));

    // Connexions établies
    this._listeners.push(onConnected((peer) => {
      console.log(`[NearbyMesh] Connecté à : ${peer.name} (${peer.peerId})`);
      this.connectedPeers.add(peer.peerId);
      this._updateState();
      
      // Envoyer notre manifeste
      this._sendManifest(peer.peerId);
    }));

    // Déconnexions
    this._listeners.push(onDisconnected(({ peerId }) => {
      console.log(`[NearbyMesh] Déconnecté : ${peerId}`);
      this.connectedPeers.delete(peerId);
      this._updateState();
    }));

    // Réception de données (Manifestes)
    this._listeners.push(onTextReceived(({ peerId, text }) => {
      this._handleDataReceived(peerId, text);
    }));
  }

  _updateState() {
    meshConnectionState.isConnected = this.connectedPeers.size > 0;
    meshConnectionState.peerCount = this.connectedPeers.size;
    meshConnectionState.peers = Array.from(this.connectedPeers);
    MeshConnectionEvents.emit({ ...meshConnectionState });
  }

  async stopMesh() {
    try {
      await stopAdvertise();
      await stopDiscovery();
      this._listeners.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
      this._listeners = [];
      this.connectedPeers.clear();
      this.isAdvertising = false;
      this.isDiscovering = false;
      this._updateState();
      console.log('[NearbyMesh] Mesh arrêté.');
    } catch (e) {
      console.error('[NearbyMesh] Erreur arrêt mesh:', e.message);
    }
  }

  async _sendManifest(peerId) {
    try {
      const manifest = await GlobalManifestService.generateGlobalManifest();
      if (!manifest) return;

      const payload = JSON.stringify({
        type: 'global_manifest',
        manifest
      });

      await sendText(peerId, payload);
      console.log(`[NearbyMesh] Manifeste Global envoyé à ${peerId}`);
    } catch (e) {
      console.warn(`[NearbyMesh] Échec envoi manifeste à ${peerId}:`, e.message);
    }
  }

  async _handleDataReceived(peerId, text) {
    try {
      const data = JSON.parse(text);
      if (data.type === 'global_manifest') {
        this._handleGlobalManifestReceived(peerId, data.manifest);
      }
    } catch (e) {
      // Ignorer les messages malformés
    }
  }

  async _handleGlobalManifestReceived(peerId, manifest) {
    console.log(`[NearbyMesh] Manifeste reçu de ${peerId}`);
    const delta = await GlobalManifestService.calculateGlobalDelta(manifest);
    
    // 1. Traiter Loba Delta
    if (delta.loba && delta.loba.length > 0) {
      console.log(`[NearbyMesh] Delta Loba : ${delta.loba.length} items`);
      for (const record of delta.loba) {
        try {
          const collection = database.get('loba_posts');
          const exists = await collection.query(Q.where('hash', record.hash)).fetch();
          if (exists.length === 0) {
            await database.write(async () => {
              await collection.create(newRecord => {
                newRecord.username = record.username;
                newRecord.avatar = record.avatar;
                newRecord.content = record.content;
                newRecord.hash = record.hash;
                newRecord.size = record.size;
                newRecord.category = record.category;
                newRecord.is_validated = false;
                newRecord.created_at = Date.now();
              });
            });
          }
        } catch (err) { /* ignore */ }
      }
    }

    // 2. Traiter Produits Delta (Marché)
    if (delta.products && delta.products.length > 0) {
      console.log(`[NearbyMesh] Delta Produits : ${delta.products.length} items`);
      for (const record of delta.products) {
        try {
          const collection = database.get('products');
          const exists = await collection.query(Q.where('id', record.hash)).fetch();
          if (exists.length === 0) {
            await database.write(async () => {
              await collection.create(newProd => {
                // record._raw contient les données brutes sérialisées
                newProd._raw = { ...newProd._raw, ...record._raw, id: record.hash };
              });
            });
          }
        } catch (err) { /* ignore */ }
      }
    }
  }
}

export const NearbyMeshService = new NearbyMeshServiceClass();
