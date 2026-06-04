// app/src/features/bluetooth/services/P2PAutoSync.js
import { NetworkRailDetector, RAIL_TYPES } from './NetworkRailDetector';
import { NearbyMeshService } from './NearbyMeshService';
import { WifiDirectService } from './WifiDirectService';
import { ManifestService } from '../../loba/services/ManifestService';
import { RecommendationEngine } from '../../loba/services/RecommendationEngine';
import { TransferQueueManager } from '../../loba/services/TransferQueueManager';
import { LocalStorageManager } from '../../loba/services/LocalStorageManager';
import { LobaPackService } from '../../loba/services/LobaPackService';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

const P2P_SYNC_INTERVAL_MS = 3000; 
const CLOUD_SYNC_INTERVAL_MS = 60000; 
const DISCONNECT_COOLDOWN_MS = 5000;
const GROUP_CREATE_COOLDOWN_MS = 10000; // 10s entre chaque createGroup pour éviter "framework busy"

/**
 * P2PAutoSync — L'Orchestrateur Central (V2.6 - Deep Fix Handshake)
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
    this._meshPeers = new Map();
    this._packSentThisSession = false; // V3.0 (BUG-BIDIR): n'envoyer le pack qu'1 fois par session WiFi Direct
    this._hasPendingDelta = false; // V3.6.3 (BUG-060 fix): flag mis à true par onMeshManifestDeltaCalculated()
    this._packReceivedAckResolver = null; // V3.6.4 (Double validation): Promise resolver pour PACK_RECEIVED_OK
    this._peerMeshId = null; // V3.6.4 (Mesh handshake): peerId Mesh du pair pour handshake WIFI_GROUP_READY
    this._slaveConfirmedViaMesh = false; // V3.6.4: true quand SLAVE_CONNECTED_CONFIRMED reçu via Mesh
    this._isRealConnected = false; // V3.6.5: false tant que le Slave n'a pas confirmé (YABISSO_HELLO_ACK)
    this._slaveIpAddress = null; // V3.6.5: IP du Slave (extraite de info si dispo, sinon null)
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

    // V3.2 (BUG-054 fix): Vérifier le swap avec TOUTES les clés possibles du peer
    // (peerName peut être "xiaomi 11t" WiFi Direct OU "18_yabisso_xxx" du nom Yabisso)
    // NOTE: le rôle stocké représente le rôle que JE dois avoir à la prochaine reconnexion
    // (suite à la réception d'un SWAP_ROLE_REQUEST, je deviens SLAVE → l'autre devient MASTER)
    for (const k of [key, meshKey, ...Object.keys(this._roleSwapQueue)]) {
      if (k && this._roleSwapQueue[k]) {
        const forcedRole = this._roleSwapQueue[k];
        const amMaster = forcedRole === 'MASTER';
        this._log(`🔄 [V3.2 Swap Actif] Rôle forcé pour ${peerName} (clé=${k}) : ${forcedRole} (Je suis Master ? ${amMaster})`);
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
      const count = await database.get('loba_posts').query(Q.where('is_propagating', true)).fetchCount();
      this._pendingPostsCount = count;
    } catch (_) {
      this._pendingPostsCount = 0;
    }
  }

  async _sendYabissoHello(isMasterSide, peerName) {
    if (!WifiDirectService.isConnected) return;
    const myScore = WifiDirectService.getPowerScore();
    const sent = await WifiDirectService.sendControlMessage({
      type: 'YABISSO_HELLO',
      myScore,
      isMasterSide,
    });
    if (sent) {
      this._log(`🤝 [Handshake] YABISSO_HELLO envoyé à ${peerName} (score=${myScore})`);
    } else {
      this._log(`⚠️ [Handshake] Échec envoi YABISSO_HELLO à ${peerName}`);
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

  // V3.6.4 (Mesh handshake) : Reçu WIFI_GROUP_READY du Master via Mesh
  // Le Master annonce que son groupe WiFi Direct est créé et que le Slave peut se connecter.
  // Le Slave peut alors initier sa connexion WiFi en toute confiance (pas à l'aveugle).
  async _onWifiGroupReadyMesh(peerId, masterIp) {
    this._log(`📡 [V3.6.4 Mesh] WIFI_GROUP_READY reçu de Master ${peerId} (ip=${masterIp}) → Slave peut se connecter`);
    this._peerMeshId = peerId;
    // Note : la connexion WiFi elle-même se fait via onConnectionChange (déclenché par Android)
    // quand le Slave se connecte au réseau WiFi du Master. Le Mesh sert juste de signalisation.
  }

  // V3.6.4 (Mesh handshake) : Reçu SLAVE_CONNECTED_CONFIRMED du Slave via Mesh
  // Le Slave confirme qu'il est bien connecté au réseau WiFi du Master.
  // Le Master peut alors commencer à envoyer le pack en toute sécurité.
  async _onSlaveConnectedConfirmedMesh(peerId) {
    this._log(`✅ [V3.6.4 Mesh] SLAVE_CONNECTED_CONFIRMED reçu de Slave ${peerId} → Master peut envoyer`);
    this._slaveConfirmedViaMesh = true;
    this._peerMeshId = peerId;
  }

  // V3.6.5 (Real connection check) : Attend que le Slave confirme sa présence via YABISSO_HELLO_ACK.
  // Équivalent JS du waitForSlaveConnection Java (qui n'existe pas dans la lib).
  // Le Master ne considère la connexion comme "VRAIE" que quand le Slave a répondu.
  // Retourne true si confirmé dans le timeout, false sinon.
  async _waitForSlaveConfirmation(peerName, timeoutMs = 5000) {
    const startTime = Date.now();
    const pollInterval = 100;
    this._log(`⏳ [V3.6.5] Attente confirmation Slave (${peerName}) — max ${timeoutMs}ms...`);
    while (Date.now() - startTime < timeoutMs) {
      if (this._peerHandshakeConfirmed && this._peerHandshakeConfirmed[peerName]) {
        const elapsed = Date.now() - startTime;
        this._log(`✅ [V3.6.5] Slave confirmé en ${elapsed}ms ! Connexion VRAIE établie.`);
        this._isRealConnected = true;
        return true;
      }
      if (!WifiDirectService.connectedPeer || !this._running) {
        this._log(`⚠️ [V3.6.5] Déconnexion WiFi pendant l'attente, abandon.`);
        return false;
      }
      await new Promise(r => setTimeout(r, pollInterval));
    }
    this._log(`⏰ [V3.6.5] Pas de confirmation Slave en ${timeoutMs}ms, best-effort.`);
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

    // Si on a une connexion WiFi Direct active, forcer le cycle pour débloquer l'envoi
    if (WifiDirectService.connectedPeer && this._running) {
      this._log(`🚀 [V3.6.3 Delta Hook] Connexion WiFi active → déclenchement cycle immédiat...`);
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
    this._log('🚀 Orchestrateur démarré (V3.6.4 - LOCK + MESH + DOUBLE VALIDATION: ACK PACK_RECEIVED_OK + Mesh handshake WIFI_GROUP_READY/SLAVE_CONNECTED_CONFIRMED).');

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
        if (roleResult === null) {
          this._log(`⏭️ [V3.6 Peer] ${peerName} ignoré (pas de Mesh peer, probablement imprimante/tiers).`);
          return;
        }
        const isMaster = roleResult;

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
          try {
            await WifiDirectService.connectToPeer(peer, 0, 'MASTER');
          } catch (e) {
            this._log(`⚠️ [V3.6 Master] createGroup échoué, reset lock dans 5s...`);
            setTimeout(() => { this._isConnecting = false; }, 5000);
          }
        } else {
          this._log(`⏳ [V3.6 Slave] Connexion au Master dans 3s (laissé au cycle 3s pour éviter double-trigger)...`);
        }
      });

      WifiDirectService.on('onConnectionChange', async ({ connected, info }) => {
        if (connected && this._running) {
          this._wasConnected = true;
          this._packSentThisSession = false; // V3.0: Reset flag à chaque nouvelle connexion
          NetworkRailDetector.setWifiDirectAvailable(true);
          // V3.6 (BUG-058 fix) : Libérer le lock dès que la connexion est établie
          this._isConnecting = false;
          if (WifiDirectService.isGroupOwner) {
            this._hasCreatedGroup = true;
            // V3.6.4 (Mesh handshake) : Master annonce au Slave via Mesh que le groupe est prêt
            // Le Slave peut alors se connecter en confiance (pas à l'aveugle)
            // On récupère le peerId Mesh du premier pair connu
            const meshPeerId = this._getLatestMeshPeerId();
            if (meshPeerId) {
              this._peerMeshId = meshPeerId;
              try {
                await NearbyMeshService.sendMeshMessage(meshPeerId, {
                  type: 'wifi_group_ready',
                  masterIp: '192.168.49.1',
                  senderDevice: WifiDirectService.getDeviceName(),
                });
                this._log(`📡 [V3.6.4 Mesh] WIFI_GROUP_READY envoyé au Slave ${meshPeerId}`);
              } catch (e) {
                this._log(`⚠️ [V3.6.4 Mesh] Échec envoi WIFI_GROUP_READY: ${e.message}`);
              }
            } else {
              this._log(`⚠️ [V3.6.4 Mesh] Pas de peerId Mesh connu, handshake WiFi_GROUP_READY skippé`);
            }
          } else {
            // V3.6.4 (Mesh handshake) : Slave confirme au Master qu'il est connecté
            const meshPeerId = this._getLatestMeshPeerId();
            if (meshPeerId) {
              this._peerMeshId = meshPeerId;
              try {
                await NearbyMeshService.sendMeshMessage(meshPeerId, {
                  type: 'slave_connected_confirmed',
                  senderDevice: WifiDirectService.getDeviceName(),
                });
                this._log(`✅ [V3.6.4 Mesh] SLAVE_CONNECTED_CONFIRMED envoyé au Master ${meshPeerId}`);
              } catch (e) {
                this._log(`⚠️ [V3.6.4 Mesh] Échec envoi SLAVE_CONNECTED_CONFIRMED: ${e.message}`);
              }
            }
          }
          // V3.6.2 (BUG-059 fix) : HYDRATER _lastIntendedRole avec la VÉRITÉ MATÉRIELLE
          // Le réseau Android peut être prêt avant que notre logique d'élection pré-connexion
          // (cycle ou onPeerFound WiFi Direct) n'ait eu le temps de setter _lastIntendedRole.
          // C'est ce qui causait le bug "role=null" → l'Itel se croyait SLAVE et tentait
          // d'envoyer HELLO + pack alors qu'il est GO/Master. On se fie au硬件 (isGroupOwner).
          this._lastIntendedRole = WifiDirectService.isGroupOwner ? 'MASTER' : 'SLAVE';
          this._log(`📶 WiFi Direct CONNECTÉ ! GO=${WifiDirectService.isGroupOwner}, Rôle intendé=${this._lastIntendedRole} (hydraté depuis hardware), lock=OFF`);

          // V3.6.5 (REAL CONNECTION CHECK) : À ce stade, on est connecté au réseau WiFi
          // mais on ne sait PAS encore si un Slave a réellement rejoint. On initialise
          // _isRealConnected = false. Il passera à true UNIQUEMENT quand on recevra
          // YABISSO_HELLO_ACK du Slave (voir _waitForSlaveConfirmation).
          this._isRealConnected = false;
          this._slaveIpAddress = info?.groupOwnerAddress?.getHostAddress?.() || null;

          const isMyRoleMaster = this._lastIntendedRole === 'MASTER';
          const peerName = (info?.deviceName || WifiDirectService.connectedPeer?.deviceName || 'Unknown').toLowerCase();

          // V3.6.5 : Si je suis Slave, je sais que je suis VRAIMENT connecté (j'ai rejoint
          // le réseau du Master, c'est Android qui m'a confirmé). Le Slave peut donc
          // considérer _isRealConnected = true immédiatement.
          if (!isMyRoleMaster) {
            this._isRealConnected = true;
            this._log(`🟢 [V3.6.5 Slave] VRAIE connexion établie (Slave a rejoint le Master).`);
          } else {
            this._log(`🟡 [V3.6.5 Master] Groupe WiFi créé, en attente d'un vrai Slave...`);
          }

          setTimeout(() => {
            if (WifiDirectService.connectedPeer && this._running) {
              const shouldSend = !isMyRoleMaster;
              if (shouldSend) {
                this._log('🚀 Envoi imminent — HELLO d\'abord, pack ensuite...');
                WifiDirectService.startReceiving(WifiDirectService.globalFileHandler);
                this._sendYabissoHello(isMyRoleMaster, peerName);
                setTimeout(() => {
                  if (WifiDirectService.connectedPeer && this._running) {
                    const isYabissoConfirmed = this._peerHandshakeConfirmed[peerName];
                    if (isYabissoConfirmed) {
                      this._log('✅ Handshake OK → Envoi du pack...');
                      this._p2pSyncCycle();
                    } else {
                      this._log('⏳ Pas d\'ACK reçu (3s) — envoi du pack quand même (best effort)...');
                      this._p2pSyncCycle();
                    }
                  }
                }, 3000);
              } else {
                this._log('📡 Mode Réception — Prêt.');
                WifiDirectService.startReceiving(WifiDirectService.globalFileHandler);
                this._startYabissoHelloWatchdog(peerName);

                // V2.13 (BUG-043) : Si on a un peer Mesh avec score plus bas que nous, c'est étrange
                // (on est censé être MASTER, mais on reçoit). Forcer l'envoi.
                const myScore = this._parseScore(WifiDirectService.getDeviceName());
                const meshPeer = this._getLatestMeshPeer();
                if (meshPeer && myScore > 0 && meshPeer.score < myScore) {
                  this._log(`🔄 [V3.1] MASTER forcé d'envoyer car peer ${meshPeer.name} (score=${meshPeer.score}) < moi (${myScore})`);

                  // V3.6.5 (REAL CONNECTION CHECK) : Le Master doit VÉRIFIER qu'un Slave
                  // a réellement rejoint avant d'envoyer le pack. Équivalent JS du
                  // waitForSlaveConnection Java. On attend 5s max la confirmation.
                  setTimeout(async () => {
                    if (!WifiDirectService.connectedPeer || !this._running) return;
                    try {
                      this._log(`📤 [V3.6.5] Envoi YABISSO_HELLO pour vérifier la présence du Slave...`);
                      await WifiDirectService.sendControlMessage({
                        type: 'YABISSO_HELLO',
                        myScore,
                        isMasterSide: true
                      });
                    } catch (e) {
                      this._log(`⚠️ [V3.6.5] Envoi HELLO forcé échoué: ${e.message}`);
                      return;
                    }

                    // V3.6.5 : Attendre la VRAIE confirmation du Slave (HELLO_ACK)
                    const confirmed = await this._waitForSlaveConfirmation(peerName, 5000);
                    if (confirmed) {
                      this._log(`🟢 [V3.6.5] VRAIE connexion Slave confirmée → envoi du pack`);
                      this._p2pSyncCycle();
                    } else {
                      this._log(`⏰ [V3.6.5] Pas de Slave confirmé en 5s → best-effort, on envoie quand même`);
                      this._p2pSyncCycle();
                    }
                  }, 5000);
                }
              }
            }
          }, 1500);
        } else if (this._wasConnected) {
          this._wasConnected = false;
          NetworkRailDetector.setWifiDirectAvailable(false);
          WifiDirectService.stopReceiving();
          this._lastDisconnectAt = Date.now();
          // V3.0: Reset _packSentThisSession pour permettre un nouvel envoi à la prochaine connexion
          // mais NE PAS reset _lastIntendedRole (rôle préservé pour le swap)
          this._packSentThisSession = false;
          this._hasPendingDelta = false; // V3.6.3: Reset du flag delta à la déconnexion
          // V3.6 (BUG-058 fix) : Reset lock + hasCreatedGroup sur déconnexion
          this._isConnecting = false;
          this._hasCreatedGroup = false;
          // V3.6.5 (REAL CONNECTION CHECK) : Reset du flag "vraie connexion" à la déconnexion
          this._isRealConnected = false;
          this._slaveIpAddress = null;

          // Resume Nearby Mesh après déconnexion WiFi Direct
          try { await NearbyMeshService.resumeMesh(); } catch (_) {}

          if (Object.keys(this._roleSwapQueue).length > 0) {
            this._log('🔌 Déconnexion détectée. Swap actif : reconnexion immédiate...');
          } else {
            this._log('🔌 Déconnexion détectée. Cool-down (5s)...');
          }
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
        if (roleResult === null) {
          this._log(`⏭️ [V3.6 Trigger] Peer ${peer.deviceName} ignoré (pas de Mesh peer).`);
          return;
        }
        const isMaster = roleResult;
        this._log(`🔗 [Trigger] Connexion à ${peer.deviceName} (${isMaster ? 'MASTER' : 'SLAVE'})...`);
        this._isConnecting = true;
        try {
          await WifiDirectService.connectToPeer(peer, 0, isMaster ? 'MASTER' : 'SLAVE');
        } catch (e) {
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
            if (roleResult === null) {
              // Pas de pair Mesh pour arbitrer, on ignore ce peer et on attend Mesh
              this._syncingP2P = false;
              return;
            }
            const isMaster = roleResult;

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

            this._log(`🔗 [V3.6] Connexion à ${peer.deviceName} (${isMaster ? 'MASTER' : 'SLAVE'}) avec lock...`);
            if (isMaster) this._lastGroupCreatedAt = Date.now();
            
            // V3.6 (BUG-058 fix) : ACTIVER LE LOCK avant d'envoyer la commande au framework
            this._isConnecting = true;
            let connectSuccess = false;
            try {
              // V3.6: On ne pause PLUS le Mesh pendant la connexion WiFi Direct.
              // Le Mesh doit rester actif pour découvrir le pair Yabisso et fournir le score.
              connectSuccess = await WifiDirectService.connectToPeer(peer, 0, isMaster ? 'MASTER' : 'SLAVE');
            } catch (e) {
              // V3.6.1: Reset du lock après 5s en cas d'exception inattendue
              this._log(`⚠️ [V3.6.1] connectToPeer exception: ${e.message}, reset du lock dans 5s...`);
              setTimeout(() => { this._isConnecting = false; }, 5000);
              return;
            }
            // V3.6.1 (BUG-058 fix) : LIBÉRER LE LOCK IMMÉDIATEMENT après connectToPeer
            // Bug critique : connectToPeer ne throw JAMAIS (il catch en interne et retourne true/false).
            // Du coup le catch du V3.6 ne fire jamais, et le lock restait true pour toujours
            // si onConnectionChange ne fire pas (cas où le Master crée le groupe mais aucun Slave ne se connecte).
            this._isConnecting = false;
            if (!connectSuccess) {
              this._log(`⚠️ [V3.6.1] connectToPeer a échoué, lock libéré. Retry dans 10s (backoff).`);
            } else {
              this._log(`✅ [V3.6.1] connectToPeer réussi, lock libéré.`);
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
        // Le Master envoie ssi (a) il a du contenu OU (b) le delta Mesh dit qu'il doit pousser.
        // Le Slave n'envoie PAS en Phase 1 (il fait la Phase 2 après swap ou via sendFileTo).
        const iShouldSend = isMyRoleMaster && hasPendingContent;
        const shouldSend = iShouldSend;
        this._log(`🔍 [V3.6.3] shouldSend=${shouldSend}, isMaster=${isMyRoleMaster}, myScore=${myScore}, peerScore=${peerScore}, pendingContent=${hasPendingContent}, packSent=${this._packSentThisSession}`);
        if (shouldSend && !this._packSentThisSession) {
          this._log('🟢 Envoi du pack (Phase 1: émetteur → récepteur)...');
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
          // V3.3 (BUG-055 fix): BIDIRECTIONNEL SANS DÉCONNEXION
          // Au lieu d'envoyer SWAP_ROLE_REQUEST et de se déconnecter,
          // on garde la connexion WiFi active et on fait la Phase 2.
          // ==========================================
          
          if (!isSwapActive) {
            // === PHASE 1 → PHASE 2 (sans déconnexion) ===
            this._log(`🔄 [V3.3] Phase 1 terminée. Récupération IP client pour Phase 2...`);
            
            // Le GO récupère l'IP du client (déjà reçue lors du sendFile côté client)
            // Astuce : le client vient juste d'envoyer son pack, le GO peut récupérer l'IP
            let clientIp = null;
            
            if (WifiDirectService.isGroupOwner) {
              // GO : on a déjà reçu le pack du client, on a peut-être son IP via les métadonnées
              // Sinon on tente getClientAddress() qui ouvre un MessageServer et récupère l'IP
              this._log(`📡 [V3.3] GO : tentative getClientAddress() pour récupérer IP du client...`);
              const addrResult = await WifiDirectService.getClientAddress(8000);
              if (addrResult && addrResult.clientIp) {
                clientIp = addrResult.clientIp;
                this._log(`✅ [V3.3] IP client récupérée: ${clientIp}`);
              } else {
                this._log(`⚠️ [V3.3] Impossible de récupérer IP client, fallback SYNC_COMPLETE`);
              }
            } else {
              // Client : on connaît l'IP du GO (toujours 192.168.49.1)
              clientIp = '192.168.49.1';
              this._log(`📡 [V3.3] Client : IP GO connue: ${clientIp}`);
            }

            if (clientIp) {
              // === PHASE 2 : l'AUTRE device envoie son pack ===
              // Le client (Xiaomi) ouvre un receiveFile, le GO (Itel) envoie via sendFileTo
              if (WifiDirectService.isGroupOwner) {
                // GO va envoyer au client via sendFileTo
                this._log(`📤 [V3.3] PHASE 2 : GO envoie son pack au client ${clientIp}...`);
                const myPackPath = await LobaPackService.buildPack(category, 25);
                if (myPackPath) {
                  // Attendre 1s pour laisser le client ouvrir son serveur
                  this._log(`⏳ [V3.3] Attente 1.5s pour que le client ouvre son serveur...`);
                  await new Promise(r => setTimeout(r, 1500));
                  
                  const sent2 = await WifiDirectService.sendFileTo(myPackPath, clientIp, {
                    hash: `pack_${Date.now()}_phase2`,
                    type: 'LOBA_PACK',
                    category: category || 'bundle',
                    senderDevice: WifiDirectService.getDeviceName()
                  });
                  if (sent2) {
                    this._log(`✅ [V3.3] Pack Phase 2 (GO → Client) envoyé !`);
                  } else {
                    this._log(`❌ [V3.3] Échec envoi pack Phase 2`);
                  }
                }
              } else {
                // Client doit ouvrir un serveur pour que le GO puisse envoyer
                // V3.6.2 (BUG-059 fix) : Pause 1000ms AVANT d'ouvrir le serveur
                // pour laisser l'interface réseau de l'Itel A50 se stabiliser après
                // le 1er HELLO qui a échoué. Évite que le GO envoie vers un socket
                // pas encore bind.
                this._log(`📡 [V3.3] PHASE 2 : Client ouvre receiveFile() pour recevoir du GO...`);
                this._log(`⏳ [V3.6.2] Pause 1000ms pour stabiliser l'interface réseau...`);
                await new Promise(r => setTimeout(r, 1000));
                WifiDirectService.startReceiving(WifiDirectService.globalFileHandler);
                this._log(`✅ [V3.6.2] Serveur Slave ouvert, prêt à recevoir Phase 2 du GO`);
              }

              // Attendre 3s puis envoyer SYNC_COMPLETE
              await new Promise(r => setTimeout(r, 3000));
              this._log(`🏁 [V3.3] Fin synchro bidirectionnelle — Envoi de SYNC_COMPLETE...`);
              const msgSent = await WifiDirectService.sendControlMessage({
                type: 'SYNC_COMPLETE'
              });
              if (msgSent) {
                const completeKeys = [peerName];
                if (meshPeer) completeKeys.push(meshPeer.name.toLowerCase());
                for (const k of completeKeys) {
                  delete this._roleSwapQueue[k];
                }
                this._completedSyncs[peerName] = Date.now();
                this._log(`✅ [V3.3] SYNC_COMPLETE envoyé. Déconnexion dans 3s...`);
              } else {
                this._log(`❌ Échec de l'envoi de SYNC_COMPLETE`);
              }
              setTimeout(() => { WifiDirectService.disconnect(); }, 3000);
            } else {
              // Pas d'IP client → fallback à l'ancien comportement (SWAP)
              this._log(`⚠️ [V3.3] Fallback SWAP (pas d'IP client)`);
              const msgSent = await WifiDirectService.sendControlMessage({
                type: 'SWAP_ROLE_REQUEST'
              });
              if (msgSent) {
                const swapKeys = [peerName];
                if (meshPeer) swapKeys.push(meshPeer.name.toLowerCase());
                for (const k of swapKeys) {
                  this._roleSwapQueue[k] = 'MASTER';
                }
                this._log(`✅ SWAP_ROLE_REQUEST envoyé. Déconnexion dans 3s...`);
              }
              setTimeout(() => { WifiDirectService.disconnect(); }, 3000);
            }
          } else {
            // On était en mode swap (Phase 2 classique) → envoyer SYNC_COMPLETE
            this._log(`🏁 [V3.3] Fin Phase 2 (swap) — Envoi de SYNC_COMPLETE...`);
            const msgSent = await WifiDirectService.sendControlMessage({
              type: 'SYNC_COMPLETE'
            });
            if (msgSent) {
              const completeKeys = [peerName];
              if (meshPeer) completeKeys.push(meshPeer.name.toLowerCase());
              for (const k of completeKeys) {
                delete this._roleSwapQueue[k];
              }
              this._completedSyncs[peerName] = Date.now();
              this._log(`✅ SYNC_COMPLETE envoyé. Déconnexion dans 3s...`);
            }
            setTimeout(() => { WifiDirectService.disconnect(); }, 3000);
          }
        } else {
          this._log('📡 Mode Réception — Prêt.');
          WifiDirectService.startReceiving(WifiDirectService.globalFileHandler);
        }
      } else if (NetworkRailDetector.activeRails.has(RAIL_TYPES.BLE_MESH)) {
        const pendingUploads = await this._getPendingUploads();
        if (pendingUploads.length > 0) {
          for (const post of pendingUploads) await this._propagateToPeers(post, RAIL_TYPES.BLE_MESH);
        }
      }

      await LocalStorageManager.applyLRUPolicy();
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
          // V3.2 (BUG-054 fix): Nettoyer TOUTES les clés du peer (Yabisso + WiFi Direct)
          for (const k of keys) {
            delete this._roleSwapQueue[k];
          }
          this._completedSyncs[yabissoKey || wifiDirectKey] = Date.now();
          this._lastIntendedRole = null; // V3.0: Reset complet du rôle après synchro bidirectionnelle
          this._packSentThisSession = false;
          this._log(`✅ [V3.2] Synchro bidirectionnelle complétée. Reset ${keys.length} clé(s) + repos 5 minutes.`);
        } else if (metadata.type === 'YABISSO_HELLO') {
          const senderDevice = metadata.senderDevice || peerName;
          const isYabisso = WifiDirectService.isLikelyYabissoDevice(senderDevice);
          if (!isYabisso) {
            this._log(`⛔ [Handshake] ${senderDevice} n'est PAS un device Yabisso. Blacklist + déconnexion.`);
            WifiDirectService.markPeerAsNonYabisso(senderDevice, 300000);
            setTimeout(() => { try { WifiDirectService.disconnect(); } catch (_) {} }, 500);
            return;
          }
          this._confirmYabissoHandshake(senderDevice, metadata.myScore);
          this._lastYabissoPeerSeen = Date.now();
          this._log(`✅ [Handshake] ${senderDevice} confirmé Yabisso (score=${metadata.myScore}). Envoi ACK...`);
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

      if (!metadata.hash) {
        if (metadata.action === 'PING') {
          this._log(`⭐ REÇU PING via ${source}!`);
          return;
        }
        return;
      }
      
      if (metadata.type === 'LOBA_PACK') {
          this._log(`📥 Reçu Loba Pack. Traitement...`);
          const peerName = (metadata.senderDevice || WifiDirectService.connectedPeer?.deviceName || 'Unknown').toLowerCase();
          this._lastReceivedFrom[peerName] = Date.now();
          const success = await LobaPackService.unpackAndProcess(filePath);
          if (success) {
            this._log(`✅ Pack traité !`);
            this.stats.totalSyncedP2P++;
          }
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
          // Note: On ne disconnecte plus automatiquement ici car le Slave gère le cycle et la déconnexion après envoi du message de contrôle.
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
      const hash = uri ? await LocalStorageManager.hashFile(uri) : null;
      let localPath = null;
      let result = null;
      if (uri) {
        const ext = type === 'video' ? 'mp4' : 'jpg';
        result = await LocalStorageManager.saveMedia(uri, hash, ext);
        if (result) localPath = result.path;
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
