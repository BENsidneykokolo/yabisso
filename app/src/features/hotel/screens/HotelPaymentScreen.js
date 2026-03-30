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
  Alert,
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
  address: 'Plot 1415 Adetokunbo Ademola Street',
};

const bookingData = {
  checkIn: '2026-04-01',
  checkOut: '2026-04-02',
  nights: 1,
  guests: 1,
};

const total = 49500;

export default function HotelPaymentScreen({ onBack, onNavigate, route }) {
  const [selectedMethod, setSelectedMethod] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'wallet',
      label: 'Yabisso Wallet',
      icon: 'wallet',
      description: 'Pay instantly from your Yabisso balance',
      available: true,
    },
    {
      id: 'flutterwave',
      label: 'Mobile Money',
      icon: 'cellphone',
      description: 'MTN, Airtel, Moov',
      available: true,
    },
    {
      id: 'card',
      label: 'Credit/Debit Card',
      icon: 'credit-card',
      description: 'Visa, Mastercard',
      available: false,
    },
    {
      id: 'cash',
      label: 'Pay at Hotel',
      icon: 'cash',
      description: 'Pay when you arrive',
      available: true,
    },
  ];

  const handlePayment = () => {
    if (selectedMethod === 'wallet') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onNavigate?.('hotel_reservation', {
          room: roomData,
          hotel: hotelData,
          booking: bookingData,
          total,
          paymentMethod: 'Yabisso Wallet',
        });
      }, 2000);
    } else if (selectedMethod === 'cash') {
      onNavigate?.('hotel_reservation', {
        room: roomData,
        hotel: hotelData,
        booking: bookingData,
        total,
        paymentMethod: 'Pay at Hotel',
      });
    } else {
      Alert.alert(
        'Coming Soon',
        'This payment method will be available soon.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Paiement</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Image source={{ uri: roomData.image }} style={summaryImage = { width: 60, height: 60, borderRadius: 10 }} />
          <View style={styles.summaryInfo}>
            <Text style={styles.roomName}>{roomData.name}</Text>
            <Text style={styles.hotelName}>{hotelData.name}</Text>
            <Text style={styles.bookingDates}>
              {bookingData.checkIn} → {bookingData.checkOut} • {bookingData.nights} night • {bookingData.guests} guest
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Montant total</Text>
          <Text style={styles.amountValue}>₦{total.toLocaleString()}</Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir le mode de paiement</Text>
          
          {paymentMethods.map((method) => (
            <Pressable
              key={method.id}
              style={[
                styles.paymentOption,
                selectedMethod === method.id && styles.paymentOptionActive,
                !method.available && styles.paymentOptionDisabled,
              ]}
              onPress={() => method.available && setSelectedMethod(method.id)}
              disabled={!method.available}
            >
              <View style={styles.paymentLeft}>
                <View style={[
                  styles.paymentIcon,
                  selectedMethod === method.id && styles.paymentIconActive,
                ]}>
                  <MaterialCommunityIcons
                    name={method.icon}
                    size={22}
                    color={selectedMethod === method.id ? '#fff' : '#64748b'}
                  />
                </View>
                <View style={styles.paymentText}>
                  <Text style={[
                    styles.paymentLabel,
                    selectedMethod === method.id && styles.paymentLabelActive,
                    !method.available && styles.paymentLabelDisabled,
                  ]}>
                    {method.label}
                  </Text>
                  <Text style={styles.paymentDesc}>{method.description}</Text>
                </View>
              </View>
              <View style={[
                styles.radioOuter,
                selectedMethod === method.id && styles.radioOuterActive,
                !method.available && styles.radioOuterDisabled,
              ]}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Wallet Balance (if wallet selected) */}
        {selectedMethod === 'wallet' && (
          <View style={styles.walletSection}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletLabel}>Yabisso Wallet Balance</Text>
              <Pressable>
                <Text style={styles.walletTopUp}>Top Up</Text>
              </Pressable>
            </View>
            <Text style={styles.walletBalance}>₦150,000</Text>
            <View style={styles.walletSufficient}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#22c55e" />
              <Text style={styles.walletSufficientText}>Sufficient balance</Text>
            </View>
          </View>
        )}

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Code promo</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              placeholderTextColor="#64748b"
            />
            <Pressable style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Apply</Text>
            </Pressable>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <MaterialCommunityIcons name="shield-lock" size={20} color="#22c55e" />
          <View style={styles.securityText}>
            <Text style={styles.securityTitle}>Paiement sécurisé</Text>
            <Text style={styles.securityDesc}>
              Your payment is protected by end-to-end encryption
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total à payer</Text>
          <Text style={styles.bottomPrice}>₦{total.toLocaleString()}</Text>
        </View>
        <Pressable
          style={[
            styles.payBtn,
            isProcessing && styles.payBtnDisabled,
          ]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <View style={styles.processing}>
              <MaterialCommunityIcons name="loading" size={20} color="#fff" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.payBtnText}>
              {selectedMethod === 'cash' ? 'Confirmer la réservation' : 'Payer maintenant'}
            </Text>
          )}
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
  summaryCard: {
    flexDirection: 'row',
    margin: 16,
    padding: 12,
    backgroundColor: '#1c2630',
    borderRadius: 16,
  },
  summaryImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  summaryInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  roomName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  hotelName: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  bookingDates: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1c2630',
  },
  amountLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  amountValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentOptionActive: {
    borderColor: '#137fec',
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
  },
  paymentOptionDisabled: {
    opacity: 0.5,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#233648',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconActive: {
    backgroundColor: '#137fec',
  },
  paymentText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentLabel: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '500',
  },
  paymentLabelActive: {
    color: '#fff',
  },
  paymentLabelDisabled: {
    color: '#64748b',
  },
  paymentDesc: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
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
  radioOuterDisabled: {
    borderColor: '#475569',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#137fec',
  },
  walletSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1c2630',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  walletTopUp: {
    color: '#137fec',
    fontSize: 13,
    fontWeight: '600',
  },
  walletBalance: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  walletSufficient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  walletSufficientText: {
    color: '#22c55e',
    fontSize: 13,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#1c2630',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
  },
  promoBtn: {
    backgroundColor: '#233648',
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    margin: 16,
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  securityDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
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
  totalLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  payBtn: {
    backgroundColor: '#137fec',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  payBtnDisabled: {
    backgroundColor: '#475569',
  },
  payBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  processing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
