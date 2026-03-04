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

export default function ReceiveScanQRScreen({ onBack, onComplete }) {
  const [received, setReceived] = useState(false);

  const handleScan = () => {
    setReceived(true);
    Alert.alert('Succès', 'Paiement de 5000FCFA reçu et ajouté à votre portefeuille');
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
          {!received ? (
            <>
              <View style={styles.scanFrame}>
                <MaterialCommunityIcons name="qrcode-scan" size={80} color="#2BEE79" />
                <Text style={styles.scanText}>Positionnez le QR Code du payeur dans le cadre</Text>
              </View>

              <Pressable style={styles.scanButton} onPress={handleScan}>
                <MaterialCommunityIcons name="camera" size={24} color="#0E151B" />
                <Text style={styles.scanButtonText}>Scanner</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.successIcon}>
                <MaterialCommunityIcons name="check-circle" size={80} color="#2BEE79" />
              </View>
              <Text style={styles.successTitle}>Paiement reçu!</Text>
              <Text style={styles.successAmount}>+ 5 000 FCFA</Text>
              <Text style={styles.successSubtitle}>Le montant a été ajouté à votre portefeuille</Text>
            </>
          )}
        </View>

        <SafeAreaView style={styles.footer}>
          {received && (
            <Pressable style={styles.doneButton} onPress={() => onComplete && onComplete()}>
              <Text style={styles.doneButtonText}>Terminé</Text>
            </Pressable>
          )}
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
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successAmount: {
    color: '#2BEE79',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  successSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    paddingBottom: 36,
  },
  doneButton: {
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
  },
});
