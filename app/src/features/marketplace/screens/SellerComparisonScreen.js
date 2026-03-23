import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import * as SecureStore from 'expo-secure-store';

export default function SellerComparisonScreen({ onBack, onNavigate, product, route }) {
  const [sortBy, setSortBy] = useState('best_match');
  const [allSellers, setAllSellers] = useState([]);

  const incomingProduct = product || route?.params?.product;
  const productData = incomingProduct || {
    name: 'BassPro Wireless Headphones',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcH_wkhL9Vsdh3YOxVm8TuEpTlNbPnwEr08XwJFX8cQOKmYsov5xRS4oviF8wwFiErmeKAJE8wqc7HHjgknnv4KzHoszV5hLciu_pQp54wIA4QipzyT5tU4G2ungf-XnZCIvC9vCT45QSSAR-hngMPz8OFZUvmLzbxqjSGIQUG4VDjviScm2kUyCw6UrlhV9Adzej29zBtQdbaPpoRjqKgFgwvA_zZkcDHFEgZmG4fpm8r4dpAVhMvIcrZ3SkKgmzuYEaulaXF',
    price: 150000,
  };

  React.useEffect(() => {
    loadRealSellers();
  }, [incomingProduct?.id]);

  const loadRealSellers = async () => {
    try {
      const saved = await SecureStore.getItemAsync('seller_products');
      if (saved) {
        const productsData = JSON.parse(saved);
        
        let categoryProducts = productsData.filter(p => p.id !== incomingProduct?.id && (p.category === incomingProduct?.category || p.name.trim().toLowerCase().includes(incomingProduct?.name?.trim().toLowerCase() || '')));
        if (categoryProducts.length === 0) {
           categoryProducts = productsData.filter(p => p.id !== incomingProduct?.id);
        }

        const mappedSellers = categoryProducts.map((p, index) => ({
          id: p.id,
          name: p.brand || 'Vendeur Indépendant',
          location: 'Locale',
          rating: 4.5,
          reviews: Math.floor(Math.random() * 200) + 10,
          deliveryTime: index % 2 === 0 ? 'Instant (2h)' : '3-4 Jours',
          deliveryType: index % 2 === 0 ? 'instant' : 'standard',
          verified: index % 2 === 0,
          isOfficial: false,
          condition: p.condition || 'Neuf',
          avatar: null,
          price: parseInt(p.price) || 0,
          productRef: p
        }));
        
        setAllSellers(mappedSellers);
      }
    } catch (e) {
      console.log('Error loading sellers:', e);
    }
  };

  const sellers = useMemo(() => {
    return [...allSellers].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'delivery') {
        const order = { instant: 0, express: 1, standard: 2 };
        return order[a.deliveryType] - order[b.deliveryType];
      }
      return b.rating - a.rating;
    });
  }, [allSellers, sortBy]);

  const sortedSellers = useMemo(() => {
    if (sortBy === 'best_match') {
      return [...sellers].sort((a, b) => b.rating - a.rating);
    }
    return sellers;
  }, [sellers, sortBy]);

  const getBestMatch = () => sortedSellers[0];

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('fr-FR') + ' FCA';
  };

  const handleSelectSeller = (seller) => {
    if (seller.productRef) {
      onNavigate?.('product_details', { product: seller.productRef });
    } else {
      onNavigate?.('product_details', { product: { ...productData, seller: { name: seller.name, rating: seller.rating, avatar: seller.avatar }, price: seller.price } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Comparer les prix</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Product Context */}
      <View style={styles.productContext}>
        {productData.photos && productData.photos[0] ? (
          <Image source={{ uri: productData.photos[0] }} style={styles.productThumb} />
        ) : (
          <Image source={{ uri: productData.image || 'https://via.placeholder.com/48' }} style={styles.productThumb} />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productLabel}>Comparaison</Text>
          <Text style={styles.productName} numberOfLines={1}>{productData.name}</Text>
        </View>
      </View>

      {/* Sort Chips */}
      <View style={styles.sortChips}>
        <Pressable 
          style={[styles.chip, sortBy === 'best_match' && styles.chipActive]}
          onPress={() => setSortBy('best_match')}
        >
          <Text style={[styles.chipText, sortBy === 'best_match' && styles.chipTextActive]}>
            Meilleure correspondance
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.chip, sortBy === 'price' && styles.chipActive]}
          onPress={() => setSortBy('price')}
        >
          <Text style={[styles.chipText, sortBy === 'price' && styles.chipTextActive]}>
            Prix le plus bas
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.chip, sortBy === 'delivery' && styles.chipActive]}
          onPress={() => setSortBy('delivery')}
        >
          <Text style={[styles.chipText, sortBy === 'delivery' && styles.chipTextActive]}>
            Livraison rapide
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Seller Cards */}
        {sortedSellers.map((seller, index) => (
          <View 
            key={seller.id} 
            style={[
              styles.sellerCard,
              seller.isOfficial && styles.sellerCardOfficial
            ]}
          >
            {/* Badges */}
            {index === 0 && sortBy === 'best_match' && (
              <View style={[styles.bestMatchBadge, { backgroundColor: '#22c55e' }]}>
                <Text style={styles.bestMatchBadgeText}>Meilleure correspondance</Text>
              </View>
            )}
            {sortBy === 'price' && index === 0 && (
              <View style={[styles.bestMatchBadge, { backgroundColor: '#eab308' }]}>
                <Text style={styles.bestMatchBadgeText}>Meilleur prix</Text>
              </View>
            )}
            {seller.isOfficial && (
              <View style={styles.officialBadge}>
                <MaterialCommunityIcons name="verified-user" size={12} color="#fff" />
                <Text style={styles.officialBadgeText}>Boutique officielle</Text>
              </View>
            )}

            {/* Seller Info */}
            <View style={styles.sellerHeader}>
              <View style={styles.sellerIdentity}>
                {seller.avatar ? (
                  <Image source={{ uri: seller.avatar }} style={styles.sellerAvatar} />
                ) : (
                  <View style={styles.sellerAvatarPlaceholder}>
                    <Text style={styles.sellerAvatarText}>
                      {seller.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </Text>
                  </View>
                )}
                <View>
                  <View style={styles.sellerNameRow}>
                    <Text style={styles.sellerName}>{seller.name}</Text>
                    {seller.verified && (
                      <MaterialCommunityIcons name="verified" size={16} color="#137fec" />
                    )}
                  </View>
                  <View style={styles.sellerLocation}>
                    <MaterialCommunityIcons name="map-marker" size={14} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.sellerLocationText}>{seller.location}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sellerRating}>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{seller.rating}</Text>
                  <MaterialCommunityIcons name="star" size={14} color="#fbbf24" />
                </View>
                <Text style={styles.reviewsText}>({seller.reviews} avis)</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Metrics */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Prix</Text>
                <Text style={[styles.metricPrice, sortBy === 'price' && index === 0 && { color: '#22c55e' }]}>
                  {formatPrice(seller.price)}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>État</Text>
                <Text style={styles.conditionText}>{seller.condition}</Text>
              </View>
            </View>
            
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Livraison</Text>
                <View style={styles.deliveryRow}>
                  <MaterialCommunityIcons 
                    name={seller.deliveryType === 'instant' ? 'local-shipping' : seller.deliveryType === 'express' ? 'bolt' : 'schedule'} 
                    size={18} 
                    color={seller.deliveryType === 'instant' ? '#22c55e' : '#fff'} 
                  />
                  <Text style={styles.deliveryText}>{seller.deliveryTime}</Text>
                </View>
              </View>
            </View>

            {/* Official Store Extras */}
            {seller.isOfficial && (
              <View style={styles.extraTags}>
                <View style={styles.extraTag}>
                  <MaterialCommunityIcons name="shield-check" size={14} color="#22c55e" />
                  <Text style={styles.extraTagText}>Garantie: {seller.warranty}</Text>
                </View>
                <View style={styles.extraTag}>
                  <MaterialCommunityIcons name="refresh" size={14} color="#22c55e" />
                  <Text style={styles.extraTagText}>Retour gratuit</Text>
                </View>
              </View>
            )}

            {/* Select Button */}
            <Pressable 
              style={styles.selectBtn}
              onPress={() => handleSelectSeller(seller)}
            >
              <Text style={styles.selectBtnText}>Choisir ce vendeur</Text>
              <MaterialCommunityIcons name="arrow-forward" size={18} color="#0E151B" />
            </Pressable>
          </View>
        ))}

        <View style={styles.bottomGradient} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  productContext: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    padding: 8,
    borderRadius: 8,
    gap: 12,
  },
  productThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  productThumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#324d67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  sortChips: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#192633',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 4,
  },
  chipActive: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
  },
  chipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sellerCard: {
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  sellerCardOfficial: {
    borderColor: 'rgba(19, 127, 236, 0.3)',
    borderWidth: 1,
  },
  bestMatchBadge: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestMatchBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
  },
  bestPriceBadge: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestPriceBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
  },
  officialBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#137fec',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: seller => seller.isOfficial || seller.isBestMatch ? 8 : 0,
  },
  sellerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sellerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  sellerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sellerLocationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  sellerRating: {
    alignItems: 'flex-end',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  reviewsText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricsRow: {
    marginTop: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  metricPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#137fec',
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliveryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  extraTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  extraTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  extraTagText: {
    fontSize: 12,
    color: '#fff',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  selectBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0E151B',
  },
  bottomGradient: {
    height: 48,
  },
});
