import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const {width} = Dimensions.get('window');
const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const categories = [
  {id: 1, name: 'Plomberie', icon: 'pipe', count: 42, color: '#2196F3'},
  {id: 2, name: 'Électricité', icon: 'lightning-bolt', count: 38, color: '#FFC107'},
  {id: 3, name: 'Peinture', icon: 'format-paint', count: 28, color: '#9C27B0'},
  {id: 4, name: 'Menuiserie', icon: 'door-open', count: 22, color: '#795548'},
  {id: 5, name: 'Jardinage', icon: 'tree', count: 35, color: '#4CAF50'},
  {id: 6, name: 'Climatisation', icon: 'air-conditioner', count: 18, color: '#00BCD4'},
];

const featuredProviders = [
  {id: 1, name: 'DepannExpress', avatar: 'DE', specialty: 'Plomberie', rating: 4.8, reviews: 234, price: '40-120€', color: '#2196F3', available: true},
  {id: 2, name: 'ElectroPro', avatar: 'EP', specialty: 'Électricité', rating: 4.9, reviews: 189, price: '45-100€', color: '#FFC107', available: true},
  {id: 3, name: 'PeintFacile', avatar: 'PF', specialty: 'Peinture', rating: 4.7, reviews: 145, price: '30-80€', color: '#9C27B0', available: false},
  {id: 4, name: 'BoisCreation', avatar: 'BC', specialty: 'Menuiserie', rating: 4.8, reviews: 98, price: '50-150€', color: '#795548', available: true},
];

const ServiceMaisonHomeScreen = ({onNavigate}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services Maison</Text>
        <Text style={styles.headerSubtitle}>Des pros pour votre domicile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => onNavigate('ServiceMaisonList', {category: cat.name})}
            >
              <View style={[styles.iconBox, {backgroundColor: cat.color + '20'}]}>
                <MaterialCommunityIcons name={cat.icon} size={28} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryCount}>{cat.count} artisans</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Artisans en Vedette</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {featuredProviders.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.featuredCard}
              onPress={() => onNavigate('ServiceMaisonDetails', {provider})}
            >
              <View style={[styles.avatarBox, {backgroundColor: provider.color + '30'}]}>
                <Text style={[styles.avatarText, {color: provider.color}]}>{provider.avatar}</Text>
              </View>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerSpecialty}>{provider.specialty}</Text>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{provider.rating}</Text>
                <Text style={styles.reviewCount}>({provider.reviews})</Text>
              </View>
              {!provider.available && (
                <View style={styles.unavailableBadge}>
                  <Text style={styles.unavailableText}>Indisponible</Text>
                </View>
              )}
              <Text style={styles.priceRange}>{provider.price}</Text>
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
  featuredCard: {width: 150, backgroundColor: CARD, borderRadius: 16, padding: 16, marginRight: 12},
  avatarBox: {width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 10},
  avatarText: {fontSize: 20, fontWeight: 'bold'},
  providerName: {fontSize: 14, fontWeight: '600', color: '#FFFFFF', textAlign: 'center'},
  providerSpecialty: {fontSize: 12, color: '#8A9BAE', textAlign: 'center', marginTop: 2},
  ratingRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6},
  ratingText: {fontSize: 13, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviewCount: {fontSize: 12, color: '#8A9BAE', marginLeft: 2},
  unavailableBadge: {backgroundColor: '#F44336', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'center', marginTop: 6},
  unavailableText: {color: '#FFF', fontSize: 10, fontWeight: '600'},
  priceRange: {fontSize: 13, color: ACCENT, fontWeight: '600', textAlign: 'center', marginTop: 6},
});

export default ServiceMaisonHomeScreen;