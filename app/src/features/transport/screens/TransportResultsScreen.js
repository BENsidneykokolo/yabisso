import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockResults = [
  { id: 1, company: 'UTB', logo: 'bus', departure: '08:00', arrival: '12:00', duration: '4h', price: 3500, type: 'VIP' },
  { id: 2, company: 'SOTRA', logo: 'bus', departure: '09:30', arrival: '14:00', duration: '4h30', price: 2800, type: 'Standard' },
  { id: 3, company: 'CFTD', logo: 'bus', departure: '14:00', arrival: '18:30', duration: '4h30', price: 3000, type: 'VIP' },
  { id: 4, company: 'STIF', logo: 'bus', departure: '16:00', arrival: '20:00', duration: '4h', price: 2500, type: 'Standard' },
];

const TransportResultsScreen = ({ onNavigate, onBack }) => {
  const [sortBy, setSortBy] = useState('price');
  const [filterType, setFilterType] = useState('all');

  const renderResult = ({ item }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => onNavigate('details')}>
      <View style={styles.companyRow}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name={item.logo} size={32} color="#2196F3" />
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{item.company}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
        <Text style={styles.price}>{item.price} XOF</Text>
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{item.departure}</Text>
          <Text style={styles.city}>Abidjan</Text>
        </View>
        <View style={styles.durationBlock}>
          <Text style={styles.duration}>{item.duration}</Text>
          <View style={styles.durationLine} />
          <MaterialCommunityIcons name="arrow-right" size={20} color="#888" />
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{item.arrival}</Text>
          <Text style={styles.city}>Bouaké</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.selectButton}>
        <Text style={styles.selectButtonText}>Sélectionner</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Résultats</Text>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.filterButton, filterType === 'all' && styles.filterActive]} onPress={() => setFilterType('all')}>
            <Text style={styles.filterText}>Tous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, filterType === 'VIP' && styles.filterActive]} onPress={() => setFilterType('VIP')}>
            <Text style={styles.filterText}>VIP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, filterType === 'Standard' && styles.filterActive]} onPress={() => setFilterType('Standard')}>
            <Text style={styles.filterText}>Standard</Text>
          </TouchableOpacity>
        </ScrollView>
        <TouchableOpacity style={styles.sortButton}>
          <MaterialCommunityIcons name="sort" size={20} color="#2196F3" />
          <Text style={styles.sortText}>Prix</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderResult}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  filterBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#1A2332', borderRadius: 20, marginRight: 8 },
  filterActive: { backgroundColor: '#2196F3' },
  filterText: { color: '#FFF', fontSize: 14 },
  sortButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 8, borderRadius: 8 },
  sortText: { marginLeft: 4, color: '#2196F3', fontSize: 14 },
  list: { paddingBottom: 20 },
  resultCard: { backgroundColor: '#1A2332', borderRadius: 16, padding: 16, marginBottom: 12 },
  companyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logoContainer: { backgroundColor: '#2A3444', padding: 12, borderRadius: 12 },
  companyInfo: { flex: 1, marginLeft: 12 },
  companyName: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  typeBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' },
  typeText: { color: '#FFF', fontSize: 12 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timeBlock: { alignItems: 'center' },
  time: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  city: { fontSize: 12, color: '#888', marginTop: 4 },
  durationBlock: { flex: 1, alignItems: 'center' },
  duration: { fontSize: 14, color: '#888' },
  durationLine: { height: 2, backgroundColor: '#2A3444', width: '80%', marginVertical: 8 },
  selectButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, alignItems: 'center' },
  selectButtonText: { color: '#FFF', fontWeight: 'bold' },
});

export default TransportResultsScreen;