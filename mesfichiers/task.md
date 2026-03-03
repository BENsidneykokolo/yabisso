# TASK MANAGER

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
| Fix WatermelonDB adapter import (SQLiteAdapter) | Done | P1 | S0 |
| Local storage init (WatermelonDB + SecureStore) | Done | P1 | S0 |
| Design system de base (YScreen/YText/YButton/YInput) | Not Started | P1 | S0 |
| UI base (login/signup + screens de base) | In Progress | P1 | S1 |
| Creer structure dossiers complete | Done | P1 | S0 |
| Signup online (Supabase OTP) | Not Started | P1 | S1 |
| SMS fallback automatique (user/super admin) | In Progress | P1 | S1 |
| Configuration SMS (Africa's Talking) | Not Started | P1 | S1 |
| Definir stack SMS fallback (Android only) | Done | P1 | S1 |
| Configurer permissions BLE/WiFi/SMS Android | In Progress | P1 | S1 |
| Offline Signup (flow complet) | In Progress | P1 | S1 |
| QR kiosque (scan/validate) | Not Started | P1 | S1 |
| Auth kiosque offline (QR activation locale) | Not Started | P1 | S1 |
| Secure local DB (SQLite chiffré) | Not Started | P1 | S1 |
| Schema SQL Supabase complet | Not Started | P1 | S1 |
| RLS policies + audit_log insert-only | Not Started | P1 | S1 |
| SyncEngine + conflictResolver | Not Started | P1 | S2 |
| Supabase Sync minimal | Not Started | P1 | S2 |

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
| Marketplace offline catalog | Not Started | P2 | S4 |
| Negotiation module (min_price rules) | Not Started | P2 | S5 |
| Purchase flow + SMS fallback | Not Started | P2 | S5 |
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
| Bluetooth simple P2P (pas mesh) | Not Started | P2 | S7 |
| Choisir stack BLE mesh (ble-plx vs nearby) | Not Started | P3 | S7 |
| Bluetooth Mesh (multi-hop) | Not Started | P3 | Post-MVP |
| Mesh orchestrator POC | Not Started | P3 | Post-MVP |
| Definir mesh routing BLE (multi-hop) | Not Started | P3 | Post-MVP |

---

## Phase 6 — AI, Sécurité & Pilot

| Tâche | Status | Priorité | Sprint |
|-------|--------|----------|--------|
| AI ingest pipeline (Loba) | Not Started | P2 | S11 |
| Offline Chat | Not Started | P2 | S3 |
| KMS & key rotation | Not Started | P1 | S12 |
| Pilot deployment (1 city) | Not Started | P2 | S12 |
