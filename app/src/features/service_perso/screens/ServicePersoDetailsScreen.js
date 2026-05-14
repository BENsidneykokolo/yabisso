import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const {width} = Dimensions.get('window');
const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const services = [
  {name: 'Coupe Femme', price: 35},
  {name: 'Coupe Homme', price: 25},
  {name: 'Coloration', price: 60},
  {name: 'Brushing', price: 30},
  {name: 'Soin capillaire', price: 40},
  {name: 'Coiffure complète', price: 80},
];

const reviews = [
  {id: 1, name: 'Claire D.', avatar: 'CD', rating: 5, date: '12 jan 2026', text: 'Excellent service, très professionnelle et à l\'écoute. Je recommande vivement!'},
  {id: 2, name: 'Marie L.', avatar: 'ML', rating: 4, date: '5 jan 2026', text: 'Très bonne coupe, ambiance agréable. Je reviendrai.'},
  {id: 3, name: 'Sophie B.', avatar: 'SB', rating: 5, date: '28 déc 2025', text: 'Parfait pour une occasion spéciale. Merci beaucoup!'},
];

const ServicePersoDetailsScreen = ({route, onNavigate, onBack}) => {
  const provider = route?.params?.provider || {name: 'Marie Claire', avatar: 'MC', rating: 4.9, reviews: 156, color: '#FF6B35', service: 'Coiffure'};

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={[styles.avatarBox, {backgroundColor: provider.color + '30'}]}>
            <Text style={[styles.avatarText, {color: provider.color}]}>{provider.avatar}</Text>
          </View>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerService}>{provider.service}</Text>
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>{provider.rating}</Text>
            <Text style={styles.reviewCount}>({provider.reviews} avis)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.bioText}>
            Coiffeuse professionnelle depuis 8 ans, passionnée par mon métier. Je propose des services de coiffure pour tous types de cheveux. Spécialisée en colorations et coupes modernes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services et Tarifs</Text>
          {services.map((svc, i) => (
            <View key={i} style={styles.serviceRow}>
              <Text style={styles.serviceName}>{svc.name}</Text>
              <Text style={styles.servicePrice}>{svc.price}€</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avis Récents</Text>
          {reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{rev.avatar}</Text>
                </View>
                <View>
                  <Text style={styles.reviewerName}>{rev.name}</Text>
                  <View style={styles.starsRow}>
                    {[...Array(5)].map((_, idx) => (
                      <MaterialCommunityIcons key={idx} name="star" size={12} color={idx < rev.rating ? '#FFD700' : '#3A4A5A'} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{rev.date}</Text>
              </View>
              <Text style={styles.reviewText}>{rev.text}</Text>
            </View>
          ))}
        </View>
        <View style={{height: 100}} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.priceEstimate}>
          <Text style={styles.priceLabel}>À partir de</Text>
          <Text style={styles.priceValue}>35€</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={() => onNavigate('ServicePersoBooking', {provider})}>
          <Text style={styles.bookButtonText}>Réserver maintenant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: DARK},
  profileHeader: {alignItems: 'center', paddingTop: 50, paddingBottom: 24, paddingHorizontal: 16},
  backBtn: {position: 'absolute', top: 50, left: 16, width: 40, height: 40, justifyContent: 'center', zIndex: 1},
  avatarBox: {width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 12},
  avatarText: {fontSize: 32, fontWeight: 'bold'},
  providerName: {fontSize: 22, fontWeight: 'bold', color: '#FFFFFF'},
  providerService: {fontSize: 14, color: '#8A9BAE', marginTop: 4},
  ratingRow: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  ratingText: {fontSize: 16, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviewCount: {fontSize: 14, color: '#8A9BAE', marginLeft: 4},
  section: {paddingHorizontal: 16, marginBottom: 24},
  sectionTitle: {fontSize: 17, fontWeight: '600', color: '#FFFFFF', marginBottom: 12},
  bioText: {fontSize: 14, color: '#8A9BAE', lineHeight: 22},
  serviceRow: {flexDirection: 'row', justifyContent: 'space-between', backgroundColor: CARD, borderRadius: 10, padding: 14, marginBottom: 8},
  serviceName: {fontSize: 14, color: '#FFFFFF'},
  servicePrice: {fontSize: 14, color: ACCENT, fontWeight: '600'},
  reviewCard: {backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 10},
  reviewHeader: {flexDirection: 'row', alignItems: 'center'},
  reviewAvatar: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#3A4A5A', justifyContent: 'center', alignItems: 'center', marginRight: 10},
  reviewAvatarText: {fontSize: 12, color: '#FFF', fontWeight: '600'},
  reviewerName: {fontSize: 14, color: '#FFFFFF', fontWeight: '500'},
  starsRow: {flexDirection: 'row', marginTop: 2},
  reviewDate: {fontSize: 12, color: '#8A9BAE', marginLeft: 'auto'},
  reviewText: {fontSize: 13, color: '#8A9BAE', marginTop: 8, lineHeight: 20},
  bottomBar: {position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1A2530', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#2A3A4A'},
  priceEstimate: {flex: 1},
  priceLabel: {fontSize: 12, color: '#8A9BAE'},
  priceValue: {fontSize: 18, color: '#FFFFFF', fontWeight: 'bold'},
  bookButton: {backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14},
  bookButtonText: {color: '#FFF', fontSize: 15, fontWeight: '600'},
});

export default ServicePersoDetailsScreen;