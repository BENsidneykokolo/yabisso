import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SuperAdminService from '../services/SuperAdminService';

export default function SuperAdminKiosksScreen({ onBack, onOpenKioskAdmin }) {
  const [kiosks, setKiosks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await SuperAdminService.getKiosksStatus();
    setKiosks(data);
    setLoading(false);
    setRefreshing(false);
  }

  function toggleKiosk(k) {
    Alert.alert(
      k.online ? 'Mettre hors ligne ?' : 'Mettre en ligne ?',
      `Kiosque: ${k.name}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => Alert.alert('Statut mis à jour') },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Kiosques</Text>
        </View>
        <Text style={styles.emptyText}>Chargement...</Text>
      </View>
    );
  }

  const online = kiosks.filter(k => k.online).length;
  const totalTransactions = kiosks.reduce((sum, k) => sum + k.transactions, 0);
  const totalRevenue = kiosks.reduce((sum, k) => sum + k.revenue, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Kiosques</Text>
          <Text style={styles.subtitle}>{online}/{kiosks.length} en ligne</Text>
        </View>
        <TouchableOpacity onPress={() => onOpenKioskAdmin && onOpenKioskAdmin()} style={styles.openBtn}>
          <MaterialCommunityIcons name="open-in-new" size={18} color="#2BEE79" />
          <Text style={styles.openBtnText}>Ouvrir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <MaterialCommunityIcons name="store-24-hour" size={22} color="#2BEE79" />
          <Text style={styles.summaryValue}>{kiosks.length}</Text>
          <Text style={styles.summaryLabel}>Kiosques</Text>
        </View>
        <View style={styles.summaryCard}>
          <MaterialCommunityIcons name="swap-horizontal" size={22} color="#42A5F5" />
          <Text style={styles.summaryValue}>{totalTransactions}</Text>
          <Text style={styles.summaryLabel}>Transactions</Text>
        </View>
        <View style={styles.summaryCard}>
          <MaterialCommunityIcons name="cash-multiple" size={22} color="#FFA726" />
          <Text style={styles.summaryValue}>{totalRevenue.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Revenus FCFA</Text>
        </View>
      </View>

      <ScrollView style={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2BEE79" />}>
        {kiosks.map(k => (
          <View key={k.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.statusDot, { backgroundColor: k.online ? '#2BEE79' : '#FF5252' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.kioskName}>{k.name}</Text>
                <Text style={styles.kioskLocation}>
                  <MaterialCommunityIcons name="map-marker" size={12} color="#8B9BAE" /> {k.location}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: k.online ? '#2BEE7922' : '#FF525222' }]}>
                <Text style={[styles.statusText, { color: k.online ? '#2BEE79' : '#FF5252' }]}>
                  {k.online ? 'En ligne' : 'Hors ligne'}
                </Text>
              </View>
            </View>

            <View style={styles.kpiRow}>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiValue}>{k.transactions}</Text>
                <Text style={styles.kpiLabel}>Transactions</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiValue}>{k.revenue.toLocaleString()}</Text>
                <Text style={styles.kpiLabel}>Revenus FCFA</Text>
              </View>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiValue}>{k.uptime}%</Text>
                <Text style={styles.kpiLabel}>Disponibilité</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="clock-outline" size={12} color="#8B9BAE" />
              <Text style={styles.metaText}>Dernière activité: {k.lastActivity}</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="account-circle" size={12} color="#8B9BAE" />
              <Text style={styles.metaText}>Opérateur: {k.operator}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#42A5F522' }]}>
                <MaterialCommunityIcons name="chart-line" size={14} color="#42A5F5" />
                <Text style={[styles.actionText, { color: '#42A5F5' }]}>Stats</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFA72622' }]}>
                <MaterialCommunityIcons name="qrcode-scan" size={14} color="#FFA726" />
                <Text style={[styles.actionText, { color: '#FFA726' }]}>QR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#AB47BC22' }]}>
                <MaterialCommunityIcons name="account-multiple" size={14} color="#AB47BC" />
                <Text style={[styles.actionText, { color: '#AB47BC' }]}>Clients</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: k.online ? '#FF525222' : '#2BEE7922' }]}
                onPress={() => toggleKiosk(k)}
              >
                <MaterialCommunityIcons
                  name={k.online ? 'power' : 'power-on'}
                  size={14}
                  color={k.online ? '#FF5252' : '#2BEE79'}
                />
                <Text style={[styles.actionText, { color: k.online ? '#FF5252' : '#2BEE79' }]}>
                  {k.online ? 'Stop' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#8B9BAE', fontSize: 13, marginTop: 2 },
  openBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#2BEE7922', borderRadius: 10 },
  openBtnText: { color: '#2BEE79', fontSize: 12, fontWeight: '700' },
  emptyText: { color: '#8B9BAE', textAlign: 'center', marginTop: 60 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: '#16213e', borderRadius: 12, padding: 12, alignItems: 'center' },
  summaryValue: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 6 },
  summaryLabel: { color: '#8B9BAE', fontSize: 11, marginTop: 2, textAlign: 'center' },
  list: { flex: 1, paddingHorizontal: 16 },
  card: { backgroundColor: '#16213e', borderRadius: 14, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  kioskName: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  kioskLocation: { color: '#8B9BAE', fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpiItem: { flex: 1, backgroundColor: '#0E151B', borderRadius: 8, padding: 8, alignItems: 'center' },
  kpiValue: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  kpiLabel: { color: '#8B9BAE', fontSize: 10, marginTop: 2, textAlign: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  metaText: { color: '#8B9BAE', fontSize: 11 },
  actions: { flexDirection: 'row', gap: 6, marginTop: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 7, borderRadius: 8, gap: 4 },
  actionText: { fontSize: 11, fontWeight: '700' },
});
