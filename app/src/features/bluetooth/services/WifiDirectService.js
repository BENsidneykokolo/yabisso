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

// V4.3 (BUG-047 fix): Import NetInfo pour détecter la vraie IP du Slave sur l'interface P2P
import NetInfo from '@react-native-community/netinfo';

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
      onSlaveIpKnown: [], // V4.3: IP réelle du Slave détectée via NetInfo
    };
    this._nativeLock = false;
    this._nativeReady = false;
    this._wifiDirectName = null;
    this._nonYabissoPeers = new Map();
    this._peerLastAttempt = new Map();
    this._localP2pIp = null; // IP locale réelle sur l'interface p2p (ex: 192.168.49.112)
    this._targetPeerIp = null; // IP cible pour sendFileTo (vraie IP du Slave)
    this._logicalRole = null; // V3.34 (FIX 15): 'MASTER' ou 'SLAVE' — rôle logique (pas hardware)
    this._isReceiving = false; // V4.2: Bloquer disconnect() pendant réception
  }

  isPeerBlacklisted(peerName) {
    if (!peerName) return false;
    const exp = this._nonYabissoPeers.get(peerName);
    if (!exp) return false;
    if (Date.now() > exp) {
      this._nonYabissoPeers.delete(peerName);
      return false;
    }
    return true;
  }

  markPeerAsNonYabisso(peerName, ttlMs = 300000) {
    if (!peerName) return;
    this._nonYabissoPeers.set(peerName, Date.now() + ttlMs);
    console.log(`[WifiDirectService] ⛔ Peer blacklisté (non-Yabisso) pour ${Math.round(ttlMs / 60000)}min: ${peerName}`);
  }

  shouldBackoffPeer(peerName, minIntervalMs = 10000) {
    if (!peerName) return false;
    const last = this._peerLastAttempt.get(peerName) || 0;
    return Date.now() - last < minIntervalMs;
  }

  recordPeerAttempt(peerName) {
    if (!peerName) return;
    this._peerLastAttempt.set(peerName, Date.now());
  }

  isLikelyYabissoDevice(deviceName) {
    if (!deviceName) return false;
    return /^\d+_(Yabisso|Device)_/i.test(deviceName);
  }

  async createGroup() {
    if (this.isConnecting || this.isConnected) return false;
    if (!this._nativeReady || !WifiP2P) return false;
    this.isConnecting = true;
    try {
      // V3.14 (BUG-044 fix) : NETTOYAGE COMPLET avant createGroup
      // Problème : "framework is busy" quand l'ancien groupe est encore actif
      // Solution : removeGroup + pause 1500ms (Android a besoin de ce délai pour
      // libérer le radio) + cancelConnect (annule toute connexion en cours) +
      // stopDiscoveringPeers + pause 500ms avant createGroup.
      try { await WifiP2P.removeGroup(); } catch (_) {}
      await new Promise(r => setTimeout(r, 1500));
      console.log('[WifiDirectService] 🧹 Ancien groupe supprimé');
      try { if (typeof WifiP2P.cancelConnect === 'function') await WifiP2P.cancelConnect(); } catch (_) {}
      try { await WifiP2P.stopDiscoveringPeers(); } catch (_) {}
      await new Promise(r => setTimeout(r, 500));
      await Promise.race([
        WifiP2P.createGroup(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('createGroup timeout 8s')), 8000))
      ]);
      this.isConnecting = false;
      console.log('[WifiDirectService] ✅ createGroup réussi (mode MASTER proactif)');
      return true;
    } catch (e) {
      console.warn(`[WifiDirectService] ❌ createGroup error: ${e.message}`);
      this.isConnecting = false;
      return false;
    }
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

  // V3.37: Retourne le nom Android réel de l'appareil (ex: "Xiaomi 11T", "itel A50").
  // Utilisé pour le self-peer filter WiFi Direct car les scans retournent les noms
  // Android natifs, pas nos noms customisés "score_Yabisso_xxx".
  getAndroidDeviceName() {
    try {
      return (Device.deviceName || Device.modelName || '').toLowerCase();
    } catch (_) {
      return '';
    }
  }

  getWifiDirectName() {
    return this._wifiDirectName || this.getDeviceName();
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
      if (!WifiP2P) {
        this.isInitializing = false;
        return false;
      }

      if (Platform.OS === 'android') {
        try {
          const providerStatus = await Location.getProviderStatusAsync();
          this.isLocationEnabled = providerStatus.locationServicesEnabled;
        } catch (_) {
          this.isLocationEnabled = true;
        }
      }

      await WifiP2P.initialize();
      await new Promise(r => setTimeout(r, 800));

      let nativeReady = false;
      try {
        const testResult = await WifiP2P.getName();
        nativeReady = !!testResult;
        if (testResult) {
          this._wifiDirectName = testResult;
          console.log(`[WifiDirectService] 📱 Nom WiFi Direct: ${testResult}`);
        }
      } catch (_) {
        // Retry avec plus de temps pour les appareils lents (Itel)
        await new Promise(r => setTimeout(r, 1500));
        try {
          const testResult2 = await WifiP2P.getName();
          nativeReady = !!testResult2;
          if (testResult2) {
            this._wifiDirectName = testResult2;
            console.log(`[WifiDirectService] 📱 Nom WiFi Direct (retry): ${testResult2}`);
          }
        } catch (_) {
          nativeReady = false;
        }
      }

      if (!nativeReady) {
        console.warn('[WifiDirectService] ⚠️ getName() a échoué mais on continue quand même...');
        // V3.38: Fallback — utiliser Device.deviceName comme nom WiFi Direct
        // Sur Android, le nom WiFi Direct = nom Bluetooth (défini par l'utilisateur).
        // Device.deviceName retourne ce nom si la permission BLUETOOTH_CONNECT est accordée.
        if (!this._wifiDirectName && Device.deviceName) {
          this._wifiDirectName = Device.deviceName;
          console.log(`[WifiDirectService] 📱 [V3.38] WiFi Direct name depuis Device: ${Device.deviceName}`);
        }
      }

      this._nativeReady = true;

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
          // V3.34 (FIX 14): groupOwnerAddress peut être un objet (Android) ou une string.
          // Si c'est un objet avec .address ou .getHostAddress, on l'extrait.
          // Sinon on compare à 'null' (cas natif react-native-wifi-p2p).
          const rawAddr = info.groupOwnerAddress;
          if (rawAddr && typeof rawAddr === 'object') {
            this.groupOwnerAddress = rawAddr.address || rawAddr.getHostAddress?.() || '192.168.49.1';
          } else {
            this.groupOwnerAddress = rawAddr === 'null' || !rawAddr ? '192.168.49.1' : rawAddr;
          }
          this.isConnecting = false;
          console.log(`[WifiDirectService] ✅ CONNECTÉ: GO=${this.isGroupOwner}, addr=${this.groupOwnerAddress}`);
          this._emit('onConnectionChange', { connected: true, isGroupOwner: this.isGroupOwner, info });
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
      this.initialized = false;
      this._nativeReady = false;
      this.isInitializing = false;
      return false;
    }
  }

  async startDiscovery(force = false) {
    if (!this.isSupported || !WifiP2P || !this._nativeReady) return false;
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
    try { if (WifiP2P && this._nativeReady && this.initialized) await WifiP2P.stopDiscoveringPeers(); } catch (_) {}
  }

  async connectToPeer(device, retryCount = 0, forceRole = null) {
    if (this.isConnecting || this.isConnected) return false;
    if (!this._nativeReady || !WifiP2P) return false;
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
          // Timeout 8s sur createGroup() aussi (peut rester pending)
          await Promise.race([
            WifiP2P.createGroup(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('createGroup timeout 8s')), 8000))
          ]);
          this.isConnecting = false;
          await new Promise(r => setTimeout(r, 2000));
          return true;
        } catch (e) {
          console.warn('[WifiDirectService] ❌ Erreur createGroup:', e.message);
          this.isConnecting = false;
          return false;
        }
      } else {
        // V3.39 (FIX): Nettoyer un eventuel groupe stale AVANT de se connecter au Master.
        // Sur certains appareils (Xiaomi, Itel), un ancien groupe WiFi Direct bloque
        // le nouveau connect() avec "framework is busy".
        console.log('[WifiDirectService] 🧹 [V3.39] SLAVE: removeGroup cleanup avant connect...');
        try { await WifiP2P.removeGroup(); } catch (_) {}
        // V3.39 (FIX 3): Arreter la decouverte AVANT connect pour liberer le framework
        console.log('[WifiDirectService] 📡 [V3.39] SLAVE: stopDiscoveringPeers avant connect...');
        try { await WifiP2P.stopPeerDiscovery(() => {}); } catch (_) {}
        await new Promise(r => setTimeout(r, 1000));

        // V3.14 (BUG-044 fix) : 3 TENTATIVES avec BACKOFF EXPONENTIEL
        // Problème : "framework is busy" sur les appareils lents (Itel A50 Mediatek)
        // Solution : retry 3x avec pauses 2000ms puis 4000ms entre chaque.
        // Total max : 8s + 2s + 8s + 4s + 8s = 30s, suffisant pour stabiliser.
        const delays = [2000, 4000];
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            await Promise.race([
              WifiP2P.connect(macAddr),
              new Promise((_, reject) => setTimeout(() => reject(new Error(`connect timeout 8s (tentative ${attempt})`)), 8000))
            ]);
            this.isConnecting = false;
            if (attempt > 1) {
              console.log(`[WifiDirectService] ✅ connect réussi tentative ${attempt} !`);
            } else {
              console.log('[WifiDirectService] ✅ connect réussi (première tentative)');
            }
            // V3.33 (FIX 10): Forcer requestConnectionInfo() après connect() réussi.
            // Sur Itel A50 (Mediatek), le broadcast WIFI_P2P_CONNECTION_CHANGED_ACTION
            // ne se déclenche JAMAIS après connect() côté Slave → onConnectionChange ne fire jamais
            // → récepteur jamais démarré → HELLO jamais envoyé → Master timeout.
            // Solution : attendre 2s que Android lie la table de routage, puis appeler
            // getConnectionInfo() manuellement pour déclencher le handler.
            try {
              await new Promise(r => setTimeout(r, 2000));
              const info = await Promise.race([
                WifiP2P.getConnectionInfo(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('getConnectionInfo timeout')), 5000))
              ]);
              if (info && info.groupFormed) {
                // Déclencher manuellement le handler de connexion
                this.connectedPeer = info;
                this.isConnected = true;
                this.isGroupOwner = !!info.isGroupOwner;
                // V3.34 (FIX 14): Parsing groupOwnerAddress (objet Android → string)
                const rawAddr = info.groupOwnerAddress;
                if (rawAddr && typeof rawAddr === 'object') {
                  this.groupOwnerAddress = rawAddr.address || rawAddr.getHostAddress?.() || '192.168.49.1';
                } else {
                  this.groupOwnerAddress = rawAddr === 'null' || !rawAddr ? '192.168.49.1' : rawAddr;
                }
                // V3.34 (FIX 15): Forcer isGroupOwner=false si forceRole=SLAVE
                // Sur Itel A50 Mediatek, getConnectionInfo() retourne toujours GO=true
                if (forceRole === 'SLAVE') {
                  this.isGroupOwner = false;
                  console.log(`[WifiDirectService] ✅ [V3.34 FIX15] ConnectionInfo forcé: GO=false (forceRole=SLAVE), addr=${this.groupOwnerAddress}`);
                } else {
                  console.log(`[WifiDirectService] ✅ [V3.33 FIX10] ConnectionInfo forcé: GO=${this.isGroupOwner}, addr=${this.groupOwnerAddress}`);
                }
                this._emit('onConnectionChange', { connected: true, isGroupOwner: this.isGroupOwner, info });
              } else {
                console.log('[WifiDirectService] ⚠️ [V3.33 FIX10] getConnectionInfo() retourne null ou groupFormed=false');
                // V4.1 (FIX 4): Si getConnectionInfo echoue, la connexion n'est pas fiable
                // Ne PAS retourner true ici → eviter EHOSTUNREACH quand le Master envoie
                this.isConnecting = false;
                this.isConnected = false;
                return false;
              }
            } catch (e) {
              console.warn(`[WifiDirectService] ⚠️ [V3.33 FIX10] getConnectionInfo échoué: ${e.message}`);
              this.isConnecting = false;
              this.isConnected = false;
              return false;
            }
            return true;
          } catch (e) {
            this.isConnecting = false;
            if (attempt < maxAttempts) {
              const delay = delays[attempt - 1];
              console.warn(`[WifiDirectService] ⚠️ Erreur connect (tentative ${attempt}/${maxAttempts}): ${e.message} — retry dans ${delay}ms`);
              await new Promise(r => setTimeout(r, delay));
            } else {
              console.warn(`[WifiDirectService] ❌ Erreur connect (tentative ${attempt}/${maxAttempts}): ${e.message} — abandon après ${maxAttempts} tentatives`);
              // Relancer la découverte pour ne pas rester bloqué
              try { await WifiP2P.startDiscoveringPeers(); this.isDiscovering = true; } catch (_) {}
              return false;
            }
          }
        }
        return false;
      }
    } catch (e) {
      console.warn('[WifiDirectService] ❌ Erreur connectToPeer:', e.message);
      this.isConnecting = false;
      return false;
    }
  }

  async sendFile(filePath, metadata = {}) {
    if (!this.isConnected) return false;
    if (this._isSending) return false;
    this._isSending = true;


    // V3.1 (BUG-053 fix): Forcer la mise à jour de wifiP2pInfo côté natif AVANT sendFile
    // Sans ça, le code natif `wifiP2pInfo.groupOwnerAddress != null` crash en NPE
    // (réact-native-wifi-p2p n'initialise wifiP2pInfo que via onConnectionInfoAvailable)
    try {
      await this._refreshConnectionInfo();
    } catch (_) {
      // Continuer quand même, le sendFile pourrait quand même marcher
    }

    // V2.18c (BUG-048 fix) : SUPPRIMÉ le check FileSystem qui crashait (require expo-file-system HS dans ce contexte)
    // On se fie à la taille déjà loggée par LobaPackService (ex: "Pack généré: ... (9 items, 23.2MB)")

    // V3.29 (BUG-067 fix): Correction self-loop quand GO=true
    // V3.34 (FIX 15): Sur Itel A50 (Mediatek), GO=true même quand Slave → envoyer à 192.168.49.1
    let useAddress = null;
    if (this._targetPeerIp && this._targetPeerIp !== this.groupOwnerAddress) {
      useAddress = this._targetPeerIp;
      console.log(`[WifiDirectService] 📤 [V3.29] sendFileTo vers Slave IP=${useAddress} (pas self-loop)`);
    } else if (this.isGroupOwner && this._logicalRole === 'SLAVE') {
      // Itel A50 Mediatek: GO=true mais logiquement SLAVE → le vrai GO/Master est à .1
      useAddress = '192.168.49.1';
      console.log(`[WifiDirectService] 📤 [V3.34 FIX15] GO=true + SLAVE → Master IP=${useAddress}`);
    } else if (this.isGroupOwner) {
      // On est GO=true MASTER — le peer est un client du groupe (IP 192.168.49.2 typiquement)
      useAddress = '192.168.49.2';
      console.log(`[WifiDirectService] 📤 [V3.29] GO=true, self-loop évité → sendFileTo vers client IP=${useAddress}`);
    } else {
      console.log(`[WifiDirectService] ⚠️ [V3.29] _targetPeerIp non défini — fallback sendFile`);
    }

    // V2.17 (BUG-047 fix): Retry 2x si échec
    // V4.4: Utilise _sendFileToWithFallback pour essayer .2→.3→.4→.5→.6 sur EHOSTUNREACH
    if (filePath) {
      const cleanPath = filePath.replace('file://', '');
      console.log(`[WifiDirectService] 📤 sendFile: ${cleanPath}`);

      if (useAddress) {
        const sent = await this._sendFileToWithFallback(cleanPath, useAddress, 120000);
        if (sent) {
          this._emit('onTransferProgress', { hash: metadata.hash, progress: 100, status: 'complete' });
          this._isSending = false;
          return true;
        }
        // Fallback: essayer sendFile sans adresse spécifique
        try {
          console.log(`[WifiDirectService] 📤 [V4.4] sendFile fallback (sans adresse)`);
          await Promise.race([
            WifiP2P.sendFile(cleanPath),
            new Promise((_, reject) => setTimeout(() => reject(new Error('sendFile timeout')), 120000))
          ]);
          console.log(`[WifiDirectService] ✅ [V4.4] sendFile fallback réussi`);
          this._emit('onTransferProgress', { hash: metadata.hash, progress: 100, status: 'complete' });
          this._isSending = false;
          return true;
        } catch (e) {
          console.warn(`[WifiDirectService] ❌ [V4.4] sendFile fallback error: ${e.message}`);
        }
      } else {
        try {
          await Promise.race([
            WifiP2P.sendFile(cleanPath),
            new Promise((_, reject) => setTimeout(() => reject(new Error('sendFile timeout')), 120000))
          ]);
          console.log(`[WifiDirectService] ✅ sendFile réussi`);
          this._emit('onTransferProgress', { hash: metadata.hash, progress: 100, status: 'complete' });
          this._isSending = false;
          return true;
        } catch (e) {
          console.warn(`[WifiDirectService] ❌ sendFile error: ${e.message}`);
        }
      }
    }
    this._isSending = false;
    return false;
  }

  // V3.3 (BUG-055 fix) : Envoi vers une adresse IP spécifique (pour Phase 2 bidirectionnel)
  // Permet au GO d'envoyer au client en spécifiant son IP directement
  async sendFileTo(filePath, address, metadata = {}) {
    if (!this.isConnected) return false;
    if (!address) return false;
    if (this._isSending) return false;
    this._isSending = true;

    try {
      try {
        await this._refreshConnectionInfo();
      } catch (_) {}

      const cleanPath = filePath.replace('file://', '');
      console.log(`[WifiDirectService] 📤 sendFileTo (${address}): ${cleanPath}`);

      // La lib expose WifiP2P.sendFileTo(pathToFile, address)
      await Promise.race([
        WifiP2P.sendFileTo(cleanPath, address),
        new Promise((_, reject) => setTimeout(() => reject(new Error('sendFileTo timeout')), 120000))
      ]);

      console.log(`[WifiDirectService] ✅ sendFileTo réussi vers ${address}`);
      this._emit('onTransferProgress', { hash: metadata.hash, progress: 100, status: 'complete' });
      this._isSending = false;
      return true;
    } catch (e) {
      console.warn(`[WifiDirectService] ❌ sendFileTo error: ${e.message}`);
      this._isSending = false;
      return false;
    }
  }

  // V3.3 (BUG-055 fix) : Récupère l'adresse IP du client via le MessageServer
  // Astuce : receiveMessage({meta: true}) retourne fromAddress = IP du client
  // (cf. MessageServer.java ligne 47 : client.getInetAddress().getHostAddress())
  async getClientAddress(timeoutMs = 10000) {
    if (!this._nativeReady || !WifiP2P) return null;
    if (!this.isGroupOwner) {
      console.warn('[WifiDirectService] getClientAddress: seulement le GO peut récupérer l\'IP client');
      return null;
    }
    try {
      const result = await Promise.race([
        WifiP2P.receiveMessage({ meta: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
      ]);
      // Le résultat peut être un string ou un objet {message, fromAddress}
      let clientIp = null;
      let messageBody = null;
      if (typeof result === 'string') {
        messageBody = result;
        // Pas de fromAddress disponible sans meta
      } else if (result && result.fromAddress) {
        clientIp = result.fromAddress;
        messageBody = result.message;
      }
      console.log(`[WifiDirectService] 🌐 getClientAddress: ${clientIp} (msg: ${(messageBody || '').substring(0, 30)}...)`);
      return { clientIp, messageBody };
    } catch (e) {
      console.warn(`[WifiDirectService] ⚠️ getClientAddress échoué: ${e.message}`);
      return null;
    }
  }

  async sendControlMessage(metadata = {}) {
    if (!this.isConnected) return false;
    if (this._isSending) return false;
    this._isSending = true;

    try {
      // V3.1 (BUG-053 fix): Forcer la mise à jour de wifiP2pInfo côté natif AVANT sendFile
      try {
        await this._refreshConnectionInfo();
      } catch (_) {
        // Continuer quand même
      }

      // V1.0.18: Utiliser loba_media/ au lieu de p2p_control/ (p2p_control n'est pas writable sur Android)
      // loba_media/ est créé par startReceiving() donc toujours dispo
      const baseDir = `${FileSystem.documentDirectory}loba_media/`;
      const dirInfo = await FileSystem.getInfoAsync(baseDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });
      }

      const controlFile = `${baseDir}ctrl_${metadata.type || 'unknown'}_${Date.now()}.json`;
      const payload = JSON.stringify({
        ...metadata,
        action: 'CONTROL_MESSAGE',
        senderDevice: this.getDeviceName()
      });
      await FileSystem.writeAsStringAsync(controlFile, payload);

      console.log(`[WifiDirectService] 📤 sendControlMessage: ${metadata.type}`);
      // V2.8 (BUG-039 FIX): Stripper file:// avant WifiP2P.sendFile
      // Sans ça, le natif Android essaie d'ouvrir le fichier "file:///..." → NPE → crash app sur itel A50
      const cleanControlFile = controlFile.replace('file://', '');
      // V3.29 (BUG-067 fix): Correction self-loop quand GO=true
      // V3.34 (FIX 15): Sur Itel A50 (Mediatek), getConnectionInfo() retourne toujours GO=true
      // même quand on est le Slave. Si _logicalRole === 'SLAVE', le Master est à 192.168.49.1.
      let useAddress = null;
      if (this._targetPeerIp && this._targetPeerIp !== this.groupOwnerAddress) {
        useAddress = this._targetPeerIp;
      } else if (this.isGroupOwner && this._logicalRole === 'SLAVE') {
        // Itel A50 Mediatek: GO=true mais on est logiquement SLAVE → le vrai GO est le Master
        useAddress = '192.168.49.1';
        console.log(`[WifiDirectService] 📤 [V3.34 FIX15] GO=true + SLAVE → Master IP=${useAddress}`);
      } else if (this.isGroupOwner) {
        useAddress = '192.168.49.2';
        console.log(`[WifiDirectService] 📤 [V3.29] sendControlMessage: GO=true → vers client IP=${useAddress}`);
      }
      // V4.4: Utilise _sendFileToWithFallback pour les messages de contrôle aussi
      if (useAddress) {
        const sent = await this._sendFileToWithFallback(cleanControlFile, useAddress, 15000);
        if (!sent) {
          // Fallback: essayer sendFile sans adresse
          try {
            await Promise.race([
              WifiP2P.sendFile(cleanControlFile),
              new Promise((_, reject) => setTimeout(() => reject(new Error('sendControlMessage timeout')), 15000))
            ]);
          } catch (e) {
            console.warn(`[WifiDirectService] ❌ sendControlMessage error: ${e.message}`);
            this._isSending = false;
            return false;
          }
        }
      } else {
        try {
          await Promise.race([
            WifiP2P.sendFile(cleanControlFile),
            new Promise((_, reject) => setTimeout(() => reject(new Error('sendControlMessage timeout')), 15000))
          ]);
        } catch (e) {
          console.warn(`[WifiDirectService] ❌ sendControlMessage error: ${e.message}`);
          this._isSending = false;
          return false;
        }
      }
      console.log(`[WifiDirectService] ✅ sendControlMessage réussi${useAddress ? ` (vers ${useAddress})` : ''}`);
      // V1.0.18: Nettoyer le fichier de contrôle après envoi
      try { await FileSystem.deleteAsync(controlFile, { idempotent: true }); } catch (_) {}
      return true;
    } catch (e) {
      console.warn(`[WifiDirectService] ❌ sendControlMessage error: ${e.message}`);
      return false;
    } finally {
      this._isSending = false;
    }
  }

  // V3.20 (BUG-047 fix) : Définit l'IP cible pour sendFileTo (Slave IP reçue via Mesh)
  setTargetPeerIp(ip) {
    this._targetPeerIp = ip;
    console.log(`[WifiDirectService] 🎯 [V3.20] Target peer IP défini: ${ip || '(null)'}`);
  }

  // V3.34 (FIX 15) : Définit le rôle logique MASTER/SLAVE (basé sur le score Mesh)
  // Sur Itel A50 (Mediatek), getConnectionInfo() retourne toujours GO=true même quand
  // on est le Slave. Le rôle logique permet d'envoyer au bon destinataire.
  setLogicalRole(role) {
    this._logicalRole = role;
    console.log(`[WifiDirectService] 🎯 [V3.34] Rôle logique défini: ${role}`);
  }

  // V4.4 (EHOSTUNREACH fix) : Envoi multi-IP avec fallback automatique.
  // Quand le Slave change d'IP entre la détection NetInfo et le vrai transfert,
  // on essaie les IPs alternatives (.2 → .3 → .4 → .5 → .6) automatiquement.
  async _sendFileToWithFallback(cleanPath, primaryIp, timeoutMs = 120000) {
    const ipsToTry = [];
    if (primaryIp && primaryIp.startsWith('192.168.49.')) {
      const parts = primaryIp.split('.');
      const base = parts.slice(0, 3).join('.') + '.';
      const primaryNum = parseInt(parts[3], 10);
      ipsToTry.push(primaryIp);
      for (let i = 2; i <= 6; i++) {
        if (i !== primaryNum) ipsToTry.push(`${base}${i}`);
      }
    } else if (primaryIp) {
      ipsToTry.push(primaryIp);
    }

    for (const ip of ipsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[WifiDirectService] 📤 [V4.4] sendFileTo ${ip} (tentative ${attempt}/2)`);
          await Promise.race([
            WifiP2P.sendFileTo(cleanPath, ip),
            new Promise((_, reject) => setTimeout(() => reject(new Error('sendFileTo timeout')), timeoutMs))
          ]);
          console.log(`[WifiDirectService] ✅ [V4.4] sendFileTo réussi vers ${ip}`);
          if (ip !== primaryIp) {
            this._targetPeerIp = ip;
            console.log(`[WifiDirectService] 🎯 [V4.4] IP Slave corrigée: ${ip} (était ${primaryIp})`);
          }
          return true;
        } catch (e) {
          console.warn(`[WifiDirectService] ❌ [V4.4] sendFileTo ${ip} erreur (tentative ${attempt}): ${e.message}`);
          if (e.message.includes('EHOSTUNREACH') && attempt === 2) break;
          if (attempt < 2) await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
    return false;
  }

  // V3.21 (Option C / BUG-047 fix) : Récupère la VRAIE IP locale sur l'interface p2p.
  // On appelle la méthode NATIVE getP2pIpAddress() (ajoutée dans WiFiP2PManagerModule.java)
  // qui parcourt les NetworkInterface et retourne l'IP en 192.168.49.x.
  // PLUS de fallback hardcodé 192.168.49.2 : une IP fausse provoquait EHOSTUNREACH côté
  // Master (sendFileTo vers une adresse inexistante). Si la vraie IP est introuvable,
  // on retourne null → le Master n'enverra PAS vers une adresse au hasard.
  async getLocalP2pIp() {
    if (!this._nativeReady || !WifiP2P) return null;
    try {
      // V4.0 BUG-047 FIX : Utiliser getP2pLocalIp (nouvelle méthode native)
      // au lieu de getP2pIpAddress qui échoue sur l'itel A50 (Mediatek)
      if (typeof WifiP2P.getP2pLocalIp === 'function') {
        const ip = await Promise.race([
          WifiP2P.getP2pLocalIp(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
        if (ip && typeof ip === 'string' && ip.startsWith('192.168.49.')) {
          this._localP2pIp = ip;
          console.log(`[WifiDirectService] 🌐 [V4.0] IP locale p2p (getP2pLocalIp): ${ip}`);
          return ip;
        }
        console.warn(`[WifiDirectService] ⚠️ [V4.0] getP2pLocalIp retourné null/incorrect (retour=${ip}).`);
      } else {
        // V4.3: La méthode native n'est pas dans l'APK — le code Java existe dans
        // node_modules mais l'APK n'a pas été rebuildé. NetInfo ne peut PAS remplacer
        // cette méthode car il retourne l'IP WiFi LAN (192.168.1.x), pas l'IP P2P (192.168.49.x).
        console.warn(`[WifiDirectService] ⚠️ [V4.3] getP2pLocalIp UNDEFINED — APK stale ! Reconstruisez l'APK pour inclure la méthode native. NetInfo retournera l'IP WiFi LAN (inutile pour P2P).`);
      }

      // Fallback : ancienne méthode getP2pIpAddress
      if (typeof WifiP2P.getP2pIpAddress === 'function') {
        const ip = await Promise.race([
          WifiP2P.getP2pIpAddress(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]);
        if (ip && typeof ip === 'string' && ip.startsWith('192.168.49.')) {
          this._localP2pIp = ip;
          console.log(`[WifiDirectService] 🌐 [V4.0] IP locale p2p (fallback getP2pIpAddress): ${ip}`);
          return ip;
        }
        console.warn(`[WifiDirectService] ⚠️ [V4.0] getP2pIpAddress sans IP p2p (retour=${ip}).`);
      } else {
        console.warn(`[WifiDirectService] ⚠️ [V4.0] Aucune méthode native disponible (rebuild APK requis).`);
      }

      this._localP2pIp = null;
      return null;
    } catch (e) {
      console.warn(`[WifiDirectService] ⚠️ [V4.0] getLocalP2pIp échoué: ${e.message}`);
      this._localP2pIp = null;
      return null;
    }
  }

  // V3.20 (BUG-047 fix) : Reset entre sessions
  resetTargetPeerIp() {
    this._targetPeerIp = null;
    this._localP2pIp = null;
    console.log('[WifiDirectService] 🧹 [V3.20] Target peer IP reset');
  }

  // V4.1 (BUG-047 fix) : Decouvrir l'IP reelle du Slave depuis le cote GO (Master).
  // Apres qu'un client se connecte au groupe WiFi Direct, le GO peut appeler
  // getGroupInfo() pour obtenir la liste des clients. Le mapper expose maintenant
  // clientList. On utilise cette info pour definir _targetPeerIp.
  async discoverSlaveIpViaGroupInfo() {
    if (!this._nativeReady || !WifiP2P) return null;
    if (!this.isGroupOwner) return null;
    try {
      const groupInfo = await Promise.race([
        WifiP2P.getGroupInfo(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);
      if (groupInfo && groupInfo.clientList && groupInfo.clientList.length > 0) {
        console.log(`[WifiDirectService] 🌐 [V4.1] getGroupInfo: ${groupInfo.clientList.length} client(s) connecte(s)`);
        // Le GO est 192.168.49.1, le premier client est typiquement 192.168.49.2
        // On ne peut pas lire l'IP exacte depuis le mapper (pas d'IP dans clientList)
        // mais on sait qu'un client EST connecte → 192.168.49.2 est le meilleur guess
        if (!this._targetPeerIp || this._targetPeerIp === this.groupOwnerAddress) {
          this._targetPeerIp = '192.168.49.2';
          console.log(`[WifiDirectService] 🎯 [V4.1] Slave IP via groupInfo: ${this._targetPeerIp}`);
          return this._targetPeerIp;
        }
        return this._targetPeerIp;
      }
    } catch (e) {
      console.warn(`[WifiDirectService] ⚠️ [V4.1] discoverSlaveIpViaGroupInfo echoue: ${e.message}`);
    }
    return null;
  }

  // V3.1 (BUG-053 fix): Force la mise à jour de `wifiP2pInfo` côté natif Android
  // Le code natif de react-native-wifi-p2p crash avec NPE si wifiP2pInfo est null
  // (cf. WiFiP2PManagerModule.java ligne 260 : `wifiP2pInfo.groupOwnerAddress != null`)
  // On appelle getConnectionInfo() pour peupler le champ avant tout sendFile
  async _refreshConnectionInfo() {
    if (!this._nativeReady || !WifiP2P) return false;
    if (!this.isConnected) return false;
    try {
      const info = await Promise.race([
        WifiP2P.getConnectionInfo(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('getConnectionInfo timeout')), 3000))
      ]);
      if (info && info.groupFormed) {
        this.isGroupOwner = !!info.isGroupOwner;
        // V3.35: groupOwnerAddress peut être un objet {address: "192.168.49.1"} sur certains chipsets
        let rawAddr = info.groupOwnerAddress;
        if (rawAddr && typeof rawAddr === 'object') {
          rawAddr = rawAddr.address || rawAddr.getHostAddress?.() || '192.168.49.1';
        }
        this.groupOwnerAddress = (!rawAddr || rawAddr === 'null') ? '192.168.49.1' : rawAddr;
        console.log(`[WifiDirectService] 🔄 ConnectionInfo rafraîchi: GO=${this.isGroupOwner}, addr=${this.groupOwnerAddress}`);
        return true;
      }
      return false;
    } catch (e) {
      console.warn(`[WifiDirectService] ⚠️ getConnectionInfo échoué: ${e.message}`);
      return false;
    }
  }

  async startReceiving(callback) {
    if (this._receiveMessages) return;
    this._receiveMessages = true;
    this._isReceiving = true; // V4.2: Empêcher disconnect() pendant réception
    
    const mediaDir = `${FileSystem.documentDirectory}loba_media/`.replace('file://', '');
    const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}loba_media/`);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}loba_media/`, { intermediates: true });
    }

    console.log('[WifiDirectService] 📡 En attente de fichiers...');

    // V4.3 (BUG-047 fix): Détecter la vraie IP du Slave via NetInfo au démarrage du récepteur.
    // V4.4: Si NetInfo retourne une IP non-P2P, on N'ENVOIE PAS le fallback .2 (qui est faux).
    // Le Master utilisera _sendFileToWithFallback pour découvrir la vraie IP.
    try {
      const state = await NetInfo.fetch();
      const ip = state?.details?.ipAddress;
      if (ip && typeof ip === 'string' && ip.startsWith('192.168.49.')) {
        this._localP2pIp = ip;
        console.log(`[WifiDirectService] 🌐 [V4.4] IP Slave via NetInfo: ${ip} (confiante)`);
        this._emit('onSlaveIpKnown', { ip, confident: true });
      } else {
        console.log(`[WifiDirectService] ⚠️ [V4.4] NetInfo IP non-p2p: ${ip} — tentative getP2pLocalIp() natif...`);
        // V4.4: Essayer le natif même si undefined (sera undefined si APK stale)
        let detectedIp = null;
        try {
          detectedIp = await this.getLocalP2pIp();
        } catch (_) {}
        if (detectedIp) {
          this._localP2pIp = detectedIp;
          console.log(`[WifiDirectService] 🌐 [V4.4] IP Slave via natif: ${detectedIp} (confiante)`);
          this._emit('onSlaveIpKnown', { ip: detectedIp, confident: true });
        } else {
          console.log(`[WifiDirectService] ⚠️ [V4.4] IP Slave inconnue — Master devra découvrir via fallback multi-IP`);
          this._emit('onSlaveIpKnown', { ip: null, confident: false });
        }
      }
    } catch (e) {
      console.warn(`[WifiDirectService] ⚠️ [V4.4] NetInfo fetch échoué: ${e.message}`);
      this._emit('onSlaveIpKnown', { ip: null, confident: false });
    }

    while (this._receiveMessages && this.isConnected) {
      try {
        const filename = `p2p_${Date.now()}`;
        const path = await Promise.race([
          WifiP2P.receiveFile(mediaDir, filename),
          new Promise((_, reject) => setTimeout(() => reject(new Error('receiveFile timeout')), 60000))
        ]);
        if (path) {
          console.log(`[WifiDirectService] 📨 Fichier reçu: ${path}`);
          try {
            let fileInfo = await FileSystem.getInfoAsync(path);
            let fileSize = fileInfo.size || 0;

            // V3.35 (Mediatek 0B bug): Sur chipsets Mediatek (Itel A50), le transfert TCP
            // WiFi Direct retourne avant que le fichier soit flushé sur disque → 0B.
            // Solution : relire après 1.5-3s max 2 fois avant d'abandonner.
            if (fileSize === 0) {
              for (let retry = 1; retry <= 2; retry++) {
                const waitMs = retry * 1500;
                console.log(`[WifiDirectService] ⏳ [V3.35] Fichier 0B — retry #${retry} dans ${waitMs}ms...`);
                await new Promise(r => setTimeout(r, waitMs));
                fileInfo = await FileSystem.getInfoAsync(path);
                fileSize = fileInfo.size || 0;
                if (fileSize > 0) {
                  console.log(`[WifiDirectService] ✅ [V3.35] Retry #${retry} réussi: ${fileSize}B`);
                  break;
                }
              }
            }

            // V3.24 (BUG-056 fix): Fichiers < 5KB = messages de contrôle ou corrompus
            // Les vrais LOBA_PACK font au minimum plusieurs KB (même un seul post)
            // Les messages contrôle (PACK_RECEIVED_OK, YABISSO_HELLO, etc.) font 100-500 octets
            if (fileSize < 5120) {
              try {
                const content = await FileSystem.readAsStringAsync(path);
                if (content && content.length > 0) {
                  const meta = JSON.parse(content);
                  if (meta.action === 'CONTROL_MESSAGE') {
                    if (callback) callback(null, meta);
                    console.log(`[WifiDirectService] ⭐ Contrôle reçu (${fileSize}B): ${meta.type}`);
                    try { await FileSystem.deleteAsync(path, { idempotent: true }); } catch (_) {}
                    continue;
                  }
                } else {
                  // Fichier 0B ou vide après retry — supprimer définitivement
                  console.log(`[WifiDirectService] 🗑️ [V3.35] Fichier vide après retry (${fileSize}B, content=${content?.length || 0}chars) — ignoré`);
                  try { await FileSystem.deleteAsync(path, { idempotent: true }); } catch (_) {}
                  continue;
                }
              } catch (e) {
                console.log(`[WifiDirectService] ⚠️ [V3.35] Erreur lecture contrôle: ${e.message}`);
              }
              // Fichier petit non-JSON → probablement un contrôle corrompu, on le supprime
              console.log(`[WifiDirectService] ⚠️ [V3.24] Petit fichier ignoré (${fileSize}B) — pas un LOBA_PACK`);
              try { await FileSystem.deleteAsync(path, { idempotent: true }); } catch (_) {}
              continue;
            }

            // Vérifier si c'est un contrôle ou un vrai pack
            try {
              const content = await FileSystem.readAsStringAsync(path);
              const meta = JSON.parse(content);
              if (meta.action === 'CONTROL_MESSAGE') {
                if (callback) callback(null, meta);
                try { await FileSystem.deleteAsync(path, { idempotent: true }); } catch (_) {}
              } else if (meta.action === 'FILE_TRANSFER' || meta.type === 'LOBA_PACK') {
                if (callback) callback(path, meta);
              }
            } catch (_) {
              // Fichier binaire > 5KB → c'est probablement un pack ZIP, traiter comme LOBA_PACK
              if (callback) callback(path, { action: 'FILE_TRANSFER', type: 'LOBA_PACK', senderDevice: 'unknown' });
            }
          } catch (e) {
            console.warn(`[WifiDirectService] ⚠️ Erreur traitement fichier reçu: ${e.message}`);
          }
        }
      } catch (e) {
        console.warn(`[WifiDirectService] ⚠️ receiveFile: ${e.message}`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  stopReceiving() {
    this._receiveMessages = false;
    this._isReceiving = false; // V4.2: Réceptacle terminé, disconnect() autorisé
  }

  async disconnect() {
    // V4.2: Ne pas déconnecter pendant qu'on reçoit des fichiers
    if (this._isReceiving) {
      console.log('[WifiDirectService] ⏭️ [V4.2] disconnect() ignoré — réception en cours');
      return;
    }
    try { if (WifiP2P && this._nativeReady) await WifiP2P.removeGroup(); } catch (_) {}
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
