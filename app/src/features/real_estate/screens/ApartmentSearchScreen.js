import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const properties = [
  { id: 1, name: 'Appartement luxe à Cocody', location: 'Cocody, Abidjan', price: 850000, bedrooms: 3, sqft: 150, type: 'Appartement' },
  { id: 2, name: 'Studio moderne au Plateau', location: 'Plateau, Abidjan', price: 450000, bedrooms: 1, sqft: 45, type: 'Studio' },
  { id: 3, name: 'Villa 4 pièces à Bingerville', location: 'Bingerville, Abidjan', price: 45000000, bedrooms: 4, sqft: 280, type: 'Villa' },
  { id: 4, name: 'Penthouse vue mer à Marcory', location: 'Marcory, Abidjan', price: 1200000, bedrooms: 3, sqft: 200, type: 'Penthouse' },
  { id: 5, name: 'Appartement 2 ch. à Yopougon', location: 'Yopougon, Abidjan', price: 550000, bedrooms: 2, sqft: 90, type: 'Appartement' },
];

const types = ['Tous', 'Appartement', 'Studio', 'Villa', 'Penthouse'];
const priceRanges = ['Tous', 'Moins de 500K', '500K - 1M', '1M - 10M', 'Plus de 10M'];

export default function ApartmentSearchScreen({ onBack, onNavigate }) {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [selectedPrice, setSelectedPrice] = useState('Tous');
  const [selectedBedrooms, setSelectedBedrooms] = useState(null);

  const bedroomsOptions = [1, 2, 3, 4];

  const filtered = properties.filter(p => {
    if (selectedType !== 'Tous' && p.type !== selectedType) return false;
    if (selectedBedrooms && p.bedrooms !== selectedBedrooms) return false;
    if (searchText && !p.name.toLowerCase().includes(searchText.toLowerCase()) && !p.location.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Rechercher</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#92adc9" />
          <TextInput style={styles.searchInput} placeholder="Ville, quartier, type..." placeholderTextColor="#92adc9" value={searchText} onChangeText={setSearchText} />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#64748b" />
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de bien</Text>
          <View style={styles.chipsRow}>
            {types.map((t) => (
              <Pressable key={t} style={[styles.chip, selectedType === t && styles.chipActive]} onPress={() => setSelectedType(t)}>
                <Text style={[styles.chipText, selectedType === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chambres</Text>
          <View style={styles.chipsRow}>
            {bedroomsOptions.map((n) => (
              <Pressable key={n} style={[styles.chip, selectedBedrooms === n && styles.chipActive]} onPress={() => setSelectedBedrooms(selectedBedrooms === n ? null : n)}>
                <MaterialCommunityIcons name="bed" size={16} color={selectedBedrooms === n ? '#fff' : '#64748b'} />
                <Text style={[styles.chipText, selectedBedrooms === n && styles.chipTextActive]}>{n}+</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prix</Text>
          <View style={styles.chipsRow}>
            {priceRanges.map((p) => (
              <Pressable key={p} style={[styles.chip, selectedPrice === p && styles.chipActive]} onPress={() => setSelectedPrice(p)}>
                <Text style={[styles.chipText, selectedPrice === p && styles.chipTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.resultsSection}>
          <Text style={styles.resultCount}>{filtered.length} bien{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</Text>
          {filtered.map((p) => (
            <Pressable key={p.id} style={styles.propertyCard} onPress={() => onNavigate?.('apartment_details', { property: p })}>
              <View style={styles.propertyIcon}>
                <MaterialCommunityIcons name="home" size={28} color="#64748b" />
              </View>
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyName}>{p.name}</Text>
                <View style={styles.locationRow}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#64748b" />
                  <Text style={styles.locationText}>{p.location}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{p.bedrooms} ch.</Text>
                  <Text style={styles.metaText}>{p.sqft} m²</Text>
                  <Text style={styles.price}>{p.priceType === 'rent' ? `${p.price.toLocaleString()} FCFA/mo` : `${p.price.toLocaleString()} FCFA`}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 12, marginHorizontal: 16, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#fff' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1c2630', borderWidth: 1, borderColor: 'transparent' },
  chipActive: { borderColor: '#137fec', backgroundColor: 'rgba(19,127,236,0.1)' },
  chipText: { fontSize: 13, color: '#64748b' },
  chipTextActive: { color: '#137fec', fontWeight: '600' },
  resultsSection: { paddingHorizontal: 16, marginTop: 24 },
  resultCount: { fontSize: 14, color: '#64748b', marginBottom: 12 },
  propertyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 12, marginBottom: 10 },
  propertyIcon: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center' },
  propertyInfo: { flex: 1, marginLeft: 12 },
  propertyName: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 12, color: '#64748b' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  metaText: { fontSize: 12, color: '#64748b' },
  price: { fontSize: 14, fontWeight: 'bold', color: '#137fec', marginLeft: 'auto' },
  bottomSpacer: { height: 40 },
});