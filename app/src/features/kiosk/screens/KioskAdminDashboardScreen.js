// app/src/features/kiosk/screens/KioskAdminDashboardScreen.js
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
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import OfflineValidationService from '../services/OfflineValidationService';
import { VALIDATION_STATUS, SERVICE_TYPES } from '../services/OfflineValidationService';

const SERVICE_LABELS = {
  marketplace: 'Marché',
  restaurant: 'Restaurant',
  services: 'Services',
  hotel: 'Hôtel',
  real_estate: 'Immobilier',
};

const SERVICE_ICONS = {
  marketplace: 'storefront',
  restaurant: 'silverware-fork-knife',
  services: 'wrench',
  hotel: 'bed',
  real_estate: 'home-city',
};

function KioskAdminDashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingValidations, setPendingValidations] = useState([]);
  const [validatedItems, setValidatedItems] = useState([]);
  const [rejectedItems, setRejectedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [kioskStats, setKioskStats] = useState({
    validated: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadValidations();
  }, []);

  const loadValidations = async () => {
    const pending = await OfflineValidationService.getPendingValidations();
    setPendingValidations(pending);
    setKioskStats(prev => ({ ...prev, pending: pending.length }));

    // Charger les validés (mock pour l'instant)
    setValidatedItems([]);
    setRejectedItems([]);
  };

  const handleApprove = async (item) => {
    const kioskId = await SecureStore.getItemAsync('kiosk_id') || 'kiosque_admin_001';
    
    const payload = {
      id: item.validationId || item.id,
      name: item.data?.name || item.name,
      price: item.data?.price || item.price,
      sellerId: item.data?.sellerId || item.sellerId,
      sellerName: item.data?.sellerName || item.sellerName,
      description: item.data?.description || '',
      serviceType: item.serviceType,
    };
    
    const result = await OfflineValidationService.approveValidation(payload, kioskId);
    
    if (result.success) {
      Alert.alert('Succès', 'Produit validé et visible par tous les utilisateurs!');
      loadValidations();
    } else {
      Alert.alert('Erreur', result.error || 'Impossible de valider');
    }
  };

  const handleReject = (item) => {
    Alert.prompt(
      'Rejeter la demande',
      'Pourquoi rejeter cette demande?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Rejeter', 
          onPress: async (reason) => {
            const kioskId = await SecureStore.getItemAsync('kiosk_id') || 'kiosque_admin_001';
            const payload = {
              id: item.validationId || item.id,
              name: item.data?.name || item.name,
              serviceType: item.serviceType,
            };
            await OfflineValidationService.rejectValidation(payload, kioskId, reason || 'Non spécifié');
            loadValidations();
          }
        },
      ],
      'plain-text'
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case VALIDATION_STATUS.PENDING:
      case VALIDATION_STATUS.PENDING_VALIDATION:
        return '#FFD166';
      case VALIDATION_STATUS.VALIDATED:
        return '#2BEE79';
      case VALIDATION_STATUS.REJECTED:
        return '#FF4444';
      default:
        return '#aaa';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case VALIDATION_STATUS.PENDING:
        return 'En attente';
      case VALIDATION_STATUS.PENDING_VALIDATION:
        return 'En validation';
      case VALIDATION_STATUS.VALIDATED:
        return 'Validé';
      case VALIDATION_STATUS.REJECTED:
        return 'Rejeté';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Admin Kiosque</Text>
        <Pressable style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#16213e' }]}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#FFD166" />
          <Text style={styles.statValue}>{kioskStats.pending}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#16213e' }]}>
          <MaterialCommunityIcons name="check-circle-outline" size={24} color="#2BEE79" />
          <Text style={styles.statValue}>{kioskStats.validated}</Text>
          <Text style={styles.statLabel}>Validés</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#16213e' }]}>
          <MaterialCommunityIcons name="close-circle-outline" size={24} color="#FF4444" />
          <Text style={styles.statValue}>{kioskStats.rejected}</Text>
          <Text style={styles.statLabel}>Rejetés</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable 
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]} 
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            En attente ({pendingValidations.length})
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'validated' && styles.tabActive]} 
          onPress={() => setActiveTab('validated')}
        >
          <Text style={[styles.tabText, activeTab === 'validated' && styles.tabTextActive]}>
            Validés
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'rejected' && styles.tabActive]} 
          onPress={() => setActiveTab('rejected')}
        >
          <Text style={[styles.tabText, activeTab === 'rejected' && styles.tabTextActive]}>
            Rejetés
          </Text>
        </Pressable>
      </View>

      {/* List */}
      <ScrollView style={styles.listContent}>
        {activeTab === 'pending' && (
          pendingValidations.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={60} color="#666" />
              <Text style={styles.emptyText}>Aucune validation en attente</Text>
            </View>
          ) : (
            pendingValidations.map((item, index) => (
              <Pressable 
                key={index} 
                style={styles.itemCard}
                onPress={() => {
                  setSelectedItem(item);
                  setShowDetailModal(true);
                }}
              >
                <View style={styles.itemIcon}>
                  <MaterialCommunityIcons 
                    name={SERVICE_ICONS[item.serviceType] || 'help-circle'} 
                    size={24} 
                    color="#2BEE79" 
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.data?.name || item.name}</Text>
                  <Text style={styles.itemType}>
                    {SERVICE_LABELS[item.serviceType] || item.serviceType}
                  </Text>
                  <Text style={styles.itemPrice}>{item.data?.price || item.price} FCAF</Text>
                  <Text style={styles.itemSeller}>
                    Vendeur: {item.data?.sellerName || item.sellerName || 'Inconnu'}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity 
                    style={styles.approveBtn}
                    onPress={() => handleApprove(item)}
                  >
                    <Ionicons name="checkmark" size={20} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.rejectBtn}
                    onPress={() => handleReject(item)}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </Pressable>
            ))
          )
        )}

        {activeTab === 'validated' && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="check-circle" size={60} color="#2BEE79" />
            <Text style={styles.emptyText}>Aucun produit validé</Text>
          </View>
        )}

        {activeTab === 'rejected' && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="close-circle" size={60} color="#FF4444" />
            <Text style={styles.emptyText}>Aucun produit rejeté</Text>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de la demande</Text>
              <Pressable onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>
            
            {selectedItem && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Type de service</Text>
                  <Text style={styles.detailValue}>
                    {SERVICE_LABELS[selectedItem.serviceType] || selectedItem.serviceType}
                  </Text>
                </View>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Nom du produit</Text>
                  <Text style={styles.detailValue}>
                    {selectedItem.data?.name || selectedItem.name}
                  </Text>
                </View>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Prix</Text>
                  <Text style={styles.detailPrice}>
                    {selectedItem.data?.price || selectedItem.price} FCAF
                  </Text>
                </View>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Vendeur</Text>
                  <Text style={styles.detailValue}>
                    {selectedItem.data?.sellerName || selectedItem.sellerName || 'Inconnu'}
                  </Text>
                </View>
                {selectedItem.data?.description && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>
                      {selectedItem.data.description}
                    </Text>
                  </View>
                )}
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Date de soumission</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedItem.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </ScrollView>
            )}
            
            <View style={styles.modalActions}>
              <Pressable 
                style={styles.modalRejectBtn}
                onPress={() => {
                  if (selectedItem) handleReject(selectedItem);
                  setShowDetailModal(false);
                }}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.modalRejectText}>Rejeter</Text>
              </Pressable>
              <Pressable 
                style={styles.modalApproveBtn}
                onPress={() => {
                  if (selectedItem) handleApprove(selectedItem);
                  setShowDetailModal(false);
                }}
              >
                <Ionicons name="checkmark-circle" size={20} color="#000" />
                <Text style={styles.modalApproveText}>Approuver</Text>
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
  settingsButton: { padding: 8 },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  statLabel: { color: '#aaa', fontSize: 12, marginTop: 4 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#16213e', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#2BEE79' },
  tabText: { color: '#666', fontSize: 14 },
  tabTextActive: { color: '#000', fontWeight: 'bold' },
  listContent: { flex: 1, padding: 16, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#aaa', fontSize: 16, marginTop: 16 },
  itemCard: { flexDirection: 'row', backgroundColor: '#16213e', borderRadius: 12, padding: 16, marginBottom: 12 },
  itemIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  itemType: { color: '#2BEE79', fontSize: 12, marginTop: 4 },
  itemPrice: { color: '#FFD166', fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  itemSeller: { color: '#aaa', fontSize: 12, marginTop: 4 },
  itemActions: { flexDirection: 'column', gap: 8 },
  approveBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2BEE79', justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF4444', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1a1a2e', borderRadius: 16, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  modalBody: { padding: 20 },
  detailSection: { marginBottom: 16 },
  detailLabel: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  detailValue: { color: '#fff', fontSize: 16 },
  detailPrice: { color: '#FFD166', fontSize: 18, fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#333' },
  modalRejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF4444', padding: 14, borderRadius: 12 },
  modalRejectText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  modalApproveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2BEE79', padding: 14, borderRadius: 12 },
  modalApproveText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});

export default KioskAdminDashboardScreen;