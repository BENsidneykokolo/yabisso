# Plan d'implémentation — Résolution du bug critique EHOSTUNREACH P2P

Le but de cette modification est de corriger l'erreur de connexion `EHOSTUNREACH` lors du transfert WiFi Direct entre le Master (Group Owner) et le Slave (Client). 

## Rationale & Rétrospective

### Le Problème
Le Master (GO) a une IP statique connue (`192.168.49.1`). Le Slave (Client) se voit attribuer une IP dynamique par le Master dans la plage `192.168.49.x`.
Pour lui envoyer le pack, le Master doit connaître l'IP du Slave. Actuellement, la méthode native `getP2pLocalIp` échoue avec `is not a function` car l'APK installé sur l'appareil de test n'a pas été recompilé après l'ajout de ces méthodes natives Java.
En conséquence, le Slave envoie une IP nulle au Master lors du handshake BLE Mesh, et le Master utilise l'adresse IP par défaut `192.168.49.2` (qui n'est pas forcément l'adresse attribuée au Slave par le serveur DHCP, provoquant un échec de routage `EHOSTUNREACH`).

### La Solution
Nous allons utiliser `@react-native-community/netinfo` pour récupérer l'adresse IP locale réelle de l'appareil (Slave) lorsqu'il est connecté au WiFi Direct. 
Sur Android, l'interface WiFi Direct est traitée comme une interface réseau WiFi par le système. NetInfo permet d'obtenir l'adresse IP locale (`details.ipAddress`) de la connexion WiFi active. Si cette IP commence par `192.168.49.`, nous savons qu'il s'agit de la bonne IP affectée par le WiFi Direct.
Nous allons aussi isoler les appels natifs `getP2pLocalIp` et `getP2pIpAddress` dans des blocs `try-catch` séparés dans `getLocalP2pIp()` pour s'assurer que si la méthode n'est pas définie dans l'APK natif actuel, le flux continue correctement vers les fallbacks au lieu de planter la méthode complète.

---

## Modifications proposées

### [Component] Bluetooth Services

#### [MODIFY] [WifiDirectService.js](file:///c:/Users/Utilisateur/Documents/Ben/myapp/yabisso/app/src/features/bluetooth/services/WifiDirectService.js)

1. Importer `NetInfo` depuis `@react-native-community/netinfo`.
2. Importer `NativeModules` depuis `react-native`.
3. Réécrire la méthode `getLocalP2pIp()` pour :
   - Tester l'existence et appeler individuellement `NativeModules.WiFiP2PManagerModule.getP2pLocalIp` dans son propre `try-catch`.
   - Tester l'existence et appeler individuellement `NativeModules.WiFiP2PManagerModule.getP2pIpAddress` dans son propre `try-catch`.
   - Utiliser `NetInfo.fetch()` comme ultime recours en JS pur. Si le type de connexion est `'wifi'` et que `state.details.ipAddress` commence par `'192.168.49.'`, utiliser cette adresse.

---

## Plan de vérification

### Vérification manuelle
1. Démarrer l'application sur les deux téléphones (Master + Slave).
2. Lancer la synchronisation P2P.
3. Observer les logs Metro :
   - Côté Slave : Le log `IP locale p2p via NetInfo: 192.168.49.X` doit apparaître s'il n'y a pas de méthode native compilée.
   - Côté Master : Le log `IP Slave reçue via Mesh` ou `IP Slave via Mesh HELLO` doit recevoir la bonne adresse IP dynamique.
   - Le transfert du pack doit réussir sans `EHOSTUNREACH`.
