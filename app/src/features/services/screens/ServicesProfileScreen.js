import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const menuItems = [
  { icon: 'account', label: 'Modifier le profil', subtitle: 'Nom, photo, coordonnées', screen: 'profile_edit' },
  { icon: 'map-marker', label: 'Mes adresses', subtitle: 'Gérer vos adresses', screen: 'profile_addresses' },
  { icon: 'shield-check', label: 'Sécurité', subtitle: 'PIN, mot de passe, vérification', screen: 'profile_security' },
  { icon: 'bell', label: 'Notifications', subtitle: 'Configurer les alertes', screen: 'services_notifications' },
  { icon: 'help-circle', label: 'Aide et support', subtitle: 'FAQ, contact', screen: null },
  { icon: 'file-document', label: 'Conditions générales', subtitle: 'CGU, mentions légales', screen: null },
  { icon: 'information', label: 'À propos', subtitle: 'Version 1.0.0', screen: null },
];

export default function ServicesProfileScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Profil');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>BD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Ben Diarra</Text>
            <Text style={styles.profileEmail}>ben.diarra@email.com</Text>
            <Text style={styles.profilePhone}>+225 07 00 00 00 00</Text>
          </View>
          <Pressable style={styles.editBtn}>
            <MaterialCommunityIcons name="pencil" size={18} color="#137fec" />
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Réservations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
        </View>

        {/* Notifications Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <MaterialCommunityIcons name="bell" size={22} color="#137fec" />
              <View>
                <Text style={styles.toggleLabel}>Alertes de réservation</Text>
                <Text style={styles.toggleDesc}>Recevoir des rappels avant les RDV</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#2a3a4a', true: '#137fec' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={styles.menuItem}
              onPress={() => item.screen && onNavigate?.(item.screen)}
            >
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

        {/* Logout */}
        <View style={styles.section}>
          <Pressable style={styles.logoutBtn} onPress={() => onNavigate?.('logout')}>
            <MaterialCommunityIcons name="logout" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {[
            { label: 'Accueil', icon: 'home' },
            { label: 'Réservations', icon: 'calendar-check' },
            { label: 'Favoris', icon: 'heart' },
            { label: 'Profil', icon: 'account' },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={styles.navItem}
              onPress={() => {
                setActiveTab(item.label);
                if (item.label === 'Accueil') onNavigate?.('services_home');
                else if (item.label === 'Réservations') onNavigate?.('services_orders');
                else if (item.label === 'Favoris') onNavigate?.('services_favorites');
                else if (item.label === 'Profil') {}
              }}
            >
              <View style={[styles.navIcon, item.label === activeTab && styles.navIconActive]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={item.label === activeTab ? 20 : 16}
                  color={item.label === activeTab ? '#0E151B' : '#CBD5F5'}
                />
              </View>
              <Text style={[styles.navLabel, item.label === activeTab && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  profileCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: '#1c2630', borderRadius: 16, padding: 16, marginBottom: 16 },
  avatarLarge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#137fec', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  profileInfo: { flex: 1, marginLeft: 14 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  profileEmail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  profilePhone: { fontSize: 13, color: '#64748b', marginTop: 2 },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(19, 127, 236, 0.1)', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#1c2630', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  toggleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1c2630', borderRadius: 12, padding: 14 },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
  toggleDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 10 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(19, 127, 236, 0.1)', alignItems: 'center', justifyContent: 'center' },
  menuContent: { flex: 1, marginLeft: 12 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
  menuSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, padding: 16 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  bottomSpacer: { height: 100 },
  bottomNavWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24 },
  bottomNav: { backgroundColor: 'rgba(22, 29, 37, 0.98)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  navItem: { alignItems: 'center', flex: 1 },
  navIcon: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.18)', marginBottom: 6, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#2BEE79' },
  navLabel: { color: '#6B7280', fontSize: 10 },
  navLabelActive: { color: '#2BEE79' },
});