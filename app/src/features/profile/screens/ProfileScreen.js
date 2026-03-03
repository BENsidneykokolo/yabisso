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

const quickStats = [
  { label: 'Points', value: '1 240' },
  { label: 'Commandes', value: '18' },
  { label: 'Prestations', value: '5' },
];

const settings = [
  { key: 'account', label: 'Compte', icon: 'account-circle' },
  { key: 'security', label: 'Securite', icon: 'shield-lock' },
  { key: 'notifications', label: 'Notifications', icon: 'bell' },
  { key: 'language', label: 'Langue', icon: 'translate' },
  { key: 'help', label: 'Aide et support', icon: 'help-circle' },
  { key: 'logout', label: 'Se deconnecter', icon: 'logout' },
];

export default function ProfileScreen({
  onBack,
  onOpenAccount,
  onOpenSecurity,
  onOpenNotifications,
  onOpenLanguage,
  onOpenSupport,
  onOpenLogout,
  onOpenWallet,
}) {
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
            <Text style={styles.profileName}>Kwesi</Text>
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
          <Pressable style={styles.editButton}>
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

        {settings.map((item) => (
          <Pressable
            key={item.key}
            style={styles.settingRow}
            onPress={() => {
              if (item.key === 'account') {
                onOpenAccount?.();
              }
              if (item.key === 'security') {
                onOpenSecurity?.();
              }
              if (item.key === 'notifications') {
                onOpenNotifications?.();
              }
              if (item.key === 'language') {
                onOpenLanguage?.();
              }
              if (item.key === 'help') {
                onOpenSupport?.();
              }
              if (item.key === 'logout') {
                onOpenLogout?.();
              }
            }}
          >
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name={item.icon} size={18} color="#0E151B" />
            </View>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>
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
});
