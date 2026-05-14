import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TextInput, Alert, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TaxiDriverProfileScreen({ onBack, onNavigate }) {
  const [name, setName] = useState('Koffi Aka');
  const [phone, setPhone] = useState('+225 07 00 00 00 01');
  const [carModel, setCarModel] = useState('Toyota Corolla');
  const [plate, setPlate] = useState('AB-1234-CC');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const stats = { trips: 247, rating: 4.8, since: 'Janvier 2025' };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Mon profil</Text>
        <Pressable style={styles.editBtn} onPress={() => Alert.alert('Edition', 'Fonction d\'edition en cours...')}><MaterialCommunityIcons name="pencil" size={20} color="#fff" /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}><MaterialCommunityIcons name="account" size={48} color="#64748b" /></View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profilePhone}>{phone}</Text>
          <View style={styles.ratingBadge}><Ionicons name="star" size={14} color="#eab308" /><Text style={styles.ratingBadgeText}>{stats.rating}</Text></View>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}><Text style={styles.profileStatValue}>{stats.trips}</Text><Text style={styles.profileStatLabel}>Courses</Text></View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}><Text style={styles.profileStatValue}>{stats.since}</Text><Text style={styles.profileStatLabel}>Membre depuis</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon vehicule</Text>
          <View style={styles.infoRow}><MaterialCommunityIcons name="car" size={20} color="#64748b" /><Text style={styles.infoLabel}>Modele</Text><Text style={styles.infoValue}>{carModel}</Text></View>
          <View style={styles.infoRow}><MaterialCommunityIcons name="car-side" size={20} color="#64748b" /><Text style={styles.infoLabel}>Plaque</Text><Text style={[styles.infoValue, { color: '#22c55e' }]}>{plate}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.toggleRow}><View style={styles.toggleLeft}><MaterialCommunityIcons name="bell" size={20} color="#64748b" /><Text style={styles.toggleLabel}>Notifications de course</Text></View><Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#2a3a4a', true: '#22c55e' }} thumbColor="#fff" /></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          {['Permis de conduire', 'Carte grise', 'Assurance', 'Piece d\'identite'].map((doc, i) => (
            <Pressable key={doc} style={styles.docRow}>
              <MaterialCommunityIcons name={i < 2 ? 'check-circle' : 'file-document-outline'} size={20} color={i < 2 ? '#22c55e' : '#64748b'} />
              <Text style={styles.docLabel}>{doc}</Text>
              <Text style={[styles.docStatus, { color: i < 2 ? '#22c55e' : '#eab308' }]}>{i < 2 ? 'Verifier' : 'En attente'}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <Pressable style={styles.menuItem} onPress={() => onNavigate?.('taxi_settings')}><MaterialCommunityIcons name="cog" size={22} color="#64748b" /><Text style={styles.menuLabel}>Parametres</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" /></Pressable>
          <Pressable style={styles.menuItem} onPress={() => Alert.alert('Aide', 'Contactez le support Yabisso')}><MaterialCommunityIcons name="help-circle" size={22} color="#64748b" /><Text style={styles.menuLabel}>Aide et support</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" /></Pressable>
          <Pressable style={styles.menuItem} onPress={() => Alert.alert('Deconnexion', 'Voulez-vous vous deconnecter ?', [{ text: 'Non' }, { text: 'Oui', onPress: () => onNavigate?.('taxi_home') }])}><MaterialCommunityIcons name="logout" size={22} color="#ef4444" /><Text style={[styles.menuLabel, { color: '#ef4444' }]}>Se deconnecter</Text></Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  profileCard: { backgroundColor: '#1c2630', borderRadius: 20, padding: 24, alignItems: 'center', marginTop: 8, marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  profileName: { color: '#F8FAFC', fontSize: 22, fontWeight: '700' },
  profilePhone: { color: '#64748b', fontSize: 14, marginTop: 4 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(234,179,8,0.15)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, marginTop: 8 },
  ratingBadgeText: { color: '#eab308', fontSize: 14, fontWeight: '700' },
  profileStats: { flexDirection: 'row', alignItems: 'center', marginTop: 16, width: '100%' },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatValue: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  profileStatLabel: { color: '#64748b', fontSize: 12, marginTop: 2 },
  profileStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.06)' },
  section: { marginTop: 24 },
  sectionTitle: { color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 6, gap: 10 },
  infoLabel: { flex: 1, color: '#64748b', fontSize: 14 },
  infoValue: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1c2630', borderRadius: 12, padding: 14 },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel: { color: '#F8FAFC', fontSize: 14 },
  docRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 6, gap: 10 },
  docLabel: { flex: 1, color: '#F8FAFC', fontSize: 14 },
  docStatus: { fontSize: 12, fontWeight: '600' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 6, gap: 12 },
  menuLabel: { flex: 1, color: '#F8FAFC', fontSize: 14 },
});