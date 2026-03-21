import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Pressable,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';

const bottomNavItems = [
  { label: 'Marketplace', icon: 'store' },
  { label: 'Catégories', icon: 'view-grid' },
  { label: 'Nouveauté', icon: 'sparkles' },
  { label: 'Panier', icon: 'cart' },
];

const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'en_cours', label: 'En cours' },
  { key: 'livre', label: 'Livrées' },
  { key: 'annule', label: 'Annulées' },
];

export default function OrdersScreen({ onBack, onNavigate, filter }) {
  const { orders, updateOrderStatus } = useOrders();
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState(filter || 'all');

  // Reorder Modal State
  const [isReorderModalVisible, setIsReorderModalVisible] = useState(false);
  const [selectedOrderToReorder, setSelectedOrderToReorder] = useState(null);
  const [editingProducts, setEditingProducts] = useState([]);

  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter(order => order.status === activeFilter);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'en_cours':
        return 'local-shipping';
      case 'livre':
        return 'check-circle';
      case 'annule':
        return 'cancel';
      default:
        return 'help-outline';
    }
  };

  const handleMarkAsDelivered = (orderId) => {
    Alert.alert(
      'Confirmer la réception',
      'Avez-vous bien reçu cette commande ?',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui, reçue', 
          onPress: () => updateOrderStatus(orderId, 'livre')
        }
      ]
    );
  };

  const handleOpenReorder = (order) => {
    setSelectedOrderToReorder(order);
    // Clone products to allow local editing in modal
    setEditingProducts(order.products.map(p => ({ ...p })));
    setIsReorderModalVisible(true);
  };

  const updateProductQty = (index, delta) => {
    const newProducts = [...editingProducts];
    const newQty = (newProducts[index].quantity || 1) + delta;
    if (newQty > 0) {
      newProducts[index].quantity = newQty;
      setEditingProducts(newProducts);
    }
  };

  const handleConfirmReorder = () => {
    editingProducts.forEach(product => {
      // Re-add to cart with potentially modified data
      addToCart(
        { id: product.id, name: product.name, price: product.price, image: product.image },
        product.quantity,
        product.selectedColor,
        product.selectedModel,
        product.negotiatedPrice
      );
    });
    
    setIsReorderModalVisible(false);
    Alert.alert(
      'Articles ajoutés',
      'Les articles de votre commande ont été ajoutés à votre panier.',
      [
        { text: 'Voir le panier', onPress: () => onNavigate?.('cart') },
        { text: 'Continuer' }
      ]
    );
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => onNavigate && onNavigate('order_status', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>{item.id}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '20' }]}>
          <MaterialIcons name={getStatusIcon(item.status)} size={14} color={item.statusColor} />
          <Text style={[styles.statusText, { color: item.statusColor }]}>{item.statusLabel}</Text>
        </View>
      </View>

      <View style={styles.productsSection}>
        {item.products.map((product, index) => (
          <View key={index} style={styles.productRow}>
            <Image source={{ uri: product.image || 'https://via.placeholder.com/50' }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productBrand} numberOfLines={1}>{product.brand || 'Ma Boutique'}</Text>
              <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.productQty}>Qty: {product.quantity}</Text>
            </View>
            <Text style={styles.productPrice}>
              {typeof product.price === 'number' ? product.price.toLocaleString() : product.price} XAF
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.sellerInfo}>
          <MaterialIcons name="store" size={16} color="#64748B" />
          <Text style={styles.sellerName}>{item.seller}</Text>
        </View>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{item.total.toLocaleString()} XAF</Text>
        </View>
      </View>

      {item.status === 'en_cours' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => onNavigate && onNavigate('delivery_tracking', { orderId: item.id })}
          >
            <MaterialIcons name="location-on" size={18} color="#FFFFFF" />
            <Text style={styles.trackButtonText}>Suivre</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deliveredButton}
            onPress={() => handleMarkAsDelivered(item.id)}
          >
            <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.trackButtonText}>Reçu</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'annule' && (
        <TouchableOpacity
          style={styles.reorderButton}
          onPress={() => handleOpenReorder(item)}
        >
          <MaterialIcons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.trackButtonText}>Reprendre la commande</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Commandes</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.filterContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Aucune commande</Text>
            <Text style={styles.emptySubtext}>Vos commandes apparaîtront ici</Text>
          </View>
        }
      />

      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item) => {
            return (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.navItem,
                  pressed && styles.navItemPressed,
                ]}
                onPress={() => {
                  if (item.label === 'Marketplace') {
                    onNavigate?.('marketplace_home');
                  } else if (item.label === 'Catégories') {
                    onNavigate?.('category_page');
                  } else if (item.label === 'Nouveauté') {
                    onNavigate?.('new_arrivals');
                  } else if (item.label === 'Panier') {
                    onNavigate?.('cart');
                  }
                }}
              >
                <View style={styles.navIcon}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={16}
                    color="#CBD5F5"
                  />
                </View>
                <Text style={styles.navLabel}>
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

      {/* Reorder Modal */}
      <Modal
        visible={isReorderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsReorderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier et Reprendre</Text>
              <Pressable onPress={() => setIsReorderModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#1E293B" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              {editingProducts.map((product, index) => (
                <View key={index} style={styles.editProductCard}>
                  <Image source={{ uri: product.image || 'https://via.placeholder.com/60' }} style={styles.editProductImage} />
                  <View style={styles.editProductDetails}>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.productPrice}>{product.price.toLocaleString()} XAF</Text>
                    
                    <View style={styles.editActions}>
                      <View style={styles.qtyControl}>
                        <Pressable onPress={() => updateProductQty(index, -1)} style={styles.qtyBtn}>
                          <MaterialIcons name="remove" size={16} color="#1E293B" />
                        </Pressable>
                        <Text style={styles.qtyText}>{product.quantity}</Text>
                        <Pressable onPress={() => updateProductQty(index, 1)} style={styles.qtyBtn}>
                          <MaterialIcons name="add" size={16} color="#1E293B" />
                        </Pressable>
                      </View>
                      
                      <View style={styles.variantBadge}>
                        <Text style={styles.variantText}>{product.selectedColor || 'Standard'}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsReorderModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmReorderBtn} onPress={handleConfirmReorder}>
                <Text style={styles.confirmReorderText}>Ajouter au panier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterButtonActive: {
    backgroundColor: '#137FEC',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  orderDate: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginBottom: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productBrand: {
    fontSize: 10,
    color: '#2BEE79',
    fontWeight: '600',
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  productQty: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerName: {
    fontSize: 13,
    color: '#64748B',
  },
  totalSection: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#137FEC',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#137FEC',
    borderRadius: 12,
    paddingVertical: 12,
    flex: 1,
    gap: 8,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  deliveredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 12,
    flex: 1,
    gap: 8,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#64748B',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalBody: {
    padding: 20,
  },
  editProductCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editProductImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
  },
  editProductDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    gap: 4,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    width: 30,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  variantBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  variantText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmReorderBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#137FEC',
  },
  confirmReorderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
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
