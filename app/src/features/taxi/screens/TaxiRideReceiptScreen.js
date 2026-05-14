import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TaxiRideReceiptScreen({ onBack, onNavigate, route }) {
  const ride = route?.params || {};
  const total = (ride.price || 0) + 0;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <MaterialCommunityIcons name="check" size={48} color="#fff" />
        </View>
        <Text style={styles.title}>Reçu de course</Text>

        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Date</Text><Text style={styles.receiptValue}>{ride.date || '12/05/2026'}</Text></View>
          <View style={styles.receiptDivider} />
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Depart</Text><Text style={styles.receiptValue}>{ride.pickup || '-'}</Text></View>
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Arrivee</Text><Text style={styles.receiptValue}>{ride.destination || '-'}</Text></View>
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Chauffeur</Text><Text style={styles.receiptValue}>{ride.driver || '-'}</Text></View>
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Vehicule</Text><Text style={styles.receiptValue}>{ride.vehicle || 'Economique'}</Text></View>
          <View style={styles.receiptDivider} />
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Montant</Text><Text style={styles.receiptPrice}>{ride.price?.toLocaleString() || '0'} FCFA</Text></View>
        </View>

        <Pressable style={styles.doneBtn} onPress={() => onNavigate?.('taxi_history')}>
          <Text style={styles.doneBtnText}>Fermer</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  content: { flex: 1, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { color: '#F8FAFC', fontSize: 24, fontWeight: '700', marginBottom: 24 },
  receiptCard: { backgroundColor: '#1c2630', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  receiptLabel: { color: '#64748b', fontSize: 14 },
  receiptValue: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  receiptDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 12 },
  receiptPrice: { color: '#22c55e', fontSize: 20, fontWeight: '700' },
  doneBtn: { backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 60 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});