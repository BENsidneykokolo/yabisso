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

const favorites = [
  {
    id: 1,
    name: 'Eko Hotels & Suites',
    location: 'Victoria Island, Lagos',
    rating: 4.8,
    reviewCount: 2340,
    price: 45000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    amenities: ['Pool', 'Spa', 'Restaurant', 'Gym'],
    saved: true,
  },
  {
    id: 2,
    name: 'Transcorp Hilton',
    location: 'Abuja, Nigeria',
    rating: 4.6,
    reviewCount: 1850,
    price: 38000,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    amenities: ['Pool', 'Restaurant', 'WiFi', 'Parking'],
    saved: true,
  },
  {
    id: 3,
    name: 'The Wheatbaker',
    location: 'Ikoyi, Lagos',
    rating: 4.7,
    reviewCount: 890,
    price: 52000,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    amenities: ['Pool', 'Spa', 'Restaurant', 'Gym', 'WiFi'],
    saved: true,
  },
];

export default function HotelFavoritesScreen({ onBack, onNavigate }) {
  const [hotels, setHotels] = useState(favorites);
  const [activeTab, setActiveTab] = useState('Favoris');

  const removeFavorite = (id) => {
    setHotels(hotels.filter(h => h.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Favoris</Text>
          <Text style={styles.count}>{hotels.length}</Text>
        </View>

        {/* Favorites List */}
        <View style={styles.favoritesSection}>
          {hotels.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="heart-outline" size={64} color="#233648" />
              <Text style={styles.emptyTitle}>Aucun favori</Text>
              <Text style={styles.emptyText}>
                Sauvegardez vos hôtels préférés pour les retrouver facilement
              </Text>
              <Pressable 
                style={styles.exploreBtn}
                onPress={() => onNavigate?.('hotel_home')}
              >
                <Text style={styles.exploreText}>Explorer les hôtels</Text>
              </Pressable>
            </View>
          ) : (
            hotels.map((hotel) => (
              <Pressable key={hotel.id} style={styles.hotelCard}>
                <Image source={{ uri: hotel.image }} style={styles.hotelImage} />
                <View style={styles.hotelOverlay} />
                
                {/* Remove Button */}
                <Pressable 
                  style={styles.removeBtn}
                  onPress={() => removeFavorite(hotel.id)}
                >
                  <MaterialCommunityIcons name="heart" size={20} color="#ef4444" />
                </Pressable>

                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                  <MaterialCommunityIcons name="star" size={12} color="#FBBF24" />
                  <Text style={styles.ratingText}>{hotel.rating}</Text>
                  <Text style={styles.reviewCount}>({hotel.reviewCount})</Text>
                </View>

                <View style={styles.hotelInfo}>
                  <Text style={styles.hotelName}>{hotel.name}</Text>
                  <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="map-marker" size={14} color="#94a3b8" />
                    <Text style={styles.locationText}>{hotel.location}</Text>
                  </View>

                  {/* Amenities */}
                  <View style={styles.amenitiesRow}>
                    {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                      <View key={idx} style={styles.amenityChip}>
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <Text style={styles.moreAmenities}>+{hotel.amenities.length - 3}</Text>
                    )}
                  </View>

                  {/* Price & Action */}
                  <View style={styles.footerRow}>
                    <View>
                      <Text style={styles.priceLabel}>À partir de</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>₦{hotel.price.toLocaleString()}</Text>
                        <Text style={styles.pricePerNight}>/night</Text>
                      </View>
                    </View>
                    <Pressable 
                      style={styles.bookBtn}
                      onPress={() => onNavigate?.('hotel_details', { hotel })}
                    >
                      <Text style={styles.bookBtnText}>Réserver</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.navItem,
                  pressed && styles.navItemPressed,
                ]}
                onPress={() => {
                  setActiveTab(item.label);
                  if (item.label === 'Accueil') {
                    onNavigate?.('hotel_home');
                  } else if (item.label === 'Réservations') {
                    onNavigate?.('hotel_bookings');
                  } else if (item.label === 'Favoris') {
                    // Already here
                  } else if (item.label === 'Profil') {
                    onNavigate?.('hotel_profile');
                  }
                }}
              >
                <View
                  style={[
                    styles.navIcon,
                    isActive && styles.navIconActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={isActive ? 20 : 16}
                    color={isActive ? '#0E151B' : '#CBD5F5'}
                  />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const bottomNavItems = [
  { label: 'Accueil', icon: 'home' },
  { label: 'Réservations', icon: 'calendar-check' },
  { label: 'Favoris', icon: 'heart' },
  { label: 'Profil', icon: 'account' },
];

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
  count: {
    fontSize: 14,
    color: '#64748b',
    backgroundColor: '#1c2630',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  favoritesSection: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  exploreBtn: {
    backgroundColor: '#137fec',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
  },
  exploreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  hotelCard: {
    backgroundColor: '#1c2630',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  hotelImage: {
    width: '100%',
    height: 160,
  },
  hotelOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  reviewCount: {
    color: '#94a3b8',
    fontSize: 12,
  },
  hotelInfo: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  amenityChip: {
    backgroundColor: '#233648',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amenityText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  moreAmenities: {
    color: '#137fec',
    fontSize: 12,
    alignSelf: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#137fec',
  },
  pricePerNight: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  bookBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: 'bold',
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
  navItemPressed: {
    transform: [{ scale: 0.96 }],
  },
  navIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    backgroundColor: '#2BEE79',
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
