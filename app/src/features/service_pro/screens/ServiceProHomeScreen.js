import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const {width} = Dimensions.get('window');
const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const categories = [
  {id: 1, name: 'Comptabilité', icon: 'calculator', count: 18, color: '#2196F3'},
  {id: 2, name: 'Juridique', icon: 'gavel', count: 12, color: '#9C27B0'},
  {id: 3, name: 'Sécurité', icon: 'shield-check', count: 8, color: '#F44336'},
  {id: 4, name: 'Maintenance', icon: 'wrench', count: 24, color: '#FF9800'},
  {id: 5, name: 'Consulting', icon: 'briefcase', count: 15, color: '#00BCD4'},
  {id: 6, name: 'Marketing', icon: 'bullhorn', count: 20, color: '#E91E63'},
];

const featuredAgencies = [
  {id: 1, name: 'Cabinet Alpha', logo: 'CA', specialty: 'Comptabilité', rating: 4.8, reviews: 89, location: 'Paris', color: '#2196F3'},
  {id: 2, name: 'Avocats Associés', logo: 'AA', specialty: 'Juridique', rating: 4.9, reviews: 134, location: 'Lyon', color: '#9C27B0'},
  {id: 3, name: 'SecurPro', logo: 'SP', specialty: 'Sécurité', rating: 4.7, reviews: 56, location: 'Marseille', color: '#F44336'},
  {id: 4, name: 'TechMaintenance', logo: 'TM', specialty: 'Maintenance', rating: 4.6, reviews: 78, location: 'Toulouse', color: '#FF9800'},
];

const ServiceProHomeScreen = ({onNavigate}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services Pros</Text>
        <Text style={styles.headerSubtitle}>Solutions professionnelles pour votre entreprise</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => onNavigate('ServiceProList', {category: cat.name})}
            >
              <View style={[styles.iconBox, {backgroundColor: cat.color + '20'}]}>
                <MaterialCommunityIcons name={cat.icon} size={28} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryCount}>{cat.count} agences</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Agences en Vedette</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {featuredAgencies.map((agency) => (
            <TouchableOpacity
              key={agency.id}
              style={styles.featuredCard}
              onPress={() => onNavigate('ServiceProDetails', {agency})}
            >
              <View style={[styles.logoBox, {backgroundColor: agency.color + '30'}]}>
                <Text style={[styles.logoText, {color: agency.color}]}>{agency.logo}</Text>
              </View>
              <Text style={styles.agencyName}>{agency.name}</Text>
              <Text style={styles.agencySpecialty}>{agency.specialty}</Text>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{agency.rating}</Text>
                <Text style={styles.reviewCount}>({agency.reviews})</Text>
              </View>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={12} color="#8A9BAE" />
                <Text style={styles.locationText}>{agency.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: DARK, paddingHorizontal: 16},
  header: {paddingTop: 50, paddingBottom: 20},
  headerTitle: {fontSize: 28, fontWeight: 'bold', color: '#FFFFFF'},
  headerSubtitle: {fontSize: 14, color: '#8A9BAE', marginTop: 4},
  sectionTitle: {fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 16, marginTop: 8},
  categoriesGrid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  categoryCard: {width: (width - 48) / 2, backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center'},
  iconBox: {width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10},
  categoryName: {fontSize: 15, fontWeight: '600', color: '#FFFFFF', textAlign: 'center'},
  categoryCount: {fontSize: 12, color: '#8A9BAE', marginTop: 4},
  featuredScroll: {marginHorizontal: -16, paddingHorizontal: 16},
  featuredCard: {width: 160, backgroundColor: CARD, borderRadius: 16, padding: 16, marginRight: 12},
  logoBox: {width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 10},
  logoText: {fontSize: 22, fontWeight: 'bold'},
  agencyName: {fontSize: 15, fontWeight: '600', color: '#FFFFFF', textAlign: 'center'},
  agencySpecialty: {fontSize: 12, color: '#8A9BAE', textAlign: 'center', marginTop: 2},
  ratingRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8},
  ratingText: {fontSize: 13, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviewCount: {fontSize: 12, color: '#8A9BAE', marginLeft: 2},
  locationRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6},
  locationText: {fontSize: 12, color: '#8A9BAE', marginLeft: 4},
});

export default ServiceProHomeScreen;