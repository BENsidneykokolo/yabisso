import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const categories = ['Tous', 'Films', 'Series', 'Documentaires', 'Emissions'];
const filterPills = [
  { label: 'Année', options: ['2024', '2023', '2022', '2021'] },
  { label: 'Genre', options: ['Action', 'Comédie', 'Drame', 'Thriller'] },
  { label: 'Pays', options: ['France', 'USA', 'UK', 'Espagne'] },
  { label: 'Note', options: ['9+', '8+', '7+', '6+'] },
];

const mockResults = [
  { id: '1', title: 'Oppenheimer', year: '2023', rating: 4.8, genre: 'Drame' },
  { id: '2', title: 'Barbie', year: '2023', rating: 4.3, genre: 'Comédie' },
  { id: '3', title: 'Dune Part Two', year: '2024', rating: 4.7, genre: 'Sci-Fi' },
  { id: '4', title: 'Killers of the Moon', year: '2023', rating: 4.2, genre: 'Thriller' },
  { id: '5', title: 'Poor Things', year: '2023', rating: 4.6, genre: 'Drame' },
  { id: '6', title: 'The Holdovers', year: '2023', rating: 4.4, genre: 'Comédie' },
  { id: '7', title: 'Past Lives', year: '2023', rating: 4.5, genre: 'Romance' },
  { id: '8', title: 'Anatomy of a Fall', year: '2023', rating: 4.3, genre: 'Drame' },
  { id: '9', title: 'Asteroid City', year: '2023', rating: 4.1, genre: 'Comédie' },
  { id: '10', title: 'Saltburn', year: '2023', rating: 4.0, genre: 'Thriller' },
  { id: '11', title: 'The Iron Claw', year: '2023', rating: 4.4, genre: 'Drame' },
  { id: '12', title: 'American Fiction', year: '2023', rating: 4.2, genre: 'Comédie' },
];

const StreamingBrowseScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('Tous');
  const [showFilters, setShowFilters] = useState({});
  const [results, setResults] = useState(mockResults);

  const toggleFilter = (label) => {
    setShowFilters((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const selectFilterOption = (label, option) => {
    setShowFilters((prev) => ({ ...prev, [label]: false }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parcourir</Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#666" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Rechercher..." placeholderTextColor="#666" />
        <TouchableOpacity onPress={() => setShowFilters((prev) => ({ ...Object.keys(prev).every(k => !prev[k]) ? {} : {} }))}>
          <MaterialCommunityIcons name="filter-variant" size={22} color="#137fec" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, activeTab === cat && styles.activeTab]}
              onPress={() => setActiveTab(cat)}
            >
              <Text style={[styles.tabText, activeTab === cat && styles.activeTabText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        {filterPills.map((pill) => (
          <View key={pill.label}>
            <TouchableOpacity
              style={[styles.filterPill, showFilters[pill.label] && styles.filterPillActive]}
              onPress={() => toggleFilter(pill.label)}
            >
              <Text style={[styles.filterPillText, showFilters[pill.label] && styles.filterPillTextActive]}>
                {pill.label}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={showFilters[pill.label] ? '#fff' : '#888'} />
            </TouchableOpacity>
            {showFilters[pill.label] && (
              <View style={styles.filterDropdown}>
                {pill.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.filterOption}
                    onPress={() => selectFilterOption(pill.label, option)}
                  >
                    <Text style={styles.filterOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <FlatList
        data={results}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultCard} onPress={() => navigation.navigate('Details', { id: item.id })}>
            <View style={styles.coverImage}>
              <MaterialCommunityIcons name="movie-outline" size={28} color="#333" />
            </View>
            <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.resultMeta}>
              <Text style={styles.resultYear}>{item.year}</Text>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2A36', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: '#fff', fontSize: 15 },
  tabContainer: { marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, borderRadius: 20, backgroundColor: '#1E2A36' },
  activeTab: { backgroundColor: '#137fec' },
  tabText: { color: '#888', fontSize: 14 },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  filtersRow: { flexDirection: 'row', marginBottom: 16 },
  filterPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333', marginRight: 8 },
  filterPillActive: { borderColor: '#137fec', backgroundColor: 'rgba(19,127,236,0.1)' },
  filterPillText: { color: '#888', fontSize: 13 },
  filterPillTextActive: { color: '#137fec' },
  filterDropdown: { position: 'absolute', top: 40, left: 0, backgroundColor: '#1E2A36', borderRadius: 10, padding: 8, zIndex: 100, minWidth: 100 },
  filterOption: { paddingVertical: 8, paddingHorizontal: 12 },
  filterOptionText: { color: '#fff', fontSize: 14 },
  gridContainer: { paddingBottom: 100 },
  resultCard: { flex: 1, margin: 6, maxWidth: '31%' },
  coverImage: { width: '100%', aspectRatio: 2/3, backgroundColor: '#1E2A36', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  resultTitle: { fontSize: 13, color: '#fff', marginTop: 6 },
  resultMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  resultYear: { color: '#888', fontSize: 11 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: '#FFD700', fontSize: 11, marginLeft: 2 },
});

export default StreamingBrowseScreen;