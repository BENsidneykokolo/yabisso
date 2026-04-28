// app/src/features/kiosk/screens/KioskStatsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

function KioskStatsScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalRecharges: 0,
    totalPoints: 0,
    totalValidations: 0,
    totalUsers: 0,
    todayRecharges: 0,
    todayPoints: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const transactions = await database.get('wallet_transactions').query().fetch();
      
      let recharges = 0;
      let points = 0;
      
      transactions.forEach(t => {
        if (t.walletMode === 'recharge') {
          recharges += parseInt(t.amount || 0);
        } else if (t.walletMode === 'points_sale') {
          points += parseInt(t.amount || 0);
        }
      });

      setStats(prev => ({
        ...prev,
        totalRecharges: recharges,
        totalPoints: points,
        totalValidations: 0,
        totalUsers: 12,
      }));
    } catch (e) {
      console.log('[KioskStats] Erreur:', e);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Statistiques</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Aperçu du kiosque</Text>
          <Text style={styles.summarySubtitle}>Période: Aujourd'hui</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.todayRecharges}</Text>
              <Text style={styles.summaryLabel}>Recharges</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.todayPoints}</Text>
              <Text style={styles.summaryLabel}>Points</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard 
            title="Recharges Totales" 
            value={`${stats.totalRecharges} FCAF`} 
            icon="gift" 
            color="#FFD166" 
          />
          <StatCard 
            title="Points Vendus" 
            value={`${stats.totalPoints} FCAF`} 
            icon="star" 
            color="#F472B6" 
          />
          <StatCard 
            title="Validations" 
            value={stats.totalValidations} 
            icon="check-circle" 
            color="#2BEE79" 
          />
          <StatCard 
            title="Utilisateurs" 
            value={stats.totalUsers} 
            icon="people" 
            color="#60A5FA" 
          />
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={20} color="#60A5FA" />
          <Text style={styles.infoText}>
            Les statistiques seront enrichies avec le temps. Plus vous utilisez le kiosque, plus les données seront précises.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8, backgroundColor: '#16213e' },
  backButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 16, paddingBottom: 100 },
  summaryCard: { backgroundColor: '#16213e', borderRadius: 16, padding: 20, marginBottom: 20 },
  summaryTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  summarySubtitle: { color: '#aaa', fontSize: 12, marginTop: 4 },
  summaryStats: { flexDirection: 'row', marginTop: 20, gap: 20 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { color: '#2BEE79', fontSize: 28, fontWeight: 'bold' },
  summaryLabel: { color: '#aaa', fontSize: 12, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', backgroundColor: '#16213e', borderRadius: 16, padding: 16, alignItems: 'center' },
  statIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statTitle: { color: '#aaa', fontSize: 12, marginTop: 4 },
  statSubtitle: { color: '#666', fontSize: 10, marginTop: 2 },
  infoBox: { flexDirection: 'row', alignItems: 'center', marginTop: 20, padding: 16, backgroundColor: '#16213e', borderRadius: 12 },
  infoText: { color: '#aaa', fontSize: 12, marginLeft: 12, flex: 1 },
});

export default KioskStatsScreen;