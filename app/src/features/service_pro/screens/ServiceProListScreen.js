import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const mockAgencies = [
  {id: 1, name: 'Cabinet Alpha', logo: 'CA', specialty: 'Comptabilité', rating: 4.8, reviews: 89, location: 'Paris', phone: '01 23 45 67 89', color: '#2196F3'},
  {id: 2, name: 'Avocats Associés', logo: 'AA', specialty: 'Juridique', rating: 4.9, reviews: 134, location: 'Lyon', phone: '04 56 78 90 12', color: '#9C27B0'},
  {id: 3, name: 'SecurPro', logo: 'SP', specialty: 'Sécurité', rating: 4.7, reviews: 56, location: 'Marseille', phone: '04 91 23 45 67', color: '#F44336'},
  {id: 4, name: 'TechMaintenance', logo: 'TM', specialty: 'Maintenance', rating: 4.6, reviews: 78, location: 'Toulouse', phone: '05 61 23 45 67', color: '#FF9800'},
  {id: 5, name: 'ConsultPro', logo: 'CP', specialty: 'Consulting', rating: 4.9, reviews: 112, location: 'Bordeaux', phone: '05 57 12 34 56', color: '#00BCD4'},
  {id: 6, name: 'MarketUp', logo: 'MU', specialty: 'Marketing', rating: 4.7, reviews: 95, location: 'Nice', phone: '04 93 12 34 56', color: '#E91E63'},
];

const ServiceProListScreen = ({route, onNavigate, onBack}) => {
  const category = route?.params?.category || 'Tous';
  const [search, setSearch] = useState('');

  const filtered = mockAgencies.filter(a => category === 'Tous' || a.specialty === category);

  const renderItem = ({item}) => (
    <TouchableOpacity style={styles.agencyCard} onPress={() => onNavigate('ServiceProDetails', {agency: item})}>
      <View style={[styles.logoBox, {backgroundColor: item.color + '30'}]}>
        <Text style={[styles.logoText, {color: item.color}]}>{item.logo}</Text>
      </View>
      <View style={styles.agencyInfo}>
        <Text style={styles.agencyName}>{item.name}</Text>
        <Text style={styles.agencySpecialty}>{item.specialty}</Text>
        <View style={styles.statsRow}>
          <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews} avis)</Text>
          <MaterialCommunityIcons name="map-marker" size={14} color="#8A9BAE" style={{marginLeft: 12}} />
          <Text style={styles.location}>{item.location}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.contactBtn}
        onPress={() => onNavigate('ServiceProBooking', {agency: item})}
      >
        <MaterialCommunityIcons name="phone" size={18} color="#FFF" />
      </TouchableOpacity>
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
        <TextInput style={styles.searchInput} placeholder="Rechercher une agence..." placeholderTextColor="#8A9BAE" value={search} onChangeText={setSearch} />
      </View>
      <Text style={styles.resultCount}>{filtered.length} agences trouvées</Text>
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
  agencyCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 16, padding: 14, marginBottom: 12},
  logoBox: {width: 54, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center'},
  logoText: {fontSize: 18, fontWeight: 'bold'},
  agencyInfo: {flex: 1, marginLeft: 12},
  agencyName: {fontSize: 16, fontWeight: '600', color: '#FFFFFF'},
  agencySpecialty: {fontSize: 12, color: '#8A9BAE', marginTop: 2},
  statsRow: {flexDirection: 'row', alignItems: 'center', marginTop: 6},
  rating: {fontSize: 13, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviews: {fontSize: 12, color: '#8A9BAE', marginLeft: 2},
  location: {fontSize: 12, color: '#8A9BAE', marginLeft: 4},
  contactBtn: {backgroundColor: ACCENT, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center'},
});

export default ServiceProListScreen;