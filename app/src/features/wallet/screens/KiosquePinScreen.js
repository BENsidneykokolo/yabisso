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

export default function KiosquePinScreen({ onBack, onComplete }) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handlePinChange = (text) => {
    if (text.length <= 6 && /^\d*$/.test(text)) {
      setPin(text);
    }
  };

  const handleRecharge = () => {
    if (pin.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer un PIN à 6 chiffres');
      return;
    }
    Alert.alert('Succès', `Recharge effectuée via PIN Kiosque`);
    if (onComplete) onComplete();
  };

  const renderPinDots = () => {
    const dots = [];
    for (let i = 0; i < 6; i++) {
      dots.push(
        <View
          key={i}
          style={[styles.pinDot, i < pin.length && styles.pinDotFilled]}
        />
      );
    }
    return dots;
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'del'],
    ];

    return numbers.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.padRow}>
        {row.map((num) => (
          <Pressable
            key={num}
            style={[styles.padButton, num === '' && styles.padButtonEmpty]}
            onPress={() => {
              if (num === 'del') {
                setPin(pin.slice(0, -1));
              } else if (num !== '') {
                handlePinChange(pin + num);
              }
            }}
            disabled={num === ''}
          >
            {num === 'del' ? (
              <Ionicons name="backspace-outline" size={24} color="#F8FAFC" />
            ) : (
              <Text style={styles.padText}>{num}</Text>
            )}
          </Pressable>
        ))}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Entrer le PIN</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Text style={styles.instruction}>
            Entrez le PIN à 6 chiffres fourni par le kiosque
          </Text>

          <View style={styles.pinDotsContainer}>
            {showPin ? (
              <View style={styles.pinTextContainer}>
                <Text style={styles.pinText}>{pin}</Text>
                <Pressable onPress={() => setShowPin(false)} style={styles.eyeButton}>
                  <Ionicons name="eye-off" size={20} color="#94A3B8" />
                </Pressable>
              </View>
            ) : (
              renderPinDots()
            )}
          </View>
          
          <Pressable style={styles.showPinButton} onPress={() => setShowPin(true)}>
            <Ionicons name="eye" size={18} color="#94A3B8" />
            <Text style={styles.showPinText}>Afficher le PIN</Text>
          </Pressable>

          <View style={styles.padContainer}>
            {renderNumberPad()}
          </View>
        </View>

        <SafeAreaView style={styles.footer}>
          <Pressable
            style={[styles.rechargeButton, pin.length !== 6 && styles.rechargeButtonDisabled]}
            onPress={handleRecharge}
            disabled={pin.length !== 6}
          >
            <Text style={styles.rechargeButtonText}>Recharger</Text>
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
  },
  instruction: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4B5563',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  pinTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pinText: {
    color: '#2BEE79',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
  },
  eyeButton: {
    marginLeft: 12,
    padding: 4,
  },
  showPinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  showPinText: {
    color: '#94A3B8',
    fontSize: 13,
    marginLeft: 6,
  },
  padContainer: {
    width: '100%',
    maxWidth: 280,
  },
  padRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  padButton: {
    width: 70,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  padButtonEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  padText: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 36,
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
});
