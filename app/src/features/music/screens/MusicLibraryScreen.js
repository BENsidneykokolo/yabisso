import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockSongs = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20' },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23' },
  { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: '3:35' },
  { id: '4', title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: '3:18' },
  { id: '5', title: 'Kiss Me More', artist: 'Doja Cat', album: 'Planet Her', duration: '3:29' },
  { id: '6', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: '2:47' },
];

const mockAlbums = [
  { id: '1', title: 'After Hours', artist: 'The Weeknd', year: '2020', trackCount: 14 },
  { id: '2', title: 'Future Nostalgia', artist: 'Dua Lipa', year: '2020', trackCount: 11 },
  { id: '3', title: 'Justice', artist: 'Justin Bieber', year: '2021', trackCount: 18 },
  { id: '4', title: "Harry's House", artist: 'Harry Styles', year: '2022', trackCount: 13 },
];

const mockArtists = [
  { id: '1', name: 'The Weeknd', trackCount: 45 },
  { id: '2', name: 'Dua Lipa', trackCount: 32 },
  { id: '3', name: 'Justin Bieber', trackCount: 58 },
  { id: '4', name: 'Harry Styles', trackCount: 25 },
];

const mockPlaylists = [
  { id: '1', title: 'Favoris', trackCount: 45 },
  { id: '2', title: 'Workout', trackCount: 32 },
  { id: '3', name: 'Chill Vibes', trackCount: 28 },
];

const mockRecent = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', duration: '3:23' },
  { id: '3', title: 'As It Was', artist: 'Harry Styles', duration: '2:47' },
];

const MusicLibraryScreen = ({ navigation, onNavigate, onBack }) => {
  const [activeTab, setActiveTab] = useState('titres');
  const [isPlaying, setIsPlaying] = useState(false);

  const tabs = ['Titres', 'Albums', 'Artistes', 'Playlists'];

  const renderCoverPlaceholder = (size = 50) => (
    <View style={[styles.coverPlaceholder, { width: size, height: size }]}>
      <MaterialCommunityIcons name="music" size={size * 0.4} color="#22c55e" />
    </View>
  );

  const renderSongItem = (song, index) => (
    <Pressable
      key={song.id}
      style={styles.listItem}
      onPress={() => onNavigate?.('player', { track: song })}
    >
      <Text style={styles.itemIndex}>{index + 1}</Text>
      {renderCoverPlaceholder(45)}
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>{song.artist} • {song.album}</Text>
      </View>
      <Text style={styles.itemDuration}>{song.duration}</Text>
      <Pressable style={styles.playButton} onPress={() => setIsPlaying(!isPlaying)}>
        <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
      </Pressable>
    </Pressable>
  );

  const renderAlbumItem = (album) => (
    <Pressable
      key={album.id}
      style={styles.albumItem}
      onPress={() => onNavigate?.('album', { album })}
    >
      {renderCoverPlaceholder(80)}
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
        <Text style={styles.albumArtist} numberOfLines={1}>{album.artist}</Text>
        <Text style={styles.albumMeta}>{album.year} • {album.trackCount} titres</Text>
      </View>
    </Pressable>
  );

  const renderArtistItem = (artist) => (
    <Pressable
      key={artist.id}
      style={styles.artistItem}
      onPress={() => onNavigate?.('artist', { artist })}
    >
      <View style={styles.artistAvatar}>
        <MaterialCommunityIcons name="account-music" size={30} color="#22c55e" />
      </View>
      <View style={styles.artistInfo}>
        <Text style={styles.artistName}>{artist.name}</Text>
        <Text style={styles.artistMeta}>{artist.trackCount} titres</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
    </Pressable>
  );

  const renderPlaylistItem = (playlist) => (
    <Pressable
      key={playlist.id}
      style={styles.listItem}
      onPress={() => onNavigate?.('playlist', { playlist })}
    >
      {renderCoverPlaceholder(45)}
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>{playlist.title}</Text>
        <Text style={styles.itemSubtitle}>{playlist.trackCount} titres</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
    </Pressable>
  );

  const renderRecentItem = (item) => (
    <Pressable key={item.id} style={styles.recentItem}>
      {renderCoverPlaceholder(50)}
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Bibliothèque</Text>
        <Pressable style={styles.settingsButton}>
          <MaterialCommunityIcons name="cog" size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab.toLowerCase() && styles.activeTab]}
            onPress={() => setActiveTab(tab.toLowerCase())}
          >
            <Text style={[styles.tabText, activeTab === tab.toLowerCase() && styles.activeTabText]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'titres' && (
          <>
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Écouté récemment</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {mockRecent.map(renderRecentItem)}
              </ScrollView>
            </View>
            <View style={styles.listSection}>
              {mockSongs.map(renderSongItem)}
            </View>
          </>
        )}

        {activeTab === 'albums' && (
          <View style={styles.albumsGrid}>
            {mockAlbums.map(renderAlbumItem)}
          </View>
        )}

        {activeTab === 'artistes' && (
          <View style={styles.listSection}>
            {mockArtists.map(renderArtistItem)}
          </View>
        )}

        {activeTab === 'playlists' && (
          <View style={styles.listSection}>
            {mockPlaylists.map(renderPlaylistItem)}
          </View>
        )}

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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#1a2634',
  },
  activeTab: {
    backgroundColor: '#22c55e',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recentItem: {
    width: 140,
    marginRight: 12,
    paddingHorizontal: 8,
  },
  recentInfo: {
    marginTop: 8,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  recentArtist: {
    fontSize: 11,
    color: '#888',
  },
  listSection: {
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2634',
  },
  itemIndex: {
    width: 24,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  coverPlaceholder: {
    backgroundColor: '#1a2634',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  itemDuration: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  playButton: {
    padding: 4,
  },
  albumsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  albumItem: {
    width: '50%',
    paddingRight: 8,
    marginBottom: 20,
  },
  albumInfo: {
    marginTop: 8,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  albumArtist: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  albumMeta: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2634',
  },
  artistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a2634',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  artistMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

export default MusicLibraryScreen;
