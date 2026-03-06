import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const favorites = [
  {
    id: 1,
    name: 'iPhone 14 Pro Max',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    seller: 'Apple Store',
  },
  {
    id: 2,
    name: 'Nike Air Jordan',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400',
    seller: 'Nike Official',
  },
  {
    id: 3,
    name: 'Samsung Galaxy S24',
    price: 650000,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
    seller: 'Samsung',
  },
];

export default function MarketplaceFavoritesScreen({ onBack, onNavigate }) {
  const formatPrice = (price) => {
    return price.toLocaleString('fr-FR') + ' XAF';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Favoris</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="heart-outline" size={64} color="#324d67" />
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptySubtitle}>Ajoutez des produits à vos favoris</Text>
          </View>
        ) : (
          <View style={styles.favoritesList}>
            {favorites.map((item) => (
              <Pressable key={item.id} style={styles.favoriteCard}>
                <View style={styles.productImage}>
                  <MaterialCommunityIcons name="image" size={32} color="#324d67" />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productSeller}>{item.seller}</Text>
                  <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                </View>
                <Pressable style={styles.removeBtn}>
                  <MaterialCommunityIcons name="heart" size={20} color="#ef4444" />
                </Pressable>
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
    backgroundColor: '#1c2630',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  favoritesList: {
    gap: 12,
  },
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: '#1c2630',
    borderRadius: 16,
    padding: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#233648',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 20,
  },
  productSeller: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#137fec',
    marginTop: 8,
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});
