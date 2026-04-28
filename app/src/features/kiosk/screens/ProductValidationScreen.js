// app/src/features/kiosk/screens/ProductValidationScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { CameraView, useCameraPermissions } from 'expo-camera';
import OfflineValidationService from '../services/OfflineValidationService';
import { VALIDATION_STATUS } from '../services/OfflineValidationService';

const SERVICE_LABELS = {
  marketplace: 'Marché',
  restaurant: 'Restaurant',
  services: 'Services',
  hotel: 'Hôtel',
  real_estate: 'Immobilier',
};

function ProductValidationScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('scan');
  const [pendingValidations, setPendingValidations] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    loadPendingValidations();
  }, []);

  const loadPendingValidations = async () => {
    const pending = await OfflineValidationService.getPendingValidations();
    setPendingValidations(pending);
  };

  const handleScan = async (data) => {
    setShowScanner(false);
    
    const result = await OfflineValidationService.validateQR(data);
    
    if (result.valid) {
      setScannedData(result.payload);
      setShowConfirmModal(true);
    } else {
      Alert.alert('Erreur', result.error || 'QR code invalide');
    }
  };

  const handleApprove = async () => {
    if (!scannedData) return;

    const kioskId = await SecureStore.getItemAsync('kiosk_id') || 'kiosque_001';
    
    const result = await OfflineValidationService.approveValidation(scannedData, kioskId);
    
    if (result.success) {
      Alert.alert('Succès', 'Validation approuvée ! Le produit est maintenant visible.');
      setShowConfirmModal(false);
      setScannedData(null);
      loadPendingValidations();
    } else {
      Alert.alert('Erreur', result.error || 'Impossible de valider');
    }
  };

  const handleReject = async () => {
    if (!scannedData) return;

    if (!rejectReason.trim()) {
      Alert.alert('Erreur', 'Veuillez fournir une raison de rejet');
      return;
    }

    const kioskId = await SecureStore.getItemAsync('kiosk_id') || 'kiosque_001';
    
    const result = await OfflineValidationService.rejectValidation(scannedData, kioskId, rejectReason);
    
    if (result.success) {
      Alert.alert('Succès', 'Validation rejetée.');
      setShowConfirmModal(false);
      setScannedData(null);
      setRejectReason('');
      loadPendingValidations();
    } else {
      Alert.alert('Erreur', result.error || 'Impossible de rejeter');
    }
  };

  if (!permission) {
    return <View style={styles.container}><Text>Vérification permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={60} color="#666" />
          <Text style={styles.permissionText}>Permission caméra requise</Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Autoriser</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Valider Produits</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        <Pressable 
          style={[styles.tab, activeTab === 'scan' && styles.tabActive]} 
          onPress={() => setActiveTab('scan')}
        >
          <Ionicons name="qr-code-outline" size={20} color={activeTab === 'scan' ? '#2BEE79' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'scan' && styles.tabTextActive]}>Scanner</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]} 
          onPress={() => setActiveTab('pending')}
        >
          <Ionicons name="time-outline" size={20} color={activeTab === 'pending' ? '#2BEE79' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            En attente ({pendingValidations.length})
          </Text>
        </Pressable>
      </View>

      {activeTab === 'scan' && (
        <View style={styles.scanContent}>
          <View style={styles.scanBox}>
            <MaterialCommunityIcons name="qrcode-scan" size={80} color="#2BEE79" />
            <Text style={styles.scanTitle}>Scanner QR Code</Text>
            <Text style={styles.scanSubtitle}>
              Scannez le QR d'un vendeur pour valider son produit/service
            </Text>
          </View>
          <Pressable style={styles.scanButton} onPress={() => setShowScanner(true)}>
            <Ionicons name="camera" size={24} color="#000" />
            <Text style={styles.scanButtonText}>Ouvrir la caméra</Text>
          </Pressable>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#FFD166" />
            <Text style={styles.infoText}>
              Réception aussi via WiFi Direct ou Bluetooth des vendeurs nearby
            </Text>
          </View>
        </View>
      )}

      {activeTab === 'pending' && (
        <ScrollView style={styles.listContent}>
          {pendingValidations.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={60} color="#666" />
              <Text style={styles.emptyText}>Aucune validation en attente</Text>
            </View>
          ) : (
            pendingValidations.map((item, index) => (
              <View key={index} style={styles.validationCard}>
                <View style={styles.validationHeader}>
                  <View style={styles.badgePending}>
                    <Text style={styles.badgeText}>En attente</Text>
                  </View>
                  <Text style={styles.serviceType}>
                    {SERVICE_LABELS[item.serviceType] || item.serviceType}
                  </Text>
                </View>
                <Text style={styles.validationName}>{item.data?.name || item.name}</Text>
                <Text style={styles.validationPrice}>{item.data?.price || item.price} FCFA</Text>
                <Text style={styles.validationSeller}>
                  Vendeur: {item.data?.sellerName || item.sellerName || 'Inconnu'}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={showScanner} animationType="slide">
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={(barcode) => handleScan(barcode.rawValue)}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
          </View>
          <Pressable style={styles.closeScanner} onPress={() => setShowScanner(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </Pressable>
        </View>
      </Modal>

      <Modal visible={showConfirmModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer la validation</Text>
            
            {scannedData && (
              <View style={styles.scannedInfo}>
                <Text style={styles.scannedType}>
                  {SERVICE_LABELS[scannedData.serviceType] || scannedData.serviceType}
                </Text>
                <Text style={styles.scannedName}>{scannedData.name}</Text>
                <Text style={styles.scannedPrice}>{scannedData.price} FCFA</Text>
                <Text style={styles.scannedSeller}>
                  Vendeur: {scannedData.sellerName || 'Inconnu'}
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <Pressable style={styles.rejectButton} onPress={() => {
                Alert.prompt(
                  'Raison du rejet',
                  'Pourquoi rejeter cette demande?',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Rejeter', onPress: (reason) => {
                      setRejectReason(reason || 'Non specifié');
                      handleReject();
                    }},
                  ],
                  'plain-text'
                );
              }}>
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.rejectButtonText}>Rejeter</Text>
              </Pressable>
              
              <Pressable style={styles.approveButton} onPress={handleApprove}>
                <Ionicons name="checkmark-circle" size={20} color="#000" />
                <Text style={styles.approveButtonText}>Approuver</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8, backgroundColor: '#16213e' },
  backButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, backgroundColor: '#16213e', borderRadius: 12, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
  tabActive: { backgroundColor: '#2BEE79' },
  tabText: { color: '#666', fontSize: 14, marginLeft: 6 },
  tabTextActive: { color: '#000', fontWeight: 'bold' },
  scanContent: { flex: 1, padding: 20, paddingBottom: 100 },
  scanBox: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#16213e', borderRadius: 16, marginBottom: 20 },
  scanTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  scanSubtitle: { color: '#aaa', fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  scanButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2BEE79', padding: 16, borderRadius: 12 },
  scanButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  infoBox: { flexDirection: 'row', alignItems: 'center', marginTop: 20, padding: 16, backgroundColor: '#16213e', borderRadius: 12 },
  infoText: { color: '#aaa', fontSize: 14, marginLeft: 12, flex: 1 },
  listContent: { flex: 1, padding: 16, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#aaa', fontSize: 16, marginTop: 16 },
  validationCard: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, marginBottom: 12 },
  validationHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  badgePending: { backgroundColor: '#FFD166', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  serviceType: { color: '#2BEE79', fontSize: 12 },
  validationName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  validationPrice: { color: '#FFD166', fontSize: 16, marginTop: 4 },
  validationSeller: { color: '#aaa', fontSize: 14, marginTop: 8 },
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: 250, height: 250, borderWidth: 3, borderColor: '#2BEE79', borderRadius: 12 },
  closeScanner: { position: 'absolute', top: 50, right: 20, padding: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  scannedInfo: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, marginBottom: 20 },
  scannedType: { color: '#2BEE79', fontSize: 12, marginBottom: 4 },
  scannedName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scannedPrice: { color: '#FFD166', fontSize: 16, marginTop: 4 },
  scannedSeller: { color: '#aaa', fontSize: 14, marginTop: 8 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  rejectButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF4444', padding: 14, borderRadius: 12, marginRight: 8 },
  rejectButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  approveButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2BEE79', padding: 14, borderRadius: 12, marginLeft: 8 },
  approveButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { color: '#fff', fontSize: 16, marginTop: 16, textAlign: 'center' },
  permissionButton: { backgroundColor: '#2BEE79', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 20 },
  permissionButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

export default ProductValidationScreen;