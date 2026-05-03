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
  requestConnection,
  disconnect
} from 'expo-nearby-connections';
import * as FileSystem from 'expo-file-system/legacy';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import { GlobalManifestService } from './GlobalManifestService';
import { DailyQuotaService } from './DailyQuotaService';
import { NetworkPermissionsService } from './NetworkPermissionsService';
import { NetworkRailDetector } from './NetworkRailDetector';

console.log('[NearbyMeshService] Module chargé dans le bundle.');

const SERVICE_ID = 'com.benksidney.yabisso.mesh';

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
export const MeshLogEvents = new SimpleEventEmitter();
export const MeshRequestEvents = new SimpleEventEmitter();

class NearbyMeshServiceClass {
  constructor() {
    this.connectedPeers = new Set();
    this.isAdvertising = false;
    this.isDiscovering = false;
    this.deviceName = null; 
    this._listeners = [];
    
    this.MeshLogEvents = MeshLogEvents;
    this.MeshConnectionEvents = MeshConnectionEvents;
    this.MeshRequestEvents = MeshRequestEvents;
  }

  _log(msg) {
    console.log(`[NearbyMesh] ${msg}`);
    MeshLogEvents.emit(msg);
  }

  async startMesh() {
    if (this.isAdvertising || this.isDiscovering) {
      this._log('Mesh déjà actif (skip start).');
      return;
    }

    try {
      this._log('--- DÉMARRAGE NEARBY MESH ---');
      this._log('Vérification du module natif...');
      this._log('Demande des permissions...');
      const hasPerms = await NetworkPermissionsService.requestAll();
      if (!hasPerms) {
        this._log('⚠️ Permissions refusées.');
        return;
      }
      
      this._log('Initialisation Quota...');
      await DailyQuotaService.initialize();
      
      this._log('Configuration des Listeners...');
      this._setupListeners();

      // Générer un nom unique pour cette session
      this.deviceName = `Yabisso_${Math.random().toString(36).substring(2, 7)}`;
      const strategy = Strategy.P2P_STAR;

      this._log(`Lancement Advertising: ${this.deviceName}...`);
      await startAdvertise(this.deviceName, strategy);
      this.isAdvertising = true;
      this._log('✅ Advertising actif.');

      this._log('Lancement Discovery...');
      await startDiscovery(this.deviceName, strategy);
      this.isDiscovering = true;
      this._log('✅ Discovery actif.');

      NetworkRailDetector.setBleAvailable(true);
      this._log('🚀 Mesh prêt et visible dans le réseau.');

    } catch (e) {
      this._log(`❌ ÉCHEC CRITIQUE: ${e.message}`);
      this.isAdvertising = false;
      this.isDiscovering = false;
    }
  }

  _setupListeners() {
    this._listeners.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
    this._listeners = [];

    this._listeners.push(onPeerFound((peer) => {
      this._log(`🔍 Node trouvé: ${peer.name} (${peer.peerId})`);
      
      // Handshake déterministe pour éviter les collisions de requestConnection
      if (this.deviceName && this.deviceName < peer.name) {
        this._log(`🤝 [Master] Envoi requête de connexion vers ${peer.peerId}...`);
        requestConnection(peer.peerId).catch(err => {
          this._log(`❌ Échec requestConnection: ${err.message}`);
        });
      } else {
        this._log(`⏳ [Slave] Attente de l'invitation de ${peer.name}...`);
      }
    }));

    this._listeners.push(onPeerLost(({ peerId }) => {
      this._log(`👻 Node perdu: ${peerId}`);
      this.connectedPeers.delete(peerId);
      this._updateState();
    }));

    this._listeners.push(onInvitationReceived((peer) => {
      this._log(`🤝 Invitation reçue de: ${peer.name} (${peer.peerId})`);
      this._log(`✅ Acceptation de la connexion...`);
      acceptConnection(peer.peerId).catch(err => {
        this._log(`❌ Échec acceptConnection: ${err.message}`);
      });
    }));

    this._listeners.push(onConnected((peer) => {
      this._log(`✨ CONNECTÉ à: ${peer.name} (${peer.peerId})`);
      this.connectedPeers.add(peer.peerId);
      this._updateState();
      this._sendManifest(peer.peerId);
    }));

    this._listeners.push(onDisconnected(({ peerId }) => {
      this._log(`🔌 Déconnecté de: ${peerId}`);
      this.connectedPeers.delete(peerId);
      this._updateState();
    }));

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
      this._log('Arrêt du Mesh...');
      await stopAdvertise();
      await stopDiscovery();
      this._listeners.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
      this._listeners = [];
      this.connectedPeers.clear();
      this.isAdvertising = false;
      this.isDiscovering = false;
      this._updateState();
      NetworkRailDetector.setBleAvailable(false);
      this._log('Mesh arrêté.');
    } catch (e) {
      this._log(`Erreur arrêt: ${e.message}`);
    }
  }

  async _sendManifest(peerId) {
    try {
      const manifest = await GlobalManifestService.generateGlobalManifest();
      if (!manifest) return;
      const payload = JSON.stringify({ type: 'global_manifest', manifest });
      await sendText(peerId, payload);
      this._log(`📤 Manifeste envoyé (${manifest.loba?.length || 0} items)`);
    } catch (e) {
      this._log(`⚠️ Échec envoi manifeste: ${e.message}`);
    }
  }

  async _handleDataReceived(peerId, text) {
    try {
      const data = JSON.parse(text);
      if (data.type === 'global_manifest') {
        this._handleGlobalManifestReceived(peerId, data.manifest);
      } else if (data.type === 'validation_request') {
        this._log(`📩 Requête de validation reçue de ${peerId}`);
        MeshRequestEvents.emit({ peerId, request: data.payload });
      }
    } catch (e) { }
  }

  async _handleGlobalManifestReceived(peerId, remoteManifest) {
    // Logique de synchronisation ici
    this._log(`📥 Manifeste reçu de ${peerId}.`);
  }

  async sendValidationRequest(payload) {
    try {
      const data = JSON.stringify({ type: 'validation_request', payload });
      for (const peerId of this.connectedPeers) {
        await sendText(peerId, data);
      }
      this._log('📤 Requête de validation envoyée aux nodes à proximité.');
      return true;
    } catch (e) {
      this._log(`❌ Échec envoi requête: ${e.message}`);
      return false;
    }
  }
}

export const NearbyMeshService = new NearbyMeshServiceClass();
