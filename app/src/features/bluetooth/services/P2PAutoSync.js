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
    if (!peerName) return false;
    const key = peerName.toLowerCase();

    if (this._roleSwapQueue[key]) {
      const forcedRole = this._roleSwapQueue[key];
      const amMaster = forcedRole === 'MASTER';
      this._log(`🔄 [Swap Actif] Rôle forcé pour ${peerName} : ${forcedRole} (Je suis Master ? ${amMaster})`);
      return amMaster;
    }

    const myScore = this._parseScore(WifiDirectService.getDeviceName());

    // V2.16 : Préférer le score du peer MESH (le nom WiFi Direct est souvent "Xiaomi 11T"/"itel A50")
    const meshPeer = this._getLatestMeshPeer();
    let peerScore = 0;
    let effectivePeerName = peerName;
    if (meshPeer) {
      peerScore = meshPeer.score;
      effectivePeerName = meshPeer.name;
      this._log(`🕸️ [Role] Score Mesh utilisé pour ${effectivePeerName} (score=${peerScore})`);
    } else {
      peerScore = this._parseScore(peerName);
    }
    
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

    if (peerScore === 0) {
      const myName = WifiDirectService.getWifiDirectName() || '';
      const myNameLower = myName.toLowerCase();
      const peerNameLower = peerName.toLowerCase();
      
      if (myNameLower !== peerNameLower) {
        const isMaster = myNameLower > peerNameLower;
        this._log(`🎯 [Role] Score inconnu pour "${peerName}". Tri alphabetique: "${myName}" vs "${peerName}" → ${isMaster ? 'MASTER' : 'SLAVE'}`);
        return isMaster;
      }
    }

    return peerScore > 0 ? myScore > peerScore : myScore >= 40;
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

  async start() {
    if (this._running) return;
    this._running = true;

    console.log('[P2PAutoSync] Démarrage de l\'orchestrateur Multi-Rail...');
    this._log('🚀 Orchestrateur démarré (V3.1 - FIX NPE NATIVE: _refreshConnectionInfo avant sendFile).');

    NetworkRailDetector.start();
    NetworkRailDetector.onRailChange((rails) => {
      this.stats.activeRails = rails;
    });

    WifiDirectService.setGlobalFileHandler((path, meta) => this._handleReceivedFile(path, meta, 'WifiDirect'));

    NearbyMeshService.MeshLogEvents.subscribe((msg) => {
      this._log(`[MESH] ${msg}`);
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
        const isMaster = this._iAmMasterFor(peerName);

        if (isMaster) {
          const timeSinceLastGroup = Date.now() - this._lastGroupCreatedAt;
          if (timeSinceLastGroup < GROUP_CREATE_COOLDOWN_MS) {
            this._log(`⏳ [Peer] Cooldown createGroup actif (${Math.round((GROUP_CREATE_COOLDOWN_MS - timeSinceLastGroup) / 1000)}s restantes)...`);
            return;
          }
        }

        this._lastIntendedRole = isMaster ? 'MASTER' : 'SLAVE';
        WifiDirectService.recordPeerAttempt(peerName);

        try { await NearbyMeshService.pauseMesh(); } catch (_) {}

        if (isMaster) {
          this._log(`🤝 [Master] Création du groupe...`);
          this._lastGroupCreatedAt = Date.now();
          await WifiDirectService.connectToPeer(peer, 0, 'MASTER');
        } else {
          this._log(`⏳ [Slave] Connexion au Master dans 3s (laissé au cycle 3s pour éviter double-trigger)...`);
        }
      });

      WifiDirectService.on('onConnectionChange', async ({ connected, info }) => {
        if (connected && this._running) {
          this._wasConnected = true;
          this._packSentThisSession = false; // V3.0: Reset flag à chaque nouvelle connexion
          NetworkRailDetector.setWifiDirectAvailable(true);
          this._log(`📶 WiFi Direct CONNECTÉ ! GO=${WifiDirectService.isGroupOwner}, Rôle intendé=${this._lastIntendedRole || 'inconnu'}`);

          const isMyRoleMaster = this._lastIntendedRole === 'MASTER';
          const peerName = (info?.deviceName || WifiDirectService.connectedPeer?.deviceName || 'Unknown').toLowerCase();

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
                  setTimeout(() => {
                    if (WifiDirectService.connectedPeer && this._running) {
                      // V3.1: try/catch défensif contre la NPE native de react-native-wifi-p2p
                      try {
                        WifiDirectService.sendControlMessage({ type: 'YABISSO_HELLO', myScore, isMasterSide: true })
                          .then(() => {
                            setTimeout(() => this._p2pSyncCycle(), 2000);
                          })
                          .catch(e => {
                            this._log(`⚠️ [V3.1] Envoi HELLO forcé échoué (try/catch): ${e.message}`);
                          });
                      } catch (e) {
                        this._log(`⚠️ [V3.1] Envoi HELLO forcé catch: ${e.message}`);
                      }
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
        const isMaster = this._iAmMasterFor(peer.deviceName);
        this._log(`🔗 [Trigger] Connexion à ${peer.deviceName} (${isMaster ? 'MASTER' : 'SLAVE'})...`);
        await WifiDirectService.connectToPeer(peer, 0, isMaster ? 'MASTER' : 'SLAVE');
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
    if (!this._running || this._syncingP2P) return;
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
            const isMaster = this._iAmMasterFor(peer.deviceName);

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

            this._log(`🔗 [Cycle] Connexion à ${peer.deviceName} (${isMaster ? 'MASTER' : 'SLAVE'})...`);
            if (isMaster) this._lastGroupCreatedAt = Date.now();
            try { await NearbyMeshService.pauseMesh(); } catch (_) {}
            await WifiDirectService.connectToPeer(peer, 0, isMaster ? 'MASTER' : 'SLAVE');
          } else {
            // Aucun peer non-blacklisté. Si ça fait > 20s, devenir MASTER proactivement
            // (utile pour les tests sur 1 device ET pour être découvrable en attente d'un Slave)
            const timeSinceLastYabisso = this._lastYabissoPeerSeen > 0 ? (Date.now() - this._lastYabissoPeerSeen) : Infinity;
            const timeSinceLastProactive = Date.now() - this._lastMasterProactiveAt;

            // V2.16 : Si on a un peer Mesh avec un score plus élevé, on attend (il créera le groupe)
            const meshPeerCycle = this._getLatestMeshPeer();
            if (meshPeerCycle) {
              const myScore = this._parseScore(WifiDirectService.getDeviceName());
              if (meshPeerCycle.score > myScore) {
                if (timeSinceLastProactive > 15000) {
                  this._log(`📡 [Cycle] Mesh peer ${meshPeerCycle.name} a un score plus élevé (${meshPeerCycle.score} > ${myScore}). J'attends qu'il crée le groupe...`);
                  this._lastMasterProactiveAt = Date.now();
                }
                this._syncingP2P = false;
                return;
              }
            }

            if (timeSinceLastYabisso > 20000 && timeSinceLastProactive > 30000) {
              const timeSinceLastGroup = Date.now() - this._lastGroupCreatedAt;
              if (timeSinceLastGroup > GROUP_CREATE_COOLDOWN_MS) {
                const displaySec = this._lastYabissoPeerSeen > 0 ? `${Math.round(timeSinceLastYabisso/1000)}s` : 'jamais';
                this._log(`📡 [Cycle] Aucun peer Yabisso depuis ${displaySec} → MASTER proactif (être découvrable)...`);
                this._lastMasterProactiveAt = Date.now();
                this._lastGroupCreatedAt = Date.now();
                this._lastIntendedRole = 'MASTER';
                try { await NearbyMeshService.pauseMesh(); } catch (_) {}
                try { await WifiDirectService.createGroup(); } catch (e) {
                  this._log(`⚠️ [Cycle] createGroup proactif échoué: ${e.message}`);
                }
              }
            }
          }
        }
      }

      if (WifiDirectService.connectedPeer) {
        // V2.16 (BUG-046 fix) : shouldSend basé sur comparaison de SCORE Yabisso.
        const myScore = this._parseScore(WifiDirectService.getDeviceName());
        const meshPeer = this._getLatestMeshPeer();
        const peerScore = meshPeer ? meshPeer.score : 0;
        const iShouldSend = peerScore > 0 ? (myScore < peerScore) : (this._lastIntendedRole === 'SLAVE');
        const shouldSend = iShouldSend || this._lastIntendedRole === 'SLAVE';
        this._log(`🔍 [V3.0] shouldSend=${shouldSend}, myScore=${myScore}, peerScore=${peerScore}, role=${this._lastIntendedRole}, packSent=${this._packSentThisSession}`);
        if (shouldSend && !this._packSentThisSession) {
          this._log('🟢 Envoi du pack...');
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
              this._log(`✅ Succès: Pack envoyé !`);
            } else {
              this._log(`❌ Échec envoi pack (sendFile a retourné false)`);
            }
          } else {
            this._log(`⚠️ Pas de pack à envoyer (buildPack a retourné null)`);
          }

          // Déterminer l'action post-transfert (Swap ou Fin de Synchro)
          if (!isSwapActive) {
            // PHASE 1 : Demande de Swap
            this._log(`🔄 Fin Phase 1 — Envoi de SWAP_ROLE_REQUEST...`);
            const msgSent = await WifiDirectService.sendControlMessage({
              type: 'SWAP_ROLE_REQUEST'
            });
            if (msgSent) {
              this._roleSwapQueue[peerName] = 'MASTER';
              this._log(`✅ SWAP_ROLE_REQUEST envoyé. Déconnexion dans 3s...`);
            } else {
              this._log(`❌ Échec de l'envoi de SWAP_ROLE_REQUEST`);
            }
            setTimeout(() => { WifiDirectService.disconnect(); }, 3000);
          } else {
            // PHASE 2 : Confirmation Fin de Synchro
            this._log(`🏁 Fin Phase 2 — Envoi de SYNC_COMPLETE...`);
            const msgSent = await WifiDirectService.sendControlMessage({
              type: 'SYNC_COMPLETE'
            });
            if (msgSent) {
              delete this._roleSwapQueue[peerName];
              this._completedSyncs[peerName] = Date.now();
              this._log(`✅ SYNC_COMPLETE envoyé. Déconnexion dans 3s...`);
            } else {
              this._log(`❌ Échec de l'envoi de SYNC_COMPLETE`);
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
        const peerName = (metadata.senderDevice || WifiDirectService.connectedPeer?.deviceName || 'Unknown').toLowerCase();
        
        if (metadata.type === 'SWAP_ROLE_REQUEST') {
          this._roleSwapQueue[peerName] = 'SLAVE';
          this._log(`🔄 Rôle SWAP enregistré : Prochaine connexion avec ${peerName} en tant que SLAVE`);
        } else if (metadata.type === 'SYNC_COMPLETE') {
          delete this._roleSwapQueue[peerName];
          this._completedSyncs[peerName] = Date.now();
          this._lastIntendedRole = null; // V3.0: Reset complet du rôle après synchro bidirectionnelle
          this._packSentThisSession = false;
          this._log(`✅ Synchro bidirectionnelle complétée avec ${peerName}. Reset rôle + repos de 5 minutes.`);
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
    };
  }
}

export const P2PAutoSync = new P2PAutoSyncClass();
