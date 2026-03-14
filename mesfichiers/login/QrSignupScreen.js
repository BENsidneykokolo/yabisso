// app/src/features/auth/screens/QrSignupScreen.js
/**
 * QrSignupScreen — Côté UTILISATEUR
 *
 * Affiché automatiquement à la fin du signup offline.
 * - Génère et affiche le QR signé (usage unique)
 * - L'utilisateur l'emmène au kiosque Yabisso pour le faire scanner
 * - Après scan, le kiosque affiche un QR ACK → l'user rescanne
 * - Statut passe à 'active' → QR invalidé → SyncQueue alimentée
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Animated, Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { QrSignupService, PROFILE_STATUS } from '../services/QrSignupService';

// ─── Palette Yabisso ─────────────────────────────────────────
const C = {
  bg:         '#0A0C10',
  surface:    '#13161E',
  surfaceAlt: '#1A1E28',
  border:     '#252A38',
  green:      '#2BEE79',
  greenDim:   '#1A9B4E',
  greenGlow:  'rgba(43,238,121,0.12)',
  greenDeep:  'rgba(43,238,121,0.06)',
  text:       '#EEF0F8',
  textMuted:  '#6B7589',
  textDim:    '#3D4459',
  error:      '#FF4560',
  warning:    '#FFB020',
  white:      '#FFFFFF',
};

// ─── Étapes du flow ──────────────────────────────────────────
const STEP = {
  SHOW_QR:    'SHOW_QR',     // Afficher le QR à faire scanner
  SCAN_ACK:   'SCAN_ACK',    // Scanner le QR du kiosque
  ACTIVATING: 'ACTIVATING',  // Traitement activation
  DONE:       'DONE',        // Compte activé
  ERROR:      'ERROR',       // Erreur
};

// ─── Composant: coin décoratif pour le cadre QR ──────────────
function Corner({ style }) {
  return <View style={[corner.base, style]} />;
}
const corner = StyleSheet.create({
  base: { position: 'absolute', width: 24, height: 24, borderColor: C.green, borderWidth: 3 },
});

// ─── Composant: badge statut ─────────────────────────────────
function StatusBadge({ label, color, pulse }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!pulse) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, [pulse]);

  return (
    <View style={[badge.wrapper, { borderColor: color + '40' }]}>
      <Animated.View style={[badge.dot, { backgroundColor: color, opacity: pulse ? anim : 1 }]} />
      <Text style={[badge.label, { color }]}>{label}</Text>
    </View>
  );
}
const badge = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 7,
             paddingHorizontal: 12, paddingVertical: 6,
             borderRadius: 20, borderWidth: 1, backgroundColor: C.surfaceAlt },
  dot:     { width: 7, height: 7, borderRadius: 4 },
  label:   { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
});

// ─── Scanner overlay ─────────────────────────────────────────
function ScannerOverlay({ onScan, onCancel }) {
  const [permission, requestPermission] = useCameraPermissions();
  const scanned = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    if (!permission?.granted) requestPermission();
  }, []);

  const handleBarCode = useCallback(({ data }) => {
    if (scanned.current) return;
    scanned.current = true;
    onScan(data);
  }, [onScan]);

  if (!permission?.granted) {
    return (
      <View style={scan.permWrapper}>
        <Text style={scan.permText}>Caméra requise pour scanner le QR kiosque</Text>
        <TouchableOpacity style={scan.permBtn} onPress={requestPermission}>
          <Text style={scan.permBtnText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[scan.wrapper, { opacity: fadeAnim }]}>
      <CameraView
        style={scan.camera}
        facing="back"
        onBarcodeScanned={handleBarCode}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      {/* Overlay sombre avec découpe centrale */}
      <View style={scan.overlay}>
        <View style={scan.topShade} />
        <View style={scan.middle}>
          <View style={scan.sideShade} />
          <View style={scan.frame}>
            <Corner style={{ top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 }} />
            <Corner style={{ top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 }} />
            <Corner style={{ bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 }} />
            <Corner style={{ bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 }} />
          </View>
          <View style={scan.sideShade} />
        </View>
        <View style={scan.bottomShade}>
          <Text style={scan.hint}>Pointez vers le QR affiché sur l'écran du kiosque</Text>
          <TouchableOpacity style={scan.cancelBtn} onPress={onCancel}>
            <Text style={scan.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const scan = StyleSheet.create({
  wrapper:     { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  camera:      { flex: 1 },
  overlay:     { ...StyleSheet.absoluteFillObject, flexDirection: 'column' },
  topShade:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  middle:      { flexDirection: 'row', height: 240 },
  sideShade:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  frame:       { width: 240, height: 240, borderRadius: 4 },
  bottomShade: { flex: 1.2, backgroundColor: 'rgba(0,0,0,0.7)',
                 alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 32 },
  hint:        { color: '#fff', fontSize: 14, textAlign: 'center', lineHeight: 22, opacity: 0.8 },
  cancelBtn:   { paddingHorizontal: 32, paddingVertical: 12,
                 borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  cancelText:  { color: '#fff', fontSize: 14 },
  permWrapper: { flex: 1, backgroundColor: C.bg, alignItems: 'center',
                 justifyContent: 'center', gap: 16, padding: 32 },
  permText:    { color: C.textMuted, fontSize: 15, textAlign: 'center' },
  permBtn:     { backgroundColor: C.green, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  permBtnText: { color: C.bg, fontWeight: '700' },
});

// ─── ÉCRAN PRINCIPAL ─────────────────────────────────────────
export default function QrSignupScreen({ navigation, route }) {
  // Données transmises depuis SignupScreen
  const {
    phone      = '+242 06 000 0000',
    deviceId   = 'dev_' + Math.random().toString(36).substring(2, 10),
    publicKey  = 'mock_pub_key_base64',
    privateKey = 'mock_priv_key_base64',
    displayName = '',
  } = route?.params || {};

  const [step,              setStep]             = useState(STEP.SHOW_QR);
  const [qrData,            setQrData]           = useState(null);
  const [activationResult,  setActivationResult] = useState(null);
  const [errorMsg,          setErrorMsg]         = useState('');
  const [showScanner,       setShowScanner]       = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // ── Génère le QR au montage ──────────────────────────────
  useEffect(() => {
    const result = QrSignupService.generateUserQr({
      phone, deviceId, publicKeyB64: publicKey,
      privateKeyB64: privateKey, displayName,
    });
    setQrData(result);

    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Scan du QR ACK kiosque ───────────────────────────────
  const handleAckScan = useCallback((scannedData) => {
    setShowScanner(false);
    setStep(STEP.ACTIVATING);

    setTimeout(() => {
      const result = QrSignupService.activateFromKioskQr(scannedData, phone, deviceId);

      if (!result.valid) {
        setErrorMsg(result.error);
        setStep(STEP.ERROR);
        return;
      }

      setActivationResult(result);

      // Construire le payload SyncQueue
      if (qrData?.payload) {
        const syncPayload = QrSignupService.buildUserSyncPayload({
          userPayload:       qrData.payload,
          verificationToken: result.verificationToken,
          kioskId:           result.kioskId,
          validatedAt:       result.validatedAt,
          appVersion:        '1.0.0',
        });
        // TODO: SyncQueueService.enqueue(syncPayload);
        console.log('[QrSignup] SyncQueue payload prêt:', syncPayload);
      }

      setStep(STEP.DONE);
      Animated.spring(successAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    }, 1200); // délai court pour l'animation "traitement"
  }, [phone, deviceId, qrData]);

  // ── Navigation vers Home après activation ────────────────
  const handleContinue = useCallback(() => {
    navigation?.replace('Home', {
      activated: true,
      kioskId: activationResult?.kioskId,
    });
  }, [navigation, activationResult]);

  // ─────────────────────────────────────────────────────────
  // RENDU SELON L'ÉTAPE
  // ─────────────────────────────────────────────────────────

  const renderShowQr = () => (
    <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>

      {/* Titre */}
      <View style={s.titleBlock}>
        <Text style={s.eyebrow}>ÉTAPE 2 SUR 2</Text>
        <Text style={s.title}>Validation kiosque</Text>
        <Text style={s.subtitle}>
          Présentez ce QR à un kiosque Yabisso{'\n'}pour activer votre compte.
        </Text>
      </View>

      {/* QR Card */}
      <View style={s.qrCard}>
        {/* Coins verts */}
        <Corner style={{ top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0 }} />
        <Corner style={{ top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0 }} />
        <Corner style={{ bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0 }} />
        <Corner style={{ bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0 }} />

        {/* QR Code */}
        <View style={s.qrWrapper}>
          {qrData ? (
            <QRCode
              value={qrData.qrString}
              size={210}
              color={C.text}
              backgroundColor={C.surface}
              logo={undefined}
              quietZone={10}
            />
          ) : (
            <View style={s.qrPlaceholder}>
              <Text style={s.qrPlaceholderText}>Génération…</Text>
            </View>
          )}
        </View>

        {/* Info utilisateur sous le QR */}
        <View style={s.qrMeta}>
          <Text style={s.qrPhone}>{phone}</Text>
          <Text style={s.qrDevice}>ID: {deviceId.substring(0, 12)}…</Text>
        </View>

        {/* Badge usage unique */}
        <View style={s.qrFooter}>
          <View style={s.uniqueBadge}>
            <Text style={s.uniqueIcon}>🔐</Text>
            <Text style={s.uniqueText}>Usage unique · Expire à l'activation</Text>
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View style={s.instructions}>
        {[
          { num: '1', text: 'Rendez-vous à un kiosque Yabisso' },
          { num: '2', text: 'Le kiosque scanne ce QR' },
          { num: '3', text: 'Le kiosque affiche un QR de confirmation' },
          { num: '4', text: 'Scannez le QR kiosque avec ce bouton ↓' },
        ].map((step) => (
          <View key={step.num} style={s.instrRow}>
            <View style={s.instrNum}>
              <Text style={s.instrNumText}>{step.num}</Text>
            </View>
            <Text style={s.instrText}>{step.text}</Text>
          </View>
        ))}
      </View>

      {/* Bouton scanner ACK */}
      <TouchableOpacity style={s.btnScan} onPress={() => setShowScanner(true)}>
        <Text style={s.btnScanIcon}>⊡</Text>
        <Text style={s.btnScanText}>Scanner la confirmation kiosque</Text>
      </TouchableOpacity>

    </Animated.View>
  );

  const renderActivating = () => (
    <View style={s.centeredBlock}>
      <ActivatingSpinner />
      <Text style={s.activatingText}>Activation en cours…</Text>
      <Text style={s.activatingSubText}>Vérification de la signature kiosque</Text>
    </View>
  );

  const renderDone = () => (
    <Animated.View style={[s.doneCard, { transform: [{ scale: successAnim }], opacity: successAnim }]}>
      <View style={s.doneIconWrapper}>
        <Text style={s.doneIcon}>✓</Text>
      </View>
      <Text style={s.doneTitle}>Compte activé !</Text>
      <Text style={s.doneSub}>
        Votre inscription a été validée par le kiosque Yabisso. Vos données seront synchronisées dès votre prochaine connexion internet.
      </Text>

      <View style={s.doneDetails}>
        <View style={s.doneRow}>
          <Text style={s.doneRowLabel}>Kiosque</Text>
          <Text style={s.doneRowVal}>{activationResult?.kioskId?.substring(0, 16) || '—'}…</Text>
        </View>
        <View style={s.doneRow}>
          <Text style={s.doneRowLabel}>Validé le</Text>
          <Text style={s.doneRowVal}>
            {activationResult?.validatedAt
              ? new Date(activationResult.validatedAt).toLocaleString()
              : '—'}
          </Text>
        </View>
        <View style={s.doneRow}>
          <Text style={s.doneRowLabel}>Statut</Text>
          <Text style={[s.doneRowVal, { color: C.green }]}>Actif ✓</Text>
        </View>
        <View style={s.doneSyncRow}>
          <Text style={s.doneSyncIcon}>⏱</Text>
          <Text style={s.doneSyncText}>Sync Supabase en attente (offline) — se fera automatiquement</Text>
        </View>
      </View>

      <TouchableOpacity style={s.btnContinue} onPress={handleContinue}>
        <Text style={s.btnContinueText}>Accéder à Yabisso →</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderError = () => (
    <View style={s.errorCard}>
      <Text style={s.errorIcon}>⚠</Text>
      <Text style={s.errorTitle}>Validation échouée</Text>
      <Text style={s.errorMsg}>{errorMsg}</Text>
      <TouchableOpacity style={s.btnRetry} onPress={() => setStep(STEP.SHOW_QR)}>
        <Text style={s.btnRetryText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Scanner plein écran si actif */}
      {showScanner && (
        <ScannerOverlay
          onScan={handleAckScan}
          onCancel={() => setShowScanner(false)}
        />
      )}

      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          {step === STEP.SHOW_QR && (
            <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack()}>
              <Text style={s.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          <StatusBadge
            label={
              step === STEP.SHOW_QR    ? 'En attente kiosque' :
              step === STEP.ACTIVATING ? 'Activation…'        :
              step === STEP.DONE       ? 'Compte actif'       :
              step === STEP.ERROR      ? 'Erreur'             : ''
            }
            color={
              step === STEP.DONE  ? C.green   :
              step === STEP.ERROR ? C.error   :
              step === STEP.ACTIVATING ? C.warning : C.textMuted
            }
            pulse={step === STEP.SHOW_QR || step === STEP.ACTIVATING}
          />
        </View>

        {/* Contenu selon étape */}
        <View style={s.body}>
          {step === STEP.SHOW_QR    && renderShowQr()}
          {step === STEP.SCAN_ACK   && null /* géré par ScannerOverlay */}
          {step === STEP.ACTIVATING && renderActivating()}
          {step === STEP.DONE       && renderDone()}
          {step === STEP.ERROR      && renderError()}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Spinner activation ──────────────────────────────────────
function ActivatingSpinner() {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
  }, []);
  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[spinner.ring, { transform: [{ rotate: spin }] }]}>
      <View style={spinner.dot} />
    </Animated.View>
  );
}
const spinner = StyleSheet.create({
  ring: { width: 64, height: 64, borderRadius: 32,
          borderWidth: 3, borderColor: C.green,
          borderTopColor: 'transparent', alignItems: 'center' },
  dot:  { position: 'absolute', top: -5, width: 10, height: 10,
          borderRadius: 5, backgroundColor: C.green },
});

// ─── Styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  container:  { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, minHeight: 44 },
  backBtn:    { width: 40, height: 40, borderRadius: 12, backgroundColor: C.surface,
                borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  backIcon:   { color: C.text, fontSize: 18 },
  body:       { flex: 1 },
  content:    { flex: 1, gap: 20 },

  // Titre
  titleBlock: { gap: 6 },
  eyebrow:    { color: C.green, fontSize: 10, fontWeight: '700', letterSpacing: 3 },
  title:      { color: C.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle:   { color: C.textMuted, fontSize: 14, lineHeight: 21 },

  // QR Card
  qrCard:     { backgroundColor: C.surface, borderRadius: 20,
                borderWidth: 1, borderColor: C.border,
                padding: 20, alignItems: 'center', gap: 14 },
  qrWrapper:  { padding: 8, backgroundColor: C.surface, borderRadius: 12 },
  qrPlaceholder: { width: 210, height: 210, backgroundColor: C.surfaceAlt,
                   borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qrPlaceholderText: { color: C.textMuted, fontSize: 14 },
  qrMeta:     { alignItems: 'center', gap: 3 },
  qrPhone:    { color: C.text, fontSize: 16, fontWeight: '700' },
  qrDevice:   { color: C.textMuted, fontSize: 11, fontFamily: 'monospace' },
  qrFooter:   { width: '100%', alignItems: 'center' },
  uniqueBadge:{ flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: C.greenDeep, borderRadius: 10,
                paddingHorizontal: 12, paddingVertical: 6,
                borderWidth: 1, borderColor: C.greenGlow },
  uniqueIcon: { fontSize: 12 },
  uniqueText: { color: C.greenDim, fontSize: 11, fontWeight: '600' },

  // Instructions
  instructions: { gap: 10 },
  instrRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  instrNum:     { width: 26, height: 26, borderRadius: 13,
                  backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
                  alignItems: 'center', justifyContent: 'center' },
  instrNumText: { color: C.green, fontSize: 12, fontWeight: '700' },
  instrText:    { flex: 1, color: C.textMuted, fontSize: 13 },

  // Bouton scan
  btnScan:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                 gap: 10, height: 56, backgroundColor: C.green, borderRadius: 16 },
  btnScanIcon: { color: C.bg, fontSize: 20 },
  btnScanText: { color: C.bg, fontSize: 16, fontWeight: '700' },

  // Activating
  centeredBlock:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  activatingText:   { color: C.text, fontSize: 18, fontWeight: '700' },
  activatingSubText:{ color: C.textMuted, fontSize: 13 },

  // Done
  doneCard:        { flex: 1, justifyContent: 'center', gap: 20 },
  doneIconWrapper: { width: 80, height: 80, borderRadius: 40,
                     backgroundColor: C.greenGlow, borderWidth: 2, borderColor: C.green,
                     alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  doneIcon:        { color: C.green, fontSize: 36, fontWeight: '700' },
  doneTitle:       { color: C.text, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  doneSub:         { color: C.textMuted, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  doneDetails:     { backgroundColor: C.surface, borderRadius: 16, padding: 18,
                     borderWidth: 1, borderColor: C.border, gap: 12 },
  doneRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  doneRowLabel:    { color: C.textMuted, fontSize: 13 },
  doneRowVal:      { color: C.text, fontSize: 13, fontWeight: '600', fontFamily: 'monospace' },
  doneSyncRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8,
                     paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  doneSyncIcon:    { fontSize: 14 },
  doneSyncText:    { flex: 1, color: C.textDim, fontSize: 12, lineHeight: 18 },
  btnContinue:     { height: 56, backgroundColor: C.green, borderRadius: 16,
                     alignItems: 'center', justifyContent: 'center' },
  btnContinueText: { color: C.bg, fontSize: 17, fontWeight: '800' },

  // Error
  errorCard:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  errorIcon:  { fontSize: 48, color: C.error },
  errorTitle: { color: C.error, fontSize: 22, fontWeight: '700' },
  errorMsg:   { color: C.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  btnRetry:   { height: 52, paddingHorizontal: 40, backgroundColor: C.surfaceAlt,
                borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: C.error },
  btnRetryText: { color: C.error, fontSize: 15, fontWeight: '600' },
});
