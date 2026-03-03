import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SecurityScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Securite</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>PIN & biometrie</Text>
          <Text style={styles.cardText}>Gestion du PIN et activation biometrie.</Text>
          <View style={styles.actionRow}>
            <View style={styles.actionChip}>
              <Text style={styles.actionChipText}>PIN actif</Text>
            </View>
            <View style={styles.actionChipDark}>
              <Text style={styles.actionChipTextMuted}>Empreinte inactive</Text>
            </View>
          </View>
          <View style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>Changer PIN</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appareils autorises</Text>
          <Text style={styles.cardText}>Voir et gerer les appareils connectes.</Text>
          <View style={styles.deviceRow}>
            <Text style={styles.deviceLabel}>Samsung A52</Text>
            <Text style={styles.deviceMeta}>Actif</Text>
          </View>
          <View style={styles.deviceRow}>
            <Text style={styles.deviceLabel}>Tecno Camon</Text>
            <Text style={styles.deviceMeta}>Derniere connexion hier</Text>
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
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionChip: {
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  actionChipDark: {
    backgroundColor: '#1C2733',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  actionChipText: { color: '#2BEE79', fontSize: 10, fontWeight: '700' },
  actionChipTextMuted: { color: '#94A3B8', fontSize: 10, fontWeight: '600' },
  primaryAction: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  primaryActionText: { color: '#0E151B', fontSize: 12, fontWeight: '700' },
  deviceRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  deviceLabel: { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },
  deviceMeta: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
});
