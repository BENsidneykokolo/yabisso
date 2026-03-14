// app/src/features/bluetooth/hooks/useBleP2P.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { BleManager, State } from 'react-native-ble-plx';
import { BleSignupService } from '../services/BleSignupService';
import { BlePermissionsService } from '../services/BlePermissionsService';

// UUIDs Yabisso — fixes, partagés entre tous les appareils
export const YABISSO_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
export const SIGNUP_CHAR_UUID    = '12345678-1234-1234-1234-123456789abd';
export const ACK_CHAR_UUID       = '12345678-1234-1234-1234-123456789abe';

export const BLE_ROLE = {
  IDLE:     'IDLE',
  SENDER:   'SENDER',   // User qui veut s'inscrire
  RECEIVER: 'RECEIVER', // Kiosque / Admin qui valide
};

export const BLE_STATE = {
  IDLE:         'IDLE',
  REQUESTING_PERMISSIONS: 'REQUESTING_PERMISSIONS',
  SCANNING:     'SCANNING',
  ADVERTISING:  'ADVERTISING',
  CONNECTING:   'CONNECTING',
  CONNECTED:    'CONNECTED',
  SENDING:      'SENDING',
  WAITING_ACK:  'WAITING_ACK',
  RECEIVING:    'RECEIVING',
  SUCCESS:      'SUCCESS',
  ERROR:        'ERROR',
};

export function useBleP2P() {
  const managerRef   = useRef(null);
  const deviceRef    = useRef(null);
  const subRef       = useRef(null);

  const [bleState,   setBleState]   = useState(BLE_STATE.IDLE);
  const [role,       setRole]       = useState(BLE_ROLE.IDLE);
  const [peerDevice, setPeerDevice] = useState(null);
  const [error,      setError]      = useState(null);
  const [progress,   setProgress]   = useState(0); // 0-100
  const [lastPayload, setLastPayload] = useState(null);

  // Init BleManager une seule fois
  useEffect(() => {
    managerRef.current = new BleManager();
    return () => {
      _cleanup();
      managerRef.current?.destroy();
    };
  }, []);

  const _cleanup = useCallback(() => {
    subRef.current?.remove();
    subRef.current = null;
    deviceRef.current?.cancelConnection().catch(() => {});
    deviceRef.current = null;
    managerRef.current?.stopDeviceScan();
  }, []);

  const _setError = useCallback((msg) => {
    setError(msg);
    setBleState(BLE_STATE.ERROR);
    _cleanup();
  }, [_cleanup]);

  // ─────────────────────────────────────────────────────────────
  // SENDER : Scan + Connexion + Envoi payload signup
  // ─────────────────────────────────────────────────────────────
  const startAsSender = useCallback(async (signupPayload) => {
    setError(null);
    setRole(BLE_ROLE.SENDER);
    setBleState(BLE_STATE.REQUESTING_PERMISSIONS);
    setProgress(5);

    // 1) Permissions
    const granted = await BlePermissionsService.requestAll();
    if (!granted) {
      _setError('Permissions Bluetooth refusées');
      return;
    }

    // 2) Vérifier que le BLE est allumé
    const state = await managerRef.current.state();
    if (state !== State.PoweredOn) {
      _setError('Bluetooth désactivé. Activez-le et réessayez.');
      return;
    }

    setBleState(BLE_STATE.SCANNING);
    setProgress(20);

    // 3) Scanner les kiosques Yabisso
    let found = false;
    managerRef.current.startDeviceScan(
      [YABISSO_SERVICE_UUID],
      { allowDuplicates: false },
      async (err, device) => {
        if (err) { _setError(err.message); return; }
        if (!device || found) return;

        found = true;
        managerRef.current.stopDeviceScan();
        setPeerDevice({ id: device.id, name: device.name || 'Kiosque Yabisso' });
        setBleState(BLE_STATE.CONNECTING);
        setProgress(40);

        try {
          // 4) Connexion
          const connected = await device.connect({ autoConnect: false });
          const discovered = await connected.discoverAllServicesAndCharacteristics();
          deviceRef.current = discovered;
          setBleState(BLE_STATE.SENDING);
          setProgress(60);

          // 5) Encoder + envoyer le payload en chunks Base64
          const chunks = BleSignupService.encodePayload(signupPayload);
          for (let i = 0; i < chunks.length; i++) {
            await discovered.writeCharacteristicWithResponseForService(
              YABISSO_SERVICE_UUID,
              SIGNUP_CHAR_UUID,
              chunks[i]
            );
            setProgress(60 + Math.floor((i / chunks.length) * 25));
          }

          setBleState(BLE_STATE.WAITING_ACK);
          setProgress(85);

          // 6) Écouter l'ACK (verification_token)
          subRef.current = await discovered.monitorCharacteristicForService(
            YABISSO_SERVICE_UUID,
            ACK_CHAR_UUID,
            (monErr, char) => {
              if (monErr) { _setError(monErr.message); return; }
              const ack = BleSignupService.decodeAck(char.value);
              if (ack?.verification_token) {
                setLastPayload(ack);
                setProgress(100);
                setBleState(BLE_STATE.SUCCESS);
                _cleanup();
              }
            }
          );
        } catch (e) {
          _setError(e.message);
        }
      }
    );

    // Timeout scan 30s
    setTimeout(() => {
      if (!found) {
        managerRef.current?.stopDeviceScan();
        _setError('Aucun kiosque Yabisso trouvé. Approchez-vous et réessayez.');
      }
    }, 30000);
  }, [_cleanup, _setError]);

  // ─────────────────────────────────────────────────────────────
  // RECEIVER (Kiosque) : Advertise + Recevoir + Valider + ACK
  // ─────────────────────────────────────────────────────────────
  const startAsReceiver = useCallback(async (onPayloadReceived) => {
    setError(null);
    setRole(BLE_ROLE.RECEIVER);
    setBleState(BLE_STATE.REQUESTING_PERMISSIONS);
    setProgress(5);

    const granted = await BlePermissionsService.requestAll();
    if (!granted) { _setError('Permissions Bluetooth refusées'); return; }

    const state = await managerRef.current.state();
    if (state !== State.PoweredOn) { _setError('Bluetooth désactivé'); return; }

    // Note: react-native-ble-plx est peripheral-only sur iOS via CoreBluetooth
    // Sur Android on utilise le mode peripheral via l'API native
    // Pour Phase 1 on émet un signal détectable
    setBleState(BLE_STATE.ADVERTISING);
    setProgress(30);

    // Surveiller les connexions entrantes (mode peripheral simulé)
    // En Phase 1: le kiosque reste en mode scan avec filtre UUID connu
    // et attend que le SENDER initie la connexion
    setBleState(BLE_STATE.RECEIVING);
    setProgress(50);

    // Callback quand un payload valide est reçu et validé
    // Le vrai advertising peripheral nécessite le module natif BlePeripheral
    // Pour Phase 1: on passe par le Kiosque QR comme validateur principal
    // BLE simple: le kiosque SCAN aussi et le SENDER advertise son UUID

    console.log('[BLE Receiver] En attente de connexion SENDER...');

    // Pour Phase 1, le Kiosque utilise le QrSignupScreen comme fallback
    // Le BLE P2P pur (peripheral mode) sera activé en Phase 3
    // avec react-native-ble-advertiser
    if (onPayloadReceived) {
      onPayloadReceived({ status: 'waiting', role: 'receiver' });
    }
  }, [_cleanup, _setError]);

  const reset = useCallback(() => {
    _cleanup();
    setBleState(BLE_STATE.IDLE);
    setRole(BLE_ROLE.IDLE);
    setPeerDevice(null);
    setError(null);
    setProgress(0);
    setLastPayload(null);
  }, [_cleanup]);

  return {
    bleState,
    role,
    peerDevice,
    error,
    progress,
    lastPayload,
    startAsSender,
    startAsReceiver,
    reset,
    isIdle:      bleState === BLE_STATE.IDLE,
    isScanning:  bleState === BLE_STATE.SCANNING,
    isConnected: bleState === BLE_STATE.CONNECTED || bleState === BLE_STATE.SENDING || bleState === BLE_STATE.WAITING_ACK,
    isSuccess:   bleState === BLE_STATE.SUCCESS,
    isError:     bleState === BLE_STATE.ERROR,
  };
}
