import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Linking, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MapView, Marker, Polyline } from '../../../components/SafeMapView';

const vehicleIcons = { moto: 'motorbike', economy: 'car-side', comfort: 'car', premium: 'car-sports' };

export default function TaxiDriverRideScreen({ onBack, onNavigate, route }) {
  const params = route?.params || {};
  const { pickup, dest, fare, distance, vehicle } = params;
  const [status, setStatus] = useState('heading_to_pickup');
  const [eta, setEta] = useState(3);
  const [passengerLocation, setPassengerLocation] = useState({ latitude: 5.3364, longitude: -4.0268 });
  const [mapRegion, setMapRegion] = useState({ latitude: 5.3364, longitude: -4.0268, latitudeDelta: 0.02, longitudeDelta: 0.02 });

  const statusInfo = {
    heading_to_pickup: { label: 'En route vers le client', icon: 'navigation', color: '#f97316' },
    waiting_passenger: { label: 'En attente du client', icon: 'clock-outline', color: '#eab308' },
    trip_in_progress: { label: 'Course en cours', icon: 'car', color: '#137fec' },
    completed: { label: 'Termine', icon: 'check', color: '#22c55e' },
  };

  const info = statusInfo[status];
  const vIcon = vehicleIcons[vehicle] || 'car-side';

  useEffect(() => {
    const interval = setInterval(() => setEta(prev => prev > 0 ? prev - 1 : 0), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (eta === 0 && status === 'heading_to_pickup') setTimeout(() => setStatus('waiting_passenger'), 1000);
  }, [eta]);

  const handleArrived = () => { setStatus('waiting_passenger'); Alert.alert('Client informe', 'Le client a ete notifie de votre arrivee.'); };
  const handleStartTrip = () => setStatus('trip_in_progress');
  const handleComplete = () => {
    setStatus('completed');
    setTimeout(() => onNavigate?.('taxi_driver_earnings', { lastFare: fare }), 2000);
  };

  const handleCallPassenger = () => Linking.openURL('tel:+2250700000000');

  return (
    <View style={styles.root}>
      <MapView style={styles.map} region={mapRegion} onRegionChangeComplete={setMapRegion} showsUserLocation showsMyLocationButton>
        <Marker coordinate={passengerLocation}><View style={styles.passengerMarker}><MaterialCommunityIcons name="account" size={20} color="#fff" /></View></Marker>
        {status === 'trip_in_progress' && dest && <Marker coordinate={{ latitude: 5.34, longitude: -4.03 }}><MaterialCommunityIcons name="map-marker" size={28} color="#ef4444" /></Marker>}
      </MapView>

      <SafeAreaView style={styles.overlay}>
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => Alert.alert('Quitter la course', 'Etes-vous sur ?', [{ text: 'Non' }, { text: 'Oui, quitter', onPress: () => onNavigate?.('taxi_driver_home') }])}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
          <View style={[styles.statusPill, { backgroundColor: info.color }]}><MaterialCommunityIcons name={info.icon} size={16} color="#fff" /><Text style={styles.statusPillText}>{info.label}</Text></View>
          <Pressable style={styles.helpBtn} onPress={() => onNavigate?.('taxi_help')}><MaterialCommunityIcons name="help-circle-outline" size={22} color="#fff" /></Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <View style={[styles.statusBar, { backgroundColor: info.color + '20' }]}>
          <MaterialCommunityIcons name={info.icon} size={20} color={info.color} />
          <Text style={[styles.statusText, { color: info.color }]}>{info.label}</Text>
          {eta > 0 && status === 'heading_to_pickup' && <Text style={styles.etaText}>{eta} min</Text>}
        </View>

        <View style={styles.tripSection}>
          <Text style={styles.sectionTitle}>{status === 'trip_in_progress' ? 'Destination du client' : 'Aller chercher le client'}</Text>
          <View style={styles.tripRow}><MaterialCommunityIcons name="circle" size={10} color="#22c55e" /><Text style={styles.tripText}>{pickup || 'Point de prise en charge'}</Text></View>
          {status === 'trip_in_progress' && <><View style={styles.tripLine} /><View style={styles.tripRow}><MaterialCommunityIcons name="map-marker" size={14} color="#ef4444" /><Text style={styles.tripText}>{dest || 'Destination'}</Text></View></>}
        </View>

        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Montant de la course</Text>
          <Text style={styles.fareValue}>{fare?.toLocaleString() || '0'} FCFA</Text>
        </View>

        <View style={styles.actionsRow}>
          {status === 'heading_to_pickup' && <Pressable style={styles.arrivedBtn} onPress={handleArrived}><MaterialCommunityIcons name="flag-checkered" size={20} color="#fff" /><Text style={styles.arrivedBtnText}>Je suis arrive</Text></Pressable>}
          {status === 'waiting_passenger' && <><Pressable style={styles.callBtn} onPress={handleCallPassenger}><MaterialCommunityIcons name="phone" size={20} color="#22c55e" /><Text style={styles.callBtnText}>Appeler</Text></Pressable><Pressable style={styles.startBtn} onPress={handleStartTrip}><MaterialCommunityIcons name="navigation" size={20} color="#fff" /><Text style={styles.startBtnText}>Demarrer la course</Text></Pressable></>}
          {status === 'trip_in_progress' && <Pressable style={styles.completeBtn} onPress={handleComplete}><MaterialCommunityIcons name="check-bold" size={20} color="#fff" /><Text style={styles.completeBtnText}>Terminer la course</Text></Pressable>}
        </View>

        <View style={styles.tripInfoRow}>
          <View style={styles.tripInfoItem}><Text style={styles.tripInfoLabel}>Distance</Text><Text style={styles.tripInfoValue}>{distance || '0'} km</Text></View>
          <View style={styles.tripInfoDivider} />
          <View style={styles.tripInfoItem}><Text style={styles.tripInfoLabel}>Duree estimee</Text><Text style={styles.tripInfoValue}>{status === 'trip_in_progress' ? '10-15 min' : `${eta} min`}</Text></View>
          <View style={styles.tripInfoDivider} />
          <View style={styles.tripInfoItem}><Text style={styles.tripInfoLabel}>Vehicule</Text><Text style={[styles.tripInfoValue, { textTransform: 'capitalize' }]}>{vehicle || 'Economique'}</Text></View>
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
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 },
  statusPillText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  passengerMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#137fec', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#151D26', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 34, paddingTop: 8 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#2a3a4a', alignSelf: 'center', marginBottom: 16 },
  statusBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14, marginBottom: 16 },
  statusText: { flex: 1, fontSize: 14, fontWeight: '600' },
  etaText: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  tripSection: { backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 14 },
  sectionTitle: { color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tripLine: { width: 2, height: 20, backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: 4, marginVertical: 4 },
  tripText: { color: '#F8FAFC', fontSize: 13 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  fareLabel: { color: '#64748b', fontSize: 14 },
  fareValue: { color: '#22c55e', fontSize: 24, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  arrivedBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f97316', borderRadius: 12, paddingVertical: 14 },
  arrivedBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  callBtnText: { color: '#22c55e', fontSize: 14, fontWeight: '600' },
  startBtn: { flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#137fec', borderRadius: 12, paddingVertical: 14 },
  startBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  completeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 14 },
  completeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tripInfoRow: { flexDirection: 'row', backgroundColor: '#1c2630', borderRadius: 12, padding: 14 },
  tripInfoItem: { flex: 1, alignItems: 'center' },
  tripInfoLabel: { color: '#64748b', fontSize: 11, marginBottom: 4 },
  tripInfoValue: { color: '#F8FAFC', fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  tripInfoDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
});