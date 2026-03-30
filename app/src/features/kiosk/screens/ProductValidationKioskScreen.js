// app/src/features/kiosk/screens/ProductValidationKioskScreen.js
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import { UniversalValidationService, VALIDATION_TYPES } from '../services/UniversalValidationService';

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
  purple:     '#A855F7',
};

const STEP = {
  READY:      'READY',
  SCANNING:   'SCANNING',
  PREVIEW:    'PREVIEW',
  VALIDATING: 'VALIDATING', // Traitement DB
  PROPAGATING:'PROPAGATING',// Mesh update
  SUCCESS:    'SUCCESS',
  ERROR:      'ERROR',
};

export default function ProductValidationKioskScreen({ navigation }) {
  const [step, setStep] = useState(STEP.READY);
  const [scannedEntity, setScannedEntity] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [errorMsg, setErrorMsg] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const meshAnim = useRef(new Animated.Value(0)).current;
  const scannedRef = useRef(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    if (!permission?.granted) requestPermission();
  }, []);

  // Animation de propagation Mesh
  useEffect(() => {
    if (step === STEP.PROPAGATING) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(meshAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(meshAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        ])
      ).start();

      // Propagation RÉELLE via MeshSyncService
      const startPropagation = async () => {
        try {
          const validatedPayload = await UniversalValidationService.signValidation(scannedEntity, 'KIOSK_MAIN_01');
          await MeshSyncService.broadcast(validatedPayload.type, validatedPayload, validatedPayload.image_url);
          setStep(STEP.SUCCESS);
        } catch (e) {
          setErrorMsg('Erreur propagation : ' + e.message);
          setStep(STEP.ERROR);
        }
      };
      
      startPropagation();
    }
  }, [step, scannedEntity]);

  const handleQrScanned = useCallback(async (data) => {
    if (scannedRef.current) return;
    scannedRef.current = true;

    try {
      const result = UniversalValidationService.validateServiceQr(data);
      if (!result.valid) throw new Error(result.error);

      setScannedEntity(result.payload);
      setStep(STEP.PREVIEW);
    } catch (e) {
      setErrorMsg(e.message);
      setStep(STEP.ERROR);
    }
  }, []);

  const handleApprove = async () => {
    setStep(STEP.VALIDATING);
    try {
      // Simulate generic Kiosk ID
      const kioskId = 'KIOSK_MAIN_01';

      await database.write(async () => {
        const table = _getTableName(scannedEntity.type);
        const collection = database.get(table);
        
        // 1. Recherche du record existant
        const records = await collection.query(Q.where('id', scannedEntity.id)).fetch();
        
        if (records.length > 0) {
          // Mise à jour si déjà présent (sync préalable ou mesh)
          await records[0].update(record => {
            record.isValidated = true;
            if (record.productSyncStatus) record.productSyncStatus = 'pending';
          });
        } else {
          // 2. CRÉATION OFFLINE si absent
          // Le record est créé sur la base des données du QR signé
          await collection.create(record => {
            record._raw.id = scannedEntity.id; // On force l'ID du QR
            record.name = scannedEntity.name;
            record.price = parseFloat(scannedEntity.price);
            record.sellerId = scannedEntity.sellerId;
            record.isValidated = true;
            if (scannedEntity.type === VALIDATION_TYPES.MARKETPLACE_PRODUCT) {
              record.productSyncStatus = 'pending';
            }
          });
        }
        
        // 3. Ajout à la file de synchronisation globale
        await database.get('sync_queue').create(item => {
          item.action = 'VALIDATE_ENTITY';
          item.payloadJson = JSON.stringify({ 
            entityId: scannedEntity.id, 
            type: scannedEntity.type,
            validatedBy: kioskId,
            timestamp: Date.now()
          });
          item.status = 'pending';
        });
      });

      // 4. Lancement de la propagation MESH
      setStep(STEP.PROPAGATING);
    } catch (e) {
      setErrorMsg('Erreur de validation : ' + e.message);
      setStep(STEP.ERROR);
    }
  };

  const _getTableName = (type) => {
    switch(type) {
      case VALIDATION_TYPES.MARKETPLACE_PRODUCT: return 'products';
      case VALIDATION_TYPES.HOTEL_ROOM:          return 'hotel_rooms'; // À adapter selon schéma futur
      default: return 'products'; 
    }
  };

  const reset = () => {
    scannedRef.current = false;
    setStep(STEP.READY);
    setScannedEntity(null);
    setErrorMsg('');
  };

  const renderReady = () => (
    <View style={s.readyWrapper}>
      <View style={s.kioskBadge}>
        <MaterialCommunityIcons name="shield-check" size={32} color={C.green} />
        <View>
          <Text style={s.kioskBadgeLabel}>KIOSQUE YABISSO</Text>
          <Text style={s.kioskBadgeTitle}>Validation Universelle</Text>
        </View>
      </View>
      
      <View style={s.readyHint}>
        <Text style={s.readyHintText}>
          Scannez le QR Code pour valider un produit, une chambre d'hôtel ou n'importe quel service.{"\n\n"}
          <Text style={{ color: C.green }}>Validation = Publication immédiate sur le Mesh Bluetooth/WiFi local.</Text>
        </Text>
      </View>

      <TouchableOpacity style={s.btnBigScan} onPress={() => setStep(STEP.SCANNING)}>
        <MaterialCommunityIcons name="qrcode-scan" size={24} color={C.bg} />
        <Text style={s.btnBigScanText}>Scanner le QR de Service</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScanning = () => (
    <View style={s.scanWrapper}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={({ data }) => handleQrScanned(data)}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      <View style={s.scanOverlay}>
        <View style={s.scanFrame} />
        <Text style={s.scanHint}>Détection automatique Yabisso</Text>
        <TouchableOpacity style={s.scanCancelBtn} onPress={() => setStep(STEP.READY)}>
          <Text style={s.scanCancelText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPreview = () => (
    <ScrollView contentContainerStyle={s.previewWrapper}>
      <View style={s.previewHeader}>
        <View style={[s.previewIconBg, { backgroundColor: _getIconColor(scannedEntity?.type, true) }]}>
          <MaterialCommunityIcons name={_getIcon(scannedEntity?.type)} size={40} color={_getIconColor(scannedEntity?.type)} />
        </View>
        <Text style={s.previewTitle}>Demande de Publication</Text>
        <Text style={s.previewTypeBadge}>{scannedEntity?.type?.replace('_', ' ').toUpperCase()}</Text>
      </View>

      <View style={s.productCard}>
        <View style={s.cardRow}>
          <Text style={s.cardLabel}>Désignation</Text>
          <Text style={s.cardValue}>{scannedEntity?.name}</Text>
        </View>
        <View style={s.cardRow}>
          <Text style={s.cardLabel}>Prix unitaire</Text>
          <Text style={[s.cardValue, { color: C.green }]}>{scannedEntity?.price} XAF</Text>
        </View>
        <View style={s.cardRow}>
          <Text style={s.cardLabel}>Prestataire / Vendeur</Text>
          <Text style={s.cardValue}>{scannedEntity?.sellerName || 'Vendeur Certifié'}</Text>
        </View>
      </View>

      <View style={s.infoBox}>
        <MaterialCommunityIcons name="broadcast" size={24} color={C.blue} />
        <Text style={s.infoText}>
          Une fois validé, cet élément sera synchronisé avec le Cloud ET partagé avec tous les utilisateurs à proximité via Bluetooth Mesh.
        </Text>
      </View>

      <TouchableOpacity style={s.btnValidate} onPress={handleApprove}>
        <Text style={s.btnValidateText}>Approuver & Propager</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={s.btnCancel} onPress={reset}>
        <Text style={s.btnCancelText}>Rejeter</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPropagating = () => (
    <View style={s.centeredBlock}>
      <Animated.View style={[s.meshCircle, { opacity: meshAnim, transform: [{ scale: meshAnim.interpolate({inputRange: [0.3, 1], outputRange: [1, 1.2]}) }] }]}>
        <MaterialCommunityIcons name="broadcast" size={60} color={C.blue} />
      </Animated.View>
      <Text style={s.successTitle}>Propagation en cours…</Text>
      <Text style={s.successMsg}>Mise à jour du réseau mesh local Bluetooth & WiFi Direct.</Text>
      <View style={s.meshGrid}>
        {[1,2,3,4].map(i => <View key={i} style={s.meshNode} />)}
      </View>
    </View>
  );

  const renderSuccess = () => (
    <View style={s.centeredBlock}>
      <View style={s.successCircle}>
        <Ionicons name="checkmark" size={54} color={C.green} />
      </View>
      <Text style={s.successTitle}>Succès Total</Text>
      <Text style={s.successMsg}>L'élément a été publié. Les utilisateurs à proximité peuvent désormais le consulter sans internet.</Text>
      <TouchableOpacity style={s.btnBigScan} onPress={reset}>
        <Text style={s.btnBigScanText}>Nouveau Scan</Text>
      </TouchableOpacity>
    </View>
  );

  const _getIcon = (type) => {
    switch(type) {
      case VALIDATION_TYPES.HOTEL_ROOM: return 'bed-outline';
      case VALIDATION_TYPES.RESTAURANT_DISH: return 'silverware-fork-knife';
      default: return 'package-variant';
    }
  };

  const _getIconColor = (type, dim = false) => {
    const color = (type === VALIDATION_TYPES.HOTEL_ROOM) ? C.purple : C.blue;
    return dim ? `${color}1A` : color;
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[s.container, { opacity: fadeAnim }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="close" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Validation Kiosque</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={s.content}>
          {step === STEP.READY && renderReady()}
          {step === STEP.SCANNING && renderScanning()}
          {step === STEP.PREVIEW && renderPreview()}
          {(step === STEP.VALIDATING || step === STEP.PROPAGATING) && renderPropagating()}
          {step === STEP.SUCCESS && renderSuccess()}
          {step === STEP.ERROR && renderError()}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { color: C.text, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  backBtn: { padding: 5, backgroundColor: C.surface, borderRadius: 10 },
  content: { flex: 1, padding: 20 },
  
  readyWrapper: { flex: 1, justifyContent: 'center', gap: 30 },
  kioskBadge: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: C.surface, padding: 25, borderRadius: 24, borderWidth: 1, borderColor: C.border },
  kioskBadgeLabel: { color: C.textMuted, fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  kioskBadgeTitle: { color: C.text, fontSize: 18, fontWeight: '800' },
  readyHint: { backgroundColor: C.surfaceAlt, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  readyHintText: { color: C.textMuted, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  btnBigScan: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, height: 64, backgroundColor: C.green, borderRadius: 20 },
  btnBigScanText: { color: C.bg, fontSize: 17, fontWeight: 'bold' },
  
  scanWrapper: { flex: 1, borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: C.border },
  scanOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 260, height: 260, borderWidth: 2, borderColor: C.green, borderRadius: 30 },
  scanHint: { color: '#fff', marginTop: 30, fontSize: 14, letterSpacing: 1 },
  scanCancelBtn: { marginTop: 40, padding: 15, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15 },
  scanCancelText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  previewWrapper: { gap: 24, paddingBottom: 40 },
  previewHeader: { alignItems: 'center', gap: 12 },
  previewIconBg: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  previewTitle: { color: C.text, fontSize: 24, fontWeight: 'bold' },
  previewTypeBadge: { backgroundColor: C.surfaceAlt, color: C.blue, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, fontSize: 10, fontWeight: 'bold', borderWidth: 1, borderColor: C.border },
  productCard: { backgroundColor: C.surface, borderRadius: 24, padding: 24, gap: 18, borderWidth: 1, borderColor: C.border },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { color: C.textMuted, fontSize: 14 },
  cardValue: { color: C.text, fontSize: 16, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  infoBox: { flexDirection: 'row', gap: 15, backgroundColor: 'rgba(77, 159, 255, 0.08)', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(77, 159, 255, 0.2)' },
  infoText: { flex: 1, color: C.blue, fontSize: 13, lineHeight: 20 },
  btnValidate: { height: 60, backgroundColor: C.green, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: C.green, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnValidateText: { color: C.bg, fontSize: 17, fontWeight: '900' },
  btnCancel: { height: 50, alignItems: 'center', justifyContent: 'center' },
  btnCancelText: { color: C.error, fontSize: 15, fontWeight: '600' },
  
  centeredBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  meshCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(77, 159, 255, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.blue },
  successCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: C.greenGlow, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.green },
  successTitle: { color: C.text, fontSize: 26, fontWeight: 'bold' },
  successMsg: { color: C.textMuted, textAlign: 'center', paddingHorizontal: 40, lineHeight: 24, fontSize: 15 },
  meshGrid: { flexDirection: 'row', gap: 10, marginTop: 10 },
  meshNode: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.blue },
  errorCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 69, 96, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.error },
  errorTitle: { color: C.error, fontSize: 24, fontWeight: 'bold' },
  errorMsg: { color: C.textMuted, textAlign: 'center', paddingHorizontal: 40 },
  btnRetry: { padding: 15, borderRadius: 12, borderWidth: 1, borderColor: C.error, marginTop: 10 },
  btnRetryText: { color: C.error, fontWeight: 'bold' },
});
