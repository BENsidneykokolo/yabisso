import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ReservationDetailsScreen({ onBack, onNavigate, reservation }) {
  const mockReservation = reservation || {
    id: '1',
    service: 'Coiffeur',
    serviceType: 'Coupe et brush',
    date: '2024-01-25',
    time: '14:00',
    location: 'Salon Beauté, Rue de la Paix, Douala',
    status: 'confirme',
    notes: 'Preference pour un coiffeur feminine',
    contact: '+237 6XX XXX XXX',
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler la reservation',
      'Etes-vous sur de vouloir annuler cette reservation?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => onNavigate && onNavigate('ReservationHome'),
        },
      ]
    );
  };

  const handleModify = () => {
    onNavigate && onNavigate('ReservationCreate', { reservation: mockReservation });
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Detail reservation</Text>
          <Pressable style={styles.shareButton}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#E6EDF3" />
          </Pressable>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusIconContainer, { backgroundColor: `${getStatusColor(mockReservation.status)}20` }]}>
            <MaterialCommunityIcons
              name={getServiceIcon(mockReservation.service)}
              size={28}
              color={getStatusColor(mockReservation.status)}
            />
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(mockReservation.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(mockReservation.status) }]}>
              {getStatusLabel(mockReservation.status)}
            </Text>
          </View>
        </View>

        <View style={styles.serviceCard}>
          <Text style={styles.serviceName}>{mockReservation.service}</Text>
          <Text style={styles.serviceType}>{mockReservation.serviceType}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="calendar" size={20} color="#2BEE79" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(mockReservation.date)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#2BEE79" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Heure</Text>
              <Text style={styles.infoValue}>{mockReservation.time}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#2BEE79" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Lieu</Text>
              <Text style={styles.infoValue}>{mockReservation.location}</Text>
            </View>
          </View>

          {mockReservation.contact && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <MaterialCommunityIcons name="phone" size={20} color="#2BEE79" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Contact</Text>
                <Text style={styles.infoValue}>{mockReservation.contact}</Text>
              </View>
            </View>
          )}

          {mockReservation.notes && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <MaterialCommunityIcons name="note-text" size={20} color="#2BEE79" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={styles.infoValue}>{mockReservation.notes}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.idSection}>
          <Text style={styles.idLabel}>Reference</Text>
          <Text style={styles.idValue}>#RES-{mockReservation.id.padStart(4, '0')}</Text>
        </View>
      </ScrollView>

      {mockReservation.status === 'confirme' || mockReservation.status === 'en_attente' ? (
        <View style={styles.bottomBar}>
          <Pressable style={styles.modifyButton} onPress={handleModify}>
            <MaterialCommunityIcons name="pencil" size={18} color="#F8FAFC" />
            <Text style={styles.modifyButtonText}>Modifier</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <MaterialCommunityIcons name="close" size={18} color="#EF4444" />
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </Pressable>
        </View>
      ) : null}
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  serviceCard: {
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  serviceName: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceType: {
    color: '#7C8A9A',
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#7C8A9A',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '500',
  },
  idSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  idLabel: {
    color: '#4A5568',
    fontSize: 11,
    marginBottom: 4,
  },
  idValue: {
    color: '#7C8A9A',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  modifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F8EFA',
    borderRadius: 16,
    paddingVertical: 14,
  },
  modifyButtonText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});