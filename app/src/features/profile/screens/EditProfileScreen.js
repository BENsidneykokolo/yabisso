import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const navItems = [
  { label: 'Accueil', icon: 'home', key: 'home' },
  { label: 'Compte', icon: 'account-circle', key: 'account' },
  { label: 'Securite', icon: 'shield-lock', key: 'security' },
  { label: 'Aide', icon: 'help-circle', key: 'help' },
  { label: 'Notifs', icon: 'bell', key: 'notifications' },
];

export default function EditProfileScreen({ 
  onBack, 
  onOpenHome, 
  onOpenAccount, 
  onOpenSecurity, 
  onOpenSupport, 
  onOpenNotifications,
  onOpenLogout 
}) {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Modifier le profil</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
          <Pressable style={styles.changePhotoButton}>
            <Ionicons name="camera" size={16} color="#0E151B" />
            <Text style={styles.changePhotoText}>Changer photo</Text>
          </Pressable>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom complet</Text>
            <TextInput 
              style={styles.input} 
              value="Kwesi Mensah" 
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telephone</Text>
            <TextInput 
              style={styles.input} 
              value="+243 000 000 000" 
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput 
              style={styles.input} 
              value="kwesi@mail.com" 
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pays</Text>
            <TextInput 
              style={styles.input} 
              value="RDC" 
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ville</Text>
            <TextInput 
              style={styles.input} 
              value="Kinshasa" 
              placeholderTextColor="#6B7280"
            />
          </View>
        </View>

        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </Pressable>
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
                  if (item.key === 'account') onOpenAccount?.();
                  if (item.key === 'security') onOpenSecurity?.();
                  if (item.key === 'notifications') onOpenNotifications?.();
                  if (item.key === 'help') onOpenSupport?.();
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
  avatarSection: { alignItems: 'center', marginTop: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#0E151B' },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#2BEE79',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: { color: '#0E151B', fontWeight: '600', fontSize: 13 },
  formSection: { marginTop: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 8 },
  input: {
    backgroundColor: '#151D26',
    borderRadius: 12,
    padding: 14,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  saveButton: {
    backgroundColor: '#2BEE79',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: { color: '#0E151B', fontWeight: '700', fontSize: 15 },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  bottomNav: {
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 4,
  },
  navItem: { alignItems: 'center', flex: 1 },
  navItemPressed: { transform: [{ scale: 0.96 }] },
  navIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: { backgroundColor: '#2BEE79' },
  navIconCenter: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#2BEE79',
    marginTop: -14,
  },
  navLabel: { color: '#6B7280', fontSize: 10 },
  navLabelActive: { color: '#2BEE79' },
});
