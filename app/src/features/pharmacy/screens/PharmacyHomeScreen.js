import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const categories = [
  { key: 'all', label: 'Tout' },
  { key: 'medicaments', label: 'Médicaments' },
  { key: 'vitamines', label: 'Vitamines' },
  { key: 'bebe', label: 'Bébé' },
  { key: 'hygiene', label: 'Hygiène' },
];

const mockProducts = [
  { id: '1', name: 'Paracétamol 500mg', category: 'medicaments', price: '1,200 XAF', stock: true, icon: 'pill', color: '#EF4444' },
  { id: '2', name: 'Vitamine C 1000mg', category: 'vitamines', price: '2,500 XAF', stock: true, icon: 'fruit-citrus', color: '#F97316' },
  { id: '3', name: 'Ibuprofène 200mg', category: 'medicaments', price: '1,800 XAF', stock: true, icon: 'pill', color: '#EF4444' },
  { id: '4', name: 'Gel Hydroalcoolique', category: 'hygiene', price: '800 XAF', stock: false, icon: 'hand-sanitizer', color: '#60A5FA' },
  { id: '5', name: 'Lait Maternisé', category: 'bebe', price: '6,500 XAF', stock: true, icon: 'baby-bottle-outline', color: '#F472B6' },
  { id: '6', name: 'Zinc + Magnésium', category: 'vitamines', price: '3,200 XAF', stock: true, icon: 'pill', color: '#F97316' },
];

export default function PharmacyHomeScreen({ onBack, onNavigate }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mockProducts.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <Text style={styles.headerTitle}>Pharmacie</Text>
        <Pressable style={styles.headerAction}>
          <MaterialCommunityIcons name="cart-outline" size={22} color="#EF4444" />
        </Pressable>
      </View>

      <View style={styles.heroBanner}>
        <MaterialCommunityIcons name="pill" size={40} color="rgba(255,255,255,0.15)" style={styles.heroIcon} />
        <Text style={styles.heroTitle}>Pharmacie en ligne</Text>
        <Text style={styles.heroSubtitle}>Médicaments, vitamines & soins livrés chez vous</Text>
        <View style={styles.heroChip}>
          <MaterialCommunityIcons name="truck-fast-outline" size={13} color="#EF4444" />
          <Text style={styles.heroChipText}>Livraison rapide disponible</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un médicament..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {categories.map(cat => (
          <Pressable
            key={cat.key}
            style={[styles.categoryChip, activeCategory === cat.key && styles.categoryChipActive]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Text style={[styles.categoryChipText, activeCategory === cat.key && styles.categoryChipTextActive]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.productsGrid}>
          {filtered.map(product => (
            <Pressable key={product.id} style={({ pressed }) => [styles.productCard, pressed && styles.productCardPressed]}>
              <View style={[styles.productIconContainer, { backgroundColor: product.color + '20' }]}>
                <MaterialCommunityIcons name={product.icon} size={28} color={product.color} />
              </View>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
              <View style={[styles.stockBadge, !product.stock && styles.stockBadgeOut]}>
                <Text style={[styles.stockText, !product.stock && styles.stockTextOut]}>
                  {product.stock ? 'En stock' : 'Rupture'}
                </Text>
              </View>
              {product.stock && (
                <Pressable style={styles.addButton}>
                  <Text style={styles.addButtonText}>Ajouter</Text>
                </Pressable>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(30,40,50,0.9)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  headerAction: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  heroBanner: {
    margin: 20, borderRadius: 20,
    backgroundColor: '#EF4444',
    padding: 20, overflow: 'hidden',
  },
  heroIcon: { position: 'absolute', right: 16, bottom: 10 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4, marginBottom: 12 },
  heroChip: {
    flexDirection: 'row', gap: 5,
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
  },
  heroChipText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#151D26',
    marginHorizontal: 20, marginBottom: 12,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { flex: 1, color: '#F8FAFC', marginLeft: 8, fontSize: 14 },
  categoriesRow: { marginBottom: 16 },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 99, backgroundColor: '#151D26',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryChipActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  categoryChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  categoryChipTextActive: { color: '#fff' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: {
    width: '47%',
    backgroundColor: '#151D26',
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  productCardPressed: { opacity: 0.85 },
  productIconContainer: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  productName: { color: '#F8FAFC', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  productPrice: { color: '#EF4444', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(43,238,121,0.15)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 99, marginBottom: 10,
  },
  stockBadgeOut: { backgroundColor: 'rgba(239,68,68,0.15)' },
  stockText: { color: '#2BEE79', fontSize: 10, fontWeight: '600' },
  stockTextOut: { color: '#EF4444' },
  addButton: {
    backgroundColor: '#EF4444',
    borderRadius: 10, paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
