import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const roomData = {
  id: 1,
  name: 'Superior Room',
  type: 'King Bed',
  price: 45000,
  image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
};

const hotelData = {
  id: 1,
  name: 'Eko Hotels & Suites',
  location: 'Victoria Island, Lagos',
  address: 'Plot 1415 Adetokunbo Ademola Street, Victoria Island, Lagos',
  phone: '+234 1 277 2700',
  email: 'reservations@ekohotels.com',
};

const bookingData = {
  checkIn: '2026-04-01',
  checkOut: '2026-04-02',
  nights: 1,
  guests: 1,
  guestName: 'John Doe',
  guestEmail: 'john.doe@example.com',
  guestPhone: '+237 000 000 000',
  bookingId: 'YAB-HOTEL-8829',
  paymentMethod: 'Yabisso Wallet',
  total: 49500,
  status: 'confirmed',
};

export default function HotelReservationScreen({ onBack, onNavigate, route }) {
  const handleCallHotel = () => {
    Linking.openURL(`tel:${hotelData.phone}`);
  };

  const handleEmailHotel = () => {
    Linking.openURL(`mailto:${hotelData.email}`);
  };

  const handleDirections = () => {
    const address = encodeURIComponent(hotelData.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successSection}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check" size={40} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Réservation confirmée !</Text>
          <Text style={styles.successSubtitle}>Your reservation has been successfully processed</Text>
        </View>

        {/* Booking ID */}
        <View style={styles.bookingIdSection}>
          <Text style={styles.bookingIdLabel}>Référence de réservation</Text>
          <View style={styles.bookingIdCard}>
            <Text style={styles.bookingId}>{bookingData.bookingId}</Text>
            <Pressable>
              <MaterialCommunityIcons name="content-copy" size={18} color="#137fec" />
            </Pressable>
          </View>
        </View>

        {/* Hotel & Room Info */}
        <View style={styles.hotelCard}>
          <Image source={{ uri: roomData.image }} style={hotelImage = { width: '100%', height: 140, borderRadius: 12 }} />
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{hotelData.name}</Text>
            <View style={styles.hotelLocation}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#64748b" />
              <Text style={styles.locationText}>{hotelData.location}</Text>
            </View>
            <Text style={styles.roomType}>{roomData.name} • {roomData.type}</Text>
          </View>
        </View>

        {/* Stay Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Détails du séjour</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="calendar" size={18} color="#137fec" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>{bookingData.checkIn} from 14:00</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="calendar-check" size={18} color="#22c55e" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Check-out</Text>
              <Text style={styles.detailValue}>{bookingData.checkOut} until 12:00</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="weather-night" size={18} color="#eab308" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{bookingData.nights} night, {bookingData.guests} guest</Text>
            </View>
          </View>
        </View>

        {/* Guest Info */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Informations client</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="account" size={18} color="#137fec" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{bookingData.guestName}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="email" size={18} color="#137fec" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{bookingData.guestEmail}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="phone" size={18} color="#137fec" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{bookingData.guestPhone}</Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Paiement</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="credit-card" size={18} color="#22c55e" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Mode de paiement</Text>
              <Text style={styles.detailValue}>{bookingData.paymentMethod}</Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total payé</Text>
            <Text style={styles.totalValue}>₦{bookingData.total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.actionsTitle}>Actions</Text>
          
          <Pressable style={styles.actionBtn} onPress={handleDirections}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(19, 127, 236, 0.15)' }]}>
              <MaterialCommunityIcons name="directions" size={22} color="#137fec" />
            </View>
              <Text style={styles.actionText}>Itinéraire</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={handleCallHotel}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <MaterialCommunityIcons name="phone" size={22} color="#22c55e" />
            </View>
              <Text style={styles.actionText}>Appeler l'hôtel</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={handleEmailHotel}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
              <MaterialCommunityIcons name="email" size={22} color="#eab308" />
            </View>
              <Text style={styles.actionText}>Envoyer un email</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
          </Pressable>

          <Pressable style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <MaterialCommunityIcons name="file-document" size={22} color="#ef4444" />
            </View>
              <Text style={styles.actionText}>Télécharger la facture</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
          </Pressable>
        </View>

        {/* Important Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information" size={20} color="#137fec" />
            <Text style={styles.infoTitle}>Important Information</Text>
          </View>
          <Text style={styles.infoText}>
            • Please present a valid ID at check-in{'\n'}
            • Check-in time starts at 14:00{'\n'}
            • Late check-out may incur additional charges{'\n'}
            • Cancellation policy: Free until 24h before check-in
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.homeBtn}
          onPress={() => onBack?.()}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </Pressable>
        <Pressable style={styles.bookingBtn}>
          <MaterialCommunityIcons name="calendar-check" size={20} color="#fff" />
          <Text style={styles.bookingBtnText}>Mes réservations</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  successSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  successSubtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
  },
  bookingIdSection: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bookingIdLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  bookingIdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
    marginTop: 8,
  },
  bookingId: {
    color: '#137fec',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  hotelCard: {
    margin: 16,
    backgroundColor: '#1c2630',
    borderRadius: 16,
    overflow: 'hidden',
  },
  hotelImage: {
    width: '100%',
    height: 140,
  },
  hotelInfo: {
    padding: 16,
  },
  hotelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hotelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    color: '#64748b',
    fontSize: 13,
  },
  roomType: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
  },
  detailsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1c2630',
    borderRadius: 16,
    padding: 16,
  },
  detailsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#233648',
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#233648',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#22c55e',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  infoSection: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(19, 127, 236, 0.2)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    color: '#137fec',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 22,
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
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  homeBtn: {
    flex: 1,
    backgroundColor: '#233648',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  bookingBtn: {
    flex: 1,
    backgroundColor: '#137fec',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  bookingBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
