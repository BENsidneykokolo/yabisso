import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const navItems = [
  { label: 'Accueil', icon: 'home', key: 'home' },
  { label: 'Compte', icon: 'account-circle', key: 'account' },
  { label: 'Securite', icon: 'shield-lock', key: 'security' },
  { label: 'Aide', icon: 'help-circle', key: 'help' },
  { label: 'Notifs', icon: 'bell', key: 'notifications' },
];

export default function AccountScreen({ onBack, onOpenHome, onOpenSecurity, onOpenSupport, onOpenLogout, onOpenNotifications }) {
  const [activeTab, setActiveTab] = useState('account');
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
                  if (item.key === 'home') onOpenHome?.();
                  if (item.key === 'security') onOpenSecurity?.();
                  if (item.key === 'help') onOpenSupport?.();
                  if (item.key === 'logout') onOpenLogout?.();
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
