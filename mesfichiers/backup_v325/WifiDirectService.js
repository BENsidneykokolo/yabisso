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
    this._nativeReady = false;
    this._wifiDirectName = null;
    this._nonYabissoPeers = new Map();
    this._peerLastAttempt = new Map();
    this._localP2pIp = null; // IP locale réelle sur l'interface p2p (ex: 192.168.49.112)
    this._targetPeerIp = null; // IP cible pour sendFileTo (vraie IP du Slave)
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
          this.groupOwnerAddress = info.groupOwnerAddress === 'null' ? '192.168.49.1' : info.groupOwnerAddress;
          this.isConnecting = false;
          console.log(`[WifiDirectService] ✅ CONNECTÉ: GO=${this.isGroupOwner}`);
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
        // SLAVE: PAS de nettoyage — on se connecte directement au groupe du Master
        // Petit délai de sécurité pour les appareils bas de gamme (Itel)
        await new Promise(r => setTimeout(r, 500));

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

    // V3.20 (BUG-047 fix): Si on a l'IP du Slave (reçue via Mesh BLE par P2PAutoSync),
    // on utilise sendFileTo() avec cette IP au lieu de sendFile() qui s'envoie à soi-même.
    //
    // BUG-047 ROOT CAUSE : sendFile() dans react-native-wifi-p2p v3.6.1 appelle
    //   sendFileTo(filePath, wifiP2pInfo.groupOwnerAddress.getHostAddress(), promise)
    // Pour le Master (GO), groupOwnerAddress = 192.168.49.1 (sa PROPRE IP).
    // Combiné avec le fait que le Master appelle aussi startReceiving() (qui ouvre
    // un serveur sur 8988), le client socket du Master se connecte à SON PROPRE
    // serveur → self-loop. Le fichier est écrit dans le propre loba_media du Master,
    // le Slave ne reçoit JAMAIS le pack.
    //
    // FIX V3.20 : Si _targetPeerIp est défini, utiliser sendFileTo(_targetPeerIp, ...)
    // pour connecter le client au serveur du Slave (port 8988 sur l'IP du Slave).
    let useAddress = null;
    if (this._targetPeerIp && this._targetPeerIp !== this.groupOwnerAddress) {
      useAddress = this._targetPeerIp;
      console.log(`[WifiDirectService] 📤 [V3.20] sendFileTo vers Slave IP=${useAddress} (pas self-loop)`);
    } else {
      console.log(`[WifiDirectService] ⚠️ [V3.20] _targetPeerIp non défini (=${this._targetPeerIp}) — fallback sendFile (risque self-loop)`);
    }

    // V2.17 (BUG-047 fix): Retry 2x si échec
    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (filePath) {
          const cleanPath = filePath.replace('file://', '');
          console.log(`[WifiDirectService] 📤 sendFile (tentative ${attempt}/${MAX_RETRIES}): ${cleanPath}`);
          if (useAddress) {
            // V3.20 : envoyer au Slave (vrai destinataire)
            await Promise.race([
              WifiP2P.sendFileTo(cleanPath, useAddress),
              new Promise((_, reject) => setTimeout(() => reject(new Error('sendFileTo timeout')), 120000))
            ]);
          } else {
            // Fallback : comportement legacy (risque self-loop)
            await Promise.race([
              WifiP2P.sendFile(cleanPath),
              new Promise((_, reject) => setTimeout(() => reject(new Error('sendFile timeout')), 120000))
            ]);
          }
          console.log(`[WifiDirectService] ✅ sendFile réussi (tentative ${attempt})`);
          this._emit('onTransferProgress', { hash: metadata.hash, progress: 100, status: 'complete' });
          this._isSending = false;
          return true;
        }
      } catch (e) {
        console.warn(`[WifiDirectService] ❌ sendFile error (tentative ${attempt}): ${e.message}`);
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 3000));
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
      // V3.20 (BUG-047 fix): Si on a l'IP du Slave, utiliser sendFileTo pour éviter le self-loop
      let useAddress = null;
      if (this._targetPeerIp && this._targetPeerIp !== this.groupOwnerAddress) {
        useAddress = this._targetPeerIp;
      }
      if (useAddress) {
        await Promise.race([
          WifiP2P.sendFileTo(cleanControlFile, useAddress),
          new Promise((_, reject) => setTimeout(() => reject(new Error('sendControlMessageTo timeout')), 15000))
        ]);
      } else {
        await Promise.race([
          WifiP2P.sendFile(cleanControlFile),
          new Promise((_, reject) => setTimeout(() => reject(new Error('sendControlMessage timeout')), 15000))
        ]);
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
        this.groupOwnerAddress = info.groupOwnerAddress === 'null' ? '192.168.49.1' : info.groupOwnerAddress;
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
    
    const mediaDir = `${FileSystem.documentDirectory}loba_media/`.replace('file://', '');
    const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}loba_media/`);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}loba_media/`, { intermediates: true });
    }

    console.log('[WifiDirectService] 📡 En attente de fichiers...');
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
            const fileInfo = await FileSystem.getInfoAsync(path);
            const fileSize = fileInfo.size || 0;

            // V3.24 (BUG-056 fix): Fichiers < 5KB = messages de contrôle ou corrompus
            // Les vrais LOBA_PACK font au minimum plusieurs KB (même un seul post)
            // Les messages contrôle (PACK_RECEIVED_OK, YABISSO_HELLO, etc.) font 100-500 octets
            if (fileSize < 5120) {
              try {
                const content = await FileSystem.readAsStringAsync(path);
                const meta = JSON.parse(content);
                if (meta.action === 'CONTROL_MESSAGE') {
                  if (callback) callback(null, meta);
                  console.log(`[WifiDirectService] ⭐ Contrôle reçu (${fileSize}B): ${meta.type}`);
                  try { await FileSystem.deleteAsync(path, { idempotent: true }); } catch (_) {}
                  continue;
                }
              } catch (_) {}
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
  }

  async disconnect() {
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
