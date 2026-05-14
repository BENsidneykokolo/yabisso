import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
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

const countries = ['Cote d\'Ivoire', 'Sénégal', 'France', 'Maroc', 'Autres'];

const addOns = [
  { id: 'bag1', label: 'Bagage supplementaire 23kg', price: '15 000 FCFA', icon: 'bag-personal' },
  { id: 'bag2', label: 'Bagage supplementaire 32kg', price: '25 000 FCFA', icon: 'bag-suitcase' },
  { id: 'priority', label: 'Embarquement prioritaire', price: '5 000 FCFA', icon: 'arrow-up-bold' },
  { id: 'insurance', label: 'Assurance voyage', price: '8 000 FCFA', icon: 'shield-check' },
];

export default function FlightsBookingScreen({ onBack, onNavigate }) {
  const [travelers, setTravelers] = useState([
    { firstName: '', lastName: '', dob: '', passport: '', nationality: countries[0] },
  ]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState('12A');

  const toggleAddOn = (id) => {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const updateTraveler = (index, field, value) => {
    setTravelers(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const basePrice = 285000;
  const addOnsTotal = selectedAddOns.length * 15000;
  const taxes = 5000;
  const total = basePrice + addOnsTotal + taxes;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Siege selectionne</Text>
          <View style={styles.seatPreview}>
            <MaterialCommunityIcons name="seat-passenger" size={40} color={COLORS.skyBlue} />
            <View style={styles.seatInfo}>
              <Text style={styles.seatLabel}>Siege {selectedSeat}</Text>
              <Text style={styles.seatClass}>Classe Economique</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changeSeat}>Changer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations passager</Text>
          {travelers.map((traveler, index) => (
            <View key={index} style={styles.travelerCard}>
              <Text style={styles.travelerLabel}>Passager {index + 1}</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Prenom"
                  placeholderTextColor={COLORS.gray}
                  value={traveler.firstName}
                  onChangeText={(v) => updateTraveler(index, 'firstName', v)}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Nom"
                  placeholderTextColor={COLORS.gray}
                  value={traveler.lastName}
                  onChangeText={(v) => updateTraveler(index, 'lastName', v)}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Date de naissance (JJ/MM/AAAA)"
                placeholderTextColor={COLORS.gray}
                value={traveler.dob}
                onChangeText={(v) => updateTraveler(index, 'dob', v)}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Numero de passeport"
                  placeholderTextColor={COLORS.gray}
                  value={traveler.passport}
                  onChangeText={(v) => updateTraveler(index, 'passport', v)}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Nationalite"
                  placeholderTextColor={COLORS.gray}
                  value={traveler.nationality}
                  onChangeText={(v) => updateTraveler(index, 'nationality', v)}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coordonnees</Text>
          <TextInput
            style={styles.input}
            placeholder="Adresse e-mail"
            placeholderTextColor={COLORS.gray}
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Numero de telephone"
            placeholderTextColor={COLORS.gray}
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services optionnels</Text>
          {addOns.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.addOnCard, selectedAddOns.includes(item.id) && styles.addOnCardActive]}
              onPress={() => toggleAddOn(item.id)}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={selectedAddOns.includes(item.id) ? COLORS.white : COLORS.skyBlue}
              />
              <View style={styles.addOnInfo}>
                <Text style={[styles.addOnLabel, selectedAddOns.includes(item.id) && styles.addOnLabelActive]}>
                  {item.label}
                </Text>
                <Text style={styles.addOnPrice}>{item.price}</Text>
              </View>
              <View style={[styles.checkbox, selectedAddOns.includes(item.id) && styles.checkboxActive]}>
                {selectedAddOns.includes(item.id) && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume du prix</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tarif du vol</Text>
              <Text style={styles.priceValue}>285 000 FCFA</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Services optionnels</Text>
              <Text style={styles.priceValue}>{addOnsTotal.toLocaleString('fr-FR')} FCFA</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Taxes</Text>
              <Text style={styles.priceValue}>{taxes.toLocaleString('fr-FR')} FCFA</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total.toLocaleString('fr-FR')} FCFA</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={() => onNavigate && onNavigate('FlightsPayment')}>
          <Text style={styles.continueBtnText}>Continuer vers le paiement</Text>
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
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 12 },
  seatPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, gap: 12 },
  seatInfo: { flex: 1 },
  seatLabel: { fontSize: 16, color: COLORS.white, fontWeight: '600' },
  seatClass: { fontSize: 12, color: COLORS.gray },
  changeSeat: { fontSize: 13, color: COLORS.skyBlue, fontWeight: '500' },
  travelerCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 12 },
  travelerLabel: { fontSize: 13, color: COLORS.skyBlue, fontWeight: '600', marginBottom: 10 },
  row: { flexDirection: 'row' },
  input: { backgroundColor: COLORS.inputBg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.white, marginBottom: 10 },
  addOnCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  addOnCardActive: { backgroundColor: COLORS.skyBlue },
  addOnInfo: { flex: 1 },
  addOnLabel: { fontSize: 14, color: COLORS.white, fontWeight: '500' },
  addOnLabelActive: { color: COLORS.white },
  addOnPrice: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.skyBlue, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  priceCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: COLORS.lightGray },
  priceValue: { fontSize: 14, color: COLORS.white },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  totalLabel: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
  totalValue: { fontSize: 18, color: COLORS.green, fontWeight: '700' },
  footer: { padding: 16, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border },
  continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.green, borderRadius: 12, paddingVertical: 16, gap: 8 },
  continueBtnText: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
});