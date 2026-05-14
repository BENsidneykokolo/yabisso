import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const {width} = Dimensions.get('window');
const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const categories = [
  {id: 1, name: 'Coiffure', icon: 'content-cut', count: 24, color: '#FF6B35'},
  {id: 2, name: 'Esthétique', icon: 'spa', count: 18, color: '#E91E63'},
  {id: 3, name: 'Massage', icon: 'hand-back-right', count: 12, color: '#9C27B0'},
  {id: 4, name: 'Coaching', icon: 'brain', count: 9, color: '#3F51B5'},
  {id: 5, name: 'Repassage', icon: 'iron', count: 15, color: '#00BCD4'},
  {id: 6, name: 'Ménage', icon: 'broom', count: 32, color: '#4CAF50'},
];

const featuredProviders = [
  {id: 1, name: 'Marie Claire', avatar: 'MC', rating: 4.9, reviews: 156, price: '35-80€', service: 'Coiffure', color: '#FF6B35'},
  {id: 2, name: 'Sophie Beauty', avatar: 'SB', rating: 4.8, reviews: 98, price: '40-120€', service: 'Esthétique', color: '#E91E63'},
  {id: 3, name: 'Zen Massage', avatar: 'ZM', rating: 4.7, reviews: 74, price: '50-90€', service: 'Massage', color: '#9C27B0'},
  {id: 4, name: 'Coach Jean', avatar: 'CJ', rating: 4.9, reviews: 112, price: '60-100€', service: 'Coaching', color: '#3F51B5'},
];

const ServicePersoHomeScreen = ({onNavigate}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services Personnels</Text>
        <Text style={styles.headerSubtitle}>Trouvez le professionnel idéal</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => onNavigate('ServicePersoList', {category: cat.name})}
            >
              <View style={[styles.iconBox, {backgroundColor: cat.color + '20'}]}>
                <MaterialCommunityIcons name={cat.icon} size={28} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryCount}>{cat.count} professionnels</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Prestataires en Vedette</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {featuredProviders.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.featuredCard}
              onPress={() => onNavigate('ServicePersoDetails', {provider})}
            >
              <View style={[styles.avatarBox, {backgroundColor: provider.color + '30'}]}>
                <Text style={[styles.avatarText, {color: provider.color}]}>{provider.avatar}</Text>
              </View>
              <Text style={styles.featuredName}>{provider.name}</Text>
              <Text style={styles.featuredService}>{provider.service}</Text>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{provider.rating}</Text>
                <Text style={styles.reviewCount}>({provider.reviews})</Text>
              </View>
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
  featuredName: {fontSize: 14, fontWeight: '600', color: '#FFFFFF', textAlign: 'center'},
  featuredService: {fontSize: 12, color: '#8A9BAE', textAlign: 'center', marginTop: 2},
  ratingRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6},
  ratingText: {fontSize: 13, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviewCount: {fontSize: 12, color: '#8A9BAE', marginLeft: 2},
  priceRange: {fontSize: 13, color: ACCENT, fontWeight: '600', textAlign: 'center', marginTop: 6},
});

export default ServicePersoHomeScreen;