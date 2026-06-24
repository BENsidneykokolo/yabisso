// app/src/features/kiosk/screens/KioskDashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

const MENU_ITEMS = [
  {
    id: 'validation',
    title: 'Validations',
    subtitle: 'Produits & Inscriptions',
    icon: 'checkmark-circle',
    color: '#2BEE79',
    screen: 'kiosk_admin_dashboard',
  },
  {
    id: 'recharge',
    title: 'Recharge Packs',
    subtitle: 'Envoyer des packs Yabisso',
    icon: 'gift',
    color: '#FFD166',
    screen: 'kiosk_recharge',
  },
  {
    id: 'points',
    title: 'Vente Points',
    subtitle: 'Vendre des points aux utilisateurs',
    icon: 'star',
    color: '#F472B6',
    screen: 'kiosk_points',
  },
  {
    id: 'assistance',
    title: 'Assistance',
    subtitle: 'Aider en cas de problème',
    icon: 'help-circle',
    color: '#60A5FA',
    screen: 'kiosk_assistance',
  },
  {
    id: 'users',
    title: 'Gestion Users',
    subtitle: 'Gérer les utilisateurs',
    icon: 'people',
    color: '#A78BFA',
    screen: 'kiosk_users',
  },
  {
    id: 'stats',
    title: 'Statistiques',
    subtitle: 'Vue d\'ensemble du kiosque',
    icon: 'bar-chart',
    color: '#2BEE79',
    screen: 'kiosk_stats',
  },
];

function KioskDashboardScreen({ navigation }) {
  const [kioskInfo, setKioskInfo] = useState(null);
  const [stats, setStats] = useState({
    validations: 0,
    recharges: 0,
    pointsSold: 0,
    users: 0,
  });

  useEffect(() => {
    loadKioskInfo();
    loadStats();
  }, []);

  const loadKioskInfo = async () => {
    const kioskId = await SecureStore.getItemAsync('kiosk_id');
    const isAdmin = await SecureStore.getItemAsync('is_kiosk_admin');
    setKioskInfo({ id: kioskId, isAdmin: !!isAdmin });
  };

  const loadStats = async () => {
    try {
      const validations = await database.get('sync_queue')
        .query(Q.where('status', 'validated'))
        .fetchCount();
      
      setStats(prev => ({
        ...prev,
        validations,
        users: 0, // mock
        recharges: 0,
        pointsSold: 0,
      }));
    } catch (e) {
      console.log('[KioskDashboard] Erreur stats:', e);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment quitter le mode kiosque?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Quitter', 
          style: 'destructive',
          onPress: async () => {
            await SecureStore.setItemAsync('is_kiosk_admin', 'false');
            navigation.replace('welcome');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Kiosque Yabisso</Text>
          <Text style={styles.headerSubtitle}>{kioskInfo?.id || 'Kiosque'}</Text>
        </View>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.validations}</Text>
          <Text style={styles.statLabel}>Validations</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.recharges}</Text>
          <Text style={styles.statLabel}>Recharges</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pointsSold}</Text>
          <Text style={styles.statLabel}>Points Vendus</Text>
        </View>
      </View>

      {/* Menu */}
      <ScrollView style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Fonctionnalités Kiosque</Text>
        
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <Pressable 
              key={item.id}
              style={styles.menuCard}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerBadge}>
          <Ionicons name="wifi" size={16} color="#2BEE79" />
          <Text style={styles.footerText}>Mode Kiosque Actif</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 8, backgroundColor: '#16213e' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#2BEE79', fontSize: 14, marginTop: 4 },
  logoutButton: { padding: 10 },
  statsContainer: { flexDirection: 'row', padding: 20, gap: 12 },
  statItem: { flex: 1, backgroundColor: '#16213e', padding: 16, borderRadius: 12, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: 12, marginTop: 4 },
  menuContainer: { flex: 1, paddingHorizontal: 16, paddingBottom: 100 },
  sectionTitle: { color: '#aaa', fontSize: 14, marginBottom: 16, marginTop: 8 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  menuCard: { width: '47%', backgroundColor: '#16213e', borderRadius: 16, padding: 20 },
  menuIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  menuTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  menuSubtitle: { color: '#888', fontSize: 12, marginTop: 4 },
  footer: { padding: 16, alignItems: 'center' },
  footerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  footerText: { color: '#2BEE79', fontSize: 12, marginLeft: 8 },
});

export default KioskDashboardScreen;