import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SendScanQRScreen({ onBack, onConfirm, onShowPassword, walletMode = 'fcfa' }) {
  const [scanned, setScanned] = useState(false);
  const [amount, setAmount] = useState(null);

  const isFcfa = walletMode === 'fcfa';
  const currency = isFcfa ? 'FCFA' : 'Points';

  const mockAmount = '5000';

  const handleScan = () => {
    setScanned(true);
    setAmount(mockAmount);
  };

  const handleConfirm = () => {
    if (onShowPassword) {
      onShowPassword(amount || mockAmount);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Scanner QR</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {!scanned ? (
            <>
              <View style={styles.scanFrame}>
                <MaterialCommunityIcons name="qrcode-scan" size={80} color="#2BEE79" />
                <Text style={styles.scanText}>Positionnez le QR Code dans le cadre</Text>
              </View>

              <Pressable style={styles.scanButton} onPress={handleScan}>
                <MaterialCommunityIcons name="camera" size={24} color="#0E151B" />
                <Text style={styles.scanButtonText}>Scanner</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.successCard}>
                <View style={styles.successIcon}>
                  <MaterialCommunityIcons name="check-circle" size={40} color="#2BEE79" />
                </View>
                <Text style={styles.successTitle}>QR Code détecté</Text>
                <Text style={styles.successSubtitle}>Le destinataire demande:</Text>
              </View>

              <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>Montant à payer</Text>
                <Text style={styles.amountValue}>
                  {parseInt(amount).toLocaleString()} <Text style={styles.amountCurrency}>FCFA</Text>
                </Text>
                {!isFcfa && (
                  <Text style={styles.conversionText}>= {parseInt(amount).toLocaleString()} Points</Text>
                )}
              </View>

              <View style={styles.infoCard}>
                <MaterialCommunityIcons name="information" size={18} color="#94A3B8" />
                <Text style={styles.infoText}>
                  En confirmant, le montant sera débité de votre portefeuille et transféré au destinataire.
                </Text>
              </View>
            </>
          )}
        </View>

        <SafeAreaView style={styles.footer}>
          {scanned ? (
            <>
              <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirmer le paiement</Text>
              </Pressable>

              <Pressable style={styles.cancelButton} onPress={() => setScanned(false)}>
                <Text style={styles.cancelButtonText}>Scanner à nouveau</Text>
              </Pressable>
            </>
          ) : null}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: '#2BEE79',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    marginBottom: 30,
  },
  scanText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  scanButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  successCard: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  successSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
  },
  amountCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
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
    fontSize: 36,
    fontWeight: '700',
  },
  amountCurrency: {
    fontSize: 20,
    fontWeight: '500',
  },
  conversionText: {
    color: '#2BEE79',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 13,
    marginLeft: 10,
    lineHeight: 18,
  },
  footer: {
    paddingBottom: 36,
  },
  confirmButton: {
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
});
