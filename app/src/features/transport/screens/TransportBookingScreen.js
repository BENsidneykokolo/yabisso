import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TransportBookingScreen = ({ onNavigate, onBack }) => {
  const [passengers, setPassengers] = useState([
    { name: '', phone: '' }
  ]);
  const [baggage, setBaggage] = useState(false);
  const [insurance, setInsurance] = useState(false);

  const addPassenger = () => {
    setPassengers([...passengers, { name: '', phone: '' }]);
  };

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const totalPrice = 3500 + (baggage ? 1000 : 0) + (insurance ? 500 : 0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Réservation</Text>
        </View>

        <View style={styles.tripSummary}>
          <View style={styles.tripRow}>
            <MaterialCommunityIcons name="bus" size={24} color="#2196F3" />
            <Text style={styles.tripText}>Abidjan → Bouaké</Text>
          </View>
          <View style={styles.tripRow}>
            <MaterialCommunityIcons name="calendar" size={24} color="#888" />
            <Text style={styles.tripText}>12 Mai 2026 - 08:00</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passagers</Text>
          {passengers.map((passenger, index) => (
            <View key={index} style={styles.passengerCard}>
              <Text style={styles.passengerLabel}>Passager {index + 1}</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                placeholderTextColor="#666"
                value={passenger.name}
                onChangeText={(value) => updatePassenger(index, 'name', value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Téléphone"
                placeholderTextColor="#666"
                value={passenger.phone}
                onChangeText={(value) => updatePassenger(index, 'phone', value)}
                keyboardType="phone-pad"
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addPassenger}>
            <MaterialCommunityIcons name="plus" size={20} color="#2196F3" />
            <Text style={styles.addButtonText}>Ajouter un passager</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options supplémentaires</Text>
          <TouchableOpacity 
            style={[styles.optionCard, baggage && styles.optionCardActive]}
            onPress={() => setBaggage(!baggage)}
          >
            <MaterialCommunityIcons name="bag-suitcase" size={24} color={baggage ? '#FFF' : '#4CAF50'} />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Bagage supplémentaire</Text>
              <Text style={styles.optionPrice}>+1000 XOF</Text>
            </View>
            <MaterialCommunityIcons name={baggage ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color="#2196F3" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionCard, insurance && styles.optionCardActive]}
            onPress={() => setInsurance(!insurance)}
          >
            <MaterialCommunityIcons name="shield-check" size={24} color={insurance ? '#FFF' : '#4CAF50'} />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Assurance voyage</Text>
              <Text style={styles.optionPrice}>+500 XOF</Text>
            </View>
            <MaterialCommunityIcons name={insurance ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aperçu du siège</Text>
          <View style={styles.seatPreview}>
            <View style={styles.seatRow}>
              {[1, 2].map((seat) => (
                <View key={seat} style={styles.seat}>
                  <MaterialCommunityIcons name="seat" size={24} color="#4CAF50" />
                </View>
              ))}
            </View>
            <View style={styles.seatRow}>
              {[3, 4].map((seat) => (
                <View key={seat} style={[styles.seat, seat === 3 && styles.seatSelected]}>
                  <MaterialCommunityIcons name="seat" size={24} color={seat === 3 ? '#FFF' : '#4CAF50'} />
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.seatInfo}>Siège sélectionné: 3A</Text>
        </View>

        <View style={styles.priceSummary}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tarif de base</Text>
            <Text style={styles.priceValue}>3000 XOF</Text>
          </View>
          {baggage && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Bagage supplémentaire</Text>
              <Text style={styles.priceValue}>1000 XOF</Text>
            </View>
          )}
          {insurance && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Assurance</Text>
              <Text style={styles.priceValue}>500 XOF</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{totalPrice} XOF</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.continueButton} onPress={() => onNavigate('payment')}>
        <Text style={styles.continueButtonText}>Continuer vers le paiement</Text>
        <MaterialCommunityIcons name="arrow-right" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  tripSummary: { backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 20 },
  tripRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tripText: { marginLeft: 12, color: '#FFF', fontSize: 14 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  passengerCard: { backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 12 },
  passengerLabel: { fontSize: 14, color: '#2196F3', marginBottom: 12 },
  input: { backgroundColor: '#2A3444', padding: 12, borderRadius: 8, color: '#FFF', marginBottom: 8 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: '#2196F3', borderRadius: 8, borderStyle: 'dashed' },
  addButtonText: { marginLeft: 8, color: '#2196F3', fontSize: 14 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 12 },
  optionCardActive: { borderWidth: 2, borderColor: '#2196F3' },
  optionInfo: { flex: 1, marginLeft: 12 },
  optionTitle: { fontSize: 16, color: '#FFF', fontWeight: '500' },
  optionPrice: { fontSize: 14, color: '#4CAF50', marginTop: 4 },
  seatPreview: { backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 12 },
  seatRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  seat: { marginHorizontal: 8, padding: 8 },
  seatSelected: { backgroundColor: '#2196F3', borderRadius: 8 },
  seatInfo: { textAlign: 'center', color: '#888', fontSize: 14 },
  priceSummary: { backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { color: '#888', fontSize: 14 },
  priceValue: { color: '#FFF', fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#2A3444', paddingTop: 12, marginTop: 8 },
  totalLabel: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' },
  continueButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2196F3', padding: 16, borderRadius: 12 },
  continueButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
});

export default TransportBookingScreen;