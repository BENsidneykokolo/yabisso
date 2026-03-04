import React, { useState, useEffect } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SendQRResultScreen({ onBack, onComplete, amount, walletMode = 'fcfa' }) {
  const [timeLeft, setTimeLeft] = useState(60);

  const isFcfa = walletMode === 'fcfa';
  const currency = isFcfa ? 'FCFA' : 'Points';

  const commission = amount ? Math.floor(parseInt(amount) * 0.01) : 0;
  const total = amount ? parseInt(amount) + commission : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          Alert.alert('Expiré', 'Le QR Code a expiré', [
            { text: 'OK', onPress: () => onComplete && onComplete() }
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveQR = () => {
    Alert.alert('Succès', 'QR Code sauvegardé dans la galerie');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>QR Code</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.timerCard}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#F97316" />
            <Text style={styles.timerText}>Expire dans {formatTime(timeLeft)}</Text>
          </View>

          <View style={styles.qrFrame}>
            <View style={styles.qrPlaceholder}>
              <MaterialCommunityIcons name="qrcode" size={120} color="#2BEE79" />
            </View>
          </View>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Montant à recevoir</Text>
            <Text style={styles.amountValue}>
              {parseInt(amount).toLocaleString()} <Text style={styles.amountCurrency}>FCFA</Text>
            </Text>
            {!isFcfa && (
              <Text style={styles.conversionText}>= {parseInt(amount).toLocaleString()} Points</Text>
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Instruction</Text>
            <Text style={styles.infoText}>
              Le destinataire doit scanner ce QR code pour recevoir l'argent. Assurez-vous qu'il est à proximité.
            </Text>
          </View>
        </View>

        <SafeAreaView style={styles.footer}>
          <Pressable style={styles.saveButton} onPress={handleSaveQR}>
            <MaterialCommunityIcons name="download" size={20} color="#F8FAFC" />
            <Text style={styles.saveButtonText}>Sauvegarder le QR Code</Text>
          </Pressable>

          <Pressable style={styles.doneButton} onPress={() => onComplete && onComplete()}>
            <Text style={styles.doneButtonText}>Terminé</Text>
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
    alignItems: 'center',
    paddingTop: 20,
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
  },
  timerText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#2BEE79',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 4,
  },
  amountValue: {
    color: '#F8FAFC',
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
  infoCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  infoTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingBottom: 36,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
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
