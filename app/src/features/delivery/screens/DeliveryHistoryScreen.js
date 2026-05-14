import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockDeliveries = [
  { id: 1, tracking: 'DHL-2026-0501-001', from: 'Abidjan', to: 'Bouaké', date: '01 Mai 2026', status: 'delivered', carrier: 'DHL', price: 8500 },
  { id: 2, tracking: 'Chrono-2026-0428-002', from: 'Daloa', to: 'Man', date: '28 Avril 2026', status: 'delivered', carrier: 'ChronoPost', price: 5500 },
  { id: 3, tracking: 'DHL-2026-0415-003', from: 'Yamoussoukro', to: 'Korhogo', date: '15 Avril 2026', status: 'in_transit', carrier: 'DHL', price: 8500 },
  { id: 4, tracking: 'Africa-2026-0402-004', from: 'Bouaké', to: 'Abidjan', date: '02 Avril 2026', status: 'delivered', carrier: 'AfricaCargo', price: 3500 },
];

const DeliveryHistoryScreen = ({ onNavigate, onBack }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return { bg: '#4CAF50', text: 'Livré' };
      case 'in_transit':
        return { bg: '#2196F3', text: 'En transit' };
      case 'cancelled':
        return { bg: '#F44336', text: 'Annulé' };
      default:
        return { bg: '#888', text: status };
    }
  };

  const renderItem = ({ item }) => {
    const status = getStatusBadge(item.status);
    return (
      <TouchableOpacity style={styles.deliveryCard} onPress={() => onNavigate('tracking')}>
        <View style={styles.cardHeader}>
          <Text style={styles.trackingText}>{item.tracking}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>

        <View style={styles.routeRow}>
          <View style={styles.routePoint}>
            <MaterialCommunityIcons name="package-variant-closed" size={20} color="#4CAF50" />
            <Text style={styles.routeText}>{item.from}</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#888" />
          <View style={styles.routePoint}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#F44336" />
            <Text style={styles.routeText}>{item.to}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="calendar" size={16} color="#888" />
            <Text style={styles.infoText}>{item.date}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="truck" size={16} color="#888" />
            <Text style={styles.infoText}>{item.carrier}</Text>
          </View>
          <Text style={styles.priceText}>{item.price} XOF</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Historique des livraisons</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Livrés</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>En transit</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>127K</Text>
          <Text style={styles.statLabel}>XOF dépensés</Text>
        </View>
      </View>

      <FlatList
        data={mockDeliveries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  statsRow: { flexDirection: 'row', marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#1A2332', padding: 16, borderRadius: 12, alignItems: 'center', marginRight: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  list: { paddingBottom: 20 },
  deliveryCard: { backgroundColor: '#1A2332', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  trackingText: { fontSize: 12, color: '#888' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFF', fontSize: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  routePoint: { flexDirection: 'row', alignItems: 'center' },
  routeText: { marginLeft: 8, fontSize: 16, color: '#FFF', fontWeight: '500' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A3444', paddingTop: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  infoText: { marginLeft: 4, color: '#888', fontSize: 14 },
  priceText: { marginLeft: 'auto', fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
});

export default DeliveryHistoryScreen;