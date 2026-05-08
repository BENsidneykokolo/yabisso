import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../lib/ThemeContext';

const items = [
  { key: 'account', label: 'Compte', icon: 'account-circle' },
  { key: 'security', label: 'Securite', icon: 'shield-lock' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'language', label: 'Langue', icon: 'translate' },
  { key: 'support', label: 'Support', icon: 'lifebuoy' },
];

export default function HomeSettingsScreen({ onBack }) {
  const { isDark, theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Parametres</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.secondary, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Preferences</Text>
          <View style={[styles.row, { borderTopColor: theme.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: theme.surface }]}>
              <MaterialCommunityIcons name="theme-light-dark" size={18} color={theme.text} />
            </View>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Mode sombre</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#3B82F6' }}
              thumbColor={isDark ? '#F8FAFC' : '#F4F4F5'}
            />
          </View>
          {items.map((item) => (
            <View key={item.key} style={[styles.row, { borderTopColor: theme.border }]}>
              <View style={[styles.rowIcon, { backgroundColor: theme.surface }]}>
                <MaterialCommunityIcons name={item.icon} size={18} color={theme.text} />
              </View>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </View>
          ))}
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
    marginTop: 24,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#151D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#1C2733',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rowLabel: { flex: 1, color: '#F8FAFC', fontSize: 13, fontWeight: '600' },
});
