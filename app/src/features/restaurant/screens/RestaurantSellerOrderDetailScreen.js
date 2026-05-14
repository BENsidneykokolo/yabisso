import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const STATUS_STEPS = [
  { id: 'new', label: 'Reçue', icon: 'bell' },
  { id: 'accepted', label: 'Acceptée', icon: 'checkmark-circle' },
  { id: 'preparing', label: 'En préparation', icon: 'restaurant' },
  { id: 'ready', label: 'Prête', icon: 'checkmark-done-circle' },
  { id: 'assigned', label: 'Livreur assigné', icon: 'bicycle' },
  { id: 'delivered', label: 'Livrée', icon: 'checkmark-circle' },
];

export default function RestaurantSellerOrderDetail({ onBack, onNavigate, orderId }) {
  const [order, setOrder] = useState(null);
  const [couriers, setCouriers] = useState([]);

  useEffect(() => {
    loadOrder();
    loadCouriers();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const saved = await SecureStore.getItemAsync('restaurant_seller_orders');
      if (saved) {
        const orders = JSON.parse(saved);
        const found = orders.find(o => o.id === orderId);
        setOrder(found);
      }
    } catch (e) {
      console.error('[OrderDetail] Erreur load:', e);
    }
  };

  const loadCouriers = async () => {
    try {
      const saved = await SecureStore.getItemAsync('restaurant_couriers');
      if (saved) {
        setCouriers(JSON.parse(saved));
      }
    } catch (e) {
      console.error('[OrderDetail] Erreur load couriers:', e);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      const saved = await SecureStore.getItemAsync('restaurant_seller_orders');
      if (saved) {
        const orders = JSON.parse(saved);
        const updated = orders.map(o => 
          o.id === orderId ? { ...o, status: newStatus, updatedAt: Date.now() } : o
        );
        await SecureStore.setItemAsync('restaurant_seller_orders', JSON.stringify(updated));
        setOrder({ ...order, status: newStatus });
        
        // Notification
        const notification = {
          id: Date.now().toString(),
          type: 'status_update',
          title: 'Commande mise à jour',
          message: `La commande #${orderId?.slice(-6)} est maintenant: ${getStatusLabel(newStatus)}`,
          orderId,
          createdAt: Date.now(),
          read: false,
        };
        const notifs = JSON.parse(await SecureStore.getItemAsync('restaurant_seller_notifications') || '[]');
        notifs.unshift(notification);
        await SecureStore.setItemAsync('restaurant_seller_notifications', JSON.stringify(notifs));
      }
    } catch (e) {
      console.error('[OrderDetail] Erreur update:', e);
    }
  };

  const assignCourier = async (courierId) => {
    const courier = couriers.find(c => c.id === courierId);
    try {
      const saved = await SecureStore.getItemAsync('restaurant_seller_orders');
      if (saved) {
        const orders = JSON.parse(saved);
        const updated = orders.map(o => 
          o.id === orderId ? { ...o, status: 'assigned', courierId, courierName: courier?.name, updatedAt: Date.now() } : o
        );
        await SecureStore.setItemAsync('restaurant_seller_orders', JSON.stringify(updated));
        setOrder({ ...order, status: 'assigned', courierId, courierName: courier?.name });
        
        // Notification
        const notification = {
          id: Date.now().toString(),
          type: 'courier_assigned',
          title: 'Livreur assigné',
          message: `${courier?.name} a été assigné à la commande #${orderId?.slice(-6)}`,
          orderId,
          createdAt: Date.now(),
          read: false,
        };
        const notifs = JSON.parse(await SecureStore.getItemAsync('restaurant_seller_notifications') || '[]');
        notifs.unshift(notification);
        await SecureStore.setItemAsync('restaurant_seller_notifications', JSON.stringify(notifs));
      }
    } catch (e) {
      console.error('[OrderDetail] Erreur assign:', e);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'Nouvelle',
      accepted: 'Acceptée',
      preparing: 'En préparation',
      ready: 'Prête',
      assigned: 'Assignée',
      delivered: 'Livrée',
      completed: 'Terminée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      new: '#F59E0B',
      accepted: '#3B82F6',
      preparing: '#8B5CF6',
      ready: '#10B981',
      assigned: '#06B6D4',
      delivered: '#2BEE79',
      completed: '#2BEE79',
      cancelled: '#EF4444',
    };
    return colors[status] || '#94A3B8';
  };

  const getStepIndex = (status) => {
    const steps = ['new', 'accepted', 'preparing', 'ready', 'assigned', 'delivered'];
    return steps.indexOf(status);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (amount) => {
    return parseInt(amount || 0).toLocaleString('fr-FR') + ' FCFA';
  };

  const handleAction = (action) => {
    switch (action) {
      case 'accept':
        Alert.alert(
          'Accepter la commande',
          'Voulez-vous accepter cette commande ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Accepter', onPress: () => updateOrderStatus('accepted') },
          ]
        );
        break;
      case 'prepare':
        Alert.alert(
          'Commencer la préparation',
          'La commande est maintenant en préparation',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Confirmer', onPress: () => updateOrderStatus('preparing') },
          ]
        );
        break;
      case 'ready':
        Alert.alert(
          'Marquer comme prête',
          'La commande est prête pour le retrait/livraison',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Confirmer', onPress: () => updateOrderStatus('ready') },
          ]
        );
        break;
      case 'assign_courier':
        onNavigate('restaurant_seller_assign_courier', { orderId });
        break;
      case 'cancel':
        Alert.alert(
          'Annuler la commande',
          'Êtes-vous sûr de vouloir annuler cette commande ?',
          [
            { text: 'Non', style: 'cancel' },
            { text: 'Oui, annuler', style: 'destructive', onPress: () => updateOrderStatus('cancelled') },
          ]
        );
        break;
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStepIndex = getStepIndex(order.status);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Commande #{order.id?.slice(-6) || '000000'}</Text>
            <Text style={styles.headerTime}>{formatTime(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <Text style={[styles.statusPillText, { color: getStatusColor(order.status) }]}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <View key={step.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      isCompleted ? styles.timelineDotActive : styles.timelineDotInactive,
                      isCurrent && styles.timelineDotCurrent,
                    ]}>
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={12} color="#0E151B" />
                      ) : (
                        <Text style={styles.timelineDotNumber}>{index + 1}</Text>
                      )}
                    </View>
                    {index < STATUS_STEPS.length - 1 && (
                      <View style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineActive,
                      ]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineLabel, isCompleted && styles.timelineLabelActive]}>
                      {step.label}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.timelineCurrent}>En cours</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Customer Info */}
        {order.customerName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client</Text>
            <View style={styles.card}>
              <View style={styles.customerInfo}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerAvatarText}>
                    {order.customerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.customerDetails}>
                  <Text style={styles.customerName}>{order.customerName}</Text>
                  {order.customerPhone && (
                    <Text style={styles.customerPhone}>{order.customerPhone}</Text>
                  )}
                </View>
              </View>
              {order.deliveryAddress && (
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={14} color="#94A3B8" />
                  <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles</Text>
          <View style={styles.card}>
            {order.items?.map((item, index) => (
              <View key={index} style={[styles.itemRow, index > 0 && styles.itemRowBorder]}>
                {item.photo && (
                  <Image source={{ uri: item.photo }} style={styles.itemPhoto} />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.variation && (
                    <Text style={styles.itemVariation}>{item.variation}</Text>
                  )}
                </View>
                <View style={styles.itemQuantity}>
                  <Text style={styles.itemQty}>x{item.quantity || 1}</Text>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                </View>
              </View>
            ))}

            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total</Text>
                <Text style={styles.totalValue}>{formatPrice(order.subtotal || order.total)}</Text>
              </View>
              {order.deliveryFee > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Livraison</Text>
                  <Text style={styles.totalValue}>{formatPrice(order.deliveryFee)}</Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.totalRowFinal]}>
                <Text style={styles.totalLabelFinal}>Total</Text>
                <Text style={styles.totalValueFinal}>{formatPrice(order.total)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Courier Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Livreur</Text>
          <View style={styles.card}>
            {order.courierName ? (
              <View style={styles.courierInfo}>
                <View style={styles.courierAvatar}>
                  <Ionicons name="bicycle" size={24} color="#06B6D4" />
                </View>
                <View style={styles.courierDetails}>
                  <Text style={styles.courierName}>{order.courierName}</Text>
                  {order.courierPhone && (
                    <Text style={styles.courierPhone}>{order.courierPhone}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.callButton}>
                  <Ionicons name="call" size={20} color="#2BEE79" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.assignCourierButton}
                onPress={() => handleAction('assign_courier')}
              >
                <Ionicons name="add-circle-outline" size={24} color="#2BEE79" />
                <Text style={styles.assignCourierText}>Assigner un livreur</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          {order.status === 'new' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAction('accept')}
              >
                <Ionicons name="checkmark-circle" size={20} color="#0E151B" />
                <Text style={styles.acceptButtonText}>Accepter</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleAction('cancel')}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          {order.status === 'accepted' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryActionButton]}
              onPress={() => handleAction('prepare')}
            >
              <MaterialCommunityIcons name="chef-hat" size={20} color="#0E151B" />
              <Text style={styles.primaryActionButtonText}>Commencer la préparation</Text>
            </TouchableOpacity>
          )}

          {order.status === 'preparing' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryActionButton]}
              onPress={() => handleAction('ready')}
            >
              <Ionicons name="checkmark-done-circle" size={20} color="#0E151B" />
              <Text style={styles.primaryActionButtonText}>Marquer comme prête</Text>
            </TouchableOpacity>
          )}

          {order.status === 'ready' && !order.courierName && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.courierActionButton]}
              onPress={() => handleAction('assign_courier')}
            >
              <Ionicons name="bicycle" size={20} color="#0E151B" />
              <Text style={styles.courierActionButtonText}>Assigner un livreur</Text>
            </TouchableOpacity>
          )}

          {order.status === 'assigned' && (
            <View style={styles.waitingMessage}>
              <Ionicons name="time" size={24} color="#94A3B8" />
              <Text style={styles.waitingText}>En attente de livraison par {order.courierName}</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTime: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  timeline: {
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderRadius: 16,
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelineDotActive: {
    backgroundColor: '#2BEE79',
  },
  timelineDotCurrent: {
    backgroundColor: '#2BEE79',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  timelineDotNumber: {
    color: '#94A3B8',
    fontSize: 11,
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  timelineLineActive: {
    backgroundColor: '#2BEE79',
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  timelineLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  timelineLabelActive: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  timelineCurrent: {
    color: '#2BEE79',
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: {
    color: '#2BEE79',
    fontSize: 20,
    fontWeight: '700',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  customerPhone: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  addressText: {
    color: '#94A3B8',
    fontSize: 13,
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemPhoto: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  itemVariation: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  itemQuantity: {
    alignItems: 'flex-end',
  },
  itemQty: {
    color: '#94A3B8',
    fontSize: 12,
  },
  itemPrice: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  totalValue: {
    color: '#E6EDF3',
    fontSize: 13,
  },
  totalRowFinal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 0,
  },
  totalLabelFinal: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  totalValueFinal: {
    color: '#2BEE79',
    fontSize: 18,
    fontWeight: '800',
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierDetails: {
    flex: 1,
  },
  courierName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  courierPhone: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignCourierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  assignCourierText: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#2BEE79',
  },
  acceptButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    width: 56,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  primaryActionButton: {
    backgroundColor: '#2BEE79',
  },
  primaryActionButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
  courierActionButton: {
    backgroundColor: '#06B6D4',
  },
  courierActionButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
  waitingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 12,
  },
  waitingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});