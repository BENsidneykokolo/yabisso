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
import { useRestaurantCart } from '../context/RestaurantCartContext';

const menuItems = [
  {
    id: 1,
    name: 'Riz Jollof au Poulet',
    description: 'Riz jollof épicé servi avec poulet grillé et plantain',
    price: 2500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCMuFdHBFHKEQCZ_ATpmykF0FFHAsz5YpP7dGRRAUO067AlV39Kd5qULKKcqYxYSMvPE9cXjc_W60-NMQ1DKNgqPsDdaZnT4S4PTF9eUDt3n6gISdNHIQNJxnCPweghBGkJ3Sj-RvXM8d-rC-DTufcQYG-QIS6LBv0ywXyeZ-bUpLkuGLCxhlaLpEY3W0t6e80s8kEHUo4pevA_b9VKfR72Th2fy6fDkR66-DgkCK5jm18uvXerSNjKJXNsccyDEal4RpEsIKx',
    popular: true,
    category: 'Popular',
  },
  {
    id: 2,
    name: 'Riz Frit Spécial',
    description: 'Délicieux riz frit aux crevettes et légumes',
    price: 2200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzXRpMKOFUCAfvY_dv5O5uxpdhGNzPJUpA7IONJ285B_cmnb8V9V3tTJg7W7BLmEvvr4-hsl79LA8rTSqfxFE2ckdlHSSnFliXsDJI4gFu8l5GA57SkEcY6E0tEy3XJ3g-5aaxp3fWFMhMGOjjFkRJdsoZS3LxsNwgoSmAspd8RMGcP2_roY5-dO4lvGsCuRDRQ9rHILqY_15qkG9X3E99Qnt-KNcbUrGDrKlH4I0W9aENUdtfCKcYov1v9N7z1xWoL94ERzOg',
    popular: false,
    category: 'Rice',
  },
  {
    id: 3,
    name: 'Plateau Suya',
    description: 'Suya de bœuf grillé aux oignons et tomates',
    price: 1800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqEgf-sY4N75ZEHTMwMsFspiT4sjQfFkmiHNgUQCk7yqLwYK4J_pdIJoT_guja2BS0uZ23kV3hmGVh_-eN5TmHbIumjpJfSiBMnRhHCgDxLCrYmVDphxqgwNQyfbpJHDhVGQhXXRmA2q2P7TUNN8aq0nPTnlDtK-MonCaLFkv2IvKqSVF7XhQ63DE2TnZ3lfBjjPiISv16CJoLXubWGAjcQ9Rrlq0gwBjBAYAcvLD-GAAQv7hh4zUScCDsPF8GOFkDqG42Y4Yb',
    popular: true,
    category: 'Proteins',
  },
  {
    id: 4,
    name: 'Egusi au Piled Yam',
    description: 'Soupe egusi traditionnelle servie avec pilé yam',
    price: 2000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKGwnSpkZ-l7kAusVGHXkMFgJ1vmQ4K_Hi1ZboXexx1MA7_oBQ4g83TCpVsqSO6k0QMndlsI1hW_eQjms2AJu7q_FGv4mujRSjFFnv_ytmq2u7vK51YwH1Pwun-2cvoUC3tB7XKCkhyun4HrpYbtPO4E9P9cKJ6Sn3IwcTtxzGRuXn4qDReQR76JqRnGctHbhlBDkltMfMv3DfxhlaAv684HE8yiPcIjg7Vi4Zxd1Q8NkPcRz6URPMiPLungLzTN8BxxThIQv2',
    popular: false,
    category: 'Soups',
  },
  {
    id: 5,
    name: 'Fufu et Nkoyo',
    description: 'Fufu traditionnelle avec sauce épinard',
    price: 1800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCMuFdHBFHKEQCZ_ATpmykF0FFHAsz5YpP7dGRRAUO067AlV39Kd5qULKKcqYxYSMvPE9cXjc_W60-NMQ1DKNgqPsDdaZnT4S4PTF9eUDt3n6gISdNHIQNJxnCPweghBGkJ3Sj-RvXM8d-rC-DTufcQYG-QIS6LBv0ywXyeZ-bUpLkuGLCxhlaLpEY3W0t6e80s8kEHUo4pevA_b9VKfR72Th2fy6fDkR66-DgkCK5jm18uvXerSNjKJXNsccyDEal4RpEsIKx',
    popular: false,
    category: 'Swallows',
  },
  {
    id: 6,
    name: 'Poulet Braisé',
    description: 'Poulet grillé aux épices africaines',
    price: 3000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKGwnSpkZ-l7kAusVGHXkMFgJ1vmQ4K_Hi1ZboXexx1MA7_oBQ4g83TCpVsqSO6k0QMndlsI1hW_eQjms2AJu7q_FGv4mujRSjFFnv_ytmq2u7vK51YwH1Pwun-2cvoUC3tB7XKCkhyun4HrpYbtPO4E9P9cKJ6Sn3IwcTtxzGRuXn4qDReQR76JqRnGctHbhlBDkltMfMv3DfxhlaAv684HE8yiPcIjg7Vi4Zxd1Q8NkPcRz6URPMiPLungLzTN8BxxThIQv2',
    popular: true,
    category: 'Proteins',
  },
];

const categories = ['Tout', 'Popular', 'Rice', 'Soups', 'Swallows', 'Proteins'];

export default function RestaurantDetailsScreen({ route, onBack, onNavigate }) {
  const restaurant = route?.params?.restaurant || {
    id: 1,
    name: 'Chicken Republic',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKGwnSpkZ-l7kAusVGHXkMFgJ1vmQ4K_Hi1ZboXexx1MA7_oBQ4g83TCpVsqSO6k0QMndlsI1hW_eQjms2AJu7q_FGv4mujRSjFFnv_ytmq2u7vK51YwH1Pwun-2cvoUC3tB7XKCkhyun4HrpYbtPO4E9P9cKJ6Sn3IwcTtxzGRuXn4qDReQR76JqRnGctHbhlBDkltMfMv3DfxhlaAv684HE8yiPcIjg7Vi4Zxd1Q8NkPcRz6URPMiPLungLzTN8BxxThIQv2',
    rating: 4.8,
    delivery: '30-40 min',
  };
  
  const [activeCategory, setActiveCategory] = useState('Tout');
  const { addToCart, getCartCount, getCartTotal } = useRestaurantCart();

  const handleAddToCart = (item) => {
    addToCart({
      ...item,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    });
  };

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  // Filter menu items based on active category
  const filteredMenuItems = activeCategory === 'Tout' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  // Get category display name in French
  const getCategoryTitle = () => {
    const titles = {
      'Tout': 'Tous les articles',
      'Popular': 'Populaires',
      'Rice': 'Riz',
      'Soups': 'Soupes',
      'Swallows': 'Pilés',
      'Proteins': 'Protéines',
    };
    return titles[activeCategory] || activeCategory;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          
          {/* Header Buttons */}
          <View style={styles.heroHeader}>
            <Pressable style={styles.backBtn} onPress={onBack}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable style={styles.actionBtn}>
                <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <MaterialCommunityIcons name="heart-outline" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Restaurant Info */}
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantMeta}>African • Nigerian • Fast Food</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FBBF24" />
              <Text style={styles.ratingText}>{restaurant.rating}</Text>
              <Text style={styles.deliveryText}>• {restaurant.delivery}</Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{getCategoryTitle()}</Text>
          {filteredMenuItems.map((item) => (
            <Pressable 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => onNavigate?.('food_details', { item })}
            >
              <View style={styles.menuItemInfo}>
                <View style={styles.menuItemHeader}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  {item.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Popular</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.menuItemDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.menuItemFooter}>
                  <Text style={styles.menuItemPrice}>FCFA {item.price.toLocaleString()}</Text>
                  <View style={styles.menuItemActions}>
                    <Pressable 
                      style={styles.detailsBtn}
                      onPress={() => onNavigate?.('food_details', { item, restaurant })}
                    >
                      <MaterialCommunityIcons name="eye" size={16} color="#2BEE79" />
                    </Pressable>
                    <Pressable 
                      style={styles.addBtn}
                      onPress={() => handleAddToCart(item)}
                    >
                      <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                    </Pressable>
                  </View>
                </View>
              </View>
              <Image source={{ uri: item.image }} style={styles.menuItemImage} />
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Cart Floating Button */}
      {cartCount > 0 && (
        <View style={styles.cartFloat}>
          <View style={styles.cartFloatContent}>
            <View style={styles.cartFloatLeft}>
              <Text style={styles.cartCount}>{cartCount} items</Text>
              <Text style={styles.cartTotal}>FCFA {cartTotal.toLocaleString()}</Text>
            </View>
            <Pressable 
              style={styles.viewCartBtn}
              onPress={() => onNavigate?.('food_checkout')}
            >
              <Text style={styles.viewCartText}>View Cart</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#0E151B" />
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroHeader: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  restaurantName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  restaurantMeta: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    color: '#FBBF24',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  deliveryText: {
    color: '#94a3b8',
    marginLeft: 4,
  },
  categoriesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1c2630',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#137fec',
  },
  categoryText: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#1c2630',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  menuItemInfo: {
    flex: 1,
    padding: 12,
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  popularBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuItemDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 18,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  menuItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#137fec',
  },
  detailsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2BEE79',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemImage: {
    width: 100,
    height: '100%',
    minHeight: 120,
  },
  bottomSpacer: {
    height: 100,
  },
  cartFloat: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  cartFloatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
  },
  cartFloatLeft: {
    flex: 1,
  },
  cartCount: {
    fontSize: 14,
    color: '#64748b',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E151B',
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  viewCartText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
