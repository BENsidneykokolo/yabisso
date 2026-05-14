import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Linking, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MapView, Marker, Polyline } from '../../../components/SafeMapView';

const vehicleIcons = { moto: 'motorbike', economy: 'car-side', comfort: 'car', premium: 'car-sports' };

export default function TaxiRideScreen({ onBack, onNavigate, route }) {
  const params = route?.params || {};
  const { pickup, destination, price, distance, vehicleType, paymentMethod, driver, pickupCoords, destCoords } = params;
  const [rideStatus, setRideStatus] = useState('on_the_way');
  const [eta, setEta] = useState(5);
  const [driverLocation, setDriverLocation] = useState({ latitude: 5.3364, longitude: -4.0268 });
  const mapRef = useRef(null);

  const statusInfo = {
    on_the_way: { label: 'En route', sublabel: 'Le chauffeur vient vous chercher', icon: 'car', color: '#f97316' },
    arrived: { label: 'Arrive', sublabel: 'Le chauffeur vous attend', icon: 'check-circle', color: '#eab308' },
    in_progress: { label: 'En cours', sublabel: 'Vous etes en route', icon: 'navigation', color: '#137fec' },
    completed: { label: 'Termine', sublabel: 'Vous etes arrive', icon: 'check', color: '#22c55e' },
  };

  const status = statusInfo[rideStatus];
  const vIcon = vehicleIcons[vehicleType] || 'car';

  useEffect(() => {
    const intervals = [
      setInterval(() => setEta(prev => prev > 0 ? prev - 1 : 0), 15000),
      setInterval(() => {
        setDriverLocation(prev => ({
          latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
        }));
      }, 5000),
    ];
    return () => intervals.forEach(clearInterval);
  }, []);

  useEffect(() => {
    if (eta === 0 && rideStatus === 'on_the_way') {
      setTimeout(() => setRideStatus('arrived'), 2000);
    }
  }, [eta]);

  useEffect(() => {
    if (pickupCoords && destCoords) {
      const coords = [driverLocation, pickupCoords, destCoords];
      mapRef.current?.fitToCoordinates(coords, { edgePadding: { top: 100, right: 50, bottom: 400, left: 50 }, animated: true });
    }
  }, [driverLocation]);

  const handleCall = () => Linking.openURL(`tel:${driver?.phone || '+2250700000000'}`);
  const handleMessage = () => onNavigate?.('chat_conversation', { contact: driver });

  const handleCancel = () => {
    Alert.alert('Annuler la course', 'Etes-vous sur de vouloir annuler cette course ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: () => onNavigate?.('taxi_home') },
    ]);
  };

  const handleComplete = () => {
    setRideStatus('completed');
    setTimeout(() => onNavigate?.('taxi_complete', params), 1500);
  };

  const handleTestComplete = () => {
    setRideStatus('in_progress');
    setTimeout(handleComplete, 3000);
  };

  return (
    <View style={styles.root}>
      <MapView ref={mapRef} style={styles.map} showsUserLocation showsMyLocationButton>
        {pickupCoords && <Marker coordinate={pickupCoords}><View style={{ alignItems: 'center' }}><MaterialCommunityIcons name="circle" size={14} color="#22c55e" /><MaterialCommunityIcons name="arrow-down" size={10} color="#22c55e" /></View></Marker>}
        {destCoords && <Marker coordinate={destCoords}><MaterialCommunityIcons name="map-marker" size={28} color="#ef4444" /></Marker>}
        <Marker coordinate={driverLocation} rotation={Math.random() * 360} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.driverMarker, { backgroundColor: status.color }]}>
            <MaterialCommunityIcons name={vIcon} size={18} color="#fff" />
          </View>
        </Marker>
        {pickupCoords && destCoords && <Polyline coordinates={[pickupCoords, destCoords]} strokeColor="#137fec" strokeWidth={4} />}
      </MapView>

      <SafeAreaView style={styles.overlay}>
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <MaterialCommunityIcons name={status.icon} size={16} color="#fff" />
            <Text style={styles.statusBadgeText}>{status.label}</Text>
          </View>
          <Pressable style={styles.helpBtn} onPress={() => onNavigate?.('taxi_emergency')}><MaterialCommunityIcons name="alert-circle-outline" size={22} color="#ef4444" /></Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <View style={[styles.statusBar, { backgroundColor: status.color + '20' }]}>
          <MaterialCommunityIcons name={status.icon} size={20} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.sublabel}</Text>
          {eta > 0 && <Text style={styles.etaText}>{eta} min</Text>}
        </View>

        <View style={styles.driverSection}>
          <View style={styles.driverCard}>
            <View style={styles.driverPhoto}><MaterialCommunityIcons name="account" size={36} color="#64748b" /></View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driver?.name || 'Chauffeur'}</Text>
              <View style={styles.ratingRow}><Ionicons name="star" size={14} color="#eab308" /><Text style={styles.ratingText}>{driver?.rating || '4.8'} ({driver?.trips || 0} courses)</Text></View>
              <Text style={styles.carInfo}>{driver?.car || 'Toyota Corolla'} - {driver?.color || 'Blanc'}</Text>
              <Text style={[styles.plateText, { color: status.color }]}>{driver?.plate || 'AB-1234-CC'}</Text>
            </View>
            <View style={styles.driverActions}>
              <Pressable style={styles.actionBtn} onPress={handleCall}><MaterialCommunityIcons name="phone" size={20} color="#22c55e" /></Pressable>
              <Pressable style={styles.actionBtn} onPress={handleMessage}><MaterialCommunityIcons name="message-reply" size={20} color="#137fec" /></Pressable>
            </View>
          </View>
        </View>

        <View style={styles.tripSection}>
          <View style={styles.tripRow}><MaterialCommunityIcons name="circle" size={10} color="#22c55e" /><Text style={styles.tripText}>{pickup || 'Lieu de depart'}</Text></View>
          <View style={styles.tripLine} />
          <View style={styles.tripRow}><MaterialCommunityIcons name="map-marker" size={14} color="#ef4444" /><Text style={styles.tripText}>{destination || 'Destination'}</Text></View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Montant estime</Text>
          <Text style={styles.priceValue}>{price?.toLocaleString() || '0'} FCFA</Text>
        </View>

        <View style={styles.actionButtons}>
          <Pressable style={styles.cancelBtn} onPress={handleCancel}><Text style={styles.cancelBtnText}>Annuler</Text></Pressable>
          {rideStatus !== 'in_progress' && rideStatus !== 'completed' && (
            <Pressable style={styles.testBtn} onPress={handleTestComplete}><Text style={styles.testBtnText}>Test: Terminer course</Text></Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  map: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  helpBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 },
  statusBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  driverMarker: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#151D26', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 34, paddingTop: 8 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#2a3a4a', alignSelf: 'center', marginBottom: 16 },
  statusBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14, marginBottom: 16 },
  statusText: { flex: 1, fontSize: 14, fontWeight: '600' },
  etaText: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  driverSection: { marginBottom: 16 },
  driverCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 16, padding: 14, gap: 12 },
  driverPhoto: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center' },
  driverInfo: { flex: 1 },
  driverName: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { color: '#94A3B8', fontSize: 12 },
  carInfo: { color: '#F8FAFC', fontSize: 12, marginTop: 4 },
  plateText: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  driverActions: { gap: 10 },
  actionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tripSection: { backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 14 },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tripLine: { width: 2, height: 20, backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: 4, marginVertical: 4 },
  tripText: { color: '#F8FAFC', fontSize: 13 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  priceLabel: { color: '#64748b', fontSize: 14 },
  priceValue: { color: '#22c55e', fontSize: 22, fontWeight: '700' },
  actionButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: '#1c2630', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  cancelBtnText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  testBtn: { flex: 1, backgroundColor: '#137fec', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  testBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});