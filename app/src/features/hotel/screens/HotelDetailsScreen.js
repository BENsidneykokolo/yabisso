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
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const hotelData = {
  id: 1,
  name: 'Eko Hotels & Suites',
  location: 'Victoria Island, Lagos',
  rating: 4.8,
  reviewCount: 2340,
  price: 45000,
  image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  images: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  ],
  description: 'Eko Hotels & Suites is a premier luxury hotel located in the heart of Victoria Island, Lagos. Offering world-class amenities, spacious rooms, and exceptional service.',
  amenities: ['Pool', 'Spa', 'Restaurant', 'Gym', 'WiFi', 'Parking', 'Room Service', 'Bar', 'Concierge', 'Airport Shuttle'],
  address: 'Plot 1415 Adetokunbo Ademola Street, Victoria Island, Lagos',
  phone: '+234 1 277 2700',
  email: 'reservations@ekohotels.com',
};

const rooms = [
  {
    id: 1,
    name: 'Superior Room',
    type: 'King Bed',
    maxGuests: 2,
    size: '35m²',
    price: 45000,
    available: 5,
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
    amenities: ['WiFi', 'TV', 'Mini Bar', 'Safe', 'AC', 'Balcony'],
    cancellation: 'Free cancellation until 24h before check-in',
  },
  {
    id: 2,
    name: 'Deluxe Room',
    type: 'Queen Bed',
    maxGuests: 2,
    size: '42m²',
    price: 55000,
    available: 3,
    images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
    amenities: ['WiFi', 'TV', 'Mini Bar', 'Safe', 'AC', 'Balcony', 'Bathtub'],
    cancellation: 'Free cancellation until 24h before check-in',
  },
  {
    id: 3,
    name: 'Executive Suite',
    type: 'King Bed + Living Area',
    maxGuests: 3,
    size: '65m²',
    price: 85000,
    available: 2,
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
    amenities: ['WiFi', 'TV', 'Mini Bar', 'Safe', 'AC', 'Balcony', 'Bathtub', 'Living Room', 'Kitchen'],
    cancellation: 'Free cancellation until 48h before check-in',
  },
  {
    id: 4,
    name: 'Presidential Suite',
    type: 'King Bed + Living + Dining',
    maxGuests: 4,
    size: '120m²',
    price: 150000,
    available: 1,
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    amenities: ['WiFi', 'TV', 'Mini Bar', 'Safe', 'AC', 'Balcony', 'Bathtub', 'Living Room', 'Kitchen', 'Butler Service', 'Private Pool'],
    cancellation: 'Free cancellation until 72h before check-in',
  },
];

export default function HotelDetailsScreen({ onBack, onNavigate, route }) {
  const [selectedTab, setSelectedTab] = useState('rooms');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const hotel = hotelData;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          <Image source={{ uri: hotel.images[selectedImageIndex] }} style={styles.mainImage} />
          <View style={styles.imageOverlay} />
          
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Pressable style={styles.iconBtn} onPress={onBack}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </Pressable>
            <View style={styles.topBarRight}>
              <Pressable style={styles.iconBtn}>
                <MaterialCommunityIcons name="heart-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable style={styles.iconBtn}>
                <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Image Thumbnails */}
          <View style={styles.thumbnails}>
            {hotel.images.map((img, idx) => (
              <Pressable
                key={idx}
                onPress={() => setSelectedImageIndex(idx)}
              >
                <Image
                  source={{ uri: img }}
                  style={[
                    styles.thumbnail,
                    idx === selectedImageIndex && styles.thumbnailActive,
                  ]}
                />
              </Pressable>
            ))}
            <Pressable
              style={styles.viewAllBtn}
              onPress={() => setShowImageGallery(true)}
            >
              <Text style={styles.viewAllText}>+12</Text>
            </Pressable>
          </View>
        </View>

        {/* Hotel Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>{hotel.rating}</Text>
            </View>
          </View>
          
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#64748b" />
            <Text style={styles.locationText}>{hotel.location}</Text>
            <Text style={styles.reviewCount}> • {hotel.reviewCount} reviews</Text>
          </View>

          {/* Quick Amenities */}
          <View style={styles.quickAmenities}>
            {hotel.amenities.slice(0, 6).map((amenity, idx) => (
              <View key={idx} style={styles.quickAmenityItem}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#22c55e" />
                <Text style={styles.quickAmenityText}>{amenity}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.description}>{hotel.description}</Text>

          {/* Contact Info */}
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Contact</Text>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="phone" size={18} color="#137fec" />
              <Text style={styles.contactText}>{hotel.phone}</Text>
            </View>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="email" size={18} color="#137fec" />
              <Text style={styles.contactText}>{hotel.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="map-marker" size={18} color="#137fec" />
              <Text style={styles.contactText}>{hotel.address}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsSection}>
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, selectedTab === 'rooms' && styles.tabActive]}
              onPress={() => setSelectedTab('rooms')}
            >
              <Text style={[styles.tabText, selectedTab === 'rooms' && styles.tabTextActive]}>
                Rooms
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, selectedTab === 'amenities' && styles.tabActive]}
              onPress={() => setSelectedTab('amenities')}
            >
              <Text style={[styles.tabText, selectedTab === 'amenities' && styles.tabTextActive]}>
                Amenities
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, selectedTab === 'reviews' && styles.tabActive]}
              onPress={() => setSelectedTab('reviews')}
            >
              <Text style={[styles.tabText, selectedTab === 'reviews' && styles.tabTextActive]}>
                Reviews
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Rooms List */}
        <View style={styles.roomsSection}>
          {rooms.map((room) => (
            <Pressable
              key={room.id}
              style={styles.roomCard}
              onPress={() => onNavigate?.('hotel_room_details', { room, hotel })}
            >
              <Image source={{ uri: room.images[0] }} style={styles.roomImage} />
              <View style={styles.roomInfo}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <View style={styles.roomBadge}>
                    <Text style={styles.roomBadgeText}>{room.type}</Text>
                  </View>
                </View>
                
                <View style={styles.roomMeta}>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="account-multiple" size={14} color="#64748b" />
                    <Text style={styles.metaText}>Up to {room.maxGuests}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="resize" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{room.size}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="door" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{room.available} left</Text>
                  </View>
                </View>

                <View style={styles.roomAmenities}>
                  {room.amenities.slice(0, 4).map((amenity, idx) => (
                    <Text key={idx} style={styles.roomAmenity}>• {amenity}</Text>
                  ))}
                </View>

                <View style={styles.roomFooter}>
                  <View>
                    <Text style={styles.roomPrice}>₦{room.price.toLocaleString()}</Text>
                    <Text style={styles.roomPricePerNight}>/night</Text>
                  </View>
                  <Pressable
                    style={styles.selectRoomBtn}
                    onPress={() => onNavigate?.('hotel_booking', { room, hotel })}
                  >
                    <Text style={styles.selectRoomText}>Select</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Price Bar */}
      <View style={styles.bottomBar}>
        <View>
                  <Text style={styles.fromLabel}>À partir de</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.bottomPrice}>₦{hotel.price.toLocaleString()}</Text>
            <Text style={styles.bottomPricePerNight}>/night</Text>
          </View>
        </View>
        <Pressable
          style={styles.bookBtn}
          onPress={() => onNavigate?.('hotel_booking', { room: rooms[0], hotel })}
        >
          <Text style={styles.bookBtnText}>Réserver</Text>
        </Pressable>
      </View>

      {/* Image Gallery Modal */}
      <Modal visible={showImageGallery} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Photos</Text>
              <Pressable onPress={() => setShowImageGallery(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
            </View>
            <ScrollView>
              <View style={styles.galleryGrid}>
                {hotel.images.map((img, idx) => (
                  <Image key={idx} source={{ uri: img }} style={styles.galleryImage} />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  imageSection: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 280,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbnails: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.7,
  },
  thumbnailActive: {
    borderColor: '#fff',
    opacity: 1,
  },
  viewAllBtn: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    color: '#64748b',
    fontSize: 14,
    marginLeft: 4,
  },
  reviewCount: {
    color: '#64748b',
    fontSize: 14,
  },
  quickAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  quickAmenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickAmenityText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  description: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
  },
  contactCard: {
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  contactTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  contactText: {
    color: '#94a3b8',
    fontSize: 14,
    flex: 1,
  },
  tabsSection: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1c2630',
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#137fec',
  },
  tabText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#137fec',
  },
  roomsSection: {
    padding: 16,
  },
  roomCard: {
    backgroundColor: '#1c2630',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  roomImage: {
    width: '100%',
    height: 140,
  },
  roomInfo: {
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  roomBadge: {
    backgroundColor: '#233648',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roomBadgeText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  roomMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#64748b',
    fontSize: 13,
  },
  roomAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  roomAmenity: {
    color: '#64748b',
    fontSize: 12,
    marginRight: 8,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  roomPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#137fec',
  },
  roomPricePerNight: {
    fontSize: 14,
    color: '#64748b',
  },
  selectRoomBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectRoomText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1c2630',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  fromLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomPricePerNight: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  bookBtn: {
    backgroundColor: '#137fec',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#101922',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1c2630',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  galleryImage: {
    width: '48%',
    height: 150,
    borderRadius: 12,
    margin: '1%',
  },
});
