import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockCourses = [
  { id: 1, title: 'React.js - Fondamentaux', instructor: 'Marie Dubois', rating: 4.5, students: 1234, price: 25000, level: 'Débutant', thumbnail: 'react' },
  { id: 2, title: 'JavaScript Avancé', instructor: 'Pierre Lambert', rating: 4.8, students: 856, price: 30000, level: 'Avancé', thumbnail: 'language-javascript' },
  { id: 3, title: 'Node.js Backend', instructor: 'Jean Martin', rating: 4.2, students: 567, price: 28000, level: 'Intermédiaire', thumbnail: 'nodejs' },
  { id: 4, title: 'Python pour Data Science', instructor: 'Sophie Bernard', rating: 4.9, students: 2341, price: 35000, level: 'Avancé', thumbnail: 'language-python' },
  { id: 5, title: 'HTML/CSS Web Design', instructor: 'Alice Chen', rating: 4.4, students: 1890, price: 15000, level: 'Débutant', thumbnail: 'language-html5' },
  { id: 6, title: 'Flutter Mobile Apps', instructor: 'Marc Diarra', rating: 4.6, students: 432, price: 32000, level: 'Intermédiaire', thumbnail: 'cellphone' },
];

const FormationCoursesScreen = ({ onNavigate, onBack }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.courseCard} onPress={() => onNavigate('details')}>
      <View style={styles.thumbnail}>
        <MaterialCommunityIcons name="play-circle-outline" size={48} color="#2196F3" />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.instructorName}>{item.instructor}</Text>
        <View style={styles.ratingRow}>
          <MaterialCommunityIcons name="star" size={14} color="#FF9800" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.studentText}>• {item.students} étudiants</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
          <Text style={styles.price}>{item.price} XOF</Text>
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
        <Text style={styles.title}>Cours disponibles</Text>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Débutant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Intermédiaire</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Avancé</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockCourses}
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
  filterRow: { flexDirection: 'row', marginBottom: 16 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#1A2332', borderRadius: 20, marginRight: 8 },
  filterText: { color: '#FFF', fontSize: 14 },
  list: { paddingBottom: 20 },
  courseCard: { flexDirection: 'row', backgroundColor: '#1A2332', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  thumbnail: { width: 120, backgroundColor: '#2A3444', alignItems: 'center', justifyContent: 'center' },
  courseInfo: { flex: 1, padding: 12 },
  courseTitle: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  instructorName: { fontSize: 14, color: '#888', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ratingText: { marginLeft: 4, color: '#FF9800', fontSize: 14 },
  studentText: { marginLeft: 8, color: '#888', fontSize: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  levelBadge: { backgroundColor: '#2196F320', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  levelText: { color: '#2196F3', fontSize: 12 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
});

export default FormationCoursesScreen;