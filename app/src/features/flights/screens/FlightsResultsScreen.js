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

const mockFlights = [
  {
    id: 1,
    airline: 'Royal Air Maroc',
    airlineCode: 'AT',
    flightNumber: 'AT 523',
    departure: 'Abidjan (ABJ)',
    arrival: 'Casablanca (CMN)',
    departureTime: '22:45',
    arrivalTime: '05:30',
    duration: '5h 45min',
    stops: 0,
    price: 285000,
    aircraft: 'Boeing 737-800',
    class: 'Economique',
  },
  {
    id: 2,
    airline: 'Air Cote d\'Ivoire',
    airlineCode: 'HF',
    flightNumber: 'HF 947',
    departure: 'Abidjan (ABJ)',
    arrival: 'Casablanca (CMN)',
    departureTime: '14:20',
    arrivalTime: '20:15',
    duration: '4h 55min',
    stops: 1,
    price: 320000,
    aircraft: 'Airbus A320',
    class: 'Affaires',
  },
  {
    id: 3,
    airline: 'TAP Portugal',
    airlineCode: 'TP',
    flightNumber: 'TP 1472',
    departure: 'Abidjan (ABJ)',
    arrival: 'Casablanca (CMN)',
    departureTime: '08:00',
    arrivalTime: '18:30',
    duration: '9h 30min',
    stops: 1,
    price: 245000,
    aircraft: 'Airbus A320neo',
    class: 'Economique',
  },
  {
    id: 4,
    airline: 'Ethiopian Airlines',
    airlineCode: 'ET',
    flightNumber: 'ET 641',
    departure: 'Abidjan (ABJ)',
    arrival: 'Casablanca (CMN)',
    departureTime: '06:15',
    arrivalTime: '10:30',
    duration: '3h 15min',
    stops: 0,
    price: 380000,
    aircraft: 'Boeing 787-8',
    class: 'Premiere',
  },
];

const filterChips = [
  { id: 'direct', label: 'Direct', icon: 'airplane' },
  { id: 'escale', label: '1 Escale', icon: 'airplane-takeoff' },
  { id: 'morning', label: 'Matin', icon: 'weather-sunny' },
  { id: 'afternoon', label: 'Apres-midi', icon: 'weather-partly-cloudy' },
  { id: 'evening', label: 'Soir', icon: 'weather-night' },
];

const sortOptions = ['Prix', 'Depart', 'Duree', 'Arrivee'];

export default function FlightsResultsScreen({ onBack, onNavigate, route }) {
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Prix');
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleFilter = (id) => {
    setActiveFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const formatPrice = (price) => `${price.toLocaleString('fr-FR')} FCFA`;

  const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonRow}>
        <View style={[styles.skeletonBox, { width: 80, height: 80 }]} />
        <View style={{ flex: 1 }}>
          <View style={[styles.skeletonLine, { width: '60%' }]} />
          <View style={[styles.skeletonLine, { width: '40%', marginTop: 8 }]} />
          <View style={[styles.skeletonLine, { width: '50%', marginTop: 8 }]} />
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{route?.from || 'ABJ'} - {route?.to || 'CMN'}</Text>
          <Text style={styles.headerSub}>15 Jan 2026 - 1 passager</Text>
        </View>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterBtn}>
          <MaterialCommunityIcons name="filter-variant" size={24} color={COLORS.skyBlue} />
        </TouchableOpacity>
      </View>

      <View style={styles.sortRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.sortChip, sortBy === option && styles.sortChipActive]}
              onPress={() => setSortBy(option)}
            >
              <Text style={[styles.sortText, sortBy === option && styles.sortTextActive]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filtersTitle}>Filtres</Text>
          <View style={styles.chipsRow}>
            {filterChips.map((chip) => (
              <TouchableOpacity
                key={chip.id}
                style={[styles.chip, activeFilters.includes(chip.id) && styles.chipActive]}
                onPress={() => toggleFilter(chip.id)}
              >
                <MaterialCommunityIcons
                  name={chip.icon}
                  size={16}
                  color={activeFilters.includes(chip.id) ? COLORS.white : COLORS.skyBlue}
                />
                <Text style={[styles.chipText, activeFilters.includes(chip.id) && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>
          {mockFlights.length} vols trouves
        </Text>

        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          mockFlights.map((flight) => (
            <TouchableOpacity
              key={flight.id}
              style={styles.flightCard}
              onPress={() => onNavigate && onNavigate('FlightsDetails', { flight })}
            >
              <View style={styles.airlineRow}>
                <View style={styles.airlineLogo}>
                  <Text style={styles.airlineCode}>{flight.airlineCode}</Text>
                </View>
                <Text style={styles.airlineName}>{flight.airline}</Text>
                <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeText}>{flight.departureTime}</Text>
                  <Text style={styles.cityText}>{flight.departure.split('(')[0].trim()}</Text>
                </View>

                <View style={styles.durationBlock}>
                  <Text style={styles.durationText}>{flight.duration}</Text>
                  <View style={styles.flightLine}>
                    <View style={styles.dot} />
                    <View style={styles.line} />
                    <MaterialCommunityIcons name="airplane" size={16} color={COLORS.skyBlue} />
                    <View style={styles.line} />
                    <View style={styles.dot} />
                  </View>
                  <Text style={styles.stopsText}>
                    {flight.stops === 0 ? 'Direct' : `${flight.stops} escale${flight.stops > 1 ? 's' : ''}`}
                  </Text>
                </View>

                <View style={[styles.timeBlock, { alignItems: 'flex-end' }]}>
                  <Text style={styles.timeText}>{flight.arrivalTime}</Text>
                  <Text style={styles.cityText}>{flight.arrival.split('(')[0].trim()}</Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <View style={styles.amenities}>
                  <MaterialCommunityIcons name="wifi" size={14} color={COLORS.gray} />
                  <MaterialCommunityIcons name="power-plug" size={14} color={COLORS.gray} style={{ marginLeft: 8 }} />
                  <MaterialCommunityIcons name="seat-passenger" size={14} color={COLORS.gray} style={{ marginLeft: 8 }} />
                </View>
                <View>
                  <Text style={styles.priceText}>{formatPrice(flight.price)}</Text>
                  <Text style={styles.priceSub}>par personne</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: 12, color: COLORS.lightGray, marginTop: 2 },
  filterBtn: { padding: 4 },
  sortRow: { paddingHorizontal: 16, paddingBottom: 12 },
  sortChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 8 },
  sortChipActive: { backgroundColor: COLORS.skyBlue },
  sortText: { fontSize: 13, color: COLORS.lightGray, fontWeight: '500' },
  sortTextActive: { color: COLORS.white, fontWeight: '600' },
  filtersPanel: { backgroundColor: COLORS.card, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filtersTitle: { fontSize: 14, fontWeight: '600', color: COLORS.white, marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.inputBg, gap: 6 },
  chipActive: { backgroundColor: COLORS.skyBlue },
  chipText: { fontSize: 12, color: COLORS.skyBlue, fontWeight: '500' },
  chipTextActive: { color: COLORS.white },
  content: { flex: 1, paddingHorizontal: 16 },
  resultsCount: { fontSize: 13, color: COLORS.gray, marginBottom: 12 },
  flightCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12 },
  airlineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  airlineLogo: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center' },
  airlineCode: { fontSize: 14, fontWeight: '700', color: COLORS.skyBlue },
  airlineName: { flex: 1, fontSize: 14, color: COLORS.white, fontWeight: '500' },
  flightNumber: { fontSize: 12, color: COLORS.gray },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  timeBlock: { width: 80 },
  timeText: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  cityText: { fontSize: 12, color: COLORS.lightGray, marginTop: 2 },
  durationBlock: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  durationText: { fontSize: 12, color: COLORS.lightGray, marginBottom: 6 },
  flightLine: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.skyBlue },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  stopsText: { fontSize: 11, color: COLORS.green, marginTop: 4, fontWeight: '500' },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  amenities: { flexDirection: 'row' },
  priceText: { fontSize: 18, fontWeight: '700', color: COLORS.green },
  priceSub: { fontSize: 11, color: COLORS.gray },
  skeletonCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12 },
  skeletonLine: { height: 16, backgroundColor: COLORS.inputBg, borderRadius: 4, marginBottom: 12 },
  skeletonRow: { flexDirection: 'row', gap: 12 },
  skeletonBox: { backgroundColor: COLORS.inputBg, borderRadius: 8 },
});