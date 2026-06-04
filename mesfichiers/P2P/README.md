# P2P — Backup Complet v2.8 (2026-06-04)

> **Snapshot de TOUS les fichiers P2P de Yabisso à la version v0.0.8 (commit 06059e3)**
>
> Objectif : pouvoir revenir à cette version de référence si les futurs changements P2P cassent la connexion.

---

## Structure

```
P2P/
├── bluetooth/
│   ├── services/   (11 fichiers — couche métier P2P)
│   ├── hooks/      (3 fichiers — React hooks P2P)
│   └── screens/    (2 fichiers — UI BLE)
└── loba/
    ├── services/   (4 fichiers — pack/manifest/storage/queue)
    ├── hooks/      (1 fichier — useWifiDirect Loba)
    └── screens/    (2 fichiers — Home + Packs)
```

**Total** : 23 fichiers JavaScript

---

## Index des fichiers

### 🔵 Bluetooth — Services (`bluetooth/services/`)

| Fichier | Rôle | Lignes |
|---------|------|--------|
| `P2PAutoSync.js` | Orchestrateur central Multi-Rail (V2.7) | ~700 |
| `WifiDirectService.js` | WiFi Direct (détection, connexion, transfert fichiers) | 484 |
| `NearbyMeshService.js` | Google Nearby Connections (détection, handshake) | ~350 |
| `NetworkRailDetector.js` | Détection du meilleur rail réseau | ~200 |
| `P2PDailyLimitManager.js` | Gestion quota 200MB/jour | ~150 |
| `GlobalManifestService.js` | Manifest global des fichiers locaux | ~200 |
| `DailyQuotaService.js` | Quota journalier | ~150 |
| `MeshSyncService.js` | Sync via BLE Mesh | ~300 |
| `BleAdvertiserService.js` | Advertisement BLE | ~150 |
| `BleSignupService.js` | Signup via BLE | ~200 |
| `NetworkPermissionsService.js` | Permissions Android (Location, WiFi, BT) | ~100 |

### 🔵 Bluetooth — Hooks (`bluetooth/hooks/`)

| Fichier | Rôle |
|---------|------|
| `useMeshConnection.js` | Hook React pour état Mesh |
| `useBleP2P.js` | Hook React pour état BLE P2P |
| `useWifiDirect.js` | Hook React pour état WiFi Direct |

### 🔵 Bluetooth — Screens (`bluetooth/screens/`)

| Fichier | Rôle |
|---------|------|
| `BleSignupScreen.js` | Inscription via BLE |
| `BleKioskScreen.js` | Interface kiosque BLE |

### 🟠 Loba — Services (`loba/services/`)

| Fichier | Rôle |
|---------|------|
| `LobaPackService.js` | Création/extraction packs `.yab` |
| `LocalStorageManager.js` | Gestion stockage local Loba |
| `ManifestService.js` | Manifest des vidéos Loba |
| `TransferQueueManager.js` | File d'attente transferts |

### 🟠 Loba — Hooks (`loba/hooks/`)

| Fichier | Rôle |
|---------|------|
| `useWifiDirect.js` | Hook WiFi Direct spécifique Loba |

### 🟠 Loba — Screens (`loba/screens/`)

| Fichier | Rôle |
|---------|------|
| `LobaHomeScreen.js` | Home Loba (auto-scan WiFi Direct + Mesh) |
| `LobaPacksScreen.js` | Partage manuel de packs P2P |

---

## Bugs résolus inclus dans cette version

| BUG | Date | Description |
|-----|------|-------------|
| BUG-033 | 2026-06-02 | `_lastIntendedRole` détruit au disconnect → cooldown 10s |
| BUG-034 | 2026-06-03 | Cycle P2P relance discovery 3s → vérif `isDiscovering` |
| BUG-035 | 2026-06-03 | Connexion peers NON-Yabisso → HELLO/ACK handshake |
| BUG-036 | 2026-06-03 | TypeError + regex + double MASTER → regex élargi + random init |
| BUG-037 | 2026-06-03 | Double MASTER persistant → `_meshPeers` Map + HELLO en premier |
| BUG-038 | 2026-06-03 | `p2p_control/` pas writable → réutiliser `loba_media/` (V2.7) |

---

## Comment restaurer cette version

### Option 1 — Checkout complet du commit
```bash
git checkout 06059e3 -- app/src/features/bluetooth/ app/src/features/loba/services/ app/src/features/loba/hooks/ app/src/features/loba/screens/LobaHomeScreen.js app/src/features/loba/screens/LobaPacksScreen.js
```

### Option 2 — Restaurer un seul fichier
```bash
# Exemple : restaurer WifiDirectService depuis cette version
git checkout 06059e3 -- app/src/features/bluetooth/services/WifiDirectService.js
```

### Option 3 — Copier depuis le backup
```bash
# Copier manuellement depuis mesfichiers/P2P/ vers app/src/features/...
cp mesfichiers/P2P/bluetooth/services/WifiDirectService.js app/src/features/bluetooth/services/
```

---

## Fichiers NON inclus (volontairement)

- `bluetooth/index.js` — juste un export, pas de logique P2P
- `loba/services/InterestEngine.js` — recommandation, pas P2P
- `loba/services/RecommendationEngine.js` — recommandation, pas P2P
- `loba/hooks/useLobaPublish.js` — publication Loba, pas P2P

---

## Vérification d'intégrité

Pour vérifier que les fichiers backupés correspondent bien à la version v0.0.8 :

```bash
# Comparer les SHA-256
sha256sum mesfichiers/P2P/bluetooth/services/WifiDirectService.js
git -C "C:\Users\Utilisateur\Documents\Ben\myapp\yabisso" ls-tree 06059e3 app/src/features/bluetooth/services/WifiDirectService.js
```

---

**Date du backup** : 2026-06-04
**Version source** : v0.0.8 (commit `06059e3`)
**Branche source** : `main`
**Créé par** : Assistant Yabisso
