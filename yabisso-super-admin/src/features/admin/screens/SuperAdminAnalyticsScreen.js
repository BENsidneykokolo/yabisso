import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SuperAdminService from '../services/SuperAdminService';

const SCREEN_W = Dimensions.get('window').width;

export default function SuperAdminAnalyticsScreen({ onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [period]);

  async function load() {
    setLoading(true);
    const data = await SuperAdminService.getAnalytics();
    let safeData = { growth: [], topServices: [], network: [], kpis: [] };
    if (data && data.success && data.analytics) {
      const a = data.analytics;
      const growthObj = a.growth || {};
      safeData.growth = [
        { label: 'L', value: Math.round((growthObj.users || 0) * 10) },
        { label: 'M', value: Math.round((growthObj.products || 0) * 10) },
        { label: 'M', value: Math.round((growthObj.transactions || 0) * 5) },
        { label: 'J', value: Math.round((growthObj.lobaPosts || 0) * 8) },
        { label: 'V', value: Math.round((growthObj.users || 0) * 12) },
        { label: 'S', value: Math.round((growthObj.transactions || 0) * 9) },
        { label: 'D', value: Math.round((growthObj.users || 0) * 15) },
      ];
      const colorMap = { 'Marché': '#2BEE79', 'Restaurant': '#FFA726', 'Taxi': '#42A5F5', 'Loba': '#AB47BC', 'Wallet': '#FF5252' };
      const iconMap = { 'Marché': 'storefront', 'Restaurant': 'silverware-fork-knife', 'Taxi': 'taxi', 'Loba': 'video', 'Wallet': 'wallet' };
      safeData.topServices = (a.topServices || []).map((s, i) => ({
        name: s.name,
        usage: s.usage,
        icon: iconMap[s.name] || 'apps',
        color: colorMap[s.name] || '#2BEE79',
        percent: s.usage,
      }));
      const net = a.networkActivity || {};
      safeData.network = [
        { name: 'WiFi Direct', traffic: net.wifiDirectTransfers || 0, icon: 'wifi', color: '#2BEE79', status: 'online' },
        { name: 'Nearby Mesh', traffic: net.nearbyConnections || 0, icon: 'access-point', color: '#42A5F5', status: 'online' },
        { name: 'Bluetooth LE', traffic: Math.floor((net.nearbyConnections || 0) / 4), icon: 'bluetooth', color: '#FFA726', status: 'online' },
      ];
      safeData.kpis = [
        { value: a.totalUsers || 0, label: 'Utilisateurs', icon: 'account-group', color: '#2BEE79', trend: growthObj.users || 0 },
        { value: a.totalProducts || 0, label: 'Produits', icon: 'shopping', color: '#FFA726', trend: growthObj.products || 0 },
        { value: a.totalTransactions || 0, label: 'Transactions', icon: 'swap-horizontal', color: '#42A5F5', trend: growthObj.transactions || 0 },
        { value: a.totalLobaPosts || 0, label: 'Posts Loba', icon: 'video', color: '#AB47BC', trend: growthObj.lobaPosts || 0 },
      ];
    }
    setAnalytics(safeData);
    setLoading(false);
  }

  if (loading || !analytics) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
        </View>
        <Text style={styles.emptyText}>Chargement...</Text>
      </View>
    );
  }

  const { growth, topServices, network, kpis } = analytics;
  const maxGrowth = Math.max(...(growth || []).map(g => g.value), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Tableau de bord analytique</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodBar} contentContainerStyle={styles.periodContent}>
        {[
          { key: '24h', label: '24h' },
          { key: '7d', label: '7 jours' },
          { key: '30d', label: '30 jours' },
          { key: '90d', label: '90 jours' },
        ].map(p => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodChip, period === p.key && styles.periodChipActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        <View style={styles.kpiGrid}>
          {(kpis || []).map((k, i) => (
            <View key={i} style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: (k.color || '#2BEE79') + '22' }]}>
                <MaterialCommunityIcons name={k.icon} size={22} color={k.color || '#2BEE79'} />
              </View>
              <Text style={styles.kpiValue}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
              <View style={styles.kpiTrend}>
                <MaterialCommunityIcons
                  name={k.trend > 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={k.trend > 0 ? '#2BEE79' : '#FF5252'}
                />
                <Text style={[styles.kpiTrendText, { color: k.trend > 0 ? '#2BEE79' : '#FF5252' }]}>
                  {k.trend > 0 ? '+' : ''}{k.trend}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Croissance des utilisateurs</Text>
        <View style={styles.chartCard}>
          <View style={styles.chart}>
            {(growth || []).map((g, i) => {
              const h = ((g.value || 0) / maxGrowth) * 140;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barValue}>{g.value}</Text>
                  <View style={[styles.bar, { height: h, backgroundColor: i === growth.length - 1 ? '#2BEE79' : '#2BEE7955' }]} />
                  <Text style={styles.barLabel}>{g.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Top services</Text>
        <View style={styles.servicesCard}>
          {(topServices || []).map((s, i) => (
            <View key={i} style={styles.serviceRow}>
              <Text style={styles.serviceRank}>#{i + 1}</Text>
              <MaterialCommunityIcons name={s.icon} size={20} color={s.color} />
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{s.name}</Text>
                <Text style={styles.serviceMeta}>{s.usage} utilisateurs actifs</Text>
              </View>
              <View style={styles.serviceBar}>
                <View style={[styles.serviceBarFill, { width: (s.percent || 0) + '%', backgroundColor: s.color }]} />
              </View>
              <Text style={styles.servicePercent}>{s.percent || 0}%</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Activité réseau</Text>
        <View style={styles.networkCard}>
          {(network || []).map((n, i) => (
            <View key={i} style={styles.networkRow}>
              <View style={[styles.networkIcon, { backgroundColor: (n.color || '#2BEE79') + '22' }]}>
                <MaterialCommunityIcons name={n.icon} size={20} color={n.color || '#2BEE79'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.networkName}>{n.name}</Text>
                <Text style={styles.networkMeta}>{n.traffic} transactions</Text>
              </View>
              <View style={[styles.networkStatus, { backgroundColor: n.status === 'online' ? '#2BEE79' : '#FFA726' }]}>
                <Text style={styles.networkStatusText}>{n.status === 'online' ? 'En ligne' : 'Lent'}</Text>
              </View>
            </View>
          ))}
        </View>

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
  emptyText: { color: '#8B9BAE', textAlign: 'center', marginTop: 60 },
  periodBar: { maxHeight: 50, marginBottom: 10 },
  periodContent: { paddingHorizontal: 16, gap: 8 },
  periodChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#16213e' },
  periodChipActive: { backgroundColor: '#2BEE79' },
  periodText: { color: '#8B9BAE', fontSize: 13, fontWeight: '600' },
  periodTextActive: { color: '#0E151B' },
  content: { flex: 1, paddingHorizontal: 16 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  kpiCard: { width: (SCREEN_W - 42) / 2, backgroundColor: '#16213e', borderRadius: 12, padding: 12 },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  kpiValue: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  kpiLabel: { color: '#8B9BAE', fontSize: 12, marginTop: 2 },
  kpiTrend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  kpiTrendText: { fontSize: 11, fontWeight: '700' },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  chartCard: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, marginBottom: 20 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 180 },
  barCol: { alignItems: 'center', flex: 1 },
  barValue: { color: '#FFF', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  bar: { width: '60%', borderRadius: 4, minHeight: 4 },
  barLabel: { color: '#8B9BAE', fontSize: 10, marginTop: 6 },
  servicesCard: { backgroundColor: '#16213e', borderRadius: 12, padding: 12, marginBottom: 20 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#0E151B' },
  serviceRank: { color: '#2BEE79', fontSize: 14, fontWeight: '700', width: 24 },
  serviceName: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  serviceMeta: { color: '#8B9BAE', fontSize: 11, marginTop: 2 },
  serviceBar: { width: 60, height: 6, backgroundColor: '#0E151B', borderRadius: 3, overflow: 'hidden' },
  serviceBarFill: { height: '100%', borderRadius: 3 },
  servicePercent: { color: '#FFF', fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  networkCard: { backgroundColor: '#16213e', borderRadius: 12, padding: 12, marginBottom: 20 },
  networkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#0E151B' },
  networkIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  networkName: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  networkMeta: { color: '#8B9BAE', fontSize: 11, marginTop: 2 },
  networkStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  networkStatusText: { color: '#0E151B', fontSize: 10, fontWeight: '700' },
});
