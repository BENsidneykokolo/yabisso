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

const sampleCartItems = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    brand: 'BassPro',
    price: 35000,
    color: 'Noir',
    quantity: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCchntFWAuT-XnocLJ9GCml95154_J2wOCFBQG7m9N8xm4L3_M21vFNZcUvvh4BMJp5Pq_ueclsZj9e-kVATvfOKHyGiNnrnKfRMZ6oFqX9NKjztkXiEChbzhS4qYKPdyrEgJIYJbxNwxQCe-7WAGQsseHDXV9KvW-761juS-p7pERAeqLJboXWBSeVq6jhNpFLekJg2tqzhAM10qbtNLbc0oel1cjfXK0Pc0-ioZr6LwQtDb-3J6DP7As2NqV4X1r24bRi8sDi',
  },
  {
    id: 2,
    name: 'Series 7 Smart Watch',
    brand: 'TechWear',
    price: 80000,
    color: 'Argent',
    quantity: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN1yXJBKJGtp-3TDxOl6op6M6GF3e-BFaYA5vG7fYuqb8rjFdYhewObAYTi14kKwlnPYG4cVzR0cIsCNWVKX4W3JNw4kztrcg2Hk1-cPx--9q8xbORY4mIovrvqsW8hFDtkYw74mvviGw760UU2HB3O0T5ZE_oWc4sOJ7gqISlY_RQPxCoDNAjDds-Thw70RN_-AeUY5UrIW8LeV6XOO1q7dPot0laf9_qPgYpnWg8x3eG7OL3ZVzxU01_ek7CoZTzuQDX66PI',
  },
];

export default function CartScreen({ onBack, onNavigate }) {
  const [cartItems, setCartItems] = useState(sampleCartItems);
  const [selectedItems, setSelectedItems] = useState([1, 2]);
  const [activeTab, setActiveTab] = useState('Panier');

  const formatPrice = (price) => {
    return price.toLocaleString('fr-FR') + ' XAF';
  };

  const subtotal = cartItems
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const deliveryFee = selectedItems.length > 0 ? 1500 : 0;
  const taxes = 0;
  const total = subtotal + deliveryFee + taxes;

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const updateQuantity = (itemId, delta) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeItem = (itemId) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous supprimer cet article du panier?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setCartItems(prev => prev.filter(item => item.id !== itemId));
            setSelectedItems(prev => prev.filter(id => id !== itemId));
          }
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Panier vide', 'Veuillez sélectionner au moins un article');
      return;
    }
    onNavigate?.('checkout');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Panier</Text>
        <View style={styles.headerActions}>
          <Text style={styles.itemCount}>{cartItems.length} articles</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Cart Items */}
        <View style={styles.itemsSection}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              {/* Checkbox */}
              <Pressable
                onPress={() => toggleItemSelection(item.id)}
                style={styles.checkboxContainer}
              >
                <View style={[
                  styles.checkbox,
                  selectedItems.includes(item.id) && styles.checkboxSelected
                ]}>
                  {selectedItems.includes(item.id) && (
                    <MaterialCommunityIcons name="check" size={14} color="#fff" />
                  )}
                </View>
              </Pressable>

              {/* Product Image */}
              <Image source={{ uri: item.image }} style={styles.itemImage} />

              {/* Item Details */}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemVariant}>{item.color}</Text>
                <View style={styles.itemBottom}>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  <View style={styles.quantityControl}>
                    <Pressable
                      onPress={() => updateQuantity(item.id, -1)}
                      style={styles.qtyBtn}
                    >
                      <MaterialCommunityIcons name="minus" size={14} color="#fff" />
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable
                      onPress={() => updateQuantity(item.id, 1)}
                      style={styles.qtyBtn}
                    >
                      <MaterialCommunityIcons name="plus" size={14} color="#fff" />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Delete Button */}
              <Pressable
                onPress={() => removeItem(item.id)}
                style={styles.deleteBtn}
              >
                <MaterialCommunityIcons name="delete-outline" size={22} color="#ef4444" />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Résumé de la commande</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>
                {selectedItems.length > 0 ? formatPrice(deliveryFee) : '0 XAF'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes</Text>
              <Text style={styles.summaryValue}>{formatPrice(taxes)}</Text>
            </View>
            <View style={styles.summaryDivider} />
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
          <Pressable
            onPress={handleCheckout}
            style={[
              styles.buyBtn,
              selectedItems.length === 0 && styles.buyBtnDisabled
            ]}
            disabled={selectedItems.length === 0}
          >
            <Text style={styles.buyBtnText}>Acheter</Text>
            <MaterialCommunityIcons name="cart-check" size={20} color="#000" />
          </Pressable>
        </View>
      </View>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.navItem,
                  pressed && styles.navItemPressed,
                ]}
                onPress={() => {
                  if (item.label === 'Boutique') {
                    onNavigate?.('marketplace_home');
                  } else if (item.label === 'Catégories') {
                    onNavigate?.('marketplace_category_page');
                  } else if (item.label === 'Panier') {
                    // Already on cart
                  } else if (item.label === 'Nouveauté') {
                    onNavigate?.('new_arrivals');
                  } else if (item.label === 'Commande') {
                    onNavigate?.('orders');
                  } else {
                    setActiveTab(item.label);
                  }
                }}
              >
                <View style={[
                  styles.navIcon,
                  isActive && styles.navIconActive,
                  isActive && styles.navIconCenter,
                ]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={isActive ? 20 : 16}
                    color={isActive ? '#0E151B' : '#CBD5F5'}
                  />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
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
    backgroundColor: '#101922',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
    color: '#94a3b8',
  },
  scrollView: {
    flex: 1,
  },
  itemsSection: {
    padding: 16,
    gap: 12,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#1a2632',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#324d67',
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#324d67',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 20,
  },
  itemVariant: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#137fec',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 2,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    width: 28,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  deleteBtn: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  summarySection: {
    padding: 16,
    paddingTop: 8,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#1a2632',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#324d67',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  summaryDivider: {
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
    padding: 12,
    paddingBottom: 50,
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
    fontSize: 12,
    color: '#64748b',
  },
  totalValueSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  buyBtnDisabled: {
    backgroundColor: '#475569',
  },
  buyBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1c2a38',
    borderTopWidth: 1,
    borderTopColor: '#324d67',
    padding: 16,
    paddingBottom: 110,
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
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#475569',
  },
  checkoutBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0E151B',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1.5,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
  },
  buyBtnDisabled: {
    backgroundColor: '#475569',
  },
  buyBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  marketplaceBottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  bottomNavInner: {
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navItemPressed: {
    transform: [{ scale: 0.96 }],
  },
  navIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    backgroundColor: '#3B82F6',
  },
  navIconCenter: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    marginTop: -14,
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  navLabelActive: {
    color: '#2BEE79',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 36,
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
    marginBottom: 4,
  },
  navIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    backgroundColor: '#3B82F6',
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  navLabelActive: {
    color: '#2BEE79',
  },
});

const bottomNavItems = [
  { label: 'Boutique', icon: 'store' },
  { label: 'Catégories', icon: 'view-grid' },
  { label: 'Nouveauté', icon: 'sparkles' },
  { label: 'Commande', icon: 'shopping' },
  { label: 'Panier', icon: 'cart' },
];
