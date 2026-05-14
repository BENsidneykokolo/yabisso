import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TaxiSettingsScreen({ onBack, onNavigate }) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Parametres</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Pressable style={styles.menuItem} onPress={() => onNavigate?.('taxi_driver_verification')}><MaterialCommunityIcons name="car-badge" size={22} color="#22c55e" /><Text style={[styles.menuLabel, { color: '#22c55e' }]}>Mode Chauffeur</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" /></Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.toggleRow}><View style={styles.toggleLeft}><MaterialCommunityIcons name="bell" size={20} color="#64748b" /><Text style={styles.toggleLabel}>Notifications de course</Text></View><Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#2a3a4a', true: '#22c55e' }} thumbColor="#fff" /></View>
          <View style={styles.toggleRow}><View style={styles.toggleLeft}><MaterialCommunityIcons name="volume-high" size={20} color="#64748b" /><Text style={styles.toggleLabel}>Son</Text></View><Switch value={sound} onValueChange={setSound} trackColor={{ false: '#2a3a4a', true: '#22c55e' }} thumbColor="#fff" /></View>
          <View style={styles.toggleRow}><View style={styles.toggleLeft}><MaterialCommunityIcons name="vibrate" size={20} color="#64748b" /><Text style={styles.toggleLabel}>Vibration</Text></View><Switch value={vibration} onValueChange={setVibration} trackColor={{ false: '#2a3a4a', true: '#22c55e' }} thumbColor="#fff" /></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Affichage</Text>
          <View style={styles.toggleRow}><View style={styles.toggleLeft}><MaterialCommunityIcons name="theme-light-dark" size={20} color="#64748b" /><Text style={styles.toggleLabel}>Mode sombre</Text></View><Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: '#2a3a4a', true: '#22c55e' }} thumbColor="#fff" /></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <Pressable style={styles.menuItem} onPress={() => onNavigate?.('profile_edit')}><MaterialCommunityIcons name="account-edit" size={22} color="#64748b" /><Text style={styles.menuLabel}>Modifier mon profil</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" /></Pressable>
          <Pressable style={styles.menuItem} onPress={() => onNavigate?.('profile_addresses')}><MaterialCommunityIcons name="map-marker" size={22} color="#64748b" /><Text style={styles.menuLabel}>Mes adresses</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" /></Pressable>
          <Pressable style={styles.menuItem} onPress={() => onNavigate?.('profile_security')}><MaterialCommunityIcons name="shield-lock" size={22} color="#64748b" /><Text style={styles.menuLabel}>Securite</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" /></Pressable>
          <Pressable style={styles.menuItem} onPress={() => Alert.alert('Paiement', 'Gerez vos methodes de paiement')}><MaterialCommunityIcons name="credit-card" size={22} color="#64748b" /><Text style={styles.menuLabel}>Moyens de paiement</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" /></Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          <Pressable style={styles.menuItem} onPress={() => onNavigate?.('taxi_help')}><MaterialCommunityIcons name="help-circle" size={22} color="#64748b" /><Text style={styles.menuLabel}>Aide et support</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" /></Pressable>
          <Pressable style={styles.menuItem}><MaterialCommunityIcons name="file-document" size={22} color="#64748b" /><Text style={styles.menuLabel}>Conditions d'utilisation</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" /></Pressable>
          <Pressable style={styles.menuItem}><MaterialCommunityIcons name="shield-check" size={22} color="#64748b" /><Text style={styles.menuLabel}>Politique de confidentialite</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" /></Pressable>
        </View>

        <Text style={styles.version}>Yabisso Taxi v1.0.0</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 24 },
  sectionTitle: { color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 6, gap: 12 },
  menuLabel: { flex: 1, color: '#F8FAFC', fontSize: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 6 },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel: { color: '#F8FAFC', fontSize: 14 },
  version: { textAlign: 'center', color: '#2a3a4a', fontSize: 12, marginTop: 24 },
});