import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const mockAlbum = {
  id: '1',
  title: 'After Hours',
  artist: 'The Weeknd',
  year: '2020',
  totalTracks: 14,
  duration: '56min',
  cover: null,
};

const mockTracks = [
  { id: '1', title: 'Alone Again', duration: '4:10' },
  { id: '2', title: 'Too Late', duration: '3:25' },
  { id: '3', title: 'Hardest To Love', duration: '3:31' },
  { id: '4', title: 'Scared To Live', duration: '3:12' },
  { id: '5', title: 'Snowchild', duration: '3:45' },
  { id: '6', title: 'Escape From LA', duration: '4:08' },
  { id: '7', title: 'Heartless', duration: '3:20' },
  { id: '8', title: 'In Your Eyes', duration: '3:58' },
  { id: '9', title: 'Save Your Tears', duration: '3:35' },
  { id: '10', title: 'Blinding Lights', duration: '3:20' },
  { id: '11', title: 'Repeat After Me', duration: '3:15' },
  { id: '12', title: 'After Hours', duration: '4:22' },
];

const MusicAlbumScreen = ({ navigation, onNavigate, onBack, route }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const album = route?.params?.album || mockAlbum;

  const renderCoverPlaceholder = (size = 200) => (
    <View style={[styles.coverPlaceholder, { width: size, height: size }]}>
      <MaterialCommunityIcons name="music" size={size * 0.4} color="#22c55e" />
    </View>
  );

  const handlePlayAlbum = () => {
    setIsPlaying(true);
    onNavigate?.('player', { track: mockTracks[0] });
  };

  const handleShuffle = () => {
    Alert.alert('Aléatoire', 'Lecture aléatoire activée');
    onNavigate?.('player', { track: mockTracks[Math.floor(Math.random() * mockTracks.length)] });
  };

  const handleTrackPress = (track) => {
    onNavigate?.('player', { track, album });
  };

  const handleOverflowMenu = (track) => {
    Alert.alert(
      track.title,
      '',
      [
        { text: 'Ajouter à la file', onPress: () => {} },
        { text: 'Ajouter à une playlist', onPress: () => {} },
        { text: 'Télécharger', onPress: () => {} },
        { text: 'Aller à l\'artiste', onPress: () => onNavigate?.('artist', { artist: { name: album.artist } }) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{album.title}</Text>
        <Pressable style={styles.moreButton}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.albumHeader}>
          {renderCoverPlaceholder()}
          <View style={styles.albumInfo}>
            <Text style={styles.albumTitle}>{album.title}</Text>
            <Pressable onPress={() => onNavigate?.('artist', { artist: { name: album.artist } })}>
              <Text style={styles.albumArtist}>{album.artist}</Text>
            </Pressable>
            <Text style={styles.albumMeta}>{album.year} • {album.totalTracks} titres • {album.duration}</Text>
            <View style={styles.actionButtons}>
              <Pressable style={styles.playButton} onPress={handlePlayAlbum}>
                <MaterialCommunityIcons name="play" size={24} color="#0E151B" />
                <Text style={styles.playText}>Lire l'album</Text>
              </Pressable>
              <Pressable style={styles.shuffleButton} onPress={handleShuffle}>
                <MaterialCommunityIcons name="shuffle" size={24} color="#22c55e" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.trackList}>
          {mockTracks.map((track, index) => (
            <Pressable
              key={track.id}
              style={styles.trackItem}
              onPress={() => handleTrackPress(track)}
            >
              <View style={styles.trackNumber}>
                <MaterialCommunityIcons name="music-note" size={16} color="#666" />
              </View>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
              </View>
              <Pressable style={styles.overflowButton} onPress={() => handleOverflowMenu(track)}>
                <MaterialCommunityIcons name="dots-vertical" size={20} color="#666" />
              </Pressable>
            </Pressable>
          ))}
        </View>

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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 12,
  },
  moreButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  albumHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#1a2634',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  coverPlaceholder: {
    backgroundColor: '#0E151B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  albumInfo: {
    alignItems: 'center',
  },
  albumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  albumArtist: {
    fontSize: 16,
    color: '#137fec',
    marginBottom: 4,
  },
  albumMeta: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginRight: 12,
  },
  playText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E151B',
    marginLeft: 8,
  },
  shuffleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0E151B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackList: {
    paddingHorizontal: 16,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2634',
  },
  trackNumber: {
    width: 32,
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  overflowButton: {
    padding: 4,
  },
});

export default MusicAlbumScreen;
