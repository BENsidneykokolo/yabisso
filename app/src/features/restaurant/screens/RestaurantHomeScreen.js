import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, SafeAreaView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRestaurantFavorites } from '../context/RestaurantFavoritesContext';

const categories = [
  { name: 'African', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCMuFdHBFHKEQCZ_ATpmykF0FFHAsz5YpP7dGRRAUO067AlV39Kd5qULKKcqYxYSMvPE9cXjc_W60-NMQ1DKNgqPsDdaZnT4S4PTF9eUDt3n6gISdNHIQNJxnCPweghBGkJ3Sj-RvXM8d-rC-DTufcQYG-QIS6LBv0ywXyeZ-bUpLkuGLCxhlaLpEY3W0t6e80s8kEHUo4pevA_b9VKfR72Th2fy6fDkR66-DgkCK5jm18uvXerSNjKJXNsccyDEal4RpEsIKx' },
  { name: 'Burger', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFtC59BHEe8Pwtq-Q8TGIY5doW9sbBnHGMQZ9WglkNAgBTQvsSu1Ha4nJJwohQID8O72RUZ4i5yw1FqvvbJDkww4Y9KfzjhobG58glmKzrTpjY6Tk7eXBAuLUYJCwZRwlRivzQLP7WlhhB55ze9q5CHkNS_4muEdwtdtQU480pH0mfSZJQcZQmZr59sVEIiM1jShmw4DZ5QRoFNJy_EvMgoukKURTXOtZGvyMVyw4xy2UnKbb7ygZQYPjfZ-1M0hwNbvQ3uHIF' },
  { name: 'Healthy', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzXRpMKOFUCAfvY_dv5O5uxpdhGNzPJUpA7IONJ285B_cmnb8V9V3tTJg7W7BLmEvvr4-hsl79LA8rTSqfxFE2ckdlHSSnFliXsDJI4gFu8l5GA57SkEcY6E0tEy3XJ3g-5aaxp3fWFMhMGOjjFkRJdsoZS3LxsNwgoSmAspd8RMGcP2_roY5-dO4lvGsCuRDRQ9rHILqY_15qkG9X3E99Qnt-KNcbUrGDrKlH4I0W9aENUdtfCKcYov1v9N7z1xWoL94ERzOg' },
  { name: 'Pizza', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4nN3kfEPZ0aSJmdXkL9SpUEm7TyVk7Y9hyEE_PVhUmSuJn0i00zYdWduopl7HQ8NGuu-jKhDDBCa-1vqQEgqiUDC5By20im8T8mns1Lo-KRWoP4q5uREx-9qaYwJf4G9Sa15V4If4ETy1f1n4sayjFl2BwKDe24b60QdjhFFDGtPZGDAr6UQj6NY7V9RIwfmnzRIxZC7BekUSO14O6_n8ruxvkQXO0dvrIx7tKpYYs8LOVXzgqTzSgDS8mcNkLzFP_nyTZjSM' },
];

const restaurants = [
  { id: 1, name: 'Chicken Republic', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKGwnSpkZ-l7kAusVGHXkMFgJ1vmQ4K_Hi1ZboXexx1MA7_oBQ4g83TCpVsqSO6k0QMndlsI1hW_eQjms2AJu7q_FGv4mujRSjFFnv_ytmq2u7vK51YwH1Pwun-2cvoUC3tB7XKCkhyun4HrpYbtPO4E9P9cKJ6Sn3IwcTtxzGRuXn4qDReQR76JqRnGctHbhlBDkltMfMv3DfxhlaAv684HE8yiPcIjg7Vi4Zxd1Q8NkPcRz6URPMiPLungLzTN8BxxThIQv2', delivery: '30-40 min', rating: 4.8, discount: '20% OFF', deliveryFee: 'Free delivery', category: 'African' },
  { id: 2, name: 'Iya Moria - Local', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqEgf-sY4N75ZEHTMwMsFspiT4sjQfFkmiHNgUQCk7yqLwYK4J_pdIJoT_guja2BS0uZ23kV3hmGVh_-eN5TmHbIumjpJfSiBMnRhHCgDxLCrYmVDphxqgwNQyfbpJHDhVGQhXXRmA2q2P7TUNN8aq0nPTnlDtK-MonCaLFkv2IvKqSVF7XhQ63DE2TnZ3lfBjjPiISv16CJoLXubWGAjcQ9Rrlq0gwBjBAYAcvLD-GAAQv7hh4zUScCDsPF8GOFkDqG42Y4Yb', delivery: '15 min', rating: 4.5, discount: null, deliveryFee: '500', category: 'African' },
  { id: 3, name: 'Burger King', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFtC59BHEe8Pwtq-Q8TGIY5doW9sbBnHGMQZ9WglkNAgBTQvsSu1Ha4nJJwohQID8O72RUZ4i5yw1FqvvbJDkww4Y9KfzjhobG58glmKzrTpjY6Tk7eXBAuLUYJCwZRwlRivzQLP7WlhhB55ze9q5CHkNS_4muEdwtdtQU480pH0mfSZJQcZQmZr59sVEIiM1jShmw4DZ5QRoFNJy_EvMgoukKURTXOtZGvyMVyw4xy2UnKbb7ygZQYPjfZ-1M0hwNbvQ3uHIF', delivery: '25-35 min', rating: 4.7, discount: null, deliveryFee: 'Free delivery', category: 'Burger' },
];

const bottomNavItems = [
  { label: 'Accueil', icon: 'home', screen: 'home' },
  { label: 'Commandes', icon: 'shopping', screen: 'orders' },
  { label: 'Panier', icon: 'cart', screen: 'cart' },
  { label: 'Profil', icon: 'account', screen: 'profile' },
];

export default function RestaurantHomeScreen({ onBack, onNavigate }) {
  const [searchText, setSearchText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('Accueil');
  const [activeFilter, setActiveFilter] = useState('Tout');
  const { toggleFavorite, isFavorite } = useRestaurantFavorites();

  const menuItems = [
    { label: 'Accueil', icon: 'home', screen: 'restaurant_home' },
    { label: 'Favoris', icon: 'heart', screen: 'restaurant_favorites' },
    { label: 'Commandes', icon: 'receipt', screen: 'restaurant_orders' },
    { label: 'Panier', icon: 'shopping-bag', screen: 'food_checkout' },
  ];

  const getFilteredRestaurants = () => {
    let filtered = selectedCategory ? restaurants.filter(r => r.category === selectedCategory) : restaurants;
    if (searchText.trim()) {
      filtered = filtered.filter(r => r.name.toLowerCase().includes(searchText.toLowerCase()) || r.category.toLowerCase().includes(searchText.toLowerCase()));
    }
    if (activeFilter === 'Mieux notes') {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (activeFilter === 'Plus rapides') {
      return [...filtered].sort((a, b) => {
        const timeA = parseInt(a.delivery.split('-')[0]);
        const timeB = parseInt(b.delivery.split('-')[0]);
        return timeA - timeB;
      });
    }
    return filtered;
  };

  const filteredRestaurants = getFilteredRestaurants();

  const handleMenuPress = (item) => {
    setShowMenu(false);
    if (item.screen && item.screen !== 'restaurant_home') {
      onNavigate?.(item.screen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <Pressable style={styles.menuBtn} onPress={() => setShowMenu(!showMenu)}>
              <MaterialCommunityIcons name="menu" size={26} color="#fff" />
            </Pressable>
            <Pressable style={styles.favoriteHeaderBtn} onPress={() => onNavigate?.('restaurant_favorites')}>
              <MaterialCommunityIcons name="heart" size={24} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#92adc9" />
            <TextInput style={styles.searchInput} placeholder="Rechercher un plat..." placeholderTextColor="#92adc9" value={searchText} onChangeText={setSearchText} />
            <View style={styles.searchActions}>
              <Pressable style={styles.searchActionBtn}><MaterialCommunityIcons name="microphone" size={18} color="#92adc9" /></Pressable>
              <Pressable style={styles.searchActionBtn}><MaterialCommunityIcons name="camera" size={18} color="#92adc9" /></Pressable>
            </View>
          </View>
        </View>

        {showMenu && (
          <View style={styles.menuOverlay}>
            <Pressable style={styles.menuBackdrop} onPress={() => setShowMenu(false)} />
            <View style={styles.menuContainer}>
              <Text style={styles.menuTitle}>Menu</Text>
              {menuItems.map((item) => (
                <Pressable key={item.label} style={styles.menuItem} onPress={() => handleMenuPress(item)}>
                  <MaterialCommunityIcons name={item.icon} size={22} color="#137fec" />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <Pressable style={[styles.categoryItem, !selectedCategory && styles.categoryItemActive]} onPress={() => setSelectedCategory(null)}>
              <Image source={{ uri: categories[0].image }} style={styles.categoryImage} />
              <Text style={[styles.categoryName, !selectedCategory && styles.categoryNameActive]}>Tout</Text>
            </Pressable>
            {categories.map((cat, index) => (
              <Pressable key={index} style={[styles.categoryItem, selectedCategory === cat.name && styles.categoryItemActive]} onPress={() => setSelectedCategory(cat.name)}>
                <Image source={{ uri: cat.image }} style={styles.categoryImage} />
                <Text style={[styles.categoryName, selectedCategory === cat.name && styles.categoryNameActive]}>{cat.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {selectedCategory && (
          <View style={styles.selectedCategoryBanner}>
            <Text style={styles.selectedCategoryText}>Categorie: {selectedCategory}</Text>
            <Pressable onPress={() => setSelectedCategory(null)}><MaterialCommunityIcons name="close-circle" size={20} color="#fff" /></Pressable>
          </View>
        )}

        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable style={[styles.filterChip, activeFilter === 'Tout' && styles.filterChipActive]} onPress={() => setActiveFilter('Tout')}>
              <Text style={[styles.filterChipText, activeFilter === 'Tout' && styles.filterChipTextActive]}>Tout</Text>
            </Pressable>
            <Pressable style={[styles.filterChip, activeFilter === 'Mieux notes' && styles.filterChipActive]} onPress={() => setActiveFilter('Mieux notes')}>
              <MaterialCommunityIcons name="star" size={16} color={activeFilter === 'Mieux notes' ? '#fff' : '#FBBF24'} />
              <Text style={[styles.filterChipText, activeFilter === 'Mieux notes' && styles.filterChipTextActive]}>Mieux notés</Text>
            </Pressable>
            <Pressable style={[styles.filterChip, activeFilter === 'Plus rapides' && styles.filterChipActive]} onPress={() => setActiveFilter('Plus rapides')}>
              <Text style={[styles.filterChipText, activeFilter === 'Plus rapides' && styles.filterChipTextActive]}>Plus rapides</Text>
            </Pressable>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tous les restaurants {selectedCategory ? `(${selectedCategory})` : ''}</Text>
          <View style={styles.restaurantList}>
            {filteredRestaurants.length === 0 ? (
              <View style={styles.emptySearch}>
                <MaterialCommunityIcons name="magnify" size={48} color="#64748b" />
                <Text style={styles.emptySearchText}>Aucun resultat</Text>
              </View>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <Pressable key={restaurant.id} style={styles.restaurantCard} onPress={() => onNavigate?.('restaurant_details', { restaurant })}>
                  <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
                  <View style={styles.restaurantBadges}>
                    <View style={styles.deliveryBadge}><Text style={styles.deliveryText}>{restaurant.delivery}</Text></View>
                    <Pressable style={styles.favoriteBtn} onPress={() => toggleFavorite(restaurant.id)}>
                      <MaterialCommunityIcons name={isFavorite(restaurant.id) ? 'heart' : 'heart-outline'} size={20} color={isFavorite(restaurant.id) ? '#ef4444' : '#fff'} />
                    </Pressable>
                  </View>
                  {restaurant.discount && <View style={styles.discountBadge}><Text style={styles.discountText}>{restaurant.discount}</Text></View>}
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <Text style={styles.restaurantCategory}>{restaurant.category} - {restaurant.delivery}</Text>
                    <View style={styles.restaurantMeta}>
                      <View style={styles.ratingRow}>
                        <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
                        <Text style={styles.ratingValue}>{restaurant.rating}</Text>
                      </View>
                      <Text style={styles.deliveryFee}>{restaurant.deliveryFee}</Text>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <Pressable key={item.label} style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]} onPress={() => { setActiveTab(item.label); if (item.screen === 'home') onBack?.(); else if (item.screen === 'orders') onNavigate?.('restaurant_orders'); else if (item.screen === 'cart') onNavigate?.('food_checkout'); else if (item.screen === 'profile') onNavigate?.('profile'); }}>
                <View style={[styles.navIcon, isActive && styles.navIconActive]}><MaterialCommunityIcons name={item.icon} size={22} color={isActive ? '#0E151B' : '#CBD5F5'} /></View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  menuBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },
  favoriteHeaderBtn: { marginLeft: 'auto', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 12, marginTop: 16, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#fff' },
  searchActions: { flexDirection: 'row', gap: 4 },
  searchActionBtn: { padding: 8 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  categoriesScroll: { marginTop: 8 },
  categoryItem: { alignItems: 'center', marginRight: 16 },
  categoryImage: { width: 72, height: 72, borderRadius: 16 },
  categoryName: { fontSize: 12, color: '#94a3b8', marginTop: 6 },
  categoryItemActive: { borderWidth: 2, borderColor: '#137fec', borderRadius: 18 },
  categoryNameActive: { color: '#137fec', fontWeight: 'bold' },
  selectedCategoryBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#137fec', marginHorizontal: 16, marginTop: 16, padding: 12, borderRadius: 12 },
  selectedCategoryText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  filtersContainer: { paddingHorizontal: 16, marginTop: 16 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterChipActive: { backgroundColor: '#fff' },
  filterChipText: { color: '#94a3b8', fontSize: 14 },
  filterChipTextActive: { color: '#0E151B', fontWeight: '600' },
  restaurantList: { gap: 16 },
  restaurantCard: { backgroundColor: '#1c2630', borderRadius: 16, overflow: 'hidden' },
  restaurantImage: { width: '100%', height: 160 },
  restaurantBadges: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' },
  deliveryBadge: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  deliveryText: { color: '#fff', fontSize: 12 },
  favoriteBtn: { padding: 4 },
  discountBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#22c55e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  restaurantInfo: { padding: 16 },
  restaurantName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  restaurantCategory: { color: '#64748b', fontSize: 13, marginTop: 4 },
  restaurantMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingValue: { color: '#fff', fontSize: 13, fontWeight: '600' },
  deliveryFee: { color: '#64748b', fontSize: 13, marginLeft: 8 },
  emptySearch: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptySearchText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  bottomSpacer: { height: 100 },
  bottomNavWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 36 },
  bottomNav: { backgroundColor: 'rgba(22, 29, 37, 0.98)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  navItem: { alignItems: 'center', flex: 1 },
  navItemPressed: { transform: [{ scale: 0.96 }] },
  navIcon: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.18)', marginBottom: 6, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#2BEE79' },
  navLabel: { color: '#6B7280', fontSize: 10 },
  navLabelActive: { color: '#2BEE79' },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  menuContainer: { position: 'absolute', top: 100, right: 16, backgroundColor: '#1c2630', borderRadius: 16, padding: 16, width: 220 },
  menuTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
  menuItemText: { flex: 1, color: '#fff', fontSize: 14, marginLeft: 12 },
});