import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const accessCodes = ['YBT2026A', 'DRIVER45', 'TAXI99', 'ADMIN01'];

export default function TaxiDriverVerificationScreen({ onBack, onNavigate }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (!code.trim()) { Alert.alert('Erreur', 'Veuillez entrer un code d\'acces.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (accessCodes.includes(code.toUpperCase())) {
        onNavigate?.('taxi_driver_home');
      } else {
        Alert.alert('Acces refuse', 'Ce code n\'est pas valide. Contactez l\'administrateur Yabisso.');
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Mode Chauffeur</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="car-badge" size={64} color="#22c55e" />
        </View>
        <Text style={styles.title}>Espace Chauffeur</Text>
        <Text style={styles.subtitle}>Entrez votre code d'acces pour commencer a recevoir des courses</Text>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="shield-key" size={22} color="#64748b" />
          <TextInput style={styles.codeInput} placeholder="Code d'acces" placeholderTextColor="#64748b" value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} />
          {code.length > 0 && (
            <Pressable onPress={() => setCode('')}><MaterialCommunityIcons name="close-circle" size={20} color="#64748b" /></Pressable>
          )}
        </View>

        <Pressable style={styles.verifyBtn} onPress={handleVerify} disabled={loading}>
          {loading ? (
            <MaterialCommunityIcons name="loading" size={24} color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
              <Text style={styles.verifyBtnText}>Verifier mon acces</Text>
            </>
          )}
        </Pressable>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={18} color="#137fec" />
          <Text style={styles.infoText}>Les codes d'acces sontdelivres par l'equipe Yabisso. Contactez le support si vous n'en avez pas.</Text>
        </View>

        <Pressable style={styles.supportBtn} onPress={() => onNavigate?.('taxi_help')}>
          <MaterialCommunityIcons name="headset" size={20} color="#137fec" />
          <Text style={styles.supportBtnText}>Contacter le support</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(34,197,94,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { color: '#F8FAFC', fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 16, width: '100%', gap: 12, marginBottom: 16 },
  codeInput: { flex: 1, color: '#fff', fontSize: 18, paddingVertical: 16, letterSpacing: 4, textAlign: 'center' },
  verifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 16, width: '100%', marginBottom: 20 },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(19,127,236,0.1)', borderRadius: 12, padding: 14, width: '100%', gap: 10, marginBottom: 16 },
  infoText: { flex: 1, color: '#94A3B8', fontSize: 13, lineHeight: 18 },
  supportBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  supportBtnText: { color: '#137fec', fontSize: 14, fontWeight: '600' },
});