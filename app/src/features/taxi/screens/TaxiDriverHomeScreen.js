import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const todayEarnings = 18500;
const weekEarnings = 98400;
const monthEarnings = 385000;
const totalTrips = 247;
const rating = 4.8;
const isOnline = true;

const navItems = [
  { label: 'Mes revenus', icon: 'wallet', screen: 'taxi_driver_earnings' },
  { label: 'Mes courses', icon: 'history', screen: 'taxi_history' },
  { label: 'Mon profil', icon: 'account', screen: 'taxi_driver_profile' },
  { label: 'Parametres', icon: 'cog', screen: 'taxi_settings' },
];

const recentRequests = [
  { id: '1', pickup: 'Plateau', dest: 'Cocody', fare: 4500, distance: '3.2 km', vehicle: 'economy' },
  { id: '2', pickup: 'Yopougon', dest: 'Marcory', fare: 3500, distance: '2.8 km', vehicle: 'moto' },
];

const vehicleIcons = { moto: 'motorbike', economy: 'car-side', comfort: 'car', premium: 'car-sports' };
const vehicleColors = { moto: '#f97316', economy: '#3b82f6', comfort: '#8b5cf6', premium: '#eab308' };

export default function TaxiDriverHomeScreen({ onBack, onNavigate }) {
  const [online, setOnline] = useState(isOnline);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Espace Chauffeur</Text>
        <Pressable style={styles.profileBtn} onPress={() => onNavigate?.('taxi_driver_profile')}><MaterialCommunityIcons name="account" size={22} color="#fff" /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={[styles.onlineCard, online ? styles.onlineCardActive : {}]}>
          <View style={styles.onlineLeft}>
            <MaterialCommunityIcons name={online ? 'circle' : 'circle-outline'} size={14} color={online ? '#22c55e' : '#64748b'} />
            <Text style={styles.onlineLabel}>{online ? 'En ligne' : 'Hors ligne'}</Text>
          </View>
          <Pressable style={[styles.toggleBtn, online && styles.toggleBtnActive]} onPress={() => setOnline(!online)}>
            <View style={[styles.toggleKnob, online && styles.toggleKnobActive]} />
          </Pressable>
        </View>

        <View style={styles.earningsCard}>
          <Text style={styles.earningsTitle}>Aujourd'hui</Text>
          <Text style={styles.earningsAmount}>{todayEarnings.toLocaleString()} FCFA</Text>
          <View style={styles.earningsStats}>
            <View style={styles.statItem}><Text style={styles.statValue}>{totalTrips}</Text><Text style={styles.statLabel}>Courses</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statValue}>{rating}</Text><Text style={styles.statLabel}>Note</Text></View>
          </View>
        </View>

        <View style={styles.weeklyRow}>
          <View style={styles.weeklyCard}><Text style={styles.weeklyLabel}>Cette semaine</Text><Text style={styles.weeklyValue}>{weekEarnings.toLocaleString()} FCFA</Text></View>
          <View style={styles.weeklyCard}><Text style={styles.weeklyLabel}>Ce mois</Text><Text style={styles.weeklyValue}>{monthEarnings.toLocaleString()} FCFA</Text></View>
        </View>

        {online && (
          <View style={styles.requestsSection}>
            <Text style={styles.sectionTitle}>Demandes de course</Text>
            {recentRequests.map(req => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={[styles.reqVehIcon, { backgroundColor: (vehicleColors[req.vehicle] || '#3b82f6') + '20' }]}>
                    <MaterialCommunityIcons name={vehicleIcons[req.vehicle] || 'car'} size={22} color={vehicleColors[req.vehicle] || '#3b82f6'} />
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestFare}>{req.fare.toLocaleString()} FCFA</Text>
                    <Text style={styles.requestDistance}>{req.distance} - {req.vehicle}</Text>
                  </View>
                </View>
                <View style={styles.requestTrip}>
                  <View style={styles.tripRow}><MaterialCommunityIcons name="circle" size={8} color="#22c55e" /><Text style={styles.tripText}>{req.pickup}</Text></View>
                  <View style={styles.tripLine} />
                  <View style={styles.tripRow}><MaterialCommunityIcons name="map-marker" size={12} color="#ef4444" /><Text style={styles.tripText}>{req.dest}</Text></View>
                </View>
                <View style={styles.requestActions}>
                  <Pressable style={styles.acceptBtn} onPress={() => onNavigate?.('taxi_driver_ride', req)}><MaterialCommunityIcons name="check" size={18} color="#fff" /><Text style={styles.acceptBtnText}>Accepter</Text></Pressable>
                  <Pressable style={styles.refuseBtn}><MaterialCommunityIcons name="close" size={18} color="#ef4444" /></Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.navSection}>
          {navItems.map(item => (
            <Pressable key={item.screen} style={styles.navItem} onPress={() => onNavigate?.(item.screen)}>
              <View style={styles.navLeft}><MaterialCommunityIcons name={item.icon} size={22} color="#64748b" /></View>
              <Text style={styles.navLabel}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
            </Pressable>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  onlineCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1c2630', borderRadius: 14, padding: 16, marginBottom: 16 },
  onlineCardActive: { borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  onlineLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  onlineLabel: { color: '#F8FAFC', fontSize: 15, fontWeight: '600' },
  toggleBtn: { width: 52, height: 30, borderRadius: 15, backgroundColor: '#2a3a4a', padding: 3, justifyContent: 'center' },
  toggleBtnActive: { backgroundColor: '#22c55e' },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  toggleKnobActive: { alignSelf: 'flex-end' },
  earningsCard: { backgroundColor: '#22c55e', borderRadius: 20, padding: 20, marginBottom: 12 },
  earningsTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  earningsAmount: { color: '#fff', fontSize: 36, fontWeight: '700', marginVertical: 6 },
  earningsStats: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  weeklyRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  weeklyCard: { flex: 1, backgroundColor: '#1c2630', borderRadius: 14, padding: 16, alignItems: 'center' },
  weeklyLabel: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  weeklyValue: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginTop: 6 },
  requestsSection: { marginBottom: 24 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  requestCard: { backgroundColor: '#1c2630', borderRadius: 14, padding: 14, marginBottom: 10 },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  reqVehIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  requestInfo: { flex: 1 },
  requestFare: { color: '#22c55e', fontSize: 20, fontWeight: '700' },
  requestDistance: { color: '#64748b', fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  requestTrip: { backgroundColor: '#233648', borderRadius: 10, padding: 10, marginBottom: 12 },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tripLine: { width: 2, height: 14, backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: 3, marginVertical: 3 },
  tripText: { color: '#F8FAFC', fontSize: 13 },
  requestActions: { flexDirection: 'row', gap: 10 },
  acceptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#22c55e', borderRadius: 10, paddingVertical: 12 },
  acceptBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  refuseBtn: { width: 48, height: 48, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', alignItems: 'center', justifyContent: 'center' },
  navSection: { marginBottom: 16 },
  navItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 8 },
  navLeft: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  navLabel: { flex: 1, color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
});