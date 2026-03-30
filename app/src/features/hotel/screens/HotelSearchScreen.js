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

const searchResults = [
  {
    id: 1,
    name: 'Eko Hotels & Suites',
    location: 'Victoria Island, Lagos',
    rating: 4.8,
    reviewCount: 2340,
    price: 45000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    amenities: ['Pool', 'Spa', 'Restaurant', 'Gym', 'WiFi'],
    rooms: 120,
  },
  {
    id: 2,
    name: 'Transcorp Hilton',
    location: 'Abuja, Nigeria',
    rating: 4.6,
    reviewCount: 1850,
    price: 38000,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    amenities: ['Pool', 'Restaurant', 'WiFi', 'Parking', 'Gym'],
    rooms: 85,
  },
  {
    id: 3,
    name: 'Lagos Continental Hotel',
    location: 'Victoria Island, Lagos',
    rating: 4.5,
    reviewCount: 920,
    price: 32000,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    amenities: ['Restaurant', 'WiFi', 'Parking', 'Spa'],
    rooms: 65,
  },
  {
    id: 4,
    name: 'Sheraton Lagos Hotel',
    location: ' Ikeja, Lagos',
    rating: 4.4,
    reviewCount: 1560,
    price: 41000,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
    amenities: ['Pool', 'Restaurant', 'WiFi', 'Parking', 'Bar'],
    rooms: 95,
  },
];

export default function HotelSearchScreen({ onBack, onNavigate, route }) {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: '5star', label: '5 Stars' },
    { id: '4star', label: '4 Stars' },
    { id: '3star', label: '3 Stars' },
    { id: 'pool', label: 'Pool' },
    { id: 'wifi', label: 'Free WiFi' },
    { id: 'breakfast', label: 'Breakfast' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Search Hotels</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={22} color="#92adc9" />
            <TextInput
              style={styles.searchInput}
              placeholder="Hotel name, city, or location..."
              placeholderTextColor="#92adc9"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#64748b" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Quick Filters */}
        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <Pressable
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Search Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.resultsCount}>{searchResults.length} hotels found</Text>
          
          {searchResults.map((hotel) => (
            <Pressable
              key={hotel.id}
              style={styles.hotelCard}
              onPress={() => onNavigate?.('hotel_details', { hotel })}
            >
              <Image source={{ uri: hotel.image }} style={styles.hotelImage} />
              <View style={styles.hotelOverlay} />
              
              <View style={styles.hotelBadges}>
                <View style={styles.ratingBadge}>
                  <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
                  <Text style={styles.ratingText}>{hotel.rating}</Text>
                  <Text style={styles.reviewCount}>({hotel.reviewCount})</Text>
                </View>
              </View>

              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{hotel.name}</Text>
                <View style={styles.hotelLocation}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#94a3b8" />
                  <Text style={styles.locationText}>{hotel.location}</Text>
                </View>

                <View style={styles.amenitiesRow}>
                  {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                    <View key={idx} style={styles.amenityChip}>
                      <MaterialCommunityIcons name="check" size={10} color="#22c55e" />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                  {hotel.amenities.length > 4 && (
                    <Text style={styles.moreAmenities}>+{hotel.amenities.length - 4}</Text>
                  )}
                </View>

                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceLabel}>À partir de</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>₦{hotel.price.toLocaleString()}</Text>
                      <Text style={styles.pricePerNight}>/night</Text>
                    </View>
                  </View>
                  <View style={styles.roomsInfo}>
                    <Text style={styles.roomsCount}>{hotel.rooms} rooms</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#137fec" />
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

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
  searchSection: {
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
  },
  filtersSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1c2630',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    borderColor: '#137fec',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#137fec',
  },
  resultsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
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
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  hotelBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#233648',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  amenityText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  moreAmenities: {
    color: '#137fec',
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'center',
  },
  priceRow: {
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
  roomsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomsCount: {
    color: '#137fec',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
});
