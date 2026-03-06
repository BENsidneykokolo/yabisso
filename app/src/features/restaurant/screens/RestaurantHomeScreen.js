import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const categories = [
  { name: 'African', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCMuFdHBFHKEQCZ_ATpmykF0FFHAsz5YpP7dGRRAUO067AlV39Kd5qULKKcqYxYSMvPE9cXjc_W60-NMQ1DKNgqPsDdaZnT4S4PTF9eUDt3n6gISdNHIQNJxnCPweghBGkJ3Sj-RvXM8d-rC-DTufcQYG-QIS6LBv0ywXyeZ-bUpLkuGLCxhlaLpEY3W0t6e80s8kEHUo4pevA_b9VKfR72Th2fy6fDkR66-DgkCK5jm18uvXerSNjKJXNsccyDEal4RpEsIKx' },
  { name: 'Burger', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFtC59BHEe8Pwtq-Q8TGIY5doW9sbBnHGMQZ9WglkNAgBTQvsSu1Ha4nJJwohQID8O72RUZ4i5yw1FqvvbJDkww4Y9KfzjhobG58glmKzrTpjY6Tk7eXBAuLUYJCwZRwlRivzQLP7WlhhB55ze9q5CHkNS_4muEdwtdtQU480pH0mfSZJQcZQmZr59sVEIiM1jShmw4DZ5QRoFNJy_EvMgoukKURTXOtZGvyMVyw4xy2UnKbb7ygZQYPjfZ-1M0hwNbvQ3uHIF' },
  { name: 'Healthy', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzXRpMKOFUCAfvY_dv5O5uxpdhGNzPJUpA7IONJ285B_cmnb8V9V3tTJg7W7BLmEvvr4-hsl79LA8rTSqfxFE2ckdlHSSnFliXsDJI4gFu8l5GA57SkEcY6E0tEy3XJ3g-5aaxp3fWFMhMGOjjFkRJdsoZS3LxsNwgoSmAspd8RMGcP2_roY5-dO4lvGsCuRDRQ9rHILqY_15qkG9X3E99Qnt-KNcbUrGDrKlH4I0W9aENUdtfCKcYov1v9N7z1xWoL94ERzOg' },
  { name: 'Pizza', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4nN3kfEPZ0aSJmdXkL9SpUEm7TyVk7Y9hyEE_PVhUmSuJn0i00zYdWduopl7HQ8NGuu-jKhDDBCa-1vqQEgqiUDC5By20im8T8mns1Lo-KRWoP4q5uREx-9qaYwJf4G9Sa15V4If4ETy1f1n4sayjFl2BwKDe24b60QdjhFFDGtPZGDAr6UQj6NY7V9RIwfmnzRIxZC7BekUSO14O6_n8ruxvkQXO0dvrIx7tKpYYs8LOVXzgqTzSgDS8mcNkLzFP_nyTZjSM' },
];

const restaurants = [
  {
    id: 1,
    name: 'Chicken Republic',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKGwnSpkZ-l7kAusVGHXkMFgJ1vmQ4K_Hi1ZboXexx1MA7_oBQ4g83TCpVsqSO6k0QMndlsI1hW_eQjms2AJu7q_FGv4mujRSjFFnv_ytmq2u7vK51YwH1Pwun-2cvoUC3tB7XKCkhyun4HrpYbtPO4E9P9cKJ6Sn3IwcTtxzGRuXn4qDReQR76JqRnGctHbhlBDkltMfMv3DfxhlaAv684HE8yiPcIjg7Vi4Zxd1Q8NkPcRz6URPMiPLungLzTN8BxxThIQv2',
    delivery: '30-40 min',
    rating: 4.8,
    discount: '20% OFF',
    deliveryFee: 'Free delivery',
    category: 'African',
  },
  {
    id: 2,
    name: 'Iya Moria - Local',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqEgf-sY4N75ZEHTMwMsFspiT4sjQfFkmiHNgUQCk7yqLwYK4J_pdIJoT_guja2BS0uZ23kV3hmGVh_-eN5TmHbIumjpJfSiBMnRhHCgDxLCrYmVDphxqgwNQyfbpJHDhVGQhXXRmA2q2P7TUNN8aq0nPTnlDtK-MonCaLFkv2IvKqSVF7XhQ63DE2TnZ3lfBjjPiISv16CJoLXubWGAjcQ9Rrlq0gwBjBAYAcvLD-GAAQv7hh4zUScCDsPF8GOFkDqG42Y4Yb',
    delivery: '15 min',
    rating: 4.5,
    discount: null,
    deliveryFee: '₦500',
    category: 'African',
  },
  {
    id: 3,
    name: 'Burger King',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFtC59BHEe8Pwtq-Q8TGIY5doW9sbBnHGMQZ9WglkNAgBTQvsSu1Ha4nJJwohQID8O72RUZ4i5yw1FqvvbJDkww4Y9KfzjhobG58glmKzrTpjY6Tk7eXBAuLUYJCwZRwlRivzQLP7WlhhB55ze9q5CHkNS_4muEdwtdtQU480pH0mfSZJQcZQmZr59sVEIiM1jShmw4DZ5QRoFNJy_EvMgoukKURTXOtZGvyMVyw4xy2UnKbb7ygZQYPjfZ-1M0hwNbvQ3uHIF',
    delivery: '25-35 min',
    rating: 4.7,
    discount: null,
    deliveryFee: 'Free delivery',
    category: 'Burger',
  },
];

export default function RestaurantHomeScreen({ onBack, onNavigate }) {
  const [searchText, setSearchText] = useState('');
  const [cartCount, setCartCount] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <View>
              <Text style={styles.locationLabel}>Delivering to</Text>
              <View style={styles.locationValue}>
                <Text style={styles.locationText}>Lekki Phase 1</Text>
                <MaterialCommunityIcons name="expand-more" size={24} color="#137fec" />
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.iconBtn}>
                <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
                <View style={styles.notificationDot} />
              </Pressable>
              <Pressable style={styles.cartBtn}>
                <MaterialCommunityIcons name="shopping-bag" size={24} color="#fff" />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#92adc9" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search 'Jollof rice' or 'Mama Put'"
              placeholderTextColor="#92adc9"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((cat, index) => (
              <Pressable key={index} style={styles.categoryItem}>
                <Image source={{ uri: cat.image }} style={styles.categoryImage} />
                <Text style={styles.categoryName}>{cat.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable style={styles.filterChipActive}>
              <Text style={styles.filterChipTextActive}>All</Text>
            </Pressable>
            <Pressable style={styles.filterChip}>
              <MaterialCommunityIcons name="star" size={16} color="#FBBF24" />
              <Text style={styles.filterChipText}>Top Rated</Text>
            </Pressable>
            <Pressable style={styles.filterChip}>
              <Text style={styles.filterChipText}>Fastest Delivery</Text>
            </Pressable>
            <Pressable style={styles.filterChip}>
              <MaterialCommunityIcons name="leaf" size={16} color="#34D399" />
              <Text style={styles.filterChipText}>Pure Veg</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {restaurants.slice(0, 2).map((restaurant) => (
              <Pressable 
                key={restaurant.id} 
                style={styles.trendingCard}
                onPress={() => onNavigate?.('restaurant_details', { restaurant })}
              >
                <Image source={{ uri: restaurant.image }} style={styles.trendingImage} />
                <View style={styles.trendingOverlay}>
                  <View style={styles.trendingBadges}>
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredText}>Featured</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>★ {restaurant.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.trendingName}>{restaurant.name}</Text>
                  <Text style={styles.trendingSubtext}>
                    {restaurant.discount ? `Free delivery on orders over ₦5000` : `${restaurant.delivery} • ₦${restaurant.deliveryFee}`}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* All Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Restaurants</Text>
          <View style={styles.restaurantList}>
            {restaurants.map((restaurant) => (
              <Pressable 
                key={restaurant.id} 
                style={styles.restaurantCard}
                onPress={() => onNavigate?.('restaurant_details', { restaurant })}
              >
                <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
                <View style={styles.restaurantBadges}>
                  <View style={styles.deliveryBadge}>
                    <Text style={styles.deliveryText}>{restaurant.delivery}</Text>
                  </View>
                  <Pressable style={styles.favoriteBtn}>
                    <MaterialCommunityIcons name="heart-outline" size={20} color="#fff" />
                  </Pressable>
                </View>
                {restaurant.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{restaurant.discount}</Text>
                  </View>
                )}
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantCategory}>{restaurant.category} • {restaurant.delivery}</Text>
                  <View style={styles.restaurantMeta}>
                    <View style={styles.ratingRow}>
                      <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
                      <Text style={styles.ratingValue}>{restaurant.rating}</Text>
                    </View>
                    <Text style={styles.deliveryFee}>{restaurant.deliveryFee}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item) => (
            <Pressable
              key={item.label}
              style={styles.navItem}
              onPress={() => {
                if (item.label === 'Home') {
                  onBack?.();
                } else if (item.label === 'Orders') {
                  onNavigate?.('orders');
                } else if (item.label === 'Cart') {
                  onNavigate?.('cart');
                }
              }}
            >
              <View style={styles.navIconContainer}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={item.label === 'Home' ? '#0E151B' : '#CBD5F5'}
                />
              </View>
              <Text style={[styles.navLabel, item.label === 'Home' && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const bottomNavItems = [
  { label: 'Home', icon: 'home' },
  { label: 'Orders', icon: 'shopping' },
  { label: 'Cart', icon: 'cart' },
  { label: 'Profile', icon: 'account' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  locationValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
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
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F87171',
  },
  cartBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: '#137fec',
    fontWeight: '600',
  },
  categoriesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 12,
  },
  categoryImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  categoryName: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  filterChipActive: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipTextActive: {
    color: '#0E151B',
    fontWeight: '600',
    fontSize: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },
  filterChipText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  trendingCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  trendingBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  featuredBadge: {
    backgroundColor: '#137fec',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendingName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  trendingSubtext: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  restaurantList: {
    gap: 16,
  },
  restaurantCard: {
    backgroundColor: '#1c2630',
    borderRadius: 16,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 160,
  },
  restaurantBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deliveryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  favoriteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#137fec',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  restaurantCategory: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    color: '#FBBF24',
    fontWeight: 'bold',
  },
  deliveryFee: {
    color: '#64748b',
    fontSize: 14,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 4,
  },
  navLabelActive: {
    color: '#2BEE79',
  },
});
