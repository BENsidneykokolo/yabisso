import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};
const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#22C55E',
  cancelled: '#EF4444',
};

export default function SellerOrdersScreen({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => { loadOrders(); }, []);
  useEffect(() => { loadOrders(); }, [filter]);

  const loadOrders = async () => {
    try {
      let query = database.get('orders').query(Q.sortBy('created_at', Q.desc));
      const allOrders = await query.fetch();
      const mapped = allOrders.map(o => ({
        id: o.id,
        buyerName: o.buyerName || 'Client',
        buyerPhone: o.buyerPhone || '',
        address: o.deliveryAddress || '',
        total: parseFloat(o.total) || 0,
        status: o.status || 'pending',
        items: o.items ? JSON.parse(o.items) : [{ name: 'Article', qty: 1, price: o.total }],
        itemsCount: o.itemsCount || 1,
        date: o.createdAt,
        deliveryMethod: o.deliveryMethod || 'pickup',
        paymentMethod: o.paymentMethod || 'wallet',
        notes: o.notes || '',
      }));
      if (filter !== 'all') setOrders(mapped.filter(o => o.status === filter));
      else setOrders(mapped);
    } catch (e) { console.log('Error:', e); }
  };

  const formatCurrency = (n) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';
  const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await database.write(async () => {
        const order = await database.get('orders').find(orderId);
        await order.update(record => { record.status = newStatus; });
        await database.get('sync_queue').create(syncItem => {
          syncItem.action = 'UPDATE_ORDER_STATUS';
          syncItem.payloadJson = JSON.stringify({ id: orderId, status: newStatus });
          syncItem.status = 'pending';
          syncItem.createdAt = new Date().getTime();
        });
      });
      setShowDetailModal(false);
      loadOrders();
      Alert.alert('Succès', `Commande marquée comme "${STATUS_LABELS[newStatus]}"`);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la commande');
    }
  };

  const getBadgeColor = (status) => {
    if (status === 'pending') return '#F59E0B';
    if (status === 'delivered') return '#22C55E';
    if (status === 'cancelled') return '#EF4444';
    return '#3B82F6';
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <Text style={styles.headerTitle}>Mes Commandes</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{orders.length}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterChip, filter === 'all' && styles.filterChipActive]} onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Tout</Text>
        </TouchableOpacity>
        {STATUS_OPTIONS.map(s => (
          <TouchableOpacity key={s} style={[styles.filterChip, filter === s && styles.filterChipActive]} onPress={() => setFilter(s)}>
            <View style={[styles.filterDot, { backgroundColor: STATUS_COLORS[s] }]} />
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>{STATUS_LABELS[s]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.ordersContainer} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={56} color="#4B5563" />
            <Text style={styles.emptyText}>Aucune commande</Text>
            <Text style={styles.emptySubtext}>Les nouvelles commandes apparaîtront ici</Text>
          </View>
        ) : (
          orders.map((order, i) => (
            <Pressable key={i} style={styles.orderCard} onPress={() => { setSelectedOrder(order); setShowDetailModal(true); }}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[order.status] }]} />
                  <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>{STATUS_LABELS[order.status]}</Text>
                </View>
              </View>
              <View style={styles.orderBody}>
                <View style={styles.customerRow}>
                  <MaterialCommunityIcons name="account-outline" size={14} color="#94A3B8" />
                  <Text style={styles.customerText}>{order.buyerName}</Text>
                </View>
                <View style={styles.customerRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={14} color="#94A3B8" />
                  <Text style={styles.customerText}>{order.address || 'Retrait en boutique'}</Text>
                </View>
                <View style={styles.customerRow}>
                  <MaterialCommunityIcons name="package-variant" size={14} color="#94A3B8" />
                  <Text style={styles.customerText}>{order.itemsCount} article(s)</Text>
                </View>
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                <View style={styles.orderMethods}>
                  <View style={styles.methodChip}>
                    <MaterialCommunityIcons name={order.deliveryMethod === 'delivery' ? 'truck-outline' : 'storefront-outline'} size={12} color="#94A3B8" />
                    <Text style={styles.methodText}>{order.deliveryMethod === 'delivery' ? 'Livraison' : 'Retrait'}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails Commande</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {selectedOrder && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Commande #{selectedOrder.id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.detailMeta}>{formatDate(selectedOrder.date)}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Client</Text>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="account-outline" size={16} color="#94A3B8" />
                    <Text style={styles.infoText}>{selectedOrder.buyerName}</Text>
                  </View>
                  {selectedOrder.buyerPhone && (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="phone-outline" size={16} color="#94A3B8" />
                      <Text style={styles.infoText}>{selectedOrder.buyerPhone}</Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={16} color="#94A3B8" />
                    <Text style={styles.infoText}>{selectedOrder.address || 'Retrait en boutique'}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Articles ({selectedOrder.itemsCount})</Text>
                  {selectedOrder.items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name || 'Article'}</Text>
                        <Text style={styles.itemQty}>Qté: {item.qty || 1}</Text>
                      </View>
                      <Text style={styles.itemPrice}>{formatCurrency(item.price || 0)}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatCurrency(selectedOrder.total)}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionLabel}>Actions</Text>
                  <View style={styles.actionsGrid}>
                    {selectedOrder.status === 'pending' && (
                      <>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#22C55E20', borderColor: '#22C55E40' }]} onPress={() => updateOrderStatus(selectedOrder.id, 'confirmed')}>
                          <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                          <Text style={[styles.actionBtnText, { color: '#22C55E' }]}>Confirmer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF444420', borderColor: '#EF444440' }]} onPress={() => updateOrderStatus(selectedOrder.id, 'cancelled')}>
                          <Ionicons name="close-circle" size={20} color="#EF4444" />
                          <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Annuler</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {selectedOrder.status === 'confirmed' && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3B82F620', borderColor: '#3B82F640' }]} onPress={() => updateOrderStatus(selectedOrder.id, 'shipped')}>
                        <MaterialCommunityIcons name="truck-outline" size={20} color="#3B82F6" />
                        <Text style={[styles.actionBtnText, { color: '#3B82F6' }]}>Expédier</Text>
                      </TouchableOpacity>
                    )}
                    {selectedOrder.status === 'shipped' && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#8B5CF620', borderColor: '#8B5CF640' }]} onPress={() => updateOrderStatus(selectedOrder.id, 'delivered')}>
                        <Ionicons name="checkmark-done-circle" size={20} color="#8B5CF6" />
                        <Text style={[styles.actionBtnText, { color: '#8B5CF6' }]}>Marquer livrée</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(30, 40, 50, 0.9)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  countBadge: { backgroundColor: 'rgba(43, 238, 121, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  countText: { color: '#2BEE79', fontSize: 12, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, gap: 8, flexWrap: 'wrap' },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(24, 32, 40, 0.9)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', gap: 6 },
  filterChipActive: { backgroundColor: 'rgba(43, 238, 121, 0.15)', borderColor: 'rgba(43, 238, 121, 0.4)' },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { color: '#94A3B8', fontSize: 12 },
  filterTextActive: { color: '#2BEE79', fontWeight: '600' },
  ordersContainer: { paddingHorizontal: 20, paddingBottom: 120 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#94A3B8', fontSize: 13, marginTop: 8 },
  orderCard: { backgroundColor: 'rgba(24, 32, 40, 0.95)', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  orderId: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  orderDate: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderBody: { gap: 8, marginBottom: 12 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customerText: { color: '#CBD5F5', fontSize: 13 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.06)' },
  orderTotal: { color: '#2BEE79', fontSize: 18, fontWeight: '700' },
  orderMethods: { flexDirection: 'row', gap: 6 },
  methodChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.06)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  methodText: { color: '#94A3B8', fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1a2633', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  modalTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  modalBody: { padding: 20 },
  detailSection: { marginBottom: 20 },
  detailTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  detailMeta: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  sectionLabel: { color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoText: { color: '#CBD5F5', fontSize: 14 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.06)' },
  itemInfo: {},
  itemName: { color: '#F8FAFC', fontSize: 14 },
  itemQty: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  itemPrice: { color: '#2BEE79', fontSize: 14, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 20 },
  totalLabel: { color: '#94A3B8', fontSize: 14 },
  totalValue: { color: '#2BEE79', fontSize: 22, fontWeight: '700' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: { flex: 1, minWidth: 140, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1, gap: 8 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
});