import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Linking, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const emergencyContacts = [
  { label: 'Police Nationale', number: '111', icon: 'shield', color: '#3b82f6' },
  { label: 'Gendarmerie', number: '116', icon: 'shield-badge', color: '#22c55e' },
  { label: 'Pompiers', number: '118', icon: 'fire', color: '#ef4444' },
  { label: 'SAMU', number: '143', icon: 'hospital', color: '#ef4444' },
];

export default function TaxiEmergencyScreen({ onBack, onNavigate }) {
  const handleCall = (number) => Linking.openURL(`tel:${number}`);
  const handleShareLocation = () => Alert.alert('Position partagee', 'Votre position a ete partagee avec vos contacts d\'urgence.');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Urgence</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.alertBanner}>
        <MaterialCommunityIcons name="alert-octagon" size={32} color="#ef4444" />
        <Text style={styles.alertTitle}>En cas d'urgence</Text>
        <Text style={styles.alertText}>Appelez immediatement les services de secours ou partagez votre position.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services de secours</Text>
        {emergencyContacts.map(item => (
          <Pressable key={item.label} style={styles.emergencyRow} onPress={() => handleCall(item.number)}>
            <View style={[styles.emergencyIcon, { backgroundColor: item.color + '20' }]}>
              <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyLabel}>{item.label}</Text>
              <Text style={styles.emergencyNumber}>{item.number}</Text>
            </View>
            <MaterialCommunityIcons name="phone" size={24} color="#ef4444" />
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <Pressable style={styles.actionCard} onPress={handleShareLocation}>
          <MaterialCommunityIcons name="share-location" size={28} color="#137fec" />
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Partager ma position</Text>
            <Text style={styles.actionDesc}>Envoyer ma position a un proche</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#64748b" />
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => Linking.openURL('tel:+2250700000000')}>
          <MaterialCommunityIcons name="car-emergency" size={28} color="#f97316" />
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Assistance Yabisso</Text>
            <Text style={styles.actionDesc}>+225 07 00 00 00 00</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#64748b" />
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
  alertBanner: { marginHorizontal: 20, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', marginBottom: 24 },
  alertTitle: { color: '#ef4444', fontSize: 20, fontWeight: '700', marginTop: 12 },
  alertText: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  section: { paddingHorizontal: 20, marginTop: 16 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  emergencyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 14, padding: 16, marginBottom: 10, gap: 14 },
  emergencyIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emergencyInfo: { flex: 1 },
  emergencyLabel: { color: '#F8FAFC', fontSize: 15, fontWeight: '600' },
  emergencyNumber: { color: '#ef4444', fontSize: 18, fontWeight: '700', marginTop: 2 },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 14, padding: 16, marginBottom: 10, gap: 14 },
  actionInfo: { flex: 1 },
  actionLabel: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  actionDesc: { color: '#64748b', fontSize: 12, marginTop: 2 },
});