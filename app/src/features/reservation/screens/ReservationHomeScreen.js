import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MOCK_RESERVATIONS = {
  upcoming: [
    {
      id: '1',
      service: 'Coiffeur',
      serviceType: 'Coupe et brush',
      date: '2024-01-25',
      time: '14:00',
      location: 'Salon Beauté, Douala',
      status: 'confirme',
    },
    {
      id: '2',
      service: 'Restaurant',
      serviceType: 'Diner',
      date: '2024-01-28',
      time: '19:30',
      location: 'Le Petit Chef, Yaounde',
      status: 'confirme',
    },
    {
      id: '3',
      service: 'Salle de sport',
      serviceType: 'Entrainement',
      date: '2024-01-30',
      time: '08:00',
      location: 'FitCenter, Douala',
      status: 'en_attente',
    },
  ],
  past: [
    {
      id: '4',
      service: 'Coiffeur',
      serviceType: 'Coloration',
      date: '2024-01-10',
      time: '10:00',
      location: 'Salon Beauté, Douala',
      status: 'termine',
    },
    {
      id: '5',
      service: 'Restaurant',
      serviceType: 'Dejeuner',
      date: '2024-01-05',
      time: '12:30',
      location: 'Le Petit Chef, Yaounde',
      status: 'termine',
    },
    {
      id: '6',
      service: 'Cinema',
      serviceType: 'Film',
      date: '2023-12-28',
      time: '20:00',
      location: 'Canal Olympia, Douala',
      status: 'termine',
    },
  ],
};

const getStatusColor = (status) => {
  switch (status) {
    case 'confirme':
      return '#2BEE79';
    case 'en_attente':
      return '#F59E0B';
    case 'termine':
      return '#7C8A9A';
    case 'annule':
      return '#EF4444';
    default:
      return '#7C8A9A';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'confirme':
      return 'Confirme';
    case 'en_attente':
      return 'En attente';
    case 'termine':
      return 'Termine';
    case 'annule':
      return 'Annule';
    default:
      return status;
  }
};

const getServiceIcon = (service) => {
  switch (service) {
    case 'Coiffeur':
      return 'content-cut';
    case 'Restaurant':
      return 'silverware-fork-knife';
    case 'Salle de sport':
      return 'dumbbell';
    case 'Cinema':
      return 'movie';
    case 'Hotel':
      return 'bed';
    case 'SPA':
      return 'spa';
    default:
      return 'calendar';
  }
};

export default function ReservationHomeScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('upcoming');

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const renderReservationCard = (reservation, isPast = false) => (
    <Pressable
      key={reservation.id}
      style={styles.reservationCard}
      onPress={() => onNavigate && onNavigate('ReservationDetails', { reservation })}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.iconContainer, { backgroundColor: isPast ? 'rgba(124, 138, 154, 0.2)' : 'rgba(43, 238, 121, 0.15)' }]}>
          <MaterialCommunityIcons
            name={getServiceIcon(reservation.service)}
            size={22}
            color={isPast ? '#7C8A9A' : '#2BEE79'}
          />
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.serviceName, isPast && styles.textMuted]}>{reservation.service}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(reservation.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
              {getStatusLabel(reservation.status)}
            </Text>
          </View>
        </View>
        <Text style={[styles.serviceType, isPast && styles.textMuted]}>{reservation.serviceType}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.dateTimeContainer}>
            <MaterialCommunityIcons name="calendar" size={12} color="#7C8A9A" />
            <Text style={styles.dateText}>{formatDate(reservation.date)}</Text>
          </View>
          <View style={styles.dateTimeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={12} color="#7C8A9A" />
            <Text style={styles.timeText}>{reservation.time}</Text>
          </View>
        </View>
        <View style={styles.locationContainer}>
          <MaterialCommunityIcons name="map-marker" size={12} color="#7C8A9A" />
          <Text style={styles.locationText}>{reservation.location}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Reservations</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
              A venir
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'past' && styles.tabActive]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
              Passees
            </Text>
          </Pressable>
        </View>

        <View style={styles.contentContainer}>
          {activeTab === 'upcoming' ? (
            MOCK_RESERVATIONS.upcoming.length > 0 ? (
              MOCK_RESERVATIONS.upcoming.map((res) => renderReservationCard(res))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="calendar-blank" size={64} color="#4A5568" />
                <Text style={styles.emptyTitle}>Aucune reservation</Text>
                <Text style={styles.emptyText}>Vos reservations a venir apparaitront ici</Text>
              </View>
            )
          ) : (
            MOCK_RESERVATIONS.past.length > 0 ? (
              MOCK_RESERVATIONS.past.map((res) => renderReservationCard(res, true))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="history" size={64} color="#4A5568" />
                <Text style={styles.emptyTitle}>Aucune reservation</Text>
                <Text style={styles.emptyText}>Vos reservations passees apparaitront ici</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => onNavigate && onNavigate('ReservationCreate')}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#0E151B" />
      </Pressable>
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
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 20,
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2BEE79',
  },
  tabText: {
    color: '#7C8A9A',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0E151B',
  },
  contentContainer: {
    marginTop: 8,
  },
  reservationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLeft: {
    marginRight: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  serviceName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  textMuted: {
    color: '#7C8A9A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  serviceType: {
    color: '#B6C2CF',
    fontSize: 13,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  dateText: {
    color: '#7C8A9A',
    fontSize: 12,
    marginLeft: 4,
  },
  timeText: {
    color: '#7C8A9A',
    fontSize: 12,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#7C8A9A',
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#7C8A9A',
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#2BEE79',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});