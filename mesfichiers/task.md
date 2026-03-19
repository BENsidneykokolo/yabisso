# TASK MANAGER

## APK Build
- **Chemin** : `app/android/app/build/outputs/apk/debug/app-debug.apk`
- **Taille** : ~249 MB
- **Date** : 14 mars 2026 à 23:45
- **Statut** : ✅ Créé

## Légende
- **Priorité** : P1 (critique) > P2 (important) > P3 (optionnel)
- **Sprint** : S0=Setup, S1=Auth+SMS, S2=Wallet+Sync, S3=Flutterwave+Loba, S4=Media+Marketplace, S5=Négociation, S6=WiFi Direct, S7=Bluetooth, S8-S11=Delivery+Kiosque+AI, S12=Security+Pilot

---

## Phase 1 — Online + SMS Fallback + UI (MVP)

| Tâche | Status | Priorité | Sprint |
|-------|--------|----------|--------|
| Setup React Native + Expo | Done | P1 | S0 |
| Installer expo-dev-client | Done | P1 | S0 |
| Installer EAS CLI | Done | P1 | S0 |
| Configurer EAS dev client + build Android | Done | P1 | S0 |
| Configurer build local Android (Correction SDK/NDK) | Done | P1 | S0 |
| Fix WatermelonDB adapter import (SQLiteAdapter) | Done | P1 | S0 |
| Local storage init (WatermelonDB + SecureStore) | Done | P1 | S0 |
| Design system de base (YScreen/YText/YButton/YInput) | Not Started | P1 | S0 |
| UI base (login/signup + screens de base) | Done | P1 | S1 |
| Creer WelcomeScreen (bienvenue) | Done | P1 | S1 |
| Creer LanguageScreen | Done | P1 | S1 |
| Creer SignupScreen | Done | P1 | S1 |
| Creer SmsSignupScreen | Done | P1 | S1 |
| Creer QrSignupScreen | Done | P1 | S1 |
| Creer PinSignupScreen | Done | P1 | S1 |
| Implémenter le choix de statut (Utilisateur, Partner, Kiosque, Affilier) | Done | P1 | S1 |
| Creer LoginScreen | Done | P1 | S1 |
| Creer HomeScreen (dashboard) | Done | P1 | S1 |
| Creer FloatingNav (bouton flottant) | Done | P1 | S1 |
| Creer WalletScreen | Done | P1 | S1 |
| Creer AssistantScreen | Done | P1 | S1 |
| Creer ProfileScreen | Done | P1 | S1 |
| Creer pages Profil (Compte, Securite, Langue, Support, Deconnexion) | Done | P1 | S1 |
| Creer HomeSettingsScreen | Done | P1 | S1 |
| Creer HomeNotificationsScreen | Done | P1 | S1 |
| Creer QrHubScreen | Done | P1 | S1 |
| Creer MarketplaceHomeScreen | Done | P1 | S1 |
| Creer ProductListScreen | Done | P1 | S1 |
| Creer CategoryPageScreen | Done | P1 | S1 |
| Creer ProductDetailsScreen | Done | P1 | S4 |
| Creer CartScreen | Done | P1 | S4 |
| Creer CheckoutScreen | Done | P1 | S4 |
| Creer OrderStatusScreen | Done | P1 | S4 |
| Creer DeliveryTrackingScreen | Done | P1 | S4 |
| Creer SellerComparisonScreen | Done | P1 | S4 |
| Creer LobaForYouScreen (Pour Toi) | Done | P2 | S5 |
| Creer LobaFollowingScreen (Abonnements) | Done | P2 | S5 |kedUserScreen | Done | P1 | S4 |
| Creer CartContext (state management) | Done | P1 | S4 |
| Ajouter bouton comparer dans ProductDetails | Done | P1 | S4 |
| Ajouter bouton comparer dans ProductList | Done | P1 | S4 |
| Ajouter bouton statut marketplace dans Profile | Done | P1 | S4 |
| Branchement parcours complet marketplace | Done | P1 | S4 |
| FloatingNav remonter (bottom: 120) | Done | P1 | S1 |
| Link BottomNav Boutique vers MarketplaceHomeScreen | Done | P1 | S1 |
| Creer structure dossiers complete | Done | P1 | S0 |
| Signup online (Supabase OTP) | Not Started | P1 | S1 |
| SMS fallback automatique (user/super admin) | In Progress | P1 | S1 |
| Configuration SMS (Africa's Talking) | Not Started | P1 | S1 |
| Definir stack SMS fallback (Android only) | Done | P1 | S1 |
| Configurer permissions BLE/WiFi/SMS Android | Done | P1 | S1 |
| Offline Signup (flow complet) | Done | P1 | S1 |
| QR kiosque (scan/validate) | Not Started | P1 | S1 |
| Auth kiosque offline (QR activation locale) | Not Started | P1 | S1 |
| Secure local DB (SQLite chiffré) | Not Started | P1 | S1 |
| Schema SQL Supabase complet | Not Started | P1 | S1 |
| RLS policies + audit_log insert-only | Not Started | P1 | S1 |
| SyncEngine + conflictResolver | Not Started | P1 | S2 |
| Supabase Sync minimal | Not Started | P1 | S2 |
| Wallet - Recharger Screen | Done | P1 | S1 |
| Wallet - Kiosque QR Screen | Done | P1 | S1 |
| Wallet - Kiosque PIN Screen | Done | P1 | S1 |
| Wallet - Envoyer Screen (popup 3 options) | Done | P1 | S1 |
| Wallet - Envoyer QR Generate (Step 1) | Done | P1 | S1 |
| Wallet - Envoyer PIN/Select Beneficiaire | Done | P1 | S1 |
| Wallet - Envoyer Scan QR (Step 3) | Done | P1 | S1 |
| Wallet - Recevoir Screen | Done | P1 | S1 |
| Wallet - Recevoir Scan QR | Done | P1 | S1 |
| Wallet - Recevoir Notifications | Done | P1 | S1 |
| Wallet - Recevoir Request Payment | Done | P1 | S1 |
| Wallet - Historique Screen | Done | P1 | S1 |
| Wallet - Mode Points & Conversion 1:1 | Done | P1 | S1 |
| Marketplace - Menu drawer avec Profil | Done | P1 | S4 |
| Marketplace - Notifications fonctionnel | Done | P1 | S4 |
| Notifications - Navigation Promotion -> Liste promo | Done | P1 | S4 |
| Notifications - Navigation Nouveauté -> new_arrivals | Done | P1 | S4 |
| Notifications - Navigation Commande -> orders | Done | P1 | S4 |
| Notifications - Navigation Paiement -> wallet | Done | P1 | S4 |
| AddAddress - Bouton enregistre avec categorie sans nom | Done | P1 | S4 |
| AddAddress - Fix zone systeme (paddingBottom: 60) | Done | P1 | S4 |
| Checkout - Moi affiche details profil inscription | Done | P1 | S4 |
| Profile - Nom cliquable vers ecran Compte | Done | P1 | S4 |
| Menu Boutique - Remplace Accueil par Profil | Done | P1 | S4 |
| Restaurant - Categories filterables (African, Burger, Healthy, Pizza) | Done | P2 | S4 |
| Restaurant - Barre de recherche fonctionnelle (nom + categorie) | Done | P2 | S4 |
| Restaurant - Filtres "Mieux notés" et "Plus rapides" | Done | P2 | S4 |
| Restaurant - Ecran Favoris avec RestaurantFavoritesContext | Done | P2 | S4 |
| Restaurant - Ecran Commandes avec RestaurantOrdersContext | Done | P2 | S4 |
| Restaurant - Bottom navigation alignee avec dashboard | Done | P2 | S4 |
| Restaurant - Header simplifie (menu gauche, favoris droite) | Done | P2 | S4 |
| Restaurant - Integration adresse checkout vers profil | Done | P2 | S4 |
| Restaurant - Fix syntax errors RestaurantHomeScreen.js | Done | P2 | S4 |

---

## Phase 2 — Wallet Core & Sync

| Tâche | Status | Priorité | Sprint |
|-------|--------|----------|--------|
| Wallet core (argent + points) | Not Started | P1 | S2 |
| Flutterwave sandbox integration | Not Started | P1 | S3 |

---

## Phase 3 — Loba & Media

| Tâche | Status | Priorité | Sprint |
|-------|--------|----------|--------|
| Loba feed v1 (vertical + cache) | Not Started | P2 | S3 |
| Media pipeline (compression + mosaïque) | Not Started | P2 | S4 |

---

## Phase 4 — Marketplace & Delivery

| Tâche | Status | Priorité | Sprint |
|-------|--------|----------|--------|
| Marketplace offline catalog | Done | P2 | S4 |
| Negotiation module (min_price rules) | Done | P2 | S5 |
| Purchase flow + SMS fallback | Done | P2 | S5 |
| Order Re-entry & Modification (cancelled orders) | Done | P2 | S5 |
| Recipient Info Popup (Not Me option) | Done | P2 | S5 |
| Order lifecycle (En cours, Livré, Annulé) | Done | P2 | S5 |
| Swap QR/Scan | Not Started | P2 | S6 |
| Courier signup & KYC | Not Started | P2 | S8 |
| Dispatch engine v1 | Not Started | P2 | S8 |
| QR & PIN validation delivery | Not Started | P2 | S9 |
| YAB-Pack builder + import | Not Started | P2 | S10 |
| Kiosk USB key flow | Not Started | P2 | S10 |

---

## Phase 5 — P2P Transports

| Tâche | Status | Priorité | Sprint |
|-------|--------|----------|--------|
| WiFi Direct P2P setup | Not Started | P2 | S6 |
| Bluetooth simple P2P (pas mesh) | Done | P2 | S7 |
| Choisir stack BLE mesh (ble-plx vs nearby) | Done | P3 | S7 |
| Bluetooth Mesh (multi-hop) | Not Started | P3 | Post-MVP |
| Mesh orchestrator POC | Not Started | P3 | Post-MVP |
| Definir mesh routing BLE (multi-hop) | Not Started | P3 | Post-MVP |

---

## Phase 6 — AI, Sécurité & Pilot

| Tâche | Status | Priorité | Sprint |
|-------|--------|----------|--------|
| AI ingest pipeline (Loba) | Not Started | P2 | S11 |
| Offline Chat | Done | P2 | S3 |
| KMS & key rotation | Not Started | P1 | S12 |
| Pilot deployment (1 city) | Not Started | P2 | S12 |
