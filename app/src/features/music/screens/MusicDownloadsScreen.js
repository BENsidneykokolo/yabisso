import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable, Alert, ProgressBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const mockDownloads = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', size: '8.2 MB' },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', size: '7.8 MB' },
  { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35', size: '9.1 MB' },
  { id: '4', title: 'Peaches', artist: 'Justin Bieber', duration: '3:18', size: '7.5 MB' },
  { id: '5', title: 'Kiss Me More', artist: 'Doja Cat', duration: '3:29', size: '8.4 MB' },
  { id: '6', title: 'As It Was', artist: 'Harry Styles', duration: '2:47', size: '6.9 MB' },
  { id: '7', title: 'Heat Waves', artist: 'Glass Animals', duration: '3:58', size: '9.8 MB' },
  { id: '8', title: 'Stay', artist: 'Kid Laroi', duration: '2:21', size: '5.8 MB' },
];

const MusicDownloadsScreen = ({ navigation, onNavigate, onBack }) => {
  const [downloads, setDownloads] = useState(mockDownloads);
  const totalSize = downloads.reduce((acc, d) => acc + parseFloat(d.size), 0);
  const maxStorage = 5000;
  const usedStorage = totalSize;

  const handleDeleteTrack = (track) => {
    Alert.alert(
      'Supprimer le téléchargement',
      `Voulez-vous supprimer "${track.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => setDownloads(downloads.filter(d => d.id !== track.id)),
        },
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Tout supprimer',
      'Êtes-vous sûr de vouloir supprimer tous les téléchargements ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout supprimer',
          style: 'destructive',
          onPress: () => setDownloads([]),
        },
      ]
    );
  };

  const handleDownloadAll = () => {
    Alert.alert('Télécharger tout', 'Fonctionnalité à venir');
  };

  const handleTrackPress = (track) => {
    onNavigate?.('player', { track });
  };

  const renderCoverPlaceholder = (size = 45) => (
    <View style={[styles.coverPlaceholder, { width: size, height: size }]}>
      <MaterialCommunityIcons name="music" size={size * 0.4} color="#22c55e" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Téléchargements</Text>
        <Pressable style={styles.settingsButton} onPress={() => onNavigate?.('settings')}>
          <MaterialCommunityIcons name="cog" size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.storageSection}>
        <View style={styles.storageHeader}>
          <Text style={styles.storageTitle}>Stockage utilisé</Text>
          <Text style={styles.storageValue}>{usedStorage.toFixed(1)} MB / {maxStorage} MB</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(usedStorage / maxStorage) * 100}%` }]} />
          </View>
        </View>
        <View style={styles.storageActions}>
          <Pressable style={styles.downloadAllButton} onPress={handleDownloadAll}>
            <MaterialCommunityIcons name="download" size={20} color="#22c55e" />
            <Text style={styles.downloadAllText}>Tout télécharger</Text>
          </Pressable>
          <Pressable style={styles.deleteAllButton} onPress={handleDeleteAll}>
            <MaterialCommunityIcons name="delete" size={20} color="#F472B6" />
            <Text style={styles.deleteAllText}>Tout supprimer</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.downloadsHeader}>
        <Text style={styles.downloadsCount}>{downloads.length} titres téléchargés</Text>
      </View>

      <ScrollView style={styles.downloadsList} showsVerticalScrollIndicator={false}>
        {downloads.map((track) => (
          <Pressable
            key={track.id}
            style={styles.downloadItem}
            onPress={() => handleTrackPress(track)}
          >
            {renderCoverPlaceholder()}
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
              <Text style={styles.trackMeta}>{track.artist} • {track.duration}</Text>
            </View>
            <View style={styles.trackActions}>
              <Text style={styles.trackSize}>{track.size}</Text>
              <Pressable style={styles.playButton}>
                <MaterialCommunityIcons name="play" size={20} color="#fff" />
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => handleDeleteTrack(track)}>
                <MaterialCommunityIcons name="delete-outline" size={20} color="#F472B6" />
              </Pressable>
            </View>
          </Pressable>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  storageSection: {
    backgroundColor: '#1a2634',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageTitle: {
    fontSize: 14,
    color: '#888',
  },
  storageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#0E151B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  storageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  downloadAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E151B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  downloadAllText: {
    fontSize: 13,
    color: '#22c55e',
    marginLeft: 6,
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E151B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  deleteAllText: {
    fontSize: 13,
    color: '#F472B6',
    marginLeft: 6,
  },
  downloadsHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  downloadsCount: {
    fontSize: 14,
    color: '#888',
  },
  downloadsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2634',
  },
  coverPlaceholder: {
    backgroundColor: '#1a2634',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  trackMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackSize: {
    fontSize: 11,
    color: '#666',
    marginRight: 12,
  },
  playButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
});

export default MusicDownloadsScreen;
