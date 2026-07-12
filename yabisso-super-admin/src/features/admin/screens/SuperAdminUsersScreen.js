// app/src/features/admin/screens/SuperAdminUsersScreen.js
// Gestion de tous les utilisateurs
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SuperAdminService } from '../services/SuperAdminService';

const STATUS_COLORS = {
  pending: '#FFD166',
  validated_by_kiosk: '#3B82F6',
  active: '#2BEE79',
  suspended: '#EF4444',
};

const STATUS_LABELS = {
  pending: 'En attente',
  validated_by_kiosk: 'Validé Kiosque',
  active: 'Actif',
  suspended: 'Suspendu',
};

export default function SuperAdminUsersScreen({ onBack, onNavigate }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setRefreshing(true);
    const result = await SuperAdminService.getAllUsers(100);
    if (result.success) {
      setUsers(result.users);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleStatusChange = (user, newStatus) => {
    Alert.alert(
      'Modifier le statut',
      `${user.phone} → ${STATUS_LABELS[newStatus] || newStatus} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            const result = await SuperAdminService.updateUserStatus(user.id, newStatus);
            if (result.success) {
              loadUsers();
            } else {
              Alert.alert('Erreur', result.error || 'Impossible de modifier');
            }
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || (user.phone && user.phone.includes(searchQuery));
    const matchesFilter = filter === 'all' || user.status === filter;
    return matchesSearch && matchesFilter;
  });

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>
          {item.phone ? item.phone.slice(-2) : '?'}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userPhone}>{item.phone || 'Inconnu'}</Text>
        <View style={styles.userMeta}>
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status] || '#7C8A9A'}20` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || '#7C8A9A' }]}>
              {STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
          <Text style={styles.userId}>#{item.id.slice(-6)}</Text>
        </View>
      </View>
      <Pressable
        style={styles.actionButton}
        onPress={() => {
          Alert.alert(
            item.phone,
            'Changer le statut',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Actif', onPress: () => handleStatusChange(item, 'active') },
              { text: 'Suspendu', onPress: () => handleStatusChange(item, 'suspended') },
              { text: 'En attente', onPress: () => handleStatusChange(item, 'pending') },
            ]
          );
        }}
      >
        <MaterialCommunityIcons name="dots-vertical" size={20} color="#7C8A9A" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Utilisateurs</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#7C8A9A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par téléphone..."
          placeholderTextColor="#7C8A9A"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#7C8A9A" />
          </Pressable>
        )}
      </View>

      <View style={styles.filters}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'active', label: 'Actifs' },
          { key: 'pending', label: 'Attente' },
          { key: 'suspended', label: 'Suspendus' },
        ].map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#2BEE79" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadUsers} tintColor="#2BEE79" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-off" size={64} color="#4A5568" />
              <Text style={styles.emptyText}>Aucun utilisateur</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Aucun résultat pour cette recherche' : 'La base est vide'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 40 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#F8FAFC', fontSize: 14, paddingVertical: 12 },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: { backgroundColor: '#2BEE79', borderColor: '#2BEE79' },
  filterText: { color: '#7C8A9A', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#0E151B' },
  listContent: { padding: 16, paddingBottom: 80 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: { color: '#2BEE79', fontSize: 14, fontWeight: '700' },
  userInfo: { flex: 1 },
  userPhone: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '600' },
  userId: { color: '#4A5568', fontSize: 10 },
  actionButton: { padding: 4 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#7C8A9A', fontSize: 13, marginTop: 6 },
});
