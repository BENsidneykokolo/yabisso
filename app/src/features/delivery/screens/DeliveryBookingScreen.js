import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DeliveryBookingScreen = ({ onNavigate, onBack }) => {
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [packageDesc, setPackageDesc] = useState('');
  const [fragile, setFragile] = useState(false);
  const [insurance, setInsurance] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Réserver la livraison</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="truck-delivery" size={24} color="#2196F3" />
            <Text style={styles.summaryText}>DHL - 24h</Text>
          </View>
          <Text style={styles.summaryPrice}>8500 XOF</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du colis</Text>
          <TextInput
            style={styles.input}
            placeholder="Description du contenu"
            placeholderTextColor="#666"
            value={packageDesc}
            onChangeText={setPackageDesc}
            multiline
          />

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <MaterialCommunityIcons name="package-variant" size={24} color="#FF9800" />
              <Text style={styles.switchLabel}>Fragile</Text>
            </View>
            <Switch
              value={fragile}
              onValueChange={setFragile}
              trackColor={{ false: '#2A3444', true: '#2196F3' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expéditeur</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            placeholderTextColor="#666"
            value={senderName}
            onChangeText={setSenderName}
          />
          <TextInput
            style={styles.input}
            placeholder="Téléphone"
            placeholderTextColor="#666"
            value={senderPhone}
            onChangeText={setSenderPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Adresse de retrait"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinataire</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            placeholderTextColor="#666"
            value={receiverName}
            onChangeText={setReceiverName}
          />
          <TextInput
            style={styles.input}
            placeholder="Téléphone"
            placeholderTextColor="#666"
            value={receiverPhone}
            onChangeText={setReceiverPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Adresse de livraison"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#4CAF50" />
              <View>
                <Text style={styles.switchLabel}>Assurance包裹</Text>
                <Text style={styles.switchSubtext}>+1500 XOF - Couverture jusqu'à 50 000 XOF</Text>
              </View>
            </View>
            <Switch
              value={insurance}
              onValueChange={setInsurance}
              trackColor={{ false: '#2A3444', true: '#2196F3' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        <View style={styles.priceSummary}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Livraison DHL</Text>
            <Text style={styles.priceValue}>8500 XOF</Text>
          </View>
          {insurance && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Assurance</Text>
              <Text style={styles.priceValue}>1500 XOF</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{insurance ? 10000 : 8500} XOF</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.bookButton} onPress={() => onNavigate('tracking')}>
        <Text style={styles.bookButtonText}>Confirmer la réservation</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryText: { marginLeft: 8, color: '#FFF', fontSize: 16 },
  summaryPrice: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  input: { backgroundColor: '#1A2332', padding: 16, borderRadius: 12, color: '#FFF', marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12 },
  switchInfo: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { marginLeft: 12, color: '#FFF', fontSize: 16 },
  switchSubtext: { fontSize: 12, color: '#888', marginLeft: 12, marginTop: 4 },
  priceSummary: { backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { color: '#888', fontSize: 14 },
  priceValue: { color: '#FFF', fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#2A3444', paddingTop: 12, marginTop: 8 },
  totalLabel: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' },
  bookButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center' },
  bookButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default DeliveryBookingScreen;