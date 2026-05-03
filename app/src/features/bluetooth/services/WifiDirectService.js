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
    this.isConnected = false;       // FIX: was undefined, broke setGlobalFileHandler check
    this._isSending = false;         // FIX: replaces time-based anti-spam
    this._lastConnectAttempt = 0; 
    this.globalFileHandler = null; // Phase 13: Handler global pour P2PAutoSync
    this.listeners = {
      onPeerFound: [],
      onPeerLost: [],
      onPeersUpdates: [],
      onSyncStatus: [],
      onConnectionChange: [],
      onTransferProgress: [],
      onLogUpdate: [],
    };
  }

  /**
   * Phase 13: Définit le handler global pour le traitement des fichiers reçus.
   */
  setGlobalFileHandler(handler) {
    this.globalFileHandler = handler;
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
        this._emit('onPeersUpdates', this.peers);
        this.peers.forEach(peer => {
          this._emit('onPeerFound', peer);
        });
      });

      // Écouter les changements de connexion
      WifiP2P.subscribeOnConnectionInfoUpdates((info = {}) => {
        if (info.groupFormed) {
          // Extraction robuste de l'IP du Group Owner
          let addr = info.groupOwnerAddress;
          
          // react-native-wifi-p2p renvoie souvent un objet { hostAddress: '...' }
          if (addr && typeof addr === 'object' && addr.hostAddress) {
            addr = addr.hostAddress;
          }
          
          // Fallback ultime si l'IP est absente ou non-string
          if (typeof addr !== 'string' || !addr || addr === 'null' || addr.includes('object')) {
            addr = '192.168.49.1';
          }
          
          this.connectedPeer = info;
          this.isConnected = true;
          this.isGroupOwner = !!info.isGroupOwner;
          this.groupOwnerAddress = addr;
          this.isConnecting = false;

          // FIX RACE CONDITION: Si le device était GO brièvement et est maintenant CLIENT,
          // arrêter le receiver natif qui tourne encore (sinon le port 8988 est occupé par le mauvais device)
          if (!this.isGroupOwner && this._receiveMessages) {
            console.log('[WifiDirectService] FIX: Rôle CLIENT détecté après GO transitoire — arrêt receiver.');
            this.stopReceiving();
          }

          const statusSuffix = this.isGroupOwner ? '(Portail Ouvert)' : '(Connecté au Portail)';
          console.log(`[WifiDirectService] ✅ CONNEXION ÉTABLIE: GO=${this.isGroupOwner}, Addr=${this.groupOwnerAddress} ${statusSuffix}`);
          
          NetworkRailDetector.setWifiDirectAvailable(true);

          this._emit('onConnectionChange', { 
            connected: true, 
            isGroupOwner: this.isGroupOwner,
            info 
          });

          // Phase 13: Automatisation de la réception
          if (this.isGroupOwner && this.globalFileHandler) {
             console.log('[WifiDirectService] Auto-Starting Receiver Server (Group Owner mode)...');
             this.startReceiving(this.globalFileHandler);
          }
        } else {
          const wasConnected = this.isConnected;
          this.connectedPeer = null;
          this.isGroupOwner = false;
          this.groupOwnerAddress = null;
          this.isConnecting = false;
          this.isConnected = false;
          
          if (wasConnected) {
            console.log('[WifiDirectService] ❌ CONNEXION PERDUE (ou déconnexion volontaire).');
          }
          
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

     // NOUVEAU: Bloquer le scan si on est en train de se connecter
     // Cela évite l'erreur framework "Internal Error" (collision matérielle)
     if (this.isConnecting && !force) {
       console.log('[WifiDirectService] Connexion en cours — scan ignoré pour éviter collision.');
       return false;
     }

     if (this.isDiscovering && !force) {
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
        console.warn('[WifiDirectService] Hardware Busy. Mode ZEN activé (Pause 5s)...');
        await new Promise(resolve => setTimeout(resolve, 5000));
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
   * Supprime le groupe WiFi Direct courant.
   */
  async removeGroup() {
    if (!this.initialized) return;
    try {
      await WifiP2P.removeGroup();
      this.isGroupOwner = false;
      this.connectedPeer = null;
      console.log('[WifiDirectService] Groupe supprimé avec succès.');
    } catch (e) {
      console.warn('[WifiDirectService] removeGroup erreur:', e.message);
    }
  }

  /**
   * Crée un groupe WiFi Direct (Devient le Group Owner).
   * Utilisé pour la méthode "Recevoir" (Mode Passif).
   */
   async createGroup(retryCount = 0) {
    if (!this.initialized) return false;

    // Nettoyer SEULEMENT au premier essai pour ne pas créer de boucle "Busy"
    if (retryCount === 0) {
      try {
        console.log('[WifiDirectService] Nettoyage préventif...');
        try { await WifiP2P.cancelConnect(); } catch(_) {}
        
        if (this.isDiscovering) {
          await this.stopDiscovery();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        if (this.isConnected) {
          await WifiP2P.removeGroup();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (e) {
        console.log('[WifiDirectService] Skip pre-create cleanup.');
      }
    }

    try {
      console.log(`[WifiDirectService] Création du groupe (Tentative ${retryCount})...`);
      await WifiP2P.createGroup();
      console.log('[WifiDirectService] Groupe créé avec succès. HOSTE actif.');
      this.isGroupOwner = true;
      return true;
    } catch (e) {
      const errMsg = e?.message || '';
      console.warn(`[WifiDirectService] ❌ Erreur createGroup (Retry ${retryCount}):`, errMsg);

      // Si le framework est occupé, on attend et on réessaie (Mode ZEN)
      if (retryCount < 2 && (errMsg.includes('busy') || errMsg.includes('BUSY') || e?.code === 0)) {
        console.log('[WifiDirectService] Framework occupé - Pause de 3s avant retry...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        return this.createGroup(retryCount + 1);
      }
      
      return false;
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

    // VERROU 2: cooldown entre les tentatives
    const now = Date.now();
    const cooldownMs = 5000; // 5 secondes suffisent pour empêcher le spam
    if (now - this._lastConnectAttempt < cooldownMs && retryCount === 0) {
      console.log('[WifiDirectService] Cooldown actif, retour.');
      return false;
    }

    // LOCK
    this.isConnecting = true;

    try {
      this._lastConnectAttempt = Date.now();
      const macAddr = device.deviceAddress || '';
      
      // STRATÉGIE ANTI-COLLISION DETERMINISTE:
      // On calcule un délai basé sur le dernier octet de la MAC.
      // Cela évite que les deux appareils lancent connect() exactement en même temps.
      if (retryCount === 0 && macAddr.includes(':')) {
        const parts = macAddr.split(':');
        const lastByte = parseInt(parts[parts.length - 1], 16) || 0;
        const delay = (lastByte % 15) * 100; // Délai entre 0 et 1500ms
        console.log(`[WifiDirectService] Anti-collision: Attente de ${delay}ms (MAC: ${macAddr})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Vérifier si l'autre nous a déjà connecté pendant l'attente
        if (this.connectedPeer || !this.isConnecting) {
          console.log('[WifiDirectService] Connexion déjà établie par le peer pendant le délai.');
          this.isConnecting = false;
          return true;
        }
      }

      console.log(`[WifiDirectService] Tentative de connexion (Retry ${retryCount}) à MAC: ${macAddr}...`);
      
      // Nettoyage matériel SEULEMENT si c'est un retry
      if (retryCount > 0) {
        console.log('[WifiDirectService] Nettoyage matériel (cancel) pour retry...');
        try { await WifiP2P.cancelConnect(); } catch(_) {}
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Lancer la connexion via le module natif
      // On force le groupOwnerIntent à 0 pour GARANTIR que l'appelant devient le Client (GC).
      console.log(`[WifiDirectService] Appel de WifiP2P.connectWithConfig (Intent=0)...`);
      if (WifiP2P.connectWithConfig) {
        await WifiP2P.connectWithConfig({ deviceAddress: macAddr, groupOwnerIntent: 0 });
      } else {
        await WifiP2P.connect(macAddr);
      }
      
      console.log('[WifiDirectService] ✅ Commande de connexion acceptée par le matériel. En attente...');
      // Note: isConnecting sera mis à false par l'event listener onConnectionChange
      return true;

    } catch (e) {
      this.isConnecting = false; // REINIT FLAG SUR ERREUR
      const errCode = e?.code;
      const errMsg = e?.message || '';

      console.warn(`[WifiDirectService] ❌ Erreur connexion (Code: ${errCode}):`, errMsg);

      // Autoriser jusqu'à 2 retries (Total: 3 tentatives)
      if (retryCount < 2) {
        if (errMsg.includes('internal error') || errCode === 0) {
          console.log('[WifiDirectService] Erreur BUSY Framework - Pause longue (10s) avant retry...');
          try { await WifiP2P.cancelConnect(); } catch(_) {}
          this.isConnecting = false;
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          this.isConnecting = false;
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        return this.connectToPeer(device, retryCount + 1);
      }

      console.warn('[WifiDirectService] Abandon après 3 tentatives infructueuses.');
      this.isConnecting = false;
      
      // Relancer la découverte pour rester visible
      setTimeout(() => this.startDiscovery(true), 3000);
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

    // Anti-spam: un seul envoi à la fois (remplace l'ancien cooldown 10s qui bloquait après swap de rôles)
    if (this._isSending) {
      console.warn('[WifiDirectService] Envoi déjà en cours, requête ignorée.');
      return false;
    }
    this._isSending = true;

    // VERIFICATION DU ROLE CRITIQUE:
    // react-native-wifi-p2p sendMessage() envoie TOUJOURS vers 192.168.49.1:8988 (le Group Owner).
    // Si ce device EST le Group Owner, sendMessage s'envoie à lui-même → ECONNREFUSED.
    // Le GO doit UNIQUEMENT recevoir. Seul le Client peut envoyer.
    try {
      const info = await WifiP2P.getConnectionInfo();
      if (info && info.isGroupOwner) {
        console.log('[WifiDirectService] Ce device est le Group Owner — impossible d\'envoyer (API P2P limitation).');
        this._isSending = false; // FIX: libérer le flag avant de retourner
        return false;
      }
      if (info && !info.groupFormed) {
        console.warn('[WifiDirectService] Groupe non formé. Annulation de l\'envoi.');
        this._isSending = false;
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
      
      // Envoyer les métadonnées en premier avec retry sur ECONNREFUSED
      // (le GO peut ne pas avoir démarré son MessageServer encore)
      let sendMsgOk = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await WifiP2P.sendMessage(metaPayload);
          sendMsgOk = true;
          break;
        } catch (msgErr) {
          const errMsg = msgErr?.message || '';
          if ((errMsg.includes('ECONNREFUSED') || errMsg.includes('isConnected failed')) && attempt < 2) {
            const waitSec = (attempt + 1) * 4;
            console.warn(`[WifiDirectService] GO pas encore prêt (ECONNREFUSED), attente ${waitSec}s (tentative ${attempt + 1}/3)...`);
            await new Promise(r => setTimeout(r, waitSec * 1000));
          } else {
            console.warn('[WifiDirectService] Échec sendMessage natif:', errMsg);
            return false;
          }
        }
      }
      if (!sendMsgOk) return false;

      let progressInterval = null;
      if (filePath) {
        console.log(`[WifiDirectService] 📤 Début du flux binaire pour ${metadata.hash}...`);
        
        // Simuler la progression toutes les 500ms jusqu'à 95%
        let simulatedProgress = 5;
        const estimatedTimeMs = (fileInfo.size / 1024 / 1024) * 500; // Estime 2Mo/s
        const step = Math.max(2, Math.floor(90 / (estimatedTimeMs / 500)));
        
        progressInterval = setInterval(() => {
          simulatedProgress = Math.min(95, simulatedProgress + step);
          this._emit('onTransferProgress', { 
            hash: metadata.hash, 
            progress: simulatedProgress, 
            status: 'sending',
            size: fileInfo.size 
          });
        }, 500);

        await new Promise(resolve => setTimeout(resolve, 3000)); // FIX: laisser 3s au GO pour démarrer receiveFile()
        try {
          await WifiP2P.sendFile(nativePath);
          if (progressInterval) clearInterval(progressInterval);
          console.log(`[WifiDirectService] ✅ Fichier envoyé avec succès: ${metadata.hash}`);
        } catch (sendErr) {
          if (progressInterval) clearInterval(progressInterval);
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
    } finally {
      this._isSending = false; // FIX: toujours libérer le flag
    }
  }

  /**
   * Écoute les fichiers entrants.
   * IMPORTANT: Ne démarrer QUE si un peer est connecté.
   * Démarrer le MessageServer natif sans connexion cause un OOM sur appareils budget.
   * @param {Function} onFileReceived - (filePath, metadata) => void
   */
  setGlobalFileHandler(callback) {
    this.globalFileHandler = callback;
    // Si on est déjà connecté en tant que GO, on démarre immédiatement
    if (this.isConnected && this.isGroupOwner && !this._receiveMessages) {
       this.startReceiving(callback);
    }
  }

  async startReceiving(onFileReceived) {
    if (!this.initialized || this._receiveMessages) return;

    // GARDE CRITIQUE: ne pas démarrer le serveur TCP sans connexion active
    if (!this.connectedPeer) {
      console.warn('[WifiDirectService] startReceiving ignoré: aucun peer connecté.');
      return;
    }

    if (this._isMessageLoopRunning) {
      console.warn('[WifiDirectService] startReceiving ignoré: la boucle tourne déjà.');
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
    try {
      WifiP2P.stopReceivingMessage();
    } catch (_) {}
    console.log('[WifiDirectService] Réception arrêtée.');
  }

  /**
   * Boucle de réception de messages (Promise-based, API correcte pour react-native-wifi-p2p v3+).
   * WifiP2P.receiveMessage() retourne une Promise qui résout une fois avec le message.
   */
  async _messageLoop(nativeMediaDir, onFileReceived) {
    this._isMessageLoopRunning = true;
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

            const nativeFilename = meta.filename || `${meta.hash}.zip`;
            const expectedUri = `file://${nativeMediaDir}${nativeFilename}`;
            let fileHandled = false;

            // --- Progress simulation ---
            let simulatedProgress = 0;
            const progressInterval = setInterval(() => {
              simulatedProgress = Math.min(95, simulatedProgress + 2);
              this._emit('onTransferProgress', { hash: meta.hash, progress: simulatedProgress, status: 'receiving', size: meta.size });
            }, 2000);

            // --- Handler unique (anti-double-appel) ---
            const handleFile = async (path) => {
              if (fileHandled) return;
              fileHandled = true;
              clearInterval(progressInterval);
              this._emit('onTransferProgress', { hash: meta.hash, progress: 100, status: 'complete' });
              this._emit('onLogUpdate', [`📦 Fichier prêt! Décompression en cours...`]);
              if (onFileReceived) onFileReceived(path, meta);
            };

            // --- Attente de la réception du fichier ---
            // On se fie EXCLUSIVEMENT à la résolution de receiveFile pour s'assurer
            // que le fichier ZIP est écrit à 100%. Un "poll" prématuré corrompt le ZIP.
            try {
              console.log('[WifiDirectService] receiveFile() démarré en arrière-plan...');
              
              // Timeout étendu à 300s (5 min) pour les appareils lents (ex: Itel A50)
              const rawPath = await Promise.race([
                WifiP2P.receiveFile(nativeMediaDir, nativeFilename),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout receiveFile natif (300s)")), 300000))
              ]);
              
              const receivedPath = (rawPath && !rawPath.startsWith('file://')) ? `file://${rawPath}` : rawPath;
              console.log('[WifiDirectService] receiveFile() résolu:', receivedPath);
              await handleFile(receivedPath);
            } catch (err) {
              clearInterval(progressInterval);
              if (!fileHandled) {
                fileHandled = true;
                this._emit('onLogUpdate', [`❌ Transfert échoué ou trop long: ${err?.message || '?'}`]);
                this._emit('onTransferProgress', { hash: meta.hash, progress: 0, status: 'failed' });
              }
            }
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
    this._isMessageLoopRunning = false;
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
    this.isConnected = false;
    this.isGroupOwner = false;
    this.groupOwnerAddress = null;
    this._receiveMessages = false;
    this._isSending = false; // FIX: libérer le flag d'envoi à la déconnexion
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
