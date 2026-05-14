import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Animated, Easing } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const mockDrivers = [
  { id: '1', name: 'Koffi Aka', rating: 4.8, trips: 1247, car: 'Toyota Corolla', plate: 'AB-1234-CC', color: 'Blanc', photo: 'person', time: 2 },
  { id: '2', name: 'Aminata Diallo', rating: 4.9, trips: 892, car: 'Hyundai Tucson', plate: 'CC-5678-DD', color: 'Noir', photo: 'person', time: 3 },
  { id: '3', name: 'Jean-Marc Yao', rating: 4.7, trips: 654, car: 'Peugeot 301', plate: 'EE-9012-FF', color: 'Gris', photo: 'person', time: 4 },
];

const vehicleIcons = { moto: 'motorbike', economy: 'car-side', comfort: 'car', premium: 'car-sports' };
const vehicleColors = { moto: '#f97316', economy: '#3b82f6', comfort: '#8b5cf6', premium: '#eab308' };

export default function TaxiSearchDriverScreen({ onBack, onNavigate, route }) {
  const params = route?.params || {};
  const { pickup, destination, price, distance, vehicleType, paymentMethod } = params;
  const [searchStep, setSearchStep] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [drivers] = useState(mockDrivers);

  const steps = ['Recherche en cours...', 'Chauffeur trouve !', 'Accepte en cours...', 'Course confirmee !'];
  const currentDriver = drivers[0];

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSearchStep(step);
      if (step >= 3) {
        clearInterval(interval);
        setSelectedDriver(currentDriver);
        setTimeout(() => {
          onNavigate?.('taxi_ride', { ...params, driver: currentDriver });
        }, 1500);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: false })
    ).start();
  }, []);

  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => onNavigate?.('taxi_home')}><Ionicons name="close" size={24} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Recherche chauffeur</Text>
        <View style={{ width: 40 }} />
      </View>

      {!selectedDriver ? (
        <>
          <View style={styles.searchContent}>
            <View style={styles.searchAnimation}>
              <View style={styles.searchRing}>
                <View style={styles.searchPulse} />
                <View style={styles.searchCenter}>
                  <MaterialCommunityIcons name="car-search" size={48} color="#22c55e" />
                </View>
              </View>
            </View>

            <Text style={styles.searchTitle}>{steps[searchStep]}</Text>
            <Text style={styles.searchSubtitle}>Un chauffeur proche de vous va accepter votre demande</Text>

            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>

            <View style={styles.tripSummary}>
              <View style={styles.tripRow}>
                <MaterialCommunityIcons name="circle" size={10} color="#22c55e" />
                <Text style={styles.tripText}>{pickup || 'Lieu de depart'}</Text>
              </View>
              <View style={styles.tripLine} />
              <View style={styles.tripRow}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#ef4444" />
                <Text style={styles.tripText}>{destination || 'Destination'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.cancelSection}>
            <Pressable style={styles.cancelBtn} onPress={() => onNavigate?.('taxi_home')}><Text style={styles.cancelBtnText}>Annuler la course</Text></Pressable>
          </View>
        </>
      ) : (
        <View style={styles.driverFoundContent}>
          <Text style={styles.confirmTitle}>Chauffeur confirme !</Text>
          <View style={styles.driverCard}>
            <View style={styles.driverPhoto}><MaterialCommunityIcons name="account" size={40} color="#64748b" /></View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{selectedDriver.name}</Text>
              <View style={styles.ratingRow}><Ionicons name="star" size={14} color="#eab308" /><Text style={styles.ratingText}>{selectedDriver.rating} ({selectedDriver.trips} courses)</Text></View>
              <Text style={styles.carInfo}>{selectedDriver.car} - {selectedDriver.color}</Text>
              <Text style={styles.plateText}>{selectedDriver.plate}</Text>
            </View>
          </View>
          <View style={styles.loadingRow}><MaterialCommunityIcons name="loading" size={24} color="#22c55e" /><Text style={styles.loadingText}>Redirection vers la course...</Text></View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  searchContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  searchAnimation: { marginBottom: 32 },
  searchRing: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: 'rgba(34,197,94,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchPulse: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: 'rgba(34,197,94,0.1)' },
  searchCenter: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(34,197,94,0.1)', alignItems: 'center', justifyContent: 'center' },
  searchTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  searchSubtitle: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  progressBar: { width: '100%', height: 4, backgroundColor: '#1c2630', borderRadius: 2, marginTop: 24, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 2 },
  tripSummary: { width: '100%', backgroundColor: '#1c2630', borderRadius: 12, padding: 16, marginTop: 24 },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tripLine: { width: 2, height: 20, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 4, marginVertical: 4 },
  tripText: { color: '#F8FAFC', fontSize: 13, flex: 1 },
  cancelSection: { padding: 20, paddingBottom: 34 },
  cancelBtn: { backgroundColor: '#1c2630', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  cancelBtnText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
  driverFoundContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  confirmTitle: { color: '#22c55e', fontSize: 24, fontWeight: '700', marginBottom: 24 },
  driverCard: { backgroundColor: '#1c2630', borderRadius: 16, padding: 20, width: '100%', flexDirection: 'row', alignItems: 'center', gap: 16 },
  driverPhoto: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center' },
  driverInfo: { flex: 1 },
  driverName: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { color: '#94A3B8', fontSize: 13 },
  carInfo: { color: '#F8FAFC', fontSize: 13, marginTop: 6 },
  plateText: { color: '#22c55e', fontSize: 14, fontWeight: '700', marginTop: 2 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24 },
  loadingText: { color: '#64748b', fontSize: 14 },
});