import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MOCK_NOTES = [
  {
    id: '1',
    title: 'Liste de courses',
    preview: 'Lait, pain, oeuf, fromage, legumes, fruits, viande...',
    date: '2024-01-20',
    isPinned: true,
  },
  {
    id: '2',
    title: 'Idées projets',
    preview: 'Application mobile, site web, design interface utilisateur...',
    date: '2024-01-19',
    isPinned: false,
  },
  {
    id: '3',
    title: 'Notes reunion',
    preview: 'Points a discuter: budget, timeline, equipe, ressources...',
    date: '2024-01-18',
    isPinned: false,
  },
  {
    id: '4',
    title: 'Recette gateau chocolat',
    preview: '200g farine, 150g sucre, 100g cacao, 3 oeuf, 100ml lait...',
    date: '2024-01-17',
    isPinned: true,
  },
  {
    id: '5',
    title: 'Planification voyage',
    content: 'Vol, hotel, locations de voiture, activites, restaurants...',
    date: '2024-01-15',
    isPinned: false,
  },
  {
    id: '6',
    title: 'Idées cadeau',
    preview: 'Pierre: montre, Sophie: livre, Marie: parfum...',
    date: '2024-01-14',
    isPinned: false,
  },
];

export default function NotebookSearchScreen({ onBack, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(['courses', 'projets', 'recettes']);

  const filteredNotes = searchQuery.length > 0
    ? MOCK_NOTES.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const addToRecentSearches = (search) => {
    if (!recentSearches.includes(search)) {
      setRecentSearches([search, ...recentSearches.slice(0, 2)]);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Recherche</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={18} color="#7C8A9A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher dans les notes..."
            placeholderTextColor="#7C8A9A"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#7C8A9A" />
            </Pressable>
          )}
        </View>

        {searchQuery.length === 0 ? (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recherches recentes</Text>
              <Pressable onPress={() => setRecentSearches([])}>
                <Text style={styles.clearText}>Effacer</Text>
              </Pressable>
            </View>
            <View style={styles.recentSearches}>
              {recentSearches.map((search, index) => (
                <Pressable
                  key={index}
                  style={styles.recentSearchItem}
                  onPress={() => setSearchQuery(search)}
                >
                  <MaterialCommunityIcons name="history" size={16} color="#7C8A9A" />
                  <Text style={styles.recentSearchText}>{search}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : filteredNotes.length > 0 ? (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsCount}>
              {filteredNotes.length} resultat{filteredNotes.length > 1 ? 's' : ''}
            </Text>
            {filteredNotes.map((note) => (
              <Pressable
                key={note.id}
                style={styles.resultCard}
                onPress={() => onNavigate && onNavigate('NotebookDetail', { note })}
              >
                {note.isPinned && (
                  <View style={styles.pinnedIndicator}>
                    <MaterialCommunityIcons name="pin" size={14} color="#2BEE79" />
                  </View>
                )}
                <Text style={styles.resultTitle}>{note.title}</Text>
                <Text style={styles.resultPreview} numberOfLines={2}>
                  {note.preview || note.content}
                </Text>
                <Text style={styles.resultDate}>{formatDate(note.date)}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify" size={48} color="#4A5568" />
            <Text style={styles.emptyTitle}>Aucun resultat</Text>
            <Text style={styles.emptyText}>
              Essayez avec d'autres mots-cles
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#F8FAFC',
    fontSize: 14,
  },
  recentSection: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  clearText: {
    color: '#1F8EFA',
    fontSize: 13,
  },
  recentSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  recentSearchText: {
    color: '#B6C2CF',
    fontSize: 13,
    marginLeft: 8,
  },
  resultsSection: {
    marginTop: 10,
  },
  resultsCount: {
    color: '#7C8A9A',
    fontSize: 12,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pinnedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  resultTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  resultPreview: {
    color: '#7C8A9A',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  resultDate: {
    color: '#4A5568',
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#7C8A9A',
    fontSize: 14,
  },
});