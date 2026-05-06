// app/src/features/bluetooth/services/WifiDirectService.js
import * as Device from 'expo-device';
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
    this._ackListenerActive = false; // Pour l'attente d'ACK
    this.isConnected = false;       // FIX: was undefined, broke setGlobalFileHandler check
    this._isSending = false;         // FIX: replaces time-based anti-spam
    this._lastConnectAttempt = 0;
    this.globalFileHandler = null; // Phase 13: Handler global pour P2PAutoSync
    // V1.0.15: Score calculé à la demande, pas dans le constructeur
    this.capabilityScore = null;
    this.listeners = {
      onPeerFound: [],
      onPeerLost: [],
      onPeersUpdates: [],
      onSyncStatus: [],
      onConnectionChange: [],
      onTransferProgress: [],
      onLogUpdate: [],
    };
    this._nativeLock = false;
    this.deviceName = null;
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

    if (this.isInitializing || this._nativeLock) {
      console.log('[WifiDirectService] Initialisation ou opération native déjà en cours...');
      return false;
    }

    this.isInitializing = true;
    this._nativeLock = true;

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

      // 1. Récupérer le nom de l'appareil (cohérent avec Mesh)
      try {
        const SecureStore = require('expo-secure-store');
        const savedName = await SecureStore.getItemAsync('loba_username');
        const baseName = savedName || `Device_${Math.random().toString(36).substring(7)}`;
        // V1.0.14: Le nom est préfixé par le score de puissance (ex: 80_Xiaomi)
        this.deviceName = `${this.getPowerScore()}_${baseName}`;
      } catch (e) {
        this.deviceName = `50_Yabisso_${Math.random().toString(36).substring(7)}`;
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
        this.initialized = true;
        console.log('[WifiDirectService] Initialisé avec succès.');
      } catch (e) {
        if (e?.message?.includes('already initialized') || e?.message?.includes('initialized once')) {
          console.log('[WifiDirectService] Module natif déjà initialisé (ignoring error).');
          this.initialized = true;
        } else {
          console.error('[WifiDirectService] Échec initialisation:', e.message);
          return false;
        }
      }

      this.isSupported = true;

      // Écouter les changements de peers
      this._processedPeers = new Set();
      WifiP2P.subscribeOnPeersUpdates(({ devices }) => {
        this.peers = devices || [];
        this._emit('onPeersUpdates', this.peers);

        if (this.peers.length > 0) {
          console.log(`[WifiDirectService] ${this.peers.length} peers détectés.`);
          this.peers.forEach(p => {
            const mac = p.deviceAddress;
            if (mac && !this._processedPeers.has(mac)) {
              this._processedPeers.add(mac);
              this._emit('onPeerFound', p);
              // On reset le processed peer après 30s pour permettre de redécouvrir
              setTimeout(() => this._processedPeers.delete(mac), 30000);
            }
          });
        }
      });

      // Écouter les changements de connexion
      WifiP2P.subscribeOnConnectionInfoUpdates((info = {}) => {
        if (info.groupFormed) {
          let addr = info.groupOwnerAddress;
          if (addr && typeof addr === 'object' && addr.hostAddress) {
            addr = addr.hostAddress;
          }
          if (typeof addr !== 'string' || !addr || addr === 'null' || addr.includes('object')) {
            addr = '192.168.49.1';
          }

          this.connectedPeer = info;
          this.isConnected = true;
          this.isGroupOwner = !!info.isGroupOwner;
          this.groupOwnerAddress = addr;
          this.isConnecting = false;

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
            console.log('[WifiDirectService] ❌ CONNEXION PERDUE.');
          }

          NetworkRailDetector.setWifiDirectAvailable(false);
          this._emit('onConnectionChange', { connected: false });
        }
      });

      return true;
    } catch (e) {
      if (e?.message?.includes('P2P_UNSUPPORTED')) {
        console.warn('[WifiDirectService] P2P non supporté sur ce matériel.');
        this.isSupported = false;
      } else {
        console.error('[WifiDirectService] Erreur critique initialisation:', e?.message || e);
      }
      return false;
    } finally {
      this.isInitializing = false;
      this._nativeLock = false;
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
    try { await WifiP2P.stopDiscoveringPeers(); } catch (_) { }
    await new Promise(resolve => setTimeout(resolve, 100)); // Réduit de 300ms à 100ms

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
        console.warn('[WifiDirectService] Hardware Busy. Pause courte (1s) avant retry...');
        this.isDiscovering = false;
        await new Promise(r => setTimeout(r, 1000));
        return this.startDiscovery(true);
      }

      console.error('[WifiDirectService] Échec startDiscoveringPeers:', errMsg);
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
        try { await WifiP2P.cancelConnect(); } catch (_) { }

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
        console.log('[WifiDirectService] Framework occupé - Pause de 1s avant retry...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.createGroup(retryCount + 1);
      }

      return false;
    }
  }

  /**
   * Se connecte à un peer WiFi Direct.
   */
  async connectToPeer(device, retryCount = 0) {
    if (!this.initialized) return false;

    if (this.isConnecting) {
      console.log('[WifiDirectService] Connexion déjà en cours, requête ignorée.');
      return false;
    }
    if (this.connectedPeer) {
      console.log('[WifiDirectService] Déjà connecté, requête ignorée.');
      return false;
    }

    // LOCK (On ne bloque que si une opération native d'écriture est en cours)
    this.isConnecting = true;
    this._nativeLock = true;

    try {
      this._lastConnectAttempt = Date.now();
      const macAddr = device.deviceAddress || '';

      // 1. NETTOYAGE MODÉRÉ DU HARDWARE (v1.0.7)
      // On évite removeGroup() car il provoque souvent des "Internal Error" s'il n'y a pas de groupe.
      console.log(`[WifiDirectService] 🧹 Nettoyage léger avant connexion à ${macAddr}...`);
      try { await WifiP2P.stopDiscoveringPeers(); } catch (_) { }
      try { await WifiP2P.cancelConnect(); } catch (_) { }

      // On laisse plus de temps à la puce WiFi (500ms)
      await new Promise(r => setTimeout(r, 500));

      // 2. NÉGOCIATION DE RÔLE DÉTERMINISTE basé sur Score (V1.0.16)
      // Extraire les scores numériques pour comparaison coherente
      const myScore = parseInt(this.deviceName?.split('_')[0] || '0', 10);
      const peerScore = parseInt(device.deviceName?.split('_')[0] || '0', 10);
      let intent = 0;

      if (myScore > peerScore) {
        intent = 15; // MASTER
        console.log(`[WifiDirectService] Rôle: MASTER (Intent=15) [Score ${myScore} > ${peerScore}]`);
      } else {
        intent = 0;  // SLAVE
        console.log(`[WifiDirectService] Rôle: SLAVE (Intent=0) [Score ${myScore} <= ${peerScore}]`);
      }

      console.log(`[WifiDirectService] ⚡ APPEL NATIF CONNECT à ${macAddr} (Intent=${intent})...`);

      if (WifiP2P.connectWithConfig) {
        await WifiP2P.connectWithConfig({ deviceAddress: macAddr, groupOwnerIntent: intent });
      } else {
        await WifiP2P.connect(macAddr);
      }

      console.log('[WifiDirectService] ✅ Commande CONNECT envoyée. En attente du lien...');

      // Sécurité: Si après 20s on n'est toujours pas connecté, on reset isConnecting
      setTimeout(() => {
        if (this.isConnecting && !this.isConnected) {
          console.log('[WifiDirectService] Timeout connexion (20s) — Reset flag & Discovery.');
          this.isConnecting = false;
          this._nativeLock = false;
          this.startDiscovery(true);
        }
      }, 20000);

      return true;

    } catch (e) {
      this.isConnecting = false;
      this._nativeLock = false;
      const errMsg = e?.message || '';

      console.warn(`[WifiDirectService] ❌ Échec CONNECT:`, errMsg);

      if (retryCount < 2) {
        const isInternalError = errMsg.includes('internal') || errMsg.includes('error 0') || errMsg.includes('busy');
        const delay = isInternalError ? 5000 : 1000;
        console.log(`[WifiDirectService] Pause de ${delay}ms avant retry ${retryCount + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connectToPeer(device, retryCount + 1);
      }

      return false;
    } finally {
      this._nativeLock = false;
      // NOTE: isConnecting reste TRUE ici, il sera mis à FALSE par l'événement de connexion ou le timeout
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

      // Phase 14: Verrouiller pour éviter les crashes natifs concomitants
      if (this._nativeLock) {
        console.warn('[WifiDirectService] Native Lock actif, abandon sendMessage.');
        return false;
      }
      this._nativeLock = true;

      let sendMsgOk = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (!this.initialized) {
            this._nativeLock = false;
            return false;
          }
          await WifiP2P.sendMessage(metaPayload);
          sendMsgOk = true;
          break;
        } catch (msgErr) {
          const errMsg = msgErr?.message || '';
          if ((errMsg.includes('ECONNREFUSED') || errMsg.includes('isConnected failed')) && attempt < 2) {
            // FIX: Délais plus longs pour laisser le temps au GO de lier le port
            const waitSec = (attempt + 1) * 2;
            console.warn(`[WifiDirectService] GO pas encore prêt (ECONNREFUSED), attente ${waitSec}s (tentative ${attempt + 1}/3)...`);
            await new Promise(r => setTimeout(r, waitSec * 1000));
          } else {
            console.warn('[WifiDirectService] Échec sendMessage natif:', errMsg);
            break;
          }
        }
      }
      this._nativeLock = false;
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

        await new Promise(resolve => setTimeout(resolve, 1000)); // Réduit de 6s à 1s
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

      // TEMPORAIREMENT DÉSACTIVÉ: Le handshake ACK cause des crashes quand la connexion est perdue après l'envoi
      // Le transfert fonctionne sans ce handshake - on gardera juste le suivi de progression
      /*
      if (metadata.type !== 'PING') {
        console.log('[WifiDirectService] En attente ACK du receiver...');
        let ackReceived = false;
        try {
          ackReceived = await this._waitForACK(metadata.hash, 60000);
        } catch (ackErr) {
          console.warn('[WifiDirectService] Timeout attente ACK:', ackErr?.message);
        }
        if (ackReceived) {
          console.log('[WifiDirectService] ✅ ACK reçu du receiver!');
        } else {
          console.warn('[WifiDirectService] ⚠️ ACK non reçu, transfert considéré comme terminé côté sender');
        }
      }
      */

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
   * Attend un ACK du receiver après l'envoi d'un fichier.
   * Envoie des polls périodiques au receiver pour vérifier le statut.
   * @param {string} expectedHash - Le hash du fichier attendu
   * @param {number} timeoutMs - Timeout en millisecondes
   */
  async _waitForACK(expectedHash, timeoutMs = 60000) {
    const { WifiP2P } = require('react-native-wifi-p2p');
    const pollInterval = 5000; // Poll toutes les 5s
    const maxPolls = Math.floor(timeoutMs / pollInterval);

    console.log('[WifiDirectService] Début attente ACK pour', expectedHash);

    // Démarrer une boucle de réception temporaire pour capter les STATUS_RESPONSE
    this._ackListenerActive = true;
    let ackResolved = false;

    const ackCheckLoop = async () => {
      while (this._ackListenerActive && !ackResolved) {
        try {
          const message = await WifiP2P.receiveMessage({});
          if (message) {
            try {
              const resp = JSON.parse(message);
              if (resp.action === 'STATUS_RESPONSE' && resp.hash === expectedHash) {
                console.log('[WifiDirectService] ✅ Status Response reçu:', resp.status);
                ackResolved = true;
                this._ackListenerActive = false;
                return true;
              }
            } catch (_) { }
          }
        } catch (e) {
          // receiveMessage timeout ou erreur - continuer
        }
        await new Promise(r => setTimeout(r, 1000));
      }
      return ackResolved;
    };

    // Lancer la boucle d'écoute en parallèle avec les polls
    const listenPromise = ackCheckLoop();

    for (let attempt = 0; attempt < maxPolls && !ackResolved; attempt++) {
      // Envoyer un message de status request au GO
      try {
        const statusRequest = JSON.stringify({
          action: 'STATUS_REQUEST',
          hash: expectedHash,
          timestamp: Date.now(),
        });
        await WifiP2P.sendMessage(statusRequest);
        console.log('[WifiDirectService] Status request envoyé (attempt', attempt + 1, '/', maxPolls, ')');
      } catch (reqErr) {
        console.warn('[WifiDirectService] Status request échoué:', reqErr?.message);
      }

      // Attendre avant le prochain poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    // Arrêter la boucle d'écoute
    this._ackListenerActive = false;

    console.log('[WifiDirectService] Timeout ACK atteint');
    return false;
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
    // FIX: Forcer le redémarrage si la boucle pense tourner mais n'est pas active
    // Arrêter proprement avant de redémarrer
    if (this._isMessageLoopRunning || this._receiveMessages) {
      console.log('[WifiDirectService] Arrêt préventif de la boucle précédente...');
      this.stopReceiving();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

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
      this._isMessageLoopRunning = true;
      console.log('[WifiDirectService] ✅ Démarrage de la boucle de réception GO...');
      this._messageLoop(nativeMediaDir, onFileReceived);
    } catch (e) {
      console.error('[WifiDirectService] startReceiving error:', e);
      this._receiveMessages = false;
      this._isMessageLoopRunning = false;
    }
  }

  /**
   * Arrête proprement la boucle de réception.
   */
  stopReceiving() {
    this._receiveMessages = false;
    try {
      WifiP2P.stopReceivingMessage();
    } catch (_) { }
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

          // Répondre aux requests de status du sender
          if (meta.action === 'STATUS_REQUEST') {
            const statusResponse = JSON.stringify({
              action: 'STATUS_RESPONSE',
              hash: meta.hash,
              status: this._receiveMessages ? 'receiving' : 'idle',
              timestamp: Date.now(),
            });
            try {
              await WifiP2P.sendMessage(statusResponse);
              console.log('[WifiDirectService] Status response envoyé pour', meta.hash);
            } catch (statusErr) {
              console.warn('[WifiDirectService] Échec status response:', statusErr?.message);
            }
          }

          if (meta.action === 'FILE_TRANSFER') {
            const logMsg = `📩 Transfert entrant: ${meta.hash?.substring(0, 8)}... (${(meta.size / 1024 / 1024).toFixed(1)} MB)`;
            console.log(`[WifiDirectService] ${logMsg}`);
            this._emit('onLogUpdate', [logMsg]);

            const nativeFilename = meta.filename || `${meta.hash}.zip`;
            const expectedUri = `file://${nativeMediaDir}${nativeFilename}`;
            let fileHandled = false;

            // --- Progress simulation ---
            let simulatedProgress = 0;
            let stagnationCount = 0;
            const progressInterval = setInterval(() => {
              if (simulatedProgress < 95) {
                simulatedProgress = Math.min(95, simulatedProgress + 2);
                this._emit('onTransferProgress', { hash: meta.hash, progress: simulatedProgress, status: 'receiving', size: meta.size });
              } else {
                // FIX: Fallback DÉSACTIVÉ - Le receiveFile() natif gère seul la complétion
                // Le fallback prématuré causait un crash car le fichier n'était pas encore complet
                stagnationCount++;
                if (stagnationCount >= 30) {
                  console.log('[WifiDirectService] ⚠️ Stagnation à 95% - On attend le receiveFile natif...');
                  // Ne PAS appeler handleFile ici - attendre receiveFile()
                }
              }
            }, 2000);

            // --- Handler unique (anti-double-appel) ---
            const handleFile = async (path) => {
              if (fileHandled) return;
              fileHandled = true;
              clearInterval(progressInterval);
              // FIX: Assurer que la progression atteint 100%
              try {
                this._emit('onTransferProgress', { hash: meta.hash, progress: 100, status: 'complete' });
                this._emit('onLogUpdate', [`📦 Fichier reçu! Traitement...`]);

                // Envoi ACK au sender pour signaler la fin de réception
                try {
                  const ackPayload = JSON.stringify({
                    action: 'TRANSFER_COMPLETE',
                    hash: meta.hash,
                    filename: meta.filename,
                    timestamp: Date.now(),
                  });
                  await WifiP2P.sendMessage(ackPayload);
                  console.log('[WifiDirectService] ✅ ACK envoyé au sender:', meta.hash);
                } catch (ackErr) {
                  console.warn('[WifiDirectService] Échec envoi ACK:', ackErr?.message);
                }

                if (onFileReceived) {
                  await onFileReceived(path, meta);
                }
              } catch (cbErr) {
                console.warn('[WifiDirectService] Callback file error:', cbErr?.message);
                // Fallback: le fichier est probablement déjà reçu
                this._emit('onTransferProgress', { hash: meta.hash, progress: 100, status: 'complete' });
              }
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
      } catch (e) { }
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

  removeAllListeners(event) {
    if (this.listeners[event]) {
      this.listeners[event] = [];
    }
  }

  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  /**
   * V1.0.15: Calcule un score de puissance basé sur le vrai modèle (expo-device)
   * Xiaomi/Samsung = 80, Itel/Alcatel/Tecno = 20, Autres = 50.
   */
  getPowerScore() {
    // Cache le score pour éviter les appels répétés
    if (this.capabilityScore != null) return this.capabilityScore;

    try {
      // V1.0.15: Score basé sur la VRAIE RAM (1GB = 10 points)
      const totalMemoryGB = (Device.totalMemory || 0) / (1024 * 1024 * 1024);
      this.capabilityScore = Math.round(totalMemoryGB * 10); // 1GB = 10 points
      console.log('[WifiDirectService] RAM détectée:', totalMemoryGB.toFixed(1), 'GB');
    } catch (e) {
      console.warn('[WifiDirectService] getPowerScore error:', e.message);
      this.capabilityScore = 50;
    }

    console.log('[WifiDirectService] Score de puissance:', this.capabilityScore);
    return this.capabilityScore;
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
