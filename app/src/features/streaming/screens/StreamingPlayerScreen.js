import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const mockRelated = [
  { id: '1', title: 'Barbie', duration: '1h 54min' },
  { id: '2', title: 'Killers of the Moon', duration: '3h 6min' },
  { id: '3', title: 'Dune Part Two', duration: '2h 46min' },
  { id: '4', title: 'Asteroid City', duration: '1h 44min' },
];

const StreamingPlayerScreen = ({ navigation, route }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleControls = () => setShowControls(!showControls);

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} onPress={toggleControls} style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={80} color={isPlaying ? 'transparent' : '#fff'} />
          {showControls && (
            <View style={styles.topControls}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.airplayBtn}>
                <MaterialCommunityIcons name="apple-airplay" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {showControls && (
          <View style={styles.centerControls}>
            <TouchableOpacity style={styles.rewindBtn}>
              <MaterialCommunityIcons name="rewind-10" size={36} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playBtnLarge} onPress={togglePlay}>
              <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={50} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.forwardBtn}>
              <MaterialCommunityIcons name="fast-forward-10" size={36} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        {showControls && (
          <View style={styles.bottomControls}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>32:15</Text>
                <Text style={styles.timeText}>/ 1:45:30</Text>
              </View>
            </View>
            <View style={styles.controlRow}>
              <TouchableOpacity style={styles.controlBtn}>
                <MaterialCommunityIcons name="closed-caption" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlBtn}>
                <MaterialCommunityIcons name="quality-high" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlBtn}>
                <Ionicons name="resize" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <ScrollView style={styles.infoContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.videoTitle}>Oppenheimer</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>2023</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>Drame, Historique</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>3h 0min</Text>
        </View>
        <Text style={styles.description}>
          L'histoire du scientifique J. Robert Oppenheimer et son rôle dans le développement de la bombe atomique pendant la Seconde Guerre mondiale.
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
            <Ionicons name="play" size={20} color="#0E151B" />
            <Text style={styles.playBtnText}>Lecture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadBtn}>
            <MaterialCommunityIcons name="download" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Videos similaires</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockRelated.map((item) => (
              <TouchableOpacity key={item.id} style={styles.relatedCard} onPress={() => navigation.navigate('Player', { id: item.id })}>
                <View style={styles.relatedThumb}>
                  <MaterialCommunityIcons name="movie" size={30} color="#333" />
                </View>
                <Text style={styles.relatedTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.relatedDuration}>{item.duration}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B' },
  videoContainer: { width: '100%', height: height * 0.4, backgroundColor: '#000', position: 'relative' },
  videoPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  topControls: { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  backBtn: { padding: 4 },
  airplayBtn: { padding: 4 },
  centerControls: { position: 'absolute', top: '40%', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 50 },
  rewindBtn: { padding: 8 },
  playBtnLarge: { padding: 8 },
  forwardBtn: { padding: 8 },
  bottomControls: { position: 'absolute', bottom: 20, left: 16, right: 16 },
  progressContainer: { marginBottom: 12 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  progressFill: { width: '35%', height: '100%', backgroundColor: '#137fec', borderRadius: 2 },
  timeRow: { flexDirection: 'row', marginTop: 4 },
  timeText: { color: '#fff', fontSize: 12 },
  controlRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  controlBtn: { padding: 4 },
  infoContainer: { flex: 1, padding: 16, paddingTop: 24 },
  videoTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  metaText: { color: '#888', fontSize: 14 },
  metaDot: { color: '#888', marginHorizontal: 8 },
  description: { color: '#aaa', fontSize: 14, lineHeight: 22, marginBottom: 20 },
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  playBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#137fec', paddingVertical: 12, borderRadius: 10, gap: 8 },
  playBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  downloadBtn: { width: 48, height: 48, backgroundColor: '#1E2A36', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  shareBtn: { width: 48, height: 48, backgroundColor: '#1E2A36', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  relatedCard: { marginRight: 12, width: 130 },
  relatedThumb: { width: 130, height: 75, backgroundColor: '#1E2A36', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  relatedTitle: { fontSize: 13, color: '#fff', marginTop: 8 },
  relatedDuration: { fontSize: 11, color: '#888', marginTop: 2 },
});

export default StreamingPlayerScreen;