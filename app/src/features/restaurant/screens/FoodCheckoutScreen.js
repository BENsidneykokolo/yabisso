import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const cartItems = [
  {
    id: 1,
    name: 'Jollof Rice with Chicken',
    price: 2500,
    quantity: 2,
    restaurant: 'Chicken Republic',
  },
  {
    id: 2,
    name: 'Suya Platter',
    price: 1800,
    quantity: 1,
    restaurant: 'Chicken Republic',
  },
];

export default function FoodCheckoutScreen({ onBack, onNavigate }) {
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('card');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = selectedDelivery === 'express' ? 500 : 200;
  const serviceFee = 100;
  const total = subtotal + deliveryFee + serviceFee;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#137fec" />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Home</Text>
              <Text style={styles.addressText}>
                12 Lekki Phase 1, Lagos, Nigeria
              </Text>
            </View>
            <Pressable style={styles.changeBtn}>
              <Text style={styles.changeText}>Change</Text>
            </Pressable>
          </View>
        </View>

        {/* Delivery Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Time</Text>
          <View style={styles.optionsRow}>
            <Pressable 
              style={[styles.optionCard, selectedDelivery === 'standard' && styles.optionCardActive]}
              onPress={() => setSelectedDelivery('standard')}
            >
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={24} 
                color={selectedDelivery === 'standard' ? '#137fec' : '#64748b'} 
              />
              <Text style={[styles.optionTitle, selectedDelivery === 'standard' && styles.optionTitleActive]}>
                Standard
              </Text>
              <Text style={styles.optionDesc}>30-40 min</Text>
              <Text style={styles.optionPrice}>₦200</Text>
            </Pressable>
            <Pressable 
              style={[styles.optionCard, selectedDelivery === 'express' && styles.optionCardActive]}
              onPress={() => setSelectedDelivery('express')}
            >
              <MaterialCommunityIcons 
                name="lightning-bolt" 
                size={24} 
                color={selectedDelivery === 'express' ? '#137fec' : '#64748b'} 
              />
              <Text style={[styles.optionTitle, selectedDelivery === 'express' && styles.optionTitleActive]}>
                Express
              </Text>
              <Text style={styles.optionDesc}>15-20 min</Text>
              <Text style={styles.optionPrice}>₦500</Text>
            </Pressable>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.orderItemRestaurant}>{item.restaurant}</Text>
              </View>
              <View style={styles.orderItemRight}>
                <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                <Text style={styles.orderItemPrice}>₦{(item.price * item.quantity).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Pressable style={styles.paymentCard}>
            <View style={styles.paymentLeft}>
              <MaterialCommunityIcons name="credit-card" size={24} color="#137fec" />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Visa •••• 4242</Text>
                <Text style={styles.paymentSubtitle}>Expires 12/25</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="check-circle" size={24} color="#22c55e" />
          </Pressable>
          <Pressable style={styles.addPaymentBtn}>
            <MaterialCommunityIcons name="plus" size={20} color="#137fec" />
            <Text style={styles.addPaymentText}>Add new payment method</Text>
          </Pressable>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₦{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₦{deliveryFee}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee</Text>
              <Text style={styles.summaryValue}>₦{serviceFee}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View>
            <Text style={styles.bottomTotalLabel}>Total</Text>
            <Text style={styles.bottomTotalValue}>₦{total.toLocaleString()}</Text>
          </View>
          <Pressable 
            style={styles.placeOrderBtn}
            onPress={() => onNavigate?.('order_status')}
          >
            <Text style={styles.placeOrderText}>Place Order</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#0E151B" />
          </Pressable>
        </View>
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
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 12,
  },
  addressIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  addressText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeText: {
    color: '#137fec',
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: '#137fec',
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  optionTitleActive: {
    color: '#137fec',
  },
  optionDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderItemRestaurant: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  orderItemRight: {
    alignItems: 'flex-end',
  },
  orderItemQty: {
    fontSize: 14,
    color: '#64748b',
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 16,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentInfo: {
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  addPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  addPaymentText: {
    color: '#137fec',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#324d67',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
    borderTopWidth: 1,
    borderTopColor: '#324d67',
    padding: 16,
    paddingBottom: 32,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomTotalLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  bottomTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
