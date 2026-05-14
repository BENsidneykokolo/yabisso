import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TransportPaymentScreen = ({ onNavigate, onBack }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const paymentMethods = [
    { id: 'wallet', name: 'Portefeuille Yabisso', icon: 'wallet', color: '#4CAF50' },
    { id: 'orange', name: 'Orange Money', icon: 'cellphone', color: '#FF9800' },
    { id: 'mtn', name: 'MTN Mobile Money', icon: 'cellphone', color: '#FFEB3B' },
    { id: 'cash', name: 'Espèces', icon: 'cash', color: '#2196F3' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Paiement</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Montant total</Text>
        <Text style={styles.summaryAmount}>4500 XOF</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode de paiement</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, selectedMethod === method.id && styles.methodCardActive]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
              <MaterialCommunityIcons name={method.icon} size={24} color={method.color} />
            </View>
            <Text style={styles.methodName}>{method.name}</Text>
            <MaterialCommunityIcons
              name={selectedMethod === method.id ? 'radiobox-marked' : 'radiobox-blank'}
              size={24}
              color={selectedMethod === method.id ? '#2196F3' : '#666'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={24} color="#2196F3" />
        <Text style={styles.infoText}>
          Après validation, vous recevrez un reçu de paiement et votre billet sera envoyé par SMS et email.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !selectedMethod && styles.continueButtonDisabled]}
        disabled={!selectedMethod}
        onPress={() => onNavigate('confirmation')}
      >
        <Text style={styles.continueButtonText}>Confirmer le paiement</Text>
        <MaterialCommunityIcons name="check" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  summary: { alignItems: 'center', backgroundColor: '#1A2332', padding: 24, borderRadius: 16, marginBottom: 24 },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryAmount: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50', marginTop: 8 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 16 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 12 },
  methodCardActive: { borderWidth: 2, borderColor: '#2196F3' },
  methodIcon: { padding: 12, borderRadius: 12 },
  methodName: { flex: 1, marginLeft: 12, fontSize: 16, color: '#FFF' },
  infoCard: { flexDirection: 'row', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 24 },
  infoText: { flex: 1, marginLeft: 12, color: '#888', fontSize: 14, lineHeight: 20 },
  continueButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2196F3', padding: 16, borderRadius: 12 },
  continueButtonDisabled: { backgroundColor: '#2A3444' },
  continueButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
});

export default TransportPaymentScreen;