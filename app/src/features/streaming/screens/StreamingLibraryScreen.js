import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const mockLibrary = [
  { id: '1', title: 'Oppenheimer', year: '2023', rating: 4.8, genre: 'Drame', duration: '3h 0min' },
  { id: '2', title: 'Barbie', year: '2023', rating: 4.3, genre: 'Comédie', duration: '1h 54min' },
  { id: '3', title: 'Dune Part Two', year: '2024', rating: 4.7, genre: 'Sci-Fi', duration: '2h 46min' },
];

const StreamingLibraryScreen = ({ navigation }) => {
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="movie-outline" size={80} color="#333" />
      <Text style={styles.emptyTitle}>Votre liste est vide</Text>
      <Text style={styles.emptySubtitle}>Ajoutez des films et séries à votre liste pour les retrouver ici</Text>
      <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Browse')}>
        <Text style={styles.browseBtnText}>Parcourir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ma Liste</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="playlist-edit" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>{mockLibrary.length} titres sauvegardés</Text>
      </View>

      {mockLibrary.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={mockLibrary}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemCard} onPress={() => navigation.navigate('Details', { id: item.id })}>
              <View style={styles.coverContainer}>
                <View style={styles.coverImage}>
                  <MaterialCommunityIcons name="movie" size={40} color="#333" />
                </View>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{item.year}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{item.genre}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{item.duration}</Text>
                </View>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.removeBtn}>
                <MaterialCommunityIcons name="check-circle" size={22} color="#22c55e" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  countContainer: { marginBottom: 16 },
  countText: { color: '#888', fontSize: 14 },
  listContainer: { paddingBottom: 100 },
  itemCard: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#1E2A36', borderRadius: 12, padding: 12 },
  coverContainer: { marginRight: 14 },
  coverImage: { width: 90, height: 120, backgroundColor: '#162230', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, justifyContent: 'center' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  metaText: { color: '#888', fontSize: 12 },
  metaDot: { color: '#888', marginHorizontal: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: '#FFD700', fontSize: 13, marginLeft: 4 },
  removeBtn: { alignSelf: 'center', padding: 8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 20, marginBottom: 10 },
  emptySubtitle: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  browseBtn: { marginTop: 24, backgroundColor: '#137fec', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 },
  browseBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default StreamingLibraryScreen;