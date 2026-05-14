import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const mockRecentSearches = ['Oppenheimer', 'Barbie', 'Dune'];

const mockTrending = [
  { id: '1', title: 'Oppenheimer', rank: 1 },
  { id: '2', title: 'Dune Part Two', rank: 2 },
  { id: '3', title: 'Barbie', rank: 3 },
  { id: '4', title: 'Poor Things', rank: 4 },
  { id: '5', title: 'Killers of the Moon', rank: 5 },
  { id: '6', title: 'The Holdovers', rank: 6 },
  { id: '7', title: 'Past Lives', rank: 7 },
];

const mockResults = [
  { id: '1', title: 'Oppenheimer', year: '2023', rating: 4.8, genre: 'Drame' },
  { id: '2', title: 'One Day', year: '2024', rating: 4.2, genre: 'Romance' },
  { id: '3', title: 'The Gorge', year: '2024', rating: 4.0, genre: 'Thriller' },
];

const StreamingSearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (text) => {
    setQuery(text);
    setShowResults(text.length > 0);
  };

  const clearRecent = () => {
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher films, séries..."
            placeholderTextColor="#666"
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!showResults ? (
        <View style={styles.suggestionsContainer}>
          {mockRecentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recherches récentes</Text>
                <TouchableOpacity onPress={clearRecent}>
                  <Text style={styles.clearBtn}>Effacer</Text>
                </TouchableOpacity>
              </View>
              {mockRecentSearches.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleSearch(item)}
                >
                  <Ionicons name="time-outline" size={18} color="#666" />
                  <Text style={styles.recentText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tendances</Text>
            {mockTrending.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.trendingItem}
                onPress={() => handleSearch(item.title)}
              >
                <View style={styles.trendingRank}>
                  <MaterialCommunityIcons name="trending-up" size={18} color="#F472B6" />
                </View>
                <Text style={styles.trendingText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={mockResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.resultsCount}>{mockResults.length} résultats</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => navigation.navigate('Details', { id: item.id })}>
              <View style={styles.resultImage}>
                <MaterialCommunityIcons name="movie-outline" size={30} color="#333" />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <View style={styles.resultMeta}>
                  <Text style={styles.resultYear}>{item.year}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.resultGenre}>{item.genre}</Text>
                </View>
              </View>
              <View style={styles.resultRating}>
                <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  backBtn: { padding: 4 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2A36', borderRadius: 12, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: '#fff', fontSize: 16 },
  suggestionsContainer: { flex: 1 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  clearBtn: { color: '#137fec', fontSize: 14 },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  recentText: { color: '#fff', fontSize: 15 },
  trendingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  trendingRank: { width: 24 },
  trendingText: { color: '#fff', fontSize: 15 },
  resultsContainer: { paddingBottom: 100 },
  resultsCount: { color: '#888', fontSize: 14, marginBottom: 16 },
  resultItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2A36', borderRadius: 12, padding: 12, marginBottom: 12 },
  resultImage: { width: 70, height: 95, backgroundColor: '#162230', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  resultInfo: { flex: 1, marginLeft: 14 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  resultMeta: { flexDirection: 'row', alignItems: 'center' },
  resultYear: { color: '#888', fontSize: 13 },
  metaDot: { color: '#888', marginHorizontal: 6 },
  resultGenre: { color: '#888', fontSize: 13 },
  resultRating: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#162230', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  ratingText: { color: '#FFD700', fontSize: 13, marginLeft: 4 },
});

export default StreamingSearchScreen;