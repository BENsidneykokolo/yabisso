import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockHistory = [
  { id: 1, ref: 'YB-2026-0501-0815', from: 'Abidjan', to: 'Bouaké', date: '01 Mai 2026', company: 'UTB', status: 'completed', price: 3500 },
  { id: 2, ref: 'YB-2026-0428-1430', from: 'Daloa', to: 'Man', date: '28 Avril 2026', company: 'SOTRA', status: 'completed', price: 2800 },
  { id: 3, ref: 'YB-2026-0415-0900', from: 'Yamoussoukro', to: 'Korhogo', date: '15 Avril 2026', company: 'CFTD', status: 'cancelled', price: 3200 },
  { id: 4, ref: 'YB-2026-0402-1600', from: 'Bouaké', to: 'Abidjan', date: '02 Avril 2026', company: 'STIF', status: 'completed', price: 3000 },
];

const TransportHistoryScreen = ({ onNavigate, onBack }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.refText}>{item.ref}</Text>
        <View style={[styles.statusBadge, item.status === 'completed' ? styles.statusCompleted : styles.statusCancelled]}>
          <Text style={styles.statusText}>{item.status === 'completed' ? 'Terminé' : 'Annulé'}</Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routePoint}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#4CAF50" />
          <Text style={styles.routeText}>{item.from}</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={20} color="#888" />
        <View style={styles.routePoint}>
          <MaterialCommunityIcons name="map-marker-outline" size={20} color="#F44336" />
          <Text style={styles.routeText}>{item.to}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="calendar" size={16} color="#888" />
          <Text style={styles.infoText}>{item.date}</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="bus" size={16} color="#888" />
          <Text style={styles.infoText}>{item.company}</Text>
        </View>
        <Text style={styles.priceText}>{item.price} XOF</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Historique des voyages</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Voyages</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>38 500</Text>
          <Text style={styles.statLabel}>XOF dépensés</Text>
        </View>
      </View>

      <FlatList
        data={mockHistory}
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
  statCard: { flex: 1, backgroundColor: '#1A2332', padding: 16, borderRadius: 12, alignItems: 'center', marginRight: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  list: { paddingBottom: 20 },
  historyCard: { backgroundColor: '#1A2332', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  refText: { fontSize: 12, color: '#888' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusCompleted: { backgroundColor: '#4CAF50' },
  statusCancelled: { backgroundColor: '#F44336' },
  statusText: { color: '#FFF', fontSize: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  routePoint: { flexDirection: 'row', alignItems: 'center' },
  routeText: { marginLeft: 8, fontSize: 16, color: '#FFF', fontWeight: '500' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A3444', paddingTop: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  infoText: { marginLeft: 4, color: '#888', fontSize: 14 },
  priceText: { marginLeft: 'auto', fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
});

export default TransportHistoryScreen;