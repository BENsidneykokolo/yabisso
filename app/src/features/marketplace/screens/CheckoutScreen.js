import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const orderItems = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    color: 'Noir',
    quantity: 1,
    price: 35000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCchntFWAuT-XnocLJ9GCml95154_J2wOCFBQG7m9N8xm4L3_M21vFNZcUvvh4BMJp5Pq_ueclsZj9e-kVATvfOKHyGiNnrnKfRMZ6oFqX9NKjztkXiEChbzhS4qYKPdyrEgJIYJbxNwxQCe-7WAGQsseHDXV9KvW-761juS-p7pERAeqLJboXWBSeVq6jhNpFLekJg2tqzhAM10qbtNLbc0oel1cjfXK0Pc0-ioZr6LwQtDb-3J6DP7As2NqV4X1r24bRi8sDi',
  },
  {
    id: 2,
    name: 'Series 7 Smart Watch',
    color: 'Argent',
    quantity: 1,
    price: 80000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN1yXJBKJGtp-3TDxOl6op6M6GF3e-BFaYA5vG7fYuqb8rjFdYhewObAYTi14kKwlnPYG4cVzR0cIsCNWVKX4W3JNw4kztrcg2Hk1-cPx--9q8xbORY4mIovrvqsW8hFDtkYw74mvviGw760UU2HB3O0T5ZE_oWc4sOJ7gqISlY_RQPxCoDNAjDds-Thw70RN_-AeUY5UrIW8LeV6XOO1q7dPot0laf9_qPgYpnWg8x3eG7OL3ZVzxU01_ek7CoZTzuQDX66PI',
  },
];

export default function CheckoutScreen({ onBack, onNavigate }) {
  const [personalInfo, setPersonalInfo] = useState('me');
  const [address, setAddress] = useState('home');
  const [delivery, setDelivery] = useState('express');
  const [payment, setPayment] = useState('wallet');

  const formatPrice = (price) => {
    return price.toLocaleString('fr-FR') + ' XAF';
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = delivery === 'express' ? 1500 : 0;
  const taxes = 0;
  const total = subtotal + deliveryFee + taxes;

  const handleConfirmPurchase = () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous confirmer cet achat?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            Alert.alert('Succès', 'Votre commande a été passée avec succès!');
            onNavigate?.('order_status');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Page Indicators */}
      <View style={styles.pageIndicators}>
        <View style={styles.indicator} />
        <View style={styles.indicator} />
        <View style={[styles.indicator, styles.indicatorActive]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          {/* Me */}
          <Pressable
            onPress={() => setPersonalInfo('me')}
            style={[
              styles.optionCard,
              personalInfo === 'me' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.optionIcon,
                personalInfo === 'me' && styles.optionIconSelected
              ]}>
                <MaterialCommunityIcons name="person" size={22} color={personalInfo === 'me' ? '#fff' : '#64748b'} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Moi</Text>
                <Text style={styles.optionSubtitle}>Nana Franky • +237 671 23 45 67</Text>
                <Text style={styles.optionSubtitle}>franky@yabisso.cm</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                personalInfo === 'me' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Not Me */}
          <Pressable
            onPress={() => setPersonalInfo('other')}
            style={[
              styles.optionCard,
              personalInfo === 'other' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <MaterialCommunityIcons name="person-add" size={22} color="#64748b" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Pas Moi</Text>
                <Text style={styles.optionSubtitle}>Envoyer à quelqu'un d'autre</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                personalInfo === 'other' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de Livraison</Text>

          {/* Home */}
          <Pressable
            onPress={() => setAddress('home')}
            style={[
              styles.optionCard,
              address === 'home' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.optionIcon,
                address === 'home' && styles.optionIconSelected
              ]}>
                <MaterialCommunityIcons name="home" size={22} color={address === 'home' ? '#fff' : '#64748b'} />
              </View>
              <View style={styles.optionTextContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.optionTitle}>Maison</Text>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>YB-987-AX</Text>
                  </View>
                </View>
                <Text style={styles.optionSubtitle}>Rue 1.023, Quartier Bastos, Yaoundé</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                address === 'home' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Work */}
          <Pressable
            onPress={() => setAddress('work')}
            style={[
              styles.optionCard,
              address === 'work' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <MaterialCommunityIcons name="work" size={22} color="#64748b" />
              </View>
              <View style={styles.optionTextContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.optionTitle}>Travail</Text>
                  <View style={[styles.tagBadge, styles.tagBadgeSecondary]}>
                    <Text style={styles.tagBadgeText}>YB-123-BZ</Text>
                  </View>
                </View>
                <Text style={styles.optionSubtitle}>Immeuble CAA, Avenue Marchand</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                address === 'work' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          <Pressable style={styles.manageAddressBtn}>
            <MaterialCommunityIcons name="cog" size={16} color="#137fec" />
            <Text style={styles.manageAddressText}>Gérer les adresses</Text>
          </Pressable>
        </View>

        {/* Delivery Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de Livraison</Text>

          {/* Standard */}
          <Pressable
            onPress={() => setDelivery('standard')}
            style={[
              styles.optionCard,
              delivery === 'standard' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconSmall}>
                <MaterialCommunityIcons name="local-shipping" size={20} color="#64748b" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Livraison Standard</Text>
                <Text style={styles.optionSubtitle}>Gratuit • 35-45 mins</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                delivery === 'standard' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Express */}
          <Pressable
            onPress={() => setDelivery('express')}
            style={[
              styles.optionCard,
              delivery === 'express' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.optionIconSmall,
                delivery === 'express' && styles.optionIconSmallSelected
              ]}>
                <MaterialCommunityIcons name="bolt" size={20} color={delivery === 'express' ? '#fff' : '#64748b'} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Livraison Express</Text>
                <Text style={styles.optionSubtitle}>+1 500 XAF • 15-25 mins</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                delivery === 'express' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de Paiement</Text>

          {/* Wallet */}
          <Pressable
            onPress={() => setPayment('wallet')}
            style={[
              styles.optionCard,
              payment === 'wallet' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.optionIconSmall,
                payment === 'wallet' && styles.optionIconSmallSelected
              ]}>
                <MaterialCommunityIcons name="account-balance-wallet" size={20} color={payment === 'wallet' ? '#fff' : '#10b981'} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Portefeuille Yabisso</Text>
                <Text style={styles.optionSubtitle}>Solde : <Text style={styles.balanceText}>450 000 XAF</Text></Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                payment === 'wallet' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Mobile Money */}
          <Pressable
            onPress={() => setPayment('mobile')}
            style={[
              styles.optionCard,
              payment === 'mobile' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[styles.optionIconSmall, styles.optionIconGreen]}>
                <MaterialCommunityIcons name="smartphone" size={20} color="#10b981" />
              </View>
              <View style={styles.optionTextContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.optionTitle}>Paiement Mobile</Text>
                  <View style={styles.offlineBadge}>
                    <Text style={styles.offlineBadgeText}>Prêt Hors-ligne</Text>
                  </View>
                </View>
                <Text style={styles.optionSubtitle}>M-Pesa, Airtel Money</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                payment === 'mobile' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Card */}
          <Pressable
            onPress={() => setPayment('card')}
            style={[
              styles.optionCard,
              payment === 'card' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[styles.optionIconSmall, styles.optionIconYellow]}>
                <MaterialCommunityIcons name="credit-card" size={20} color="#f59e0b" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Carte de Crédit</Text>
                <Text style={styles.optionSubtitle}>**** 4242</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                payment === 'card' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Cash on Delivery */}
          <Pressable
            onPress={() => setPayment('cod')}
            style={[
              styles.optionCard,
              payment === 'cod' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconSmall}>
                <MaterialCommunityIcons name="payments" size={20} color="#137fec" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Payer à la livraison</Text>
                <Text style={styles.optionSubtitle}>Espèces ou Mobile Money à l'arrivée</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                payment === 'cod' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé de la Commande</Text>
          <View style={styles.summaryCard}>
            {orderItems.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <Image source={{ uri: item.image }} style={styles.orderItemImage} />
                <View style={styles.orderItemDetails}>
                  <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.orderItemVariant}>{item.color} • Qty {item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>{formatPrice(item.price)}</Text>
              </View>
            ))}

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>{formatPrice(deliveryFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes</Text>
              <Text style={styles.summaryValue}>{formatPrice(taxes)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabelSmall}>Montant Total</Text>
            <Text style={styles.totalValueSmall}>{formatPrice(total)}</Text>
          </View>
          <Pressable onPress={handleConfirmPurchase} style={styles.confirmBtn}>
            <Text style={styles.confirmBtnText}>Confirmer l'achat</Text>
            <MaterialCommunityIcons name="arrow-forward" size={20} color="#0E151B" />
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
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  indicator: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1c2a38',
  },
  indicatorActive: {
    backgroundColor: '#137fec',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c2a38',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#137fec',
    backgroundColor: 'rgba(19, 127, 236, 0.05)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: {
    backgroundColor: '#137fec',
  },
  optionIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIconSmallSelected: {
    backgroundColor: '#137fec',
  },
  optionIconGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  optionIconYellow: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#92adc9',
    marginTop: 2,
  },
  tagBadge: {
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(19, 127, 236, 0.3)',
  },
  tagBadgeSecondary: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#137fec',
  },
  offlineBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  offlineBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#10b981',
    textTransform: 'uppercase',
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
  summaryCard: {
    backgroundColor: '#1c2a38',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#324d67',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#324d67',
  },
  orderItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
  orderItemVariant: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#324d67',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 13,
    color: '#e2e8f0',
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
    height: 150,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1c2a38',
    borderTopWidth: 1,
    borderTopColor: '#324d67',
    paddingBottom: 60,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabelSmall: {
    fontSize: 13,
    color: '#64748b',
  },
  totalValueSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0E151B',
  },
});
