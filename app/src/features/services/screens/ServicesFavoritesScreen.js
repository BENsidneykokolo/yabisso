import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable, StyleSheet, SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const favorites = [
  { id: 1, name: 'CleanPro Services', service: 'Nettoyage', rating: 4.9, jobs: 450, price: 'À partir de 5 000 FCFA', verified: true },
  { id: 2, name: 'FastFix Electric', service: 'Électricité', rating: 4.8, jobs: 320, price: 'À partir de 3 500 FCFA', verified: true },
  { id: 3, name: 'BeautyExpert', service: 'Beauté', rating: 4.7, jobs: 200, price: 'À partir de 8 000 FCFA', verified: false },
  { id: 4, name: 'PlumbMaster', service: 'Plomberie', rating: 4.9, jobs: 280, price: 'À partir de 4 000 FCFA', verified: true },
];

export default function ServicesFavoritesScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Favoris');
  const [searchText, setSearchText] = useState('');
  const [items, setItems] = useState(favorites);

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.service.toLowerCase().includes(searchText.toLowerCase())
  );

  const removeFavorite = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Mes favoris</Text>
          <Pressable style={styles.notifyBtn} onPress={() => onNavigate?.('services_notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        {items.length > 0 && (
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#92adc9" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher dans les favoris..."
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
        )}

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="heart-off" size={80} color="#2a3a4a" />
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptySubtitle}>Ajoutez des prestataires à vos favoris pour les retrouver facilement</Text>
            <Pressable style={styles.exploreBtn} onPress={() => onNavigate?.('services_home')}>
              <Text style={styles.exploreBtnText}>Explorer les services</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.listSection}>
            <Text style={styles.resultCount}>{filtered.length} prestataire{filtered.length > 1 ? 's' : ''}</Text>
            {filtered.map((item) => (
              <View key={item.id} style={styles.providerCard}>
                <View style={styles.providerImage}>
                  <MaterialCommunityIcons name="account" size={28} color="#64748b" />
                  {item.verified && (
                    <View style={styles.verifiedBadge}>
                      <MaterialCommunityIcons name="check-decagram" size={10} color="#fff" />
                    </View>
                  )}
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{item.name}</Text>
                  <Text style={styles.providerService}>{item.service}</Text>
                  <View style={styles.providerMeta}>
                    <View style={styles.ratingContainer}>
                      <MaterialCommunityIcons name="star" size={12} color="#FBBF24" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <Text style={styles.jobsText}>{item.jobs} missions</Text>
                  </View>
                  <Text style={styles.providerPrice}>{item.price}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    style={styles.bookBtn}
                    onPress={() => onNavigate?.('service_booking', { provider: item })}
                  >
                    <Text style={styles.bookBtnText}>Réserver</Text>
                  </Pressable>
                  <Pressable style={styles.removeBtn} onPress={() => removeFavorite(item.id)}>
                    <MaterialCommunityIcons name="heart" size={20} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

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
                else if (item.label === 'Favoris') {}
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
  searchSection: { paddingHorizontal: 16, marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#fff' },
  emptyState: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  exploreBtn: { marginTop: 24, backgroundColor: '#137fec', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  exploreBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  listSection: { paddingHorizontal: 16 },
  resultCount: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  providerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 12, marginBottom: 12 },
  providerImage: { position: 'relative' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#137fec', borderRadius: 10, padding: 2 },
  providerInfo: { flex: 1, marginLeft: 12 },
  providerName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  providerService: { fontSize: 13, color: '#64748b', marginTop: 2 },
  providerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#FBBF24', fontWeight: 'bold', fontSize: 12 },
  jobsText: { color: '#64748b', fontSize: 12 },
  providerPrice: { fontSize: 14, fontWeight: 'bold', color: '#2BEE79', marginTop: 4 },
  actions: { alignItems: 'flex-end', gap: 8 },
  bookBtn: { backgroundColor: '#137fec', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  removeBtn: { padding: 4 },
  bottomSpacer: { height: 100 },
  bottomNavWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24 },
  bottomNav: { backgroundColor: 'rgba(22, 29, 37, 0.98)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  navItem: { alignItems: 'center', flex: 1 },
  navIcon: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.18)', marginBottom: 6, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#2BEE79' },
  navLabel: { color: '#6B7280', fontSize: 10 },
  navLabelActive: { color: '#2BEE79' },
});