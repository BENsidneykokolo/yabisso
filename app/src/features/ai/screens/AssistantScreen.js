import React, { useState, useEffect, useRef } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';

/**
 * AssistantScreen - A robust rewrite of the AI Assistant screen.
 * Handles keyboard positioning, multiline text entry, and modular menus.
 */
export default function AssistantScreen({
  onBack,
  onNavigate
}) {
  // --- States ---
  const [inputText, setInputText] = useState('');
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState(null);

  // --- Static Data ---
  const suggestions = [
    'Trouver un restaurant',
    'Reserver un taxi',
    'Acheter un produit',
    'Verifier mon solde',
  ];

  // --- Handlers ---
  const handleCameraPress = async () => {
    setShowToolsModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'La permission caméra est nécessaire pour prendre des photos.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      Alert.alert('Photo prise', 'Photo enregistrée: ' + result.assets[0].uri);
    }
  };

  const handleGalleryPress = async () => {
    setShowToolsModal(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'La permission galerie est nécessaire pour sélectionner des photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const count = result.assets.length;
      Alert.alert('Photos sélectionnées', `${count} photo(s) sélectionnée(s)`);
    }
  };

  const handleFilePress = async () => {
    setShowToolsModal(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        allowMultipleSelection: true,
      });

      if (!result.canceled && result.output.length > 0) {
        const count = result.output.length;
        Alert.alert('Fichiers sélectionnés', `${count} fichier(s) sélectionné(s)`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner des fichiers');
    }
  };

  const handleLocationPress = async () => {
    setShowToolsModal(false);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'La permission localisation est nécessaire pour sélectionner un lieu.');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const addressText = `${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`;
        Alert.alert('Position actuelle', addressText);
      } else {
        Alert.alert('Position', `Lat: ${location.coords.latitude}, Long: ${location.coords.longitude}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir la localisation');
    }
  };

  const handleContactPress = async () => {
    setShowToolsModal(false);
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'La permission contacts est nécessaire pour sélectionner des contacts.');
      return;
    }

    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      if (data.length > 0) {
        const count = data.length;
        Alert.alert('Contacts', `${count} contact(s) disponible(s)`);
      } else {
        Alert.alert('Contacts', 'Aucun contact trouvé');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder aux contacts');
    }
  };

  const handleAudioPress = async () => {
    setShowToolsModal(false);
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'La permission microphone est nécessaire pour enregistrer audio.');
      return;
    }

    Alert.alert('Audio', 'Fonctionnalité audio - Enregistrement ou sélection de fichiers audio');
  };

  const handleToolPress = (tool) => {
    setShowToolsModal(false);
    switch (tool) {
      case 'camera':
        handleCameraPress();
        break;
      case 'photo':
        handleGalleryPress();
        break;
      case 'file':
        handleFilePress();
        break;
      case 'location':
        handleLocationPress();
        break;
      case 'contact':
        handleContactPress();
        break;
      case 'audio':
        handleAudioPress();
        break;
      default:
        Alert.alert('Info', `Fonctionnalité ${tool} en cours de développement`);
    }
  };

  const menuActions = {
    newChat: () => { setInputText(''); Alert.alert('Nouvelle discussion', 'Réinitialisé'); },
    history: () => Alert.alert('Historique', 'Historique des discussions'),
    search: () => Alert.alert('Rechercher', 'Fonctionnalité de recherche'),
    categories: () => { setShowMenuModal(false); if (onNavigate) onNavigate('services'); },
    settings: () => { setShowMenuModal(false); if (onNavigate) onNavigate('settings'); },
    home: () => { setShowMenuModal(false); if (onNavigate) onNavigate('home'); },
    wallet: () => { setShowMenuModal(false); if (onNavigate) onNavigate('wallet'); },
    profile: () => { setShowMenuModal(false); if (onNavigate) onNavigate('profile'); },
  };

  const handleMenuPress = (action) => {
    setShowMenuModal(false);
    if (menuActions[action]) menuActions[action]();
  };

  // --- Render ---
  return (
    <View style={styles.root}>
      {/* Header with its own SafeArea to avoid overlap with content background */}
      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.headerRow}>
          <Pressable style={styles.headerButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Assistant IA</Text>
          <Pressable style={styles.headerButton} onPress={() => setShowMenuModal(true)}>
            <Ionicons name="menu" size={22} color="#E6EDF3" />
          </Pressable>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.robotContainer}>
              <MaterialCommunityIcons name="robot" size={80} color="#2BEE79" />
            </View>
            <Text style={styles.heroTitle}>Comment puis-je vous aider ?</Text>
          </View>

          {/* Suggestions List */}
          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsRow}>
              {suggestions.map((item, idx) => (
                <Pressable key={idx} style={styles.suggestionChip}>
                  <Text style={styles.suggestionText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Persistent Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Pressable style={styles.attachButton} onPress={() => setShowToolsModal(true)}>
              <Ionicons name="add" size={20} color="#7C8A9A" />
            </Pressable>
            <TextInput
              style={styles.input}
              placeholder="Tapez votre message..."
              placeholderTextColor="#7C8A9A"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Pressable style={styles.micButton}>
              <Ionicons name="mic" size={20} color="#0E151B" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Tools Modal (Bottom Sheet style) */}
      <Modal visible={showToolsModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowToolsModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Ajouter</Text>
            <View style={styles.toolsGrid}>
              {[
                { id: 'camera', icon: 'camera', label: 'Camera', color: '#2BEE79' },
                { id: 'photo', icon: 'image', label: 'Photo', color: '#3B82F6' },
                { id: 'file', icon: 'file-document', label: 'Fichier', color: '#F59E0B' },
                { id: 'location', icon: 'map-marker', label: 'Position', color: '#EF4444' },
                { id: 'contact', icon: 'contacts', label: 'Contact', color: '#8B5CF6' },
                { id: 'audio', icon: 'microphone', label: 'Audio', color: '#EC4899' },
              ].map((tool) => (
                <Pressable key={tool.id} style={styles.toolItem} onPress={() => handleToolPress(tool.id)}>
                  <View style={[styles.toolIcon, { backgroundColor: tool.color }]}>
                    <MaterialCommunityIcons name={tool.icon} size={24} color="#fff" />
                  </View>
                  <Text style={styles.toolText}>{tool.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu Modal (Side Drawer style) */}
      <Modal visible={showMenuModal} transparent animationType="fade">
        <Pressable style={styles.menuOverlay} onPress={() => setShowMenuModal(false)}>
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <MaterialCommunityIcons name="robot" size={28} color="#2BEE79" />
              <Text style={styles.menuTitle}>Yabisso AI</Text>
            </View>

            <MenuItem
              icon="plus"
              label="Nouvelle discussion"
              color="#2BEE79"
              onPress={() => handleMenuPress('newChat')}
            />
            <MenuItem
              icon="view-grid"
              label="Categories"
              onPress={() => handleMenuPress('categories')}
            />

            <View style={styles.menuDivider} />

            <Text style={styles.menuSectionTitle}>Navigation rapide</Text>

            <MenuItem
              icon="home"
              label="Accueil"
              onPress={() => handleMenuPress('home')}
            />

            <MenuItem
              icon="wallet"
              label="Portefeuille"
              onPress={() => handleMenuPress('wallet')}
            />

            <MenuItem
              icon="account"
              label="Profil"
              onPress={() => handleMenuPress('profile')}
            />

            <View style={styles.menuDivider} />

            <MenuItem
              icon="cog"
              label="Paramètres"
              onPress={() => handleMenuPress('settings')}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/** Helper component for Menu Items */
const MenuItem = ({ icon, label, onPress, color = "#B6C2CF" }) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemIcon}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.menuItemText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  safeHeader: {
    backgroundColor: '#0E151B',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    marginTop: 20,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  robotContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    marginVertical: 30,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  suggestionText: {
    color: '#2BEE79',
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40, // Definitive clearance for system zone
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 120,
    minHeight: 40,
  },
  attachButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  modalContent: {
    backgroundColor: '#1a242d',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  toolItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 10,
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolText: {
    color: '#B6C2CF',
    fontSize: 12,
    fontWeight: '500',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  menuContent: {
    backgroundColor: '#1E293B',
    width: '75%',
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
    paddingLeft: 8,
  },
  menuTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    color: '#E6EDF3',
    fontSize: 15,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 16,
  },
  menuSectionTitle: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
});
