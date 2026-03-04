import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function RechargeScreen({ onBack, onComplete, onOpenQRScan, onOpenPinEntry, walletMode = 'fcfa' }) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showMobileMoneyPopup, setShowMobileMoneyPopup] = useState(false);
  const [showKiosquePopup, setShowKiosquePopup] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [kiosqueOption, setKiosqueOption] = useState(null);

  const isFcfa = walletMode === 'fcfa';
  const currency = isFcfa ? 'FCFA' : 'Points';

  const methods = [
    { id: 'mobile_money', label: 'Mobile Money', icon: 'cellphone', provider: 'MTN / Airtel' },
    { id: 'card', label: 'Carte Bancaire', icon: 'credit-card', provider: 'Visa / Mastercard' },
    { id: 'kiosque', label: 'Kiosque Yabisso', icon: 'store', provider: 'Point de vente' },
    { id: 'bank', label: 'Virement Bancaire', icon: 'bank', provider: 'IBAN / SWIFT' },
  ];

  const mobileMoneyProviders = [
    { id: 'mtn', label: 'MTN MoMo', icon: 'cellphone' },
    { id: 'airtel', label: 'Airtel Money', icon: 'cellphone-wireless' },
  ];

  const kiosqueOptions = [
    { id: 'scan', label: 'Scanner QR Code', icon: 'qrcode-scan' },
    { id: 'pin', label: 'Entrer le PIN', icon: 'dialpad' },
  ];

  const quickAmounts = ['1000', '2000', '5000', '10000', '20000'];

  const handleMethodSelect = (methodId) => {
    if (methodId === 'mobile_money') {
      setShowMobileMoneyPopup(true);
    } else if (methodId === 'kiosque') {
      setShowKiosquePopup(true);
    } else {
      setSelectedMethod(methodId);
      setSelectedProvider(null);
      setKiosqueOption(null);
    }
  };

  const handleKiosqueConfirm = () => {
    if (!kiosqueOption) {
      Alert.alert('Erreur', 'Veuillez sélectionner une option');
      return;
    }
    setShowKiosquePopup(false);
    if (kiosqueOption === 'scan' && onOpenQRScan) {
      onOpenQRScan();
    } else if (kiosqueOption === 'pin' && onOpenPinEntry) {
      onOpenPinEntry();
    }
  };

  const handleProviderSelect = (providerId) => {
    setSelectedProvider(providerId);
  };

  const handleProviderConfirm = () => {
    if (!selectedProvider) {
      Alert.alert('Erreur', 'Veuillez sélectionner un opérateur');
      return;
    }
    setSelectedMethod('mobile_money');
    setShowMobileMoneyPopup(false);
  };

  const handleRecharge = () => {
    if (!amount || parseInt(amount) < 100) {
      Alert.alert('Erreur', `Veuillez entrer un montant minimum de 100 ${currency}`);
      return;
    }
    if (!selectedMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner une méthode de recharge');
      return;
    }
    if (selectedMethod === 'mobile_money' && !selectedProvider) {
      Alert.alert('Erreur', 'Veuillez sélectionner un opérateur');
      return;
    }
    if (selectedMethod === 'kiosque') {
      if (kiosqueOption === 'scan' && onOpenQRScan) {
        onOpenQRScan();
        return;
      } else if (kiosqueOption === 'pin' && onOpenPinEntry) {
        onOpenPinEntry();
        return;
      }
    }
    const providerLabel = selectedMethod === 'mobile_money'
      ? mobileMoneyProviders.find(p => p.id === selectedProvider)?.label
      : selectedMethod === 'kiosque'
        ? 'Kiosque Yabisso'
        : methods.find(m => m.id === selectedMethod)?.label;
    Alert.alert('Succès', `Recharge de ${amount}${currency} initiée par ${providerLabel}`);
    if (onComplete) onComplete();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Recharger</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Nouveau solde</Text>
            <Text style={styles.balanceValue}>
              {amount ? parseInt(amount).toLocaleString() : '0'} <Text style={styles.currency}>{currency}</Text>
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Montant</Text>
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

          <View style={styles.quickAmounts}>
            {quickAmounts.map((q) => (
              <Pressable
                key={q}
                style={[styles.quickAmount, amount === q && styles.quickAmountActive]}
                onPress={() => setAmount(q)}
              >
                <Text style={[styles.quickAmountText, amount === q && styles.quickAmountTextActive]}>
                  +{parseInt(q).toLocaleString()}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Methode de paiement</Text>
          <View style={styles.methodsContainer}>
            {methods.map((method) => (
              <Pressable
                key={method.id}
                style={[styles.methodCard, selectedMethod === method.id && styles.methodCardActive]}
                onPress={() => handleMethodSelect(method.id)}
              >
                <View style={[styles.methodIcon, selectedMethod === method.id && styles.methodIconActive]}>
                  <MaterialCommunityIcons
                    name={method.icon}
                    size={20}
                    color={selectedMethod === method.id ? '#0E151B' : '#94A3B8'}
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodLabel, selectedMethod === method.id && styles.methodLabelActive]}>
                    {method.label}
                  </Text>
                  <Text style={styles.methodProvider}>{method.provider}</Text>
                </View>
                <View style={[styles.radioOuter, selectedMethod === method.id && styles.radioOuterActive]}>
                  {selectedMethod === method.id && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <SafeAreaView style={styles.footer}>
          <Pressable
            style={[styles.rechargeButton, (!selectedMethod || !amount || (selectedMethod === 'mobile_money' && !selectedProvider)) && styles.rechargeButtonDisabled]}
            onPress={handleRecharge}
            disabled={!selectedMethod || !amount || (selectedMethod === 'mobile_money' && !selectedProvider)}
          >
            <Text style={styles.rechargeButtonText}>Recharger</Text>
          </Pressable>
        </SafeAreaView>

        <Modal
          visible={showMobileMoneyPopup}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMobileMoneyPopup(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choisir votre opérateur</Text>

              <View style={styles.providerList}>
                {mobileMoneyProviders.map((provider) => (
                  <Pressable
                    key={provider.id}
                    style={[styles.providerCard, selectedProvider === provider.id && styles.providerCardActive]}
                    onPress={() => handleProviderSelect(provider.id)}
                  >
                    <MaterialCommunityIcons
                      name={provider.icon}
                      size={24}
                      color={selectedProvider === provider.id ? '#0E151B' : '#94A3B8'}
                    />
                    <Text style={[styles.providerLabel, selectedProvider === provider.id && styles.providerLabelActive]}>
                      {provider.label}
                    </Text>
                    <View style={[styles.radioOuter, selectedProvider === provider.id && styles.radioOuterActive]}>
                      {selectedProvider === provider.id && <View style={styles.radioInner} />}
                    </View>
                  </Pressable>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowMobileMoneyPopup(false);
                    setSelectedProvider(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </Pressable>
                <Pressable
                  style={[styles.okButton, !selectedProvider && styles.okButtonDisabled]}
                  onPress={handleProviderConfirm}
                  disabled={!selectedProvider}
                >
                  <Text style={styles.okButtonText}>Recharger</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showKiosquePopup}
          transparent
          animationType="fade"
          onRequestClose={() => setShowKiosquePopup(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Recharger via Kiosque</Text>

              <View style={styles.providerList}>
                {kiosqueOptions.map((option) => (
                  <Pressable
                    key={option.id}
                    style={[styles.providerCard, kiosqueOption === option.id && styles.providerCardActive]}
                    onPress={() => setKiosqueOption(option.id)}
                  >
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={24}
                      color={kiosqueOption === option.id ? '#0E151B' : '#94A3B8'}
                    />
                    <Text style={[styles.providerLabel, kiosqueOption === option.id && styles.providerLabelActive]}>
                      {option.label}
                    </Text>
                    <View style={[styles.radioOuter, kiosqueOption === option.id && styles.radioOuterActive]}>
                      {kiosqueOption === option.id && <View style={styles.radioInner} />}
                    </View>
                  </Pressable>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowKiosquePopup(false);
                    setKiosqueOption(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </Pressable>
                <Pressable
                  style={[styles.okButton, !kiosqueOption && styles.okButtonDisabled]}
                  onPress={handleKiosqueConfirm}
                  disabled={!kiosqueOption}
                >
                  <Text style={styles.okButtonText}>OK</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
  scrollContent: {
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
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
  balanceCard: {
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceValue: {
    color: '#2BEE79',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
  currency: {
    fontSize: 18,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    marginTop: 8,
    marginLeft: 4,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  quickAmount: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickAmountActive: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  quickAmountText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  quickAmountTextActive: {
    color: '#0E151B',
  },
  methodsContainer: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  methodCardActive: {
    borderColor: '#2BEE79',
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  methodIconActive: {
    backgroundColor: '#2BEE79',
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  methodLabelActive: {
    color: '#2BEE79',
  },
  methodProvider: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#2BEE79',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2BEE79',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 56,
  },
  rechargeButton: {
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rechargeButtonDisabled: {
    backgroundColor: 'rgba(43, 238, 121, 0.3)',
  },
  rechargeButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  providerList: {
    gap: 12,
    marginBottom: 24,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  providerCardActive: {
    borderColor: '#2BEE79',
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
  },
  providerLabel: {
    flex: 1,
    marginLeft: 14,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  providerLabelActive: {
    color: '#2BEE79',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  okButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
  },
  okButtonDisabled: {
    backgroundColor: 'rgba(43, 238, 121, 0.3)',
  },
  okButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
});
