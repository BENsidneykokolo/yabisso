import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function QrSignupScreen({ onBack, onOk }) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'<'} Retour</Text>
        </Pressable>
        <Text style={styles.topTitle}>Inscription via QR</Text>
        <View style={{ width: 64 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusStrip} />
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>En attente de validation</Text>
            <Text style={styles.statusSubtitle}>
              Montrez ce code a un agent pour activer votre compte.
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>QR</Text>
          </View>
        </View>

        <View style={styles.qrWrap}>
          <View style={styles.qrBox}>
            <View style={styles.qrCornerTL} />
            <View style={styles.qrCornerTR} />
            <View style={styles.qrCornerBL} />
            <View style={styles.qrCornerBR} />
            <View style={styles.qrInner}>
              <Text style={styles.qrText}>QR CODE</Text>
            </View>
          </View>
          <Text style={styles.qrMetaLabel}>Reference ID</Text>
          <Text style={styles.qrMetaValue}>#882-AB2</Text>
        </View>

        <Text style={styles.title}>Activez votre compte</Text>
        <Text style={styles.subtitle}>
          Ce QR code contient votre inscription locale. Un agent le scanne pour
          finaliser l'activation.
        </Text>

        <Pressable style={styles.primaryButton} onPress={onOk}>
          <Text style={styles.primaryButtonText}>OK</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Enregistrer le QR</Text>
        </Pressable>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Trouver un agent proche</Text>
        </Pressable>
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  statusStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#FFD166',
  },
  statusTextWrap: {
    flex: 1,
    paddingLeft: 10,
  },
  statusTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  statusSubtitle: {
    color: '#9FB0C3',
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    color: '#E6EDF3',
    fontSize: 12,
    fontWeight: '700',
  },
  qrWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  qrBox: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qrInner: {
    width: 160,
    height: 160,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#0E151B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    color: '#0E151B',
    fontWeight: '700',
    fontSize: 14,
  },
  qrCornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 16,
    height: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#2BEE79',
  },
  qrCornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 16,
    height: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#2BEE79',
  },
  qrCornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 16,
    height: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#2BEE79',
  },
  qrCornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 16,
    height: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#2BEE79',
  },
  qrMetaLabel: {
    color: '#7C8A9A',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  qrMetaValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#E6EDF3',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkButtonText: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: '600',
  },
});
