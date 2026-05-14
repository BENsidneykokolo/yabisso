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
import * as Device from 'expo-device';
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
export const MeshContentUpdateEvents = new SimpleEventEmitter();

class NearbyMeshServiceClass {
  constructor() {
    this.connectedPeers = new Set();
    this.isAdvertising = false;
    this.isDiscovering = false;
    this.deviceName = null; 
    this._listeners = [];
    this._pendingConnections = new Map();
    this._connectionMutex = false;
    this._isRunning = false;
    this._isStarting = false;
    this._failedPeers = new Set();
    this._discoveredNodes = new Map();
    this._currentRole = null;
    this._pendingMasterTimeouts = [];
    
    this.MeshLogEvents = MeshLogEvents;
    this.MeshConnectionEvents = MeshConnectionEvents;
    this.MeshRequestEvents = MeshRequestEvents;
    this.MeshContentUpdateEvents = MeshContentUpdateEvents;
  }

  _log(msg) {
    console.log(`[NearbyMesh] ${msg}`);
    MeshLogEvents.emit(msg);
  }

  // V1.0.15: Score basé sur la VRAIE RAM (1GB = 10 points)
  _getPowerScore() {
    try {
      const totalMemoryGB = (Device.totalMemory || 0) / (1024 * 1024 * 1024);
      return Math.round(totalMemoryGB * 10);
    } catch (e) {}
    return 50;
  }

  async startMesh() {
    if (this.isAdvertising || this.isDiscovering || this._isStarting) {
      this._log('Mesh déjà actif ou en démarrage (skip start).');
      return;
    }
    this._isStarting = true;

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

      // V1.0.14: On utilise le nom cohérent (avec Score) défini dans WifiDirectService
      const { WifiDirectService } = require('./WifiDirectService');
      // V1.0.15: Utilise le vrai score hardware directement
      const powerScore = this._getPowerScore();
      this.deviceName = WifiDirectService.deviceName || `${powerScore}_Yabisso_${Math.random().toString(36).substring(7)}`;
      
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
      this._isStarting = false;

    } catch (e) {
      this._log(`❌ ÉCHEC CRITIQUE: ${e.message}`);
      this.isAdvertising = false;
      this.isDiscovering = false;
      this._isStarting = false;
    }
  }

  _setupListeners() {
    this._listeners.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
    this._listeners = [];

    this._listeners.push(onPeerFound((peer) => {
      this._log(`🔍 Node trouvé: ${peer.name} (${peer.peerId})`);
      
      // V1.0.16: Extraire le score numérique pour comparaison propre
      const myScore = parseInt(this.deviceName?.split('_')[0] || '0', 10);
      const peerScore = parseInt(peer.name?.split('_')[0] || '0', 10);
      
      // Master = score le plus élevé
      if (myScore > peerScore) {
        this._log(`🤝 [Master] Envoi requête de connexion vers ${peer.peerId}...`);
        
        // Anti-spam: ne pas reconnecter si échec récent (< 30s)
        if (this._failedPeers.has(peer.peerId)) return;

        requestConnection(peer.peerId).catch(err => {
          this._log(`❌ Échec requestConnection vers ${peer.peerId}: ${err.message}`);
          this._failedPeers.add(peer.peerId);
          setTimeout(() => this._failedPeers.delete(peer.peerId), 30000);
        });
      } else {
        this._log(`⏳ [Slave] Attente de l'invitation de ${peer.name}...`);
      }
      
      // 🚀 Déclencher aussi le WiFi Direct dès qu'un node est détecté
      // Cela permet le transfert même si Nearby Mesh ne parvient pas à se connecter
      this._log(`🚀 Déclenchement WiFi Direct pour transfert P2P...`);
      const { P2PAutoSync } = require('./P2PAutoSync');
      P2PAutoSync.triggerSync(null, true);
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
    if (this._isStopping) return;
    this._isStopping = true;
    try {
      this._log('Arrêt du Mesh...');
      await stopAdvertise();
      await stopDiscovery();
      // Petit délai pour laisser le Bluetooth se libérer
      await new Promise(r => setTimeout(r, 1000));
      
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
    } finally {
      this._isStopping = false;
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
    if (!remoteManifest) return;
    this._log(`📥 Manifeste reçu de ${peerId}. Analyse des deltas...`);
    
    try {
      const delta = await GlobalManifestService.calculateGlobalDelta(remoteManifest);
      const lobaCount = delta.loba?.length || 0;
      const productCount = delta.products?.length || 0;
      
      if (lobaCount > 0 || productCount > 0) {
        this._log(`✨ Delta détecté: ${lobaCount} vidéos, ${productCount} produits. Activation WiFi Direct...`);
        
        // On importe dynamiquement pour éviter les circular dependencies
        const { P2PAutoSync } = require('./P2PAutoSync');
        P2PAutoSync.triggerSync(null, true); // force=true pour ignorer le cooldown
      } else {
        this._log('✅ Déjà à jour avec ce node.');
      }
    } catch (e) {
      this._log(`⚠️ Erreur analyse delta: ${e.message}`);
    }
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
