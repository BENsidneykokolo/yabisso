import React, { useState, useEffect } from 'react';
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
import { useCart } from '../context/CartContext';

export default function CartScreen({ onBack, onNavigate }) {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  
  const getItemKey = (item) => `${item.id}-${item.selectedColor}-${item.selectedModel}-${item.negotiatedPrice || 'null'}`;
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState('Panier');

  useEffect(() => {
    // Initialize or sync selection
    const currentKeys = cartItems.map(getItemKey);
    const newKeys = currentKeys.filter(key => !selectedItems.includes(key));
    if (newKeys.length > 0) {
      setSelectedItems(prev => [...prev, ...newKeys]);
    }
  }, [cartItems]);

  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    // Remove non-numeric characters (like dots, spaces, commas)
    return parseInt(price.toString().replace(/[^0-9]/g, '')) || 0;
  };

  const formatPrice = (price) => {
    return parsePrice(price).toLocaleString('fr-FR') + ' XAF';
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.includes(getItemKey(item)));

  const subtotal = selectedCartItems.reduce((sum, item) => {
    const price = parsePrice(item.negotiatedPrice || item.discountPrice || item.price);
    return sum + (price * item.quantity);
  }, 0);

  const deliveryFee = selectedItems.length > 0 ? 1500 : 0;
  const taxes = 0;
  const total = subtotal + deliveryFee + taxes;

  const toggleItemSelection = (itemKey) => {
    setSelectedItems(prev =>
      prev.includes(itemKey)
        ? prev.filter(key => key !== itemKey)
        : [...prev, itemKey]
    );
  };

  const handleRemove = (item) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous supprimer cet article du panier?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            removeFromCart(item.id, item.selectedColor, item.selectedModel, item.negotiatedPrice);
            const key = getItemKey(item);
            setSelectedItems(prev => prev.filter(k => k !== key));
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
    // Filter cart items to get only selected ones
    const itemsToCheckout = cartItems.filter(item => 
      selectedItems.includes(getItemKey(item))
    );
    
    onNavigate?.('checkout', { orderItems: itemsToCheckout });
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
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const itemKey = getItemKey(item);
              const displayPrice = item.negotiatedPrice || item.discountPrice || item.price;

              return (
                <Pressable 
                  key={itemKey} 
                  style={styles.cartItem}
                  onPress={() => onNavigate?.('product_details', { product: item })}
                >
                  {/* Checkbox */}
                  <Pressable
                    onPress={() => toggleItemSelection(itemKey)}
                    style={styles.checkboxContainer}
                  >
                    <View style={[
                      styles.checkbox,
                      selectedItems.includes(itemKey) && styles.checkboxSelected
                    ]}>
                      {selectedItems.includes(itemKey) && (
                        <MaterialCommunityIcons name="check" size={14} color="#fff" />
                      )}
                    </View>
                  </Pressable>

                  {/* Product Image */}
                  <Image 
                    source={{ uri: item.image || item.photos?.[0] || 'https://via.placeholder.com/80' }} 
                    style={styles.itemImage} 
                  />

                  {/* Item Details */}
                  <View style={styles.itemDetails}>
                    <View style={styles.itemNameContainer}>
                      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                      {item.description && (
                        <Text style={styles.itemDescription} numberOfLines={1}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <View style={styles.sellerCompact}>
                      <Image 
                        source={{ uri: item.seller?.avatar || 'https://via.placeholder.com/20' }} 
                        style={styles.sellerMiniAvatar} 
                      />
                      <Text style={styles.itemBrand}>{item.seller?.name || item.brand || 'Ma Boutique'}</Text>
                      {item.seller?.rating && (
                        <View style={styles.sellerRatingMini}>
                          <MaterialCommunityIcons name="star" size={10} color="#eab308" />
                          <Text style={styles.sellerRatingTextMini}>{item.seller.rating}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.itemVariant}>
                      {item.selectedColor || 'Default'}{item.selectedModel ? ` • ${item.selectedModel}` : ''} • Qté {item.quantity}
                    </Text>
                    <View style={styles.itemBottom}>
                      <View>
                        <Text style={[styles.itemPrice, item.negotiatedPrice && styles.negotiatedPrice]}>
                          {formatPrice(displayPrice)}
                        </Text>
                        {item.negotiatedPrice && (
                          <Text style={styles.negotiatedLabel}>Prix négocié</Text>
                        )}
                      </View>
                      <View style={styles.quantityControl}>
                        <Pressable
                          onPress={() => updateQuantity(item.id, item.quantity - 1, item.selectedColor, item.selectedModel, item.negotiatedPrice)}
                          style={styles.qtyBtn}
                        >
                          <MaterialCommunityIcons name="minus" size={14} color="#fff" />
                        </Pressable>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <Pressable
                          onPress={() => updateQuantity(item.id, item.quantity + 1, item.selectedColor, item.selectedModel, item.negotiatedPrice)}
                          style={styles.qtyBtn}
                        >
                          <MaterialCommunityIcons name="plus" size={14} color="#fff" />
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {/* Delete Button */}
                  <Pressable
                    onPress={() => handleRemove(item)}
                    style={styles.deleteBtn}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={22} color="#ef4444" />
                  </Pressable>
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyCart}>
              <MaterialCommunityIcons name="cart-outline" size={64} color="#324d67" />
              <Text style={styles.emptyCartText}>Votre panier est vide</Text>
              <Pressable style={styles.startShoppingBtn} onPress={() => onNavigate?.('marketplace_home')}>
                <Text style={styles.startShoppingText}>Commencer mes achats</Text>
              </Pressable>
            </View>
          )}
        </View>

        {cartItems.length > 0 && (
          <>
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
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Bar */}
      {cartItems.length > 0 && (
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
      )}

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
                    onNavigate?.('category_page');
                  } else if (item.label === 'Panier') {
                    // Already on cart
                  } else if (item.label === 'Nouveauté') {
                    onNavigate?.('new_arrivals');
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
          <Pressable
            style={({ pressed }) => [
              styles.navItem,
              pressed && styles.navItemPressed,
            ]}
            onPress={() => onBack?.()}
          >
            <View style={styles.navIcon}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={20}
                color="#CBD5F5"
              />
            </View>
            <Text style={styles.navLabel}>Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const bottomNavItems = [
  { label: 'Boutique', icon: 'store' },
  { label: 'Catégories', icon: 'view-grid' },
  { label: 'Nouveauté', icon: 'sparkles' },
  { label: 'Panier', icon: 'cart' },
];

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
  itemNameContainer: {
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 18,
  },
  itemDescription: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontStyle: 'italic',
  },
  sellerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sellerMiniAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#324d67',
  },
  itemBrand: {
    fontSize: 11,
    color: '#2BEE79',
    fontWeight: '600',
  },
  sellerRatingMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sellerRatingTextMini: {
    fontSize: 9,
    color: '#eab308',
    fontWeight: 'bold',
  },
  itemVariant: {
    fontSize: 11,
    color: '#64748b',
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
  negotiatedPrice: {
    color: '#22c55e',
  },
  negotiatedLabel: {
    fontSize: 10,
    color: '#22c55e',
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  startShoppingBtn: {
    backgroundColor: '#137fec',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startShoppingText: {
    color: '#fff',
    fontWeight: 'bold',
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
});

