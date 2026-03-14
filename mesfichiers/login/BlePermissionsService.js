// app/src/features/bluetooth/services/BlePermissionsService.js
import { Platform, PermissionsAndroid } from 'react-native';

export const BlePermissionsService = {
  /**
   * Demande toutes les permissions nécessaires selon la version Android
   * iOS: les permissions sont dans Info.plist (app.json plugin)
   */
  async requestAll() {
    if (Platform.OS === 'ios') return true;

    const apiLevel = Platform.Version;

    // Android 12+ (API 31+) : nouvelles permissions BLUETOOTH_*
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

    // Android 6-11 : location seule pour BLE
    const loc = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Bluetooth requis',
        message: 'Yabisso a besoin de la localisation pour le Bluetooth.',
        buttonPositive: 'Autoriser',
        buttonNegative: 'Refuser',
      }
    );

    return loc === PermissionsAndroid.RESULTS.GRANTED;
  },

  async checkAll() {
    if (Platform.OS === 'ios') return true;
    const apiLevel = Platform.Version;

    if (apiLevel >= 31) {
      const [scan, connect, advertise, loc] = await Promise.all([
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN),
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT),
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE),
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
      ]);
      return scan && connect && advertise && loc;
    }

    return PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
  },
};
