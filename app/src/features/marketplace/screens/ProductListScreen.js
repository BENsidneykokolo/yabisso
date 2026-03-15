import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

const categories = [
  { name: 'Téléphones', icon: 'smartphone', color: '#137fec' },
  { name: 'Mode', icon: 'tshirt-crew', color: '#eab308' },
  { name: 'Maison', icon: 'sofa', color: '#22c55e' },
  { name: 'Électronique', icon: 'laptop', color: '#ef4444' },
  { name: 'Sports', icon: 'basketball', color: '#f97316' },
  { name: 'Services', icon: 'toolbox', color: '#8b5cf6' },
];

const products = [
  { id: 1, name: 'iPhone 15 Pro Max', brand: 'Apple', price: '950000', originalPrice: '1200000', category: 'Téléphones', isNew: true, isPromo: true, discount: '-50%' },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: '780000', originalPrice: '950000', category: 'Téléphones', isNew: true, isPromo: true, discount: '-30%' },
  { id: 3, name: 'MacBook Pro M3', brand: 'Apple', price: '1200000', category: 'Électronique', isNew: true },
  { id: 4, name: 'Air Zoom Pegasus', brand: 'Nike', price: '65000', originalPrice: '85000', category: 'Sports', isNew: false, isPromo: true, discount: '-25%' },
  { id: 5, name: 'Galaxy Watch 5', brand: 'Samsung', price: '120000', originalPrice: '150000', category: 'Téléphones', isNew: false, isPromo: true, discount: '-20%' },
  { id: 6, name: 'iPad Air', brand: 'Apple', price: '420000', category: 'Électronique', isNew: true },
];

const bottomNavItems = [
  { label: 'Marketplace', icon: 'store' },
  { label: 'Catégories', icon: 'view-grid' },
  { label: 'Nouveauté', icon: 'sparkles' },
  { label: 'Panier', icon: 'cart' },
];

export default function ProductListScreen({ onBack, onNavigate, favorites = [], onToggleFavorite, filter }) {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('Marketplace');
  const [selectedCategory, setSelectedCategory] = useState(filter === 'promo' ? 'Promotions' : 'Téléphones');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState('');

  const isFavorite = (productId) => favorites.some(f => f.id === productId);

  const handleToggleFavorite = (product) => {
    if (onToggleFavorite) {
      onToggleFavorite(product);
    }
  };

  // Filter by promo if filter='promo', otherwise by category
  const filteredProducts = (() => {
    let baseProducts = products;
    
    // If filter is promo, show only promo products
    if (filter === 'promo') {
      baseProducts = products.filter(p => p.isPromo);
    }
    
    if (searchText.trim()) {
      return baseProducts.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    return baseProducts;
  })();

  const showSearchResults = searchText.trim().length > 0;
  const screenTitle = filter === 'promo' ? 'Promotions' : selectedCategory;

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    onNavigate?.('marketplace_product_details');
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Pressable onPress={onBack} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
              </Pressable>
              <Text style={styles.headerTitle}>{screenTitle}</Text>
              <View style={styles.headerActions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => onNavigate?.('seller_comparison')}
                >
                  <MaterialCommunityIcons name="compare-arrows" size={22} color="#fff" />
                </Pressable>
                <Pressable style={styles.actionBtn}>
                  <MaterialCommunityIcons name="filter-variant" size={22} color="#fff" />
                </Pressable>
                <Pressable style={styles.actionBtn}>
                  <MaterialCommunityIcons name="sort" size={22} color="#fff" />
                </Pressable>
              </View>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusChip}>
                <MaterialCommunityIcons name="wifi" size={14} color="#22c55e" />
                <Text style={styles.statusTextGreen}>Online</Text>
              </View>
              <View style={[styles.statusChip, styles.statusChipSecondary]}>
                <MaterialCommunityIcons name="cloud-check-outline" size={14} color="#137fec" />
                <Text style={styles.statusText}>Syncronisé</Text>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={18} color="#7C8A9A" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un produit..."
                placeholderTextColor="#7C8A9A"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </View>

          <View style={styles.categoryTabs}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.name}
                  style={[
                    styles.categoryTab,
                    selectedCategory === cat.name && styles.categoryTabActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <MaterialCommunityIcons
                    name={cat.icon}
                    size={16}
                    color={selectedCategory === cat.name ? '#fff' : '#94a3b8'}
                  />
                  <Text style={[
                    styles.categoryTabText,
                    selectedCategory === cat.name && styles.categoryTabTextActive,
                  ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.productsSection}>
            <Text style={styles.resultsText}>
              {showSearchResults ? `${filteredProducts.length} résultat(s) pour "${searchText}"` : `${filteredProducts.length} résultats`}
            </Text>
            {filteredProducts.length > 0 ? (
              <View style={styles.productsGrid}>
                {filteredProducts.map((product) => (
                  <Pressable
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => handleProductPress(product)}
                  >
                    <View style={styles.productImage}>
                      {product.isNew && (
                        <View style={styles.newBadge}>
                          <MaterialCommunityIcons name="lightning-bolt" size={12} color="#fff" />
                          <Text style={styles.newBadgeText}>NOUVEAU</Text>
                        </View>
                      )}
                      <Pressable
                        style={styles.favoriteBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(product);
                        }}
                      >
                        <MaterialCommunityIcons
                          name={isFavorite(product.id) ? "heart" : "heart-outline"}
                          size={18}
                          color={isFavorite(product.id) ? "#ef4444" : "#fff"}
                        />
                      </Pressable>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productBrand}>{product.brand}</Text>
                      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                      <View style={styles.productBottom}>
                        <Text style={styles.productPrice}>{product.price} FCA</Text>
                        <Pressable
                          style={styles.addBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            const productToAdd = { ...product, price: parseInt(product.price) || 0 };
                            addToCart(productToAdd, 1);
                          }}
                        >
                          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={styles.noResults}>
                <MaterialCommunityIcons name="magnify" size={64} color="#324d67" />
                <Text style={styles.noResultsText}>Aucun résultat pour "{searchText}"</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <SafeAreaView style={styles.bottomNavWrapper}>
          <View style={styles.bottomNav}>
            {bottomNavItems.map((item) => {
              const isActive = activeTab === item.label;
              return (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [
                    styles.navItem,
                    pressed && styles.navItemPressed,
                  ]}
                  onPress={() => {
                    if (item.label === 'Marketplace') {
                      onNavigate?.('marketplace_home');
                    } else if (item.label === 'Catégories') {
                      onNavigate?.('category_page');
                    } else if (item.label === 'Panier') {
                      onNavigate?.('cart');
                    } else if (item.label === 'Nouveauté') {
                      onNavigate?.('new_arrivals');
                    }
                  }}
                >
                  <View style={[
                    styles.navIcon,
                    isActive && styles.navIconActive,
                    isActive && styles.navIconCenter,
                  ]}>
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
            <Pressable
              style={({ pressed }) => [
                styles.navItem,
                pressed && styles.navItemPressed,
              ]}
              onPress={() => onBack?.()}
            >
              <View style={styles.navIcon}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={20}
                  color="#CBD5F5"
                />
              </View>
              <Text style={styles.navLabel}>Retour</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#101922',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusChipSecondary: {
    backgroundColor: '#1a2632',
    borderColor: '#324d67',
  },
  statusTextGreen: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
  },
  categoryTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#101922',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a2632',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#324d67',
  },
  categoryTabActive: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
  },
  categoryTabText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  productsSection: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  resultsText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#1a2632',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#324d67',
  },
  productImage: {
    aspectRatio: 1,
    backgroundColor: '#324d67',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 12,
    gap: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#94a3b8',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#137fec',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  bottomNav: {
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navItemPressed: {
    transform: [{ scale: 0.96 }],
  },
  navIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    backgroundColor: '#3B82F6',
  },
  navIconCenter: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    marginTop: -14,
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  navLabelActive: {
    color: '#2BEE79',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#fff',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
    marginTop: 8,
  },
});
