# IMPLEMENTATION

## Stack et libraries (verifie dans le code)
- Expo SDK 54
- expo-dev-client
- expo-build-properties (Kotlin 2.1.21)
- WatermelonDB + SQLiteAdapter
- expo-sqlite
- expo-secure-store
- NetInfo
- react-native-get-sms-android (SMS fallback Android)

## Stack natives installees (Assistant IA)
- expo-camera (camera - photo - QR code)
- expo-image-picker (galerie photos)
- expo-document-picker (fichiers)
- expo-location (geolocalisation)
- expo-contacts (contacts)
- expo-av (audio)
- expo-file-system
- expo-constants
- react-native-ble-plx (Bluetooth Low Energy)
- react-native-qrcode-svg (Generation de QR)
- @react-native-ml-kit/image-labeling
- @react-native-ml-kit/text-recognition
- expo-speech-recognition

## Stack planifiee (a installer)
- Supabase (+ Edge Functions)
- React Navigation
- Zustand
- tweetnacl (Ed25519)
- expo-crypto
- Africa's Talking (SMS)
- Flutterwave + MTN/Airtel
- expo-nearby-connections (WiFi Direct)

## Design system (obligatoire)
Composants: YScreen, YText, YButton, YInput, YCard
Texte min 16px, boutons/inputs 52px
Contrainte bas de gamme: RAM < 150MB, max 3 videos, pagination 20, images < 200KB
Etat: a implementer dans le code RN

## Référence UI (Stitch)
- Projet Stitch: **Download Service Packs** (ID: 74958761542835188)
- Thème: Dark mode | Couleur: #2BEE79 | Font: Spline Sans | Roundness: Full
- Écrans disponibles: voir `mesfichiers/ui_screens/ui_screens_index.md`
- Screenshots locaux: `mesfichiers/ui_screens/download_service_packs/`

## Etat actuel (heritage)
UI onboarding/auth implemente (Welcome, Language, Signup, Login, SMS, QR)
Modal offline SMS/QR branche sur Signup
Connectivity via NetInfo
Schema DB local WatermelonDB en place
UI Wallet implemente (WalletScreen, RechargeScreen, SendScreen, ReceiveScreen, HistoryScreen)
Bottom navigation wallet avec navigation entre ecrans et etat actif
FloatingNav (bouton flottant gauche) sur certaines pages
UI Assistant IA implemente avec menu navigation, barre multiline, clavier avoidance, et 6 outils (Camera, Photo, Fichier, Position, Contact, Audio)
Build dev client Android configuré (`local.properties` pointant sur AppData SDK) et build Gradle validé

## Nouvelles fonctionnalités (2026-03-21)
- **Loba Video Feed**: Migration vers `expo-av` pour la lecture native. Persistence des filtres (Sépia, etc.) via schéma DB v6.
- **Marketplace Pro**: Affichage complet des descriptions et infos vendeurs (avatar/note) dans le tunnel d'achat.
- **Pricing Engine**: Parsing robuste des prix (gestion des "150.000") et fusion intelligente des articles négociés dans le panier.
- **Order Tracking**: Suivi de commande dynamique basé sur les données réelles de la transaction.
- **Seller Workflow**: Profil vendeur avec création de produits (photos, catégories, tags, livraison), ajout au panier, checkout et commande.
- **Favoris**: Système de favoris avec stockage SecureStore. Le cœur s'active sur ProductDetailsScreen et les produits s'affichent dans MarketplaceFavoritesScreen.
- **Comparaison de prix**: SellerComparisonScreen affiche le même produit avec plusieurs vendeurs (prix, état, livraison, localisation). Navigation vers ProductDetails avec le prix du vendeur sélectionné.
- **Confirmation réception**: Modal dans OrderStatusScreen avec possibilité d'ajouter un commentaire texte et jusqu'à 3 photos (caméra ou galerie) pour confirmer que la commande est conforme ou signaler un problème.

## Modules marketplace implementes (code)
- UI: `app/src/features/marketplace/screens/MarketplaceHomeScreen.js`
- UI: `app/src/features/marketplace/screens/ProductListScreen.js`
- UI: `app/src/features/marketplace/screens/CategoryPageScreen.js`
- UI: `app/src/features/marketplace/screens/ProductDetailsScreen.js` (+ négociation & compare & favoris)
- UI: `app/src/features/marketplace/screens/CartScreen.js`
- UI: `app/src/features/marketplace/screens/CheckoutScreen.js` (+ recipient popup)
- UI: `app/src/features/marketplace/screens/OrdersScreen.js` (+ reorder & status update)
- UI: `app/src/features/marketplace/screens/OrderStatusScreen.js` (+ confirmation reception avec photo/commentaire)
- UI: `app/src/features/marketplace/screens/DeliveryTrackingScreen.js`
- UI: `app/src/features/marketplace/screens/SellerComparisonScreen.js` (+ tri par prix/notation/livraison)
- UI: `app/src/features/marketplace/screens/BlockedUserScreen.js`
- UI: `app/src/features/marketplace/screens/SellerProfileScreen.js` (profil vendeur + gestion produits, sans onglet avis)
- UI: `app/src/features/marketplace/screens/AddProductScreen.js` (création produits)
- UI: `app/src/features/marketplace/screens/MarketplaceFavoritesScreen.js` (liste favoris)
- Context: `app/src/features/marketplace/context/CartContext.js` (panier + favoris avec SecureStore)
- Context: `app/src/features/marketplace/context/OrderContext.js`

## Parcours marketplace (flow complet)
1. MarketplaceHome -> ProductList -> ProductDetails
2. ProductDetails (Négociation possible) -> Cart -> Checkout
3. Checkout (Option Moi / Pas Moi avec Popup) -> Confirmation -> OrderStatus / Orders
4. Orders (En cours -> Livré) ou (Annulé -> Reprendre/Modifier -> Cart)
5. OrderStatus -> DeliveryTracking
6. ProductDetails (si plusieurs vendeurs) -> SellerComparison -> ProductDetails avec prix vendeur
7. Profile -> BlockedUser (Statut Marketplace)
8. Menu "Vendre" -> SellerProfile -> AddProduct -> Products list
9. Achat: Product -> Add to Cart -> Cart -> Checkout -> Order
10. Favoris: ProductDetails (cœur) -> MarketplaceFavoritesScreen
11. Confirmation réception: OrderStatus (livré) -> Modal confirmation avec photos/commentaire

## Auth et securite
PIN hashe SHA-256, jamais stocke en clair
Clés privees en Secure Store
Transactions signees Ed25519
Chiffrement XChaCha20 pour donnees sensibles
Nonce anti-rejeu obligatoire
Etat: spec, non implemente

## Auth wallet (2e niveau)
Biometrie obligatoire si dispo, PIN sinon

## Offline-first (implementation)
Ecrire d'abord dans WatermelonDB
Ajouter a SyncQueue si offline
SyncEngine pousse vers Supabase au retour du reseau
Ne jamais bloquer l'utilisateur avec une erreur reseau

## Etat d'implementation (code)
- UI: `app/src/features/onboarding/screens/WelcomeScreen.js`
- UI: `app/src/features/onboarding/screens/LanguageScreen.js`
- UI: `app/src/features/auth/screens/SignupScreen.js`
- UI: `app/src/features/auth/screens/LoginScreen.js`
- UI: `app/src/features/auth/screens/SmsSignupScreen.js`
- UI: `app/src/features/auth/screens/QrSignupScreen.js`
- Modal offline: `app/src/features/auth/components/OfflineSignupChoiceModal.js`
- UI: `app/src/features/home/screens/HomeScreen.js`
- UI: `app/src/features/home/screens/QrHubScreen.js`
- UI: `app/src/features/home/screens/HomeSettingsScreen.js`
- UI: `app/src/features/home/screens/HomeNotificationsScreen.js`
- UI: `app/src/features/wallet/screens/WalletScreen.js`
- UI: `app/src/features/ai/screens/AssistantScreen.js`
- UI: `app/src/features/profile/screens/ProfileScreen.js`
- UI: `app/src/features/profile/screens/AccountScreen.js`
- UI: `app/src/features/profile/screens/SecurityScreen.js`
- UI: `app/src/features/profile/screens/NotificationsScreen.js`
- UI: `app/src/features/profile/screens/LanguageSettingsScreen.js`
- UI: `app/src/features/profile/screens/SupportScreen.js`
- UI: `app/src/features/profile/screens/LogoutScreen.js`
- UI Loba: `app/src/features/loba/screens/`
  - `LobaForYouScreen.js` - Feed "Pour Toi" (intérêts utilisateur)
  - `LobaFollowingScreen.js` - Feed "Abonnements" (contenu suivi)
  - `LobaHomeScreen.js`
  - `LobaFeedScreen.js`
  - `LobaRecordScreen.js`
  - `LobaProfileScreen.js`
  - `LobaStoriesScreen.js`
- UI Restaurant: `app/src/features/restaurant/screens/`
  - `RestaurantHomeScreen.js`
  - `RestaurantDetailsScreen.js`
  - `FoodItemDetailsScreen.js`
  - `FoodCheckoutScreen.js`
- UI Hotels: `app/src/features/hotel/screens/HotelHomeScreen.js`
- UI Services: `app/src/features/services/screens/ServicesHomeScreen.js`
- UI Immobilier: `app/src/features/real_estate/screens/RealEstateHomeScreen.js`
- UI Wallet (Recharge, Send, Receive): `app/src/features/wallet/screens/`
  - `WalletScreen.js`
  - `RechargeScreen.js`
  - `SendScreen.js` + sub-screens (QR, PIN, Scan)
  - `ReceiveScreen.js` + sub-screens (Request, Scan)
  - `HistoryScreen.js`
- Offline signup service (payload + queue): `app/src/features/auth/services/OfflineSignupService.ts`
- DB schema: `app/src/lib/db/schema.ts`

## Supabase (setup)
Creer projet, activer Auth + RLS
Executer schema SQL complet
Configurer Storage buckets
Activer Realtime et pg_cron si necessaire
Edge Functions: commissions, verification paiements

## Bluetooth Mesh / WiFi Direct (notes)
- Pas de vrai mesh open source cle en main
- BLE mesh a construire avec react-native-ble-plx
- WiFi Direct via expo-nearby-connections
Alternatives open source:
- react-native-ble-plx (mesh custom, controle total)
- expo-nearby-connections (pas de mesh multi-hop)
- combiner ble-plx + nearby-connections
Phase 1: Bluetooth simple (pas de mesh) si besoin, mesh reporte.

## Permissions Android (BLE/WiFi/SMS)
BLUETOOTH, BLUETOOTH_ADMIN, BLUETOOTH_SCAN, BLUETOOTH_ADVERTISE
ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION
ACCESS_WIFI_STATE, CHANGE_WIFI_STATE, NEARBY_WIFI_DEVICES
SEND_SMS, READ_SMS, RECEIVE_SMS

## Modules clé

### Offline Chat
- **Méthode** : Messages stockés localement WatermelonDB → Sync Supabase au retour réseau ; P2P via BLE ou WiFi Direct si connecté
- **Librairie** : WatermelonDB (stockage) + react-native-ble-plx (transport P2P)
- **Statut** : Done (Sprint 5)

### Offline QR Signup
- **Méthode** : App génère QR (payload Ed25519 signé) → Vendeur kiosque scanne → ACK + verification_token → status: active localement
- **Librairie** : react-native-qrcode-svg (génération) + expo-camera / expo-barcode-scanner (scan)
- **Statut** : In Progress (Sprint 1)

### Offline Payment / Wallet UI
- **Méthode** : Saisie en FCFA, conversion automatique en Points (1:1). Double mode Wallet.
- **Librairie** : WatermelonDB + tweetnacl + Flutterwave (online) / SMS fallback (offline)
- **Statut** : Done (UI/Flow & DB logic completed)

## Modules produit (constraints)
- Buy & Sell: max 2 images par article (1 principale + mosaique <= 6), suppression annonces obsoletes.
- Loba: feed vertical, lecture boucle, ingestion admin.
- Wallet: argent + points, cashback, P2P, integrations MTN/Airtel/PayPal/cartes/Flutterwave.
- Delivery: QR/PIN signes Ed25519, validation locale puis sync.
- Swap: selection de deltas selon interets; petits via Mesh, gros via Wi-Fi Direct/USB.
- Notebook: notes et listes offline.

## Media pipeline & YAB-Pack
- Compression images/videos, mosaique auto pour produits.
- YAB-Pack: zstd -> encrypt -> sign -> merkle; distribution via Wi-Fi/USB/Mesh.

## Phase 1 - Offline Signup (diagramme technique detaille)
PHASE 1 — OFFLINE SIGNUP (QR + WiFi Direct + SMS)

SCOPE PHASE 1 (PRIORITES)
- Installation React Native + Expo
- Local storage (WatermelonDB + SecureStore)
- Signup online en premier
- Fallback SMS automatique
- QR kiosque
- Bluetooth simple si besoin (pas de mesh)
- UI de base pour signup

ROLE SUPER ADMIN (SMS)
- Recoit SMS offline chiffre
- Scanne et valide automatiquement
- Genere OTP et renvoie au user
- N'est pas un kiosque, mais un noeud d'activation SMS

PAYLOAD SIGNUP (QR / SMS / P2P)
- version: 1
- action: signup
- phone
- device_id
- public_key
- signup_nonce
- timestamp
- channel: qr | sms | p2p
- kiosk_id (optionnel, si validation kiosque)
- verification_token (optionnel, si ACK recu)
- signature: Ed25519(payload)

SCHEMA SQL MINIMAL (SUPABASE)
-- profiles
id (uuid, pk)
phone (text, unique)
device_id (text)
public_key (text)
status (text) -- pending | validated_by_kiosk | active
kiosk_id (uuid, nullable)
created_at (timestamptz)
updated_at (timestamptz)

-- signup_nonces
id (uuid, pk)
phone (text)
signup_nonce (text, unique)
timestamp (timestamptz)
created_at (timestamptz)

-- signup_verifications
id (uuid, pk)
phone (text)
verification_token (text, unique)
channel (text) -- qr | sms | p2p
kiosk_id (uuid, nullable)
created_at (timestamptz)

-- sms_otps
id (uuid, pk)
phone (text)
otp_hash (text)
expires_at (timestamptz)
created_at (timestamptz)

RLS POLICIES (MINIMAL)
-- profiles
policy: select_own_profile
  allow select where auth.uid() = id
policy: insert_profile
  allow insert with check (auth.uid() = id)
policy: update_own_profile
  allow update using (auth.uid() = id)

-- signup_nonces
policy: insert_nonce
  allow insert with check (true)
policy: select_nonce
  allow select where true

-- signup_verifications
policy: insert_verification
  allow insert with check (true)
policy: select_verification
  allow select where true

-- sms_otps
policy: insert_otp
  allow insert with check (true)
policy: select_otp
  allow select where true

PAYLOAD_JSON SCHEMA (SYNC_QUEUE)
{
  "version": 1,
  "action": "create_profile" | "verify_profile" | "update_profile",
  "profile": {
    "id": "uuid",
    "phone": "string",
    "device_id": "string",
    "public_key": "string",
    "status": "pending" | "validated_by_kiosk" | "active",
    "kiosk_id": "uuid" | null,
    "verification_token": "string" | null,
    "created_at": "number_ms",
    "updated_at": "number_ms"
  },
  "signup": {
    "signup_nonce": "string",
    "timestamp": "number_ms",
    "channel": "qr" | "sms" | "p2p",
    "signature": "string"
  },
  "meta": {
    "device_id": "string",
    "app_version": "string",
    "retry": "number"
  }
}

STRUCTURE LOCALE (WATERMELONDB)
-- profiles
id (string, pk)
phone (string)
device_id (string)
public_key (string)
status (string) -- pending | validated_by_kiosk | active
kiosk_id (string, nullable)
verification_token (string, nullable)
created_at (number, ms)
updated_at (number, ms)

-- sync_queue
id (string, pk)
action (string) -- create_profile | verify_profile | update_profile
payload_json (string)
status (string) -- pending | synced | failed
retry_count (number)
last_error (string, nullable)
next_retry_at (number, ms)
created_at (number, ms)
updated_at (number, ms)

-- signup_nonces
id (string, pk)
phone (string)
signup_nonce (string)
created_at (number, ms)

-- signup_verifications
id (string, pk)
phone (string)
verification_token (string)
channel (string) -- qr | sms | p2p
kiosk_id (string, nullable)
created_at (number, ms)

WATERMELONDB SCHEMA (PSEUDO)
- table: profiles
  columns:
  - phone (string, indexed)
  - device_id (string)
  - public_key (string)
  - status (string)
  - kiosk_id (string, optional)
  - verification_token (string, optional)
  - created_at (number)
  - updated_at (number)

- table: sync_queue
  columns:
  - action (string, indexed)
  - payload_json (string)
  - status (string, indexed)
  - retry_count (number)
  - last_error (string, optional)
  - next_retry_at (number, optional)
  - created_at (number)
  - updated_at (number)

- table: signup_nonces
  columns:
  - phone (string, indexed)
  - signup_nonce (string, indexed)
  - created_at (number)

- table: signup_verifications
  columns:
  - phone (string, indexed)
  - verification_token (string, indexed)
  - channel (string)
  - kiosk_id (string, optional)
  - created_at (number)

WATERMELONDB MODELS (PSEUDO)
ProfileModel
- table: profiles
- fields: phone, device_id, public_key, status, kiosk_id, verification_token, created_at, updated_at

SyncQueueModel
- table: sync_queue
- fields: action, payload_json, status, retry_count, last_error, next_retry_at, created_at, updated_at

SignupNonceModel
- table: signup_nonces
- fields: phone, signup_nonce, created_at

SignupVerificationModel
- table: signup_verifications
- fields: phone, verification_token, channel, kiosk_id, created_at

PRE-REQUIS
- Device ID genere et stocke
- Keypair Ed25519 genere (private in Secure Store)
- WatermelonDB init + table profiles/sync_queue

ENTREE
User ouvre l'app -> detection reseau
Si internet OK -> Flow Online (Supabase OTP)
Si pas internet -> Flow Offline

FLOW OFFLINE (APP CLIENT)
1) Generate signup_nonce + timestamp
2) Create Local Profile (status: pending)
3) Build payload:
   phone, device_id, public_key, nonce, timestamp
4) Sign payload (Ed25519) -> signature
5) Pack payload + signature
6) Choisir mode offline:
   Option A: SMS (super admin)
   Option B: QR Code (kiosque)
   Option C: Bluetooth simple (P2P)

TRANSPORT P2P (A <-> B)
1) Handshake P2P
2) Send payload
3) Receiver validations:
   - signature valide
   - nonce unique (anti-rejeu)
   - timestamp <= TTL
   - format phone ok
   - device_id present
4) Receiver cree stub profile local
5) Receiver genere verification_token
6) Receiver -> ACK + verification_token
7) Sender stocke verification_token local

TRANSPORT QR KIOSQUE (USER -> KIOSQUE)
1) App user genere QR (payload + signature)
2) Vendeur kiosque (profil admin) scanne le QR
3) App kiosque valide:
   - signature valide
   - nonce unique
   - timestamp <= TTL
   - format phone ok
4) App kiosque cree profil local utilisateur (status: validated_by_kiosk)
5) App kiosque emet ACK + verification_token
6) App user stocke verification_token local et passe status: active

ETATS PROFIL (OFFLINE SIGNUP)
- pending: profil local cree, pas encore valide
- validated_by_kiosk: validation kiosque ok
- active: inscription validee, app utilisable

TRANSPORT SMS FALLBACK (USER -> SUPER ADMIN)
1) Encrypt payload (XChaCha20)
2) Encode + Split SMS si besoin
3) Envoi SMS automatique (l'utilisateur ne passe pas par l'app SMS)
4) App super admin recoit et scanne automatiquement
5) Super admin valide + genere OTP
6) Super admin renvoie SMS OTP
7) App user recoit et scanne automatiquement
8) App user remplit OTP automatiquement + valide l'inscription
9) Local status: active

SYNC ON RECONNECT
1) Add SyncQueue item: create_profile
2) SyncEngine push -> Supabase
3) Supabase verify signature + nonce
4) Supabase create auth user + profile
5) Local status -> active
6) Clear SyncQueue item

ERREURS / SECURITE
- Si validation echoue -> rejet silencieux + log
- Si nonce deja vu -> ignorer
- Si TTL expire -> rejeter
