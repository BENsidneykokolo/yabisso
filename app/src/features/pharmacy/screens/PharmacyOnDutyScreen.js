import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const pharmaciesOnDuty = [
  { id: '1', name: 'Pharmacie du Centre', address: 'Rue Principale, Plateau', phone: '+225 07 00 00 00 01', hours: '24h/24', distance: '1.2 km', onDuty: true },
  { id: '2', name: 'Pharmacie Saint-Jean', address: 'Avenue de la Liberté, Cocody', phone: '+225 07 00 00 00 02', hours: '24h/24', distance: '2.5 km', onDuty: true },
  { id: '3', name: 'Pharmacie du Parc', address: 'Boulevard Houphouët-Boigny, Marcory', phone: '+225 07 00 00 00 03', hours: '22h-07h', distance: '3.1 km', onDuty: false },
  { id: '4', name: 'Pharmacie de la Gare', address: 'Quartier Gare, Treichville', phone: '+225 07 00 00 00 04', hours: '24h/24', distance: '4.0 km', onDuty: true },
  { id: '5', name: 'Pharmacie Soleil', address: 'Rue des Jardins, Yopougon', phone: '+225 07 00 00 00 05', hours: '21h-07h', distance: '5.3 km', onDuty: false },
  { id: '6', name: 'Pharmacie Notre-Dame', address: 'Carrefour Notre-Dame, Abobo', phone: '+225 07 00 00 00 06', hours: '24h/24', distance: '6.8 km', onDuty: true },
];

export default function PharmacyOnDutyScreen({ onBack, onNavigate }) {
  const [search, setSearch] = useState('');
  const [showOnlyOnDuty, setShowOnlyOnDuty] = useState(false);

  const filtered = pharmaciesOnDuty.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase());
    const matchOnDuty = !showOnlyOnDuty || p.onDuty;
    return matchSearch && matchOnDuty;
  });

  const handleCall = (phone) => {
    console.log('Appel:', phone);
  };

  const handleMap = (pharmacy) => {
    onNavigate?.('address_map', { address: pharmacy.address, name: pharmacy.name });
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <Text style={styles.headerTitle}>Pharmacies de garde</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.infoBar}>
        <MaterialCommunityIcons name="information" size={18} color="#fff" />
        <Text style={styles.infoText}>Ces pharmacies sont ouvertes 24h/24 en semaine et le week-end.</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une pharmacie..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Pressable style={styles.filterRow} onPress={() => setShowOnlyOnDuty(!showOnlyOnDuty)}>
        <View style={[styles.filterChip, showOnlyOnDuty && styles.filterChipActive]}>
          <MaterialCommunityIcons name="clock-check" size={16} color={showOnlyOnDuty ? '#fff' : '#64748B'} />
          <Text style={[styles.filterChipText, showOnlyOnDuty && styles.filterChipTextActive]}>24h/24 uniquement</Text>
        </View>
        <Text style={styles.countText}>{filtered.length} pharmacies</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {filtered.map(pharmacy => (
          <Pressable key={pharmacy.id} style={styles.pharmacyCard}>
            <View style={styles.pharmacyHeader}>
              <View style={styles.pharmacyInfo}>
                <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                <View style={styles.addressRow}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#64748B" />
                  <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, pharmacy.onDuty ? styles.statusOnDuty : styles.statusOffDuty]}>
                <View style={[styles.statusDot, pharmacy.onDuty ? styles.dotOnDuty : styles.dotOffDuty]} />
                <Text style={[styles.statusText, pharmacy.onDuty ? styles.statusTextOnDuty : styles.statusTextOffDuty]}>
                  {pharmacy.onDuty ? 'De garde' : 'Ferme bientot'}
                </Text>
              </View>
            </View>

            <View style={styles.pharmacyDetails}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#EF4444" />
                <Text style={styles.detailText}>{pharmacy.hours}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="map-marker-distance" size={14} color="#64748B" />
                <Text style={styles.detailText}>{pharmacy.distance}</Text>
              </View>
            </View>

            <View style={styles.pharmacyActions}>
              <Pressable style={styles.callBtn} onPress={() => handleCall(pharmacy.phone)}>
                <MaterialCommunityIcons name="phone" size={16} color="#fff" />
                <Text style={styles.callBtnText}>Appeler</Text>
              </Pressable>
              <Pressable style={styles.mapBtn} onPress={() => handleMap(pharmacy)}>
                <MaterialCommunityIcons name="navigation" size={16} color="#22c55e" />
                <Text style={styles.mapBtnText}>Itineraire</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(30,40,50,0.9)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  infoBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#137fec',
    marginHorizontal: 20, marginTop: 16,
    borderRadius: 12, padding: 12,
  },
  infoText: { flex: 1, color: '#fff', fontSize: 12, lineHeight: 18 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#151D26',
    marginHorizontal: 20, marginTop: 16, marginBottom: 8,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { flex: 1, color: '#F8FAFC', marginLeft: 8, fontSize: 14 },
  filterRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#151D26',
    borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  filterChipText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  countText: { color: '#64748B', fontSize: 13 },
  scrollView: { paddingHorizontal: 20 },
  pharmacyCard: {
    backgroundColor: '#151D26',
    borderRadius: 16, padding: 16,
    marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  pharmacyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  pharmacyInfo: { flex: 1 },
  pharmacyName: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pharmacyAddress: { color: '#64748B', fontSize: 12, flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
  statusOnDuty: { backgroundColor: 'rgba(34,197,94,0.15)' },
  statusOffDuty: { backgroundColor: 'rgba(239,68,68,0.15)' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  dotOnDuty: { backgroundColor: '#22c55e' },
  dotOffDuty: { backgroundColor: '#EF4444' },
  statusText: { fontSize: 11, fontWeight: '600' },
  statusTextOnDuty: { color: '#22c55e' },
  statusTextOffDuty: { color: '#EF4444' },
  pharmacyDetails: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { color: '#94A3B8', fontSize: 12 },
  pharmacyActions: { flexDirection: 'row', gap: 10 },
  callBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#EF4444', borderRadius: 10, paddingVertical: 10,
  },
  callBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  mapBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 10, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  mapBtnText: { color: '#22c55e', fontSize: 13, fontWeight: '700' },
});