import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { database } from '../../../lib/db';

import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';

export default function CheckoutScreen({ onBack, onNavigate, route }) {
  const { addOrder } = useOrders();
  const { clearCart } = useCart();
  const [personalInfo, setPersonalInfo] = useState('me');
  const [address, setAddress] = useState('home');
  const [delivery, setDelivery] = useState('express');
  const [payment, setPayment] = useState('wallet');
  
  // Recipient Modal State
  const [isRecipientModalVisible, setIsRecipientModalVisible] = useState(false);
  const [recipientData, setRecipientData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    city: '',
    country: '',
    comment: '',
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  React.useEffect(() => {
    const loadAddresses = async () => {
      try {
        const addressCollection = database.get('addresses');
        const list = await addressCollection.query().fetch();
        setSavedAddresses(list);
        if (list.length > 0) {
          setSelectedAddressId(list[0].id);
          setAddress(list[0].uniqueId);
        }
      } catch (error) {
        console.error('Error loading addresses for checkokut:', error);
      }
    };
    loadAddresses();
  }, []);

  // Get items from navigation params or use empty array
  const orderItems = route?.params?.orderItems || [];

  const handlePersonalInfoChange = (value) => {
    if (value === 'other') {
      setIsRecipientModalVisible(true);
    } else {
      setPersonalInfo('me');
    }
  };

  const saveRecipientData = () => {
    const { firstName, lastName, address, phone, city, country } = recipientData;
    if (!firstName || !lastName || !address || !phone || !city || !country) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setPersonalInfo('other');
    setIsRecipientModalVisible(false);
  };

  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    return parseInt(price.toString().replace(/[^0-9]/g, '')) || 0;
  };

  const formatPrice = (price) => {
    return parsePrice(price).toLocaleString('fr-FR') + ' XAF';
  };

  const subtotal = orderItems.reduce((sum, item) => {
    const price = parsePrice(item.negotiatedPrice || item.discountPrice || item.price);
    return sum + (price * (item.quantity || 1));
  }, 0);
  
  const deliveryFee = delivery === 'express' ? 1500 : 0;
  const taxes = 0;
  const total = subtotal + deliveryFee + taxes;

  const createOrder = (status) => {
    const newOrder = {
      id: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: status,
      statusLabel: status === 'en_cours' ? 'En cours' : 'Annulée',
      statusColor: status === 'en_cours' ? '#EAB308' : '#EF4444',
      products: orderItems.map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand || 'Ma Boutique',
        quantity: item.quantity,
        price: parsePrice(item.negotiatedPrice || item.discountPrice || item.price),
        image: item.image || item.photos?.[0] || null,
        selectedColor: item.selectedColor || 'Default',
        selectedModel: item.selectedModel,
        negotiatedPrice: item.negotiatedPrice,
        description: item.description,
        sellerAvatar: item.seller?.avatar,
        sellerRating: item.seller?.rating,
      })),
      total: total,
      seller: orderItems[0]?.brand || 'Ma Boutique',
      deliveryMethod: delivery === 'express' ? 'Express' : 'Standard',
    };
    addOrder(newOrder);
    clearCart(); // Vider le panier après commande
    return newOrder;
  };

  const handleConfirmPurchase = () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous confirmer cet achat?',
      [
        { 
          text: 'Annuler', 
          style: 'cancel',
          onPress: () => {
            createOrder('annule');
            Alert.alert('Annulée', 'La commande a été annulée et ajoutée à votre historique.');
            onNavigate?.('orders');
          }
        },
        {
          text: 'Confirmer',
          onPress: () => {
            const order = createOrder('en_cours');
            Alert.alert('Succès', 'Votre commande a été passée avec succès!');
            onNavigate?.('order_status', { orderId: order.id });
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Page Indicators */}
      <View style={styles.pageIndicators}>
        <View style={styles.indicator} />
        <View style={styles.indicator} />
        <View style={[styles.indicator, styles.indicatorActive]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {orderItems.length === 0 ? (
          <View style={styles.emptySection}>
            <MaterialCommunityIcons name="cart-off" size={64} color="#324d67" />
            <Text style={styles.emptyText}>Aucun article sélectionné pour le paiement.</Text>
            <Pressable style={styles.returnBtn} onPress={onBack}>
              <Text style={styles.returnBtnText}>Retourner au panier</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          {/* Me */}
          <Pressable
            onPress={() => handlePersonalInfoChange('me')}
            style={[
              styles.optionCard,
              personalInfo === 'me' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.optionIcon,
                personalInfo === 'me' && styles.optionIconSelected
              ]}>
                <MaterialCommunityIcons name="person" size={22} color={personalInfo === 'me' ? '#fff' : '#64748b'} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Moi</Text>
                <Text style={styles.optionSubtitle}>Kwesi • +237 000 000 000</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                personalInfo === 'me' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Not Me */}
          <Pressable
            onPress={() => handlePersonalInfoChange('other')}
            style={[
              styles.optionCard,
              personalInfo === 'other' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.optionIcon,
                personalInfo === 'other' && styles.optionIconSelected
              ]}>
                <MaterialCommunityIcons name="person-add" size={22} color={personalInfo === 'other' ? '#fff' : '#64748b'} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Pas Moi</Text>
                {personalInfo === 'other' && recipientData.firstName ? (
                  <>
                    <Text style={styles.optionSubtitle}>
                      {recipientData.firstName} {recipientData.lastName} • {recipientData.phone}
                    </Text>
                    <Text style={styles.optionSubtitle}>
                      {recipientData.address}, {recipientData.city}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.optionSubtitle}>Envoyer à quelqu'un d'autre</Text>
                )}
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                personalInfo === 'other' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de Livraison</Text>

          {savedAddresses.length === 0 ? (
            <View style={styles.noAddressContainer}>
              <Text style={styles.noAddressText}>Aucune adresse enregistrée.</Text>
              <Pressable 
                style={styles.addAddressInlineBtn}
                onPress={() => onNavigate?.('profile_add_address')}
              >
                <Text style={styles.addAddressInlineText}>Ajouter une adresse</Text>
              </Pressable>
            </View>
          ) : (
            savedAddresses.map((addr) => (
              <Pressable
                key={addr.id}
                onPress={() => {
                  setSelectedAddressId(addr.id);
                  setAddress(addr.uniqueId);
                }}
                style={[
                  styles.optionCard,
                  selectedAddressId === addr.id && styles.optionCardSelected
                ]}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionIcon,
                    selectedAddressId === addr.id && styles.optionIconSelected
                  ]}>
                    <MaterialCommunityIcons 
                      name={addr.category === 'Maison' ? 'home' : (addr.category === 'Travail' ? 'briefcase' : 'map-marker')} 
                      size={22} 
                      color={selectedAddressId === addr.id ? '#fff' : '#64748b'} 
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.optionTitle}>{addr.name}</Text>
                      <View style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText}>{addr.uniqueId}</Text>
                      </View>
                    </View>
                    <Text style={styles.optionSubtitle}>{addr.fullAddress || 'Coordonnées GPS'}</Text>
                  </View>
                </View>
                <View style={styles.radioOuter}>
                  <View style={[
                    styles.radioInner,
                    selectedAddressId === addr.id && styles.radioInnerSelected
                  ]} />
                </View>
              </Pressable>
            ))
          )}

          <Pressable style={styles.manageAddressBtn} onPress={() => onNavigate?.('profile_addresses')}>
            <MaterialCommunityIcons name="cog" size={16} color="#137fec" />
            <Text style={styles.manageAddressText}>Gérer les adresses</Text>
          </Pressable>
        </View>

        {/* Delivery Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de Livraison</Text>

          {/* Standard */}
          <Pressable
            onPress={() => setDelivery('standard')}
            style={[
              styles.optionCard,
              delivery === 'standard' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconSmall}>
                <MaterialCommunityIcons name="local-shipping" size={20} color="#64748b" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Livraison Standard</Text>
                <Text style={styles.optionSubtitle}>Gratuit • 35-45 mins</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                delivery === 'standard' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Express */}
          <Pressable
            onPress={() => setDelivery('express')}
            style={[
              styles.optionCard,
              delivery === 'express' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.optionIconSmall,
                delivery === 'express' && styles.optionIconSmallSelected
              ]}>
                <MaterialCommunityIcons name="bolt" size={20} color={delivery === 'express' ? '#fff' : '#64748b'} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Livraison Express</Text>
                <Text style={styles.optionSubtitle}>+1 500 XAF • 15-25 mins</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                delivery === 'express' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de Paiement</Text>

          {/* Wallet */}
          <Pressable
            onPress={() => setPayment('wallet')}
            style={[
              styles.optionCard,
              payment === 'wallet' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.optionIconSmall,
                payment === 'wallet' && styles.optionIconSmallSelected
              ]}>
                <MaterialCommunityIcons name="account-balance-wallet" size={20} color={payment === 'wallet' ? '#fff' : '#10b981'} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Portefeuille Yabisso</Text>
                <Text style={styles.optionSubtitle}>Solde : <Text style={styles.balanceText}>450 000 XAF</Text></Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                payment === 'wallet' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Mobile Money */}
          <Pressable
            onPress={() => setPayment('mobile')}
            style={[
              styles.optionCard,
              payment === 'mobile' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[styles.optionIconSmall, styles.optionIconGreen]}>
                <MaterialCommunityIcons name="smartphone" size={20} color="#10b981" />
              </View>
              <View style={styles.optionTextContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.optionTitle}>Paiement Mobile</Text>
                  <View style={styles.offlineBadge}>
                    <Text style={styles.offlineBadgeText}>Prêt Hors-ligne</Text>
                  </View>
                </View>
                <Text style={styles.optionSubtitle}>M-Pesa, Airtel Money</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                payment === 'mobile' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Card */}
          <Pressable
            onPress={() => setPayment('card')}
            style={[
              styles.optionCard,
              payment === 'card' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={[styles.optionIconSmall, styles.optionIconYellow]}>
                <MaterialCommunityIcons name="credit-card" size={20} color="#f59e0b" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Carte de Crédit</Text>
                <Text style={styles.optionSubtitle}>**** 4242</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                payment === 'card' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>

          {/* Cash on Delivery */}
          <Pressable
            onPress={() => setPayment('cod')}
            style={[
              styles.optionCard,
              payment === 'cod' && styles.optionCardSelected
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconSmall}>
                <MaterialCommunityIcons name="payments" size={20} color="#137fec" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Payer à la livraison</Text>
                <Text style={styles.optionSubtitle}>Espèces ou Mobile Money à l'arrivée</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              <View style={[
                styles.radioInner,
                payment === 'cod' && styles.radioInnerSelected
              ]} />
            </View>
          </Pressable>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé de la Commande</Text>
          <View style={styles.summaryCard}>
            {orderItems.map((item, index) => {
              const displayPrice = item.negotiatedPrice || item.discountPrice || item.price;
              const variantText = [
                item.selectedColor, 
                item.selectedModel
              ].filter(Boolean).join(' • ');

              return (
                <View key={`${item.id}-${index}`} style={styles.orderItem}>
                  <Image 
                    source={{ uri: item.image || item.photos?.[0] || 'https://via.placeholder.com/60' }} 
                    style={styles.orderItemImage} 
                  />
                  <View style={styles.orderItemDetails}>
                    <View style={styles.sellerCompact}>
                      <Image 
                        source={{ uri: item.seller?.avatar || 'https://via.placeholder.com/16' }} 
                        style={styles.sellerMiniAvatar} 
                      />
                      <Text style={styles.orderItemBrand}>{item.seller?.name || item.brand || 'Ma Boutique'}</Text>
                    </View>
                    <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.orderItemDescription} numberOfLines={1}>
                        {item.description}
                      </Text>
                    )}
                    <Text style={styles.orderItemVariant}>
                      {variantText ? `${variantText} • ` : ''}Qty {item.quantity}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[
                      styles.orderItemPrice, 
                      item.negotiatedPrice && { color: '#22c55e' }
                    ]}>
                      {formatPrice(displayPrice)}
                    </Text>
                    {item.negotiatedPrice && (
                      <Text style={{ fontSize: 9, color: '#22c55e', fontWeight: 'bold' }}>NÉGOCIÉ</Text>
                    )}
                  </View>
                </View>
              );
            })}

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison</Text>
              <Text style={styles.summaryValue}>{formatPrice(deliveryFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes</Text>
              <Text style={styles.summaryValue}>{formatPrice(taxes)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabelSmall}>Montant Total</Text>
            <Text style={styles.totalValueSmall}>{formatPrice(total)}</Text>
          </View>
          <Pressable onPress={handleConfirmPurchase} style={styles.confirmBtn}>
            <Text style={styles.confirmBtnText}>Confirmer l'achat</Text>
            <MaterialCommunityIcons name="arrow-forward" size={20} color="#0E151B" />
          </Pressable>
        </View>
      </View>
      {/* Recipient Modal */}
      <Modal
        visible={isRecipientModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsRecipientModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Informations du destinataire</Text>
              <Pressable onPress={() => setIsRecipientModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Prénom *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Jean"
                placeholderTextColor="#64748b"
                value={recipientData.firstName}
                onChangeText={(text) => setRecipientData({ ...recipientData, firstName: text })}
              />

              <Text style={styles.inputLabel}>Nom *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Dupont"
                placeholderTextColor="#64748b"
                value={recipientData.lastName}
                onChangeText={(text) => setRecipientData({ ...recipientData, lastName: text })}
              />

              <Text style={styles.inputLabel}>Téléphone *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: +237 6..."
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                value={recipientData.phone}
                onChangeText={(text) => setRecipientData({ ...recipientData, phone: text })}
              />

              <Text style={styles.inputLabel}>Adresse *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Rue 123, Bastos"
                placeholderTextColor="#64748b"
                value={recipientData.address}
                onChangeText={(text) => setRecipientData({ ...recipientData, address: text })}
              />

              <View style={styles.rowInputs}>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.inputLabel}>Ville *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Yaoundé"
                    placeholderTextColor="#64748b"
                    value={recipientData.city}
                    onChangeText={(text) => setRecipientData({ ...recipientData, city: text })}
                  />
                </View>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.inputLabel}>Pays *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Cameroun"
                    placeholderTextColor="#64748b"
                    value={recipientData.country}
                    onChangeText={(text) => setRecipientData({ ...recipientData, country: text })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Commentaire (Optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Instructions spéciales..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
                value={recipientData.comment}
                onChangeText={(text) => setRecipientData({ ...recipientData, comment: text })}
              />

              <Pressable onPress={saveRecipientData} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </Pressable>
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  indicator: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1c2a38',
  },
  indicatorActive: {
    backgroundColor: '#137fec',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c2a38',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#137fec',
    backgroundColor: 'rgba(19, 127, 236, 0.05)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: {
    backgroundColor: '#137fec',
  },
  optionIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIconSmallSelected: {
    backgroundColor: '#137fec',
  },
  optionIconGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  optionIconYellow: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#92adc9',
    marginTop: 2,
  },
  tagBadge: {
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(19, 127, 236, 0.3)',
  },
  tagBadgeSecondary: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#137fec',
  },
  offlineBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  offlineBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#10b981',
    textTransform: 'uppercase',
  },
  balanceText: {
    color: '#137fec',
    fontWeight: 'bold',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  radioInnerSelected: {
    backgroundColor: '#137fec',
  },
  manageAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  manageAddressText: {
    fontSize: 13,
    color: '#137fec',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#1c2a38',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#324d67',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#324d67',
  },
  orderItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  sellerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  sellerMiniAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#324d67',
  },
  orderItemBrand: {
    fontSize: 10,
    color: '#2BEE79',
    fontWeight: '600',
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderItemDescription: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
    fontStyle: 'italic',
  },
  orderItemVariant: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#324d67',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 13,
    color: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomSpacer: {
    height: 150,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1c2a38',
    borderTopWidth: 1,
    borderTopColor: '#324d67',
    paddingBottom: 60,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabelSmall: {
    fontSize: 13,
    color: '#64748b',
  },
  totalValueSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptySection: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  returnBtn: {
    backgroundColor: '#137fec',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  returnBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0E151B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a2632',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#101922',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#324d67',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInputContainer: {
    flex: 1,
  },
  saveBtn: {
    backgroundColor: '#137fec',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  noAddressContainer: {
    backgroundColor: '#1c2a38',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  noAddressText: {
    color: '#94a3b8',
    marginBottom: 12,
  },
  addAddressInlineBtn: {
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#137fec',
  },
  addAddressInlineText: {
    color: '#137fec',
    fontWeight: 'bold',
  },
});
