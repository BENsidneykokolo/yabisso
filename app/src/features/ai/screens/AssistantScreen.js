import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const quickChips = [
  'Suivi commande',
  'Trouver un service',
  'Wallet & solde',
  'Recommandations',
];

const suggestions = [
  {
    title: 'Besoin d’un service rapide ?'
    , subtitle: 'Je peux proposer des prestataires proches.'
  },
  {
    title: 'Commander sans internet'
    , subtitle: 'Activer le mode SMS et continuer.'
  },
  {
    title: 'Gerer votre portefeuille'
    , subtitle: 'Recharge, transferts et historique.'
  },
];

export default function AssistantScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Assistant IA</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="robot" size={14} color="#0E151B" />
            <Text style={styles.heroBadgeText}>YABISSO AI</Text>
          </View>
          <Text style={styles.heroTitle}>Comment puis-je vous aider ?</Text>
          <Text style={styles.heroSubtitle}>
            Recherchez un service, suivez vos commandes ou gerez votre wallet.
          </Text>
          <View style={styles.heroActions}>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Nouveau message</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Mode hors ligne</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
        </View>

        <View style={styles.chipsRow}>
          {quickChips.map((chip) => (
            <Pressable key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
          <Text style={styles.sectionLink}>Tout voir</Text>
        </View>

        {suggestions.map((item) => (
          <View key={item.title} style={styles.suggestionCard}>
            <View style={styles.suggestionIcon}>
              <MaterialCommunityIcons name="sparkles" size={18} color="#0E151B" />
            </View>
            <View style={styles.suggestionInfo}>
              <Text style={styles.suggestionTitle}>{item.title}</Text>
              <Text style={styles.suggestionSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
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
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  heroCard: {
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2BEE79',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: '#0E151B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  heroSubtitle: {
    color: '#B6C2CF',
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2BEE79',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0E151B',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
  },
  secondaryButtonText: {
    color: '#E6EDF3',
    fontWeight: '600',
    fontSize: 12,
  },
  sectionRow: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLink: {
    color: '#1F8EFA',
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chipText: {
    color: '#B6C2CF',
    fontSize: 12,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionSubtitle: {
    color: '#7C8A9A',
    fontSize: 11,
    marginTop: 4,
  },
});
