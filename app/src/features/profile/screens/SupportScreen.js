import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const navItems = [
  { label: 'Compte', icon: 'account-circle', key: 'account' },
  { label: 'Securite', icon: 'shield-lock', key: 'security' },
  { label: 'Aide', icon: 'help-circle', key: 'help' },
  { label: 'Notifs', icon: 'bell', key: 'notifications' },
];

export default function SupportScreen({ onBack, onOpenAccount, onOpenSecurity, onOpenNotifications }) {
  const [activeTab, setActiveTab] = useState('help');
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

      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <Pressable
                key={item.key}
                style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
                onPress={() => {
                  setActiveTab(item.key);
                  if (item.key === 'account') onOpenAccount?.();
                  if (item.key === 'security') onOpenSecurity?.();
                  if (item.key === 'notifications') onOpenNotifications?.();
                }}
              >
                <View style={[styles.navIcon, isActive && styles.navIconActive, isActive && styles.navIconCenter]}>
                  <MaterialCommunityIcons name={item.icon} size={isActive ? 20 : 18} color={isActive ? '#0E151B' : '#CBD5F5'} />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
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
  bottomNavWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 36 },
  bottomNav: { backgroundColor: 'rgba(22, 29, 37, 0.98)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: 4 },
  navItem: { alignItems: 'center', flex: 1 },
  navItemPressed: { transform: [{ scale: 0.96 }] },
  navIcon: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.18)', marginBottom: 6, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#2BEE79' },
  navIconCenter: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#2BEE79', marginTop: -14 },
  navLabel: { color: '#6B7280', fontSize: 10 },
  navLabelActive: { color: '#2BEE79' },
});
