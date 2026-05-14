import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const mockPlaylist = {
  id: '1',
  title: 'Favoris',
  description: 'Vos morceaux préférés',
  totalTracks: 45,
  duration: '2h 45min',
  cover: null,
};

const mockTracks = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20' },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23' },
  { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: '3:35' },
  { id: '4', title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: '3:18' },
  { id: '5', title: 'Kiss Me More', artist: 'Doja Cat', album: 'Planet Her', duration: '3:29' },
  { id: '6', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: '2:47' },
  { id: '7', title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration: '3:58' },
  { id: '8', title: 'Stay', artist: 'Kid Laroi', album: 'F*CK LOVE 3', duration: '2:21' },
];

const MusicPlaylistScreen = ({ navigation, onNavigate, onBack, route }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playlist = route?.params?.playlist || mockPlaylist;

  const renderCoverPlaceholder = (size = 180) => (
    <View style={[styles.coverPlaceholder, { width: size, height: size }]}>
      <MaterialCommunityIcons name="music" size={size * 0.4} color="#22c55e" />
    </View>
  );

  const handlePlayAll = () => {
    setIsPlaying(true);
    onNavigate?.('player');
  };

  const handleShuffle = () => {
    Alert.alert('Aléatoire', 'Lecture aléatoire activée');
    onNavigate?.('player');
  };

  const handleAddTracks = () => {
    Alert.alert('Ajouter des titres', 'Fonctionnalité à venir');
  };

  const handleTrackPress = (track) => {
    onNavigate?.('player', { track });
  };

  const handleOverflowMenu = (track) => {
    Alert.alert(
      track.title,
      '',
      [
        { text: 'Ajouter à la file', onPress: () => {} },
        { text: 'Ajouter à une playlist', onPress: () => {} },
        { text: 'Télécharger', onPress: () => {} },
        { text: 'Partager', onPress: () => {} },
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
        <Text style={styles.headerTitle} numberOfLines={1}>{playlist.title}</Text>
        <Pressable style={styles.moreButton}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.playlistHeader}>
          {renderCoverPlaceholder()}
          <View style={styles.playlistInfo}>
            <Text style={styles.playlistTitle}>{playlist.title}</Text>
            {playlist.description && (
              <Text style={styles.playlistDescription}>{playlist.description}</Text>
            )}
            <Text style={styles.playlistMeta}>
              {playlist.totalTracks} titres • {playlist.duration}
            </Text>
            <View style={styles.actionButtons}>
              <Pressable style={styles.playAllButton} onPress={handlePlayAll}>
                <MaterialCommunityIcons name="play" size={24} color="#0E151B" />
                <Text style={styles.playAllText}>Tout lire</Text>
              </Pressable>
              <Pressable style={styles.shuffleButton} onPress={handleShuffle}>
                <MaterialCommunityIcons name="shuffle" size={24} color="#22c55e" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.addTracksRow}>
          <Pressable style={styles.addTracksButton} onPress={handleAddTracks}>
            <MaterialCommunityIcons name="plus" size={20} color="#22c55e" />
            <Text style={styles.addTracksText}>Ajouter des titres</Text>
          </Pressable>
        </View>

        <View style={styles.trackList}>
          {mockTracks.map((track, index) => (
            <Pressable
              key={track.id}
              style={styles.trackItem}
              onPress={() => handleTrackPress(track)}
            >
              <Text style={styles.trackNumber}>{index + 1}</Text>
              <View style={styles.trackCover}>
                <MaterialCommunityIcons name="music" size={20} color="#22c55e" />
              </View>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{track.artist} • {track.album}</Text>
              </View>
              <Text style={styles.trackDuration}>{track.duration}</Text>
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
  playlistHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  coverPlaceholder: {
    backgroundColor: '#1a2634',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  playlistTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  playlistMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E151B',
    marginLeft: 8,
  },
  shuffleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a2634',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTracksRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  addTracksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2634',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addTracksText: {
    fontSize: 14,
    color: '#22c55e',
    marginLeft: 8,
  },
  trackList: {
    paddingHorizontal: 16,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2634',
  },
  trackNumber: {
    width: 24,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  trackCover: {
    width: 40,
    height: 40,
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
  trackArtist: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  overflowButton: {
    padding: 4,
  },
});

export default MusicPlaylistScreen;
