# PROBLÈMES ET SOLUTIONS

## Template (à copier pour chaque nouveau bug)
```
### BUG-XXX — [Titre court]
- **Date** : YYYY-MM-DD
- **Problème** : Description claire du problème
- **Cause** : Cause technique identifiée
- **Solution** : Ce qui a été fait pour résoudre
- **Étapes** :
  1. ...
  2. ...
- **Statut** : ✅ Résolu | 🔄 En cours | ❌ Bloquant
```

---

## Bugs résolus (héritage)

### BUG-001 — WatermelonDB adapter import introuvable
- **Date** : 2026-02
- **Problème** : `Unable to resolve @nozbe/watermelondb/adapters/sqlite/makeExpoSQLiteAdapter`
- **Cause** : Export `makeExpoSQLiteAdapter` n'existe pas dans la version installée
- **Solution** : Utiliser `SQLiteAdapter` via `@nozbe/watermelondb/adapters/sqlite`
- **Statut** : ✅ Résolu

### BUG-002 — Dev client "Unable to load script"
- **Date** : 2026-02
- **Problème** : Écran blanc / erreur "Unable to load script" sur le téléphone
- **Cause** : Metro non lancé ou mauvais QR / réseau WiFi différent
- **Solution** : Lancer `npx expo start --dev-client` + être sur le même WiFi ou utiliser `adb reverse tcp:8081 tcp:8081`
- **Statut** : ✅ Résolu

### BUG-003 — react-native-wifi-p2p incompatible Gradle 8
- **Date** : 2026-01
- **Problème** : Build échoue avec react-native-wifi-p2p sous Gradle 8
- **Cause** : Lib non maintenue, incompatible avec les nouvelles versions de Gradle
- **Solution** : Retirée, remplacée par expo-nearby-connections
- **Statut** : ✅ Résolu

### BUG-004 — expo-network retiré
- **Date** : 2026-01
- **Problème** : `expo-network` ne fonctionne plus comme attendu
- **Cause** : API dépréciée dans Expo SDK 54
- **Solution** : Utiliser `NetInfo` (`@react-native-community/netinfo`)
- **Statut** : ✅ Résolu

### BUG-005 — Erreur KSP/Kotlin sur build Android
- **Date** : 2026-02-28
- **Problème** : Build Android échoue avec une erreur KSP/Kotlin
- **Cause** : Version Kotlin/KSP incompatible avec les modules natifs
- **Solution** : Forcer Kotlin 2.1.21 via `expo-build-properties` + config EAS
- **Statut** : ✅ Résolu

---

## Risques connus à surveiller

| Risque | Niveau | Mitigation |
|--------|--------|------------|
| Réseau instable → blocage utilisateur | 🔴 Critique | Ne jamais bloquer, toujours offline-first |
| Migrations WatermelonDB irréversibles | 🔴 Critique | Tester en staging avant prod |
| Appareils bas de gamme: perf et fuites mémoire | 🟡 Modéré | RAM < 150MB, pagination 20 items max |
| Conflits financiers auto-résolus | 🔴 Critique | Jamais auto-résoudre, toujours log + flag |
| SMS offline: payload malformé ou replay | 🔴 Critique | Nonce anti-rejeu, TTL, validation stricte |
| Anti-fraude QR: rejeu de tokens | 🟡 Modéré | Nonce + TTL + vérification locale |
| Seuil offline dépassé (> 5 000 FCFA) | 🟡 Modéré | Blocage automatique côté app |
| BLE mesh multi-hop complexe | 🟡 Modéré | Reporter après MVP, Bluetooth simple d'abord |
| Pas de vrai mesh open source (type Bridgefy) | 🟡 Modéré | Mesh custom requis, reporte en Phase 3 |
| Metro Windows: ESM/chemins cassés | 🟢 Faible | Patch loadConfig si besoin |

---

## Exigences sécurité critiques (non négociables)
- Signatures **Ed25519** pour toutes les transactions
- Chiffrement **XChaCha20** pour données sensibles (SMS, DB)
- **Nonce anti-rejeu** + idempotence sur toutes les actions critiques
- **Seuil offline max 5 000 FCFA** (jamais dépassable côté app)
- **Pas de cash-out** pour les points Yabisso
