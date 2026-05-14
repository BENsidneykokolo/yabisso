import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const {width} = Dimensions.get('window');
const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const portfolioItems = [
  {id: 1, title: 'Site vitrine', color: '#2196F3'},
  {id: 2, title: 'E-commerce', color: '#4CAF50'},
  {id: 3, title: 'Landing page', color: '#E91E63'},
  {id: 4, title: 'App mobile', color: '#FF9800'},
  {id: 5, title: 'Logo design', color: '#9C27B0'},
  {id: 6, title: 'Dashboard', color: '#00BCD4'},
];

const services = [
  {name: 'Site vitrine', price: '800-1500€'},
  {name: 'Site e-commerce', price: '2000-5000€'},
  {name: 'Application mobile', price: 'Sur devis'},
  {name: 'Design logo', price: '300-600€'},
];

const reviews = [
  {id: 1, name: 'Marc R.', avatar: 'MR', rating: 5, date: '10 jan 2026', text: 'Travail exceptionnel, très professionnel et à l\'écoute. Délai respecté.'},
  {id: 2, name: 'Claire B.', avatar: 'CB', rating: 5, date: '3 jan 2026', text: 'Excellent résultat pour mon site e-commerce. Je recommande!'},
];

const ServiceDigitalDetailsScreen = ({route, onNavigate, onBack}) => {
  const freelancer = route?.params?.freelancer || {name: 'Alex Dev', avatar: 'AD', specialty: 'Création site web', rating: 4.9, reviews: 89, hourly: 60, color: '#2196F3'};

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={[styles.avatarBox, {backgroundColor: freelancer.color + '30'}]}>
            <Text style={[styles.avatarText, {color: freelancer.color}]}>{freelancer.avatar}</Text>
          </View>
          <Text style={styles.freelancerName}>{freelancer.name}</Text>
          <Text style={styles.freelancerSpecialty}>{freelancer.specialty}</Text>
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>{freelancer.rating}</Text>
            <Text style={styles.reviewCount}>({freelancer.reviews} avis)</Text>
          </View>
          <View style={styles.hourlyBadge}>
            <Text style={styles.hourlyText}>{freelancer.hourly}€/h</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.bioText}>
            Développeur web full-stack avec 8 ans d'expérience. Spécialisé en React, Node.js et Shopify. Je crée des sites performants et élégants adaptés à vos besoins.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <View style={styles.portfolioGrid}>
            {portfolioItems.map((item) => (
              <View key={item.id} style={[styles.portfolioItem, {backgroundColor: item.color + '25'}]}>
                <MaterialCommunityIcons name="image" size={24} color={item.color} />
                <Text style={styles.portfolioTitle}>{item.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Proposés</Text>
          {services.map((svc, i) => (
            <View key={i} style={styles.serviceRow}>
              <MaterialCommunityIcons name="check-circle-outline" size={18} color={ACCENT} style={{marginRight: 10}} />
              <Text style={styles.serviceName}>{svc.name}</Text>
              <Text style={styles.servicePrice}>{svc.price}</Text>
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
        <TouchableOpacity style={styles.contactButton} onPress={() => onNavigate('ServiceDigitalBooking', {freelancer})}>
          <MaterialCommunityIcons name="message-reply" size={18} color="#FFF" style={{marginRight: 8}} />
          <Text style={styles.contactButtonText}>Contacter</Text>
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
  freelancerName: {fontSize: 22, fontWeight: 'bold', color: '#FFFFFF'},
  freelancerSpecialty: {fontSize: 14, color: '#8A9BAE', marginTop: 4},
  ratingRow: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  ratingText: {fontSize: 16, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviewCount: {fontSize: 14, color: '#8A9BAE', marginLeft: 4},
  hourlyBadge: {backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 10},
  hourlyText: {color: '#FFF', fontSize: 14, fontWeight: '600'},
  section: {paddingHorizontal: 16, marginBottom: 24},
  sectionTitle: {fontSize: 17, fontWeight: '600', color: '#FFFFFF', marginBottom: 12},
  bioText: {fontSize: 14, color: '#8A9BAE', lineHeight: 22},
  portfolioGrid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  portfolioItem: {width: (width - 48) / 2, height: 100, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10},
  portfolioTitle: {fontSize: 13, color: '#FFFFFF', marginTop: 8, textAlign: 'center'},
  serviceRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 10, padding: 14, marginBottom: 8},
  serviceName: {flex: 1, fontSize: 14, color: '#FFFFFF'},
  servicePrice: {fontSize: 14, color: ACCENT, fontWeight: '600'},
  reviewCard: {backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 10},
  reviewHeader: {flexDirection: 'row', alignItems: 'center'},
  reviewAvatar: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#3A4A5A', justifyContent: 'center', alignItems: 'center', marginRight: 10},
  reviewAvatarText: {fontSize: 12, color: '#FFF', fontWeight: '600'},
  reviewerName: {fontSize: 14, color: '#FFFFFF', fontWeight: '500'},
  starsRow: {flexDirection: 'row', marginTop: 2},
  reviewDate: {fontSize: 12, color: '#8A9BAE', marginLeft: 'auto'},
  reviewText: {fontSize: 13, color: '#8A9BAE', marginTop: 8, lineHeight: 20},
  bottomBar: {position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1A2530', paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#2A3A4A', alignItems: 'center'},
  contactButton: {backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 48, paddingVertical: 14, flexDirection: 'row', alignItems: 'center'},
  contactButtonText: {color: '#FFF', fontSize: 15, fontWeight: '600'},
});

export default ServiceDigitalDetailsScreen;