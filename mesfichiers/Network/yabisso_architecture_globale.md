# Yabisso — Architecture Globale

> 📊 **Schéma visuel interactif** : voir `yabisso_architecture_globale.html`

---

## Vue d'ensemble

Yabisso est un super app offline-first conçu pour le marché africain. Il fonctionne sans connexion internet grâce à un réseau mesh (Bluetooth + WiFi Direct) et synchronise les données dès qu'une connexion est disponible.

### Deux grandes familles de services

| Famille | Principe | Services |
|---|---|---|
| **Data partagée** | Sync P2P automatique — les données circulent entre utilisateurs proches | LOBA, Marketplace, MeshChat, Bookings, Real Estate, Transport, Hôtels, Vols, Musique, Streaming, Livraison, Formation, Réservation, Paris/Bet, Bloc-notes |
| **Data personnelle** | 100% local — jamais de sync automatique, paiements via BT/WiFi/SMS | Wallet, AI Chatbot |

---

## Principes communs à tous les services

### Stack technique partagée

| Couche | Technologie |
|---|---|
| Base de données locale | WatermelonDB + SQLite |
| Cache rapide | MMKV |
| État global | Zustand |
| Bluetooth P2P | react-native-ble-plx |
| WiFi Direct | expo-nearby-connections |
| SMS fallback | SIM native de l'utilisateur |
| Sync cloud | Supabase (quand internet disponible) |
| Fichiers locaux | expo-file-system / RNFS |

### Palette UI

| Token | Valeur |
|---|---|
| Background | `#0D0F14` |
| Accent vert | `#2BEE79` |

### Rails de connectivité (communs à tous)

```
Internet        → sync cloud Supabase + CDN · pas de limite
WiFi Direct     → P2P local · transfert par taille croissante
Bluetooth Mesh  → P2P local · limite stricte ≤ 5 MB par fichier
SMS fallback    → données critiques uniquement (OTP, paiements)
Offline total   → lecture du local storage uniquement
```

### Règle de lecture universelle

> Le player / l'interface **lit toujours depuis le stockage local**. Jamais directement depuis le réseau. C'est le `DownloadManager` qui alimente le store en arrière-plan.

---

## Manifest P2P (commun aux services "data partagée")

Avant tout transfert P2P, les deux appareils s'échangent un **Manifest JSON** :

```json
{
  "user_id": "user_A",
  "service": "marketplace",
  "items": [
    { "hash": "abc123", "size": 45000, "category": "electronique", "type": "listing" }
  ],
  "interests": { "electronique": 0.55, "mode": 0.30, "autre": 0.15 },
  "last_sync": "2025-03-10T14:22:00Z"
}
```

**Déduplication systématique** : `A ∩ B` (items en commun) → exclus. Seul le delta `Δ` est transféré.

**Filtre de recommandation 95/5** :
- 95% → contenu correspondant aux intérêts de l'utilisateur
- 5% → exploration de nouvelles catégories (pourcentage évolue selon les likes)

---

## Services "Data Partagée"

---

### 1. LOBA — Feed Vidéo / Photo

**Principe** : TikTok-like offline. Téléchargement d'abord, lecture locale ensuite.

#### Phases

| Phase | Action |
|---|---|
| 1 | Échange manifest (hash · taille · catégorie · intérêts) |
| 2 | Déduplication par hash |
| 3 | Filtre recommandation 95/5 |
| 4 | Transfer Queue triée taille ↑ |
| 5 | Rail actif → stockage local → lecture |

#### Règles de transfert

| Rail | Limite | Ordre |
|---|---|---|
| Internet | Aucune | Prefetch 10 posts suivants en arrière-plan |
| WiFi Direct | Pas de limite stricte | thumbnails → images → vidéos courtes → vidéos longues |
| BT Mesh | ≤ 5 MB | 50% images → 50% vidéos → 100% images → 100% vidéos |

#### Stockage

```typescript
interface LobaPost {
  id: string
  hash: string
  localMediaPath: string | null   // null = placeholder affiché
  category: string
  size: number
  downloadedAt: Date | null
}
```

---

### 2. Marketplace — Achats / Ventes

**Principe** : Les annonces (listings) circulent entre vendeurs et acheteurs proches via P2P. La transaction finale est confirmée online ou via SMS.

#### Phases

| Phase | Action |
|---|---|
| 1 | Manifest des listings locaux (hash · prix · catégorie · photos) |
| 2 | Déduplication (annonces déjà vues) |
| 3 | Filtre par intérêts acheteur + géolocalisation approximative |
| 4 | Transfer Queue : metadata d'abord, photos ensuite |
| 5 | Listing affiché localement · commande via BT/WiFi/SMS |

#### Règles spécifiques

- Les **prix et stocks** sont horodatés (`updated_at`) — en cas de conflit, la version la plus récente gagne
- La **confirmation de commande** nécessite un accusé de réception (ACK) signé Ed25519
- Le vendeur reçoit l'ACK via BT Mesh ou SMS si offline total

#### Stockage

```typescript
interface MarketplaceListing {
  id: string
  hash: string
  sellerId: string
  title: string
  price: number
  currency: string
  category: string
  localPhotoPaths: string[]
  stock: number
  updatedAt: Date
  syncStatus: 'local' | 'p2p_shared' | 'cloud_synced'
}
```

---

### 3. MeshChat — Messagerie P2P

**Principe** : Messages texte, photos et fichiers échangés directement entre devices sans serveur. Chiffrement Ed25519 end-to-end.

#### Phases

| Phase | Action |
|---|---|
| 1 | Découverte de peers (BLE advertising + WiFi Direct) |
| 2 | Handshake Ed25519 (échange de clés publiques) |
| 3 | Messages texte → BT Mesh (chunked Base64 BLE) |
| 4 | Médias → WiFi Direct si disponible, sinon BT si ≤ 5 MB |
| 5 | Stockage local chiffré · sync Supabase si online |

#### Règles spécifiques

- Messages texte : envoyés même en BT Mesh (petite taille)
- Photos/fichiers > 5 MB : en attente jusqu'à WiFi Direct ou Internet
- **Store-and-forward** : si le destinataire est offline, le message est stocké chez les peers intermédiaires du mesh et livré dès que possible
- Accusé de lecture (double check) via ACK signé

#### Stockage

```typescript
interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string               // chiffré en local
  mediaLocalPath: string | null
  status: 'sending' | 'sent' | 'delivered' | 'read'
  createdAt: Date
  deliveredVia: 'bt' | 'wifi' | 'internet' | 'sms'
}
```

---

### 4. Bookings / Services

**Principe** : Réservation de services locaux (coiffeur, mécanicien, plombier…). Les disponibilités des prestataires circulent via P2P.

#### Phases

| Phase | Action |
|---|---|
| 1 | Manifest prestataires (hash · créneaux · catégorie · géo) |
| 2 | Déduplication (prestataires déjà connus) |
| 3 | Filtre par catégorie de service + distance approximative |
| 4 | Transfer Queue : fiches prestataires (légères) d'abord |
| 5 | Réservation → ACK signé → confirmation via BT/WiFi/SMS |

#### Règles spécifiques

- Les **créneaux** ont une durée de validité courte (`expires_at`) — expirés après 24h si non confirmés online
- Conflit de double réservation : résolu par timestamp + signature
- Le prestataire peut diffuser ses disponibilités en broadcast BLE (advertising packet)

---

### 5. Real Estate — Immobilier

**Principe** : Annonces immobilières (vente, location) diffusées P2P. Photos compressées pour BT, full-res via WiFi/Internet.

#### Phases

| Phase | Action |
|---|---|
| 1 | Manifest annonces (hash · prix · type · géo · taille photos) |
| 2 | Déduplication |
| 3 | Filtre par type (vente/location), budget, quartier |
| 4 | Transfer Queue : fiche texte → photo principale → galerie complète |
| 5 | Stockage local · contact vendeur via MeshChat |

#### Règles spécifiques

- Photos compressées (thumbnail 50 KB) passent en BT Mesh
- Galerie complète uniquement via WiFi Direct ou Internet
- Les annonces expirent après 30 jours sans mise à jour

---

### 6. Transport

**Principe** : Trajets partagés et taxis locaux. Le chauffeur diffuse sa position et disponibilité via BLE advertising.

#### Phases

| Phase | Action |
|---|---|
| 1 | Chauffeur broadcast position + disponibilité (BLE advertising packet) |
| 2 | Passager reçoit les offres proches |
| 3 | Négociation du trajet via MeshChat |
| 4 | Confirmation trajet → ACK signé |
| 5 | Paiement via Wallet (BT/WiFi/SMS) |

#### Règles spécifiques

- La position est un delta chiffré (pas de coordonnées GPS brutes partagées)
- Le trajet est loggé localement et synced Supabase si online
- Fallback SMS : numéro de trajet + montant envoyé par SMS pour confirmation

---

### 7. Hôtels

**Principe** : Listings d'hôtels et chambres disponibles diffusés P2P. Réservation avec ACK signé.

Même architecture que **Bookings** avec :
- Photos d'hôtels traitées comme LOBA (thumbnail BT, full-res WiFi/Internet)
- Disponibilités horodatées avec `expires_at` à 6h
- Confirmation de réservation via ACK Ed25519 + SMS fallback

---

### 8. Vols

**Principe** : Informations de vols (horaires, prix, disponibilités) mises en cache local et partagées P2P.

#### Spécificités

- Données de vols téléchargées en bloc quand online (ex : planning 7 jours)
- Partagées P2P telles quelles (lecture seule, pas de modification)
- La **réservation** nécessite obligatoirement une connexion Internet (API compagnie)
- En offline : consultation du cache local uniquement, alerte "réservation impossible hors ligne"

---

### 9. Musique

**Principe** : Bibliothèque musicale partagée P2P. Modèle identique à LOBA mais pour l'audio.

#### Règles de transfert

| Rail | Comportement |
|---|---|
| Internet | Stream direct possible + téléchargement arrière-plan |
| WiFi Direct | Fichiers audio par taille ↑ (mp3 128kbps → 320kbps → FLAC) |
| BT Mesh | Uniquement fichiers ≤ 5 MB (mp3 128kbps courte durée) |
| Offline | Lecture bibliothèque locale uniquement |

---

### 10. Streaming (Vidéo)

**Principe** : Identique à LOBA pour les longs formats (films, séries, documentaires).

#### Spécificités

- Fichiers lourds (> 100 MB) : téléchargement Internet uniquement
- WiFi Direct : films jusqu'à 2 GB (transfert en arrière-plan, peut prendre plusieurs minutes)
- BT Mesh : bande-annonces et extraits ≤ 5 MB seulement
- Lecture toujours depuis le local storage (jamais de streaming direct réseau)

---

### 11. Livraison

**Principe** : Commandes de livraison locale. Le livreur diffuse sa disponibilité via BLE.

Même architecture que **Transport** avec :
- Suivi de commande via MeshChat
- Preuve de livraison = photo signée Ed25519 stockée localement
- Paiement à la livraison via Wallet (BT/WiFi/SMS)

---

### 12. Formation

**Principe** : Cours et contenus pédagogiques partagés P2P. Un device "école" peut diffuser du contenu à une classe entière.

#### Spécificités

- Contenu formaté en bundles (cours = texte + images + vidéo courte)
- Un device peut servir de **seed node** et diffuser un bundle à tous les devices proches simultanément
- Progression de l'apprenant stockée localement (quiz, scores)
- Certificats de complétion signés Ed25519

#### Règles de transfert

| Contenu | Rail |
|---|---|
| Texte + images légères | BT Mesh |
| Vidéos pédagogiques courtes | WiFi Direct |
| Vidéos HD / modules complets | Internet |

---

### 13. Réservation (générique)

**Principe** : Service de réservation générique (restaurants, salles, événements…).

Même architecture que **Bookings** — utilisé comme base pour tout service nécessitant une réservation de créneau avec confirmation ACK.

---

### 14. Paris / Bet

**Principe** : Paris sportifs et jeux locaux. Les cotes circulent P2P, les mises sont enregistrées localement.

#### Spécificités

- Cotes téléchargées en bloc quand online et partagées P2P (lecture seule)
- Mise enregistrée localement avec signature Ed25519
- Résultat confirmé uniquement via Internet ou SMS officiel
- **Anti-triche** : chaque mise est hashée + timestampée et ne peut pas être modifiée après soumission
- Paiement des gains via Wallet

---

### 15. Bloc-notes

**Principe** : Notes personnelles avec option de partage P2P sélectif.

#### Spécificités

- Notes stockées localement dans WatermelonDB (chiffrées si marquées "privé")
- Partage P2P : l'utilisateur choisit explicitement quelles notes partager (pas de sync automatique)
- Format léger → passe facilement en BT Mesh
- Sync Supabase si online (backup cloud optionnel)

---

## Services "Data Personnelle"

---

### 16. Wallet / Paiements

**Principe** : 100% local. Les données financières ne quittent jamais le téléphone sauf pour effectuer une transaction explicitement initiée par l'utilisateur.

#### Cascade de paiement

```
1. WiFi Direct (si les deux devices sont proches)
   ↓ échec ou indisponible
2. Bluetooth Mesh (transaction chiffrée, chunked)
   ↓ échec ou indisponible
3. SMS fallback (montant + hash transaction + signature)
   ↓ confirmation
4. ACK signé Ed25519 des deux côtés
```

#### Sécurité

- Clé privée Ed25519 générée et stockée dans le Secure Enclave (Keystore Android)
- Chaque transaction = `{ montant, timestamp, sender_pub_key, receiver_pub_key, signature }`
- Double dépense impossible : chaque transaction a un nonce unique vérifié localement
- Sync Supabase uniquement pour l'historique (pas les clés)

#### Stockage

```typescript
interface WalletTransaction {
  id: string
  nonce: string                 // unique, anti-double-dépense
  amount: number
  currency: string
  senderPubKey: string
  receiverPubKey: string
  signature: string             // Ed25519
  status: 'pending' | 'confirmed' | 'failed'
  deliveredVia: 'wifi' | 'bt' | 'sms'
  createdAt: Date
}
```

---

### 17. AI Chatbot

**Principe** : 100% on-device. Le modèle tourne localement, aucune donnée ne sort du téléphone.

#### Stack

| Composant | Technologie |
|---|---|
| Modèle LLM | Gemma 2B Q4 GGUF |
| Inférence | llama-node (embedded Node.js/Express) |
| STT | Vosk (offline, français + langues locales) |
| TTS | Coqui TTS (custom, voix locale) |
| Stockage conversations | WatermelonDB (chiffré) |

#### Spécificités

- Téléchargement du modèle au premier lancement (runtime download pour garder l'APK léger)
- Conversations stockées localement uniquement — jamais envoyées au cloud
- Fonctionne sans aucune connectivité
- Fine-tuning QLoRA possible sur Colab pour ajouter des langues (Lingala, Swahili…)

---

## Architecture des données — Schéma commun

### WatermelonDB — Tables principales

```
users           → profil local + clé publique Ed25519
interests       → profil d'intérêts par service (95/5 algo)
sync_queue      → opérations en attente de sync cloud
p2p_manifest    → dernier manifest échangé par peer
media_index     → index de tous les fichiers locaux (hash · path · size)
transactions    → historique Wallet (chiffré)
conversations   → historique AI Chatbot (chiffré)
```

### Politique LRU (tous services médias)

| Règle | Valeur |
|---|---|
| Durée de rétention | 7 jours |
| Limite de stockage | 2 GB (configurable) |
| Priorité de suppression | Plus ancien en premier |
| Exceptions | Favoris · médias en cours de lecture |

---

## Roadmap des phases Yabisso

| Phase | Services | Priorité |
|---|---|---|
| 1 | MeshChat + Offline Signup/Auth | Foundation |
| 2 | LOBA + Musique | Engagement |
| 3 | Marketplace + Livraison | Économie locale |
| 4 | Wallet + Paiements P2P | Monétisation |
| 5 | Transport + Hôtels + Vols + Réservation | Services |
| 6 | Real Estate + Bookings | Immobilier |
| 7 | Streaming + Formation | Contenu long |
| 8 | Paris/Bet + Bloc-notes | Divertissement |
| 9 | AI Chatbot | Intelligence locale |
