import React, { useState } from 'react';
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

const productData = {
  name: 'Apple iPhone 14 Pro Max - 256GB',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl65MXaR1khjucFjFf84RCVBY4sddrCYrnCXF71155jd9awHMwneZECphbsl_0qejxiPUyeCQ_fD7n5prGDSen9xO5lEXKkxhISW75aSZc4ueqaQf00DOWUz-5QArXbmwjk6-wE6LZ3bHScnJ_i62twwys2PXquZRBMyxDmHKYdHWvMgkABL8DUWktG2oJ6GdbZ2hSnlhuxKZUphlYljCpifTFgOJ9zLuHFxxyflKCOrtDZdZ9zI0FZr_Xx-NiBMNEE2N2fYCC',
};

const sellers = [
  {
    id: 1,
    name: 'TechZone DRC',
    location: 'Kinshasa, Gombe',
    rating: 4.9,
    reviews: 2100,
    price: 1250,
    deliveryTime: 'Instant (2h)',
    deliveryType: 'instant',
    verified: true,
    isBestMatch: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH6iTawFsVSvLMVv7gwwvv03MhgKYPEQcMP3hKcanDo_fMvGX8161pj-tIOBKUrhq5pOh1wmlX7xZ19vQyRDPov6zUYh6bWcWOhm5YehdnhfT4_4bf-W9jVfTfu9RpO7xKmoUhujuj0-pHtWkxgERCRjcaGNVJmmHTsKOlzEPxhaR3FhE-7gbVkUHMb5xtVOehxIwjZN3f25GweT92cU5c0b7Yg6OdFo_e-81uaSXvFS8v6eW1TPKKLmjeBfzc0KfSkvhvEv2X',
  },
  {
    id: 2,
    name: 'Market Kintambo',
    location: 'Kintambo Magasin',
    rating: 4.2,
    reviews: 86,
    price: 1190,
    deliveryTime: '3-4 Days',
    deliveryType: 'standard',
    verified: false,
    isBestPrice: true,
    avatar: null,
  },
  {
    id: 3,
    name: 'Yabisso Official',
    location: 'Kinshasa, Central',
    rating: 5.0,
    reviews: 500,
    price: 1300,
    deliveryTime: 'Next Day',
    deliveryType: 'express',
    verified: true,
    isOfficial: true,
    warranty: '1 Year',
    freeReturn: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBThri00oB2_pUgd62JNEJP92G-IIQkQ0mwBBDBJbtGem9Yk9_z9S7A8UrCJqG9uFzF-Fh58E3_SvgFMAmegrDdJCRHYgsu7gg1SCTHHV8Hldb716QzEEveTOOljE0XSKo0BXbvqrnSs--up3Co_MfK2lPyYrs4zn-sTvRkqjwO5Cr8-ctqrIiZmRyPIXNdg_ifpnkKZEDBvAofi-BBdd5grhaeC2BtlQTeTU3XsjrGqN3LwvRKtD3n4pHXGts-lwawPR8d992D',
  },
];

export default function SellerComparisonScreen({ onBack, onNavigate }) {
  const [sortBy, setSortBy] = useState('best_match');

  const formatPrice = (price) => {
    return price.toLocaleString('fr-FR') + ' $';
  };

  const handleSelectSeller = (sellerId) => {
    onNavigate?.('select_seller', sellerId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Comparer les vendeurs</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Product Context */}
      <View style={styles.productContext}>
        <Image source={{ uri: productData.image }} style={styles.productThumb} />
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
          {sortBy === 'best_match' && (
            <MaterialCommunityIcons name="expand-more" size={16} color="#fff" />
          )}
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
        {sellers.map((seller) => (
          <View 
            key={seller.id} 
            style={[
              styles.sellerCard,
              seller.isOfficial && styles.sellerCardOfficial
            ]}
          >
            {/* Badges */}
            {seller.isBestMatch && (
              <View style={styles.bestMatchBadge}>
                <Text style={styles.bestMatchBadgeText}>Meilleure correspondance</Text>
              </View>
            )}
            {seller.isBestPrice && (
              <View style={styles.bestPriceBadge}>
                <Text style={styles.bestPriceBadgeText}>Meilleur prix</Text>
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
                <Text style={styles.reviewsText}>({seller.reviews.toLocaleString()} avis)</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Metrics */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Prix</Text>
                <Text style={styles.metricPrice}>{formatPrice(seller.price)}</Text>
              </View>
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
                  <Text style={styles.extraTagText}>Garantie: {seller.warranty}</Text>
                </View>
                <View style={styles.extraTag}>
                  <Text style={styles.extraTagText}>Retour gratuit</Text>
                </View>
              </View>
            )}

            {/* Select Button */}
            <Pressable 
              style={styles.selectBtn}
              onPress={() => handleSelectSeller(seller.id)}
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
    backgroundColor: '#324d67',
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
