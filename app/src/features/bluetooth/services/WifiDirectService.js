// app/src/features/bluetooth/services/WifiDirectService.js
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import { NetworkRailDetector } from './NetworkRailDetector';
import { NetworkPermissionsService } from './NetworkPermissionsService';

let WifiP2P = null;
try {
  WifiP2P = require('react-native-wifi-p2p');
} catch (e) {
  console.warn('[WifiDirectService] Module react-native-wifi-p2p non disponible.');
}

class WifiDirectServiceClass {
  constructor() {
    this.initialized = false;
    this.isInitializing = false;
    this.peers = [];
    this.connectedPeer = null;
    this.isGroupOwner = false;
    this.groupOwnerAddress = null;
    this.isSupported = true;
    this.isDiscovering = false;
    this.isConnecting = false;
    this.isConnected = false;
    this.isLocationEnabled = true;
    this._isSending = false;
    this.globalFileHandler = null;
    this.deviceName = null;
    this._cachedDeviceName = null;
    this.listeners = {
      onPeerFound: [],
      onConnectionChange: [],
      onTransferProgress: [],
      onLogUpdate: [],
      onSyncStatus: [],
    };
    this._nativeLock = false;
  }

  _buildDeviceName() {
    try {
      const totalMemoryGB = (Device.totalMemory || 0) / (1024 * 1024 * 1024);
      const score = Math.round(totalMemoryGB * 10);
      const randomId = Math.random().toString(36).substring(4);
      return `${score}_Device_${randomId}`;
    } catch (e) {
      return `50_Device_${Math.random().toString(36).substring(4)}`;
    }
  }

  getDeviceName() {
    return this.deviceName || this._cachedDeviceName || this._buildDeviceName();
  }

  getPowerScore() {
    const name = this.getDeviceName();
    if (!name) return 50;
    return parseInt(name.split('_')[0], 10) || 50;
  }

  setGlobalFileHandler(handler) {
    this.globalFileHandler = handler;
  }

  async initialize() {
    if (this.initialized) return true;
    if (this.isInitializing) return false;
    this.isInitializing = true;

    try {
      if (!WifiP2P) return false;

      if (Platform.OS === 'android') {
        try {
          const providerStatus = await Location.getProviderStatusAsync();
          this.isLocationEnabled = providerStatus.locationServicesEnabled;
        } catch (_) {
          this.isLocationEnabled = true;
        }
      }

      await WifiP2P.initialize();
      await new Promise(r => setTimeout(r, 500));
      
      WifiP2P.subscribeOnPeersUpdates(({ devices }) => {
        this.peers = devices || [];
        this.peers.forEach(p => {
           this._emit('onPeerFound', p);
        });
      });

      WifiP2P.subscribeOnConnectionInfoUpdates((info = {}) => {
        if (info.groupFormed) {
          this.connectedPeer = info;
          this.isConnected = true;
          this.isGroupOwner = !!info.isGroupOwner;
          this.groupOwnerAddress = info.groupOwnerAddress === 'null' ? '192.168.49.1' : info.groupOwnerAddress;
          this.isConnecting = false;
          console.log(`[WifiDirectService] ✅ CONNECTÉ: GO=${this.isGroupOwner}`);
          this._emit('onConnectionChange', { connected: true, isGroupOwner: this.isGroupOwner, info });
          if (this.isGroupOwner && this.globalFileHandler) {
            this.startReceiving(this.globalFileHandler);
          }
        } else {
          const wasConnected = !!this.connectedPeer;
          this.connectedPeer = null;
          this.isConnected = false;
          this.isConnecting = false;
          this.isGroupOwner = false;
          this.groupOwnerAddress = null;
          if (wasConnected) {
            this._emit('onConnectionChange', { connected: false });
          }
        }
      });

      this.initialized = true;
      this.isInitializing = false;
      return true;
    } catch (e) {
      console.warn('[WifiDirectService] Init native échouée:', e.message);
      this.isSupported = false;
      this.isInitializing = false;
      return false;
    }
  }

  async startDiscovery(force = false) {
    if (!this.isSupported || !WifiP2P) return false;
    if (!this.initialized) {
      const ok = await this.initialize();
      if (!ok) return false;
    }
    try {
      try { await WifiP2P.stopDiscoveringPeers(); } catch (_) {}
      await new Promise(r => setTimeout(r, 300));
      await WifiP2P.startDiscoveringPeers();
      this.isDiscovering = true;
      console.log('[WifiDirectService] Découverte démarrée.');
      return true;
    } catch (e) {
      console.warn('[WifiDirectService] startDiscovery error:', e.message);
      return false;
    }
  }

  async stopDiscovery() {
    this.isDiscovering = false;
    try { if (WifiP2P && this.initialized) await WifiP2P.stopDiscoveringPeers(); } catch (_) {}
  }

  async connectToPeer(device, retryCount = 0, forceRole = null) {
    if (this.isConnecting || this.isConnected) return false;
    this.isConnecting = true;

    try {
      const macAddr = device.deviceAddress;
      const myScore = this.getPowerScore();
      const peerScore = parseInt(device.deviceName?.split('_')[0], 10);
      
      // Si le score du pair est inconnu, on assume qu'il est puissant pour éviter que l'Itel ne prenne le lead par erreur
      const effectivePeerScore = isNaN(peerScore) ? 100 : peerScore;
      const iAmMaster = forceRole ? (forceRole === 'MASTER') : (myScore > effectivePeerScore);

      console.log(`[WifiDirectService] 🔄 Tentative ${iAmMaster ? 'MASTER' : 'SLAVE'}`);

      if (iAmMaster) {
        // MASTER: Nettoyage complet avant createGroup
        try { await WifiP2P.removeGroup(); } catch (_) {}
        try { await WifiP2P.stopDiscoveringPeers(); } catch (_) {}
        await new Promise(r => setTimeout(r, 1000));

        try {
          await WifiP2P.createGroup();
          await new Promise(r => setTimeout(r, 2000));
          return true;
        } catch (e) {
          console.warn('[WifiDirectService] ❌ Erreur createGroup:', e.message);
          this.isConnecting = false;
          return false;
        }
      } else {
        // SLAVE: PAS de nettoyage — on se connecte directement au groupe du Master
        // Petit délai de sécurité pour les appareils bas de gamme (Itel)
        await new Promise(r => setTimeout(r, 500));

        try {
          await WifiP2P.connect(macAddr);
          return true;
        } catch (e) {
          console.warn('[WifiDirectService] ⚠️ Erreur connect (tentative 1):', e.message);
          // Retry une fois après 2s (laisser le Master finir son createGroup)
          await new Promise(r => setTimeout(r, 2000));
          try {
            await WifiP2P.connect(macAddr);
            console.log('[WifiDirectService] ✅ Retry SLAVE réussi !');
            return true;
          } catch (e2) {
            console.warn('[WifiDirectService] ❌ Erreur connect (tentative 2):', e2.message);
            // Relancer la découverte pour ne pas rester bloqué
            try { await WifiP2P.startDiscoveringPeers(); this.isDiscovering = true; } catch (_) {}
            this.isConnecting = false;
            return false;
          }
        }
      }
    } catch (e) {
      console.warn('[WifiDirectService] ❌ Erreur connectToPeer:', e.message);
      this.isConnecting = false;
      return false;
    }
  }

  async sendFile(filePath, metadata = {}) {
    if (!this.isConnected || this.isGroupOwner) return false;
    if (this._isSending) return false;
    this._isSending = true;

    try {
      const metaPayload = JSON.stringify({
        ...metadata,
        action: 'FILE_TRANSFER',
        senderDevice: this.getDeviceName()
      });

      await WifiP2P.sendMessage(metaPayload);
      if (filePath) {
        await new Promise(r => setTimeout(r, 500));
        await WifiP2P.sendFile(filePath.replace('file://', ''));
      }
      this._emit('onTransferProgress', { hash: metadata.hash, progress: 100, status: 'complete' });
      return true;
    } catch (e) {
      return false;
    } finally {
      this._isSending = false;
    }
  }

  async sendControlMessage(metadata = {}) {
    if (!this.isConnected || this.isGroupOwner) return false;
    if (this._isSending) return false;
    this._isSending = true;

    try {
      const metaPayload = JSON.stringify({
        ...metadata,
        action: 'CONTROL_MESSAGE',
        senderDevice: this.getDeviceName()
      });

      await WifiP2P.sendMessage(metaPayload);
      return true;
    } catch (e) {
      return false;
    } finally {
      this._isSending = false;
    }
  }

  async startReceiving(callback) {
    if (this._receiveMessages) return;
    this._receiveMessages = true;
    
    const mediaDir = `${FileSystem.documentDirectory}loba_media/`.replace('file://', '');
    const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}loba_media/`);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}loba_media/`, { intermediates: true });
    }

    while (this._receiveMessages && this.isConnected) {
      try {
        const msg = await WifiP2P.receiveMessage();
        if (msg) {
          const meta = JSON.parse(msg);
          if (meta.action === 'CONTROL_MESSAGE') {
            if (callback) callback(null, meta);
          } else if (meta.action === 'FILE_TRANSFER' || meta.type === 'LOBA_PACK') {
            const filename = meta.filename || `p2p_${Date.now()}`;
            const path = await WifiP2P.receiveFile(mediaDir, filename);
            if (callback) callback(path, meta);
          }
        }
      } catch (_) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  stopReceiving() {
    this._receiveMessages = false;
  }

  async disconnect() {
    try { await WifiP2P.removeGroup(); } catch (_) {}
    this.connectedPeer = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.isGroupOwner = false;
    this.groupOwnerAddress = null;
    this._emit('onConnectionChange', { connected: false });
  }

  getState() {
    return {
      initialized: this.initialized,
      isAvailable: this.isSupported && !!WifiP2P,
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      isGroupOwner: this.isGroupOwner,
      isDiscovering: this.isDiscovering,
      isLocationEnabled: this.isLocationEnabled,
      peers: this.peers,
      connectedPeer: this.connectedPeer
    };
  }

  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
      return () => {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      };
    }
    return () => {};
  }

  removeAllListeners(event) {
    if (this.listeners[event]) {
      this.listeners[event] = [];
    }
  }
}

export const WifiDirectService = new WifiDirectServiceClass();
