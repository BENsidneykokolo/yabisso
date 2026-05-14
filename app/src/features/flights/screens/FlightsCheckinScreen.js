import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
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

const mockBookingFound = {
  reference: 'YBT-AB1234',
  lastName: 'Kone',
  outbound: { departure: 'Abidjan', arrival: 'Casablanca', date: '15 Jan 2026', time: '22:45' },
  returnFlight: { departure: 'Casablanca', arrival: 'Abidjan', date: '22 Jan 2026', time: '14:00' },
  passengers: 1,
  status: 'Check-in ouvert',
};

export default function FlightsCheckinScreen({ onBack, onNavigate }) {
  const [reference, setReference] = useState('');
  const [lastName, setLastName] = useState('');
  const [booking, setBooking] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleRetrieve = () => {
    if (!reference || !lastName) return;
    setSearching(true);
    setTimeout(() => {
      setBooking(mockBookingFound);
      setSearching(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enregistrement en ligne</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <MaterialCommunityIcons name="airplane-check" size={48} color={COLORS.skyBlue} />
          <Text style={styles.heroTitle}>Enregistrement en ligne</Text>
          <Text style={styles.heroSubtitle}>
            Enregistrez-vous et selectionnez votre siege a l'avance
          </Text>
        </View>

        {!booking ? (
          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>Rechercher ma reservation</Text>
            <TextInput
              style={styles.input}
              placeholder="Reference de reservation (ex: YBT-AB1234)"
              placeholderTextColor={COLORS.gray}
              value={reference}
              onChangeText={setReference}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="Nom de famille"
              placeholderTextColor={COLORS.gray}
              value={lastName}
              onChangeText={setLastName}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleRetrieve} disabled={searching}>
              {searching ? (
                <Text style={styles.searchBtnText}>Recherche en cours...</Text>
              ) : (
                <>
                  <MaterialCommunityIcons name="magnify" size={20} color={COLORS.white} />
                  <Text style={styles.searchBtnText}>Rechercher</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bookingSection}>
            <View style={styles.foundCard}>
              <View style={styles.statusBadge}>
                <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.green} />
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
              <Text style={styles.refText}>{booking.reference}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vol aller</Text>
              <View style={styles.flightCard}>
                <View style={styles.flightRow}>
                  <View>
                    <Text style={styles.flightTime}>{booking.outbound.time}</Text>
                    <Text style={styles.flightCity}>{booking.outbound.departure}</Text>
                  </View>
                  <View style={styles.flightArrow}>
                    <MaterialCommunityIcons name="airplane" size={18} color={COLORS.skyBlue} />
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.flightTime}>{booking.outbound.arrival}</Text>
                    <Text style={[styles.flightCity, { textAlign: 'right' }]}>{booking.outbound.date}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vol retour</Text>
              <View style={styles.flightCard}>
                <View style={styles.flightRow}>
                  <View>
                    <Text style={styles.flightTime}>{booking.returnFlight.time}</Text>
                    <Text style={styles.flightCity}>{booking.returnFlight.departure}</Text>
                  </View>
                  <View style={styles.flightArrow}>
                    <MaterialCommunityIcons name="airplane" size={18} color={COLORS.skyBlue} />
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.flightTime}>{booking.returnFlight.arrival}</Text>
                    <Text style={[styles.flightCity, { textAlign: 'right' }]}>{booking.returnFlight.date}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.passengerInfo}>
              <MaterialCommunityIcons name="account-group" size={20} color={COLORS.skyBlue} />
              <Text style={styles.passengerText}>{booking.passengers} passager(s)</Text>
            </View>

            <TouchableOpacity style={styles.checkinBtn}>
              <MaterialCommunityIcons name="check-all" size={22} color={COLORS.white} />
              <Text style={styles.checkinBtnText}>Commencer l'enregistrement</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setBooking(null)}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.helpCard}>
          <MaterialCommunityIcons name="help-circle" size={24} color={COLORS.skyBlue} />
          <View style={styles.helpInfo}>
            <Text style={styles.helpTitle}>Besoin d'aide?</Text>
            <Text style={styles.helpText}>
              Si vous ne trouvez pas votre reservation, contactez le service client.
            </Text>
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
  content: { flex: 1, paddingHorizontal: 16 },
  heroCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, marginTop: 10 },
  heroTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginTop: 12, marginBottom: 4 },
  heroSubtitle: { fontSize: 13, color: COLORS.gray, textAlign: 'center' },
  searchSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 12 },
  input: { backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.white, marginBottom: 12 },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.skyBlue, borderRadius: 12, paddingVertical: 16, gap: 8 },
  searchBtnText: { fontSize: 15, color: COLORS.white, fontWeight: '600' },
  bookingSection: { marginBottom: 20 },
  foundCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.green + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6, marginBottom: 10 },
  statusText: { fontSize: 12, color: COLORS.green, fontWeight: '600' },
  refText: { fontSize: 24, fontWeight: '800', color: COLORS.skyBlue, letterSpacing: 2 },
  section: { marginBottom: 12 },
  flightCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14 },
  flightRow: { flexDirection: 'row', alignItems: 'center' },
  flightTime: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  flightCity: { fontSize: 12, color: COLORS.lightGray, marginTop: 2 },
  flightArrow: { flex: 1, alignItems: 'center' },
  passengerInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 16, gap: 10 },
  passengerText: { fontSize: 14, color: COLORS.white, fontWeight: '500' },
  checkinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.green, borderRadius: 12, paddingVertical: 16, gap: 8, marginBottom: 10 },
  checkinBtnText: { fontSize: 15, color: COLORS.white, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { fontSize: 14, color: COLORS.gray },
  helpCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, gap: 12, marginTop: 10 },
  helpInfo: { flex: 1 },
  helpTitle: { fontSize: 14, color: COLORS.white, fontWeight: '600' },
  helpText: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
});