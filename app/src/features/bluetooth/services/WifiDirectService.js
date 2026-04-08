// app/src/features/bluetooth/services/WifiDirectService.js
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import { NetworkRailDetector } from './NetworkRailDetector';
import { NetworkPermissionsService } from './NetworkPermissionsService';

/**
 * WifiDirectService
 * Gère les transferts P2P via WiFi Direct (Android).
 * 
 * NOTE: Ce service nécessite `react-native-wifi-p2p` qui doit être
 * installé et lié nativement (rebuild APK requis).
 * En attendant le rebuild, les méthodes sont implémentées avec un
 * try/catch qui dégrade gracefully si le module n'est pas lié.
 */

let WifiP2P = null;
try {
  // Tentative d'import dynamique — ne crash pas si non installé
  WifiP2P = require('react-native-wifi-p2p');
} catch (e) {
  console.warn('[WifiDirectService] Module react-native-wifi-p2p non disponible. WiFi Direct désactivé.');
}

class WifiDirectServiceClass {
  constructor() {
    this.initialized = false;
    this.isInitializing = false;
    this.peers = [];
    this.connectedPeer = null;
    this.isSupported = true; // Par défaut on suppose que oui
    this.isDiscovering = false; // true si un scan est en cours
    this.isLocationEnabled = true; // true si le GPS est allumé (Android requis)
    this.listeners = {
      onPeerFound: [],
      onPeerLost: [],
      onConnectionChange: [],
      onTransferProgress: [],
    };
  }

  /**
   * Initialise le service WiFi P2P.
   * Doit être appelé une fois au démarrage.
   */
  async initialize() {
    if (this.initialized) {
      console.log('[WifiDirectService] Déjà initialisé.');
      return true;
    }

    if (this.isInitializing) {
      console.log('[WifiDirectService] Initialisation déjà en cours...');
      // Attendre un peu ou retourner un succès partiel (ou false) pour éviter l'erreur
      // L'idéal serait d'attendre la complétion, mais on peut juste skip pour le moment.
      return false;
    }
    
    this.isInitializing = true;

    if (!WifiP2P || Platform.OS !== 'android') {
      console.warn('[WifiDirectService] Non disponible sur cette plateforme.');
      this.isInitializing = false;
      return false;
    }

    // 0. Vérifier le GPS (Android)
    if (Platform.OS === 'android') {
      const providerStatus = await Location.getProviderStatusAsync();
      this.isLocationEnabled = providerStatus.locationServicesEnabled;
      if (!this.isLocationEnabled) {
        console.warn('[WifiDirectService] GPS désactivé. La détection P2P va échouer.');
      }
    }

    // 1. Demander les permissions
    const hasPermission = await NetworkPermissionsService.requestAll();
    if (!hasPermission) {
      console.error('[WifiDirectService] Permissions réseau refusées.');
      this.isInitializing = false;
      return false;
    }

    try {
      try {
        await WifiP2P.initialize();
      } catch (nativeErr) {
        // Ignorer l'erreur d'initialisation multiple (fréquente en Hot Reload)
        if (nativeErr?.message?.includes('initialized once') || nativeErr?.message?.includes('already initialized')) {
          console.log('[WifiDirectService] Module natif déjà initialisé (ignoring error).');
        } else {
          // Si c'est une autre erreur, on la relance pour le catch global
          throw nativeErr;
        }
      }
      
      this.initialized = true;
      this.isInitializing = false;
      this.isSupported = true;

      // Écouter les changements de peers
      WifiP2P.subscribeOnPeersUpdates(({ devices }) => {
        this.peers = devices || [];
        console.log(`[WifiDirectService] ${this.peers.length} peers détectés.`);
        this.peers.forEach(peer => {
          this._emit('onPeerFound', peer);
        });
      });

      // Écouter les changements de connexion
      WifiP2P.subscribeOnConnectionInfoUpdates((info) => {
        if (info.groupFormed) {
          this.connectedPeer = info;
          NetworkRailDetector.setWifiDirectAvailable(true);
          this._emit('onConnectionChange', { connected: true, info });
        } else {
          this.connectedPeer = null;
          NetworkRailDetector.setWifiDirectAvailable(false);
          this._emit('onConnectionChange', { connected: false });
        }
      });

      console.log('[WifiDirectService] Initialisé avec succès.');
      return true;
    } catch (e) {
      if (e?.message?.includes('P2P_UNSUPPORTED')) {
        console.warn('[WifiDirectService] P2P non supporté sur ce matériel.');
        this.isSupported = false;
      } else {
        console.error('[WifiDirectService] Erreur initialisation:', e);
      }
      this.isInitializing = false;
      return false;
    }
  }

  /**
   * Démarre la découverte de peers WiFi Direct.
   */
  async startDiscovery() {
    if (!this.initialized || !this.isSupported || this.isDiscovering) {
      return false;
    }

    // Vérifier à nouveau le GPS
    if (Platform.OS === 'android') {
      const providerStatus = await Location.getProviderStatusAsync();
      this.isLocationEnabled = providerStatus.locationServicesEnabled;
      if (!this.isLocationEnabled) {
        console.error('[WifiDirectService] Impossible de démarrer : GPS désactivé.');
        this.isDiscovering = false;
        return false;
      }
    }

    try {
      this.isDiscovering = true;
      await WifiP2P.startDiscoveringPeers();
      console.log('[WifiDirectService] Découverte de peers démarrée.');
      return true;
    } catch (e) {
      // Gérer l'erreur 0 (BUSY / INTERNAL_ERROR)
      if (e?.code === 0 || e?.message?.includes('failed due to an internal error') || (typeof e === 'string' && e.includes('internal error'))) {
        console.warn('[WifiDirectService] Hardware Busy (Err 0). Tentative de retry dans 1s...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Retry récursif limité à un essai par appel
        try {
          await WifiP2P.startDiscoveringPeers();
          console.log('[WifiDirectService] Découverte démarrée après retry.');
          return true;
        } catch (retryErr) {
          console.error('[WifiDirectService] Échec permanent après retry:', retryErr);
        }
      }

      // Si on attrape P2P_UNSUPPORTED ici, on désactive silencieusement
      if (e?.message?.includes('P2P_UNSUPPORTED') || (typeof e === 'string' && e.includes('P2P_UNSUPPORTED'))) {
        console.warn('[WifiDirectService] Découverte impossible: P2P non supporté.');
        this.isSupported = false;
        this.isDiscovering = false;
      } else {
        console.error('[WifiDirectService] Erreur découverte:', e);
      }
      this.isDiscovering = false;
      return false;
    }
  }

  /**
   * Arrête la découverte.
   */
  async stopDiscovery() {
    if (!this.initialized) return;
    try {
      await WifiP2P.stopDiscoveringPeers();
      this.isDiscovering = false;
    } catch (e) {
      console.warn('[WifiDirectService] stopDiscovery:', e.message);
    }
  }

  /**
   * Se connecte à un peer WiFi Direct.
   */
  async connectToPeer(device) {
    if (!this.initialized) return false;

    try {
      console.log(`[WifiDirectService] Connexion à ${device.deviceName || device.deviceAddress}...`);
      await WifiP2P.connect(device.deviceAddress);
      console.log('[WifiDirectService] Connecté!');
      return true;
    } catch (e) {
      console.error('[WifiDirectService] Erreur connexion:', e);
      return false;
    }
  }

  /**
   * Envoie un fichier au peer connecté.
   * @param {string} filePath - Chemin local du fichier
   * @param {Object} metadata - { hash, type, category, size }
   * @returns {boolean} true si envoyé avec succès
   */
  async sendFile(filePath, metadata = {}) {
    if (!this.initialized || !this.connectedPeer) {
      console.warn('[WifiDirectService] Pas connecté à un peer.');
      return false;
    }

    try {
      let fileInfo = { exists: false, size: 0 };
      let nativePath = filePath;

      if (filePath) {
        // Nettoyer le chemin pour le module natif (enlever file://)
        nativePath = filePath.replace('file://', '');
        
        // Vérifier que le fichier existe
        fileInfo = await FileSystem.getInfoAsync(filePath);
        if (!fileInfo.exists) {
          console.error('[WifiDirectService] Fichier introuvable:', filePath);
          return false;
        }
        console.log(`[WifiDirectService] Envoi de ${nativePath} (${(fileInfo.size / 1024 / 1024).toFixed(1)} MB)...`);
      }

      // Envoyer les métadonnées d'abord (via message)
      const metaPayload = JSON.stringify({
        action: metadata.type === 'PING' ? 'PING' : 'FILE_TRANSFER',
        hash: metadata.hash || 'ping',
        type: metadata.type || 'video',
        category: metadata.category || 'general',
        username: metadata.username || 'Anonymous',
        avatar: metadata.avatar || null,
        content: metadata.content || '',
        size: fileInfo.size,
        filename: filePath ? filePath.split('/').pop() : 'none',
        timestamp: Date.now(),
      });
      await WifiP2P.sendMessage(metaPayload);

      // Petite pause pour laisser le récepteur parser le message avant d'envoyer le binaire
      if (filePath) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await WifiP2P.sendFile(nativePath);
        console.log(`[WifiDirectService] Fichier envoyé avec succès: ${metadata.hash}`);
      } else {
        console.log('[WifiDirectService] Ping envoyé avec succès.');
      }

      this._emit('onTransferProgress', { hash: metadata.hash || 'ping', progress: 100, status: 'complete' });
      return true;
    } catch (e) {
      console.error('[WifiDirectService] Erreur envoi:', e);
      const errorMsg = e?.message || (typeof e === 'string' ? e : 'Unknown error');
      this._emit('onTransferProgress', { hash: metadata.hash || 'ping', progress: 0, status: 'failed', error: errorMsg });
      return false;
    }
  }

  /**
   * Écoute les fichiers entrants.
   * @param {Function} onFileReceived - (filePath, metadata) => void
   */
  async startReceiving(onFileReceived) {
    if (!this.initialized) return;

    try {
      // S'assurer que le dossier existe avant de recevoir
      const mediaDir = `${FileSystem.documentDirectory}loba_media/`;
      const dirInfo = await FileSystem.getInfoAsync(mediaDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(mediaDir, { intermediates: true });
      }

      WifiP2P.receiveMessage((message) => {
        try {
          if (!message) return;
          const meta = JSON.parse(message);
          if (meta.action === 'FILE_TRANSFER') {
            console.log(`[WifiDirectService] Transfert entrant: ${meta.hash} (${(meta.size / 1024 / 1024).toFixed(1)} MB)`);
            
            // Recevoir le fichier
            WifiP2P.receiveFile(
              mediaDir,
              meta.filename || `${meta.hash}.mp4`
            ).then((receivedPath) => {
              console.log(`[WifiDirectService] Fichier reçu: ${receivedPath}`);
              if (onFileReceived) {
                onFileReceived(receivedPath, meta);
              }
            }).catch(err => {
              console.error('[WifiDirectService] Erreur réception fichier:', err);
            });
          }
        } catch (parseErr) {
          // Ce n'est probablement pas notre protocole, on ignore
          console.log('[WifiDirectService] Message ignoré (non-JSON)');
        }
      });
    } catch (e) {
      console.error('[WifiDirectService] startReceiving error:', e);
    }
  }

  /**
   * Déconnexion propre.
   */
  async disconnect() {
    if (!this.initialized) return;
    try {
      await WifiP2P.disconnect();
      this.connectedPeer = null;
      NetworkRailDetector.setWifiDirectAvailable(false);
      console.log('[WifiDirectService] Déconnecté.');
    } catch (e) {
      console.warn('[WifiDirectService] disconnect:', e.message);
    }
  }

  /**
   * Nettoyage complet.
   */
  async cleanup() {
    await this.stopDiscovery();
    await this.disconnect();
    if (WifiP2P) {
      try {
        WifiP2P.unsubscribeFromPeersUpdates();
        WifiP2P.unsubscribeFromConnectionInfoUpdates();
      } catch (e) {}
    }
    this.initialized = false;
  }

  /**
   * Abonnement aux événements.
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    };
  }

  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  /**
   * Retourne l'état courant pour l'UI.
   */
  getState() {
    return {
      initialized: this.initialized,
      isDiscovering: this.isDiscovering,
      peers: this.peers,
      connectedPeer: this.connectedPeer,
      isAvailable: !!WifiP2P && Platform.OS === 'android' && this.isSupported,
      isSupported: this.isSupported,
      isLocationEnabled: this.isLocationEnabled,
    };
  }
}

export const WifiDirectService = new WifiDirectServiceClass();
