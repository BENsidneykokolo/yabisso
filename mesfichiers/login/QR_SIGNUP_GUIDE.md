# QR Signup Offline — Guide d'intégration Yabisso

## Flow complet

```
USER (QrSignupScreen)                   KIOSQUE (KioskValidationScreen)
        │                                           │
  Signup offline complété                    Kiosque ouvert
  generateUserQr() → QR affiché             btnBigScan pressé → caméra active
        │                                           │
        │ ─── se déplace au kiosque ──────────────▶│
        │                                           │
        │           Kiosque scanne le QR user       │
        │           validateUserQr() ─── ✓          │
        │           generateKioskAckQr()             │
        │           SyncQueueService.enqueue() ─────│─── WatermelonDB kiosque
        │                                           │
        │◀── Kiosque affiche son QR ACK ────────────│
        │                                           │
  User scanne le QR ACK                             │
  activateFromKioskQr() ─── ✓                      │
  status → 'active'                                 │
  QR user invalidé (usage unique consommé)          │
  SyncQueueService.enqueue() ────────── WatermelonDB user
        │                                           │
        ▼                                           ▼
  navigate('Home')                        "Valider suivant"
        │                                           │
  [Plus tard, internet disponible]                  │
        │                                           │
  SyncEngine → Supabase                  SyncEngine → Supabase
  Supabase vérifie:                       Supabase reçoit:
  - signature Ed25519                     - kiosk_validate_user
  - nonce non dupliqué                    - qui a validé quoi, quand
  - kiosk_id valide                       - audit trail complet
  profile.status → 'active'
```

## Structure des fichiers

```
app/src/features/
├── auth/
│   ├── screens/
│   │   └── QrSignupScreen.js           ← côté USER (ce fichier)
│   └── services/
│       └── QrSignupService.js          ← logique métier partagée
└── kiosk/
    └── screens/
        └── KioskValidationScreen.js    ← côté KIOSQUE (ce fichier)
```

## 1. Installer les dépendances

```bash
npx expo install react-native-qrcode-svg
npx expo install expo-camera
npm install buffer
```

## 2. app.json — permissions caméra

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Yabisso a besoin de la caméra pour scanner les QR codes"
        }
      ]
    ]
  }
}
```

## 3. Polyfill Buffer (index.js ou App.js, tout en haut)

```js
import { Buffer } from 'buffer';
global.Buffer = Buffer;
```

## 4. Navigation — brancher les écrans

```js
// Dans AuthNavigator ou AppNavigator
import QrSignupScreen         from '../features/auth/screens/QrSignupScreen';
import KioskValidationScreen  from '../features/kiosk/screens/KioskValidationScreen';

// Stack
<Stack.Screen name="QrSignup"          component={QrSignupScreen} />
<Stack.Screen name="KioskValidation"   component={KioskValidationScreen} />
```

## 5. Appel depuis SignupScreen (fin du signup offline)

```js
// Dans SignupScreen.js, après création profil local WatermelonDB:
navigation.navigate('QrSignup', {
  phone:       userPhone,
  deviceId:    deviceId,      // expo-constants
  publicKey:   pubKeyB64,     // SecureStore (tweetnacl)
  privateKey:  privKeyB64,    // SecureStore (tweetnacl) — pour signer
  displayName: userName,
});
```

## 6. Payload QR — structure complète

### QR Utilisateur (action: 'user_signup')
```json
{
  "version": 1,
  "action": "user_signup",
  "phone": "+242 06 000 0000",
  "device_id": "abc123",
  "public_key": "base64_ed25519_pubkey",
  "display_name": "Jean Dupont",
  "signup_nonce": "a1b2c3d4e5f6...",
  "timestamp": 1714000000000,
  "channel": "qr",
  "signature": "base64_ed25519_signature"
}
```

### QR Kiosque ACK (action: 'kiosk_ack')
```json
{
  "version": 1,
  "action": "kiosk_ack",
  "phone": "+242 06 000 0000",
  "device_id": "abc123",
  "original_nonce": "a1b2c3d4e5f6...",
  "kiosk_id": "kiosk_xyz",
  "verification_token": "TOKEN32CHARS",
  "validated_at": 1714000060000,
  "signature": "base64_kiosk_signature"
}
```

## 7. SyncQueue — ce qui est enregistré

### Côté USER (dans sync_queue WatermelonDB):
```json
{
  "action": "create_profile",
  "profile": {
    "status": "validated_by_kiosk",
    "kiosk_id": "kiosk_xyz",
    "verification_token": "TOKEN32CHARS"
  },
  "signup": {
    "channel": "qr",
    "signature": "...",
    "validated_at": 1714000060000
  }
}
```

### Côté KIOSQUE (dans sync_queue WatermelonDB):
```json
{
  "action": "kiosk_validate_user",
  "validation": {
    "phone": "+242 06 000 0000",
    "kiosk_id": "kiosk_xyz",
    "verification_token": "TOKEN32CHARS",
    "validated_at": 1714000060000,
    "user_signature": "..."
  }
}
```

## 8. Supabase — ce qui se passe au sync

Quand les deux appareils reviennent en ligne, Supabase:
1. Reçoit `create_profile` du user → vérifie signature + nonce unique → crée profil
2. Reçoit `kiosk_validate_user` du kiosque → crée enregistrement d'audit
3. Vérifie que le `kiosk_id` dans les deux payloads correspond
4. Vérifie que le `verification_token` est identique des deux côtés
5. Met `profiles.status = 'active'` + `profiles.kiosk_id = 'kiosk_xyz'`

## 9. Sécurité Phase 2 — Ed25519 réel (tweetnacl)

Remplacer dans `QrSignupService.js` les méthodes `_sign` et `_verify`:

```js
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8 } from 'tweetnacl-util';

_sign(payload, privateKeyB64) {
  const { signature: _, ...payloadWithoutSig } = payload;
  const message = encodeUTF8(JSON.stringify(payloadWithoutSig));
  const privKey = decodeBase64(privateKeyB64);
  const sig     = nacl.sign.detached(message, privKey);
  return encodeBase64(sig);
},

_verify(payload, publicKeyB64) {
  const { signature, ...payloadWithoutSig } = payload;
  const message = encodeUTF8(JSON.stringify(payloadWithoutSig));
  const pubKey  = decodeBase64(publicKeyB64);
  const sig     = decodeBase64(signature);
  return nacl.sign.detached.verify(message, sig, pubKey);
},
```

## 10. Rebuild EAS (obligatoire — expo-camera natif)

```bash
eas build --profile development --platform android
```
