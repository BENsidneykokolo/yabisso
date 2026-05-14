import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockOrders = [
  { id: '1', date: '8 Mai 2026', total: '4,200 XAF', status: 'livré', items: 2 },
  { id: '2', date: '5 Mai 2026', total: '8,500 XAF', status: 'livré', items: 3 },
  { id: '3', date: '1 Mai 2026', total: '1,800 XAF', status: 'livré', items: 1 },
];

export default function PharmacyProfileScreen({ onBack, onNavigate }) {
  const [orders] = useState(mockOrders);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={40} color="#137fec" />
            </View>
            <View style={styles.editAvatarBtn}>
              <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
            </View>
          </View>
          <Text style={styles.userName}>Utilisateur Yabisso</Text>
          <Text style={styles.userEmail}>utilisateur@yabisso.com</Text>
          <View style={styles.memberBadge}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#2BEE79" />
            <Text style={styles.memberText}>Membre Pharmacie</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>En cours</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique des commandes</Text>
          {orders.map(order => (
            <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => onNavigate?.('pharmacy_order')}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>Commande #{order.id}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderTotal}>{order.total}</Text>
                <View style={styles.statusBadge}>
                  <MaterialCommunityIcons name="check-circle" size={12} color="#2BEE79" />
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#137fec" />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#137fec" />
            </View>
            <Text style={styles.menuText}>Sécurité</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="help-circle-outline" size={20} color="#137fec" />
            </View>
            <Text style={styles.menuText}>Aide</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#137fec" />
            </View>
            <Text style={styles.menuText}>À propos</Text>
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
  headerRight: { width: 40 },
  profileCard: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1c2936', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#137fec' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#137fec', alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  userEmail: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(43,238,121,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  memberText: { fontSize: 12, color: '#2BEE79', fontWeight: '600' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#1c2936', borderRadius: 16, padding: 16, marginBottom: 24 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#2BEE79' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 8 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  orderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2936', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  orderInfo: { flex: 1 },
  orderId: { fontSize: 14, fontWeight: '600', color: '#fff' },
  orderDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  orderRight: { alignItems: 'flex-end', marginRight: 8 },
  orderTotal: { fontSize: 14, fontWeight: 'bold', color: '#2BEE79' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  statusText: { fontSize: 12, color: '#2BEE79' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2936', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  menuIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(19,127,236,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuText: { flex: 1, fontSize: 15, color: '#fff' },
  bottomSpacer: { height: 40 },
});