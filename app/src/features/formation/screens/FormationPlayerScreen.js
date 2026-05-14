import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockLesson = {
  title: 'Introduction aux Hooks',
  section: 'State et Hooks',
  duration: '15:30',
  totalDuration: '1h 30min',
  completed: 3,
  total: 8,
};

const mockChapters = [
  { id: 1, title: 'Introduction', completed: true },
  { id: 2, title: 'useState', completed: true },
  { id: 3, title: 'useEffect', completed: false, current: true },
  { id: 4, title: 'useContext', completed: false },
];

const FormationPlayerScreen = ({ onNavigate, onBack }) => {
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>React.js Complet</Text>
      </View>

      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <MaterialCommunityIcons name="play-circle" size={64} color="#2196F3" />
          <Text style={styles.videoText}>Vidéo en cours de chargement...</Text>
        </View>
        <View style={styles.videoControls}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '35%' }]} />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>05:30</Text>
              <Text style={styles.timeText}>15:30</Text>
            </View>
          </View>
          <View style={styles.controlButtons}>
            <TouchableOpacity style={styles.controlButton}>
              <MaterialCommunityIcons name="skip-previous" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton}>
              <MaterialCommunityIcons name="pause" size={32} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <MaterialCommunityIcons name="skip-next" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.lessonInfo}>
        <Text style={styles.sectionName}>{mockLesson.section}</Text>
        <Text style={styles.lessonTitle}>{mockLesson.title}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Text style={styles.tabText}>Chapitres</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => setShowNotes(!showNotes)}>
          <Text style={styles.tabText}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Ressources</Text>
        </TouchableOpacity>
      </View>

      {!showNotes ? (
        <ScrollView style={styles.content}>
          {mockChapters.map((chapter) => (
            <TouchableOpacity
              key={chapter.id}
              style={[styles.chapterItem, chapter.current && styles.chapterItemActive]}
            >
              <View style={[styles.chapterIcon, chapter.completed && styles.chapterIconCompleted]}>
                {chapter.completed ? (
                  <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                ) : (
                  <MaterialCommunityIcons name={chapter.current ? 'play' : 'play-outline'} size={16} color="#2196F3" />
                )}
              </View>
              <View style={styles.chapterInfo}>
                <Text style={[styles.chapterTitle, chapter.current && styles.chapterTitleActive]}>
                  {chapter.id}. {chapter.title}
                </Text>
                {chapter.current && <Text style={styles.currentBadge}>En cours</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            placeholder="Prendre des notes..."
            placeholderTextColor="#666"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <TouchableOpacity style={styles.saveNotesButton}>
            <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
            <Text style={styles.saveNotesText}>Sauvegarder</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#FFF" />
          <Text style={styles.navButtonText}>Précédent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.navButtonNext]}>
          <Text style={styles.navButtonText}>Suivant</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  videoContainer: { backgroundColor: '#000', height: 220 },
  videoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  videoText: { color: '#888', marginTop: 12 },
  videoControls: { backgroundColor: '#1A2332', padding: 12 },
  progressContainer: { marginBottom: 12 },
  progressBar: { height: 4, backgroundColor: '#2A3444', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#2196F3', borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  timeText: { color: '#888', fontSize: 12 },
  controlButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  controlButton: { padding: 12 },
  playButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 30, marginHorizontal: 16 },
  lessonInfo: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A3444' },
  sectionName: { fontSize: 12, color: '#888' },
  lessonTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginTop: 4 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2A3444' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#2196F3' },
  tabText: { color: '#888', fontSize: 14 },
  content: { flex: 1, padding: 16 },
  chapterItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#1A2332', borderRadius: 8, marginBottom: 8 },
  chapterItemActive: { borderWidth: 1, borderColor: '#2196F3' },
  chapterIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2A3444', alignItems: 'center', justifyContent: 'center' },
  chapterIconCompleted: { backgroundColor: '#4CAF50' },
  chapterInfo: { flex: 1, marginLeft: 12 },
  chapterTitle: { fontSize: 14, color: '#FFF' },
  chapterTitleActive: { color: '#2196F3' },
  currentBadge: { fontSize: 10, color: '#2196F3', marginTop: 2 },
  notesContainer: { flex: 1, padding: 16 },
  notesInput: { flex: 1, backgroundColor: '#1A2332', padding: 16, borderRadius: 12, color: '#FFF', textAlignVertical: 'top' },
  saveNotesButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, marginTop: 12 },
  saveNotesText: { marginLeft: 8, color: '#FFF', fontWeight: 'bold' },
  footer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#2A3444' },
  navButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#1A2332', borderRadius: 8, marginHorizontal: 4 },
  navButtonNext: { backgroundColor: '#2196F3' },
  navButtonText: { color: '#FFF', fontSize: 14 },
});

export default FormationPlayerScreen;