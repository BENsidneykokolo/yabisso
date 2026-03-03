import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen({ onBack, onLogin, onCreateAccount }) {
  const [showPinModal, setShowPinModal] = useState(false);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [pinValue, setPinValue] = useState('');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.backgroundOrbBlue} />
      <View style={styles.backgroundOrbGreen} />
      <View style={styles.backgroundOrbYellow} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Connexion</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>Content de te revoir</Text>
          <Text style={styles.heroSubtitle}>
            Connecte-toi pour acceder a ton espace Yabisso.
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email ou telephone</Text>
            <View style={styles.inputWrap}>
              <TextInput
                placeholder="ex: +243 000 000 000"
                placeholderTextColor="#92A0B1"
                style={styles.input}
              />
              <MaterialCommunityIcons name="account" size={20} color="#92A0B1" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View style={styles.inputWrap}>
              <TextInput
                placeholder="********"
                placeholderTextColor="#92A0B1"
                style={styles.input}
                secureTextEntry
              />
              <MaterialCommunityIcons name="lock" size={20} color="#92A0B1" />
            </View>
          </View>

          <Pressable style={styles.forgotButton}>
            <Text style={styles.forgotText}>Mot de passe oublie ?</Text>
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={onLogin}>
            <Text style={styles.primaryButtonText}>Se connecter</Text>
          </Pressable>

          <View style={styles.altRow}>
            <Pressable
              style={styles.altButton}
              onPress={() => {
                setPinValue('');
                setShowPinModal(true);
              }}
            >
              <MaterialCommunityIcons name="lock-outline" size={18} color="#E6EDF3" />
              <Text style={styles.altText}>Connexion par PIN</Text>
            </Pressable>
            <Pressable
              style={styles.altButton}
              onPress={() => setShowFingerprintModal(true)}
            >
              <MaterialCommunityIcons name="fingerprint" size={18} color="#E6EDF3" />
              <Text style={styles.altText}>Connexion par empreinte</Text>
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialButton}>
              <MaterialCommunityIcons name="google" size={18} color="#E6EDF3" />
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
            <Pressable style={styles.socialButton}>
              <MaterialCommunityIcons name="apple" size={18} color="#E6EDF3" />
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.createRow} onPress={onCreateAccount}>
          <Text style={styles.createText}>
            Pas encore de compte ? <Text style={styles.createLink}>Creer un compte</Text>
          </Text>
        </Pressable>
      </ScrollView>

      <Modal transparent visible={showPinModal} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Entrer votre PIN</Text>
            <Text style={styles.modalSubtitle}>
              Saisissez les 6 chiffres de votre PIN.
            </Text>
            <View style={styles.pinRow}>
              {Array.from({ length: 6 }).map((_, index) => {
                const filled = Boolean(pinValue[index]);
                return (
                  <View key={index} style={styles.pinBox}>
                    <Text style={styles.pinDot}>{filled ? '•' : ''}</Text>
                  </View>
                );
              })}
              <TextInput
                value={pinValue}
                onChangeText={(value) => setPinValue(value.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.pinInputHidden}
                autoFocus
              />
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalSecondary}
                onPress={() => setShowPinModal(false)}
              >
                <Text style={styles.modalSecondaryText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={styles.modalPrimary}
                onPress={() => {
                  if (pinValue.length === 6) {
                    setShowPinModal(false);
                    onLogin?.();
                  }
                }}
              >
                <Text style={styles.modalPrimaryText}>Valider</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showFingerprintModal} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Empreinte digitale</Text>
            <Text style={styles.modalSubtitle}>
              Placez votre doigt sur le capteur pour vous connecter.
            </Text>
            <View style={styles.fingerprintIcon}>
              <MaterialCommunityIcons name="fingerprint" size={42} color="#0E151B" />
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalSecondary}
                onPress={() => setShowFingerprintModal(false)}
              >
                <Text style={styles.modalSecondaryText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={styles.modalPrimary}
                onPress={() => {
                  setShowFingerprintModal(false);
                  onLogin?.();
                }}
              >
                <Text style={styles.modalPrimaryText}>Valider</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  backgroundOrbBlue: {
    position: 'absolute',
    top: 40,
    right: -60,
    width: 240,
    height: 220,
    borderRadius: 120,
    backgroundColor: 'rgba(73, 159, 255, 0.15)',
  },
  backgroundOrbGreen: {
    position: 'absolute',
    top: 200,
    left: -60,
    width: 220,
    height: 200,
    borderRadius: 110,
    backgroundColor: 'rgba(43, 238, 121, 0.12)',
  },
  backgroundOrbYellow: {
    position: 'absolute',
    bottom: -60,
    right: 20,
    width: 200,
    height: 180,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 214, 102, 0.12)',
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
  heroBlock: {
    marginTop: 24,
    marginBottom: 18,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: '#B6C2CF',
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  formCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: '#E6EDF3',
    fontSize: 12,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#1F8EFA',
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 14,
    fontWeight: '700',
  },
  altRow: {
    marginTop: 12,
    gap: 10,
  },
  altButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  altText: {
    color: '#E6EDF3',
    fontSize: 12,
    fontWeight: '600',
  },
  dividerRow: {
    marginTop: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dividerText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  socialText: {
    color: '#E6EDF3',
    fontSize: 12,
    fontWeight: '600',
  },
  createRow: {
    marginTop: 18,
    alignItems: 'center',
  },
  createText: {
    color: '#8A97A6',
    fontSize: 13,
  },
  createLink: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 12, 18, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#B6C2CF',
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
  },
  pinRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  pinBox: {
    width: 38,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  pinDot: {
    color: '#F8FAFC',
    fontSize: 18,
  },
  pinInputHidden: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  fingerprintIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  modalSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalSecondaryText: {
    color: '#E6EDF3',
    fontSize: 12,
    fontWeight: '600',
  },
  modalPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  modalPrimaryText: {
    color: '#0E151B',
    fontSize: 12,
    fontWeight: '700',
  },
});
