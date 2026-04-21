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

### BUG-006 — Conflit minSdkVersion (expo-av)
- **Date** : 2026-03-13
- **Problème** : `expo-av` nécessite `minSdkVersion 24`, le projet était à 23.
- **Cause** : Dépendances natives exigeant une version SDK Android supérieure.
- **Solution** : Passage à `minSdkVersion 24` dans `app.json` via `expo-build-properties`.
- **Statut** : ✅ Résolu

### BUG-007 — AddAddress bouton enregistre ne s'activait pas avec categorie
- **Date** : 2026-03-15
- **Problème** : Bouton "Enregistrer l'adresse" désactivé si pas de nom rentré, même avec catégorie sélectionnée
- **Cause** : Condition `!name` dans le disabled state
- **Solution** : Modifier la condition pour accepter aussi `category` comme valeur valide
- **Statut** : ✅ Résolu

### BUG-008 — Marketplace Notification Crash (params undefined)
- **Date** : 2026-03-15
- **Problème** : Crash lors du clic sur une notification marketplace ("Cannot read property 'params' of undefined")
- **Cause** : Erreur de référence à `params` au lieu de `screenParams` dans `App.js` + définition `bottomNavItems` manquante dans `ProductListScreen.js`
- **Solution** : Correction des références dans `App.js`, ajout de la constante manquante et implémentation du deep-linking fonctionnel (filtres promo/orders)
- **Statut** : ✅ Résolu
### BUG-009 — ReferenceError: withObservables doesn't exist
- **Date** : 2026-03-20
- **Problème** : Crash au chargement des écrans utilisant WatermelonDB ("Property 'withObservables' doesn't exist")
- **Cause** : Import depuis `@nozbe/watermelondb/react` (obsolète) ou import manquant
- **Solution** : Installation de `@nozbe/with-observables` + `rxjs` et mise à jour des imports vers le nouveau package
- **Statut** : ✅ Résolu

### BUG-010 — Loba Pack non partagé via WiFi Direct par le Group Owner
- **Date** : 2026-04-19
- **Problème** : Le wifi direct ne fait pas le partage de pack avec le message "[WifiDirectService] Ce device est le Group Owner - envoi ignoré".
- **Cause** : Le service bloquait purement l'envoi de fichier lorsque l'appareil est hôte du groupe P2P.
- **Solution** : Suppression de la restriction statique `return false` dans `WifiDirectService.js` en cas de `isGroupOwner` pour permettre la tentative d'envoi expérimental.
- **Statut** : ✅ Résolu

### BUG-011 — Dev client "Unable to load script" sur IP locale (EXPO_PACKAGER_HOSTNAME)
- **Date** : 2026-04-19
- **Problème** : L'app compile mais crash car le terminal de dev écoute sur l'IP LAN demandée (192.168.x.x) pendant que Metro utilise `127.0.0.1`.
- **Cause** : Expo CLI ignore le flag `--lan` ou l'IP spécifiée si la variable native n'est pas forcée sur l'IP locale.
- **Solution** : Ajout de la variable `REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.68` dans le `.env` de l'application en plus de `EXPO_PACKAGER_HOSTNAME` et redémarrer avec `--clear`.
- **Statut** : ✅ Résolu

### BUG-012 — WiFi Direct `isDiscovering` menteur (scan zombie)
- **Date** : 2026-04-21
- **Problème** : L'itel A50 ne lançait plus la recherche WiFi Direct après quelques secondes.
- **Cause** : Android tue silencieusement le scan P2P après ~30s. Le flag JS `isDiscovering` restait à `true`, empêchant toute relance.
- **Solution** : `startDiscovery()` fait toujours `stopDiscoveringPeers()` → 300ms pause → `startDiscoveringPeers()`. Le heartbeat dans P2PAutoSync vérifie `getState().isDiscovering` et relance si inactif.
- **Statut** : ✅ Résolu

### BUG-013 — OutOfMemoryError sur itel A50 (MessageServer natif)
- **Date** : 2026-04-21
- **Problème** : `java.lang.OutOfMemoryError: Failed to allocate 115163` dans `io.wifi.p2p.MessageServer.convertStreamToString()`
- **Cause** : `startReceiving()` était appelé au démarrage sans connexion active. Le `MessageServer` natif Java tentait de lire tout un flux socket dans une `String` en mémoire → OOM sur appareil budget.
- **Solution** : `startReceiving()` n'est plus appelé au démarrage. Garde `connectedPeer !== null` obligatoire. `stopReceiving()` ajouté à la déconnexion.
- **Statut** : ✅ Résolu

### BUG-014 — Spam de connexion WiFi Direct (`connect()` en boucle)
- **Date** : 2026-04-21
- **Problème** : Le Xiaomi envoyait des dizaines de requêtes `connect()` en rafale, saturant la pile P2P de l'itel.
- **Cause** : `connectToPeer()` retournait `true` immédiatement (optimistic) avant la vraie connexion. `connectedPeer` restait `null` → `onPeerFound` se redéclenchait → nouveau `connect()`.
- **Solution** : Ajout du flag `isConnecting` dans WifiDirectService, vérifié dans `onPeerFound` et `connectToPeer`, réinitialisé dans `subscribeOnConnectionInfoUpdates`.
- **Statut** : ✅ Résolu

### BUG-015 — Collision GO Negotiation (les deux téléphones appellent `connect()` en même temps)
- **Date** : 2026-04-21
- **Problème** : Les deux téléphones se trouvaient mutuellement et appelaient `connect()` simultanément → Android annulait les deux requêtes (`Internal Error code:0`).
- **Cause** : Le jitter aléatoire (500-3500ms) donnait des valeurs trop proches (1240ms vs 1201ms = 39ms d'écart). De plus, `removeGroup()` avant `connect()` tuait la tentative de l'autre téléphone.
- **Solution** : 
  - Remplacement du jitter aléatoire par un **délai déterministe basé sur l'adresse MAC du peer** (`lastByte * 50ms`). Chaque téléphone voit un MAC différent → délai garanti différent.
  - Suppression de `removeGroup()` avant `connect()` (gardé uniquement dans `disconnect()`).
  - Après collision (code:0), le téléphone perdant passe en mode passif et relance le scan.
- **Statut** : 🔄 En cours de validation

### BUG-016 — `disconnect()` ne relançait pas le scan
- **Date** : 2026-04-21
- **Problème** : Après déconnexion (swap de rôles), aucun des deux téléphones ne relançait la recherche de peers.
- **Cause** : `disconnect()` ne faisait que couper la connexion sans relancer `startDiscovery()`. `isDiscovering` restait à `false`.
- **Solution** : `disconnect()` utilise `removeGroup()` pour nettoyage total, puis relance automatiquement `startDiscovery(true)` après 3s.
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
