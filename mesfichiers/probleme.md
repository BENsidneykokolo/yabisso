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

---

## Exigences sécurité critiques (non négociables)
- Signatures **Ed25519** pour toutes les transactions
- Chiffrement **XChaCha20** pour données sensibles (SMS, DB)
- **Nonce anti-rejeu** + idempotence sur toutes les actions critiques
- **Seuil offline max 5 000 FCFA** (jamais dépassable côté app)
- **Pas de cash-out** pour les points Yabisso
