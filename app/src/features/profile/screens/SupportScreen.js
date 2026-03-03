import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SupportScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Aide et support</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Centre d'aide</Text>
          <Text style={styles.cardText}>Articles et guides d'utilisation.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contacter un agent</Text>
          <Text style={styles.cardText}>Chat ou appel selon disponibilite.</Text>
        </View>

        <View style={styles.quickRow}>
          <View style={styles.quickCard}>
            <Text style={styles.quickTitle}>Chat live</Text>
            <Text style={styles.quickText}>Support en direct</Text>
          </View>
          <View style={styles.quickCard}>
            <Text style={styles.quickTitle}>WhatsApp</Text>
            <Text style={styles.quickText}>Message rapide</Text>
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
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#1C2733',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '700' },
  quickText: { color: '#94A3B8', fontSize: 11, marginTop: 6 },
});
