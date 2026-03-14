# BLE P2P — Guide d'installation Yabisso (Phase 1)

## 1. Installer la librairie

```bash
npx expo install react-native-ble-plx
```

## 2. Mettre à jour app.json

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-ble-plx",
        {
          "isBackgroundEnabled": false,
          "modes": ["peripheral", "central"],
          "bluetoothAlwaysPermission": "Autoriser Yabisso à utiliser le Bluetooth pour les inscriptions offline"
        }
      ]
    ],
    "android": {
      "permissions": [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_ADVERTISE",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

## 3. Rebuild EAS (obligatoire — module natif)

```bash
eas build --profile development --platform android
```

## 4. Brancher les screens dans le navigateur

```js
// Dans AuthNavigator ou AppNavigator (selon votre structure)
import { BleSignupScreen, BleKioskScreen } from '../features/bluetooth';

// Dans la stack:
<Stack.Screen name="BleSignup"  component={BleSignupScreen} />
<Stack.Screen name="BleKiosk"   component={BleKioskScreen}  />
```

## 5. Appeler BleSignupScreen depuis QrSignupScreen (fallback)

Dans QrSignupScreen.js, ajoutez un bouton de fallback BLE :

```js
// Construire le signupPayload (même structure que QR)
const signupPayload = {
  version: 1,
  action: 'signup',
  phone: userPhone,
  device_id: deviceId,        // depuis expo-constants
  public_key: publicKeyB64,   // depuis SecureStore (tweetnacl)
  signup_nonce: nonce,
  timestamp: Date.now(),
  channel: 'p2p',
  signature: signatureB64,    // Ed25519
};

// Navigation
navigation.navigate('BleSignup', { signupPayload });
```

## 6. Structure des fichiers créés

```
app/src/features/bluetooth/
├── index.js                          ← exports nommés
├── hooks/
│   └── useBleP2P.js                  ← hook principal (state machine BLE)
├── services/
│   ├── BlePermissionsService.js      ← permissions Android/iOS
│   └── BleSignupService.js           ← encode/decode payload + validation
└── screens/
    ├── BleSignupScreen.js            ← côté USER (sender)
    └── BleKioskScreen.js             ← côté KIOSQUE (receiver/validator)
```

## 7. Flow complet Phase 1

```
USER (BleSignupScreen)          KIOSQUE (BleKioskScreen)
        │                               │
        │  startAsSender(payload)       │  startListening()
        │                               │
        │──── BLE Scan ────────────────▶│
        │                               │
        │◀─── Connect + Discover ───────│
        │                               │
        │──── Write chunks SIGNUP ─────▶│  Reconstruit payload
        │                               │  Valide signature + TTL
        │                               │  → status: VALIDATING
        │                               │  [Admin clique "Valider"]
        │                               │  Génère verification_token
        │◀─── Write ACK (token) ────────│
        │                               │
   status: SUCCESS                 status: VALIDATED
   Stocke token local              Stocke profil local
   → navigate Home                 (WatermelonDB)
```

## 8. Limites Phase 1 (à améliorer en Phase 3)

- **Peripheral mode** : react-native-ble-plx v3+ supporte le mode peripheral sur Android.
  Pour iOS, il faut `react-native-ble-advertiser` en plus.
- **Mesh multi-hop** : reporté en Phase 3 (mesh custom sur ble-plx).
- **Validation manuelle** : en Phase 1 le kiosque valide manuellement.
  En Phase 2, la validation sera automatique (signature Ed25519 vérifiée).
- **ACK write-back** : en Phase 1, le token est affiché manuellement.
  En Phase 2, le kiosque écrit directement dans ACK_CHAR_UUID.

## 9. Dépendances à ajouter pour Phase 2

```bash
# Chiffrement Ed25519 (déjà dans le plan Yabisso)
npm install tweetnacl tweetnacl-util

# Buffer pour encode/decode
npm install buffer
```

Et dans index.js de votre app :
```js
import { Buffer } from 'buffer';
global.Buffer = Buffer;
```
