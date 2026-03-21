import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { database } from '../../../lib/db';
import { useRestaurantCart } from '../context/RestaurantCartContext';
import { useRestaurantOrders } from '../context/RestaurantOrdersContext';

export default function FoodCheckoutScreen({ onBack, onNavigate }) {
  const { cartItems, currentRestaurant, getCartTotal, clearCart } = useRestaurantCart();
  const { addOrder } = useRestaurantOrders();
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const addressCollection = database.get('addresses');
      const list = await addressCollection.query().fetch();
      setSavedAddresses(list);
      if (list.length > 0) {
        setSelectedAddressId(list[0].id);
      }
    } catch (error) {
      console.error('Error loading addresses for food checkout:', error);
    }
  };

  const subtotal = getCartTotal();
  const deliveryFee = selectedDelivery === 'express' ? 500 : 200;
  const serviceFee = 100;
  const total = subtotal + deliveryFee + serviceFee;

  const handlePlaceOrder = () => {
    // Save the order
    addOrder({
      restaurant: currentRestaurant?.name || 'Restaurant',
      total: total,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
      })),
      deliveryFee: deliveryFee,
      serviceFee: serviceFee,
      deliveryType: selectedDelivery,
    });

    Alert.alert(
      'Commande passée !',
      `Votre commande de FCFA ${total.toLocaleString()} a été envoyée au restaurant ${currentRestaurant?.name || ''}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            onNavigate?.('restaurant_orders');
          },
        },
      ]
    );
  };

  // Mock cart items if empty (for testing)
  const items = cartItems.length > 0 ? cartItems : [
    {
      id: 1,
      name: 'Jollof Rice with Chicken',
      price: 2500,
      quantity: 2,
    },
    {
      id: 2,
      name: 'Suya Platter',
      price: 1800,
      quantity: 1,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Paiement</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Restaurant Info */}
        {currentRestaurant && (
          <View style={styles.restaurantBanner}>
            <MaterialCommunityIcons name="store" size={20} color="#137fec" />
            <Text style={styles.restaurantName}>{currentRestaurant.name}</Text>
          </View>
        )}

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de Livraison</Text>

          {savedAddresses.length === 0 ? (
            <View style={styles.noAddressContainer}>
              <Text style={styles.noAddressText}>Aucune adresse enregistrée.</Text>
              <Pressable 
                style={styles.addAddressInlineBtn}
                onPress={() => onNavigate?.('profile_add_address')}
              >
                <Text style={styles.addAddressInlineText}>Ajouter une adresse</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              {selectedAddress ? (
                <Pressable
                  onPress={() => setIsAddressModalVisible(true)}
                  style={[styles.optionCardAddress, styles.optionCardActive]}
                >
                  <View style={styles.addressContent}>
                    <View style={[styles.addressIconContainer, styles.addressIconSelected]}>
                      <MaterialCommunityIcons 
                        name={selectedAddress.category === 'Maison' ? 'home' : (selectedAddress.category === 'Travail' ? 'briefcase' : 'map-marker')} 
                        size={22} 
                        color="#fff"
                      />
                    </View>
                    <View style={styles.addressTextContainer}>
                      <View style={styles.titleRow}>
                        <Text style={styles.addressTitle}>{selectedAddress.name}</Text>
                        <View style={styles.tagBadge}>
                          <Text style={styles.tagBadgeText}>{selectedAddress.uniqueId}</Text>
                        </View>
                      </View>
                      <Text style={styles.addressSubtitle}>{selectedAddress.fullAddress || 'Coordonnées GPS'}</Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#64748b" />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => setIsAddressModalVisible(true)}
                  style={styles.optionCardAddress}
                >
                  <Text style={{ color: '#94a3b8' }}>Sélectionner une adresse</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#64748b" />
                </Pressable>
              )}
              
              <Pressable 
                style={styles.viewAllBtn} 
                onPress={() => setIsAddressModalVisible(true)}
              >
                <Text style={styles.viewAllText}>Voir toutes les adresses</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Delivery Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Heure de livraison</Text>
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
                Standard (30-40 min)
              </Text>
              <Text style={styles.optionPrice}>FCFA 200</Text>
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
                Express (15-20 min)
              </Text>
              <Text style={styles.optionPrice}>FCFA 500</Text>
            </Pressable>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé de la commande</Text>
          {items.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                {item.restaurantName && (
                  <Text style={styles.orderItemRestaurant}>{item.restaurantName}</Text>
                )}
              </View>
              <View style={styles.orderItemRight}>
                <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                <Text style={styles.orderItemPrice}>
                  FCFA {(item.totalPrice || (item.price * item.quantity)).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de Paiement</Text>

          {/* Wallet */}
          <Pressable
            onPress={() => setSelectedPayment('wallet')}
            style={[
              styles.optionCardPayment,
              selectedPayment === 'wallet' && styles.optionCardActive
            ]}
          >
            <View style={styles.paymentContent}>
              <View style={[
                styles.paymentIconContainer,
                selectedPayment === 'wallet' && styles.paymentIconSelected
              ]}>
                <MaterialCommunityIcons name="wallet" size={22} color={selectedPayment === 'wallet' ? '#fff' : '#10b981'} />
              </View>
              <View style={styles.paymentTextContainer}>
                <Text style={styles.paymentTitle}>Portefeuille Yabisso</Text>
                <Text style={styles.paymentSubtitle}>Solde : <Text style={styles.balanceText}>450 000 XAF</Text></Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                selectedPayment === 'wallet' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Mobile Money */}
          <Pressable
            onPress={() => setSelectedPayment('mobile')}
            style={[
              styles.optionCardPayment,
              selectedPayment === 'mobile' && styles.optionCardActive
            ]}
          >
            <View style={styles.paymentContent}>
              <View style={[styles.paymentIconContainer, styles.optionIconGreen]}>
                <MaterialCommunityIcons name="cellphone-wireless" size={22} color="#10b981" />
              </View>
              <View style={styles.paymentTextContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.paymentTitle}>Paiement Mobile</Text>
                  <View style={styles.offlineBadge}>
                    <Text style={styles.offlineBadgeText}>Hors-ligne</Text>
                  </View>
                </View>
                <Text style={styles.paymentSubtitle}>M-Pesa, Airtel Money</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                selectedPayment === 'mobile' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Card */}
          <Pressable
            onPress={() => setSelectedPayment('card')}
            style={[
              styles.optionCardPayment,
              selectedPayment === 'card' && styles.optionCardActive
            ]}
          >
            <View style={styles.paymentContent}>
              <View style={[styles.paymentIconContainer, styles.optionIconYellow]}>
                <MaterialCommunityIcons name="credit-card" size={22} color="#f59e0b" />
              </View>
              <View style={styles.paymentTextContainer}>
                <Text style={styles.paymentTitle}>Carte de Crédit</Text>
                <Text style={styles.paymentSubtitle}>Visa •••• 4242</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                selectedPayment === 'card' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Cash on Delivery */}
          <Pressable
            onPress={() => setSelectedPayment('cod')}
            style={[
              styles.optionCardPayment,
              selectedPayment === 'cod' && styles.optionCardActive
            ]}
          >
            <View style={styles.paymentContent}>
              <View style={styles.paymentIconContainer}>
                <MaterialCommunityIcons name="cash-multiple" size={22} color="#137fec" />
              </View>
              <View style={styles.paymentTextContainer}>
                <Text style={styles.paymentTitle}>Payer à la livraison</Text>
                <Text style={styles.paymentSubtitle}>Espèces ou Mobile Money à l'arrivée</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                selectedPayment === 'cod' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé de la facture</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>FCFA {subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>FCFA {deliveryFee}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de service</Text>
              <Text style={styles.summaryValue}>FCFA {serviceFee}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>FCFA {total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View style={styles.bottomTotalContainer}>
            <Text style={styles.bottomTotalLabel}>Total</Text>
            <Text style={styles.bottomTotalValue}>FCFA {total.toLocaleString()}</Text>
          </View>
          <Pressable 
            style={styles.placeOrderBtn}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.placeOrderText}>Passer la commande</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#0E151B" />
          </Pressable>
        </View>
      </View>
      {/* Address Selection Modal */}
      <Modal
        visible={isAddressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une adresse</Text>
              <Pressable onPress={() => setIsAddressModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {savedAddresses.map((addr) => (
                <Pressable
                  key={addr.id}
                  onPress={() => {
                    setSelectedAddressId(addr.id);
                    setIsAddressModalVisible(false);
                  }}
                  style={[
                    styles.optionCardAddress,
                    selectedAddressId === addr.id && styles.optionCardActive
                  ]}
                >
                  <View style={styles.addressContent}>
                    <View style={[
                      styles.addressIconContainer,
                      selectedAddressId === addr.id && styles.addressIconSelected
                    ]}>
                      <MaterialCommunityIcons 
                        name={addr.category === 'Maison' ? 'home' : (addr.category === 'Travail' ? 'briefcase' : 'map-marker')} 
                        size={22} 
                        color={selectedAddressId === addr.id ? '#fff' : '#64748b'} 
                      />
                    </View>
                    <View style={styles.addressTextContainer}>
                      <View style={styles.titleRow}>
                        <Text style={styles.addressTitle}>{addr.name}</Text>
                        <View style={styles.tagBadge}>
                          <Text style={styles.tagBadgeText}>{addr.uniqueId}</Text>
                        </View>
                      </View>
                      <Text style={styles.addressSubtitle}>{addr.fullAddress || 'Coordonnées GPS'}</Text>
                    </View>
                  </View>
                  <View style={styles.radioOuter}>
                    <View style={[
                      styles.radioInner,
                      selectedAddressId === addr.id && styles.radioInnerSelected
                    ]} />
                  </View>
                </Pressable>
              ))}

              <Pressable 
                style={styles.addAddressBtn} 
                onPress={() => {
                  setIsAddressModalVisible(false);
                  onNavigate?.('profile_add_address');
                }}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#137fec" />
                <Text style={styles.addAddressText}>Ajouter une nouvelle adresse</Text>
              </Pressable>

              <View style={{ height: 40 }} />
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
  restaurantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 127, 236, 0.15)',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  restaurantName: {
    color: '#137fec',
    fontSize: 14,
    fontWeight: '600',
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
  optionCardAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressIconSelected: {
    backgroundColor: '#137fec',
  },
  addressTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  addressSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  manageAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  manageAddressText: {
    fontSize: 13,
    color: '#137fec',
    fontWeight: '600',
  },
  tagBadge: {
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(19, 127, 236, 0.3)',
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#137fec',
  },
  noAddressContainer: {
    backgroundColor: '#1c2a38',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  noAddressText: {
    color: '#94a3b8',
    marginBottom: 12,
  },
  viewAllBtn: {
    marginTop: 4,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 13,
    color: '#137fec',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a2632',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalBody: {
    padding: 20,
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(19, 127, 236, 0.3)',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addAddressText: {
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
  optionCardPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconSelected: {
    backgroundColor: '#137fec',
  },
  paymentTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  balanceText: {
    color: '#137fec',
    fontWeight: 'bold',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  radioInnerSelected: {
    backgroundColor: '#137fec',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  offlineBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#22c55e',
    textTransform: 'uppercase',
  },
  optionIconGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  optionIconYellow: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
    height: 180,
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
    paddingBottom: 45,
  },
  bottomBarContent: {
    flexDirection: 'column',
    gap: 12,
  },
  bottomTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    gap: 12,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
