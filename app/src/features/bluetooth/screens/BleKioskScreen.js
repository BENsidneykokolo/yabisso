// app/src/features/bluetooth/screens/BleKioskScreen.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, FlatList, Animated,
} from 'react-native';
import { BleManager, State } from 'react-native-ble-plx';
import { BleSignupService } from '../services/BleSignupService';
import { NetworkPermissionsService } from '../services/NetworkPermissionsService';
import { YABISSO_SERVICE_UUID, SIGNUP_CHAR_UUID, ACK_CHAR_UUID } from '../hooks/useBleP2P';

const C = {
  bg: '#0D0F14', surface: '#161920', surfaceAlt: '#1E2230',
  border: '#2A2F3E', green: '#2BEE79', greenDim: '#1A9B4E',
  greenGlow: 'rgba(43,238,121,0.15)', text: '#F0F2F8',
  textMuted: '#7A849A', textDim: '#4A5268',
  error: '#FF4D6A', warning: '#FFB547', blue: '#4D9FFF',
};

const STATUS = {
  IDLE:       { label: 'Kiosque inactif',   color: C.textDim,   dot: '○' },
  LISTENING:  { label: 'En écoute…',        color: C.blue,      dot: '◉' },
  RECEIVING:  { label: 'Réception en cours', color: C.warning,  dot: '◎' },
  VALIDATING: { label: 'Validation…',       color: C.warning,   dot: '⊙' },
  VALIDATED:  { label: 'Inscription validée', color: C.green,   dot: '●' },
  REJECTED:   { label: 'Rejeté',            color: C.error,     dot: '✕' },
};

function SignupCard({ item, onValidate, onReject }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0,  duration: 350, useNativeDriver: true }),
      Animated.timing(opacAnim,  { toValue: 1,  duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const statusInfo = STATUS[item.status] || STATUS.RECEIVING;

  return (
    <Animated.View style={[card.wrapper, { opacity: opacAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={card.header}>
        <View style={card.headerLeft}>
          <Text style={card.phone}>{item.payload?.phone || 'Téléphone inconnu'}</Text>
          <Text style={card.device}>📱 {item.payload?.device_id?.substring(0, 12) || '—'}…</Text>
        </View>
        <View style={[card.statusBadge, { borderColor: statusInfo.color }]}>
          <Text style={[card.statusDot, { color: statusInfo.color }]}>{statusInfo.dot}</Text>
          <Text style={[card.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>
      </View>

      <View style={card.meta}>
        <Text style={card.metaItem}>
          🕐 {new Date(item.receivedAt).toLocaleTimeString()}
        </Text>
        <Text style={card.metaItem}>
          📡 {item.payload?.channel || 'BLE'}
        </Text>
        <Text style={card.metaItem}>
          🔑 v{item.payload?.version || 1}
        </Text>
      </View>

      {item.validationError && (
        <View style={card.errorBox}>
          <Text style={card.errorText}>⚠️ {item.validationError}</Text>
        </View>
      )}

      {item.verificationToken && (
        <View style={card.tokenBox}>
          <Text style={card.tokenLabel}>TOKEN ENVOYÉ</Text>
          <Text style={card.tokenValue}>{item.verificationToken}</Text>
        </View>
      )}

      {item.status === 'RECEIVING' && item.progress < 100 && (
        <View style={card.progressBar}>
          <View style={[card.progressFill, { width: `${item.progress}%` }]} />
        </View>
      )}

      {item.status === 'VALIDATING' && (
        <View style={card.actions}>
          <TouchableOpacity style={card.btnValidate} onPress={() => onValidate(item.id)}>
            <Text style={card.btnValidateText}>✓ Valider</Text>
          </TouchableOpacity>
          <TouchableOpacity style={card.btnReject} onPress={() => onReject(item.id)}>
            <Text style={card.btnRejectText}>✕ Rejeter</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

const card = StyleSheet.create({
  wrapper:      { backgroundColor: C.surface, borderRadius: 16, padding: 18, marginBottom: 12,
                  borderWidth: 1, borderColor: C.border },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  headerLeft:   { gap: 4 },
  phone:        { color: C.text, fontSize: 17, fontWeight: '700' },
  device:       { color: C.textMuted, fontSize: 12 },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5,
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  statusDot:    { fontSize: 10 },
  statusLabel:  { fontSize: 11, fontWeight: '600' },
  meta:         { flexDirection: 'row', gap: 14, marginBottom: 10 },
  metaItem:     { color: C.textMuted, fontSize: 12 },
  errorBox:     { backgroundColor: 'rgba(255,77,106,0.1)', borderRadius: 8, padding: 10, marginBottom: 8 },
  errorText:    { color: C.error, fontSize: 12 },
  tokenBox:     { backgroundColor: C.surfaceAlt, borderRadius: 10, padding: 12, marginBottom: 8 },
  tokenLabel:   { color: C.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  tokenValue:   { color: C.green, fontSize: 12, fontFamily: 'monospace' },
  progressBar:  { height: 4, backgroundColor: C.border, borderRadius: 2, marginBottom: 10 },
  progressFill: { height: 4, backgroundColor: C.blue, borderRadius: 2 },
  actions:      { flexDirection: 'row', gap: 10 },
  btnValidate:  { flex: 1, height: 44, backgroundColor: C.green, borderRadius: 10,
                  alignItems: 'center', justifyContent: 'center' },
  btnValidateText: { color: C.bg, fontWeight: '700', fontSize: 14 },
  btnReject:    { flex: 1, height: 44, backgroundColor: C.surfaceAlt, borderRadius: 10,
                  alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.error },
  btnRejectText: { color: C.error, fontWeight: '600', fontSize: 14 },
});

// ─── ÉCRAN PRINCIPAL KIOSQUE ─────────────────────────────────
export default function BleKioskScreen({ navigation }) {
  const managerRef  = useRef(null);
  const chunksRef   = useRef(new Map()); // phone -> { chunks, total }

  const [isListening, setIsListening] = useState(false);
  const [signups,     setSignups]     = useState([]);
  const [kioskStatus, setKioskStatus] = useState('IDLE');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    managerRef.current = new BleManager();
    return () => managerRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,   duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const _updateSignup = useCallback((id, updates) => {
    setSignups(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  // ── Démarrer le kiosque en écoute ────────────────────────
  const startListening = useCallback(async () => {
    const granted = await NetworkPermissionsService.requestAll();
    if (!granted) return;

    const state = await managerRef.current.state();
    if (state !== State.PoweredOn) return;

    setIsListening(true);
    setKioskStatus('LISTENING');

    // Scan pour les devices qui envoient le service UUID Yabisso
    // Note: en Phase 1 le SENDER advertise son UUID
    // En Phase 3 on inverse avec react-native-ble-advertiser
    managerRef.current.startDeviceScan(
      null, // Scan tous pour Phase 1
      { allowDuplicates: false },
      async (err, device) => {
        if (err || !device) return;

        // Filtrer les devices Yabisso par nom (Phase 1 simple)
        if (!device.name?.includes('Yabisso')) return;

        const signupId = `signup_${device.id}_${Date.now()}`;

        // Ajouter à la liste
        setSignups(prev => [...prev, {
          id:       signupId,
          deviceId: device.id,
          status:   'RECEIVING',
          progress: 0,
          receivedAt: Date.now(),
          payload:  null,
          verificationToken: null,
          validationError: null,
        }]);

        setKioskStatus('RECEIVING');

        try {
          const connected  = await device.connect();
          const discovered = await connected.discoverAllServicesAndCharacteristics();

          // Lire les chunks du SIGNUP_CHAR
          const chunksMap = new Map();
          let   totalChunks = null;

          discovered.monitorCharacteristicForService(
            YABISSO_SERVICE_UUID,
            SIGNUP_CHAR_UUID,
            (monErr, char) => {
              if (monErr) {
                _updateSignup(signupId, { status: 'REJECTED', validationError: monErr.message });
                return;
              }

              const chunk = BleSignupService.decodeChunk(char.value);
              if (!chunk) return;

              chunksMap.set(chunk.index, chunk.slice);
              totalChunks = chunk.total;

              const pct = Math.floor((chunksMap.size / chunk.total) * 100);
              _updateSignup(signupId, { progress: pct });

              // Tous les chunks reçus
              if (chunksMap.size === chunk.total) {
                const payload = BleSignupService.reconstructPayload(chunksMap, chunk.total);
                const { valid, reason } = BleSignupService.validatePayload(payload);

                if (!valid) {
                  _updateSignup(signupId, { status: 'REJECTED', validationError: reason, payload });
                  return;
                }

                // Payload valide → passer en VALIDATING (attente confirmation manuelle)
                _updateSignup(signupId, {
                  status:  'VALIDATING',
                  progress: 100,
                  payload,
                });

                setKioskStatus('VALIDATING');

                // Stocker la ref discovered pour l'ACK
                discovered._signupId = signupId;
                discovered._device   = discovered;
              }
            }
          );
        } catch (e) {
          _updateSignup(signupId, { status: 'REJECTED', validationError: e.message });
        }
      }
    );
  }, [_updateSignup]);

  const stopListening = useCallback(() => {
    managerRef.current?.stopDeviceScan();
    setIsListening(false);
    setKioskStatus('IDLE');
  }, []);

  // ── Valider manuellement ──────────────────────────────────
  const handleValidate = useCallback(async (signupId) => {
    const signup = signups.find(s => s.id === signupId);
    if (!signup?.payload) return;

    const token = BleSignupService.generateVerificationToken(
      signup.payload.phone,
      signup.payload.device_id
    );

    // TODO Phase 2: écrire l'ACK dans la caractéristique ACK_CHAR_UUID
    // Pour Phase 1: on stocke localement et on affiche le token
    _updateSignup(signupId, {
      status: 'VALIDATED',
      verificationToken: token,
    });

    setKioskStatus('VALIDATED');

    // Sauvegarder localement (WatermelonDB) via OfflineSignupService
    // OfflineSignupService.storeValidatedSignup(signup.payload, token);
  }, [signups, _updateSignup]);

  const handleReject = useCallback((signupId) => {
    _updateSignup(signupId, { status: 'REJECTED' });
  }, [_updateSignup]);

  const statusInfo = STATUS[kioskStatus] || STATUS.IDLE;
  const pending    = signups.filter(s => s.status === 'VALIDATING').length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.container}>

        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => { stopListening(); navigation?.goBack(); }}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.titleTag}>MODE KIOSQUE</Text>
            <Text style={s.title}>Validation BLE</Text>
          </View>
          {pending > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{pending}</Text>
            </View>
          )}
        </View>

        {/* ── Status bar ── */}
        <View style={s.statusBar}>
          <Animated.View style={[s.statusDot,
            { backgroundColor: statusInfo.color, transform: [{ scale: isListening ? pulseAnim : 1 }] }]} />
          <Text style={[s.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          <Text style={s.statusCount}>{signups.length} inscription(s)</Text>
        </View>

        {/* ── Liste inscriptions ── */}
        <FlatList
          data={signups}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SignupCard
              item={item}
              onValidate={handleValidate}
              onReject={handleReject}
            />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📡</Text>
              <Text style={s.emptyText}>
                {isListening
                  ? 'En attente d\'un utilisateur Yabisso…\nDemandez-lui d\'ouvrir "Inscription BLE".'
                  : 'Démarrez le kiosque pour recevoir\ndes inscriptions Bluetooth.'}
              </Text>
            </View>
          }
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />

        {/* ── Bouton Start/Stop ── */}
        <TouchableOpacity
          style={[s.bigBtn, isListening && s.bigBtnActive]}
          onPress={isListening ? stopListening : startListening}
        >
          <Text style={s.bigBtnText}>
            {isListening ? '⏹  Arrêter le kiosque' : '▶  Démarrer le kiosque'}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bg },
  container:   { flex: 1, padding: 24, gap: 16 },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
                 backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  backIcon:    { color: C.text, fontSize: 18 },
  headerCenter:{ flex: 1, gap: 2 },
  titleTag:    { color: C.green, fontSize: 10, fontWeight: '700', letterSpacing: 3 },
  title:       { color: C.text, fontSize: 22, fontWeight: '700' },
  badge:       { backgroundColor: C.error, borderRadius: 12, minWidth: 24, height: 24,
                 alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText:   { color: '#fff', fontSize: 12, fontWeight: '700' },

  statusBar:   { flexDirection: 'row', alignItems: 'center', gap: 8,
                 backgroundColor: C.surface, borderRadius: 12, padding: 14,
                 borderWidth: 1, borderColor: C.border },
  statusDot:   { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  statusCount: { color: C.textDim, fontSize: 12 },

  list:        { flexGrow: 1, paddingBottom: 8 },
  empty:       { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyIcon:   { fontSize: 48 },
  emptyText:   { color: C.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },

  bigBtn:      { height: 56, backgroundColor: C.green, borderRadius: 16,
                 alignItems: 'center', justifyContent: 'center' },
  bigBtnActive:{ backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.error },
  bigBtnText:  { color: C.bg, fontSize: 16, fontWeight: '700' },
});
