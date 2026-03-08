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
| expo-camera | ~17.0.5 | ✅ Installe |
| expo-image-picker | ~16.0.10 | ✅ Installe |
| expo-document-picker | ~13.0.6 | ✅ Installe |
| expo-location | ~19.0.10 | ✅ Installe |
| expo-contacts | ~14.0.6 | ✅ Installe |
| expo-av | ~16.0.5 | ✅ Installe |
| expo-barcode-scanner | - | ✅ Installe |
| expo-file-system | ~19.0.6 | ✅ Installe |
| expo-constants | ~18.0.5 | ✅ Installe |
| Supabase | - | 🔄 A installer |
| React Navigation | - | 🔄 A installer |
| Zustand | - | 🔄 A installer |
| BLE/WiFi Direct libs | - | ⏳ Phase 2-3 |

**Build dev client Android** : 🔄 A revalider (nouvelles dependances natives installees)
**iOS** : Simple (Expo Go suffit pour Phase 1)
**DB locale** : WatermelonDB + SQLiteAdapter (SQLCipher prevu pour chiffrement)

##Etat actuel (verifie dans le code)
- UI onboarding/auth: Welcome, Language, Signup, Login, SMS, QR
- Dashboard/Home + pages QR/Settings/Notifications
- UI Wallet complet: WalletScreen, RechargeScreen, SendScreen, ReceiveScreen, HistoryScreen
- Bottom navigation wallet avec navigation et etat actif
- Pages: Assistant IA (avec menu, clavier avoidance, 6 outils), Profil + sous-pages
- Marketplace: MarketplaceHomeScreen, ProductListScreen, CategoryPageScreen, CartScreen, CheckoutScreen
- Menu lateral dans Marketplace (hamburger icon) avec: Favoris, Historique, Parametres, Aide
- Notifications screen pour Marketplace
- Services ajoutes: Restaurant (home, details, item details, checkout), Hotels, Services, Immobilier
- FloatingNav: bouton flottant (bottom: 120)
- Offline choix SMS/QR: modal active quand offline (NetInfo)
- Schema DB local: profiles, sync_queue, signup_nonces, signup_verifications
- Service offline signup: generation payload + enqueue SyncQueue (non connecte a l'UI)
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

## Decisions techniques additionnelles
- Navigation: React Navigation (a installer)
- Crypto: tweetnacl (Ed25519) (a installer)
- DB locale: SQLite chiffre (SQLCipher prevu)
- Connectivity: NetInfo (expo-network retire)
- Expo dev client installe
- Dev client requis (WatermelonDB modules natifs, Expo Go insuffisant)
- WatermelonDB: utiliser SQLiteAdapter (import sqlite), pas makeExpoSQLiteAdapter
- SMS fallback: react-native-get-sms-android (sendDirect) pour Android
