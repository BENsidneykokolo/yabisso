import React, { useState } from 'react';
import {
  FlatList,
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
    preview: 'Lait, pain, oeuf, fromage, legumes...',
    date: '2024-01-20',
    isPinned: true,
  },
  {
    id: '2',
    title: 'Idées projets',
    preview: 'Application mobile, site web, design interface...',
    date: '2024-01-19',
    isPinned: false,
  },
  {
    id: '3',
    title: 'Notes reunion',
    preview: 'Points a discuter: budget, timeline, equipe...',
    date: '2024-01-18',
    isPinned: false,
  },
  {
    id: '4',
    title: 'Recette gateau chocolat',
    preview: '200g farine, 150g sucre, 100g cacao...',
    date: '2024-01-17',
    isPinned: true,
  },
  {
    id: '5',
    title: 'Planification voyage',
    content: 'Vol, hotel, locations,activites...',
    date: '2024-01-15',
    isPinned: false,
  },
];

export default function NotebookHomeScreen({ onBack, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = MOCK_NOTES.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const renderNote = ({ item }) => (
    <Pressable
      style={styles.noteCard}
      onPress={() => onNavigate && onNavigate('NotebookDetail', { note: item })}
    >
      {item.isPinned && (
        <View style={styles.pinnedIndicator}>
          <MaterialCommunityIcons name="pin" size={14} color="#2BEE79" />
        </View>
      )}
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.notePreview} numberOfLines={2}>{item.preview}</Text>
      <Text style={styles.noteDate}>{formatDate(item.date)}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Bloc-notes</Text>
          <Pressable
            style={styles.searchButton}
            onPress={() => onNavigate && onNavigate('NotebookSearch')}
          >
            <MaterialCommunityIcons name="magnify" size={20} color="#E6EDF3" />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={18} color="#7C8A9A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher dans les notes..."
            placeholderTextColor="#7C8A9A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#7C8A9A" />
            </Pressable>
          )}
        </View>

        {sortedNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="note-outline" size={64} color="#4A5568" />
            <Text style={styles.emptyText}>Aucune note trouvee</Text>
          </View>
        ) : (
          <View style={styles.notesGrid}>
            {sortedNotes.map((note) => (
              <Pressable
                key={note.id}
                style={styles.noteCard}
                onPress={() => onNavigate && onNavigate('NotebookDetail', { note })}
              >
                {note.isPinned && (
                  <View style={styles.pinnedIndicator}>
                    <MaterialCommunityIcons name="pin" size={14} color="#2BEE79" />
                  </View>
                )}
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.notePreview} numberOfLines={2}>{note.preview}</Text>
                <Text style={styles.noteDate}>{formatDate(note.date)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => onNavigate && onNavigate('NotebookDetail', { note: null })}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#0E151B" />
      </Pressable>
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
    paddingBottom: 100,
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
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#F8FAFC',
    fontSize: 14,
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noteCard: {
    width: '48%',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pinnedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  noteTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  notePreview: {
    color: '#7C8A9A',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  noteDate: {
    color: '#4A5568',
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#7C8A9A',
    fontSize: 14,
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#2BEE79',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});