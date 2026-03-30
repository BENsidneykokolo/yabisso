import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const quickStats = [
  { label: 'Points', value: '1 240' },
  { label: 'Commandes', value: '18' },
  { label: 'Prestations', value: '5' },
];

export default function ProfileScreen({
  onBack,
  onOpenHome,
  onOpenAccount,
  onOpenSecurity,
  onOpenNotifications,
  onOpenLanguage,
  onOpenSupport,
  onOpenLogout,
  onOpenWallet,
  onOpenEditProfile,
  onOpenBlockedUser,
  onNavigate,
}) {
  const [activeTab, setActiveTab] = useState('Compte');

  const navItems = [
    { label: 'Accueil', icon: 'home', key: 'home' },
    { label: 'Compte', icon: 'account-circle', key: 'account' },
    { label: 'Securite', icon: 'shield-lock', key: 'security' },
    { label: 'Aide', icon: 'help-circle', key: 'help' },
    { label: 'Notifs', icon: 'bell', key: 'notifications' },
  ];
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
            <View style={styles.avatarDot} />
          </View>
          <View style={styles.profileInfo}>
            <Pressable onPress={onOpenAccount}>
              <Text style={styles.profileName}>Kwesi</Text>
            </Pressable>
            <Text style={styles.profileSubtitle}>Compte verifie</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badgeChip}>
                <Text style={styles.badgeText}>KYC OK</Text>
              </View>
              <View style={styles.badgeChipDark}>
                <Text style={styles.badgeTextMuted}>Offline Ready</Text>
              </View>
            </View>
          </View>
          <Pressable style={styles.editButton} onPress={onOpenEditProfile}>
            <Ionicons name="pencil" size={16} color="#0E151B" />
            <Text style={styles.editButtonText}>Modifier</Text>
          </Pressable>
        </View>

        <View style={styles.quickActionsRow}>
          {[
            { key: 'verification', label: 'Verifier', icon: 'check-decagram' },
            { key: 'wallet', label: 'Portefeuille', icon: 'wallet' },
            { key: 'help', label: 'Support', icon: 'lifebuoy' },
          ].map((item) => (
            <Pressable
              key={item.key}
              style={styles.quickActionCard}
              onPress={() => {
                if (item.key === 'verification') {
                  onOpenAccount?.();
                }
                if (item.key === 'wallet') {
                  onOpenWallet?.();
                }
                if (item.key === 'help') {
                  onOpenSupport?.();
                }
              }}
            >
              <View style={styles.quickActionIcon}>
                <MaterialCommunityIcons name={item.icon} size={18} color="#0E151B" />
              </View>
              <Text style={styles.quickActionLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.statsRow}>
          {quickStats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Parametres</Text>
        </View>

        <Pressable style={styles.settingRow} onPress={onOpenBlockedUser}>
          <View style={[styles.settingIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <MaterialCommunityIcons name="store-alert" size={20} color="#f59e0b" />
          </View>
          <Text style={styles.settingLabel}>Statut Marketplace</Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </Pressable>

        <Pressable style={styles.settingRow} onPress={() => onNavigate('profile_addresses')}>
          <View style={[styles.settingIcon, { backgroundColor: 'rgba(43, 238, 121, 0.2)' }]}>
            <MaterialCommunityIcons name="map-marker-radius" size={20} color="#2BEE79" />
          </View>
          <Text style={styles.settingLabel}>Mes Adresses</Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </Pressable>

        <Pressable style={styles.settingRow} onPress={() => onNavigate('service_management')}>
          <View style={[styles.settingIcon, { backgroundColor: 'rgba(167, 139, 250, 0.2)' }]}>
            <MaterialCommunityIcons name="view-grid-plus-outline" size={20} color="#A78BFA" />
          </View>
          <Text style={styles.settingLabel}>Mes Services</Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </Pressable>

        <Pressable style={styles.settingRow} onPress={() => onNavigate('storage_management')}>
          <View style={[styles.settingIcon, { backgroundColor: 'rgba(96, 165, 250, 0.2)' }]}>
            <MaterialCommunityIcons name="harddisk" size={20} color="#60A5FA" />
          </View>
          <Text style={styles.settingLabel}>Gestion du Stockage</Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </Pressable>

        <Pressable style={styles.settingRow} onPress={onOpenLogout}>
          <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </View>
          <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Se deconnecter</Text>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </Pressable>
      </ScrollView>

      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.navItem,
                  pressed && styles.navItemPressed,
                ]}
                onPress={() => {
                  setActiveTab(item.key);
                  if (item.key === 'home') {
                    onOpenHome?.();
                  }
                  if (item.key === 'account') {
                    onOpenAccount?.();
                  }
                  if (item.key === 'security') {
                    onOpenSecurity?.();
                  }
                  if (item.key === 'notifications') {
                    onOpenNotifications?.();
                  }
                  if (item.key === 'help') {
                    onOpenSupport?.();
                  }
                }}
              >
                <View
                  style={[
                    styles.navIcon,
                    isActive && styles.navIconActive,
                    isActive && styles.navIconCenter,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={isActive ? 20 : 18}
                    color={isActive ? '#0E151B' : '#CBD5F5'}
                  />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
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
  profileCard: {
    marginTop: 24,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E151B',
  },
  avatarDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2BEE79',
    borderWidth: 2,
    borderColor: '#0E151B',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  profileSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badgeChip: {
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.4)',
  },
  badgeChipDark: {
    backgroundColor: '#1C2733',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeText: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextMuted: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2BEE79',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#0E151B',
    fontWeight: '700',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionCard: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#151D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    color: '#B6C2CF',
    fontSize: 11,
  },
  statCard: {
    width: '31%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#151D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  sectionRow: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#151D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#1C2733',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    marginLeft: 12,
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
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
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navItemPressed: {
    transform: [{ scale: 0.96 }],
  },
  navIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    backgroundColor: '#2BEE79',
  },
  navIconCenter: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#2BEE79',
    marginTop: -14,
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  navLabelActive: {
    color: '#2BEE79',
  },
});
