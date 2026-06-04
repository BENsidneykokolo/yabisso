// app/src/features/bluetooth/services/NetworkPermissionsService.js
import { Platform, PermissionsAndroid } from 'react-native';

export const NetworkPermissionsService = {
  /**
   * Demande toutes les permissions nécessaires selon la version Android (WiFi + BLE)
   */
  async requestAll() {
    if (Platform.OS === 'ios') return true;

    const apiLevel = Platform.Version;
    console.log(`[NetworkPermissionsService] Demande des permissions pour API ${apiLevel}...`);

    const mandatoryWifi = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];
    
    if (apiLevel >= 33) {
      mandatoryWifi.push(PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES);
    }

    const optionalBle = [
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    ];

    // 1. Demander les permissions WiFi (Mandatoires pour P2P)
    const wifiResults = await PermissionsAndroid.requestMultiple(mandatoryWifi);
    const wifiGranted = mandatoryWifi.every(p => wifiResults[p] === PermissionsAndroid.RESULTS.GRANTED);

    if (!wifiGranted) {
      const denied = mandatoryWifi.filter(p => wifiResults[p] !== PermissionsAndroid.RESULTS.GRANTED);
      console.error('[NetworkPermissionsService] Permissions WiFi CRITIQUES refusées:', denied);
      return false;
    }

    // 2. Demander les permissions BLE (Facultatives pour les packs, mais bien pour le Mesh)
    if (apiLevel >= 31) {
      try {
        const bleResults = await PermissionsAndroid.requestMultiple(optionalBle);
        const bleGranted = optionalBle.every(p => bleResults[p] === PermissionsAndroid.RESULTS.GRANTED);
        if (!bleGranted) {
           console.warn('[NetworkPermissionsService] Certaines permissions Bluetooth ont été refusées. Le mode Mesh sera limité.');
        }
      } catch (err) {
        console.warn('[NetworkPermissionsService] Erreur lors de la demande Bluetooth (ignoré):', err.message);
      }
    }

    console.log('[NetworkPermissionsService] Permissions WiFi accordées. Prêt pour P2P.');
    return true;
  },

  async checkAll() {
    if (Platform.OS === 'ios') return true;
    const apiLevel = Platform.Version;

    const perms = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
    if (apiLevel >= 31) {
      perms.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
      perms.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      perms.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE);
    }
    if (apiLevel >= 33) {
      perms.push(PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES);
    }

    const results = await Promise.all(perms.map(p => PermissionsAndroid.check(p)));
    return results.every(r => r === true);
  },
};
