import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const mockRecentSearches = ['The Weeknd', 'Harry Styles', 'Dua Lipa'];
const mockTrending = ['Pop hits', 'Rap FR', 'Chill vibes', 'Workout', 'Sleep', 'Focus'];

const mockResults = {
  songs: [
    { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
    { id: '2', title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35' },
  ],
  albums: [
    { id: '1', title: 'After Hours', artist: 'The Weeknd', year: '2020' },
    { id: '2', title: 'Starboy', artist: 'The Weeknd', year: '2016' },
  ],
  artists: [
    { id: '1', name: 'The Weeknd', trackCount: 45 },
  ],
  playlists: [
    { id: '1', title: 'The Weeknd Mix', trackCount: 30 },
  ],
};

const MusicSearchScreen = ({ navigation, onNavigate, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('tout');
  const [searchResults, setSearchResults] = useState(null);

  const filters = ['Tout', 'Titres', 'Albums', 'Artistes'];

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setSearchResults(mockResults);
    } else {
      setSearchResults(null);
    }
  };

  const renderCoverPlaceholder = (size = 50) => (
    <View style={[styles.coverPlaceholder, { width: size, height: size }]}>
      <MaterialCommunityIcons name="music" size={size * 0.4} color="#22c55e" />
    </View>
  );

  const renderRecentItem = (item) => (
    <Pressable
      key={item}
      style={styles.recentItem}
      onPress={() => handleSearch(item)}
    >
      <MaterialCommunityIcons name="history" size={20} color="#888" />
      <Text style={styles.recentText}>{item}</Text>
      <MaterialCommunityIcons name="arrow-up-left" size={18} color="#666" />
    </Pressable>
  );

  const renderTrendingItem = (item) => (
    <Pressable key={item} style={styles.trendingItem}>
      <MaterialCommunityIcons name="trending-up" size={20} color="#137fec" />
      <Text style={styles.trendingText}>{item}</Text>
    </Pressable>
  );

  const renderSongResult = (song) => (
    <Pressable
      key={song.id}
      style={styles.resultItem}
      onPress={() => onNavigate?.('player', { track: song })}
    >
      {renderCoverPlaceholder(45)}
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.resultSubtitle}>{song.artist} • {song.duration}</Text>
      </View>
    </Pressable>
  );

  const renderAlbumResult = (album) => (
    <Pressable
      key={album.id}
      style={styles.resultItem}
      onPress={() => onNavigate?.('album', { album })}
    >
      {renderCoverPlaceholder(45)}
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>{album.title}</Text>
        <Text style={styles.resultSubtitle}>{album.artist} • {album.year}</Text>
      </View>
    </Pressable>
  );

  const renderArtistResult = (artist) => (
    <Pressable
      key={artist.id}
      style={styles.resultItem}
      onPress={() => onNavigate?.('artist', { artist })}
    >
      <View style={styles.artistAvatar}>
        <MaterialCommunityIcons name="account-music" size={24} color="#22c55e" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{artist.name}</Text>
        <Text style={styles.resultSubtitle}>Artiste • {artist.trackCount} titres</Text>
      </View>
    </Pressable>
  );

  const renderPlaylistResult = (playlist) => (
    <Pressable
      key={playlist.id}
      style={styles.resultItem}
      onPress={() => onNavigate?.('playlist', { playlist })}
    >
      {renderCoverPlaceholder(45)}
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>{playlist.title}</Text>
        <Text style={styles.resultSubtitle}>Playlist • {playlist.trackCount} titres</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!searchResults && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recherches récentes</Text>
              {mockRecentSearches.map(renderRecentItem)}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tendances</Text>
              <View style={styles.trendingGrid}>
                {mockTrending.map(renderTrendingItem)}
              </View>
            </View>
          </>
        )}

        {searchResults && (
          <>
            <View style={styles.filters}>
              {filters.map((filter, index) => (
                <Pressable
                  key={filter}
                  style={[styles.filterTab, activeFilter === filter.toLowerCase() && styles.activeFilter]}
                  onPress={() => setActiveFilter(filter.toLowerCase())}
                >
                  <Text style={[styles.filterText, activeFilter === filter.toLowerCase() && styles.activeFilterText]}>
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>

            {(activeFilter === 'tout' || activeFilter === 'titres') && searchResults.songs.length > 0 && (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>Titres</Text>
                {searchResults.songs.map(renderSongResult)}
              </View>
            )}

            {(activeFilter === 'tout' || activeFilter === 'albums') && searchResults.albums.length > 0 && (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>Albums</Text>
                {searchResults.albums.map(renderAlbumResult)}
              </View>
            )}

            {(activeFilter === 'tout' || activeFilter === 'artistes') && searchResults.artists.length > 0 && (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>Artistes</Text>
                {searchResults.artists.map(renderArtistResult)}
              </View>
            )}

            {(activeFilter === 'tout') && searchResults.playlists.length > 0 && (
              <View style={styles.resultSection}>
                <Text style={styles.resultSectionTitle}>Playlists</Text>
                {searchResults.playlists.map(renderPlaylistResult)}
              </View>
            )}
          </>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2634',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  recentText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    marginLeft: 12,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2634',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  trendingText: {
    fontSize: 13,
    color: '#fff',
    marginLeft: 8,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#1a2634',
  },
  activeFilter: {
    backgroundColor: '#22c55e',
  },
  filterText: {
    fontSize: 13,
    color: '#888',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  coverPlaceholder: {
    backgroundColor: '#1a2634',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a2634',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

export default MusicSearchScreen;
