import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable, StyleSheet, SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const servicesList = [
  { id: 1, name: 'Nettoyage', icon: 'broom', providers: 120, rating: 4.7 },
  { id: 2, name: 'Plomberie', icon: 'water-pump', providers: 85, rating: 4.5 },
  { id: 3, name: 'Électricité', icon: 'lightning-bolt', providers: 95, rating: 4.8 },
  { id: 4, name: 'Climatisation', icon: 'air-conditioner', providers: 60, rating: 4.6 },
  { id: 5, name: 'Beauté', icon: 'lipstick', providers: 150, rating: 4.7 },
  { id: 6, name: 'Cours', icon: 'school', providers: 200, rating: 4.9 },
  { id: 7, name: 'Livraison', icon: 'truck-delivery', providers: 300, rating: 4.4 },
  { id: 8, name: 'Photo', icon: 'camera', providers: 45, rating: 4.6 },
];

const providers = [
  { id: 1, name: 'CleanPro Services', service: 'Nettoyage', rating: 4.9, jobs: 450, reviews: 320, price: 'À partir de 5 000 FCFA', verified: true, badge: 'Top Rated' },
  { id: 2, name: 'FastFix Electric', service: 'Électricité', rating: 4.8, jobs: 320, reviews: 195, price: 'À partir de 3 500 FCFA', verified: true, badge: null },
  { id: 3, name: 'PlumbMaster', service: 'Plomberie', rating: 4.7, jobs: 280, reviews: 140, price: 'À partir de 4 000 FCFA', verified: true, badge: null },
  { id: 4, name: 'EcoCool AC', service: 'Climatisation', rating: 4.6, jobs: 180, reviews: 110, price: 'À partir de 7 000 FCFA', verified: false, badge: 'ÉcoResponsable' },
  { id: 5, name: 'BeautyExpert', service: 'Beauté', rating: 4.9, jobs: 300, reviews: 250, price: 'À partir de 8 000 FCFA', verified: true, badge: 'Top Rated' },
  { id: 6, name: 'ProMath Tutor', service: 'Cours', rating: 4.8, jobs: 150, reviews: 90, price: 'À partir de 6 000 FCFA/h', verified: true, badge: null },
  { id: 7, name: 'FlashDelivery', service: 'Livraison', rating: 4.5, jobs: 600, reviews: 480, price: 'À partir de 1 500 FCFA', verified: true, badge: null },
  { id: 8, name: 'LensPhoto Pro', service: 'Photo', rating: 4.7, jobs: 120, reviews: 80, price: 'À partir de 15 000 FCFA', verified: false, badge: null },
];

const sortOptions = ['Populaires', 'Mieux notés', 'Prix croissant', 'Prix décroissant'];

export default function ServicesProvidersScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Réservations');
  const [searchText, setSearchText] = useState('');
  const [selectedService, setSelectedService] = useState('Tous');
  const [sortBy, setSortBy] = useState('Populaires');

  const allServices = ['Tous', ...servicesList.map(s => s.name)];

  const filteredProviders = providers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchText.toLowerCase()) || p.service.toLowerCase().includes(searchText.toLowerCase());
    const matchesService = selectedService === 'Tous' || p.service === selectedService;
    return matchesSearch && matchesService;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Prestataires</Text>
          <Pressable style={styles.notifyBtn} onPress={() => onNavigate?.('services_notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#92adc9" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un prestataire..."
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

        {/* Service Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
          <View style={styles.servicesRow}>
            {allServices.map((service) => (
              <Pressable
                key={service}
                style={[styles.serviceChip, selectedService === service && styles.serviceChipActive]}
                onPress={() => setSelectedService(service)}
              >
                <MaterialCommunityIcons
                  name={servicesList.find(s => s.name === service)?.icon || 'apps'}
                  size={16}
                  color={selectedService === service ? '#fff' : '#64748b'}
                />
                <Text style={[styles.serviceChipText, selectedService === service && styles.serviceChipTextActive]}>
                  {service}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Sort */}
        <View style={styles.sortRow}>
          <Text style={styles.resultCount}>{filteredProviders.length} prestataire{filteredProviders.length > 1 ? 's' : ''}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sortOptions}>
              {sortOptions.map((option) => (
                <Pressable
                  key={option}
                  style={[styles.sortBtn, sortBy === option && styles.sortBtnActive]}
                  onPress={() => setSortBy(option)}
                >
                  <Text style={[styles.sortText, sortBy === option && styles.sortTextActive]}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Providers List */}
        <View style={styles.providersList}>
          {filteredProviders.map((provider) => (
            <Pressable
              key={provider.id}
              style={styles.providerCard}
              onPress={() => onNavigate?.('service_details', { provider })}
            >
              <View style={styles.providerImage}>
                <MaterialCommunityIcons name="account" size={28} color="#64748b" />
                {provider.verified && (
                  <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={10} color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.providerInfo}>
                <View style={styles.providerNameRow}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  {provider.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{provider.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.providerService}>{provider.service}</Text>
                <View style={styles.providerMeta}>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={12} color="#FBBF24" />
                    <Text style={styles.ratingText}>{provider.rating}</Text>
                    <Text style={styles.reviewsText}>({provider.reviews})</Text>
                  </View>
                  <Text style={styles.jobsText}>{provider.jobs} missions</Text>
                </View>
                <Text style={styles.providerPrice}>{provider.price}</Text>
              </View>
              <Pressable
                style={styles.bookBtn}
                onPress={() => onNavigate?.('service_booking', { provider })}
              >
                <Text style={styles.bookBtnText}>Réserver</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {[
            { label: 'Accueil', icon: 'home' },
            { label: 'Réservations', icon: 'calendar-check' },
            { label: 'Favoris', icon: 'heart' },
            { label: 'Profil', icon: 'account' },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={styles.navItem}
              onPress={() => {
                setActiveTab(item.label);
                if (item.label === 'Accueil') onNavigate?.('services_home');
                else if (item.label === 'Réservations') onNavigate?.('services_orders');
                else if (item.label === 'Favoris') onNavigate?.('services_favorites');
                else if (item.label === 'Profil') onNavigate?.('services_profile');
              }}
            >
              <View style={[styles.navIcon, item.label === activeTab && styles.navIconActive]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={item.label === activeTab ? 20 : 16}
                  color={item.label === activeTab ? '#0E151B' : '#CBD5F5'}
                />
              </View>
              <Text style={[styles.navLabel, item.label === activeTab && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  notifyBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  searchSection: { paddingHorizontal: 16, marginBottom: 12 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#fff' },
  servicesScroll: { paddingHorizontal: 16, marginBottom: 12 },
  servicesRow: { flexDirection: 'row', gap: 8 },
  serviceChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1c2630' },
  serviceChipActive: { backgroundColor: '#137fec' },
  serviceChipText: { fontSize: 13, color: '#64748b' },
  serviceChipTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, gap: 12 },
  resultCount: { fontSize: 13, color: '#64748b' },
  sortOptions: { flexDirection: 'row', gap: 8 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#1c2630' },
  sortBtnActive: { backgroundColor: 'rgba(19, 127, 236, 0.1)', borderWidth: 1, borderColor: '#137fec' },
  sortText: { fontSize: 12, color: '#64748b' },
  sortTextActive: { color: '#137fec' },
  providersList: { paddingHorizontal: 16 },
  providerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 12, marginBottom: 12 },
  providerImage: { position: 'relative' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#137fec', borderRadius: 10, padding: 2 },
  providerInfo: { flex: 1, marginLeft: 12 },
  providerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  providerName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  badge: { backgroundColor: '#137fec', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  providerService: { fontSize: 13, color: '#64748b', marginTop: 2 },
  providerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#FBBF24', fontWeight: 'bold', fontSize: 12 },
  reviewsText: { color: '#64748b', fontSize: 12 },
  jobsText: { color: '#64748b', fontSize: 12 },
  providerPrice: { fontSize: 14, fontWeight: 'bold', color: '#2BEE79', marginTop: 4 },
  bookBtn: { backgroundColor: '#137fec', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  bottomSpacer: { height: 100 },
  bottomNavWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24 },
  bottomNav: { backgroundColor: 'rgba(22, 29, 37, 0.98)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  navItem: { alignItems: 'center', flex: 1 },
  navIcon: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.18)', marginBottom: 6, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#2BEE79' },
  navLabel: { color: '#6B7280', fontSize: 10 },
  navLabelActive: { color: '#2BEE79' },
});