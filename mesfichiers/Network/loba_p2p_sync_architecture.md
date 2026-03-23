# LOBA — Architecture Sync P2P Intelligent (Download-First)

> 📊 **Schéma visuel** : voir le fichier `loba_p2p_sync_schema.html` (ouvrir dans un navigateur)

---

## Principe central

Le player LOBA **ne touche jamais directement le réseau**. Il lit toujours depuis le stockage local. C'est le `DownloadManager` qui gère tout en arrière-plan selon le rail disponible.

- **En ligne (Internet)** → browse direct possible + téléchargement en arrière-plan
- **Offline (BT Mesh / WiFi Direct)** → lecture uniquement du contenu déjà dans le local storage

---

## Phase 1 — Échange de manifestes

Avant tout transfert, les deux appareils s'échangent un **Manifest JSON** contenant pour chaque fichier :

- `hash` — identifiant unique du fichier (SHA-256)
- `taille` — taille en octets
- `catégorie` — type de contenu (sport, musique, cuisine, etc.)
- `profil_intérêts` — pourcentages par catégorie pour cet utilisateur

### Exemple de Manifest JSON

```json
{
  "user_id": "user_A",
  "media": [
    { "hash": "abc123", "size": 2400000, "category": "sport", "type": "video" },
    { "hash": "def456", "size": 850000,  "category": "musique", "type": "image" }
  ],
  "interests": {
    "sport": 0.60,
    "musique": 0.30,
    "autre": 0.10
  }
}
```

---

## Phase 2 — Déduplication

Le moteur de déduplication compare les manifests des deux utilisateurs :

```
A ∩ B = fichiers en commun → exclus du transfert
Δ    = fichiers que A n'a pas encore → candidats au transfert
```

### Exemple

| Utilisateur A | Utilisateur B | Résultat |
|---|---|---|
| 200 vidéos, 300 images | 50 vidéos, 1000 images | 20 vidéos en commun → exclues |
| — | — | 30 vidéos restantes = candidats pour A |

> La déduplication se base sur le **hash** du fichier, pas le nom. Deux fichiers identiques partagés par des sources différentes ne sont transférés qu'une seule fois.

---

## Phase 3 — Sélection par intérêts

Sur les contenus candidats (après déduplication), l'algorithme applique un filtre de recommandation :

### Règle 95% / 5%

| Part | Logique |
|---|---|
| **95%** | Contenu qui correspond aux catégories aimées par l'utilisateur A (selon son profil d'intérêts) |
| **5%** | Contenu d'exploration — catégories nouvelles pour A, pour découverte |

### Boucle d'évolution du profil

```
like sur contenu exploration ×1  → légère hausse de la catégorie
like sur contenu exploration ×3  → catégorie intègre le profil principal
ignore répété                    → pourcentage stagne ou baisse
```

Le profil est stocké localement dans **MMKV** et synchronisé dans le manifest à chaque échange.

---

## Phase 4 — File de transfert (triée par taille ↑)

Les contenus sélectionnés sont placés dans une **Transfer Queue** triée par taille croissante, quelle que soit la connectivité :

```
thumbnails → images légères (<500KB) → images moyennes (<2MB)
→ images lourdes (<5MB) → vidéos courtes → vidéos longues
```

Cela garantit que même si le transfert est interrompu, les contenus les plus légers (et donc les plus nombreux) ont déjà été reçus.

---

## Phase 5 — Rails de transfert

### 🌐 Internet
- Browse direct possible (comme TikTok classique)
- Téléchargement en arrière-plan sans limite de taille
- Prefetch des 10 posts suivants pendant la lecture du post actuel

### 📡 WiFi Direct (automatique)
Déclenchement automatique :
1. Détection d'un peer via `expo-nearby-connections`
2. Échange des manifests en arrière-plan
3. Démarrage du transfert sans intervention utilisateur

Ordre de transfert par taille croissante :

| Étape | Contenu |
|---|---|
| ① | Thumbnails + métadonnées |
| ② | Images < 1 MB |
| ③ | Images < 5 MB |
| ④ | Vidéos, de la plus courte à la plus longue |

### 🔵 Bluetooth Mesh (automatique)
Limite stricte : **≤ 5 MB par fichier**

Ordre de passage (pour maximiser la diversité reçue) :

| Étape | Contenu |
|---|---|
| ① | 50% des images sélectionnées |
| ② | 50% des vidéos sélectionnées (≤ 5 MB) |
| ③ | 100% des images restantes |
| ④ | 100% des vidéos restantes (≤ 5 MB) |

> Les fichiers > 5 MB restent en attente dans la queue jusqu'à ce qu'un rail plus rapide soit disponible (WiFi Direct ou Internet).

---

## Stockage local

Tout converge vers le même store local :

| Couche | Technologie | Rôle |
|---|---|---|
| Métadonnées | WatermelonDB | Posts, hashes, `localMediaPath`, statut de téléchargement |
| Fichiers médias | expo-file-system / RNFS | Vidéos et images stockées en local |
| Index rapide | MMKV | Profil d'intérêts, index des hashes présents |

### Champ clé dans `loba_posts`

```typescript
interface LobaPost {
  id: string
  hash: string
  localMediaPath: string | null  // null = pas encore téléchargé
  category: string
  size: number
  downloadedAt: Date | null
}
```

Le player **refuse de jouer** si `localMediaPath === null` et affiche un placeholder (thumbnail grisé + icône en attente).

---

## Politique de nettoyage (LRU)

Pour éviter de saturer le stockage de l'appareil :

- Garder les médias consultés dans les **7 derniers jours**
- Limite totale : **2 GB** (configurable)
- En cas de dépassement, supprimer les médias les plus anciens en premier
- Ne jamais supprimer un média en cours de lecture ou mis en favori

---

## Composants à implémenter

| Service | Responsabilité |
|---|---|
| `ManifestService` | Générer le manifest local, parser le manifest reçu, calculer le diff (Δ) |
| `RecommendationEngine` | Filtrer les candidats selon les intérêts, gérer la boucle 95/5 |
| `TransferQueueManager` | Trier la queue par taille, prioriser selon le rail actif |
| `NetworkRailDetector` | Détecter internet / WiFi Direct / BT Mesh / offline |
| `P2PAutoSync` | Orchestrer la découverte de peers et déclencher le sync automatique |
| `LocalStorageManager` | Écrire les fichiers, mettre à jour WatermelonDB, appliquer le LRU |

---

## Cycle de vie d'un post

```
Post découvert (via réseau ou peer)
  ↓
ManifestService → déduplication (déjà présent ? → skip)
  ↓
RecommendationEngine → correspond aux intérêts ? → priorité haute / basse
  ↓
TransferQueueManager → ajout en file selon taille
  ↓
Rail actif → transfert (Internet / WiFi Direct / BT Mesh)
  ↓
LocalStorageManager → fichier écrit + WatermelonDB mis à jour
  ↓
Player → lecture depuis localMediaPath
  ↓
Feedback (like/ignore) → profil d'intérêts mis à jour
  ↓
Nettoyage LRU → médias anciens supprimés
```
