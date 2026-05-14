import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockDetails = {
  company: 'UTB',
  route: 'Abidjan → Bouaké',
  departure: '08:00',
  arrival: '12:00',
  duration: '4h',
  price: 3500,
  type: 'VIP',
  amenities: ['wifi', 'air-conditioner', 'toilet', 'power-plug', 'reclining-seats', 'tv'],
  busNumber: 'UTB-1234',
  seatMap: '2+2',
};

const TransportDetailsScreen = ({ onNavigate, onBack }) => {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Détails du trajet</Text>
        </View>

        <View style={styles.companyCard}>
          <View style={styles.companyLogo}>
            <MaterialCommunityIcons name="bus" size={40} color="#2196F3" />
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{mockDetails.company}</Text>
            <Text style={styles.route}>{mockDetails.route}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{mockDetails.type}</Text>
            </View>
          </View>
        </View>

        <View style={styles.timeCard}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Départ</Text>
            <Text style={styles.timeValue}>{mockDetails.departure}</Text>
            <Text style={styles.cityLabel}>Abidjan</Text>
          </View>
          <View style={styles.durationLine}>
            <Text style={styles.durationText}>{mockDetails.duration}</Text>
            <MaterialCommunityIcons name="bus" size={24} color="#4CAF50" />
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Arrivée</Text>
            <Text style={styles.timeValue}>{mockDetails.arrival}</Text>
            <Text style={styles.cityLabel}>Bouaké</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Équipements</Text>
          <View style={styles.amenitiesGrid}>
            {mockDetails.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <MaterialCommunityIcons name={amenity} size={24} color="#2196F3" />
                <Text style={styles.amenityText}>
                  {amenity === 'wifi' ? 'WiFi' : 
                   amenity === 'air-conditioner' ? 'Climatisation' :
                   amenity === 'toilet' ? 'Toilettes' :
                   amenity === 'power-plug' ? 'Prise' :
                   amenity === 'reclining-seats' ? 'Sièges inclinables' : 'TV'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bus</Text>
          <View style={styles.busInfo}>
            <View style={styles.busDetail}>
              <MaterialCommunityIcons name="identifier" size={20} color="#888" />
              <Text style={styles.busDetailText}>Numéro: {mockDetails.busNumber}</Text>
            </View>
            <View style={styles.busDetail}>
              <MaterialCommunityIcons name="seat" size={20} color="#888" />
              <Text style={styles.busDetailText}>Configuration: {mockDetails.seatMap}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bagages</Text>
          <View style={styles.baggageInfo}>
            <MaterialCommunityIcons name="bag-suitcase" size={32} color="#4CAF50" />
            <View style={styles.baggageText}>
              <Text style={styles.baggageTitle}>Politique de bagages</Text>
              <Text style={styles.baggageDesc}>1 bagage en soute + 1 sac à main inclus</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détail du tarif</Text>
          <View style={styles.fareBreakdown}>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Tarif passager</Text>
              <Text style={styles.fareValue}>3000 XOF</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Frais de réservation</Text>
              <Text style={styles.fareValue}>500 XOF</Text>
            </View>
            <View style={[styles.fareRow, styles.fareTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{mockDetails.price} XOF</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>{mockDetails.price} XOF</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={() => onNavigate('booking')}>
          <Text style={styles.bookButtonText}>Réserver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  companyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 16, marginBottom: 16 },
  companyLogo: { backgroundColor: '#2A3444', padding: 16, borderRadius: 12 },
  companyInfo: { flex: 1, marginLeft: 16 },
  companyName: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  route: { fontSize: 14, color: '#888', marginTop: 4 },
  typeBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, marginTop: 8, alignSelf: 'flex-start' },
  typeText: { color: '#FFF', fontSize: 12 },
  timeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A2332', padding: 20, borderRadius: 16, marginBottom: 16 },
  timeBlock: { alignItems: 'center' },
  timeLabel: { fontSize: 12, color: '#888' },
  timeValue: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginTop: 4 },
  cityLabel: { fontSize: 14, color: '#888', marginTop: 4 },
  durationLine: { alignItems: 'center' },
  durationText: { fontSize: 14, color: '#4CAF50' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  amenityItem: { width: '33%', alignItems: 'center', paddingVertical: 12 },
  amenityText: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
  busInfo: { backgroundColor: '#1A2332', padding: 16, borderRadius: 12 },
  busDetail: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  busDetailText: { marginLeft: 8, color: '#FFF', fontSize: 14 },
  baggageInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12 },
  baggageText: { marginLeft: 12 },
  baggageTitle: { fontSize: 16, color: '#FFF', fontWeight: '500' },
  baggageDesc: { fontSize: 14, color: '#888', marginTop: 4 },
  fareBreakdown: { backgroundColor: '#1A2332', padding: 16, borderRadius: 12 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  fareLabel: { color: '#888', fontSize: 14 },
  fareValue: { color: '#FFF', fontSize: 14 },
  fareTotal: { borderTopWidth: 1, borderTopColor: '#2A3444', marginTop: 8, paddingTop: 12 },
  totalLabel: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#2A3444' },
  priceContainer: { flex: 1 },
  priceLabel: { fontSize: 14, color: '#888' },
  priceValue: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  bookButton: { backgroundColor: '#2196F3', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  bookButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default TransportDetailsScreen;