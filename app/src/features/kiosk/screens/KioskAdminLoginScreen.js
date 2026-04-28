// app/src/features/kiosk/screens/KioskAdminLoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const ADMIN_CODE = 'YABISSO2026'; // Code par défaut (à changer en production)

function KioskAdminLoginScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!code.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le code administrateur');
      return;
    }

    setLoading(true);

    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 500));

    // Vérifier le code
    if (code.toUpperCase() === ADMIN_CODE) {
      // Sauvegarder le flag admin
      await SecureStore.setItemAsync('is_kiosk_admin', 'true');
      await SecureStore.setItemAsync('kiosk_id', `kiosque_${Date.now()}`);
      
      // Utiliser navigate au lieu de replace
      navigation.navigate('kiosk_dashboard');
    } else {
      Alert.alert('Erreur', 'Code administrateur incorrect');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="shield-crown" size={80} color="#2BEE79" />
        </View>
        
        <Text style={styles.title}>Mode Administrateur</Text>
        <Text style={styles.subtitle}>
          Entrez le code administrateur pour accéder au panneau de validation
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Code administrateur"
            placeholderTextColor="#666"
            secureTextEntry
            autoCapitalize="characters"
            maxLength={20}
          />
        </View>

        <Pressable 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Ionicons name="log-in-outline" size={24} color="#000" />
          <Text style={styles.buttonText}>
            {loading ? 'Vérification...' : 'Accéder au panneau'}
          </Text>
        </Pressable>

        <Pressable 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#666" />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={16} color="#FFD166" />
          <Text style={styles.infoText}>
            Ce panneau est réservé aux administrateurs kiosque Yabisso
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#aaa', fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 32 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 12, paddingHorizontal: 16, marginBottom: 24 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 18, paddingVertical: 16 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2BEE79', padding: 16, borderRadius: 12 },
  buttonDisabled: { backgroundColor: '#666' },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  backText: { color: '#666', fontSize: 16, marginLeft: 8 },
  infoBox: { flexDirection: 'row', alignItems: 'center', marginTop: 40, padding: 16, backgroundColor: '#16213e', borderRadius: 12 },
  infoText: { color: '#aaa', fontSize: 12, marginLeft: 12, flex: 1 },
});

export default KioskAdminLoginScreen;