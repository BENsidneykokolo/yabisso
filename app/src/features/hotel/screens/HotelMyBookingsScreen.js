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

const bookings = [
  {
    id: 1,
    bookingId: 'YAB-HOTEL-8829',
    hotelName: 'Eko Hotels & Suites',
    roomName: 'Superior Room',
    checkIn: '2026-04-01',
    checkOut: '2026-04-02',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    total: 49500,
  },
  {
    id: 2,
    bookingId: 'YAB-HOTEL-7754',
    hotelName: 'Transcorp Hilton',
    roomName: 'Deluxe Room',
    checkIn: '2026-03-15',
    checkOut: '2026-03-18',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    total: 165000,
  },
  {
    id: 3,
    bookingId: 'YAB-HOTEL-6691',
    hotelName: 'Lagos Continental Hotel',
    roomName: 'Executive Suite',
    checkIn: '2026-02-20',
    checkOut: '2026-02-22',
    status: 'cancelled',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    total: 187000,
  },
];

export default function HotelMyBookingsScreen({ onBack, onNavigate }) {
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [activeTab, setActiveTab] = useState('Réservations');

  const tabs = [
    { id: 'upcoming', label: 'À venir', count: 1 },
    { id: 'completed', label: 'Terminées', count: 1 },
    { id: 'cancelled', label: 'Annulées', count: 1 },
  ];

  const filteredBookings = bookings.filter(b => b.status === selectedTab);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#22c55e';
      case 'completed': return '#137fec';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'upcoming': return 'À venir';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
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
          <Text style={styles.headerTitle}>Mes réservations</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsSection}>
          <View style={styles.tabs}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                style={[styles.tab, selectedTab === tab.id && styles.tabActive]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.tabBadge, selectedTab === tab.id && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, selectedTab === tab.id && styles.tabBadgeTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bookings List */}
        <View style={styles.bookingsSection}>
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-blank" size={64} color="#233648" />
              <Text style={styles.emptyTitle}>Aucune réservation {selectedTab}</Text>
              <Text style={styles.emptyText}>
                {selectedTab === 'upcoming' 
                  ? "Vous n'avez aucune réservation à venir"
                  : selectedTab === 'completed'
                  ? "Vous n'avez effectué aucun séjour"
                  : "Vous n'avez aucune réservation annulée"
                }
              </Text>
              {selectedTab === 'upcoming' && (
                <Pressable 
                  style={styles.bookNowBtn}
                  onPress={() => onNavigate?.('hotel_home')}
                >
                  <Text style={styles.bookNowText}>Réserver</Text>
                </Pressable>
              )}
            </View>
          ) : (
            filteredBookings.map((booking) => (
              <Pressable key={booking.id} style={styles.bookingCard}>
                <Image source={{ uri: booking.image }} style={styles.bookingImage} />
                <View style={styles.bookingOverlay} />
                
                <View style={styles.bookingHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(booking.status)}</Text>
                  </View>
                  <Pressable style={styles.menuBtn}>
                    <MaterialCommunityIcons name="dots-vertical" size={20} color="#fff" />
                  </Pressable>
                </View>

                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingId}>{booking.bookingId}</Text>
                  <Text style={styles.hotelName}>{booking.hotelName}</Text>
                  <Text style={styles.roomName}>{booking.roomName}</Text>
                  
                  <View style={styles.dateRow}>
                    <View style={styles.dateItem}>
                      <MaterialCommunityIcons name="calendar-arrow-right" size={16} color="#94a3b8" />
                      <Text style={styles.dateText}>{booking.checkIn}</Text>
                    </View>
                    <MaterialCommunityIcons name="arrow-right" size={14} color="#64748b" />
                    <View style={styles.dateItem}>
                      <MaterialCommunityIcons name="calendar-check" size={16} color="#94a3b8" />
                      <Text style={styles.dateText}>{booking.checkOut}</Text>
                    </View>
                  </View>

                  <View style={styles.bookingFooter}>
                    <Text style={styles.bookingTotal}>₦{booking.total.toLocaleString()}</Text>
                    {booking.status === 'upcoming' && (
                      <Pressable style={styles.viewBtn}>
                        <Text style={styles.viewBtnText}>Voir détails</Text>
                      </Pressable>
                    )}
                    {booking.status === 'completed' && (
                      <Pressable style={styles.viewBtn}>
                        <Text style={styles.viewBtnText}>Réserver à nouveau</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Pressable>
            ))
          )}
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
                    // Already here
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
  tabsSection: {
    paddingHorizontal: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#137fec',
  },
  tabText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: '#233648',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tabBadgeTextActive: {
    color: '#fff',
  },
  bookingsSection: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  bookNowBtn: {
    backgroundColor: '#137fec',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
  },
  bookNowText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bookingCard: {
    backgroundColor: '#1c2630',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bookingImage: {
    width: '100%',
    height: 140,
  },
  bookingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bookingHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingInfo: {
    padding: 16,
  },
  bookingId: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  hotelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  roomName: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#233648',
  },
  bookingTotal: {
    color: '#137fec',
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewBtn: {
    backgroundColor: '#233648',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
