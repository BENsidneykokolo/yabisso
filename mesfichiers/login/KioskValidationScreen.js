// app/src/features/kiosk/screens/KioskValidationScreen.js
/**
 * KioskValidationScreen — Côté KIOSQUE
 *
 * - Scanne le QR de l'utilisateur
 * - Valide la signature + structure
 * - Stocke l'inscription localement (WatermelonDB)
 * - Génère + affiche le QR ACK pour l'utilisateur
 * - Alimente la SyncQueue → sync Supabase au retour réseau
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Animated, ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { QrSignupService, PROFILE_STATUS } from '../../auth/services/QrSignupService';

// ─── Palette (cohérente avec le reste de l'app) ───────────────
const C = {
  bg:         '#0A0C10',
  surface:    '#13161E',
  surfaceAlt: '#1A1E28',
  border:     '#252A38',
  green:      '#2BEE79',
  greenDim:   '#1A9B4E',
  greenGlow:  'rgba(43,238,121,0.12)',
  text:       '#EEF0F8',
  textMuted:  '#6B7589',
  textDim:    '#3D4459',
  error:      '#FF4560',
  warning:    '#FFB020',
  blue:       '#4D9FFF',
};

// ─── États du flow kiosque ────────────────────────────────────
const KIOSK_STEP = {
  READY:      'READY',      // Prêt à scanner
  SCANNING:   'SCANNING',   // Caméra active
  VALIDATING: 'VALIDATING', // Traitement du QR reçu
  SHOW_ACK:   'SHOW_ACK',   // Afficher le QR de confirmation
  SUCCESS:    'SUCCESS',    // Utilisateur a scanné l'ACK
  ERROR:      'ERROR',      // Erreur de validation
};

// ─── Coin décoratif ───────────────────────────────────────────
function Corner({ style }) {
  return <View style={[corn.base, style]} />;
}
const corn = StyleSheet.create({
  base: { position: 'absolute', width: 22, height: 22, borderColor: C.green, borderWidth: 2.5 },
});

// ─── Carte info utilisateur validé ───────────────────────────
function UserInfoCard({ payload }) {
  return (
    <View style={uic.wrapper}>
      <View style={uic.header}>
        <View style={uic.avatar}>
          <Text style={uic.avatarText}>
            {(payload.display_name?.[0] || payload.phone?.[0] || '?').toUpperCase()}
          </Text>
        </View>
        <View style={uic.info}>
          <Text style={uic.name}>{payload.display_name || 'Utilisateur'}</Text>
          <Text style={uic.phone}>{payload.phone}</Text>
        </View>
        <View style={uic.verifiedBadge}>
          <Text style={uic.verifiedText}>✓ Vérifié</Text>
        </View>
      </View>
      <View style={uic.divider} />
      <View style={uic.rows}>
        <View style={uic.row}>
          <Text style={uic.rowLabel}>Appareil</Text>
          <Text style={uic.rowVal}>{payload.device_id?.substring(0, 16)}…</Text>
        </View>
        <View style={uic.row}>
          <Text style={uic.rowLabel}>Nonce</Text>
          <Text style={uic.rowVal}>{payload.signup_nonce?.substring(0, 16)}…</Text>
        </View>
        <View style={uic.row}>
          <Text style={uic.rowLabel}>Horodatage</Text>
          <Text style={uic.rowVal}>{new Date(payload.timestamp).toLocaleTimeString()}</Text>
        </View>
        <View style={uic.row}>
          <Text style={uic.rowLabel}>Canal</Text>
          <Text style={[uic.rowVal, { color: C.green }]}>QR Code</Text>
        </View>
      </View>
    </View>
  );
}
const uic = StyleSheet.create({
  wrapper:     { backgroundColor: C.surfaceAlt, borderRadius: 16, padding: 18,
                 borderWidth: 1, borderColor: C.border },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar:      { width: 46, height: 46, borderRadius: 23, backgroundColor: C.greenGlow,
                 borderWidth: 2, borderColor: C.greenDim,
                 alignItems: 'center', justifyContent: 'center' },
  avatarText:  { color: C.green, fontSize: 20, fontWeight: '700' },
  info:        { flex: 1, gap: 3 },
  name:        { color: C.text, fontSize: 16, fontWeight: '700' },
  phone:       { color: C.textMuted, fontSize: 13 },
  verifiedBadge: { backgroundColor: C.greenGlow, paddingHorizontal: 10, paddingVertical: 5,
                   borderRadius: 10, borderWidth: 1, borderColor: C.greenDim },
  verifiedText:  { color: C.green, fontSize: 11, fontWeight: '700' },
  divider:     { height: 1, backgroundColor: C.border, marginBottom: 12 },
  rows:        { gap: 8 },
  row:         { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel:    { color: C.textMuted, fontSize: 12 },
  rowVal:      { color: C.text, fontSize: 12, fontFamily: 'monospace' },
});

// ─── ÉCRAN PRINCIPAL KIOSQUE ──────────────────────────────────
export default function KioskValidationScreen({ navigation, route }) {
  // En prod, kioskId vient du profil kiosque stocké localement
  const kioskId      = route?.params?.kioskId || 'kiosk_' + Math.random().toString(36).substring(2, 10);
  const kioskPrivKey = route?.params?.kioskPrivKey || 'kiosk_mock_priv_key';

  const [step,          setStep]         = useState(KIOSK_STEP.READY);
  const [scannedPayload, setScannedPayload] = useState(null);
  const [ackData,        setAckData]       = useState(null);
  const [errorMsg,       setErrorMsg]      = useState('');
  const [permission,     requestPermission] = useCameraPermissions();

  const scannedRef  = useRef(false);
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const ackFadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    if (!permission?.granted) requestPermission();
  }, []);

  // Pulse sur le QR ACK pour attirer l'attention
  useEffect(() => {
    if (step !== KIOSK_STEP.SHOW_ACK) return;
    Animated.timing(ackFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [step]);

  // ── Handler: QR utilisateur scanné ───────────────────────
  const handleUserQrScanned = useCallback((data) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setStep(KIOSK_STEP.VALIDATING);

    setTimeout(() => {
      // 1. Valider le QR
      const validation = QrSignupService.validateUserQr(data, kioskId);

      if (!validation.valid) {
        setErrorMsg(validation.error);
        setStep(KIOSK_STEP.ERROR);
        return;
      }

      const { payload } = validation;
      setScannedPayload(payload);

      // 2. Générer le QR ACK
      const ack = QrSignupService.generateKioskAckQr(payload, kioskId, kioskPrivKey);
      setAckData(ack);

      // 3. Construire + enqueue SyncQueue kiosque
      const syncPayload = QrSignupService.buildKioskSyncPayload({
        userPayload:       payload,
        verificationToken: ack.verificationToken,
        kioskId,
        validatedAt:       ack.ackPayload.validated_at,
        appVersion:        '1.0.0',
      });
      // TODO: SyncQueueService.enqueue(syncPayload);
      console.log('[Kiosk] SyncQueue payload prêt:', syncPayload);

      // 4. Afficher le QR ACK
      setStep(KIOSK_STEP.SHOW_ACK);
    }, 900);
  }, [kioskId, kioskPrivKey]);

  // ── Réinitialiser pour valider un autre user ─────────────
  const handleReset = useCallback(() => {
    scannedRef.current = false;
    setStep(KIOSK_STEP.READY);
    setScannedPayload(null);
    setAckData(null);
    setErrorMsg('');
    ackFadeAnim.setValue(0);
    pulseAnim.setValue(1);
  }, []);

  // ─────────────────────────────────────────────────────────
  // RENDUS
  // ─────────────────────────────────────────────────────────

  const renderReady = () => (
    <View style={s.readyWrapper}>
      <View style={s.kioskBadge}>
        <Text style={s.kioskBadgeIcon}>🏪</Text>
        <View>
          <Text style={s.kioskBadgeLabel}>KIOSQUE ACTIF</Text>
          <Text style={s.kioskBadgeId}>{kioskId.substring(0, 20)}…</Text>
        </View>
      </View>

      <View style={s.readyHint}>
        <Text style={s.readyHintIcon}>📱</Text>
        <Text style={s.readyHintText}>
          Demandez à l'utilisateur d'afficher son QR d'inscription sur son téléphone, puis appuyez sur Scanner.
        </Text>
      </View>

      <TouchableOpacity
        style={s.btnBigScan}
        onPress={() => { scannedRef.current = false; setStep(KIOSK_STEP.SCANNING); }}
      >
        <Text style={s.btnBigScanIcon}>⊡</Text>
        <Text style={s.btnBigScanText}>Scanner le QR utilisateur</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScanning = () => (
    <View style={s.scanWrapper}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={({ data }) => handleUserQrScanned(data)}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      {/* Overlay */}
      <View style={s.scanOverlay}>
        <View style={s.scanTopShade} />
        <View style={s.scanMiddle}>
          <View style={s.scanSide} />
          <View style={s.scanFrame}>
            <Corner style={{ top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 }} />
            <Corner style={{ top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 }} />
            <Corner style={{ bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 }} />
            <Corner style={{ bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 }} />
            <Text style={s.scanFrameLabel}>QR Yabisso</Text>
          </View>
          <View style={s.scanSide} />
        </View>
        <View style={s.scanBottom}>
          <Text style={s.scanHint}>Pointez vers le QR sur le téléphone de l'utilisateur</Text>
          <TouchableOpacity style={s.scanCancelBtn} onPress={() => setStep(KIOSK_STEP.READY)}>
            <Text style={s.scanCancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderValidating = () => (
    <View style={s.centeredBlock}>
      <ValidatingSpinner />
      <Text style={s.validatingText}>Validation…</Text>
      <Text style={s.validatingSubText}>Vérification signature Ed25519</Text>
    </View>
  );

  const renderShowAck = () => (
    <Animated.View style={[s.ackWrapper, { opacity: ackFadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 18, paddingBottom: 24 }}>

        {/* Header succès */}
        <View style={s.ackSuccessHeader}>
          <View style={s.ackCheckCircle}>
            <Text style={s.ackCheckIcon}>✓</Text>
          </View>
          <View style={s.ackSuccessText}>
            <Text style={s.ackSuccessTitle}>Utilisateur validé</Text>
            <Text style={s.ackSuccessSub}>Enregistré localement · Sync en attente</Text>
          </View>
        </View>

        {/* Infos utilisateur */}
        {scannedPayload && <UserInfoCard payload={scannedPayload} />}

        {/* QR ACK à montrer à l'utilisateur */}
        <View style={s.ackQrSection}>
          <Text style={s.ackQrLabel}>MONTREZ CE QR À L'UTILISATEUR</Text>
          <Text style={s.ackQrSub}>Il doit le scanner avec son téléphone pour finaliser</Text>
          <Animated.View style={[s.ackQrCard, { transform: [{ scale: pulseAnim }] }]}>
            <Corner style={{ top: 10, left: 10, borderRightWidth: 0, borderBottomWidth: 0 }} />
            <Corner style={{ top: 10, right: 10, borderLeftWidth: 0, borderBottomWidth: 0 }} />
            <Corner style={{ bottom: 10, left: 10, borderRightWidth: 0, borderTopWidth: 0 }} />
            <Corner style={{ bottom: 10, right: 10, borderLeftWidth: 0, borderTopWidth: 0 }} />
            {ackData && (
              <QRCode
                value={ackData.qrString}
                size={220}
                color={C.text}
                backgroundColor={C.surfaceAlt}
                quietZone={12}
              />
            )}
          </Animated.View>
          <View style={s.ackTokenBox}>
            <Text style={s.ackTokenLabel}>TOKEN DE VÉRIFICATION</Text>
            <Text style={s.ackTokenVal}>{ackData?.verificationToken}</Text>
          </View>
        </View>

        {/* Info sync */}
        <View style={s.syncInfoBox}>
          <Text style={s.syncInfoIcon}>⏱</Text>
          <Text style={s.syncInfoText}>
            Les données de cet utilisateur sont enregistrées localement et seront synchronisées avec Supabase dès que ce kiosque sera en ligne.
          </Text>
        </View>

        {/* Bouton valider suivant */}
        <TouchableOpacity style={s.btnNext} onPress={handleReset}>
          <Text style={s.btnNextText}>Valider l'utilisateur suivant →</Text>
        </TouchableOpacity>

      </ScrollView>
    </Animated.View>
  );

  const renderError = () => (
    <View style={s.centeredBlock}>
      <View style={s.errorCircle}>
        <Text style={s.errorCircleIcon}>✕</Text>
      </View>
      <Text style={s.errorTitle}>QR invalide</Text>
      <Text style={s.errorMsg}>{errorMsg}</Text>
      <TouchableOpacity style={s.btnRetry} onPress={handleReset}>
        <Text style={s.btnRetryText}>Scanner un autre QR</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <Animated.View style={[s.container, { opacity: fadeAnim }]}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack()}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTag}>KIOSQUE YABISSO</Text>
            <Text style={s.headerTitle}>Validation inscription</Text>
          </View>
          <View style={s.onlineIndicator}>
            <View style={s.onlineDot} />
            <Text style={s.onlineText}>Offline</Text>
          </View>
        </View>

        {/* Contenu */}
        <View style={s.body}>
          {step === KIOSK_STEP.READY      && renderReady()}
          {step === KIOSK_STEP.SCANNING   && renderScanning()}
          {step === KIOSK_STEP.VALIDATING && renderValidating()}
          {step === KIOSK_STEP.SHOW_ACK   && renderShowAck()}
          {step === KIOSK_STEP.ERROR      && renderError()}
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Spinner validation ───────────────────────────────────────
function ValidatingSpinner() {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 900, useNativeDriver: true })
    ).start();
  }, []);
  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[vsp.ring, { transform: [{ rotate: spin }] }]}>
      <View style={vsp.arc} />
    </Animated.View>
  );
}
const vsp = StyleSheet.create({
  ring: { width: 72, height: 72, borderRadius: 36,
          borderWidth: 3, borderColor: C.green,
          borderTopColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  arc:  { width: 10, height: 10, borderRadius: 5, backgroundColor: C.green,
          position: 'absolute', top: 2 },
});

// ─── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  container:    { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  backBtn:      { width: 40, height: 40, borderRadius: 12, backgroundColor: C.surface,
                  borderWidth: 1, borderColor: C.border,
                  alignItems: 'center', justifyContent: 'center' },
  backIcon:     { color: C.text, fontSize: 18 },
  headerCenter: { flex: 1, gap: 2 },
  headerTag:    { color: C.green, fontSize: 9, fontWeight: '700', letterSpacing: 3 },
  headerTitle:  { color: C.text, fontSize: 18, fontWeight: '700' },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5,
                     backgroundColor: C.surfaceAlt, paddingHorizontal: 10, paddingVertical: 5,
                     borderRadius: 10, borderWidth: 1, borderColor: C.border },
  onlineDot:    { width: 7, height: 7, borderRadius: 4, backgroundColor: C.warning },
  onlineText:   { color: C.warning, fontSize: 11, fontWeight: '600' },
  body:         { flex: 1, paddingHorizontal: 20 },

  // Ready
  readyWrapper: { flex: 1, justifyContent: 'center', gap: 24 },
  kioskBadge:   { flexDirection: 'row', alignItems: 'center', gap: 14,
                  backgroundColor: C.surface, borderRadius: 16, padding: 18,
                  borderWidth: 1, borderColor: C.border },
  kioskBadgeIcon: { fontSize: 32 },
  kioskBadgeLabel:{ color: C.green, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  kioskBadgeId:   { color: C.textMuted, fontSize: 11, fontFamily: 'monospace' },
  readyHint:    { flexDirection: 'row', gap: 12, backgroundColor: C.surfaceAlt,
                  borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  readyHintIcon:{ fontSize: 24 },
  readyHintText:{ flex: 1, color: C.textMuted, fontSize: 14, lineHeight: 22 },
  btnBigScan:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 12, height: 60, backgroundColor: C.green, borderRadius: 18 },
  btnBigScanIcon: { color: C.bg, fontSize: 24 },
  btnBigScanText: { color: C.bg, fontSize: 17, fontWeight: '800' },

  // Scanning
  scanWrapper:  { flex: 1, borderRadius: 16, overflow: 'hidden' },
  scanOverlay:  { ...StyleSheet.absoluteFillObject },
  scanTopShade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  scanMiddle:   { flexDirection: 'row', height: 250 },
  scanSide:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  scanFrame:    { width: 250, height: 250, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 8 },
  scanFrameLabel: { color: C.green, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  scanBottom:   { flex: 1.2, backgroundColor: 'rgba(0,0,0,0.65)',
                  alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 32 },
  scanHint:     { color: '#fff', fontSize: 14, textAlign: 'center', lineHeight: 22, opacity: 0.85 },
  scanCancelBtn:{ paddingHorizontal: 28, paddingVertical: 11,
                  borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  scanCancelText: { color: '#fff', fontSize: 14 },

  // Validating / centered
  centeredBlock:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  validatingText:    { color: C.text, fontSize: 20, fontWeight: '700' },
  validatingSubText: { color: C.textMuted, fontSize: 13 },

  // ACK
  ackWrapper:        { flex: 1 },
  ackSuccessHeader:  { flexDirection: 'row', alignItems: 'center', gap: 14,
                       backgroundColor: C.surface, borderRadius: 16, padding: 16,
                       borderWidth: 1, borderColor: C.greenDim },
  ackCheckCircle:    { width: 46, height: 46, borderRadius: 23,
                       backgroundColor: C.greenGlow, borderWidth: 2, borderColor: C.green,
                       alignItems: 'center', justifyContent: 'center' },
  ackCheckIcon:      { color: C.green, fontSize: 22, fontWeight: '700' },
  ackSuccessText:    { flex: 1, gap: 3 },
  ackSuccessTitle:   { color: C.green, fontSize: 16, fontWeight: '700' },
  ackSuccessSub:     { color: C.textMuted, fontSize: 12 },
  ackQrSection:      { alignItems: 'center', gap: 12 },
  ackQrLabel:        { color: C.green, fontSize: 10, fontWeight: '700', letterSpacing: 3 },
  ackQrSub:          { color: C.textMuted, fontSize: 13, textAlign: 'center' },
  ackQrCard:         { backgroundColor: C.surfaceAlt, borderRadius: 20, padding: 24,
                       borderWidth: 2, borderColor: C.border },
  ackTokenBox:       { backgroundColor: C.surface, borderRadius: 12, padding: 14,
                       width: '100%', borderWidth: 1, borderColor: C.border },
  ackTokenLabel:     { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 5 },
  ackTokenVal:       { color: C.text, fontSize: 13, fontFamily: 'monospace' },
  syncInfoBox:       { flexDirection: 'row', gap: 10, backgroundColor: C.surfaceAlt,
                       borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  syncInfoIcon:      { fontSize: 16 },
  syncInfoText:      { flex: 1, color: C.textMuted, fontSize: 12, lineHeight: 19 },
  btnNext:           { height: 56, backgroundColor: C.green, borderRadius: 16,
                       alignItems: 'center', justifyContent: 'center' },
  btnNextText:       { color: C.bg, fontSize: 16, fontWeight: '800' },

  // Error
  errorCircle:     { width: 70, height: 70, borderRadius: 35,
                     backgroundColor: 'rgba(255,69,96,0.1)', borderWidth: 2, borderColor: C.error,
                     alignItems: 'center', justifyContent: 'center' },
  errorCircleIcon: { color: C.error, fontSize: 30, fontWeight: '700' },
  errorTitle:      { color: C.error, fontSize: 22, fontWeight: '700' },
  errorMsg:        { color: C.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  btnRetry:        { height: 52, paddingHorizontal: 36, backgroundColor: C.surfaceAlt,
                     borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                     borderWidth: 1, borderColor: C.error },
  btnRetryText:    { color: C.error, fontWeight: '600', fontSize: 15 },
});
