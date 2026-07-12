# YABISSO BUSINESS — ARCHITECTURE

## Stack technique
- React Native + Expo SDK 54
- EAS CLI
- WatermelonDB + SQLiteAdapter
- expo-secure-store

## Apps Yabisso Business
1. **Yabisso Kassa** — Terminal de caisse / point de vente
2. **Employé** — Gestion des employés
3. **Mon App** — App personnelle / profil
4. **Yabisso Admin Dashboard** ("Travail") — Dashboard admin
5. **Yabisso Hotel** — Gestion d'hôtels
6. **Restaurant** — Gestion de restaurants
7. **CRM** — Gestion de la relation client
8. **École** — Gestion scolaire
9. **Facture** — Gestion des factures
10. **Compta** — Comptabilité
11. **Dépense** — Gestion des dépenses

## Architecture en couches

### 1) Mobile App Layer
React Native + Expo (EAS CLI)
- Auth Screens (Welcome, Language, Signup, Login)
- Dashboard / Home
- Navigation vers chaque app

### 2) Offline Core Engine
- Stockage local WatermelonDB
- SyncQueue pour actions offline
- Connexion internet si disponible

### 3) Local Database (Source of Truth)
Chaque téléphone contient les données locales
- Profiles
- Données par app (factures, dépenses, etc.)

### 4) Navigation
- RootNavigator (Auth ou App)
- AuthNavigator
- AppNavigator (Dashboard → chaque app)

## Structure projet
```
app/
├── src/
│   ├── features/
│   │   ├── onboarding/screens/
│   │   ├── auth/screens/
│   │   ├── home/screens/        (Dashboard)
│   │   ├── kassa/screens/       (Yabisso Kassa)
│   │   ├── employe/screens/     (Employé)
│   │   ├── hotel/screens/       (Yabisso Hotel)
│   │   ├── restaurant/screens/  (Restaurant)
│   │   ├── crm/screens/         (CRM)
│   │   ├── ecole/screens/       (École)
│   │   ├── facture/screens/     (Facture)
│   │   ├── compta/screens/      (Compta)
│   │   ├── depense/screens/     (Dépense)
│   │   ├── admin/screens/       (Admin Dashboard)
│   │   └── profil/screens/      (Mon App)
│   ├── lib/
│   │   ├── db/                  (WatermelonDB)
│   │   └── secureStore/
│   └── components/
```

## Règles non négociables
- Offline-first
- Chaque app gère ses propres données
- Stockage local avant sync cloud
- Interface en français
