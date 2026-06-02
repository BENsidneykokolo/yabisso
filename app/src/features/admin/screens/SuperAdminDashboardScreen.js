// app/src/features/admin/screens/SuperAdminDashboardScreen.js
// Dashboard principal Super Admin
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SuperAdminService } from '../services/SuperAdminService';

const QUICK_ACTIONS = [
  { key: 'users', label: 'Utilisateurs', icon: 'account-group', color: '#2BEE79', route: 'super_admin_users' },
  { key: 'services', label: 'Services', icon: 'apps', color: '#3B82F6', route: 'super_admin_services' },
  { key: 'content', label: 'Modération', icon: 'shield-check', color: '#F59E0B', route: 'super_admin_content' },
  { key: 'analytics', label: 'Analytics', icon: 'chart-line', color: '#A855F7', route: 'super_admin_analytics' },
  { key: 'kiosks', label: 'Kiosques', icon: 'store', color: '#EF4444', route: 'super_admin_kiosks' },
  { key: 'ai', label: 'IA Admin', icon: 'robot', color: '#60A5FA', route: 'super_admin_ai' },
  { key: 'notifications', label: 'Notifications', icon: 'bell-ring', color: '#F472B6', route: 'super_admin_notifications' },
  { key: 'settings', label: 'Paramètres', icon: 'cog', color: '#94A3B8', route: 'super_admin_settings' },
];

export default function SuperAdminDashboardScreen({ onBack, onNavigate, onLogout }) {
  const [stats, setStats] = useState(SuperAdminService._getDefaultStats());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadStats = async () => {
    setRefreshing(true);
    const result = await SuperAdminService.getGlobalStats();
    if (result.success) {
      setStats(result.stats);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Se déconnecter de la console Super Admin ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await SuperAdminService.logout();
            onLogout && onLogout();
          },
        },
      ]
    );
  };

  const statCards = [
    { key: 'users', label: 'Utilisateurs', value: stats.totalUsers, icon: 'account-group', color: '#2BEE79' },
    { key: 'products', label: 'Produits', value: stats.totalProducts, icon: 'package-variant', color: '#3B82F6' },
    { key: 'loba', label: 'Posts Loba', value: stats.totalLobaPosts, icon: 'video', color: '#A855F7' },
    { key: 'restaurants', label: 'Restaurants', value: stats.totalRestaurants, icon: 'silverware-fork-knife', color: '#F59E0B' },
    { key: 'hotels', label: 'Hôtels', value: stats.totalHotels, icon: 'bed', color: '#60A5FA' },
    { key: 'tx', label: 'Transactions', value: stats.totalTransactions, icon: 'swap-horizontal', color: '#F472B6' },
  ];

  const alertCards = [
    { key: 'pending', label: 'Validations en attente', value: stats.pendingValidations, icon: 'clock-alert', color: '#FFD166' },
    { key: 'flagged', label: 'Contenu signalé', value: stats.flaggedPosts, icon: 'flag', color: '#EF4444' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Super Admin</Text>
          <Text style={styles.headerSubtitle}>
            {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadStats} tintColor="#2BEE79" />
        }
      >
        {loading ? (
          <ActivityIndicator color="#2BEE79" style={{ marginVertical: 40 }} />
        ) : (
          <>
            {/* Hero Status Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <MaterialCommunityIcons name="shield-crown" size={32} color="#2BEE79" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.heroTitle}>État du système</Text>
                  <Text style={styles.heroSubtitle}>
                    {stats.activeServices} services actifs
                  </Text>
                </View>
                <View style={styles.statusDot} />
              </View>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{stats.totalUsers}</Text>
                  <Text style={styles.heroStatLabel}>Utilisateurs</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>
                    {stats.pendingValidations + stats.pendingRestaurants + stats.pendingHotels}
                  </Text>
                  <Text style={styles.heroStatLabel}>En attente</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{stats.activeServices}</Text>
                  <Text style={styles.heroStatLabel}>Services</Text>
                </View>
              </View>
            </View>

            {/* Statistiques rapides */}
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsGrid}>
              {statCards.map((stat) => (
                <View key={stat.key} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                    <MaterialCommunityIcons name={stat.icon} size={20} color={stat.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Alertes */}
            {alertCards.some(a => a.value > 0) && (
              <>
                <Text style={styles.sectionTitle}>Alertes</Text>
                {alertCards.map((alert) => (
                  alert.value > 0 && (
                    <Pressable
                      key={alert.key}
                      style={[styles.alertCard, { borderLeftColor: alert.color }]}
                      onPress={() => {
                        if (alert.key === 'pending') onNavigate && onNavigate('super_admin_content');
                        if (alert.key === 'flagged') onNavigate && onNavigate('super_admin_content');
                      }}
                    >
                      <View style={[styles.statIcon, { backgroundColor: `${alert.color}20` }]}>
                        <MaterialCommunityIcons name={alert.icon} size={20} color={alert.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.alertValue}>{alert.value}</Text>
                        <Text style={styles.alertLabel}>{alert.label}</Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#7C8A9A" />
                    </Pressable>
                  )
                ))}
              </>
            )}

            {/* Actions rapides */}
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <View style={styles.actionsGrid}>
              {QUICK_ACTIONS.map((action) => (
                <Pressable
                  key={action.key}
                  style={styles.actionCard}
                  onPress={() => onNavigate && onNavigate(action.route)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                    <MaterialCommunityIcons name={action.icon} size={28} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ height: 60 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Need to import Alert for handleLogout
import { Alert } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#16213e',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: '#7C8A9A', fontSize: 12, marginTop: 2 },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  heroCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.2)',
  },
  heroHeader: { flexDirection: 'row', alignItems: 'center' },
  heroTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  heroSubtitle: { color: '#7C8A9A', fontSize: 12, marginTop: 2 },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2BEE79',
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  heroStatLabel: { color: '#7C8A9A', fontSize: 11, marginTop: 4 },
  heroDivider: { width: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statValue: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#7C8A9A', fontSize: 11, marginTop: 2 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  alertValue: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  alertLabel: { color: '#7C8A9A', fontSize: 12, marginTop: 2 },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
