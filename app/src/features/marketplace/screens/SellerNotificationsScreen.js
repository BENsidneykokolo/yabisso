import React, { useState, useEffect } from 'react';
import {
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

const NOTIF_TYPES = {
  order_new: { icon: 'cart-outline', color: '#3B82F6', label: 'Nouvelle commande' },
  order_confirmed: { icon: 'checkmark-circle', color: '#22C55E', label: 'Commande confirmée' },
  order_delivered: { icon: 'package-variant', color: '#8B5CF6', label: 'Commande livrée' },
  product_low_stock: { icon: 'alert', color: '#F59E0B', label: 'Stock bas' },
  product_pending: { icon: 'clock-outline', color: '#F59E0B', label: 'En attente validation' },
  validation_done: { icon: 'check-decagram', color: '#22C55E', label: 'Produit validé' },
  review: { icon: 'star-outline', color: '#FACC15', label: 'Nouvel avis' },
  system: { icon: 'information-outline', color: '#94A3B8', label: 'Système' },
};

export default function SellerNotificationsScreen({ onBack }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const saved = await SecureStore.getItemAsync('seller_notifications');
      const list = saved ? JSON.parse(saved) : [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read).length);
    } catch (e) { console.log('Error:', e); }
    try {
      const products = await database.get('products').query().fetch();
      const orders = await database.get('orders').query(Q.sortBy('created_at', Q.desc), Q.take(10)).fetch();
      const systemNotifs = [];

      const lowStock = products.filter(p => (p.stock || 0) < 5 && p.isValidated);
      if (lowStock.length > 0) {
        systemNotifs.push({
          id: 'stock_' + Date.now(),
          type: 'product_low_stock',
          title: 'Alerte stock',
          body: `${lowStock.length} produit(s) en stock bas`,
          time: Date.now(),
          read: false,
        });
      }
      const pendingProducts = products.filter(p => !p.isValidated);
      if (pendingProducts.length > 0) {
        systemNotifs.push({
          id: 'pending_' + Date.now(),
          type: 'product_pending',
          title: 'En attente',
          body: `${pendingProducts.length} produit(s) en attente de validation kiosque`,
          time: Date.now() - 60000,
          read: false,
        });
      }
      orders.forEach(o => {
        if (o.status === 'pending') {
          systemNotifs.push({
            id: 'order_' + o.id,
            type: 'order_new',
            title: 'Nouvelle commande',
            body: `Commande #${o.id?.slice(-6).toUpperCase()} - ${new Intl.NumberFormat('fr-FR').format(parseFloat(o.total) || 0)} FCFA`,
            time: o.createdAt,
            read: false,
          });
        }
      });

      if (systemNotifs.length > 0) {
        const existingIds = new Set(notifications.map(n => n.id));
        const newNotifs = systemNotifs.filter(n => !existingIds.has(n.id));
        if (newNotifs.length > 0) {
          const updated = [...newNotifs, ...notifications].slice(0, 50);
          setNotifications(updated);
          setUnreadCount(updated.filter(n => !n.read).length);
          await SecureStore.setItemAsync('seller_notifications', JSON.stringify(updated));
        }
      }
    } catch (e) { console.log('Error:', e); }
  };

  const markAsRead = async (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    await SecureStore.setItemAsync('seller_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    await SecureStore.setItemAsync('seller_notifications', JSON.stringify(updated));
  };

  const deleteNotification = async (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    await SecureStore.setItemAsync('seller_notifications', JSON.stringify(updated));
  };

  const formatTime = (ts) => {
    const diff = Date.now() - (ts || 0);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  const getTypeInfo = (type) => NOTIF_TYPES[type] || NOTIF_TYPES.system;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Tout marquer lu</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <MaterialCommunityIcons name="bell-alert" size={16} color="#F59E0B" />
          <Text style={styles.unreadText}>{unreadCount} notification(s) non lue(s)</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.notifContainer} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bell-off-outline" size={56} color="#4B5563" />
            <Text style={styles.emptyText}>Aucune notification</Text>
            <Text style={styles.emptySubtext}>Les alertes apparaîtront ici</Text>
          </View>
        ) : (
          notifications.map((notif, i) => {
            const typeInfo = getTypeInfo(notif.type);
            return (
              <View key={i} style={[styles.notifCard, !notif.read && styles.notifCardUnread]}>
                <View style={[styles.notifIcon, { backgroundColor: typeInfo.color + '20' }]}>
                  <MaterialCommunityIcons name={typeInfo.icon} size={20} color={typeInfo.color} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifHeader}>
                    <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>{notif.title}</Text>
                    <Text style={styles.notifTime}>{formatTime(notif.time)}</Text>
                  </View>
                  <Text style={styles.notifBody}>{notif.body}</Text>
                  <View style={styles.notifActions}>
                    {!notif.read && (
                      <TouchableOpacity style={styles.notifAction} onPress={() => markAsRead(notif.id)}>
                        <Ionicons name="checkmark-done-outline" size={14} color="#94A3B8" />
                        <Text style={styles.notifActionText}>Marquer lu</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.notifAction} onPress={() => deleteNotification(notif.id)}>
                      <MaterialCommunityIcons name="trash-can-outline" size={14} color="#EF4444" />
                      <Text style={[styles.notifActionText, { color: '#EF4444' }]}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {!notif.read && <View style={styles.unreadDot} />}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(30, 40, 50, 0.9)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(43, 238, 121, 0.15)' },
  markAllText: { color: '#2BEE79', fontSize: 12, fontWeight: '600' },
  unreadBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 12, padding: 12, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, gap: 8 },
  unreadText: { color: '#F59E0B', fontSize: 12, fontWeight: '600' },
  notifContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#94A3B8', fontSize: 13, marginTop: 8 },
  notifCard: { flexDirection: 'row', backgroundColor: 'rgba(24, 32, 40, 0.9)', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  notifCardUnread: { borderColor: 'rgba(43, 238, 121, 0.3)', backgroundColor: 'rgba(43, 238, 121, 0.05)' },
  notifIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { color: '#CBD5F5', fontSize: 14, fontWeight: '600', flex: 1 },
  notifTitleUnread: { color: '#F8FAFC', fontWeight: '700' },
  notifTime: { color: '#94A3B8', fontSize: 11 },
  notifBody: { color: '#94A3B8', fontSize: 13, marginBottom: 8 },
  notifActions: { flexDirection: 'row', gap: 16 },
  notifAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notifActionText: { color: '#94A3B8', fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2BEE79', alignSelf: 'center' },
});