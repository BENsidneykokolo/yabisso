import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { database } from '../../../lib/db';

export default function AddAddressScreen({ onBack, onSave }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Maison');
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const categories = ['Maison', 'Travail', 'Salle de gym', 'Autre'];

  const getLocation = async () => {
    setIsLocating(true);
    setErrorMsg(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission de localisation refusée');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLocation(loc.coords);
    } catch (error) {
      console.error(error);
      setErrorMsg('Impossible de récupérer la position');
    } finally {
      setIsLocating(false);
    }
  };

  const generateUniqueId = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = Array.from({ length: 2 }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
    const randomNumbers = Math.floor(100 + Math.random() * 899);
    return `YB-${randomNumbers}-${randomLetters}`;
  };

  const handleSave = async () => {
    // Use category as name if no custom name entered
    const finalName = name.trim() || category;
    if (!finalName) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie ou donner un nom à cet endroit.');
      return;
    }
    if (!location) {
      Alert.alert('Erreur', 'Veuillez récupérer votre position GPS avant d\'enregistrer.');
      return;
    }

    try {
      const uniqueId = generateUniqueId();
      const qrPayload = JSON.stringify({
        id: uniqueId,
        name: finalName,
        lat: location.latitude,
        lng: location.longitude,
        cat: category
      });

      await database.write(async () => {
        await database.get('addresses').create((addr) => {
          addr.name = finalName;
          addr.category = category;
          addr.latitude = location.latitude;
          addr.longitude = location.longitude;
          addr.unique_id = uniqueId;
          addr.qr_payload = qrPayload;
          addr.fullAddress = `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`;
        });
      });

      Alert.alert('Succès', 'Adresse enregistrée avec succès !');
      onSave?.();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement.');
    }
  };

  // Check if save button should be enabled
  const canSave = location && (name.trim() || category);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Nouvelle Adresse</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Nom de l'endroit</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Ma Maison, Bureau, Gym..."
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.categoryRow}>
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextActive
                  ]}>{cat}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Localisation GPS</Text>
            <View style={styles.locationCard}>
              {isLocating ? (
                <View style={styles.locatingContainer}>
                  <ActivityIndicator color="#2BEE79" size="small" />
                  <Text style={styles.locatingText}>Calcul de la position précise...</Text>
                </View>
              ) : location ? (
                <View style={styles.locationInfo}>
                  <View style={styles.locIconBg}>
                    <MaterialCommunityIcons name="map-marker-check" size={24} color="#2BEE79" />
                  </View>
                  <View>
                    <Text style={styles.locStatus}>Position capturée</Text>
                    <Text style={styles.coordinates}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                  </View>
                  <Pressable style={styles.refreshBtn} onPress={getLocation}>
                    <MaterialCommunityIcons name="refresh" size={20} color="#64748b" />
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.getLocationBtn} onPress={getLocation}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#0E151B" />
                  <Text style={styles.getLocationText}>Lancer la géolocalisation</Text>
                </Pressable>
              )}
              {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            </View>
            <Text style={styles.hint}>
              Pour plus de précision, assurez-vous d'être à l'extérieur ou près d'une fenêtre.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable 
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveBtnText}>Enregistrer l'adresse</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#151D26',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#151D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    borderColor: '#2BEE79',
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#2BEE79',
    fontWeight: 'bold',
  },
  locationCard: {
    backgroundColor: '#151D26',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 100,
    justifyContent: 'center',
  },
  getLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#2BEE79',
    paddingVertical: 14,
    borderRadius: 12,
  },
  getLocationText: {
    color: '#0E151B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  locatingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  locStatus: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  coordinates: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  refreshBtn: {
    marginLeft: 'auto',
    padding: 8,
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 12,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  saveBtn: {
    backgroundColor: '#2BEE79',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#1c2a38',
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#0E151B',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
