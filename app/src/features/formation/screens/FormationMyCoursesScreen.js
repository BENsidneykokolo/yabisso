import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockMyCourses = [
  { id: 1, title: 'React.js - Cours Complet', instructor: 'Marie Dubois', progress: 65, lastLesson: 'Les hooks personnalisés', thumbnail: 'react', lessonsCompleted: 12, totalLessons: 18 },
  { id: 2, title: 'Marketing Digital', instructor: 'Jean Martin', progress: 30, lastLesson: 'SEO avancé', thumbnail: 'bullhorn', lessonsCompleted: 4, totalLessons: 15 },
  { id: 3, title: 'Anglais Professionnel', instructor: 'Sarah Cohen', progress: 85, lastLesson: 'Presentations', thumbnail: 'translate', lessonsCompleted: 17, totalLessons: 20 },
  { id: 4, title: 'Python pour débutants', instructor: 'Marc Kouadio', progress: 10, lastLesson: 'Variables et types', thumbnail: 'language-python', lessonsCompleted: 2, totalLessons: 25 },
];

const FormationMyCoursesScreen = ({ onNavigate, onBack }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.courseCard} onPress={() => onNavigate('player')}>
      <View style={styles.thumbnail}>
        <MaterialCommunityIcons name="play-circle" size={32} color="#FFF" />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.instructorName}>{item.instructor}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: item.progress + '%' }]} />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>
        <Text style={styles.lessonInfo}>{item.lessonsCompleted}/{item.totalLessons} leçons</Text>
        <View style={styles.lastLessonRow}>
          <MaterialCommunityIcons name="bookmark-outline" size={14} color="#888" />
          <Text style={styles.lastLessonText}>{item.lastLesson}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes cours</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>4</Text>
          <Text style={styles.statLabel}>Cours inscrits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>18h</Text>
          <Text style={styles.statLabel}>Temps appris</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Certificats</Text>
        </View>
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity style={[styles.filterTab, styles.filterTabActive]}>
          <Text style={styles.filterTabText}>En cours</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Terminés</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Favoris</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockMyCourses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  statsRow: { flexDirection: 'row', marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#1A2332', padding: 16, borderRadius: 12, alignItems: 'center', marginRight: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  filterTabs: { flexDirection: 'row', marginBottom: 16 },
  filterTab: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#1A2332', borderRadius: 8, marginHorizontal: 2 },
  filterTabActive: { backgroundColor: '#2196F3' },
  filterTabText: { color: '#FFF', fontSize: 14 },
  list: { paddingBottom: 20 },
  courseCard: { flexDirection: 'row', backgroundColor: '#1A2332', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  thumbnail: { width: 80, backgroundColor: '#2A3444', alignItems: 'center', justifyContent: 'center' },
  courseInfo: { flex: 1, padding: 12 },
  courseTitle: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  instructorName: { fontSize: 12, color: '#888', marginTop: 4 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progressBar: { flex: 1, height: 4, backgroundColor: '#2A3444', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 2 },
  progressText: { marginLeft: 8, color: '#4CAF50', fontSize: 12, fontWeight: '600' },
  lessonInfo: { fontSize: 12, color: '#888', marginTop: 8 },
  lastLessonRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  lastLessonText: { marginLeft: 4, color: '#888', fontSize: 12 },
});

export default FormationMyCoursesScreen;