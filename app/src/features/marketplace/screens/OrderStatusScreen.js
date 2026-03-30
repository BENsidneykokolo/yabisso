import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrders } from '../context/OrderContext';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

const CONFIRMATION_KEY = 'order_confirmations';

export default function OrderStatusScreen({ onBack, onNavigate, route }) {
  const { orders } = useOrders();
  const orderId = route?.params?.orderId;
  const order = orders.find(o => o.id === orderId) || {
    id: '####',
    products: [],
    status: 'delivered',
    timeline: [],
    delivery: { arrivingBy: 'Calcul en cours...', addressType: 'Chargement...', address: '...' }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmationComment, setConfirmationComment] = useState('');
  const [confirmationImages, setConfirmationImages] = useState([]);
  const [confirmationStatus, setConfirmationStatus] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [existingReview, setExistingReview] = useState(null);

  React.useEffect(() => {
    loadConfirmation();
    loadReview();
  }, [orderId]);

  const loadReview = async () => {
    if (order?.products?.[0]?.id) {
      try {
        const productId = order.products[0].id;
        const saved = await SecureStore.getItemAsync(`product_review_${orderId}_${productId}`);
        if (saved) {
          setExistingReview(JSON.parse(saved));
        }
      } catch (e) {
        console.log('Error loading review:', e);
      }
    }
  };

  const submitReview = async () => {
    if (!reviewComment.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un commentaire.');
      return;
    }

    const productId = selectedProductForReview?.id || 'default';
    const reviewKey = `product_review_${orderId}_${productId}`;
    
    const review = {
      orderId,
      productId: selectedProductForReview?.id,
      productName: selectedProductForReview?.name,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString(),
    };

    try {
      await SecureStore.setItemAsync(reviewKey, JSON.stringify(review));
      
      let keyList = [];
      const savedKeys = await SecureStore.getItemAsync('all_review_keys');
      if (savedKeys) {
        keyList = JSON.parse(savedKeys);
      }
      if (!keyList.includes(reviewKey)) {
        keyList.push(reviewKey);
        await SecureStore.setItemAsync('all_review_keys', JSON.stringify(keyList));
      }
      
      setExistingReview(review);
      setShowReviewModal(false);
      setReviewComment('');
      setReviewRating(5);
      Alert.alert('Merci!', 'Votre avis a été enregistré.');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer votre avis.');
    }
  };

  const loadConfirmation = async () => {
    try {
      const saved = await SecureStore.getItemAsync(`${CONFIRMATION_KEY}_${orderId}`);
      if (saved) {
        setConfirmationStatus(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading confirmation:', e);
    }
  };

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('fr-FR') + ' XAF';
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l\'accès à la galerie pour ajouter des photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && confirmationImages.length < 3) {
      setConfirmationImages([...confirmationImages, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l\'accès à la caméra pour prendre des photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && confirmationImages.length < 3) {
      setConfirmationImages([...confirmationImages, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    const newImages = confirmationImages.filter((_, i) => i !== index);
    setConfirmationImages(newImages);
  };

  const showImageOptions = () => {
    Alert.alert(
      'Ajouter une photo',
      'Comment voulez-vous ajouter une photo?',
      [
        { text: 'Prendre une photo', onPress: takePhoto },
        { text: 'Choisir dans la galerie', onPress: pickImage },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const submitConfirmation = async (isCorrect) => {
    const confirmation = {
      orderId,
      isCorrect,
      comment: confirmationComment,
      images: confirmationImages,
      confirmedAt: new Date().toISOString(),
    };

    try {
      await SecureStore.setItemAsync(`${CONFIRMATION_KEY}_${orderId}`, JSON.stringify(confirmation));
      setConfirmationStatus(confirmation);
      setShowConfirmModal(false);
      
      if (isCorrect) {
        Alert.alert('Merci!', 'Vous avez confirmé que votre commande est conforme. Le vendeur sera notifié.');
      } else {
        Alert.alert('Signalement envoyé', 'Votre signalement a été envoyé au vendeur. Il sera contacté pour résoudre le problème.');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de soumettre votre confirmation.');
    }
  };

  // Timeline Mock data if not present
  const timeline = order.timeline?.length > 0 ? order.timeline : [
    { step: 'placed', title: 'Commande passée', date: order.date || 'Aujourd\'hui', completed: true },
    { step: 'payment', title: 'Paiement confirmé', date: 'Confirmation en cours', completed: true },
    { step: 'transit', title: 'En cours', date: 'Préparation du colis', completed: true, active: true },
    { step: 'delivered', title: 'Livré', date: 'Bientôt disponible', completed: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Commande #{order.id}</Text>
        <Pressable style={styles.helpBtn}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#92adc9" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Offline Context */}
        <View style={styles.offlineContext}>
          <MaterialCommunityIcons name="wifi-off" size={16} color="#92adc9" />
          <Text style={styles.offlineText}>Dernière mise à jour: à l'instant</Text>
        </View>

        {/* Products Section */}
        {order.products.map((product, index) => (
          <View key={index} style={styles.productCard}>
            <Image source={{ uri: product.image || 'https://via.placeholder.com/90' }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <View style={styles.sellerCompact}>
                <Image 
                  source={{ uri: product.sellerAvatar || 'https://via.placeholder.com/16' }} 
                  style={styles.sellerMiniAvatar} 
                />
                <Text style={styles.productBrand}>{product.brand || 'Ma Boutique'}</Text>
                {product.sellerRating && (
                  <View style={styles.sellerRating}>
                    <MaterialCommunityIcons name="star" size={10} color="#eab308" />
                    <Text style={styles.sellerRatingText}>{product.sellerRating}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              {product.description && (
                <Text style={styles.productDescription} numberOfLines={1}>
                  {product.description}
                </Text>
              )}
              <Text style={styles.productVariant}>
                Qté: {product.quantity} • {product.selectedColor || 'N/A'}{product.selectedModel ? ` • ${product.selectedModel}` : ''}
              </Text>
              <Text style={styles.productPrice}>
                {formatPrice(product.negotiatedPrice || product.price)}
              </Text>
            </View>
          </View>
        ))}

        {/* Map Preview */}
        <View style={styles.mapPreview}>
          <View style={styles.mapPlaceholder}>
            <MaterialCommunityIcons name="map" size={40} color="#324d67" />
          </View>
          <View style={styles.mapOverlay}>
            <View style={styles.mapMarker}>
              <MaterialCommunityIcons name="local-shipping" size={20} color="#fff" />
            </View>
            <View style={styles.mapInfo}>
              <Text style={styles.mapLabel}>Position actuelle</Text>
              <Text style={styles.mapLocation}>Douala, Akwa</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Chronologie</Text>

          {timeline.map((item, index) => (
            <View key={item.step} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.timelineDot,
                  item.completed && styles.timelineDotCompleted,
                  item.active && styles.timelineDotActive,
                ]}>
                  {item.completed ? (
                    <MaterialCommunityIcons
                      name={item.step === 'payment' ? 'credit-card' : item.step === 'transit' ? 'local-shipping' : 'check'}
                      size={16}
                      color={item.active ? '#fff' : '#22c55e'}
                    />
                  ) : (
                    <MaterialCommunityIcons name="package" size={16} color="#64748b" />
                  )}
                </View>
                {index < timeline.length - 1 && (
                  <View style={[
                    styles.timelineLine,
                    item.completed && styles.timelineLineCompleted,
                  ]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[
                  styles.timelineStepTitle,
                  item.active && styles.timelineStepTitleActive,
                  !item.completed && !item.active && styles.timelineStepTitlePending,
                ]}>
                  {item.title}
                </Text>
                <Text style={[
                  styles.timelineStepDate,
                  item.active && styles.timelineStepDateActive,
                ]}>
                  {item.date}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Details */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>Mode</Text>
            <Text style={styles.deliveryValue}>{order.deliveryMethod || 'Express'}</Text>
          </View>
          <View style={styles.deliveryDivider} />
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>Livrer à</Text>
            <View style={styles.deliveryAddress}>
              <Text style={styles.deliveryAddressType}>Mon Adresse</Text>
              <Text style={styles.deliveryAddressText}>{order.seller || 'Yabisso Hub'}</Text>
            </View>
          </View>
        </View>

        {/* Confirmation Section */}
        {order.status === 'delivered' && (
          <View style={styles.confirmationSection}>
            {confirmationStatus ? (
              <View style={styles.confirmedCard}>
                <View style={styles.confirmedHeader}>
                  <MaterialCommunityIcons 
                    name={confirmationStatus.isCorrect ? "check-circle" : "alert-circle"} 
                    size={24} 
                    color={confirmationStatus.isCorrect ? "#22c55e" : "#eab308"} 
                  />
                  <Text style={styles.confirmedTitle}>
                    {confirmationStatus.isCorrect ? 'Commande confirmée' : 'Problème signalé'}
                  </Text>
                </View>
                {confirmationStatus.comment && (
                  <Text style={styles.confirmedComment}>"{confirmationStatus.comment}"</Text>
                )}
                {confirmationStatus.images?.length > 0 && (
                  <View style={styles.confirmedImages}>
                    {confirmationStatus.images.map((img, i) => (
                      <Image key={i} source={{ uri: img }} style={styles.confirmedImage} />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.confirmCard}>
                <Text style={styles.confirmTitle}>Confirmer la réception</Text>
                <Text style={styles.confirmSubtitle}>
                  Avez-vous reçu votre commande? Est-elle conforme?
                </Text>
                <Pressable 
                  style={styles.confirmBtn}
                  onPress={() => setShowConfirmModal(true)}
                >
                  <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color="#fff" />
                  <Text style={styles.confirmBtnText}>Confirmer maintenant</Text>
                </Pressable>
              </View>
            )}

            {/* Review Section - Show after confirmation */}
            {confirmationStatus?.isCorrect && order?.products && (
              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>Votre avis sur cette commande</Text>
                
                {existingReview ? (
                  <View style={styles.existingReviewCard}>
                    <View style={styles.existingReviewHeader}>
                      <View style={styles.existingReviewStars}>
                        {[1,2,3,4,5].map((star) => (
                          <MaterialCommunityIcons 
                            key={star} 
                            name="star" 
                            size={16} 
                            color={star <= existingReview.rating ? '#eab308' : '#324d67'} 
                          />
                        ))}
                      </View>
                      <Text style={styles.existingReviewDate}>
                        {new Date(existingReview.createdAt).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <Text style={styles.existingReviewComment}>{existingReview.comment}</Text>
                    <Text style={styles.existingReviewProduct}>
                      Avis sur: {existingReview.productName}
                    </Text>
                  </View>
                ) : (
                  <Pressable 
                    style={styles.leaveReviewBtn}
                    onPress={() => {
                      setSelectedProductForReview(order.products[0]);
                      setShowReviewModal(true);
                    }}
                  >
                    <MaterialCommunityIcons name="star-outline" size={20} color="#137fec" />
                    <Text style={styles.leaveReviewBtnText}>Laisser un avis</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmer la réception</Text>
              <Pressable onPress={() => setShowConfirmModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Votre commande est-elle conforme à ce que vous avez commandé?
              </Text>

              {/* Images Section */}
              <Text style={styles.inputLabel}>Photos (optionnel)</Text>
              <Text style={styles.inputHint}>Ajoutez des photos pour montrer l'état de votre commande</Text>
              <View style={styles.imagesRow}>
                {confirmationImages.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <Pressable style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                      <MaterialCommunityIcons name="close" size={14} color="#fff" />
                    </Pressable>
                  </View>
                ))}
                {confirmationImages.length < 3 && (
                  <Pressable style={styles.addImageBtn} onPress={showImageOptions}>
                    <MaterialCommunityIcons name="camera-plus" size={24} color="#94A3B8" />
                    <Text style={styles.addImageText}>Ajouter</Text>
                  </Pressable>
                )}
              </View>

              {/* Comment Section */}
              <Text style={styles.inputLabel}>Commentaire (optionnel)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Ex: Tout est conforme, merci!"
                placeholderTextColor="#64748b"
                value={confirmationComment}
                onChangeText={setConfirmationComment}
                multiline
                numberOfLines={3}
              />

              {/* Action Buttons */}
              <Pressable 
                style={[styles.submitBtn, styles.submitBtnSuccess]}
                onPress={() => submitConfirmation(true)}
              >
                <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Tout est conforme</Text>
              </Pressable>

              <Pressable 
                style={[styles.submitBtn, styles.submitBtnWarning]}
                onPress={() => submitConfirmation(false)}
              >
                <MaterialCommunityIcons name="alert-circle" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Signaler un problème</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Laisser un avis</Text>
              <Pressable onPress={() => setShowReviewModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.reviewProductName}>{selectedProductForReview?.name}</Text>
              
              <Text style={styles.inputLabel}>Note</Text>
              <View style={styles.ratingStarsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setReviewRating(star)}>
                    <MaterialCommunityIcons 
                      name={star <= reviewRating ? "star" : "star-outline"} 
                      size={36} 
                      color={star <= reviewRating ? "#eab308" : "#64748b"} 
                    />
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Votre commentaire</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Ex: Produit conforme, livraison rapide..."
                placeholderTextColor="#64748b"
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={4}
              />

              <Pressable style={styles.submitReviewBtn} onPress={submitReview}>
                <Text style={styles.submitReviewBtnText}>Soumettre mon avis</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <Pressable style={styles.contactBtn}>
            <MaterialCommunityIcons name="chat" size={20} color="#fff" />
            <Text style={styles.contactBtnText}>Contacter le vendeur</Text>
          </Pressable>
          <Pressable
            style={styles.trackBtn}
            onPress={() => onNavigate?.('delivery_tracking')}
          >
            <MaterialCommunityIcons name="map-marker-path" size={20} color="#0E151B" />
            <Text style={styles.trackBtnText}>Suivre la livraison</Text>
          </Pressable>
        </View>
      </View>
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
    paddingBottom: 12,
    backgroundColor: '#101922',
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
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  offlineContext: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    opacity: 0.6,
    paddingVertical: 12,
  },
  offlineText: {
    fontSize: 12,
    color: '#92adc9',
    fontWeight: '500',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#324d67',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  sellerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sellerMiniAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#324d67',
  },
  productBrand: {
    fontSize: 11,
    color: '#2BEE79',
    fontWeight: '600',
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sellerRatingText: {
    fontSize: 9,
    color: '#eab308',
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 18,
  },
  productDescription: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontStyle: 'italic',
  },
  productVariant: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#137fec',
    marginTop: 4,
  },
  mapPreview: {
    height: 160,
    backgroundColor: '#1a2632',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mapMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  mapInfo: {
    flex: 1,
  },
  mapLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mapLocation: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  timelineCard: {
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  timelineTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a2632',
    borderWidth: 2,
    borderColor: '#324d67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
  },
  timelineDotActive: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#324d67',
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#22c55e',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineStepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  timelineStepTitleActive: {
    color: '#137fec',
    fontSize: 15,
  },
  timelineStepTitlePending: {
    color: '#64748b',
  },
  timelineStepDate: {
    fontSize: 12,
    color: '#92adc9',
    marginTop: 4,
  },
  timelineStepDateActive: {
    color: '#137fec',
  },
  deliveryCard: {
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#92adc9',
    fontWeight: '500',
  },
  deliveryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  deliveryDivider: {
    height: 1,
    backgroundColor: '#324d67',
    marginVertical: 4,
  },
  deliveryAddress: {
    alignItems: 'flex-end',
  },
  deliveryAddressType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  deliveryAddressText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'right',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 150,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#101922',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingBottom: 60,
  },
  bottomBarContent: {
    flexDirection: 'row',
    gap: 12,
  },
  contactBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#324d67',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  trackBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0E151B',
  },
  // Confirmation Section
  confirmationSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  confirmCard: {
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 20,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  confirmedCard: {
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  confirmedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  confirmedTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  confirmedComment: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 12,
    fontStyle: 'italic',
  },
  confirmedImages: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  confirmedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a2632',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '85%',
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
  modalSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtn: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#192633',
    borderWidth: 1,
    borderColor: '#324d67',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  commentInput: {
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#324d67',
    marginBottom: 20,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  submitBtnSuccess: {
    backgroundColor: '#22c55e',
  },
  submitBtnWarning: {
    backgroundColor: '#eab308',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Review Section
  reviewSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  reviewSectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  leaveReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#137fec',
  },
  leaveReviewBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#137fec',
  },
  existingReviewCard: {
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  existingReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  existingReviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  existingReviewDate: {
    fontSize: 12,
    color: '#64748b',
  },
  existingReviewComment: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  existingReviewProduct: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
  },
  reviewProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2BEE79',
    marginBottom: 16,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  reviewInput: {
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#324d67',
    marginBottom: 20,
  },
  submitReviewBtn: {
    backgroundColor: '#137fec',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
});
