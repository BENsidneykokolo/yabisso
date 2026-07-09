# PROJECT MEMORY — YABISSO BUSINESS

## Version courante (vérifiée dans le code)
| Composant | Version | Statut |
|-----------|---------|--------|
| Expo SDK | 54 | ✅ Installé |
| React Native | via Expo SDK 54 | ✅ Installé |
| EAS config (eas.json + projectId) | présent | ✅ Configuré |
| expo-dev-client | ^6.0.20 | ✅ Installé |
| expo-build-properties | ~1.0.10 | ✅ Installé |
| WatermelonDB | ^0.28.0 | ✅ Installé |
| SQLiteAdapter | via WatermelonDB | ✅ Configuré |
| expo-sqlite | ^16.0.10 | ✅ Installé |
| expo-secure-store | ^15.0.8 | ✅ Installé |
| NetInfo | ^12.0.1 | ✅ Installé |

## Apps Yabisso Business (11 apps)
| # | App | Description |
|---|-----|-------------|
| 1 | **Yabisso Kassa** | Terminal de caisse / point de vente |
| 2 | **Employé** | Gestion des employés |
| 3 | **Mon App** | App personnelle / profil utilisateur |
| 4 | **Yabisso Admin Dashboard** ("Travail") | Dashboard administrateur |
| 5 | **Yabisso Hotel** | Gestion d'hôtels |
| 6 | **Restaurant** | Gestion de restaurants |
| 7 | **CRM** | Gestion de la relation client |
| 8 | **École** | Gestion scolaire |
| 9 | **Facture** | Gestion des factures |
| 10 | **Compta** | Comptabilité |
| 11 | **Dépense** | Gestion des dépenses |

## État actuel
- UI onboarding/auth: Welcome, Language, Signup, Login
- Dashboard/Home avec navigation vers les apps
- Apps en cours de développement

## Principes fondamentaux
- Offline-first non négociable
- Expérience identique online/offline
- Toute action écrite localement avant sync

## Décisions
- Yabisso Business = suite d'apps professionnelles
- Chaque app est un module séparé
- Stack commune: Expo + WatermelonDB + SecureStore

## Historique avancement
- Sprint 0: Setup Expo + WatermelonDB + dev client
- Sprint 1: UI onboarding/auth (Welcome, Language, Signup, Login)
- Sprint 1: Dashboard + navigation vers les apps

