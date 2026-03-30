import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ALL_SERVICES } from '../constants/Services';

const STORAGE_KEY = 'yabisso_service_visibility';

/**
 * Hook pour gérer les préférences de visibilité des services sur le Dashboard.
 */
export function useServicePreferences() {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      const initial = {};
      
      // On initialise toujours tous les services à true par défaut
      ALL_SERVICES.forEach(s => {
        initial[s.key] = true;
      });

      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...initial, ...parsed });
      } else {
        setPreferences(initial);
      }
    } catch (e) {
      console.error('Erreur chargement préférences services:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = async (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(newPrefs));
    } catch (e) {
      console.error('Erreur sauvegarde préférences services:', e);
    }
  };

  // Séparation pour le Dashboard
  const visibleServices = ALL_SERVICES.filter(s => preferences[s.key] !== false);
  const baseVisible = visibleServices.filter(s => s.isBase);
  const extraVisible = visibleServices.filter(s => !s.isBase);

  return { 
    preferences, 
    loading, 
    toggleService, 
    visibleServices,
    baseVisible,
    extraVisible
  };
}
