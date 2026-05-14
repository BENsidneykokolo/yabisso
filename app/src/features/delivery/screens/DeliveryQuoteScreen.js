import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockQuotes = [
  { id: 1, carrier: 'DHL', logo: 'truck-fast', price: 8500, time: '24h', rating: 4.5, features: ['Suivi en temps réel', 'Assurance incluse'] },
  { id: 2, carrier: 'ChronoPost', logo: 'truck-delivery', price: 5500, time: '48h', rating: 4.2, features: ['Suivi de base', 'Signature requise'] },
  { id: 3, carrier: 'AfricaCargo', logo: 'truck', price: 3500, time: '72h', rating: 3.8, features: ['Point relais', 'Pas d\'assurance'] },
];

const DeliveryQuoteScreen = ({ onNavigate, onBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Devis disponibles</Text>
      </View>

      <View style={styles.routeInfo}>
        <View style={styles.routePoint}>
          <MaterialCommunityIcons name="package-variant-closed" size={20} color="#4CAF50" />
          <Text style={styles.routeText}>Abidjan Plateau</Text>
        </View>
        <View style={styles.routeArrow}>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#888" />
        </View>
        <View style={styles.routePoint}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#F44336" />
          <Text style={styles.routeText}>Bouaké</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {mockQuotes.map((quote) => (
          <TouchableOpacity key={quote.id} style={styles.quoteCard} onPress={() => onNavigate('booking')}>
            <View style={styles.carrierRow}>
              <View style={styles.logoContainer}>
                <MaterialCommunityIcons name={quote.logo} size={32} color="#2196F3" />
              </View>
              <View style={styles.carrierInfo}>
                <Text style={styles.carrierName}>{quote.carrier}</Text>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={16} color="#FF9800" />
                  <Text style={styles.ratingText}>{quote.rating}</Text>
                </View>
              </View>
              <Text style={styles.price}>{quote.price} XOF</Text>
            </View>

            <View style={styles.timeRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#4CAF50" />
              <Text style={styles.timeText}>Livraison en {quote.time}</Text>
            </View>

            <View style={styles.featuresRow}>
              {quote.features.map((feature, index) => (
                <View key={index} style={styles.featureBadge}>
                  <MaterialCommunityIcons name="check-circle" size={14} color="#4CAF50" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Sélectionner</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  routeInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 20 },
  routePoint: { flexDirection: 'row', alignItems: 'center' },
  routeText: { marginLeft: 8, color: '#FFF', fontSize: 14 },
  routeArrow: { flex: 1, alignItems: 'center' },
  quoteCard: { backgroundColor: '#1A2332', borderRadius: 16, padding: 16, marginBottom: 16 },
  carrierRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logoContainer: { backgroundColor: '#2A3444', padding: 12, borderRadius: 12 },
  carrierInfo: { flex: 1, marginLeft: 12 },
  carrierName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { marginLeft: 4, color: '#FF9800', fontSize: 14 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timeText: { marginLeft: 8, color: '#4CAF50', fontSize: 14 },
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  featureBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A3444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8, marginBottom: 4 },
  featureText: { marginLeft: 4, color: '#FFF', fontSize: 12 },
  selectButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, alignItems: 'center' },
  selectButtonText: { color: '#FFF', fontWeight: 'bold' },
});

export default DeliveryQuoteScreen;