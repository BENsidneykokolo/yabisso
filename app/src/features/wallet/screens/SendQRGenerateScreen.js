import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SendQRGenerateScreen({ onBack, onCreateQR, walletMode = 'fcfa' }) {
  const [amount, setAmount] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isFcfa = walletMode === 'fcfa';
  const currency = isFcfa ? 'FCFA' : 'Points';

  const commission = amount ? Math.floor(parseInt(amount) * 0.01) : 0;
  const total = amount ? parseInt(amount) + commission : 0;

  const handleContinue = () => {
    const minAmtMsg = isFcfa
      ? 'Le montant minimum est de 100 FCFA'
      : `Le montant minimum est de 100 FCFA (= 100 Points)`;
    if (!amount || parseInt(amount) < 100) {
      Alert.alert('Erreur', minAmtMsg);
      return;
    }
    setShowPasswordInput(true);
  };

  const handleConfirm = () => {
    if (!password) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Erreur', 'Mot de passe incorrect');
      return;
    }
    if (onCreateQR) {
      onCreateQR();
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Générer QR Code</Text>
          <View style={styles.headerSpacer} />
        </View>

        {!showPasswordInput ? (
          <View style={styles.content}>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="information" size={20} color="#2BEE79" />
              <Text style={styles.infoText}>
                Yabisso facturera 1% du montant réel de votre paiement à partir du solde actuel de votre portefeuille
              </Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Montant à recevoir</Text>
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
            </View>

            {amount && parseInt(amount) >= 100 && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Montant</Text>
                  <Text style={styles.summaryValue}>
                    {parseInt(amount).toLocaleString()} FCFA
                    {!isFcfa && ` (= ${parseInt(amount).toLocaleString()} Pts)`}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Commission (1%)</Text>
                  <Text style={styles.summaryValue}>
                    +{commission} FCFA
                    {!isFcfa && ` (= ${commission} Pts)`}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total à payer</Text>
                  <Text style={styles.summaryTotalValue}>
                    {total.toLocaleString()} FCFA
                    {!isFcfa && `\n(= ${total.toLocaleString()} Points)`}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.passwordSection}>
              <Text style={styles.passwordLabel}>Entrer votre mot de passe pour valider</Text>

              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Mot de passe"
                  placeholderTextColor="#4B5563"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#4B5563" />
                </Pressable>
              </View>

              <Text style={styles.passwordHint}>
                Le QR code sera valide pendant 1 minute
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Montant</Text>
                <Text style={styles.summaryValue}>
                  {parseInt(amount).toLocaleString()} FCFA
                  {!isFcfa && ` (= ${parseInt(amount).toLocaleString()} Pts)`}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Commission (1%)</Text>
                <Text style={styles.summaryValue}>
                  +{commission} FCFA
                  {!isFcfa && ` (= ${commission} Pts)`}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total à payer</Text>
                <Text style={styles.summaryTotalValue}>
                  {total.toLocaleString()} FCFA
                  {!isFcfa && `\n(= ${total.toLocaleString()} Points)`}
                </Text>
              </View>
            </View>
          </View>
        )}

        <SafeAreaView style={styles.footer}>
          <Pressable
            style={[styles.confirmButton, (!amount || (showPasswordInput && !password)) && styles.confirmButtonDisabled]}
            onPress={showPasswordInput ? handleConfirm : handleContinue}
            disabled={!amount || (showPasswordInput && !password)}
          >
            <Text style={styles.confirmButtonText}>
              {showPasswordInput ? 'Créer le QR Code' : 'Continuer'}
            </Text>
          </Pressable>
        </SafeAreaView>
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
  content: {
    flex: 1,
    marginTop: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 13,
    marginLeft: 10,
    lineHeight: 18,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
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
  summaryCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  summaryValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryTotalValue: {
    color: '#2BEE79',
    fontSize: 18,
    fontWeight: '700',
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
  eyeIcon: {
    padding: 4,
  },
  passwordInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    paddingVertical: 16,
  },
  passwordHint: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 36,
  },
  confirmButton: {
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(43, 238, 121, 0.3)',
  },
  confirmButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
  },
});
