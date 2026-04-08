// app/src/features/bluetooth/hooks/useWifiDirect.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { WifiDirectService } from '../services/WifiDirectService';

/**
 * Hook React pour l'UI WiFi Direct.
 * Expose l'état courant : peers, connexion, transferts.
 */
export function useWifiDirect() {
  const [state, setState] = useState({
    initialized: false,
    isDiscovering: false,
    peers: [],
    connectedPeer: null,
    isAvailable: false,
  });
  const [transferProgress, setTransferProgress] = useState(null);
  const unsubscribesRef = useRef([]);

  useEffect(() => {
    // Initialisation au montage
    const init = async () => {
      const ok = await WifiDirectService.initialize();
      if (ok) {
        setState(WifiDirectService.getState());
        WifiDirectService.startDiscovery();
      }
    };
    init();

    // Écouter les événements
    const unsub1 = WifiDirectService.on('onPeerFound', () => {
      setState(WifiDirectService.getState());
    });
    const unsub2 = WifiDirectService.on('onConnectionChange', () => {
      setState(WifiDirectService.getState());
    });
    const unsub3 = WifiDirectService.on('onTransferProgress', (progress) => {
      setTransferProgress(progress);
    });

    unsubscribesRef.current = [unsub1, unsub2, unsub3];

    return () => {
      unsubscribesRef.current.forEach(unsub => unsub?.());
      WifiDirectService.stopDiscovery();
    };
  }, []);

  const connectToPeer = useCallback(async (device) => {
    return WifiDirectService.connectToPeer(device);
  }, []);

  const sendFile = useCallback(async (filePath, metadata) => {
    return WifiDirectService.sendFile(filePath, metadata);
  }, []);

  const disconnect = useCallback(async () => {
    await WifiDirectService.disconnect();
    setState(WifiDirectService.getState());
  }, []);

  return {
    ...state,
    transferProgress,
    connectToPeer,
    sendFile,
    disconnect,
  };
}
