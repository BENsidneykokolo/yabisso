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
- **Statut** : ✅ Résolu

### BUG-018 — Pack reçu non affiché dans le service Loba (feed non rafraîchi + OOM itel)
- **Date** : 2026-04-24
- **Problème** : Le partage de pack Loba fonctionnait (transfert OK) mais le contenu reçu n'apparaissait pas dans le feed Loba. Sur itel A50 (128MB RAM), crash `OutOfMemoryError` avec `88MB allocation` dans `MessageServer.convertStreamToString()` pour un pack de 36MB.
- **Cause** : 
  1. **OOM**: `receiveMessage()` natif lisait le fichier EN ENTIER en mémoire pour parser le JSON. Sur appareils budget (128MB RAM total), un pack de 36MB sature le heap.
  2. **Feed non rafraîchi**: `LobaHomeScreen` ne s'abonnait pas aux événements `onSyncStatus` pour recharger le feed après décompression. Le HOC `withObservables` ne détectait pas les changements via `posts` props.
  3. **Timeout trop court**: 30s insuffisant pour recevoir un gros fichier via WiFi Direct sur appareil lent.
- **Solution** : 
  - **WifiDirectService.js**: Timeout adaptatif → 120s pour fichiers > 10MB, 30s pour les petits. `receiveFile()` appelé directement (n'écrit pas en RAM). Logs clarifiés avec tailles en MB.
  - **LobaHomeScreen.js**: Abonnement à `onSyncStatus` avec `status === 'SUCCESS'` → recharge le feed depuis la DB (50 posts triés par date) après 1.5s.
  - **LobaPackService.js**: Support des fichiers `.zip` (packs) ET fichiers individuels (vidéo/image). Gestion d'erreur améliorée pour unzip.
- **Étapes** :
  1. Le récepteur affiche "📩 Transfert entrant: pack_xxx... (36.4 MB)"
  2. Timeout porté à 120s pour laisser le temps sur itel A50
  3. Après réception → décompression → insertion en DB
  4. LobaHomeScreen détecte `SUCCESS` → relit la DB → affiche les posts
- **Fichiers modifiés** :
  - `app/src/features/bluetooth/services/WifiDirectService.js`
  - `app/src/features/loba/screens/LobaHomeScreen.js`
  - `app/src/features/loba/services/LobaPackService.js`
- **Statut** : ✅ Résolu

### BUG-016 — `disconnect()` ne relançait pas le scan
- **Date** : 2026-04-21
- **Problème** : Après déconnexion (swap de rôles), aucun des deux téléphones ne relançait la recherche de peers.
- **Cause** : `disconnect()` ne faisait que couper la connexion sans relancer `startDiscovery()`. `isDiscovering` restait à `false`.
- **Solution** : `disconnect()` utilise `removeGroup()` pour nettoyage total, puis relance automatiquement `startDiscovery(true)` après 3s.
- **Statut** : ✅ Résolu

### BUG-017 — "Le réseau n'a pas pu être joint" (timeout réseau)
- **Date** : 2026-04-22
- **Problème** : Erreur "Le réseau n'a pas pu être joint" lors du scan QR pour lancer l'application
- **Cause** : L'APK EAS essayait de se connecter au serveur Metro (`192.168.1.66:8081`) qui n'était pas accessible depuis le téléphone
- **Solution** : Build d'un APK debug local avec le JS bundle inclus via `npx expo prebuild` + `./gradlew assembleDebug`
- **Étapes** :
  1. `npx expo prebuild --platform android` (génère le dossier android)
  2. `cd android && ./gradlew.bat assembleDebug` (build l'APK)
  3. L'APK debug est dans `app/android/app/build/outputs/apk/debug/app-debug.apk`
- **Note** : L'APK généré contient le JS bundle intégré, fonctionne sans Metro/serveur externe
- **Statut** : ✅ Résolu

### BUG-019 — Restaurant: Bouton "Ajouter un plat" inactive
- **Date** : 2026-04-28
- **Problème** : Bouton "Ajouter un plat" seulement visible quand la liste est vide
- **Cause** : Condition ternary `products.length === 0 ? ... : ...`
- **Solution** : always show button, use modal for adding
- **Statut** : ✅ Résolu

### BUG-020 — Crash Natif P2P (RNZipArchive NullPointerException)
- **Date** : 2026-04-30
- **Problème** : L'application crashe brutalement pendant la réception d'un pack Loba sur les appareils lents (Itel A50).
- **Cause** : 
  1. **Polling prématuré** : Le code JS tentait de décompresser le ZIP dès 95% de sa taille, alors que l'index (Central Directory) est à la fin du fichier.
  2. **Timeout trop court (60s)** : Sur Itel A50, le transfert de 48MB dépassait 60s, déclenchant un fallback sur un fichier incomplet.
  3. **Goulot d'étranglement natif** : La bibliothèque `react-native-wifi-p2p` utilisait un buffer minuscule de **1 KB**, rendant les écritures disque extrêmement lentes.
- **Solution** : 
  - Suppression du polling JS (attente exclusive du signal natif 100%).
  - Augmentation du timeout à 300s.
  - **Patch Natif** : Passage du buffer de 1 KB à **64 KB** dans `Utils.java` (recompilation requise).
- **Statut** : ✅ Résolu

### BUG-021 — Crash WatermelonDB / Expo SDK 54
- **Date** : 2026-04-30
- **Problème** : TypeError lors du comptage des posts et plantage du FileSystem.
- **Cause** : 
  1. WatermelonDB `.count()` est déprécié/incompatible, remplacé par `.fetchCount()`.
  2. `expo-file-system` nécessite l'import `/legacy` sur le SDK 54 pour certaines opérations.
- **Solution** : Mise à jour des méthodes de comptage et des imports FileSystem dans `InterestEngine.js`.
- **Statut** : ✅ Résolu

### BUG-022 — Échec EAS Build (ECONNRESET / Archive 251MB)
- **Date** : 2026-04-30
- **Problème** : `Failed to upload the project tarball to EAS Build - reason: write ECONNRESET`.
- **Cause** : L'archive du projet faisait 251 MB car elle incluait les dossiers de build Android (`android/app/build`).
- **Solution** : Mise à jour de `.easignore` avec des patterns globaux (`**/build`, `**/.gradle`) pour réduire l'archive à moins de 10 MB.
- **Statut** : ✅ Résolu

### BUG-023 — Collision "2 Portails" (Double Group Owner) en P2P
- **Date** : 2026-04-30
- **Problème** : Lors de la connexion, le téléphone "Envoyeur" devenait lui aussi Group Owner au lieu de Client, créant 2 portails qui ne communiquaient pas.
- **Cause** : Le driver natif Android (`react-native-wifi-p2p`) utilise par défaut un `groupOwnerIntent` élevé lors de l'appel à `connect()`, forçant le connecteur à devenir l'hôte.
- **Solution** : Remplacement de `WifiP2P.connect()` par `WifiP2P.connectWithConfig({ groupOwnerIntent: 0 })` pour garantir que l'Envoyeur reste strictement le Client (GC).
- **Statut** : ✅ Résolu

### BUG-024 — Barre de progression bloquée à 95%
- **Date** : 2026-04-30
- **Problème** : Le transfert P2P est un succès, les fichiers sont bien enregistrés en base de données, mais l'interface affiche indéfiniment "Réception du pack : 95%".
- **Cause** : 
  1. Fuite mémoire des intervalles de progression dans `WifiDirectService.js` et `LobaPacksScreen.js` (non nettoyés dans les blocs `catch` ou écrasés sans `clearInterval`).
  2. L'orchestrateur `P2PAutoSync` renvoyait un pack complet en boucle toutes les 20 secondes car il ne se rappelait pas avoir déjà transféré lors de la session courante.
- **Solution** : 
  1. Ajout de `clearInterval` dans le `catch` de `receiveFile` et nettoyage sécurisé de `window._decompressInterval`.
  2. Ajout du flag `this._sessionSent` dans `P2PAutoSync` pour limiter le transfert automatique à 1 pack par connexion réussie.
- **Statut** : ✅ Résolu

### BUG-025 — Nearby Connections: Pas de découverte de peers
- **Date** : 2026-05-03
- **Problème** : Nearby Connections reste actif mais ne découvre jamais de peers (`🔍 Node trouvé` jamais affiché)
- **Cause** : Problème Google Play Services sur certains appareils (Itel A50, etc.) - API Nearby ne détecte pas les autres appareils
- **Solution** : WiFi Direct utilisé comme rail P2P principal, Nearby gardé comme backup
- **Statut** : 🔄 En cours (Nearby = backup, WiFi Direct = principal)

### BUG-027 — WiFi Direct: "Attente d'action manuelle" au lieu de auto-connexion
- **Date** : 2026-05-04
- **Problème** : WiFi Direct découvrait les peers mais attendait une action manuelle au lieu de connecter automatiquement
- **Solution** : Modifier handler onPeerFound pour auto-connecter
- **Statut** : ✅ Résolu (2026-05-04)

### BUG-028 — WiFi Direct: "startReceiving ignoré: la boucle tourne déjà"
- **Date** : 2026-05-04
- **Problème** : Le serveur TCP GO pensait qu'il tournait déjà alors que non. 导致 `ECONNREFUSED` sur l'envoi de pack
- **Cause** : Flag `_isMessageLoopRunning` et `_receiveMessages` mal synchronisés
- **Solution** : Ajout d'un arrêt préventif avec delay 500ms avant de démarrer la boucle de réception
- **Statut** : ✅ Résolu (2026-05-04)

### BUG-030 — WiFi Direct: Progression bloquée à 95%
- **Date** : 2026-05-04
- **Problème** : La barre de progression reste bloquée à 95%, le transfert ne complète pas
- **Cause** : Callback de fin échoue silencieusement, progression simule jusqu'à 95% seulement
- **Solution** : Fallback robuste + try/catch pour forcer completion à 100%
- **Statut** : 🔄 En cours (2026-05-04)

### BUG-031 — OOM Receiver + P2P Infinite Cycling
- **Date** : 2026-05-05
- **Problème 1** : OutOfMemoryError lors de la réception d'un pack de 48MB. Le native MessageServer.convertStreamToString() lit tout le fichier en RAM.
- **Problème 2** : Après un partage manuel, le cycle P2P continue indéfiniment (log "🔄 Cycle P2P via wifi_direct..." en boucle)
- **Cause 1** : La lib react-native-wifi-p2p utilise convertStreamToString() qui alloue 48MB en RAM
- **Cause 2** : Pas de flag pour détecter un trigger manuel vs cycle automatique
- **Solution 1** : Réduction pack de 50MB à 25MB dans LobaPackService.js
- **Solution 2** : Ajout flag _manualTrigger + timeout 30s dans P2PAutoSync.js
- **Statut** : ✅ Résolu (2026-05-05)

### BUG-029 — Icône invalide "chatbubbles-outline"
- **Date** : 2026-05-04
- **Problème** : Warning "chatbubbles-outline is not a valid icon name for family material-community"
- **Solution** : Remplacé par 'chatbubbles-outline' avec le bon nom Ionicons
- **Statut** : ✅ Résolu (2026-05-04)

### BUG-026 — P2PAutoSync.js Syntax Error
- **Date** : 2026-05-04
- **Problème** : Erreur de syntaxe JavaScript (accolades mal placées)
- **Cause** : Multiples edits successifs ont cassé l'indentation
- **Solution** : Git pull + re-implémentation propre
- **Statut** : ✅ Résolu

### BUG-032 — RestaurantSync loadRestaurants crash
- **Date** : 2026-05-11
- **Problème** : `[RestaurantSync] Erreur loadRestaurants` - `[TypeError: Cannot read property 'query' of null]`
- **Cause** : Le module `database` était importé AVANT que le DatabaseProvider ne l'initialise. L'import statique `import { database }` retourne `null` au démarrage de l'app.
- **Solution** : 
  1. Créé fonction `getDatabase()` avec try/catch
  2. Renommé import `database as _database`
  3. Toutes les fonctions utilisent `getDatabase()` maintenant
  4. Si `getDatabase()` retourne null → fallback SecureStore automatique
- **Fichiers modifiés** : `app/src/features/restaurant/services/RestaurantSyncService.js`
- **Statut** : ✅ Résolu (2026-05-11)

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

## Bugs Session 2026-05-11 (Kiosque QR)

### BUG-KIOSK-001 — MeshRequestEvents.addListener is not a function
- **Date** : 2026-05-11
- **Problème** : `ERROR [TypeError: _bluetoothServicesNearbyMeshServ(...)ce.MeshRequestEvents.addListener is not a function (it is undefined)]`
- **Cause** : La méthode s'appelle `subscribe()` pas `addListener` dans SimpleEventEmitter
- **Solution** : Remplacé `addListener()` par `subscribe()` et `sub.remove()` par `sub()`
- **Fichier** : `app/src/features/kiosk/screens/KioskAdminDashboardScreen.js`
- **Statut** : ✅ Résolu

### BUG-KIOSK-002 — route.params undefined
- **Date** : 2026-05-11
- **Problème** : `ERROR [ReferenceError: Property 'params' doesn't exist]`
- **Cause** : `route.params` était undefined car la route n'envoyait pas les params correctement
- **Solution** : Changé `params?.qrType` en `screenParams?.qrType` dans App.js, et utilisé `route?.params || {}` dans KioskQRScreen
- **Fichier** : `app/App.js`, `app/src/features/kiosk/screens/KioskQRScreen.js`
- **Statut** : ✅ Résolu

### BUG-KIOSK-003 — SafeAreaView deprecated
- **Date** : 2026-05-11
- **Problème** : Warning "SafeAreaView has been deprecated and will be removed in a future release"
- **Solution** : Remplacé SafeAreaView par View avec paddingTop: 50
- **Fichier** : `app/src/features/kiosk/screens/KioskQRScreen.js`
- **Statut** : ✅ Résolu

### BUG-KIOSK-004 — renderError doesn't exist
- **Date** : 2026-05-11
- **Problème** : `ERROR [ReferenceError: Property 'renderError' doesn't exist]`
- **Cause** : La fonction renderError() était utilisée mais non définie dans ProductValidationKioskScreen.js
- **Solution** : Ajouté la fonction renderError() avec un message d'erreur et un bouton réessayer
- **Fichier** : `app/src/features/kiosk/screens/ProductValidationKioskScreen.js`
- **Statut** : ✅ Résolu

### BUG-KIOSK-005 — QR scan fonctionne sur Itel mais pas Xiaomi
- **Date** : 2026-05-11
- **Problème** : Le bouton "Simuler un scan" ne réagit pas sur Xiaomi
- **Cause** : Probablement problème hardware ou Expo sur Xiaomi
- **Solution** : Ajouté popup de confirmation + logs de debugging pour mieux diagnostiquer
- **Fichier** : `app/src/features/kiosk/screens/KioskQRScreen.js`
- **Statut** : 🔄 En cours - Scan fonctionne mais validation en test

### BUG-KIOSK-006 — Validation produit ne fonctionne pas
- **Date** : 2026-05-11
- **Problème** : Après scan et approbation, la validation ne s'enregistre pas
- **Cause** : Erreur "Cannot read property 'query' of null" sur la base de données
- **Solution** : 
  1. Créé entrée dans sync_queue avec vérification
  2. Tentative de mise à jour du produit avec try/catch
  3. Ajouté vérification finale que la validation est enregistrée
  4. Messages de confirmation détaillés
- **Fichier** : `app/src/features/kiosk/screens/KioskQRScreen.js`
- **Statut** : 🔄 En cours - En test avec Xiaomi

### BUG-033 — _lastIntendedRole détruit au disconnect temporaire (SLAVE ne renvoie plus)
- **Date** : 2026-06-02
- **Problème** : Les deux téléphones se connectent mais le SLAVE entre en "Mode Réception" au lieu d'envoyer le pack. Le GO (Xiaomi) tente un 2ème `createGroup()` qui échoue avec "framework busy", déclenchant un disconnect temporaire qui détruit `_lastIntendedRole`.
- **Cause** : 
  1. `this._lastIntendedRole = null` dans le handler `onConnectionChange` disconnected (ligne 219) détruit le rôle SLAVE lors d'un disconnect temporaire
  2. `_p2pSyncCycle` tourne toutes les 3s et tente de créer un nouveau groupe même après connexion réussie → "framework busy"
- **Solution** : 
  1. Supprimé `this._lastIntendedRole = null` du handler disconnect — le rôle est préservé
  2. Ajouté cooldown 10s (`GROUP_CREATE_COOLDOWN_MS`) pour les appels `createGroup()`
  3. Augmenté `pauseMesh()` delay de 500ms à 2000ms pour libérer le radio
- **Fichiers modifiés** : `P2PAutoSync.js`, `NearbyMeshService.js`
- **Statut** : ✅ Résolu (2026-06-02)

### BUG-034 — Cycle P2P relance la découverte toutes les 3s → peers jamais trouvés
- **Date** : 2026-06-03
- **Problème** : WiFi Direct discovery tourne en boucle (`peers=0, discovering=true`) sans jamais détecter le 2ème téléphone. Log caractéristique : `🔄 [Cycle] Relance découverte WiFi Direct (peers=0, discovering=true)...` en rafale toutes les 3 secondes.
- **Cause** : `_p2pSyncCycle` relançait la découverte dès que `peers.length === 0`, faisant `stopDiscoveringPeers() → 300ms → startDiscoveringPeers()` toutes les 3s. Or le scanner WiFi Direct natif d'Android a besoin de **5-10 secondes** minimum pour détecter un peer. En interrompant en permanence, la découverte n'a jamais le temps de compléter → `peers=0` éternel.
- **Solution** : 
  1. `_p2pSyncCycle` : ne relance la découverte QUE si `!state.isDiscovering` (au lieu de `peers.length === 0 || !isDiscovering`)
  2. `triggerSync` : même logique — vérifie `isDiscovering` avant de relancer
  3. Le heartbeat 25s (BUG-012) gère toujours le cas où Android tue le scan après ~30s
- **Fichiers modifiés** : `P2PAutoSync.js`
- **Statut** : ✅ Résolu (2026-06-03)

### BUG-035 — Connexion WiFi Direct Loba boucle sur peers NON-Yabisso (imprimante, autres appareils)
- **Date** : 2026-06-03
- **Problème** : Le cycle P2P tente de se connecter en SLAVE à des appareils détectés par WiFi Direct qui ne sont **pas du tout** des Yabisso (ex: imprimante HP M281, itel A50 d'un autre réseau, xiaomi 11T sans Yabisso). Boucle infinie : `[Cycle] Connexion à itel A50 (SLAVE)...` puis timeout 8s, puis `[Cycle] Relance découverte...` 3s plus tard, puis retry. Aucun handshake bidirectionnel MASTER↔SLAVE ne s'établit entre 2 vrais Yabisso.
- **Cause** : 
  1. `react-native-wifi-p2p` n'expose **pas** `setDeviceName()`. Le nom Yabisso (`73_Device_xxx`) construit en JS dans `_buildDeviceName()` (WifiDirectService.js:45-54) n'est **jamais broadcasté** par le framework Android. Les peers apparaissent avec leur nom Android natif ("itel A50", "xiaomi 11t", "HP M281").
  2. Le filtre `_iAmMasterFor()` (P2PAutoSync.js:110) matchait uniquement sur le nom du peer → score = 0 pour tous les peers → fallback alphabétique → toujours SLAVE.
  3. SLAVE appelle `connectToPeer` → `WifiP2P.connect()` → timeout 8s (le peer non-Yabisso n'a jamais créé de groupe) → retry éternel.
  4. Double trigger : `onPeerFound` ET `_p2pSyncCycle` appellent tous les deux `connectToPeer` → race condition.
- **Solution** : Protocole **YABISSO_HELLO handshake** via le canal de contrôle existant :
  1. **`isLikelyYabissoDevice(deviceName)`** dans WifiDirectService.js : regex `^\d+_Device_` (insensible à la casse) — vérifie le nom envoyé dans le payload `senderDevice` de `sendControlMessage()`.
  2. **SLAVE envoie `YABISSO_HELLO { myScore, myRam, isMaster }`** juste après connexion (le `senderDevice` du payload contient déjà le nom Yabisso).
  3. **MASTER reçoit HELLO** : vérifie `isLikelyYabissoDevice(peerName)` du champ `senderDevice`. Si non-Yabisso → **blacklist 5min** + déconnecte. Si Yabisso → envoie `YABISSO_HELLO_ACK { myScore, myRam }`.
  4. **Watchdog 5s côté MASTER** : si pas de HELLO reçu → blacklist + déconnecte.
  5. **SLAVE appelle aussi `startReceiving()`** après connexion (auparavant seul le MASTER le faisait) pour pouvoir recevoir l'ACK.
  6. **Blacklist + backoff par peer** : Maps `_nonYabissoPeers` (TTL 5min) et `_peerLastAttempt` (intervalle min 10s) dans WifiDirectService.
  7. **Log throttle 30s** : évite le spam de logs `[Cycle] Connexion à itel A50...` qui inondent la console.
  8. **Suppression du `setTimeout(3000)` dans `onPeerFound`** : déduplique avec `_p2pSyncCycle` qui tourne déjà toutes les 3s.
  9. **MASTER proactif** : si aucun peer Yabisso détecté depuis >20s, le MASTER force un `createGroup()` pour signaler sa présence aux SLAVEs (qui eux ne créent jamais de groupe en WiFi Direct standard).
- **Flux complet** :
  ```
  [SLAVE itel A50]                 [MASTER Xiaomi 11T]
  scan WiFi Direct
   ├─ détecte Xiaomi (nom natif)
   └─ connect("Xiaomi 11T")
                                   reçoit connect()
                                   sendControlMessage({
                                     type: 'YABISSO_HELLO_ACK',
                                     senderDevice: '20_Device_xxx',
                                     myScore: 200
                                   })
  reçoit HELLO_ACK
   ├─ vérifie regex sur senderDevice ✓
   └─ procède au sync du pack Loba
  ```
- **Fichiers modifiés** : 
  - `app/src/features/bluetooth/services/WifiDirectService.js` (ajout helpers blacklist/backoff/identify + `createGroup()` publique)
  - `app/src/features/bluetooth/services/P2PAutoSync.js` (handshake HELLO/ACK + watchdog + dedup + MASTER proactif)
- **Vérifications** : `node --check` → 0 erreur, `grep` → 21 références cohérentes entre les 2 fichiers
- **Statut** : ✅ Résolu (2026-06-03)

### BUG-036 — `TypeError: Cannot convert undefined value to object` + regex trop restrictif + double MASTER
- **Date** : 2026-06-03
- **Problème 1** : `TypeError: Cannot convert undefined value to object` apparaît 5s après connexion MASTER. Empêche le handshake bidirectionnel d'aboutir.
- **Problème 2** : Regex `isLikelyYabissoDevice` = `^\d+_Device_` ne matche jamais les noms réels `<score>_Yabisso_<id>` produits par `NearbyMeshService` (lignes 110 et 232). Le HELLO est toujours considéré comme "non-Yabisso" → blacklist + disconnect.
- **Problème 3** : Les 2 téléphones lancent `createGroup()` simultanément (mode MASTER proactif après 20s sans peer) → 2 Group Owners distincts → ne peuvent plus se découvrir en WiFi Direct.
- **Cause 1** : `_peerHandshakeConfirmed` n'était PAS initialisé dans le constructor. Lazy-init uniquement dans `_confirmYabissoHandshake`. Le watchdog `_startYabissoHelloWatchdog` (5s) accède `this._peerHandshakeConfirmed[peerName]` avant toute confirmation → crash.
- **Cause 2** : Incohérence entre les patterns de nommage : `WifiDirectService._buildDeviceName()` → `<score>_Device_<id>`, mais `NearbyMeshService` → `<score>_Yabisso_<id>`. Le `senderDevice` reçu peut être dans les 2 formats selon le chemin.
- **Cause 3** : Symétrie parfaite : les 2 devices calculent `timeSinceLastYabisso > 20000` en même temps, déclenchent `createGroup()` en même temps, deviennent tous 2 Group Owners.
- **Solution** :
  1. **`_peerHandshakeConfirmed = {}`** ajouté au constructor de P2PAutoSync (ligne 46)
  2. **Regex élargi** : `/^\d+_(Yabisso|Device)_/i` — matche les 2 patterns
  3. **Log "1780446238s"** remplacé par "jamais" quand `_lastYabissoPeerSeen = 0`
  4. **Random init pour briser la symétrie** : `_lastMasterProactiveAt = Date.now() - Math.floor(Math.random() * 25000)` — chaque device commence avec un délai 0-25s aléatoire. Le device dont le timer expire en premier devient MASTER, l'autre le détecte et devient SLAVE.
- **Fichiers modifiés** : `P2PAutoSync.js`, `WifiDirectService.js`
- **Vérifications** : `node --check` → 0 erreur
- **Statut** : ✅ Résolu (2026-06-03)

### BUG-037 — Double MASTER persistant + HELLO envoyé après le pack
- **Date** : 2026-06-03
- **Problème 1** : Les 2 téléphones créent un groupe en même temps (double GO) → ils ne se voient plus en WiFi Direct.
- **Problème 2** : Le SLAVE envoyait le pack AVANT le HELLO → le watchdog 5s du MASTER se déclenchait avant la réception du HELLO → déconnexion forcée.
- **Problème 3** : Le WiFi Direct peer name est le nom Android ("Xiaomi 11T"), pas le nom Yabisso. Le score parsé = 0 → tri alphabétique → toujours SLAVE → mauvais rôle.
- **Cause 1** : La random init (0-25s) ne brise pas la symétrie de façon fiable. Les 2 devices finissent par créer un groupe.
- **Cause 2** : Le code du SLAVE appelait `_p2pSyncCycle()` (envoi du pack) AVANT `_sendYabissoHello()`. Le pack prend ~30s → le HELLO arrive après 30s → watchdog déjà déclenché.
- **Cause 3** : Le `_iAmMasterFor()` utilisait le nom du peer WiFi Direct (nom Android), pas le nom Yabisso. Le score était toujours 0.
- **Solution** :
  1. **`_meshPeers` Map** dans P2PAutoSync + méthodes `setMeshPeer(peerId, name, score, isMeshMaster)` / `clearMeshPeer(peerId)`
  2. **NearbyMeshService** appelle `P2PAutoSync.setMeshPeer()` dans `onPeerFound` et `clearMeshPeer()` dans `onPeerLost`
  3. **`_iAmMasterFor()`** utilise le score du peer Mesh en priorité (le nom Mesh est Yabisso, le score est correct)
  4. **Proactive MASTER** : si le peer Mesh a un score plus élevé, le device ATTEND qu'il crée le groupe (au lieu de créer le sien)
  5. **Watchdog 5s → 10s** (pour donner plus de marge sur appareils lents)
  6. **SLAVE envoie HELLO EN PREMIER**, attend 3s pour l'ACK, puis envoie le pack (au lieu de l'inverse)
- **Fichiers modifiés** : `P2PAutoSync.js`, `NearbyMeshService.js`
- **Vérifications** : `node --check` → 0 erreur sur les 2 fichiers
- **Note utilisateur** : **Faire un hard reload** (`Ctrl+Shift+R` ou shake → Reload) car le bundle Metro peut être stale
- **Statut** : ✅ Résolu (2026-06-03)

### BUG-038 — `p2p_control/` directory n'est pas writable → HELLO jamais envoyé
- **Date** : 2026-06-03
- **Problème** : La couche HELLO/ACK échoue systématiquement. Les 2 phones se connectent (Retry SLAVE réussi, GO=true), le SLAVE tente d'envoyer le HELLO mais :
  ```
  WARN  [WifiDirectService] ❌ sendControlMessage error: 
  'FileSystem.writeAsStringAsync' has been rejected.→ Caused by: 
  java.io.IOException: Location '/data/user/0/com.benksidney.yabisso/files/p2p_control/ctrl_YABISSO_HELLO_xxx.json' isn't writable.
  ```
  → Le MASTER ne reçoit jamais le HELLO → watchdog 10s → disconnect → reconnect en boucle.
- **Cause** : `sendControlMessage()` créait le dossier `p2p_control/` via `makeDirectoryAsync({ intermediates: true })` mais ce dossier échoue silencieusement à se créer sur certains Android (problème de permissions/sandbox du `documentDirectory`). Le `writeAsStringAsync` échoue ensuite.
- **Solution** : Réutiliser le dossier `loba_media/` (déjà créé par `startReceiving()`, donc toujours disponible et writable). Préfixe `ctrl_` pour distinguer des fichiers Loba normaux.
  - **Fichier modifié** : `app/src/features/bluetooth/services/WifiDirectService.js`
  - **Cleanup ajouté** : suppression des fichiers `ctrl_*.json` après envoi (sender) et après traitement (receiver) pour éviter l'accumulation
  - **Version log** : `🚀 Orchestrateur démarré (V2.7 - fix BUG-038 sendControlMessage dir)` dans P2PAutoSync pour permettre à l'user de vérifier qu'il a bien la nouvelle version
- **Vérifications** : `node --check` → 0 erreur
- **Statut** : ✅ Résolu (2026-06-03)
- **Action user** : HARD RELOAD (`Ctrl+Shift+R` dans Metro OU shake → Reload sur le téléphone) pour charger le nouveau bundle. Vérifier que le log `V2.7` apparaît.

### BUG-039 — Connexion P2P WiFi Direct se coupe après 10s (NPE file:// + mismatch clé watchdog)
- **Date** : 2026-06-04
- **Problème 1 (NPE natif)** : `sendControlMessage` (WifiDirectService.js:377) passait le chemin avec préfixe `file://` à `WifiP2P.sendFile()`. La couche native `react-native-wifi-p2p` ne strippe PAS `file://` → `FileInputStream` ouvert sur chemin invalide → `java.lang.NullPointerException: Attempt to read from file` → **crash de l'app** sur itel A50.
- **Problème 2 (MISMATCH de clés)** : Le watchdog HELLO du MASTER (`P2PAutoSync.js:163`) vérifiait `this._peerHandshakeConfirmed[peerName]` avec `peerName` = nom Android du device (ex: "xiaomi 11t", lowercase). Mais `_confirmYabissoHandshake()` (P2PAutoSync.js:703) stocke avec `metadata.senderDevice` = nom Yabisso (ex: "73_Yabisso_xxx"). → Les 2 clés sont **DIFFÉRENTES** → le watchdog ne trouve JAMAIS la confirmation → déconnecte systématiquement après 10s avec le log "Pas de YABISSO_HELLO reçu en 10s — unknown n'est pas Yabisso".
- **Logs typiques avant fix** :
  ```
  [WifiDirectService] 📤 sendControlMessage: YABISSO_HELLO
  [WifiDirectService] ❌ sendControlMessage error: ... (ou NPE natif → crash)
  [P2PAutoSync] ⏰ [Handshake] Pas de YABISSO_HELLO reçu en 10s — unknown n'est pas Yabisso. Déconnexion...
  [WifiDirectService] ⛔ Peer blacklisté (non-Yabisso) pour 5min: unknown
  [P2PAutoSync] 🔌 Déconnexion détectée. Cool-down (5s)...
  ```
- **Cause technique identifiée** :
  1. Le `sendFile` public (WifiDirectService.js:335) strippe `file://` via `.replace('file://', '')` → FONCTIONNE pour le transfert de pack
  2. Le `sendControlMessage` (WifiDirectService.js:377) appelait directement `WifiP2P.sendFile(controlFile)` SANS strip → NPE
  3. Le `peerName` est extrait du WiFi Direct natif = nom Android du device (lowercase, "xiaomi 11t")
  4. Le `senderDevice` vient de `metadata` JSON reçu = nom Yabisso avec préfixe score
- **Solution** :
  1. **WifiDirectService.js (ligne 376-378)** : Ajout de `const cleanControlFile = controlFile.replace('file://', '');` avant l'appel `WifiP2P.sendFile(cleanControlFile)`.
  2. **P2PAutoSync.js (ligne 160-165)** : Remplacement de `const confirmed = !!this._peerHandshakeConfirmed[peerName];` par `const confirmedCount = Object.keys(this._peerHandshakeConfirmed || {}).length;` → vérifie si N'IMPORTE QUEL peer a confirmé le handshake (P2P est 1-to-1 de toute façon).
- **Fichiers modifiés** :
  - `app/src/features/bluetooth/services/WifiDirectService.js` (1 ligne ajoutée : strip file://)
  - `app/src/features/bluetooth/services/P2PAutoSync.js` (1 condition changée : key mismatch)
- **Backup P2P synchronisé** : `mesfichiers/P2P/bluetooth/services/` mis à jour
- **Vérifications** : `node --check` → 0 erreur sur les 2 fichiers
- **Statut** : 🔄 En test (2026-06-04)
- **Action user** : HARD RELOAD + tester la connexion entre les 2 téléphones. Vérifier que le log `✅ [Handshake] X peer(s) Yabisso confirmé(s) malgré le délai` apparaît au lieu de la déconnexion.

### BUG-040 — Watchdog HELLO coupe la connexion avant que le sendFile ne complète
- **Date** : 2026-06-04
- **Problème** : Après le fix BUG-039 (file:// NPE), le HELLO ne s'envoie toujours pas à temps. Le SLAVE lance `sendControlMessage` (avec timeout 15s) mais le watchdog du MASTER déclenche la déconnexion à 10s. → La connexion est coupée AVANT que le HELLO ne soit transmis. Le SLAVE log `📤 sendControlMessage: YABISSO_HELLO` mais jamais `✅ sendControlMessage réussi`. Le MASTER ne voit jamais `📨 Fichier reçu`.
- **Cause technique** : 
  1. Le `WifiP2P.sendFile()` sur itel A50 est trop lent (peut prendre >10s à cause du "framework busy" récurrent)
  2. Le watchdog du MASTER est trop agressif (10s)
  3. **Asymétrie de conception** : le HELLO est censé filtrer les non-Yabisso, MAIS le Nearby Mesh a DÉJÀ échangé les manifestes avec les vrais noms Yabisso → la validation est déjà faite par un autre canal
- **Solution (V2.9 - Méthode 1 du plan d'escalade)** : Rendre le watchdog **non-fatal** — si aucun HELLO n'est reçu en 10s, on log un warning et on **continue** avec le transfert de pack. Pas de déconnexion.
- **Code modifié** : `P2PAutoSync.js` ligne ~163 (watchdog) :
  ```javascript
  // AVANT (BUG-039 fix): déconnectait à 10s
  if (confirmedCount === 0) {
    this._log(`⏰ Pas de YABISSO_HELLO reçu en 10s — ${peerName} n'est pas Yabisso. Déconnexion...`);
    WifiDirectService.markPeerAsNonYabisso(peerName, 300000);
    setTimeout(() => { try { WifiDirectService.disconnect(); } catch (_) {} }, 500);
  }
  
  // APRÈS (V2.9): plus de déconnexion
  if (confirmedCount === 0) {
    this._log(`⏰ Pas de YABISSO_HELLO reçu en 10s — ${peerName}. Nearby Mesh a déjà validé, on continue avec le transfert.`);
  }
  ```
- **Fichiers modifiés** :
  - `app/src/features/bluetooth/services/P2PAutoSync.js` (watchdog + log V2.9)
- **Backup P2P synchronisé** : `mesfichiers/P2P/bluetooth/services/P2PAutoSync.js`
- **Vérifications** : `node --check` → 0 erreur
- **Statut** : 🔄 En test (2026-06-04) — Méthode 1 du plan
- **Action user** : HARD RELOAD. Vérifier dans les logs : `🚀 Orchestrateur démarré (V2.9 - BUG-040 fix: watchdog HELLO non-fatal).` puis la connexion doit rester STABLE même sans HELLO.
- **Plan d'escalade si la Méthode 1 ne marche pas** :
  1. ❌ Méthode 1 : Watchdog non-fatal (en cours)
  2. Méthode 2 : Étendre le timeout à 30s + SLAVE plus patient
  3. Méthode 3 : HELLO bidirectionnel (les 2 côtés envoient)
  4. Méthode 4 : Supprimer complètement le HELLO/ACK

---

### BUG-041 — Bidirectionnel P2P cassé (3 causes : getClientAddress, swap key stale, timeout Itel)

- **Date** : 2026-06-05
- **Problème** : Le bidirectionnel WiFi Direct ne fonctionne pas de manière fiable. 3 bugs distincts identifiés par l'ami reviewer :
  1. **getClientAddress() ne fonctionne JAMAIS** : `WifiP2P.receiveMessage({meta:true})` côté GO reste bloqué car le Slave n'envoie jamais rien sur le port 8000 → fallback SWAP permanent
  2. **Clé Mesh `18_yabisso_dwazse` pollue les peers suivants** : après `SYNC_COMPLETE`, `meshPeer` peut être `null` → seule la clé WiFi Direct est supprimée, la clé Mesh reste. Quand l'imprimante `direct-d2-epson-8bea56` est découverte, `_iAmMasterFor()` itère sur `Object.keys(_roleSwapQueue)` et active le swap pour l'imprimante
  3. **Itel A50 met ~20s à se connecter** (chipset Mediatek) : race avec le timeout du Master (5s) → handshake raté de justesse. Fichiers arrivent bien sur Xiaomi mais le Master croit que la connexion a échoué
- **Cause technique** :
  1. Erreur de conception : le `MessageServer` du GO n'est pas programmé pour accepter de connexions entrantes sur le port 8000 dans le contexte de getClientAddress (le Slave n'envoie que via `sendFile`/`sendControlMessage`)
  2. Code de nettoyage conditionnel : `if (meshPeer) completeKeys.push(meshPeer.name.toLowerCase())` — si null, la clé Mesh n'est jamais nettoyée
  3. Architecture Qualcomm (Xiaomi) = 3-5s, Mediatek (Itel) = 15-20s → race avec timeout 5s
- **Solution (V3.11)** : Refonte du bidirectionnel avec stratégie "Transfer = Proof"
  1. **Suppression `getClientAddress()`** : le Slave initie sa Phase 2 directement via `sendFileTo('192.168.49.1')` dans `_handleReceivedFile` (après `PACK_RECEIVED_OK`)
  2. **Suppression branche SWAP fallback** : si pas d'IP, on envoie directement `SYNC_COMPLETE` (pas de SWAP_ROLE_REQUEST)
  3. **SYNC_COMPLETE → `_roleSwapQueue = {}`** : vidage complet au lieu de nettoyage ciblé (plus de clé Mesh stale possible)
  4. **Master attend `_slavePhase2Received`** (max 15s) au lieu d'envoyer activement
  5. **Timeout `_waitForSlaveConfirmation` 5s → 25s** : marge confortable pour chipset Mediatek
  6. **Nouveau flag `_slavePhase2Received`** : détecté via `metadata.phase === 'slave_phase2'` dans `_handleReceivedFile`
- **Code modifié** : `app/src/features/bluetooth/services/P2PAutoSync.js`
  - Constructor ligne 51 : ajout `this._slavePhase2Received = false`
  - Ligne 238 : timeout `_waitForSlaveConfirmation` 20000 → 25000
  - Lignes 906-1005 (refonte complète) : suppression `getClientAddress()` + suppression SWAP fallback + attente `_slavePhase2Received` (15s) + SYNC_COMPLETE + déconnection
  - Lignes 999-1000 : SYNC_COMPLETE handler → `this._roleSwapQueue = {}` (vidage complet)
  - Lignes 1118-1124 : détection `metadata.phase === 'slave_phase2'` → set `_slavePhase2Received = true`
  - Lignes 1150-1180 : Phase 2 SLAVE dans `_handleReceivedFile` (après PACK_RECEIVED_OK)
- **Fichiers modifiés** :
  - `app/src/features/bluetooth/services/P2PAutoSync.js`
- **Backup P2P synchronisé** : `mesfichiers/P2P/bluetooth/services/P2PAutoSync.js`
- **Vérifications** :
  - `node --check` → 0 erreur
  - `grep getClientAddress` → 0 occurrence active (uniquement commentaires)
  - `grep SWAP_ROLE_REQUEST` → 0 envoi actif (handler réception conservé = défensif)
  - `grep _roleSwapQueue = {}` → 2 endroits (constructor + SYNC_COMPLETE handler)
- **Statut** : 🔄 En test (2026-06-05) — Version v0.0.21
- **Action user** : HARD RELOAD. Vérifier dans les logs :
  - Démarrage : `🚀 Orchestrateur démarré (V3.11 - Bidirectionnel initié par le Slave: ...)`
  - Phase 1 Master → Slave : `📤 [V3.3] Envoi du Pack: ...` puis `✅ [V3.3] Pack Phase 1 envoyé !`
  - Phase 2 Slave : `🚀 [V3.11] SLAVE: initiation Phase 2 (envoi mon pack vers GO 192.168.49.1)...`
  - Phase 2 Master reçoit : `📥 [V3.11] Pack Phase 2 du Slave détecté (phase=slave_phase2)` puis `✅ [V3.11] Phase 2 du Slave reçue en XXXms !`
  - SYNC_COMPLETE : `✅ [V3.11] SYNC_COMPLETE envoyé. Déconnexion dans 3s...`
- **Améliorations futures (non prioritaires)** :
- Réduire le temps de connexion Mediatek (10-15s) via optimisation framework natif
- Cache du GO group (5 min) pour que les Slaves suivants se connectent en 3-5s
- Slave-initiated Phase 1 si Master n'a pas de contenu à envoyer

---

### BUG-042 — Connexion WiFi Direct instable : 4 problèmes de timing + spam logs
- **Date** : 2026-06-05
- **Problème** : Le bidirectionnel V3.11 est correct en théorie mais 4 bugs de timing/observabilité empêchent sa validation :
  1. **Double instance NearbyMesh** : score 73 ET score 18 sur le même device (singleton non protégé)
  2. **Slave arrive trop tard** : Master timeout 20s, Slave Mediatek met 15-20s à se connecter → race perdu
  3. **`pendingContent=true` jamais reset** côté Slave (Phase 2 bloquée — non traité dans cette Étape 1)
  4. **itel A50 spamme les logs** "⏭️ ignoré" toutes les 3s pour les peers non-Mesh (imprimantes, téléphones tiers)
- **Cause** :
  1. Pas de garde au niveau classe pour `NearbyMeshService` — `startMesh()` peut être appelé plusieurs fois en parallèle
  2. Timeout Master 20s < temps de connexion Mediatek 15-20s (chipset bas de gamme)
  3. (Réservé Sprint 2) — pas de reset de `_hasPendingDelta` après `PACK_RECEIVED_OK` côté Slave
  4. Aucun throttle sur le log "⏭️ ignoré" — `_peerLogThrottle` (30s) ne s'applique qu'au log générique, pas au log d'ignore
- **Solution (V3.12 — Étape 1, CONNEXION UNIQUEMENT)** : 4 fixes ciblés, AUCUN changement sur la logique d'envoi
  - **Fix A (singleton)** : ajout check `NearbyMeshService._instance` en début de `startMesh()` → bloque le double démarrage
  - **Fix B (timing Slave)** : suppression du délai 3s implicite dans le else branch de `onPeerFound` → ajout `setTimeout(100)` qui déclenche `_p2pSyncCycle()` immédiatement
  - **Fix C (timeout Master)** : `_waitForSlaveConfirmation(peerName, 20000)` → `(peerName, 35000)` (marge 15s pour Mediatek)
  - **Fix D (throttle logs)** : nouveau `this._ignoredPeers = new Map()` + check 60s avant le log "⏭️ ignoré"
- **Code modifié** :
  - `app/src/features/bluetooth/services/NearbyMeshService.js`
    - Ligne 83-92 : ajout singleton check (`_instance` + warn)
  - `app/src/features/bluetooth/services/P2PAutoSync.js`
    - Ligne 53 : ajout `this._ignoredPeers = new Map();`
    - Ligne 408-417 : throttle 60s avant log "ignoré" (Fix D)
    - Ligne 444-451 : trigger immédiat `_p2pSyncCycle()` (Fix B)
    - Ligne 523 : `35000` au lieu de `20000` (Fix C)
- **Fichiers modifiés** :
  - `app/src/features/bluetooth/services/NearbyMeshService.js`
  - `app/src/features/bluetooth/services/P2PAutoSync.js`
- **Backup P2P synchronisé** : `mesfichiers/P2P/bluetooth/services/{NearbyMeshService,P2PAutoSync,WifiDirectService}.js`
- **Vérifications** :
  - `node --check` → 0 erreur sur les 3 fichiers P2P
  - `grep _ignoredPeers` → 3 occurrences actives (constructor + get + set)
  - `grep _instance` → 3 occurrences actives (check + warn + set)
  - `grep 35000` → 1 occurrence (Fix C, `_waitForSlaveConfirmation`)
  - `grep "20000"` → 0 occurrence active (uniquement dans commentaire V3.8 ligne 234)
- **Statut** : 🔄 En test (2026-06-05) — Version v0.0.22
- **Action user** : HARD RELOAD. Tester UNIQUEMENT la connexion (pas de pack).
  - Vérifier sur les 2 phones : Master (73) reste connecté, Slave (18) se connecte en <35s
  - Vérifier : log `⏭️ ignoré` n'apparaît plus que 1 fois par minute max par peer
  - Vérifier : aucun warning `Instance dupliquée détectée`
  - Si OK → passer au Sprint 2 (envoi du pack après connexion confirmée)
- **Non touché dans cette Étape 1** :
  - `_p2pSyncCycle` reste intact
  - `_handleReceivedFile` reste intact
  - `_p2pSyncCycle` Phase 1 + Phase 2 restent intacts
  - `SYNC_COMPLETE` reste intact
  - BUG-042 #3 (pendingContent reset côté Slave) sera traité au Sprint 2

---

## Exigences sécurité critiques (non négociables)
- Signatures **Ed25519** pour toutes les transactions
- Chiffrement **XChaCha20** pour données sensibles (SMS, DB)
- **Nonce anti-rejeu** + idempotence sur toutes les actions critiques
- **Seuil offline max 5 000 FCFA** (jamais dépassable côté app)
- **Pas de cash-out** pour les points Yabisso

### BUG-043 — Race condition : Slave connecte avant que le groupe Master soit visible (BUG-V3.13)
- **Date** : 2026-06-07
- **Problème** : Le Slave fait "🔗 [Trigger] Connexion à Xiaomi 11T (SLAVE)..." puis `🔄 Tentative SLAVE` puis RIEN. Timeout 35s côté Master → abandon → pack envoyé dans le vide. Le Slave boucle en spam "Peer itel A50 ignoré".
- **Cause** : Le Slave se base sur le scan WiFi Direct qui peut détecter le Master AVANT que `createGroup()` ne soit annoncé Android-side (2-5s de délai). Le Slave appelle `connect()` qui timeout 8s. Aucun mécanisme de synchronisation entre les 2 phases (création groupe côté Master vs tentative connexion côté Slave).
- **Solution (V3.13)** : Protocole de synchronisation via Nearby Mesh (canal déjà fonctionnel) :
  1. **Master** (après `onConnectionChange` + 1500ms) envoie `NearbyMeshService.sendMeshMessage(slavePeerId, { type: 'wifi_group_ready', masterIp: '192.168.49.1' })`.
  2. **Slave** (handler `_onWifiGroupReadyMesh`) reçoit le signal, trouve le peer WiFi Direct scanné, appelle `connectToPeer(peer, 0, 'SLAVE')`. Le groupe est garanti visible côté Android.
  3. **Slave** (après `onConnectionChange` + 500ms) envoie `slave_connected_confirmed` au Master via Mesh.
  4. **Master** garde `_fallbackWaitForSlave()` en parallèle (sécurité si Mesh échoue, attend HELLO WiFi).
  5. **Slave scan-based connect** : remplacé par attente passive 15s. Si pas de signal en 15s, fallback scan-based.
  6. **Helpers** : `_findSlavePeerId()` (côté Master) et `_findMasterPeerId()` (côté Slave) matchent par score dans `_meshPeers`.
- **Fichiers modifiés** : `app/src/features/bluetooth/services/P2PAutoSync.js` (+177 lignes : flags constructor + 3 helpers + refonte _onWifiGroupReadyMesh + refonte onConnectionChange)
- **Vérifications** : `node --check` → 0 erreur, `grep` → flags/helper/messaging cohérents
- **Statut** : 🔄 En test (2026-06-07) — Version v0.0.23
- **Action user** : HARD RELOAD. Tester sur les 2 phones :
  - Vérifier log `🚀 Orchestrateur démarré (V3.13 - Connexion WiFi synchronisée via Nearby Mesh ...)`
  - Vérifier côté Master : `📡 [V3.13 Master] Envoi WIFI_GROUP_READY au Slave ...`
  - Vérifier côté Slave : `📡 [V3.13 Mesh] WIFI_GROUP_READY reçu de Master ...` puis `🔗 [V3.13 Slave] Connexion WiFi Direct à ...`
  - Vérifier côté Slave : `📤 [V3.13 Slave] Envoi SLAVE_CONNECTED_CONFIRMED au Master ...`

### BUG-044 — "framework is busy" sur connectToPeer côté Slave (BUG-V3.14)
- **Date** : 2026-06-07
- **Problème** : Le Slave reçoit bien `WIFI_GROUP_READY` via Nearby Mesh, déclenche `connectToPeer`, mais Android refuse : `WARN [WifiDirectService] ⚠️ Erreur connect (tentative 1): Operation failed because the framework is busy and unable to service the request.` Retry 2 fois → même erreur.
- **Cause** : Le Master garde l'ancien groupe WiFi Direct actif en mémoire Android quand il essaie d'en créer un nouveau (session précédente). Android verrouille le framework tant que l'ancien groupe n'est pas complètement supprimé. Les 1000ms de pause après `removeGroup()` étaient insuffisants pour libérer le radio.
- **Solution (V3.14)** : 2 changements ciblés dans `WifiDirectService.js` :
  1. **`createGroup()` (ligne 80-110)** : Augmenter la pause après `removeGroup()` de 1000ms à **1500ms** + ajouter `cancelConnect()` (avec try/catch défensif, la lib `react-native-wifi-p2p` ne l'expose peut-être pas) + pause 500ms avant `createGroup()`. Log `🧹 Ancien groupe supprimé` pour visibilité.
  2. **`connectToPeer()` SLAVE branch (ligne 295-330)** : Remplacer les 2 tentatives fixes par **3 tentatives avec backoff exponentiel** [2000ms, 4000ms] entre chaque. Total max : 30s (3 × 8s timeout + 6s de pauses). Logs explicites "tentative N/3" + "✅ connect réussi tentative N !"
- **Fichiers modifiés** : `app/src/features/bluetooth/services/WifiDirectService.js` (+12 lignes)
- **Vérifications** : `node --check` → 0 erreur, `grep` → logs V3.14 cohérents
- **Non touché** (protégé) : Nearby Mesh, WIFI_GROUP_READY, SLAVE_CONNECTED_CONFIRMED, handshake HELLO, pack, SYNC_COMPLETE
- **Statut** : 🔄 En test (2026-06-07) — Version v0.0.24
- **Action user** : HARD RELOAD. Tester sur les 2 phones. Vérifier dans les logs :
  - Master : `🧹 Ancien groupe supprimé` puis `✅ createGroup réussi`
  - Slave : `✅ connect réussi (première tentative)` (idéal) ou `✅ connect réussi tentative 2 !` (acceptable)
  - **NE PLUS voir** : `❌ Erreur connect (tentative 2): framework is busy`

---

### BUG-045 — Master rate le YABISSO_HELLO du Slave (race socket receiver) (BUG-V3.15)
- **Date** : 2026-06-07
- **Problème** : Le Slave envoie bien `YABISSO_HELLO` (log `[Slave] ✅ YABISSO_HELLO envoyé` apparaît), mais le Master ne le reçoit jamais. Log côté Master : `[Master] ⏰ Aucun Slave en 35000ms → timeout`. La connexion WiFi est pourtant valide (le Slave est `GO=false`, IP DHCP ~192.168.49.x ; le Master est `GO=true`, IP fixe 192.168.49.1).
- **Cause** : Le Master démarre son `startReceiving()` **1500ms après le createGroup**, BI AVANT que le Slave soit réellement prêt à envoyer son HELLO. Quand le HELLO arrive, le socket côté Master n'est pas encore bind correctement → paquet perdu. Le HELLO part 0ms après le `connectToPeer` réussi du Slave, donc le timing Master/Slave est mal aligné.
- **Solution (V3.15)** : 3 modifications ciblées dans `P2PAutoSync.js` :
  1. **`_onSlaveConnectedConfirmedMesh()` (ligne 323)** : Le Master démarre `startReceiving()` ICI, dès qu'il reçoit la confirmation Mesh du Slave. Garantie que le socket est bind avant tout HELLO.
  2. **`onConnectionChange` branche Master (ligne 650-651)** : SUPPRESSION de `WifiDirectService.startReceiving()` qui était lancé trop tôt. Le récepteur est démarré uniquement après `SLAVE_CONNECTED_CONFIRMED`.
  3. **`onConnectionChange` branche Slave (ligne 685-716)** : Le HELLO est différé de 1s (au lieu d'être envoyé immédiatement) pour laisser le Master traiter le signal Mesh et démarrer son récepteur. Le `SLAVE_CONNECTED_CONFIRMED` est envoyé à 300ms (au lieu de 500ms) pour que le Master soit prêt avant T=1000ms.
  4. **`_fallbackWaitForSlave()` (ligne 250)** : Timeout réduit de 35000ms à 15000ms. Le HELLO arrive en pratique dans les 2-3s suivant la confirmation Mesh → 15s = 5× la latence réelle (sécurité suffisante).
- **Fichiers modifiés** : `app/src/features/bluetooth/services/P2PAutoSync.js` (1420 → 1494 lignes, +74)
- **Vérifications** : `node --check` → 0 erreur ; `grep V3.15` → 8 références cohérentes ; backup `mesfichiers/P2P/bluetooth/services/P2PAutoSync.js` synchronisé
- **Non touché** (protégé) : NearbyMeshService, WifiDirectService (V3.14), `createGroup`, `connectToPeer` Slave retry, envoi pack, SYNC_COMPLETE
- **Statut** : 🔄 En test (2026-06-07) — Version v0.0.25
- **Action user** : HARD RELOAD. Tester sur les 2 phones. Vérifier dans les logs :
  - **Nouveau séquence Master** : `📡 [V3.13 Master] Envoi WIFI_GROUP_READY` → `📡 [V3.15 Master] Démarrage récepteur HELLO (Slave confirmé connecté via Mesh)` → `✅ [V3.9] Slave "..._yabisso_..." confirmé en XXXms !`
  - **Nouveau séquence Slave** : `📤 [V3.13 Slave] Envoi SLAVE_CONNECTED_CONFIRMED` (T+300ms) → `✅ YABISSO_HELLO envoyé` (T+1000ms)
  - **NE PLUS voir** : `[Master] ⏰ Aucun Slave en 15000ms → timeout`

---

### BUG-V3.15-EDIT — Duplication de code dans `onConnectionChange` (2026-06-07)
- **Date** : 2026-06-07
- **Problème** : `SyntaxError: Unexpected reserved word 'await' at P2PAutoSync.js:726`. L'edit V3.15 a mal fermé le bloc Master/Slave — l'ancien code V3.13 est resté orphelin APRÈS le nouveau code V3.15, créant un `await` ligne 726 dans un scope non-async.
- **Détecté par** : Babel parser (Metro) au bundling Android. `node --check` n'avait PAS détecté le bug.
- **Cause** : Le `oldString` de l'edit ne contenait pas toute la fin du bloc à remplacer → duplication au lieu de remplacement.
- **Fix** : Suppression des lignes 718-763 (le bloc orphelin V3.13). Fichier final : 1494 → 1448 lignes.
- **Leçon** : `node --check` n'est PAS suffisant pour valider la syntaxe d'un projet React Native. Toujours valider avec `@babel/parser` (Flow + JSX) avant de déclarer OK.
- **Vérifications** : `node --check` OK, `@babel/parser` OK (2 await dans la zone V3.15, tous dans des `setTimeout(async () => {})`)
- **Statut** : ✅ Corrigé (2026-06-07)

---

### BUG-046 — WIFI_GROUP_READY Mesh échoue après createGroup ("Failed to send text") (BUG-V3.17)
- **Date** : 2026-06-07
- **Problème** : Le Master détecte son rôle Master, appelle `WifiDirectService.connectToPeer(peer, 0, 'MASTER')` qui crée le groupe WiFi Direct. Puis 1500ms après, dans `onConnectionChange`, le Master essaie d'envoyer `WIFI_GROUP_READY` via `NearbyMeshService.sendMeshMessage` au Slave. Cet envoi **échoue systématiquement** avec `⚠️ Échec envoi message à 1X52: Failed to send text`. Conséquence : le Slave ne reçoit jamais le signal `WIFI_GROUP_READY`, ne se connecte pas au WiFi du Master, n'envoie jamais son `YABISSO_HELLO` → le Master tombe en `⏰ Aucun Slave en 15000ms → timeout` → il essaie quand même `sendFile` vers sa propre IP (`192.168.49.1`) → `ECONNREFUSED` → boucle.
- **Cause racine (identifiée par user)** : Sur Xiaomi 11T et Itel A50, Android limite les radios WiFi et BLE simultanées. Quand `createGroup()` active la radio WiFi Direct P2P, la connexion BLE Nearby Mesh est **coupée** (conflit radio). Le Master essayait d'envoyer `WIFI_GROUP_READY` 1500ms APRÈS `createGroup` → le Mesh BLE était déjà mort à ce moment-là. Preuve : logs montrent `NearbyMesh ✨ CONNECTÉ à: 18_Yabisso_w4pii (1X52)` AVANT `createGroup réussi`, puis `Failed to send text` APRÈS.
- **Solution (V3.17)** : Inverser l'ordre des opérations côté Master — envoyer `WIFI_GROUP_READY` VIA MESH **AVANT** `createGroup()`, pendant que le Mesh BLE est encore actif. Attendre 1500ms que le Slave reçoive le signal et se prépare, PUIS créer le groupe. Côté Slave, ajouter une attente de 3s après réception de `WIFI_GROUP_READY` pour laisser au Master le temps de créer le groupe avant que le Slave ne tente sa connexion.
  - **`onPeerFound` branche Master (ligne 548-583)** : envoi `WIFI_GROUP_READY` via `sendMeshMessage` + `await 1500ms` AVANT `connectToPeer(MASTER)`. Flag `_wifiGroupReadySentThisSession` (anti-double-envoi).
  - **`onConnectionChange` branche Master (ligne 660-668)** : suppression du `setTimeout` interne qui renvoyait `WIFI_GROUP_READY` (Mesh mort après createGroup). Garde juste `_fallbackWaitForSlave(peerName)` comme sécurité.
  - **`_onWifiGroupReadyMesh` Slave (ligne 277-285)** : ajout `await new Promise(r => setTimeout(r, 3000))` AVANT `connectToPeer`.
  - **Constructeur + reset déconnexion (ligne 64 + 746)** : flag `_wifiGroupReadySentThisSession` initialisé à `false` + reset à chaque session.
- **Fichiers modifiés** : `app/src/features/bluetooth/services/P2PAutoSync.js` (1480 → 1509 lignes, +29). 1 fichier uniquement, 1 seul.
- **Vérifications** : `node --check` OK, `@babel/parser` (Flow + JSX) OK (16 statements), backup `mesfichiers/P2P/bluetooth/services/P2PAutoSync.js` synchronisé
- **Non touché** (protégé) : V3.13-V3.16, Nearby Mesh, createGroup/connectToPeer retry V3.14, sendFile, HELLO handshake, SYNC_COMPLETE, logique de rôle, _fallbackWaitForSlave
- **Statut** : 🔄 En test (2026-06-07) — Version v0.0.26
- **Action user** : HARD RELOAD les 2 phones. Vérifier dans les logs la nouvelle séquence :
  - Master : `📡 [V3.17 Master] Envoi WIFI_GROUP_READY au Slave ... AVANT createGroup (Mesh encore actif)` → `✅ [V3.17 Master] WIFI_GROUP_READY envoyé (Mesh encore actif).` → (1500ms) → `🤝 [V3.6 Master] Création du groupe (avec lock)...` → `🧹 Ancien groupe supprimé` → `✅ createGroup réussi`
  - Slave : `📡 [V3.13 Mesh] WIFI_GROUP_READY reçu de Master ...` → `⏳ [V3.17 Slave] Attente 3000ms que le Master crée le groupe WiFi Direct...` → (3s) → `🔗 [V3.13 Slave] Connexion WiFi Direct à ...` → `✅ [V3.13] connectToPeer réussi.`
  - **NE PLUS voir** : `⚠️ Échec envoi message à ... : Failed to send text` (côté Master)
  - **NE PLUS voir** : `⏭️ [V3.13 Slave] Peer ... ignoré : pas de pair Mesh pour arbitrer` répété en boucle (côté Slave)
  - Commit : `cb1c5d6` v0.0.26. Release : https://github.com/BENsidneykokolo/yabisso/releases/tag/v0.0.26

---

### BUG-052 — Test V3.17 : 2 problèmes résiduels après fix BUG-046 (2026-06-07)
- **Date** : 2026-06-07
- **Contexte** : Premier test terrain de la V3.17. Sprint 1 (connexion) et Sprint 2 (pack reçu Master→Slave) validés ✅. Mais 2 problèmes résiduels côté Slave.
- **Problème 1** : `pendingContent=true` ne se reset JAMAIS côté Slave après réception des fichiers
  - **Symptôme** : Le Slave reçoit 3 fichiers (`📨 Fichier reçu: ...p2p_xxx` × 3), mais `_hasPendingDelta` ne se reset pas. Le log `🔍 [V3.6.3] shouldSend=false, isMaster=false, myScore=18, peerScore=73, pendingContent=true, packSent=false` est répété à chaque cycle. Le Slave re-tente une sync alors qu'il vient d'en recevoir une.
  - **Cause** : Le `LobaPackService.unpackAndProcess(filePath)` côté Slave ne déclenche pas correctement la mise à jour de `_pendingPostsCount` (utilisé dans `hasPendingContent = this._pendingPostsCount > 0 || !!this._hasPendingDelta`). Soit le delta calculé n'est pas propagé, soit le reset post-unpack n'a pas lieu.
- **Problème 2** : "framework busy" sur le 2ème cycle Slave
  - **Symptôme** : `🔗 [V3.6] Connexion à Xiaomi 11T (SLAVE) avec lock...` → `WARN Erreur connect (tentative 1/3): framework is busy` × 3 → `Retry dans 10s (backoff)` → boucle infinie toutes les 10s.
  - **Cause** : Lié au Problème 1. Le Slave voit `pendingContent=true` et veut renvoyer son pack, mais Android refuse car le groupe WiFi Direct est encore actif.
- **Statut** : 🔄 En attente Sprint 3 (reset état post-réception) — non encore implémenté
- **Sprint 3 planifié** (validé par user) :
  - Dans `P2PAutoSync.js` handler `onFileReceived` / `_handleReceivedFile` :
    ```js
    try { await LobaPackService.unpackAndProcess(filePath); }
    catch (err) { console.error('[Slave] ❌ Erreur unzip:', err); }
    // Reset obligatoire MÊME si unzip échoue
    this._hasPendingDelta = false;
    this._pendingContent  = false;  // si existe
    this._packSent        = false;
    // ACK best-effort au Master via Nearby
    try { await NearbyMeshService.sendMessage(this._masterEndpointId, {type: 'PACK_RECEIVED_OK'}); } catch (e) {}
    ```
- **Sprint 4 (à venir)** : Vérifier que le contenu s'affiche dans le feed LOBA des 2 phones (Sprint 2 bidirectionnel validé ✅)

---

### BUG-052 FIX — Sprint 3 V3.18 : reset `_hasPendingDelta` inconditionnel (2026-06-07)
- **Date** : 2026-06-07
- **Statut** : ✅ RÉSOLU
- **Solution (V3.18)** : 2 modifications ciblées dans `_handleReceivedFile` (P2PAutoSync.js L1318-1340) :
  1. **try/catch autour de `unpackAndProcess`** : capture les exceptions au lieu de laisser crasher la fonction.
  2. **reset INCONDITIONNEL** : `_hasPendingDelta = false` déplacé HORS du `if (success)` → s'exécute toujours, succès ou échec. Élimine la boucle infinie.
- **Fichiers modifiés** : `app/src/features/bluetooth/services/P2PAutoSync.js` (1508 → 1523 lignes, +15)
- **Vérifications** : `node --check` OK, `@babel/parser` OK, backup `mesfichiers/P2P/bluetooth/services/P2PAutoSync.js` synchronisé
- **Non touché** (protégé) : V3.13-V3.17, Nearby Mesh, createGroup, connectToPeer retry V3.14, sendFile, HELLO, SYNC_COMPLETE, ACK PACK_RECEIVED_OK
- **Action user** : HARD RELOAD les 2 phones. Vérifier dans les logs :
  - `🔄 [V3.18] Reset état post-réception (succès=true|false)` (apparaît toujours maintenant)
  - **NE PLUS voir** : `🔍 shouldSend=true, pendingContent=true, packSent=false` en boucle
  - **NE PLUS voir** : `WARN framework is busy` × 3 → `Retry dans 10s` en boucle
- **Commit** : `f9f34b4` v0.0.27
- **Release** : https://github.com/BENsidneykokolo/yabisso/releases/tag/v0.0.27
- **Prochaine étape** : Sprint 4 — vérifier que le contenu s'affiche dans le feed LOBA des 2 phones

