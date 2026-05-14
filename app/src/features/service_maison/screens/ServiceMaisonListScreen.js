import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const mockProviders = [
  {id: 1, name: 'DepannExpress', avatar: 'DE', specialty: 'Plomberie', rating: 4.8, reviews: 234, priceMin: 40, priceMax: 120, available: true, color: '#2196F3', skills: ['Fuite', 'Canalisation', 'WC']},
  {id: 2, name: 'ElectroPro', avatar: 'EP', specialty: 'Électricité', rating: 4.9, reviews: 189, priceMin: 45, priceMax: 100, available: true, color: '#FFC107', skills: ['Tableau', 'Prises', 'Éclairage']},
  {id: 3, name: 'PeintFacile', avatar: 'PF', specialty: 'Peinture', rating: 4.7, reviews: 145, priceMin: 30, priceMax: 80, available: false, color: '#9C27B0', skills: ['Intérieur', 'Extérieur', 'Stuc']},
  {id: 4, name: 'BoisCreation', avatar: 'BC', specialty: 'Menuiserie', rating: 4.8, reviews: 98, priceMin: 50, priceMax: 150, available: true, color: '#795548', skills: ['Porte', 'Fenêtre', 'Placard']},
  {id: 5, name: 'VertJardin', avatar: 'VJ', specialty: 'Jardinage', rating: 4.6, reviews: 167, priceMin: 25, priceMax: 70, available: true, color: '#4CAF50', skills: ['Tonte', 'Taille', ' Plantation']},
  {id: 6, name: 'ClimaConfort', avatar: 'CC', specialty: 'Climatisation', rating: 4.9, reviews: 89, priceMin: 60, priceMax: 180, available: true, color: '#00BCD4', skills: ['Install', 'Réparation', 'Entretien']},
];

const ServiceMaisonListScreen = ({route, onNavigate, onBack}) => {
  const category = route?.params?.category || 'Tous';
  const [search, setSearch] = useState('');

  const filtered = mockProviders.filter(p => category === 'Tous' || p.specialty === category);

  const renderItem = ({item}) => (
    <TouchableOpacity style={styles.providerCard} onPress={() => onNavigate('ServiceMaisonDetails', {provider: item})}>
      <View style={[styles.avatarBox, {backgroundColor: item.color + '30'}]}>
        <Text style={[styles.avatarText, {color: item.color}]}>{item.avatar}</Text>
      </View>
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{item.name}</Text>
        <Text style={styles.providerSpecialty}>{item.specialty}</Text>
        <View style={styles.skillsRow}>
          {item.skills.map((skill, i) => (
            <View key={i} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
        <View style={styles.statsRow}>
          <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews} avis)</Text>
        </View>
        <Text style={styles.priceRange}>{item.priceMin}-{item.priceMax}€</Text>
      </View>
      <View style={styles.rightSection}>
        <View style={[styles.availabilityBadge, item.available ? styles.availableBadge : styles.unavailableBadge]}>
          <Text style={styles.availabilityText}>{item.available ? 'Disponible' : 'Indisponible'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, !item.available && styles.bookBtnDisabled]}
          onPress={() => onNavigate('ServiceMaisonBooking', {provider: item})}
          disabled={!item.available}
        >
          <Text style={styles.bookBtnText}>Réserver</Text>
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
        <TextInput style={styles.searchInput} placeholder="Rechercher un artisan..." placeholderTextColor="#8A9BAE" value={search} onChangeText={setSearch} />
      </View>
      <Text style={styles.resultCount}>{filtered.length} artisans trouvés</Text>
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
  providerCard: {flexDirection: 'row', alignItems: 'flex-start', backgroundColor: CARD, borderRadius: 16, padding: 14, marginBottom: 12},
  avatarBox: {width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center'},
  avatarText: {fontSize: 18, fontWeight: 'bold'},
  providerInfo: {flex: 1, marginLeft: 12},
  providerName: {fontSize: 16, fontWeight: '600', color: '#FFFFFF'},
  providerSpecialty: {fontSize: 12, color: '#8A9BAE', marginTop: 2},
  skillsRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 6},
  skillBadge: {backgroundColor: '#3A4A5A', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6, marginBottom: 4},
  skillText: {fontSize: 11, color: '#8A9BAE'},
  statsRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  rating: {fontSize: 13, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviews: {fontSize: 12, color: '#8A9BAE', marginLeft: 2},
  priceRange: {fontSize: 13, color: ACCENT, fontWeight: '600', marginTop: 4},
  rightSection: {alignItems: 'flex-end'},
  availabilityBadge: {borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 8},
  availableBadge: {backgroundColor: '#4CAF5040'},
  unavailableBadge: {backgroundColor: '#F4433640'},
  availabilityText: {fontSize: 11, color: '#FFF', fontWeight: '600'},
  bookBtn: {backgroundColor: ACCENT, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8},
  bookBtnDisabled: {backgroundColor: '#3A4A5A'},
  bookBtnText: {color: '#FFF', fontSize: 13, fontWeight: '600'},
});

export default ServiceMaisonListScreen;