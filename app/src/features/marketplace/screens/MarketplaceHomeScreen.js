import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useVoiceSearch } from '../../../hooks/useVoiceSearch';
import { usePhotoSearch } from '../../../hooks/usePhotoSearch';
import withObservables from '@nozbe/with-observables';
import { database } from '../../../lib/db';
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

const bottomNavItems = [
  { label: 'Marketplace', icon: 'store' },
  { label: 'Catégories', icon: 'view-grid' },
  { label: 'Nouveauté', icon: 'sparkles' },
  { label: 'Panier', icon: 'cart' },
];

const categories = [
  { name: 'Tout', icon: 'apps', color: '#324d67' },
  { name: 'Téléphones', icon: 'smartphone', color: '#137fec' },
  { name: 'Mode', icon: 'tshirt-crew', color: '#eab308' },
  { name: 'Maison', icon: 'sofa', color: '#22c55e' },
  { name: 'Beauté', icon: 'face-woman', color: '#ef4444' },
  { name: 'Accessoire', icon: 'watch', color: '#8b5cf6' },
];

const deals = [
  { id: 1, title: 'Grande Vente', subtitle: 'Électronique & Accessoires', tag: 'PROMO -50%', tagColor: '#ef4444', category: 'Téléphones' },
  { id: 2, title: 'Tech Deals', subtitle: 'Arrivages récents', tag: 'NOUVEAU', tagColor: '#eab308', category: 'Mode' },
  { id: 3, title: 'Beauté', subtitle: 'Cosmétiques & Soins', tag: 'PROMO -30%', tagColor: '#ef4444', category: 'Beauté' },
  { id: 4, title: 'Maison', subtitle: 'Décoration & Ameublement', tag: 'NOUVEAU', tagColor: '#22c55e', category: 'Maison' },
];

function MarketplaceHomeScreen({ onBack, onNavigate, favorites = [], onToggleFavorite, products = [] }) {
  const [activeTab, setActiveTab] = useState('Boutique');
  const [showMenu, setShowMenu] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  
  useEffect(() => {
    loadSellerProducts();
  }, []);

  const loadSellerProducts = async () => {
    try {
      const saved = await SecureStore.getItemAsync('seller_products');
      if (saved) {
        const productsData = JSON.parse(saved);
        const formatted = productsData
          .filter(p => p.isVisible !== false)
          .map(p => ({
            id: p.id,
            name: p.name,
            brand: 'Ma Boutique',
            price: p.price.toString(),
            category: CATEGORIES_MAP[p.category] || p.categoryName || 'Autres',
            isNew: p.tags?.includes('Nouveau'),
            isPromo: p.tags?.includes('Promo'),
            photos: p.photos,
          }));
        setSellerProducts(formatted);
      }
    } catch (e) {
      console.log('Error loading seller products:', e);
    }
  };
  const { addToCart } = useCart();

  const { isListening, transcript, error: voiceError, start: startVoice, stop: stopVoice } = useVoiceSearch({
    onResult: (text) => {
      setSearchText(text);
    }
  });

  const { takePhoto, pickFromGallery, isProcessing: isPhotoProcessing, preview: photoPreview } = usePhotoSearch({
    onResult: (res) => {
      setSearchText(res.searchQuery);
      setShowCameraModal(false);
    }
  });

  const isFavorite = (productId) => favorites.some(f => f.id === productId);

  const handleToggleFavorite = (product) => {
    if (onToggleFavorite) {
      onToggleFavorite(product);
    }
  };

  const filteredProducts = searchText.trim() 
    ? sellerProducts.filter(p => 
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchText.toLowerCase())
      )
    : sellerProducts;

  const showSearchResults = searchText.trim().length > 0;

  const menuItems = [
    { label: 'Profil', icon: 'account-circle', screen: 'profile' },
    { label: 'Boutique', icon: 'store', screen: 'marketplace_home' },
    { label: 'Vendre', icon: 'tag-plus', screen: 'market_seller' },
    { label: 'Catégories', icon: 'view-grid', screen: 'category_page' },
    { label: 'Nouveautés', icon: 'sparkles', screen: 'new_arrivals' },
    { label: 'Mes commandes', icon: 'shopping', screen: 'orders' },
    { label: 'Panier', icon: 'cart', screen: 'cart' },
    { label: 'Favoris', icon: 'heart', screen: 'marketplace_favorites' },
    { label: 'Historique', icon: 'history', screen: 'marketplace_history' },
    { label: 'Paramètres', icon: 'cog', screen: 'marketplace_settings' },
    { label: 'Aide & Support', icon: 'help-circle', screen: 'profile_support' },
  ];

  const handleMenuPress = (item) => {
    setShowMenu(false);
    if (item.screen) {
      onNavigate?.(item.screen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.userInfo}>
                <Pressable style={styles.menuBtn} onPress={() => setShowMenu(true)}>
                  <MaterialCommunityIcons name="menu" size={26} color="#fff" />
                </Pressable>
                <Pressable onPress={() => onNavigate?.('profile')}>
                  <Text style={styles.greeting}>Bonjour, Kwesi</Text>
                  <Text style={styles.location}>Abidjan, CI</Text>
                </Pressable>
              </View>
              <Pressable style={styles.notificationBtn} onPress={() => onNavigate?.('marketplace_notifications')}>
                <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
                <View style={styles.notificationDot} />
              </Pressable>
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

          <View style={styles.content}>
            {/* Categories */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Catégories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoriesRow}>
                  {categories.map((cat, index) => (
                    <Pressable 
                      key={index} 
                      style={styles.categoryItem}
                      onPress={() => onNavigate?.('category_page', { category: cat.name })}
                    >
                      <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                        <MaterialCommunityIcons name={cat.icon} size={20} color="#fff" />
                      </View>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Deals */}
            <View style={styles.dealsSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.dealsRow}>
                  {deals.map((deal) => (
                    <Pressable 
                      key={deal.id} 
                      style={styles.dealCard}
                      onPress={() => onNavigate?.('category_page', { category: deal.category })}
                    >
                      <View style={styles.dealContent}>
                        <View style={[styles.dealTag, { backgroundColor: deal.tagColor }]}>
                          <Text style={styles.dealTagText}>{deal.tag}</Text>
                        </View>
                        <Text style={styles.dealTitle}>{deal.title}</Text>
                        <Text style={styles.dealSubtitle}>{deal.subtitle}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Products Grid */}
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
                                const productToAdd = { 
                                  ...product, 
                                  price: parseInt(product.price) || 0,
                                  image: product.photos?.[0] || null
                                };
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
                    <Text style={styles.noResultsSubtext}>Essayez avec un autre mot-clé</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.productsSection}>
                <View style={styles.productsHeader}>
                  <Text style={styles.sectionTitle}>Produits populaires</Text>
                  <Pressable>
                    <Text style={styles.seeAll}>Voir tout</Text>
                  </Pressable>
                </View>
                <View style={styles.productsGrid}>
                  {sellerProducts.slice(0, 6).map((product) => (
                    <Pressable 
                      key={product.id} 
                      style={styles.productCard}
                      onPress={() => onNavigate?.('product_details', { product })}
                    >
                      <View style={styles.productImage}>
                        {product.photos && product.photos[0] ? (
                          <Image source={{ uri: product.photos[0] }} style={styles.productImg} />
                        ) : (
                          <MaterialCommunityIcons name="image" size={32} color="#4B5563" />
                        )}
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
                                const productToAdd = { 
                                  ...product, 
                                  price: parseInt(product.price) || 0,
                                  image: product.photos?.[0] || null
                                };
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
              </View>
            )}
          </View>
        </ScrollView>

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

        {/* Menu Modal */}
        <Modal visible={showMenu} transparent animationType="slide">
          <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <View style={styles.menuUserInfo}>
                  <View style={styles.menuAvatar}>
                    <MaterialCommunityIcons name="account" size={28} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.menuUserName}>Alex</Text>
                    <Text style={styles.menuUserEmail}>alex@yabisso.com</Text>
                  </View>
                </View>
                <Pressable onPress={() => setShowMenu(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </Pressable>
              </View>
              
              <View style={styles.menuItems}>
                {menuItems.map((item, index) => (
                  <Pressable 
                    key={index} 
                    style={styles.menuItem}
                    onPress={() => handleMenuPress(item)}
                  >
                    <MaterialCommunityIcons name={item.icon} size={22} color="#94a3b8" />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
                  </Pressable>
                ))}
              </View>

              <View style={styles.menuFooter}>
                <Text style={styles.menuFooterText}>Yabisso Marché v1.0</Text>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Bottom Navigation */}
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
                    setActiveTab(item.label);
                    if (item.label === 'Boutique') {
                      // Already on marketplace home
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
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#101922',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1c2630',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  location: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  notificationBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1c2630',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#1c2630',
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusChipSecondary: {
    backgroundColor: 'rgba(19, 127, 236, 0.15)',
  },
  statusTextGreen: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    color: '#137fec',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#fff',
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
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  categoriesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#94a3b8',
  },
  dealsSection: {
    marginTop: 20,
  },
  dealsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dealCard: {
    width: 260,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dealContent: {
    flex: 1,
    backgroundColor: '#1c2630',
    padding: 16,
    justifyContent: 'center',
  },
  dealTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  dealTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  dealSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  productsSection: {
    marginTop: 24,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#94a3b8',
  },
  seeAll: {
    fontSize: 14,
    color: '#137fec',
    fontWeight: '600',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  productName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 16,
  },
  productBrand: {
    fontSize: 12,
    color: '#94a3b8',
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
    marginTop: 16,
  },
  voiceCancelBtnDisabled: {
    opacity: 0.5,
  },
  voiceCancelText: {
    fontSize: 16,
    color: '#fff',
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContent: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#1a2632',
    height: '100%',
    paddingTop: 50,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#324d67',
  },
  menuUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuUserEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  menuItems: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: '#e2e8f0',
  },
  menuFooter: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  menuFooterText: {
    fontSize: 12,
    color: '#64748b',
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
});

const enhance = withObservables([], () => ({
  products: database.get('products').query().observe(),
}));

export default enhance(MarketplaceHomeScreen);
