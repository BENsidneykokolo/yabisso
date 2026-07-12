# PROBLÈMES ET SOLUTIONS — YABISSO BUSINESS

## Template (à copier pour chaque nouveau bug)
```
### BUG-XXX — [Titre court]
- **Date** : YYYY-MM-DD
- **Problème** : Description claire
- **Cause** : Cause technique
- **Solution** : Ce qui a été fait
- **Statut** : ✅ Résolu | 🔄 En cours | ❌ Bloquant
```

---

## Bugs résolus (UI / Setup)

### BUG-001 — WatermelonDB adapter import introuvable
- **Date** : 2026-02
- **Problème** : `Unable to resolve @nozbe/watermelondb/adapters/sqlite/makeExpoSQLiteAdapter`
- **Solution** : Utiliser `SQLiteAdapter` via `@nozbe/watermelondb/adapters/sqlite`
- **Statut** : ✅ Résolu

### BUG-002 — Dev client "Unable to load script"
- **Date** : 2026-02
- **Problème** : Écran blanc sur le téléphone
- **Solution** : Lancer `npx expo start --dev-client` + même WiFi
- **Statut** : ✅ Résolu

### BUG-005 — Erreur KSP/Kotlin sur build Android
- **Date** : 2026-02-28
- **Problème** : Build échoue avec erreur KSP/Kotlin
- **Solution** : Forcer Kotlin 2.1.21 via `expo-build-properties`
- **Statut** : ✅ Résolu

### BUG-006 — Conflit minSdkVersion
- **Date** : 2026-03-13
- **Problème** : minSdkVersion incompatible
- **Solution** : Passage à minSdkVersion 24
- **Statut** : ✅ Résolu

### BUG-009 — withObservables doesn't exist
- **Date** : 2026-03-20
- **Problème** : Crash avec WatermelonDB
- **Solution** : Installation @nozbe/with-observables + rxjs
- **Statut** : ✅ Résolu

---

## Risques connus

| Risque | Niveau | Mitigation |
|--------|--------|------------|
| Réseau instable | 🔴 Critique | Offline-first |
| Appareils bas de gamme | 🟡 Modéré | RAM < 150MB, pagination |
