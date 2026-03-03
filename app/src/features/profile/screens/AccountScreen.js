import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Compte</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations personnelles</Text>
          <Text style={styles.cardText}>Nom, telephone, email, pays.</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nom complet</Text>
            <Text style={styles.fieldValue}>Kwesi Mensah</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Telephone</Text>
            <Text style={styles.fieldValue}>+243 000 000 000</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>kwesi@mail.com</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Identite</Text>
          <Text style={styles.cardText}>Verification en cours.</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badgePending}>
              <Text style={styles.badgeText}>En attente</Text>
            </View>
            <View style={styles.badgeAction}>
              <Text style={styles.badgeActionText}>Completer KYC</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  scrollContent: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 40 },
  card: {
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#151D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  cardText: { color: '#94A3B8', fontSize: 12, marginTop: 6 },
  fieldRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  fieldLabel: { color: '#94A3B8', fontSize: 11 },
  fieldValue: { color: '#F8FAFC', fontSize: 13, marginTop: 4, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  badgePending: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: '#F97316', fontSize: 10, fontWeight: '700' },
  badgeAction: {
    backgroundColor: '#1C2733',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeActionText: { color: '#E6EDF3', fontSize: 10, fontWeight: '600' },
});
