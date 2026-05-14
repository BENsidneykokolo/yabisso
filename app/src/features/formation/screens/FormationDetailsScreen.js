import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockCourse = {
  title: 'React.js - Cours Complet',
  instructor: { name: 'Marie Dubois', avatar: 'account', students: 2500, courses: 12 },
  rating: 4.5,
  reviews: 856,
  students: 1234,
  price: 25000,
  description: 'Apprenez React.js de A à Z avec ce cours complet. Vous maîtriserez les hooks, le state management, et la création d\'applications modernes.',
  curriculum: [
    { id: 1, title: 'Introduction à React', duration: '15 min', lessons: 3 },
    { id: 2, title: 'Composants et Props', duration: '45 min', lessons: 5 },
    { id: 3, title: 'State et Hooks', duration: '1h 30min', lessons: 8 },
    { id: 4, title: 'Router et Navigation', duration: '1h', lessons: 4 },
    { id: 5, title: 'API et Fetch', duration: '45 min', lessons: 3 },
    { id: 6, title: 'Projet Final', duration: '2h', lessons: 6 },
  ],
};

const FormationDetailsScreen = ({ onNavigate, onBack }) => {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.thumbnail}>
          <MaterialCommunityIcons name="play-circle" size={80} color="#2196F3" />
        </View>

        <Text style={styles.title}>{mockCourse.title}</Text>

        <View style={styles.instructorRow}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={32} color="#FFF" />
          </View>
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{mockCourse.instructor.name}</Text>
            <Text style={styles.instructorStats}>{mockCourse.instructor.students} étudiants • {mockCourse.instructor.courses} cours</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="star" size={20} color="#FF9800" />
            <Text style={styles.statValue}>{mockCourse.rating}</Text>
            <Text style={styles.statLabel}>({mockCourse.reviews} avis)</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="account-multiple" size={20} color="#4CAF50" />
            <Text style={styles.statValue}>{mockCourse.students}</Text>
            <Text style={styles.statLabel}>étudiants</Text>
          </View>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Prix du cours</Text>
          <Text style={styles.priceValue}>{mockCourse.price} XOF</Text>
          <TouchableOpacity style={styles.enrollButton} onPress={() => onNavigate('player')}>
            <Text style={styles.enrollText}>Commencer le cours</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos de ce cours</Text>
          <Text style={styles.description}>{mockCourse.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programme ({mockCourse.curriculum.length} sections)</Text>
          {mockCourse.curriculum.map((item) => (
            <TouchableOpacity key={item.id} style={styles.curriculumItem}>
              <View style={styles.curriculumIcon}>
                <MaterialCommunityIcons name="play-circle-outline" size={20} color="#2196F3" />
              </View>
              <View style={styles.curriculumInfo}>
                <Text style={styles.curriculumTitle}>{item.title}</Text>
                <Text style={styles.curriculumMeta}>{item.lessons} leçons • {item.duration}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { marginBottom: 16 },
  thumbnail: { backgroundColor: '#1A2332', height: 200, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 16 },
  instructorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { backgroundColor: '#2196F3', padding: 12, borderRadius: 25 },
  instructorInfo: { marginLeft: 12 },
  instructorName: { fontSize: 16, color: '#FFF', fontWeight: '500' },
  instructorStats: { fontSize: 12, color: '#888', marginTop: 4 },
  statsRow: { flexDirection: 'row', marginBottom: 20 },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  statValue: { marginLeft: 4, color: '#FFF', fontSize: 16, fontWeight: '600' },
  statLabel: { marginLeft: 4, color: '#888', fontSize: 12 },
  priceCard: { backgroundColor: '#1A2332', padding: 20, borderRadius: 16, marginBottom: 20 },
  priceLabel: { fontSize: 14, color: '#888' },
  priceValue: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50', marginVertical: 12 },
  enrollButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2196F3', padding: 16, borderRadius: 12 },
  enrollText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  description: { fontSize: 14, color: '#888', lineHeight: 22 },
  curriculumItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 8 },
  curriculumIcon: { backgroundColor: '#2196F320', padding: 8, borderRadius: 8 },
  curriculumInfo: { flex: 1, marginLeft: 12 },
  curriculumTitle: { fontSize: 14, color: '#FFF' },
  curriculumMeta: { fontSize: 12, color: '#888', marginTop: 4 },
});

export default FormationDetailsScreen;