import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TransportConfirmationScreen = ({ onNavigate, onBack }) => {
  const ticketRef = 'YB-2026-0512-0847';

  return (
    <View style={styles.container}>
      <View style={styles.successHeader}>
        <View style={styles.successIcon}>
          <MaterialCommunityIcons name="check-circle" size={48} color="#4CAF50" />
        </View>
        <Text style={styles.successTitle}>Réservation confirmée!</Text>
        <Text style={styles.successSubtitle}>Votre billet a été envoyé par SMS et email</Text>
      </View>

      <View style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketRef}>Réf: {ticketRef}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Confirmé</Text>
          </View>
        </View>

        <View style={styles.qrPlaceholder}>
          <MaterialCommunityIcons name="qrcode" size={120} color="#FFF" />
          <Text style={styles.qrText}>QR Code</Text>
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="bus" size={20} color="#2196F3" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Trajet</Text>
              <Text style={styles.detailValue}>Abidjan → Bouaké</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#2196F3" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Date & Heure</Text>
              <Text style={styles.detailValue}>12 Mai 2026 à 08:00</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="seat" size={20} color="#2196F3" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Siège</Text>
              <Text style={styles.detailValue}>3A - VIP</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="company" size={20} color="#2196F3" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Compagnie</Text>
              <Text style={styles.detailValue}>UTB</Text>
            </View>
          </View>
        </View>

        <View style={styles.passengerInfo}>
          <Text style={styles.passengerTitle}>Passager</Text>
          <Text style={styles.passengerName}>Koffi Jean-Baptiste</Text>
          <Text style={styles.passengerPhone}>+225 07 12 34 56 78</Text>
        </View>

        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>Montant payé</Text>
          <Text style={styles.priceValue}>4500 XOF</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.downloadButton}>
          <MaterialCommunityIcons name="download" size={24} color="#2196F3" />
          <Text style={styles.downloadText}>Télécharger le billet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton}>
          <MaterialCommunityIcons name="share-variant" size={24} color="#FFF" />
          <Text style={styles.shareText}>Partager</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.homeButton} onPress={() => onNavigate('home')}>
        <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  successHeader: { alignItems: 'center', marginBottom: 24 },
  successIcon: { backgroundColor: '#4CAF5020', padding: 16, borderRadius: 50, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  successSubtitle: { fontSize: 14, color: '#888', marginTop: 8 },
  ticketCard: { backgroundColor: '#1A2332', borderRadius: 16, padding: 20, marginBottom: 20 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  ticketRef: { fontSize: 16, color: '#888' },
  statusBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFF', fontSize: 12 },
  qrPlaceholder: { alignItems: 'center', backgroundColor: '#2A3444', padding: 24, borderRadius: 12, marginBottom: 20 },
  qrText: { color: '#888', marginTop: 8 },
  tripDetails: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#2A3444', paddingVertical: 16, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  detailInfo: { marginLeft: 12 },
  detailLabel: { fontSize: 12, color: '#888' },
  detailValue: { fontSize: 16, color: '#FFF', fontWeight: '500' },
  passengerInfo: { marginBottom: 16 },
  passengerTitle: { fontSize: 12, color: '#888', marginBottom: 4 },
  passengerName: { fontSize: 16, color: '#FFF' },
  passengerPhone: { fontSize: 14, color: '#888', marginTop: 4 },
  priceInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2A3444', padding: 12, borderRadius: 8 },
  priceLabel: { color: '#888' },
  priceValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  actions: { flexDirection: 'row', marginBottom: 20 },
  downloadButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginRight: 8 },
  downloadText: { marginLeft: 8, color: '#2196F3', fontSize: 14 },
  shareButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', padding: 16, borderRadius: 12 },
  shareText: { marginLeft: 8, color: '#FFF', fontSize: 14 },
  homeButton: { backgroundColor: '#2196F3', padding: 16, borderRadius: 12, alignItems: 'center' },
  homeButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default TransportConfirmationScreen;