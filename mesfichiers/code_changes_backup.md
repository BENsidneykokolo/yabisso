# Code Changes Backup - 2026-05-04

## Fichiers Modifiés

### 1. P2PAutoSync.js
### 2. NearbyMeshService.js

---

## P2PAutoSync.js - Changements

### À ajouter dans la méthode _p2pSyncCycle (autour ligne 215-230)

```javascript
// === AUTO-RETRY WIFI DIRECT ===
const availablePeers = WifiDirectService.availablePeers || [];
if (availablePeers.length > 0 && !WifiDirectService.connectedPeer && !WifiDirectService.isConnecting) {
  this._log(`📡 ${availablePeers.length} peers WiFi Direct disponibles, connexion automatique...`);
  try {
    await WifiDirectService.connectToPeer(availablePeers[0]);
  } catch (e) {
    this._log(`⚠️ Échec connexion auto: ${e.message}`);
    // Retry automatique après 3s
    setTimeout(async () => {
      if (!WifiDirectService.connectedPeer && WifiDirectService.availablePeers?.length > 0) {
        this._log(`📡 Retry connexion automatique...`);
        try {
          await WifiDirectService.connectToPeer(WifiDirectService.availablePeers[0]);
        } catch (e2) {
          this._log(`⚠️ Échec retry: ${e2.message}`);
        }
      }
    }, 3000);
  }
} else if (availablePeers.length === 0) {
  // Pas de peers - relancer discovery plus agressivement
  this._log(`🔄 Relancement discovery WiFi Direct...`);
  await WifiDirectService.startDiscovery(true);
}
```

### À ajouter dans la méthode _p2pSyncCycle (dans le bloc else après connexion)

```javascript
// === TRANSFERT DE FICHIERS INDIVIDUELS (pas de pack) ===
if (!category && !this._sessionSent) {
  this._log(`📤 Transfert de fichiers individuels via WiFi Direct...`);
  try {
    const posts = await this._getUnsyncedPosts();
    if (posts.length > 0) {
      this._log(`📦 ${posts.length} fichiers à synchroniser...`);
      for (const post of posts.slice(0, 10)) { // Max 10 fichiers
        if (post.localMediaPath) {
          const sent = await WifiDirectService.sendFile(post.localMediaPath, {
            hash: post.hash,
            type: post.videoUrl ? 'VIDEO' : 'IMAGE',
            username: post.username,
            content: post.content
          });
          if (sent) {
            this._log(`✅ Fichier envoyé: ${post.hash}`);
          }
        }
      }
      this._sessionSent = true;
      this._log(`✅ Transfert individuel terminé !`);
      WifiDirectService._emit('onSyncStatus', { status: 'SUCCESS' });
    } else {
      this._log(`📭 Aucun nouveau contenu à synchroniser`);
    }
  } catch (e) {
    this._log(`⚠️ Erreur transfert: ${e.message}`);
  }
}
```

### NOUVELLE MÉTHODE À AJOUTER (à la fin de la classe)

```javascript
async _getUnsyncedPosts() {
  try {
    const posts = await database.get('loba_posts')
      .query(
        Q.where('localMediaPath', Q.notEq(null)),
        Q.sortBy('created_at', Q.desc),
        Q.take(20)
      )
      .fetch();
    return posts.filter(p => p.localMediaPath);
  } catch (e) {
    this._log(`⚠️ Erreur getUnsyncedPosts: ${e.message}`);
    return [];
  }
}
```

---

## NearbyMeshService.js - Changements

### DANS LE CONSTRUCTEUR

```javascript
this._failedPeers = new Set();
this._discoveredNodes = new Map(); // Track active nodes
this._currentRole = null; // 'master' | 'slave' | null
this._pendingMasterTimeouts = []; // Pour annuler les tentatives Master
```

### SINGLETON PATTERN

```javascript
static _instance = null;

static getInstance() {
  if (!NearbyMeshServiceClass._instance) {
    NearbyMeshServiceClass._instance = new NearbyMeshServiceClass();
  }
  return NearbyMeshServiceClass._instance;
}

isActive() {
  return this._isRunning || this._isStarting;
}

hasFailedRecently(peerId) {
  return this._failedPeers.has(peerId);
}

addFailedPeer(peerId) {
  this._failedPeers.add(peerId);
  this._log(`🚫 Peer ${peerId} ajouté à la blacklist pour 2 min`);
  setTimeout(() => {
    this._failedPeers.delete(peerId);
    this._log(`✅ Peer ${peerId} retiré de la blacklist`);
  }, 120000);
}
```

### DANS startMesh() - Guards

```javascript
async startMesh() {
  // Guard against double instance
  if (this._isStarting) {
    this._log('⏳ Démarrage en cours, skip...');
    return;
  }
  if (this._isRunning) {
    this._log('Mesh déjà actif (skip start).');
    return;
  }

  this._isStarting = true;
  // ... fin de la méthode
  this._isRunning = true;
  this._isStarting = false;
  // dans le catch:
  this._isRunning = false;
  this._isStarting = false;
}
```

### DANS _setupListeners() - Nouveau handlers

```javascript
// ==== PEER FOUND ====
this._listeners.push(onPeerFound((peer) => {
  this._log(`🔍 Node trouvé: ${peer.name} (${peer.peerId})`);
  this._discoveredNodes.set(peer.peerId, { name: peer.name, foundAt: Date.now() });
  
  // Skip if peer is blacklisted
  if (this.hasFailedRecently(peer.peerId)) {
    this._log(`🚫 Peer ${peer.peerId} en blacklist, ignoré.`);
    return;
  }
  
  // Skip if already connected
  if (this.connectedPeers.has(peer.peerId)) {
    this._log(`⏭️ Peer ${peer.peerId} déjà connecté, ignoré.`);
    return;
  }
  
  // Skip si pas de nom pour comparaison
  if (!this.deviceName || !peer.name) {
    this._log(`⚠️ Nom manquant pour comparaison`);
    return;
  }
  
  // Comparaison alphabétique pour décider Master/Slave
  const shouldBeMaster = this.deviceName.toLowerCase() < peer.name.toLowerCase();
  
  if (!shouldBeMaster) {
    this._log(`⏭️ [Slave] J'attends l'invitation de ${peer.name}...`);
    this._currentRole = 'slave';
    return;
  }
  
  // MUTEX: Si déjà en mode Master avec un autre peer, skip
  if (this._currentRole === 'master') {
    this._log(`⏭️ already in Master mode, skip`);
    return;
  }
  
  // Deviens Master et initie la connexion
  this._log(`🔗 Deviens Master pour ${peer.name}...`);
  this._currentRole = 'master';
  this._attemptConnection(peer.peerId, 0);
}));

// ==== INVITATION RECEIVED (on deviens Slave) ====
this._listeners.push(onInvitationReceived((peer) => {
  this._log(`🤝 Invitation reçue de: ${peer.name} (${peer.peerId})`);
  this._cancelPendingMasterConnections();
  this._log(`🔗 Deviens Slave, j'accepte l'invitation de ${peer.name}...`);
  this._currentRole = 'slave';
  this._acceptInvitationWithRetry(peer.peerId, 0);
}));
```

### MUTEX HELPERS

```javascript
this._getDeviceId = () => {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

this._cancelPendingMasterConnections = () => {
  this._pendingMasterTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  this._pendingMasterTimeouts = [];
  this._currentRole = null;
  this._log(`🔗 Annulé tous les timeouts Master`);
};
```

### DANS _attemptConnection() - Vérification AVANT chaque tentative

```javascript
this._attemptConnection = (peerId, attempt) => {
  // Vérifier AVANT chaque tentative (pas seulement la première)
  if (!this._discoveredNodes.has(peerId)) {
    this._log(`⏭️ Skip tentative ${attempt + 1} — ${peerId} déjà perdu`);
    this._currentRole = null;
    return;
  }
  
  if (attempt >= 3) {
    this._log(`❌ Échec après 3 tentatives pour ${peerId}`);
    this._pendingConnections.delete(peerId);
    this._discoveredNodes.delete(peerId);
    this.addFailedPeer(peerId);
    this._currentRole = null;
    return;
  }
  // ... reste du code
};
```

### DANS onPeerLost - Cleanup

```javascript
this._listeners.push(onPeerLost(({ peerId }) => {
  this._log(`👻 Node perdu: ${peerId}`);
  this.connectedPeers.delete(peerId);
  this._discoveredNodes.delete(peerId);
  this._updateState();
}));
```

### EXPORT FINAL

```javascript
export const NearbyMeshService = NearbyMeshServiceClass.getInstance();
```

---

## Notes Importantes

1. **Écran Partage Pack (LobaPacksScreen.js)** - NE PAS MODIFIER
   - Ce code fonctionne et doit rester intacte

2. **WiFi Direct Service** - NE PAS MODIFIER le code existant
   - On ajoute juste des appels automatiques dans P2PAutoSync

3. **Ordre d'exécution recommandé** :
   1. Git pull pour revenir à une version stable
   2. Ajouter les changements un par un
   3. Tester après chaque ajout