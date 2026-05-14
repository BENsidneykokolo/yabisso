import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable, StyleSheet, SafeAreaView, Image, FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockService = {
  id: 1,
  name: 'Nettoyage',
  icon: 'broom',
  description: 'Services de nettoyage professionnel pour particuliers et entreprises.',
  providers: 120,
  rating: 4.7,
  priceRange: '3 000 - 25 000 FCFA',
};

const mockProviders = [
  { id: 1, name: 'CleanPro Services', rating: 4.9, jobs: 450, reviews: 320, price: 'À partir de 5 000 FCFA', image: null, verified: true, badge: 'Top Rated' },
  { id: 2, name: 'EcoClean Pro', rating: 4.8, jobs: 280, reviews: 195, price: 'À partir de 4 500 FCFA', image: null, verified: true, badge: 'ÉcoResponsable' },
  { id: 3, name: 'Sparkle Clean', rating: 4.7, jobs: 190, reviews: 140, price: 'À partir de 3 500 FCFA', image: null, verified: false, badge: null },
];

const mockPhotos = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
  'https://images.unsplash.com/photo-1563453392212-326f5e3f1bb8?w=400',
  'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400',
];

const mockReviews = [
  { id: 1, user: 'Aminata D.', rating: 5, date: '12 Jan 2026', comment: 'Service impeccable ! L\'équipe était ponctuelle et professionnelle.' },
  { id: 2, user: 'Koffi M.', rating: 4, date: '8 Jan 2026', comment: 'Très satisfait du nettoyage. Je recommande.' },
  { id: 3, user: 'Fatou S.', rating: 5, date: '3 Jan 2026', comment: 'Excellent travail, mon appartement brille !' },
];

const categories = ['Tous', 'Maison', 'Bureau', 'Vitres', 'Tapisserie', 'Fin de chantier'];

export default function ServiceDetailsScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Accueil');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [favorite, setFavorite] = useState(false);

  const service = mockService;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Pressable style={styles.favoriteBtn} onPress={() => setFavorite(!favorite)}>
            <MaterialCommunityIcons name={favorite ? 'heart' : 'heart-outline'} size={24} color={favorite ? '#ef4444' : '#fff'} />
          </Pressable>
        </View>

        {/* Service Info */}
        <View style={styles.serviceInfo}>
          <View style={styles.serviceIconLarge}>
            <MaterialCommunityIcons name={service.icon} size={40} color="#137fec" />
          </View>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceDesc}>{service.description}</Text>
          <View style={styles.serviceMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="star" size={16} color="#FBBF24" />
              <Text style={styles.metaValue}>{service.rating}</Text>
              <Text style={styles.metaLabel}>/ 5</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="account-group" size={16} color="#2BEE79" />
              <Text style={styles.metaValue}>{service.providers}</Text>
              <Text style={styles.metaLabel}> prestataires</Text>
            </View>
          </View>
          <Text style={styles.priceRange}>{service.priceRange}</Text>
        </View>

        {/* Categories Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          <View style={styles.categoriesRow}>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
            {mockPhotos.map((photo, i) => (
              <Image key={i} source={{ uri: photo }} style={styles.photoCard} />
            ))}
          </ScrollView>
        </View>

        {/* Top Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meilleurs prestataires</Text>
            <Pressable onPress={() => onNavigate?.('services_providers', { service })}>
              <Text style={styles.seeAll}>Tout voir</Text>
            </Pressable>
          </View>
          {mockProviders.map((provider) => (
            <View key={provider.id} style={styles.providerCard}>
              <View style={styles.providerImage}>
                {provider.image ? (
                  <Image source={{ uri: provider.image }} style={{ width: 56, height: 56, borderRadius: 28 }} />
                ) : (
                  <MaterialCommunityIcons name="account" size={32} color="#64748b" />
                )}
                {provider.verified && (
                  <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={12} color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.providerInfo}>
                <View style={styles.providerNameRow}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  {provider.badge && (
                    <View style={styles.providerBadge}>
                      <Text style={styles.providerBadgeText}>{provider.badge}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.providerMeta}>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={13} color="#FBBF24" />
                    <Text style={styles.ratingText}>{provider.rating}</Text>
                    <Text style={styles.reviewsText}>({provider.reviews})</Text>
                  </View>
                  <Text style={styles.jobsText}>{provider.jobs} missions</Text>
                </View>
                <Text style={styles.providerPrice}>{provider.price}</Text>
              </View>
              <Pressable
                style={styles.bookBtn}
                onPress={() => onNavigate?.('service_booking', { provider, service })}
              >
                <Text style={styles.bookBtnText}>Réserver</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Avis clients</Text>
            <Pressable>
              <Text style={styles.seeAll}>Tous les avis</Text>
            </Pressable>
          </View>
          {mockReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewInitial}>{review.user[0]}</Text>
                </View>
                <View style={styles.reviewMeta}>
                  <Text style={styles.reviewUser}>{review.user}</Text>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <MaterialCommunityIcons
                        key={i}
                        name={i < review.rating ? 'star' : 'star-outline'}
                        size={12}
                        color="#FBBF24"
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <Pressable
          style={styles.ctaBtn}
          onPress={() => onNavigate?.('service_booking', { service })}
        >
          <MaterialCommunityIcons name="calendar-check" size={20} color="#fff" />
          <Text style={styles.ctaBtnText}>Réserver maintenant</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 8 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  favoriteBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  serviceInfo: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  serviceIconLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(19, 127, 236, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  serviceName: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  serviceDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
  serviceMeta: { flexDirection: 'row', gap: 24, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaValue: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  metaLabel: { fontSize: 14, color: '#64748b' },
  priceRange: { fontSize: 18, fontWeight: 'bold', color: '#2BEE79', marginTop: 12 },
  categoriesScroll: { paddingHorizontal: 16, marginTop: 16 },
  categoriesRow: { flexDirection: 'row', gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1c2630', borderWidth: 1, borderColor: 'transparent' },
  categoryChipActive: { borderColor: '#137fec', backgroundColor: 'rgba(19, 127, 236, 0.1)' },
  categoryText: { fontSize: 13, color: '#64748b' },
  categoryTextActive: { color: '#137fec', fontWeight: '600' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  seeAll: { fontSize: 14, color: '#137fec', fontWeight: '600' },
  photosScroll: { marginTop: 12 },
  photoCard: { width: 140, height: 100, borderRadius: 12, marginRight: 10 },
  providerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 12, marginBottom: 12 },
  providerImage: { position: 'relative' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#137fec', borderRadius: 10, padding: 2 },
  providerInfo: { flex: 1, marginLeft: 12 },
  providerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  providerName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  providerBadge: { backgroundColor: '#137fec', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  providerBadgeText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  providerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#FBBF24', fontWeight: 'bold', fontSize: 13 },
  reviewsText: { color: '#64748b', fontSize: 12 },
  jobsText: { color: '#64748b', fontSize: 12 },
  providerPrice: { fontSize: 14, fontWeight: 'bold', color: '#2BEE79', marginTop: 4 },
  bookBtn: { backgroundColor: '#137fec', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  reviewCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 12, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#137fec', alignItems: 'center', justifyContent: 'center' },
  reviewInitial: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  reviewMeta: { flex: 1, marginLeft: 10 },
  reviewUser: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  reviewRating: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewDate: { fontSize: 12, color: '#64748b' },
  reviewComment: { fontSize: 14, color: '#94a3b8', lineHeight: 20 },
  bottomSpacer: { height: 100 },
  bottomCTA: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12, backgroundColor: '#101922' },
  ctaBtn: { backgroundColor: '#137fec', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});