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
  Image,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

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

const STEP = {
  READY:      'READY',
  SCANNING:   'SCANNING',
  PREVIEW:    'PREVIEW',
  SUCCESS:    'SUCCESS',
  ERROR:      'ERROR',
};

export default function ProductValidationKioskScreen({ navigation }) {
  const [step, setStep] = useState(STEP.READY);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [errorMsg, setErrorMsg] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scannedRef = useRef(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    if (!permission?.granted) requestPermission();
  }, []);

  const handleQrScanned = useCallback(async (data) => {
    if (scannedRef.current) return;
    scannedRef.current = true;

    try {
      const payload = JSON.parse(data);
      if (payload.type !== 'product_validation') {
        throw new Error('QR Code invalide pour la validation de produit.');
      }
      setScannedProduct(payload);
      setStep(STEP.PREVIEW);
    } catch (e) {
      setErrorMsg(e.message);
      setStep(STEP.ERROR);
    }
  }, []);

  const handleValidate = async () => {
    try {
      await database.write(async () => {
        const products = database.get('products');
        // Find the product in local DB if it exists (via sync)
        // Or create/update its status
        const records = await products.query(Q.where('id', scannedProduct.id)).fetch();
        
        if (records.length > 0) {
          await records[0].update(record => {
            record.isValidated = true;
            record.productSyncStatus = 'pending'; // To broadcast validation
          });
        } else {
            // If the kiosk doesn't have the product yet, we might need to create it 
            // or wait for P2P sync. For this prototype, we assume the product 
            // has been received via Bluetooth before validation.
            // But if we want to support "Validation first", we could create a stub.
            // For now, let's assume it exists.
            console.log("Product not found in kiosk DB. Sync needed.");
        }
        
        // Add validation action to sync queue
        await database.get('sync_queue').create(item => {
          item.action = 'VALIDATE_PRODUCT';
          item.payloadJson = JSON.stringify({ productId: scannedProduct.id });
          item.status = 'pending';
        });
      });
      setStep(STEP.SUCCESS);
    } catch (e) {
      setErrorMsg('Erreur lors de la validation : ' + e.message);
      setStep(STEP.ERROR);
    }
  };

  const reset = () => {
    scannedRef.current = false;
    setStep(STEP.READY);
    setScannedProduct(null);
    setErrorMsg('');
  };

  const renderReady = () => (
    <View style={s.readyWrapper}>
      <View style={s.kioskBadge}>
        <MaterialCommunityIcons name="store-check" size={32} color={C.green} />
        <View>
          <Text style={s.kioskBadgeLabel}>KIOSQUE YABISSO</Text>
          <Text style={s.kioskBadgeTitle}>Validateur de Marché</Text>
        </View>
      </View>
      
      <View style={s.readyHint}>
        <Text style={s.readyHintText}>
          Scannez le QR Code généré par le vendeur pour valider la conformité de son produit et le rendre public.
        </Text>
      </View>

      <TouchableOpacity style={s.btnBigScan} onPress={() => setStep(STEP.SCANNING)}>
        <MaterialCommunityIcons name="qrcode-scan" size={24} color={C.bg} />
        <Text style={s.btnBigScanText}>Scanner un Produit</Text>
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
        <Text style={s.scanHint}>Pointez vers le QR Code du produit</Text>
        <TouchableOpacity style={s.scanCancelBtn} onPress={() => setStep(STEP.READY)}>
          <Text style={s.scanCancelText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPreview = () => (
    <ScrollView contentContainerStyle={s.previewWrapper}>
      <View style={s.previewHeader}>
        <View style={s.previewIconBg}>
          <MaterialCommunityIcons name="package-variant" size={40} color={C.blue} />
        </View>
        <Text style={s.previewTitle}>Vérification Produit</Text>
      </View>

      <View style={s.productCard}>
        <View style={s.cardRow}>
          <Text style={s.cardLabel}>Produit</Text>
          <Text style={s.cardValue}>{scannedProduct?.name}</Text>
        </View>
        <View style={s.cardRow}>
          <Text style={s.cardLabel}>Prix</Text>
          <Text style={[s.cardValue, { color: C.green }]}>{scannedProduct?.price} XAF</Text>
        </View>
        <View style={s.cardRow}>
          <Text style={s.cardLabel}>Vendeur</Text>
          <Text style={s.cardValue}>{scannedProduct?.sellerName}</Text>
        </View>
        <View style={s.cardRow}>
            <Text style={s.cardLabel}>ID</Text>
            <Text style={s.cardValueSmall}>{scannedProduct?.id}</Text>
        </View>
      </View>

      <View style={s.warningBox}>
        <MaterialCommunityIcons name="information-outline" size={20} color={C.warning} />
        <Text style={s.warningText}>
          En validant ce produit, vous confirmez qu'il est conforme aux règles de sécurité de Yabisso.
        </Text>
      </View>

      <TouchableOpacity style={s.btnValidate} onPress={handleValidate}>
        <Text style={s.btnValidateText}>Approuver & Publier</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={s.btnCancel} onPress={reset}>
        <Text style={s.btnCancelText}>Annuler</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSuccess = () => (
    <View style={s.centeredBlock}>
      <View style={s.successCircle}>
        <Ionicons name="checkmark" size={48} color={C.green} />
      </View>
      <Text style={s.successTitle}>Produit Validé !</Text>
      <Text style={s.successMsg}>Le produit est maintenant visible sur le marché pour tous les utilisateurs.</Text>
      <TouchableOpacity style={s.btnBigScan} onPress={reset}>
        <Text style={s.btnBigScanText}>Valider un autre produit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={s.centeredBlock}>
      <View style={s.errorCircle}>
        <Ionicons name="close" size={48} color={C.error} />
      </View>
      <Text style={s.errorTitle}>Échec</Text>
      <Text style={s.errorMsg}>{errorMsg}</Text>
      <TouchableOpacity style={s.btnRetry} onPress={reset}>
        <Text style={s.btnRetryText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[s.container, { opacity: fadeAnim }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Validation Marché</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={s.content}>
          {step === STEP.READY && renderReady()}
          {step === STEP.SCANNING && renderScanning()}
          {step === STEP.PREVIEW && renderPreview()}
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
  headerTitle: { color: C.text, fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 5 },
  content: { flex: 1, padding: 20 },
  
  readyWrapper: { flex: 1, justifyContent: 'center', gap: 30 },
  kioskBadge: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: C.surface, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  kioskBadgeLabel: { color: C.green, fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  kioskBadgeTitle: { color: C.text, fontSize: 16, fontWeight: '700' },
  readyHint: { backgroundColor: C.surfaceAlt, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  readyHintText: { color: C.textMuted, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  btnBigScan: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, height: 60, backgroundColor: C.green, borderRadius: 18 },
  btnBigScanText: { color: C.bg, fontSize: 17, fontWeight: 'bold' },
  
  scanWrapper: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  scanOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: C.green, borderRadius: 20, backgroundColor: 'transparent' },
  scanHint: { color: '#fff', marginTop: 30, fontSize: 14 },
  scanCancelBtn: { marginTop: 40, padding: 15 },
  scanCancelText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  previewWrapper: { gap: 24, paddingBottom: 40 },
  previewHeader: { alignItems: 'center', gap: 10 },
  previewIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(77, 159, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },
  previewTitle: { color: C.text, fontSize: 22, fontWeight: 'bold' },
  productCard: { backgroundColor: C.surface, borderRadius: 20, padding: 20, gap: 15, borderWidth: 1, borderColor: C.border },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { color: C.textMuted, fontSize: 14 },
  cardValue: { color: C.text, fontSize: 16, fontWeight: '600', maxWidth: '70%', textAlign: 'right' },
  cardValueSmall: { color: C.textDim, fontSize: 10, fontFamily: 'monospace' },
  warningBox: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(255, 176, 32, 0.1)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 176, 32, 0.2)' },
  warningText: { flex: 1, color: C.warning, fontSize: 13, lineHeight: 18 },
  btnValidate: { height: 56, backgroundColor: C.green, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnValidateText: { color: C.bg, fontSize: 16, fontWeight: 'bold' },
  btnCancel: { height: 56, alignItems: 'center', justifyContent: 'center' },
  btnCancelText: { color: C.textMuted, fontSize: 15 },
  
  centeredBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.greenGlow, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.green },
  successTitle: { color: C.green, fontSize: 24, fontWeight: 'bold' },
  successMsg: { color: C.textMuted, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
  errorCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 69, 96, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.error },
  errorTitle: { color: C.error, fontSize: 24, fontWeight: 'bold' },
  errorMsg: { color: C.textMuted, textAlign: 'center', paddingHorizontal: 40 },
  btnRetry: { padding: 15, borderRadius: 12, borderWidth: 1, borderColor: C.error, marginTop: 10 },
  btnRetryText: { color: C.error, fontWeight: 'bold' },
});
