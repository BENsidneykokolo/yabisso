# Documentation WiFi Direct & Nearby Connections — Yabisso

## Overview

Ce fichier documente l'implémentation complète du système de communication P2P (Peer-to-Peer) utilisé dans Yabisso pour le partage offline de packs Loba et la synchronisation locale.

### Composants principaux

1. **WifiDirectService** — Communication WiFi Direct (transfert de fichiers gros volume)
2. **P2PAutoSync** — Orchestrateur central Multi-Rail
3. **NearbyMeshService** — Communication Bluetooth Mesh via Google Nearby Connections

---

## 1. WifiDirectService

**Emplacement** : `app/src/features/bluetooth/services/WifiDirectService.js`

### Description

Service de communication WiFi Direct utilisant la librairie `react-native-wifi-p2p`. Gère la découverte de peers, la connexion, et le transfert de fichiers.

### Architecture

```javascript
class WifiDirectServiceClass {
  // État interne
  - initialized: boolean
  - isInitializing: boolean
  - peers: array
  - connectedPeer: object
  - isGroupOwner: boolean
  - groupOwnerAddress: string
  - isSupported: boolean
  - isDiscovering: boolean
  - isConnecting: boolean
  - isConnected: boolean
  - isLocationEnabled: boolean
  - deviceName: string
  
  // Listeners disponibles
  - onPeerFound
  - onConnectionChange
  - onTransferProgress
  - onLogUpdate
  - onSyncStatus
}
```

### Méthodes principales

#### `initialize()`
Initialise le module WiFi Direct et souscrit aux événements natifs.

#### `startDiscovery(force = false)`
Démarre la découverte de peers WiFi Direct.
- Nettoyage préalable (stopDiscoveringPeers)
- Délai de 200ms entre les opérations
- Retourne `true` en cas de succès

#### `connectToPeer(device, retryCount = 0, forceRole = null)`
Connecte à un peer en fonction du score de puissance hardware.
- **Score hardware** : `(RAM en GB) * 10` — Plus le device a de RAM, plus il a de chance de devenir Group Owner (Master)
- **Logique Master/Slave** :
  - Master = crée le groupe (createGroup)
  - Slave = se connecte au Master (connect)

#### `sendFile(filePath, metadata)`
Envoie un fichier via WiFi Direct.
- Envoie d'abord un message JSON avec les métadonnées
- Puis le fichier binaire
- Émet des événements de progression

#### `startReceiving(callback)`
Démarre le serveur de réception sur le Group Owner.
- Crée le dossier `loba_media/` si inexistant
- Boucle de réception des messages + fichiers
- Appelle le callback avec le chemin et les métadonnées

#### `disconnect()`
Déconnecte et supprime le groupe WiFi Direct.

#### `getState()`
Retourne l'état actuel du service :
```javascript
{
  initialized,
  isConnected,
  isConnecting,
  isGroupOwner,
  isDiscovering,
  isLocationEnabled,
  peers,
  connectedPeer
}
```

### Score Hardware (V1.0.15+)

```javascript
_buildDeviceName() {
  const totalMemoryGB = (Device.totalMemory || 0) / (1024 * 1024 * 1024);
  const score = Math.round(totalMemoryGB * 10); // ex: 128MB RAM = 1.2GB = score 12
  const randomId = Math.random().toString(36).substring(4);
  return `${score}_Device_${randomId}`;
}
```

- **Itel A50** (~128MB RAM) : score ~1 → devient Slave
- **Xiaomi (4GB RAM)** : score ~40 → devient Master

---

## 2. P2PAutoSync

**Emplacement** : `app/src/features/bluetooth/services/P2PAutoSync.js`

### Description

Orchestrateur central qui gère la synchronisation Multi-Rail :
1. **WiFi Direct** — Transferts gros volume (packs Loba)
2. **BLE Mesh** — Transferts légers (deltas, manifestes)
3. **Cloud** — Sync vers Supabase (quand online)

### Architecture

```javascript
class P2PAutoSyncClass {
  // Intervalles
  - _p2pInterval: 3000ms (cycle P2P)
  - _cloudInterval: 60000ms (sync cloud)
  
  // Flags d'état
  - _running: boolean
  - _syncingP2P: boolean
  - _syncingCloud: boolean
  - _manualTrigger: boolean
  
  // Stats
  - totalSyncedP2P: number
  - totalSyncedCloud: number
  - activeRails: array
  - logs: array
}
```

### Méthodes principales

#### `start()`
Démarre l'orchestrateur :
1. Lance NetworkRailDetector
2. Initialise WifiDirectService
3. Initialise NearbyMeshService
4. Souscrit aux événements WiFi Direct
5. Lance le cycle P2P toutes les 3 secondes

#### `requestWifiDirectActivation()`
Demande l'activation du WiFi Direct (appelé depuis LobaHomeScreen au mount).

#### `forceRefresh()`
Hard Reset complet : stop → wait 1.5s → start → startDiscovery

#### `triggerSync(category, force)`
Déclenche une synchronisation forcée :
- Ignore le cooldown si `force = true`
- Lance le cycle P2P immédiatement

#### `sendTestPing()`
Envoie un ping de test via le meilleur rail disponible.

#### `stop()`
Arrête tous les services (WiFi Direct, BLE Mesh, NetworkRailDetector).

#### `publishLocal(params)`
Publie un post local :
- Sauvegarde le média
- Crée l'entrée en base WatermelonDB
- Ajoute à la sync_queue pour propagation

### Cycle P2P (toutes les 3 secondes)

1. Met à jour le compteur de posts en attente
2. Vérifie l'état WiFi Direct
3. Si pas connecté : lance discovery + connect au meilleur peer
4. Si connecté en tant que Slave : construit et envoie le pack Loba
5. Si connecté en tant que Master : reste en mode réception
6. Applique la politique LRU sur le stockage local

### Événements

#### `onLogUpdate(callback)`
Retourne un fonction pour se désabonner des logs P2P.

---

## 3. NearbyMeshService

**Emplacement** : `app/src/features/bluetooth/services/NearbyMeshService.js`

### Description

Service de communication Bluetooth Mesh utilisant Google Nearby Connections (expo-nearby-connections). Permet la découverte et l'échange de données légères entre appareils à proximité.

### Architecture

```javascript
class NearbyMeshServiceClass {
  - connectedPeers: Set
  - isAdvertising: boolean
  - isDiscovering: boolean
  - deviceName: string
  - _failedPeers: Set (anti-spam)
}
```

### Events émis

- **MeshLogEvents** — Logs de debug
- **MeshConnectionEvents** — Changements de connexion ({ isConnected, peerCount, peers })
- **MeshRequestEvents** — Requêtes de validation reçuess
- **MeshContentUpdateEvents** — Nouveau contenu détecté ({ count, source })

### Méthodes principales

#### `startMesh()`
Démarre le mesh :
1. Vérifie les permissions
2. Initialise DailyQuotaService
3. Configure les listeners natifs
4. Lance Advertising (serveur) + Discovery (client)
5. Utilise le même deviceName que WifiDirectService (cohérence hardware score)

#### `stopMesh()`
Arrête le mesh proprement.

#### `sendValidationRequest(payload)`
Envoie une requête de validation à tous les peers connectés.

### Logique de connexion Master/Slave

Basée sur le score hardware (extrait du deviceName) :
- Si `myScore > peerScore` → je suis Master, j'envoie une requestConnection
- Sinon → je suis Slave, j'attends l'invitation

### Delta Detection

Quand un manifeste global est reçu :
1. Compare avec le manifeste local
2. Calcule les deltas (nouveaux posts Loba, nouveaux produits)
3. Déclenche P2PAutoSync.triggerSync(null, true) pour lancer le transfert WiFi Direct

---

## 4. Intégration dans LobaHomeScreen

**Fichier** : `app/src/features/loba/screens/LobaHomeScreen.js`

### Imports

```javascript
import { P2PAutoSync } from '../../bluetooth/services/P2PAutoSync';
import { WifiDirectService } from '../../bluetooth/services/WifiDirectService';
import { MeshContentUpdateEvents } from '../../bluetooth/services/NearbyMeshService';
import { useMeshConnection } from '../../bluetooth/hooks/useMeshConnection';
import { useWifiDirect } from '../hooks/useWifiDirect';
```

### Hooks utilisés

```javascript
const meshState = useMeshConnection();  // { isConnected, peerCount, peers }
const wifiState = useWifiDirect();        // { connectedPeer, isDiscovering, isLocationEnabled }
```

### Démarrage (useEffect)

```javascript
useEffect(() => {
  // 1. Démarrer l'orchestrateur P2P
  P2PAutoSync.start();
  
  // 2. Activer WiFi Direct immédiatement
  P2PAutoSync.requestWifiDirectActivation();
  
  // 3. Souscrire aux logs P2P
  const unsubLogs = P2PAutoSync.onLogUpdate((logs) => {
    setP2pLogs([...logs]);
  });
  
  // 4. Souscrire aux mises à jour de contenu (Nearby Mesh)
  const unsubContent = MeshContentUpdateEvents.subscribe(({ count, source }) => {
    console.log(`Nouveau contenu reçu de ${source}: ${count} posts`);
    // Recharger le feed depuis la DB
    setTimeout(async () => {
      const freshPosts = await database.get('loba_posts')
        .query(Q.sortBy('created_at', Q.desc), Q.take(50))
        .fetch();
      setFeedVideos(freshPosts.map(...));
    }, 500);
  });
  
  // 5. Souscrire aux événements de sync WiFi Direct
  const unsubSync = WifiDirectService.on('onSyncStatus', ({ status }) => {
    if (status === 'SUCCESS') {
      // Pack traité → recharger le feed
      setTimeout(async () => {
        const freshPosts = await database.get('loba_posts')...;
        setFeedVideos(freshPosts.map(...));
      }, 1500);
    }
  });
  
  return () => {
    P2PAutoSync.stop();
    unsubLogs();
    unsubSync();
    unsubContent();
  };
}, []);
```

### UI de statut

```javascript
// Alert GPS (Android)
{!wifiState.isLocationEnabled && Platform.OS === 'android' && (
  <View style={styles.gpsWarning}>
    <MaterialCommunityIcons name="map-marker-off" size={16} color="#fff" />
    <Text style={styles.gpsWarningText}>Localisation désactivée.</Text>
  </View>
)}

// Chip de statut
<Pressable style={styles.statusChip} onLongPress={() => setP2pLogModal(true)}>
  {wifiState.connectedPeer ? (
    <MaterialCommunityIcons name="wifi-star" size={14} color="#22c55e" />
  ) : wifiState.isDiscovering ? (
    <ActivityIndicator size={10} color="#fbbf24" />
  ) : meshState.isConnected ? (
    <MaterialCommunityIcons name="bluetooth-connect" size={14} color="#22c55e" />
  ) : (
    <MaterialCommunityIcons name="wifi-off" size={14} color="#fbbf24" />
  )}
  <Text style={styles.statusText}>
    {wifiState.connectedPeer 
      ? 'WiFi P2P Connecté' 
      : wifiState.isDiscovering 
        ? 'Recherche...' 
        : meshState.isConnected 
          ? `Mesh Actif (${meshState.peerCount})` 
          : 'Mode Offline'}
  </Text>
</Pressable>
```

### Modal de logs P2P

Accessible par un long-press sur la chip de statut :
- Affiche les 50 derniers logs
- Bouton "Test Ping" pour tester la connexion
- Bouton "RESET HP" pour hard reset

---

## 5. Hooks personnalisés

### useWifiDirect

**Emplacement** : `app/src/features/loba/hooks/useWifiDirect.js`

Retourne l'état du WifiDirectService :
```javascript
{
  connectedPeer,
  isDiscovering,
  isConnected,
  isGroupOwner,
  isLocationEnabled,
  peers
}
```

### useMeshConnection

**Emplacement** : `app/src/features/bluetooth/hooks/useMeshConnection.js`

Retourne l'état du NearbyMeshService :
```javascript
{
  isConnected,
  peerCount,
  peers
}
```

---

## 6. Dépannage

### Problème : "Unable to load script" sur le téléphone

**Cause** : Le téléphone n'arrive pas à se connecter au serveur Metro.

**Solution** :
1. Vérifier que le téléphone est sur le même WiFi que l'ordinateur
2. Vérifier l'IP dans `app/.env` :
   ```
   EXPO_PACKAGER_HOSTNAME=192.168.1.67
   REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.67
   ```
3. Lancer Metro avec : `npx expo start --dev-client --host 192.168.1.67 --port 8081`

### Problème : WiFi Direct ne découvre pas de peers

**Causes possibles** :
1. GPS désactivé (obligatoire sur Android)
2. Permissions manquantes
3. Appareil non compatible WiFi Direct

**Vérifications** :
- Look for GPS warning in UI
- Check `wifiState.isLocationEnabled`

### Problème : Progression bloquée à 95%

**Cause** : Le callback de fin de transfert échoue silencieusement.

**Solution** : Le code inclut un fallback robuste avec try/catch pour forcer la completion à 100%.

### Problème : OutOfMemoryError sur itel A50

**Cause** : Le native MessageServer lit tout le fichier en RAM.

**Solutions appliquées** :
- Timeout adaptatif : 120s pour fichiers > 10MB, 30s pour petits fichiers
- Utilisation de `receiveFile()` au lieu de `receiveMessage()` pour les gros fichiers
- Réduction de la taille des packs (25MB max recommandé)

---

## 7. Versions et Historique

| Version | Date | Changements |
|---------|------|-------------|
| V1.0.15 | 2026-04 | Score hardware basé sur vraie RAM |
| V1.0.16 | 2026-04 | Fix parseInt sur les scores |
| V1.0.17 | 2026-04 | Master crée le groupe |
| V1.0.18 | 2026-04 | Fix deviceName |
| V2.6 | 2026-04 | Stabilisation complète |
| V3.11 | 2026-06 | Bidirectionnel initié par le Slave (sendFileTo) |
| V3.13 | 2026-06 | WiFi Group Ready via Mesh |
| V3.19 | 2026-06 | Séquence SLAVE_CONNECTED_CONFIRMED → 5s → HELLO |
| V3.20 | 2026-06 | BUG-047 fix: self-loop (sendFileTo avec IP Slave via Mesh) |
| V3.24 | 2026-06 | BUG-056-059: Filtre taille, staging isolé, cleanup |
| **V3.25** | **2026-06** | **BUG-061: HELLO immédiat Slave + IP via HELLO metadata (fix self-loop sans native method)** |

---

## 8. Code Complet (Extraits)

### WifiDirectService.js (282 lignes)
Voir fichier source pour le code complet.

### P2PAutoSync.js (467 lignes)
Voir fichier source pour le code complet.

### NearbyMeshService.js (296 lignes)
Voir fichier source pour le code complet.

---

## 9. Permissions Android Requises

```xml
<!-- WiFi Direct -->
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />

<!-- Bluetooth -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
```

---

## 10. Flow de Synchronisation Complete

```
1. LobaHomeScreen mount
   ↓
2. P2PAutoSync.start()
   ↓
3. NetworkRailDetector.start() (détecte rails dispo)
   ↓
4. WifiDirectService.initialize() + startDiscovery()
   ↓
5. NearbyMeshService.startMesh() (advertise + discover)
   ↓
6. Boucle P2P (toutes les 3s)
   ├─ Si WiFi Direct dispo et peer trouvé
   │   ├─ Si Master → créer groupe
   │   └─ Si Slave → se connecter au Master
   │       └─ Si connecté → envoyer Pack Loba
   │
   └─ Si Nearby Mesh détecte un node
       ├─ Échanger manifestes
       ├─ Calculer deltas
       └─ Déclencher WiFi Direct pour transfert
           └─ Si succès → traiter le pack
               └─ Rafraîchir le feed Loba
```

---

*Document généré le 2026-05-14*