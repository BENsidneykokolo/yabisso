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

const roomData = {
  id: 1,
  name: 'Superior Room',
  type: 'King Bed',
  maxGuests: 2,
  size: '35m²',
  price: 45000,
  available: 5,
  image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
};

const hotelData = {
  id: 1,
  name: 'Eko Hotels & Suites',
  location: 'Victoria Island, Lagos',
  rating: 4.8,
};

export default function HotelBookingScreen({ onBack, onNavigate, route }) {
  const [nights, setNights] = useState(1);
  const [guests, setGuests] = useState(1);
  const [checkInDate, setCheckInDate] = useState('2026-04-01');
  const [checkOutDate, setCheckOutDate] = useState('2026-04-02');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('wallet');

  const totalPrice = roomData.price * nights;
  const taxes = Math.round(totalPrice * 0.1);
  const total = totalPrice + taxes;

  const paymentMethods = [
    { id: 'wallet', label: 'Yabisso Wallet', icon: 'wallet' },
    { id: 'card', label: 'Credit/Debit Card', icon: 'credit-card' },
    { id: 'bank', label: 'Bank Transfer', icon: 'bank' },
    { id: 'cash', label: 'Pay at Hotel', icon: 'cash' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Réserver votre séjour</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Room Summary */}
        <View style={styles.roomSummary}>
          <Image source={{ uri: roomData.image }} style={summaryImage = { width: 80, height: 80, borderRadius: 12 }} />
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryName}>{roomData.name}</Text>
            <Text style={styles.summaryHotel}>{hotelData.name}</Text>
            <View style={styles.summaryMeta}>
              <Text style={styles.summaryMetaText}>{roomData.type}</Text>
              <Text style={styles.summaryDot}>•</Text>
              <Text style={styles.summaryMetaText}>{roomData.size}</Text>
            </View>
          </View>
        </View>

        {/* Booking Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du séjour</Text>
          
          <View style={styles.dateRow}>
            <Pressable style={styles.dateCard}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <View style={styles.dateValue}>
                <MaterialCommunityIcons name="calendar" size={18} color="#137fec" />
                <Text style={styles.dateText}>{checkInDate}</Text>
              </View>
              <Text style={styles.dateNote}>From 14:00</Text>
            </Pressable>
            
            <View style={styles.nightsContainer}>
              <Pressable style={styles.nightsBtn} onPress={() => setNights(Math.max(1, nights - 1))}>
                <MaterialCommunityIcons name="minus" size={20} color="#fff" />
              </Pressable>
              <Text style={styles.nightsText}>{nights} night{nights > 1 ? 's' : ''}</Text>
              <Pressable style={styles.nightsBtn} onPress={() => setNights(nights + 1)}>
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              </Pressable>
            </View>

            <Pressable style={styles.dateCard}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <View style={styles.dateValue}>
                <MaterialCommunityIcons name="calendar" size={18} color="#137fec" />
                <Text style={styles.dateText}>{checkOutDate}</Text>
              </View>
              <Text style={styles.dateNote}>Until 12:00</Text>
            </Pressable>
          </View>

          {/* Guests */}
          <View style={styles.guestsCard}>
            <Text style={styles.dateLabel}>Guests</Text>
            <View style={styles.guestsRow}>
              <Text style={styles.guestsText}>{guests} guest{guests > 1 ? 's' : ''}, max {roomData.maxGuests}</Text>
              <View style={styles.guestsControls}>
                <Pressable
                  style={styles.guestBtn}
                  onPress={() => setGuests(Math.max(1, guests - 1))}
                >
                  <MaterialCommunityIcons name="minus" size={18} color="#fff" />
                </Pressable>
                <Text style={styles.guestCount}>{guests}</Text>
                <Pressable
                  style={styles.guestBtn}
                  onPress={() => setGuests(Math.min(roomData.maxGuests, guests + 1))}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Guest Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations client</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                placeholderTextColor="#64748b"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor="#64748b"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="john.doe@example.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+237 000 000 000"
              placeholderTextColor="#64748b"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Special Requests (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any special requests or preferences..."
              placeholderTextColor="#64748b"
              value={specialRequests}
              onChangeText={setSpecialRequests}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          
          {paymentMethods.map((method) => (
            <Pressable
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.paymentOptionActive,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentLeft}>
                <MaterialCommunityIcons
                  name={method.icon}
                  size={22}
                  color={selectedPayment === method.id ? '#137fec' : '#64748b'}
                />
                <Text style={[
                  styles.paymentLabel,
                  selectedPayment === method.id && styles.paymentLabelActive,
                ]}>
                  {method.label}
                </Text>
              </View>
              <View style={[
                styles.radioOuter,
                selectedPayment === method.id && styles.radioOuterActive,
              ]}>
                {selectedPayment === method.id && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                ₦{roomPrice = roomData.price.toLocaleString()} x {nights} night{nights > 1 ? 's' : ''}
              </Text>
              <Text style={styles.priceValue}>₦{totalPrice.toLocaleString()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Taxes & Fees (10%)</Text>
              <Text style={styles.priceValue}>₦{taxes.toLocaleString()}</Text>
            </View>
            <View style={[styles.priceRow, styles.priceTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Offline Notice */}
        <View style={styles.offlineNotice}>
          <MaterialCommunityIcons name="wifi-off" size={18} color="#eab308" />
          <Text style={styles.offlineText}>
            Booking will be saved locally. Complete payment when online.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.bottomPrice}>₦{total.toLocaleString()}</Text>
        </View>
        <Pressable
          style={styles.confirmBtn}
          onPress={() => onNavigate?.('hotel_payment', { room: roomData, hotel: hotelData, nights, guests, total })}
        >
          <Text style={styles.confirmBtnText}>Continuer vers le paiement</Text>
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
  roomSummary: {
    flexDirection: 'row',
    margin: 16,
    padding: 12,
    backgroundColor: '#1c2630',
    borderRadius: 16,
  },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  summaryInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  summaryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryHotel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  summaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  summaryMetaText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  summaryDot: {
    color: '#64748b',
    marginHorizontal: 6,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCard: {
    flex: 1,
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  dateValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dateNote: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  nightsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#233648',
    borderRadius: 12,
    paddingHorizontal: 8,
    gap: 12,
  },
  nightsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nightsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  guestsCard: {
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  guestsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  guestsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guestBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    width: 24,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1c2630',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentOptionActive: {
    borderColor: '#137fec',
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentLabel: {
    color: '#94a3b8',
    fontSize: 15,
  },
  paymentLabelActive: {
    color: '#fff',
    fontWeight: '500',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#137fec',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#137fec',
  },
  priceCard: {
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
    borderTopColor: '#233648',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#137fec',
    fontSize: 20,
    fontWeight: 'bold',
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  offlineText: {
    color: '#eab308',
    fontSize: 13,
    flex: 1,
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
  bottomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  confirmBtn: {
    backgroundColor: '#137fec',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
