import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#0E151B',
  card: '#1A2332',
  skyBlue: '#38BDF8',
  green: '#22c55e',
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  border: '#374151',
  inputBg: '#111827',
  orange: '#F97316',
};

const upcomingFlights = [
  {
    id: 1,
    reference: 'YBT-AB1234',
    route: 'Abidjan - Casablanca',
    dates: '15 Jan - 22 Jan 2026',
    status: 'Confirme',
    price: '298 000 FCFA',
  },
];

const pastFlights = [
  {
    id: 1,
    route: 'Dakar - Paris',
    dates: '10 Dec 2025',
    status: 'Termine',
    reference: 'YBT-CD5678',
  },
  {
    id: 2,
    route: 'Lagos - Nairobi',
    dates: '25 Nov 2025',
    status: 'Termine',
    reference: 'YBT-EF9012',
  },
  {
    id: 3,
    route: 'Douala - Istanbul',
    dates: '05 Oct 2025',
    status: 'Annule',
    reference: 'YBT-GH3456',
  },
];

export default function FlightsHistoryScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('upcoming');

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirme': return { bg: COLORS.green + '20', color: COLORS.green };
      case 'Termine': return { bg: COLORS.skyBlue + '20', color: COLORS.skyBlue };
      case 'Annule': return { bg: COLORS.orange + '20', color: COLORS.orange };
      default: return { bg: COLORS.gray + '20', color: COLORS.gray };
    }
  };

  const renderFlightItem = (flight, isPast = false) => {
    const statusStyle = getStatusStyle(flight.status);
    return (
      <TouchableOpacity key={flight.id} style={styles.flightCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.routeText}>{flight.route}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{flight.status}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{flight.dates}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.refText}>{flight.reference}</Text>
          {!isPast && <Text style={styles.priceText}>{flight.price}</Text>}
          <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique des vols</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <MaterialCommunityIcons name="airplane-clock" size={20} color={activeTab === 'upcoming' ? COLORS.white : COLORS.lightGray} />
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            A venir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <MaterialCommunityIcons name="history" size={20} color={activeTab === 'past' ? COLORS.white : COLORS.lightGray} />
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Passes
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'upcoming' ? (
          upcomingFlights.length > 0 ? (
            <>
              {upcomingFlights.map((f) => renderFlightItem(f))}
              <TouchableOpacity style={styles.checkinBanner}>
                <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color={COLORS.green} />
                <View style={styles.bannerInfo}>
                  <Text style={styles.bannerTitle}>Enregistrement en ligne</Text>
                  <Text style={styles.bannerSubtitle}>Disponible 24h avant le depart</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={COLORS.gray} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="airplane-off" size={48} color={COLORS.gray} />
              <Text style={styles.emptyTitle}>Aucun vol a venir</Text>
              <Text style={styles.emptySubtitle}>Vos reservations apparaitront ici</Text>
            </View>
          )
        ) : (
          pastFlights.length > 0 ? (
            pastFlights.map((f) => renderFlightItem(f, true))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="history" size={48} color={COLORS.gray} />
              <Text style={styles.emptyTitle}>Aucun vol passe</Text>
              <Text style={styles.emptySubtitle}>Votre historique apparaitra ici</Text>
            </View>
          )
        )}

        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Votre activite</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Vols effectues</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Destinations</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>48K</Text>
              <Text style={styles.statLabel}>km parcourus</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 12 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 12, gap: 8 },
  tabActive: { backgroundColor: COLORS.skyBlue },
  tabText: { fontSize: 14, color: COLORS.lightGray, fontWeight: '500' },
  tabTextActive: { color: COLORS.white, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 16 },
  flightCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  routeText: { fontSize: 16, color: COLORS.white, fontWeight: '600', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },
  dateText: { fontSize: 13, color: COLORS.gray, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refText: { flex: 1, fontSize: 12, color: COLORS.lightGray },
  priceText: { fontSize: 14, color: COLORS.green, fontWeight: '600' },
  checkinBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12, gap: 12 },
  bannerInfo: { flex: 1 },
  bannerTitle: { fontSize: 14, color: COLORS.white, fontWeight: '600' },
  bannerSubtitle: { fontSize: 12, color: COLORS.gray },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, color: COLORS.white, fontWeight: '600' },
  emptySubtitle: { fontSize: 14, color: COLORS.gray },
  statsSection: { marginTop: 20, marginBottom: 16 },
  statsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: COLORS.skyBlue },
  statLabel: { fontSize: 11, color: COLORS.gray, marginTop: 4, textAlign: 'center' },
});