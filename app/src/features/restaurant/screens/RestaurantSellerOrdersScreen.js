import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const TABS = [
  { id: 'all', label: 'Toutes', color: '#94A3B8' },
  { id: 'new', label: 'Nouvelles', color: '#F59E0B' },
  { id: 'active', label: 'En cours', color: '#3B82F6' },
  { id: 'completed', label: 'Terminées', color: '#10B981' },
];

const STATUS_MAP = {
  new: { label: 'Nouvelle', color: '#F59E0B', icon: 'time' },
  accepted: { label: 'Acceptée', color: '#3B82F6', icon: 'checkmark-circle' },
  preparing: { label: 'En préparation', color: '#8B5CF6', icon: 'restaurant' },
  ready: { label: 'Prête', color: '#10B981', icon: 'checkmark-done' },
  assigned: { label: 'Assignée', color: '#06B6D4', icon: 'bicycle' },
  delivered: { label: 'Livrée', color: '#2BEE79', icon: 'checkmark-circle' },
  completed: { label: 'Terminée', color: '#2BEE79', icon: 'checkmark-done' },
  cancelled: { label: 'Annulée', color: '#EF4444', icon: 'close-circle' },
};

export default function RestaurantSellerOrders({ onBack, onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const saved = await SecureStore.getItemAsync('restaurant_seller_orders');
      if (saved) {
        setOrders(JSON.parse(saved));
      }
    } catch (e) {
      console.error('[Orders] Erreur load:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'new':
        return orders.filter(o => o.status === 'new');
      case 'active':
        return orders.filter(o => ['accepted', 'preparing', 'ready', 'assigned'].includes(o.status));
      case 'completed':
        return orders.filter(o => ['delivered', 'completed', 'cancelled'].includes(o.status));
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatPrice = (amount) => {
    return parseInt(amount || 0).toLocaleString('fr-FR') + ' FCFA';
  };

  const getCountForTab = (tabId) => {
    switch (tabId) {
      case 'new':
        return orders.filter(o => o.status === 'new').length;
      case 'active':
        return orders.filter(o => ['accepted', 'preparing', 'ready', 'assigned'].includes(o.status)).length;
      case 'completed':
        return orders.filter(o => ['delivered', 'completed', 'cancelled'].includes(o.status)).length;
      default:
        return orders.length;
    }
  };

  const renderOrderCard = ({ item: order }) => {
    const status = STATUS_MAP[order.status] || STATUS_MAP.new;
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => onNavigate('restaurant_seller_order_detail', { orderId: order.id })}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>#{order.id?.slice(-6) || '000000'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Ionicons name={status.icon} size={12} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
        </View>

        {order.customerName && (
          <View style={styles.customerRow}>
            <Ionicons name="person-outline" size={14} color="#94A3B8" />
            <Text style={styles.customerName}>{order.customerName}</Text>
          </View>
        )}

        {order.items && order.items.length > 0 && (
          <View style={styles.itemsPreview}>
            <Text style={styles.itemsText}>
              {order.items.map(i => i.name).join(', ')}
            </Text>
          </View>
        )}

        <View style={styles.orderFooter}>
          <View style={styles.deliveryInfo}>
            {order.deliveryType === 'delivery' ? (
              <>
                <MaterialCommunityIcons name="truck-delivery" size={14} color="#94A3B8" />
                <Text style={styles.deliveryText}>Livraison</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="storefront" size={14} color="#94A3B8" />
                <Text style={styles.deliveryText}>Retrait sur place</Text>
              </>
            )}
          </View>
          <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
        </View>

        {order.courierName && (
          <View style={styles.courierRow}>
            <Ionicons name="bicycle-outline" size={14} color="#06B6D4" />
            <Text style={styles.courierText}>Livreur: {order.courierName}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <Text style={styles.headerTitle}>Commandes</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => onNavigate('restaurant_seller_notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color="#E6EDF3" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TABS.map((tab) => {
            const count = getCountForTab(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2BEE79" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="receipt-text-outline" size={64} color="#4B5563" />
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'all' 
                ? 'Vos commandes apparaîtront ici'
                : `Aucune commande ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()}`
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    marginRight: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#2BEE79',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0E151B',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(14, 21, 27, 0.3)',
  },
  tabBadgeText: {
    color: '#2BEE79',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBadgeTextActive: {
    color: '#0E151B',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  orderCard: {
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderTime: {
    color: '#94A3B8',
    fontSize: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  customerName: {
    color: '#94A3B8',
    fontSize: 13,
  },
  itemsPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  itemsText: {
    color: '#E6EDF3',
    fontSize: 13,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  orderTotal: {
    color: '#2BEE79',
    fontSize: 16,
    fontWeight: '700',
  },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  courierText: {
    color: '#06B6D4',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});