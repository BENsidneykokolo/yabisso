import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

const mockRecommended = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', cover: null },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', cover: null },
  { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35', cover: null },
  { id: '4', title: 'Peaches', artist: 'Justin Bieber', duration: '3:18', cover: null },
  { id: '5', title: 'Kiss Me More', artist: 'Doja Cat', duration: '3:29', cover: null },
];

const mockRecentReleases = [
  { id: '6', title: 'As It Was', artist: 'Harry Styles', duration: '2:47', cover: null },
  { id: '7', title: 'Heat Waves', artist: 'Glass Animals', duration: '3:58', cover: null },
  { id: '8', title: 'Stay', artist: 'Kid Laroi', duration: '2:21', cover: null },
  { id: '9', title: 'Bad Habits', artist: 'Ed Sheeran', duration: '3:50', cover: null },
];

const mockPlaylists = [
  { id: '1', title: 'Favoris', trackCount: 45, cover: null },
  { id: '2', title: 'Workout', trackCount: 32, cover: null },
  { id: '3', title: 'Chill Vibes', trackCount: 28, cover: null },
  { id: '4', title: 'Party Mix', trackCount: 50, cover: null },
  { id: '5', title: 'Focus Flow', trackCount: 25, cover: null },
  { id: '6', title: 'Sleep', trackCount: 20, cover: null },
];

const MusicHomeScreen = ({ navigation, onNavigate, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack] = useState({ title: 'Blinding Lights', artist: 'The Weeknd' });

  const renderCoverPlaceholder = (size = 60) => (
    <View style={[styles.coverPlaceholder, { width: size, height: size }]}>
      <MaterialCommunityIcons name="music" size={size * 0.4} color="#22c55e" />
    </View>
  );

  const renderMusicCard = (item) => (
    <Pressable
      key={item.id}
      style={styles.musicCard}
      onPress={() => onNavigate?.('player', { track: item })}
    >
      {renderCoverPlaceholder(CARD_WIDTH - 20)}
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.cardArtist} numberOfLines={1}>{item.artist}</Text>
      <Text style={styles.cardDuration}>{item.duration}</Text>
    </Pressable>
  );

  const renderPlaylistCard = (item) => (
    <Pressable
      key={item.id}
      style={styles.playlistCard}
      onPress={() => onNavigate?.('playlist', { playlist: item })}
    >
      {renderCoverPlaceholder(80)}
      <Text style={styles.playlistTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.playlistCount}>{item.trackCount} titres</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Musique</Text>
        <Pressable onPress={() => onNavigate?.('search')} style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>Votre musique, partout</Text>
          <Text style={styles.heroSubtitle}>Des millions de titres à portée de main</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommandés</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {mockRecommended.map(renderMusicCard)}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dernières sorties</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {mockRecentReleases.map(renderMusicCard)}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos playlists</Text>
          <View style={styles.playlistGrid}>
            {mockPlaylists.map(renderPlaylistCard)}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.miniPlayer}>
        <Pressable onPress={() => onNavigate?.('player')} style={styles.miniPlayerContent}>
          {renderCoverPlaceholder(45)}
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.miniPlayerArtist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
        </Pressable>
        <View style={styles.miniPlayerControls}>
          <Pressable onPress={() => setIsPlaying(!isPlaying)} style={styles.miniPlayerButton}>
            <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={28} color="#fff" />
          </Pressable>
          <Pressable onPress={() => onNavigate?.('queue')} style={styles.miniPlayerButton}>
            <MaterialCommunityIcons name="skip-next" size={28} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => onNavigate?.('home')}>
          <MaterialCommunityIcons name="home" size={24} color="#22c55e" />
          <Text style={[styles.navText, styles.navTextActive]}>Accueil</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => onNavigate?.('library')}>
          <MaterialCommunityIcons name="library" size={24} color="#666" />
          <Text style={styles.navText}>Bibliothèque</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => onNavigate?.('search')}>
          <Ionicons name="search" size={24} color="#666" />
          <Text style={styles.navText}>Recherche</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => onNavigate?.('profile')}>
          <MaterialCommunityIcons name="account-circle" size={24} color="#666" />
          <Text style={styles.navText}>Profil</Text>
        </Pressable>
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
  searchButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  heroBanner: {
    backgroundColor: '#137fec',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  musicCard: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  coverPlaceholder: {
    backgroundColor: '#1a2634',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cardArtist: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  cardDuration: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  playlistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  playlistCard: {
    width: '47%',
    marginRight: '6%',
    marginBottom: 16,
  },
  playlistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  playlistCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: '#1a2634',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a3644',
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniPlayerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  miniPlayerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  miniPlayerArtist: {
    fontSize: 12,
    color: '#888',
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniPlayerButton: {
    padding: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0a1015',
    borderTopWidth: 1,
    borderTopColor: '#1a2634',
    paddingVertical: 8,
    paddingBottom: 24,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  navTextActive: {
    color: '#22c55e',
  },
});

export default MusicHomeScreen;
