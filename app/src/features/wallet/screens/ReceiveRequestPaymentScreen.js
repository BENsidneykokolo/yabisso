import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ReceiveRequestPaymentScreen({ onBack, onCreateQR, onSendToContact, walletMode = 'fcfa' }) {
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const isFcfa = walletMode === 'fcfa';
  const currency = isFcfa ? 'FCFA' : 'Points';

  const contacts = [
    { id: '1', name: 'Jean Dupont', phone: '+237 6XX XXX XXX' },
    { id: '2', name: 'Marie Kwame', phone: '+237 6XX XXX XXX' },
    { id: '3', name: 'Paul Okonkwo', phone: '+237 6XX XXX XXX' },
  ];

  const handleCreateRequest = () => {
    if (!amount || parseInt(amount) < 100) {
      Alert.alert('Erreur', `Le montant minimum est de 100 ${currency}`);
      return;
    }
    setShowAmountModal(false);
    setShowOptionsModal(true);
  };

  const handleGenerateQR = () => {
    setShowOptionsModal(false);
    if (onCreateQR) onCreateQR();
  };

  const handleSendToContact = (contact) => {
    setSelectedContact(contact);
    setShowOptionsModal(false);
    Alert.alert('Succès', `Demande de paiement de ${amount} ${currency} envoyée à ${contact.name}`);
    if (onSendToContact) onSendToContact();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Demander un paiement</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information" size={20} color="#2BEE79" />
            <Text style={styles.infoText}>
              Créez une demande de paiement et envoyez-la à un contact ou générez un QR code.
            </Text>
          </View>

          <Pressable style={styles.createButton} onPress={() => setShowAmountModal(true)}>
            <MaterialCommunityIcons name="plus-circle" size={24} color="#0E151B" />
            <Text style={styles.createButtonText}>Créer une demande</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Envoyer à un contact</Text>

          {contacts.map((contact) => (
            <Pressable
              key={contact.id}
              style={styles.contactCard}
              onPress={() => handleSendToContact(contact)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={showAmountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAmountModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Montant à demander</Text>
              <Pressable onPress={() => setShowAmountModal(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>FCFA</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#4B5563"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            {!isFcfa && amount && (
              <Text style={styles.conversionText}>
                = {parseInt(amount).toLocaleString()} Points
              </Text>
            )}

            <Pressable
              style={[styles.continueButton, (!amount || parseInt(amount) < 100) && styles.continueButtonDisabled]}
              onPress={handleCreateRequest}
              disabled={!amount || parseInt(amount) < 100}
            >
              <Text style={styles.continueButtonText}>Continuer</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModalContent}>
            <Text style={styles.optionsModalTitle}>Envoyer la demande</Text>
            <Text style={styles.optionsModalAmount}>
              {parseInt(amount).toLocaleString()} FCFA
              {!isFcfa && ` = ${parseInt(amount).toLocaleString()} Points`}
            </Text>

            <Pressable style={styles.optionButton} onPress={handleGenerateQR}>
              <View style={styles.optionIcon}>
                <MaterialCommunityIcons name="qrcode" size={24} color="#2BEE79" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Générer un QR Code</Text>
                <Text style={styles.optionDescription}>Le destinataire scannera votre code</Text>
              </View>
            </Pressable>

            <Pressable style={styles.optionButton} onPress={() => setShowOptionsModal(false)}>
              <View style={styles.optionIcon}>
                <MaterialCommunityIcons name="account-multiple" size={24} color="#2BEE79" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Envoyer à un contact</Text>
                <Text style={styles.optionDescription}>Sélectionner dans ma liste</Text>
              </View>
            </Pressable>

            <Pressable style={styles.cancelOptionButton} onPress={() => setShowOptionsModal(false)}>
              <Text style={styles.cancelOptionButtonText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
    marginTop: 24,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 13,
    marginLeft: 10,
    lineHeight: 18,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  createButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: '700',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  contactPhone: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    backgroundColor: '#1A242D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  inputPrefix: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 16,
  },
  conversionText: {
    color: '#2BEE79',
    fontSize: 16,
    fontWeight: '600',
    marginTop: -16,
    marginBottom: 24,
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(43, 238, 121, 0.3)',
  },
  continueButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
  },
  optionsModalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1A242D',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 40,
  },
  optionsModalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  optionsModalAmount: {
    color: '#2BEE79',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  optionDescription: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  cancelOptionButton: {
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelOptionButtonText: {
    color: '#94A3B8',
    fontSize: 15,
  },
});
