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

const CATEGORIES = [
  { key: 'vetements', label: 'Vetements' },
  { key: 'electronique', label: 'Electronique' },
  { key: 'meubles', label: 'Meubles' },
  { key: 'livres', label: 'Livres' },
  { key: 'vehicules', label: 'Vehicules' },
  { key: 'autres', label: 'Autres' },
];

const CONDITIONS = [
  { key: 'neuf', label: 'Neuf' },
  { key: 'tres_bon', label: 'Très bon' },
  { key: 'bon', label: 'Bon' },
];

export default function SwapPostScreen({ onBack, onNavigate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    if (title && description && selectedCategory && selectedCondition && location) {
      onNavigate && onNavigate('SwapHome');
    }
  };

  const isValid = title && description && selectedCategory && selectedCondition && location;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Publier un article</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.photoSection}>
          <Pressable style={styles.photoPlaceholder}>
            <MaterialCommunityIcons name="camera-plus" size={40} color="#7C8A9A" />
            <Text style={styles.photoText}>Ajouter une photo</Text>
          </Pressable>
          <Text style={styles.photoHint}>Ajoutez jusqu'a 5 photos</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Titre</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: iPhone 13 Pro, Canape gris..."
            placeholderTextColor="#7C8A9A"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Decrivez votre article en detail..."
            placeholderTextColor="#7C8A9A"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.inputLabel}>Categorie</Text>
          <View style={styles.optionsGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                style={[
                  styles.optionButton,
                  selectedCategory === cat.key && styles.optionButtonActive,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedCategory === cat.key && styles.optionTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Etat</Text>
          <View style={styles.conditionsRow}>
            {CONDITIONS.map((cond) => (
              <Pressable
                key={cond.key}
                style={[
                  styles.conditionButton,
                  selectedCondition === cond.key && styles.conditionButtonActive,
                ]}
                onPress={() => setSelectedCondition(cond.key)}
              >
                <Text
                  style={[
                    styles.conditionText,
                    selectedCondition === cond.key && styles.conditionTextActive,
                  ]}
                >
                  {cond.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Localisation</Text>
          <View style={styles.locationInputContainer}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#7C8A9A" />
            <TextInput
              style={styles.locationInput}
              placeholder="Ex: Douala, Yaounde..."
              placeholderTextColor="#7C8A9A"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid}
        >
          <MaterialCommunityIcons name="check" size={20} color={isValid ? '#0E151B' : '#7C8A9A'} />
          <Text style={[styles.submitButtonText, !isValid && styles.submitButtonTextDisabled]}>
            Publier
          </Text>
        </Pressable>
      </View>
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
  headerSpacer: {
    width: 40,
  },
  photoSection: {
    marginBottom: 24,
  },
  photoPlaceholder: {
    height: 160,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  photoText: {
    color: '#7C8A9A',
    marginTop: 10,
    fontSize: 14,
  },
  photoHint: {
    color: '#4A5568',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionButtonActive: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  optionText: {
    color: '#7C8A9A',
    fontSize: 13,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#0E151B',
    fontWeight: '600',
  },
  conditionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  conditionButtonActive: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  conditionText: {
    color: '#7C8A9A',
    fontSize: 13,
    fontWeight: '500',
  },
  conditionTextActive: {
    color: '#0E151B',
    fontWeight: '600',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  locationInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#F8FAFC',
    fontSize: 14,
    marginLeft: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
  },
  submitButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  submitButtonTextDisabled: {
    color: '#7C8A9A',
  },
});