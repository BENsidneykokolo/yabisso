import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const mockFreelancers = [
  {id: 1, name: 'Alex Dev', avatar: 'AD', specialty: 'Création site web', rating: 4.9, reviews: 89, hourly: 60, color: '#2196F3'},
  {id: 2, name: 'Sophie Design', avatar: 'SD', specialty: 'Design graphique', rating: 4.8, reviews: 134, hourly: 50, color: '#E91E63'},
  {id: 3, name: 'Max Apps', avatar: 'MA', specialty: 'App mobile', rating: 4.7, reviews: 67, hourly: 70, color: '#4CAF50'},
  {id: 4, name: 'Julia SEO', avatar: 'JS', specialty: 'SEO', rating: 4.9, reviews: 112, hourly: 55, color: '#FF9800'},
  {id: 5, name: 'Tom Social', avatar: 'TS', specialty: 'Social media', rating: 4.6, reviews: 78, hourly: 45, color: '#9C27B0'},
  {id: 6, name: 'Lina Commerce', avatar: 'LC', specialty: 'E-commerce', rating: 4.8, reviews: 95, hourly: 65, color: '#00BCD4'},
];

const ServiceDigitalListScreen = ({route, onNavigate, onBack}) => {
  const category = route?.params?.category || 'Tous';
  const [search, setSearch] = useState('');

  const filtered = mockFreelancers.filter(f => category === 'Tous' || f.specialty === category);

  const renderItem = ({item}) => (
    <TouchableOpacity style={styles.freelancerCard} onPress={() => onNavigate('ServiceDigitalDetails', {freelancer: item})}>
      <View style={[styles.avatarBox, {backgroundColor: item.color + '30'}]}>
        <Text style={[styles.avatarText, {color: item.color}]}>{item.avatar}</Text>
      </View>
      <View style={styles.freelancerInfo}>
        <Text style={styles.freelancerName}>{item.name}</Text>
        <Text style={styles.freelancerSpecialty}>{item.specialty}</Text>
        <View style={styles.statsRow}>
          <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews} avis)</Text>
        </View>
        <Text style={styles.hourlyRate}>{item.hourly}€/h</Text>
      </View>
      <View style={styles.portfolioPreview}>
        <View style={[styles.portfolioThumb, {backgroundColor: item.color + '30'}]} />
        <View style={[styles.portfolioThumb, {backgroundColor: item.color + '20'}]} />
        <View style={[styles.portfolioThumb, {backgroundColor: item.color + '15'}]} />
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
        <TextInput style={styles.searchInput} placeholder="Rechercher un freelance..." placeholderTextColor="#8A9BAE" value={search} onChangeText={setSearch} />
      </View>
      <Text style={styles.resultCount}>{filtered.length} freelances trouvés</Text>
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
  freelancerCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 16, padding: 14, marginBottom: 12},
  avatarBox: {width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center'},
  avatarText: {fontSize: 18, fontWeight: 'bold'},
  freelancerInfo: {flex: 1, marginLeft: 12},
  freelancerName: {fontSize: 16, fontWeight: '600', color: '#FFFFFF'},
  freelancerSpecialty: {fontSize: 12, color: '#8A9BAE', marginTop: 2},
  statsRow: {flexDirection: 'row', alignItems: 'center', marginTop: 6},
  rating: {fontSize: 13, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviews: {fontSize: 12, color: '#8A9BAE', marginLeft: 2},
  hourlyRate: {fontSize: 14, color: ACCENT, fontWeight: '700', marginTop: 4},
  portfolioPreview: {flexDirection: 'column', marginLeft: 8},
  portfolioThumb: {width: 36, height: 36, borderRadius: 8, marginBottom: 4},
});

export default ServiceDigitalListScreen;