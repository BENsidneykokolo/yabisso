import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const mockCast = [
  { id: '1', name: 'Cillian Murphy', character: 'J. Robert Oppenheimer', avatar: null },
  { id: '2', name: 'Emily Blunt', character: 'Kitty Oppenheimer', avatar: null },
  { id: '3', name: 'Matt Damon', character: 'Leslie Groves', avatar: null },
  { id: '4', name: 'Robert Downey Jr.', character: 'Lewis Strauss', avatar: null },
  { id: '5', name: 'Florence Pugh', character: 'Jean Tatlock', avatar: null },
];

const mockGenres = ['Drame', 'Historique', 'Biopic'];
const mockSimilar = [
  { id: '1', title: 'Dune Part Two', rating: 4.7 },
  { id: '2', title: 'Killers of the Moon', rating: 4.2 },
  { id: '3', title: 'The Holdovers', rating: 4.4 },
  { id: '4', title: 'Poor Things', rating: 4.6 },
  { id: '5', title: 'Past Lives', rating: 4.5 },
];

const StreamingDetailsScreen = ({ navigation, route }) => {
  const [isInList, setIsInList] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.backdropContainer}>
          <View style={styles.backdrop}>
            <MaterialCommunityIcons name="movie-open" size={80} color="#222" />
          </View>
          <View style={styles.gradient} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Oppenheimer</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>2023</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>3h 0min</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.ageBadge}>16+</Text>
          </View>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <MaterialCommunityIcons key={star} name="star" size={20} color="#FFD700" />
            ))}
            <Text style={styles.ratingNum}>4.8</Text>
          </View>

          <View style={styles.genresRow}>
            {mockGenres.map((genre) => (
              <View key={genre} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.playBtn} onPress={() => navigation.navigate('Player', { id: route.params?.id })}>
              <Ionicons name="play" size={22} color="#0E151B" />
              <Text style={styles.playBtnText}>Lecture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.listBtn} onPress={() => setIsInList(!isInList)}>
              <MaterialCommunityIcons name={isInList ? 'check-circle' : 'plus'} size={22} color={isInList ? '#22c55e' : '#fff'} />
              <Text style={[styles.listBtnText, isInList && styles.listBtnActive]}>{isInList ? 'Dans la liste' : 'Ma liste'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.synopsisLabel}>Synopsis</Text>
          <Text style={styles.synopsis}>
            L'histoire du scientifique J. Robert Oppenheimer et de son rôle dans le développement de la bombe atomique pendant la Seconde Guerre mondiale. Un film réalisé par Christopher Nolan explorant les conséquences morales et personnelles du père de la bombe atomique.
          </Text>

          <Text style={styles.sectionLabel}>Distribution</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castScroll}>
            {mockCast.map((member) => (
              <View key={member.id} style={styles.castCard}>
                <View style={styles.castAvatar}>
                  <MaterialCommunityIcons name="account" size={30} color="#444" />
                </View>
                <Text style={styles.castName} numberOfLines={1}>{member.name}</Text>
                <Text style={styles.castCharacter} numberOfLines={1}>{member.character}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.similarSection}>
            <View style={styles.similarHeader}>
              <Text style={styles.sectionLabel}>Similaires</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Tout voir</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mockSimilar.map((item) => (
                <TouchableOpacity key={item.id} style={styles.similarCard} onPress={() => navigation.navigate('Details', { id: item.id })}>
                  <View style={styles.similarImage}>
                    <MaterialCommunityIcons name="movie-outline" size={28} color="#333" />
                  </View>
                  <Text style={styles.similarTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.similarRating}>
                    <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                    <Text style={styles.similarRatingText}>{item.rating}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B' },
  backdropContainer: { width: '100%', height: 280, position: 'relative' },
  backdrop: { width: '100%', height: '100%', backgroundColor: '#162230', justifyContent: 'center', alignItems: 'center' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, backgroundColor: 'rgba(14,21,27,0.8)' },
  backBtn: { position: 'absolute', top: 50, left: 16, padding: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20 },
  shareBtn: { position: 'absolute', top: 50, right: 16, padding: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20 },
  content: { paddingHorizontal: 16, marginTop: -60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  metaText: { color: '#888', fontSize: 14 },
  metaDot: { color: '#888', marginHorizontal: 8 },
  ageBadge: { backgroundColor: '#F472B6', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 12, fontWeight: 'bold' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingNum: { color: '#FFD700', fontSize: 16, marginLeft: 8, fontWeight: 'bold' },
  genresRow: { flexDirection: 'row', marginBottom: 20, gap: 8 },
  genreTag: { backgroundColor: '#1E2A36', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  genreText: { color: '#aaa', fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  playBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#137fec', paddingVertical: 14, borderRadius: 10, gap: 8 },
  playBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  listBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E2A36', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#333', gap: 8 },
  listBtnText: { color: '#fff', fontSize: 14 },
  listBtnActive: { color: '#22c55e' },
  synopsisLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  synopsis: { color: '#aaa', fontSize: 14, lineHeight: 22, marginBottom: 24 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 14 },
  castScroll: { marginBottom: 24 },
  castCard: { marginRight: 14, alignItems: 'center', width: 80 },
  castAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1E2A36', justifyContent: 'center', alignItems: 'center' },
  castName: { color: '#fff', fontSize: 12, marginTop: 8, textAlign: 'center' },
  castCharacter: { color: '#888', fontSize: 11, marginTop: 4, textAlign: 'center' },
  similarSection: { marginTop: 4 },
  similarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { color: '#137fec', fontSize: 14 },
  similarCard: { marginRight: 12, width: 110 },
  similarImage: { width: 110, height: 155, backgroundColor: '#1E2A36', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  similarTitle: { fontSize: 13, color: '#fff', marginTop: 8 },
  similarRating: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  similarRatingText: { color: '#FFD700', fontSize: 12, marginLeft: 4 },
  bottomPadding: { height: 50 },
});

export default StreamingDetailsScreen;