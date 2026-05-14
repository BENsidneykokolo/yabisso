import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const MusicPlayerScreen = ({ navigation, onNavigate, onBack, route }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentTrack] = useState(route?.params?.track || { title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSeconds = 200;
  const currentSeconds = Math.floor(progress * totalSeconds);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-down" size={28} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>Lecture en cours</Text>
        </View>
        <Pressable onPress={() => onNavigate?.('queue')} style={styles.queueButton}>
          <MaterialCommunityIcons name="playlist-music" size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.artworkContainer}>
          <View style={styles.artworkPlaceholder}>
            <MaterialCommunityIcons name="music" size={100} color="#22c55e" />
          </View>
        </View>

        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{currentTrack.title}</Text>
          <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
        </View>

        <View style={styles.progressContainer}>
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={1}
            value={progress}
            onValueChange={setProgress}
            minimumTrackTintColor="#22c55e"
            maximumTrackTintColor="#2a3644"
            thumbTintColor="#22c55e"
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentSeconds)}</Text>
            <Text style={styles.timeText}>{formatTime(totalSeconds)}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={() => setIsShuffled(!isShuffled)} style={styles.controlButton}>
            <MaterialCommunityIcons name="shuffle" size={24} color={isShuffled ? '#22c55e' : '#888'} />
          </Pressable>
          <Pressable style={styles.controlButton}>
            <MaterialCommunityIcons name="skip-previous" size={36} color="#fff" />
          </Pressable>
          <Pressable onPress={() => setIsPlaying(!isPlaying)} style={styles.playButton}>
            <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={40} color="#0E151B" />
          </Pressable>
          <Pressable style={styles.controlButton}>
            <MaterialCommunityIcons name="skip-next" size={36} color="#fff" />
          </Pressable>
          <Pressable onPress={() => setIsRepeated(!isRepeated)} style={styles.controlButton}>
            <MaterialCommunityIcons name="repeat" size={24} color={isRepeated ? '#22c55e' : '#888'} />
          </Pressable>
        </View>

        <View style={styles.volumeContainer}>
          <MaterialCommunityIcons name="volume-low" size={20} color="#888" />
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={setVolume}
            minimumTrackTintColor="#22c55e"
            maximumTrackTintColor="#2a3644"
            thumbTintColor="#22c55e"
          />
          <MaterialCommunityIcons name="volume-high" size={20} color="#888" />
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => setIsFavorite(!isFavorite)} style={styles.actionButton}>
            <MaterialCommunityIcons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? '#F472B6' : '#888'} />
          </Pressable>
          <Pressable onPress={() => onNavigate?.('playlist')} style={styles.actionButton}>
            <MaterialCommunityIcons name="playlist-plus" size={24} color="#888" />
          </Pressable>
          <Pressable style={styles.actionButton}>
            <MaterialCommunityIcons name="share-variant" size={24} color="#888" />
          </Pressable>
          <Pressable onPress={() => onNavigate?.('queue')} style={styles.actionButton}>
            <MaterialCommunityIcons name="playlist-music" size={24} color="#888" />
          </Pressable>
        </View>
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
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 12,
    color: '#888',
  },
  queueButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  artworkPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: '#1a2634',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 16,
    color: '#888',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 12,
  },
});

export default MusicPlayerScreen;
