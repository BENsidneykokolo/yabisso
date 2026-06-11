# PROJECT MEMORY

## Version courante (verifie dans le code)
| Composant | Version | Statut |
|-----------|---------|--------|
| Expo SDK | 54 | ✅ Installe |
| React Native | via Expo SDK 54 | ✅ Installe |
| EAS config (eas.json + projectId) | present | ✅ Configure |
| expo-dev-client | ^6.0.20 | ✅ Installe |
| expo-build-properties | ~1.0.10 | ✅ Installe |
| WatermelonDB | ^0.28.0 | ✅ Installe |
| SQLiteAdapter | via WatermelonDB | ✅ Configure |
| expo-sqlite | ^16.0.10 | ✅ Installe |
| expo-secure-store | ^15.0.8 | ✅ Installe |
| NetInfo | ^12.0.1 | ✅ Installe |
| react-native-get-sms-android | ^1.2.0 | ✅ Installe (Android only) |
| expo-camera | ~17.0.10 | ✅ Installe |
| expo-image-picker | ~16.0.10 | ✅ Installe |
| expo-document-picker | ~13.0.6 | ✅ Installe |
| expo-location | ~19.0.10 | ✅ Installe |
| expo-contacts | ~14.0.6 | ✅ Installe |
| expo-av | ~16.0.8 | ✅ Installe |
| expo-file-system | ~19.0.6 | ✅ Installe |
| expo-constants | ~18.0.5 | ✅ Installe |
| react-native-ble-plx | ^3.5.1 | ✅ Installe |
| react-native-qrcode-svg | ^6.3.21 | ✅ Installe |
| @react-native-ml-kit/image-labeling | ^2.0.0 | ✅ Installe |
| @react-native-ml-kit/text-recognition | ^2.0.0 | ✅ Installe |
| expo-speech-recognition | ^3.1.1 | ✅ Installe |
| Supabase | - | 🔄 A installer |
| React Navigation | - | 🔄 A installer |
| Zustand | - | 🔄 A installer |
| WiFi Direct libs | - | ⏳ Phase 2-3 |

**Build dev client Android** : ✅ Build local configuré (correction `local.properties` / NDK)
**iOS** : Simple (Expo Go suffit pour Phase 1)
**DB locale** : WatermelonDB + SQLiteAdapter (SQLCipher prevu pour chiffrement)

##Etat actuel (verifie dans le code)
- UI onboarding/auth: Welcome, Language, Signup, Login, SMS, QR, Offline Login complet
- Choix de statut : Utilisateur, Partner, Kiosque, Affilier (Implemente)
- Dashboard/Home + pages QR/Settings/Notifications
- UI Wallet complet: WalletScreen, RechargeScreen, SendScreen, ReceiveScreen, HistoryScreen (Conversion FCFA/Points dynamique intégrée)
- Bottom navigation wallet avec navigation et etat actif
- Pages: Assistant IA (Entièrement réécrit: clavier, layout stable, menu, 6 outils), Profil + sous-pages
- **Loba (Vidéo)** : LobaHomeScreen, LobaFeedScreen, LobaRecordScreen, LobaProfileScreen, LobaStoriesScreen, LobaForYouScreen, LobaFollowingScreen (Implémenté)
- **Restaurant** : RestaurantHomeScreen, RestaurantDetailsScreen, FoodItemDetailsScreen, FoodCheckoutScreen, RestaurantOrdersScreen, RestaurantTrackingScreen, RestaurantSellerScreen (Implémenté)
- **Restaurant Seller Dashboard (Uber Eats)** : RestaurantSellerDashboard, RestaurantSellerOrdersScreen, RestaurantSellerOrderDetailScreen, RestaurantSellerAssignCourierScreen, RestaurantSellerNotificationsScreen, RestaurantSellerContext (Implémenté) - Résolution bug database null avec getDatabase() fallback SecureStore
 - **Hotels** : HotelHomeScreen, HotelSearchScreen, HotelDetailsScreen, HotelRoomDetailsScreen, HotelBookingScreen, HotelPaymentScreen, HotelReservationScreen, HotelMyBookingsScreen, HotelFavoritesScreen, HotelProfileScreen (Implémenté)
- **Services** : ServicesHomeScreen (UI Base Implémenté)
- **Immobilier** : RealEstateHomeScreen (UI Base Implémenté)
- **Marketplace** (COMPLET S5) : MarketplaceHomeScreen, ProductListScreen, CategoryPageScreen, CartScreen, CheckoutScreen, OrdersScreen, OrderStatusScreen, DeliveryTrackingScreen, AddProductScreen, SellerProfileScreen, SellerContactScreen, SellerComparisonScreen, BlockedUserScreen, MarketplaceFavoritesScreen, MarketplaceHistoryScreen, MarketplaceNotificationsScreen, MarketplaceSettingsScreen
- FloatingNav: bouton flottant (bottom: 120)
- Contextes : CartProvider, OrderProvider (états partagés)
- Offline choix SMS/QR: modal active quand offline (NetInfo)
- Schema DB local: profiles, sync_queue, signup_nonces, signup_verifications, products, wallet_transactions, loba_posts, assistant_messages
- Service offline signup: generation payload + enqueue SyncQueue (connecté à l'UI et fonctionnel)
- **Universal Offline-First**: Marketplace (Home, New Arrivals, Seller Profile), Wallet, Loba, et Assistant utilisent désormais WatermelonDB pour le stockage local (Migration complète Sprint 4/5).
- **Stratégie de Sync Mesh** :
  - *DIRECT* : Loba, Dating (diffusion dès l'upload).
  - *VALIDÉ* : Marché, Hôtels, Restaurants (diffusion après scan Kiosque).
  - *PRIVÉ* : Wallet, AI, Notebook (pas de diffusion publique).
- **YAB-Packs** : Disponibles pour tous les services publics pour accélérer l'accès aux données sans internet.
- Bluetooth Low Energy (BLE): intégré pour communication locale
- Supabase/OTP: pas encore integre

## Principes fondamentaux
- Offline-first non negociable
- Experience identique online/offline
- Toute action ecrite localement avant sync
- SyncQueue pour les actions offline

## Regles non negociables
- No cash-out pour les points Yabisso
- Conflits financiers jamais auto-resolus
- Commission kiosque 10% sur recharges, packs, ventes kiosque
- Seuil offline max 5 000 FCFA cumules
- Prix pack fixe 50 FCFA

## Securite
- Ed25519 pour signatures de transaction
- XChaCha20 pour chiffrement donnees sensibles
- Nonce anti-rejeu obligatoire
- Validation SMS stricte

## Decisions
- Yabisso doit fonctionner avec ou sans internet
- Utilisation de Wifi Direct pour communication offline
- Bluetooth en fallback
- QR Code pour signup offline
- SMS fallback si WiFi/Bluetooth indisponibles
- Sync automatique quand internet revient
- Demarrer avec SMS fallback + stockage local
- Bluetooth Mesh pour donnees legeres
- WiFi Direct pour gros volumes
- SDK cible: Expo 54 (dev client / prebuild pour modules natifs)
- iOS simple, Android complet
- Wallet: biometrie obligatoire si dispo, PIN sinon
- Stack open source BLE/WiFi: ble-plx + nearby-connections
- Phase 1: signup online en premier, puis SMS fallback, puis QR kiosque
- Phase 1: Bluetooth simple si besoin, mesh reporte
- Phase 1: installation RN/Expo + local storage avant le reste
- App initialise dans /app (code source principal)
- Roadmap transports: Phase 1 online + SMS fallback + UI, Phase 2 Wi-Fi Direct, Phase 3 Bluetooth

## Vision et modules
- Super-app africaine offline-first, services du quotidien dans une seule app.
- Modules: Buy & Sell, Loba, services freelance, restaurants/livraison, reservation, hotels, appartements, transport, billets avion, streaming, musique, formation, pari sportif, chatbot, wallet, swap, livraison interne/externe, notebook.

## Contraintes offline & transport
- Cache compresse ultra-optimise; suppression auto des annonces obsoletes.
- SMS fallback pour verification produit/inscription/commande.
- Mesh pour sync P2P proche; Wi-Fi Direct pour gros transferts; USB-OTG pour packs kiosque.
- SMS uniquement pour tokens legers (pas de medias).

## Securite et verification
- CGU acceptees via SMS chiffre en mode offline.
- QR/PIN: tokens signes Ed25519, verifiables offline puis sync.
- Seule l'app lit/decrypte les SMS Main Admin.

## IA et automatisation
- AI Admin: ingestion videos/reseaux sociaux, scraping donnees publiques, moderation/tagging.
- Recommandations personnalisees dans tous les services.
- Dynamic Pricing Chat pour negociation.

## Historique avancement (resume)
- Sprint 0: setup Expo + WatermelonDB + dev client
- Sprint 1: UI onboarding/auth (Welcome, Language, Signup, Login, SMS, QR)
- Sprint 1: dashboard + Wallet/Assistant/Profil + pages settings
- Sprint 1: schema DB local (profiles, sync_queue, signup_nonces, signup_verifications)
- Sprint 1: Marketplace (MarketplaceHomeScreen, ProductListScreen, CategoryPageScreen)
- Sprint 1: FloatingNav.position bottom: 120
- Sprint 1: Search bar style dashboard + Voice/Camera popups
- Sprint 1.5: Fix configuration build Android local (local.properties SDK path)
- Sprint 4: Notifications fonctionnel (Promotion -> liste promo, Nouveauté -> new_arrivals, etc.)
- Sprint 4: AddAddress - bouton enregistre avec categorie sans nom, fix zone systeme
- Sprint 4: Checkout - "Moi" affiche details profil inscription (Kwesi, +237 000 000 000)
- Sprint 4: Profile - Nom cliquable vers ecran Compte
- Sprint 4: Menu Boutique - "Accueil" remplace par "Profil" avec icon account-circle
- Sprint 5: Universal Offline-First Integration (Marketplace, Wallet, Loba, AI Assistant)
- Sprint 5: Notifications - Navigation Promotion, Nouveauté, Commande, Paiement fonctionnelle (Deep-linking)
- Sprint 5: Marketplace Seller Workflow - SellerProfileScreen, AddProductScreen, upload photos (profil/bannière), menu "Vendre", produits visibles dans boutique/catégories/recherche, workflow achat complet (panier -> checkout -> commande)
- Sprint 5: Loba - Appel téléphonique depuis Messages
- Sprint 5: Favoris - Système de favoris avec stockage SecureStore, écran Favoris fonctionnel
- Sprint 5: Comparaison de prix - Produits match par ID/nom, navigation vers détails produit avec prix vendeur sélectionné
- Sprint 5: Confirmation réception - Modal avec commentaire + upload jusqu'à 3 photos, signalement problème commande
- Sprint 6 (P2P): WiFi Direct - WifiDirectService refactored (startDiscovery stop→start, isConnecting flag, deterministic MAC-based delay, removeGroup cleanup)
- Sprint 6 (P2P): P2PAutoSync - Heartbeat avec re-init, suppression startReceiving prématuré (fix OOM itel A50), délai post-connexion 2s
- Sprint 6 (P2P): Mécanisme Ping-Pong (swap de rôles) pour échange bidirectionnel de Loba Packs via WiFi Direct
- Sprint 7 (Stabilisation): Correction crash RNZipArchive (suppression polling), Buffer Turbo Mode (64KB), Fix EAS Build (EASIgnore patterns), Correction WatermelonDB .fetchCount()
- Sprint 8 (Nearby + Auto Sync):
  - Nearby Mesh (expo-nearby-connections): Découverte automatique, échange manifestes, détection deltas
  - WiFi Direct: Transfert automatique des fichiers quand delta détecté
  - Fix display: Images/vidéos null (ajout helper getValidMediaUri, fallback UI avec initiales)
  - Fix connexions: Handshake Master/Slave avec délai aléatoire et retry (évite collisions)
  - Cycle P2P: 3s automatique pour sync ultra-rapide ("Passing By" scenario)
  - UI update: Subscription MeshContentUpdateEvents pour refresh automatique du feed
- Sprint 9 (Turbo Performance):
  - Turbo Mode: Délais WiFi Direct réduits (500ms post-connexion, retry 1s/2s)
  - Delta-Trigger: Trigger immédiat WiFi Direct après manifeste Nearby Mesh
  - Icon Fix: chatbubbles-outline -> message-text-outline
- Sprint 10 (V3.24 - BUG-056-059 fixes):
  - Filtre taille < 5KB dans startReceiving (control messages non traites comme LOBA_PACK)
  - InterestEngine: staging directory isole pour unpackAndProcess
  - Cleanup periodique des fichiers p2p_/ctrl_ dans loba_media
  - _handleReceivedFile: check taille minimum 5KB avant traitement
- Sprint 10 (V3.25 - BUG-061 fix - self-loop + HELLO jamais envoye):
  - **Fix Problème 1** : Slave envoie HELLO immediatement depuis onConnectionChange (pas apres SLAVE_CONNECTED_CONFIRMED + 5s delay)
  - **Fix Problème 2** : IP Slave capturee depuis metadata YABISSO_HELLO (senderIp) au lieu de getLocalP2pIp() (natif indispo sur Itel A50 Mediatek)
  - Guard `_onWifiGroupReadyMesh` : retourne si deja connecte WiFi Direct
  - Fallback IP: 192.168.49.2 si senderIp non disponible
- Sprint 10 (V3.27 - BUG-063/064 fix - Mesh propagation boucle + framework busy):
  - **BUG-063** : Mesh propagation en boucle (233 messages individuels → batch 50 max en un seul JSON)
  - **BUG-064** : Framework busy (delay WIFI_GROUP_READY 3s→5s, retry backoff 10s→15s, Master timeout HELLO 15s→25s)
- Sprint 10 (V3.28 - BUG-065/066 fix - 0B file + double instance):
  - **BUG-065** : 0B file — IP Slave detectee via subscribeOnConnectionInfoUpdates + receiveFile. Fallback 192.168.49.2 pour non-GO. `_sendYabissoHello` inclut toujours `senderIp`.
  - **BUG-066** : Singleton guard — `_started` flag empeche double demarrage P2PAutoSync sur Itel A50
- Sprint 11 (V3.39 - peerScore=0, SLAVE removeGroup, warmup delay):
  - **peerScore=0** : Store peer score from YABISSO_HELLO in `_peerScoreFromHello`, fallback in `shouldSend` and `_iAmMasterFor`
  - **EHOSTUNREACH warmup** : Added 3s warmup delay (`_lastConnectedAt`) before first send
  - **SLAVE framework busy** : Added `removeGroup()` before `connect()` in SLAVE path
  - **Mediatek GO=true bug** : `_sendYabissoHello` uses `_logicalRole` instead of buggy `isGroupOwner`
  - **_iAmMasterFor fallback** : Using `_peerScoreFromHello` when meshPeers empty
- Sprint 12 (V4.1 - race condition, framework busy, connectToPeer fix):
  - **Race WiFi/Mesh** : `_pendingPeerForArbitrage` + 5s timer — when WiFi peer found but no Mesh peer yet, wait 5s instead of ignoring
  - **WIFI_GROUP_READY retries** : Increased delays from [1s,2s,4s] to [2s,4s,8s]
  - **connectToPeer fix** : Returns `false` when `getConnectionInfo()` fails (was always returning `true`)
  - **stopPeerDiscovery** : Added `stopPeerDiscovery()` + increased delay to 1s before SLAVE connect
  - **getP2pLocalIp export** : Exported from JS bridge in `node_modules/react-native-wifi-p2p/index.js`
  - **clientList mapper** : Added `clientList` array to `getGroupInfo()` in `WiFiP2PDeviceMapper.java`
- Sprint 13 (V4.2 - disconnect protection during reception):
  - **_isReceiving flag** : Block `disconnect()` during file reception — WiFi Direct stays alive while receiving
  - **EHOSTUNREACH root cause identified** : Slave IP `192.168.49.2` is hardcoded fallback, wrong on Mediatek — APK rebuild required for `getP2pLocalIp`

## 🔴 BUG CRITIQUE EN COURS : EHOSTUNREACH
- **Problème** : Le Master envoie vers `192.168.49.2` (hardcodé) mais le Slave a une IP dynamique différente
- **Cause** : `getP2pLocalIp` échoue car l'APK n'a pas été reconstruit après patch `node_modules`
- **Preuve** : `sendFile from /192.168.49.1` (WiFi Direct OK) → `to /192.168.49.2` → EHOSTUNREACH
- **Fix requis** : Rebuild APK (`npx expo run:android`) pour activer `getP2pLocalIp`
- **Status** : En attente du rebuild APK

## 📋 PROCEDURE REBUILD APK + FIX EHOSTUNREACH

### Étape 1 : Rebuild APK
```bash
# Option A (recommandé)
npx expo run:android

# Option B (EAS Cloud)
eas build --platform android --profile preview
```

### Étape 2 : Vérifier que getP2pLocalIp fonctionne
Après le rebuild, chercher dans les logs Logcat (filtre `P2P`):
```
🌐 [V4.0] IP locale p2p (getP2pLocalIp): 192.168.49.X
```
Si cette ligne apparaît → fix racine OK, EHOSTUNREACH résolu.

### Étape 3 : Vérifier que le Slave envoie son IP au Master
Logs attendus côté Slave:
```
📍 [V4.3] IP Slave détectée: 192.168.49.X
📤 [V4.3] SLAVE_IP envoyé au Master via Mesh
```
Logs attendus côté Master:
```
🎯 [V4.3] IP Slave reçue via Mesh: 192.168.49.X
```

### Étape 4 : Vérifier que le pack s'envoie
```
📤 [V3.29] sendFileTo vers Slave IP=192.168.49.X (pas self-loop)
✅ sendFile réussi (tentative 1)
```

### Fallback si getP2pLocalIp échoue encore
Si malgré le rebuild, `getP2pLocalIp` ne marche pas:
1. Vérifier que `node_modules/react-native-wifi-p2p/index.js` contient bien l'export `getP2pLocalIp`
2. Vérifier que `WiFiP2PManagerModule.java` contient bien la méthode `@ReactMethod getP2pLocalIp()`
3. Utiliser le Fallback 2 : `discoverSlaveIpViaGroupInfo()` (déjà en place, ligne 704)
4. Utiliser le Fallback 3 : Slave détecte son IP via `getLocalP2pIp()` et l'envoie au Master via Mesh

### Champs modifiés dans le code
| Fichier | Ligne | Modification |
|---------|-------|-------------|
| `WifiDirectService.js` | 48 | `this._isReceiving = false` — flag protection disconnect |
| `WifiDirectService.js` | 650-690 | `getLocalP2pIp()` — tentative native getP2pLocalIp |
| `WifiDirectService.js` | 704-728 | `discoverSlaveIpViaGroupInfo()` — fallback groupInfo |
| `WifiDirectService.js` | 862-866 | `disconnect()` — bloqué si `_isReceiving=true` |
| `P2PAutoSync.js` | 688 | Handler `SLAVE_IP` — reçoit IP Slave via Mesh |
| `NearbyMeshService.js` | 274-306 | WIFI_GROUP_READY retry 2s/4s/8s |
| `node_modules/react-native-wifi-p2p/index.js` | 119 | Export `getP2pLocalIp` (patch non persistant) |
| `WiFiP2PManagerModule.java` | 134 | `@ReactMethod getP2pLocalIp()` (existe déjà) |
| `WiFiP2PDeviceMapper.java` | getGroupInfo | `clientList` ajouté au mapper |

### ⚠️ IMPORTANT : patch-package
Le patch `node_modules/react-native-wifi-p2p/index.js` (export getP2pLocalIp) est perdu au prochain `npm install`. Pour le persister:
```bash
npx patch-package react-native-wifi-p2p
```
Cela crée `patches/react-native-wifi-p2p+3.6.1.patch` qui sera appliqué automatiquement.

---

## 🔮 PROCHAINES ÉTAPES (après rebuild APK)

### TODO immédiat (demain)
1. **Rebuild APK** → `npx expo run:android`
2. **Installer sur les 2 téléphones** (itel A50 + Xiaomi 11T)
3. **Lancer l'app** et capturer les logs Logcat (filtre `P2P`)
4. **Vérifier** que `getP2pLocalIp` fonctionne → log `🌐 [V4.0] IP locale p2p`
5. **Vérifier** que le pack s'envoie sans EHOSTUNREACH

### Si EHOSTUNREACH persiste après rebuild
1. Vérifier que `getP2pLocalIp` est bien exposé dans le natif
2. Appliquer l'**APPROCHE 1** (socket TCP) : le Slave lit son IP depuis le socket accepté dans `startReceiving()`
3. Implémenter l'envoi `SLAVE_IP` via Mesh vers le Master
4. Implémenter le handler `SLAVE_IP` côté Master pour mettre à jour `_targetPeerIp`

### TODO secondaire
- **patch-package** : Persister le patch `react-native-wifi-p2p` (export getP2pLocalIp)
- **Nettoyage code** : Supprimer les fallbacks `192.168.49.2` hardcodés une fois la discovery fiable
- **Tests** : Tester sur 3+ appareils (itel A50 Mediatek, Xiaomi 11T, Samsung)

## Decisions techniques additionnelles
- Navigation: React Navigation (a installer)
- Crypto: tweetnacl (Ed25519) (a installer)
- DB locale: SQLite chiffre (SQLCipher prevu)
- Connectivity: NetInfo (expo-network retire)
- Expo dev client installe
- Dev client requis (WatermelonDB modules natifs, Expo Go insuffisant)
- WatermelonDB: utiliser SQLiteAdapter (import sqlite), pas makeExpoSQLiteAdapter
- SMS fallback: react-native-get-sms-android (sendDirect) pour Android
- WiFi Direct: react-native-wifi-p2p — unidirectionnel (Client→GO uniquement). Swap de rôles automatique via déconnexion après transfert.
- WiFi Direct connexion: délai déterministe basé sur MAC du peer (lastByte × 50ms) pour éviter les collisions GO Negotiation
- WiFi Direct déconnexion: removeGroup() + relance scan après 3s pour permettre le swap de rôles
- Budget devices (itel A50): ne jamais démarrer MessageServer sans connexion active (OOM), toujours stop→start pour discovery, délais de respiration hardware (100-300ms)
- Cycle P2P: 3s (v1.0.2) pour maximiser les chances de transfert lors de rencontres brèves.
- V3.27: Delais augmentés pour Itel A50 (WIFI_GROUP_READY 5s, retry 15s, timeout Master 25s). Batch Mesh BLE max 50 items.
- V4.1: `node_modules/react-native-wifi-p2p` patché (getP2pLocalIp export + clientList mapper). APK rebuild requis pour activer.
- V4.2: Flag `_isReceiving` protège la connexion WiFi Direct pendant la réception. `disconnect()` ignoré si réception active.

