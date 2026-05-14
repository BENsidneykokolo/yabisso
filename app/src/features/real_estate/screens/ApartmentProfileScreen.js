import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockListings = [
  { id: '1', title: 'Appartement Cocody', price: 850000, status: 'publié' },
  { id: '2', title: 'Studio Plateau', price: 350000, status: 'publié' },
  { id: '3', title: 'Villa Marcory', price: 2500000, status: 'en_attente' },
];

export default function ApartmentProfileScreen({ onBack, onNavigate }) {
  const [listings] = useState(mockListings);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="cog" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={40} color="#137fec" />
          </View>
          <Text style={styles.userName}>Propriétaire Yabisso</Text>
          <Text style={styles.userSubtitle}>Gestionnaire immobilier</Text>
          <View style={styles.verifyBadge}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#2BEE79" />
            <Text style={styles.verifyText}>Vérifié</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockListings.length}</Text>
            <Text style={styles.statLabel}>Biens</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Loué(s)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Note</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes biens</Text>
          {listings.map(item => (
            <TouchableOpacity key={item.id} style={styles.listingItem}
              onPress={() => onNavigate?.('apartment_details', { property: item })}>
              <View style={styles.listingLeft}>
                <MaterialCommunityIcons name="home-city" size={24} color="#6b7280" />
              </View>
              <View style={styles.listingInfo}>
                <Text style={styles.listingTitle}>{item.title}</Text>
                <Text style={styles.listingPrice}>{item.price.toLocaleString()} XAF/mois</Text>
              </View>
              <View style={[styles.listingStatus, item.status === 'publié' ? styles.statusPublished : styles.statusPending]}>
                <Text style={[styles.listingStatusText, item.status === 'publié' ? styles.statusPublishedText : styles.statusPendingText]}>
                  {item.status === 'publié' ? 'Publiée' : 'En attente'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate?.('apartment_search')}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(43,238,121,0.1)' }]}>
              <MaterialCommunityIcons name="plus" size={20} color="#2BEE79" />
            </View>
            <Text style={styles.menuText}>Ajouter un bien</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate?.('apartment_listings')}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(19,127,236,0.1)' }]}>
              <MaterialCommunityIcons name="view-grid" size={20} color="#137fec" />
            </View>
            <Text style={styles.menuText}>Gérer mes annonces</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(251,191,36,0.1)' }]}>
              <MaterialCommunityIcons name="chart-line" size={20} color="#fbbf24" />
            </View>
            <Text style={styles.menuText}>Statistiques</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#9ca3af" />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
              <MaterialCommunityIcons name="help-circle-outline" size={20} color="#9ca3af" />
            </View>
            <Text style={styles.menuText}>Aide</Text>
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
  profileCard: { alignItems: 'center', paddingVertical: 28 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1c2936', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#137fec' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  userSubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  verifyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: 'rgba(43,238,121,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  verifyText: { fontSize: 12, color: '#2BEE79', fontWeight: '600' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#1c2936', borderRadius: 16, padding: 16, marginBottom: 24 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 8 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  listingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2936', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  listingLeft: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  listingInfo: { flex: 1, marginLeft: 10 },
  listingTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  listingPrice: { fontSize: 12, color: '#2BEE79', marginTop: 2 },
  listingStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusPublished: { backgroundColor: 'rgba(43,238,121,0.1)' },
  statusPending: { backgroundColor: 'rgba(251,191,36,0.1)' },
  listingStatusText: { fontSize: 11, fontWeight: '600' },
  statusPublishedText: { color: '#2BEE79' },
  statusPendingText: { color: '#fbbf24' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2936', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuText: { flex: 1, fontSize: 15, color: '#fff' },
  bottomSpacer: { height: 40 },
});