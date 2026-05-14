import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockCategories = [
  { id: 1, name: 'Développement Web', icon: 'language-html5', color: '#E91E63' },
  { id: 2, name: 'Marketing Digital', icon: 'bullhorn', color: '#9C27B0' },
  { id: 3, name: 'Langues', icon: 'translate', color: '#2196F3' },
  { id: 4, name: 'Business', icon: 'briefcase', color: '#4CAF50' },
  { id: 5, name: 'Design', icon: 'palette', color: '#FF9800' },
  { id: 6, name: 'Data Science', icon: 'database', color: '#00BCD4' },
];

const mockFeatured = [
  { id: 1, title: 'React.js Complet', instructor: 'Marie Dubois', students: 1234, price: 25000, rating: 4.5 },
  { id: 2, title: 'Marketing Digital', instructor: 'Jean Martin', students: 856, price: 18000, rating: 4.2 },
  { id: 3, title: 'Anglais Professionnel', instructor: 'Sarah Cohen', students: 2341, price: 15000, rating: 4.8 },
];

const mockContinue = [
  { id: 1, title: 'JavaScript Avancé', progress: 65, lastLesson: 'Les closures' },
  { id: 2, title: 'SEO Basics', progress: 30, lastLesson: 'Recherche de mots-clés' },
];

const FormationHomeScreen = ({ onNavigate }) => {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Formation</Text>

        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={24} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un cours..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockCategories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => onNavigate('courses')}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                  <MaterialCommunityIcons name={cat.icon} size={24} color={cat.color} />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cours en vedette</Text>
            <TouchableOpacity onPress={() => onNavigate('courses')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockFeatured.map((course) => (
              <TouchableOpacity key={course.id} style={styles.featuredCard} onPress={() => onNavigate('details')}>
                <View style={styles.thumbnail}>
                  <MaterialCommunityIcons name="play-circle" size={48} color="#2196F3" />
                </View>
                <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                <Text style={styles.instructorName}>{course.instructor}</Text>
                <View style={styles.courseMeta}>
                  <View style={styles.rating}>
                    <MaterialCommunityIcons name="star" size={14} color="#FF9800" />
                    <Text style={styles.ratingText}>{course.rating}</Text>
                  </View>
                  <Text style={styles.studentCount}>{course.students} étudiants</Text>
                </View>
                <Text style={styles.price}>{course.price} XOF</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continuer l'apprentissage</Text>
            <TouchableOpacity onPress={() => onNavigate('myCourses')}>
              <Text style={styles.seeAll}>Mes cours</Text>
            </TouchableOpacity>
          </View>
          {mockContinue.map((course) => (
            <TouchableOpacity key={course.id} style={styles.continueCard} onPress={() => onNavigate('player')}>
              <View style={styles.continueIcon}>
                <MaterialCommunityIcons name="book-open-variant" size={32} color="#4CAF50" />
              </View>
              <View style={styles.continueInfo}>
                <Text style={styles.continueTitle}>{course.title}</Text>
                <Text style={styles.lastLesson}>{course.lastLesson}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: course.progress + '%' }]} />
                </View>
                <Text style={styles.progressText}>{course.progress}% complété</Text>
              </View>
              <MaterialCommunityIcons name="play-circle" size={32} color="#2196F3" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 12, borderRadius: 12, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#FFF' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  seeAll: { color: '#2196F3', fontSize: 14 },
  categoryCard: { alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginRight: 12, width: 100 },
  categoryIcon: { padding: 12, borderRadius: 12 },
  categoryName: { marginTop: 8, color: '#FFF', fontSize: 12, textAlign: 'center' },
  featuredCard: { width: 180, backgroundColor: '#1A2332', borderRadius: 12, marginRight: 12, padding: 12 },
  thumbnail: { backgroundColor: '#2A3444', height: 100, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  courseTitle: { fontSize: 14, fontWeight: '600', color: '#FFF', marginTop: 12 },
  instructorName: { fontSize: 12, color: '#888', marginTop: 4 },
  courseMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, color: '#FF9800', fontSize: 12 },
  studentCount: { marginLeft: 8, color: '#888', fontSize: 12 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginTop: 8 },
  continueCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 12 },
  continueIcon: { backgroundColor: '#4CAF5020', padding: 12, borderRadius: 12 },
  continueInfo: { flex: 1, marginLeft: 12 },
  continueTitle: { fontSize: 16, color: '#FFF', fontWeight: '500' },
  lastLesson: { fontSize: 12, color: '#888', marginTop: 4 },
  progressBar: { height: 4, backgroundColor: '#2A3444', borderRadius: 2, marginTop: 8 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 2 },
  progressText: { fontSize: 12, color: '#888', marginTop: 4 },
});

export default FormationHomeScreen;