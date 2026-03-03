import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function PinSignupScreen({ onBack, onOk }) {
  const [pin, setPin] = useState('');
  const pinDigits = pin.slice(0, 6).split('');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'<'} Retour</Text>
        </Pressable>
        <Text style={styles.topTitle}>Inscription via PIN</Text>
        <View style={{ width: 64 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Saisissez votre code PIN</Text>
        <Text style={styles.subtitle}>
          Entrez les 6 chiffres fournis par votre kiosque partner.
        </Text>

        <View style={styles.pinSection}>
          <View style={styles.pinRow}>
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <View key={item} style={styles.pinBox}>
                <Text style={styles.pinDigit}>{pinDigits[item] || ''}</Text>
              </View>
            ))}
          </View>

          <TextInput
            placeholder="Code PIN"
            placeholderTextColor="#8A97A6"
            style={styles.pinInput}
            keyboardType="number-pad"
            value={pin}
            onChangeText={setPin}
            maxLength={6}
          />

          <Pressable style={styles.primaryButton} onPress={onOk}>
            <Text style={styles.primaryButtonText}>OK</Text>
          </Pressable>
        </View>

        <Text style={styles.kioskHint}>
          Rapprochez-vous d'un kiosque Yabisso pour obtenir votre code PIN.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    color: '#E6EDF3',
    fontSize: 14,
  },
  topTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9FB0C3',
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  pinSection: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pinBox: {
    width: 42,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 21, 27, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigit: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  pinInput: {
    backgroundColor: 'rgba(14, 21, 27, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
  kioskHint: {
    marginTop: 18,
    color: '#7C8A9A',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
