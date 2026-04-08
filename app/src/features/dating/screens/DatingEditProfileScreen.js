import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const AVAILABLE_INTERESTS = [
  { emoji: '⚽️', label: 'Football' },
  { emoji: '🎵', label: 'Afrobeat' },
  { emoji: '🥘', label: 'Jollof' },
  { emoji: '✈️', label: 'Travel' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '📷', label: 'Photography' },
  { emoji: '🕶️', label: 'Fashion' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '🎸', label: 'Music' },
  { emoji: '🍳', label: 'Cooking' },
  { emoji: '📚', label: 'Reading' },
  { emoji: '🏃', label: 'Sport' },
];

function DatingEditProfileScreen({ navigation, onBack, onNavigate }) {
  const [photos, setPhotos] = useState([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBbxuhQ3_UNh-OWWq_eUQsjzYKiOhZtzxRBsj_bhhTpVVjAh5NjjVZy0kdopGxCSjALw3OfPJj1OJaKPY4cuHUxcesZ3D_ItgxI5UvSeEmAWwLbben964XjPAJ39-taLuZ0EJNq6jHcq2tFxPxqJiDcMrNZ4FZSgbngFzcflneoHJAWNQbVHk6UMH1c_2jxQ1fZ5GjnVgtW0fctGhGdMjRRwEKu8mocK97xIZa49kf-dj9MfQhNnGkDKTvdpbbSzoOAEU1yqyGK',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCDdF4GJr5TL-LLyFiIwcuNKyfSfSLTOJFz20rubwFJksgaersHVsbPj2oBZoXdCAwekh6OAcjRVnTos8Gy5XmPBjAwvHIBnRA40SMyyFusIlcbfIGVwfelWSTqbfJUW3IIb1GslydDBQY8ewNZHmuJquSX9qxlpLBWX71TnuPXu9Bqb45WkkAW8B1FzSybQ1hMiNz0B-BQvzRMsXt6APM8n8EvXvzgg5G_zt_UnMT8hUEuNxvyF8mmGRgKJ11-AvJxI2YvSm-Z',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBrC71uM-q4Ntwmo7g_m-aXkAa_4KL0A0Ax0Rnt6For_8F_A0PS6IV40e5Ejwz48k6ItmT2piYxOeuIUIyUNUn3UhXTRUAus8vM7AaNqHp1WMnW7JxQzYHIg7F_taMQimmUSq73BFLs2-1B-rqSIg2r0egXOg639y-Bc-I5Om4wsCBLmV0fK3O_HufKqFAM4UaNpyZflZUQ0UVsAjNXBPdh_mrs5igHcYxwwquGXA7my4Oq1xwD-ZERd2nqi92ZihJ3gUmd6enM',
  ]);
  
  const [name, setName] = useState('Tobi');
  const [age, setAge] = useState('24');
  const [gender, setGender] = useState('Homme');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState(['Football', 'Afrobeat', 'Jollof']);
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [isRecording, setIsRecording] = useState(false);

  const handleAddPhoto = async () => {
    if (photos.length >= 6) {
      Alert.alert('Maximum', 'Vous pouvez ajouter jusqu\'à 6 photos');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleRemovePhoto = (index) => {
    if (index === 0) return;
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = () => {
    Alert.alert('Succès', 'Profil enregistré avec succès!', [
      { text: 'OK', onPress: () => onBack && onBack() }
    ]);
  };

  const renderPhotoSlot = (index) => {
    const isMain = index === 0;
    const hasPhoto = photos[index];
    
    return (
      <View
        key={index}
        style={[
          styles.photoSlot,
          isMain && styles.photoSlotMain,
          !hasPhoto && styles.photoSlotEmpty,
        ]}
      >
        {hasPhoto ? (
          <>
            <Image source={{ uri: photos[index] }} style={styles.photoImage} />
            {isMain && (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>Principale</Text>
              </View>
            )}
            {index > 0 && (
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => handleRemovePhoto(index)}
              >
                <MaterialCommunityIcons name="close" size={12} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
            <MaterialCommunityIcons name="add-a-photo" size={32} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes Photos</Text>
            <Text style={styles.photoCount}>{photos.length}/6</Text>
          </View>
          <View style={styles.photoGrid}>
            {[0, 1, 2, 3, 4, 5].map(renderPhotoSlot)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon Ambiance</Text>
          
          <View style={styles.voiceRecordContainer}>
            <TouchableOpacity
              style={styles.voiceRecordButton}
              onPress={() => setIsRecording(!isRecording)}
            >
              <MaterialCommunityIcons name="mic" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.voiceInfo}>
              <View style={styles.waveform}>
                {[...Array(20)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveformBar,
                      { height: Math.random() * 20 + 10 },
                      isRecording && styles.waveformBarActive,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.voiceHint}>Enregistrer une intro vocale (optionnel)</Text>
            </View>
            <Text style={styles.voiceDuration}>0:00</Text>
          </View>

          <View style={styles.bioContainer}>
            <TextInput
              style={styles.bioInput}
              placeholder="Parlez-nous de vous... Qu'est-ce qui vous passionne?"
              placeholderTextColor="#6b7280"
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={300}
            />
            <Text style={styles.charCount}>{bio.length}/300</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de base</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Nom d'affichage"
                placeholderTextColor="#6b7280"
              />
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.inputSmall]}>
                <TextInput
                  style={styles.textInput}
                  value={age}
                  onChangeText={setAge}
                  placeholder="Âge"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputContainer, styles.inputLarge]}>
                <TouchableOpacity style={styles.selectButton}>
                  <Text style={styles.selectText}>{gender}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <View style={styles.locationIcon}>
                <MaterialCommunityIcons name="location-on" size={20} color="#43a047" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Localisation</Text>
                <Text style={styles.locationValue}>{location}</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.refreshButton}>Actualiser</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passions</Text>
          <View style={styles.interestsContainer}>
            {AVAILABLE_INTERESTS.map((item) => {
              const isSelected = selectedInterests.includes(item.label);
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.interestChip,
                    isSelected && styles.interestChipSelected,
                  ]}
                  onPress={() => toggleInterest(item.label)}
                >
                  <Text style={styles.interestEmoji}>{item.emoji}</Text>
                  <Text style={[
                    styles.interestLabel,
                    isSelected && styles.interestLabelSelected,
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Enregistrer le profil</Text>
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  photoCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoSlot: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  photoSlotMain: {
    width: '64%',
    aspectRatio: 1,
  },
  photoSlotEmpty: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#374151',
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#137fec',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  mainBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceRecordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 50,
    padding: 8,
    marginTop: 12,
  },
  voiceRecordButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  voiceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  waveformBarActive: {
    backgroundColor: '#137fec',
  },
  voiceHint: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  voiceDuration: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginLeft: 8,
  },
  bioContainer: {
    marginTop: 16,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
  },
  bioInput: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 8,
  },
  inputGroup: {
    gap: 12,
  },
  inputContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  inputSmall: {
    width: '30%',
  },
  inputLarge: {
    flex: 1,
  },
  textInput: {
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectText: {
    color: '#fff',
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(67,160,71,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(67,160,71,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  refreshButton: {
    fontSize: 12,
    fontWeight: '600',
    color: '#137fec',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0f172a',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#374151',
  },
  interestChipSelected: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
  },
  interestEmoji: {
    fontSize: 16,
  },
  interestLabel: {
    fontSize: 14,
    color: '#d1d5db',
  },
  interestLabelSelected: {
    color: '#fff',
    fontWeight: '600',
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2BEE79',
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#2BEE79',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#101922',
  },
});

export default DatingEditProfileScreen;