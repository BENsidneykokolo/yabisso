import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

export default function SellerDashboardScreen({ onBack, onNavigate }) {
  const [shopInfo, setShopInfo] = useState({ name: 'Ma Boutique', location: 'Centre-ville', avatar: null, banner: null });
  const [stats, setStats] = useState({
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    activeProducts: 0,
    pendingProducts: 0,
    rating: 4.5,
    followers: 128,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadShopInfo();
    await loadStats();
    await loadRecentOrders();
    await loadAlerts();
  };

  const loadShopInfo = async () => {
    try {
      const saved = await SecureStore.getItemAsync('seller_shop_info');
      if (saved) setShopInfo(JSON.parse(saved));
    } catch (e) { console.log('Error:', e); }
  };

  const loadStats = async () => {
    try {
      const products = await database.get('products').query().fetch();
      const orders = await database.get('orders').query().fetch();
      const now = Date.now();
      const dayMs = 86400000;
      
      const todayStart = now - (now % dayMs);
      const weekStart = now - (7 * dayMs);
      const monthStart = now - (30 * dayMs);

      const todayOrders = orders.filter(o => o.createdAt >= todayStart);
      const weekOrders = orders.filter(o => o.createdAt >= weekStart);
      const monthOrders = orders.filter(o => o.createdAt >= monthStart);

      setStats(prev => ({
        ...prev,
        todaySales: todayOrders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0),
        weekSales: weekOrders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0),
        monthSales: monthOrders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0),
        pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        activeProducts: products.filter(p => p.isValidated).length,
        pendingProducts: products.filter(p => !p.isValidated).length,
      }));
    } catch (e) { console.log('Error:', e); }
  };

  const loadRecentOrders = async () => {
    try {
      const orders = await database.get('orders').query(Q.sortBy('created_at', Q.desc), Q.take(5)).fetch();
      setRecentOrders(orders.map(o => ({
        id: o.id,
        customer: o.buyerName || 'Client',
        total: parseFloat(o.total) || 0,
        status: o.status || 'pending',
        items: o.itemsCount || 1,
        date: o.createdAt,
      })));
    } catch (e) { console.log('Error:', e); }
  };

  const loadAlerts = async () => {
    try {
      const products = await database.get('products').query().fetch();
      const lowStock = products.filter(p => (p.stock || 0) < 5 && p.isValidated);
      const notValidated = products.filter(p => !p.isValidated);
      const alertsList = [];
      if (lowStock.length > 0) alertsList.push({ type: 'stock', count: lowStock.length, text: 'Produits en stock bas' });
      if (notValidated.length > 0) alertsList.push({ type: 'pending', count: notValidated.length, text: 'En attente de validation' });
      setAlerts(alertsList);
      const pendingOrders = (await database.get('orders').query().fetch()).filter(o => o.status === 'pending').length;
      setNotifications(pendingOrders + lowStock.length);
    } catch (e) { console.log('Error:', e); }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'shipped': return '#8B5CF6';
      case 'delivered': return '#22C55E';
      case 'cancelled': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Mon Tableau de Bord</Text>
          <Pressable style={styles.notificationBtn} onPress={() => onNavigate?.('seller_notifications')}>
            <Ionicons name="notifications-outline" size={20} color="#E6EDF3" />
            {notifications > 0 && <View style={styles.notificationBadge}><Text style={styles.notificationText}>{notifications}</Text></View>}
          </Pressable>
        </View>

        <View style={styles.shopCard}>
          <View style={styles.shopAvatar}>
            {shopInfo.avatar ? (
              <Image source={{ uri: shopInfo.avatar }} style={styles.shopAvatarImg} />
            ) : (
              <MaterialCommunityIcons name="storefront" size={22} color="#0E151B" />
            )}
          </View>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{shopInfo.name}</Text>
            <Text style={styles.shopMeta}>{shopInfo.location}</Text>
          </View>
          <TouchableOpacity style={styles.previewBtn} onPress={() => onNavigate?.('seller_profile')}>
            <Ionicons name="eye-outline" size={18} color="#2BEE79" />
          </TouchableOpacity>
        </View>

        <View style={styles.alertRow}>
          {alerts.map((alert, i) => (
            <TouchableOpacity key={i} style={styles.alertChip} onPress={() => {
              if (alert.type === 'stock') onNavigate?.('seller_products');
              else if (alert.type === 'pending') onNavigate?.('seller_products');
            }}>
              <MaterialCommunityIcons name={alert.type === 'stock' ? 'alert' : 'clock-outline'} size={14} color="#F59E0B" />
              <Text style={styles.alertText}>{alert.count} {alert.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Aperçu des Ventes</Text>
        <View style={styles.salesRow}>
          <View style={styles.saleCard}>
            <Text style={styles.saleLabel}>Aujourd'hui</Text>
            <Text style={styles.saleValue}>{formatCurrency(stats.todaySales)}</Text>
          </View>
          <View style={styles.saleCard}>
            <Text style={styles.saleLabel}>Cette semaine</Text>
            <Text style={styles.saleValue}>{formatCurrency(stats.weekSales)}</Text>
          </View>
        </View>
        <View style={styles.salesRow}>
          <View style={[styles.saleCard, styles.saleCardPrimary]}>
            <Text style={styles.saleLabelWhite}>Ce mois</Text>
            <Text style={styles.saleValueWhite}>{formatCurrency(stats.monthSales)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats.pendingOrders}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <MaterialCommunityIcons name="check-circle-outline" size={18} color="#22C55E" />
            </View>
            <Text style={styles.statValue}>{stats.completedOrders}</Text>
            <Text style={styles.statLabel}>Livrées</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <MaterialCommunityIcons name="cancel-outline" size={18} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{stats.cancelledOrders}</Text>
            <Text style={styles.statLabel}>Annulées</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <MaterialCommunityIcons name="package-variant" size={18} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.activeProducts}</Text>
            <Text style={styles.statLabel}>Produits actifs</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Dernières Commandes</Text>
        {recentOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={40} color="#4B5563" />
            <Text style={styles.emptyText}>Aucune commande</Text>
            <Text style={styles.emptySubtext}>Vos commandes apparaîtront ici</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {recentOrders.map((order, i) => (
              <View key={i} style={styles.orderItem}>
                <View style={styles.orderLeft}>
                  <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.orderCustomer}>{order.customer}</Text>
                  <Text style={styles.orderItems}>{order.items} article(s)</Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                  <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.seeAllBtn} onPress={() => onNavigate?.('seller_orders')}>
          <Text style={styles.seeAllText}>Voir toutes les commandes</Text>
          <Ionicons name="chevron-forward" size={16} color="#2BEE79" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Actions Rapides</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate?.('market_add_product')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(43, 238, 121, 0.15)' }]}>
              <Ionicons name="add" size={22} color="#2BEE79" />
            </View>
            <Text style={styles.actionLabel}>Ajouter produit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate?.('seller_profile')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <MaterialCommunityIcons name="storefront-outline" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.actionLabel}>Ma boutique</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate?.('seller_analytics')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <MaterialCommunityIcons name="chart-line" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.actionLabel}>Analyses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => onNavigate?.('seller_orders')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={22} color="#F59E0B" />
            </View>
            <Text style={styles.actionLabel}>Commandes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatItem}>
            <MaterialCommunityIcons name="star" size={16} color="#FACC15" />
            <Text style={styles.quickStatValue}>{stats.rating}</Text>
            <Text style={styles.quickStatLabel}>Note</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <MaterialCommunityIcons name="account-group-outline" size={16} color="#94A3B8" />
            <Text style={styles.quickStatValue}>{stats.followers}</Text>
            <Text style={styles.quickStatLabel}>Followers</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <MaterialCommunityIcons name="package-variant-closed" size={16} color="#94A3B8" />
            <Text style={styles.quickStatValue}>{stats.pendingProducts}</Text>
            <Text style={styles.quickStatLabel}>En validation</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  scrollContent: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(30, 40, 50, 0.9)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  notificationBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(30, 40, 50, 0.9)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  notificationBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  notificationText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  shopCard: { marginTop: 18, padding: 14, borderRadius: 18, backgroundColor: 'rgba(24, 32, 40, 0.9)', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  shopAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#2BEE79', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  shopAvatarImg: { width: '100%', height: '100%', borderRadius: 14 },
  shopInfo: { flex: 1 },
  shopName: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  shopMeta: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  previewBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(43, 238, 121, 0.15)', alignItems: 'center', justifyContent: 'center' },
  alertRow: { flexDirection: 'row', marginTop: 14, gap: 10, flexWrap: 'wrap' },
  alertChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 6 },
  alertText: { color: '#F59E0B', fontSize: 11, fontWeight: '600' },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  salesRow: { flexDirection: 'row', gap: 10 },
  saleCard: { flex: 1, padding: 14, borderRadius: 16, backgroundColor: 'rgba(24, 32, 40, 0.9)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  saleCardPrimary: { backgroundColor: 'rgba(43, 238, 121, 0.12)', borderColor: 'rgba(43, 238, 121, 0.3)' },
  saleLabel: { color: '#94A3B8', fontSize: 11 },
  saleValue: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', marginTop: 4 },
  saleLabelWhite: { color: '#2BEE79', fontSize: 11 },
  saleValueWhite: { color: '#2BEE79', fontSize: 15, fontWeight: '700', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', padding: 14, borderRadius: 16, backgroundColor: 'rgba(24, 32, 40, 0.9)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { color: '#F8FAFC', fontSize: 20, fontWeight: '700' },
  statLabel: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: '#F8FAFC', fontSize: 15, fontWeight: '600', marginTop: 12 },
  emptySubtext: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  ordersList: { gap: 10 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 16, backgroundColor: 'rgba(24, 32, 40, 0.9)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  orderLeft: {},
  orderId: { color: '#94A3B8', fontSize: 11, marginBottom: 4 },
  orderCustomer: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  orderItems: { color: '#7C8A9A', fontSize: 11, marginTop: 2 },
  orderRight: { alignItems: 'flex-end' },
  orderTotal: { color: '#2BEE79', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  orderStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  orderStatusText: { fontSize: 11, fontWeight: '600' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, gap: 4 },
  seeAllText: { color: '#2BEE79', fontSize: 13, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47%', padding: 16, borderRadius: 16, backgroundColor: 'rgba(24, 32, 40, 0.9)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { color: '#CBD5F5', fontSize: 12, fontWeight: '600' },
  quickStatsRow: { flexDirection: 'row', marginTop: 24, marginBottom: 20, backgroundColor: 'rgba(24, 32, 40, 0.9)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  quickStatItem: { flex: 1, alignItems: 'center', gap: 4 },
  quickStatValue: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  quickStatLabel: { color: '#94A3B8', fontSize: 10 },
  quickStatDivider: { width: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginHorizontal: 8 },
});