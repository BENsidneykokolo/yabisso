import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const mockArtist = {
  id: '1',
  name: 'The Weeknd',
  monthlyListeners: '85.4M',
  cover: null,
};

const mockPopularTracks = [
  { id: '1', title: 'Blinding Lights', plays: '3.2B', duration: '3:20' },
  { id: '2', title: 'Save Your Tears', plays: '1.8B', duration: '3:35' },
  { id: '3', title: 'Starboy', plays: '1.6B', duration: '3:50' },
  { id: '4', title: 'The Hills', plays: '1.5B', duration: '4:02' },
  { id: '5', title: 'Call Out My Name', plays: '1.1B', duration: '3:48' },
];

const mockAlbums = [
  { id: '1', title: 'After Hours', year: '2020', trackCount: 14 },
  { id: '2', title: 'Starboy', year: '2016', trackCount: 18 },
  { id: '3', title: 'Beauty Behind The Madness', year: '2015', trackCount: 17 },
  { id: '4', title: 'Kiss Land', year: '2013', trackCount: 12 },
];

const mockAbout = {
  bio: 'Abel Tesfaye, plus connu sous son nom de scène The Weeknd, est un auteur-compositeur-interprète, producteur et acteur canadien. Il a révolutionné la musique moderne avec son mélange unique de R&B, pop et alternative.',
  followers: '85.4M',
  verified: true,
};

const MusicArtistScreen = ({ navigation, onNavigate, onBack, route }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const artist = route?.params?.artist || mockArtist;

  const renderAvatarPlaceholder = (size = 180) => (
    <View style={[styles.avatarPlaceholder, { width: size, height: size }]}>
      <MaterialCommunityIcons name="account-music" size={size * 0.5} color="#22c55e" />
    </View>
  );

  const renderCoverPlaceholder = (size = 50) => (
    <View style={[styles.coverPlaceholder, { width: size, height: size }]}>
      <MaterialCommunityIcons name="music" size={size * 0.4} color="#22c55e" />
    </View>
  );

  const handleTrackPress = (track) => {
    onNavigate?.('player', { track, artist });
  };

  const handleAlbumPress = (album) => {
    onNavigate?.('album', { album });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{artist.name}</Text>
        <Pressable style={styles.moreButton}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.artistHeader}>
          {renderAvatarPlaceholder()}
          <View style={styles.artistInfo}>
            <View style={styles.artistNameRow}>
              <Text style={styles.artistName}>{artist.name}</Text>
              {mockAbout.verified && (
                <MaterialCommunityIcons name="check-decagram" size={20} color="#137fec" />
              )}
            </View>
            <Text style={styles.monthlyListeners}>{artist.monthlyListeners} auditeurs mensuels</Text>
          </View>
          <View style={styles.artistActions}>
            <Pressable style={styles.followButton}>
              <Text style={styles.followText}>Suivre</Text>
            </Pressable>
            <Pressable style={styles.shuffleButton} onPress={() => setIsPlaying(!isPlaying)}>
              <MaterialCommunityIcons name="shuffle" size={24} color="#22c55e" />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Titres populaires</Text>
          {mockPopularTracks.map((track, index) => (
            <Pressable
              key={track.id}
              style={styles.trackItem}
              onPress={() => handleTrackPress(track)}
            >
              <Text style={styles.trackIndex}>{index + 1}</Text>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.trackPlays}>{track.plays} lectures</Text>
              </View>
              <Text style={styles.trackDuration}>{track.duration}</Text>
              <Pressable style={styles.playButton}>
                <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={18} color="#fff" />
              </Pressable>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Albums</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockAlbums.map((album) => (
              <Pressable
                key={album.id}
                style={styles.albumCard}
                onPress={() => handleAlbumPress(album)}
              >
                {renderCoverPlaceholder(120)}
                <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
                <Text style={styles.albumMeta}>{album.year}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.aboutCard}>
            <View style={styles.aboutHeader}>
              <View style={styles.followersInfo}>
                <Text style={styles.followersCount}>{mockAbout.followers}</Text>
                <Text style={styles.followersLabel}>abonnés</Text>
              </View>
            </View>
            <Text style={styles.aboutBio}>{mockAbout.bio}</Text>
          </View>
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
  artistHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  avatarPlaceholder: {
    borderRadius: 90,
    backgroundColor: '#1a2634',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  artistInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  artistNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  monthlyListeners: {
    fontSize: 14,
    color: '#888',
  },
  artistActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: '#22c55e',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginRight: 16,
  },
  followText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E151B',
  },
  shuffleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a2634',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2634',
  },
  trackIndex: {
    width: 24,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  trackPlays: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  playButton: {
    padding: 4,
  },
  albumCard: {
    width: 140,
    marginRight: 12,
  },
  coverPlaceholder: {
    backgroundColor: '#1a2634',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  albumMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  aboutCard: {
    backgroundColor: '#1a2634',
    borderRadius: 12,
    padding: 16,
  },
  aboutHeader: {
    marginBottom: 12,
  },
  followersInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  followersCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 4,
  },
  followersLabel: {
    fontSize: 14,
    color: '#888',
  },
  aboutBio: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
});

export default MusicArtistScreen;
