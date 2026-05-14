import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockRecentRoutes = [
  { id: 1, from: 'Abidjan', to: 'Bouaké', date: '12 Mai' },
  { id: 2, from: 'Yamoussoukro', to: 'Daloa', date: '15 Mai' },
];

const mockPopularDestinations = [
  { id: 1, name: 'Abidjan', icon: 'city' },
  { id: 2, name: 'Bouaké', icon: 'city' },
  { id: 3, name: 'Daloa', icon: 'city' },
  { id: 4, name: 'Man', icon: 'mountain' },
  { id: 5, name: 'Korhogo', icon: 'city' },
];

const TransportHomeScreen = ({ onNavigate }) => {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [transportType, setTransportType] = useState('bus');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Rechercher un trajet</Text>

        <View style={styles.searchCard}>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#4CAF50" />
            <TextInput
              style={styles.input}
              placeholder="Ville de départ"
              placeholderTextColor="#666"
              value={departure}
              onChangeText={setDeparture}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={24} color="#F44336" />
            <TextInput
              style={styles.input}
              placeholder="Ville d'arrivée"
              placeholderTextColor="#666"
              value={arrival}
              onChangeText={setArrival}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="calendar" size={24} color="#2196F3" />
            <TextInput
              style={styles.input}
              placeholder="Date (JJ/MM/AAAA)"
              placeholderTextColor="#666"
              value={date}
              onChangeText={setDate}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="account-multiple" size={24} color="#FF9800" />
            <TextInput
              style={styles.input}
              placeholder="Nombre de voyageurs"
              placeholderTextColor="#666"
              value={passengers}
              onChangeText={setPassengers}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, transportType === 'bus' && styles.typeButtonActive]}
              onPress={() => setTransportType('bus')}
            >
              <MaterialCommunityIcons name="bus" size={20} color={transportType === 'bus' ? '#FFF' : '#666'} />
              <Text style={[styles.typeText, transportType === 'bus' && styles.typeTextActive]}>Bus</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, transportType === 'train' && styles.typeButtonActive]}
              onPress={() => setTransportType('train')}
            >
              <MaterialCommunityIcons name="train" size={20} color={transportType === 'train' ? '#FFF' : '#666'} />
              <Text style={[styles.typeText, transportType === 'train' && styles.typeTextActive]}>Train</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={() => onNavigate('results')}>
            <MaterialCommunityIcons name="magnify" size={24} color="#FFF" />
            <Text style={styles.searchButtonText}>Rechercher</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trajets récents</Text>
          {mockRecentRoutes.map((route) => (
            <TouchableOpacity key={route.id} style={styles.recentItem}>
              <View style={styles.recentIcon}>
                <MaterialCommunityIcons name="history" size={24} color="#2196F3" />
              </View>
              <View style={styles.recentInfo}>
                <Text style={styles.recentRoute}>{route.from} → {route.to}</Text>
                <Text style={styles.recentDate}>{route.date}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinations populaires</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockPopularDestinations.map((dest) => (
              <TouchableOpacity key={dest.id} style={styles.destinationCard}>
                <MaterialCommunityIcons name={dest.icon} size={32} color="#2196F3" />
                <Text style={styles.destinationName}>{dest.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  searchCard: { backgroundColor: '#1A2332', borderRadius: 16, padding: 16, marginBottom: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#FFF' },
  divider: { height: 1, backgroundColor: '#2A3444', marginVertical: 4 },
  typeSelector: { flexDirection: 'row', marginTop: 16, gap: 12 },
  typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#2A3444', borderRadius: 8 },
  typeButtonActive: { backgroundColor: '#2196F3' },
  typeText: { marginLeft: 8, color: '#666', fontSize: 14 },
  typeTextActive: { color: '#FFF' },
  searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, marginTop: 20 },
  searchButtonText: { marginLeft: 8, color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 8 },
  recentIcon: { backgroundColor: '#1A2332', padding: 8, borderRadius: 8 },
  recentInfo: { flex: 1, marginLeft: 12 },
  recentRoute: { fontSize: 16, color: '#FFF', fontWeight: '500' },
  recentDate: { fontSize: 14, color: '#888', marginTop: 4 },
  destinationCard: { alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginRight: 12, width: 100 },
  destinationName: { marginTop: 8, color: '#FFF', fontSize: 14 },
});

export default TransportHomeScreen;