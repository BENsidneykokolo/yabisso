import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DeliveryHomeScreen = ({ onNavigate }) => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [date, setDate] = useState('');

  const sizes = [
    { id: 'S', name: 'Petit', desc: 'Documents, petits objets', icon: 'package-variant' },
    { id: 'M', name: 'Moyen', desc: 'Vêtements, petits appareils', icon: 'package-variant-closed' },
    { id: 'L', name: 'Grand', desc: 'Meubles, équipements', icon: 'package-variant' },
    { id: 'XL', name: 'Extra Grand', desc: 'Colis volumineux', icon: 'package-variant' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Envoyer un colis</Text>

        <View style={styles.searchCard}>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="package-variant-closed" size={24} color="#4CAF50" />
            <TextInput
              style={styles.input}
              placeholder="Adresse de retrait"
              placeholderTextColor="#666"
              value={pickupAddress}
              onChangeText={setPickupAddress}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="map-marker" size={24} color="#F44336" />
            <TextInput
              style={styles.input}
              placeholder="Adresse de livraison"
              placeholderTextColor="#666"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="calendar" size={24} color="#2196F3" />
            <TextInput
              style={styles.input}
              placeholder="Date de retrait (JJ/MM/AAAA)"
              placeholderTextColor="#666"
              value={date}
              onChangeText={setDate}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taille du colis</Text>
          <View style={styles.sizeGrid}>
            {sizes.map((size) => (
              <TouchableOpacity
                key={size.id}
                style={[styles.sizeCard, selectedSize === size.id && styles.sizeCardActive]}
                onPress={() => setSelectedSize(size.id)}
              >
                <MaterialCommunityIcons
                  name={size.icon}
                  size={32}
                  color={selectedSize === size.id ? '#FFF' : '#2196F3'}
                />
                <Text style={[styles.sizeName, selectedSize === size.id && styles.sizeNameActive]}>
                  {size.name}
                </Text>
                <Text style={styles.sizeDesc}>{size.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.searchButton, !selectedSize && styles.searchButtonDisabled]}
          disabled={!selectedSize}
          onPress={() => onNavigate('quote')}
        >
          <MaterialCommunityIcons name="magnify" size={24} color="#FFF" />
          <Text style={styles.searchButtonText}>Obtenir des devis</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="truck-delivery" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>1 234</Text>
              <Text style={styles.statLabel}>Colis livrés</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clock-fast" size={32} color="#2196F3" />
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>Dans les temps</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conseils d'expédition</Text>
          <View style={styles.tipCard}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FF9800" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Emballez correctement</Text>
              <Text style={styles.tipText}>Utilisez des matériaux de protection appropriés pour éviter tout dommage.</Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <MaterialCommunityIcons name="scale-balance" size={24} color="#4CAF50" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Vérifiez le poids</Text>
              <Text style={styles.tipText}>Assurez-vous de déclarer le poids réel pour éviter les suppléments.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  searchCard: { backgroundColor: '#1A2332', borderRadius: 16, padding: 16, marginBottom: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#FFF' },
  divider: { height: 1, backgroundColor: '#2A3444', marginVertical: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sizeCard: { width: '48%', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  sizeCardActive: { borderWidth: 2, borderColor: '#2196F3', backgroundColor: '#2196F3' },
  sizeName: { fontSize: 16, fontWeight: '600', color: '#FFF', marginTop: 8 },
  sizeNameActive: { color: '#FFF' },
  sizeDesc: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
  searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, marginBottom: 20 },
  searchButtonDisabled: { backgroundColor: '#2A3444' },
  searchButtonText: { marginLeft: 8, color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row' },
  statCard: { flex: 1, backgroundColor: '#1A2332', padding: 16, borderRadius: 12, alignItems: 'center', marginRight: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  tipCard: { flexDirection: 'row', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 12 },
  tipContent: { marginLeft: 12, flex: 1 },
  tipTitle: { fontSize: 16, color: '#FFF', fontWeight: '500' },
  tipText: { fontSize: 14, color: '#888', marginTop: 4 },
});

export default DeliveryHomeScreen;