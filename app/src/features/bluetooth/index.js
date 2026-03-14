// app/src/features/bluetooth/index.js
// Exports nommés Yabisso BLE P2P — Phase 1
export { useBleP2P, BLE_STATE, BLE_ROLE, YABISSO_SERVICE_UUID } from './hooks/useBleP2P';
export { BleSignupService }    from './services/BleSignupService';
export { BlePermissionsService } from './services/BlePermissionsService';
export { default as BleSignupScreen } from './screens/BleSignupScreen';
export { default as BleKioskScreen  } from './screens/BleKioskScreen';
