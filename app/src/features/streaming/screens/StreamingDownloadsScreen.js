import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, ProgressBar } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const mockDownloads = [
  { id: '1', title: 'Oppenheimer', size: '2.4 GB', quality: '1080p', progress: 1, status: 'complete' },
  { id: '2', title: 'Barbie', size: '1.8 GB', quality: '720p', progress: 0.65, status: 'downloading' },
  { id: '3', title: 'Dune Part Two', size: '2.1 GB', quality: '1080p', progress: 0, status: 'paused' },
];

const StreamingDownloadsScreen = ({ navigation }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <MaterialCommunityIcons name="check-circle" size={20} color="#22c55e" />;
      case 'downloading':
        return <MaterialCommunityIcons name="download" size={20} color="#137fec" />;
      case 'paused':
        return <MaterialCommunityIcons name="pause-circle" size={20} color="#F472B6" />;
      default:
        return null;
    }
  };

  const calculateStorage = () => {
    const total = mockDownloads.reduce((acc, item) => acc + parseFloat(item.size), 0);
    return total.toFixed(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Téléchargements</Text>
      </View>

      <View style={styles.storageCard}>
        <View style={styles.storageInfo}>
          <Ionicons name="server-outline" size={28} color="#137fec" />
          <View style={styles.storageText}>
            <Text style={styles.storageTitle}>Stockage utilisé</Text>
            <Text style={styles.storageValue}>{calculateStorage()} GB sur 10 GB</Text>
          </View>
        </View>
        <View style={styles.storageBar}>
          <View style={[styles.storageFill, { width: `${(calculateStorage() / 10) * 100}%` }]} />
        </View>
        <View style={styles.storageActions}>
          <TouchableOpacity style={styles.storageBtn}>
            <Text style={styles.storageBtnText}>Gérer le stockage</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cleanBtn}>
            <MaterialCommunityIcons name="delete-sweep" size={20} color="#F472B6" />
            <Text style={styles.cleanBtnText}>Nettoyer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.qualitySettings}>
        <Text style={styles.settingsLabel}>Qualité de téléchargement</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Automatique', '1080p', '720p', '480p'].map((quality, index) => (
            <TouchableOpacity
              key={quality}
              style={[styles.qualityPill, index === 0 && styles.qualityPillActive]}
            >
              <Text style={[styles.qualityText, index === 0 && styles.qualityTextActive]}>{quality}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Télécharger ({mockDownloads.length})</Text>
        <TouchableOpacity>
          <Text style={styles.sortBtn}>Trier</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockDownloads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.downloadItem} onPress={() => navigation.navigate('Details', { id: item.id })}>
            <View style={styles.thumbnail}>
              <MaterialCommunityIcons name="movie" size={32} color="#333" />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <View style={styles.itemMeta}>
                <Text style={styles.itemSize}>{item.size}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.itemQuality}>{item.quality}</Text>
              </View>
              {item.status === 'downloading' && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.round(item.progress * 100)}%</Text>
                </View>
              )}
            </View>
            <View style={styles.itemActions}>
              {getStatusIcon(item.status)}
              {item.status === 'downloading' && (
                <TouchableOpacity style={styles.pauseBtn}>
                  <MaterialCommunityIcons name="pause" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              {item.status === 'paused' && (
                <TouchableOpacity style={styles.resumeBtn}>
                  <MaterialCommunityIcons name="play" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="download-off" size={60} color="#333" />
            <Text style={styles.emptyText}>Aucun téléchargement</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  storageCard: { backgroundColor: '#1E2A36', borderRadius: 16, padding: 16, marginBottom: 20 },
  storageInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 14 },
  storageText: { flex: 1 },
  storageTitle: { color: '#888', fontSize: 13 },
  storageValue: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  storageBar: { height: 8, backgroundColor: '#162230', borderRadius: 4, marginBottom: 16 },
  storageFill: { height: '100%', backgroundColor: '#137fec', borderRadius: 4 },
  storageActions: { flexDirection: 'row', justifyContent: 'space-between' },
  storageBtn: { paddingVertical: 8 },
  storageBtnText: { color: '#137fec', fontSize: 14 },
  cleanBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cleanBtnText: { color: '#F472B6', fontSize: 14 },
  qualitySettings: { marginBottom: 24 },
  settingsLabel: { color: '#888', fontSize: 13, marginBottom: 10 },
  qualityPill: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#1E2A36', borderRadius: 20, marginRight: 10 },
  qualityPillActive: { backgroundColor: '#137fec' },
  qualityText: { color: '#888', fontSize: 14 },
  qualityTextActive: { color: '#fff', fontWeight: 'bold' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  sortBtn: { color: '#137fec', fontSize: 14 },
  listContainer: { paddingBottom: 100 },
  downloadItem: { flexDirection: 'row', backgroundColor: '#1E2A36', borderRadius: 12, padding: 12, marginBottom: 12 },
  thumbnail: { width: 80, height: 100, backgroundColor: '#162230', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  itemMeta: { flexDirection: 'row', alignItems: 'center' },
  itemSize: { color: '#888', fontSize: 13 },
  metaDot: { color: '#888', marginHorizontal: 6 },
  itemQuality: { color: '#888', fontSize: 13 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  progressBar: { flex: 1, height: 4, backgroundColor: '#162230', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#137fec', borderRadius: 2 },
  progressText: { color: '#137fec', fontSize: 12, fontWeight: 'bold' },
  itemActions: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  pauseBtn: { padding: 6, backgroundColor: '#162230', borderRadius: 16 },
  resumeBtn: { padding: 6, backgroundColor: '#162230', borderRadius: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#888', fontSize: 16, marginTop: 16 },
});

export default StreamingDownloadsScreen;