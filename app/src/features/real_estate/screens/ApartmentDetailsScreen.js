import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Image, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const photos = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1563453392212-326f5e3f1bb8?w=800',
];

const amenities = [
  { icon: 'wifi', label: 'WiFi' },
  { icon: 'parking', label: 'Parking' },
  { icon: 'air-conditioner', label: 'Climatisation' },
  { icon: 'pool', label: 'Piscine' },
  { icon: 'security', label: 'Sécurité 24h' },
  { icon: 'elevator', label: 'Ascenseur' },
  { icon: 'washing-machine', label: 'Lave-linge' },
  { icon: 'fridge', label: 'Réfrigérateur' },
];

const reviews = [
  { id: 1, user: 'Aminata K.', rating: 5, date: '10 Jan 2026', comment: 'Très bel appartement, propre et bien équipé. Je recommande vivement !' },
  { id: 2, user: 'Koffi A.', rating: 4, date: '5 Jan 2026', comment: 'Bon rapport qualité-prix. La localisation est parfaite.' },
];

export default function ApartmentDetailsScreen({ onBack, onNavigate, route }) {
  const property = route?.params?.property || { id: 1, name: 'Appartement luxe à Cocody', location: 'Cocody, Abidjan', price: 850000, priceType: 'rent', bedrooms: 3, bathrooms: 2, sqft: 150, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', type: 'Appartement' };
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [favorite, setFavorite] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Pressable style={styles.favBtn} onPress={() => setFavorite(!favorite)}>
            <MaterialCommunityIcons name={favorite ? 'heart' : 'heart-outline'} size={24} color={favorite ? '#ef4444' : '#fff'} />
          </Pressable>
        </View>

        <View style={styles.photoGallery}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {photos.map((photo, i) => (
              <Image key={i} source={{ uri: photo }} style={styles.photoItem} />
            ))}
          </ScrollView>
          <View style={styles.photoDots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentPhoto && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {property.priceType === 'rent' ? `${property.price.toLocaleString()} FCFA/mois` : `${property.price.toLocaleString()} FCFA`}
            </Text>
            <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>{property.type}</Text></View>
          </View>

          <Text style={styles.title}>{property.name}</Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#64748b" />
            <Text style={styles.location}>{property.location}</Text>
          </View>

          <View style={styles.featuresRow}>
            <View style={styles.featureItem}><MaterialCommunityIcons name="bed" size={22} color="#137fec" /><Text style={styles.featureValue}>{property.bedrooms}</Text><Text style={styles.featureLabel}>Chambres</Text></View>
            <View style={styles.featureItem}><MaterialCommunityIcons name="shower" size={22} color="#137fec" /><Text style={styles.featureValue}>{property.bathrooms}</Text><Text style={styles.featureLabel}>SdB</Text></View>
            <View style={styles.featureItem}><MaterialCommunityIcons name="vector-square" size={22} color="#137fec" /><Text style={styles.featureValue}>{property.sqft}</Text><Text style={styles.featureLabel}>m²</Text></View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>Cet appartement lumineux et moderne offre un cadre de vie exceptionnel. Entièrement meublé avec des finitions de qualité, il dispose d'une cuisine équipée, d'un salon spacieux et de chambres climatisées.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Équipements</Text>
            <View style={styles.amenitiesGrid}>
              {amenities.map((a, i) => (
                <View key={i} style={styles.amenityCard}>
                  <MaterialCommunityIcons name={a.icon} size={24} color="#2BEE79" />
                  <Text style={styles.amenityLabel}>{a.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avis ({reviews.length})</Text>
            {reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}><Text style={styles.reviewInitial}>{r.user[0]}</Text></View>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewUser}>{r.user}</Text>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => <MaterialCommunityIcons key={i} name={i < r.rating ? 'star' : 'star-outline'} size={12} color="#FBBF24" />)}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{r.date}</Text>
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
              </View>
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.bottomCTA}>
        <Pressable style={styles.contactBtn} onPress={() => onNavigate?.('apartment_booking', { property })}>
          <MaterialCommunityIcons name="phone" size={20} color="#137fec" />
          <Text style={styles.contactBtnText}>Contacter</Text>
        </Pressable>
        <Pressable style={styles.rentBtn} onPress={() => onNavigate?.('apartment_booking', { property })}>
          <MaterialCommunityIcons name="calendar-check" size={20} color="#fff" />
          <Text style={styles.rentBtnText}>
            {property.priceType === 'rent' ? 'Louer maintenant' : 'Réserver une visite'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { position: 'absolute', top: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, zIndex: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  favBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  photoGallery: { height: 280 },
  photoItem: { width: 400, height: 280 },
  photoDots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff' },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 24, fontWeight: 'bold', color: '#137fec' },
  typeBadge: { backgroundColor: 'rgba(19,127,236,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { color: '#137fec', fontSize: 13, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  location: { fontSize: 14, color: '#64748b' },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, backgroundColor: '#1c2630', borderRadius: 12, padding: 16 },
  featureItem: { alignItems: 'center' },
  featureValue: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  featureLabel: { fontSize: 12, color: '#64748b' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  description: { fontSize: 14, color: '#94a3b8', lineHeight: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityCard: { width: '47%', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  amenityLabel: { fontSize: 13, color: '#fff' },
  reviewCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#137fec', alignItems: 'center', justifyContent: 'center' },
  reviewInitial: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  reviewMeta: { flex: 1, marginLeft: 10 },
  reviewUser: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  reviewRating: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewDate: { fontSize: 12, color: '#64748b' },
  reviewComment: { fontSize: 14, color: '#94a3b8', lineHeight: 20 },
  bottomSpacer: { height: 100 },
  bottomCTA: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12, backgroundColor: '#101922' },
  contactBtn: { flex: 1, backgroundColor: '#1c2630', borderRadius: 12, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  contactBtnText: { color: '#137fec', fontSize: 16, fontWeight: 'bold' },
  rentBtn: { flex: 2, backgroundColor: '#137fec', borderRadius: 12, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  rentBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});