import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const rides = [
  { id: '1', date: '12/05/2026', pickup: 'Cocody Riviera', destination: 'Plateau', driver: 'Koffi Aka', price: 3500, status: 'completed', vehicle: 'Economique' },
  { id: '2', date: '10/05/2026', pickup: 'Yopougon', destination: 'Aéroport Félix Houphouët', driver: 'Aminata Diallo', price: 8500, status: 'completed', vehicle: 'Premium' },
  { id: '3', date: '08/05/2026', pickup: 'Marcory', destination: 'Abobo', driver: 'Jean-Marc Yao', price: 4000, status: 'completed', vehicle: 'Confort' },
  { id: '4', date: '05/05/2026', pickup: 'Treichville', destination: 'Cocody', driver: 'Koffi Aka', price: 3000, status: 'cancelled', vehicle: 'Economique' },
  { id: '5', date: '01/05/2026', pickup: 'Plateau', destination: 'Yopougon', driver: 'Aminata Diallo', price: 5500, status: 'completed', vehicle: 'Premium' },
];

export default function TaxiHistoryScreen({ onBack, onNavigate }) {
  const [filter, setFilter] = useState('all');
  const [selectedRide, setSelectedRide] = useState(null);

  const filtered = rides.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'completed') return r.status === 'completed';
    if (filter === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Historique des courses</Text>
        <Pressable style={styles.filterBtn} onPress={() => onNavigate?.('taxi_help')}><MaterialCommunityIcons name="help-circle-outline" size={22} color="#fff" /></Pressable>
      </View>

      <View style={styles.filterRow}>
        {['all', 'completed', 'cancelled'].map(f => (
          <Pressable key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === 'all' ? 'Tout' : f === 'completed' ? 'Terminees' : 'Annulees'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="car-off" size={60} color="#2a3a4a" />
            <Text style={styles.emptyText}>Aucune course</Text>
            <Text style={styles.emptySubtext}>Vos courses apparaitront ici</Text>
          </View>
        ) : (
          filtered.map(ride => (
            <Pressable key={ride.id} style={styles.rideCard} onPress={() => setSelectedRide(selectedRide?.id === ride.id ? null : ride)}>
              <View style={styles.rideHeader}>
                <View>
                  <Text style={styles.rideDate}>{ride.date}</Text>
                  <Text style={styles.rideDriver}>{ride.driver}</Text>
                </View>
                <View style={styles.rideRight}>
                  <Text style={styles.ridePrice}>{ride.price.toLocaleString()} FCFA</Text>
                  <View style={[styles.statusBadge, ride.status === 'completed' ? styles.statusCompleted : styles.statusCancelled]}>
                    <Text style={[styles.statusText, ride.status === 'completed' ? styles.statusTextCompleted : styles.statusTextCancelled]}>
                      {ride.status === 'completed' ? 'Terminee' : 'Annulee'}
                    </Text>
                  </View>
                </View>
              </View>
              {selectedRide?.id === ride.id && (
                <View style={styles.rideDetails}>
                  <View style={styles.tripRow}><MaterialCommunityIcons name="circle" size={8} color="#22c55e" /><Text style={styles.tripText}>{ride.pickup}</Text></View>
                  <View style={styles.tripLine} />
                  <View style={styles.tripRow}><MaterialCommunityIcons name="map-marker" size={12} color="#ef4444" /><Text style={styles.tripText}>{ride.destination}</Text></View>
                  <View style={styles.detailActions}>
                    <Pressable style={styles.receiptBtn} onPress={() => onNavigate?.('taxi_receipt', { ...ride })}><MaterialCommunityIcons name="receipt" size={16} color="#fff" /><Text style={styles.receiptBtnText}>Reçu</Text></Pressable>
                    <Pressable style={styles.againBtn} onPress={() => onNavigate?.('taxi_home', { pickup: ride.pickup })}><MaterialCommunityIcons name="repeat" size={16} color="#22c55e" /><Text style={styles.againBtnText}>Commander a nouveau</Text></Pressable>
                  </View>
                </View>
              )}
            </Pressable>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, backgroundColor: '#1c2630' },
  filterChipActive: { backgroundColor: '#22c55e' },
  filterChipText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { color: '#64748b', fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#2a3a4a', fontSize: 14, marginTop: 8 },
  rideCard: { backgroundColor: '#1c2630', borderRadius: 14, padding: 16, marginBottom: 12 },
  rideHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  rideDate: { color: '#64748b', fontSize: 12 },
  rideDriver: { color: '#F8FAFC', fontSize: 15, fontWeight: '600', marginTop: 4 },
  rideRight: { alignItems: 'flex-end' },
  ridePrice: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  statusBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6 },
  statusCompleted: { backgroundColor: 'rgba(34,197,94,0.15)' },
  statusCancelled: { backgroundColor: 'rgba(239,68,68,0.15)' },
  statusText: { fontSize: 11, fontWeight: '600' },
  statusTextCompleted: { color: '#22c55e' },
  statusTextCancelled: { color: '#ef4444' },
  rideDetails: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tripLine: { width: 2, height: 14, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 3, marginVertical: 3 },
  tripText: { color: '#94A3B8', fontSize: 13 },
  detailActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  receiptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#137fec', borderRadius: 10, paddingVertical: 10 },
  receiptBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  againBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 10, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  againBtnText: { color: '#22c55e', fontSize: 13, fontWeight: '600' },
});