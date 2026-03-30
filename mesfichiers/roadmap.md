# ROADMAP

## Phases principales
PHASE 1 : ONLINE + SMS FALLBACK + UI (MVP)
PHASE 2 : WI-FI DIRECT (P2P GROS VOLUME)
PHASE 3 : BLUETOOTH SIMPLE (P2P)
PHASE 4 : MARKETPLACE + DELIVERY + KIOSQUES
PHASE 5 : AI + SCALE
PHASE 6 : POLISH + SECURITY + PILOT

## Plan 16 semaines (resume)
S1: setup + design system + local storage (risque EAS/keystore)
S2: signup online + OTP + PIN + SMS fallback (risque permissions SMS)
S3: SyncEngine + DB encryption (risque migrations)
S4: wallet + QR offline + Bluetooth simple + Flutterwave (risque nonce duplication)
S5: Loba feed (risque memory leaks)
S6: marketplace (risque conflits stock)
S7: delivery (risque fiabilite push)
S8: chat + notifications (risque realtime sync)
S9-S12: packs, WiFi Direct, kiosque, security/testing
S13-S16: reservations, services, admin console, Play Store launch

##Etat actuel (verifie dans le code) - Mars 2026
- UI onboarding/auth: Welcome, Language, Signup, Login, SMS, QR, Offline Login complet
- Dashboard/Home + pages QR/Settings/Notifications
- Pages: Wallet (conversion FCFA/Points), Assistant IA (Réécrit), Profil + sous-pages
- Wallet: Recharge, Envoyer (PIN/QR/Scan), Recevoir (Request/Scan), Historique.
- Mode Points: conversion dynamique (1:1), saisie FCFA et affichage Points temps-réel intégrés.
- Offline choix SMS/QR: modal active quand offline (NetInfo)
- Schema DB local: profiles, sync_queue, signup_nonces, signup_verifications
- Service offline signup: generation payload + enqueue SyncQueue (connecté à l'UI)
- Bluetooth Low Energy (BLE) intégré
- Configuration Build Android local : Résolution NDK/SDK via `local.properties`
- Marketplace complet: Home, ProductList, ProductDetails, Cart, Checkout, Orders, etc.
- Notifications fonctionnel: navigation vers produits promo, nouveautés, commandes, wallet
- AddAddress: geolocalisation + categories sans necessite de nom
- Profil: Nom cliquable vers ecran Compte avec details inscription
- Menu Boutique: "Accueil" remplacé par "Profil"
- **Universal Offline-First integration completed** for Marketplace, Wallet, Loba, and AI Assistant.
- **SellerContactScreen**: Ecran de contact vendeur (appeler, WhatsApp, email, adresse)
- **RestaurantSellerScreen**: Creation restaurant virtuel (nom, catégorie, livraison, plats)
- **Restaurant Menu**: Menu popup style Marketplace (gauche)
- **Nom boutique dynamique**: Charge depuis SecureStore sur tous les ecrans parcours achat
- **Migration WatermelonDB (Marketplace)**: Migration complète (Profil Vendeur, Nouveautés, Accueil) pour une gestion offline performante et réactive.
- **Validation Kiosque (Produits)**: Système de validation officielle par QR Code (Vendeur -> Kiosque) pour activer la visibilité publique.

## Marketplace - Sprint 4 & 5 (COMPLETED)
- Marketplace: Home, Product List, Category Page, Product Details
- Cart, Checkout, Order Status, Delivery Tracking, Orders History
- Seller Comparison, Blocked User Screen
- CartContext & OrderContext: state management complet
- Branchements: parcours complet marketplace (achat, négociation, cycle de vie) implemente
- **Favoris**: Système de favoris avec stockage SecureStore, écran Favoris fonctionnel
- **Comparaison de prix**: Affichage du même produit par plusieurs vendeurs (prix, état, livraison, localisation)
- **Confirmation réception**: Modal avec commentaire texte + jusqu'à 3 photos pour confirmer/signaler commande
- **SellerProfile**: Onglet "Avis" supprimé (mockups retirés)

## Roadmap agile (vue condensee)
Phase 1 — Online + SMS Fallback + UI (MVP)
- Objectif: Demarrer en mode online, ajouter SMS fallback, livrer UI de base.
- Livrables: auth online, SMS fallback (signup/confirmation), UI de base, DB locale, sync queue minimale, marketplace complet logic.

Phase 2 — Wi-Fi Direct
- Objectif: Activer les transferts locaux gros volume via Wi-Fi Direct.
- Livrables: flux P2P Wi-Fi Direct, sync locale, tests de transferts.

Phase 3 — Bluetooth
- Objectif: Ajouter Bluetooth (P2P simple puis mesh plus tard si besoin).
- Livrables: Bluetooth P2P simple, fallback transport, tests inter-device.

Phase 4 — Marketplace + Delivery + Kiosques
- Buy & Sell offline catalogs, negociation, achats (wallet & Flutterwave), SMS fallback purchase.
- Courier app, dispatch engine, QR/PIN validation, kiosk USB flows, YAB-Pack builder + import.

Phase 5 — AI & Ingest + Scale
- Pipeline AI ingest Loba, moderation, packs automatiques, recommandations avancees.

Phase 6 — Polish, Security, Pilot & Rollout
- KMS/CRL, rotation de cles, performance, scale infra, pilote ville, iteration.

## Sprints detailles (extraits)
Sprint 0 — Setup (env)
- Repo initialise + EAS config. DoD: build Android OK.
- Supabase project + schema minimal. DoD: endpoint test 200.
- Design system tokens + composants base. DoD: preview/Storybook.

Sprint 1 — Online + SMS fallback + UI
- Auth online (OTP). DoD: signup/login online ok.
- SMS fallback (signup/confirmation). DoD: SMS chiffre vers Main Admin + PIN retour.
- UI base. DoD: flow login/signup + screens de base.
- Secure Local DB. DoD: SQLite chiffre, schemas users/content/wallet/orders.

Sprint 2 — Wallet core & Sync queue
- Wallet basic (argent + points). DoD: ledger local, top-up dev hook, historique, conversion 1:1. (Statut: UI/Logic Done)
- Sync Engine & Connectivity. DoD: detection reseau, enqueue jobs.

Sprint 3 — Flutterwave & Loba basic
- Flutterwave sandbox. DoD: depot ok, credit wallet.
- Loba feed v1. DoD: feed vertical, lecture locale/hot, like/comment.

Sprint 4 — Media pipeline & marketplace v1
- Compression + mosaique. DoD: thumbnails + collage.
- Marketplace offline. DoD: list items offline, detail produit, panier.

Sprint 5 — Negociation & Purchase paths
- Negociation module. DoD: rules engine min_price, accept -> order create.
- Purchase + SMS fallback. DoD: achat wallet; offline -> SMS; auto-reply OK.

Sprint 6 — Wi-Fi Direct basics
- Wi-Fi Direct P2P. DoD: session P2P, transfert petit payload, retry.
- Swap QR/Scan. DoD: QR, scan, session, deltas via Wi-Fi Direct.

Sprint 7 — Bluetooth basics
- Bluetooth P2P simple. DoD: handshake, send/receive payload petit.
- Fallback transport. DoD: priorite Wi-Fi Direct -> Bluetooth -> SMS.

Sprint 8 — Delivery core
- Courier signup & KYC. DoD: inscription, docs, admin approve.
- Dispatch engine v1. DoD: candidats -> push -> accept/reassign.

Sprint 9 — Delivery validation & payouts
- QR & PIN validation. DoD: tokens signes, scan/entry, verify local, payout ledger.

Sprint 10 — YAB-Pack & Kiosk USB
- YAB-Pack builder. DoD: bundle, sign, export .yab.zip.
- Kiosk USB key flow. DoD: OTG detect, unlock, import pack, record sales.

Sprint 11 — AI ingest & moderation
- AI Ingest Job. DoD: job admin, fetcher API demo, moderation/tag, publish LOBA.

Sprint 12 — Security & Pilot prep
- KMS & Key rotation. DoD: Vault installed, sign/verify, CRL enforced.
- Pilot deployment. DoD: pilote 1 ville, kiosques/couriers actifs.

## Backlog Trello (CSV)
Colonne: Name, Description, Labels, Sprint, Checklist (separateur ; pour checklist items)
Name,Description,Labels,Sprint,Checklist
Env setup - React Native + Antigravity AI + EAS,"Init repo, configure EAS, test build on Android","setup,sprint0","Sprint 0","Init repo;Install RN;Configure EAS;Test build on device"
Auth Offline - SMS Signup,"Offline signup form; compose encrypted SMS to MainAdmin; auto-read PIN; CGU confirmation","auth,offline","Sprint 1","UI form;Compose & send SMS;Auto-read SMS;Validate PIN;Send CGU confirmation"
Secure Local DB (SQLite encrypted),"Schema users,content,wallet,orders; implement encrypted SQLite access layer","core","Sprint 1","Define schema;Implement encrypted DB;CRUD methods;Unit tests"
Wallet Core (argent + points),"Local ledger, display balances, tx history; points logic; swap basic","wallet","Sprint 2","Model wallet;Ledger entries;UI pages;Unit tests"
Integrate Flutterwave,"Sandbox integration, deposit flow, webhook handling, credit wallet","payments","Sprint 3","Get API keys;Implement deposit flow;Webhook handler;End-to-end test"
LOBA Feed v1,"Vertical feed, local caching, like/comment, interest tags (mock data)","loba","Sprint 3","Feed UI;Player;Caching;Like/comment"
Media Pipeline - compression & mosaic,"Image compression, mosaic (max6), SD priority","media","Sprint 4","Implement compression;Mosaic generator;SD detection;Integration test"
Marketplace - Offline Catalog,"List products offline, show 2 visuals (main + mosaic), search basic","marketplace","Sprint 4","Listing UI;Offline cache;Mosaic images;Search"
Negotiation Module (chatbot rules),"Chat UI for negotiation, rules engine respecting min_price, accept triggers purchase","marketplace,ai","Sprint 5","Chat UI;Rules Engine;Accept flow;Tests"
Purchase Flow + SMS Fallback,"Buy via wallet/Flutterwave; offline path generates encrypted SMS to main admin; auto-reply handling","orders,offline","Sprint 5","Create order;Wallet pay;SMS send;Admin auto-reply;Client auto-read"
Swap - QR & Scan,"Swap screen: generate QR, scan, 'Etre visible', delta selection by interests","swap,offline","Sprint 6","Swap UI;QR gen;Scan flow;Delta selector;E2E test"
Mesh Orchestrator POC,"BLE Mesh micro-deltas POC; small payload relay between devices","mesh,infra","Sprint 6","Implement mesh lib;Relay small payload;Test in lab"
Courier Signup & KYC,"Courier registration, docs upload, zones selection, admin approval","delivery","Sprint 7","Signup UI;Upload docs;Admin review;Approve"
Dispatch Engine v1,"Order assignment algorithm (proximity, zones, history); push notif; reassign on reject","delivery","Sprint 7","Scoring function;Candidates endpoint;Push notif;Reassign logic"
QR & PIN Validation,"Order token signed, QR/PIN generation & local verify, courier scan UI, photo proof optional","delivery,security","Sprint 8","Token generator;QR gen;Courier scanner UI;Local verify;Sync event"
YAB-Pack Builder & Import,"Admin pack builder: zstd->encrypt->sign->merkle; import & verify in app","packs,admin","Sprint 9","Pack UI;Sign & encrypt;Import verify;Worker tests"
Kiosk USB Key Flow,"Provision vendor key, OTG detection, vendor login, transfer content, wallet recharge via USB","kiosk,usb","Sprint 9","Provision key;OTG detect;Password unlock;Transfer test;Reconcile sales"
AI Ingest Job - LOBA,"Admin creates ingest jobs; fetchers; staging; moderation; publish to LOBA","ai,ingest","Sprint 10","Ingest UI;Fetcher agent;Staging;Moderation;Publish"
KMS & Key Rotation,"Vault/KMS setup, Ed25519 keys, rotation, CRL endpoints","security","Sprint 11","Install Vault;Create keys;Rotation script;CRL endpoint;Integration tests"
Pilot Deployment - City A,"Pilot with kiosks and couriers, collect metrics, iterate","pilot","Sprint 11","Deploy kiosks;Recruit couriers;Run pilot;Collect feedback;Fix issues"
