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
- Marketplace - Home: `app/src/features/marketplace/screens/MarketplaceHomeScreen.js`
- Marketplace - Product List: `app/src/features/marketplace/screens/ProductListScreen.js`
- Marketplace - Category Page: `app/src/features/marketplace/screens/CategoryPageScreen.js`
- Marketplace - Product Details: `app/src/features/marketplace/screens/ProductDetailsScreen.js`
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
- Marketplace - Seller Contact: `app/src/features/marketplace/screens/SellerContactScreen.js`
- Marketplace - Cart Context: `app/src/features/marketplace/context/CartContext.js`
- Loba - For You (Pour Toi): `app/src/features/loba/screens/LobaForYouScreen.js`
- Loba - Following (Abonnements): `app/src/features/loba/screens/LobaFollowingScreen.js`
- Loba - Messages: `app/src/features/loba/screens/LobaMessagesScreen.js`
- Loba - Friends: `app/src/features/loba/screens/LobaFriendsScreen.js`
- Loba - Create: `app/src/features/loba/screens/LobaCreateScreen.js`
- Loba - Record: `app/src/features/loba/screens/LobaRecordScreen.js`
- Loba - Settings: `app/src/features/loba/screens/LobaSettingsScreen.js`
- Loba - Preview: `app/src/features/loba/screens/LobaPreviewScreen.js`
- Restaurant - Home: `app/src/features/restaurant/screens/RestaurantHomeScreen.js`
- Restaurant - Details: `app/src/features/restaurant/screens/RestaurantDetailsScreen.js`
- Restaurant - Item Details: `app/src/features/restaurant/screens/FoodItemDetailsScreen.js`
- Restaurant - Checkout: `app/src/features/restaurant/screens/FoodCheckoutScreen.js`
- Restaurant - Orders: `app/src/features/restaurant/screens/RestaurantOrdersScreen.js`
- Restaurant - Tracking: `app/src/features/restaurant/screens/RestaurantTrackingScreen.js`
- Restaurant - Seller: `app/src/features/restaurant/screens/RestaurantSellerScreen.js`
- Restaurant - Seller Dashboard: `app/src/features/restaurant/screens/RestaurantSellerDashboard.js`
- Restaurant - Seller Orders: `app/src/features/restaurant/screens/RestaurantSellerOrdersScreen.js`
- Restaurant - Seller Order Detail: `app/src/features/restaurant/screens/RestaurantSellerOrderDetailScreen.js`
- Restaurant - Seller Assign Courier: `app/src/features/restaurant/screens/RestaurantSellerAssignCourierScreen.js`
- Restaurant - Seller Notifications: `app/src/features/restaurant/screens/RestaurantSellerNotificationsScreen.js`
- Restaurant - Favoris: `app/src/features/restaurant/screens/RestaurantFavoritesScreen.js`
- FloatingNav: `app/src/components/FloatingNav.js`

---

## Services — S14 (Complets)

| Écran | Fichier | Status |
|-------|---------|--------|
| Services - Home | `app/src/features/services/screens/ServicesHomeScreen.js` | ✅ |
| Services - Details | `app/src/features/services/screens/ServiceDetailsScreen.js` | ✅ NOUVEAU |
| Services - Booking | `app/src/features/services/screens/ServiceBookingScreen.js` | ✅ NOUVEAU |
| Services - Checkout | `app/src/features/services/screens/ServiceCheckoutScreen.js` | ✅ NOUVEAU |
| Services - Orders | `app/src/features/services/screens/ServicesOrdersScreen.js` | ✅ NOUVEAU |
| Services - Favoris | `app/src/features/services/screens/ServicesFavoritesScreen.js` | ✅ NOUVEAU |
| Services - Notifications | `app/src/features/services/screens/ServicesNotificationsScreen.js` | ✅ NOUVEAU |
| Services - Profil | `app/src/features/services/screens/ServicesProfileScreen.js` | ✅ NOUVEAU |
| Services - Providers | `app/src/features/services/screens/ServicesProvidersScreen.js` | ✅ NOUVEAU |
| Services - Seller | `app/src/features/services/screens/ServicesSellerScreen.js` | ✅ |

---

## Pharmacie — S14 (Complets)

| Écran | Fichier | Status |
|-------|---------|--------|
| Pharmacie - Home | `app/src/features/pharmacy/screens/PharmacyHomeScreen.js` | ✅ MODIFIÉ |
| Pharmacie - Details | `app/src/features/pharmacy/screens/PharmacyDetailsScreen.js` | ✅ NOUVEAU |
| Pharmacie - Cart | `app/src/features/pharmacy/screens/PharmacyCartScreen.js` | ✅ NOUVEAU |
| Pharmacie - Checkout | `app/src/features/pharmacy/screens/PharmacyCheckoutScreen.js` | ✅ NOUVEAU |
| Pharmacie - Order | `app/src/features/pharmacy/screens/PharmacyOrderScreen.js` | ✅ NOUVEAU |

---

## Appartements — S14 (Complets)

| Écran | Fichier | Status |
|-------|---------|--------|
| Appartements - Home | `app/src/features/real_estate/screens/RealEstateHomeScreen.js` | ✅ MODIFIÉ |
| Appartements - Details | `app/src/features/real_estate/screens/ApartmentDetailsScreen.js` | ✅ NOUVEAU |
| Appartements - Booking | `app/src/features/real_estate/screens/ApartmentBookingScreen.js` | ✅ NOUVEAU |
| Appartements - Payment | `app/src/features/real_estate/screens/ApartmentPaymentScreen.js` | ✅ NOUVEAU |
| Appartements - Favoris | `app/src/features/real_estate/screens/ApartmentFavoritesScreen.js` | ✅ NOUVEAU |
| Appartements - Search | `app/src/features/real_estate/screens/ApartmentSearchScreen.js` | ✅ NOUVEAU |

---

## Assistant IA — S14 (Complets)

| Écran | Fichier | Status |
|-------|---------|--------|
| AI - Assistant | `app/src/features/ai/screens/AssistantScreen.js` | ✅ |
| AI - History | `app/src/features/ai/screens/AssistantHistoryScreen.js` | ✅ NOUVEAU |
| AI - Settings | `app/src/features/ai/screens/AssistantSettingsScreen.js` | ✅ NOUVEAU |

---

## Hotels — S14 (Complets)

| Écran | Fichier | Status |
|-------|---------|--------|
| Hotels - Home | `app/src/features/hotel/screens/HotelHomeScreen.js` | ✅ |
| Hotels - Search | `app/src/features/hotel/screens/HotelSearchScreen.js` | ✅ |
| Hotels - Details | `app/src/features/hotel/screens/HotelDetailsScreen.js` | ✅ |
| Hotels - Room Details | `app/src/features/hotel/screens/HotelRoomDetailsScreen.js` | ✅ |
| Hotels - Booking | `app/src/features/hotel/screens/HotelBookingScreen.js` | ✅ |
| Hotels - Payment | `app/src/features/hotel/screens/HotelPaymentScreen.js` | ✅ |
| Hotels - Reservation | `app/src/features/hotel/screens/HotelReservationScreen.js` | ✅ |
| Hotels - My Bookings | `app/src/features/hotel/screens/HotelMyBookingsScreen.js` | ✅ |
| Hotels - Favoris | `app/src/features/hotel/screens/HotelFavoritesScreen.js` | ✅ |
| Hotels - Profile | `app/src/features/hotel/screens/HotelProfileScreen.js` | ✅ |
| Hotels - Notifications | `app/src/features/hotel/screens/HotelNotificationsScreen.js` | ✅ NOUVEAU |
| Hotels - History | `app/src/features/hotel/screens/HotelHistoryScreen.js` | ✅ NOUVEAU |

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