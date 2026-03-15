import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRestaurantOrders } from '../context/RestaurantOrdersContext';

export default function RestaurantOrdersScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('en_cours');
  const { orders, getOrders } = useRestaurantOrders();

  const filteredOrders = activeTab === 'tous' 
    ? getOrders() 
    : getOrders().filter(o => o.status === activeTab);

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_cours': return '#f97316';
      case 'livre': return '#22c55e';
      case 'annule': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_cours': return 'En cours';
      case 'livre': return 'Livré';
      case 'annule': return 'Annulé';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mes Commandes</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable 
          style={[styles.tab, activeTab === 'en_cours' && styles.tabActive]}
          onPress={() => setActiveTab('en_cours')}
        >
          <Text style={[styles.tabText, activeTab === 'en_cours' && styles.tabTextActive]}>
            En cours
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'livre' && styles.tabActive]}
          onPress={() => setActiveTab('livre')}
        >
          <Text style={[styles.tabText, activeTab === 'livre' && styles.tabTextActive]}>
            Livrées
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'tous' && styles.tabActive]}
          onPress={() => setActiveTab('tous')}
        >
          <Text style={[styles.tabText, activeTab === 'tous' && styles.tabTextActive]}>
            Toutes
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="food-off" size={64} color="#64748b" />
            <Text style={styles.emptyText}>Aucune commande</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <Pressable 
              key={order.id} 
              style={styles.orderCard}
              onPress={() => onNavigate?.('restaurant_tracking', { order })}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.restaurantName}>{order.restaurant}</Text>
                  <Text style={styles.orderDate}>{order.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderItems}>
                {order.items.map((item, index) => (
                  <Text key={index} style={styles.itemText}>
                    {item.quantity}x {item.name}
                  </Text>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>Total: {order.total.toLocaleString()} FCA</Text>
                {order.status === 'en_cours' && (
                  <Pressable style={styles.trackBtn}>
                    <Text style={styles.trackBtnText}>Suivre</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          ))
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#137fec',
  },
  tabText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#137fec',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 16,
  },
  orderCard: {
    backgroundColor: '#1c2630',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  itemText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  orderTotal: {
    color: '#137fec',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackBtn: {
    backgroundColor: '#137fec',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  trackBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSpacer: {
    height: 100,
  },
});