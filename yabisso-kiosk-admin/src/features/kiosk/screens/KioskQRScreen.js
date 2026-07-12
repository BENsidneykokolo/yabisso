// app/src/features/kiosk/screens/KioskQRScreen.js
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { database } from '../../../lib/db';
import OfflineValidationService from '../services/OfflineValidationService';

function KioskQRScreen({ navigation, route }) {
  const routeParams = route?.params || {};
  const type = routeParams?.type || routeParams?.qrType || 'validation';
  const [processing, setProcessing] = useState(false);

  const processQRCode = async (data) => {
    if (processing || !data) {
      console.log('[KioskQR] Skip - processing:', processing, 'data:', !!data);
      return;
    }
    setProcessing(true);
    console.log('[KioskQR] Processing QR, type:', type);

    try {
      let qrData;
      
      // Handle different data formats
      if (!data || typeof data !== 'string') {
        console.log('[KioskQR] Invalid data format');
        setProcessing(false);
        return;
      }
      
      // Try to decode base64 first
      try {
        const decoded = atob(data);
        qrData = JSON.parse(decoded);
      } catch (e1) {
        // If base64 fails, try JSON directly
        try {
          qrData = JSON.parse(data);
        } catch (e2) {
          console.log('[KioskQR] Failed to parse QR data:', e2);
          setProcessing(false);
          return;
        }
      }
      
      switch (qrData.type) {
        case 'recharge':
          await handleRecharge(qrData);
          break;
        case 'points':
          await handlePoints(qrData);
          break;
        case 'validation':
        case 'validation_request_marketplace':
        case 'validation_request_restaurant':
        case 'validation_request_services':
        case 'validation_request_hotel':
        case 'validation_request_real_estate':
          await handleValidation(qrData);
          break;
        case 'product_validation':
          await handleProductValidation(qrData);
          break;
        case 'user':
          await handleUser(qrData);
          break;
        default:
          Alert.alert('Erreur', 'Type de QR code non reconnu: ' + qrData.type);
      }
    } catch (e) {
      Alert.alert('Erreur', 'QR code invalide ou corrompu');
      console.log('[KioskQR] Erreur:', e);
    } finally {
      setProcessing(false);
    }
  };

  const handleRecharge = async (qrData) => {
    const { phone, packId, amount, packName } = qrData.data || {};
    if (!phone || !packId) {
      Alert.alert('Erreur', 'Données de recharge incomplètes\n\nLe QR code doit contenir: phone, packId');
      return;
    }

    Alert.alert(
      '📱 Recharge Pack Détectée',
      `Numéro: ${phone}\nPack: ${packName || packId}\nMontant: ${amount || 50} FCAF\n\nConfirmer la recharge?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: '✅ Confirmer',
          onPress: async () => {
            try {
              await database.write(async () => {
                await database.get('wallet_transactions').create(t => {
                  t.title = `Pack ${packName || packId} - QR Kiosque`;
                  t.meta = JSON.stringify({ 
                    recipientPhone: phone, 
                    packId, 
                    packName: packName || packId,
                    amount: amount || 50,
                    source: 'qr_kiosque',
                    validatedAt: Date.now(),
                  });
                  t.amount = (amount || 50).toString();
                  t.isPositive = true;
                  t.walletMode = 'recharge_qr';
                  t.createdAt = Date.now();
                  t.updatedAt = Date.now();
                });
              });
              Alert.alert('✅ Succès', `Pack ${packName || packId} rechargé avec succès!\n\nLe pack a été crédité au ${phone}`);
              navigation.goBack();
            } catch (e) {
              console.log('[KioskQR] Erreur recharge:', e);
              Alert.alert('❌ Erreur', 'Impossible de valider la recharge');
            }
          },
        },
      ]
    );
  };

  const handlePoints = async (qrData) => {
    const { phone, points, amount, bonus } = qrData.data || {};
    if (!phone || !points) {
      Alert.alert('Erreur', 'Données de points incomplètes\n\nLe QR code doit contenir: phone, points');
      return;
    }

    const totalPoints = (parseInt(points) || 0) + (parseInt(bonus) || 0);
    
    Alert.alert(
      '⭐ Achat Points Détecté',
      `Numéro: ${phone}\nPoints: ${points}${bonus ? ` + ${bonus} bonus` : ''}\nTotal: ${totalPoints} points\nMontant: ${amount || points} FCAF\n\nConfirmer la vente?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: '✅ Confirmer',
          onPress: async () => {
            try {
              await database.write(async () => {
                await database.get('wallet_transactions').create(t => {
                  t.title = `${points} Points${bonus ? ` + ${bonus} bonus` : ''} - QR Kiosque`;
                  t.meta = JSON.stringify({ 
                    recipientPhone: phone, 
                    points: parseInt(points) || 0,
                    bonus: parseInt(bonus) || 0,
                    totalPoints,
                    amount: amount || points,
                    source: 'qr_kiosque',
                    validatedAt: Date.now(),
                  });
                  t.amount = (amount || points).toString();
                  t.isPositive = true;
                  t.walletMode = 'points_qr';
                  t.createdAt = Date.now();
                  t.updatedAt = Date.now();
                });
              });
              Alert.alert('✅ Succès', `${totalPoints} points vendus avec succès!\n\nLes points ont été crédités au ${phone}`);
              navigation.goBack();
            } catch (e) {
              console.log('[KioskQR] Erreur points:', e);
              Alert.alert('❌ Erreur', 'Impossible de valider la vente');
            }
          },
        },
      ]
    );
  };

  const handleValidation = async (qrData) => {
    const { validationId, productName, serviceType, id } = qrData.data || {};
    const itemId = validationId || id;
    
    if (!itemId) {
      Alert.alert('Erreur', 'Données de validation incomplètes');
      return;
    }

    Alert.alert(
      'Demande de Validation',
      `Produit: ${productName || 'Inconnu'}\nType: ${serviceType || 'Marché'}\nID: ${itemId}\n\nApprouver cette demande?`,
      [
        { text: 'Rejeter', style: 'destructive', onPress: () => navigation.goBack() },
        {
          text: 'Approuver',
          onPress: async () => {
            const kioskId = await SecureStore.getItemAsync('kiosk_id') || 'kiosque_admin_001';
            try {
              const payload = {
                id: itemId,
                name: productName || 'Produit',
                serviceType: serviceType || 'marketplace',
                ...qrData.data,
              };
              
              const result = await OfflineValidationService.approveValidation(payload, kioskId);
              
              if (result.success) {
                Alert.alert('Succès', 'Produit validé et visible par tous!\n\nLe produit va maintenant être visible par tous les utilisateurs.');
                navigation.goBack();
              } else {
                Alert.alert('Erreur', result.error || 'Impossible de valider');
              }
            } catch (e) {
              console.log('[KioskQR] Erreur validation:', e);
              Alert.alert('Erreur', 'Impossible de valider le produit');
            }
          },
        },
      ]
    );
  };

  // Gère le format product_validation (utilisé par SellerProfileScreen)
  const handleProductValidation = async (qrData) => {
    const { id, name, price, sellerName } = qrData;
    console.log('[KioskQR] handleProductValidation called with:', { id, name, price, sellerName });
    
    if (!id || !name) {
      Alert.alert('Erreur', 'Données de produit incomplètes\n\nID ou nom manquant');
      return;
    }

    Alert.alert(
      '🏪 Validation Produit Marché',
      `Produit: ${name}\nPrix: ${price || 0} FCAF\nVendeur: ${sellerName || 'Inconnu'}\nID: ${id}\n\nApprouver cette demande?`,
      [
        { text: 'Rejeter', style: 'destructive', onPress: () => navigation.goBack() },
        {
          text: '✅ Approuver',
          onPress: async () => {
            const kioskId = await SecureStore.getItemAsync('kiosk_id') || 'kiosque_admin_001';
            console.log('[KioskQR] Starting validation with kioskId:', kioskId);
            
            let validationSaved = false;
            let productUpdated = false;
            
            try {
              // Step 1: Create validation record in sync_queue
              console.log('[KioskQR] Step 1: Creating sync_queue entry...');
              await database.write(async () => {
                await database.get('sync_queue').create(q => {
                  q.action = 'validate_product_marketplace';
                  q.payloadJson = JSON.stringify({
                    productId: id,
                    productName: name,
                    productPrice: price,
                    sellerName: sellerName,
                    validatedBy: kioskId,
                    validatedAt: Date.now(),
                  });
                  q.status = 'validated';
                  q.retryCount = 0;
                  q.createdAt = Date.now();
                  q.updatedAt = Date.now();
                });
              });
              console.log('[KioskQR] Step 1: sync_queue entry created');
              validationSaved = true;

              // Step 2: Try to update the product if it exists
              console.log('[KioskQR] Step 2: Trying to update product...');
              try {
                const products = await database.get('products').query().fetch();
                console.log('[KioskQR] Found', products.length, 'products');
                
                const product = products.find(p => p.id === id || p._id === id);
                if (product) {
                  await product.update(p => {
                    p.isValidated = true;
                    p.productSyncStatus = 'validated';
                  });
                  console.log('[KioskQR] Step 2: Product updated successfully');
                  productUpdated = true;
                } else {
                  console.log('[KioskQR] Step 2: Product not found in DB (might be on different device)');
                }
              } catch (e2) {
                console.log('[KioskQR] Step 2 error (non-critical):', e2.message);
              }

              // Step 3: Verify the validation was saved
              console.log('[KioskQR] Step 3: Verifying validation...');
              const savedEntries = await database.get('sync_queue')
                .query()
                .fetch();
              
              const validationEntry = savedEntries.find(entry => 
                entry.action === 'validate_product_marketplace' && 
                entry.status === 'validated'
              );
              
              if (validationEntry) {
                console.log('[KioskQR] Verification: Validation found in DB!');
                
                // Show success with verification
                Alert.alert(
                  '✅ Validation Confirmée!',
                  `Produit: ${name}\n\n📋 Vérification:\n- Entrée de validation: ✅ Enregistrée\n- Produit mis à jour: ${productUpdated ? '✅' : '⚠️ Sur un autre appareil'}\n\nLe produit sera visible par tous lors de la prochaine synchronisation.`,
                  [
                    {
                      text: 'Voir les validations',
                      onPress: () => navigation.goBack()
                    },
                    {
                      text: 'Fermer',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                throw new Error('Validation non trouvée après enregistrement');
              }
              
            } catch (e) {
              console.log('[KioskQR] Erreur product validation:', e);
              
              // Show detailed error
              let errorDetails = '';
              if (!validationSaved) {
                errorDetails = '\n\n❌ L\'entrée de validation n\'a pas pu être créée.';
              } else if (!productUpdated) {
                errorDetails = '\n\n⚠️ L\'entrée est créée mais le produit n\'existe pas sur ce téléphone.';
              }
              
              Alert.alert(
                '❌ Erreur de Validation',
                `Erreur: ${e.message}${errorDetails}`,
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleUser = async (qrData) => {
    const { phone, name, email } = qrData.data || {};
    if (!phone) {
      Alert.alert('Erreur', 'Données utilisateur incomplètes\n\nLe QR code doit contenir: phone');
      return;
    }

    Alert.alert(
      '👤 Inscription Utilisateur',
      `Nom: ${name || 'Non spécifié'}\nTéléphone: ${phone}\nEmail: ${email || 'Non spécifié'}\n\nValider cette inscription?`,
      [
        { text: 'Rejeter', style: 'destructive', onPress: () => navigation.goBack() },
        {
          text: '✅ Valider',
          onPress: async () => {
            const kioskId = await SecureStore.getItemAsync('kiosk_id') || 'kiosque_admin_001';
            try {
              // Vérifier si l'utilisateur existe déjà
              const existingUsers = await database.get('profiles').query().fetch();
              const existing = existingUsers.find(p => p.phone === phone);
              
              await database.write(async () => {
                if (existing) {
                  await existing.update(p => {
                    p.status = 'validated_by_kiosk';
                    p.updatedAt = Date.now();
                  });
                } else {
                  await database.get('profiles').create(p => {
                    p.phone = phone;
                    p.name = name || '';
                    p.status = 'validated_by_kiosk';
                    p.kioskId = kioskId;
                    p.createdAt = Date.now();
                    p.updatedAt = Date.now();
                  });
                }
              });
              
              Alert.alert('✅ Succès', existing 
                ? `Utilisateur ${phone} mis à jour!\n\nStatut: actif`
                : `Utilisateur créé avec succès!\n\nTéléphone: ${phone}`
              );
              navigation.goBack();
            } catch (e) {
              console.log('[KioskQR] Erreur user:', e);
              Alert.alert('❌ Erreur', 'Impossible de créer le profil');
            }
          },
        },
      ]
    );
  };

  // Simuler un scan QR pour les tests
  const simulateScan = () => {
    console.log('[KioskQR] simulateScan called, type:', type);
    
    try {
      // Show confirmation that button was pressed
      Alert.alert(
        '📱 Test Scan QR',
        `Type de scan: ${type || 'validation'}\n\nAppuyez sur OK pour continuer le test...`,
        [
          {
            text: 'OK',
            onPress: () => {
              let testData;
              
              const currentType = type || 'validation';
              console.log('[KioskQR] Using type:', currentType);
              
              switch (currentType) {
                case 'recharge':
                  testData = {
                    type: 'recharge',
                    data: {
                      phone: '6' + Math.floor(Math.random() * 100000000),
                      packId: 'marche',
                      packName: 'Marché',
                      amount: 50,
                    },
                  };
                  break;
                case 'points':
                  testData = {
                    type: 'points',
                    data: {
                      phone: '6' + Math.floor(Math.random() * 100000000),
                      points: 500,
                      bonus: 50,
                      amount: 500,
                    },
                  };
                  break;
                case 'user':
                  testData = {
                    type: 'user',
                    data: {
                      phone: '6' + Math.floor(Math.random() * 100000000),
                      name: 'Test User ' + Math.floor(Math.random() * 100),
                      email: 'test' + Math.floor(Math.random() * 100) + '@example.com',
                    },
                  };
                  break;
                default:
                  testData = {
                    type: 'product_validation',
                    id: 'PROD-' + Date.now(),
                    name: 'Test Produit',
                    price: '5000',
                    sellerName: 'Vendeur Test',
                  };
              }
              
              const jsonString = JSON.stringify(testData);
              console.log('[KioskQR] Calling processQRCode with:', jsonString.substring(0, 100));
              processQRCode(jsonString);
            }
          },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    } catch (e) {
      console.log('[KioskQR] Error in simulateScan:', e);
      Alert.alert('Erreur', 'Erreur lors du scan: ' + e.message);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'recharge': return 'Scanner QR Recharge';
      case 'points': return 'Scanner QR Points';
      case 'validation': return 'Scanner QR Validation';
      case 'user': return 'Scanner QR Utilisateur';
      default: return 'Scanner QR Kiosque';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.scannerBox}>
          <MaterialCommunityIcons name="qrcode-scan" size={100} color="#2BEE79" />
          <Text style={styles.scannerText}>Positionnez le QR code dans le cadre</Text>
          <Text style={styles.scannerSubtext}>
            {type === 'recharge' && 'QR code de recharge pack utilisateur'}
            {type === 'points' && 'QR code d\'achat de points'}
            {type === 'validation' && 'QR code de validation produit'}
            {type === 'user' && 'QR code d\'inscription utilisateur'}
          </Text>
        </View>

        <Pressable 
          style={[styles.scanButton, processing && styles.scanButtonDisabled]}
          onPress={simulateScan}
          disabled={processing}
        >
          <Ionicons name="camera" size={24} color="#000" />
          <Text style={styles.scanButtonText}>
            {processing ? 'Traitement...' : 'Simuler un scan (Test)'}
          </Text>
        </Pressable>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={20} color="#60A5FA" />
          <Text style={styles.infoText}>
            Le QR code doit contenir un objet JSON avec le type (recharge/points/validation/user) et les données associées.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#16213e', paddingBottom: 16 },
  backButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  scannerBox: { backgroundColor: '#16213e', borderRadius: 20, padding: 40, alignItems: 'center', marginBottom: 20 },
  scannerText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  scannerSubtext: { color: '#aaa', fontSize: 14, marginTop: 8, textAlign: 'center' },
  scanButton: { backgroundColor: '#2BEE79', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginBottom: 20 },
  scanButtonDisabled: { backgroundColor: '#666' },
  scanButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  infoBox: { flexDirection: 'row', backgroundColor: '#16213e', padding: 16, borderRadius: 12, alignItems: 'flex-start' },
  infoText: { color: '#aaa', fontSize: 14, marginLeft: 12, flex: 1 },
});

export default KioskQRScreen;