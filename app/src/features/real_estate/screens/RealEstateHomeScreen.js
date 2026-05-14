import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable, StyleSheet, SafeAreaView, Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const properties = [
  { id: 1, name: 'Appartement luxe à Cocody', location: 'Cocody, Abidjan', price: 850000, priceType: 'rent', bedrooms: 3, bathrooms: 2, sqft: 150, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', type: 'Appartement', featured: true },
  { id: 2, name: 'Studio moderne au Plateau', location: 'Plateau, Abidjan', price: 450000, priceType: 'rent', bedrooms: 1, bathrooms: 1, sqft: 45, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', type: 'Studio', featured: false },
  { id: 3, name: 'Villa 4 pièces à Bingerville', location: 'Bingerville, Abidjan', price: 45000000, priceType: 'sale', bedrooms: 4, bathrooms: 3, sqft: 280, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', type: 'Villa', featured: true },
  { id: 4, name: 'Penthouse vue mer à Marcory', location: 'Marcory, Abidjan', price: 1200000, priceType: 'rent', bedrooms: 3, bathrooms: 3, sqft: 200, image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800', type: 'Penthouse', featured: false },
];

const locations = ['Tous', 'Cocody', 'Plateau', 'Marcory', 'Treichville', 'Yopougon'];
const propertyTypes = ['Tous', 'Appartement', 'Studio', 'Villa', 'Penthouse', 'Maison'];

const bottomNavItems = [
  { label: 'Accueil', icon: 'home' },
  { label: 'Favoris', icon: 'heart' },
  { label: 'Mes biens', icon: 'format-list-bulleted' },
  { label: 'Profil', icon: 'account' },
];

export default function RealEstateHomeScreen({ onBack, onNavigate }) {
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('location');
  const [selectedLocation, setSelectedLocation] = useState('Tous');
  const [activeTab, setActiveTab] = useState('Accueil');

  const filteredProperties = properties.filter(p => {
    if (selectedTab === 'location' && p.priceType !== 'rent') return false;
    if (selectedTab === 'achat' && p.priceType !== 'sale') return false;
    if (selectedLocation !== 'Tous' && !p.location.includes(selectedLocation)) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Appartements</Text>
            <Text style={styles.subtitle}>Trouvez votre logement idéal</Text>
          </View>
          <Pressable style={styles.notificationBtn} onPress={() => onNavigate?.('apartment_notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Pressable onPress={() => onNavigate?.('apartment_search')}>
            <MaterialCommunityIcons name="magnify" size={20} color="#92adc9" />
          </Pressable>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une ville, un quartier..."
            placeholderTextColor="#92adc9"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => onNavigate?.('apartment_search')}
          />
        </View>

        <View style={styles.tabsContainer}>
          <Pressable style={[styles.tab, selectedTab === 'location' && styles.tabActive]} onPress={() => setSelectedTab('location')}>
            <Text style={[styles.tabText, selectedTab === 'location' && styles.tabTextActive]}>Location</Text>
          </Pressable>
          <Pressable style={[styles.tab, selectedTab === 'achat' && styles.tabActive]} onPress={() => setSelectedTab('achat')}>
            <Text style={[styles.tabText, selectedTab === 'achat' && styles.tabTextActive]}>Achat</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {locations.map((loc) => (
            <Pressable key={loc} style={[styles.filterChip, selectedLocation === loc && styles.filterChipActive]} onPress={() => setSelectedLocation(loc)}>
              <Text style={[styles.filterText, selectedLocation === loc && styles.filterTextActive]}>{loc}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredProperties.filter(p => p.featured).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biens en vedette</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredProperties.filter(p => p.featured).map((property) => (
                <Pressable key={property.id} style={styles.featuredCard} onPress={() => onNavigate?.('apartment_details', { property })}>
                  <Image source={{ uri: property.image }} style={styles.featuredImage} />
                  <View style={styles.featuredOverlay} />
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>En vedette</Text>
                  </View>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredName} numberOfLines={1}>{property.name}</Text>
                    <View style={styles.featuredLocation}>
                      <MaterialCommunityIcons name="map-marker" size={14} color="#fff" />
                      <Text style={styles.featuredLocationText}>{property.location}</Text>
                    </View>
                    <Text style={styles.featuredPrice}>
                      {property.priceType === 'rent' ? `${property.price.toLocaleString()} FCFA/mois` : `${property.price.toLocaleString()} FCFA`}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{selectedTab === 'location' ? 'Locations' : 'Achats'}</Text>
            <Pressable onPress={() => onNavigate?.('apartment_search')}>
              <Text style={styles.seeAll}>Tout voir</Text>
            </Pressable>
          </View>
          {filteredProperties.map((property) => (
            <Pressable key={property.id} style={styles.propertyCard} onPress={() => onNavigate?.('apartment_details', { property })}>
              <Image source={{ uri: property.image }} style={styles.propertyImage} />
              <View style={styles.propertyBadges}>
                <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>{property.type}</Text></View>
                {property.featured && <View style={styles.featuredSmallBadge}><Text style={styles.featuredSmallText}>En vedette</Text></View>}
              </View>
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyName} numberOfLines={1}>{property.name}</Text>
                <View style={styles.propertyLocation}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#64748b" />
                  <Text style={styles.propertyLocationText}>{property.location}</Text>
                </View>
                <View style={styles.propertyFeatures}>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="bed" size={16} color="#64748b" />
                    <Text style={styles.featureText}>{property.bedrooms} ch.</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="shower" size={16} color="#64748b" />
                    <Text style={styles.featureText}>{property.bathrooms} sdb</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="vector-square" size={16} color="#64748b" />
                    <Text style={styles.featureText}>{property.sqft} m²</Text>
                  </View>
                </View>
                <View style={styles.propertyPriceRow}>
                  <Text style={styles.propertyPrice}>
                    {property.priceType === 'rent' ? `${property.price.toLocaleString()} FCFA/mo` : `${property.price.toLocaleString()} FCFA`}
                  </Text>
                  <Pressable style={styles.viewBtn} onPress={() => onNavigate?.('apartment_details', { property })}>
                    <Text style={styles.viewBtnText}>Voir</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item) => (
            <Pressable key={item.label} style={styles.navItem} onPress={() => { setActiveTab(item.label); if (item.label === 'Favoris') onNavigate?.('apartment_favorites'); else if (item.label === 'Profil') onNavigate?.('apartment_profile'); }}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  greeting: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  notificationBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 12, marginHorizontal: 16, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#fff' },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 12 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1c2630', alignItems: 'center' },
  tabActive: { backgroundColor: '#137fec' },
  tabText: { fontSize: 15, fontWeight: 'bold', color: '#64748b' },
  tabTextActive: { color: '#fff' },
  filtersContainer: { paddingHorizontal: 16, marginTop: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1c2630', marginRight: 8 },
  filterChipActive: { backgroundColor: '#233648', borderWidth: 1, borderColor: '#137fec' },
  filterText: { color: '#94a3b8', fontWeight: '500' },
  filterTextActive: { color: '#137fec' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  seeAll: { fontSize: 14, color: '#137fec', fontWeight: '600' },
  featuredCard: { width: 280, height: 200, borderRadius: 16, overflow: 'hidden', marginRight: 12 },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  featuredBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#22c55e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  featuredBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  featuredInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(0,0,0,0.7)' },
  featuredName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  featuredLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  featuredLocationText: { color: '#94a3b8', fontSize: 12 },
  featuredPrice: { color: '#137fec', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  propertyCard: { backgroundColor: '#1c2630', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  propertyImage: { width: '100%', height: 180 },
  propertyBadges: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' },
  typeBadge: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  featuredSmallBadge: { backgroundColor: '#22c55e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  featuredSmallText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  propertyInfo: { padding: 16 },
  propertyName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  propertyLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  propertyLocationText: { color: '#64748b', fontSize: 13 },
  propertyFeatures: { flexDirection: 'row', gap: 16, marginTop: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featureText: { color: '#64748b', fontSize: 13 },
  propertyPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  propertyPrice: { fontSize: 20, fontWeight: 'bold', color: '#137fec' },
  viewBtn: { backgroundColor: '#22c55e', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  viewBtnText: { color: '#fff', fontWeight: 'bold' },
  bottomSpacer: { height: 100 },
  bottomNavWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24 },
  bottomNav: { backgroundColor: 'rgba(22, 29, 37, 0.98)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  navItem: { alignItems: 'center', flex: 1 },
  navIconContainer: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#137fec' },
  navLabel: { color: '#6B7280', fontSize: 10, marginTop: 4 },
  navLabelActive: { color: '#2BEE79' },
});