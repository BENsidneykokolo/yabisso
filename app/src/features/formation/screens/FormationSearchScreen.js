import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockRecentSearches = ['React.js', 'Marketing Digital', 'Python', 'JavaScript', 'Design'];

const mockResults = [
  { id: 1, title: 'React.js - Fondamentaux', instructor: 'Marie Dubois', type: 'Cours', level: 'Débutant', price: 25000 },
  { id: 2, title: 'React Native Mobile', instructor: 'Pierre Lambert', type: 'Cours', level: 'Avancé', price: 35000 },
  { id: 3, title: 'React Avancé', instructor: 'Jean Martin', type: 'Formation', level: 'Intermédiaire', price: 40000 },
];

const categories = [
  { id: 1, name: 'Développement Web', icon: 'language-html5' },
  { id: 2, name: 'Mobile', icon: 'cellphone' },
  { id: 3, name: 'Data', icon: 'database' },
  { id: 4, name: 'Design', icon: 'palette' },
  { id: 5, name: 'Marketing', icon: 'bullhorn' },
  { id: 6, name: 'Langues', icon: 'translate' },
];

const FormationSearchScreen = ({ onNavigate, onBack }) => {
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => onNavigate('details')}>
      <View style={styles.resultIcon}>
        <MaterialCommunityIcons name="play-circle-outline" size={24} color="#2196F3" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultInstructor}>{item.instructor}</Text>
        <View style={styles.resultMeta}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
          <Text style={styles.resultType}>{item.type}</Text>
        </View>
        <Text style={styles.resultPrice}>{item.price} XOF</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un cours..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setShowResults(text.length > 0);
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setShowResults(false); }}>
              <MaterialCommunityIcons name="close" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showResults ? (
        <FlatList
          data={mockResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recherches récentes</Text>
            {mockRecentSearches.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => { setSearch(item); setShowResults(true); }}
              >
                <MaterialCommunityIcons name="history" size={20} color="#888" />
                <Text style={styles.recentText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parcourir par catégorie</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => onNavigate('courses')}
                >
                  <MaterialCommunityIcons name={cat.icon} size={32} color="#2196F3" />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cours populaires</Text>
            <TouchableOpacity style={styles.popularCard} onPress={() => onNavigate('details')}>
              <View style={styles.popularIcon}>
                <MaterialCommunityIcons name="fire" size={24} color="#FF9800" />
              </View>
              <View style={styles.popularInfo}>
                <Text style={styles.popularTitle}>Top des formations cette semaine</Text>
                <Text style={styles.popularDesc}>Découvrez les cours les plus suivis</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 12, borderRadius: 12 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#FFF' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  recentText: { marginLeft: 12, color: '#FFF', fontSize: 16 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '30%', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  categoryName: { marginTop: 8, color: '#FFF', fontSize: 12, textAlign: 'center' },
  popularCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12 },
  popularIcon: { backgroundColor: '#FF980020', padding: 12, borderRadius: 12 },
  popularInfo: { flex: 1, marginLeft: 12 },
  popularTitle: { fontSize: 16, color: '#FFF', fontWeight: '500' },
  popularDesc: { fontSize: 12, color: '#888', marginTop: 4 },
  resultsList: { paddingBottom: 20 },
  resultCard: { flexDirection: 'row', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 12 },
  resultIcon: { backgroundColor: '#2A3444', padding: 12, borderRadius: 12 },
  resultInfo: { flex: 1, marginLeft: 12 },
  resultTitle: { fontSize: 16, color: '#FFF', fontWeight: '500' },
  resultInstructor: { fontSize: 14, color: '#888', marginTop: 4 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  levelBadge: { backgroundColor: '#2196F320', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  levelText: { color: '#2196F3', fontSize: 12 },
  resultType: { marginLeft: 8, color: '#888', fontSize: 12 },
  resultPrice: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginTop: 8 },
});

export default FormationSearchScreen;