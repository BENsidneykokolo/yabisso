# UI SCREENS — YABISSO
> Projet Stitch : **Download Service Packs** (ID: 74958761542835188)
> Thème : Dark mode | Couleur : #2BEE79 | Font : Spline Sans | Roundness : Full

---

## 📁 Dossier : `ui_screens/download_service_packs/`

| Fichier | Écran | Module |
|---------|-------|--------|
| `01_signup_offline.webp` | Signup (Offline) Screen | Auth |
| `02_signup_qr.webp` | Signup (Offline via QR) Screen | Auth |
| `03_sms_login.webp` | SMS Login Screen | Auth |
| `04_account_recovery.webp` | Account Recovery Screen | Auth |
| `05_login.webp` | Login Screen | Auth |
| `06_wallet_request_money.webp` | Wallet — Request Money | Wallet |
| `07_hotels_reservation.webp` | Hotels Reservation Screen | Services |
| `08_marketplace_add_product.webp` | Marketplace — Add Product | Marketplace |
| `09_marketplace_seller_profile.webp` | Marketplace — Seller Profile | Marketplace |
| `10_services_sms_fallback.webp` | Services Offline Booking SMS Fallback | Services |
| `11_real_estate.webp` | Real Estate Property List | Services |

---

## Design System (extrait depuis Stitch)
- **Mode** : Dark
- **Couleur principale** : `#2BEE79` (vert Yabisso)
- **Font** : Spline Sans
- **Roundness** : Full (boutons et inputs complètement arrondis)
- **Saturation** : Niveau 3 (couleurs vives)

---

## Implementations RN (verifiees)
- Welcome: `app/src/features/onboarding/screens/WelcomeScreen.js`
- Language: `app/src/features/onboarding/screens/LanguageScreen.js`
- Signup: `app/src/features/auth/screens/SignupScreen.js`
- Login: `app/src/features/auth/screens/LoginScreen.js`
- Signup SMS: `app/src/features/auth/screens/SmsSignupScreen.js`
- Signup QR: `app/src/features/auth/screens/QrSignupScreen.js`
- Signup PIN: `app/src/features/auth/screens/PinSignupScreen.js`
- Home (Dashboard): `app/src/features/home/screens/HomeScreen.js`
- QR Hub: `app/src/features/home/screens/QrHubScreen.js`
- Home Settings: `app/src/features/home/screens/HomeSettingsScreen.js`
- Home Notifications: `app/src/features/home/screens/HomeNotificationsScreen.js`
- Wallet: `app/src/features/wallet/screens/WalletScreen.js`
- Wallet - Recharge: `app/src/features/wallet/screens/RechargeScreen.js`
- Wallet - Send: `app/src/features/wallet/screens/SendScreen.js`
- Wallet - Receive: `app/src/features/wallet/screens/ReceiveScreen.js`
- Wallet - History: `app/src/features/wallet/screens/HistoryScreen.js`
- Assistant IA: `app/src/features/ai/screens/AssistantScreen.js`
- Profil: `app/src/features/profile/screens/ProfileScreen.js`
- Profil - Compte: `app/src/features/profile/screens/AccountScreen.js`
- Profil - Securite: `app/src/features/profile/screens/SecurityScreen.js`
- Profil - Notifications: `app/src/features/profile/screens/NotificationsScreen.js`
- Profil - Langue: `app/src/features/profile/screens/LanguageSettingsScreen.js`
- Profil - Support: `app/src/features/profile/screens/SupportScreen.js`
- Profil - Deconnexion: `app/src/features/profile/screens/LogoutScreen.js`
- Profil - Edit Profile: `app/src/features/profile/screens/EditProfileScreen.js`
- Profil - Notifications: `app/src/features/profile/screens/NotificationsScreen.js`
- Profil - Langue: `app/src/features/profile/screens/LanguageSettingsScreen.js`
- Profil - Support: `app/src/features/profile/screens/SupportScreen.js`
- Profil - Deconnexion: `app/src/features/profile/screens/LogoutScreen.js`
- Marketplace - Home: `app/src/features/marketplace/screens/MarketplaceHomeScreen.js`
- Marketplace - Product List: `app/src/features/marketplace/screens/ProductListScreen.js`
- Marketplace - Category Page: `app/src/features/marketplace/screens/CategoryPageScreen.js`
- Marketplace - Product Details: `app/src/features/marketplace/screens/ProductDetailsScreen.js` (+ bouton comparer si plusieurs vendeurs)
- Marketplace - Cart: `app/src/features/marketplace/screens/CartScreen.js`
- Marketplace - Checkout: `app/src/features/marketplace/screens/CheckoutScreen.js`
- Marketplace - Order Status: `app/src/features/marketplace/screens/OrderStatusScreen.js`
- Marketplace - Delivery Tracking: `app/src/features/marketplace/screens/DeliveryTrackingScreen.js`
- Marketplace - Orders List: `app/src/features/marketplace/screens/OrdersScreen.js`
- Marketplace - Seller Comparison: `app/src/features/marketplace/screens/SellerComparisonScreen.js`
- Marketplace - Blocked User: `app/src/features/marketplace/screens/BlockedUserScreen.js`
- Marketplace - Add Product: `app/src/features/marketplace/screens/AddProductScreen.js`
- Marketplace - Seller Profile: `app/src/features/marketplace/screens/SellerProfileScreen.js`
- Marketplace - Notifications: `app/src/features/marketplace/screens/MarketplaceNotificationsScreen.js`
- Marketplace - Favoris: `app/src/features/marketplace/screens/MarketplaceFavoritesScreen.js`
- Marketplace - Historique: `app/src/features/marketplace/screens/MarketplaceHistoryScreen.js`
- Marketplace - Parametres: `app/src/features/marketplace/screens/MarketplaceSettingsScreen.js`
- Loba - For You (Pour Toi): `app/src/features/loba/screens/LobaForYouScreen.js`
- Loba - Following (Abonnements): `app/src/features/loba/screens/LobaFollowingScreen.js`
- Loba - Messages: `app/src/features/loba/screens/LobaMessagesScreen.js` (+ appel téléphonique)
- Loba - Friends: `app/src/features/loba/screens/LobaFriendsScreen.js`
- Loba - Create: `app/src/features/loba/screens/LobaCreateScreen.js`
- Loba - Record: `app/src/features/loba/screens/LobaRecordScreen.js`
- Loba - Settings: `app/src/features/loba/screens/LobaSettingsScreen.js`
- Loba - Preview: `app/src/features/loba/screens/LobaPreviewScreen.js`
- Restaurant - Home: `app/src/features/restaurant/screens/RestaurantHomeScreen.js`
- Restaurant - Details: `app/src/features/restaurant/screens/RestaurantDetailsScreen.js`
- Restaurant - Item Details: `app/src/features/restaurant/screens/FoodItemDetailsScreen.js`
- Restaurant - Checkout: `app/src/features/restaurant/screens/FoodCheckoutScreen.js`
- Hotels - Home: `app/src/features/hotel/screens/HotelHomeScreen.js`
- Services - Home: `app/src/features/services/screens/ServicesHomeScreen.js`
- Immobilier - Home: `app/src/features/real_estate/screens/RealEstateHomeScreen.js`
- Marketplace - Cart Context: `app/src/features/marketplace/context/CartContext.js`
- FloatingNav: `app/src/components/FloatingNav.js`

---

## Features UI
- Search bar: Style dashboard avec popups Voice/Camera
- Bottom nav: Couleur bleue (#3B82F6) comme dashboard
- Navigation: Boutique/Catégories/Chatbot/Nouveauté/Commande

---

## Autres projets Stitch disponibles
| Projet | ID | Description |
|--------|----|-------------|
| Download Service Packs | 74958761542835188 | Projet principal — tous les modules |
| Splash, Login & Offline Signup | 3501781268799211698 | Écrans d'intro et auth |
| Welcome & Role Selection | 788960918432375883 | Onboarding et sélection de rôle |
| Yabisso Login | 4737784206271863054 | Variantes de l'écran de login |

---

## Conventions de nommage
Format : `[numéro]_[module]_[ecran].webp`
Exemple : `06_wallet_request_money.webp`

Modules disponibles :
- `auth` : Login, Signup, OTP, Recovery
- `wallet` : Paiement, Recharge, Historique, Transfert
- `marketplace` : Produits, Vendeur, Commandes
- `services` : Hôtels, Réservation, Livraison, Transport
- `loba` : Feed vidéo, Profil créateur
- `chat` : Messagerie, Négociation
- `settings` : Profil, Sécurité, KYC
- `notebook` : Notes, Listes, Memo
