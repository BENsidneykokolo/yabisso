import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockListings = [
  { id: '1', title: 'Appartement Cocody', type: 'Appartement', price: 850000, status: 'publié', views: 124, likes: 12 },
  { id: '2', title: 'Studio Plateau', type: 'Studio', price: 350000, status: 'publié', views: 89, likes: 8 },
  { id: '3', title: 'Villa Marcory', type: 'Villa', price: 2500000, status: 'en_attente', views: 45, likes: 5 },
];

const stats = { total: 3, published: 2, pending: 1, views: 258 };

export default function ApartmentListingsScreen({ onBack, onNavigate }) {
  const [listings] = useState(mockListings);

  const getStatusStyle = (status) => {
    if (status === 'publié') return { bg: 'rgba(43,238,121,0.1)', color: '#2BEE79', text: 'Publiée' };
    return { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', text: 'En attente' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mes biens</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => onNavigate?.('apartment_search')}>
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#2BEE79' }]}>{stats.published}</Text>
            <Text style={styles.statLabel}>Publiées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#fbbf24' }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.views}</Text>
            <Text style={styles.statLabel}>Vues</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes annonces</Text>
          {listings.map(item => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <TouchableOpacity key={item.id} style={styles.listingCard}
                onPress={() => onNavigate?.('apartment_details', { property: item })}>
                <View style={styles.listingImage}>
                  <MaterialCommunityIcons name="home-city" size={32} color="#6b7280" />
                </View>
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle}>{item.title}</Text>
                  <Text style={styles.listingType}>{item.type}</Text>
                  <View style={styles.listingMeta}>
                    <Text style={styles.listingPrice}>{item.price.toLocaleString()} XAF/mois</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.text}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.listingActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <MaterialCommunityIcons name="pencil" size={18} color="#137fec" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <MaterialCommunityIcons name="eye" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <MaterialCommunityIcons name="heart" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate?.('apartment_search')}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="plus-circle" size={20} color="#2BEE79" />
            </View>
            <View>
              <Text style={styles.menuTitle}>Publier une annonce</Text>
              <Text style={styles.menuSubtitle}>Ajouter un nouveau bien</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="chart-bar" size={20} color="#137fec" />
            </View>
            <View>
              <Text style={styles.menuTitle}>Statistiques</Text>
              <Text style={styles.menuSubtitle}>Vue d'ensemble de vos biens</Text>
            </View>
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
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2BEE79', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#1c2936', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  listingCard: { flexDirection: 'row', backgroundColor: '#1c2936', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  listingImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  listingInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  listingTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  listingType: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  listingMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  listingPrice: { fontSize: 13, fontWeight: '600', color: '#2BEE79' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '600' },
  listingActions: { justifyContent: 'space-around', gap: 8 },
  actionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2936', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  menuSubtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  bottomSpacer: { height: 40 },
});