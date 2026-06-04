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
      
      // V3.5 (BUG-057 fix): Filtrer uniquement les pairs Yabisso (regex stricte)
      // Sans ce filtre, des appareils Nearby aléatoires pourraient déclencher createGroup
      const isYabissoPeer = /^\d+_Yabisso_/i.test(peer.name || '');
      if (!isYabissoPeer) {
        this._log(`⛔ [V3.5] Peer non-Yabisso ignoré: ${peer.name}`);
        return;
      }
      
      // V1.0.16: Extraire le score numérique pour comparaison propre
      const myScore = parseInt(this.deviceName?.split('_')[0] || '0', 10);
      const peerScore = parseInt(peer.name?.split('_')[0] || '0', 10);
      
      // V1.0.17: Informer P2PAutoSync du peer Mesh pour le calcul de rôle WiFi Direct
      const isMeshMaster = myScore > peerScore;
      try {
        const { P2PAutoSync } = require('./P2PAutoSync');
        P2PAutoSync.setMeshPeer(peer.peerId, peer.name, peerScore, isMeshMaster);
      } catch (_) {}

      // V3.5 (BUG-057 fix): ÉLECTION MESH STRICTE
      // L'élection Master/Slave WiFi Direct se fait ICI, au moment exact de la découverte.
      // Plus de "createGroup proactif" dans le cycle P2PAutoSync (qui causait le double MASTER).
      // Le WiFi Direct reste TOTALEMENT PASSIF tant qu'un pair n'est pas découvert par le Mesh.
      if (myScore > peerScore) {
        this._log(`👑 [V3.5] Mesh Master détecté (${myScore} > ${peerScore}) → création du groupe WiFi Direct`);
        
        // Anti-spam: ne pas reconnecter si échec récent (< 30s)
        if (this._failedPeers.has(peer.peerId)) return;

        // V3.5: Créer le groupe WiFi Direct ICI (pas dans le cycle)
        // C'est le SEUL endroit où createGroup() est appelé en mode normal.
        const { WifiDirectService } = require('./WifiDirectService');
        WifiDirectService.createGroup().then(success => {
          if (success) {
            this._log(`✅ [V3.5] Groupe WiFi Direct créé par le Master. J'attends que le Slave se connecte...`);
          } else {
            this._log(`⚠️ [V3.5] Échec création groupe WiFi Direct`);
          }
        }).catch(e => {
          this._log(`⚠️ [V3.5] createGroup exception: ${e.message}`);
        });

        // Mesh connection (pour échanger manifestes, MAC, etc.)
        requestConnection(peer.peerId).catch(err => {
          this._log(`❌ Échec requestConnection vers ${peer.peerId}: ${err.message}`);
          this._failedPeers.add(peer.peerId);
          setTimeout(() => this._failedPeers.delete(peer.peerId), 30000);
        });
      } else {
        this._log(`⏳ [V3.5] Mesh Slave (${myScore} < ${peerScore}) → j'attends que le Master crée le groupe WiFi Direct`);
        // Le Slave ne fait rien. Le Master va créer le groupe, et le Slave le détectera
        // via le WiFi Direct discovery déjà actif dans P2PAutoSync.start()
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
      // V1.0.17: Nettoyer le peer Mesh du P2PAutoSync
      try {
        const { P2PAutoSync } = require('./P2PAutoSync');
        P2PAutoSync.clearMeshPeer(peerId);
      } catch (_) {}
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

  async pauseMesh() {
    if (!this.isAdvertising && !this.isDiscovering) return;
    this._log('⏸️ Pause Mesh (libération radio pour WiFi Direct)...');
    try {
      if (this.isAdvertising) { await stopAdvertise(); this.isAdvertising = false; }
      if (this.isDiscovering) { await stopDiscovery(); this.isDiscovering = false; }
      // 500ms — délai historique (Session 09 Mai 2026, marchait bien)
      // Augmenter à 2000ms causait un blocage du SLAVE (User feedback 2026-06-02)
      await new Promise(r => setTimeout(r, 500));
      this._log('✅ Mesh en pause.');
    } catch (e) {
      this._log(`⚠️ Erreur pause Mesh: ${e.message}`);
    }
  }

  async resumeMesh() {
    if (this.isAdvertising && this.isDiscovering) return;
    if (this._isStarting) return;
    this._log('▶️ Reprise Mesh après transfert WiFi...');
    try {
      if (!this.deviceName) {
        const { WifiDirectService } = require('./WifiDirectService');
        const powerScore = this._getPowerScore();
        this.deviceName = WifiDirectService.deviceName || `${powerScore}_Yabisso_${Math.random().toString(36).substring(7)}`;
      }
      const strategy = Strategy.P2P_STAR;
      if (!this.isAdvertising) { await startAdvertise(this.deviceName, strategy); this.isAdvertising = true; }
      if (!this.isDiscovering) { await startDiscovery(this.deviceName, strategy); this.isDiscovering = true; }
      this._log('✅ Mesh relancé.');
    } catch (e) {
      this._log(`⚠️ Erreur reprise Mesh: ${e.message}`);
    }
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
      } else if (data.type === 'wifi_group_ready') {
        // V3.6.4 (Mesh handshake) : Le Master annonce via Mesh que son groupe WiFi est prêt.
        // Le Slave peut alors initier sa connexion WiFi au Master en toute confiance.
        this._log(`📡 [V3.6.4 Mesh] WIFI_GROUP_READY reçu de ${peerId} (masterIp=${data.masterIp})`);
        MeshRequestEvents.emit({ type: 'WIFI_GROUP_READY', peerId, masterIp: data.masterIp });
      } else if (data.type === 'slave_connected_confirmed') {
        // V3.6.4 (Mesh handshake) : Le Slave confirme via Mesh qu'il est connecté au WiFi du Master.
        // Le Master peut alors commencer à envoyer des données en toute sécurité.
        this._log(`✅ [V3.6.4 Mesh] SLAVE_CONNECTED_CONFIRMED reçu de ${peerId}`);
        MeshRequestEvents.emit({ type: 'SLAVE_CONNECTED_CONFIRMED', peerId });
      }
    } catch (e) { }
  }

  // V3.6.4 (Mesh handshake) : Envoie un message JSON à un peer via le canal Mesh BLE.
  // Utilisé pour le handshake WIFI_GROUP_READY / SLAVE_CONNECTED_CONFIRMED.
  async sendMeshMessage(peerId, message) {
    try {
      const payload = JSON.stringify(message);
      await sendText(peerId, payload);
      this._log(`📤 [V3.6.4 Mesh] Message envoyé à ${peerId}: ${message.type}`);
      return true;
    } catch (e) {
      this._log(`⚠️ [V3.6.4 Mesh] Échec envoi message à ${peerId}: ${e.message}`);
      return false;
    }
  }


  async _handleGlobalManifestReceived(peerId, remoteManifest) {
    if (!remoteManifest) return;
    this._log(`📥 Manifeste reçu de ${peerId}. Analyse des deltas...`);

    try {
      const delta = await GlobalManifestService.calculateGlobalDelta(remoteManifest);
      const lobaCount = delta.loba?.length || 0;
      const productCount = delta.products?.length || 0;

      // V3.6.3 (BUG-060 fix) : HOOK DU DELTA VERS P2PAutoSync
      // On passe TOUJOURS le delta à P2PAutoSync (même si 0 items) pour qu'il
      // puisse synchroniser son flag _hasPendingDelta. Sans ce hook, le cycle
      // 3s évalue shouldSend sans savoir qu'il y a un delta à pousser.
      try {
        const { P2PAutoSync } = require('./P2PAutoSync');
        P2PAutoSync.onMeshManifestDeltaCalculated(delta);
      } catch (e) {
        this._log(`⚠️ [V3.6.3] Échec hook delta: ${e.message}`);
      }

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
