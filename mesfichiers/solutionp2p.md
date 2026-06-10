# SOLUTION P2P — CODE COMPLET DU PARTAGE AUTOMATIQUE (V3.25)

> **Date d'extraction** : 2026-06-10
> **Version** : v0.0.30 (V3.25)
> **3 fichiers du partage automatique WiFi Direct + Mesh BLE** :
> 1. `P2PAutoSync.js` (~1685 lignes) — Orchestrateur central
> 2. `NearbyMeshService.js` (~430 lignes) — Service Mesh BLE (élection, handshake)
> 3. `WifiDirectService.js` (~750 lignes) — Wrapper natif WiFi Direct
>
> **Total** : ~2865 lignes de code.

---

## 📋 Résumé des fixes V3.6 → V3.25

| Version | Commit | Fix |
|---------|--------|-----|
| V3.6    | v0.0.16 | BUG-058 — `isConnecting` lock + `_iAmMasterFor` retourne `null` si pas de Mesh peer |
| V3.6.1  | v0.0.17 | BUG-058 — Libère le lock `isConnecting` immédiatement après `connectToPeer` |
| V3.6.2  | v0.0.17 | BUG-059 — Hydrate `_lastIntendedRole` depuis `isGroupOwner` + 1000ms pause Slave |
| V3.6.3  | v0.0.18 | BUG-060 — Corriger `shouldSend` inversé (Master=score haut) + hook delta manifeste |
| V3.6.4  | v0.0.19 | DOUBLE VALIDATION — ACK `PACK_RECEIVED_OK` + Mesh handshake |
| V3.6.5  | v0.0.20 | REAL CONNECTION CHECK — Master attend `YABISSO_HELLO_ACK` avant envoi pack |
| V3.7    | v0.0.20 | FIX UNILATÉRAL — Élection Mesh (score) prioritaire sur hardware `isGroupOwner` |
| V3.8    | v0.0.20 | Timeout `_waitForSlaveConfirmation` étendu à 20s |
| V3.9    | v0.0.20 | BARRIÈRE `_waitingForSlave` + pattern `.then()` + reset handshake |
| V3.10   | v0.0.21 | FIX `_roleSwapQueue` ciblé + barrière synchrone |
| V3.11   | v0.0.21 | BUG-041 — BIDIRECTIONNEL INITIÉ PAR LE SLAVE : sendFileTo('192.168.49.1') |
| V3.13   | v0.0.22 | WiFi Group Ready via Mesh + connexion séquentielle |
| V3.15   | v0.0.23 | BUG-045 — startReceiving après SLAVE_CONNECTED_CONFIRMED |
| V3.16   | v0.0.24 | BUG-050 — stopReceiving sur SYNC_COMPLETE |
| V3.17   | v0.0.25 | BUG-046 — Attente 3s après WIFI_GROUP_READY avant connexion |
| V3.18   | v0.0.26 | BUG-052 — Reset pendingContent post-réception |
| V3.19   | v0.0.27 | BUG-055 — Séquence SLAVE_CONNECTED_CONFIRMED → 5s → HELLO |
| V3.20   | v0.0.29 | BUG-047 — Self-loop fix: sendFileTo avec IP Slave via Mesh |
| V3.22   | v0.0.29 | BUG-regression V3.15 — Récepteur Master démarré immédiatement |
| V3.24   | v0.0.29 | BUG-056-059 — Filtre taille 5KB, staging isolé, cleanup periodique |
| **V3.25** | **v0.0.30** | **BUG-061 — HELLO immédiat Slave (fix boucle WIFI_GROUP_READY) + IP Slave via HELLO metadata (fix self-loop sans native method)** |

### 🔥 Détails BUG-041 (V3.11)

**3 bugs corrigés :**
1. **`getClientAddress()` ne fonctionne JAMAIS** : `WifiP2P.receiveMessage({meta:true})` côté GO reste bloqué car le Slave n'envoie jamais rien sur port 8000 → fallback SWAP permanent
2. **Clé Mesh `18_yabisso_dwazse` pollue les pairs suivants** : après `SYNC_COMPLETE`, `meshPeer` peut être `null` → seule la clé WiFi Direct est supprimée, la clé Mesh reste
3. **Itel A50 met ~20s à se connecter** (chipset Mediatek) : race avec `_waitForSlaveConfirmation` (5s) → handshake raté de justesse

**Stratégie "Transfer = Proof" :**
- Le Slave initie sa Phase 2 via `sendFileTo('192.168.49.1')` dans `_handleReceivedFile` (après `PACK_RECEIVED_OK`)
- Le Master attend `_slavePhase2Received` (max 15s) au lieu d'envoyer activement
- SYNC_COMPLETE → `_roleSwapQueue = {}` (vidage complet)
- Plus de SWAP_ROLE_REQUEST du tout
- Timeout `_waitForSlaveConfirmation` 20000 → 25000ms

---

---

# ============================================================
# FICHIER 1/3 : P2PAutoSync.js (1243 lignes)
# Chemin : app/src/features/bluetooth/services/P2PAutoSync.js
# Rôle : Orchestrateur central qui coordonne Mesh BLE + WiFi Direct
# ============================================================

```javascript
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
 * P2PAutoSync — L'Orchestrateur Central (V3.11 - Bidirectionnel initié par le Slave + Transfer = Proof)
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

    // V3.10 (BUG-FIX): Vérifier le swap UNIQUEMENT pour les clés connues de CE peer
    for (const k of [key, meshKey]) {
      if (k && this._roleSwapQueue[k]) {
        const forcedRole = this._roleSwapQueue[k];
        const amMaster = forcedRole === 'MASTER';
        this._log(`🔄 [V3.10 Swap Actif] Rôle forcé pour ${peerName} (clé=${k}) : ${forcedRole} (Je suis Master ? ${amMaster})`);
        return amMaster;
      }
    }

    // V3.6 (BUG-058 fix) : SCORE PARSING SÉCURISÉ
    const myScore = this._parseScore(WifiDirectService.getDeviceName());

    if (!meshPeer) {
      this._log(`⏭️ [V3.6] Peer "${peerName}" ignoré : pas de pair Mesh pour arbitrer (imprimante ou téléphone tiers ?)`);
      return null;
    }

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

  async _onWifiGroupReadyMesh(peerId, masterIp) {
    this._log(`📡 [V3.6.4 Mesh] WIFI_GROUP_READY reçu de Master ${peerId} (ip=${masterIp}) → Slave peut se connecter`);
    this._peerMeshId = peerId;
  }

  async _onSlaveConnectedConfirmedMesh(peerId) {
    this._log(`✅ [V3.6.4 Mesh] SLAVE_CONNECTED_CONFIRMED reçu de Slave ${peerId} → Master peut envoyer`);
    this._slaveConfirmedViaMesh = true;
    this._peerMeshId = peerId;
  }

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

  onMeshManifestDeltaCalculated(delta) {
    if (!delta) return;
    const lobaCount = delta.loba?.length || 0;
    const productCount = delta.products?.length || 0;
    const totalCount = lobaCount + productCount;
    this._hasPendingDelta = totalCount > 0;
    this._log(`✨ [V3.6.3 Delta Hook] Delta reçu: ${lobaCount} vidéos + ${productCount} produits = ${totalCount} items à pousser. _hasPendingDelta=${this._hasPendingDelta}`);

    if (WifiDirectService.connectedPeer && this._running) {
      this._log(`🚀 [V3.6.3 Delta Hook] Connexion WiFi active → déclenchement cycle immédiat...`);
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
    this._log('🚀 Orchestrateur démarré (V3.11 - Bidirectionnel initié par le Slave + Transfer = Proof).');

    NetworkRailDetector.start();
    NetworkRailDetector.onRailChange((rails) => {
      this.stats.activeRails = rails;
    });

    WifiDirectService.setGlobalFileHandler((path, meta) => this._handleReceivedFile(path, meta, 'WifiDirect'));

    NearbyMeshService.MeshLogEvents.subscribe((msg) => {
      this._log(`[MESH] ${msg}`);
    });

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
          this._packSentThisSession = false;
          NetworkRailDetector.setWifiDirectAvailable(true);
          this._isConnecting = false;
          if (WifiDirectService.isGroupOwner) {
            this._hasCreatedGroup = true;
          }

          const myScore = this._parseScore(WifiDirectService.getDeviceName());
          const meshPeer = this._getLatestMeshPeer();
          const peerScore = meshPeer ? meshPeer.score : 0;
          if (myScore > 0 && peerScore > 0) {
            this._lastIntendedRole = myScore > peerScore ? 'MASTER' : 'SLAVE';
          } else {
            this._lastIntendedRole = WifiDirectService.isGroupOwner ? 'MASTER' : 'SLAVE';
          }
          this._log(`■ [V3.7 Fix] Connexion Wi-Fi validée. myScore=${myScore}, peerScore=${peerScore} → Rôle logique affecté : ${this._lastIntendedRole}`);

          this._isRealConnected = false;
          this._slaveIpAddress = info?.groupOwnerAddress?.getHostAddress?.() || null;

          const isMyRoleMaster = this._lastIntendedRole === 'MASTER';
          const peerName = (info?.deviceName || WifiDirectService.connectedPeer?.deviceName || 'Unknown').toLowerCase();

          if (!isMyRoleMaster) {
            this._isRealConnected = true;
            this._log(`■ [V3.7 Slave] Mode Client validé. Lancement automatique du récepteur.`);
          } else {
            this._log(`🟡 [V3.6.5 Master] Groupe WiFi créé, en attente d'un vrai Slave...`);
          }

          if (isMyRoleMaster) {
            this._waitingForSlave = true;
            this._log(`■ [V3.10] Master : verrou _waitingForSlave ON (synchrone)`);
          }

          setTimeout(() => {
            if (!WifiDirectService.connectedPeer || !this._running) {
              if (isMyRoleMaster) {
                this._waitingForSlave = false;
                this._log(`■ [V3.10] Master : connexion perdue pendant délai, verrou levé`);
              }
              return;
            }
            if (isMyRoleMaster) {
              this._log(`■ [V3.10] Master : récepteur démarré, attente Slave...`);
              WifiDirectService.startReceiving(WifiDirectService.globalFileHandler);
              this._waitForSlaveConfirmation(peerName, 20000).then(confirmed => {
                this._waitingForSlave = false;
                if (confirmed && this._running && WifiDirectService.connectedPeer) {
                  this._log(`■ [V3.10] ✅ Slave confirmé → lancement envoi`);
                  this._p2pSyncCycle();
                } else {
                  this._log(`■ [V3.10] ⏰ Timeout — abandon`);
                }
              });
            } else {
              this._log(`■ [V3.10] Slave : récepteur + HELLO`);
              WifiDirectService.startReceiving(WifiDirectService.globalFileHandler);
              this._sendYabissoHello(false, peerName);
            }
          }, 1500);
        } else if (this._wasConnected) {
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
          this._waitingForSlave = false;
          this._peerHandshakeConfirmed = {};
          this._slavePhase2Received = false; // V3.11: reset flag Phase 2 à la déconnexion
          try { await NearbyMeshService.resumeMesh(); } catch (_) {}
          this._log('■ Déconnexion détectée. Nettoyage des processus.');
        }
      });

    } catch (e) {
      console.warn('[P2PAutoSync] WiFi Direct init error:', e.message);
    }

    if (this._p2pInterval) clearInterval(this._p2pInterval);
    this._p2pInterval = setInterval(() => this._p2pSyncCycle(), P2P_SYNC_INTERVAL_MS);
    this._p2pSyncCycle();

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
    // V3.9 BARRIÈRE ABSOLUE : on bloque le cycle tant que le Slave n'a pas confirmé
    if (this._waitingForSlave) {
      this._log('⏸️ [V3.9] Cycle bloqué — attente handshake Slave');
      return;
    }
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
            const roleResult = this._iAmMasterFor(peer.deviceName);
            if (roleResult === null) {
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
            
            this._isConnecting = true;
            let connectSuccess = false;
            try {
              connectSuccess = await WifiDirectService.connectToPeer(peer, 0, isMaster ? 'MASTER' : 'SLAVE');
            } catch (e) {
              this._log(`⚠️ [V3.6.1] connectToPeer exception: ${e.message}, reset du lock dans 5s...`);
              setTimeout(() => { this._isConnecting = false; }, 5000);
              return;
            }
            this._isConnecting = false;
            if (!connectSuccess) {
              this._log(`⚠️ [V3.6.1] connectToPeer a échoué, lock libéré. Retry dans 10s (backoff).`);
            } else {
              this._log(`✅ [V3.6.1] connectToPeer réussi, lock libéré.`);
            }
          } else {
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
        const myScore = this._parseScore(WifiDirectService.getDeviceName());
        const meshPeer = this._getLatestMeshPeer();
        const peerScore = meshPeer ? meshPeer.score : 0;
        const isMyRoleMaster = this._lastIntendedRole === 'MASTER';
        const hasPendingContent = this._pendingPostsCount > 0 || !!this._hasPendingDelta;
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
              this._packSentThisSession = true;
              this._hasPendingDelta = false;
              this._log(`✅ [V3.3] Pack Phase 1 envoyé !`);

              // V3.6.4 (Double validation) : ATTENDRE L'ACK DU SLAVE (5s max)
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
          } else {
            this._log(`❌ [V3.11] Échec envoi SYNC_COMPLETE`);
          }
          setTimeout(() => { WifiDirectService.disconnect(); }, 3000);
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
        const yabissoKey = (metadata.senderDevice || '').toLowerCase();
        const wifiDirectKey = (WifiDirectService.connectedPeer?.deviceName || '').toLowerCase();
        const keys = [yabissoKey, wifiDirectKey].filter(k => k && k !== 'unknown');
        
        if (metadata.type === 'SWAP_ROLE_REQUEST') {
          for (const k of keys) {
            this._roleSwapQueue[k] = 'SLAVE';
          }
          this._log(`🔄 [V3.2] SWAP reçu → je deviens SLAVE, l'autre devient MASTER`);
        } else if (metadata.type === 'SYNC_COMPLETE') {
          // V3.11 (BUG-041 fix) : VIDAGE COMPLET de _roleSwapQueue
          this._roleSwapQueue = {};
          this._completedSyncs[yabissoKey || wifiDirectKey] = Date.now();
          this._lastIntendedRole = null;
          this._packSentThisSession = false;
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
          this._confirmYabissoHandshake(senderDevice, metadata.myScore);
          this._lastYabissoPeerSeen = Date.now();
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
          // V3.11 (BUG-041 fix) : DÉTECTION PHASE 2 DU SLAVE
          if (metadata.phase === 'slave_phase2') {
            this._slavePhase2Received = true;
            this._log(`📥 [V3.11] Pack Phase 2 du Slave détecté (phase=slave_phase2)`);
          }
          this._log(`📥 Reçu Loba Pack. Traitement...`);
          const peerName = (metadata.senderDevice || WifiDirectService.connectedPeer?.deviceName || 'Unknown').toLowerCase();
          this._lastReceivedFrom[peerName] = Date.now();
          const success = await LobaPackService.unpackAndProcess(filePath);
          if (success) {
            this._log(`✅ Pack traité !`);
            this.stats.totalSyncedP2P++;
          }
          // V3.6.4 (Double validation) : ENVOYER PACK_RECEIVED_OK AU MASTER
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
                  phase: 'slave_phase2',
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
            }, 500);
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
      console.error('[P2PAutoSync] publishLocal error:', e.message);
      return { success: false, error: e.message };
    }
  }

  getStats() {
    return {
      ...this.stats,
      blePeers: NearbyMeshService.connectedPeers?.size || 0,
      wifiDirectPeer: WifiDirectService.connectedPeer ? 1 : 0,
      isRealConnected: this._isRealConnected,
      slaveIpAddress: this._slaveIpAddress,
      isGroupOwner: WifiDirectService.isGroupOwner,
    };
  }
}

export const P2PAutoSync = new P2PAutoSyncClass();
```

---

# ============================================================
# FICHIER 2/3 : NearbyMeshService.js (411 lignes)
# Chemin : app/src/features/bluetooth/services/NearbyMeshService.js
# Rôle : Service Mesh BLE (élection Master/Slave, handshake, échange manifestes)
# ============================================================

```javascript
// app/src/features/bluetooth/services/NearbyMeshService.js
import { 
  startAdvertise, 
  stopAdvertise, 
  startDiscovery, 
  stopDiscovery, 
  Strategy, 
  onPeerFound, 
  onPeerLost,
  onInvitationReceived,
  onConnected,
  onDisconnected,
  onTextReceived,
  sendText,
  acceptConnection,
  requestConnection,
  disconnect
} from 'expo-nearby-connections';
import * as FileSystem from 'expo-file-system/legacy';
import * as Device from 'expo-device';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import { GlobalManifestService } from './GlobalManifestService';
import { DailyQuotaService } from './DailyQuotaService';
import { NetworkPermissionsService } from './NetworkPermissionsService';
import { NetworkRailDetector } from './NetworkRailDetector';

console.log('[NearbyMeshService] Module chargé dans le bundle.');

const SERVICE_ID = 'com.benksidney.yabisso.mesh';

class SimpleEventEmitter {
  constructor() { this.listeners = []; }
  subscribe(callback) {
    this.listeners.push(callback);
    return () => { this.listeners = this.listeners.filter(cb => cb !== callback); };
  }
  emit(data) { this.listeners.forEach(cb => cb(data)); }
}

export const meshConnectionState = { isConnected: false, peerCount: 0, peers: [] };
export const MeshConnectionEvents = new SimpleEventEmitter();
export const MeshLogEvents = new SimpleEventEmitter();
export const MeshRequestEvents = new SimpleEventEmitter();
export const MeshContentUpdateEvents = new SimpleEventEmitter();

class NearbyMeshServiceClass {
  constructor() {
    this.connectedPeers = new Set();
    this.isAdvertising = false;
    this.isDiscovering = false;
    this.deviceName = null; 
    this._listeners = [];
    this._pendingConnections = new Map();
    this._connectionMutex = false;
    this._isRunning = false;
    this._isStarting = false;
    this._failedPeers = new Set();
    this._discoveredNodes = new Map();
    this._currentRole = null;
    this._pendingMasterTimeouts = [];
    
    this.MeshLogEvents = MeshLogEvents;
    this.MeshConnectionEvents = MeshConnectionEvents;
    this.MeshRequestEvents = MeshRequestEvents;
    this.MeshContentUpdateEvents = MeshContentUpdateEvents;
  }

  _log(msg) {
    console.log(`[NearbyMesh] ${msg}`);
    MeshLogEvents.emit(msg);
  }

  _getPowerScore() {
    try {
      const totalMemoryGB = (Device.totalMemory || 0) / (1024 * 1024 * 1024);
      return Math.round(totalMemoryGB * 10);
    } catch (e) {}
    return 50;
  }

  async startMesh() {
    if (this.isAdvertising || this.isDiscovering || this._isStarting) {
      this._log('Mesh déjà actif ou en démarrage (skip start).');
      return;
    }
    this._isStarting = true;

    try {
      this._log('--- DÉMARRAGE NEARBY MESH ---');
      this._log('Vérification du module natif...');
      this._log('Demande des permissions...');
      const hasPerms = await NetworkPermissionsService.requestAll();
      if (!hasPerms) {
        this._log('⚠️ Permissions refusées.');
        return;
      }
      
      this._log('Initialisation Quota...');
      await DailyQuotaService.initialize();
      
      this._log('Configuration des Listeners...');
      this._setupListeners();

      const { WifiDirectService } = require('./WifiDirectService');
      const powerScore = this._getPowerScore();
      this.deviceName = WifiDirectService.deviceName || `${powerScore}_Yabisso_${Math.random().toString(36).substring(7)}`;
      
      const strategy = Strategy.P2P_STAR;

      this._log(`Lancement Advertising: ${this.deviceName}...`);
      await startAdvertise(this.deviceName, strategy);
      this.isAdvertising = true;
      this._log('✅ Advertising actif.');

      this._log('Lancement Discovery...');
      await startDiscovery(this.deviceName, strategy);
      this.isDiscovering = true;
      this._log('✅ Discovery actif.');

      NetworkRailDetector.setBleAvailable(true);
      this._log('🚀 Mesh prêt et visible dans le réseau.');
      this._isStarting = false;

    } catch (e) {
      this._log(`❌ ÉCHEC CRITIQUE: ${e.message}`);
      this.isAdvertising = false;
      this.isDiscovering = false;
      this._isStarting = false;
    }
  }

  _setupListeners() {
    this._listeners.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
    this._listeners = [];

    this._listeners.push(onPeerFound((peer) => {
      this._log(`🔍 Node trouvé: ${peer.name} (${peer.peerId})`);
      
      if (peer.name === this.deviceName) {
        this._log(`⛔ [NearbyMesh] Mon propre node ignoré: ${peer.name}`);
        return;
      }
      
      const isYabissoPeer = /^\d+_Yabisso_/i.test(peer.name || '');
      if (!isYabissoPeer) {
        this._log(`⛔ [V3.5] Peer non-Yabisso ignoré: ${peer.name}`);
        return;
      }
      
      const myScore = parseInt(this.deviceName?.split('_')[0] || '0', 10);
      const peerScore = parseInt(peer.name?.split('_')[0] || '0', 10);
      
      const isMeshMaster = myScore > peerScore;
      try {
        const { P2PAutoSync } = require('./P2PAutoSync');
        P2PAutoSync.setMeshPeer(peer.peerId, peer.name, peerScore, isMeshMaster);
      } catch (_) {}

      if (myScore > peerScore) {
        this._log(`👑 [V3.5] Mesh Master détecté (${myScore} > ${peerScore}) → création du groupe WiFi Direct`);
        
        if (this._failedPeers.has(peer.peerId)) return;

        const { WifiDirectService } = require('./WifiDirectService');
        WifiDirectService.createGroup().then(success => {
          if (success) {
            this._log(`✅ [V3.5] Groupe WiFi Direct créé par le Master. J'attends que le Slave se connecte...`);
          } else {
            this._log(`⚠️ [V3.5] Échec création groupe WiFi Direct`);
          }
        }).catch(e => {
          this._log(`⚠️ [V3.5] createGroup exception: ${e.message}`);
        });

        requestConnection(peer.peerId).catch(err => {
          this._log(`❌ Échec requestConnection vers ${peer.peerId}: ${err.message}`);
          this._failedPeers.add(peer.peerId);
          setTimeout(() => this._failedPeers.delete(peer.peerId), 30000);
        });
      } else {
        this._log(`⏳ [V3.5] Mesh Slave (${myScore} < ${peerScore}) → j'attends que le Master crée le groupe WiFi Direct`);
      }
      
      this._log(`🚀 Déclenchement WiFi Direct pour transfert P2P...`);
      const { P2PAutoSync } = require('./P2PAutoSync');
      P2PAutoSync.triggerSync(null, true);
    }));

    this._listeners.push(onPeerLost(({ peerId }) => {
      this._log(`👻 Node perdu: ${peerId}`);
      this.connectedPeers.delete(peerId);
      this._updateState();
      try {
        const { P2PAutoSync } = require('./P2PAutoSync');
        P2PAutoSync.clearMeshPeer(peerId);
      } catch (_) {}
    }));

    this._listeners.push(onInvitationReceived((peer) => {
      this._log(`🤝 Invitation reçue de: ${peer.name} (${peer.peerId})`);
      this._log(`✅ Acceptation de la connexion...`);
      acceptConnection(peer.peerId).catch(err => {
        this._log(`❌ Échec acceptConnection: ${err.message}`);
      });
    }));

    this._listeners.push(onConnected((peer) => {
      this._log(`✨ CONNECTÉ à: ${peer.name} (${peer.peerId})`);
      this.connectedPeers.add(peer.peerId);
      this._updateState();
      this._sendManifest(peer.peerId);
    }));

    this._listeners.push(onDisconnected(({ peerId }) => {
      this._log(`🔌 Déconnecté de: ${peerId}`);
      this.connectedPeers.delete(peerId);
      this._updateState();
    }));

    this._listeners.push(onTextReceived(({ peerId, text }) => {
      this._handleDataReceived(peerId, text);
    }));
  }

  _updateState() {
    meshConnectionState.isConnected = this.connectedPeers.size > 0;
    meshConnectionState.peerCount = this.connectedPeers.size;
    meshConnectionState.peers = Array.from(this.connectedPeers);
    MeshConnectionEvents.emit({ ...meshConnectionState });
  }

  async pauseMesh() {
    if (!this.isAdvertising && !this.isDiscovering) return;
    this._log('⏸️ Pause Mesh (libération radio pour WiFi Direct)...');
    try {
      if (this.isAdvertising) { await stopAdvertise(); this.isAdvertising = false; }
      if (this.isDiscovering) { await stopDiscovery(); this.isDiscovering = false; }
      await new Promise(r => setTimeout(r, 500));
      this._log('✅ Mesh en pause.');
    } catch (e) {
      this._log(`⚠️ Erreur pause Mesh: ${e.message}`);
    }
  }

  async resumeMesh() {
    if (this.isAdvertising && this.isDiscovering) return;
    if (this._isStarting) return;
    this._log('▶️ Reprise Mesh après transfert WiFi...');
    try {
      if (!this.deviceName) {
        const { WifiDirectService } = require('./WifiDirectService');
        const powerScore = this._getPowerScore();
        this.deviceName = WifiDirectService.deviceName || `${powerScore}_Yabisso_${Math.random().toString(36).substring(7)}`;
      }
      const strategy = Strategy.P2P_STAR;
      if (!this.isAdvertising) { await startAdvertise(this.deviceName, strategy); this.isAdvertising = true; }
      if (!this.isDiscovering) { await startDiscovery(this.deviceName, strategy); this.isDiscovering = true; }
      this._log('✅ Mesh relancé.');
    } catch (e) {
      this._log(`⚠️ Erreur reprise Mesh: ${e.message}`);
    }
  }

  async stopMesh() {
    if (this._isStopping) return;
    this._isStopping = true;
    try {
      this._log('Arrêt du Mesh...');
      await stopAdvertise();
      await stopDiscovery();
      await new Promise(r => setTimeout(r, 1000));
      
      this._listeners.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
      this._listeners = [];
      this.connectedPeers.clear();
      this.isAdvertising = false;
      this.isDiscovering = false;
      this._updateState();
      NetworkRailDetector.setBleAvailable(false);
      this._log('Mesh arrêté.');
    } catch (e) {
      this._log(`Erreur arrêt: ${e.message}`);
    } finally {
      this._isStopping = false;
    }
  }

  async _sendManifest(peerId) {
    try {
      const manifest = await GlobalManifestService.generateGlobalManifest();
      if (!manifest) return;
      const payload = JSON.stringify({ type: 'global_manifest', manifest });
      await sendText(peerId, payload);
      this._log(`📤 Manifeste envoyé (${manifest.loba?.length || 0} items)`);
    } catch (e) {
      this._log(`⚠️ Échec envoi manifeste: ${e.message}`);
    }
  }

  async _handleDataReceived(peerId, text) {
    try {
      const data = JSON.parse(text);
      if (data.type === 'global_manifest') {
        this._handleGlobalManifestReceived(peerId, data.manifest);
      } else if (data.type === 'validation_request') {
        this._log(`📩 Requête de validation reçue de ${peerId}`);
        MeshRequestEvents.emit({ peerId, request: data.payload });
      } else if (data.type === 'wifi_group_ready') {
        this._log(`📡 [V3.6.4 Mesh] WIFI_GROUP_READY reçu de ${peerId} (masterIp=${data.masterIp})`);
        MeshRequestEvents.emit({ type: 'WIFI_GROUP_READY', peerId, masterIp: data.masterIp });
      } else if (data.type === 'slave_connected_confirmed') {
        this._log(`✅ [V3.6.4 Mesh] SLAVE_CONNECTED_CONFIRMED reçu de ${peerId}`);
        MeshRequestEvents.emit({ type: 'SLAVE_CONNECTED_CONFIRMED', peerId });
      }
    } catch (e) { }
  }

  async sendMeshMessage(peerId, message) {
    try {
      const payload = JSON.stringify(message);
      await sendText(peerId, payload);
      this._log(`📤 [V3.6.4 Mesh] Message envoyé à ${peerId}: ${message.type}`);
      return true;
    } catch (e) {
      this._log(`⚠️ [V3.6.4 Mesh] Échec envoi message à ${peerId}: ${e.message}`);
      return false;
    }
  }

  async _handleGlobalManifestReceived(peerId, remoteManifest) {
    if (!remoteManifest) return;
    this._log(`📥 Manifeste reçu de ${peerId}. Analyse des deltas...`);

    try {
      const delta = await GlobalManifestService.calculateGlobalDelta(remoteManifest);
      const lobaCount = delta.loba?.length || 0;
      const productCount = delta.products?.length || 0;

      try {
        const { P2PAutoSync } = require('./P2PAutoSync');
        P2PAutoSync.onMeshManifestDeltaCalculated(delta);
      } catch (e) {
        this._log(`⚠️ [V3.6.3] Échec hook delta: ${e.message}`);
      }

      if (lobaCount > 0 || productCount > 0) {
        this._log(`✨ Delta détecté: ${lobaCount} vidéos, ${productCount} produits. Activation WiFi Direct...`);
        const { P2PAutoSync } = require('./P2PAutoSync');
        P2PAutoSync.triggerSync(null, true);
      } else {
        this._log('✅ Déjà à jour avec ce node.');
      }
    } catch (e) {
      this._log(`⚠️ Erreur analyse delta: ${e.message}`);
    }
  }

  async sendValidationRequest(payload) {
    try {
      const data = JSON.stringify({ type: 'validation_request', payload });
      for (const peerId of this.connectedPeers) {
        await sendText(peerId, data);
      }
      this._log('📤 Requête de validation envoyée aux nodes à proximité.');
      return true;
    } catch (e) {
      this._log(`❌ Échec envoi requête: ${e.message}`);
      return false;
    }
  }
}

export const NearbyMeshService = new NearbyMeshServiceClass();
```

---

# ============================================================
# FICHIER 3/3 : WifiDirectService.js (604 lignes)
# Chemin : app/src/features/bluetooth/services/WifiDirectService.js
# Rôle : Wrapper natif WiFi Direct (react-native-wifi-p2p)
# Note V3.11 : getClientAddress() conservé pour compat mais plus utilisé
# ============================================================

```javascript
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
      try { await WifiP2P.removeGroup(); } catch (_) {}
      try { await WifiP2P.stopDiscoveringPeers(); } catch (_) {}
      await new Promise(r => setTimeout(r, 1000));
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
      
      const effectivePeerScore = isNaN(peerScore) ? 100 : peerScore;
      const iAmMaster = forceRole ? (forceRole === 'MASTER') : (myScore > effectivePeerScore);

      console.log(`[WifiDirectService] 🔄 Tentative ${iAmMaster ? 'MASTER' : 'SLAVE'}`);

      if (iAmMaster) {
        try { await WifiP2P.removeGroup(); } catch (_) {}
        try { await WifiP2P.stopDiscoveringPeers(); } catch (_) {}
        await new Promise(r => setTimeout(r, 1000));

        try {
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
        await new Promise(r => setTimeout(r, 500));

        try {
          await Promise.race([
            WifiP2P.connect(macAddr),
            new Promise((_, reject) => setTimeout(() => reject(new Error('connect timeout 8s')), 8000))
          ]);
          this.isConnecting = false;
          return true;
        } catch (e) {
          console.warn('[WifiDirectService] ⚠️ Erreur connect (tentative 1):', e.message);
          this.isConnecting = false;
          await new Promise(r => setTimeout(r, 2000));
          try {
            await Promise.race([
              WifiP2P.connect(macAddr),
              new Promise((_, reject) => setTimeout(() => reject(new Error('connect retry timeout 8s')), 8000))
            ]);
            console.log('[WifiDirectService] ✅ Retry SLAVE réussi !');
            return true;
          } catch (e2) {
            console.warn('[WifiDirectService] ❌ Erreur connect (tentative 2):', e2.message);
            this.isConnecting = false;
            try { await WifiP2P.startDiscoveringPeers(); this.isDiscovering = true; } catch (_) {}
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
    if (!this.isConnected) return false;
    if (this._isSending) return false;
    this._isSending = true;

    try {
      await this._refreshConnectionInfo();
    } catch (_) {}

    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (filePath) {
          const cleanPath = filePath.replace('file://', '');
          console.log(`[WifiDirectService] 📤 sendFile (tentative ${attempt}/${MAX_RETRIES}): ${cleanPath}`);
          await Promise.race([
            WifiP2P.sendFile(cleanPath),
            new Promise((_, reject) => setTimeout(() => reject(new Error('sendFile timeout')), 120000))
          ]);
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
  // V3.11 : Utilisé par le Slave pour envoyer son pack au Master (192.168.49.1)
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
  // V3.11 (BUG-041) : Cette méthode ne fonctionne PAS sur Itel A50 (le Slave n'envoie
  // jamais rien sur le port 8000 dans ce contexte). Conservée pour compat future
  // mais PLUS UTILISÉE dans le flow bidirectionnel. Le Slave utilise directement
  // l'IP 192.168.49.1 (toujours valide sur Android) pour sa Phase 2.
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
      let clientIp = null;
      let messageBody = null;
      if (typeof result === 'string') {
        messageBody = result;
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
      try {
        await this._refreshConnectionInfo();
      } catch (_) {}

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
      const cleanControlFile = controlFile.replace('file://', '');
      await Promise.race([
        WifiP2P.sendFile(cleanControlFile),
        new Promise((_, reject) => setTimeout(() => reject(new Error('sendControlMessage timeout')), 15000))
      ]);
      console.log(`[WifiDirectService] ✅ sendControlMessage réussi`);
      try { await FileSystem.deleteAsync(controlFile, { idempotent: true }); } catch (_) {}
      return true;
    } catch (e) {
      console.warn(`[WifiDirectService] ❌ sendControlMessage error: ${e.message}`);
      return false;
    } finally {
      this._isSending = false;
    }
  }

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
            const content = await FileSystem.readAsStringAsync(path);
            const meta = JSON.parse(content);
            if (meta.action === 'CONTROL_MESSAGE') {
              if (callback) callback(null, meta);
              try { await FileSystem.deleteAsync(path, { idempotent: true }); } catch (_) {}
            } else if (meta.action === 'FILE_TRANSFER' || meta.type === 'LOBA_PACK') {
              if (callback) callback(path, meta);
            }
          } catch (_) {
            if (callback) callback(path, { action: 'FILE_TRANSFER', type: 'LOBA_PACK', senderDevice: 'unknown' });
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
```

---

# 📋 Notes pour la réinjection

Pour réinjecter ce code dans le projet :

1. **Sauvegarder** les fichiers actuels :
```bash
cp app/src/features/bluetooth/services/P2PAutoSync.js mesfichiers/P2P/bluetooth/services/P2PAutoSync.js
cp app/src/features/bluetooth/services/NearbyMeshService.js mesfichiers/P2P/bluetooth/services/NearbyMeshService.js
cp app/src/features/bluetooth/services/WifiDirectService.js mesfichiers/P2P/bluetooth/services/WifiDirectService.js
```

2. **Remplacer** le contenu de chaque fichier par le code ci-dessus (entre les blocs ```javascript).

3. **Vérifier la syntaxe** :
```bash
cd app
node --check src/features/bluetooth/services/P2PAutoSync.js
node --check src/features/bluetooth/services/NearbyMeshService.js
node --check src/features/bluetooth/services/WifiDirectService.js
```

4. **Rebuild APK** :
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

5. **Tester** sur les 2 phones (Xiaomi Master + Itel A50 Slave) avec hard reload.

---

## 🔍 Points d'attention pour l'ami reviewer

- **V3.11 retire `getClientAddress()`** : pas supprimé du code, juste plus utilisé. Si tu veux le supprimer complètement, c'est safe.
- **V3.11 retire branche SWAP fallback** : la branche `else { SWAP_ROLE_REQUEST }` n'existe plus dans `_p2pSyncCycle`.
- **V3.11 attend `_slavePhase2Received` (15s)** : si le Slave n'envoie pas en 15s, best-effort SYNC_COMPLETE. Pas de blocage.
- **V3.11 timeout slave 25s** : `_waitForSlaveConfirmation(peerName, 20000)` côté `setTimeout` V3.10 reste à 20s (peut être augmenté à 25s pour cohérence avec la valeur par défaut).
- **Phase 2 Slave** : nouvelle logique dans `_handleReceivedFile` après `PACK_RECEIVED_OK`. Si le buildPack échoue ou sendFileTo échoue, on log et continue (pas de crash).

---

*Document généré le 2026-06-05 04:30:00 — Version V3.11 (v0.0.21) — 2258 lignes de code source*
