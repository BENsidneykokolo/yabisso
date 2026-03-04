import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SendSelectBeneficiaryScreen({ onBack, onSendMoney, walletMode = 'fcfa' }) {
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isFcfa = walletMode === 'fcfa';
  const currency = isFcfa ? 'FCFA' : 'Points';

  const savedBeneficiaries = [
    { id: '1', name: 'Jean Dupont', phone: '+237 6XX XXX XXX' },
    { id: '2', name: 'Marie Kwame', phone: '+237 6XX XXX XXX' },
    { id: '3', name: 'Paul Okonkwo', phone: '+237 6XX XXX XXX' },
  ];

  const handleSelectBeneficiary = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowAmountInput(true);
  };

  const handleAddBeneficiary = () => {
    setShowAddBeneficiary(false);
    Alert.alert('Succès', 'Lien de partage généré (expiration dans 1 minute)');
  };

  const handleSend = () => {
    if (!amount || parseInt(amount) < 100) {
      Alert.alert('Erreur', 'Le montant minimum est de 100 FCFA');
      return;
    }
    if (!password) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe');
      return;
    }
    const successMsg = isFcfa
      ? `Transfert de ${amount} FCFA vers ${selectedBeneficiary.name} effectué`
      : `Transfert de ${amount} FCFA (= ${amount} Points) vers ${selectedBeneficiary.name} effectué`;
    Alert.alert('Succès', successMsg);
    if (onSendMoney) onSendMoney();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Bénéficiaires</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Ajouter un bénéficiaire</Text>

          <View style={styles.addOptions}>
            <Pressable style={styles.addOptionCard} onPress={() => setShowAddBeneficiary(true)}>
              <View style={styles.addOptionIcon}>
                <MaterialCommunityIcons name="qrcode-scan" size={24} color="#2BEE79" />
              </View>
              <Text style={styles.addOptionLabel}>Scanner QR Code</Text>
            </Pressable>

            <Pressable style={styles.addOptionCard} onPress={handleAddBeneficiary}>
              <View style={styles.addOptionIcon}>
                <MaterialCommunityIcons name="link-variant" size={24} color="#2BEE79" />
              </View>
              <Text style={styles.addOptionLabel}>Générer un lien</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Bénéficiaires enregistrés</Text>

          {savedBeneficiaries.map((beneficiary) => (
            <Pressable
              key={beneficiary.id}
              style={styles.beneficiaryCard}
              onPress={() => handleSelectBeneficiary(beneficiary)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {beneficiary.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.beneficiaryInfo}>
                <Text style={styles.beneficiaryName}>{beneficiary.name}</Text>
                <Text style={styles.beneficiaryPhone}>{beneficiary.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={showAddBeneficiary}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddBeneficiary(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scanner le QR Code</Text>
            <Text style={styles.modalSubtitle}>
              Demandez au bénéficiaire de générer un QR code depuis son application
            </Text>

            <View style={styles.qrFrame}>
              <MaterialCommunityIcons name="qrcode-scan" size={60} color="#2BEE79" />
            </View>

            <Pressable style={styles.scanButton} onPress={() => setShowAddBeneficiary(false)}>
              <Text style={styles.scanButtonText}>Ouvrir la caméra</Text>
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={() => setShowAddBeneficiary(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAmountInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAmountInput(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.amountModalOverlay}
        >
          <View style={styles.amountModalContent}>
            <View style={styles.amountModalHeader}>
              <Pressable onPress={() => setShowAmountInput(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </Pressable>
              <Text style={styles.amountModalTitle}>Envoyer à {selectedBeneficiary?.name}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.amountInputSection}>
                <Text style={styles.amountLabel}>Montant</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.amountPrefix}>FCFA</Text>
                  <TextInput
                    style={styles.amountInput}
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
              </View>

              <View style={styles.passwordSection}>
                <Text style={styles.passwordLabel}>Mot de passe</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Votre mot de passe"
                    placeholderTextColor="#4B5563"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#4B5563" />
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.sendButton, (!amount || !password) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!amount || !password}
              >
                <Text style={styles.sendButtonText}>Envoyer</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
  },
  addOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  addOptionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  addOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  addOptionLabel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  beneficiaryCard: {
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
  beneficiaryInfo: {
    flex: 1,
  },
  beneficiaryName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  beneficiaryPhone: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1A242D',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrFrame: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderColor: '#2BEE79',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    marginBottom: 20,
  },
  scanButton: {
    width: '100%',
    backgroundColor: '#2BEE79',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  scanButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  amountModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  amountModalContent: {
    flex: 1,
    maxHeight: '90%',
    backgroundColor: '#1A242D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    paddingTop: 10,
  },
  amountModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  amountModalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  amountInputSection: {
    marginBottom: 20,
  },
  amountLabel: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  amountPrefix: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 12,
  },
  amountInput: {
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
    marginTop: 8,
    marginLeft: 4,
  },
  passwordSection: {
    marginBottom: 24,
  },
  passwordLabel: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  passwordInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  sendButton: {
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(43, 238, 121, 0.3)',
  },
  sendButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
  },
});
