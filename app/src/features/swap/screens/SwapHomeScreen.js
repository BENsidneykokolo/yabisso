import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CATEGORIES = [
  { key: 'all', label: 'Tous', icon: 'view-grid' },
  { key: 'vetements', label: 'Vetements', icon: 'tshirt-crew' },
  { key: 'electronique', label: 'Electronique', icon: 'laptop' },
  { key: 'meubles', label: 'Meubles', icon: 'sofa' },
  { key: 'livres', label: 'Livres', icon: 'book-open-variant' },
  { key: 'vehicules', label: 'Vehicules', icon: 'car' },
  { key: 'autres', label: 'Autres', icon: 'dots-horizontal' },
];

const MOCK_ITEMS = [
  {
    id: '1',
    title: 'iPhone 13 Pro',
    description: 'Telephone en excellent etat, batterie a 92%',
    category: 'electronique',
    condition: 'Très bon',
    image: null,
    owner: { name: 'Jean M.', avatar: null },
    location: 'Douala',
  },
  {
    id: '2',
    title: 'Canape gris 2 places',
    description: 'Canape confortable, peu utilise',
    category: 'meubles',
    condition: 'Bon',
    image: null,
    owner: { name: 'Marie L.', avatar: null },
    location: 'Yaounde',
  },
  {
    id: '3',
    title: 'Chemise Hugo Boss',
    description: 'Taille M, portee une fois',
    category: 'vetements',
    condition: 'Neuf',
    image: null,
    owner: { name: 'Paul K.', avatar: null },
    location: 'Douala',
  },
  {
    id: '4',
    title: 'Roman Java persistante',
    description: 'Collection complete, bon etat',
    category: 'livres',
    condition: 'Bon',
    image: null,
    owner: { name: 'Sophie B.', avatar: null },
    location: 'Bafoussam',
  },
  {
    id: '5',
    title: 'Honda Civic 2018',
    description: 'Excellent etat, toutes options',
    category: 'vehicules',
    condition: 'Très bon',
    image: null,
    owner: { name: 'Pierre T.', avatar: null },
    location: 'Douala',
  },
  {
    id: '6',
    title: 'Appareil photo Canon',
    description: 'EOS 80D, objectif 18-135mm',
    category: 'electronique',
    condition: 'Très bon',
    image: null,
    owner: { name: 'Claire D.', avatar: null },
    location: 'Yaounde',
  },
];

export default function SwapHomeScreen({ onBack, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = MOCK_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.itemCard}
      onPress={() => onNavigate && onNavigate('SwapItemDetail', { item })}
    >
      <View style={styles.itemImagePlaceholder}>
        <MaterialCommunityIcons name="image" size={40} color="#4A5568" />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.itemMeta}>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{item.condition}</Text>
          </View>
          <Text style={styles.itemLocation}>
            <MaterialCommunityIcons name="map-marker" size={10} color="#7C8A9A" /> {item.location}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Echanger</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={18} color="#7C8A9A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un article..."
            placeholderTextColor="#7C8A9A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.key && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={16}
                  color={selectedCategory === cat.key ? '#0E151B' : '#7C8A9A'}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.key && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => (
            <Pressable
              key={item.id}
              style={styles.gridItem}
              onPress={() => onNavigate && onNavigate('SwapItemDetail', { item })}
            >
              <View style={styles.gridItemImage}>
                <MaterialCommunityIcons name="image" size={32} color="#4A5568" />
              </View>
              <View style={styles.gridItemInfo}>
                <Text style={styles.gridItemTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.gridItemBadge}>
                  <Text style={styles.gridItemCondition}>{item.condition}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => onNavigate && onNavigate('SwapPost')}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#0E151B" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#F8FAFC',
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryChipActive: {
    backgroundColor: '#2BEE79',
  },
  categoryLabel: {
    marginLeft: 6,
    color: '#7C8A9A',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryLabelActive: {
    color: '#0E151B',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridItemImage: {
    height: 120,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemInfo: {
    padding: 12,
  },
  gridItemTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  gridItemBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
  },
  gridItemCondition: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    padding: 12,
  },
  itemTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    color: '#7C8A9A',
    fontSize: 12,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
  },
  conditionText: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: '600',
  },
  itemLocation: {
    color: '#7C8A9A',
    fontSize: 11,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#2BEE79',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});