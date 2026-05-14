import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const services = [
  { id: 1, name: 'Nettoyage', icon: 'broom', description: 'Services de nettoyage professionnel', providers: 120 },
  { id: 2, name: 'Plomberie', icon: 'water-pump', description: 'Réparation fuites et canalisations', providers: 85 },
  { id: 3, name: 'Électricité', icon: 'lightning-bolt', description: 'Réparations et installations électriques', providers: 95 },
  { id: 4, name: 'Climatisation', icon: 'air-conditioner', description: 'Entretien et réparation AC', providers: 60 },
  { id: 5, name: 'Beauté', icon: 'lipstick', description: 'Salon et services spa', providers: 150 },
  { id: 6, name: 'Cours', icon: 'school', description: 'Cours à domicile et en ligne', providers: 200 },
  { id: 7, name: 'Livraison', icon: 'truck-delivery', description: 'Colis et repas', providers: 300 },
  { id: 8, name: 'Photo', icon: 'camera', description: 'Événements et portraits', providers: 45 },
];

const topProviders = [
  { id: 1, name: 'CleanPro Services', service: 'Nettoyage', rating: 4.9, jobs: 450, price: 'À partir de 5 000 FCFA', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400' },
  { id: 2, name: 'FastFix Electric', service: 'Électricité', rating: 4.8, jobs: 320, price: 'À partir de 3 500 FCFA', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400' },
  { id: 3, name: 'PlumbMaster', service: 'Plomberie', rating: 4.7, jobs: 280, price: 'À partir de 4 000 FCFA', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400' },
];

export default function ServicesHomeScreen({ onBack, onNavigate }) {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Accueil');

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase()) ||
    s.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Services</Text>
            <Text style={styles.subtitle}>Trouvez des professionnels de confiance</Text>
          </View>
          <Pressable style={styles.notificationBtn} onPress={() => onNavigate?.('services_notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#92adc9" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un service..."
              placeholderTextColor="#92adc9"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#64748b" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Service Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tous les services</Text>
          <View style={styles.servicesGrid}>
            {filteredServices.map((service) => (
              <Pressable
                key={service.id}
                style={styles.serviceCard}
                onPress={() => onNavigate?.('service_details', { service })}
              >
                <View style={styles.serviceIcon}>
                  <MaterialCommunityIcons name={service.icon} size={28} color="#137fec" />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceProviders}>{service.providers} prestataires</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Top Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meilleurs prestataires</Text>
            <Pressable onPress={() => onNavigate?.('services_providers')}>
              <Text style={styles.seeAll}>Tout voir</Text>
            </Pressable>
          </View>
          {topProviders.map((provider) => (
            <Pressable
              key={provider.id}
              style={styles.providerCard}
              onPress={() => onNavigate?.('service_details', { provider })}
            >
              <View style={styles.providerImage}>
                <MaterialCommunityIcons name="account" size={32} color="#64748b" />
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerService}>{provider.service}</Text>
                <View style={styles.providerMeta}>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
                    <Text style={styles.ratingText}>{provider.rating}</Text>
                  </View>
                  <Text style={styles.jobsText}>{provider.jobs} missions</Text>
                </View>
              </View>
              <View style={styles.providerRight}>
                <Text style={styles.providerPrice}>{provider.price}</Text>
                <Pressable style={styles.bookBtn} onPress={() => onNavigate?.('service_booking', { provider })}>
                  <Text style={styles.bookBtnText}>Réserver</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Promo Banner */}
        <View style={styles.section}>
          <View style={styles.promoBanner}>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Devenir prestataire</Text>
              <Text style={styles.promoSubtitle}>Gagnez de l'argent avec vos compétences</Text>
              <Pressable style={styles.promoBtn} onPress={() => onNavigate?.('services_seller')}>
                <Text style={styles.promoBtnText}>S'inscrire</Text>
              </Pressable>
            </View>
            <MaterialCommunityIcons name="account-wrench" size={80} color="rgba(255,255,255,0.2)" />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <Pressable
                key={item.label}
                style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
                onPress={() => {
                  setActiveTab(item.label);
                  if (item.label === 'Accueil') {
                    // Already here
                  } else if (item.label === 'Réservations') {
                    onNavigate?.('services_orders');
                  } else if (item.label === 'Favoris') {
                    onNavigate?.('services_favorites');
                  } else if (item.label === 'Profil') {
                    onNavigate?.('services_profile');
                  }
                }}
              >
                <View style={[styles.navIcon, isActive && styles.navIconActive]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={isActive ? 20 : 16}
                    color={isActive ? '#0E151B' : '#CBD5F5'}
                  />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const bottomNavItems = [
  { label: 'Accueil', icon: 'home' },
  { label: 'Réservations', icon: 'calendar-check' },
  { label: 'Favoris', icon: 'heart' },
  { label: 'Profil', icon: 'account' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  greeting: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  notificationBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  searchSection: { paddingHorizontal: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#fff' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  seeAll: { fontSize: 14, color: '#137fec', fontWeight: '600' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: { width: '47%', backgroundColor: '#1c2630', borderRadius: 12, padding: 16, alignItems: 'center' },
  serviceIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(19, 127, 236, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  serviceProviders: { fontSize: 12, color: '#64748b', marginTop: 4 },
  providerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 12, marginBottom: 12 },
  providerImage: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center' },
  providerInfo: { flex: 1, marginLeft: 12 },
  providerName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  providerService: { fontSize: 13, color: '#64748b', marginTop: 2 },
  providerMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#FBBF24', fontWeight: 'bold', fontSize: 13 },
  jobsText: { color: '#64748b', fontSize: 12 },
  providerRight: { alignItems: 'flex-end' },
  providerPrice: { fontSize: 14, fontWeight: 'bold', color: '#137fec' },
  bookBtn: { marginTop: 8, backgroundColor: '#22c55e', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  promoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#137fec', borderRadius: 16, padding: 20, overflow: 'hidden' },
  promoContent: { flex: 1 },
  promoTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  promoSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  promoBtn: { marginTop: 12, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
  promoBtnText: { color: '#137fec', fontWeight: 'bold' },
  bottomSpacer: { height: 100 },
  bottomNavWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24 },
  bottomNav: { backgroundColor: 'rgba(22, 29, 37, 0.98)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  navItem: { alignItems: 'center', flex: 1 },
  navItemPressed: { transform: [{ scale: 0.96 }] },
  navIcon: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.18)', marginBottom: 6, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#2BEE79' },
  navLabel: { color: '#6B7280', fontSize: 10 },
  navLabelActive: { color: '#2BEE79' },
});