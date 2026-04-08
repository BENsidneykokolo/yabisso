// app/src/features/bluetooth/services/NetworkPermissionsService.js
import { Platform, PermissionsAndroid } from 'react-native';

export const NetworkPermissionsService = {
  /**
   * Demande toutes les permissions nécessaires selon la version Android (WiFi + BLE)
   */
  async requestAll() {
    if (Platform.OS === 'ios') return true;

    const apiLevel = Platform.Version;

    // Permissions communes pour WiFi Direct et BLE (Android 13+)
    if (apiLevel >= 33) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
      ]);

      return Object.values(results).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED
      );
    }

    // Android 12 (API 31-32)
    if (apiLevel >= 31) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return Object.values(results).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED
      );
    }

    // Android 6-11
    const loc = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permissions réseau requises',
        message: 'Yabisso a besoin de la localisation pour détecter les appareils à proximité via WiFi et Bluetooth.',
        buttonPositive: 'Autoriser',
        buttonNegative: 'Refuser',
      }
    );

    return loc === PermissionsAndroid.RESULTS.GRANTED;
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
