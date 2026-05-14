import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const mockCouriers = [
  { id: '1', name: 'Jean Dupont', phone: '+225 07 XX XX XX XX', status: 'disponible', deliveries: 45, rating: 4.8 },
  { id: '2', name: 'Marie Kouadio', phone: '+225 05 XX XX XX XX', status: 'en_livraison', deliveries: 32, rating: 4.6 },
  { id: '3', name: 'Paul Yao', phone: '+225 07 XX XX XX XX', status: 'indisponible', deliveries: 18, rating: 4.9 },
];

export default function RestaurantSellerMenuScreen({ onBack, onNavigate }) {
  const [couriers] = useState(mockCouriers);
  const [activeTab, setActiveTab] = useState('couriers');

  const getStatusStyle = (status) => {
    if (status === 'disponible') return { bg: 'rgba(43,238,121,0.1)', color: '#2BEE79', text: 'Disponible' };
    if (status === 'en_livraison') return { bg: 'rgba(19,127,236,0.1)', color: '#137fec', text: 'En livraison' };
    return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', text: 'Indisponible' };
  };

  const handleAddCourier = () => {
    Alert.alert('Ajouter un livreur', 'Fonctionnalité d\'ajout de livreur - à connecter à votre backend');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Gestion des livreurs</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddCourier}>
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'couriers' && styles.tabActive]}
          onPress={() => setActiveTab('couriers')}>
          <MaterialCommunityIcons name="bike" size={20} color={activeTab === 'couriers' ? '#2BEE79' : '#9ca3af'} />
          <Text style={[styles.tabText, activeTab === 'couriers' && styles.tabTextActive]}>Livreurs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
          onPress={() => setActiveTab('stats')}>
          <MaterialCommunityIcons name="chart-bar" size={20} color={activeTab === 'stats' ? '#2BEE79' : '#9ca3af'} />
          <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>Statistiques</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{couriers.length}</Text>
            <Text style={styles.statLabel}>Livreurs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#2BEE79' }]}>1</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#137fec' }]}>1</Text>
            <Text style={styles.statLabel}>En livraison</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes livreurs</Text>
          {couriers.map(courier => {
            const statusStyle = getStatusStyle(courier.status);
            return (
              <View key={courier.id} style={styles.courierCard}>
                <View style={styles.courierAvatar}>
                  <MaterialCommunityIcons name="account" size={24} color="#137fec" />
                </View>
                <View style={styles.courierInfo}>
                  <Text style={styles.courierName}>{courier.name}</Text>
                  <Text style={styles.courierPhone}>{courier.phone}</Text>
                  <View style={styles.courierMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.text}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <MaterialCommunityIcons name="star" size={12} color="#facc15" />
                      <Text style={styles.ratingText}>{courier.rating}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.courierActions}>
                  <Text style={styles.deliveriesCount}>{courier.deliveries}</Text>
                  <Text style={styles.deliveriesLabel}>livraisons</Text>
                </View>
              </View>
            );
          })}
        </View>

        {activeTab === 'stats' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.statsCard}>
              <View style={styles.statsRow2}>
                <View style={styles.perfItem}>
                  <Text style={styles.perfValue}>95</Text>
                  <Text style={styles.perfLabel}>Livraisons ce mois</Text>
                </View>
                <View style={styles.perfItem}>
                  <Text style={styles.perfValue}>4.7</Text>
                  <Text style={styles.perfLabel}>Note moyenne</Text>
                </View>
              </View>
              <View style={styles.statsRow2}>
                <View style={styles.perfItem}>
                  <Text style={styles.perfValue}>18 min</Text>
                  <Text style={styles.perfLabel}>Temps moyen</Text>
                </View>
                <View style={styles.perfItem}>
                  <Text style={styles.perfValue}>98%</Text>
                  <Text style={styles.perfLabel}>Taux de réussite</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={handleAddCourier}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(43,238,121,0.1)' }]}>
              <MaterialCommunityIcons name="account-plus" size={20} color="#2BEE79" />
            </View>
            <Text style={styles.menuText}>Ajouter un livreur</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(19,127,236,0.1)' }]}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#137fec" />
            </View>
            <Text style={styles.menuText}>Notifications livreurs</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
              <MaterialCommunityIcons name="map-marker-radius" size={20} color="#9ca3af" />
            </View>
            <Text style={styles.menuText}>Zones de livraison</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2BEE79', alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1c2936' },
  tabActive: { backgroundColor: 'rgba(43,238,121,0.1)' },
  tabText: { fontSize: 14, color: '#9ca3af' },
  tabTextActive: { color: '#2BEE79', fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#1c2936', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  courierCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2936', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  courierAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  courierInfo: { flex: 1, marginLeft: 12 },
  courierName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  courierPhone: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  courierMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, color: '#facc15', fontWeight: '600' },
  courierActions: { alignItems: 'center' },
  deliveriesCount: { fontSize: 20, fontWeight: 'bold', color: '#2BEE79' },
  deliveriesLabel: { fontSize: 10, color: '#9ca3af' },
  statsCard: { backgroundColor: '#1c2936', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statsRow2: { flexDirection: 'row', marginBottom: 16 },
  perfItem: { flex: 1, alignItems: 'center' },
  perfValue: { fontSize: 24, fontWeight: 'bold', color: '#2BEE79' },
  perfLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2936', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuText: { flex: 1, fontSize: 15, color: '#fff' },
  bottomSpacer: { height: 40 },
});