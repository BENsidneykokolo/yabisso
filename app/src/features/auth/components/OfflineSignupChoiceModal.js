import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export default function OfflineSignupChoiceModal({
  visible,
  onClose,
  onPin,
  onSms,
  onQr,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Choisir une methode</Text>
          <Text style={styles.subtitle}>
            Choisissez la methode pour vous inscrire.
          </Text>

          <Pressable style={styles.primaryButton} onPress={onPin}>
            <Text style={styles.primaryButtonText}>Inscription via PIN</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onSms}>
            <Text style={styles.secondaryButtonText}>Inscription via SMS</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onQr}>
            <Text style={styles.secondaryButtonText}>Inscription via QR code</Text>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Annuler</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: '#0E151B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9FB0C3',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#E6EDF3',
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  closeText: {
    color: '#8A97A6',
    fontSize: 13,
  },
});
