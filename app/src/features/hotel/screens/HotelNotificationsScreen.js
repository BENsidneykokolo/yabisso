import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const notifications = [
  {
    id: 1,
    type: 'booking_reminder',
    title: 'Rappel de réservation',
    message: 'Votre séjour à Eko Hotels & Suites commence dans 2 jours',
    time: '2 heures',
    read: false,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    bookingId: 'YAB-HOTEL-8829',
  },
  {
    id: 2,
    type: 'promo',
    title: 'Offre spéciale',
    message: '-20% sur les réservations pour le week-end prochain',
    time: '1 jour',
    read: false,
    image: null,
  },
  {
    id: 3,
    type: 'price_drop',
    title: 'Baisse de prix',
    message: 'Le prix de Transcorp Hilton a baissé de 15%',
    time: '2 jours',
    read: true,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
  },
  {
    id: 4,
    type: 'new_hotel',
    title: 'Nouvel établissement',
    message: 'Un nouvel hôtel de luxe disponible à Lagos',
    time: '3 jours',
    read: true,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
  },
];

export default function HotelNotificationsScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Notifications');
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking_reminder': return 'calendar-check';
      case 'promo': return 'tag';
      case 'price_drop': return 'trending-down';
      case 'new_hotel': return 'home-plus';
      default: return 'bell';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'booking_reminder': return '#22c55e';
      case 'promo': return '#f97316';
      case 'price_drop': return '#ef4444';
      case 'new_hotel': return '#137fec';
      default: return '#64748b';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Pressable style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Tout marquer lu</Text>
          </Pressable>
        </View>

        {/* Stats Badge */}
        <View style={styles.statsSection}>
          <View style={styles.unreadBadge}>
            <MaterialCommunityIcons name="bell" size={16} color="#137fec" />
            <Text style={styles.unreadText}>{unreadCount} non lues</Text>
          </View>
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          {notifications.map((notification) => (
            <Pressable
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.notificationUnread
              ]}
              onPress={() => {
                if (notification.bookingId) {
                  onNavigate?.('hotel_bookings');
                }
              }}
            >
              {/* Icon */}
              <View style={[
                styles.iconContainer,
                { backgroundColor: getTypeColor(notification.type) + '20' }
              ]}>
                <MaterialCommunityIcons
                  name={getTypeIcon(notification.type)}
                  size={22}
                  color={getTypeColor(notification.type)}
                />
              </View>

              {/* Content */}
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={[
                    styles.notificationTitle,
                    !notification.read && styles.titleUnread
                  ]}>
                    {notification.title}
                  </Text>
                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>

              {/* Image Thumbnail */}
              {notification.image && (
                <Image
                  source={{ uri: notification.image }}
                  style={styles.thumbnail}
                />
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.navItem,
                  pressed && styles.navItemPressed,
                ]}
                onPress={() => {
                  setActiveTab(item.label);
                  if (item.label === 'Accueil') {
                    onNavigate?.('hotel_home');
                  } else if (item.label === 'Réservations') {
                    onNavigate?.('hotel_bookings');
                  } else if (item.label === 'Favoris') {
                    onNavigate?.('hotel_favorites');
                  } else if (item.label === 'Profil') {
                    onNavigate?.('hotel_profile');
                  }
                }}
              >
                <View
                  style={[
                    styles.navIcon,
                    isActive && styles.navIconActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={isActive ? 20 : 16}
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

const bottomNavItems = [
  { label: 'Accueil', icon: 'home' },
  { label: 'Réservations', icon: 'calendar-check' },
  { label: 'Favoris', icon: 'heart' },
  { label: 'Profil', icon: 'account' },
];

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
  markAllBtn: {
    padding: 8,
  },
  markAllText: {
    color: '#137fec',
    fontSize: 13,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  unreadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  unreadText: {
    color: '#137fec',
    fontSize: 13,
    fontWeight: '600',
  },
  notificationsList: {
    paddingHorizontal: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: 'flex-start',
    gap: 12,
  },
  notificationUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#137fec',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  titleUnread: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#137fec',
  },
  notificationMessage: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  notificationTime: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 6,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  navLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  navLabelActive: {
    color: '#2BEE79',
  },
});