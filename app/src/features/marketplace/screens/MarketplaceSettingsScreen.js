import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const settingsItems = [
  { id: 1, label: 'Notifications', icon: 'bell-outline', type: 'switch', value: true },
  { id: 2, label: 'Emails promotionnels', icon: 'email-outline', type: 'switch', value: false },
  { id: 3, label: 'Langue', icon: 'translate', type: 'navigate', value: 'Français' },
  { id: 4, label: 'Mode sombre', icon: 'weather-night', type: 'switch', value: true },
];

const aboutItems = [
  { id: 1, label: 'CGU', icon: 'file-document-outline' },
  { id: 2, label: 'Politique de confidentialité', icon: 'shield-check-outline' },
  { id: 3, label: 'À propos', icon: 'information-outline' },
];

export default function MarketplaceSettingsScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.section}>
          {settingsItems.map((item) => (
            <View key={item.id} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name={item.icon} size={22} color="#64748b" />
                <Text style={styles.settingLabel}>{item.label}</Text>
              </View>
              {item.type === 'switch' ? (
                <Switch
                  value={item.value}
                  trackColor={{ false: '#324d67', true: '#22c55e' }}
                  thumbColor="#fff"
                />
              ) : (
                <View style={styles.settingValue}>
                  <Text style={styles.settingValueText}>{item.value}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
                </View>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>À propos</Text>
        <View style={styles.section}>
          {aboutItems.map((item) => (
            <Pressable key={item.id} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name={item.icon} size={22} color="#64748b" />
                <Text style={styles.settingLabel}>{item.label}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
            </Pressable>
          ))}
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1c2630',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#1c2630',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#233648',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#e2e8f0',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 14,
    color: '#64748b',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: '#64748b',
    marginTop: 30,
  },
  bottomSpacer: {
    height: 40,
  },
});
