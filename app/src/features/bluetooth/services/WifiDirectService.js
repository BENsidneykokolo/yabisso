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
    this.isGroupOwner = false;
    this.groupOwnerAddress = null;
    this.isSupported = true;
    this.isDiscovering = false;
    this.isConnecting = false;
    this.isLocationEnabled = true;
    this._receiveMessages = false;
    this._lastSendAttempt = 0;
    this._lastConnectAttempt = 0; // Cooldown entre les tentatives de connexion
    this.listeners = {
      onPeerFound: [],
      onPeerLost: [],
      onConnectionChange: [],
      onTransferProgress: [],
      onLogUpdate: [],
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

    // Wrapper global: garantit que isInitializing est toujours remis à false
    try {
      if (!WifiP2P || Platform.OS !== 'android') {
        console.warn('[WifiDirectService] Non disponible sur cette plateforme.');
        this.isInitializing = false;
        return false;
      }

      // 0. Vérifier le GPS (Android) — non-bloquant, certains appareils peuvent échouer ici
      if (Platform.OS === 'android') {
        try {
          const providerStatus = await Location.getProviderStatusAsync();
          this.isLocationEnabled = providerStatus.locationServicesEnabled;
          if (!this.isLocationEnabled) {
            console.warn('[WifiDirectService] GPS désactivé. La détection P2P peut échouer.');
          }
        } catch (gpsErr) {
          // Sur certains appareils budget (ex: itel), cette API peut échouer
          // On continue quand même — ce n'est pas bloquant
          console.warn('[WifiDirectService] Vérification GPS ignorée (non-bloquant):', gpsErr?.message);
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
        await WifiP2P.initialize();
      } catch (nativeErr) {
        // Ignorer l'erreur d'initialisation multiple (fréquente en Hot Reload)
        if (nativeErr?.message?.includes('initialized once') || nativeErr?.message?.includes('already initialized')) {
          console.log('[WifiDirectService] Module natif déjà initialisé (ignoring error).');
        } else {
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
          this.isGroupOwner = !!info.isGroupOwner;
          this.groupOwnerAddress = info.groupOwnerAddress || '192.168.49.1';
          this.isConnecting = false;
          console.log(`[WifiDirectService] Connexion P2P: GO=${this.isGroupOwner}, GOAddr=${this.groupOwnerAddress}`);
          NetworkRailDetector.setWifiDirectAvailable(true);
          this._emit('onConnectionChange', { connected: true, info });
        } else {
          this.connectedPeer = null;
          this.isGroupOwner = false;
          this.groupOwnerAddress = null;
          this.isConnecting = false;
          NetworkRailDetector.setWifiDirectAvailable(false);
          this._emit('onConnectionChange', { connected: false });
        }
      });

      console.log('[WifiDirectService] Initialisé avec succès.');
      return true;
    } catch (e) {
      // Ce catch global est le filet de sécurité — isInitializing EST TOUJOURS remis à false
      if (e?.message?.includes('P2P_UNSUPPORTED')) {
        console.warn('[WifiDirectService] P2P non supporté sur ce matériel.');
        this.isSupported = false;
      } else {
        console.error('[WifiDirectService] Erreur initialisation:', e?.message || e);
      }
      this.isInitializing = false;
      return false;
    }
  }

  /**
   * Démarre la découverte de peers WiFi Direct.
   * IMPORTANT: Toujours stopper puis redémarrer pour éviter les erreurs
   * "already discovering" du framework natif Android.
   */
  async startDiscovery(force = false) {
    if (!this.initialized || !this.isSupported) {
      console.warn('[WifiDirectService] startDiscovery: non initialisé ou non supporté, abandon.');
      return false;
    }

    if (this.isDiscovering && !force) {
      // Déjà en cours selon notre état JS — on fait quand même confiance à Android
      return true;
    }

    // Vérifier le GPS
    if (Platform.OS === 'android') {
      try {
        const providerStatus = await Location.getProviderStatusAsync();
        this.isLocationEnabled = providerStatus.locationServicesEnabled;
        if (!this.isLocationEnabled) {
          console.error('[WifiDirectService] Impossible de démarrer : GPS désactivé.');
          this.isDiscovering = false;
          return false;
        }
      } catch (locErr) {
        // Ne pas bloquer si on ne peut pas vérifier le GPS
        console.warn('[WifiDirectService] Vérification GPS ignorée:', locErr?.message);
      }
    }

    // TOUJOURS stopper d'abord — c'est la clé pour éviter "BUSY" / "already discovering"
    try { await WifiP2P.stopDiscoveringPeers(); } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, 300)); // Laisser le hardware respirer

    try {
      this.isDiscovering = true;
      await WifiP2P.startDiscoveringPeers();
      console.log('[WifiDirectService] Découverte de peers démarrée.');
      return true;
    } catch (e) {
      const errCode = e?.code;
      const errMsg = typeof e === 'string' ? e : (e?.message || '');

      // Err 0 = BUSY — Android n'a pas encore libéré la puce, on attend + retry
      if (errCode === 0 || errMsg.includes('internal error') || errMsg.includes('BUSY')) {
        console.warn('[WifiDirectService] Hardware Busy. Retry dans 2s...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          await WifiP2P.startDiscoveringPeers();
          console.log('[WifiDirectService] Découverte démarrée après retry.');
          return true;
        } catch (retryErr) {
          console.error('[WifiDirectService] Échec permanent de la découverte:', retryErr?.message || retryErr);
        }
      } else if (errMsg.includes('P2P_UNSUPPORTED')) {
        console.warn('[WifiDirectService] P2P non supporté sur ce matériel.');
        this.isSupported = false;
      } else {
        console.error('[WifiDirectService] Erreur découverte:', errMsg);
      }

      this.isDiscovering = false;
      return false;
    }
  }

  /**
   * Arrête la découverte.
   */
  async stopDiscovery() {
    this.isDiscovering = false;
    if (!this.initialized) return;
    try {
      await WifiP2P.stopDiscoveringPeers();
    } catch (e) {
      console.warn('[WifiDirectService] stopDiscovery:', e.message);
    }
  }

  /**
   * Se connecte à un peer WiFi Direct.
   * 
   * STRATÉGIE ANTI-COLLISION:
   * Chaque téléphone voit l'ADRESSE MAC de l'autre (qui est différente).
   * On utilise cette adresse pour calculer un DÉLAI DÉTERMINISTE:
   * - Le téléphone qui voit un peer avec un "gros" MAC attend longtemps
   * - Le téléphone qui voit un peer avec un "petit" MAC attend peu
   * → Un seul téléphone connecte en premier, l'autre voit la connexion et abandonne.
   */
  async connectToPeer(device, retryCount = 0) {
    if (!this.initialized) return false;

    // VERROU 1: déjà connecté ou connexion en cours
    if (this.isConnecting) {
      console.log('[WifiDirectService] Connexion déjà en cours, requête ignorée.');
      return false;
    }
    if (this.connectedPeer) {
      console.log('[WifiDirectService] Déjà connecté, requête ignorée.');
      return false;
    }

    // VERROU 2: cooldown de 15s entre les tentatives
    const now = Date.now();
    if (now - this._lastConnectAttempt < 15000 && retryCount === 0) {
      console.log('[WifiDirectService] Cooldown actif, requête ignorée.');
      return false;
    }

    // Arrêt du scan AVANT la connexion (requis par les drivers budget)
    if (this.isDiscovering) {
      console.log('[WifiDirectService] Arrêt du scan avant connexion...');
      await this.stopDiscovery();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // DÉLAI DÉTERMINISTE basé sur l'adresse MAC du peer
    // Chaque téléphone voit un peer DIFFÉRENT → délai DIFFÉRENT → UN SEUL gagne
    const macAddr = device.deviceAddress || '';
    const lastByte = parseInt(macAddr.split(':').pop() || '0', 16); // 0-255
    const delay = lastByte * 50; // 0ms - 12750ms selon le peer qu'on voit
    console.log(`[WifiDirectService] Délai déterministe: ${delay}ms (MAC peer: ...${macAddr.split(':').pop()})...`);
    await new Promise(resolve => setTimeout(resolve, delay));

    // Vérifier après le délai (l'autre téléphone a peut-être déjà connecté)
    if (this.isConnecting || this.connectedPeer) {
      console.log('[WifiDirectService] Connexion déjà établie pendant le délai — abandon.');
      return false;
    }

    this.isConnecting = true;
    this._lastConnectAttempt = Date.now();
    try {
      console.log(`[WifiDirectService] Connexion à ${device.deviceName || device.deviceAddress}...`);
      await WifiP2P.connect(device.deviceAddress);
      console.log('[WifiDirectService] Commande de connexion envoyée. En attente de confirmation...');
      return true;
    } catch (e) {
      const errCode = e?.code;
      const errMsg = e?.message || '';
      // code:2 = BUSY
      if ((errCode === 2 || errMsg.includes('busy')) && retryCount < 1) {
        console.warn('[WifiDirectService] Framework busy. Retry dans 5s...');
        this.isConnecting = false;
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.connectToPeer(device, retryCount + 1);
      }
      // code:0 = Collision GO Negotiation — on passe en mode passif
      if (errCode === 0 || errMsg.includes('internal error')) {
        console.log('[WifiDirectService] Collision détectée. Mode passif: on attend que l\'autre se connecte.');
        // Relancer la découverte pour rester visible
        this.isDiscovering = false;
        setTimeout(() => this.startDiscovery(true), 2000);
      } else {
        console.warn('[WifiDirectService] Erreur connexion:', errMsg);
      }
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * Envoie un fichier au peer connecté.
   * @param {string} filePath - Chemin local du fichier
   * @param {Object} metadata - { hash, type, category, size }
   * @returns {boolean} true si envoyé avec succès
   */
  /**
   * Vérifie si ce device peut envoyer via sendMessage/sendFile.
   * IMPORTANT: react-native-wifi-p2p sendMessage() envoie TOUJOURS au Group Owner (192.168.49.1:8988).
   * Donc seul le CLIENT (non-GO) peut utiliser sendMessage/sendFile.
   * Le GO ne peut PAS envoyer via cette API — il doit uniquement RECEVOIR.
   */
  canSend() {
    if (!this.initialized || !this.connectedPeer) return false;
    // Le GO ne peut pas envoyer via sendMessage — ça cible toujours le GO (lui-même)
    if (this.isGroupOwner) return false;
    return true;
  }

  async sendFile(filePath, metadata = {}) {
    if (!this.initialized || !this.connectedPeer) {
      console.warn('[WifiDirectService] Pas connecté à un peer.');
      return false;
    }

    // Anti-spam: limiter les tentatives d'envoi (minimum 10s entre chaque)
    const now = Date.now();
    if (now - this._lastSendAttempt < 10000) {
      return false; // Silencieux, on ne spamme pas les logs
    }
    this._lastSendAttempt = now;

    // VERIFICATION DU ROLE CRITIQUE:
    // react-native-wifi-p2p sendMessage() envoie TOUJOURS vers 192.168.49.1:8988 (le Group Owner).
    // Si ce device EST le Group Owner, sendMessage s'envoie à lui-même → ECONNREFUSED.
    // Le GO doit UNIQUEMENT recevoir. Seul le Client peut envoyer.
    try {
      const info = await WifiP2P.getConnectionInfo();
      if (info && info.isGroupOwner) {
        // Le GO ne peut PAS envoyer via sendMessage — c'est une limitation de l'API WiFi P2P.
        // Le GO écoute via receiveMessage/receiveFile. Le client envoie.
        console.log('[WifiDirectService] Ce device est le Group Owner — impossible d\'envoyer via sendMessage (API P2P limitation). Attente de réception depuis un client.');
        return false;
      }
      if (info && !info.groupFormed) {
        console.warn('[WifiDirectService] Groupe non formé. Annulation de l\'envoi.');
        return false;
      }
    } catch (err) {
      console.warn('[WifiDirectService] getConnectionInfo indisponible, tentative directe:', err?.message);
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
      
      try {
        await WifiP2P.sendMessage(metaPayload);
      } catch (msgErr) {
        console.warn('[WifiDirectService] Échec sendMessage natif:', msgErr.message);
        return false;
      }

      // Petite pause pour laisser le récepteur parser le message avant d'envoyer le binaire
      if (filePath) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          await WifiP2P.sendFile(nativePath);
          console.log(`[WifiDirectService] Fichier envoyé avec succès: ${metadata.hash}`);
        } catch (sendErr) {
          console.warn('[WifiDirectService] Échec sendFile natif:', sendErr.message);
          return false;
        }
      } else {
        console.log('[WifiDirectService] Ping envoyé avec succès.');
      }

      this._emit('onTransferProgress', { hash: metadata.hash || 'ping', progress: 100, status: 'complete' });
      return true;
    } catch (e) {
      console.warn('[WifiDirectService] Erreur globale envoi:', e.message || e);
      const errorMsg = e?.message || (typeof e === 'string' ? e : 'Unknown error');
      this._emit('onTransferProgress', { hash: metadata.hash || 'ping', progress: 0, status: 'failed', error: errorMsg });
      return false;
    }
  }

  /**
   * Écoute les fichiers entrants.
   * IMPORTANT: Ne démarrer QUE si un peer est connecté.
   * Démarrer le MessageServer natif sans connexion cause un OOM sur appareils budget.
   * @param {Function} onFileReceived - (filePath, metadata) => void
   */
  async startReceiving(onFileReceived) {
    if (!this.initialized || this._receiveMessages) return;

    // GARDE CRITIQUE: ne pas démarrer le serveur TCP sans connexion active
    if (!this.connectedPeer) {
      console.warn('[WifiDirectService] startReceiving ignoré: aucun peer connecté.');
      return;
    }

    try {
      // S'assurer que le dossier existe avant de recevoir
      const mediaDir = `${FileSystem.documentDirectory}loba_media/`;
      const nativeMediaDir = mediaDir.replace('file://', '');

      const dirInfo = await FileSystem.getInfoAsync(mediaDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(mediaDir, { intermediates: true });
      }

      this._receiveMessages = true;
      console.log('[WifiDirectService] Démarrage de la boucle de réception...');
      this._messageLoop(nativeMediaDir, onFileReceived);
    } catch (e) {
      console.error('[WifiDirectService] startReceiving error:', e);
    }
  }

  /**
   * Arrête proprement la boucle de réception.
   */
  stopReceiving() {
    this._receiveMessages = false;
    console.log('[WifiDirectService] Réception arrêtée.');
  }

  /**
   * Boucle de réception de messages (Promise-based, API correcte pour react-native-wifi-p2p v3+).
   * WifiP2P.receiveMessage() retourne une Promise qui résout une fois avec le message.
   */
  async _messageLoop(nativeMediaDir, onFileReceived) {
    while (this._receiveMessages && this.initialized) {
      try {
        const message = await WifiP2P.receiveMessage({});
        if (!message) continue;

        try {
          const meta = JSON.parse(message);

          if (meta.action === 'PING') {
            this._emit('onLogUpdate', [`⭐ REÇU PING de ${meta.username || 'Inconnu'}!`]);
          }

          if (meta.action === 'FILE_TRANSFER') {
            const logMsg = `📩 Transfert entrant: ${meta.hash?.substring(0,8)}... (${(meta.size / 1024 / 1024).toFixed(1)} MB)`;
            console.log(`[WifiDirectService] ${logMsg}`);
            this._emit('onLogUpdate', [logMsg]);

            WifiP2P.receiveFile(
              nativeMediaDir,
              meta.filename || `${meta.hash}.mp4`
            ).then((receivedPath) => {
              const successMsg = `✅ Fichier reçu: ${meta.hash?.substring(0,8)}`;
              console.log(`[WifiDirectService] ${successMsg}`);
              this._emit('onLogUpdate', [successMsg]);
              if (onFileReceived) onFileReceived(receivedPath, meta);
            }).catch(err => {
              const errMsg = `❌ Erreur réception: ${err?.message || 'Inconnue'}`;
              console.error(`[WifiDirectService] ${errMsg}`, err);
              this._emit('onLogUpdate', [errMsg]);
            });
          }
        } catch (parseErr) {
          console.log('[WifiDirectService] Message ignoré (non-JSON)');
        }
      } catch (e) {
        // Connexion fermée ou erreur — on arrête la boucle
        console.warn('[WifiDirectService] Boucle de réception terminée:', e?.message);
        break;
      }
    }
    this._receiveMessages = false;
  }

  /**
   * Déconnexion propre + redémarrage automatique de la découverte.
   * Après une déconnexion (ex: fin de transfert), le téléphone DOIT
   * relancer le scan pour trouver l'autre peer (swap de rôles).
   */
  async disconnect() {
    if (!this.initialized) return;
    try {
      // NOUVEAU: removeGroup est plus agressif que disconnect()
      // Il détruit vraiment la structure P2P formée.
      await WifiP2P.removeGroup();
      console.log('[WifiDirectService] Groupe supprimé via removeGroup.');
    } catch (e) {
      try {
        await WifiP2P.disconnect();
        console.log('[WifiDirectService] Déconnecté via fallback disconnect.');
      } catch (e2) {
        console.warn('[WifiDirectService] Disconnect error (ignoré):', e2.message);
      }
    }
    // Réinitialiser l'état de connexion
    this.connectedPeer = null;
    this.isGroupOwner = false;
    this.groupOwnerAddress = null;
    this._receiveMessages = false;
    NetworkRailDetector.setWifiDirectAvailable(false);
    console.log('[WifiDirectService] État réinitialisé.');

    // Relancer la découverte immédiatement pour permettre le swap de rôles
    // On attend 3s pour laisser Android dissoudre totalement le groupe P2P
    this.isDiscovering = false;
    setTimeout(async () => {
      if (this.initialized && this.isSupported) {
        console.log('[WifiDirectService] Relance de la découverte après déconnexion...');
        await this.startDiscovery(true);
      }
    }, 3000);
  }

  /**
   * Nettoyage complet.
   */
  async cleanup() {
    this._receiveMessages = false;
    await this.stopDiscovery();
    await this.disconnect();
    this.isDiscovering = false;
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
