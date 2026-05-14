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
};

const mockFlight = {
  id: 1,
  airline: 'Royal Air Maroc',
  airlineCode: 'AT',
  flightNumber: 'AT 523',
  departure: 'Abidjan',
  departureCode: 'ABJ',
  arrival: 'Casablanca',
  arrivalCode: 'CMN',
  departureTime: '22:45',
  arrivalTime: '05:30',
  departureDate: '15 Jan 2026',
  arrivalDate: '16 Jan 2026',
  duration: '5h 45min',
  stops: 0,
  price: 285000,
  aircraft: 'Boeing 737-800',
  class: 'Economique',
  baggage: '2pcs 23kg',
};

const mockReturnFlight = {
  id: 2,
  airline: 'Royal Air Maroc',
  airlineCode: 'AT',
  flightNumber: 'AT 524',
  departure: 'Casablanca',
  departureCode: 'CMN',
  arrival: 'Abidjan',
  arrivalCode: 'ABJ',
  departureTime: '14:00',
  arrivalTime: '19:45',
  departureDate: '22 Jan 2026',
  arrivalDate: '22 Jan 2026',
  duration: '5h 45min',
  stops: 0,
  aircraft: 'Boeing 737-800',
  class: 'Economique',
  baggage: '2pcs 23kg',
};

const fareBreakdown = [
  { label: 'Tarif adulte x1', amount: '280 000 FCFA' },
  { label: 'Taxes et frais', amount: '5 000 FCFA' },
  { label: 'Frais de service', amount: '0 FCFA' },
];

export default function FlightsDetailsScreen({ onBack, onNavigate }) {
  const [isRoundTrip] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState({ outbound: null, return: null });

  const renderFlightDetail = (flight, label, isReturn = false) => (
    <View style={styles.flightSection}>
      <View style={styles.flightLabelRow}>
        <View style={styles.flightLabel}>
          <Text style={styles.flightLabelText}>{label}</Text>
        </View>
      </View>

      <View style={styles.routeCard}>
        <View style={styles.routeTop}>
          <View style={styles.cityBlock}>
            <Text style={styles.time}>{flight.departureTime}</Text>
            <Text style={styles.cityCode}>{flight.departureCode}</Text>
            <Text style={styles.cityName}>{flight.departure}</Text>
            <Text style={styles.dateText}>{flight.departureDate}</Text>
          </View>

          <View style={styles.flightPath}>
            <View style={styles.pathLine} />
            <MaterialCommunityIcons name="airplane" size={20} color={COLORS.skyBlue} />
            <View style={styles.pathLine} />
          </View>

          <View style={[styles.cityBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.time}>{flight.arrivalTime}</Text>
            <Text style={styles.cityCode}>{flight.arrivalCode}</Text>
            <Text style={styles.cityName}>{flight.arrival}</Text>
            <Text style={styles.dateText}>{flight.arrivalDate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Vol</Text>
            <Text style={styles.detailValue}>{flight.flightNumber}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duree</Text>
            <Text style={styles.detailValue}>{flight.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Avion</Text>
            <Text style={styles.detailValue}>{flight.aircraft}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Classe</Text>
            <Text style={styles.detailValue}>{flight.class}</Text>
          </View>
        </View>

        <View style={styles.amenitiesRow}>
          <View style={styles.amenityItem}>
            <MaterialCommunityIcons name="wifi" size={18} color={COLORS.skyBlue} />
            <Text style={styles.amenityText}>WiFi</Text>
          </View>
          <View style={styles.amenityItem}>
            <MaterialCommunityIcons name="power-plug" size={18} color={COLORS.skyBlue} />
            <Text style={styles.amenityText}>Prise</Text>
          </View>
          <View style={styles.amenityItem}>
            <MaterialCommunityIcons name="seat-passenger" size={18} color={COLORS.skyBlue} />
            <Text style={styles.amenityText}>SIEGE</Text>
          </View>
          <View style={styles.amenityItem}>
            <MaterialCommunityIcons name="food" size={18} color={COLORS.skyBlue} />
            <Text style={styles.amenityText}>Repas</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail du vol</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="airplane" size={24} color={COLORS.skyBlue} />
          <Text style={styles.title}>Abidjan - Casablanca</Text>
        </View>

        {renderFlightDetail(mockFlight, 'Vol aller')}
        {isRoundTrip && renderFlightDetail(mockReturnFlight, 'Vol retour', true)}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bagages inclus</Text>
          <View style={styles.baggageCard}>
            <MaterialCommunityIcons name="bag-suitcase" size={28} color={COLORS.green} />
            <View style={styles.baggageInfo}>
              <Text style={styles.baggageText}>{mockFlight.baggage}</Text>
              <Text style={styles.baggageSub}>par passager</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail du tarif</Text>
          <View style={styles.breakdownCard}>
            {fareBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={styles.breakdownAmount}>{item.amount}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>285 000 FCFA</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.seatBtn}>
          <MaterialCommunityIcons name="seat-passenger" size={20} color={COLORS.skyBlue} />
          <View style={styles.seatInfo}>
            <Text style={styles.seatBtnText}>Selection du siege</Text>
            <Text style={styles.seatBtnSub}>
              {selectedSeats.outbound ? `siege ${selectedSeats.outbound}` : 'Non selectionne'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Total</Text>
          <Text style={styles.footerPriceValue}>285 000 FCFA</Text>
        </View>
        <TouchableOpacity style={styles.continueBtn} onPress={() => onNavigate && onNavigate('FlightsBooking')}>
          <Text style={styles.continueBtnText}>Continuer</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  content: { flex: 1, paddingHorizontal: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  flightSection: { marginBottom: 16 },
  flightLabelRow: { marginBottom: 8 },
  flightLabel: { backgroundColor: COLORS.skyBlue, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  flightLabelText: { fontSize: 12, color: COLORS.white, fontWeight: '600' },
  routeCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },
  routeTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cityBlock: { width: 90 },
  time: { fontSize: 24, fontWeight: '700', color: COLORS.white },
  cityCode: { fontSize: 14, color: COLORS.skyBlue, fontWeight: '600', marginTop: 2 },
  cityName: { fontSize: 12, color: COLORS.lightGray, marginTop: 2 },
  dateText: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  flightPath: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  pathLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  detailItem: { width: '50%', marginBottom: 10 },
  detailLabel: { fontSize: 11, color: COLORS.gray, marginBottom: 2 },
  detailValue: { fontSize: 14, color: COLORS.white, fontWeight: '500' },
  amenitiesRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  amenityItem: { alignItems: 'center', gap: 4 },
  amenityText: { fontSize: 10, color: COLORS.lightGray },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 10 },
  baggageCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, gap: 14 },
  baggageInfo: { flex: 1 },
  baggageText: { fontSize: 15, color: COLORS.white, fontWeight: '600' },
  baggageSub: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  breakdownCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  breakdownLabel: { fontSize: 14, color: COLORS.lightGray },
  breakdownAmount: { fontSize: 14, color: COLORS.white },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  totalLabel: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
  totalAmount: { fontSize: 18, color: COLORS.green, fontWeight: '700' },
  seatBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 20, gap: 12 },
  seatInfo: { flex: 1 },
  seatBtnText: { fontSize: 15, color: COLORS.white, fontWeight: '500' },
  seatBtnSub: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 16 },
  footerPrice: {},
  footerPriceLabel: { fontSize: 12, color: COLORS.gray },
  footerPriceValue: { fontSize: 20, color: COLORS.green, fontWeight: '700' },
  continueBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.green, borderRadius: 12, paddingVertical: 14, gap: 8 },
  continueBtnText: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
});