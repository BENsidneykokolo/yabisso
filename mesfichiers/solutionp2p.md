# SOLUTION P2P — Fix du transfert WiFi Direct

## Diagnostic complet

### Le symptôme
Les 2 téléphones (Itel A50 score=73, Xiaomi 11T score=18) se connectent en WiFi Direct, mais le transfert de pack Loba n'aboutit jamais. Le Xiaomi génère le pack (23.2MB) et appelle `sendFile`, mais l'Itel reçoit un `receiveFile timeout`.

### La cause racine
**Les 2 téléphones créent chacun leur propre groupe P2P (`createGroup()`) au même moment.** Android les affiche tous les deux en `GO=true`, mais ce sont 2 groupes séparés — il n'y a pas de vrai canal de données entre eux. C'est une connexion fantôme.

### Pourquoi ça arrive
Quand les 2 phones démarrent en même temps :

1. Aucun ne voit de peer WiFi Direct pendant les ~20 premières secondes
2. Les 2 passent par le chemin "MASTER proactif" dans `_p2pSyncCycle()` (ligne ~597-628)
3. Les 2 appellent `WifiDirectService.createGroup()` indépendamment
4. Android crée 2 groupes P2P distincts
5. Les 2 affichent `GO=true` mais ne peuvent pas communiquer

### Preuve dans les logs
```
[WifiDirectService] ✅ createGroup réussi (mode MASTER proactif)    ← Xiaomi
[WifiDirectService] ✅ CONNECTÉ: GO=true                           ← Xiaomi
[P2PAutoSync] 📶 WiFi Direct CONNECTÉ ! GO=true, Rôle intendé=MASTER ← Xiaomi

[WifiDirectService] ✅ createGroup réussi (mode MASTER proactif)    ← Itel (APRÈS)
[WifiDirectService] ✅ CONNECTÉ: GO=true                           ← Itel
[P2PAutoSync] 📶 WiFi Direct CONNECTÉ ! GO=true, Rôle intendé=MASTER ← Itel
```

Les 2 sont GO=true = 2 groupes différents = pas de transfert possible.

---

## Architecture actuelle du flow P2P

```
Nearby Mesh discovere peer
    ↓
P2PAutoSync.triggerSync() est appelé
    ↓
_p2pSyncCycle() s'exécute
    ↓
Vérifie: connectedPeer? → NON
    ↓
Vérifie: nonBlacklistedPeers.length > 0?
    → SI OUI: connectToPeer() avec rôle calculé par _iAmMasterFor()
    → SI NON: "MASTER proactif" → createGroup()   ← PROBLÈME ICI
```

### Le chemin problématique (ligne 597-628)
```javascript
// Quand aucun peer n'est vu
if (timeSinceLastYabisso > 20000 && timeSinceLastProactive > 30000) {
  // ...
  // Le device dit "je deviens MASTER proactif"
  this._log(`📡 [Cycle] Aucun peer Yabisso depuis ${displaySec} → MASTER proactif...`);
  await WifiDirectService.createGroup();  // ← CRÉE UN GROUPE
}
```

Ce chemin s'exécute sur LES DEUX devices en même temps car :
- Les 2 démarrent en même temps
- Les 2 n'ont pas de peer pendant 20s
- Les 2 décident de devenir MASTER proactif

### Le chemin correct (ligne 552-576)
```javascript
// Quand un peer est détecté
if (nonBlacklistedPeers.length > 0) {
  const isMaster = this._iAmMasterFor(peer.deviceName);
  // MASTER: connectToPeer() avec createGroup
  // SLAVE: attend (ne fait rien, laisse le cycle 3s s'en occuper)
}
```

Ce chemin fonctionne bien MAIS il n'est jamais atteint car les 2 devices créent un groupe AVANT de voir le peer.

---

## Les 3 solutions

### Solution 1 — Un seul createGroup proactif (RECOMMANDÉ)

**Principe** : Empêcher le device avec le score le plus bas de créer un groupe. Seul le device avec le score le plus élevé a le droit de créer un groupe proactif.

**Où modifier** : `P2PAutoSync.js`, `_p2pSyncCycle()`, ligne ~620-628

**Logique actuelle** :
```javascript
if (peerScore > 0 && myScore > 0 && peerScore > myScore) {
  // J'attends que le peer devienne MASTER
} else {
  // Je deviens MASTER proactif
  await WifiDirectService.createGroup();
}
```

**Logique corrigée** :
```javascript
const meshPeer = this._getLatestMeshPeer();
const peerScore = meshPeer ? meshPeer.score : 0;
const myScore = this._parseScore(WifiDirectService.getDeviceName());

// Règle: seul le score le plus élevé crée le groupe
if (peerScore > 0 && myScore > 0 && myScore <= peerScore) {
  // Mon score est <= au peer → je N'crée PAS de groupe, j'attends
  this._log(`⏸️ [Cycle] Score ${myScore} <= peer ${peerScore} → j'attends que le peer crée le groupe`);
  this._lastIntendedRole = 'SLAVE';
  this._syncingP2P = false;
  return;
}

// Ici: myScore > peerScore (ou peerScore inconnu)
// Je peux créer le groupe
this._log(`📡 [Cycle] MASTER proactif. Mon score=${myScore}, peer=${peerScore || 'inconnu'}`);
await WifiDirectService.createGroup();
```

**Avantages** :
- Simple, 1 seul endroit à modifier
- Corrige le root cause directement
- Compatible avec le flow existant

**Inconvénients** :
- Si le device avec le score élevé démarre en retard, il y a un délai
- Si le peerScore est 0 (mesh pas encore connecté), le device créera quand même le groupe (comportement actuel)

**Cas limites à gérer** :
- Si les 2 ont le même score → lequel crée? → Utiliser le nom WiFi Direct (ordre alphabétique) comme tiebreaker
- Si le mesh peer n'est pas encore détecté (peerScore=0) → on garde le comportement actuel (créer le groupe)

---

### Solution 2 — Vérifier l'état GO réel avant createGroup

**Principe** : Avant d'appeler `createGroup()`, interroger Android pour savoir si un groupe P2P existe déjà. Si oui, on rejoint en SLAVE au lieu de créer un 2e groupe.

**Où modifier** : `WifiDirectService.js`, méthode `connectToPeer()` et/ou `_p2pSyncCycle()`

**Logique** :
```javascript
// AVANT createGroup(), vérifier si un GO existe déjà
try {
  const groupInfo = await WifiP2P.requestGroupInfo();
  if (groupInfo && groupInfo.groupOwnerAddress) {
    // Un GO existe déjà → je me connecte en SLAVE
    this._log(` Un GO existe déjà (${groupInfo.groupOwnerAddress}) → connexion SLAVE`);
    this._lastIntendedRole = 'SLAVE';
    // se connecter au GO existant au lieu de créer
  }
} catch (_) {
  // Pas de groupe → je peux créer
  await WifiP2P.createGroup();
}
```

**Avantages** :
- Fonctionne quel que soit l'ordre de démarrage
- Plus robuste que la Solution 1

**Inconvénients** :
- `requestGroupInfo()` n'est peut-être pas exposé par `react-native-wifi-p2p` (à vérifier)
- Timing délicat : le groupe peut apparaître entre la vérification et l'appel
- Plus complexe à implémenter

---

### Solution 3 — Supprimer le MASTER proactif, laisser Nearby Mesh décider

**Principe** : Supprimer complètement le `createGroup()` proactif dans `_p2pSyncCycle()`. Laisser Nearby Mesh (BLE) être le seul déclencheur de la connexion WiFi Direct. Quand Nearby Mesh détecte un peer, il informe P2PAutoSync qui lance `triggerSync()` → `_p2pSyncCycle()` → `connectToPeer()`.

**Où modifier** : `P2PAutoSync.js`, `_p2pSyncCycle()`, supprimer le bloc ligne 597-628

**Logique** :
```javascript
// SUPPRIMER tout le bloc "MASTER proactif"
// if (timeSinceLastYabisso > 20000 && timeSinceLastProactive > 30000) { ... }

// Garder uniquement le chemin où un peer est détecté
if (nonBlacklistedPeers.length > 0) {
  const isMaster = this._iAmMasterFor(peer.deviceName);
  // ... logique existante
}
// Sinon: on attend simplement (pas de createGroup proactif)
```

**Avantages** :
- Zéro conflit de GO (pas de createGroup sans peer connu)
- Nearby Mesh gère la découverte et le rôle
- Plus simple

**Inconvénients** :
- Si Nearby Mesh ne fonctionne pas, le WiFi Direct ne démarre jamais
- Fonctionne moins bien si le BLE est désactivé
- Nécessite que Nearby Mesh soit fiable (ce qui est le cas actuellement)

---

## Recommandation

**Commencer par la Solution 1** car :
1. C'est la modification la plus ciblée (1 bloc de code)
2. Elle corrige le root cause (2 GO simultanés)
3. Elle est compatible avec le flow existant
4. Si ça ne suffit pas, on peut empiler la Solution 2 ou 3

La Solution 1 est essentially ce que `_iAmMasterFor()` fait déjà pour le peer trouvé, mais appliqué au cas "MASTER proactif".

---

## Détails d'implémentation Solution 1

### Fichier : `P2PAutoSync.js`

### Bloc à modifier : `_p2pSyncCycle()` (ligne ~597-628)

**AVANT** (code actuel) :
```javascript
if (timeSinceLastYabisso > 20000 && timeSinceLastProactive > 30000) {
  const timeSinceLastGroup = Date.now() - this._lastGroupCreatedAt;
  if (timeSinceLastGroup > GROUP_CREATE_COOLDOWN_MS) {
    const displaySec = this._lastYabissoPeerSeen > 0 ? `${Math.round(timeSinceLastYabisso/1000)}s` : 'jamais';

    const myScore = this._parseScore(WifiDirectService.getDeviceName());
    const meshPeer = this._getLatestMeshPeer();
    const peerScore = meshPeer ? meshPeer.score : 0;
    const peerName = meshPeer ? meshPeer.name : null;

    if (this._lastGroupCreatedAt > 0 && !meshPeer) {
      this._log(`⏸️ [V2.14] J'ai déjà créé un groupe (${displaySec}) et pas de peer mesh → j'attends qu'on me rejoigne`);
      this._lastIntendedRole = 'SLAVE';
      this._syncingP2P = false;
      return;
    }

    if (peerScore > 0 && myScore > 0 && peerScore > myScore) {
      this._log(`⏸️ [Cycle] Peer ${peerName} (score=${peerScore}) > moi (score=${myScore}) → j'attends qu'il devienne MASTER...`);
      this._lastIntendedRole = 'SLAVE';
    } else {
      this._log(`📡 [Cycle] Aucun peer Yabisso depuis ${displaySec} → MASTER proactif (être découvrable)... Mon score=${myScore}, Peer score=${peerScore || 'inconnu'}`);
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
```

**APRÈS** (logique corrigée) :
```javascript
if (timeSinceLastYabisso > 20000 && timeSinceLastProactive > 30000) {
  const timeSinceLastGroup = Date.now() - this._lastGroupCreatedAt;
  if (timeSinceLastGroup > GROUP_CREATE_COOLDOWN_MS) {
    const displaySec = this._lastYabissoPeerSeen > 0 ? `${Math.round(timeSinceLastYabisso/1000)}s` : 'jamais';

    const myScore = this._parseScore(WifiDirectService.getDeviceName());
    const meshPeer = this._getLatestMeshPeer();
    const peerScore = meshPeer ? meshPeer.score : 0;
    const peerName = meshPeer ? meshPeer.name : null;

    if (this._lastGroupCreatedAt > 0 && !meshPeer) {
      this._log(`⏸️ [V2.14] J'ai déjà créé un groupe (${displaySec}) et pas de peer mesh → j'attends qu'on me rejoigne`);
      this._lastIntendedRole = 'SLAVE';
      this._syncingP2P = false;
      return;
    }

    // FIX: Seul le score le plus élevé crée le groupe
    // Si le peer a un score connu et >= au mien, je n'crée PAS de groupe
    if (peerScore > 0 && myScore > 0 && myScore <= peerScore) {
      this._log(`⏸️ [Cycle] Mon score (${myScore}) <= peer (${peerScore}) → j'attends que ${peerName || 'le peer'} crée le groupe...`);
      this._lastIntendedRole = 'SLAVE';
      this._syncingP2P = false;
      return;
    }

    // Ici: peerScore=0 (inconnu) OU myScore > peerScore
    // J'ai le droit de créer le groupe
    this._log(`📡 [Cycle] Aucun peer Yabisso depuis ${displaySec} → MASTER proactif. Mon score=${myScore}, peer=${peerScore || 'inconnu'}`);
    this._lastMasterProactiveAt = Date.now();
    this._lastGroupCreatedAt = Date.now();
    this._lastIntendedRole = 'MASTER';
    try { await NearbyMeshService.pauseMesh(); } catch (_) {}
    try { await WifiDirectService.createGroup(); } catch (e) {
      this._log(`⚠️ [Cycle] createGroup proactif échoué: ${e.message}`);
    }
  }
}
```

### Changements clés
1. Ajout d'une vérification `myScore <= peerScore` AVANT le `createGroup()`
2. Si le peer a un score >= au mien → on attend (SLAVE) au lieu de créer un groupe
3. Le `createGroup()` n'est appelé que si `myScore > peerScore` OU `peerScore === 0`

### Impact attendu
- **Itel (73)** : `peerScore=18`, `myScore=73` → `73 > 18` → crée le groupe ✅
- **Xiaomi (18)** : `peerScore=73`, `myScore=18` → `18 <= 73` → attend (SLAVE) ✅
- Résultat: 1 seul GO (l'Itel), le Xiaomi se connecte en SLAVE → transfert possible

---

## Vérifications à faire après implémentation

1. **Test 1 : Démarrage simultané**
   - HARD RELOAD sur les 2 phones en même temps
   - Vérifier dans les logs :
     - L'Itel (73) affiche `MASTER proactif` et `createGroup réussi`
     - Le Xiaomi (18) affiche `Mon score (18) <= peer (73) → j'attends`
     - Un seul `GO=true` dans les logs (pas 2)

2. **Test 2 : Transfert de pack**
   - Vérifier que le Xiaomi (SLAVE) envoie le pack
   - Vérifier que l'Itel (GO) le reçoit (`📨 Fichier reçu`)
   - Vérifier que le SWAP s'envoie

3. **Test 3 : Bidirectionnalité**
   - Après le premier transfert, vérifier que le SWAP_ROLE_REQUEST est reçu
   - Vérifier que le 2e transfert (dans l'autre sens) fonctionne

4. **Test 4 : Démarrage décalé**
   - Démarrer l'Itel en premier, attendre 20s, puis démarrer le Xiaomi
   - Vérifier que l'Itel crée le groupe et que le Xiaomi se connecte en SLAVE

---

## Risques et mitigations

### Risque 1 : Le mesh peer n'est pas encore détecté quand le createGroup proactif se déclenche
- **Mitigation** : Quand `peerScore=0`, on garde le comportement actuel (créer le groupe). Le mesh peer sera détecté plus tard et le transfert se fera via le cycle suivant.

### Risque 2 : Les 2 devices ont le même score
- **Mitigation** : Ajouter un tiebreaker basé sur le nom WiFi Direct (ordre alphabétique). Celui dont le nom est "plus grand" crée le groupe.

### Risque 3 : Le device avec le score élevé ne démarre pas
- **Mitigation** : Le device avec le score bas crée le groupe après 30s (comportement actuel). Quand le device avec le score élevé démarre, il verra le groupe existant et se connectera en SLAVE.

### Risque 4 : Le WiFi Direct est instable sur l'Itel
- **Mitigation** : Le V2.9 (watchdog non-fatal) gère déjà ce cas. La Solution 1 ne change rien au comportement post-connexion.

---

## Fichiers concernés

- `app/src/features/bluetooth/services/P2PAutoSync.js` — bloc `_p2pSyncCycle()` ligne ~597-628
- `app/src/features/bluetooth/services/WifiDirectService.js` — pas de modification nécessaire pour la Solution 1
- `app/src/features/bluetooth/services/NearbyMeshService.js` — pas de modification nécessaire

---

## Ordre de implémentation recommandé

1. Modifier le bloc dans `P2PAutoSync.js` (Solution 1)
2. Faire `node --check` pour vérifier la syntaxe
3. Tester sur les 2 phones (HARD RELOAD)
4. Si ça ne marche pas → implémenter la Solution 2 (vérification `requestGroupInfo`)
5. Si toujours pas → implémenter la Solution 3 (supprimer MASTER proactif)
