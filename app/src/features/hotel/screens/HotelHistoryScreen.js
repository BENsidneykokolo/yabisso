import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const historyItems = [
  {
    id: 1,
    type: 'booking',
    bookingId: 'YAB-HOTEL-8829',
    hotelName: 'Eko Hotels & Suites',
    roomName: 'Superior Room',
    checkIn: '01/04/2026',
    checkOut: '02/04/2026',
    total: 49500,
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    rated: false,
  },
  {
    id: 2,
    type: 'booking',
    bookingId: 'YAB-HOTEL-7754',
    hotelName: 'Transcorp Hilton',
    roomName: 'Deluxe Room',
    checkIn: '15/03/2026',
    checkOut: '18/03/2026',
    total: 165000,
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    rated: true,
  },
  {
    id: 3,
    type: 'booking',
    bookingId: 'YAB-HOTEL-6691',
    hotelName: 'Lagos Continental Hotel',
    roomName: 'Executive Suite',
    checkIn: '20/02/2026',
    checkOut: '22/02/2026',
    total: 187000,
    status: 'cancelled',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    rated: false,
  },
];

export default function HotelHistoryScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Historique');
  const [items, setItems] = useState(historyItems);

  const handleRebook = (item) => {
    onNavigate?.('hotel_details', { hotel: { id: item.id, name: item.hotelName, image: item.image } });
  };

  const handleViewDetails = (item) => {
    if (item.status === 'completed') {
      onNavigate?.('hotel_reservation', { bookingId: item.bookingId });
    }
  };

  const handleRate = (item) => {
    Alert.alert(
      'Laisser un avis',
      `Noter ${item.hotelName} ?`,
      [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Noter maintenant', onPress: () => {
          setItems(prev => prev.map(i => i.id === item.id ? { ...i, rated: true } : i));
          Alert.alert('Merci !', 'Merci pour votre avis');
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Historique</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{items.filter(i => i.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Séjours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {items.filter(i => i.status === 'completed' && i.rated).length}/{items.filter(i => i.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Avis laissés</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {items.filter(i => i.status === 'cancelled').length}
            </Text>
            <Text style={styles.statLabel}>Annulés</Text>
          </View>
        </View>

        {/* History List */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Historique des réservations</Text>
          
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="history" size={64} color="#233648" />
              <Text style={styles.emptyTitle}>Aucun historique</Text>
              <Text style={styles.emptyText}>Vos réservations passées apparaîtront ici</Text>
            </View>
          ) : (
            items.map((item) => (
              <Pressable key={item.id} style={styles.historyCard}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardOverlay} />
                
                {/* Status Badge */}
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'completed' ? '#22c55e' : '#ef4444' }
                  ]}>
                    <Text style={styles.statusText}>
                      {item.status === 'completed' ? 'Terminé' : 'Annulé'}
                    </Text>
                  </View>
                </View>

                {/* Card Info */}
                <View style={styles.cardInfo}>
                  <Text style={styles.bookingId}>{item.bookingId}</Text>
                  <Text style={styles.hotelName}>{item.hotelName}</Text>
                  <Text style={styles.roomName}>{item.roomName}</Text>
                  
                  <View style={styles.dateRow}>
                    <View style={styles.dateItem}>
                      <MaterialCommunityIcons name="calendar-arrow-right" size={14} color="#94a3b8" />
                      <Text style={styles.dateText}>{item.checkIn}</Text>
                    </View>
                    <MaterialCommunityIcons name="arrow-right" size={12} color="#64748b" />
                    <View style={styles.dateItem}>
                      <MaterialCommunityIcons name="calendar-check" size={14} color="#94a3b8" />
                      <Text style={styles.dateText}>{item.checkOut}</Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.totalAmount}>{item.total.toLocaleString()} FCFA</Text>
                    
                    <View style={styles.actions}>
                      {item.status === 'completed' && !item.rated && (
                        <Pressable style={styles.rateBtn} onPress={() => handleRate(item)}>
                          <MaterialCommunityIcons name="star-outline" size={18} color="#FBBF24" />
                          <Text style={styles.rateBtnText}>Noter</Text>
                        </Pressable>
                      )}
                      {item.status === 'completed' && item.rated && (
                        <View style={styles.ratedBadge}>
                          <MaterialCommunityIcons name="star" size={16} color="#FBBF24" />
                          <Text style={styles.ratedText}>Noté</Text>
                        </View>
                      )}
                      <Pressable
                        style={styles.rebookBtn}
                        onPress={() => handleRebook(item)}
                      >
                        <Text style={styles.rebookBtnText}>Réserver à nouveau</Text>
                      </Pressable>
                    </View>
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
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statNumber: {
    color: '#2BEE79',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  historySection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
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
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: '#1c2630',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardImage: {
    width: '100%',
    height: 130,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  cardInfo: {
    padding: 14,
  },
  bookingId: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  hotelName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 2,
  },
  roomName: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#233648',
  },
  totalAmount: {
    color: '#137fec',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#233648',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  rateBtnText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '600',
  },
  ratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratedText: {
    color: '#FBBF24',
    fontSize: 12,
  },
  rebookBtn: {
    backgroundColor: '#137fec',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rebookBtnText: {
    color: '#fff',
    fontSize: 12,
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