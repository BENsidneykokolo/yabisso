// app/src/features/kiosk/screens/KioskPointsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { database } from '../../../lib/db';

// 1 FCAF = 1 point
const POINTS_PACKS = [
  { id: 'p100', name: '100 Points', price: 100, bonus: 0 },
  { id: 'p250', name: '250 Points', price: 250, bonus: 0 },
  { id: 'p500', name: '500 Points', price: 500, bonus: 25 },
  { id: 'p1000', name: '1000 Points', price: 1000, bonus: 100 },
  { id: 'p2500', name: '2500 Points', price: 2500, bonus: 300 },
];

function KioskPointsScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPack, setSelectedPack] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');

  const handleSellPoints = () => {
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }
    if (!selectedPack) {
      Alert.alert('Erreur', 'Veuillez sélectionner un pack de points');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSale = async () => {
    if (confirmCode !== 'YABISSO') {
      Alert.alert('Erreur', 'Code de confirmation incorrect');
      return;
    }

    try {
      // Sauvegarder la transaction
      await database.write(async () => {
        await database.get('wallet_transactions').create(t => {
          t.title = `Vente ${selectedPack.name}`;
          t.meta = JSON.stringify({
            recipientPhone: phoneNumber,
            packId: selectedPack.id,
            points: selectedPack.name,
            bonus: selectedPack.bonus,
          });
          t.amount = selectedPack.price.toString();
          t.isPositive = false;
          t.walletMode = 'points_sale';
          t.createdAt = Date.now();
          t.updatedAt = Date.now();
        });
      });

      setShowConfirmModal(false);
      setShowSuccessModal(true);
      setConfirmCode('');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de valider la vente');
      console.log('[KioskPoints] Erreur:', e);
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setSelectedPack(null);
    setShowSuccessModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Vente Points</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Phone Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Numéro de téléphone client</Text>
          <View style={styles.phoneInput}>
            <Text style={styles.countryCode}>+237</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="6XX XXX XXX"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              maxLength={9}
            />
          </View>
        </View>

        {/* Points Packs */}
        <View style={styles.packsSection}>
          <Text style={styles.sectionTitle}>Sélectionner un pack de points</Text>
          <View style={styles.packsGrid}>
            {POINTS_PACKS.map((pack) => (
              <Pressable
                key={pack.id}
                style={[
                  styles.packCard,
                  selectedPack?.id === pack.id && styles.packCardSelected,
                ]}
                onPress={() => setSelectedPack(pack)}
              >
                <MaterialCommunityIcons 
                  name="star" 
                  size={32} 
                  color={selectedPack?.id === pack.id ? '#000' : '#F472B6'} 
                />
                <Text style={[
                  styles.packName,
                  selectedPack?.id === pack.id && styles.packNameSelected,
                ]}>
                  {pack.name}
                </Text>
                {pack.bonus > 0 && (
                  <View style={styles.bonusBadge}>
                    <Text style={styles.bonusText}>+{pack.bonus} bonus</Text>
                  </View>
                )}
                <Text style={[
                  styles.packPrice,
                  selectedPack?.id === pack.id && styles.packPriceSelected,
                ]}>
                  {pack.price} FCAF
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Summary */}
        {selectedPack && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Résumé</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Client</Text>
                <Text style={styles.summaryValue}>{phoneNumber || '---'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Points</Text>
                <Text style={styles.summaryValue}>{selectedPack.name}</Text>
              </View>
              {selectedPack.bonus > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Bonus</Text>
                  <Text style={styles.summaryValue}>+{selectedPack.bonus} points</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalLabel}>Total à payer</Text>
                <Text style={styles.totalValue}>{selectedPack.price} FCAF</Text>
              </View>
            </View>
          </View>
        )}

        {/* Sell Button */}
        <Pressable 
          style={[
            styles.sellButton,
            (!selectedPack || !phoneNumber) && styles.sellButtonDisabled,
          ]}
          onPress={handleSellPoints}
          disabled={!selectedPack || !phoneNumber}
        >
          <MaterialCommunityIcons name="cash" size={24} color="#000" />
          <Text style={styles.sellButtonText}>Vendre les points</Text>
        </Pressable>
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={showConfirmModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer la vente</Text>
            
            <View style={styles.confirmDetails}>
              <Text style={styles.confirmText}>Client: <Text style={styles.confirmHighlight}>{phoneNumber}</Text></Text>
              <Text style={styles.confirmText}>Points: <Text style={styles.confirmHighlight}>{selectedPack?.name}</Text></Text>
              {selectedPack?.bonus > 0 && (
                <Text style={styles.confirmText}>Bonus: <Text style={styles.confirmHighlight}>+{selectedPack.bonus}</Text></Text>
              )}
              <Text style={styles.confirmText}>Montant: <Text style={styles.confirmHighlight}>{selectedPack?.price} FCAF</Text></Text>
            </View>

            <TextInput
              style={styles.confirmInput}
              value={confirmCode}
              onChangeText={setConfirmCode}
              placeholder="Entrer code YABISSO pour confirmer"
              placeholderTextColor="#666"
              autoCapitalize="characters"
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={confirmSale}>
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="check-circle" size={80} color="#2BEE79" />
            </View>
            <Text style={styles.successTitle}>Vente réussie!</Text>
            <Text style={styles.successText}>
              {selectedPack?.name} ont été ajoutés au compte {phoneNumber}
              {selectedPack?.bonus > 0 && `\n(+${selectedPack.bonus} points bonus)`}
            </Text>
            <Pressable style={styles.successButton} onPress={resetForm}>
              <Text style={styles.successButtonText}>Nouvelle vente</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8, backgroundColor: '#16213e' },
  backButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 16, paddingBottom: 100 },
  sectionTitle: { color: '#aaa', fontSize: 14, marginBottom: 12 },
  inputSection: { marginBottom: 24 },
  phoneInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 12 },
  countryCode: { color: '#F472B6', fontSize: 18, paddingHorizontal: 16 },
  input: { flex: 1, color: '#fff', fontSize: 18, paddingVertical: 16 },
  packsSection: { marginBottom: 24 },
  packsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  packCard: { width: '47%', backgroundColor: '#16213e', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  packCardSelected: { backgroundColor: '#F472B6', borderColor: '#F472B6' },
  packName: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  packNameSelected: { color: '#000' },
  bonusBadge: { backgroundColor: '#FFD166', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  bonusText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  packPrice: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  packPriceSelected: { color: '#000' },
  summarySection: { marginBottom: 24 },
  summaryCard: { backgroundColor: '#16213e', borderRadius: 16, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#333' },
  summaryLabel: { color: '#aaa' },
  summaryValue: { color: '#fff' },
  summaryTotal: { borderBottomWidth: 0, marginTop: 8 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: '#F472B6', fontSize: 18, fontWeight: 'bold' },
  sellButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F472B6', padding: 16, borderRadius: 12 },
  sellButtonDisabled: { backgroundColor: '#666' },
  sellButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  confirmDetails: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, marginBottom: 16 },
  confirmText: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  confirmHighlight: { color: '#fff', fontWeight: 'bold' },
  confirmInput: { backgroundColor: '#16213e', color: '#fff', padding: 14, borderRadius: 12, marginBottom: 16, textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, backgroundColor: '#FF4444', padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  confirmButton: { flex: 1, backgroundColor: '#F472B6', padding: 14, borderRadius: 12, alignItems: 'center' },
  confirmButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  successIcon: { alignItems: 'center', marginBottom: 16 },
  successTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  successText: { color: '#aaa', fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  successButton: { backgroundColor: '#F472B6', padding: 16, borderRadius: 12, alignItems: 'center' },
  successButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

export default KioskPointsScreen;