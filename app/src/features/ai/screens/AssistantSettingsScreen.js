import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const settingsItems = [
  { icon: 'brain', label: 'Modèle IA', subtitle: 'GPT-4 Turbo', screen: null },
  { icon: 'volume-high', label: 'Sons', subtitle: 'Notifications et alertes', screen: null },
  { icon: 'microphone', label: 'Reconnaissance vocale', subtitle: 'Français & Anglais', screen: null },
  { icon: 'translate', label: 'Langue', subtitle: 'Français', screen: null },
  { icon: 'shield-check', label: 'Confidentialité', subtitle: 'Données locales uniquement', screen: null },
  { icon: 'history', label: 'Effacer historique', subtitle: 'Supprimer toutes les discussions', screen: null },
  { icon: 'information', label: 'À propos', subtitle: 'Version 1.0.0', screen: null },
];

export default function AssistantSettingsScreen({ onBack, onNavigate }) {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.aiProfile}>
          <View style={styles.aiAvatar}>
            <MaterialCommunityIcons name="robot" size={40} color="#2BEE79" />
          </View>
          <View style={styles.aiInfo}>
            <Text style={styles.aiName}>Yabisso AI</Text>
            <Text style={styles.aiVersion}>Version 1.0.0</Text>
          </View>
          <View style={styles.aiStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>En ligne</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {[
            { label: 'Notifications actives', desc: 'Alertes de nouvelles réponses', state: notificationsEnabled, set: setNotificationsEnabled },
            { label: 'Sons actifs', desc: 'Sons de notification', state: soundEnabled, set: setSoundEnabled },
          ].map((item, i) => (
            <View key={i} style={styles.toggleCard}>
              <View style={styles.toggleInfo}>
                <MaterialCommunityIcons name="bell" size={22} color="#2BEE79" />
                <View>
                  <Text style={styles.toggleLabel}>{item.label}</Text>
                  <Text style={styles.toggleDesc}>{item.desc}</Text>
                </View>
              </View>
              <Switch value={item.state} onValueChange={item.set} trackColor={{ false: '#2a3a4a', true: '#137fec' }} thumbColor="#fff" />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fonctionnalités</Text>
          {settingsItems.map((item, i) => (
            <Pressable key={i} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <MaterialCommunityIcons name={item.icon} size={22} color="#137fec" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Langue de l'assistant</Text>
          <View style={styles.languageOptions}>
            {['Français', 'English', 'العربية'].map((lang) => (
              <Pressable key={lang} style={styles.langChip}>
                <Text style={styles.langText}>{lang}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  aiProfile: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: '#1c2630', borderRadius: 16, padding: 16, marginBottom: 16 },
  aiAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(43,238,121,0.1)', alignItems: 'center', justifyContent: 'center' },
  aiInfo: { flex: 1, marginLeft: 14 },
  aiName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  aiVersion: { fontSize: 13, color: '#64748b', marginTop: 2 },
  aiStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2BEE79' },
  statusText: { fontSize: 12, color: '#2BEE79' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  toggleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 10 },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
  toggleDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 10 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(19,127,236,0.1)', alignItems: 'center', justifyContent: 'center' },
  menuContent: { flex: 1, marginLeft: 12 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
  menuSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  languageOptions: { flexDirection: 'row', gap: 8 },
  langChip: { flex: 1, backgroundColor: '#1c2630', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  langText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  bottomSpacer: { height: 40 },
});