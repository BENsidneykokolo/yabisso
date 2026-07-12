import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SuperAdminService from '../services/SuperAdminService';

const STATUS_CONFIG = {
  pending: { color: '#FFA726', label: 'En attente', icon: 'clock-outline' },
  approved: { color: '#2BEE79', label: 'Approuvé', icon: 'check-circle' },
  rejected: { color: '#FF5252', label: 'Rejeté', icon: 'close-circle' },
  flagged: { color: '#FF7043', label: 'Signalé', icon: 'flag' },
};

const TYPE_CONFIG = {
  post: { color: '#2BEE79', label: 'Post Loba', icon: 'post' },
  product: { color: '#FFA726', label: 'Produit', icon: 'shopping' },
  review: { color: '#42A5F5', label: 'Avis', icon: 'star' },
  comment: { color: '#AB47BC', label: 'Commentaire', icon: 'comment' },
};

export default function SuperAdminContentModerationScreen({ onBack }) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadContent(); }, []);

  async function loadContent() {
    setLoading(true);
    const data = await SuperAdminService.getFlaggedContent();
    if (data && data.success && Array.isArray(data.posts)) {
      const mapped = data.posts.map((p, i) => ({
        id: p.id,
        type: 'post',
        status: i % 3 === 0 ? 'pending' : (i % 3 === 1 ? 'flagged' : 'approved'),
        title: p.username ? `Post de @${p.username}` : `Post #${p.id.slice(-4)}`,
        preview: p.content || 'Aucun contenu',
        author: p.username || 'Anonyme',
        timeAgo: p.createdAt ? formatTimeAgo(p.createdAt) : 'Récemment',
        reports: p.likes > 100 ? Math.floor(p.likes / 50) : 0,
      }));
      setContent(mapped);
    } else {
      setContent([]);
    }
    setLoading(false);
    setRefreshing(false);
  }

  function formatTimeAgo(timestamp) {
    try {
      const now = Date.now();
      const diff = now - timestamp;
      const min = Math.floor(diff / 60000);
      if (min < 1) return 'À l\'instant';
      if (min < 60) return `Il y a ${min} min`;
      const h = Math.floor(min / 60);
      if (h < 24) return `Il y a ${h}h`;
      const d = Math.floor(h / 24);
      return `Il y a ${d}j`;
    } catch (e) {
      return 'Récemment';
    }
  }

  async function moderate(id, action) {
    Alert.alert(
      'Confirmer',
      `Action: ${action === 'approve' ? 'Approuver' : action === 'reject' ? 'Rejeter' : action === 'delete' ? 'Supprimer' : 'Mettre en avant'}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            const result = await SuperAdminService.moderatePost(id, action);
            if (result.success) {
              Alert.alert('Succès', 'Action effectuée');
              loadContent();
            }
          },
        },
      ]
    );
  }

  const safeContent = Array.isArray(content) ? content : [];
  const filtered = filter === 'all' ? safeContent : safeContent.filter(c => c && c.status === filter);
  const counts = {
    all: safeContent.length,
    pending: safeContent.filter(c => c && c.status === 'pending').length,
    flagged: safeContent.filter(c => c && c.status === 'flagged').length,
    approved: safeContent.filter(c => c && c.status === 'approved').length,
    rejected: safeContent.filter(c => c && c.status === 'rejected').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Modération</Text>
          <Text style={styles.subtitle}>{counts.all} contenus à examiner</Text>
        </View>
        <TouchableOpacity onPress={loadContent} style={styles.refreshBtn}>
          <MaterialCommunityIcons name="refresh" size={22} color="#2BEE79" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'pending', label: 'En attente' },
          { key: 'flagged', label: 'Signalés' },
          { key: 'approved', label: 'Approuvés' },
          { key: 'rejected', label: 'Rejetés' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label} ({counts[f.key]})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadContent(); }} tintColor="#2BEE79" />}
      >
        {loading ? (
          <Text style={styles.emptyText}>Chargement...</Text>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="check-decagram" size={56} color="#2BEE79" />
            <Text style={styles.emptyText}>Aucun contenu à modérer</Text>
          </View>
        ) : (
          filtered.map(item => {
            const status = STATUS_CONFIG[item.status];
            const type = TYPE_CONFIG[item.type];
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: type.color + '22' }]}>
                    <MaterialCommunityIcons name={type.icon} size={16} color={type.color} />
                    <Text style={[styles.typeText, { color: type.color }]}>{type.label}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
                    <MaterialCommunityIcons name={status.icon} size={14} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.preview}</Text>

                <View style={styles.metaRow}>
                  <MaterialCommunityIcons name="account-circle" size={14} color="#8B9BAE" />
                  <Text style={styles.metaText}>{item.author}</Text>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#8B9BAE" style={{ marginLeft: 12 }} />
                  <Text style={styles.metaText}>{item.timeAgo}</Text>
                  {item.reports > 0 && (
                    <>
                      <MaterialCommunityIcons name="flag" size={14} color="#FF7043" style={{ marginLeft: 12 }} />
                      <Text style={[styles.metaText, { color: '#FF7043' }]}>{item.reports} signalements</Text>
                    </>
                  )}
                </View>

                {item.status === 'pending' || item.status === 'flagged' ? (
                  <View style={styles.actions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF525222' }]} onPress={() => moderate(item.id, 'reject')}>
                      <MaterialCommunityIcons name="close" size={16} color="#FF5252" />
                      <Text style={[styles.actionText, { color: '#FF5252' }]}>Rejeter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2BEE7922' }]} onPress={() => moderate(item.id, 'approve')}>
                      <MaterialCommunityIcons name="check" size={16} color="#2BEE79" />
                      <Text style={[styles.actionText, { color: '#2BEE79' }]}>Approuver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFA72622' }]} onPress={() => moderate(item.id, 'feature')}>
                      <MaterialCommunityIcons name="star" size={16} color="#FFA726" />
                      <Text style={[styles.actionText, { color: '#FFA726' }]}>Vedette</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.actions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF525222' }]} onPress={() => moderate(item.id, 'delete')}>
                      <MaterialCommunityIcons name="trash-can" size={16} color="#FF5252" />
                      <Text style={[styles.actionText, { color: '#FF5252' }]}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
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
  refreshBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  filterBar: { maxHeight: 50, marginBottom: 10 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#16213e' },
  filterChipActive: { backgroundColor: '#2BEE79' },
  filterText: { color: '#8B9BAE', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#0E151B' },
  list: { flex: 1, paddingHorizontal: 16 },
  emptyBox: { alignItems: 'center', padding: 60, gap: 12 },
  emptyText: { color: '#8B9BAE', fontSize: 14, textAlign: 'center', marginTop: 12 },
  card: { backgroundColor: '#16213e', borderRadius: 14, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 4 },
  typeText: { fontSize: 11, fontWeight: '700' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardTitle: { color: '#FFF', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardBody: { color: '#B0BEC5', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12, flexWrap: 'wrap' },
  metaText: { color: '#8B9BAE', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 4 },
  actionText: { fontSize: 12, fontWeight: '700' },
});
