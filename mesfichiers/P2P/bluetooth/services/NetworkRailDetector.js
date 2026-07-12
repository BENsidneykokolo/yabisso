// app/src/features/bluetooth/services/NetworkRailDetector.js
import NetInfo from '@react-native-community/netinfo';

/**
 * NetworkRailDetector
 * Détecte intelligemment les rails de transport disponibles.
 * Permet d'avoir plusieurs rails actifs (ex: Internet + P2P) pour optimiser les coûts.
 */

export const RAIL_TYPES = {
  INTERNET: 'internet',
  WIFI_DIRECT: 'wifi_direct',
  BLE_MESH: 'ble_mesh',
  OFFLINE: 'offline',
};

class NetworkRailDetectorClass {
  constructor() {
    this.activeRails = new Set([RAIL_TYPES.OFFLINE]);
    this.listeners = [];
    this._unsubscribeNetInfo = null;
    this._wifiDirectAvailable = false;
    this._bleAvailable = false;
  }

  /**
   * Démarre la détection automatique.
   */
  start() {
    this._unsubscribeNetInfo = NetInfo.addEventListener(state => {
      this._evaluateRails(state);
    });
    console.log('[NetworkRailDetector] Démarré.');
  }

  /**
   * Arrête la détection.
   */
  stop() {
    if (this._unsubscribeNetInfo) {
      this._unsubscribeNetInfo();
      this._unsubscribeNetInfo = null;
    }
  }

  /**
   * Signale que le WiFi Direct est disponible.
   */
  setWifiDirectAvailable(available) {
    this._wifiDirectAvailable = available;
    this._evaluateRailsManual();
  }

  /**
   * Signale que le BLE est disponible.
   */
  setBleAvailable(available) {
    this._bleAvailable = available;
    this._evaluateRailsManual();
  }

  /**
   * Évalue tous les rails disponibles.
   */
  _evaluateRails(netInfoState) {
    const newRails = new Set();

    // RAIL INTERNET
    if (netInfoState.isConnected && netInfoState.isInternetReachable) {
      newRails.add(RAIL_TYPES.INTERNET);
    }

    // RAIL WIFI DIRECT
    if (this._wifiDirectAvailable) {
      newRails.add(RAIL_TYPES.WIFI_DIRECT);
    }

    // RAIL BLE MESH
    if (this._bleAvailable) {
      newRails.add(RAIL_TYPES.BLE_MESH);
    }

    // OFFLINE si aucun autre
    if (newRails.size === 0) {
      newRails.add(RAIL_TYPES.OFFLINE);
    }

    // Comparer les sets
    if (!this._areSetsEqual(newRails, this.activeRails)) {
      this.activeRails = newRails;
      console.log('[NetworkRailDetector] Rails actifs:', Array.from(this.activeRails));
      this._notifyListeners();
    }
  }

  /**
   * Réévalue sans state NetInfo.
   */
  async _evaluateRailsManual() {
    const netState = await NetInfo.fetch();
    this._evaluateRails(netState);
  }

  /**
   * Retourne le meilleur rail disponible selon une priorité donnée.
   * Si costOptimization est true, on préfère le P2P (WiFi Direct > BLE) même si l'internet est là.
   */
  getBestRail(costOptimization = false) {
    if (costOptimization) {
      if (this.activeRails.has(RAIL_TYPES.WIFI_DIRECT)) return RAIL_TYPES.WIFI_DIRECT;
      if (this.activeRails.has(RAIL_TYPES.BLE_MESH)) return RAIL_TYPES.BLE_MESH;
      if (this.activeRails.has(RAIL_TYPES.INTERNET)) return RAIL_TYPES.INTERNET;
    } else {
      if (this.activeRails.has(RAIL_TYPES.INTERNET)) return RAIL_TYPES.INTERNET;
      if (this.activeRails.has(RAIL_TYPES.WIFI_DIRECT)) return RAIL_TYPES.WIFI_DIRECT;
      if (this.activeRails.has(RAIL_TYPES.BLE_MESH)) return RAIL_TYPES.BLE_MESH;
    }
    return RAIL_TYPES.OFFLINE;
  }

  /**
   * Vérifie si l'utilisateur est vraiment offline.
   */
  isOffline() {
    return this.activeRails.has(RAIL_TYPES.OFFLINE);
  }

  /**
   * Helper pour comparer deux Sets.
   */
  _areSetsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const val of a) if (!b.has(val)) return false;
    return true;
  }

  /**
   * Écouter les changements.
   */
  onRailChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  _notifyListeners() {
    this.listeners.forEach(cb => cb(Array.from(this.activeRails)));
  }

  /**
   * Retourne la taille max autorisée pour un rail spécifique.
   */
  getMaxSizeForRail(rail) {
    switch (rail) {
      case RAIL_TYPES.INTERNET:
      case RAIL_TYPES.WIFI_DIRECT:
        return Infinity;
      case RAIL_TYPES.BLE_MESH:
        return 5 * 1024 * 1024; // 5 MB
      default:
        return 0;
    }
  }
}

export const NetworkRailDetector = new NetworkRailDetectorClass();
