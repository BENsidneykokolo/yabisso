import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const roomData = {
  id: 1,
  name: 'Superior Room',
  type: 'King Bed',
  maxGuests: 2,
  size: '35m²',
  price: 45000,
  available: 5,
  images: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
  ],
  amenities: ['WiFi', 'TV', 'Mini Bar', 'Safe', 'AC', 'Balcony', 'Coffee Maker', 'Hairdryer', 'Iron', 'Room Service'],
  cancellation: 'Free cancellation until 24h before check-in',
  description: 'Our Superior Rooms offer a comfortable stay with modern amenities and a private balcony overlooking the city. Perfect for business travelers or couples seeking a romantic getaway.',
  bedConfig: '1 King Bed',
  smoking: 'Non-Smoking',
  view: 'City View',
};

const hotelData = {
  name: 'Eko Hotels & Suites',
  location: 'Victoria Island, Lagos',
  rating: 4.8,
};

export default function HotelRoomDetailsScreen({ onBack, onNavigate, route }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const room = roomData;
  const hotel = hotelData;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          <Image source={{ uri: room.images[selectedImageIndex] }} style={styles.mainImage} />
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

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {selectedImageIndex + 1}/{room.images.length}
            </Text>
          </View>

          {/* View All Button */}
          <Pressable
            style={styles.viewAllBtn}
            onPress={() => setShowImageGallery(true)}
          >
            <MaterialCommunityIcons name="image-multiple" size={16} color="#fff" />
            <Text style={styles.viewAllBtnText}>View All Photos</Text>
          </Pressable>
        </View>

        {/* Room Info */}
        <View style={styles.infoSection}>
          {/* Room Name & Badge */}
          <View style={styles.nameRow}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={styles.roomBadge}>
              <Text style={styles.roomBadgeText}>{room.type}</Text>
            </View>
          </View>

          {/* Hotel Reference */}
          <Pressable style={styles.hotelRef}>
            <MaterialCommunityIcons name="domain" size={16} color="#137fec" />
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>{hotel.rating}</Text>
            </View>
          </Pressable>

          {/* Room Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="account-multiple" size={20} color="#64748b" />
              <Text style={styles.metaText}>Up to {room.maxGuests} guests</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="resize" size={20} color="#64748b" />
              <Text style={styles.metaText}>{room.size}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="door" size={20} color="#64748b" />
              <Text style={styles.metaText}>{room.available} left</Text>
            </View>
          </View>

          {/* Room Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Room Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bed Configuration</Text>
              <Text style={styles.detailValue}>{room.bedConfig}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Smoking</Text>
              <Text style={styles.detailValue}>{room.smoking}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>View</Text>
              <Text style={styles.detailValue}>{room.view}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About this room</Text>
            <Text style={styles.description}>{room.description}</Text>
          </View>

          {/* Amenities */}
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Room Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {room.amenities.map((amenity, idx) => (
                <View key={idx} style={styles.amenityItem}>
                  <MaterialCommunityIcons name="check-circle" size={18} color="#22c55e" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Cancellation Policy */}
          <View style={styles.cancellationSection}>
            <View style={styles.cancellationHeader}>
              <MaterialCommunityIcons name="shield-check" size={22} color="#22c55e" />
              <Text style={styles.cancellationTitle}>Free Cancellation</Text>
            </View>
            <Text style={styles.cancellationText}>{room.cancellation}</Text>
          </View>

          {/* Price Breakdown */}
          <View style={styles.priceBreakdown}>
            <Text style={styles.sectionTitle}>Price Breakdown</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>₦{room.price.toLocaleString()} x 1 night</Text>
              <Text style={styles.priceValue}>₦{room.price.toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Taxes & Fees</Text>
              <Text style={styles.priceValue}>₦{Math.round(room.price * 0.1).toLocaleString()}</Text>
            </View>
            <View style={[styles.priceRow, styles.priceTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ₦{(room.price + Math.round(room.price * 0.1)).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Price Bar */}
      <View style={styles.bottomBar}>
        <View>
          <View style={styles.priceContainer}>
            <Text style={styles.bottomPrice}>₦{room.price.toLocaleString()}</Text>
            <Text style={styles.bottomPricePerNight}>/night</Text>
          </View>
          <Text style={styles.taxesNote}>+ ₦{Math.round(room.price * 0.1).toLocaleString()} taxes & fees</Text>
        </View>
        <Pressable
          style={styles.bookBtn}
          onPress={() => onNavigate?.('hotel_booking', { room, hotel })}
        >
          <Text style={styles.bookBtnText}>Réserver cette chambre</Text>
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
                {room.images.map((img, idx) => (
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
    height: 300,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
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
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  viewAllBtn: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  viewAllBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  infoSection: {
    padding: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  roomBadge: {
    backgroundColor: '#233648',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roomBadgeText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  hotelRef: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  hotelName: {
    color: '#137fec',
    fontSize: 14,
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1c2630',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  detailsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionSection: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
  },
  amenitiesSection: {
    marginTop: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  amenityText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  cancellationSection: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  cancellationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cancellationTitle: {
    color: '#22c55e',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cancellationText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  priceBreakdown: {
    marginTop: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  priceLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  priceValue: {
    color: '#fff',
    fontSize: 14,
  },
  priceTotal: {
    borderTopWidth: 1,
    borderTopColor: '#1c2630',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#137fec',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 140,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomPricePerNight: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  taxesNote: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  bookBtn: {
    backgroundColor: '#137fec',
    paddingHorizontal: 24,
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
    height: 180,
    borderRadius: 12,
    margin: '1%',
  },
});
