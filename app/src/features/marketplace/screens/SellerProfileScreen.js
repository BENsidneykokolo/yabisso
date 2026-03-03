import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const featuredProducts = [
  { id: '1', name: 'Mangues bio', price: '1 500 FCFA', badge: 'FRAIS' },
  { id: '2', name: 'Piments doux', price: '800 FCFA', badge: 'LOCAL' },
  { id: '3', name: 'Tomates cerise', price: '1 200 FCFA', badge: 'PROMO' },
];

const reviews = [
  {
    id: '1',
    name: 'Ama',
    comment: 'Produits frais, livraison rapide. Je recommande.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Kofi',
    comment: 'Belle presentation, un peu de retard sur la livraison.',
    rating: 4,
  },
];

export default function SellerProfileScreen({ onBack, onOpenAddProduct }) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Profil vendeur</Text>
          <Pressable style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={18} color="#E6EDF3" />
          </Pressable>
        </View>

        <View style={styles.coverCard}>
          <View style={styles.coverBadge}>
            <Text style={styles.coverBadgeText}>VERIFIE</Text>
          </View>
          <View style={styles.coverContent}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="storefront" size={28} color="#0E151B" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Marche Yabisso</Text>
              <Text style={styles.profileMeta}>Centre-ville · 2,3 km</Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <Ionicons
                    key={index}
                    name={index <= 4 ? 'star' : 'star-outline'}
                    size={14}
                    color="#FACC15"
                  />
                ))}
                <Text style={styles.ratingText}>4.6 (128 avis)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>86</Text>
            <Text style={styles.statLabel}>Produits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2,4k</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1,1k</Text>
            <Text style={styles.statLabel}>Ventes</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Suivre</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Contacter</Text>
          </Pressable>
          <Pressable style={styles.iconButtonSmall} onPress={onOpenAddProduct}>
            <Ionicons name="add" size={18} color="#0E151B" />
          </Pressable>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Produits en vedette</Text>
          <Text style={styles.sectionLink}>Tout voir</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.featuredRow}>
            {featuredProducts.map((item) => (
              <View key={item.id} style={styles.productCard}>
                <View style={styles.productBadge}>
                  <Text style={styles.productBadgeText}>{item.badge}</Text>
                </View>
                <View style={styles.productImage}>
                  <Ionicons name="image" size={22} color="#2BEE79" />
                </View>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Avis clients</Text>
          <Text style={styles.sectionLink}>Voir tout</Text>
        </View>

        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewInitial}>{review.name.charAt(0)}</Text>
              </View>
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewName}>{review.name}</Text>
                <View style={styles.ratingRowSmall}>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <Ionicons
                      key={index}
                      name={index <= review.rating ? 'star' : 'star-outline'}
                      size={12}
                      color="#FACC15"
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewDate}>Il y a 2j</Text>
            </View>
            <Text style={styles.reviewText}>{review.comment}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  coverCard: {
    marginTop: 20,
    borderRadius: 22,
    padding: 18,
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  coverBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  coverBadgeText: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: '700',
  },
  coverContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  profileMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  ratingText: {
    color: '#CBD5F5',
    fontSize: 11,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 10,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  actionRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1.2,
    backgroundColor: '#2BEE79',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1.2,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 10,
  },
  secondaryButtonText: {
    color: '#E6EDF3',
    fontSize: 13,
    fontWeight: '600',
  },
  iconButtonSmall: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLink: {
    color: '#94A3B8',
    fontSize: 12,
  },
  featuredRow: {
    flexDirection: 'row',
  },
  productCard: {
    width: 160,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 12,
  },
  productBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(250, 204, 21, 0.18)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productBadgeText: {
    color: '#FACC15',
    fontSize: 9,
    fontWeight: '700',
  },
  productImage: {
    marginTop: 16,
    height: 70,
    borderRadius: 16,
    backgroundColor: 'rgba(43, 238, 121, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  productPrice: {
    color: '#2BEE79',
    fontSize: 12,
    marginTop: 6,
  },
  reviewCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reviewInitial: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  ratingRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  reviewDate: {
    color: '#7C8A9A',
    fontSize: 10,
  },
  reviewText: {
    color: '#CBD5F5',
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },
});
