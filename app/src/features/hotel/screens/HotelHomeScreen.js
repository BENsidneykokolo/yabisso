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

const featuredHotels = [
  {
    id: 1,
    name: 'Eko Hotels & Suites',
    location: 'Victoria Island, Lagos',
    rating: 4.8,
    price: 45000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    amenities: ['Pool', 'Spa', 'Restaurant', 'Gym'],
  },
  {
    id: 2,
    name: 'Transcorp Hilton',
    location: 'Abuja, Nigeria',
    rating: 4.6,
    price: 38000,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    amenities: ['Pool', 'Restaurant', 'WiFi', 'Parking'],
  },
];

const popularDestinations = [
  { id: 1, name: 'Lagos', image: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=400' },
  { id: 2, name: 'Abuja', image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=400' },
  { id: 3, name: 'Port Harcourt', image: 'https://images.unsplash.com/photo-1580261451114-7d3509d46e82?w=400' },
  { id: 4, name: 'Ibadan', image: 'https://images.unsplash.com/photo-1596204082981-b9d1d7043639?w=400' },
];

export default function HotelHomeScreen({ onBack, onNavigate }) {
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Find your perfect stay</Text>
            <Text style={styles.subtitle}>Book hotels across Africa</Text>
          </View>
          <Pressable style={styles.notificationBtn}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <MaterialCommunityIcons name="magnify" size={20} color="#92adc9" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hotels, cities..."
              placeholderTextColor="#92adc9"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <Pressable style={styles.filterBtn}>
            <MaterialCommunityIcons name="tune-variant" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Popular Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularDestinations.map((dest) => (
              <Pressable key={dest.id} style={styles.destinationCard}>
                <Image source={{ uri: dest.image }} style={styles.destinationImage} />
                <View style={styles.destinationOverlay}>
                  <Text style={styles.destinationName}>{dest.name}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured Hotels */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Hotels</Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>
          {featuredHotels.map((hotel) => (
            <Pressable 
              key={hotel.id} 
              style={styles.hotelCard}
              onPress={() => onNavigate?.('hotel_rooms', { hotel })}
            >
              <Image source={{ uri: hotel.image }} style={styles.hotelImage} />
              <View style={styles.hotelOverlay} />
              <View style={styles.hotelBadges}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <MaterialCommunityIcons name="star" size={12} color="#FBBF24" />
                  <Text style={styles.ratingText}>{hotel.rating}</Text>
                </View>
              </View>
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{hotel.name}</Text>
                <View style={styles.hotelLocation}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#94a3b8" />
                  <Text style={styles.locationText}>{hotel.location}</Text>
                </View>
                <View style={styles.hotelAmenities}>
                  {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                    <View key={idx} style={styles.amenityChip}>
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.hotelPriceRow}>
                  <Text style={styles.hotelPrice}>₦{hotel.price.toLocaleString()}</Text>
                  <Text style={styles.pricePerNight}>/night</Text>
                  <Pressable style={styles.bookBtn}>
                    <Text style={styles.bookBtnText}>Book Now</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Quick Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Type</Text>
          <View style={styles.typeGrid}>
            {[
              { name: 'Hotels', icon: 'domain', count: '2,400+' },
              { name: 'Apartments', icon: 'office-building', count: '1,200+' },
              { name: 'Resorts', icon: 'palm-tree', count: '350+' },
              { name: 'Villas', icon: 'home-variant', count: '180+' },
            ].map((type, idx) => (
              <Pressable key={idx} style={styles.typeCard}>
                <View style={styles.typeIcon}>
                  <MaterialCommunityIcons name={type.icon} size={28} color="#137fec" />
                </View>
                <Text style={styles.typeName}>{type.name}</Text>
                <Text style={styles.typeCount}>{type.count}</Text>
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
                }
              }}
            >
              <View style={[styles.navIconContainer, item.label === 'Home' && styles.navIconActive]}>
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
  { label: 'My Bookings', icon: 'calendar-check' },
  { label: 'Favorites', icon: 'heart' },
  { label: 'Profile', icon: 'account' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1c2630',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#fff',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
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
  destinationCard: {
    width: 120,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  destinationName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  hotelCard: {
    backgroundColor: '#1c2630',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  hotelImage: {
    width: '100%',
    height: 180,
  },
  hotelOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  hotelBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredBadge: {
    backgroundColor: '#137fec',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingText: {
    color: '#FBBF24',
    fontWeight: 'bold',
    fontSize: 12,
  },
  hotelInfo: {
    padding: 16,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  hotelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  hotelAmenities: {
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
    fontSize: 12,
  },
  hotelPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  hotelPrice: {
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
    marginLeft: 'auto',
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '47%',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  typeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  typeCount: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
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
  navIconActive: {
    backgroundColor: '#137fec',
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
