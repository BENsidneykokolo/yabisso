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

export default function RestaurantSellerNotifications({ onBack, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const saved = await SecureStore.getItemAsync('restaurant_seller_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        const defaultNotifs = [
          {
            id: '1',
            type: 'new_order',
            title: 'Nouvelle commande',
            message: 'Vous avez reçu une nouvelle commande de Ndongo A.',
            orderId: 'ORD001',
            createdAt: Date.now() - 300000,
            read: false,
          },
          {
            id: '2',
            type: 'status_update',
            title: 'Commande livrée',
            message: 'La commande #ORD001 a été livrée avec succès',
            orderId: 'ORD001',
            createdAt: Date.now() - 600000,
            read: false,
          },
          {
            id: '3',
            type: 'courier_assigned',
            title: 'Livreur assigné',
            message: 'Jean Kouamé a été assigné à la commande #ORD002',
            orderId: 'ORD002',
            createdAt: Date.now() - 1800000,
            read: true,
          },
        ];
        setNotifications(defaultNotifs);
      }
    } catch (e) {
      console.error('[Notifications] Erreur load:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updated);
      await SecureStore.setItemAsync('restaurant_seller_notifications', JSON.stringify(updated));
    } catch (e) {
      console.error('[Notifications] Erreur markAsRead:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      await SecureStore.setItemAsync('restaurant_seller_notifications', JSON.stringify(updated));
    } catch (e) {
      console.error('[Notifications] Erreur markAllAsRead:', e);
    }
  };

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order': return { icon: 'receipt', color: '#F59E0B' };
      case 'status_update': return { icon: 'checkmark-circle', color: '#10B981' };
      case 'courier_assigned': return { icon: 'bicycle', color: '#06B6D4' };
      case 'delivery_completed': return { icon: 'checkmark-done-circle', color: '#2BEE79' };
      case 'cancelled': return { icon: 'close-circle', color: '#EF4444' };
      default: return { icon: 'notifications', color: '#94A3B8' };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item: notification }) => {
    const { icon, color } = getNotificationIcon(notification.type);
    
    return (
      <TouchableOpacity 
        style={[styles.notificationCard, !notification.read && styles.notificationCardUnread]}
        onPress={() => {
          markAsRead(notification.id);
          if (notification.orderId) {
            onNavigate('restaurant_seller_order_detail', { orderId: notification.orderId });
          }
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, !notification.read && styles.notificationTitleUnread]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
          </View>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          {notification.orderId && (
            <Text style={styles.notificationOrder}>Commande #{notification.orderId?.slice(-6)}</Text>
          )}
        </View>
        {!notification.read && <View style={styles.unreadDot} />}
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markReadBtn} onPress={markAllAsRead}>
            <Text style={styles.markReadText}>Tout lu</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2BEE79" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#4B5563" />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptySubtext}>Vos notifications apparaîtront ici</Text>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  markReadBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
  },
  markReadText: {
    color: '#2BEE79',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'flex-start',
  },
  notificationCardUnread: {
    backgroundColor: 'rgba(43, 238, 121, 0.05)',
    borderColor: 'rgba(43, 238, 121, 0.2)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  notificationTitleUnread: {
    color: '#F8FAFC',
  },
  notificationTime: {
    color: '#94A3B8',
    fontSize: 11,
    marginLeft: 8,
  },
  notificationMessage: {
    color: '#E6EDF3',
    fontSize: 13,
    lineHeight: 18,
  },
  notificationOrder: {
    color: '#2BEE79',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2BEE79',
    marginLeft: 8,
    marginTop: 4,
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
  },
});