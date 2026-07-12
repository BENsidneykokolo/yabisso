// app/src/features/admin/screens/SuperAdminLoginScreen.js
// Écran de connexion Super Admin
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SuperAdminService } from '../services/SuperAdminService';

export default function SuperAdminLoginScreen({ onBack, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Erreur', 'Veuillez saisir vos identifiants');
      return;
    }

    setLoading(true);
    const result = await SuperAdminService.login(username.trim(), password);
    setLoading(false);

    if (result.success) {
      onLoginSuccess && onLoginSuccess();
    } else {
      Alert.alert('Échec', result.error || 'Identifiants incorrects');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Super Admin</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="shield-crown" size={64} color="#2BEE79" />
            </View>
            <Text style={styles.appName}>Yabisso</Text>
            <Text style={styles.subtitle}>Console Super Administrateur</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="account" size={20} color="#7C8A9A" />
                <TextInput
                  style={styles.input}
                  placeholder="superadmin"
                  placeholderTextColor="#7C8A9A"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#7C8A9A" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#7C8A9A"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#7C8A9A"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0E151B" />
              ) : (
                <>
                  <MaterialCommunityIcons name="login" size={20} color="#0E151B" />
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                </>
              )}
            </Pressable>

            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="information" size={16} color="#7C8A9A" />
              <Text style={styles.infoText}>
                Accès réservé. Toutes les actions sont journalisées.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 40 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(43, 238, 121, 0.3)',
  },
  appName: { color: '#F8FAFC', fontSize: 32, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#7C8A9A', fontSize: 14 },
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#B6C2CF', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    paddingVertical: 14,
    marginLeft: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  loginButtonDisabled: { opacity: 0.5 },
  loginButtonText: { color: '#0E151B', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 40, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  infoText: { color: '#7C8A9A', fontSize: 12, marginLeft: 8, flex: 1 },
});
