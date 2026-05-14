import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

let MapView, Marker, Polyline;

try {
  // Tentative d'importation du vrai module
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} catch (e) {
  // Fallback si le module natif n'est pas lié ou installé
  console.warn('[SafeMapView] Le module natif react-native-maps n\'est pas disponible. Utilisation du mode sans échec.');
  
  MapView = ({ children, style }) => (
    <View style={[style, styles.fallbackContainer]}>
      <View style={styles.fallbackContent}>
        <Text style={styles.fallbackText}>Carte indisponible</Text>
        <Text style={styles.fallbackSubtext}>Rechargez le build natif avec react-native-maps</Text>
      </View>
      {children}
    </View>
  );

  Marker = ({ children, coordinate }) => (
    <View style={styles.markerMock}>
      {children || <View style={styles.defaultMarker} />}
    </View>
  );

  Polyline = () => null;
}

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#1c2630',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fallbackContent: {
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  fallbackSubtext: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  markerMock: {
    position: 'absolute',
  },
  defaultMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export { MapView, Marker, Polyline };
export default MapView;
