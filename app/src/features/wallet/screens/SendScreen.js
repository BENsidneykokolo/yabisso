import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import WalletBottomNav from '../../../components/WalletBottomNav';

export default function SendScreen({ onBack, onOpenQRGenerate, onOpenSelectBeneficiary, onOpenScanQR, walletMode = 'fcfa', onNavigate }) {
  const [showSendOptionsPopup, setShowSendOptionsPopup] = useState(false);

  const isFcfa = walletMode === 'fcfa';
  const currency = isFcfa ? 'FCFA' : 'Points';
  const balance = isFcfa ? '215 450' : '1 240';

  const sendOptions = [
    { 
      id: 'generate_qr', 
      label: 'Générer un QR Code pour payer', 
      icon: 'qrcode', 
      description: 'Créer un QR code que le destinataire scannera' 
    },
    { 
      id: 'pin', 
      label: 'Envoyer via PIN / Bénéficiaire', 
      icon: 'account-multiple-plus', 
      description: 'Ajouter un bénéficiaire ou sélectionner un contact' 
    },
    { 
      id: 'scan_qr', 
      label: 'Scanner un QR Code pour payer', 
      icon: 'qrcode-scan', 
      description: 'Scanner le QR code du destinataire' 
    },
  ];

  const handleOptionSelect = (optionId) => {
    setShowSendOptionsPopup(false);
    
    if (optionId === 'generate_qr' && onOpenQRGenerate) {
      onOpenQRGenerate();
    } else if (optionId === 'pin' && onOpenSelectBeneficiary) {
      onOpenSelectBeneficiary();
    } else if (optionId === 'scan_qr' && onOpenScanQR) {
      onOpenScanQR();
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Envoyer</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceValue}>{balance} <Text style={styles.currency}>{currency}</Text></Text>
          </View>

          <Text style={styles.sectionTitle}>Choisir une option</Text>
          
          {sendOptions.map((option) => (
            <Pressable
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleOptionSelect(option.id)}
            >
              <View style={styles.optionIcon}>
                <MaterialCommunityIcons name={option.icon} size={24} color="#2BEE79" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={showSendOptionsPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSendOptionsPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Options d'envoi</Text>
            
            <View style={styles.modalOptions}>
              {sendOptions.map((option) => (
                <Pressable
                  key={option.id}
                  style={styles.modalOptionCard}
                  onPress={() => handleOptionSelect(option.id)}
                >
                  <View style={styles.modalOptionIcon}>
                    <MaterialCommunityIcons name={option.icon} size={24} color="#2BEE79" />
                  </View>
                  <View style={styles.modalOptionInfo}>
                    <Text style={styles.modalOptionLabel}>{option.label}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.cancelModalButton}
              onPress={() => setShowSendOptionsPopup(false)}
            >
              <Text style={styles.cancelModalButtonText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <WalletBottomNav activeTab="send" onNavigate={onNavigate} walletMode={walletMode} />
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
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceValue: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
  currency: {
    fontSize: 18,
    fontWeight: '500',
    color: '#94A3B8',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#94A3B8',
    fontSize: 12,
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
  modalOptions: {
    gap: 12,
    marginBottom: 20,
  },
  modalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modalOptionInfo: {
    flex: 1,
  },
  modalOptionLabel: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelModalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
});
