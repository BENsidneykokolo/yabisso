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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function RestaurantSellerDashboard({ onBack, onNavigate }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    revenue: 0,
    todayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger restaurant
      const savedRestaurant = await SecureStore.getItemAsync('restaurant_shop_info');
      if (savedRestaurant) {
        setRestaurant(JSON.parse(savedRestaurant));
      }

      // Charger commandes
      const savedOrders = await SecureStore.getItemAsync('restaurant_seller_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        setRecentOrders(orders.slice(0, 5));
        calculateStats(orders);
      }
    } catch (e) {
      console.error('[Dashboard] Erreur loadData:', e);
    }
  };

  const calculateStats = (orders) => {
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let pendingOrders = orders.filter(o => o.status === 'new').length;
    let activeOrders = orders.filter(o => 
      o.status === 'accepted' || o.status === 'preparing' || o.status === 'ready' || o.status === 'assigned'
    ).length;
    let completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
    
    let revenue = 0;
    let todayRevenue = 0;
    
    orders.forEach(o => {
      if (o.status === 'delivered' || o.status === 'completed') {
        revenue += parseInt(o.total || 0);
        if (o.createdAt >= todayStart.getTime()) {
          todayRevenue += parseInt(o.total || 0);
        }
      }
    });
    
    setStats({
      totalOrders: orders.length,
      pendingOrders,
      activeOrders,
      completedOrders,
      revenue,
      todayRevenue,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#F59E0B';
      case 'accepted': return '#3B82F6';
      case 'preparing': return '#8B5CF6';
      case 'ready': return '#10B981';
      case 'assigned': return '#06B6D4';
      case 'delivered': return '#2BEE79';
      case 'cancelled': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'Nouvelle';
      case 'accepted': return 'Acceptée';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prête';
      case 'assigned': return 'Assignée';
      case 'delivered': return 'Livrée';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (amount) => {
    return parseInt(amount || 0).toLocaleString('fr-FR') + ' FCFA';
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2BEE79" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Tableau de bord</Text>
            {restaurant?.name && (
              <Text style={styles.headerSubtitle}>{restaurant.name}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.notificationBtn} onPress={() => onNavigate('restaurant_seller_notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#E6EDF3" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cash-outline" size={20} color="#0E151B" />
            </View>
            <Text style={styles.statValue}>{formatPrice(stats.todayRevenue)}</Text>
            <Text style={styles.statLabel}>Revenus aujourd'hui</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="clock-alert" size={24} color="#F59E0B" />
            <Text style={styles.statValueDark}>{stats.pendingOrders}</Text>
            <Text style={styles.statLabelDark}>En attente</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="chef-hat" size={24} color="#8B5CF6" />
            <Text style={styles.statValueDark}>{stats.activeOrders}</Text>
            <Text style={styles.statLabelDark}>En cours</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
            <Text style={styles.statValueDark}>{stats.completedOrders}</Text>
            <Text style={styles.statLabelDark}>Terminées</Text>
          </View>
        </View>

        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <MaterialCommunityIcons name="trending-up" size={24} color="#2BEE79" />
            <Text style={styles.revenueTitle}>Revenus totaux</Text>
          </View>
          <Text style={styles.revenueAmount}>{formatPrice(stats.revenue)}</Text>
          <Text style={styles.revenueSubtitle}>{stats.totalOrders} commandes</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('restaurant_seller_orders')}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Ionicons name="receipt" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Commandes</Text>
              {stats.pendingOrders > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{stats.pendingOrders}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('restaurant_seller')}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <MaterialCommunityIcons name="food-variant" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Mes plats</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('restaurant_seller_menu')}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <MaterialCommunityIcons name="store-edit" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.actionText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate('restaurant_seller_couriers')}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Ionicons name="bicycle" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionText}>Livreurs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.ordersSection}>
          <View style={styles.ordersSectionHeader}>
            <Text style={styles.sectionTitle}>Commandes récentes</Text>
            <TouchableOpacity onPress={() => onNavigate('restaurant_seller_orders')}>
              <Text style={styles.seeAllText}>Tout voir</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <MaterialCommunityIcons name="receipt-text-outline" size={48} color="#4B5563" />
              <Text style={styles.emptyText}>Aucune commande</Text>
              <Text style={styles.emptySubtext}>Vos commandes apparaîtront ici</Text>
            </View>
          ) : (
            recentOrders.map((order, index) => (
              <TouchableOpacity 
                key={order.id || index} 
                style={styles.orderCard}
                onPress={() => onNavigate('restaurant_seller_order_detail', { orderId: order.id })}
              >
                <View style={styles.orderCardLeft}>
                  <View style={[styles.orderStatusDot, { backgroundColor: getStatusColor(order.status) }]} />
                  <View>
                    <Text style={styles.orderId}>Commande #{order.id?.slice(-6) || '000000'}</Text>
                    <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
                  </View>
                </View>
                <View style={styles.orderCardRight}>
                  <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                  <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Order Flow Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Cycle de commande</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineStep}>
              <View style={[styles.timelineIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Ionicons name="notifications" size={16} color="#F59E0B" />
              </View>
              <Text style={styles.timelineText}>Nouvelle commande</Text>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineStep}>
              <View style={[styles.timelineIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Ionicons name="checkmark" size={16} color="#3B82F6" />
              </View>
              <Text style={styles.timelineText}>Accepter</Text>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineStep}>
              <View style={[styles.timelineIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <MaterialCommunityIcons name="chef-hat" size={16} color="#8B5CF6" />
              </View>
              <Text style={styles.timelineText}>Préparer</Text>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineStep}>
              <View style={[styles.timelineIcon, { backgroundColor: 'rgba(6, 182, 212, 0.2)' }]}>
                <Ionicons name="bicycle" size={16} color="#06B6D4" />
              </View>
              <Text style={styles.timelineText}>Assigner livreur</Text>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineStep}>
              <View style={[styles.timelineIcon, { backgroundColor: 'rgba(43, 238, 121, 0.2)' }]}>
                <Ionicons name="checkmark-circle" size={16} color="#2BEE79" />
              </View>
              <Text style={styles.timelineText}>Livrer</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  notificationBtn: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  statCardPrimary: {
    backgroundColor: '#2BEE79',
    flex: 1,
    minWidth: '100%',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 21, 27, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: '#0E151B',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(14, 21, 27, 0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  statValueDark: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabelDark: {
    color: '#94A3B8',
    fontSize: 11,
  },
  revenueCard: {
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  revenueTitle: {
    color: '#94A3B8',
    fontSize: 14,
  },
  revenueAmount: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  revenueSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  actionBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  ordersSection: {
    marginBottom: 24,
  },
  ordersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#2BEE79',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyOrders: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(24, 32, 40, 0.5)',
    borderRadius: 16,
  },
  emptyText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  orderCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  orderId: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  orderTime: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  orderCardRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: '700',
  },
  orderStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  timelineSection: {
    marginBottom: 24,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  timelineStep: {
    alignItems: 'center',
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  timelineText: {
    color: '#94A3B8',
    fontSize: 9,
    textAlign: 'center',
  },
  timelineLine: {
    width: 20,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});