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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MOCK_ORDERS = [
  {
    id: 'CMD-8821',
    date: '15 oct 2024',
    status: 'en_cours',
    statusLabel: 'En cours',
    statusColor: '#EAB308',
    products: [
      { name: 'Nike Air Max', quantity: 1, price: 25000, image: 'https://picsum.photos/100' },
    ],
    total: 25000,
    seller: 'Boutique Sport',
    deliveryMethod: 'Standard',
  },
  {
    id: 'CMD-8820',
    date: '14 oct 2024',
    status: 'livre',
    statusLabel: 'Livrée',
    statusColor: '#22C55E',
    products: [
      { name: 'iPhone 13 Pro', quantity: 1, price: 450000, image: 'https://picsum.photos/101' },
    ],
    total: 450000,
    seller: 'Tech Store',
    deliveryMethod: 'Express',
  },
  {
    id: 'CMD-8819',
    date: '12 oct 2024',
    status: 'livre',
    statusLabel: 'Livrée',
    statusColor: '#22C55E',
    products: [
      { name: 'Robe Summer', quantity: 2, price: 15000, image: 'https://picsum.photos/102' },
    ],
    total: 30000,
    seller: 'Mode Africa',
    deliveryMethod: 'Standard',
  },
  {
    id: 'CMD-8818',
    date: '10 oct 2024',
    status: 'annule',
    statusLabel: 'Annulée',
    statusColor: '#EF4444',
    products: [
      { name: 'Samsung Galaxy S21', quantity: 1, price: 180000, image: 'https://picsum.photos/103' },
    ],
    total: 180000,
    seller: 'Electro Plus',
    deliveryMethod: 'Standard',
  },
  {
    id: 'CMD-8817',
    date: '08 oct 2024',
    status: 'livre',
    statusLabel: 'Livrée',
    statusColor: '#22C55E',
    products: [
      { name: 'Basket Adidas', quantity: 1, price: 35000, image: 'https://picsum.photos/104' },
      { name: 'Chaussettes Sport', quantity: 3, price: 3000, image: 'https://picsum.photos/105' },
    ],
    total: 44000,
    seller: 'Sports World',
    deliveryMethod: 'Standard',
  },
];

const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'en_cours', label: 'En cours' },
  { key: 'livre', label: 'Livrées' },
  { key: 'annule', label: 'Annulées' },
];

export default function OrdersScreen({ onBack, onNavigate }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredOrders = activeFilter === 'all'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(order => order.status === activeFilter);

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
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.productQty}>Qty: {product.quantity}</Text>
            </View>
            <Text style={styles.productPrice}>{product.price.toLocaleString()} XAF</Text>
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
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => onNavigate && onNavigate('delivery_tracking', { orderId: item.id })}
        >
          <MaterialIcons name="location-on" size={18} color="#FFFFFF" />
          <Text style={styles.trackButtonText}>Suivre la livraison</Text>
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
    marginTop: 12,
    gap: 8,
  },
  trackButtonText: {
    fontSize: 14,
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
});
