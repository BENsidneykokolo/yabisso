import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
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

const recentSearches = [
  { id: 1, from: 'Abidjan', to: 'Casablanca', code: 'ABJ-CMN' },
  { id: 2, from: 'Douala', to: 'Paris', code: 'DLA-CDG' },
  { id: 3, from: 'Lagos', to: 'Nairobi', code: 'LOS-NBO' },
  { id: 4, from: 'Dakar', to: 'Londres', code: 'DKR-LHR' },
];

const popularRoutes = [
  { id: 1, from: 'Abidjan', to: 'Paris', price: '285 000' },
  { id: 2, from: 'Casablanca', to: 'New York', price: '420 000' },
  { id: 3, from: 'Dakar', to: 'Bruxelles', price: '310 000' },
  { id: 4, from: 'Douala', to: 'Istanbul', price: '340 000' },
];

export default function FlightsHomeScreen({ onBack, onNavigate }) {
  const [tripType, setTripType] = useState('oneWay');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departureDate, setDepartureDate] = useState('15 Jan 2026');
  const [returnDate, setReturnDate] = useState('22 Jan 2026');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('economique');
  const [showPassengers, setShowPassengers] = useState(false);
  const [showClass, setShowClass] = useState(false);

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSearch = () => {
    if (onNavigate) {
      onNavigate('FlightsResults');
    }
  };

  const passengerLabel = `${adults + children + infants} passager${adults + children + infants > 1 ? 's' : ''}`;

  const classLabels = {
    economique: 'Economique',
    premium: 'Premium Economique',
    affaires: 'Affaires',
    premiere: 'Premiere',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vols</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tripTypeContainer}>
          <TouchableOpacity
            style={[styles.tripTypeBtn, tripType === 'oneWay' && styles.tripTypeActive]}
            onPress={() => setTripType('oneWay')}
          >
            <Text style={[styles.tripTypeText, tripType === 'oneWay' && styles.tripTypeTextActive]}>
              Aller simple
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tripTypeBtn, tripType === 'roundTrip' && styles.tripTypeActive]}
            onPress={() => setTripType('roundTrip')}
          >
            <Text style={[styles.tripTypeText, tripType === 'roundTrip' && styles.tripTypeTextActive]}>
              Aller-retour
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.routeCard}>
          <View style={styles.cityRow}>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="airplane-takeoff" size={20} color={COLORS.skyBlue} style={styles.inputIcon} />
              <TextInput
                style={styles.cityInput}
                placeholder="Ville de depart"
                placeholderTextColor={COLORS.gray}
                value={fromCity}
                onChangeText={setFromCity}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.swapBtn} onPress={swapCities}>
            <View style={styles.swapBtnCircle}>
              <MaterialCommunityIcons name="swap-vertical" size={20} color={COLORS.skyBlue} />
            </View>
          </TouchableOpacity>

          <View style={styles.cityRow}>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="airplane-landing" size={20} color={COLORS.green} style={styles.inputIcon} />
              <TextInput
                style={styles.cityInput}
                placeholder="Ville d'arrivee"
                placeholderTextColor={COLORS.gray}
                value={toCity}
                onChangeText={setToCity}
              />
            </View>
          </View>
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateCard}>
            <Text style={styles.dateLabel}>Depart</Text>
            <Text style={styles.dateValue}>{departureDate}</Text>
          </TouchableOpacity>
          {tripType === 'roundTrip' && (
            <TouchableOpacity style={styles.dateCard}>
              <Text style={styles.dateLabel}>Retour</Text>
              <Text style={styles.dateValue}>{returnDate}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.selectorCard} onPress={() => setShowPassengers(!showPassengers)}>
          <MaterialCommunityIcons name="account-group-outline" size={20} color={COLORS.skyBlue} />
          <View style={styles.selectorContent}>
            <Text style={styles.selectorLabel}>Passagers</Text>
            <Text style={styles.selectorValue}>{passengerLabel}</Text>
          </View>
          <Ionicons name={showPassengers ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.lightGray} />
        </TouchableOpacity>

        {showPassengers && (
          <View style={styles.dropdownCard}>
            <View style={styles.counterRow}>
              <View>
                <Text style={styles.counterLabel}>Adultes</Text>
                <Text style={styles.counterSub}>12+ ans</Text>
              </View>
              <View style={styles.counterControls}>
                <Pressable style={styles.counterBtn} onPress={() => setAdults(Math.max(1, adults - 1))}>
                  <Text style={styles.counterBtnText}>-</Text>
                </Pressable>
                <Text style={styles.counterValue}>{adults}</Text>
                <Pressable style={styles.counterBtn} onPress={() => setAdults(adults + 1)}>
                  <Text style={styles.counterBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.counterRow}>
              <View>
                <Text style={styles.counterLabel}>Enfants</Text>
                <Text style={styles.counterSub}>2-11 ans</Text>
              </View>
              <View style={styles.counterControls}>
                <Pressable style={styles.counterBtn} onPress={() => setChildren(Math.max(0, children - 1))}>
                  <Text style={styles.counterBtnText}>-</Text>
                </Pressable>
                <Text style={styles.counterValue}>{children}</Text>
                <Pressable style={styles.counterBtn} onPress={() => setChildren(children + 1)}>
                  <Text style={styles.counterBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.counterRow}>
              <View>
                <Text style={styles.counterLabel}>Nourrissons</Text>
                <Text style={styles.counterSub}>Moins de 2 ans</Text>
              </View>
              <View style={styles.counterControls}>
                <Pressable style={styles.counterBtn} onPress={() => setInfants(Math.max(0, infants - 1))}>
                  <Text style={styles.counterBtnText}>-</Text>
                </Pressable>
                <Text style={styles.counterValue}>{infants}</Text>
                <Pressable style={styles.counterBtn} onPress={() => setInfants(infants + 1)}>
                  <Text style={styles.counterBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.selectorCard} onPress={() => setShowClass(!showClass)}>
          <MaterialCommunityIcons name="seat-passenger" size={20} color={COLORS.skyBlue} />
          <View style={styles.selectorContent}>
            <Text style={styles.selectorLabel}>Classe</Text>
            <Text style={styles.selectorValue}>{classLabels[cabinClass]}</Text>
          </View>
          <Ionicons name={showClass ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.lightGray} />
        </TouchableOpacity>

        {showClass && (
          <View style={styles.dropdownCard}>
            {Object.entries(classLabels).map(([key, label]) => (
              <Pressable key={key} style={styles.classOption} onPress={() => { setCabinClass(key); setShowClass(false); }}>
                <Text style={[styles.classOptionText, cabinClass === key && styles.classOptionActive]}>{label}</Text>
                {cabinClass === key && <Ionicons name="checkmark" size={20} color={COLORS.skyBlue} />}
              </Pressable>
            ))}
          </View>
        )}

        <Pressable style={styles.searchBtn} onPress={handleSearch}>
          <MaterialCommunityIcons name="magnify" size={22} color={COLORS.white} />
          <Text style={styles.searchBtnText}>Rechercher des vols</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recherches recentes</Text>
          {recentSearches.map((item) => (
            <TouchableOpacity key={item.id} style={styles.recentItem} onPress={() => {
              setFromCity(item.from);
              setToCity(item.to);
            }}>
              <View style={styles.recentIcon}>
                <MaterialCommunityIcons name="history" size={18} color={COLORS.skyBlue} />
              </View>
              <View style={styles.recentInfo}>
                <Text style={styles.recentRoute}>{item.from} - {item.to}</Text>
                <Text style={styles.recentCode}>{item.code}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Routes populaires</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularRoutes.map((item) => (
              <TouchableOpacity key={item.id} style={styles.popularCard}>
                <MaterialCommunityIcons name="airplane" size={24} color={COLORS.skyBlue} />
                <Text style={styles.popularRoute}>{item.from} - {item.to}</Text>
                <Text style={styles.popularPrice}>A partir de {item.price} FCFA</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  content: { flex: 1, paddingHorizontal: 16 },
  tripTypeContainer: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 12, padding: 4, marginBottom: 16 },
  tripTypeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tripTypeActive: { backgroundColor: COLORS.skyBlue },
  tripTypeText: { fontSize: 14, color: COLORS.lightGray, fontWeight: '500' },
  tripTypeTextActive: { color: COLORS.white, fontWeight: '600' },
  routeCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12 },
  cityRow: { marginVertical: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 10, paddingHorizontal: 12 },
  inputIcon: { marginRight: 10 },
  cityInput: { flex: 1, color: COLORS.white, fontSize: 16, paddingVertical: 14 },
  swapBtn: { alignItems: 'center', marginVertical: -6, zIndex: 1 },
  swapBtnCircle: { backgroundColor: COLORS.skyBlue, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.card },
  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  dateCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 14 },
  dateLabel: { fontSize: 12, color: COLORS.lightGray, marginBottom: 4 },
  dateValue: { fontSize: 15, color: COLORS.white, fontWeight: '600' },
  selectorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 12, gap: 12 },
  selectorContent: { flex: 1 },
  selectorLabel: { fontSize: 12, color: COLORS.lightGray },
  selectorValue: { fontSize: 15, color: COLORS.white, fontWeight: '500' },
  dropdownCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 8, marginBottom: 12 },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 8 },
  counterLabel: { fontSize: 15, color: COLORS.white, fontWeight: '500' },
  counterSub: { fontSize: 12, color: COLORS.gray },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { fontSize: 18, color: COLORS.skyBlue, fontWeight: '600' },
  counterValue: { fontSize: 16, color: COLORS.white, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 8 },
  classOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8 },
  classOptionText: { fontSize: 15, color: COLORS.lightGray },
  classOptionActive: { color: COLORS.skyBlue, fontWeight: '600' },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.green, borderRadius: 14, paddingVertical: 16, gap: 8, marginBottom: 24 },
  searchBtnText: { fontSize: 17, color: COLORS.white, fontWeight: '700' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.white, marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginBottom: 8, gap: 12 },
  recentIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center' },
  recentInfo: { flex: 1 },
  recentRoute: { fontSize: 14, color: COLORS.white, fontWeight: '600' },
  recentCode: { fontSize: 12, color: COLORS.gray },
  popularCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginRight: 12, width: 160, alignItems: 'center' },
  popularRoute: { fontSize: 13, color: COLORS.white, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  popularPrice: { fontSize: 12, color: COLORS.green, marginTop: 4 },
});