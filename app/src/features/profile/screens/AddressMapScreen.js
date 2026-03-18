import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

export default function AddressMapScreen({ onBack, addressId, addressData }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [distance, setDistance] = useState(null);

  const targetAddress = addressData;
  const targetLat = targetAddress?.latitude;
  const targetLng = targetAddress?.longitude;

  useEffect(() => {
    const getCurrentLocation = async () => {
      setIsLoadingLocation(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setIsLoadingLocation(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        setCurrentLocation(location.coords);
        
        if (targetLat && targetLng) {
          const dist = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            targetLat,
            targetLng
          );
          setDistance(dist);
        }
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getCurrentLocation();
  }, [targetLat, targetLng]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const formatDistance = (km) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  const openInGoogleMaps = () => {
    if (!targetLat || !targetLng) {
      Alert.alert('Erreur', 'Coordonnées non disponibles.');
      return;
    }

    const label = encodeURIComponent(targetAddress?.name || 'Destination');
    const url = Platform.select({
      android: `google.navigation:q=${targetLat},${targetLng}&label=${label}`,
      ios: `comgooglemaps://?daddr=${targetLat},${targetLng}&directionsmode=driving&label=${label}`,
    });

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`;
        Linking.openURL(webUrl);
      }
    });
  };

  const openShareLocation = async () => {
    if (!targetLat || !targetLng) return;
    
    const message = `Ma position Yabisso:\n\n${targetAddress?.name || 'Adresse'}\nCode: ${targetAddress?.unique_id}\n\nhttps://www.google.com/maps?q=${targetLat},${targetLng}`;
    
    try {
      await Linking.openURL(`sms:?body=${encodeURIComponent(message)}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager la position.');
    }
  };

  if (!targetAddress) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Navigation</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="map-marker-off" size={64} color="#64748b" />
          <Text style={styles.errorText}>Adresse non trouvée</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Navigation</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map" size={80} color="#2BEE79" />
          <Text style={styles.mapPlaceholderText}>Carte en temps réel</Text>
          <Text style={styles.mapCoords}>
            {targetLat?.toFixed(6)}, {targetLng?.toFixed(6)}
          </Text>
        </View>

        <View style={styles.destinationCard}>
          <View style={styles.destinationHeader}>
            <View style={[
              styles.categoryIcon,
              { backgroundColor: targetAddress.category === 'Maison' ? 'rgba(19, 127, 236, 0.15)' : 'rgba(245, 158, 11, 0.15)' }
            ]}>
              <MaterialCommunityIcons
                name={targetAddress.category === 'Maison' ? 'home' : (targetAddress.category === 'Travail' ? 'briefcase' : 'map-marker')}
                size={28}
                color={targetAddress.category === 'Maison' ? '#137fec' : '#f59e0b'}
              />
            </View>
            <View style={styles.destinationInfo}>
              <Text style={styles.destinationName}>{targetAddress.name}</Text>
              <View style={styles.codeBadge}>
                <Text style={styles.codeBadgeText}>{targetAddress.unique_id}</Text>
              </View>
            </View>
          </View>

          <View style={styles.locationDetails}>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={18} color="#2BEE79" />
              <Text style={styles.locationText}>{targetAddress.city || 'Ville non renseignée'}</Text>
            </View>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="tag" size={18} color="#94A3B8" />
              <Text style={styles.locationText}>{targetAddress.category}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.infoContainer}>
        {distance !== null && (
          <View style={styles.distanceCard}>
            <MaterialCommunityIcons name="map-marker-distance" size={32} color="#2BEE79" />
            <View style={styles.distanceInfo}>
              <Text style={styles.distanceLabel}>Distance</Text>
              <Text style={styles.distanceValue}>{formatDistance(distance)}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <Pressable style={styles.navigateBtn} onPress={openInGoogleMaps}>
            <MaterialCommunityIcons name="navigation" size={24} color="#0E151B" />
            <Text style={styles.navigateBtnText}>Ouvrir dans Google Maps</Text>
          </Pressable>

          <Pressable style={styles.shareBtn} onPress={openShareLocation}>
            <MaterialCommunityIcons name="share-variant" size={22} color="#2BEE79" />
            <Text style={styles.shareBtnText}>Partager ma position</Text>
          </Pressable>
        </View>

        <View style={styles.instructionsCard}>
          <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#f59e0b" />
          <Text style={styles.instructionsText}>
            Appuyez sur "Ouvrir dans Google Maps" pour lancer la navigation étape par étape vers cette adresse.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapContainer: {
    height: '45%',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#151D26',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  mapPlaceholderText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 12,
  },
  mapCoords: {
    color: '#64748b',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  destinationCard: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    backgroundColor: '#151D26',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  codeBadge: {
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
  },
  codeBadgeText: {
    color: '#2BEE79',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  locationDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
    padding: 20,
  },
  distanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151D26',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  distanceInfo: {
    flex: 1,
  },
  distanceLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  distanceValue: {
    color: '#2BEE79',
    fontSize: 28,
    fontWeight: 'bold',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2BEE79',
    paddingVertical: 16,
    borderRadius: 16,
  },
  navigateBtnText: {
    color: '#0E151B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
  },
  shareBtnText: {
    color: '#2BEE79',
    fontWeight: 'bold',
    fontSize: 15,
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  instructionsText: {
    flex: 1,
    color: '#f59e0b',
    fontSize: 12,
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 12,
  },
});
