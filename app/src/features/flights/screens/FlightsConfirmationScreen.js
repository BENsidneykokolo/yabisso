import React from 'react';
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
};

const mockBooking = {
  reference: 'YBT-AB1234',
  status: 'Confirme',
  passengers: [
    { firstName: 'Jean', lastName: 'Kone', seat: '12A' },
  ],
  outbound: {
    airline: 'Royal Air Maroc',
    flightNumber: 'AT 523',
    departure: 'Abidjan (ABJ)',
    arrival: 'Casablanca (CMN)',
    departureTime: '22:45',
    arrivalTime: '05:30',
    date: '15 Janvier 2026',
    duration: '5h 45min',
  },
  returnFlight: {
    airline: 'Royal Air Maroc',
    flightNumber: 'AT 524',
    departure: 'Casablanca (CMN)',
    arrival: 'Abidjan (ABJ)',
    departureTime: '14:00',
    arrivalTime: '19:45',
    date: '22 Janvier 2026',
    duration: '5h 45min',
  },
  total: '298 000 FCFA',
};

export default function FlightsConfirmationScreen({ onBack, onNavigate }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.successHeader}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.green} />
          </View>
          <Text style={styles.successTitle}>Reservation confirmee!</Text>
          <Text style={styles.successSubtitle}>Votre billet a ete envoye par e-mail</Text>
        </View>

        <View style={styles.referenceCard}>
          <Text style={styles.referenceLabel}>Reference de reservation</Text>
          <Text style={styles.referenceCode}>{mockBooking.reference}</Text>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark" size={14} color={COLORS.white} />
            <Text style={styles.statusText}>{mockBooking.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details du vol aller</Text>
          <View style={styles.flightCard}>
            <View style={styles.flightHeader}>
              <MaterialCommunityIcons name="airplane" size={20} color={COLORS.skyBlue} />
              <Text style={styles.airlineName}>{mockBooking.outbound.airline}</Text>
              <Text style={styles.flightNum}>{mockBooking.outbound.flightNumber}</Text>
            </View>
            <View style={styles.routeRow}>
              <View style={styles.routePoint}>
                <Text style={styles.routeTime}>{mockBooking.outbound.departureTime}</Text>
                <Text style={styles.routeCity}>{mockBooking.outbound.departure}</Text>
              </View>
              <View style={styles.routeArrow}>
                <View style={styles.arrowLine} />
                <MaterialCommunityIcons name="airplane" size={18} color={COLORS.skyBlue} />
                <Text style={styles.arrowDuration}>{mockBooking.outbound.duration}</Text>
              </View>
              <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
                <Text style={styles.routeTime}>{mockBooking.outbound.arrivalTime}</Text>
                <Text style={styles.routeCity}>{mockBooking.outbound.arrival}</Text>
              </View>
            </View>
            <Text style={styles.flightDate}>{mockBooking.outbound.date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details du vol retour</Text>
          <View style={styles.flightCard}>
            <View style={styles.flightHeader}>
              <MaterialCommunityIcons name="airplane" size={20} color={COLORS.skyBlue} />
              <Text style={styles.airlineName}>{mockBooking.returnFlight.airline}</Text>
              <Text style={styles.flightNum}>{mockBooking.returnFlight.flightNumber}</Text>
            </View>
            <View style={styles.routeRow}>
              <View style={styles.routePoint}>
                <Text style={styles.routeTime}>{mockBooking.returnFlight.departureTime}</Text>
                <Text style={styles.routeCity}>{mockBooking.returnFlight.departure}</Text>
              </View>
              <View style={styles.routeArrow}>
                <View style={styles.arrowLine} />
                <MaterialCommunityIcons name="airplane" size={18} color={COLORS.skyBlue} />
                <Text style={styles.arrowDuration}>{mockBooking.returnFlight.duration}</Text>
              </View>
              <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
                <Text style={styles.routeTime}>{mockBooking.returnFlight.arrivalTime}</Text>
                <Text style={styles.routeCity}>{mockBooking.returnFlight.arrival}</Text>
              </View>
            </View>
            <Text style={styles.flightDate}>{mockBooking.returnFlight.date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passagers</Text>
          {mockBooking.passengers.map((p, i) => (
            <View key={i} style={styles.passengerCard}>
              <MaterialCommunityIcons name="account" size={24} color={COLORS.skyBlue} />
              <View style={styles.passengerInfo}>
                <Text style={styles.passengerName}>{p.firstName} {p.lastName}</Text>
                <Text style={styles.passengerSeat}>Siege {p.seat}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Montant paye</Text>
          <Text style={styles.totalValue}>{mockBooking.total}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialCommunityIcons name="download" size={20} color={COLORS.skyBlue} />
            <Text style={styles.actionBtnText}>Telecharger</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-outline" size={20} color={COLORS.skyBlue} />
            <Text style={styles.actionBtnText}>Partager</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.homeBtn} onPress={() => onNavigate && onNavigate('home')}>
          <Text style={styles.homeBtnText}>Retour a l'accueil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: 16 },
  successHeader: { alignItems: 'center', paddingVertical: 30 },
  successIcon: { marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  successSubtitle: { fontSize: 14, color: COLORS.gray },
  referenceCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 },
  referenceLabel: { fontSize: 12, color: COLORS.gray, marginBottom: 6 },
  referenceCode: { fontSize: 28, fontWeight: '800', color: COLORS.skyBlue, letterSpacing: 3, marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.green, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  statusText: { fontSize: 12, color: COLORS.white, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 10 },
  flightCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16 },
  flightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  airlineName: { flex: 1, fontSize: 14, color: COLORS.white, fontWeight: '600' },
  flightNum: { fontSize: 12, color: COLORS.gray },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  routePoint: { width: 80 },
  routeTime: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  routeCity: { fontSize: 11, color: COLORS.lightGray, marginTop: 2 },
  routeArrow: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  arrowLine: { width: '100%', height: 1, backgroundColor: COLORS.border, marginBottom: 6 },
  arrowDuration: { fontSize: 11, color: COLORS.gray, marginTop: 4 },
  flightDate: { fontSize: 12, color: COLORS.skyBlue, fontWeight: '500' },
  passengerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  passengerInfo: { flex: 1 },
  passengerName: { fontSize: 15, color: COLORS.white, fontWeight: '600' },
  passengerSeat: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  totalCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 16 },
  totalLabel: { fontSize: 14, color: COLORS.lightGray },
  totalValue: { fontSize: 18, color: COLORS.green, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 14, gap: 8 },
  actionBtnText: { fontSize: 14, color: COLORS.skyBlue, fontWeight: '600' },
  footer: { padding: 16, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border },
  homeBtn: { backgroundColor: COLORS.green, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  homeBtnText: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
});