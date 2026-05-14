import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const favorites = [
  { id: 1, name: 'Appartement luxe à Cocody', location: 'Cocody, Abidjan', price: 850000, bedrooms: 3, sqft: 150, type: 'Appartement' },
  { id: 2, name: 'Penthouse vue mer à Marcory', location: 'Marcory, Abidjan', price: 1200000, bedrooms: 3, sqft: 200, type: 'Penthouse' },
];

export default function ApartmentFavoritesScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Favoris');
  const [items, setItems] = useState(favorites);
  const [searchText, setSearchText] = useState('');

  const filtered = items.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));

  const remove = (id) => setItems(items.filter(i => i.id !== id));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Mes favoris</Text>
          <Pressable style={styles.notifyBtn} onPress={() => onNavigate?.('apartment_notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        {items.length > 0 && (
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#92adc9" />
              <TextInput style={styles.searchInput} placeholder="Rechercher..." placeholderTextColor="#92adc9" value={searchText} onChangeText={setSearchText} />
            </View>
          </View>
        )}

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="heart-off" size={80} color="#2a3a4a" />
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptySubtitle}>Ajoutez des biens à vos favoris pour les retrouver facilement</Text>
            <Pressable style={styles.exploreBtn} onPress={() => onNavigate?.('real_estate_home')}>
              <Text style={styles.exploreBtnText}>Explorer les biens</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((item) => (
              <View key={item.id} style={styles.propertyCard}>
                <View style={styles.propertyIcon}>
                  <MaterialCommunityIcons name="home" size={28} color="#64748b" />
                </View>
                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyName}>{item.name}</Text>
                  <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="map-marker" size={14} color="#64748b" />
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{item.bedrooms} ch.</Text>
                    <Text style={styles.metaText}>{item.sqft} m²</Text>
                    <Text style={styles.price}>{item.price.toLocaleString()} FCFA/mo</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Pressable style={styles.viewBtn} onPress={() => onNavigate?.('apartment_details', { property: item })}>
                    <Text style={styles.viewBtnText}>Voir</Text>
                  </Pressable>
                  <Pressable style={styles.removeBtn} onPress={() => remove(item.id)}>
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
            { label: 'Favoris', icon: 'heart' },
            { label: 'Mes biens', icon: 'format-list-bulleted' },
            { label: 'Profil', icon: 'account' },
          ].map((item) => (
            <Pressable key={item.label} style={styles.navItem} onPress={() => { setActiveTab(item.label); if (item.label === 'Accueil') onNavigate?.('real_estate_home'); else if (item.label === 'Mes biens') onNavigate?.('apartment_listings'); else if (item.label === 'Profil') onNavigate?.('apartment_profile'); }}>
              <View style={[styles.navIconContainer, activeTab === item.label && styles.navIconActive]}>
                <MaterialCommunityIcons name={item.icon} size={22} color={activeTab === item.label ? '#0E151B' : '#CBD5F5'} />
              </View>
              <Text style={[styles.navLabel, activeTab === item.label && styles.navLabelActive]}>{item.label}</Text>
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
  emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
  exploreBtn: { marginTop: 24, backgroundColor: '#137fec', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  exploreBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  list: { paddingHorizontal: 16 },
  propertyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 12, marginBottom: 12 },
  propertyIcon: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center' },
  propertyInfo: { flex: 1, marginLeft: 12 },
  propertyName: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 12, color: '#64748b' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  metaText: { fontSize: 12, color: '#64748b' },
  price: { fontSize: 14, fontWeight: 'bold', color: '#137fec' },
  actions: { alignItems: 'flex-end', gap: 8 },
  viewBtn: { backgroundColor: '#137fec', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  viewBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  removeBtn: { padding: 4 },
  bottomSpacer: { height: 100 },
  bottomNavWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24 },
  bottomNav: { backgroundColor: 'rgba(22, 29, 37, 0.98)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  navItem: { alignItems: 'center', flex: 1 },
  navIconContainer: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#137fec' },
  navLabel: { color: '#6B7280', fontSize: 10, marginTop: 4 },
  navLabelActive: { color: '#2BEE79' },
});