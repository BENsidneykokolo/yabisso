import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#0E151B',
  surface: '#1a2332',
  card: '#243447',
  primary: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#334155',
};

const ODDS_FORMATS = [
  { id: 'decimal', label: 'Decimal', example: '1.85' },
  { id: 'fractional', label: 'Fractional', example: '17/20' },
  { id: 'american', label: 'American', example: '+120' },
];

const SETTINGS_ITEMS = [
  { id: 'deposit', icon: 'arrow-down-circle-outline', label: 'Depot de Fonds', description: 'Ajouter de l\'argent sur votre compte', color: COLORS.primary },
  { id: 'withdrawal', icon: 'arrow-up-circle-outline', label: 'Retrait', description: 'Retirer vos gains', color: COLORS.orange },
  { id: 'history', icon: 'clock-outline', label: 'Historique Transactions', description: 'Voir vos depot et retraits', color: COLORS.yellow },
];

const BettingSettingsScreen = ({ navigation }) => {
  const [oddsFormat, setOddsFormat] = useState('decimal');
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selfExclusion, setSelfExclusion] = useState(false);

  const renderSettingItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={() => {}}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: `${item.color}20` }]}>
        <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{item.label}</Text>
        <Text style={styles.settingDescription}>{item.description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parametres</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          {SETTINGS_ITEMS.map(renderSettingItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Format des Cotes</Text>
          <View style={styles.oddsFormatContainer}>
            {ODDS_FORMATS.map((format) => (
              <TouchableOpacity
                key={format.id}
                style={[styles.oddsFormatButton, oddsFormat === format.id && styles.oddsFormatButtonActive]}
                onPress={() => setOddsFormat(format.id)}
              >
                <Text style={[styles.oddsFormatLabel, oddsFormat === format.id && styles.oddsFormatLabelActive]}>
                  {format.label}
                </Text>
                <Text style={[styles.oddsFormatExample, oddsFormat === format.id && styles.oddsFormatExampleActive]}>
                  {format.example}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.toggleLabel}>Notifications Push</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.card, true: `${COLORS.primary}80` }}
              thumbColor={notifications ? COLORS.primary : COLORS.textSecondary}
            />
          </View>

          <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
              <MaterialCommunityIcons name="volume-high-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.toggleLabel}>Sons des Cotes</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: COLORS.card, true: `${COLORS.primary}80` }}
              thumbColor={soundEnabled ? COLORS.primary : COLORS.textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outils d\'Auto-Control</Text>
          
          <TouchableOpacity style={styles.selfExclusionItem}>
            <View style={styles.selfExclusionInfo}>
              <MaterialCommunityIcons name="shield-lock-outline" size={22} color={COLORS.orange} />
              <View>
                <Text style={styles.selfExclusionTitle}>Auto-Exclusion</Text>
                <Text style={styles.selfExclusionDescription}>
                  Bloquez votre acces pour une periode determinee
                </Text>
              </View>
            </View>
            <Switch
              value={selfExclusion}
              onValueChange={setSelfExclusion}
              trackColor={{ false: COLORS.card, true: `${COLORS.orange}80` }}
              thumbColor={selfExclusion ? COLORS.orange : COLORS.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.limitSection}>
            <Text style={styles.limitTitle}>Limites de Mise</Text>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Limite quotidienne</Text>
              <TouchableOpacity style={styles.limitButton}>
                <Text style={styles.limitValue}>500 €</Text>
                <MaterialCommunityIcons name="pencil-outline" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Limite hebdomadaire</Text>
              <TouchableOpacity style={styles.limitButton}>
                <Text style={styles.limitValue}>2,000 €</Text>
                <MaterialCommunityIcons name="pencil-outline" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Limite mensuelle</Text>
              <TouchableOpacity style={styles.limitButton}>
                <Text style={styles.limitValue}>5,000 €</Text>
                <MaterialCommunityIcons name="pencil-outline" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              Yabisso est licencie et reglemente. Jouez de maniere responsable.
            </Text>
          </View>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.helpButtonText}>Centre d\'Aide</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  backButton: { padding: 4 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  settingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 10 },
  settingIconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingInfo: { flex: 1 },
  settingLabel: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  settingDescription: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  oddsFormatContainer: { flexDirection: 'row', gap: 10 },
  oddsFormatButton: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  oddsFormatButtonActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(34,197,94,0.1)' },
  oddsFormatLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  oddsFormatLabelActive: { color: COLORS.primary, fontWeight: '600' },
  oddsFormatExample: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },
  oddsFormatExampleActive: { color: COLORS.text, fontWeight: '500' },
  toggleItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 10 },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { color: COLORS.text, fontSize: 15 },
  selfExclusionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 10 },
  selfExclusionInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  selfExclusionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  selfExclusionDescription: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2, maxWidth: 220 },
  limitSection: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginTop: 10 },
  limitTitle: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 12 },
  limitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  limitLabel: { color: COLORS.textSecondary, fontSize: 13 },
  limitButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  limitValue: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  infoSection: { backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 14, padding: 16, marginTop: 24 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoText: { color: COLORS.textSecondary, fontSize: 13, flex: 1, lineHeight: 18 },
  helpButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,0.1)', paddingVertical: 12, borderRadius: 10, marginTop: 12 },
  helpButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  versionSection: { alignItems: 'center', marginTop: 30, marginBottom: 20 },
  versionText: { color: COLORS.textSecondary, fontSize: 12 },
});

export default BettingSettingsScreen;