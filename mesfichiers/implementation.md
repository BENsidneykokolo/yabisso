# IMPLEMENTATION — YABISSO BUSINESS

## Stack et libraries (installées)
- Expo SDK 54
- expo-dev-client
- expo-build-properties
- WatermelonDB + SQLiteAdapter
- expo-sqlite
- expo-secure-store
- NetInfo

## Stack planifiée (à installer)
- Supabase (Auth + RLS + Edge Functions)
- React Navigation
- Zustand

## Apps Yabisso Business à implémenter

### 1. Yabisso Kassa
- Terminal de caisse / point de vente
- Scanner codes-barres / QR
- Gestion stock
- Rapports de vente

### 2. Employé
- Liste des employés
- Planning / horaires
- Pointage
- Paie

### 3. Mon App
- Profil utilisateur
- Paramètres
- Historique

### 4. Yabisso Admin Dashboard ("Travail")
- Vue d'ensemble business
- Statistiques
- Gestion multi-apps

### 5. Yabisso Hotel
- Chambres / disponibilité
- Réservations
- Clients
- Tarifs

### 6. Restaurant
- Menu / carte
- Commandes
- Cuisine
- Livraison

### 7. CRM
- Contacts clients
- Suivi interactions
- Pipeline ventes
- Rappels

### 8. École
- Élèves / classes
- Notes / bulletins
- Emploi du temps
- Parents

### 9. Facture
- Création factures
- Envoi PDF
- Suivi paiements
- Relances

### 10. Compta
- Écritures comptables
- Balance
- Grand livre
- Rapprochement

### 11. Dépense
- Saisie dépenses
- Catégories
- Budgets
- Rapports

## État d'implémentation
- UI onboarding/auth: Welcome, Language, Signup, Login
- Dashboard/Home avec navigation vers les apps

## Offline-first
- Écrire d'abord dans WatermelonDB
- Ajouter à SyncQueue si offline
- Sync quand internet revient
- Ne jamais bloquer l'utilisateur

## Permissions Android (si nécessaire)
- INTERNET
- ACCESS_NETWORK_STATE
- CAMERA (pour scanner)
