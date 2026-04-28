# Yabisso — Logique du Storage Local & Partage P2P

## L'idée centrale : chaque service a sa propre "étagère"

Imagine un grand meuble dans le téléphone. Ce meuble a des tiroirs, un par service. Le tiroir "Loba" contient les vidéos Loba. Le tiroir "Marché" contient les produits du marché. Le tiroir "Portefeuille" contient les transactions. Chaque tiroir est indépendant — si tu vides le tiroir Loba, le Marché reste intact.

C'est exactement ce que fait le storage Yabisso localement sur le téléphone.

---

## Les 3 types de tiroirs

### Type 1 — Tiroirs publics (partageable + sync cloud)

Ce sont les services dont le contenu appartient à tout le monde. Un restaurant qui poste son menu, un vendeur qui met ses produits, une vidéo Loba — ce n'est pas personnel, tout le monde peut en bénéficier.

Ces tiroirs font deux choses : ils se synchronisent automatiquement avec Supabase quand il y a internet, et ils peuvent être partagés entre amis en P2P.

**Services concernés :** Marché, Loba, Restauration, Hôtel, News, Formation, Transport, Taxi, Vols, Immobilier, Appartements, Musique, Streaming, Services, Services Pros, Services Maison, Livraison, Pharmacie, Paris Sportifs.

### Type 2 — Tiroirs personnels (sync cloud mais non partageable)

Ce sont les services liés à toi personnellement, pas à du contenu public. Tes réservations, tes préférences de rencontres, ton historique d'échange — c'est ton historique à toi.

Ces tiroirs se synchronisent avec Supabase (pour que tu retrouves tes données si tu changes de téléphone), mais ils ne se partagent jamais en P2P avec un ami.

**Services concernés :** Rencontres, Réservations, Échangeur.

### Type 3 — Tiroirs verrouillés (local uniquement, jamais nulle part)

Ce sont les données les plus sensibles. L'argent et l'IA. Ces tiroirs ne quittent jamais le téléphone — ni vers Supabase, ni vers un ami, ni vers un kiosque. Ils restent sur l'appareil physiquement.

**Services concernés :** Portefeuille (transactions, clés Ed25519), Assistant IA (modèle Gemma 2B, historique de conversation).

---

## Le mirror Supabase — comment ça marche concrètement

Imagine que Supabase est un grand entrepôt dans le cloud. Yabisso maintient exactement la même organisation dans l'entrepôt que dans le téléphone. Si ton tiroir local "Marché" contient un dossier `electronique/telephone/`, Supabase a exactement le même dossier `electronique/telephone/`.

Quand ton téléphone a internet, il compare régulièrement :
- "Est-ce que mon tiroir local a des choses que Supabase n'a pas encore ?" → Si oui, il envoie.
- "Est-ce que Supabase a des choses que je n'ai pas encore ?" → Si oui, il télécharge.

**Exemple concret :** tu ajoutes un produit sur Marché depuis le kiosque Yabisso. Ce produit va d'abord dans ton tiroir local. Dès que ton téléphone a du réseau, il monte automatiquement sur Supabase. Ton ami qui ouvre Yabisso le lendemain avec internet voit le produit — parce que son téléphone l'a téléchargé depuis Supabase pendant la nuit.

---

## Le partage P2P 200 MB — la logique complète

### La situation de départ

Imaginons deux amis : **Kofi** et **Amara**.

Kofi est allé au kiosque Yabisso hier. Son tiroir Loba contient 400 vidéos récentes, soit environ 2 GB. Amara n'a pas accès à internet et n'est jamais allé au kiosque. Son tiroir Loba est vide.

### Ce qui se passe quand ils se croisent

Kofi et Amara activent le partage dans l'app. Les deux téléphones se parlent en Bluetooth ou WiFi Direct. La première chose que font les applis, c'est s'échanger leur "liste d'inventaire" — appelée le `manifest.db`. C'est un petit fichier qui dit simplement : "voici tous les fichiers que j'ai, avec leur date."

L'app de Kofi compare les deux inventaires et se dit : "Amara n'a aucune des 400 vidéos Loba. Je peux lui envoyer les 40 plus récentes pour rester dans 200 MB."

L'app prépare un pack `.yab` — un paquet scellé contenant les 40 vidéos avec leur fiche d'identité complète : quel service, quel dossier, quelle date. Ce paquet part vers le téléphone d'Amara.

### À la réception chez Amara

L'app d'Amara reçoit le pack `.yab`. Elle l'ouvre, lit chaque fiche d'identité, et range chaque fichier exactement là où il était chez Kofi. Les vidéos Loba vont dans `loba/feed/videos/`, les thumbnails dans `loba/feed/thumbnails/`. Si le service Loba n'existait pas encore sur le téléphone d'Amara, l'app le crée automatiquement.

Amara peut maintenant regarder 40 vidéos Loba, même sans internet.

---

## Exemple avec le Marché — plus complexe

**La situation :** Kofi a 50 produits dans son Marché. 5 sont dans `electronique/telephone/`, 5 dans `habits/`, et 40 dans `alimentation/`. Chaque produit fait environ 2 MB (photos + fiche). Total : 100 MB.

**Amara veut les produits du Marché.** Elle sélectionne le service "Marché" dans le menu de partage.

L'app compare les inventaires : Amara n'a aucun des 50 produits de Kofi. 50 × 2 MB = 100 MB, c'est sous la limite de 200 MB. Tous les produits partent dans le pack.

Quand Amara reçoit le pack, l'app range automatiquement :
- les 5 téléphones dans `marche/electronique/telephone/`
- les 5 habits dans `marche/habits/`
- les 40 produits alimentaires dans `marche/alimentation/`

Quand Amara ouvre le service Marché, l'app lit ces dossiers et affiche les produits dans les bonnes catégories — exactement comme si Amara les avait téléchargés depuis internet.

---

## Pourquoi le format `.yab` ?

Le pack de partage est un fichier `.yab` — un format inventé par Yabisso. Deux raisons importantes.

**Sécurité :** le fichier est signé par Yabisso. Seule l'app Yabisso peut l'ouvrir et l'installer. Si quelqu'un essaie de l'ouvrir avec un gestionnaire de fichiers Android, il ne voit rien d'utilisable. Ça évite l'extraction de contenu en dehors de l'app.

**Fiabilité :** le `.yab` contient à la fois les fichiers ET leur fiche d'identité complète (service, dossier, date, taille, checksum). Même si le transfert est coupé au milieu, l'app peut reprendre exactement là où elle s'est arrêtée. Et quand Amara reçoit finalement tout, l'app vérifie le checksum de chaque fichier pour s'assurer qu'il n'est pas corrompu.

### Structure d'un pack `.yab`

```json
{
  "pack_version": "1.0",
  "created_by": "device_kofi_abc123",
  "created_at": "2025-01-15T10:30:00Z",
  "total_size_bytes": 195000000,
  "manifest": [
    {
      "file_id": "uuid-001",
      "service": "loba",
      "path": "loba/feed/videos/video_42.mp4",
      "category": "feed",
      "size_bytes": 5200000,
      "timestamp": "2025-01-14T08:00:00Z",
      "checksum": "sha256:abc..."
    },
    {
      "file_id": "uuid-042",
      "service": "marche",
      "path": "marche/electronique/telephone/produit_iphone.json",
      "category": "electronique",
      "sub_category": "telephone",
      "size_bytes": 120000,
      "timestamp": "2025-01-13T14:00:00Z",
      "checksum": "sha256:def..."
    }
  ],
  "signature": "yabisso_v1_signed"
}
```

---

## Le manifest.db — le carnet d'inventaire

C'est la pièce centrale de tout le système. Chaque téléphone tient un carnet qui liste tous ses fichiers. Pour chaque fichier, le carnet note :

- quel service (`loba`, `marche`, `news`…)
- quel chemin exact (`loba/feed/videos/video_42.mp4`)
- quelle taille
- quelle date de création
- quel appareil l'a créé
- si c'est reçu d'un ami ou téléchargé depuis un kiosque

Quand deux téléphones se croisent en P2P, ils échangent d'abord leurs carnets (quelques kilobytes seulement). L'app calcule en quelques millisecondes exactement ce que l'autre n'a pas. C'est rapide et précis — pas besoin de comparer fichier par fichier.

---

## Structure complète des buckets locaux

```
yabisso_storage/
│
├── loba/
│   ├── feed/videos/          ← vidéos ~5 MB each
│   ├── feed/thumbnails/      ← aperçus légers
│   └── metadata/             ← JSON par vidéo
│
├── marche/
│   ├── electronique/
│   │   └── telephone/        ← produits avec photos, prix
│   ├── habits/
│   ├── alimentation/
│   ├── restaurants/
│   └── metadata/
│
├── restauration/
│   ├── restaurants/
│   ├── menus/
│   └── photos_plats/
│
├── news/
│   ├── articles/
│   └── images/
│
├── formation/
│   ├── cours/
│   ├── videos/
│   └── certificats/
│
├── hotel/
│   ├── etablissements/
│   ├── photos/
│   └── tarifs/
│
├── immobilier/
│   ├── vente/
│   ├── location/
│   └── photos/
│
├── transport/
│   ├── lignes/
│   ├── horaires/
│   └── arrets/
│
├── taxi/
│   ├── chauffeurs/
│   └── zones/
│
├── musique/
│   ├── tracks/
│   ├── albums/
│   └── covers/
│
├── pharmacie/
│   ├── medicaments/
│   └── pharmacies/
│
├── meshchat/                 ← Type 2 : sync, non partageable
│   ├── conversations/
│   ├── medias/
│   └── contacts/
│
├── rencontres/               ← Type 2 : sync, non partageable
│   ├── profils/
│   └── photos/
│
├── reservations/             ← Type 2 : sync, non partageable
│   ├── historique/
│   └── en_cours/
│
├── wallet/                   ← Type 3 : LOCAL UNIQUEMENT
│   ├── transactions/
│   └── keys/
│
├── ai_chatbot/               ← Type 3 : LOCAL UNIQUEMENT
│   ├── model/gemma2b/
│   ├── vosk/
│   └── historique/
│
└── manifest.db               ← Index central horodaté
```

---

## Le flow complet résumé

| Étape | Action | Résultat |
|-------|--------|----------|
| **1. Kiosque → Kofi** | Kofi va au kiosque, télécharge les 400 dernières vidéos Loba | Son tiroir `loba/feed/videos/` se remplit. Le `manifest.db` se met à jour. |
| **2. Kofi → Amara (P2P)** | Les deux se croisent, activent le partage Loba | Les manifests s'échangent. L'app choisit les 40 vidéos les plus récentes qu'Amara n'a pas. Le `.yab` est préparé et envoyé. |
| **3. Réception chez Amara** | L'app décompresse le `.yab` | Chaque fichier est rangé dans le bon tiroir. Le `manifest.db` d'Amara est mis à jour. |
| **4. Amara sans internet** | Elle ouvre Loba | Elle voit 40 vidéos. L'app lui indique : "pour les 360 autres, va au kiosque ou connecte-toi." |
| **5. Amara trouve internet** | Sync automatique avec Supabase | Les 40 vidéos reçues de Kofi + les nouvelles depuis Supabase s'ajoutent. |

---

## La chaîne de propagation

C'est la force du système. Chaque personne devient un maillon :

```
Kiosque Yabisso → Kofi → Amara → Bernard → Cécile → ...
```

Sans que personne n'ait besoin d'internet à chaque étape, le contenu se propage de téléphone en téléphone. Chaque transfert est limité à 200 MB, chaque fichier arrive dans le bon tiroir, et l'app sait toujours ce qui manque grâce au `manifest.db`.

---

## Exemples de capacité par service (200 MB)

| Service | Poids moyen par item | Items dans 200 MB |
|---------|---------------------|-------------------|
| Loba (vidéos) | ~5 MB / vidéo | ~40 vidéos |
| Marché (produit) | ~2 MB / produit | ~100 produits |
| Restauration | ~80-100 MB / restaurant | 2 restaurants complets |
| Hôtel | ~60-80 MB / hôtel | 2-3 hôtels |
| News (articles) | ~1 MB / article + image | ~200 articles |
| Musique | ~4 MB / titre MP3 | ~50 titres |
| Formation (cours) | ~80-150 MB / cours | 1-2 cours complets |
| Pharmacie | ~80 MB / catalogue | 1 catalogue complet |

---

## Implémentation (2026-04-28)

### Service de stockage
- **Fichier**: `app/src/lib/services/YabissoStorageService.js`
- **Fonctions**:
  - `getStorageStructure()` - Retourne la structure par type
  - `getServiceType(serviceKey)` - Retourne PUBLIC/PERSONAL/LOCKED
  - `isServiceShareable(serviceKey)` - Vérifie si partageable P2P
  - `isServiceSyncable(serviceKey)` - Vérifie si sync vers cloud
  - `isServiceLocalOnly(serviceKey)` - Vérifie si local uniquement
  - `saveFile()`, `readFile()`, `deleteFile()`, `listFiles()`
  - `getServiceSize()` - Taille par service
  - `updateManifest()` - Met à jour l'index central
  - `getStorageStats()` - Stats par type

### Schema DB (v10)
Tables ajoutées pour Type 1 (Public):
- `restaurants` - Restauration
- `hotels` - Hôtels
- `courses` - Formation
- `properties` - Immobilier
- `routes` - Transport
- `taxi_zones` - Taxi
- `tracks` - Musique
- `medicaments` - Pharmacie
- `videos` - Streaming

Tables ajoutées pour Type 2 (Personal):
- `conversations` - Chat/Messages
- `dating_profiles` - Rencontres
- `reservations` - Réservations

Type 3 (Locked) - Déjà présent:
- `profiles` - Profil utilisateur
- `wallet_transactions` - Transactions钱包
- `assistant_messages` - Messages IA

### Modèles créés
- Restaurant.ts, Hotel.ts, Course.ts, Property.ts
- Route.ts, TaxiZone.ts, Track.ts, Medicament.ts, Video.ts
- Conversation.ts, DatingProfile.ts, Reservation.ts
