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

export default function KiosqueQRScreen({ onBack, onComplete }) {
  const handleScan = () => {
    Alert.alert('QR Code', 'Simulation: QR Code scanné avec succès');
  };

  const handleRecharge = () => {
    Alert.alert('Succès', 'Recharge effectuée via QR Code Kiosque');
    if (onComplete) onComplete();
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
          <View style={styles.qrFrame}>
            <MaterialCommunityIcons name="qrcode-scan" size={80} color="#2BEE79" />
            <Text style={styles.qrText}>Positionnez le QR Code du kiosque dans le cadre</Text>
          </View>

          <Pressable style={styles.scanButton} onPress={handleScan}>
            <MaterialCommunityIcons name="camera" size={24} color="#0E151B" />
            <Text style={styles.scanButtonText}>Scanner</Text>
          </Pressable>
        </View>

        <SafeAreaView style={styles.footer}>
          <Pressable style={styles.rechargeButton} onPress={handleRecharge}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#2BEE79',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
  },
  qrText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scanButtonText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
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
  rechargeButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
  },
});
