import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, TextInput, ScrollView, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MapView, Marker, Polyline } from '../../../components/SafeMapView';

const vehicleTypes = [
  { id: 'moto', label: 'Moto', desc: 'Rapide, economique', capacity: 1, icon: 'motorbike', color: '#f97316', baseFare: 200, perKm: 80 },
  { id: 'economy', label: 'Economique', desc: 'Voiture compacte', capacity: 3, icon: 'car-side', color: '#3b82f6', baseFare: 500, perKm: 150 },
  { id: 'comfort', label: 'Confort', desc: 'Voiture spacieuse', capacity: 4, icon: 'car', color: '#8b5cf6', baseFare: 800, perKm: 200 },
  { id: 'premium', label: 'Premium', desc: 'Vehicule haut de gamme', capacity: 4, icon: 'car-sports', color: '#eab308', baseFare: 1500, perKm: 350 },
];

const recentLocations = [
  { id: '1', label: 'Maison', address: 'Cocody Riviera, Abidjan', icon: 'home' },
  { id: '2', label: 'Travail', address: 'Plateau, Abidjan', icon: 'briefcase' },
  { id: '3', label: 'Aeroport', address: 'Felix Houphouet-Boigny', icon: 'airplane' },
];

export default function TaxiHomeScreen({ onBack, onNavigate }) {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [showPickupList, setShowPickupList] = useState(false);
  const [showDestList, setShowDestList] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('economy');
  const [mapRegion, setMapRegion] = useState({ latitude: 5.3364, longitude: -4.0268, latitudeDelta: 0.05, longitudeDelta: 0.05 });
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const slideAnim = useRef(new Animated.Value(350)).current;

  const selectedVeh = vehicleTypes.find(v => v.id === selectedVehicle);

  const estimateDistance = () => {
    if (!pickupCoords || !destCoords) return 5 + Math.random() * 10;
    const dLat = Math.abs(destCoords.latitude - pickupCoords.latitude);
    const dLon = Math.abs(destCoords.longitude - pickupCoords.longitude);
    return Math.sqrt(dLat * dLat + dLon * dLon) * 111 * 1.3;
  };

  const estimatePrice = () => {
    const dist = estimateDistance();
    return Math.round((selectedVeh.baseFare + dist * selectedVeh.perKm) / 50) * 50;
  };

  const handleSwapLocations = () => {
    const tmp = pickup; setPickup(destination); setDestination(tmp);
    const tmpC = pickupCoords; setPickupCoords(destCoords); setDestCoords(tmpC);
  };

  const handleSelectLocation = (loc, isPickup) => {
    if (isPickup) { setPickup(loc.address); setShowPickupList(false); setPickupCoords({ latitude: 5.3364 + (Math.random() - 0.5) * 0.02, longitude: -4.0268 + (Math.random() - 0.5) * 0.02 }); }
    else { setDestination(loc.address); setShowDestList(false); setDestCoords({ latitude: 5.3364 + (Math.random() - 0.5) * 0.02, longitude: -4.0268 + (Math.random() - 0.5) * 0.02 }); }
  };

  const handleConfirmRide = () => {
    if (!pickup.trim() || !destination.trim()) return;
    onNavigate?.('taxi_fare', { pickup, destination, vehicleType: selectedVehicle, price: estimatePrice(), distance: estimateDistance().toFixed(1), pickupCoords, destCoords });
  };

  useEffect(() => {
    if (pickupCoords && destCoords) {
      setRouteCoords([pickupCoords, destCoords]);
      const midLat = (pickupCoords.latitude + destCoords.latitude) / 2;
      const midLon = (pickupCoords.longitude + destCoords.longitude) / 2;
      const delta = Math.max(Math.abs(destCoords.latitude - pickupCoords.latitude), Math.abs(destCoords.longitude - pickupCoords.longitude)) * 1.5;
      setMapRegion({ latitude: midLat, longitude: midLon, latitudeDelta: delta, longitudeDelta: delta });
    }
  }, [pickupCoords, destCoords]);

  return (
    <View style={styles.root}>
      <MapView style={styles.map} region={mapRegion} onRegionChangeComplete={setMapRegion} showsUserLocation showsMyLocationButton={false}>
        {pickupCoords && <Marker coordinate={pickupCoords} anchor={{ x: 0.5, y: 1 }}><View style={styles.pickupMarker}><MaterialCommunityIcons name="circle" size={14} color="#22c55e" /><MaterialCommunityIcons name="arrow-down" size={10} color="#22c55e" /></View></Marker>}
        {destCoords && <Marker coordinate={destCoords} anchor={{ x: 0.5, y: 1 }}><MaterialCommunityIcons name="map-marker" size={26} color="#ef4444" /></Marker>}
        {routeCoords.length === 2 && <Polyline coordinates={routeCoords} strokeColor="#137fec" strokeWidth={4} strokeDashArray={[10, 5]} />}
      </MapView>

      <SafeAreaView style={styles.overlay}>
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
          <Text style={styles.topTitle}>Yabisso Taxi</Text>
          <Pressable style={styles.menuBtn} onPress={() => onNavigate?.('taxi_settings')}><Ionicons name="menu" size={22} color="#fff" /></Pressable>
        </View>
        <Pressable style={styles.whereToBtn}><MaterialCommunityIcons name="magnify" size={18} color="#64748b" /><Text style={styles.whereToText}>Ou allez-vous ?</Text></Pressable>
      </SafeAreaView>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.searchBox}>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="circle-medium" size={24} color="#22c55e" style={{ marginTop: 6 }} />
            <View style={{ flex: 1 }}>
              <TextInput style={styles.searchInput} placeholder="Lieu de depart" placeholderTextColor="#64748b" value={pickup} onChangeText={t => { setPickup(t); if (t.length > 0) setShowPickupList(true); }} onFocus={() => { setActiveInput('pickup'); setShowPickupList(true); setShowDestList(false); }} />
            </View>
          </View>
          <Pressable style={styles.swapBtn} onPress={handleSwapLocations}><MaterialCommunityIcons name="swap-vertical" size={18} color="#64748b" /></Pressable>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#ef4444" style={{ marginTop: 6 }} />
            <View style={{ flex: 1 }}>
              <TextInput style={styles.searchInput} placeholder="Destination" placeholderTextColor="#64748b" value={destination} onChangeText={t => { setDestination(t); if (t.length > 0) setShowDestList(true); }} onFocus={() => { setActiveInput('dest'); setShowDestList(true); setShowPickupList(false); }} />
            </View>
          </View>
        </View>

        {showPickupList && (
          <View style={styles.suggestionsList}>
            <Text style={styles.suggestionsHeader}>Adresses recentes</Text>
            {recentLocations.map(loc => (
              <Pressable key={loc.id} style={styles.suggestionItem} onPress={() => handleSelectLocation(loc, true)}>
                <MaterialCommunityIcons name={loc.icon} size={20} color="#64748b" />
                <View style={styles.suggestionInfo}><Text style={styles.suggestionLabel}>{loc.label}</Text><Text style={styles.suggestionAddress}>{loc.address}</Text></View>
              </Pressable>
            ))}
            <Pressable style={styles.suggestionItem} onPress={() => { setShowPickupList(false); onNavigate?.('taxi_favorites'); }}>
              <MaterialCommunityIcons name="star" size={20} color="#eab308" />
              <View style={styles.suggestionInfo}><Text style={styles.suggestionLabel}>Adresses favorites</Text><Text style={styles.suggestionAddress}>Gerer mes adresses sauvegardees</Text></View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
            </Pressable>
          </View>
        )}

        {showDestList && (
          <View style={styles.suggestionsList}>
            <Text style={styles.suggestionsHeader}>Destination</Text>
            {recentLocations.map(loc => (
              <Pressable key={loc.id} style={styles.suggestionItem} onPress={() => handleSelectLocation(loc, false)}>
                <MaterialCommunityIcons name={loc.icon} size={20} color="#64748b" />
                <View style={styles.suggestionInfo}><Text style={styles.suggestionLabel}>{loc.label}</Text><Text style={styles.suggestionAddress}>{loc.address}</Text></View>
              </Pressable>
            ))}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll} contentContainerStyle={styles.vehicleRow}>
          {vehicleTypes.map(v => (
            <Pressable key={v.id} style={[styles.vehicleCard, selectedVehicle === v.id && { borderColor: v.color, backgroundColor: v.color + '15' }]} onPress={() => setSelectedVehicle(v.id)}>
              <MaterialCommunityIcons name={v.icon} size={26} color={selectedVehicle === v.id ? v.color : '#64748b'} />
              <Text style={[styles.vehicleLabel, selectedVehicle === v.id && { color: v.color }]}>{v.label}</Text>
              <Text style={styles.vehicleCap}>{v.capacity} pers</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.estimateRow}>
          <Text style={styles.estimateText}>{estimateDistance().toFixed(1)} km</Text>
          <Text style={styles.estimatePrice}>{estimatePrice().toLocaleString()} FCFA</Text>
        </View>

        <View style={styles.quickActions}>
          <Pressable style={styles.quickBtn} onPress={() => onNavigate?.('taxi_coupon')}><MaterialCommunityIcons name="tag-outline" size={18} color="#eab308" /><Text style={styles.quickBtnText}>Coupon</Text></Pressable>
          <Pressable style={styles.quickBtn} onPress={() => onNavigate?.('taxi_help')}><MaterialCommunityIcons name="help-circle-outline" size={18} color="#fff" /><Text style={styles.quickBtnText}>Aide</Text></Pressable>
          <Pressable style={styles.quickBtn} onPress={() => onNavigate?.('taxi_emergency')}><MaterialCommunityIcons name="alert-circle-outline" size={18} color="#ef4444" /><Text style={styles.quickBtnText}>Urgence</Text></Pressable>
          <Pressable style={styles.quickBtn} onPress={() => onNavigate?.('taxi_history')}><MaterialCommunityIcons name="history" size={18} color="#fff" /><Text style={styles.quickBtnText}>Courses</Text></Pressable>
        </View>

        <Pressable style={[styles.confirmBtn, (!pickup.trim() || !destination.trim()) && styles.confirmBtnDisabled]} onPress={handleConfirmRide} disabled={!pickup.trim() || !destination.trim()}>
          <Text style={styles.confirmBtnText}>Confirmer {selectedVeh.label}</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  map: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  menuBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  whereToBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12, padding: 12, gap: 8 },
  whereToText: { color: '#64748b', fontSize: 14 },
  pickupMarker: { alignItems: 'center' },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#151D26', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 34, paddingTop: 8 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#2a3a4a', alignSelf: 'center', marginBottom: 12 },
  searchBox: { marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 2 },
  swapBtn: { alignSelf: 'center', width: 32, height: 32, borderRadius: 16, backgroundColor: '#2a3a4a', alignItems: 'center', justifyContent: 'center', marginVertical: -10, zIndex: 1 },
  searchInput: { color: '#fff', fontSize: 14, paddingVertical: 10, paddingLeft: 8 },
  suggestionsList: { backgroundColor: '#1c2630', borderRadius: 12, marginBottom: 8, overflow: 'hidden' },
  suggestionsHeader: { color: '#64748b', fontSize: 11, fontWeight: '600', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  suggestionInfo: { flex: 1 },
  suggestionLabel: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  suggestionAddress: { color: '#64748b', fontSize: 11, marginTop: 1 },
  vehicleScroll: { maxHeight: 88, marginBottom: 8 },
  vehicleRow: { gap: 10, paddingVertical: 4 },
  vehicleCard: { width: 78, backgroundColor: '#1c2630', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  vehicleLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  vehicleCap: { color: '#64748b', fontSize: 10, marginTop: 2 },
  estimateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  estimateText: { color: '#64748b', fontSize: 13 },
  estimatePrice: { color: '#22c55e', fontSize: 18, fontWeight: '700' },
  quickActions: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  quickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#1c2630', borderRadius: 10, paddingVertical: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  quickBtnText: { color: '#F8FAFC', fontSize: 11, fontWeight: '600' },
  confirmBtn: { backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  confirmBtnDisabled: { backgroundColor: '#2a3a4a' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});