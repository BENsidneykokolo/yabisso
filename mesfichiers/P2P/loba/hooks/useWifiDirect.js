import { useState, useEffect } from 'react';
import { WifiDirectService } from '../../bluetooth/services/WifiDirectService';

export function useWifiDirect() {
  const [state, setState] = useState(WifiDirectService.getState());

  useEffect(() => {
    const unsub = WifiDirectService.on('onConnectionChange', () => {
      setState(WifiDirectService.getState());
    });
    
    const unsubFound = WifiDirectService.on('onPeerFound', () => {
      setState(WifiDirectService.getState());
    });

    const unsubLogs = WifiDirectService.on('onLogUpdate', () => {
      setState(WifiDirectService.getState());
    });

    return () => {
      unsub();
      unsubFound();
      unsubLogs();
    };
  }, []);

  return state;
}
