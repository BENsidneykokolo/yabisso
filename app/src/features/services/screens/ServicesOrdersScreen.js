import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const orders = [
  { id: '1', provider: 'CleanPro Services', service: 'Nettoyage', date: '15 Jan 2026', time: '09:00', status: 'en_cours', amount: '5 000' },
  { id: '2', provider: 'FastFix Electric', service: 'Électricité', date: '10 Jan 2026', time: '14:00', status: 'termine', amount: '8 000' },
  { id: '3', provider: 'PlumbMaster', service: 'Plomberie', date: '5 Jan 2026', time: '10:00', status: 'termine', amount: '7 500' },
  { id: '4', provider: 'EcoClean Pro', service: 'Nettoyage', date: '2 Jan 2026', time: '08:00', status: 'annule', amount: '4 500' },
];

const statusColors = { en_cours: '#137fec', termine: '#2BEE79', annule: '#ef4444' };
const statusLabels = { en_cours: 'En cours', termine: 'Terminé', annule: 'Annulé' };

export default function ServicesOrdersScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Réservations');
  const [filter, setFilter] = useState('Tous');

  const tabs = ['Tous', 'En cours', 'Terminées', 'Annulées'];
  const filteredOrders = filter === 'Tous' ? orders : orders.filter(o => {
    if (filter === 'En cours') return o.status === 'en_cours';
    if (filter === 'Terminées') return o.status === 'termine';
    if (filter === 'Annulées') return o.status === 'annule';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Mes réservations</Text>
          <Pressable style={styles.notifyBtn} onPress={() => onNavigate?.('services_notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={styles.filtersRow}>
            {tabs.map((tab) => (
              <Pressable
                key={tab}
                style={[styles.filterTab, filter === tab && styles.filterTabActive]}
                onPress={() => setFilter(tab)}
              >
                <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{orders.filter(o => o.status === 'en_cours').length}</Text>
            <Text style={styles.statLabel}>En cours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{orders.filter(o => o.status === 'termine').length}</Text>
            <Text style={styles.statLabel}>Terminées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{orders.filter(o => o.status === 'annule').length}</Text>
            <Text style={styles.statLabel}>Annulées</Text>
          </View>
        </View>

        {/* Orders List */}
        <View style={styles.ordersList}>
          {filteredOrders.map((order) => (
            <Pressable
              key={order.id}
              style={styles.orderCard}
              onPress={() => onNavigate?.('service_booking', { provider: { name: order.provider } })}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderProviderImage}>
                  <MaterialCommunityIcons name="account" size={24} color="#64748b" />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderProvider}>{order.provider}</Text>
                  <Text style={styles.orderService}>{order.service}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColors[order.status]}22` }]}>
                  <Text style={[styles.statusText, { color: statusColors[order.status] }]}>
                    {statusLabels[order.status]}
                  </Text>
                </View>
              </View>
              <View style={styles.orderMeta}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#64748b" />
                  <Text style={styles.metaText}>{order.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#64748b" />
                  <Text style={styles.metaText}>{order.time}</Text>
                </View>
                <Text style={styles.orderAmount}>{order.amount} FCFA</Text>
              </View>
              {order.status === 'termine' && (
                <View style={styles.orderActions}>
                  <Pressable style={styles.reorderBtn}>
                    <MaterialCommunityIcons name="refresh" size={14} color="#137fec" />
                    <Text style={styles.reorderText}>Re-reserver</Text>
                  </Pressable>
                  <Pressable style={styles.rateBtn}>
                    <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
                    <Text style={styles.rateText}>Noter</Text>
                  </Pressable>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {[
            { label: 'Accueil', icon: 'home' },
            { label: 'Réservations', icon: 'calendar-check' },
            { label: 'Favoris', icon: 'heart' },
            { label: 'Profil', icon: 'account' },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={styles.navItem}
              onPress={() => {
                setActiveTab(item.label);
                if (item.label === 'Accueil') onNavigate?.('services_home');
                else if (item.label === 'Réservations') {}
                else if (item.label === 'Favoris') onNavigate?.('services_favorites');
                else if (item.label === 'Profil') onNavigate?.('services_profile');
              }}
            >
              <View style={[styles.navIcon, item.label === activeTab && styles.navIconActive]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={item.label === activeTab ? 20 : 16}
                  color={item.label === activeTab ? '#0E151B' : '#CBD5F5'}
                />
              </View>
              <Text style={[styles.navLabel, item.label === activeTab && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  notifyBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  filtersScroll: { paddingHorizontal: 16, marginBottom: 16 },
  filtersRow: { flexDirection: 'row', gap: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1c2630' },
  filterTabActive: { backgroundColor: '#137fec' },
  filterText: { fontSize: 13, color: '#64748b' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#1c2630', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  ordersList: { paddingHorizontal: 16 },
  orderCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16, marginBottom: 12 },
  orderHeader: { flexDirection: 'row', alignItems: 'center' },
  orderProviderImage: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center' },
  orderInfo: { flex: 1, marginLeft: 12 },
  orderProvider: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  orderService: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#64748b' },
  orderAmount: { fontSize: 15, fontWeight: 'bold', color: '#2BEE79', marginLeft: 'auto' },
  orderActions: { flexDirection: 'row', gap: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 12 },
  reorderBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reorderText: { fontSize: 13, color: '#137fec' },
  rateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rateText: { fontSize: 13, color: '#FBBF24' },
  bottomSpacer: { height: 100 },
  bottomNavWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24 },
  bottomNav: { backgroundColor: 'rgba(22, 29, 37, 0.98)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  navItem: { alignItems: 'center', flex: 1 },
  navIcon: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.18)', marginBottom: 6, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#2BEE79' },
  navLabel: { color: '#6B7280', fontSize: 10 },
  navLabelActive: { color: '#2BEE79' },
});