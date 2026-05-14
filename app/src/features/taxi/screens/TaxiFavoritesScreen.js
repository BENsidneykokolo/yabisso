import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const favorites = [
  { id: '1', label: 'Maison', address: 'Cocody Riviera 2, Abidjan', icon: 'home' },
  { id: '2', label: 'Travail', address: 'Plateau, Rue du Commerce, Abidjan', icon: 'briefcase' },
  { id: '3', label: 'Salle de sport', address: 'Cocody Ambassades, Abidjan', icon: 'dumbbell' },
];

export default function TaxiFavoritesScreen({ onBack, onNavigate }) {
  const [items, setItems] = useState(favorites);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleAdd = () => {
    if (!newLabel.trim() || !newAddress.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir le label et l\'adresse.');
      return;
    }
    setItems([...items, { id: Date.now().toString(), label: newLabel, address: newAddress, icon: 'map-marker' }]);
    setNewLabel('');
    setNewAddress('');
    Alert.alert('Succes', 'Adresse ajoutee aux favoris.');
  };

  const handleDelete = (id) => {
    Alert.alert('Supprimer', 'Supprimer cette adresse des favoris ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: () => setItems(items.filter(i => i.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Adresses favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={styles.sectionLabel}>Mes adresses sauvegardees</Text>

        {items.map(item => (
          <Pressable key={item.id} style={styles.favCard} onPress={() => onNavigate?.('taxi_home', { pickup: item.address })}>
            <View style={styles.favLeft}>
              <View style={styles.favIcon}><MaterialCommunityIcons name={item.icon} size={22} color="#22c55e" /></View>
              <View style={styles.favInfo}><Text style={styles.favLabel}>{item.label}</Text><Text style={styles.favAddress}>{item.address}</Text></View>
            </View>
            <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id)}><MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" /></Pressable>
          </Pressable>
        ))}

        <View style={styles.addSection}>
          <Text style={styles.sectionLabel}>Ajouter une adresse</Text>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="tag" size={20} color="#64748b" />
            <TextInput style={styles.input} placeholder="Label (ex: Gymnase)" placeholderTextColor="#64748b" value={newLabel} onChangeText={setNewLabel} />
          </View>
          <View style={styles.inputRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#64748b" />
            <TextInput style={styles.input} placeholder="Adresse complete" placeholderTextColor="#64748b" value={newAddress} onChangeText={setNewAddress} />
          </View>
          <Pressable style={styles.addBtn} onPress={handleAdd}>
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Ajouter aux favoris</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionLabel: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 16 },
  favCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 14, padding: 14, marginBottom: 10 },
  favLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  favIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(34,197,94,0.1)', alignItems: 'center', justifyContent: 'center' },
  favInfo: { flex: 1 },
  favLabel: { color: '#F8FAFC', fontSize: 15, fontWeight: '600' },
  favAddress: { color: '#64748b', fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 8 },
  addSection: { marginTop: 24 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 14, marginBottom: 10, gap: 10 },
  input: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 14 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 14, marginTop: 8 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});