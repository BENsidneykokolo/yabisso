import React from 'react';
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
import { useRestaurantFavorites } from '../context/RestaurantFavoritesContext';

const mockRestaurants = [
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
    deliveryFee: '500',
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

export default function RestaurantFavoritesScreen({ onBack, onNavigate }) {
  const { favorites, removeFavorite, isFavorite } = useRestaurantFavorites();

  // Get full restaurant data from mock
  const favoriteRestaurants = mockRestaurants.filter(r => favorites.includes(r.id));

  const handleToggleFavorite = (restaurantId) => {
    if (isFavorite(restaurantId)) {
      removeFavorite(restaurantId);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mes Favoris</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {favoriteRestaurants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="heart-off" size={64} color="#64748b" />
            <Text style={styles.emptyText}>Aucun restaurant favori</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez des restaurants à vos favoris pour les retrouver facilement
            </Text>
          </View>
        ) : (
          <View style={styles.restaurantList}>
            {favoriteRestaurants.map((restaurant) => (
              <Pressable 
                key={restaurant.id} 
                style={styles.restaurantCard}
                onPress={() => onNavigate?.('restaurant_details', { restaurant })}
              >
                <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
                <View style={styles.restaurantInfo}>
                  <View style={styles.restaurantHeader}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <Pressable 
                      style={styles.favoriteBtn}
                      onPress={() => handleToggleFavorite(restaurant.id)}
                    >
                      <MaterialCommunityIcons name="heart" size={22} color="#ef4444" />
                    </Pressable>
                  </View>
                  <Text style={styles.restaurantCategory}>{restaurant.category}</Text>
                  <View style={styles.restaurantMeta}>
                    <View style={styles.ratingContainer}>
                      <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
                      <Text style={styles.ratingText}>{restaurant.rating}</Text>
                    </View>
                    <Text style={styles.deliveryText}>• {restaurant.delivery}</Text>
                  </View>
                  {restaurant.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{restaurant.discount}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.bottomSpacer} />
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
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
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
    height: 140,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  favoriteBtn: {
    padding: 4,
  },
  restaurantCategory: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  deliveryText: {
    color: '#64748b',
    fontSize: 13,
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 100,
  },
});