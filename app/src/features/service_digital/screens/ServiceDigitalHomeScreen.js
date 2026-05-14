import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const {width} = Dimensions.get('window');
const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const categories = [
  {id: 1, name: 'Création site web', icon: 'web', count: 35, color: '#2196F3'},
  {id: 2, name: 'App mobile', icon: 'cellphone', count: 28, color: '#4CAF50'},
  {id: 3, name: 'Design graphique', icon: 'palette', count: 42, color: '#E91E63'},
  {id: 4, name: 'SEO', icon: 'magnify-expand', count: 18, color: '#FF9800'},
  {id: 5, name: 'Social media', icon: 'account-group', count: 25, color: '#9C27B0'},
  {id: 6, name: 'E-commerce', icon: 'shopping', count: 30, color: '#00BCD4'},
];

const featuredFreelancers = [
  {id: 1, name: 'Alex Dev', avatar: 'AD', specialty: 'Création site web', rating: 4.9, reviews: 89, hourly: 60, color: '#2196F3'},
  {id: 2, name: 'Sophie Design', avatar: 'SD', specialty: 'Design graphique', rating: 4.8, reviews: 134, hourly: 50, color: '#E91E63'},
  {id: 3, name: 'Max Apps', avatar: 'MA', specialty: 'App mobile', rating: 4.7, reviews: 67, hourly: 70, color: '#4CAF50'},
  {id: 4, name: 'Julia SEO', avatar: 'JS', specialty: 'SEO', rating: 4.9, reviews: 112, hourly: 55, color: '#FF9800'},
];

const ServiceDigitalHomeScreen = ({onNavigate}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services Numériques</Text>
        <Text style={styles.headerSubtitle}>Trouvez le freelance idéal</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => onNavigate('ServiceDigitalList', {category: cat.name})}
            >
              <View style={[styles.iconBox, {backgroundColor: cat.color + '20'}]}>
                <MaterialCommunityIcons name={cat.icon} size={28} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryCount}>{cat.count} freelances</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Freelances en Vedette</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {featuredFreelancers.map((freelancer) => (
            <TouchableOpacity
              key={freelancer.id}
              style={styles.featuredCard}
              onPress={() => onNavigate('ServiceDigitalDetails', {freelancer})}
            >
              <View style={[styles.avatarBox, {backgroundColor: freelancer.color + '30'}]}>
                <Text style={[styles.avatarText, {color: freelancer.color}]}>{freelancer.avatar}</Text>
              </View>
              <Text style={styles.freelanceName}>{freelancer.name}</Text>
              <Text style={styles.freelanceSpecialty}>{freelancer.specialty}</Text>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{freelancer.rating}</Text>
                <Text style={styles.reviewCount}>({freelancer.reviews})</Text>
              </View>
              <Text style={styles.hourlyRate}>{freelancer.hourly}€/h</Text>
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
  categoryName: {fontSize: 14, fontWeight: '600', color: '#FFFFFF', textAlign: 'center'},
  categoryCount: {fontSize: 12, color: '#8A9BAE', marginTop: 4},
  featuredScroll: {marginHorizontal: -16, paddingHorizontal: 16},
  featuredCard: {width: 150, backgroundColor: CARD, borderRadius: 16, padding: 16, marginRight: 12},
  avatarBox: {width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 10},
  avatarText: {fontSize: 20, fontWeight: 'bold'},
  freelanceName: {fontSize: 14, fontWeight: '600', color: '#FFFFFF', textAlign: 'center'},
  freelanceSpecialty: {fontSize: 12, color: '#8A9BAE', textAlign: 'center', marginTop: 2},
  ratingRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6},
  ratingText: {fontSize: 13, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviewCount: {fontSize: 12, color: '#8A9BAE', marginLeft: 2},
  hourlyRate: {fontSize: 15, color: ACCENT, fontWeight: '700', textAlign: 'center', marginTop: 8},
});

export default ServiceDigitalHomeScreen;