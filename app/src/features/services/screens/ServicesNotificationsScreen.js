import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const notifications = [
  { id: 1, type: 'booking', title: 'Réservation confirmée', body: 'Votre réservation avec CleanPro Services est confirmée pour le 15 Jan à 09h00.', time: '2h', unread: true },
  { id: 2, type: 'reminder', title: 'Rappel de service', body: 'N\'oubliez pas : visite de PlumbMaster prévue demain à 10h00.', time: '5h', unread: true },
  { id: 3, type: 'promo', title: '-20% sur le nettoyage', body: 'Offre exclusive : nettoyez votre maison à -20% cette semaine !', time: '1j', unread: false },
  { id: 4, type: 'rating', title: 'Noter votre prestataire', body: 'Comment s\'est passée votre séance avec FastFix Electric ?', time: '2j', unread: false },
  { id: 5, type: 'status', title: 'Service terminé', body: 'BeautyExpert a marqué votre séance comme terminée. Laissez un avis !', time: '3j', unread: false },
];

const typeIcons = {
  booking: 'calendar-check',
  reminder: 'bell-ring',
  promo: 'tag-percent',
  rating: 'star',
  status: 'check-circle',
};
const typeColors = {
  booking: '#137fec',
  reminder: '#FBBF24',
  promo: '#2BEE79',
  rating: '#a855f7',
  status: '#64748b',
};

export default function ServicesNotificationsScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Réservations');
  const [items, setItems] = useState(notifications);
  const unreadCount = items.filter(i => i.unread).length;

  const markAllRead = () => {
    setItems(items.map(i => ({ ...i, unread: false })));
  };

  const markRead = (id) => {
    setItems(items.map(i => i.id === id ? { ...i, unread: false } : i));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Pressable style={styles.markReadBtn} onPress={markAllRead}>
              <Text style={styles.markReadText}>Tout lire</Text>
            </Pressable>
          )}
        </View>

        {unreadCount > 0 && (
          <View style={styles.unreadBanner}>
            <MaterialCommunityIcons name="bell-badge" size={20} color="#137fec" />
            <Text style={styles.unreadText}>{unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}</Text>
          </View>
        )}

        <View style={styles.notificationsList}>
          {items.map((notif) => (
            <Pressable
              key={notif.id}
              style={[styles.notifCard, notif.unread && styles.notifCardUnread]}
              onPress={() => markRead(notif.id)}
            >
              <View style={[styles.notifIcon, { backgroundColor: `${typeColors[notif.type]}22` }]}>
                <MaterialCommunityIcons name={typeIcons[notif.type]} size={22} color={typeColors[notif.type]} />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  {notif.unread && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
            </Pressable>
          ))}
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
                else if (item.label === 'Profil') onNavigate?.('services_profile');
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
  markReadBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  markReadText: { color: '#137fec', fontSize: 14, fontWeight: '600' },
  unreadBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, backgroundColor: 'rgba(19, 127, 236, 0.1)', borderRadius: 8, padding: 12, marginBottom: 16 },
  unreadText: { fontSize: 14, color: '#137fec' },
  notificationsList: { paddingHorizontal: 16 },
  notifCard: { flexDirection: 'row', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 10, alignItems: 'flex-start' },
  notifCardUnread: { borderLeftWidth: 3, borderLeftColor: '#137fec' },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1, marginLeft: 12 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#137fec' },
  notifBody: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  notifTime: { fontSize: 12, color: '#64748b', marginTop: 6 },
  bottomSpacer: { height: 100 },
  bottomNavWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24 },
  bottomNav: { backgroundColor: 'rgba(22, 29, 37, 0.98)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  navItem: { alignItems: 'center', flex: 1 },
  navIcon: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.18)', marginBottom: 6, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#2BEE79' },
  navLabel: { color: '#6B7280', fontSize: 10 },
  navLabelActive: { color: '#2BEE79' },
});