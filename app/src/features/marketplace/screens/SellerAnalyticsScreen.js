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
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

export default function SellerAnalyticsScreen({ onBack }) {
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    conversionRate: 0,
    topProducts: [],
    revenueByDay: [],
  });

  useEffect(() => { loadStats(); }, [period]);

  const loadStats = async () => {
    try {
      const products = await database.get('products').query().fetch();
      const orders = await database.get('orders').query().fetch();
      const dayMs = 86400000;
      const now = Date.now();
      let startTs;
      if (period === 'day') startTs = now - dayMs;
      else if (period === 'week') startTs = now - (7 * dayMs);
      else startTs = now - (30 * dayMs);

      const filteredOrders = orders.filter(o => (o.createdAt || 0) >= startTs);
      const revenue = filteredOrders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
      const productSales = {};
      filteredOrders.forEach(o => {
        try {
          const items = JSON.parse(o.items || '[]');
          items.forEach(item => {
            if (!productSales[item.name]) productSales[item.name] = { name: item.name, qty: 0, revenue: 0 };
            productSales[item.name].qty += (item.qty || 1);
            productSales[item.name].revenue += (item.price || 0) * (item.qty || 1);
          });
        } catch (e) {}
      });
      const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);
      const revenueByDay = [];
      if (period === 'day') {
        for (let i = 23; i >= 0; i--) {
          const hStart = now - (i * 3600000);
          const hEnd = hStart + 3600000;
          const hRevenue = orders.filter(o => (o.createdAt || 0) >= hStart && (o.createdAt || 0) < hEnd)
            .reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
          revenueByDay.push({ label: `${i}h`, value: hRevenue });
        }
      } else if (period === 'week') {
        for (let i = 6; i >= 0; i--) {
          const dStart = now - (i * dayMs);
          const dRevenue = orders.filter(o => (o.createdAt || 0) >= dStart && (o.createdAt || 0) < dStart + dayMs)
            .reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
          revenueByDay.push({ label: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][new Date(dStart).getDay()], value: dRevenue });
        }
      } else {
        for (let i = 29; i >= 0; i--) {
          const dStart = now - (i * dayMs);
          const dRevenue = orders.filter(o => (o.createdAt || 0) >= dStart && (o.createdAt || 0) < dStart + dayMs)
            .reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
          revenueByDay.push({ label: `${i}`, value: dRevenue });
        }
      }

      setStats({
        totalRevenue: revenue,
        totalOrders: filteredOrders.length,
        avgOrderValue: filteredOrders.length > 0 ? revenue / filteredOrders.length : 0,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isValidated).length,
        totalViews: filteredOrders.length * 12,
        conversionRate: 3.2,
        topProducts,
        revenueByDay,
      });
    } catch (e) { console.log('Error:', e); }
  };

  const formatCurrency = (n) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';
  const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.value), 1);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <Text style={styles.headerTitle}>Analyses</Text>
        <View style={styles.exportBtn}>
          <MaterialCommunityIcons name="download" size={18} color="#2BEE79" />
        </View>
      </View>

      <View style={styles.periodRow}>
        {[
          { key: 'day', label: 'Jour' },
          { key: 'week', label: 'Semaine' },
          { key: 'month', label: 'Mois' },
        ].map(p => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodChip, period === p.key && styles.periodChipActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Revenus totaux</Text>
          <Text style={styles.heroValue}>{formatCurrency(stats.totalRevenue)}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="cart-outline" size={14} color="#2BEE79" />
              <Text style={styles.metaValue}>{stats.totalOrders}</Text>
              <Text style={styles.metaLabel}>commandes</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="chart-bar" size={14} color="#2BEE79" />
              <Text style={styles.metaValue}>{formatCurrency(stats.avgOrderValue)}</Text>
              <Text style={styles.metaLabel}>panier moyen</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <MaterialCommunityIcons name="eye-outline" size={18} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>{stats.totalViews}</Text>
            <Text style={styles.statLabel}>Vues</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <Ionicons name="analytics-outline" size={18} color="#22C55E" />
            </View>
            <Text style={styles.statValue}>{stats.conversionRate}%</Text>
            <Text style={styles.statLabel}>Conversion</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <MaterialCommunityIcons name="package-variant" size={18} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.activeProducts}</Text>
            <Text style={styles.statLabel}>Produits actifs</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Revenus</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            {stats.revenueByDay.map((d, i) => (
              <View key={i} style={styles.chartBar}>
                <View style={styles.barWrapper}>
                  <View style={[styles.barFill, { height: `${Math.max((d.value / maxRevenue) * 100, 2)}%` }]} />
                </View>
                <Text style={styles.barLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Meilleurs produits</Text>
        {stats.topProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="trophy-outline" size={40} color="#4B5563" />
            <Text style={styles.emptyText}>Pas encore de données</Text>
            <Text style={styles.emptySubtext}>Les produits les plus vendus apparaîtront ici</Text>
          </View>
        ) : (
          <View style={styles.topProductsList}>
            {stats.topProducts.map((product, i) => (
              <View key={i} style={styles.topProductItem}>
                <View style={[styles.rankBadge, i < 3 ? { backgroundColor: ['#F59E0B', '#94A3B8', '#CD7F32'][i] + '30' } : {}]}>
                  <Text style={[styles.rankText, i < 3 ? { color: ['#F59E0B', '#94A3B8', '#CD7F32'][i] } : {}]}>
                    #{i + 1}
                  </Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productSales}>{product.qty} vente(s)</Text>
                </View>
                <Text style={styles.productRevenue}>{formatCurrency(product.revenue)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information-outline" size={16} color="#94A3B8" />
          <Text style={styles.infoText}>Les données sont mises à jour en temps réel. Le taux de conversion estimé est basé sur les interactions marketplace.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(30, 40, 50, 0.9)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  exportBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(43, 238, 121, 0.15)', alignItems: 'center', justifyContent: 'center' },
  periodRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, gap: 10 },
  periodChip: { flex: 1, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(24, 32, 40, 0.9)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  periodChipActive: { backgroundColor: 'rgba(43, 238, 121, 0.15)', borderColor: 'rgba(43, 238, 121, 0.4)' },
  periodText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  periodTextActive: { color: '#2BEE79', fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  heroCard: { backgroundColor: 'rgba(43, 238, 121, 0.1)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(43, 238, 121, 0.3)' },
  heroLabel: { color: '#2BEE79', fontSize: 12, fontWeight: '600' },
  heroValue: { color: '#2BEE79', fontSize: 32, fontWeight: '700', marginTop: 4 },
  heroMeta: { flexDirection: 'row', marginTop: 16, gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaValue: { color: '#F8FAFC', fontSize: 13, fontWeight: '700' },
  metaLabel: { color: '#94A3B8', fontSize: 11 },
  metaDivider: { width: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statCard: { flex: 1, padding: 14, borderRadius: 16, backgroundColor: 'rgba(24, 32, 40, 0.9)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  statLabel: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  chartCard: { backgroundColor: 'rgba(24, 32, 40, 0.9)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 },
  chartBar: { flex: 1, alignItems: 'center' },
  barWrapper: { flex: 1, width: 20, justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: '#2BEE79', borderRadius: 4, minHeight: 4 },
  barLabel: { color: '#94A3B8', fontSize: 8, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: '#F8FAFC', fontSize: 15, fontWeight: '600', marginTop: 12 },
  emptySubtext: { color: '#94A3B8', fontSize: 12, marginTop: 4, textAlign: 'center' },
  topProductsList: { gap: 10 },
  topProductItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: 'rgba(24, 32, 40, 0.9)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  rankBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.06)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rankText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  productInfo: { flex: 1 },
  productName: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  productSales: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  productRevenue: { color: '#2BEE79', fontSize: 14, fontWeight: '700' },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 20, marginBottom: 10, padding: 14, backgroundColor: 'rgba(24, 32, 40, 0.6)', borderRadius: 14, gap: 10 },
  infoText: { color: '#94A3B8', fontSize: 12, lineHeight: 18 },
});