# YABISSO ARCHITECTURE

## Global System Architecture (Final)
References:
- https://media-website-strapi-uploads.s3.eu-west-1.amazonaws.com/Offline_App_Layered_Architecture_b74fe8d5f2.png
- https://miro.medium.com/v2/resize%3Afit%3A1200/1%2AsWGbyQ1tlbugFnr-nRGRCw.png
- https://miro.medium.com/v2/resize%3Afit%3A1400/0%2A_o_aYSx36Am_sjH5.png

## Stack technique
React Native + Expo SDK 54 (dev client / prebuild pour modules natifs)
EAS CLI
WatermelonDB + SQLCipher
Supabase (Auth + RLS + Edge Functions)

## Etat mise en oeuvre (verifie dans le code)
- Onboarding: `app/src/features/onboarding/screens/WelcomeScreen.js`
- Langue: `app/src/features/onboarding/screens/LanguageScreen.js`
- Signup UI: `app/src/features/auth/screens/SignupScreen.js`
- Signup SMS UI: `app/src/features/auth/screens/SmsSignupScreen.js`
- Signup QR UI: `app/src/features/auth/screens/QrSignupScreen.js`
- Modal offline SMS/QR: `app/src/features/auth/components/OfflineSignupChoiceModal.js`
- Wallet: `app/src/features/wallet/screens/WalletScreen.js` (FCFA/Points mode)
- Wallet Recharge: `app/src/features/wallet/screens/RechargeScreen.js`
- Wallet Send: `app/src/features/wallet/screens/SendScreen.js` + sub-screens
- Wallet Receive: `app/src/features/wallet/screens/ReceiveScreen.js` + sub-screens
- Wallet History: `app/src/features/wallet/screens/HistoryScreen.js`
- DB locale WatermelonDB: `app/src/lib/db/schema.ts` (Schéma v6: tables profiles, products, wallet_transactions, loba_posts, assistant_messages)

## Principes offline-first
L'app doit fonctionner sans internet.
Toutes les actions sont ecrites dans WatermelonDB d'abord.
Si offline, on ajoute a SyncQueue.
Au retour du reseau, SyncEngine synchronise vers Supabase.
Ne jamais bloquer l'utilisateur a cause du reseau.

## Vision systeme
Yabisso est un noeud financier portable offline-first.
Chaque telephone agit comme un terminal autonome:
- Ledger local append-only
- Escrow universel offline
- Reputation offline deterministe
- KYC progressif (niveaux 0 a 3)

## 5 rails de communication
1) QR Code (proximite, signature Ed25519)
2) SMS Fallback (payload chiffre/compresse)
3) Bluetooth Mesh (reseau local)
4) WiFi Direct (gros volumes, sync kiosque)
5) Internet (sync globale, audit, backup)

## Communication (stack open source)
Option A (recommande): react-native-ble-plx + mesh custom
Option B: expo-nearby-connections seul (pas de vrai mesh)
Option C: ble-plx (mesh) + nearby-connections (WiFi Direct)
Note: pas de vrai mesh automatique open source type Bridgefy; mesh a construire.
Demarrage: SMS fallback + local storage, puis BLE mesh (leger), puis WiFi Direct (lourd).
Phase 1: Bluetooth simple (pas de mesh) pour QR/P2P, mesh reporte.

## Kiosque
Noeud physique pour cash-in/out, update offline, validation locale.
CRL locale + cle USB vendeur pour securite.

## Architecture en couches

### 1) Mobile App Layer
React Native + Expo (EAS CLI)
Interface utilisateur:
Auth Screens
Chat
Wallet
E-commerce
Services
QR Scanner
Offline Indicator

### 2) Offline Core Engine
Le vrai backend = le telephone
Offline Signup
Offline Login
Offline Chat
Offline Payment
Local Wallet
Local Auth Tokens
Transaction Signing
Sync Queue
Toutes les actions sont executees localement d'abord, internet ensuite si disponible.

### 3) Local Database (Source of Truth)
Chaque telephone contient:
Users
Wallet
Transactions
Orders
Products
Offline Tokens
Pending Sync Queue
Meme sans internet, payer, chatter, s'inscrire, envoyer argent reste possible.

### 4) P2P Communication Layer
Communication telephone <-> telephone:
WiFi Direct Manager
Bluetooth Manager
QR Transfer Manager
SMS Fallback Manager

## Structure projet
Chaque module dans src/features/ avec:
- screens/
- services/
- hooks/
- components/
Libs partages dans src/lib/ (supabase, syncEngine, conflictResolver, crypto, sms).
Navigation:
- RootNavigator (Auth ou App)
- AuthNavigator
- AppNavigator (Accueil, Loba, Marche, Chat, Profil)
Regle: exports nommes uniquement.

### Priorite de transmission
Quand User A envoie une donnee a User B:
Attempt WiFi Direct
If fail -> Bluetooth
If fail -> SMS
If Internet Available -> Cloud

### Priorite Signup (Phase 1)
Online -> SMS fallback -> QR kiosque -> Bluetooth simple

### SMS Fallback System
Utilise si:
- vieux telephone
- WiFi Direct indisponible
- Bluetooth OFF
Processus:
- Encrypt Data
- Compress Data
- Encode Payload
- Split SMS if needed
- Envoi SMS automatique vers super admin
- App super admin scanne et valide
- Envoi SMS OTP automatique vers user
- App user scanne et valide automatiquement
- Store locally
- Add to Sync Queue

### QR Kiosque (Offline Signup)
Utilise si:
- user offline sans SMS
- presence d'un vendeur kiosque
Processus:
- App user genere QR (payload signe)
- App kiosque scanne et valide
- Creation profil local (validated_by_kiosk)
- ACK + verification_token
- User passe actif localement

### Sync Engine
Quand internet revient:
Detect Connection
Read Sync Queue
Compare Local vs Cloud
Push Pending Data
Resolve Conflicts
Confirm Transactions
Update Local Database

### Etats Profil (Offline Signup)
pending -> validated_by_kiosk -> active

### Sync Rules (Profil)
- pending: pas de creation serveur tant que non valide
- validated_by_kiosk: creation profil cote serveur a la reconnexion
- active: acces complet local, reconciliation au sync

### Cloud Layer
Supabase intervient uniquement pour:
Online Authentication
Cloud PostgreSQL Storage
Transaction Validation
Backup
Push Notifications
Multi-device Sync
Pas utilise pendant Offline Mode.

## Global Flow
Internet Available ?
No -> Offline Engine
P2P Transmission
WiFi -> Bluetooth -> SMS
Stored Locally
Sync Queue
Internet Back ?
Yes -> Supabase Sync
Confirmed

## APK Build
Sans Android Studio:
eas build -p android --profile preview

## Description globale complete (version enrichie)
### Vision & concept
Yabisso est une super-app africaine offline-first qui regroupe les services essentiels du quotidien dans une seule application (commerce, divertissement, formation, paiement, livraison, mobilite, restauration, reservation, etc.).
Objectifs:
- Reduire le besoin d'Internet (cache local, compression, SMS fallback).
- Creer un ecosysteme economique inclusif (vendeurs, livreurs, prestataires, formateurs).
- Offrir une experience fluide et intelligente (recommandations basees sur les centres d'interet).

### Services integres (modules)
- Buy & Sell: marketplace offline, 2 images max par article (1 principale + mosaique <= 6), negociation via chat avec prix minimum vendeur.
- Loba: reseau social video, lecture en boucle, priorisation par interets, ingestion admin.
- Services freelance, restaurants & delivery, reservation restaurant, hotels, appartements/maisons, transport taxi/bus, billets avion.
- Streaming films/series, musique, formation & cours, pari sportif, notebook.
- Chatbot (assistant AI natif).
- Yabisso Pay (wallet): P2P, paiements services, recharge, cashback points, MTN/Airtel/PayPal/cartes/Flutterwave.
  - Mode double-devise: FCFA et Points (conversion 1 FCFA = 1 Point).
  - Saisie en FCFA avec conversion temps réel en Points en mode "Points".
- Swap: echange de packs Yabisso.
- Livraison interne (Yabisso Delivery) + livraison externe.

### Authentification & securite
- Signup offline: nom, numero (SMS si offline), pays, mot de passe.
- Verification par SMS chiffre au Main Admin -> PIN de retour -> activation automatique.
- Acceptation CGU transmise et enregistree via SMS chiffre.
- Chiffrement on-device pour cache local et SMS.
- Seule l'app peut lire/decrypter les SMS du Main Admin.

### Fonctionnement offline & mesh
- Cache compresse ultra-optimise.
- Suppression automatique des annonces obsoletes aux mises a jour.
- SMS fallback pour verification produit, inscription, commandes.
- Mesh pour synchronisation P2P entre utilisateurs proches.

### Intelligence & automatisation
- AI Admin: ingestion videos, scraping donnees publiques, moderation, tagging, recommandations.
- Dynamic Pricing Chat pour negociation.

### Experience utilisateur
- Pages globales unifiees (Contact, A propos, FAQ) avec selection de service.
- Notifications intelligentes (contenu, reponses vendeurs, confirmations).
- Mise en avant du cote humain (chat de negociation, suggestions interactives).

## Diagramme d'architecture global (simplifie)
Copie-colle dans un editeur monospace pour garder l'alignement.
--------------------------------------------------------------------------------
YABISSO — ARCHITECTURE GLOBALE (resume)
Acteurs: User Mobile | Kiosk Mobile | Kiosk USB Key | Courier App | Super Admin

FRONTENDS
  Mobile App (React Native) -- Kiosk App -- Courier App -- Admin Web/Mobile
  - Services, recherche globale, settings, MAJ offline

APP CORE (on-device)
  - SQLite chiffre, media pipeline, interest engine
  - Auth offline SMS, Swap Controller, SMS auto-scan
  - Sync Queue (mesh / Wi-Fi Direct / USB / cloud)

SYNC & TRANSPORT
  - BLE Mesh (micro-deltas)
  - Wi-Fi Direct (gros transferts)
  - USB-OTG (kiosque keys)
  - SMS Gateway Adapter (tokens chiffres)

CLOUD BACKEND (microservices)
  API Gateway/Auth, User, Content, Wallet, Orders/Booking, Delivery
  Pack Builder, Media Processing, AI Ingest/Moderation, Messaging Bot
  Kiosk Mgmt, Notifications, Analytics/Fraud/Audit

INTEGRATIONS
  Payments (Flutterwave/MTN/Airtel/PayPal), Object Storage, CDN
  Queue/Workers, Key Manager (Vault/KMS), SMS Gateway
--------------------------------------------------------------------------------

## PlantUML (architecture globale)
@startuml
title Yabisso - Architecture Globale (Offline-first)
actor "User Mobile" as User
actor "Kiosk Mobile" as Kiosk
actor "Kiosk USB Key" as USBKey
actor "Courier App" as Courier
actor "Super Admin" as Admin

package "Frontends" {
  [Mobile App\n(React Native)] as Mobile
  [Kiosk App\n(Mobile)] as KioskApp
  [Courier App\n(Mobile)] as CourierApp
  [Admin Console\n(Web/Mobile)] as AdminUI
}

User --> Mobile
Kiosk --> KioskApp
USBKey --> KioskApp
Courier --> CourierApp
Admin --> AdminUI

package "App Core (on-device)" {
  [SQLite encrypted\nMedia pipeline\nInterest Engine\nSwap Controller\nSMS auto-scan\nSync Queue] as AppCore
}

Mobile --> AppCore
KioskApp --> AppCore
CourierApp --> AppCore

package "Sync & Transport" {
  [BLE Mesh Orchestrator] as Mesh
  [Wi-Fi Direct] as WiFiDirect
  [USB-OTG] as USBOTG
  [SMS Gateway Adapter] as SMS
}

AppCore --> Mesh
AppCore --> WiFiDirect
AppCore --> USBOTG
AppCore --> SMS

package "Cloud Backend" {
  [API Gateway / Auth] as APIG
  [User Service] as UserSvc
  [Content Service] as ContentSvc
  [Wallet Service (argent+points)] as WalletSvc
  [Orders & Booking] as OrdersSvc
  [Delivery Engine] as DeliverySvc
  [Pack Builder (YAB-Pack)] as PackSvc
  [Media Processing] as MediaSvc
  [AI Ingest & Moderation] as AISvc
  [Messaging & Negotiation Bot] as MsgSvc
  [Kiosk Mgmt] as KioskSvc
  [Notifications (Push + SMS)] as NotifSvc
  [Analytics & Fraud] as AnalyticsSvc
}

AppCore --> APIG
Mesh --> APIG
WiFiDirect --> APIG
USBOTG --> APIG
SMS --> APIG

APIG --> UserSvc
APIG --> ContentSvc
APIG --> WalletSvc
APIG --> OrdersSvc
APIG --> DeliverySvc
APIG --> PackSvc
APIG --> MediaSvc
APIG --> AISvc
APIG --> MsgSvc
APIG --> KioskSvc
APIG --> NotifSvc
APIG --> AnalyticsSvc

package "Integrations" {
  [Object Storage (S3/MinIO)] as S3
  [Queue / Workers (Kafka/RabbitMQ)] as Queue
  [Key Manager (Vault/KMS)] as KMS
  [Payments (Flutterwave, MTN, Airtel, PayPal)] as Payments
  [CDN] as CDN
}

MediaSvc --> S3
PackSvc --> S3
WalletSvc --> Payments
ContentSvc --> CDN
AnalyticsSvc --> Queue
APIG --> KMS
AdminUI --> AISvc
AISvc --> MediaSvc
PackSvc --> APIG
@enduml

## Notes critiques
- SMS: uniquement tokens legers (signup, confirmation, OTP), pas de medias.
- QR/PIN: tokens signes Ed25519, verifiables offline puis sync.
- Swap: delta selectionne selon interets; petits deltas via Mesh, gros via Wi-Fi Direct/USB.
