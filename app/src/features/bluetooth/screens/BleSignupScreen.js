// app/src/features/bluetooth/screens/BleSignupScreen.js
import React, { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { useBleP2P, BLE_STATE } from '../hooks/useBleP2P';

// ─── Palette Yabisso (dark + #2BEE79) ───────────────────────
const C = {
  bg:          '#0D0F14',
  surface:     '#161920',
  surfaceAlt:  '#1E2230',
  border:      '#2A2F3E',
  green:       '#2BEE79',
  greenDim:    '#1A9B4E',
  greenGlow:   'rgba(43,238,121,0.15)',
  text:        '#F0F2F8',
  textMuted:   '#7A849A',
  textDim:     '#4A5268',
  error:       '#FF4D6A',
  warning:     '#FFB547',
  blue:        '#4D9FFF',
};

// ─── Descriptions étapes ─────────────────────────────────────
const STEPS = [
  { state: BLE_STATE.REQUESTING_PERMISSIONS, label: 'Vérification permissions…',   icon: '🔐' },
  { state: BLE_STATE.SCANNING,               label: 'Recherche kiosque Yabisso…',  icon: '📡' },
  { state: BLE_STATE.CONNECTING,             label: 'Connexion au kiosque…',        icon: '🔗' },
  { state: BLE_STATE.SENDING,               label: 'Envoi de votre inscription…',  icon: '📤' },
  { state: BLE_STATE.WAITING_ACK,           label: 'Validation par le kiosque…',   icon: '⏳' },
  { state: BLE_STATE.SUCCESS,               label: 'Inscription validée !',         icon: '✅' },
];

// ─── Composant: cercle de progression animé ──────────────────
function ProgressRing({ progress }) {
  const rotation = React.useRef(new Animated.Value(0)).current;
  const scale    = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.08, duration: 200, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 200, useNativeDriver: true }),
    ]).start();
  }, [progress]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={ring.wrapper}>
      <Animated.View style={[ring.orbit, { transform: [{ rotate: spin }, { scale }] }]}>
        <View style={ring.dot} />
      </Animated.View>
      <View style={ring.center}>
        <Text style={ring.pct}>{progress}%</Text>
        <Text style={ring.label}>BLE</Text>
      </View>
    </View>
  );
}

const ring = StyleSheet.create({
  wrapper: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  orbit: {
    position: 'absolute', width: 140, height: 140,
    borderRadius: 70, borderWidth: 2,
    borderColor: C.green, borderStyle: 'dashed',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute', top: -5, left: 62,
    width: 10, height: 10, borderRadius: 5, backgroundColor: C.green,
  },
  center: { alignItems: 'center', gap: 2 },
  pct:   { color: C.green, fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  label: { color: C.textMuted, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' },
});

// ─── Composant: étape de la liste ────────────────────────────
function StepRow({ step, currentState, index }) {
  const stateOrder = STEPS.map(s => s.state);
  const currentIdx = stateOrder.indexOf(currentState);
  const stepIdx    = stateOrder.indexOf(step.state);

  const isDone    = stepIdx < currentIdx;
  const isActive  = stepIdx === currentIdx;
  const isPending = stepIdx > currentIdx;

  const opacity = React.useRef(new Animated.Value(isPending ? 0.3 : 1)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isPending ? 0.3 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentState]);

  return (
    <Animated.View style={[stepStyle.row, { opacity }]}>
      <View style={[stepStyle.dot, isDone && stepStyle.dotDone, isActive && stepStyle.dotActive]} />
      <Text style={stepStyle.icon}>{step.icon}</Text>
      <Text style={[stepStyle.label, isDone && stepStyle.labelDone, isActive && stepStyle.labelActive]}>
        {step.label}
      </Text>
      {isDone && <Text style={stepStyle.check}>✓</Text>}
    </Animated.View>
  );
}

const stepStyle = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  dotDone:     { backgroundColor: C.green },
  dotActive:   { backgroundColor: C.green, shadowColor: C.green, shadowOpacity: 0.8, shadowRadius: 4, elevation: 4 },
  icon:        { fontSize: 16 },
  label:       { flex: 1, color: C.textMuted, fontSize: 13 },
  labelDone:   { color: C.textDim },
  labelActive: { color: C.text, fontWeight: '600' },
  check:       { color: C.green, fontSize: 13, fontWeight: '700' },
});

// ─── ÉCRAN PRINCIPAL ─────────────────────────────────────────
export default function BleSignupScreen({ navigation, route }) {
  const signupPayload = route?.params?.signupPayload;
  const {
    bleState, peerDevice, error, progress,
    lastPayload, startAsSender, reset,
    isSuccess, isError,
  } = useBleP2P();

  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim  = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (bleState === BLE_STATE.SCANNING || bleState === BLE_STATE.WAITING_ACK) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [bleState]);

  const handleStart = useCallback(() => {
    if (!signupPayload) {
      console.warn('[BleSignupScreen] Aucun signupPayload fourni');
      return;
    }
    startAsSender(signupPayload);
  }, [signupPayload, startAsSender]);

  const handleSuccess = useCallback(() => {
    // Naviguer vers l'écran de succès / Home
    navigation?.navigate('Home', { verified: true, token: lastPayload?.verification_token });
  }, [navigation, lastPayload]);

  const isIdle    = bleState === BLE_STATE.IDLE;
  const isRunning = !isIdle && !isSuccess && !isError;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[s.container, { opacity: fadeAnim }]}>

          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => { reset(); navigation?.goBack(); }}>
              <Text style={s.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={s.headerCenter}>
              <Text style={s.titleTag}>BLUETOOTH P2P</Text>
              <Text style={s.title}>Inscription via{'\n'}kiosque</Text>
            </View>
          </View>

          {/* ── Zone centrale ── */}
          <View style={s.central}>
            {/* Radar animé */}
            <Animated.View style={[s.radarWrapper, { transform: [{ scale: pulseAnim }] }]}>
              <View style={s.radarOuter}>
                <View style={s.radarMid}>
                  <View style={s.radarInner}>
                    <Text style={s.radarIcon}>
                      {isSuccess ? '✅' : isError ? '❌' : '📲'}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Progress ring si en cours */}
            {isRunning && (
              <View style={s.ringWrapper}>
                <ProgressRing progress={progress} />
              </View>
            )}

            {/* Peer info */}
            {peerDevice && (
              <View style={s.peerBadge}>
                <Text style={s.peerDot}>●</Text>
                <Text style={s.peerName}>{peerDevice.name}</Text>
              </View>
            )}
          </View>

          {/* ── Liste des étapes ── */}
          {isRunning && (
            <View style={s.stepsCard}>
              <Text style={s.stepsTitle}>PROGRESSION</Text>
              {STEPS.map((step, i) => (
                <StepRow key={step.state} step={step} currentState={bleState} index={i} />
              ))}
            </View>
          )}

          {/* ── Succès ── */}
          {isSuccess && (
            <View style={s.successCard}>
              <Text style={s.successTitle}>Inscription validée !</Text>
              <Text style={s.successSub}>
                Votre compte a été activé par le kiosque Yabisso.
              </Text>
              {lastPayload?.verification_token && (
                <View style={s.tokenBox}>
                  <Text style={s.tokenLabel}>TOKEN DE VÉRIFICATION</Text>
                  <Text style={s.tokenValue}>{lastPayload.verification_token}</Text>
                </View>
              )}
              <TouchableOpacity style={s.btnPrimary} onPress={handleSuccess}>
                <Text style={s.btnPrimaryText}>Accéder à Yabisso →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Erreur ── */}
          {isError && (
            <View style={s.errorCard}>
              <Text style={s.errorTitle}>Connexion échouée</Text>
              <Text style={s.errorMsg}>{error}</Text>
              <TouchableOpacity style={s.btnRetry} onPress={() => { reset(); handleStart(); }}>
                <Text style={s.btnRetryText}>Réessayer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnSecondary} onPress={() => navigation?.navigate('QrSignup')}>
                <Text style={s.btnSecondaryText}>Utiliser le QR Code à la place</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── État Idle : bouton démarrer ── */}
          {isIdle && (
            <View style={s.idleSection}>
              <View style={s.infoCard}>
                <Text style={s.infoIcon}>📡</Text>
                <Text style={s.infoText}>
                  Approchez-vous d'un kiosque Yabisso (moins de 10 mètres) pour activer votre compte sans internet.
                </Text>
              </View>

              <View style={s.requiresRow}>
                <Text style={s.requiresItem}>✓ Bluetooth activé</Text>
                <Text style={s.requiresItem}>✓ Kiosque à proximité</Text>
                <Text style={s.requiresItem}>✓ Inscription préparée</Text>
              </View>

              <TouchableOpacity style={s.btnPrimary} onPress={handleStart}>
                <Text style={s.btnPrimaryText}>Démarrer la connexion BLE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.btnLink} onPress={() => navigation?.navigate('QrSignup')}>
                <Text style={s.btnLinkText}>Préfère utiliser le QR Code →</Text>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  container: { flex: 1, padding: 24 },

  // Header
  header:       { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 32 },
  backBtn:      { width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  backIcon:     { color: C.text, fontSize: 18 },
  headerCenter: { flex: 1, gap: 4 },
  titleTag:     { color: C.green, fontSize: 10, fontWeight: '700', letterSpacing: 3 },
  title:        { color: C.text, fontSize: 24, fontWeight: '700', lineHeight: 30 },

  // Central radar
  central:      { alignItems: 'center', marginVertical: 24 },
  radarWrapper: { alignItems: 'center', justifyContent: 'center' },
  radarOuter:   { width: 160, height: 160, borderRadius: 80,
                  backgroundColor: 'rgba(43,238,121,0.04)',
                  borderWidth: 1, borderColor: 'rgba(43,238,121,0.15)',
                  alignItems: 'center', justifyContent: 'center' },
  radarMid:     { width: 110, height: 110, borderRadius: 55,
                  backgroundColor: 'rgba(43,238,121,0.07)',
                  borderWidth: 1, borderColor: 'rgba(43,238,121,0.2)',
                  alignItems: 'center', justifyContent: 'center' },
  radarInner:   { width: 68, height: 68, borderRadius: 34,
                  backgroundColor: C.surfaceAlt,
                  borderWidth: 2, borderColor: C.green,
                  alignItems: 'center', justifyContent: 'center' },
  radarIcon:    { fontSize: 28 },
  ringWrapper:  { marginTop: 16 },
  peerBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12,
                  backgroundColor: C.surfaceAlt, paddingHorizontal: 14, paddingVertical: 6,
                  borderRadius: 20, borderWidth: 1, borderColor: C.greenDim },
  peerDot:      { color: C.green, fontSize: 8 },
  peerName:     { color: C.green, fontSize: 13, fontWeight: '600' },

  // Steps
  stepsCard:    { backgroundColor: C.surface, borderRadius: 16, padding: 20,
                  borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  stepsTitle:   { color: C.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 3,
                  marginBottom: 12 },

  // Success
  successCard:  { backgroundColor: C.surface, borderRadius: 16, padding: 24,
                  borderWidth: 1, borderColor: C.green, gap: 12 },
  successTitle: { color: C.green, fontSize: 22, fontWeight: '700' },
  successSub:   { color: C.textMuted, fontSize: 14, lineHeight: 20 },
  tokenBox:     { backgroundColor: C.surfaceAlt, borderRadius: 12, padding: 14, gap: 6 },
  tokenLabel:   { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  tokenValue:   { color: C.text, fontSize: 13, fontFamily: 'monospace' },

  // Error
  errorCard:    { backgroundColor: C.surface, borderRadius: 16, padding: 24,
                  borderWidth: 1, borderColor: C.error, gap: 12 },
  errorTitle:   { color: C.error, fontSize: 18, fontWeight: '700' },
  errorMsg:     { color: C.textMuted, fontSize: 14, lineHeight: 20 },

  // Idle
  idleSection:  { gap: 16 },
  infoCard:     { flexDirection: 'row', gap: 14, backgroundColor: C.surface, borderRadius: 16,
                  padding: 18, borderWidth: 1, borderColor: C.border },
  infoIcon:     { fontSize: 24 },
  infoText:     { flex: 1, color: C.textMuted, fontSize: 14, lineHeight: 21 },
  requiresRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  requiresItem: { color: C.green, fontSize: 12, backgroundColor: C.greenGlow,
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },

  // Buttons
  btnPrimary:     { backgroundColor: C.green, borderRadius: 14, height: 52,
                    alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: C.bg, fontSize: 16, fontWeight: '700' },
  btnRetry:       { backgroundColor: C.surfaceAlt, borderRadius: 14, height: 52,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1, borderColor: C.error },
  btnRetryText:   { color: C.error, fontSize: 15, fontWeight: '600' },
  btnSecondary:   { borderRadius: 14, height: 48,
                    alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { color: C.textMuted, fontSize: 14 },
  btnLink:        { alignItems: 'center', paddingVertical: 8 },
  btnLinkText:    { color: C.textMuted, fontSize: 13 },
});
