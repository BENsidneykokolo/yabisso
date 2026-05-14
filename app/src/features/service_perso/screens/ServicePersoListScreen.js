import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, FlatList} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const mockProviders = [
  {id: 1, name: 'Marie Claire', avatar: 'MC', rating: 4.9, reviews: 156, priceMin: 35, priceMax: 80, distance: '1.2 km', service: 'Coiffure', color: '#FF6B35', available: true},
  {id: 2, name: 'Sophie Beauty', avatar: 'SB', rating: 4.8, reviews: 98, priceMin: 40, priceMax: 120, distance: '2.5 km', service: 'Esthétique', color: '#E91E63', available: true},
  {id: 3, name: 'Zen Relax', avatar: 'ZR', rating: 4.7, reviews: 74, priceMin: 50, priceMax: 90, distance: '3.1 km', service: 'Massage', color: '#9C27B0', available: false},
  {id: 4, name: 'Coach Jean', avatar: 'CJ', rating: 4.9, reviews: 112, priceMin: 60, priceMax: 100, distance: '0.8 km', service: 'Coaching', color: '#3F51B5', available: true},
  {id: 5, name: 'Luxe Repassage', avatar: 'LR', rating: 4.6, reviews: 89, priceMin: 20, priceMax: 45, distance: '4.2 km', service: 'Repassage', color: '#00BCD4', available: true},
  {id: 6, name: 'Clean Home', avatar: 'CH', rating: 4.8, reviews: 203, priceMin: 25, priceMax: 60, distance: '1.8 km', service: 'Ménage', color: '#4CAF50', available: true},
];

const ServicePersoListScreen = ({route, onNavigate, onBack}) => {
  const category = route?.params?.category || 'Tous';
  const [search, setSearch] = useState('');

  const filtered = mockProviders.filter(p => category === 'Tous' || p.service === category);

  const renderItem = ({item}) => (
    <TouchableOpacity style={styles.providerCard} onPress={() => onNavigate('ServicePersoDetails', {provider: item})}>
      <View style={[styles.avatarBox, {backgroundColor: item.color + '30'}]}>
        <Text style={[styles.avatarText, {color: item.color}]}>{item.avatar}</Text>
      </View>
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{item.name}</Text>
        <Text style={styles.providerService}>{item.service}</Text>
        <View style={styles.statsRow}>
          <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews} avis)</Text>
          <MaterialCommunityIcons name="map-marker" size={14} color="#8A9BAE" style={{marginLeft: 12}} />
          <Text style={styles.distance}>{item.distance}</Text>
        </View>
        <Text style={styles.priceRange}>{item.priceMin}-{item.priceMax}€</Text>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={[styles.bookBtn, !item.available && styles.bookBtnDisabled]}
          onPress={() => onNavigate('ServicePersoBooking', {provider: item})}
          disabled={!item.available}
        >
          <Text style={styles.bookBtnText}>{item.available ? 'Réserver' : 'Indisponible'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <View style={{width: 40}} />
      </View>
      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={20} color="#8A9BAE" />
        <TextInput style={styles.searchInput} placeholder="Rechercher un prestataire..." placeholderTextColor="#8A9BAE" value={search} onChangeText={setSearch} />
      </View>
      <Text style={styles.resultCount}>{filtered.length} prestataires trouvés</Text>
      <FlatList data={filtered} renderItem={renderItem} keyExtractor={item => item.id.toString()} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: DARK, paddingHorizontal: 16},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 16},
  backBtn: {width: 40, height: 40, justifyContent: 'center'},
  headerTitle: {fontSize: 18, fontWeight: '600', color: '#FFFFFF'},
  searchBox: {flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 12, height: 44, marginBottom: 12},
  searchInput: {flex: 1, marginLeft: 8, fontSize: 15, color: '#FFFFFF'},
  resultCount: {fontSize: 13, color: '#8A9BAE', marginBottom: 12},
  providerCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 16, padding: 14, marginBottom: 12},
  avatarBox: {width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center'},
  avatarText: {fontSize: 18, fontWeight: 'bold'},
  providerInfo: {flex: 1, marginLeft: 12},
  providerName: {fontSize: 16, fontWeight: '600', color: '#FFFFFF'},
  providerService: {fontSize: 12, color: '#8A9BAE', marginTop: 2},
  statsRow: {flexDirection: 'row', alignItems: 'center', marginTop: 6},
  rating: {fontSize: 13, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviews: {fontSize: 12, color: '#8A9BAE', marginLeft: 2},
  distance: {fontSize: 12, color: '#8A9BAE', marginLeft: 4},
  priceRange: {fontSize: 13, color: ACCENT, fontWeight: '600', marginTop: 4},
  rightSection: {alignItems: 'flex-end'},
  bookBtn: {backgroundColor: ACCENT, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8},
  bookBtnDisabled: {backgroundColor: '#3A4A5A'},
  bookBtnText: {color: '#FFF', fontSize: 13, fontWeight: '600'},
});

export default ServicePersoListScreen;