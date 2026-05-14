import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const mockContinueWatching = [
  { id: '1', title: 'Les Tuche 4', progress: 0.65, duration: '1h 32min' },
  { id: '2', title: 'Le Dîner de Cons', progress: 0.3, duration: '1h 25min' },
  { id: '3', title: 'Validé', progress: 0.85, duration: '45min' },
];

const mockPopulaires = [
  { id: '1', title: 'Mortree', rating: 4.5, year: '2024' },
  { id: '2', title: 'Les Misérables', rating: 4.8, year: '2023' },
  { id: '3', title: 'Killers of the Moon', rating: 4.2, year: '2024' },
  { id: '4', title: 'Oppenheimer', rating: 4.9, year: '2023' },
  { id: '5', title: 'Barbie', rating: 4.3, year: '2023' },
];

const mockNouveautes = [
  { id: '1', title: 'La Nuit du Marechal', year: '2024', genre: 'Policier' },
  { id: '2', title: 'Alerte Rouge', year: '2024', genre: 'Animation' },
  { id: '3', title: 'Le Dernier Métro', year: '2024', genre: 'Drame' },
  { id: '4', title: 'Casa de Papel', year: '2024', genre: 'Thriller' },
];

const categories = [
  { id: '1', name: 'Action', icon: 'sword' },
  { id: '2', name: 'Comedie', icon: 'emoticon-happy' },
  { id: '3', name: 'Drama', icon: 'drama-masks' },
  { id: '4', name: 'Documentaire', icon: 'file-documentary' },
  { id: '5', name: 'Horreur', icon: 'ghost' },
  { id: '6', name: 'Romance', icon: 'heart' },
];

const StreamingHomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Yabisso Films</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher films, séries..."
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.featuredBanner}>
          <View style={styles.featuredImage}>
            <MaterialCommunityIcons name="movie-open" size={60} color="#333" />
          </View>
          <View style={styles.featuredOverlay}>
            <Text style={styles.featuredBadge}>TENDANCE</Text>
            <Text style={styles.featuredTitle}>Oppenheimer</Text>
            <Text style={styles.featuredSubtitle}>2023 • Drame, Historique • 3h 0min</Text>
            <View style={styles.featuredActions}>
              <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate('Player', { id: '1' })}>
                <Ionicons name="play" size={18} color="#0E151B" />
                <Text style={styles.playButtonText}>Lecture</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.infoButton} onPress={() => navigation.navigate('Details', { id: '1' })}>
                <MaterialCommunityIcons name="information" size={18} color="#fff" />
                <Text style={styles.infoButtonText}>Infos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continuer à regarder</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tout voir</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockContinueWatching.map((item) => (
              <TouchableOpacity key={item.id} style={styles.continueCard} onPress={() => navigation.navigate('Player', { id: item.id })}>
                <View style={styles.thumbnail}>
                  <MaterialCommunityIcons name="movie" size={40} color="#333" />
                  <View style={[styles.progressBar, { width: `${item.progress * 100}%` }]} />
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.duration}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Populaires</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tout voir</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockPopulaires.map((item) => (
              <TouchableOpacity key={item.id} style={styles.popularCard} onPress={() => navigation.navigate('Details', { id: item.id })}>
                <View style={styles.popularImage}>
                  <MaterialCommunityIcons name="movie-outline" size={35} color="#333" />
                </View>
                <Text style={styles.popularTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nouveautés</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tout voir</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockNouveautes.map((item) => (
              <TouchableOpacity key={item.id} style={styles.nouveauteCard} onPress={() => navigation.navigate('Details', { id: item.id })}>
                <View style={styles.nouveauteImage}>
                  <MaterialCommunityIcons name="new-box" size={35} color="#333" />
                </View>
                <Text style={styles.nouveauteTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.nouveauteGenre}>{item.genre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => navigation.navigate('Browse', { category: cat.name })}>
                <MaterialCommunityIcons name={cat.icon} size={32} color="#137fec" />
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2A36', borderRadius: 12, paddingHorizontal: 12, marginBottom: 20 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, color: '#fff', fontSize: 16 },
  featuredBanner: { height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 24, position: 'relative' },
  featuredImage: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#1E2A36', justifyContent: 'center', alignItems: 'center' },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.6)' },
  featuredBadge: { backgroundColor: '#F472B6', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 4 },
  featuredTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  featuredSubtitle: { fontSize: 12, color: '#aaa', marginVertical: 4 },
  featuredActions: { flexDirection: 'row', marginTop: 8, gap: 12 },
  playButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#137fec', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 6 },
  playButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  infoButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 6 },
  infoButtonText: { color: '#fff', fontSize: 14 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  seeAll: { color: '#137fec', fontSize: 14 },
  continueCard: { marginRight: 12, width: 140 },
  thumbnail: { width: 140, height: 80, backgroundColor: '#1E2A36', borderRadius: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  progressBar: { position: 'absolute', bottom: 0, left: 0, height: 4, backgroundColor: '#137fec' },
  cardTitle: { fontSize: 14, color: '#fff', marginTop: 8 },
  cardSubtitle: { fontSize: 12, color: '#888' },
  popularCard: { marginRight: 12, width: 100 },
  popularImage: { width: 100, height: 140, backgroundColor: '#1E2A36', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  popularTitle: { fontSize: 13, color: '#fff', marginTop: 6, textAlign: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  ratingText: { color: '#FFD700', fontSize: 12, marginLeft: 4 },
  nouveauCard: { marginRight: 12, width: 120 },
  nouveauImage: { width: 120, height: 70, backgroundColor: '#1E2A36', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  nouveauTitle: { fontSize: 13, color: '#fff', marginTop: 6 },
  nouveauGenre: { fontSize: 11, color: '#888', marginTop: 2 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '31%', backgroundColor: '#1E2A36', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 10 },
  categoryName: { color: '#fff', fontSize: 13, marginTop: 8, textAlign: 'center' },
  bottomPadding: { height: 40 },
});

export default StreamingHomeScreen;