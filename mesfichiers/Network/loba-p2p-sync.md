# LOBA — Implémentation WiFi Direct + BT Mesh (Sync de contenu P2P)

## Architecture globale

```
LOBA Content Layer (feed, posts, vidéos, hashs)
        ↓
   SyncManager
        ↓
  TransportSelector
     ↙         ↘
BT Mesh      WiFi Direct
(≤5 MB)      (> 5 MB)
     ↘         ↙
   TransferQueue
   (95% intérêts / 5% exploration · trié par taille)
     ↙         ↘
WatermelonDB   SyncEngine → Supabase (quand online)
```

---

## Structure des fichiers

```
src/
  services/
    mesh/
      TransportSelector.ts      ← décide BT ou WiFi selon taille fichier
      BTMeshTransport.ts        ← react-native-ble-plx
      WiFiDirectTransport.ts    ← expo-nearby-connections
      SyncManager.ts            ← orchestrateur principal
      TransferQueue.ts          ← file priorisée
      ManifestExchange.ts       ← échange de hashes entre peers
    loba/
      ContentSyncService.ts     ← colle tout au feed LOBA
```

---

## 1. ManifestExchange — la fondation

Avant tout transfert, deux peers échangent leurs manifestes (liste de hash + taille + timestamp).
C'est la pièce maîtresse qui évite les doublons.

```typescript
// ManifestExchange.ts
export interface ContentManifest {
  peerId: string;
  items: Array<{
    hash: string;      // SHA-256 du fichier
    size: number;      // bytes
    type: 'video' | 'image' | 'post';
    timestamp: number;
  }>;
}

export async function buildLocalManifest(): Promise<ContentManifest> {
  const items = await database
    .get<Content>('loba_content')
    .query(Q.where('synced', true))
    .fetch();

  return {
    peerId: await getDeviceId(),
    items: items.map(i => ({
      hash: i.contentHash,
      size: i.fileSize,
      type: i.contentType,
      timestamp: i.createdAt,
    })),
  };
}

export function diffManifests(
  local: ContentManifest,
  remote: ContentManifest
): ContentManifest['items'] {
  const localHashes = new Set(local.items.map(i => i.hash));
  // retourne uniquement ce que le peer remote a et qu'on n'a pas
  return remote.items.filter(item => !localHashes.has(item.hash));
}
```

---

## 2. TransportSelector — règle de routage

```typescript
// TransportSelector.ts
const BT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export type Transport = 'bluetooth' | 'wifi_direct';

export function selectTransport(fileSizeBytes: number): Transport {
  return fileSizeBytes <= BT_MAX_BYTES ? 'bluetooth' : 'wifi_direct';
}
```

Simple et déterministe. Le `SyncManager` appelle cette fonction pour chaque item de la queue.

---

## 3. TransferQueue — priorité 95/5

```typescript
// TransferQueue.ts
interface QueueItem {
  hash: string;
  size: number;
  type: string;
  isExploration: boolean; // true = les 5%
  transport: Transport;
}

export class TransferQueue {
  private queue: QueueItem[] = [];

  enqueue(items: ContentManifest['items'], userInterests: Set<string>) {
    const tagged = items.map(item => ({
      ...item,
      isExploration: !userInterests.has(item.type),
      transport: selectTransport(item.size),
    }));

    // tri : intérêts d'abord, puis par taille croissante (petits fichiers en premier)
    this.queue = tagged.sort((a, b) => {
      if (a.isExploration !== b.isExploration)
        return a.isExploration ? 1 : -1;
      return a.size - b.size;
    });

    // plafond 5% exploration
    const total = this.queue.length;
    let exploCount = 0;
    this.queue = this.queue.filter(item => {
      if (!item.isExploration) return true;
      exploCount++;
      return exploCount / total <= 0.05;
    });
  }

  dequeue(): QueueItem | null {
    return this.queue.shift() ?? null;
  }

  get length() { return this.queue.length; }
}
```

---

## 4. SyncManager — l'orchestrateur

```typescript
// SyncManager.ts
export class SyncManager {
  private queue = new TransferQueue();
  private activeSessions = new Map<string, AbortController>();

  async onPeerDiscovered(peerId: string) {
    if (this.activeSessions.has(peerId)) return;

    const controller = new AbortController();
    this.activeSessions.set(peerId, controller);

    try {
      // 1. échange de manifestes
      const localManifest = await buildLocalManifest();
      const remoteManifest = await this.exchangeManifest(peerId, localManifest);

      // 2. calcul du diff
      const missing = diffManifests(localManifest, remoteManifest);
      if (missing.length === 0) return;

      // 3. chargement des intérêts utilisateur
      const interests = await getUserInterests();

      // 4. alimentation de la queue
      this.queue.enqueue(missing, interests);

      // 5. transferts séquentiels
      await this.drainQueue(peerId, controller.signal);
    } finally {
      this.activeSessions.delete(peerId);
    }
  }

  private async drainQueue(peerId: string, signal: AbortSignal) {
    while (this.queue.length > 0 && !signal.aborted) {
      const item = this.queue.dequeue()!;

      if (item.transport === 'bluetooth') {
        await BTMeshTransport.receive(peerId, item.hash, signal);
      } else {
        await WiFiDirectTransport.receive(peerId, item.hash, signal);
      }

      // enregistrement local après réception
      await saveContent(item);
    }
  }

  onPeerLost(peerId: string) {
    this.activeSessions.get(peerId)?.abort();
    this.activeSessions.delete(peerId);
  }
}
```

---

## 5. BTMeshTransport — points d'attention Android 5–11

```typescript
// BTMeshTransport.ts
import { BleManager } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

const manager = new BleManager();

// Permissions dynamiques selon version Android (contrainte clé Android 5–11)
export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const sdk = parseInt(Platform.Version as string, 10);

  if (sdk >= 31) {
    // Android 12+
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    ]);
    return Object.values(results).every(r => r === 'granted');
  } else {
    // Android 5–11 (SDK 21–30)
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === 'granted';
  }
}

export async function receive(
  peerId: string,
  contentHash: string,
  signal: AbortSignal
): Promise<Buffer> {
  // chunks de 512 bytes max (limite MTU BLE standard)
  // réassembly avec vérification hash final
  return receiveChunked(peerId, contentHash, 512, signal);
}
```

---

## 6. WiFiDirectTransport

```typescript
// WiFiDirectTransport.ts
import Nearby from 'expo-nearby-connections';

export async function receive(
  peerId: string,
  contentHash: string,
  signal: AbortSignal
): Promise<void> {
  // expo-nearby-connections gère le handshake WiFi Direct
  // chunks de 64 KB pour les gros fichiers
  await Nearby.requestPayload(peerId, {
    hash: contentHash,
    chunkSize: 64 * 1024,
  });

  // écoute annulation
  signal.addEventListener('abort', () => Nearby.cancelPayload(peerId));
}
```

---

## 7. Intégration WatermelonDB + synced column

```typescript
// saveContent.ts
export async function saveContent(item: QueueItem) {
  await database.write(async () => {
    await database.get<Content>('loba_content').create(record => {
      record.contentHash = item.hash;
      record.fileSize = item.size;
      record.contentType = item.type;
      record.source = 'p2p';
      record.synced = 0; // SyncEngine l'uploadera quand online
    });
  });
}
```

La colonne `synced` (integer) est le signal pour le `SyncEngine` existant :
- `0` = local seulement (reçu via P2P, pas encore uploadé)
- `1` = uploadé vers Supabase

---

## Points critiques à ne pas rater

### Relay BT Mesh (multi-hop)
Quand Peer A et Peer C ne sont pas en portée directe, Peer B doit relayer.
Implémenter un champ `ttl` (time-to-live, ex : 3 hops max) dans les paquets BT pour éviter les boucles infinies.

```typescript
interface MeshPacket {
  hash: string;
  payload: Buffer;
  ttl: number;       // décrémenté à chaque relay, drop si ttl === 0
  originPeerId: string;
  visitedPeers: string[];  // évite les re-envois au même peer
}
```

### Collision de sessions
La `Map<string, AbortController>` dans le `SyncManager` protège contre les sessions dupliquées par peer.
Ajouter en plus un verrou par `contentHash` côté réception pour éviter le double-download simultané depuis deux peers différents.

### Low RAM (Android 5–8, 512 MB–1 GB)
- Ne charger qu'**un seul fichier en mémoire à la fois** dans `drainQueue`
- Pas de streams BT et WiFi concurrents sur les appareils < 1 GB RAM
- Vérifier `ActivityManager.getMemoryInfo()` au démarrage pour ajuster la stratégie

### Ordre de démarrage des transports
1. BT scan en premier (moins de batterie)
2. WiFi Direct seulement si fichier > 5 MB ou si BT indisponible

### Vérification d'intégrité
Toujours vérifier le hash SHA-256 après réception complète avant d'appeler `saveContent()`.
Un fichier corrompu en milieu de transfer doit être rejeté et re-queued, pas sauvegardé.

```typescript
import { createHash } from 'crypto';

function verifyHash(data: Buffer, expectedHash: string): boolean {
  const actual = createHash('sha256').update(data).digest('hex');
  return actual === expectedHash;
}
```

---

## Prochaines étapes suggérées

1. **BTMeshTransport** — protocole de chunking + relay TTL complet
2. **ManifestExchange** — handshake protocol (qui initie, format des messages BLE)
3. **ContentSyncService** — intégration au feed LOBA (déclencheur discovery → queue → save → refresh UI)
