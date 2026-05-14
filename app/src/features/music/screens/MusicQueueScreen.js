import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const mockQueue = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', isCurrent: true },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', isCurrent: false },
  { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35', isCurrent: false },
  { id: '4', title: 'Peaches', artist: 'Justin Bieber', duration: '3:18', isCurrent: false },
  { id: '5', title: 'Kiss Me More', artist: 'Doja Cat', duration: '3:29', isCurrent: false },
  { id: '6', title: 'As It Was', artist: 'Harry Styles', duration: '2:47', isCurrent: false },
  { id: '7', title: 'Heat Waves', artist: 'Glass Animals', duration: '3:58', isCurrent: false },
];

const MusicQueueScreen = ({ navigation, onNavigate, onBack }) => {
  const [queue, setQueue] = useState(mockQueue);

  const handleClearQueue = () => {
    Alert.alert(
      'Vider la file',
      'Êtes-vous sûr de vouloir vider la file de lecture ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Vider', style: 'destructive', onPress: () => setQueue([]) },
      ]
    );
  };

  const handleRemoveTrack = (track) => {
    Alert.alert(
      'Retirer de la file',
      `Retirer "${track.title}" de la file ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Retirer', onPress: () => setQueue(queue.filter(t => t.id !== track.id)) },
      ]
    );
  };

  const renderCoverPlaceholder = (size = 45) => (
    <View style={[styles.coverPlaceholder, { width: size, height: size }]}>
      <MaterialCommunityIcons name="music" size={size * 0.4} color="#22c55e" />
    </View>
  );

  const renderQueueItem = (track, index) => (
    <Pressable
      key={track.id}
      style={[styles.queueItem, track.isCurrent && styles.currentTrack]}
      onPress={() => onNavigate?.('player', { track })}
    >
      <View style={styles.dragHandle}>
        <MaterialCommunityIcons name="drag" size={20} color="#666" />
      </View>
      {renderCoverPlaceholder()}
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, track.isCurrent && styles.currentTrackTitle]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
      </View>
      <Text style={styles.trackDuration}>{track.duration}</Text>
      <Pressable style={styles.removeButton} onPress={() => handleRemoveTrack(track)}>
        <MaterialCommunityIcons name="close" size={18} color="#666" />
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>File de lecture</Text>
        <Pressable style={styles.clearButton} onPress={handleClearQueue}>
          <MaterialCommunityIcons name="playlist-remove" size={24} color="#F472B6" />
        </Pressable>
      </View>

      <View style={styles.currentSection}>
        <Text style={styles.sectionTitle}>Prochaine lecture</Text>
        <Pressable style={styles.currentPlayingCard} onPress={() => onNavigate?.('player')}>
          <View style={styles.currentCover}>
            <MaterialCommunityIcons name="music" size={30} color="#22c55e" />
          </View>
          <View style={styles.currentInfo}>
            <Text style={styles.currentTitle}>{queue[0]?.title}</Text>
            <Text style={styles.currentArtist}>{queue[0]?.artist}</Text>
          </View>
          <View style={styles.nowPlayingBadge}>
            <MaterialCommunityIcons name="equalizer" size={16} color="#22c55e" />
          </View>
        </Pressable>
      </View>

      <View style={styles.queueSection}>
        <View style={styles.queueHeader}>
          <Text style={styles.queueCount}>{queue.length - 1} titres dans la file</Text>
          <Text style={styles.queueDuration}>Total: 23:50</Text>
        </View>

        <ScrollView style={styles.queueList} showsVerticalScrollIndicator={false}>
          {queue.slice(1).map((track, index) => renderQueueItem(track, index + 1))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Glissez pour réorganiser</Text>
      </View>
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
  clearButton: {
    padding: 8,
  },
  currentSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  currentPlayingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
  },
  currentCover: {
    width: 60,
    height: 60,
    backgroundColor: '#1a2634',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  currentArtist: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  nowPlayingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0E151B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  queueCount: {
    fontSize: 14,
    color: '#888',
  },
  queueDuration: {
    fontSize: 14,
    color: '#666',
  },
  queueList: {
    flex: 1,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2634',
  },
  currentTrack: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  dragHandle: {
    paddingRight: 8,
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
  currentTrackTitle: {
    color: '#22c55e',
  },
  trackArtist: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

export default MusicQueueScreen;
