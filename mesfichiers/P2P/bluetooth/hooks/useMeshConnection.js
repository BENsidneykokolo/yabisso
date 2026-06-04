import { useState, useEffect } from 'react';
import { meshConnectionState, MeshConnectionEvents } from '../services/NearbyMeshService';

/**
 * Hook global pour écouter l'état de la connexion Mesh en temps réel.
 * Renvoie l'objet entier correspondant à l'état courant.
 */
export function useMeshConnection() {
  const [connectionState, setConnectionState] = useState(meshConnectionState);

  useEffect(() => {
    // S'inscrire aux changements d'état
    const unsubscribe = MeshConnectionEvents.subscribe((newState) => {
      setConnectionState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return connectionState;
}
