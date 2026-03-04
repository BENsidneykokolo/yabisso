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

export default function SendConfirmPaymentScreen({ onBack, onConfirm, amount, recipientName, walletMode = 'fcfa' }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isFcfa = walletMode === 'fcfa';
  const currency = isFcfa ? 'FCFA' : 'Points';

  const commission = amount ? Math.floor(parseInt(amount) * 0.01) : 0;
  const total = amount ? parseInt(amount) + commission : 0;

  const handleConfirm = () => {
    if (!password) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Erreur', 'Mot de passe incorrect');
      return;
    }
    const successMsg = isFcfa
      ? `Paiement de ${amount} FCFA effectué avec succès`
      : `Paiement de ${amount} FCFA (= ${amount} Points) effectué avec succès`;
    Alert.alert('Succès', successMsg);
    if (onConfirm) onConfirm();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Confirmer le paiement</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="check-circle" size={40} color="#2BEE79" />
            </View>
            <Text style={styles.successTitle}>QR Code détecté</Text>
            <Text style={styles.successSubtitle}>Paiement vers: {recipientName || 'Destinataire'}</Text>
          </View>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Montant demandé</Text>
            <Text style={styles.amountValue}>
              {parseInt(amount).toLocaleString()} <Text style={styles.amountCurrency}>FCFA</Text>
            </Text>
            {!isFcfa && (
              <Text style={styles.conversionText}>= {parseInt(amount).toLocaleString()} Points</Text>
            )}
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
              <Text style={styles.summaryLabel}>Frais (1%)</Text>
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

          <View style={styles.passwordSection}>
            <Text style={styles.passwordLabel}>Entrer votre mot de passe pour valider</Text>
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
        </View>

        <SafeAreaView style={styles.footer}>
          <Pressable
            style={[styles.confirmButton, !password && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!password}
          >
            <Text style={styles.confirmButtonText}>Confirmer le paiement</Text>
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
  successCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    marginBottom: 12,
  },
  successTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  successSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
  },
  amountCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
  },
  amountLabel: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 8,
  },
  amountValue: {
    color: '#2BEE79',
    fontSize: 32,
    fontWeight: '700',
  },
  amountCurrency: {
    fontSize: 18,
    fontWeight: '500',
  },
  conversionText: {
    color: '#2BEE79',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    paddingTop: 8,
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
    marginBottom: 20,
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
