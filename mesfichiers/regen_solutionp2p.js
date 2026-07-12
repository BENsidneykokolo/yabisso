const fs = require('fs');

const HEADER = `# SOLUTION P2P — CODE COMPLET DU PARTAGE AUTOMATIQUE (V3.12 — ÉTAPE 1)

> **Date d'extraction** : 2026-06-05
> **Version** : v0.0.22 (V3.12 — Sprint 1 : Connexion propre)
> **3 fichiers du partage automatique WiFi Direct + Mesh BLE** :
> 1. \`P2PAutoSync.js\` (1260 lignes) — Orchestrateur central
> 2. \`NearbyMeshService.js\` (420 lignes) — Service Mesh BLE (élection, handshake)
> 3. \`WifiDirectService.js\` (604 lignes) — Wrapper natif WiFi Direct
>
> **Total** : 2284 lignes de code copiées-collées à 100% (rien d'omis, rien de résumé).
> **Diff vs V3.11** : +26 lignes (4 fixes ciblés, AUCUN changement sur la logique d'envoi)

---

## 📋 Résumé des fixes V3.6 → V3.12

| Version | Commit | Fix |
|---------|--------|-----|
| V3.6    | v0.0.16 | BUG-058 — \`isConnecting\` lock + \`_iAmMasterFor\` retourne \`null\` si pas de Mesh peer (évite imprimantes) |
| V3.6.1  | v0.0.17 | BUG-058 — Libère le lock \`isConnecting\` immédiatement après \`connectToPeer\` (catch ne fire jamais) |
| V3.6.2  | v0.0.17 | BUG-059 — Hydrate \`_lastIntendedRole\` depuis \`isGroupOwner\` (vérité matérielle) + 1000ms pause Slave avant \`startReceiving\` |
| V3.6.3  | v0.0.18 | BUG-060 — Corriger \`shouldSend\` inversé (Master=score haut) + hook delta manifeste |
| V3.6.4  | v0.0.19 | DOUBLE VALIDATION — ACK \`PACK_RECEIVED_OK\` (Slave→Master) + Mesh handshake \`WIFI_GROUP_READY\` / \`SLAVE_CONNECTED_CONFIRMED\` |
| V3.6.5  | v0.0.20 | REAL CONNECTION CHECK — Master attend confirmation Slave (\`YABISSO_HELLO_ACK\`) avant d'envoyer pack + flag \`isRealConnected\` exposé dans \`getStats()\` pour l'UI |
| V3.7    | v0.0.20 | FIX UNILATÉRAL — Élection Mesh (score) prioritaire sur hardware \`isGroupOwner\` (corrige double-SLAVE sur Itel A50 lent) |
| V3.8    | v0.0.20 | Timeout \`_waitForSlaveConfirmation\` étendu à 20s + recherche dans TOUTES les clés \`_peerHandshakeConfirmed\` |
| V3.9    | v0.0.20 | BARRIÈRE \`_waitingForSlave\` + pattern \`.then()\` (pas d'\`await\` dans \`setTimeout\`) + reset handshake à chaque session |
| V3.10   | v0.0.21 | FIX \`_roleSwapQueue\` ciblé (itération sur [key, meshKey] uniquement, plus \`...Object.keys(...)\`) + barrière \`_waitingForSlave\` synchrone |
| V3.11   | v0.0.21 | BUG-041 — BIDIRECTIONNEL INITIÉ PAR LE SLAVE : suppression \`getClientAddress()\` (échouait) + suppression SWAP fallback + \`_roleSwapQueue = {}\` complet sur SYNC_COMPLETE + Slave \`sendFileTo('192.168.49.1')\` dans \`_handleReceivedFile\` + Master attend \`_slavePhase2Received\` 15s + timeout slave wait 20s→25s |
| **V3.12** | **v0.0.22** | **Sprint 1 (Étape 1)** — 4 FIXES CIBLÉS, AUCUN CHANGEMENT SUR LA LOGIQUE D'ENVOI : (A) Singleton strict sur \`NearbyMeshService\` ; (B) Slave déclenche \`_p2pSyncCycle\` immédiatement (sans attendre cycle 3s) ; (C) Timeout Master \`_waitForSlaveConfirmation\` 20s→35s ; (D) Throttle 60s sur log \`⏭️ ignoré\` du même peer (anti-spam itel A50) |

### 🔥 Détails Sprint 1 — V3.12 (4 fixes)

**Problème observé dans les logs V3.11** :
1. **Double instance NearbyMesh** : score 73 ET score 18 sur le même device (singleton non protégé)
2. **Slave arrive trop tard** : Master timeout 20s, Slave Mediatek met 15-20s à se connecter → race perdu
3. **\`pendingContent=true\` jamais reset** côté Slave (Phase 2 bloquée — non traité dans cette Étape 1, reporté Sprint 2)
4. **itel A50 spamme les logs** \`⏭️ ignoré\` toutes les 3s pour les peers non-Mesh (imprimantes, téléphones tiers)

**Solution V3.12** : 4 fixes ciblés, AUCUN changement sur la logique d'envoi de packs
- **Fix A (singleton)** : ajout check \`NearbyMeshService._instance\` en début de \`startMesh()\` → bloque le double démarrage
- **Fix B (timing Slave)** : suppression du délai 3s implicite dans le else branch de \`onPeerFound\` → ajout \`setTimeout(100)\` qui déclenche \`_p2pSyncCycle()\` immédiatement
- **Fix C (timeout Master)** : \`_waitForSlaveConfirmation(peerName, 20000)\` → \`(peerName, 35000)\` (marge 15s pour Mediatek)
- **Fix D (throttle logs)** : nouveau \`this._ignoredPeers = new Map()\` + check 60s avant le log \`⏭️ ignoré\`

**Localisation exacte** :
| Fix | Fichier | Ligne | Code ajouté |
|-----|---------|-------|-------------|
| A | \`NearbyMeshService.js\` | 84-91 | \`if (NearbyMeshService._instance && !== this) return; NearbyMeshService._instance = this;\` |
| B | \`P2PAutoSync.js\` | 443-452 | \`setTimeout(100) → _p2pSyncCycle()\` dans else branch |
| C | \`P2PAutoSync.js\` | 523 | \`35000\` au lieu de \`20000\` |
| D | \`P2PAutoSync.js\` | 53, 407-416 | \`_ignoredPeers = new Map()\` + check 60s avant log ignoré |

**Non touché dans V3.12 (préservé pour Sprint 2)** :
- \`_p2pSyncCycle\` (envoi packs)
- \`_handleReceivedFile\` (réception)
- \`SYNC_COMPLETE\` handler
- Bidirectionnel V3.11 (Phase 1 + Phase 2)
- BUG-042 #3 (pendingContent reset côté Slave) sera traité au Sprint 2

---

---

# ============================================================
# FICHIER 1/3 : P2PAutoSync.js (1260 lignes)
# Chemin : app/src/features/bluetooth/services/P2PAutoSync.js
# Rôle : Orchestrateur central qui coordonne Mesh BLE + WiFi Direct
# ============================================================

\`\`\`javascript
`;

const FILE_1_END = `
\`\`\`

---

# ============================================================
# FICHIER 2/3 : NearbyMeshService.js (420 lignes)
# Chemin : app/src/features/bluetooth/services/NearbyMeshService.js
# Rôle : Service Mesh BLE (élection Master/Slave, handshake)
# ============================================================

\`\`\`javascript
`;

const FILE_2_END = `
\`\`\`

---

# ============================================================
# FICHIER 3/3 : WifiDirectService.js (604 lignes — INCHANGÉ en V3.12)
# Chemin : app/src/features/bluetooth/services/WifiDirectService.js
# Rôle : Wrapper natif WiFi Direct (createGroup, connect, sendFile, etc.)
# ============================================================

\`\`\`javascript
`;

const FILE_3_END = `
\`\`\`

---

## 🔍 Points d'attention pour l'ami reviewer (V3.12)

- **V3.12 Fix A (singleton NearbyMesh)** : check \`NearbyMeshService._instance\` en début de \`startMesh()\` — bloque les double-démarrages.
- **V3.12 Fix B (timing Slave)** : \`setTimeout(100)\` dans else branch de \`onPeerFound\` (ligne 447) — déclenche \`_p2pSyncCycle\` immédiatement au lieu d'attendre le cycle 3s.
- **V3.12 Fix C (timeout 35s)** : \`_waitForSlaveConfirmation(peerName, 35000)\` (ligne 523) — marge confortable pour chipset Mediatek.
- **V3.12 Fix D (throttle 60s)** : \`this._ignoredPeers = new Map()\` (constructor ligne 53) + check 60s avant log \`⏭️ ignoré\` (lignes 407-416).
- **V3.12 NE TOUCHE PAS** : \`_p2pSyncCycle\`, \`_handleReceivedFile\`, \`SYNC_COMPLETE\`, Phase 1/2 bidirectionnel.
- **Bug restant (Sprint 2)** : \`pendingContent=true\` jamais reset côté Slave après \`PACK_RECEIVED_OK\`.
- **Limitation Nearby Connections** : l'objet \`peer\` n'expose que \`name\` et \`peerId\` (4 chars). Pas d'IP/MAC. Le matching cross-channel reste par pattern Yabisso + score.

### Diff vs V3.11 (v0.0.21)
| Fichier | Lignes V3.11 | Lignes V3.12 | Δ |
|---------|--------------|--------------|---|
| P2PAutoSync.js | 1243 | 1260 | +17 |
| NearbyMeshService.js | 411 | 420 | +9 |
| WifiDirectService.js | 604 | 604 | 0 |

---

*Document généré le 2026-06-05 05:30:00 — Version V3.12 (v0.0.22) — 2284 lignes de code source*
`;

const p2p = fs.readFileSync('app/src/features/bluetooth/services/P2PAutoSync.js', 'utf8');
const mesh = fs.readFileSync('app/src/features/bluetooth/services/NearbyMeshService.js', 'utf8');
const wifi = fs.readFileSync('app/src/features/bluetooth/services/WifiDirectService.js', 'utf8');

const result = HEADER + p2p + FILE_1_END + FILE_2_END + mesh + FILE_2_END + FILE_3_END + wifi + FILE_3_END;

fs.writeFileSync('mesfichiers/solutionp2p.md', result);
console.log('OK : solutionp2p.md généré (' + result.split('\n').length + ' lignes, ' + Math.round(result.length/1024) + ' KB)');
