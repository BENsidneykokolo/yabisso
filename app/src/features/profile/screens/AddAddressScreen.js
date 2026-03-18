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
import { Q } from '@nozbe/watermelondb';

const CITIES = [
  { name: 'Brazzaville', code: 'BZV' },
  { name: 'Pointe-Noire', code: 'PNR' },
  { name: 'Dolisie', code: 'DLS' },
  { name: 'Owando', code: 'OWD' },
  { name: 'Kinkala', code: 'KNK' },
  { name: 'Ngouabi', code: 'NGP' },
  { name: 'Impfondo', code: 'IPF' },
  { name: 'Lékoumou', code: 'LKM' },
  { name: 'Madingou', code: 'MDG' },
  { name: 'Ouenze', code: 'WNZ' },
];

export default function AddAddressScreen({ onBack, onSave }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Maison');
  const [city, setCity] = useState(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [locationAttempts, setLocationAttempts] = useState(0);

  const categories = ['Maison', 'Travail', 'Salle de gym', 'Autre'];

  useEffect(() => {
    const fetchLastAddress = async () => {
      try {
        const addresses = await database.get('addresses').query().fetch();
        if (addresses.length > 0) {
          const lastId = addresses[addresses.length - 1].unique_id;
          const match = lastId?.match(/([A-Z]{3})(\d+)/);
          if (match) {
            setCity(CITIES.find(c => c.code === match[1]) || null);
          }
        }
      } catch (error) {
        console.error('Error fetching last address:', error);
      }
    };
    fetchLastAddress();
  }, []);

  const getLocation = async () => {
    setIsLocating(true);
    setErrorMsg(null);
    setLocationAttempts(prev => prev + 1);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission de localisation refusée. Activez la localisation dans les paramètres.');
        return;
      }

      await Location.enableNetworkProviderAsync();

      const lastLocation = await Location.getLastKnownPositionAsync({
        maxAge: 10000,
      });

      if (lastLocation && lastLocation.coords.accuracy <= 10) {
        setLocation(lastLocation.coords);
        setAccuracy(lastLocation.coords.accuracy);
        setIsLocating(false);
        return;
      }

      const options = {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 100,
        distanceInterval: 0,
      };

      const currentLocation = await Location.getCurrentPositionAsync(options);
      setLocation(currentLocation.coords);
      setAccuracy(currentLocation.coords.accuracy);

      if (currentLocation.coords.accuracy > 50 && locationAttempts < 3) {
        setErrorMsg(`Précision: ±${Math.round(currentLocation.coords.accuracy)}m. Recherche d'une meilleure position...`);
        setTimeout(() => getLocation(), 2000);
        return;
      }

    } catch (error) {
      console.error(error);
      setErrorMsg('Impossible de récupérer la position. Vérifiez votre GPS.');
    } finally {
      setIsLocating(false);
    }
  };

  const formatAccuracy = (meters) => {
    if (meters <= 5) return { text: 'Excellente', color: '#22c55e' };
    if (meters <= 15) return { text: 'Bonne', color: '#2BEE79' };
    if (meters <= 50) return { text: 'Moyenne', color: '#f59e0b' };
    return { text: 'Faible', color: '#ef4444' };
  };

  const generateUniqueId = async (cityCode) => {
    try {
      const addresses = await database.get('addresses').query(
        Q.where('unique_id', Q.like(`${cityCode}%`))
      ).fetch();
      
      let maxNumber = 0;
      addresses.forEach(addr => {
        const match = addr.unique_id?.match(/([A-Z]{3})(\d+)/);
        if (match && match[1] === cityCode) {
          const num = parseInt(match[2], 10);
          if (num > maxNumber) maxNumber = num;
        }
      });
      
      const nextNumber = maxNumber + 1;
      return `${cityCode}${String(nextNumber).padStart(6, '0')}`;
    } catch (error) {
      console.error('Error generating unique ID:', error);
      const nextNumber = 1;
      return `${cityCode}${String(nextNumber).padStart(6, '0')}`;
    }
  };

  const handleSave = async () => {
    const finalName = name.trim() || category;
    if (!city) {
      Alert.alert('Erreur', 'Veuillez sélectionner votre ville.');
      return;
    }
    if (!finalName) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie ou donner un nom à cet endroit.');
      return;
    }
    if (!location) {
      Alert.alert('Erreur', 'Veuillez récupérer votre position GPS avant d\'enregistrer.');
      return;
    }

    try {
      const uniqueId = await generateUniqueId(city.code);
      const qrPayload = JSON.stringify({
        id: uniqueId,
        name: finalName,
        city: city.name,
        cityCode: city.code,
        lat: location.latitude,
        lng: location.longitude,
        cat: category
      });

      await database.write(async () => {
        await database.get('addresses').create((addr) => {
          addr.name = finalName;
          addr.category = category;
          addr.city = city.name;
          addr.cityCode = city.code;
          addr.latitude = location.latitude;
          addr.longitude = location.longitude;
          addr.unique_id = uniqueId;
          addr.qr_payload = qrPayload;
          addr.full_address = `${city.name} - ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
        });
      });

      Alert.alert(
        'Succès',
        `Adresse enregistrée !\n\nVotre code unique: ${uniqueId}`,
        [{ text: 'OK', onPress: () => onSave?.() }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement.');
    }
  };

  const canSave = location && city && (name.trim() || category);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Nouvelle Adresse</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.label}>Ville</Text>
            <Pressable 
              style={styles.citySelector}
              onPress={() => setShowCityDropdown(!showCityDropdown)}
            >
              <View style={styles.citySelectorContent}>
                <MaterialCommunityIcons name="map-marker" size={22} color={city ? '#2BEE79' : '#64748b'} />
                <Text style={[styles.citySelectorText, !city && styles.citySelectorPlaceholder]}>
                  {city ? `${city.name} (${city.code})` : 'Sélectionner votre ville'}
                </Text>
              </View>
              <MaterialCommunityIcons 
                name={showCityDropdown ? 'chevron-up' : 'chevron-down'} 
                size={22} 
                color="#64748b" 
              />
            </Pressable>
            
            {showCityDropdown && (
              <View style={styles.dropdown}>
                {CITIES.map((c) => (
                  <Pressable
                    key={c.code}
                    style={[
                      styles.dropdownItem,
                      city?.code === c.code && styles.dropdownItemActive
                    ]}
                    onPress={() => {
                      setCity(c);
                      setShowCityDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      city?.code === c.code && styles.dropdownItemTextActive
                    ]}>
                      {c.name}
                    </Text>
                    <Text style={[
                      styles.dropdownItemCode,
                      city?.code === c.code && styles.dropdownItemCodeActive
                    ]}>
                      {c.code}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

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
                  <ActivityIndicator color="#2BEE79" size="large" />
                  <Text style={styles.locatingText}>Recherche satellite en cours...</Text>
                  <Text style={styles.locatingSubtext}>
                    Restez immobile pour une meilleure précision
                  </Text>
                </View>
              ) : location ? (
                <View>
                  <View style={styles.locationInfo}>
                    <View style={styles.locIconBg}>
                      <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#2BEE79" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locStatus}>Position capturée</Text>
                      <Text style={styles.coordinates}>
                        {location.latitude.toFixed(8)}, {location.longitude.toFixed(8)}
                      </Text>
                    </View>
                  </View>
                  {accuracy && (
                    <View style={styles.accuracyContainer}>
                      <View style={styles.accuracyRow}>
                        <MaterialCommunityIcons name="target" size={16} color={formatAccuracy(accuracy).color} />
                        <Text style={[styles.accuracyLabel, { color: formatAccuracy(accuracy).color }]}>
                          Précision: {formatAccuracy(accuracy).text}
                        </Text>
                        <Text style={styles.accuracyValue}>
                          ±{Math.round(accuracy)}m
                        </Text>
                      </View>
                      <View style={styles.accuracyBar}>
                        <View style={[
                          styles.accuracyProgress,
                          { 
                            width: `${Math.max(10, 100 - (accuracy / 2))}%`,
                            backgroundColor: formatAccuracy(accuracy).color
                          }
                        ]} />
                      </View>
                    </View>
                  )}
                  <Pressable style={styles.refreshBtnLarge} onPress={getLocation}>
                    <MaterialCommunityIcons name="refresh" size={18} color="#2BEE79" />
                    <Text style={styles.refreshBtnText}>Améliorer la précision</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.getLocationBtn} onPress={getLocation}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={28} color="#0E151B" />
                  <Text style={styles.getLocationText}>Capturer ma position</Text>
                </Pressable>
              )}
              {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            </View>
            <Text style={styles.hint}>
              Sortez à l'extérieur ou allez près d'une fenêtre. Attendez la précision "Excellente" ou "Bonne".
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
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#151D26',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  citySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  citySelectorText: {
    color: '#fff',
    fontSize: 16,
  },
  citySelectorPlaceholder: {
    color: '#64748b',
  },
  dropdown: {
    backgroundColor: '#151D26',
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownItemTextActive: {
    color: '#2BEE79',
    fontWeight: 'bold',
  },
  dropdownItemCode: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dropdownItemCodeActive: {
    color: '#2BEE79',
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  locatingText: {
    color: '#2BEE79',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locatingSubtext: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accuracyContainer: {
    backgroundColor: 'rgba(43, 238, 121, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.1)',
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  accuracyLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  accuracyValue: {
    color: '#94A3B8',
    fontSize: 12,
  },
  accuracyBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  accuracyProgress: {
    height: '100%',
    borderRadius: 2,
  },
  refreshBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
    backgroundColor: 'rgba(43, 238, 121, 0.05)',
  },
  refreshBtnText: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: '600',
  },
  locIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
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
