import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

const categories = [
  { name: 'Tout', icon: 'apps' },
  { name: 'Téléphones', icon: 'smartphone' },
  { name: 'Ordinateurs', icon: 'laptop' },
  { name: 'Télévisions', icon: 'television' },
  { name: 'Audio', icon: 'headphones' },
  { name: 'Accessoires', icon: 'watch' },
  { name: 'Gaming', icon: 'gamepad-variant' },
  { name: 'Photo', icon: 'camera' },
];

const brands = [
  { name: 'Tout', icon: 'apps' },
  { name: 'Apple', icon: 'apple' },
  { name: 'Samsung', icon: 'cellphone' },
  { name: 'Tecno', icon: 'cellphone' },
  { name: 'Infinix', icon: 'cellphone' },
  { name: 'Xiaomi', icon: 'cellphone' },
  { name: 'Huawei', icon: 'cellphone' },
];

const products = [
  { id: 1, name: 'iPhone 15 Pro Max', brand: 'Apple', price: '950000', isNew: true, category: 'Téléphones' },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: '780000', isNew: true, category: 'Téléphones' },
  { id: 3, name: 'MacBook Pro M3', brand: 'Apple', price: '1200000', isNew: true, category: 'Ordinateurs' },
  { id: 4, name: 'Tecno Camon 20', brand: 'Tecno', price: '145000', isNew: false, category: 'Téléphones' },
  { id: 5, name: 'Samsung TV 55"', brand: 'Samsung', price: '350000', isNew: false, category: 'Télévisions' },
  { id: 6, name: 'AirPods Pro', brand: 'Apple', price: '95000', isNew: true, category: 'Audio' },
  { id: 7, name: 'Infinix Note 30', brand: 'Infinix', price: '125000', isNew: false, category: 'Téléphones' },
  { id: 8, name: 'Xiaomi Redmi 12', brand: 'Xiaomi', price: '110000', isNew: false, category: 'Téléphones' },
  { id: 9, name: 'iPad Pro M4', brand: 'Apple', price: '950000', isNew: true, category: 'Ordinateurs' },
  { id: 10, name: 'Sony WH-1000XM5', brand: 'Sony', price: '180000', isNew: true, category: 'Audio' },
  { id: 11, name: 'Dell XPS 15', brand: 'Dell', price: '850000', isNew: false, category: 'Ordinateurs' },
  { id: 12, name: 'Apple Watch Ultra 2', brand: 'Apple', price: '450000', isNew: true, category: 'Accessoires' },
  { id: 13, name: 'PlayStation 5', brand: 'Sony', price: '450000', isNew: true, category: 'Gaming' },
  { id: 14, name: 'Canon EOS R5', brand: 'Canon', price: '1200000', isNew: false, category: 'Photo' },
  { id: 15, name: 'Samsung Galaxy Watch 5', brand: 'Samsung', price: '150000', isNew: false, category: 'Accessoires' },
  { id: 16, name: 'Nintendo Switch', brand: 'Nintendo', price: '250000', isNew: true, category: 'Gaming' },
];

const bottomNavItems = [
  { label: 'Boutique', icon: 'store' },
  { label: 'Catégories', icon: 'view-grid' },
  { label: 'Nouveauté', icon: 'sparkles' },
  { label: 'Panier', icon: 'cart' },
];

export default function CategoryPageScreen({ onBack, onNavigate, favorites = [], onToggleFavorite }) {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('Catégories');
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [selectedBrand, setSelectedBrand] = useState('Tout');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  const isFavorite = (productId) => favorites.some(f => f.id === productId);

  const handleToggleFavorite = (product) => {
    if (onToggleFavorite) {
      onToggleFavorite(product);
    }
  };

  const filteredProducts = searchText.trim()
    ? products.filter(p =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchText.toLowerCase())
    )
    : selectedCategory === 'Tout'
      ? products
      : products.filter(p => p.category === selectedCategory);

  const showSearchResults = searchText.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.statusRow}>
              <Pressable onPress={onBack} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
              </Pressable>
              <View style={styles.statusChips}>
                <View style={styles.statusChip}>
                  <MaterialCommunityIcons name="wifi" size={12} color="#22c55e" />
                  <Text style={styles.statusTextGreen}>Online</Text>
                </View>
                <View style={[styles.statusChip, styles.statusChipSecondary]}>
                  <MaterialCommunityIcons name="cloud-check-outline" size={12} color="#137fec" />
                  <Text style={styles.statusText}>Syncronisé</Text>
                </View>
              </View>
              <View style={styles.statusActions}>
                <Pressable style={styles.actionBtn}>
                  <MaterialCommunityIcons name="filter-variant" size={20} color="#fff" />
                </Pressable>
                <Pressable style={styles.actionBtn}>
                  <MaterialCommunityIcons name="cart-outline" size={20} color="#fff" />
                </Pressable>
              </View>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={18} color="#7C8A9A" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher un produit..."
                  placeholderTextColor="#7C8A9A"
                  value={searchText}
                  onChangeText={setSearchText}
                />
                <View style={styles.searchRight}>
                  <Pressable style={styles.searchMini} onPress={() => setShowVoiceModal(true)}>
                    <MaterialCommunityIcons name="microphone" size={14} color="#CBD5F5" />
                  </Pressable>
                  <Pressable style={styles.searchMini} onPress={() => setShowCameraModal(true)}>
                    <MaterialCommunityIcons name="camera" size={14} color="#CBD5F5" />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.categorySection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.name}
                  style={[
                    styles.categoryPill,
                    selectedCategory === cat.name && styles.categoryPillActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <MaterialCommunityIcons
                    name={cat.icon}
                    size={14}
                    color={selectedCategory === cat.name ? '#fff' : '#94a3b8'}
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === cat.name && styles.categoryTextActive,
                  ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.brandSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandScroll}>
              {brands.map((brand) => (
                <Pressable
                  key={brand.name}
                  style={[
                    styles.brandChip,
                    selectedBrand === brand.name && styles.brandChipActive,
                  ]}
                  onPress={() => setSelectedBrand(brand.name)}
                >
                  <Text style={[
                    styles.brandText,
                    selectedBrand === brand.name && styles.brandTextActive,
                  ]}>
                    {brand.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {showSearchResults ? (
            <View style={styles.productsSection}>
              <View style={styles.productsHeader}>
                <Text style={styles.sectionTitle}>Résultats de recherche</Text>
                <Text style={styles.resultsCount}>{filteredProducts.length} produit(s)</Text>
              </View>
              {filteredProducts.length > 0 ? (
                <View style={styles.productsGrid}>
                  {filteredProducts.map((product) => (
                    <Pressable
                      key={product.id}
                      style={styles.productCard}
                      onPress={() => onNavigate?.('product_details', { product })}
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
                  <Text style={styles.noResultsSubtext}>Essayez avec un autre mot-clé</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.productsSection}>
              <View style={styles.productsHeader}>
                <Text style={styles.sectionTitle}>{selectedCategory === 'Tout' ? 'Tous les produits' : selectedCategory}</Text>
                <Text style={styles.resultsCount}>{filteredProducts.length} produit(s)</Text>
              </View>
              {filteredProducts.length > 0 ? (
                <View style={styles.productsGrid}>
                  {filteredProducts.map((product) => (
                    <Pressable
                      key={product.id}
                      style={styles.productCard}
                      onPress={() => onNavigate?.('product_details', { product })}
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
                          <Text style={styles.productPrice}>{product.price} FCFA</Text>
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
                  <Text style={styles.noResultsSubtext}>Essayez avec un autre mot-clé</Text>
                </View>
              )}
            </View>
          )}
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
                    if (item.label === 'Boutique') {
                      onNavigate?.('marketplace_home');
                    } else if (item.label === 'Catégories') {
                      onNavigate?.('product_list');
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

        {/* Voice Search Modal */}
        < Modal
          visible={showVoiceModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowVoiceModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowVoiceModal(false)}
          >
            <View style={styles.modalContent}>
              <Pressable style={styles.closeModalBtn} onPress={() => setShowVoiceModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
              <View style={styles.voiceIconContainer}>
                <MaterialCommunityIcons name="microphone" size={64} color="#137fec" />
              </View>
              <Text style={styles.modalTitle}>Recherche vocale</Text>
              <Text style={styles.modalSubtitle}>Parlez maintenant...</Text>
              <View style={styles.voiceWaveContainer}>
                <View style={styles.voiceWave} />
                <View style={styles.voiceWave} />
                <View style={styles.voiceWave} />
              </View>
              <Pressable style={styles.voiceCancelBtn} onPress={() => setShowVoiceModal(false)}>
                <Text style={styles.voiceCancelText}>Annuler</Text>
              </Pressable>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Camera Search Modal */}
        <Modal
          visible={showCameraModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCameraModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCameraModal(false)}
          >
            <View style={styles.modalContent}>
              <Pressable style={styles.closeModalBtn} onPress={() => setShowCameraModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
              <Text style={styles.modalTitle}>Recherche par image</Text>
              <Text style={styles.modalSubtitle}>Prenez une photo ou importez une image</Text>
              <View style={styles.cameraOptions}>
                <Pressable style={styles.cameraOptionBtn}>
                  <View style={styles.cameraOptionIcon}>
                    <MaterialCommunityIcons name="camera" size={32} color="#fff" />
                  </View>
                  <Text style={styles.cameraOptionText}>Appareil photo</Text>
                </Pressable>
                <Pressable style={styles.cameraOptionBtn}>
                  <View style={styles.cameraOptionIcon}>
                    <MaterialCommunityIcons name="image" size={32} color="#fff" />
                  </View>
                  <Text style={styles.cameraOptionText}>Galerie</Text>
                </Pressable>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#7C8A9A',
  },
  searchRight: {
    flexDirection: 'row',
  },
  searchMini: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  statusActions: {
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
  categorySection: {
    paddingVertical: 8,
    backgroundColor: '#101922',
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryPill: {
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
  categoryPillActive: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
  },
  categoryText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  brandSection: {
    paddingVertical: 8,
    backgroundColor: '#101922',
    borderBottomWidth: 1,
    borderBottomColor: '#1a2632',
  },
  brandScroll: {
    paddingHorizontal: 16,
  },
  brandChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1a2632',
    marginRight: 8,
  },
  brandChipActive: {
    backgroundColor: '#2BEE79',
  },
  brandText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  brandTextActive: {
    color: '#0E151B',
  },
  productsSection: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 100,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#1a2632',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#324d67',
  },
  productImage: {
    aspectRatio: 1,
    backgroundColor: '#324d67',
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
    padding: 10,
    gap: 2,
  },
  productBrand: {
    fontSize: 12,
    color: '#94a3b8',
  },
  productName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 16,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#137fec',
  },
  productOldPrice: {
    fontSize: 11,
    color: '#64748b',
    textDecorationLine: 'line-through',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a2632',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#324d67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
  },
  voiceWaveContainer: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  voiceWave: {
    width: 8,
    height: 40,
    backgroundColor: '#137fec',
    borderRadius: 4,
  },
  voiceCancelBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#324d67',
  },
  voiceCancelText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  cameraOptions: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 24,
  },
  cameraOptionBtn: {
    alignItems: 'center',
    gap: 12,
  },
  cameraOptionIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOptionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  resultsCount: {
    fontSize: 14,
    color: '#94a3b8',
  },
  productsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
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
  noResultsSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
});
