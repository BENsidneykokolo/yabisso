import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const todayTotal = 18500;
const weekTotal = 98400;
const monthTotal = 385000;
const trips = 247;
const commissions = Math.round(todayTotal * 0.15);

const earningsByDay = [
  { day: 'Lundi', amount: 15200, trips: 12 },
  { day: 'Mardi', amount: 18500, trips: 15 },
  { day: 'Mercredi', amount: 12300, trips: 10 },
  { day: 'Jeudi', amount: 21000, trips: 18 },
  { day: 'Vendredi', amount: 19500, trips: 16 },
  { day: 'Samedi', amount: 28400, trips: 22 },
  { day: 'Dimanche', amount: 24700, trips: 20 },
];

const recentTrips = [
  { id: '1', pickup: 'Plateau', dest: 'Cocody', fare: 4500, time: '14:32', date: '12/05' },
  { id: '2', pickup: 'Yopougon', dest: 'Marcory', fare: 3200, time: '13:15', date: '12/05' },
  { id: '3', pickup: 'Treichville', dest: 'Abobo', fare: 5500, time: '11:45', date: '12/05' },
];

export default function TaxiDriverEarningsScreen({ onBack, onNavigate, route }) {
  const [period, setPeriod] = useState('today');
  const lastFare = route?.params?.lastFare;

  const totals = { today: todayTotal, week: weekTotal, month: monthTotal };
  const currentTotal = totals[period];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Mes revenus</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mainCard}>
        <View style={styles.periodRow}>
          {['today', 'week', 'month'].map(p => (
            <Pressable key={p} style={[styles.periodChip, period === p && styles.periodChipActive]} onPress={() => setPeriod(p)}>
              <Text style={[styles.periodChipText, period === p && styles.periodChipTextActive]}>
                {p === 'today' ? 'Auj.' : p === 'week' ? 'Semaine' : 'Mois'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.mainAmount}>{currentTotal.toLocaleString()}</Text>
        <Text style={styles.mainCurrency}>FCFA</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>{trips}</Text><Text style={styles.statLabel}>Courses</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>{commissions.toLocaleString()}</Text><Text style={styles.statLabel}>Commission 15%</Text></View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cette semaine</Text>
          <View style={styles.chartContainer}>
            {earningsByDay.map((d, i) => {
              const max = Math.max(...earningsByDay.map(x => x.amount));
              const height = (d.amount / max) * 60;
              return (
                <View key={d.day} style={styles.chartBar}>
                  <Text style={styles.barAmount}>{d.amount >= 1000 ? `${(d.amount/1000).toFixed(0)}k` : d.amount}</Text>
                  <View style={[styles.bar, { height }]} />
                  <Text style={styles.barDay}>{d.day.slice(0, 3)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dernieres courses</Text>
          {recentTrips.map(t => (
            <View key={t.id} style={styles.tripRow}>
              <View style={styles.tripLeft}>
                <Text style={styles.tripDate}>{t.date} - {t.time}</Text>
                <Text style={styles.tripRoute}>{t.pickup} → {t.dest}</Text>
              </View>
              <Text style={styles.tripFare}>{t.fare.toLocaleString()} FCFA</Text>
            </View>
          ))}
        </View>

        <View style={styles.withdrawSection}>
          <Text style={styles.sectionTitle}>Retirer mes gains</Text>
          <Pressable style={styles.withdrawBtn} onPress={() => onNavigate?.('wallet')}>
            <MaterialCommunityIcons name="bank-transfer" size={22} color="#fff" />
            <View style={styles.withdrawInfo}>
              <Text style={styles.withdrawLabel}>Verser sur mon portefeuille</Text>
              <Text style={styles.withdrawSublabel}>{currentTotal.toLocaleString()} FCFA disponible</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#64748b" />
          </Pressable>
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
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  mainCard: { backgroundColor: '#22c55e', marginHorizontal: 20, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16 },
  periodRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 99, padding: 4, marginBottom: 16 },
  periodChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 99 },
  periodChipActive: { backgroundColor: '#fff' },
  periodChipText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  periodChipTextActive: { color: '#0E151B' },
  mainAmount: { color: '#fff', fontSize: 48, fontWeight: '700' },
  mainCurrency: { color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: -4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, width: '100%' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 24 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: '#1c2630', borderRadius: 14, padding: 16, height: 120 },
  chartBar: { alignItems: 'center', flex: 1 },
  barAmount: { color: '#94A3B8', fontSize: 10, marginBottom: 4 },
  bar: { width: 20, backgroundColor: '#22c55e', borderRadius: 4, minHeight: 4 },
  barDay: { color: '#64748b', fontSize: 10, marginTop: 6 },
  tripRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 8 },
  tripLeft: {},
  tripDate: { color: '#64748b', fontSize: 12 },
  tripRoute: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginTop: 4 },
  tripFare: { color: '#22c55e', fontSize: 15, fontWeight: '700' },
  withdrawSection: { marginTop: 24 },
  withdrawBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#22c55e', borderRadius: 14, padding: 16, gap: 12 },
  withdrawInfo: { flex: 1 },
  withdrawLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  withdrawSublabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
});