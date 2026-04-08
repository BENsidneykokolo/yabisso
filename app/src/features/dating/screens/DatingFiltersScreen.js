import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AGES = Array.from({ length: 50 }, (_, i) => 18 + i);
const DISTANCES = ['1 km', '2 km', '5 km', '10 km', '25 km', '50 km', '100 km', 'Partout'];
const GENDERS = ['Homme', 'Femme', 'Non-binaire'];
const INTERESTS = [
  'Football', 'Afrobeat', 'Musique', 'Voyage', 'Art', 'Photo', 
  'Fashion', 'Gaming', 'Cuisine', 'Lecture', 'Sport', 'Danse',
];

function DatingFiltersScreen({ navigation, onBack, onNavigate }) {
  const [selectedGender, setSelectedGender] = useState('Homme');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);
  const [distance, setDistance] = useState('10 km');
  const [selectedInterests, setSelectedInterests] = useState(['Football', 'Musique']);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleApply = () => {
    if (onBack) onBack();
  };

  const handleReset = () => {
    setSelectedGender('Homme');
    setMinAge(18);
    setMaxAge(35);
    setDistance('10 km');
    setSelectedInterests(['Football', 'Musique']);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtres</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Réinitialiser</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genre</Text>
          <View style={styles.optionsRow}>
            {GENDERS.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.optionButton,
                  selectedGender === gender && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedGender(gender)}
              >
                <Text style={[
                  styles.optionText,
                  selectedGender === gender && styles.optionTextSelected,
                ]}>
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Âge</Text>
          <View style={styles.ageContainer}>
            <View style={styles.ageSelector}>
              <Text style={styles.ageLabel}>Min</Text>
              <View style={styles.ageValue}>
                <TouchableOpacity 
                  style={styles.ageButton}
                  onPress={() => setMinAge(Math.max(18, minAge - 1))}
                >
                  <MaterialCommunityIcons name="minus" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.ageText}>{minAge} ans</Text>
                <TouchableOpacity 
                  style={styles.ageButton}
                  onPress={() => setMinAge(Math.min(maxAge - 1, minAge + 1))}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.ageSelector}>
              <Text style={styles.ageLabel}>Max</Text>
              <View style={styles.ageValue}>
                <TouchableOpacity 
                  style={styles.ageButton}
                  onPress={() => setMaxAge(Math.max(minAge + 1, maxAge - 1))}
                >
                  <MaterialCommunityIcons name="minus" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.ageText}>{maxAge} ans</Text>
                <TouchableOpacity 
                  style={styles.ageButton}
                  onPress={() => setMaxAge(Math.min(67, maxAge + 1))}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance</Text>
          <View style={styles.distancesGrid}>
            {DISTANCES.map((dist) => (
              <TouchableOpacity
                key={dist}
                style={[
                  styles.distanceButton,
                  distance === dist && styles.distanceButtonSelected,
                ]}
                onPress={() => setDistance(dist)}
              >
                <Text style={[
                  styles.distanceText,
                  distance === dist && styles.distanceTextSelected,
                ]}>
                  {dist}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Centres d'intérêt</Text>
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestButton,
                    isSelected && styles.interestButtonSelected,
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text style={[
                    styles.interestText,
                    isSelected && styles.interestTextSelected,
                  ]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Appliquer les filtres</Text>
          <MaterialCommunityIcons name="check-circle" size={18} color="#101922" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resetText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1c2936',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  optionText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#101922',
  },
  ageContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  ageSelector: {
    flex: 1,
    backgroundColor: '#1c2936',
    borderRadius: 12,
    padding: 16,
  },
  ageLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  ageValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  distancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1c2936',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  distanceButtonSelected: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  distanceText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  distanceTextSelected: {
    color: '#101922',
    fontWeight: '600',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1c2936',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  interestButtonSelected: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
  },
  interestText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  interestTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(16,25,34,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2BEE79',
    paddingVertical: 14,
    borderRadius: 25,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#101922',
  },
});

export default DatingFiltersScreen;