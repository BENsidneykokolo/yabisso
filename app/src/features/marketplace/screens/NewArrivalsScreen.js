import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useVoiceSearch } from '../../../hooks/useVoiceSearch';
import { usePhotoSearch } from '../../../hooks/usePhotoSearch';
import withObservables from '@nozbe/with-observables';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import * as SecureStore from 'expo-secure-store';

const CATEGORIES_MAP = {
  'fruits': 'Fruits & Légumes',
  'electronics': 'Électronique',
  'fashion': 'Mode',
  'home': 'Maison',
  'beauty': 'Beauté',
  'sports': 'Sports',
  'services': 'Services',
  'other': 'Autres',
};

const categories = [
  { name: 'Tous', icon: 'apps', color: '#137fec' },
  { name: 'Téléphones', icon: 'smartphone', color: '#137fec' },
  { name: 'Mode', icon: 'tshirt-crew', color: '#eab308' },
  { name: 'Maison', icon: 'sofa', color: '#22c55e' },
  { name: 'Électronique', icon: 'laptop', color: '#ef4444' },
  { name: 'Sports', icon: 'basketball', color: '#f97316' },
];

const newProducts = [];

const bottomNavItems = [
  { label: 'Boutique', icon: 'store' },
  { label: 'Catégories', icon: 'view-grid' },
  { label: 'Nouveauté', icon: 'sparkles' },
  { label: 'Panier', icon: 'cart' },
];

function NewArrivalsScreen({ products = [], onBack, onNavigate, favorites = [], onToggleFavorite }) {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('Nouveauté');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchText, setSearchText] = useState('');
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [shopName, setShopName] = useState('Ma Boutique');

  const allProducts = (products || []).map(p => {
    let photos = [];
    try { photos = JSON.parse(p.photosJson || '[]'); } catch(e) {}
    let tags = [];
    try { tags = JSON.parse(p.tagsJson || '[]'); } catch(e) {}
    
    return {
      id: p.id,
      name: p.name,
      brand: p.brand || shopName,
      price: p.price.toString(),
      minPrice: p.minPrice,
      category: CATEGORIES_MAP[p.category] || p.categoryName || 'Autres',
      isNew: p.isNew || tags.includes('Nouveau'),
      isValidated: p.isValidated,
      photos: photos,
      seller: { name: p.sellerName || shopName, rating: 4.5, avatar: null },
      description: p.description,
      stock: p.stock,
      condition: p.condition,
      colors: [], 
      sizes: []
    };
  });

  React.useEffect(() => {
    loadShopName();
  }, []);

  const loadShopName = async () => {
    try {
      const saved = await SecureStore.getItemAsync('seller_shop_info');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.name) setShopName(data.name);
      }
    } catch (e) {
      console.log('Error loading shop name:', e);
    }
  };



  // Real Voice Search Hook
  const { 
    isListening, 
    transcript, 
    error: voiceError, 
    startVoice, 
    stopVoice 
  } = useVoiceSearch((text) => {
    setSearchText(text);
    setShowVoiceModal(false);
  });

  // Real Photo Search Hook
  const { 
    isProcessing: isPhotoProcessing, 
    takePhoto, 
    pickFromGallery 
  } = usePhotoSearch((results) => {
    if (results && results.length > 0) {
      setSearchText(results[0]);
    }
    setShowCameraModal(false);
  });

  const isFavorite = (productId) => favorites.some(f => f.id === productId);

  const handleToggleFavorite = (product) => {
    if (onToggleFavorite) {
      onToggleFavorite(product);
    }
  };

  // Seulement garder les produits qui sont marqués "Nouveau" ET validés par un kiosque
  const newArrivals = allProducts.filter(p => p.isNew && p.isValidated);

  const filteredProducts = searchText.trim()
    ? newArrivals.filter(p =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchText.toLowerCase())
    )
    : selectedCategory === 'Tous'
      ? newArrivals
      : newArrivals.filter((p) => p.category === selectedCategory);

  const showSearchResults = searchText.trim().length > 0;

  const handleProductPress = (product) => {
    onNavigate?.('marketplace_product_details', { product });
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
              <Text style={styles.headerTitle}>Nouveautés</Text>
              <View style={styles.headerActions}>
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
                <Text style={styles.statusText}>Synchronisé</Text>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={18} color="#7C8A9A" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un produit (ex: iphone)"
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

          <View style={styles.bannerSection}>
            <View style={styles.banner}>
              <View style={styles.bannerContent}>
                <MaterialCommunityIcons name="sparkles" size={32} color="#FFD700" />
                <View style={styles.bannerText}>
                  <Text style={styles.bannerTitle}>Nouveautés</Text>
                  <Text style={styles.bannerSubtitle}>Découvrez les derniers ajouts</Text>
                </View>
              </View>
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
              {showSearchResults ? `${filteredProducts.length} résultat(s)` : `${filteredProducts.length} nouveaux produits`}
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
                      {product.photos && product.photos[0] ? (
                        <Image source={{ uri: product.photos[0] }} style={{width: '100%', height: '100%', resizeMode: 'cover'}} />
                      ) : (
                        <MaterialCommunityIcons name="image" size={32} color="#4B5563" />
                      )}
                      <View style={styles.newBadge}>
                        <MaterialCommunityIcons name="lightning-bolt" size={12} color="#fff" />
                        <Text style={styles.newBadgeText}>NOUVEAU</Text>
                      </View>
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
                        <Text style={styles.productPrice}>{product.price} XAF</Text>
                        <Pressable 
                          style={styles.addBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            const productToAdd = { ...product, price: parseInt(product.price) || 0 };
                            addToCart(productToAdd, 1);
                            setAddedProduct(product);
                            setShowCartPopup(true);
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
          <View style={{ height: 100 }} />
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
                      onNavigate?.('category_page');
                    } else if (item.label === 'Panier') {
                      onNavigate?.('cart');
                    } else {
                      setActiveTab(item.label);
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

          {/* Voice Modal */}
          <Modal visible={showVoiceModal} transparent animationType="slide">
            <Pressable style={styles.modalOverlay} onPress={() => !isListening && setShowVoiceModal(false)}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Recherche vocale</Text>
                
                {isListening ? (
                  <>
                    <Text style={styles.modalSubtitleRecording}>Écoute en cours... Parler maintenant</Text>
                    <View style={styles.voiceRecordingContainer}>
                      <MaterialCommunityIcons name="microphone" size={64} color="#ef4444" />
                      <View style={styles.recordingPulse} />
                    </View>
                    <Text style={styles.voiceTranscript}>"{transcript}"</Text>
                    <Pressable style={styles.voiceStopBtn} onPress={stopVoice}>
                      <MaterialCommunityIcons name="stop" size={24} color="#fff" />
                      <Text style={styles.voiceStopBtnText}>Arrêter</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={styles.modalSubtitle}>Cliquer sur le micro pour parler</Text>
                    <View style={styles.voiceWaveContainer}>
                      {[1,2,3,4,5].map(i => (
                        <View key={i} style={[styles.voiceWave, { height: 20 + Math.random() * 30 }]} />
                      ))}
                    </View>
                    {voiceError && <Text style={styles.errorText}>{voiceError}</Text>}
                    <Pressable style={styles.voiceSearchBtn} onPress={startVoice}>
                      <MaterialCommunityIcons name="microphone" size={24} color="#fff" />
                      <Text style={styles.voiceSearchBtnText}>Commencer</Text>
                    </Pressable>
                  </>
                )}

                {!isListening && (
                  <Pressable 
                    style={styles.voiceCancelBtn} 
                    onPress={() => setShowVoiceModal(false)}
                  >
                    <Text style={styles.voiceCancelText}>Fermer</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          </Modal>

          {/* Camera Modal */}
          <Modal visible={showCameraModal} transparent animationType="slide">
            <Pressable style={styles.modalOverlay} onPress={() => !isPhotoProcessing && setShowCameraModal(false)}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Recherche par photo</Text>
                <Text style={styles.modalSubtitle}>Prenez une photo ou choisissez une image</Text>
                
                <View style={styles.cameraOptions}>
                  <Pressable 
                    style={styles.cameraOptionBtn} 
                    onPress={takePhoto}
                    disabled={isPhotoProcessing}
                  >
                    <View style={styles.cameraIconBg}>
                      <MaterialCommunityIcons name="camera" size={32} color="#fff" />
                    </View>
                    <Text style={styles.cameraOptionText}>Appareil photo</Text>
                  </Pressable>
                  
                  <Pressable 
                    style={styles.cameraOptionBtn} 
                    onPress={pickFromGallery}
                    disabled={isPhotoProcessing}
                  >
                    <View style={styles.galleryIconBg}>
                      <MaterialCommunityIcons name="image-multiple" size={32} color="#fff" />
                    </View>
                    <Text style={styles.cameraOptionText}>Galerie</Text>
                  </Pressable>
                </View>

                {isPhotoProcessing && (
                  <View style={styles.processingContainer}>
                    <Text style={styles.processingText}>Analyse de l'image...</Text>
                  </View>
                )}

                <Pressable 
                  style={styles.voiceCancelBtn} 
                  onPress={() => setShowCameraModal(false)}
                  disabled={isPhotoProcessing}
                >
                  <Text style={styles.voiceCancelText}>Annuler</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>

          {/* Cart Popup */}
          <Modal
            visible={showCartPopup}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCartPopup(false)}
          >
            <Pressable style={styles.popupOverlay} onPress={() => setShowCartPopup(false)}>
              <View style={styles.popupContent}>
                <View style={styles.popupIcon}>
                  <MaterialCommunityIcons name="cart-check" size={40} color="#22c55e" />
                </View>
                <Text style={styles.popupTitle}>Produit ajouté !</Text>
                <Text style={styles.popupText}>
                  {addedProduct?.name} a été ajouté au panier.
                </Text>
                <View style={styles.popupButtons}>
                  <Pressable 
                    style={styles.popupBtnContinue}
                    onPress={() => setShowCartPopup(false)}
                  >
                    <Text style={styles.popupBtnContinueText}>Continuer</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.popupBtnCart}
                    onPress={() => {
                      setShowCartPopup(false);
                      onNavigate?.('cart');
                    }}
                  >
                    <Text style={styles.popupBtnCartText}>Voir panier</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </Modal>
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
    paddingHorizontal: 16,
    marginBottom: 12,
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
  bannerSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  banner: {
    backgroundColor: '#1a2632',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#324d67',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
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
    paddingBottom: 20,
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
    marginTop: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#7C8A9A',
  },
  searchRight: {
    flexDirection: 'row',
    gap: 8,
  },
  searchMini: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#233648',
    alignItems: 'center',
    justifyContent: 'center',
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
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupContent: {
    backgroundColor: '#1a2633',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  popupIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  popupText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  popupButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  popupBtnContinue: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#324d67',
    alignItems: 'center',
  },
  popupBtnContinueText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  popupBtnCart: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#137fec',
    alignItems: 'center',
  },
  popupBtnCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a2633',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    gap: 8,
  },
  voiceWave: {
    width: 6,
    backgroundColor: '#137fec',
    borderRadius: 3,
  },
  voiceCancelBtn: {
    marginTop: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  voiceCancelBtnDisabled: {
    opacity: 0.5,
  },
  voiceCancelText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    backgroundColor: '#137fec',
    marginTop: 16,
  },
  voiceSearchBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  voiceStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    marginTop: 24,
  },
  voiceStopBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  voiceRecordingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  recordingPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  modalSubtitleRecording: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 24,
    textAlign: 'center',
  },
  recordedTextContainer: {
    backgroundColor: '#233648',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  recordedText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  voiceButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  voiceRetryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#324d67',
  },
  voiceRetryBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  voiceApplyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#137fec',
  },
  voiceApplyBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  voiceRecordingText: {
    fontSize: 18,
    color: '#137fec',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  cameraOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  cameraIconBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryIconBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOptionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  processingContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  processingText: {
    color: '#137fec',
    fontSize: 14,
    fontWeight: '600',
  },
  voiceTranscript: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
});

const enhance = withObservables([], ({}) => ({
  products: database.get('products').query(Q.where('is_validated', true)).observe(),
}));

export default enhance(NewArrivalsScreen);
