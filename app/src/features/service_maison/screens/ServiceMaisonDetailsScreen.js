import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const services = [
  {name: 'Réparation fuite', price: 60},
  {name: 'Débouchage canalisation', price: 80},
  {name: 'Remplacement WC', price: 120},
  {name: 'Robinetterie', price: 50},
  {name: 'Chauffe-eau', price: 90},
  {name: 'Dépannage général', price: 'Sur devis'},
];

const availability = [
  {date: 'Lun 13', available: true},
  {date: 'Mar 14', available: true},
  {date: 'Mer 15', available: false},
  {date: 'Jeu 16', available: true},
  {date: 'Ven 17', available: true},
  {date: 'Sam 18', available: false},
  {date: 'Dim 19', available: false},
];

const reviews = [
  {id: 1, name: 'Pierre L.', avatar: 'PL', rating: 5, date: '8 jan 2026', text: 'Intervention rapide et efficace. Fuite réparée en moins d\'une heure.'},
  {id: 2, name: 'Anne M.', avatar: 'AM', rating: 4, date: '2 jan 2026', text: 'Bon travail, propre et professionnel. Prix correct.'},
];

const ServiceMaisonDetailsScreen = ({route, onNavigate, onBack}) => {
  const provider = route?.params?.provider || {name: 'DepannExpress', avatar: 'DE', specialty: 'Plomberie', rating: 4.8, reviews: 234, color: '#2196F3', skills: ['Fuite', 'Canalisation', 'WC']};

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
          <Text style={styles.providerSpecialty}>{provider.specialty}</Text>
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>{provider.rating}</Text>
            <Text style={styles.reviewCount}>({provider.reviews} avis)</Text>
          </View>
          <View style={styles.skillsRow}>
            {provider.skills.map((skill, i) => (
              <View key={i} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.bioText}>
            Plombier qualifié avec 12 ans d'expérience. Intervention rapide 7j/7 pour tous vos problèmes de plomberie. Devis gratuit et garantie décénale.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services et Tarifs</Text>
          {services.map((svc, i) => (
            <View key={i} style={styles.serviceRow}>
              <MaterialCommunityIcons name="wrench" size={18} color={ACCENT} style={{marginRight: 10}} />
              <Text style={styles.serviceName}>{svc.name}</Text>
              <Text style={styles.servicePrice}>{typeof svc.price === 'number' ? svc.price + '€' : svc.price}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilité</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availability.map((slot, i) => (
              <View key={i} style={[styles.slotCard, !slot.available && styles.slotUnavailable]}>
                <Text style={[styles.slotDate, !slot.available && styles.slotDateUnavailable]}>{slot.date}</Text>
                <MaterialCommunityIcons name={slot.available ? 'check-circle' : 'close-circle'} size={18} color={slot.available ? '#4CAF50' : '#F44336'} style={{marginTop: 4}} />
              </View>
            ))}
          </ScrollView>
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
          <Text style={styles.priceValue}>40€</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={() => onNavigate('ServiceMaisonBooking', {provider})}>
          <MaterialCommunityIcons name="calendar-check" size={18} color="#FFF" style={{marginRight: 8}} />
          <Text style={styles.bookButtonText}>Réserver</Text>
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
  providerSpecialty: {fontSize: 14, color: '#8A9BAE', marginTop: 4},
  ratingRow: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  ratingText: {fontSize: 16, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviewCount: {fontSize: 14, color: '#8A9BAE', marginLeft: 4},
  skillsRow: {flexDirection: 'row', marginTop: 12},
  skillBadge: {backgroundColor: '#3A4A5A', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginHorizontal: 4},
  skillText: {fontSize: 13, color: '#8A9BAE'},
  section: {paddingHorizontal: 16, marginBottom: 24},
  sectionTitle: {fontSize: 17, fontWeight: '600', color: '#FFFFFF', marginBottom: 12},
  bioText: {fontSize: 14, color: '#8A9BAE', lineHeight: 22},
  serviceRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 10, padding: 14, marginBottom: 8},
  serviceName: {flex: 1, fontSize: 14, color: '#FFFFFF'},
  servicePrice: {fontSize: 14, color: ACCENT, fontWeight: '600'},
  slotCard: {backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginRight: 10, alignItems: 'center', minWidth: 64, borderWidth: 1, borderColor: '#4CAF50'},
  slotUnavailable: {borderColor: '#3A4A5A', opacity: 0.6},
  slotDate: {fontSize: 13, color: '#FFFFFF', fontWeight: '500'},
  slotDateUnavailable: {color: '#8A9BAE'},
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
  bookButton: {backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', alignItems: 'center'},
  bookButtonText: {color: '#FFF', fontSize: 15, fontWeight: '600'},
});

export default ServiceMaisonDetailsScreen;