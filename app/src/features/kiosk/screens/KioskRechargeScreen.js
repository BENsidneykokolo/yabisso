// app/src/features/kiosk/screens/KioskRechargeScreen.js
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
import * as SecureStore from 'expo-secure-store';
import { database } from '../../../lib/db';

const SERVICE_PACKS = [
  { id: 'marche', name: 'Marché', icon: 'storefront', color: '#FFD166' },
  { id: 'loba', name: 'Loba', icon: 'play-circle', color: '#F472B6' },
  { id: 'restaurant', name: 'Restaurant', icon: 'silverware-fork-knife', color: '#FF6B6B' },
  { id: 'hotel', name: 'Hôtel', icon: 'bed', color: '#60A5FA' },
  { id: 'wallet', name: 'Portefeuille', icon: 'wallet', color: '#2BEE79' },
  { id: 'chat', name: 'Chat', icon: 'chat', color: '#A78BFA' },
  { id: 'services', name: 'Services', icon: 'wrench', color: '#FB923C' },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#38BDF8' },
];

const PACK_PRICE = 50; // Tous les packs à 50 FCAF

function KioskRechargeScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPack, setSelectedPack] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [inputMode, setInputMode] = useState('manual'); // 'manual' ou 'scan'

  const handleSendPack = () => {
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }
    if (!selectedPack) {
      Alert.alert('Erreur', 'Veuillez sélectionner un pack');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmRecharge = async () => {
    if (confirmCode !== 'YABISSO') {
      Alert.alert('Erreur', 'Code de confirmation incorrect');
      return;
    }

    try {
      // Sauvegarder la transaction
      await database.write(async () => {
        await database.get('wallet_transactions').create(t => {
          t.title = `Pack ${selectedPack.name}`;
          t.meta = JSON.stringify({
            recipientPhone: phoneNumber,
            packId: selectedPack.id,
            data: selectedPack.data,
            validity: selectedPack.validity,
          });
          t.amount = selectedPack.price.toString();
          t.isPositive = false;
          t.walletMode = 'recharge';
          t.createdAt = Date.now();
          t.updatedAt = Date.now();
        });
      });

      setShowConfirmModal(false);
      setShowSuccessModal(true);
      setConfirmCode('');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de valider la recharge');
      console.log('[KioskRecharge] Erreur:', e);
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
        <Text style={styles.headerTitle}>Recharge Packs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Mode Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Sélectionner le destinataire</Text>
          <View style={styles.modeToggle}>
            <Pressable 
              style={[styles.modeButton, inputMode === 'manual' && styles.modeButtonActive]}
              onPress={() => setInputMode('manual')}
            >
              <Ionicons name="keypad" size={20} color={inputMode === 'manual' ? '#000' : '#666'} />
              <Text style={[styles.modeButtonText, inputMode === 'manual' && styles.modeButtonTextActive]}>
                Manuel
              </Text>
            </Pressable>
            <Pressable 
              style={[styles.modeButton, inputMode === 'scan' && styles.modeButtonActive]}
              onPress={() => setInputMode('scan')}
            >
              <Ionicons name="qr-code" size={20} color={inputMode === 'scan' ? '#000' : '#666'} />
              <Text style={[styles.modeButtonText, inputMode === 'scan' && styles.modeButtonTextActive]}>
                Scanner QR
              </Text>
            </Pressable>
          </View>

          {inputMode === 'manual' && (
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
          )}

          {inputMode === 'scan' && (
            <View style={styles.scanBox}>
              <MaterialCommunityIcons name="qrcode-scan" size={48} color="#2BEE79" />
              <Text style={styles.scanText}>Scanner le QR code de l'utilisateur</Text>
              <Pressable style={styles.scanButton}>
                <Text style={styles.scanButtonText}>Ouvrir la caméra</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Packs Selection - Tous à 50 FCAF */}
        <View style={styles.packsSection}>
          <Text style={styles.sectionTitle}>Sélectionner le pack (50 FCAF)</Text>
          <View style={styles.packsGrid}>
            {SERVICE_PACKS.map((pack) => (
              <Pressable
                key={pack.id}
                style={[
                  styles.packCard,
                  selectedPack?.id === pack.id && styles.packCardSelected,
                ]}
                onPress={() => setSelectedPack(pack)}
              >
                <View style={[styles.packIcon, { backgroundColor: pack.color + '20' }]}>
                  <MaterialCommunityIcons 
                    name={pack.icon} 
                    size={28} 
                    color={selectedPack?.id === pack.id ? '#000' : pack.color} 
                  />
                </View>
                <Text style={[
                  styles.packName,
                  selectedPack?.id === pack.id && styles.packNameSelected,
                ]}>
                  {pack.name}
                </Text>
                <Text style={[
                  styles.packPrice,
                  selectedPack?.id === pack.id && styles.packPriceSelected,
                ]}>
                  {PACK_PRICE} FCAF
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
                <Text style={styles.summaryLabel}>Destinataire</Text>
                <Text style={styles.summaryValue}>{phoneNumber || '---'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pack</Text>
                <Text style={styles.summaryValue}>{selectedPack.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Data</Text>
                <Text style={styles.summaryValue}>{selectedPack.data}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Validité</Text>
                <Text style={styles.summaryValue}>{selectedPack.validity}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalLabel}>Total à payer</Text>
                <Text style={styles.totalValue}>{selectedPack.price} FCAF</Text>
              </View>
            </View>
          </View>
        )}

        {/* Send Button */}
        <Pressable 
          style={[
            styles.sendButton,
            (!selectedPack || !phoneNumber) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendPack}
          disabled={!selectedPack || !phoneNumber}
        >
          <MaterialCommunityIcons name="send" size={24} color="#000" />
          <Text style={styles.sendButtonText}>Envoyer le pack</Text>
        </Pressable>
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={showConfirmModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer la recharge</Text>
            
            <View style={styles.confirmDetails}>
              <Text style={styles.confirmText}>Numéro: <Text style={styles.confirmHighlight}>{phoneNumber}</Text></Text>
              <Text style={styles.confirmText}>Pack: <Text style={styles.confirmHighlight}>{selectedPack?.name}</Text></Text>
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
              <Pressable style={styles.confirmButton} onPress={confirmRecharge}>
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
            <Text style={styles.successTitle}>Recharge réussie!</Text>
            <Text style={styles.successText}>
              Le pack {selectedPack?.name} a été envoyé au {phoneNumber}
            </Text>
            <Pressable style={styles.successButton} onPress={resetForm}>
              <Text style={styles.successButtonText}>Nouvelle recharge</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#16213e', paddingBottom: 16 },
  content: { flex: 1, padding: 16, paddingBottom: 150 },
  sectionTitle: { color: '#aaa', fontSize: 14, marginBottom: 12 },
  modeToggle: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  modeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#16213e', padding: 12, borderRadius: 12, gap: 8 },
  modeButtonActive: { backgroundColor: '#2BEE79' },
  modeButtonText: { color: '#666', fontSize: 14 },
  modeButtonTextActive: { color: '#000', fontWeight: 'bold' },
  scanBox: { backgroundColor: '#16213e', borderRadius: 12, padding: 24, alignItems: 'center' },
  scanText: { color: '#aaa', fontSize: 14, marginTop: 12, marginBottom: 16 },
  scanButton: { backgroundColor: '#2BEE79', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  scanButtonText: { color: '#000', fontWeight: 'bold' },
  phoneInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 12 },
  countryCode: { color: '#2BEE79', fontSize: 18, paddingHorizontal: 16 },
  input: { flex: 1, color: '#fff', fontSize: 18, paddingVertical: 16 },
  packsSection: { marginBottom: 24 },
  packsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  packCard: { width: '47%', backgroundColor: '#16213e', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  packCardSelected: { backgroundColor: '#2BEE79', borderColor: '#2BEE79' },
  packName: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  packNameSelected: { color: '#000' },
  packData: { color: '#FFD166', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  packValidity: { color: '#aaa', fontSize: 12, marginTop: 4 },
  packPrice: { color: '#fff', fontSize: 14, marginTop: 8 },
  packPriceSelected: { color: '#000' },
  summarySection: { marginBottom: 24 },
  summaryCard: { backgroundColor: '#16213e', borderRadius: 16, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#333' },
  summaryLabel: { color: '#aaa' },
  summaryValue: { color: '#fff' },
  summaryTotal: { borderBottomWidth: 0, marginTop: 8 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: '#FFD166', fontSize: 18, fontWeight: 'bold' },
  sendButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2BEE79', padding: 16, borderRadius: 12 },
  sendButtonDisabled: { backgroundColor: '#666' },
  sendButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
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
  confirmButton: { flex: 1, backgroundColor: '#2BEE79', padding: 14, borderRadius: 12, alignItems: 'center' },
  confirmButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  successIcon: { alignItems: 'center', marginBottom: 16 },
  successTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  successText: { color: '#aaa', fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  successButton: { backgroundColor: '#2BEE79', padding: 16, borderRadius: 12, alignItems: 'center' },
  successButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

export default KioskRechargeScreen;