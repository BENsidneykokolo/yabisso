// app/src/features/bluetooth/services/P2PAutoSync.js
import { NetworkRailDetector, RAIL_TYPES } from './NetworkRailDetector';
import { NearbyMeshService } from './NearbyMeshService';
import { MeshContentUpdateEvents } from './NearbyMeshService';
import { WifiDirectService } from './WifiDirectService';
import { ManifestService } from '../../loba/services/ManifestService';
import { RecommendationEngine } from '../../loba/services/RecommendationEngine';
import { TransferQueueManager } from '../../loba/services/TransferQueueManager';
import { LocalStorageManager } from '../../loba/services/LocalStorageManager';
import { LobaPackService } from '../../loba/services/LobaPackService';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import * as FileSystem from 'expo-file-system/legacy';

const P2P_SYNC_INTERVAL_MS = 3000; 
const CLOUD_SYNC_INTERVAL_MS = 60000; 
const DISCONNECT_COOLDOWN_MS = 5000;
const GROUP_CREATE_COOLDOWN_MS = 10000; // 10s entre chaque createGroup pour éviter "framework busy"

/**
 * P2PAutoSync — L'Orchestrateur Central (V3.20 - BUG-047 fix : Slave envoie son IP via Mesh BLE, Master utilise sendFileTo avec cette IP au lieu de sendFile (self-loop))
 */
class P2PAutoSyncClass {
  constructor() {
    this._p2pInterval = null;
    this._cloudInterval = null;
    this._running = false;
    this._isStopping = false; 
    this._syncingP2P = false;
    this._syncingCloud = false;
    this._manualTrigger = false; 
    this._lastManualSync = 0; 
    this._connectAttemptPending = false; 
    this._isConnecting = false; // V3.6 (BUG-058 fix): Verrou anti-saturation framework Android
    this._hasCreatedGroup = false; // V3.6: Empêche de recréer le groupe pendant qu'il est up
    this._appBootTime = Date.now(); // V3.4 (BUG-057): Période de grâce avant createGroup
    this._lastSentTo = {};
    this._lastReceivedFrom = {};
    this._lastDisconnectAt = 0; 
    this._pendingPostsCount = 0; 
    this._roleSwapQueue = {};
    this._completedSyncs = {};
    this._wasConnected = false;
    this._discoveryHeartbeat = null;
    this._lastIntendedRole = null;
    this._lastGroupCreatedAt = 0; // Empêche les createGroup() multiples (framework busy)
    this._lastYabissoPeerSeen = 0;
    this._lastMasterProactiveAt = Date.now() - Math.floor(Math.random() * 25000);
    this._peerLogThrottle = {};
    this._helloTimeoutHandle = null;
    this._peerHandshakeConfirmed = {};
    this._waitingForSlave = false; // V3.9: barrière anti-envoi tant que le Slave n'a pas confirmé
    this._slavePhase2Received = false; // V3.11: Master détecte quand le Slave a envoyé son pack (Phase 2)
    this._meshPeers = new Map();
    this._ignoredPeers = new Map(); // V3.12 (Fix D) : throttle 60s pour les peers ignorés (anti-spam logs itel A50)
    this._packSentThisSession = false; // V3.0 (BUG-BIDIR): n'envoyer le pack qu'1 fois par session WiFi Direct
    this._waitingForWifiGroupReady = false; // V3.13: Slave attend le signal Mesh WIFI_GROUP_READY du Master
    this._meshGroupReadyReceived = false; // V3.13: true quand le signal Mesh a été reçu
    this._meshGroupReadyTimeoutHandle = null; // V3.13: timeout 15s fallback scan-based connect
    this._hasPendingDelta = false; // V3.6.3 (BUG-060 fix): flag mis à true par onMeshManifestDeltaCalculated()
    this._packReceivedAckResolver = null; // V3.6.4 (Double validation): Promise resolver pour PACK_RECEIVED_OK
    this._peerMeshId = null; // V3.6.4 (Mesh handshake): peerId Mesh du pair pour handshake WIFI_GROUP_READY
    this._slaveConfirmedViaMesh = false; // V3.6.4: true quand SLAVE_CONNECTED_CONFIRMED reçu via Mesh
    this._isRealConnected = false; // V3.6.5: false tant que le Slave n'a pas confirmé (YABISSO_HELLO_ACK)
    this._slaveIpAddress = null; // V3.6.5: IP du Slave (extraite de info si dispo, sinon null)
    this._wifiGroupReadySentThisSession = false; // V3.17 (BUG-046 fix): true quand WIFI_GROUP_READY envoyé AVANT createGroup
    this._slaveIp = null; // V3.20 (BUG-047 fix): IP du Slave (reçue via Mesh BLE)
    this._slavePort = 8988; // V3.20 (BUG-047 fix): Port TCP du serveur du Slave (8988 par défaut)
    this._slaveReceiverStarted = false; // FIX: Empêcher le démarrage multiple du récepteur Slave
    this._connectingAsSlave = false; // V3.31 (BUG-069 fix): Guard anti-double-connexion Slave (framework busy)
    this._lastWifiGroupReadyPeer = null; // V3.26 (BUG-062 fix): peerId du dernier WIFI_GROUP_READY reçu
    this._lastWifiGroupReadyAt = 0; // V3.26 (BUG-062 fix): timestamp du dernier WIFI_GROUP_READY reçu
    this._isPropagatingRepaired = false; // FIX: One-time repair de is_propagating au démarrage
    this._packReceivedThisCycle = false; // V3.23: true quand un LOBA_PACK a été reçu et traité dans ce cycle
    this.stats = {
      totalSyncedP2P: 0,
      totalSyncedCloud: 0,
      activeRails: [],
      logs: [],
    };
  }

  _log(msg) {
    const timestamp = new Date().toLocaleTimeString();
    const logLine = `[${timestamp}] ${msg}`;
    console.log(`[P2PAutoSync] ${msg}`);
    this.stats.logs.unshift(logLine);
    if (this.stats.logs.length > 50) this.stats.logs.pop();
    WifiDirectService._emit('onLogUpdate', this.stats.logs);
  }

  /**
   * FIX: Répare is_propagating pour tous les posts qui ont un local_media_path valide.
   * Après migration v9→v10, is_propagating a été remis à false sur tous les posts.
   * Un fichier local = le post peut être envoyé → is_propagating doit être true.
   */
  async _repairIsPropagating() {
    if (this._isPropagatingRepaired) return;
    try {
      const postsToRepair = await database.get('loba_posts').query(
        Q.where('local_media_path', Q.notEq(null)),
        Q.where('is_propagating', false)
      ).fetch();

      if (postsToRepair.length === 0) {
        console.log('[P2PAutoSync] ✅ _repairIsPropagating: aucun post à réparer');
        this._isPropagatingRepaired = true;
        return;
      }

      await database.write(async () => {
        for (const post of postsToRepair) {
          await post.update(p => { p.isPropagating = true; });
        }
      });

      console.log(`[P2PAutoSync] 🔧 _repairIsPropagating: ${postsToRepair.length} posts réparés (is_propagating=true)`);
      this._isPropagatingRepaired = true;
    } catch (e) {
      console.warn('[P2PAutoSync] ⚠️ _repairIsPropagating error:', e.message);
    }
  }

  /**
   * V3.23 : Nettoyer les anciens fichiers p2p_* et ctrl_* dans loba_media/.
   * Ces fichiers s'accumulent a chaque cycle P2P et ralentissent unpackAndProcess
   * qui scanne tout le repertoire. On purge les fichiers de plus de 1 heure.
   */
  async _cleanupOldLobaMediaFiles() {
    try {
      const lobaMediaDir = `${FileSystem.documentDirectory}loba_media`;
      const info = await FileSystem.getInfoAsync(lobaMediaDir);
      if (!info.exists) return;

      const files = await FileSystem.readDirectoryAsync(lobaMediaDir);
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;
      let deleted = 0;

      for (const fileName of files) {
        if (!fileName.startsWith('p2p_') && !fileName.startsWith('ctrl_')) continue;
        try {
          const filePath = `${lobaMediaDir}/${fileName}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          if (fileInfo.exists && fileInfo.modificationTime) {
            const age = now - fileInfo.modificationTime;
            if (age > ONE_HOUR) {
              await FileSystem.deleteAsync(filePath, { idempotent: true });
              deleted++;
            }
          }
        } catch (_) {}
      }

      if (deleted > 0) {
        this._log(`🧹 [V3.23] ${deleted} anciens fichiers p2p_*/ctrl_* purgés de loba_media/`);
      }
    } catch (e) {
      console.warn('[P2PAutoSync] ⚠️ _cleanupOldLobaMediaFiles error:', e.message);
    }
  }

  onLogUpdate(callback) {
    return WifiDirectService.on('onLogUpdate', (logs) => callback(logs || this.stats.logs));
  }

  _parseScore(name) {
    if (!name) return 0;
    return parseInt(name.split('_')[0], 10) || 0;
  }

  _iAmMasterFor(peerName) {
    if (!peerName) return null;
    const key = peerName.toLowerCase();

    // V2.16 : Préférer le score du peer MESH (le nom WiFi Direct est souvent "Xiaomi 11T"/"itel A50")
    const meshPeer = this._getLatestMeshPeer();
    const meshKey = meshPeer ? meshPeer.name.toLowerCase() : null;

    // V3.10 (BUG-FIX): Vérifier le swap UNIQUEMENT pour les clés connues de CE peer
    // (peerName peut être "xiaomi 11t" WiFi Direct OU "18_yabisso_xxx" du nom Yabisso)
    // AVANT (V3.2) : on itérait sur Object.keys(_roleSwapQueue) entier → un swap stocké
    // pour un AUTRE peer pouvait activer un rôle forcé de façon incorrecte.
    // MAINTENANT (V3.10) : on vérifie seulement [key, meshKey] — les 2 identités de CE peer.
    // NOTE: le rôle stocké représente le rôle que JE dois avoir à la prochaine reconnexion
    // (suite à la réception d'un SWAP_ROLE_REQUEST, je deviens SLAVE → l'autre devient MASTER)
    for (const k of [key, meshKey]) {
      if (k && this._roleSwapQueue[k]) {
        const forcedRole = this._roleSwapQueue[k];
        const amMaster = forcedRole === 'MASTER';
        this._log(`🔄 [V3.10 Swap Actif] Rôle forcé pour ${peerName} (clé=${k}) : ${forcedRole} (Je suis Master ? ${amMaster})`);
        return amMaster;
      }
    }

    // V3.6 (BUG-058 fix) : SCORE PARSING SÉCURISÉ
    // On refuse de tomber dans le tri alphabétique arbitraire quand le peerName
    // n'a pas de format Yabisso. Le peerName WiFi Direct est un nom Android
    // brut ("itel a50", "Xiaomi 11T", "direct-3f-hp m281 laserjet") qui ne
    // contient PAS de score. On DOIT utiliser le score du peer MESH.
    const myScore = this._parseScore(WifiDirectService.getDeviceName());

    if (!meshPeer) {
      // V3.6: Pas de pair Mesh connu, on ne peut pas arbitrer en sécurité.
      // Retourner null pour que le caller IGNORE ce peer (imprimante, etc.).
      this._log(`⏭️ [V3.6] Peer "${peerName}" ignoré : pas de pair Mesh pour arbitrer (imprimante ou téléphone tiers ?)`);
      return null;
    }

    // On a un pair Mesh, on utilise son score (fiable)
    const peerScore = meshPeer.score;
    const iHaveContent = this._pendingPostsCount > 0;

    if (myScore > 0 && peerScore > 0) {
       const lastReceived = this._lastReceivedFrom[key] || 0;
       const lastSent = this._lastSentTo[key] || 0;
       const fiveMinsAgo = Date.now() - 5 * 60000;
       
       if (iHaveContent && lastReceived > lastSent && lastReceived > fiveMinsAgo) {
           return false;
       }
       
       if (lastSent > lastReceived && lastSent > fiveMinsAgo) {
           return true; 
       }
    }

    this._log(`🕸️ [V3.6] Arbitrage Mesh: Mon Score (${myScore}) vs Score Distant (${peerScore}) → ${myScore > peerScore ? 'MASTER' : 'SLAVE'}`);
    return myScore > peerScore;
  }

  async _updatePendingCount() {
    try {
      const count = await database.get('loba_posts').query(
        Q.where('local_media_path', Q.notEq(null))
      ).fetchCount();
      this._pendingPostsCount = count;

      const totalCount = await database.get('loba_posts').query().fetchCount();
      const propagatingOnly = await database.get('loba_posts').query(Q.where('is_propagating', true)).fetchCount();
      const withLocalPath = await database.get('loba_posts').query(Q.where('local_media_path', Q.notEq(null))).fetchCount();

      if (totalCount > 0 && count === 0) {
        console.warn(`[P2PAutoSync] ⚠️ BUG-047: total=${totalCount}, is_propagating=true:${propagatingOnly}, local_media_path!=null:${withLocalPath}, both:${count}`);
      } else if (count > 0) {
        console.log(`[P2PAutoSync] ✅ Pending content: ${count} posts avec local_media_path (total=${totalCount})`);
      }
    } catch (_) {
      this._pendingPostsCount = 0;
    }
  }

  async _sendYabissoHello(isMasterSide, peerName) {
    if (!WifiDirectService.isConnected) return;
    const myScore = WifiDirectService.getPowerScore();
    // V3.29 (BUG-067 fix): Si GO=true, notre IP est 192.168.49.1 = IP du GO.
    // L'envoyer au Master lui ferait croire que c'est SON IP → self-loop.
    // On n'envoie senderIp QUE si on n'est PAS GO (= on est client avec IP .x).
    let localIp = null;
    if (!WifiDirectService.isGroupOwner) {
      localIp = WifiDirectService._localP2pIp || null;
    }
    const sent = await WifiDirectService.sendControlMessage({
      type: 'YABISSO_HELLO',
      myScore,
      isMasterSide,
      senderIp: localIp,
    });
    if (sent) {
      this._log(`🤝 [V3.29 Handshake] YABISSO_HELLO envoyé à ${peerName} (score=${myScore}, ip=${localIp || 'GO=true (auto)'})`);
    } else {
      this._log(`⚠️ [V3.29 Handshake] Échec envoi YABISSO_HELLO à ${peerName}`);
    }
  }

  _startYabissoHelloWatchdog(peerName) {
    if (this._helloTimeoutHandle) {
      clearTimeout(this._helloTimeoutHandle);
      this._helloTimeoutHandle = null;
    }
    this._helloTimeoutHandle = setTimeout(() => {
      if (WifiDirectService.isConnected && this._running) {
        // V2.9 (BUG-040 FIX): Watchdog non-fatal - on ne déconnecte plus
        // Le Nearby Mesh a DÉJÀ validé les 2 devices via échange de manifestes.
        // Le HELLO/ACK WiFi Direct est redondant (et trop lent sur itel A50).
        const confirmedCount = Object.keys(this._peerHandshakeConfirmed || {}).length;
        if (confirmedCount === 0) {
          this._log(`⏰ [Handshake] Pas de YABISSO_HELLO reçu en 10s — ${peerName}. Nearby Mesh a déjà validé, on continue avec le transfert.`);
        } else {
          this._log(`✅ [Handshake] ${confirmedCount} peer(s) Yabisso confirmé(s) malgré le délai`);
        }
      }
    }, 10000);
  }

  _confirmYabissoHandshake(peerName, peerScore) {
    this._peerHandshakeConfirmed[peerName] = { peerScore, confirmedAt: Date.now() };
    if (this._helloTimeoutHandle) {
      clearTimeout(this._helloTimeoutHandle);
      this._helloTimeoutHandle = null;
    }
    WifiDirectService._nonYabissoPeers?.delete(peerName);
  }

  setMeshPeer(peerId, name, score, isMeshMaster) {
    this._meshPeers.set(peerId, {
      name,
      score,
      isMeshMaster,
      discoveredAt: Date.now(),
    });
    this._lastYabissoPeerSeen = Date.now();
    this._log(`🕸️ [Mesh] Peer enregistré: ${name} (score=${score}, MeshMaster=${isMeshMaster})`);
  }

  // V3.13 : Helper — Trouve le peerId Nearby du Slave (côté Master)
  // On suppose 1-to-1 : le Slave est l'unique mesh peer (différent de moi).
  // Filtre par score : on prend le peer avec le score DIFFÉRENT du mien.
  _findSlavePeerId() {
    const myScore = this._parseScore(WifiDirectService.getDeviceName());
    for (const [peerId, info] of this._meshPeers) {
      if (Date.now() - info.discoveredAt > 120000) continue; // stale
      // Le Slave a un score DIFFÉRENT du mien
      if (info.score !== myScore) {
        return peerId;
      }
    }
    // Fallback : retourne le 1er peer (cas où score pas encore parsé)
    return this._getLatestMeshPeerId();
  }

  // V3.13 : Helper — Trouve le peerId Nearby du Master (côté Slave)
  _findMasterPeerId() {
    const myScore = this._parseScore(WifiDirectService.getDeviceName());
    for (const [peerId, info] of this._meshPeers) {
      if (Date.now() - info.discoveredAt > 120000) continue;
      if (info.score !== myScore) {
        return peerId;
      }
    }
    return this._peerMeshId || this._getLatestMeshPeerId();
  }

  // V3.13 : Helper — Fallback _waitForSlaveConfirmation (sécurité si Mesh échoue)
  // Appelé après l'envoi de WIFI_GROUP_READY. Si le Slave se connecte avant de
  // recevoir le signal Mesh, cette attente le détectera via YABISSO_HELLO.
  // V3.15 (BUG-045 fix) : Timeout réduit de 35s à 15s. Maintenant que le Master
  // attend le signal Mesh SLAVE_CONNECTED_CONFIRMED pour démarrer son récepteur HELLO
  // (au lieu d'écouter "à l'aveugle" 35s en avance), le HELLO arrive en pratique
  // dans les 2-3s suivant la confirmation. 15s de timeout = 5× la latence réelle.
  _fallbackWaitForSlave(peerName) {
    // V3.27 : Timeout augmenté de 15s à 25s pour Itel A50 (Mediatek lent)
    this._waitForSlaveConfirmation(peerName, 25000).then(confirmed => {
      this._waitingForSlave = false;
      if (confirmed && this._running && WifiDirectService.connectedPeer) {
        this._log(`■ [V3.13] ✅ Slave confirmé (via HELLO WiFi) → lancement envoi`);
        this._p2pSyncCycle();
      } else {
        this._log(`■ [V3.13] ⏰ Timeout — abandon (ni signal Mesh, ni HELLO WiFi)`);
      }
    });
  }

  // V3.13 : Reçu WIFI_GROUP_READY du Master via Mesh
  // Le Master a confirmé que son groupe WiFi Direct est créé ET visible Android-side.
  // Le Slave peut maintenant initier sa connexion WiFi en toute confiance (pas à l'aveugle).
  // - Trouve le peer WiFi Direct correspondant au Master
  // - Annule le fallback timeout (scan-based)
  // - Appelle connectToPeer avec le rôle SLAVE
  async _onWifiGroupReadyMesh(peerId, masterIp) {
    // V3.26 (BUG-062 fix) : Dédupliquer WIFI_GROUP_READY par peerId + timestamp 10s
    // Nearby Connections rejoue les messages non acquittés → même signal reçu 4+ fois
    const now = Date.now();
    if (this._lastWifiGroupReadyPeer === peerId && now - this._lastWifiGroupReadyAt < 10000) {
      this._log(`📡 [V3.26] WIFI_GROUP_READY de ${peerId} ignoré — doublon (${now - this._lastWifiGroupReadyAt}ms)`);
      return;
    }
    this._lastWifiGroupReadyPeer = peerId;
    this._lastWifiGroupReadyAt = now;

    this._log(`📡 [V3.26 Mesh] WIFI_GROUP_READY reçu de Master ${peerId} (ip=${masterIp})`);

    // V3.25 (BUG-061 fix) : Si déjà connecté en WiFi Direct, ignorer ce signal
    if (WifiDirectService.isConnected) {
      this._log(`⏭️ [V3.26] WIFI_GROUP_READY ignoré — déjà connecté en WiFi Direct`);
      return;
    }

    // V3.26 : Si on est Master (GO), ignorer — on ne doit pas devenir Slave
    if (this._lastIntendedRole === 'MASTER') {
      this._log(`⏭️ [V3.26] WIFI_GROUP_READY ignoré — je suis MASTER, pas SLAVE`);
      return;
    }

    this._peerMeshId = peerId;
    this._meshGroupReadyReceived = true;

    // V3.13 : Annuler le fallback timeout (scan-based) — on a reçu le signal
    if (this._meshGroupReadyTimeoutHandle) {
      clearTimeout(this._meshGroupReadyTimeoutHandle);
      this._meshGroupReadyTimeoutHandle = null;
    }

    // V3.27 (BUG-063 fix) : Attendre 5000ms que le Master ait fini de créer le groupe.
    // Itel A50 (Mediatek) + framework busy → 3s insuffisant, 5s plus sûr.
    this._log(`⏳ [V3.27 Slave] Attente 5000ms que le Master crée le groupe WiFi Direct...`);
    await new Promise(r => setTimeout(r, 5000));

    // Garde-fou : si on est déjà connecté, on ne fait rien
    // V3.31: Ajout du guard _connectingAsSlave pour éviter double connexion
    if (WifiDirectService.connectedPeer || WifiDirectService.isConnecting || this._connectingAsSlave) {
      this._log(`⏭️ [V3.31] WIFI_GROUP_READY reçu mais déjà connecté/en cours, ignoré (connectingAsSlave=${this._connectingAsSlave})`);
      return;
    }

    // V3.13 : Trouver le peer WiFi Direct du Master (Android name) dans la liste scannée
    // On prend le 1er peer non-blacklisté (cas Yabisso 1-to-1)
    const masterYabissoName = this._meshPeers.get(peerId)?.name?.toLowerCase();
    const detectedPeers = WifiDirectService.peers || [];
    let targetPeer = null;

    if (detectedPeers.length > 0) {
      // Filtrer : prendre le 1er peer qui n'est PAS dans notre blacklist
      targetPeer = detectedPeers.find(p => {
        const name = (p.deviceName || '').toLowerCase();
        return !WifiDirectService.isPeerBlacklisted(name);
      }) || detectedPeers[0];
    }

    if (!targetPeer) {
      this._log(`⚠️ [V3.27] Aucun peer WiFi Direct scanné. Master signalé mais le scan n'a pas encore vu le peer. Retry dans 5s.`);
      setTimeout(() => this._onWifiGroupReadyMesh(peerId, masterIp), 5000);
      return;
    }

    const targetName = (targetPeer.deviceName || 'Unknown').toLowerCase();
    this._log(`🔗 [V3.13 Slave] Connexion WiFi Direct à ${targetName} (signal Mesh du Master ${masterYabissoName || peerId})...`);

    this._lastIntendedRole = 'SLAVE';
    this._isConnecting = true;
    this._connectingAsSlave = true;
    try {
      const ok = await WifiDirectService.connectToPeer(targetPeer, 0, 'SLAVE');
      if (!ok) {
        this._log(`⚠️ [V3.31] connectToPeer a échoué. Reset lock dans 5s.`);
        setTimeout(() => { this._isConnecting = false; this._connectingAsSlave = false; }, 5000);
      } else {
        this._log(`✅ [V3.31] connectToPeer réussi.`);
        this._isConnecting = false;
        this._connectingAsSlave = false;
      }
    } catch (e) {
      this._log(`⚠️ [V3.31] connectToPeer exception: ${e.message}`);
      setTimeout(() => { this._isConnecting = false; this._connectingAsSlave = false; }, 5000);
    }
  }

  // V3.6.4 (Mesh handshake) : Reçu SLAVE_CONNECTED_CONFIRMED du Slave via Mesh
  // Le Slave confirme qu'il est bien connecté au réseau WiFi du Master.
  // Le Master peut alors commencer à envoyer le pack en toute sécurité.
  // V3.15 (BUG-045 fix) : Le Master démarre ICI son récepteur HELLO, après que le Slave
  // soit confirmé connecté via Mesh. Sans ça, le startReceiving() était lancé 1500ms
  // après le createGroup, AVANT que le Slave ne soit réellement prêt à envoyer son HELLO
  // → race condition où le HELLO du Slave arrivait sur un socket Master pas encore actif.
  async _onSlaveConnectedConfirmedMesh(peerId) {
    this._log(`✅ [V3.6.4 Mesh] SLAVE_CONNECTED_CONFIRMED reçu de Slave ${peerId} → handshake Mesh confirmé`);
    this._slaveConfirmedViaMesh = true;
    this._peerMeshId = peerId;

    // V3.22 : Le récepteur est DÉJÀ démarré dans onConnectionChange (fallback immédiat).
    // Cet appel est redondant mais inoffensif (guard _receiveMessages empêche le double-start).
    // Conservé pour le log de traçabilité.
    if (WifiDirectService.connectedPeer && this._running) {
      WifiDirectService.startReceiving(WifiDirectService.globalFileHandler);
      this._log(`📡 [V3.22 Master] Récepteur confirmé actif (Mesh SLAVE_CONNECTED_CONFIRMED reçu)`);
    }
  }

  // V3.6.5 (Real connection check) : Attend que le Slave confirme sa présence via YABISSO_HELLO_ACK.
  // Équivalent JS du waitForSlaveConnection Java (qui n'existe pas dans la lib).
  // Le Master ne considère la connexion comme "VRAIE" que quand le Slave a répondu.
  // Retourne true si confirmé dans le timeout, false sinon.
  // V3.8 : timeout par défaut passé de 5000 à 20000ms (delta réel Master→Slave ~5-10s,
  // 20s laisse une marge confortable pour la connexion Android côté Itel A50).
  // V3.9 : on cherche dans TOUTES les clés de _peerHandshakeConfirmed (au lieu d'un
  // peerName spécifique) car au moment du fire, peerName vaut souvent "unknown" côté
  // Master. La 1ère confirmation gagne.
  async _waitForSlaveConfirmation(peerName, timeoutMs = 25000) {
    const startTime = Date.now();
    this._log(`⏳ [V3.9] Attente YABISSO_HELLO Slave — max ${timeoutMs}ms...`);
    while (Date.now() - startTime < timeoutMs) {
      const confirmedKeys = Object.keys(this._peerHandshakeConfirmed || {});
      if (confirmedKeys.length > 0) {
        const elapsed = Date.now() - startTime;
        this._log(`✅ [V3.9] Slave "${confirmedKeys[0]}" confirmé en ${elapsed}ms !`);
        this._isRealConnected = true;
        return true;
      }
      if (!WifiDirectService.connectedPeer || !this._running) {
        this._log(`⚠️ [V3.9] Déconnexion pendant l'attente, abandon.`);
        return false;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    this._log(`⏰ [V3.9] Aucun Slave en ${timeoutMs}ms.`);
    this._isRealConnected = false;
    return false;
  }

  // V3.6.3 (BUG-060 fix) : HOOK DU DELTA MANIFESTE
  // Appelé par NearbyMeshService._handleGlobalManifestReceived() dès que le delta
  // est calculé. Permet de déclencher l'envoi du pack IMMÉDIATEMENT (sans attendre
  // que le cycle 3s revoie shouldSend=false). Solution au bug :
  //   - Avant : le WiFi s'active, le Mesh calcule le delta, mais shouldSend reste
  //     false car (myScore < peerScore) est inversé → boucle passive.
  //   - Maintenant : le delta force _hasPendingDelta=true → shouldSend devient
  //     true au prochain cycle (≤3s) OU on peut forcer un sync immédiat.
  onMeshManifestDeltaCalculated(delta) {
    if (!delta) return;
    const lobaCount = delta.loba?.length || 0;
    const productCount = delta.products?.length || 0;
    const totalCount = lobaCount + productCount;
    this._hasPendingDelta = totalCount > 0;
    this._log(`✨ [V3.6.3 Delta Hook] Delta reçu: ${lobaCount} vidéos + ${productCount} produits = ${totalCount} items à pousser. _hasPendingDelta=${this._hasPendingDelta}`);

    // V3.31 (FIX 3): Ne PAS déclencher si une connexion est déjà en cours
    if (this._connectingAsSlave || this._isConnecting) {
      this._log(`⏭️ [V3.31 Delta Hook] Connexion déjà en cours (${this._connectingAsSlave ? 'connectingAsSlave' : 'isConnecting'}) — skip trigger`);
      return;
    }

    // Si on a une connexion WiFi Direct active, forcer le cycle pour débloquer l'envoi
    if (WifiDirectService.connectedPeer && this._running) {
      this._log(`🚀 [V3.31 Delta Hook] Connexion WiFi active → déclenchement cycle immédiat...`);
      // Petit délai 500ms pour laisser le temps au slave/peer d'ouvrir son socket
      setTimeout(() => {
        if (WifiDirectService.connectedPeer && this._running) {
          this._p2pSyncCycle();
        }
      }, 500);
    }
  }

  clearMeshPeer(peerId) {
    if (this._meshPeers.has(peerId)) {
      const info = this._meshPeers.get(peerId);
      this._meshPeers.delete(peerId);
      this._log(`🕸️ [Mesh] Peer retiré: ${info.name}`);
    }
  }

  _getLatestMeshPeer() {
    let latest = null;
    let latestTime = 0;
    for (const [, info] of this._meshPeers) {
      if (info.discoveredAt > latestTime) {
        latestTime = info.discoveredAt;
        latest = info;
      }
    }
    return latest && (Date.now() - latest.discoveredAt < 120000) ? latest : null;
  }

  // V3.6.4 (Mesh handshake) : Récupère le peerId Mesh du pair le plus récent.
  // Utilisé pour envoyer des messages de signalisation Mesh (WIFI_GROUP_READY, SLAVE_CONNECTED_CONFIRMED).
  _getLatestMeshPeerId() {
    let latestId = null;
    let latestTime = 0;
    for (const [peerId, info] of this._meshPeers) {
      if (info.discoveredAt > latestTime) {
        latestTime = info.discoveredAt;
        latestId = peerId;
      }
    }
    return latestTime > 0 && (Date.now() - latestTime < 120000) ? latestId : null;
  }

  async start() {
    if (this._running) return;
    this._running = true;

    console.log('[P2PAutoSync] Démarrage de l\'orchestrateur Multi-Rail...');
    this._log('🚀 Orchestrateur démarré (V3.31 - guard double Slave + receiver immédiat + self-discovery fix + fallback 1-to-1).');

    // FIX: Réparer is_propagating au démarrage (migration v9→v10 l'a remis à false)
    this._repairIsPropagating().catch(e => console.warn('[P2PAutoSync] repair error:', e.message));
    this._cleanupOldLobaMediaFiles().catch(e => console.warn('[P2PAutoSync] cleanup error:', e.message));

    NetworkRailDetector.start();
    NetworkRailDetector.onRailChange((rails) => {
      this.stats.activeRails = rails;
    });

    WifiDirectService.setGlobalFileHandler((path, meta) => this._handleReceivedFile(path, meta, 'WifiDirect'));

    NearbyMeshService.MeshLogEvents.subscribe((msg) => {
      this._log(`[MESH] ${msg}`);
    });

    // V3.6.4 (Mesh handshake) : S'abonner aux events handshake Mesh
    // WIFI_GROUP_READY = Master dit "groupe WiFi créé, vous pouvez vous connecter"
    // SLAVE_CONNECTED_CONFIRMED = Slave dit "je suis connecté au WiFi, vous pouvez envoyer"
    if (this._meshHandshakeUnsub) this._meshHandshakeUnsub();
    const { MeshRequestEvents } = require('./NearbyMeshService');
    this._meshHandshakeUnsub = MeshRequestEvents.subscribe((evt) => {
      if (evt && evt.type === 'WIFI_GROUP_READY') {
        this._onWifiGroupReadyMesh(evt.peerId, evt.masterIp);
      } else if (evt && evt.type === 'SLAVE_CONNECTED_CONFIRMED') {
        this._onSlaveConnectedConfirmedMesh(evt.peerId);
      } else if (evt && evt.type === 'SLAVE_IP') {
        // V3.20 (BUG-047 fix) : Le Slave a envoyé son IP via Mesh BLE.
        // On la stocke et on la passe à WifiDirectService pour que sendFile/sendControlMessage
        // ciblent le Slave au lieu de s'envoyer à soi-même (192.168.49.1 self-loop).
        this._slaveIp = evt.ip;
        this._slavePort = evt.port || 8988;
        this._log(`📥 [V3.20 Master] IP Slave reçue via Mesh: ${this._slaveIp}:${this._slavePort}`);
        try {
          WifiDirectService.setTargetPeerIp(this._slaveIp);
          this._log(`🎯 [V3.20 Master] WifiDirectService._targetPeerIp = ${this._slaveIp} (sendFileTo l'utilisera)`);
        } catch (e) {
          this._log(`⚠️ [V3.20 Master] setTargetPeerIp échoué: ${e.message}`);
        }
      }
    });

    // V3.30 (BUG-068 fix) : Quand Mesh se déconnecte, le Slave doit essayer
    // scan-based connect immédiatement au lieu d'attendre le timeout 15s.
    // Le WIFI_GROUP_READY n'arrive JAMAIS si Mesh se déconnecte trop tôt.
    const { MeshConnectionEvents } = require('./NearbyMeshService');
    if (this._meshDisconnectUnsub) this._meshDisconnectUnsub();
    this._meshDisconnectUnsub = MeshConnectionEvents.subscribe((state) => {
      if (state && !state.isConnected && this._lastIntendedRole === 'SLAVE' && this._running) {
        if (!WifiDirectService.connectedPeer && !WifiDirectService.isConnecting && this._waitingForWifiGroupReady) {
          this._log(`🔌 [V3.30 Mesh] Mesh déconnecté — fallback scan-based connect immédiat`);
          this._waitingForWifiGroupReady = false;
          if (this._meshGroupReadyTimeoutHandle) {
            clearTimeout(this._meshGroupReadyTimeoutHandle);
            this._meshGroupReadyTimeoutHandle = null;
          }
          this._p2pSyncCycle();
        }
      }
    });

    setTimeout(() => {
      if (this._running) {
        NearbyMeshService.startMesh().catch(e => {
          this._log(`[MESH] ❌ Crash initialisation: ${e.message}`);
        });
      }
    }, 2000);

    try {
      const state = WifiDirectService.getState();
      if (state.isAvailable) {
        await WifiDirectService.initialize();
        NetworkRailDetector.setWifiDirectAvailable(true);
        await WifiDirectService.startDiscovery(true);
      }
      
      WifiDirectService.removeAllListeners('onPeerFound');
      WifiDirectService.removeAllListeners('onConnectionChange');

      WifiDirectService.on('onPeerFound', async (peer) => {
        if (!this._running || WifiDirectService.connectedPeer || WifiDirectService.isConnecting) return;

        const peerName = (peer.deviceName || 'Unknown').toLowerCase();

        if (WifiDirectService.isPeerBlacklisted(peerName)) {
          return;
        }

        if (WifiDirectService.shouldBackoffPeer(peerName, 10000)) {
          return;
        }

        const now = Date.now();
        const lastLog = this._peerLogThrottle[peerName] || 0;
        if (now - lastLog < 30000) {
          return;
        }
        this._peerLogThrottle[peerName] = now;

        const lastSyncComplete = this._completedSyncs[peerName] || 0;
        const fiveMinsAgo = Date.now() - 5 * 60000;
        if (lastSyncComplete > fiveMinsAgo) return;

        const isSwapActive = !!this._roleSwapQueue[peerName];

        const timeSinceDisconnect = Date.now() - this._lastDisconnectAt;
        const cooldown = isSwapActive ? 0 : DISCONNECT_COOLDOWN_MS;
        if (timeSinceDisconnect < cooldown) return;

        await this._updatePendingCount();
        // V3.6 (BUG-058 fix) : _iAmMasterFor retourne null pour les non-Mesh peers
        const roleResult = this._iAmMasterFor(peerName);
        let isMaster;
        if (roleResult === null) {
          // V3.31 (FIX 5): Fallback 1-to-1 — tenter même sans Mesh peer
          const myScore = this._parseScore(WifiDirectService.getDeviceName());
          const peerWifiScore = this._parseScore(peerName);
          isMaster = peerWifiScore > 0 ? (myScore > peerWifiScore) : true;
          this._log(`⚡ [V3.31 Peer Fallback] Pas de Mesh peer → tentative (isMaster=${isMaster})`);
        } else {
          isMaster = roleResult;
        }

        if (isMaster) {
          const timeSinceLastGroup = Date.now() - this._lastGroupCreatedAt;
          if (timeSinceLastGroup < GROUP_CREATE_COOLDOWN_MS) {
            this._log(`⏳ [Peer] Cooldown createGroup actif (${Math.round((GROUP_CREATE_COOLDOWN_MS - timeSinceLastGroup) / 1000)}s restantes)...`);
            return;
          }
        }

        this._lastIntendedRole = isMaster ? 'MASTER' : 'SLAVE';
        WifiDirectService.recordPeerAttempt(peerName);

        // V3.6: On ne pause PLUS le Mesh, il doit rester actif pour la découverte Yabisso
        if (isMaster) {
          this._log(`🤝 [V3.6 Master] Création du groupe (avec lock)...`);
          this._lastGroupCreatedAt = Date.now();
          this._isConnecting = true;

          // V3.17 (BUG-046 fix) : ENVOI DU SIGNAL WIFI_GROUP_READY AVANT createGroup
          // Raison : sur certains Android (Xiaomi 11T, Itel A50), le createGroup() coupe
          // la connexion BLE Nearby Mesh (conflit radio WiFi/BLE simultané). Si on envoie
          // le signal APRÈS createGroup, le Mesh est déjà mort → "Failed to send text"
          // → Slave ne reçoit jamais le signal → pas de HELLO → Master envoie le pack
          // à lui-même (192.168.49.1 → 192.168.49.1) → ECONNREFUSED.
          // Solution : envoyer le signal PENDANT que le Mesh est encore actif, attendre
          // 1500ms que le Slave le reçoive et se prépare, PUIS créer le groupe.
          if (!this._wifiGroupReadySentThisSession) {
            const slavePeerId = this._findSlavePeerId();
            if (slavePeerId) {
              const masterIp = this._slaveIpAddress || '192.168.49.1';
              this._log(`📡 [V3.17 Master] Envoi WIFI_GROUP_READY au Slave ${slavePeerId} (ip=${masterIp}) AVANT createGroup (Mesh encore actif)...`);
              try {
                const sent = await NearbyMeshService.sendMeshMessage(slavePeerId, {
                  type: 'wifi_group_ready',
                  masterIp,
                });
                if (sent) {
                  this._log(`✅ [V3.17 Master] WIFI_GROUP_READY envoyé (Mesh encore actif).`);
                  this._wifiGroupReadySentThisSession = true;
                } else {
                  this._log(`⚠️ [V3.17 Master] Échec envoi WIFI_GROUP_READY pré-createGroup, fallback post-createGroup.`);
                }
              } catch (e) {
                this._log(`⚠️ [V3.17 Master] Exception envoi WIFI_GROUP_READY pré-createGroup: ${e.message}`);
              }
            } else {
              this._log(`⚠️ [V3.17 Master] Pas de Slave Mesh peerId trouvé, fallback envoi post-createGroup.`);
            }
          } else {
            this._log(`⏭️ [V3.17 Master] WIFI_GROUP_READY déjà envoyé cette session, skip.`);
          }

          // V3.17 : Attendre 1500ms que le Slave reçoive le signal et se prépare
          // (pendant ce temps, le groupe n'est pas encore créé, donc le Mesh est OK)
          await new Promise(r => setTimeout(r, 1500));

          try {
            await WifiDirectService.connectToPeer(peer, 0, 'MASTER');
          } catch (e) {
            this._log(`⚠️ [V3.6 Master] createGroup échoué, reset lock dans 5s...`);
            setTimeout(() => { this._isConnecting = false; }, 5000);
          }
        } else {
          // V3.13 : Le Slave NE TENTE PLUS de connectToPeer directement sur scan.
          // - Race condition : le scan peut détecter le Master AVANT que createGroup() ne soit
          //   visible côté Android (2-5s de délai), le Slave appelle connect() et timeout 8s.
          // - Le Slave attend maintenant le signal Mesh WIFI_GROUP_READY du Master
          //   (_onWifiGroupReadyMesh) qui garantit que le groupe est créé et visible.
          // - Fallback : si aucun signal reçu en 15s, le Slave retente via scan (sécurité).
          this._log(`⏳ [V3.13 Slave] Peer ${peerName} détecté — j'attends le signal Mesh WIFI_GROUP_READY du Master (max 15s)...`);
          this._lastIntendedRole = 'SLAVE';
          WifiDirectService.recordPeerAttempt(peerName);
          this._waitingForWifiGroupReady = true;

          if (this._meshGroupReadyTimeoutHandle) {
            clearTimeout(this._meshGroupReadyTimeoutHandle);
          }
          this._meshGroupReadyTimeoutHandle = setTimeout(() => {
            this._meshGroupReadyTimeoutHandle = null;
            if (this._running && !WifiDirectService.connectedPeer && !WifiDirectService.isConnecting && this._waitingForWifiGroupReady) {
              this._log(`⏰ [V3.13 Slave] Aucun WIFI_GROUP_READY en 15s — fallback scan-based connect vers ${peerName}`);
              this._waitingForWifiGroupReady = false;
              this._p2pSyncCycle();
            }
          }, 15000);
        }
      });

      WifiDirectService.on('onConnectionChange', async ({ connected, info }) => {
        if (connected && this._running) {
          // V3.26 : Si on est en cours d'arrêt, ignorer la connexion (évite double groupe)
          if (this._isStopping) {
            this._log(`⏭️ [V3.26] Connexion ignorée — arrêt en cours`);
            return;
          }
          // V3.31 (FIX 6): Guard anti-double-fire Android
          // Sur certains appareils (Itel A50), onConnectionChange fire 2× pour la même connexion.
          // Le 2° fire recrée _waitingForSlave, relance _waitForSlaveConfirmation, etc.
          // → double handler qui se bloque mutuellement.
          if (this._wasConnected) {
            this._log(`⏭️ [V3.31 FIX6] onConnectionChange double-fire ignoré (déjà connecté)`);
            return;
          }
          this._wasConnected = true;
          this._packSentThisSession = false; // V3.7: Reset de session
          NetworkRailDetector.setWifiDirectAvailable(true);
          // V3.6 (BUG-058 fix) : Libérer le lock dès que la connexion est établie
          this._isConnecting = false;
          if (WifiDirectService.isGroupOwner) {
            this._hasCreatedGroup = true;
          }

          // V3.7 (FIX UNILATÉRAL — retour ami) : Ne PAS faire confiance aveuglément au
          // hardware de l'Itel A50 instantanément. Sur l'Itel d'entrée de gamme, la couche
          // matérielle met du temps à stabiliser isGroupOwner, ce qui faisait basculer les
          // DEUX phones en SLAVE. On se base d'abord sur l'élection Mesh (score), fallback
          // sur le hardware si pas de peer Mesh encore découvert.
          const myScore = this._parseScore(WifiDirectService.getDeviceName());
          const meshPeer = this._getLatestMeshPeer();
          const peerScore = meshPeer ? meshPeer.score : 0;
          if (myScore > 0 && peerScore > 0) {
            this._lastIntendedRole = myScore > peerScore ? 'MASTER' : 'SLAVE';
          } else {
            this._lastIntendedRole = WifiDirectService.isGroupOwner ? 'MASTER' : 'SLAVE';
          }
          this._log(`■ [V3.7 Fix] Connexion Wi-Fi validée. myScore=${myScore}, peerScore=${peerScore} → Rôle logique affecté : ${this._lastIntendedRole}`);

          // V3.6.5 (REAL CONNECTION CHECK) : à ce stade on est branché au réseau WiFi
          // mais on ne sait PAS encore si un Slave a réellement rejoint.
          this._isRealConnected = false;
          this._slaveIpAddress = info?.groupOwnerAddress?.getHostAddress?.() || null;

          const isMyRoleMaster = this._lastIntendedRole === 'MASTER';
          const peerName = (info?.deviceName || WifiDirectService.connectedPeer?.deviceName || 'Unknown').toLowerCase();

          // V3.6.5 : si je suis Slave, je sais que je suis VRAIMENT connecté (j'ai rejoint
          // le réseau du Master, c'est Android qui m'a confirmé).
          if (!isMyRoleMaster) {
            this._isRealConnected = true;
            this._log(`■ [V3.31 Slave] Mode Client validé. Lancement récepteur IMMÉDIAT + SLAVE_CONNECTED_CONFIRMED...`);
            // V3.31 (FIX 2): Démarrer récepteur IMMÉDIATEMENT (pas après 1500ms)
            // Le port 8988 doit être bindé dès que possible pour recevoir le pack du Master.
            if (!this._slaveReceiverStarted) {
              this._slaveReceiverStarted = true;
              WifiDirectService.startReceiving(WifiDirectService.globalFileHandler);
            }
            // V3.31 (FIX 2): Envoyer SLAVE_CONNECTED_CONFIRMED via Mesh IMMÉDIATEMENT
            // Le Master ne peut envoyer le pack que quand il a cette confirmation.
            const slaveMeshPeer = this._getLatestMeshPeer();
            if (slaveMeshPeer && slaveMeshPeer.peerId) {
              NearbyMeshService.sendMeshMessage(slaveMeshPeer.peerId, {
                type: 'slave_connected_confirmed',
              }).then(ok => {
                if (ok) this._log(`✅ [V3.31 Slave] SLAVE_CONNECTED_CONFIRMED envoyé au Master ${slaveMeshPeer.peerId}`);
                else this._log(`⚠️ [V3.31 Slave] Échec envoi SLAVE_CONNECTED_CONFIRMED`);
              }).catch(e => {
                this._log(`⚠️ [V3.31 Slave] Exception SLAVE_CONNECTED_CONFIRMED: ${e.message}`);
              });
            }
            // V3.31 (FIX 2): HELLO après 2s (laisser le Master binder son récepteur)
            setTimeout(async () => {
              if (!WifiDirectService.connectedPeer || !this._running) return;
              this._log(`🤝 [V3.31 Slave] Envoi HELLO au Master...`);
              this._sendYabissoHello(false, peerName);
            }, 2000);
          } else {
            this._log(`🟡 [V3.6.5 Master] Groupe WiFi créé, en attente d'un vrai Slave...`);
          }

          // V3.10 (FIX BARRIÈRE SYNCHRONE) : _waitingForSlave est posé ICI, de façon
          // SYNCHRONE, AVANT le setTimeout(1500ms). Sans ça, le cycle de 3s pouvait
          // se glisser dans la fenêtre [0ms → 1500ms] et lancer un envoi prématuré.
          // Le verrou est levé dans le .then() de _waitForSlaveConfirmation.
          if (isMyRoleMaster) {
            this._waitingForSlave = true;
            this._log(`■ [V3.10] Master : verrou _waitingForSlave ON (synchrone)`);
          }

          // V3.9 (SLAVE-INITIATED HANDSHAKE + BARRIÈRE) : on laisse 1500 ms à Android
          // pour lier la table de routage IP sur l'Itel A50.
          // - Master : startReceiving + _waitForSlaveConfirmation en .then() (PAS d'await).
          // - Slave : startReceiving + _sendYabissoHello immédiat.
          setTimeout(() => {
            if (!WifiDirectService.connectedPeer || !this._running) {
              // Si la connexion a chuté pendant le délai, on lève le verrou pour ne pas bloquer
              if (isMyRoleMaster) {
                this._waitingForSlave = false;
                this._log(`■ [V3.10] Master : connexion perdue pendant délai, verrou levé`);
              }
              return;
            }
            if (isMyRoleMaster) {
              // V3.22 (BUG-regression V3.15) : Le récepteur HELLO du Master est démarré
              // ICI, IMMÉDIATEMENT après la connexion WiFi, AVANT d'attendre le signal
              // Mesh SLAVE_CONNECTED_CONFIRMED. Si le Mesh arrive, _onSlaveConnectedConfirmedMesh
              // appellera aussi startReceiving (inutile grâce au guard _receiveMessages).
              // Si le Mesh est PERDU (commun avec BLE Mesh), le récepteur sera quand même
              // actif sur le port 8988 et pourra recevoir le YABISSO_HELLO du Slave.
              //
              // V3.15 avait supprimé cet appel en pensant à une race condition (HELLO
              // arrivant sur un socket pas prêt). Mais V3.19 ajoute un délai de 5s entre
              // SLAVE_CONNECTED_CONFIRMED et HELLO — le récepteur a 5+ secondes pour
              // binder le port 8988 avant l'arrivée du HELLO. Pas de race condition.
              this._log(`■ [V3.22 Master] Démarrage récepteur immédiat + fallback Mesh...`);
              WifiDirectService.startReceiving(WifiDirectService.globalFileHandler);
              this._fallbackWaitForSlave(peerName);
            } else {
              // V3.31 (FIX 2): Récepteur + SLAVE_CONNECTED_CONFIRMED + HELLO déjà lancés
              // IMMÉDIATEMENT dans la section ci-dessus (hors du setTimeout 1500ms).
              // Ce bloc ne fait plus rien — gardé pour le log de traçabilité.
              this._log(`■ [V3.31 Slave] Tout lancé immédiatement (receiver + confirmed + hello) — skip setTimeout`);
            }
          }, 1500);
        } else if (this._wasConnected) {
          // Section Déconnexion classique
          this._wasConnected = false;
          NetworkRailDetector.setWifiDirectAvailable(false);
          WifiDirectService.stopReceiving();
          this._lastDisconnectAt = Date.now();
          this._packSentThisSession = false;
          this._hasPendingDelta = false;
          this._isConnecting = false;
          this._hasCreatedGroup = false;
          this._isRealConnected = false;
          this._slaveIpAddress = null;
          // V3.9: reset des flags de handshake à chaque session
          this._waitingForSlave = false;
          this._peerHandshakeConfirmed = {};
          // V3.13: reset des flags de signalisation Mesh
          this._waitingForWifiGroupReady = false;
          this._meshGroupReadyReceived = false;
          if (this._meshGroupReadyTimeoutHandle) {
            clearTimeout(this._meshGroupReadyTimeoutHandle);
            this._meshGroupReadyTimeoutHandle = null;
          }
          // V3.17 (BUG-046 fix): reset du flag WIFI_GROUP_READY envoyé
          this._wifiGroupReadySentThisSession = false;
          // V3.20 (BUG-047 fix): reset de l'IP du Slave (entre sessions)
          this._slaveIp = null;
          this._slavePort = 8988;
          this._packReceivedThisCycle = false; // V3.23: reset du flag de réception pack
          this._connectingAsSlave = false; // V3.31 (BUG-069 fix): reset guard double connexion
          try { WifiDirectService.resetTargetPeerIp(); } catch (_) {}
          try { await NearbyMeshService.resumeMesh(); } catch (_) {}
          this._log('■ Déconnexion détectée. Nettoyage des processus.');
          this._slaveReceiverStarted = false; // Reset guard récepteur Slave
        }
      });

    } catch (e) {
      console.warn('[P2PAutoSync] WiFi Direct init error:', e.message);
    }

    if (this._p2pInterval) clearInterval(this._p2pInterval);
    this._p2pInterval = setInterval(() => this._p2pSyncCycle(), P2P_SYNC_INTERVAL_MS);
    this._p2pSyncCycle();

    // Heartbeat: relancer la découverte WiFi Direct toutes les 25s (Android la tue après ~30s)
    if (this._discoveryHeartbeat) clearInterval(this._discoveryHeartbeat);
    this._discoveryHeartbeat = setInterval(() => {
      if (this._running && !WifiDirectService.connectedPeer && !WifiDirectService.isConnecting) {
        const peers = WifiDirectService.peers || [];
        if (peers.length === 0) {
          this._log(`💓 [Heartbeat] Relance découverte WiFi Direct (peers=0)...`);
          WifiDirectService.startDiscovery(true);
        }
      }
    }, 25000);
  }

  async requestWifiDirectActivation() {
    try {
      const state = WifiDirectService.getState();
      if (!state.initialized) await WifiDirectService.initialize();
      NetworkRailDetector.setWifiDirectAvailable(true);
      await WifiDirectService.startDiscovery(true);
      this._log('⚡ Activation WiFi Direct demandée par l\'accueil.');
    } catch (e) {}
  }

  async forceRefresh() {
    this._log('🔄 Hard Reset des services P2P...');
    this.stop();
    await new Promise(resolve => setTimeout(resolve, 1500));
    await this.start();
    WifiDirectService.startDiscovery(true);
  }

  // V3.6 (BUG-058 fix) : Force la création d'un groupe WiFi Direct sans attendre Mesh.
  // Utile pour :
  //   - Tests sur 1 seul device (pas de pair Mesh à découvrir)
  //   - Debug : vérifier que createGroup() fonctionne seul
  //   - Fallback manuel si Mesh échoue
  async forceCreateGroup() {
    this._log('🔧 [V3.6] FORCE createGroup (mode debug/test 1 device, bypass élection Mesh)...');
    this._lastGroupCreatedAt = Date.now();
    this._lastIntendedRole = 'MASTER';
    this._isConnecting = true;
    try {
      const ok = await WifiDirectService.createGroup();
      if (ok) {
        this._hasCreatedGroup = true;
        this._log('✅ [V3.6] Groupe créé en mode FORCE. J\'attends un client...');
        this._isConnecting = false;
      } else {
        this._log('❌ [V3.6] forceCreateGroup a échoué');
        setTimeout(() => { this._isConnecting = false; }, 5000);
      }
      return ok;
    } catch (e) {
      this._log(`❌ [V3.6] forceCreateGroup exception: ${e.message}`);
      setTimeout(() => { this._isConnecting = false; }, 5000);
      return false;
    }
  }

  async triggerSync(category = null, force = false) {
    if (!this._running) await this.start();
    // V3.31 (BUG-069 fix): Guard anti-double-connexion Slave
    // Si une connexion est déjà en cours (Delta Hook + onPeerFound simultanés), on ignore.
    if (this._connectingAsSlave || this._isConnecting) {
      this._log(`⏭️ [V3.31 Trigger] Déjà en cours de connexion — ignoré (force=${force})`);
      return;
    }
    this._manualTrigger = true;
    this._lastManualSync = Date.now();
    this._log(`⚡ Synchronisation forcée déclenchée...`);

    // Relancer la découverte seulement si elle est inactive
    if (!WifiDirectService.connectedPeer && !WifiDirectService.isConnecting) {
      const trigState = WifiDirectService.getState();
      if (!trigState.isDiscovering) {
        this._log(`🔍 [Trigger] Découverte inactive, relance (force=${force})...`);
        await WifiDirectService.startDiscovery(true);
      } else {
        this._log(`🔍 [Trigger] Découverte déjà active, on attend les peers...`);
      }
    }

    if (!WifiDirectService.connectedPeer && !WifiDirectService.isConnecting) {
      const detectedPeers = WifiDirectService.peers || [];
      if (detectedPeers.length > 0) {
        const peer = detectedPeers[0];
        const peerName = (peer.deviceName || 'Unknown').toLowerCase();

        if (force) {
          delete this._completedSyncs[peerName];
          if (!this._roleSwapQueue[peerName]) {
            delete this._roleSwapQueue[peerName];
          }
        }

        const lastSyncComplete = this._completedSyncs[peerName] || 0;
        const fiveMinsAgo = Date.now() - 5 * 60000;
        if (!force && lastSyncComplete > fiveMinsAgo) return;

        const isSwapActive = !!this._roleSwapQueue[peerName];
        const timeSinceDisconnect = Date.now() - this._lastDisconnectAt;
        const cooldown = isSwapActive ? 0 : DISCONNECT_COOLDOWN_MS;
        if (!force && timeSinceDisconnect < cooldown) return;

        await this._updatePendingCount();
        const roleResult = this._iAmMasterFor(peer.deviceName);
        let isMaster;
        if (roleResult === null) {
          // V3.31 (FIX 5): Fallback 1-to-1 — tenter même sans Mesh peer
          const myScore = this._parseScore(WifiDirectService.getDeviceName());
          const peerWifiScore = this._parseScore(peer.deviceName);
          isMaster = peerWifiScore > 0 ? (myScore > peerWifiScore) : true;
          this._log(`⚡ [V3.31 Trigger Fallback] Pas de Mesh peer → tentative (isMaster=${isMaster})`);
        } else {
          isMaster = roleResult;
        }
        // V3.31 (BUG-069 fix): Double-check guard avant connexion Slave
        if (!isMaster && (this._connectingAsSlave || this._isConnecting)) {
          this._log(`⏭️ [V3.31 Trigger] Slave déjà en cours — ignoré`);
          return;
        }
        this._log(`🔗 [Trigger] Connexion à ${peer.deviceName} (${isMaster ? 'MASTER' : 'SLAVE'})...`);
        this._isConnecting = true;
        if (!isMaster) this._connectingAsSlave = true;
        try {
          const ok = await WifiDirectService.connectToPeer(peer, 0, isMaster ? 'MASTER' : 'SLAVE');
          if (!isMaster) {
            this._connectingAsSlave = false;
            if (!ok) {
              this._log(`⚠️ [V3.31 Trigger] connectToPeer échoué, reset lock dans 5s.`);
              setTimeout(() => { this._isConnecting = false; }, 5000);
            } else {
              this._isConnecting = false;
            }
          }
        } catch (e) {
          this._connectingAsSlave = false;
          setTimeout(() => { this._isConnecting = false; }, 5000);
        }
      } else {
        this._log(`⏳ [Trigger] Aucun peer WiFi Direct détecté. Découverte relancée, attente...`);
      }
    }

    await this._p2pSyncCycle(category);
    setTimeout(() => { this._manualTrigger = false; }, 10000);
  }

  async sendTestPing() {
    this._log('📡 Envoi d\'un TEST PING...');
    const bestRail = NetworkRailDetector.getBestRail(true);
    if (bestRail === RAIL_TYPES.OFFLINE) return false;

    try {
      if (bestRail === RAIL_TYPES.WIFI_DIRECT) {
        const success = await WifiDirectService.sendFile(null, {
          type: 'PING',
          timestamp: Date.now(),
          username: 'System Test',
        });
        if (success) this._log('✅ Ping envoyé via WiFi!');
        return success;
      }
    } catch (e) {}
    return false;
  }

  async stop() {
    this._running = false;
    if (this._p2pInterval) clearInterval(this._p2pInterval);
    if (this._cloudInterval) clearInterval(this._cloudInterval);
    if (this._discoveryHeartbeat) clearInterval(this._discoveryHeartbeat);
    this._p2pInterval = null;
    this._cloudInterval = null;
    this._discoveryHeartbeat = null;

    try {
      NetworkRailDetector.stop();
      await NearbyMeshService.stopMesh();
      await WifiDirectService.stopDiscovery();
      await WifiDirectService.disconnect();
    } catch (e) {}
    this._log('🛑 Orchestrateur arrêté.');
  }

  async _p2pSyncCycle(category = null) {
    // V3.9 BARRIÈRE ABSOLUE : on bloque le cycle tant que le Slave n'a pas confirmé
    // son handshake YABISSO_HELLO. La barrière est posée AVANT _syncingP2P pour
    // qu'aucun autre verrou ne masque l'attente. Reset via .then() (pas await).
    if (this._waitingForSlave) {
      this._log('⏸️ [V3.9] Cycle bloqué — attente handshake Slave');
      return;
    }
    // V3.6 (BUG-058 fix) : VERROU ANTI-SATURATION
    // Si une connexion est déjà en cours, on ne lance PAS un nouveau cycle.
    // Sans ce lock, la puce WiFi Android sature et renvoie "framework is busy".
    if (!this._running || this._syncingP2P || this._isConnecting) return;
    this._syncingP2P = true;

    try {
      await this._updatePendingCount();
      const state = WifiDirectService.getState();
      if (state.isAvailable) {
        if (!state.initialized) await WifiDirectService.initialize();

        const detectedPeers = WifiDirectService.peers || [];
        const nonBlacklistedPeers = detectedPeers.filter(p => {
          const name = (p.deviceName || 'Unknown').toLowerCase();
          return !WifiDirectService.isPeerBlacklisted(name);
        });

        let isSwapActive = false;
        let peerName = 'unknown';
        if (nonBlacklistedPeers.length > 0) {
          peerName = (nonBlacklistedPeers[0].deviceName || 'Unknown').toLowerCase();
          if (this._roleSwapQueue[peerName]) {
            isSwapActive = true;
          }
        }

        if (peerName !== 'unknown') {
          const lastSyncComplete = this._completedSyncs[peerName] || 0;
          const fiveMinsAgo = Date.now() - 5 * 60000;
          if (lastSyncComplete > fiveMinsAgo) {
            this._syncingP2P = false;
            return;
          }
        }

        const timeSinceDisconnect = Date.now() - this._lastDisconnectAt;
        const cooldown = isSwapActive ? 0 : DISCONNECT_COOLDOWN_MS;
        if (timeSinceDisconnect < cooldown) {
           this._syncingP2P = false;
           return;
        }

        if (!WifiDirectService.connectedPeer && !WifiDirectService.isConnecting) {
          if (!state.isDiscovering) {
            this._log(`🔄 [Cycle] Découverte inactive, relance (peers=${nonBlacklistedPeers.length})...`);
            await WifiDirectService.startDiscovery(true);
          } else if (nonBlacklistedPeers.length === 0) {
            // Scan en cours, on attend — pas de restart agressif
          }

          if (nonBlacklistedPeers.length > 0) {
            const peer = nonBlacklistedPeers[0];
            const peerKey = (peer.deviceName || 'Unknown').toLowerCase();
            if (WifiDirectService.shouldBackoffPeer(peerKey, 10000)) {
              this._syncingP2P = false;
              return;
            }
            // V3.6 (BUG-058 fix) : _iAmMasterFor peut retourner null
            // (peer WiFi Direct sans pair Mesh correspondant = imprimante ou téléphone tiers)
            const roleResult = this._iAmMasterFor(peer.deviceName);
            let isMaster;
            if (roleResult === null) {
              // V3.31 (FIX 5): Fallback — en mode 1-to-1, si 1 seul peer WiFi Direct
              // et pas de Mesh peer, on suppose qu'il est Yabisso et on essaie.
              // Le handshake YABISSO_HELLO/ACK triera ensuite (blacklist si non-Yabisso).
              const yabissoPeers = nonBlacklistedPeers.filter(p => /^\d+_Yabisso_/i.test(p.deviceName || ''));
              if (nonBlacklistedPeers.length === 1 || yabissoPeers.length > 0) {
                const myScore = this._parseScore(WifiDirectService.getDeviceName());
                // Par défaut, on suppose qu'on est le Master (score plus élevé).
                // Si le peer a un score plus haut dans son nom WiFi Direct, on l'utilise.
                const peerWifiScore = this._parseScore(peer.deviceName);
                isMaster = peerWifiScore > 0 ? (myScore > peerWifiScore) : true;
                this._log(`⚡ [V3.31 Fallback] Pas de Mesh peer, 1 peer WiFi Direct → on tente (isMaster=${isMaster})`);
              } else {
                // Plusieurs peers → impossible de savoir lequel est Yabisso, on attend Mesh
                this._syncingP2P = false;
                return;
              }
            } else {
              isMaster = roleResult;
            }

            if (isMaster) {
              const timeSinceLastGroup = Date.now() - this._lastGroupCreatedAt;
              if (timeSinceLastGroup < GROUP_CREATE_COOLDOWN_MS) {
                this._log(`⏳ [Cycle] Cooldown createGroup actif (${Math.round((GROUP_CREATE_COOLDOWN_MS - timeSinceLastGroup) / 1000)}s restantes)...`);
                this._syncingP2P = false;
                return;
              }
            }

            this._lastIntendedRole = isMaster ? 'MASTER' : 'SLAVE';
            WifiDirectService.recordPeerAttempt(peerKey);

            this._log(`🔗 [V3.31] Connexion à ${peer.deviceName} (${isMaster ? 'MASTER' : 'SLAVE'}) avec lock...`);
            if (isMaster) this._lastGroupCreatedAt = Date.now();
            
            // V3.31 (BUG-069 fix): Guard anti-double-connexion Slave
            if (!isMaster && this._connectingAsSlave) {
              this._log(`⏭️ [V3.31 Cycle] Slave déjà en cours — ignoré`);
              this._syncingP2P = false;
              return;
            }
            // V3.6 (BUG-058 fix) : ACTIVER LE LOCK avant d'envoyer la commande au framework
            this._isConnecting = true;
            if (!isMaster) this._connectingAsSlave = true;
            let connectSuccess = false;
            try {
              // V3.6: On ne pause PLUS le Mesh pendant la connexion WiFi Direct.
              // Le Mesh doit rester actif pour découvrir le pair Yabisso et fournir le score.
              connectSuccess = await WifiDirectService.connectToPeer(peer, 0, isMaster ? 'MASTER' : 'SLAVE');
            } catch (e) {
              // V3.6.1: Reset du lock après 5s en cas d'exception inattendue
              this._log(`⚠️ [V3.6.1] connectToPeer exception: ${e.message}, reset du lock dans 5s...`);
              if (!isMaster) this._connectingAsSlave = false;
              setTimeout(() => { this._isConnecting = false; }, 5000);
              return;
            }
            // V3.6.1 (BUG-058 fix) : LIBÉRER LE LOCK IMMÉDIATEMENT après connectToPeer
            this._isConnecting = false;
            if (!isMaster) this._connectingAsSlave = false;
            if (!connectSuccess) {
              this._log(`⚠️ [V3.31] connectToPeer a échoué (framework busy), lock libéré. Retry dans 15s.`);
              setTimeout(() => { this._isConnecting = false; }, 15000);
            } else {
              this._log(`✅ [V3.31] connectToPeer réussi, lock libéré.`);
            }
          } else {
            // V3.5 (BUG-057 fix) : SUPPRESSION DÉFINITIVE DU MASTER PROACTIF
            // L'élection Master/Slave est gérée EXCLUSIVEMENT par NearbyMeshService.onPeerFound
            // dès qu'un pair Yabisso est détecté via Bluetooth/Mesh (event-driven, pas timer-based).
            // Sans pair découvert, le WiFi Direct reste TOTALEMENT PASSIF.
            // Pour forcer un MASTER (test 1 device), utiliser P2PAutoSync.forceCreateGroup().
            const sinceStart = this._appBootTime ? Math.round((Date.now() - this._appBootTime) / 1000) : 0;
            const meshPeer = this._getLatestMeshPeer();
            if (meshPeer) {
              this._log(`⏳ [V3.5] En attente — pair Mesh détecté (${meshPeer.name}, score=${meshPeer.score}). L'élection se fait dans NearbyMesh.`);
            } else {
              this._log(`⏳ [V3.5] En attente de pair Mesh (${sinceStart}s depuis démarrage). WiFi Direct passif.`);
            }
          }
        }
      }

      if (WifiDirectService.connectedPeer) {
        // V3.6.3 (BUG-060 fix) : CORRECTION DE LA LOGIQUE INVERSÉE
        // AVANT (V2.16) : iShouldSend = peerScore > 0 ? (myScore < peerScore) : (SLAVE)
        //   → Le Master (myScore=73 > peerScore=18) ne pouvait JAMAIS envoyer.
        //   → Boucle infinie `shouldSend=false` + `Mode Réception — Prêt.`
        // MAINTENANT (V3.6.3) : Le rôle Master/Slave hydraté depuis `isGroupOwner`
        //   est la source de vérité. Le Master a le score le plus haut → il pousse.
        //   Le Slave reçoit en Phase 1 puis devient émetteur en Phase 2 (V3.3).
        const myScore = this._parseScore(WifiDirectService.getDeviceName());
        const meshPeer = this._getLatestMeshPeer();
        const peerScore = meshPeer ? meshPeer.score : 0;
        const isMyRoleMaster = this._lastIntendedRole === 'MASTER';
        const hasPendingContent = this._pendingPostsCount > 0 || !!this._hasPendingDelta;
        // Le Master envoie SSI :
        // (a) il a du contenu
        // (b) le Slave est CONFIRMÉ connecté (HELLO reçu OU Mesh confirmé)
        // V3.30 (BUG-068 fix) : NE PAS envoyer après timeout si le Slave n'a pas confirmé.
        // AVANT : shouldSend=true même sans Slave → envoi vers 192.168.49.2 → EHOSTUNREACH.
        const slaveConfirmed = this._isRealConnected || this._slaveConfirmedViaMesh || !!this._slaveIp;
        const iShouldSend = isMyRoleMaster && hasPendingContent && slaveConfirmed;
        const shouldSend = iShouldSend;
        this._log(`🔍 [V3.6.3] shouldSend=${shouldSend}, isMaster=${isMyRoleMaster}, myScore=${myScore}, peerScore=${peerScore}, pendingContent=${hasPendingContent}, packSent=${this._packSentThisSession}`);
        if (shouldSend && !this._packSentThisSession) {
          this._log('🟢 Envoi du pack (Phase 1: émetteur → récepteur)...');
          // V3.20 (BUG-047 fix) : VÉRIFICATION PRÉ-ENVOI que le Slave est VRAIMENT connecté
          // AVANT : sendFile était lancé même si le Slave venait de se déconnecter → "succès"
          // self-loop (le Master s'envoyait le pack à lui-même).
          // MAINTENANT : on log clairement la cible et on alerte si l'IP du Slave n'est pas connue.
          if (!this._slaveIp) {
            this._log(`⚠️ [V3.20 Master] _slaveIp non définie — le sendFile va fallback sur groupOwnerAddress (risque self-loop). Attente SLAVE_IP via Mesh...`);
          } else {
            this._log(`🎯 [V3.20 Master] Cible envoi: Slave IP=${this._slaveIp}:${this._slavePort} (pas de self-loop)`);
          }
          const packPath = await LobaPackService.buildPack(category, 25);
          const peerName = (WifiDirectService.connectedPeer?.deviceName || 'unknown').toLowerCase();
          const isSwapActive = !!this._roleSwapQueue[peerName];

          let sent = false;
          if (packPath) {
            this._log(`📤 Envoi du Pack: ${packPath}`);
            sent = await WifiDirectService.sendFile(packPath, {
              hash: `pack_${Date.now()}`,
              type: 'LOBA_PACK',
              category: category || 'bundle',
              senderDevice: WifiDirectService.getDeviceName()
            });

            if (sent) {
              this._lastSentTo[peerName] = Date.now();
              this._lastPackSentAt = Date.now();
              this._packSentThisSession = true; // V3.0: Marquer le pack comme envoyé pour cette session
              this._hasPendingDelta = false; // V3.6.3: Delta poussé, on reset le flag
              this._log(`✅ [V3.3] Pack Phase 1 envoyé !`);

              // V3.6.4 (Double validation) : ATTENDRE L'ACK DU SLAVE (5s max)
              // Le Slave doit renvoyer PACK_RECEIVED_OK pour certifier qu'il a :
              //   1) Reçu l'intégralité des octets (TCP garantit déjà)
              //   2) Écrit le fichier localement (FileServerAsyncTask a fermé le stream)
              //   3) Traité le pack via unpackAndProcess (succès ou échec)
              // Si pas d'ACK en 5s, on procède quand même (best effort) pour éviter le blocage.
              this._log(`⏳ [V3.6.4] Attente PACK_RECEIVED_OK du Slave (5s max)...`);
              const ackPromise = new Promise(resolve => {
                this._packReceivedAckResolver = resolve;
              });
              const ackTimeout = 5000;
              const ackResult = await Promise.race([
                ackPromise,
                new Promise(resolve => setTimeout(() => resolve({ received: false, timeout: true }), ackTimeout)),
              ]);
              this._packReceivedAckResolver = null;
              if (ackResult.received) {
                this._log(`✅ [V3.6.4] Phase 1 CERTIFIÉE par ACK du Slave (processed=${ackResult.processed})`);
              } else {
                this._log(`⚠️ [V3.6.4] Pas d'ACK en ${ackTimeout / 1000}s, Phase 1 best-effort`);
              }
            } else {
              this._log(`❌ Échec envoi pack Phase 1`);
            }
          } else {
            this._log(`⚠️ Pas de pack à envoyer (buildPack a retourné null)`);
          }

          // ==========================================
          // V3.11 (BUG-041 fix): BIDIRECTIONNEL INITIÉ PAR LE SLAVE
          // - SUPPRESSION de getClientAddress() (échouait toujours sur Itel A50)
          // - SUPPRESSION du fallback SWAP_ROLE_REQUEST (l'imprimante héritait du swap)
          // - Le SLAVE initie sa Phase 2 depuis _handleReceivedFile (sendFileTo vers 192.168.49.1)
          // - Le MASTER attend _slavePhase2Received (max 15s) puis envoie SYNC_COMPLETE
          // - Plus de SWAP du tout. Le bidirectionnel se fait naturellement via TCP.
          // ==========================================

          this._log(`🔄 [V3.11] Phase 1 terminée. Attente Phase 2 du Slave (jusqu'à 15s)...`);
          this._slavePhase2Received = false; // reset du flag pour cette session

          // Attente active: 15s max OU _slavePhase2Received = true OU déconnexion
          const phase2StartTime = Date.now();
          const phase2TimeoutMs = 15000;
          while (Date.now() - phase2StartTime < phase2TimeoutMs) {
            if (this._slavePhase2Received) {
              const elapsed = Date.now() - phase2StartTime;
              this._log(`✅ [V3.11] Phase 2 du Slave reçue en ${elapsed}ms ! Bidirectionnel OK.`);
              break;
            }
            if (!WifiDirectService.connectedPeer || !this._running) {
              this._log(`⚠️ [V3.11] Déconnexion WiFi pendant attente Phase 2, abandon.`);
              return;
            }
            await new Promise(r => setTimeout(r, 200));
          }

          if (!this._slavePhase2Received) {
            this._log(`⏰ [V3.11] Timeout 15s Phase 2 - le Slave n'a pas envoyé (best-effort, on continue avec SYNC_COMPLETE).`);
          }

          // Envoyer SYNC_COMPLETE (succès bidirectionnel ou best-effort)
          this._log(`🏁 [V3.11] Fin synchro — Envoi de SYNC_COMPLETE...`);
          const msgSent = await WifiDirectService.sendControlMessage({
            type: 'SYNC_COMPLETE'
          });
          if (msgSent) {
            // V3.11 : on ne fait PLUS de nettoyage ciblé, _handleReceivedFile SYNC_COMPLETE
            // handler s'occupe du vidage complet de _roleSwapQueue à la réception.
            this._completedSyncs[peerName] = Date.now();
            this._log(`✅ [V3.11] SYNC_COMPLETE envoyé. Déconnexion dans 3s...`);
            // V3.16 (BUG-050 fix) : STOPPER LE RÉCEPTEUR après SYNC_COMPLETE
            // AVANT : le récepteur TCP restait ouvert après la fin de la sync → certains
            // fichiers de contrôle (YABISSO_HELLO_ACK résiduel, etc.) timeout (receiveFile timeout).
            // MAINTENANT : on ferme le serveur 8988 dès que la sync est terminée.
            try {
              WifiDirectService.stopReceiving();
              this._log(`🛑 [V3.16] Récepteur TCP fermé après SYNC_COMPLETE (évite receiveFile timeout)`);
            } catch (e) {
              this._log(`⚠️ [V3.16] stopReceiving après SYNC_COMPLETE: ${e.message}`);
            }
          } else {
            this._log(`❌ [V3.11] Échec envoi SYNC_COMPLETE`);
          }
          setTimeout(() => { WifiDirectService.disconnect(); }, 3000);
        } else {
          // V3.23 : Guard — ne pas redémarrer le récepteur Slave s'il est déjà actif
          if (!this._slaveReceiverStarted && !WifiDirectService._receiveMessages) {
            this._log('📡 Mode Réception — Prêt.');
            WifiDirectService.startReceiving(WifiDirectService.globalFileHandler);
          }
        }
      } else if (NetworkRailDetector.activeRails.has(RAIL_TYPES.BLE_MESH)) {
        const pendingUploads = await this._getPendingUploads();
        if (pendingUploads.length > 0) {
          // V3.27 (BUG-063 fix) : Batch propagation — un seul message BLE au lieu de N messages individuels
          // Limiter à 50 items max pour ne pas saturer le canal BLE
          const BATCH_SIZE = 50;
          const batch = pendingUploads.slice(0, BATCH_SIZE);
          const hashes = batch.map(p => p.hash).filter(Boolean);
          if (hashes.length > 0) {
            this._log(`📡 [V3.27] Propagation batch: ${hashes.length} items (total pending: ${pendingUploads.length})`);
            try {
              const latestPeer = this._getLatestMeshPeer();
              if (latestPeer && latestPeer.peerId) {
                await NearbyMeshService.sendMeshMessage(latestPeer.peerId, {
                  type: 'mesh_propagation_batch',
                  hashes,
                  count: hashes.length,
                  timestamp: Date.now()
                });
              }
            } catch (e) {
              this._log(`⚠️ [V3.27] Échec envoi batch Mesh: ${e.message}`);
            }
          }
          // Marquer tous les posts du batch comme propagés
          for (const post of batch) await this._markAsPropagated(post);
        }
      }

      await LocalStorageManager.applyLRUPolicy();
      // V3.24: Nettoyage periodique des fichiers p2p_/ctrl_ accumules dans loba_media/
      this._cleanupOldLobaMediaFiles().catch(() => {});
      this.stats.lastSyncAt = Date.now();
    } catch (e) {
      console.error('[P2PAutoSync] P2P Cycle Error:', e);
    } finally {
      this._syncingP2P = false;
    }
  }

  async _handleReceivedFile(filePath, metadata, source) {
    try {
      if (!metadata) return;

      // Intercepter les messages de contrôle du protocole de swap bidirectionnel
      if (metadata.action === 'CONTROL_MESSAGE') {
        this._log(`⭐ REÇU MESSAGE DE CONTRÔLE: ${metadata.type} de ${metadata.senderDevice}`);
        // V3.2 (BUG-054 fix): Stocker sous TOUTES les clés possibles (Yabisso name + WiFi Direct name)
        const yabissoKey = (metadata.senderDevice || '').toLowerCase();
        const wifiDirectKey = (WifiDirectService.connectedPeer?.deviceName || '').toLowerCase();
        const keys = [yabissoKey, wifiDirectKey].filter(k => k && k !== 'unknown');
        
        if (metadata.type === 'SWAP_ROLE_REQUEST') {
          // V3.2: L'émetteur du SWAP était SLAVE → il veut devenir MASTER.
          // Je (receiver) dois devenir SLAVE. Stocke 'SLAVE' pour que _iAmMasterFor() me fasse
          // attendre que l'autre crée le groupe.
          for (const k of keys) {
            this._roleSwapQueue[k] = 'SLAVE';
          }
          this._log(`🔄 [V3.2] SWAP reçu → je deviens SLAVE, l'autre devient MASTER`);
        } else if (metadata.type === 'SYNC_COMPLETE') {
          // V3.11 (BUG-041 fix) : VIDAGE COMPLET de _roleSwapQueue
          // AVANT (V3.2-V3.10) : on nettoyait seulement les clés Yabisso + WiFi Direct du peer actuel.
          // Problème : si meshPeer est null au moment du nettoyage, la clé Mesh (ex: "18_yabisso_dwazse")
          // reste dans _roleSwapQueue et pollue les futures connexions (l'imprimante hérite du swap).
          // MAINTENANT (V3.11) : on reset TOUT le dictionnaire. Plus de clé Mesh stale possible.
          this._roleSwapQueue = {};
          this._completedSyncs[yabissoKey || wifiDirectKey] = Date.now();
          this._lastIntendedRole = null; // V3.0: Reset complet du rôle après synchro bidirectionnelle
          this._packSentThisSession = false;
          // V3.16 (BUG-050 fix) : STOPPER LE RÉCEPTEUR après réception SYNC_COMPLETE (côté Slave)
          // Le Slave doit aussi fermer son serveur 8988 pour éviter que des fichiers de contrôle
          // résiduels (YABISSO_HELLO_ACK, etc.) ne restent en attente et timeout.
          try {
            WifiDirectService.stopReceiving();
            this._log(`🛑 [V3.16 Slave] Récepteur TCP fermé après réception SYNC_COMPLETE`);
          } catch (e) {
            this._log(`⚠️ [V3.16 Slave] stopReceiving: ${e.message}`);
          }
          this._log(`✅ [V3.11] Synchro bidirectionnelle complétée. _roleSwapQueue vidé (${keys.length} clé(s) nettoyée(s)) + repos 5 minutes.`);
        } else if (metadata.type === 'YABISSO_HELLO') {
          const senderDevice = metadata.senderDevice || peerName;
          const isYabisso = WifiDirectService.isLikelyYabissoDevice(senderDevice);
          if (!isYabisso) {
            this._log(`⛔ [Handshake] ${senderDevice} n'est PAS un device Yabisso. Blacklist + déconnexion.`);
            WifiDirectService.markPeerAsNonYabisso(senderDevice, 300000);
            setTimeout(() => { try { WifiDirectService.disconnect(); } catch (_) {} }, 500);
            return;
          }
          // V3.8 : le YABISSO_HELLO du Slave débloque le _waitForSlaveConfirmation du Master
          this._confirmYabissoHandshake(senderDevice, metadata.myScore);
          this._lastYabissoPeerSeen = Date.now();

          // V3.29 (BUG-067 fix): Capturer l'IP du Slave depuis les métadonnées HELLO.
          // AVANT : _slaveIp jamais défini → sendFile() self-loop vers 192.168.49.1.
          // FIX : Si senderIp = 192.168.49.1 (IP GO = notre propre IP), l'ignorer
          // et utiliser 192.168.49.2 (IP client typique du Slave).
          if (metadata.senderIp && metadata.senderIp !== '192.168.49.1') {
            this._slaveIp = metadata.senderIp;
            this._slavePort = 8988;
            WifiDirectService.setTargetPeerIp(this._slaveIp);
            this._log(`📍 [V3.29 Master] IP Slave capturée depuis HELLO: ${this._slaveIp} → _targetPeerIp défini`);
          } else {
            // Fallback : le client WiFi Direct a toujours une IP dynamique dans 192.168.49.x
            // Le GO est 192.168.49.1, le 1er client est généralement 192.168.49.2
            this._slaveIp = '192.168.49.2';
            this._slavePort = 8988;
            WifiDirectService.setTargetPeerIp(this._slaveIp);
            const reason = metadata.senderIp === '192.168.49.1' ? 'senderIp=GO (self-loop évité)' : 'senderIp non disponible';
            this._log(`📍 [V3.29 Master] IP Slave fallback: ${this._slaveIp} (${reason})`);
          }

          this._log(`🤝 [V3.8] YABISSO_HELLO reçu de ${senderDevice} (score=${metadata.myScore}) → handshake confirmé`);
          await WifiDirectService.sendControlMessage({
            type: 'YABISSO_HELLO_ACK',
            myScore: WifiDirectService.getPowerScore(),
          });
        } else if (metadata.type === 'YABISSO_HELLO_ACK') {
          const senderDevice = metadata.senderDevice || peerName;
          this._confirmYabissoHandshake(senderDevice, metadata.myScore);
          this._lastYabissoPeerSeen = Date.now();
          this._log(`✅ [Handshake] ${senderDevice} a répondu ACK (score=${metadata.myScore}).`);
        } else if (metadata.type === 'PACK_RECEIVED_OK') {
          // V3.6.4 (Double validation) : Le Slave certifie avoir reçu et traité le LOBA_PACK.
          // On résout la Promise `_packReceivedAckResolver` pour débloquer le Master
          // qui attend la certification avant de procéder à la Phase 2.
          const senderDevice = metadata.senderDevice || peerName;
          this._log(`✅ [V3.6.4] PACK_RECEIVED_OK reçu de ${senderDevice} (hash=${metadata.fileHash?.substring(0, 8)}..., processed=${metadata.processed})`);
          if (this._packReceivedAckResolver) {
            this._packReceivedAckResolver({ received: true, hash: metadata.fileHash, processed: metadata.processed });
            this._packReceivedAckResolver = null;
          }
        }
        return;
      }

      // V3.23 (BUG-047 fix) : VÉRIFIER LOBA_PACK AVANT le check !metadata.hash
      // Quand sendFile envoie un .zip binaire, le receiver ne peut pas parser le JSON.
      // Le catch dans startReceiving() crée des metadata par défaut SANS hash :
      //   { action: 'FILE_TRANSFER', type: 'LOBA_PACK', senderDevice: 'unknown' }
      // Sans ce fix, !metadata.hash=true → return précoce → le pack n'est JAMAIS traité.
      if (metadata.type === 'LOBA_PACK' && filePath) {
          // V3.24 (BUG-056 fix): VERIFICATION TAILLE MINIMALE
          // Les messages contrôle corrompus (~185 octets) passent par ici quand JSON.parse échoue
          // dans startReceiving(). Un vrai LOBA_PACK fait au minimum plusieurs KB.
          try {
            const fileInfo = await FileSystem.getInfoAsync(filePath);
            if (fileInfo.exists && fileInfo.size < 5120) {
              this._log(`⚠️ [V3.24] Fichier trop petit (${fileInfo.size}B) — ignoré (contrôle corrompu?)`);
              try { await FileSystem.deleteAsync(filePath, { idempotent: true }); } catch (_) {}
              return;
            }
          } catch (_) {}
          // V3.11 (BUG-041 fix) : DÉTECTION PHASE 2 DU SLAVE
          // Le Slave envoie son pack avec metadata.phase === 'slave_phase2'.
          // Le Master détecte ce tag et set _slavePhase2Received = true pour débloquer
          // la boucle d'attente dans _p2pSyncCycle (sortie immédiate du wait).
          if (metadata.phase === 'slave_phase2') {
            this._slavePhase2Received = true;
            this._log(`📥 [V3.11] Pack Phase 2 du Slave détecté (phase=slave_phase2)`);
          }
          this._log(`📥 Reçu Loba Pack. Traitement...`);
          // V3.23 : Si le hash n'est pas dans les metadata (fichier binaire reçu), le calculer
          if (!metadata.hash && filePath) {
            try { metadata.hash = await LocalStorageManager.hashFile(filePath); } catch (_) {}
          }
          const peerName = (metadata.senderDevice || WifiDirectService.connectedPeer?.deviceName || 'Unknown').toLowerCase();
          this._lastReceivedFrom[peerName] = Date.now();
          // V3.18 (Sprint 3 / BUG-052 fix) : WRAP unpackAndProcess DANS TRY/CATCH
          // AVANT (V3.16) : `const success = await LobaPackService.unpackAndProcess(filePath)`
          // sans protection. Si l'unzip throw (au lieu de retourner false), la fonction
          // crashait et le reset post-réception n'avait JAMAIS lieu → boucle infinie.
          // MAINTENANT : try/catch garantit que le reset s'exécute quoi qu'il arrive.
          let success = false;
          try {
            success = await LobaPackService.unpackAndProcess(filePath);
            if (success) {
              this._log(`✅ Pack traité !`);
              this.stats.totalSyncedP2P++;
              MeshContentUpdateEvents.emit({ count: 1, source: 'p2p' });
            } else {
              this._log(`⚠️ [V3.18] unpackAndProcess a retourné false (échec ingestion)`);
            }
          } catch (e) {
            this._log(`❌ [V3.18] Erreur unzip catchée: ${e.message}`);
            success = false;
          }
          // V3.18 (Sprint 3 / BUG-052 fix) : RESET INCONDITIONNEL même si unzip échoue
          // AVANT (V3.16) : `this._hasPendingDelta = false` était DANS `if (success)`.
          // Si l'unzip échoue (returns false), _hasPendingDelta reste à true → shouldSend=true
          // à chaque cycle → cycle recommence à l'infini → "framework busy" sur Slave
          // (BUG-053). MAINTENANT : reset HORS du if → stopper le cycle même si ingestion KO.
          this._hasPendingDelta = false;
          this._lastSentTo[peerName] = Date.now();
          this._log(`🔄 [V3.18] Reset état post-réception (succès=${success}): _hasPendingDelta=false, _lastSentTo[${peerName}]=now`);
          // V3.6.4 (Double validation) : ENVOYER PACK_RECEIVED_OK AU MASTER
          // Certifie au Master que la réception et l'écriture locale sont terminées.
          // Équivalent JS du ACK que le user proposait en Java (startSenderServer/connectToReceive).
          // On utilise sendControlMessage (port 8988, MessageServer) qui passe par le même canal TCP.
          try {
            const ackSent = await WifiDirectService.sendControlMessage({
              type: 'PACK_RECEIVED_OK',
              senderDevice: WifiDirectService.getDeviceName(),
              fileHash: metadata.hash,
              processed: success,
            });
            if (ackSent) {
              this._log(`✅ [V3.6.4] PACK_RECEIVED_OK envoyé au Master (hash=${metadata.hash?.substring(0, 8)}..., processed=${success})`);
            } else {
              this._log(`⚠️ [V3.6.4] Échec envoi PACK_RECEIVED_OK`);
            }
          } catch (e) {
            this._log(`⚠️ [V3.6.4] Erreur envoi PACK_RECEIVED_OK: ${e.message}`);
          }

          // V3.11 (BUG-041 fix) : LE SLAVE INITIE SA PHASE 2 DIRECTEMENT
          // Au lieu d'attendre que le Master récupère l'IP via getClientAddress() (qui échoue toujours),
          // le Slave connaît l'IP du GO (toujours 192.168.49.1 sur Android) et initie lui-même
          // l'envoi de son pack vers le Master. Le Master a déjà startReceiving() actif.
          if (!WifiDirectService.isGroupOwner && WifiDirectService.connectedPeer) {
            this._log(`🚀 [V3.11] SLAVE: initiation Phase 2 (envoi mon pack vers GO 192.168.49.1)...`);
            setTimeout(async () => {
              try {
                const myPackPath = await LobaPackService.buildPack(null, 25);
                if (!myPackPath) {
                  this._log(`⚠️ [V3.11] SLAVE Phase 2: buildPack a retourné null`);
                  return;
                }
                const sent = await WifiDirectService.sendFileTo(myPackPath, '192.168.49.1', {
                  hash: `pack_${Date.now()}_slave_phase2`,
                  type: 'LOBA_PACK',
                  phase: 'slave_phase2', // V3.11: tag pour que le Master sache que c'est la Phase 2
                  category: 'bundle',
                  senderDevice: WifiDirectService.getDeviceName(),
                });
                if (sent) {
                  this._log(`✅ [V3.11] SLAVE Phase 2 envoyée au GO !`);
                } else {
                  this._log(`❌ [V3.11] SLAVE Phase 2 échouée (sendFileTo false)`);
                }
              } catch (e) {
                this._log(`⚠️ [V3.11] SLAVE Phase 2 erreur: ${e.message}`);
              }
            }, 500); // Petit délai 500ms pour stabiliser l'interface réseau après ACK
          }
          // Note: On ne disconnecte plus automatiquement ici car le Slave gère le cycle et la déconnexion après envoi du message de contrôle.
          return;
      }

      if (!metadata.hash) {
        if (metadata.action === 'PING') {
          this._log(`⭐ REÇU PING via ${source}!`);
          return;
        }
        return;
      }

      const hash = metadata.hash || await LocalStorageManager.hashFile(filePath);
      const ext = metadata.type === 'video' ? 'mp4' : 'jpg';
      const result = await LocalStorageManager.saveMedia(filePath, hash, ext);
      if (!result || !result.path) return;
      const { path: savedPath, size: savedSize } = result;

      const existing = await database.get('loba_posts').query(Q.where('hash', hash)).fetch();
      await database.write(async () => {
        if (existing.length > 0) {
          await existing[0].update(p => {
            p.localMediaPath = savedPath;
            p.downloadedAt = Date.now();
            p.size = savedSize || p.size || 0;
          });
        } else {
          await database.get('loba_posts').create(post => {
            post.hash = hash;
            post.localMediaPath = savedPath;
            post.downloadedAt = Date.now();
            post.username = metadata.username || `${source} Peer`;
            post.avatar = metadata.avatar || null;
            post.content = metadata.content || '';
            post.isPropagating = false;
            post.category = metadata.category || 'general';
            post.size = savedSize || 0;
            post.imageUrl = metadata.type === 'image' ? savedPath : null;
            post.videoUrl = metadata.type === 'video' ? savedPath : null;
            post.likes = metadata.likes || 0;
            post.comments = metadata.comments || 0;
            post.isLiked = false;
          });
        }
      });
      this.stats.totalSyncedP2P++;
      this._log(`📥 Reçu via ${source}: ${hash.substring(0,8)}...`);
    } catch (e) {
      this._log(`❌ Erreur réception: ${e.message}`);
    }
  }

  async _getPendingUploads() {
    return await database.get('loba_posts').query(Q.where('is_propagating', true), Q.where('local_media_path', Q.notEq(null))).fetch();
  }

  async _markAsPropagated(post) {
    await database.write(async () => { await post.update(p => { p.isPropagating = false; }); });
    this.stats.totalSyncedP2P++;
  }

  async _propagateToPeers(post, rail) {
    try {
      if (!post || !post.localMediaPath) {
        await this._markAsPropagated(post);
        return;
      }
      if (rail === RAIL_TYPES.BLE_MESH) {
        this._log(`📡 Propagation via Mesh: ${post.hash?.substring(0, 8)}`);
        await this._markAsPropagated(post);
      }
    } catch (e) {
      this._log(`❌ Erreur propagation: ${e.message}`);
    }
  }

  async publishLocal(params) {
    const { uri, type, caption, filter, username = '@Me', category = 'general' } = params;
    try {
      console.log(`[P2PAutoSync] 📤 publishLocal: uri=${uri?.substring(0,60)}, type=${type}, category=${category}`);
      const hash = uri ? await LocalStorageManager.hashFile(uri) : null;
      console.log(`[P2PAutoSync] 📤 publishLocal: hash=${hash?.substring(0,12)}`);
      let localPath = null;
      let result = null;
      if (uri) {
        const ext = type === 'video' ? 'mp4' : 'jpg';
        result = await LocalStorageManager.saveMedia(uri, hash, ext);
        console.log(`[P2PAutoSync] 📤 publishLocal: saveMedia result=${result ? `OK path=${result.path?.substring(0,60)} size=${result.size}` : 'NULL'}`);
        if (result) localPath = result.path;
      } else {
        console.warn(`[P2PAutoSync] ⚠️ publishLocal: uri is NULL/undefined — post sera créé SANS local_media_path`);
      }

      let newPost;
      await database.write(async () => {
        newPost = await database.get('loba_posts').create(post => {
          post.username = username;
          post.content = caption || '';
          post.hash = hash;
          post.localMediaPath = localPath;
          post.category = category;
          post.isPropagating = true;
          post.downloadedAt = Date.now();
          post.imageUrl = type === 'image' ? (result ? result.path : null) : null;
          post.videoUrl = type === 'video' ? (result ? result.path : null) : null;
          post.filterColor = filter || null;
          post.likes = 0;
          post.comments = 0;
          post.isLiked = false;
          post.size = (result ? result.size : 0) || 0;
        });

        await database.get('sync_queue').create(item => {
          item.action = 'CREATE_LOBA_POST';
          item.payloadJson = JSON.stringify({ postId: newPost.id, hash, type, caption, username, category });
          item.status = 'pending';
          item.retryCount = 0;
          item.createdAt = Date.now();
          item.updatedAt = Date.now();
        });
      });
      return { success: true, postId: newPost.id, hash };
    } catch (e) {
      console.error('[P2PAutoSync] publishLocal error:', e);
      return { success: false, error: e.message };
    }
  }

  getStats() {
    return {
      ...this.stats,
      blePeers: NearbyMeshService.connectedPeers?.size || 0,
      wifiDirectPeer: WifiDirectService.connectedPeer ? 1 : 0,
      // V3.6.5 (REAL CONNECTION CHECK) : Expose l'état "vraiment connecté" pour l'UI
      isRealConnected: this._isRealConnected,
      slaveIpAddress: this._slaveIpAddress,
      isGroupOwner: WifiDirectService.isGroupOwner,
    };
  }
}

export const P2PAutoSync = new P2PAutoSyncClass();
