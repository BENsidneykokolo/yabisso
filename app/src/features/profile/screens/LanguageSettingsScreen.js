import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LanguageSettingsScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Langue</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Langue de l'application</Text>
          <Text style={styles.cardText}>Francais (par defaut)</Text>
          <View style={styles.languageList}>
            {[
              { label: 'Francais', active: true },
              { label: 'Lingala', active: false },
              { label: 'Swahili', active: false },
              { label: 'English', active: false },
            ].map((item) => (
              <View
                key={item.label}
                style={[styles.languageRow, item.active && styles.languageRowActive]}
              >
                <Text style={[styles.languageText, item.active && styles.languageTextActive]}>
                  {item.label}
                </Text>
                {item.active && <Text style={styles.languageBadge}>Actif</Text>}
              </View>
            ))}
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
  languageList: { marginTop: 12 },
  languageRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#1C2733',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageRowActive: {
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    borderColor: 'rgba(43, 238, 121, 0.4)',
  },
  languageText: { color: '#E6EDF3', fontSize: 13, fontWeight: '600' },
  languageTextActive: { color: '#2BEE79' },
  languageBadge: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: '700',
  },
});
