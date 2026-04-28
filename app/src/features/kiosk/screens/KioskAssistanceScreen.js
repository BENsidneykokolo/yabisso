// app/src/features/kiosk/screens/KioskAssistanceScreen.js
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

const ASSISTANCE_TYPES = [
  { 
    id: 'theft', 
    title: 'Vol de téléphone', 
    icon: 'cellphone-remove',
    description: 'Le client a été victime de vol',
    color: '#FF4444',
  },
  { 
    id: 'loss', 
    title: 'Perte de téléphone', 
    icon: 'cellphone-off',
    description: 'Le client a perdu son téléphone',
    color: '#FFD166',
  },
  { 
    id: 'account', 
    title: 'Problème de compte', 
    icon: 'account-alert',
    description: 'Problème d\'accès au compte',
    color: '#60A5FA',
  },
  { 
    id: 'transaction', 
    title: 'Transaction problématique', 
    icon: 'cash-alert',
    description: 'Transaction échouée ou incorrecte',
    color: '#F472B6',
  },
  { 
    id: 'other', 
    title: 'Autre problème', 
    icon: 'help-circle',
    description: 'Autre type d\'assistance',
    color: '#A78BFA',
  },
];

function KioskAssistanceScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState(null);
  const [victimPhone, setVictimPhone] = useState('');
  const [description, setDescription] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = () => {
    if (!victimPhone.trim() || victimPhone.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer le numéro de la victime');
      return;
    }
    if (!selectedType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type d\'assistance');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmAssistance = async () => {
    try {
      // Sauvegarder la demande d'assistance
      await database.write(async () => {
        await database.get('sync_queue').create(sq => {
          sq.action = `assistance_${selectedType.id}`;
          sq.payloadJson = JSON.stringify({
            type: selectedType.id,
            victimPhone,
            description,
            status: 'open',
            createdAt: Date.now(),
          });
          sq.status = 'pending';
          sq.retryCount = 0;
          sq.createdAt = Date.now();
          sq.updatedAt = Date.now();
        });
      });

      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de soumettre la demande');
      console.log('[KioskAssistance] Erreur:', e);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setVictimPhone('');
    setDescription('');
    setShowSuccessModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Assistance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type d'assistance</Text>
          <View style={styles.typeGrid}>
            {ASSISTANCE_TYPES.map((type) => (
              <Pressable
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType?.id === type.id && { borderColor: type.color },
                ]}
                onPress={() => setSelectedType(type)}
              >
                <View style={[styles.typeIcon, { backgroundColor: type.color + '20' }]}>
                  <MaterialCommunityIcons 
                    name={type.icon} 
                    size={28} 
                    color={type.color} 
                  />
                </View>
                <Text style={styles.typeTitle}>{type.title}</Text>
                <Text style={styles.typeDesc}>{type.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Victim Phone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Numéro de la victime</Text>
          <View style={styles.phoneInput}>
            <Text style={styles.countryCode}>+237</Text>
            <TextInput
              style={styles.input}
              value={victimPhone}
              onChangeText={setVictimPhone}
              placeholder="6XX XXX XXX"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              maxLength={9}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description du problème</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez la situation en détail..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={20} color="#60A5FA" />
          <Text style={styles.infoText}>
            Cette demande sera transmise à l'équipe support Yabisso pour traitement rapide.
          </Text>
        </View>

        {/* Submit Button */}
        <Pressable 
          style={[
            styles.submitButton,
            (!selectedType || !victimPhone) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedType || !victimPhone}
        >
          <MaterialCommunityIcons name="send" size={24} color="#000" />
          <Text style={styles.submitButtonText}>Soumettre la demande</Text>
        </Pressable>
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={showConfirmModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer la demande</Text>
            
            <View style={styles.confirmDetails}>
              <Text style={styles.confirmText}>Type: <Text style={styles.confirmHighlight}>{selectedType?.title}</Text></Text>
              <Text style={styles.confirmText}>Numéro: <Text style={styles.confirmHighlight}>{victimPhone}</Text></Text>
              {description && (
                <Text style={styles.confirmText}>Description: <Text style={styles.confirmHighlight}>{description.substring(0, 50)}...</Text></Text>
              )}
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={confirmAssistance}>
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
            <Text style={styles.successTitle}>Demande enregistrée!</Text>
            <Text style={styles.successText}>
              La demande d'assistance pour {victimPhone} a été transmise à l'équipe Yabisso.
            </Text>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketLabel}>Numéro de ticket:</Text>
              <Text style={styles.ticketNumber}>YAB-{Date.now().toString().slice(-6)}</Text>
            </View>
            <Pressable style={styles.successButton} onPress={resetForm}>
              <Text style={styles.successButtonText}>Nouvelle demande</Text>
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
  section: { marginBottom: 24 },
  sectionTitle: { color: '#aaa', fontSize: 14, marginBottom: 12 },
  typeGrid: { gap: 12 },
  typeCard: { backgroundColor: '#16213e', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  typeIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  typeTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 12, flex: 1 },
  typeDesc: { color: '#888', fontSize: 12, marginLeft: 8 },
  phoneInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 12 },
  countryCode: { color: '#60A5FA', fontSize: 18, paddingHorizontal: 16 },
  input: { flex: 1, color: '#fff', fontSize: 18, paddingVertical: 16 },
  textArea: { backgroundColor: '#16213e', color: '#fff', fontSize: 16, padding: 16, borderRadius: 12, minHeight: 120 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', padding: 16, borderRadius: 12, marginBottom: 24 },
  infoText: { color: '#aaa', fontSize: 14, marginLeft: 12, flex: 1 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#60A5FA', padding: 16, borderRadius: 12 },
  submitButtonDisabled: { backgroundColor: '#666' },
  submitButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  confirmDetails: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, marginBottom: 16 },
  confirmText: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  confirmHighlight: { color: '#fff', fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, backgroundColor: '#FF4444', padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  confirmButton: { flex: 1, backgroundColor: '#60A5FA', padding: 14, borderRadius: 12, alignItems: 'center' },
  confirmButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  successIcon: { alignItems: 'center', marginBottom: 16 },
  successTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  successText: { color: '#aaa', fontSize: 14, textAlign: 'center', marginTop: 8 },
  ticketInfo: { backgroundColor: '#16213e', padding: 16, borderRadius: 12, marginTop: 16, alignItems: 'center' },
  ticketLabel: { color: '#aaa', fontSize: 12 },
  ticketNumber: { color: '#2BEE79', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  successButton: { backgroundColor: '#60A5FA', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  successButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

export default KioskAssistanceScreen;