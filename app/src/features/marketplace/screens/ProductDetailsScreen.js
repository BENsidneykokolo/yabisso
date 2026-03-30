import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useCart } from '../context/CartContext';

const { width, height } = Dimensions.get('window');

const productImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCcH_wkhL9Vsdh3YOxVm8TuEpTlNbPnwEr08XwJFX8cQOKmYsov5xRS4oviF8wwFiErmeKAJE8wqc7HHjgknnv4KzHoszV5hLciu_pQp54wIA4QipzyT5tU4G2ungf-XnZCIvC9vCT45QSSAR-hngMPz8OFZUvmLzbxqjSGIQUG4VDjviScm2kUyCw6UrlhV9Adzej29zBtQdbaPpoRjqKgFgwvA_zZkcDHFEgZmG4fpm8r4dpAVhMvIcrZ3SkKgmzuYEaulaXF',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBfgHwLBJYnKOIi77C-_Sub2wi5GCxAz-jHhpFfPrUaukNGy5WGNRlmJR6oagwn8EYnl7ubFbaeCTCDBVcPKrlgoQEshxuYSjDdBGTlaEIBTFYaVt0vU0hsku0xAbwE3KA0DE8nNKDjqpLBbKMvDakt6iueX_DWwGovpVBJ26mrdAPAzgryouPISp-fsshxnYmqFCGjSZ1oiRnvU6kTUAdIcc13nI26JriXy3ACLrtL-xvws54ccMqRcc3HmlevActSwl1ZzC00',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCjDSfJdVhAYoYewkB82Q1-Z_x9BohKCiN8EC6mgyvPViIv9kcSYFglwML0si1AN9N4K5JQ2q6B_gp1LvHQN99hUJ2czMutNFJC6YFDjX23pytL4Qgww6HApufV2fJGa0V5OwB-EkHrzs9y-yzbzOB1TboMc9tiRHnxU-mT5ZiLQmfSSOIDre1uuamWN23IxpqcTA1uq9muQ8F0acC1GdMx-3JsPGt7av2v-k2mufWHqs-rUrrLUmAN5UOaPEJjwnYAVOfb4pew',
];

// Removed hardcoded colors and models

const seller = {
  name: 'AfroTech Gadgets',
  rating: 4.9,
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfP1XcHRc3TIXpPSJheCZysqWJvrjr8ogTi23p8gkj_y9Gus9Vnkdk_2JbC9lTTl0YW9JnAgjoIBFR_t2yhFMoaxHdvrwnjWpf0NiHvt-A6zystcwF-5V9Sf6kJzA7WSiNr5L_8ITk8a7spRp-GDOSyGfWbqKqcDF4-feL8lbYZGuQAnBBoutUAhHRc4CKTJaVo_tNa2e2IJv-byJxStXf3NhGsWHfjPFNLMTQJ_l1TAIWNz4D_fz8CBRY3Ion5sX20pr25wZ6',
};

const hasMultipleSellers = true;

export default function ProductDetailsScreen({ onBack, onNavigate, product }) {
  const { addToCart, isFavorite: checkIsFavorite, toggleFavorite } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavoriteState, setIsFavoriteState] = useState(false);
  const [negotiatedPrice, setNegotiatedPrice] = useState(null);
  const [lastOffer, setLastOffer] = useState(null);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [productReviews, setProductReviews] = useState([]);

  const loadProductReviews = async (prodId) => {
    if (!prodId) return;
    try {
      let reviews = [];
      const allKeys = await SecureStore.getItemAsync('all_review_keys');
      
      if (allKeys) {
        const keyList = JSON.parse(allKeys);
        for (const key of keyList) {
          if (key.includes(prodId)) {
            const saved = await SecureStore.getItemAsync(key);
            if (saved) {
              reviews.push(JSON.parse(saved));
            }
          }
        }
      }
      
      const defaultKey = `product_review_default`;
      const defaultSaved = await SecureStore.getItemAsync(defaultKey);
      if (defaultSaved) {
        reviews.push(JSON.parse(defaultSaved));
      }
      
      setProductReviews(reviews);
    } catch (e) {
      console.log('Error loading product reviews:', e);
    }
  };

  React.useEffect(() => {
    loadOfferHistory();
    if (product?.id) {
      setIsFavoriteState(checkIsFavorite(product.id));
      loadProductReviews(product.id);
    }
  }, [product?.id]);

  const loadOfferHistory = async () => {
    try {
      const productId = product?.id || 1;
      const saved = await SecureStore.getItemAsync(`user_offer_${productId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setLastOffer(data);
        setNegotiatedPrice(data.amount);
      }
    } catch (e) {
      console.log('Error loading offer history:', e);
    }
  };

  const saveOfferHistory = async (amount) => {
    try {
      const productId = product?.id || 1;
      const data = { amount, timestamp: new Date().toISOString() };
      await SecureStore.setItemAsync(`user_offer_${productId}`, JSON.stringify(data));
      setLastOffer(data);
      setNegotiatedPrice(amount);
    } catch (e) {
      console.log('Error saving offer history:', e);
    }
  };

  const defaultProduct = {
    id: 1,
    name: 'BassPro Wireless Noise-Canceling Headphones',
    brand: 'AfroTech Gadgets',
    price: 150000,
    discountPrice: 120000,
    discount: 20,
    rating: 4.8,
    reviews: 124,
    inStock: true,
    description: 'Experience audio like never before with the BassPro Wireless Headphones. Featuring industry-leading active noise cancellation, 30-hour battery life, and ultra-comfortable memory foam ear cups. Perfect for commutes, focused work sessions, or immersive gaming.\n\nThe Yabisso edition includes exclusive carrying case and fast-charging USB-C cable.',
    seller: seller,
    specs: {
      battery: '30 Hours',
      connectivity: 'Bluetooth 5.2',
    },
    // Négociation Mock Data
    canNegotiate: true,
    minPrice: 0, // Sera calculé dynamiquement si non présent
  };

  const productData = { 
    ...defaultProduct, 
    ...product,
    price: product?.price ?? defaultProduct.price,
    minPrice: product?.minPrice ?? (product?.price ? parseFloat(product.price) * 0.75 : 100000),
  };
  
  const productColors = productData.colors?.length > 0 
    ? productData.colors.map(c => ({ name: c, hex: '#324d67' })) 
    : [];

  const productSizes = productData.sizes?.length > 0 ? productData.sizes : [];

  React.useEffect(() => {
    if (productColors.length > 0 && !selectedColor) setSelectedColor(productColors[0]);
    if (productSizes.length > 0 && !selectedSize) setSelectedSize(productSizes[0]);
  }, [product?.id]);
  
  const displayImages = productData.photos && productData.photos.length > 0 
    ? productData.photos 
    : productImages;

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseInt(price) : price;
    return (numPrice || 0).toLocaleString('fr-FR') + ' XAF';
  };

  const handleAddToCart = () => {
    const productToAdd = {
      ...productData,
      image: productData.photos?.[0] || null,
    };
    addToCart(productToAdd, quantity, selectedColor?.name, selectedSize, negotiatedPrice);

    Alert.alert(
      'Ajouté au panier',
      `${quantity} article(s) ajouté(s) à votre panier`,
      [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Voir le panier', onPress: () => onNavigate?.('cart') },
      ]
    );
  };

  const handleMakeOffer = () => {
    setIsOfferModalVisible(true);
  };

  const handleSubmitOffer = () => {
    const amount = parseInt(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide.');
      return;
    }

    const price = parseFloat(productData.price);
    const minPrice = parseFloat(productData.minPrice);

    // Si l'offre est supérieure au prix affiché
    if (amount > price) {
      Alert.alert(
        'Offre Elevée',
        `Votre offre est largement supérieure au prix de l'article (${formatPrice(price)}). Vous pouvez proposer un prix plus bas si vous le souhaitez.`,
        [{ text: 'D\'accord' }]
      );
      return;
    }

    // Logic: If user already had an offer accepted, they can't offer LOWER unless 10h passed
    if (lastOffer) {
      const lastAmount = lastOffer.amount;
      const lastTime = new Date(lastOffer.timestamp).getTime();
      const now = new Date().getTime();
      const hoursPassed = (now - lastTime) / (1000 * 60 * 60);

      if (amount < lastAmount && hoursPassed < 10) {
        Alert.alert(
          'Offre Refusée',
          `Vous ne pouvez pas descendre en dessous de votre dernière offre de ${formatPrice(lastAmount)}. Veuillez attendre 10 heures pour soumettre une offre inférieure.`
        );
        return;
      }
    }

    if (amount >= minPrice) {
      saveOfferHistory(amount);
      setIsOfferModalVisible(false);
      Alert.alert(
        'Offre Acceptée !',
        `Le vendeur a accepté votre offre de ${formatPrice(amount)}. Vous pouvez maintenant ajouter l'article au panier à ce prix.`,
        [{ text: 'Super !' }]
      );
    } else {
      Alert.alert(
        'Offre Refusée',
        `Votre offre est trop basse. Le vendeur ne peut pas accepter de prix inférieur à ${formatPrice(minPrice)}.`,
        [{ text: 'Réessayer' }]
      );
    }
  };

  const currentDisplayPrice = negotiatedPrice || productData.price;
  
  const displayPrice = typeof productData.price === 'string' ? parseInt(productData.price) : productData.price;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              onPress={async () => {
                const newState = await toggleFavorite(productData);
                setIsFavoriteState(newState);
              }}
              style={styles.actionBtn}
            >
              <MaterialCommunityIcons
                name={isFavoriteState ? "heart" : "heart-outline"}
                size={22}
                color={isFavoriteState ? "#ef4444" : "#fff"}
              />
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {displayImages.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.imagePagination}>
            <Text style={styles.imageCounter}>
              {currentImageIndex + 1}/{productImages.length}
            </Text>
          </View>
          <View style={styles.paginationDots}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{productData.brand || 'Ma Boutique'}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{productData.name}</Text>
            <View style={styles.priceContainer}>
              {negotiatedPrice ? (
                <>
                  <View style={styles.negotiatedBadge}>
                    <Text style={styles.negotiatedText}>Prix négocié</Text>
                  </View>
                  <Text style={styles.originalPrice}>
                    {formatPrice(productData.price)}
                  </Text>
                  <Text style={[styles.price, styles.negotiatedPriceText]}>
                    {formatPrice(negotiatedPrice)}
                  </Text>
                </>
              ) : (
                <Text style={styles.price}>
                  {formatPrice(productData.price)}
                </Text>
              )}
            </View>
          </View>

          {/* Ratings */}
          <View style={styles.ratingRow}>
            <View style={styles.rating}>
              <MaterialCommunityIcons name="star" size={18} color="#eab308" />
              <Text style={styles.ratingText}>{productData.rating}</Text>
              <Text style={styles.reviewsText}>({productData.reviews} avis)</Text>
            </View>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>
                {productData.inStock ? 'En stock' : 'Rupture'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Color & Model Selection */}
        <View style={styles.optionsSection}>
          {/* Color */}
          {productColors.length > 0 && (
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Couleur</Text>
            <View style={styles.colorOptionsList}>
              {productColors.map((color) => (
                <Pressable
                  key={color.name}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorBtnTextFormat,
                    selectedColor?.name === color.name && styles.colorBtnSelected,
                  ]}
                >
                  <Text style={[styles.colorBtnText, selectedColor?.name === color.name && {color: '#fff'}]}>{color.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          )}

          {/* Model */}
          {productSizes.length > 0 && (
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Taille / Variantes</Text>
            <View style={styles.modelOptions}>
              {productSizes.map((model) => (
                <Pressable
                  key={model}
                  onPress={() => setSelectedSize(model)}
                  style={[
                    styles.modelBtn,
                    selectedSize === model && styles.modelBtnSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.modelBtnText,
                      selectedSize === model && styles.modelBtnTextSelected,
                    ]}
                  >
                    {model}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          )}

          {/* Quantity */}
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Quantité</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={styles.quantityContainer}>
                <Pressable
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={styles.quantityBtn}
                >
                  <MaterialCommunityIcons name="minus" size={18} color="#0E151B" />
                </Pressable>
                <Text style={styles.quantityText}>{quantity}</Text>
                {productData.stock !== undefined && quantity >= parseInt(productData.stock) ? (
                <View style={[styles.quantityBtn, { opacity: 0.3 }]}>
                  <MaterialCommunityIcons name="plus" size={18} color="#0E151B" />
                </View>
                ) : (
                <Pressable
                  onPress={() => setQuantity(quantity + 1)}
                  style={styles.quantityBtn}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#0E151B" />
                </Pressable>
                )}
              </View>
              {productData.stock !== undefined && (
                <Text style={{color: parseInt(productData.stock) > 0 ? '#94a3b8' : '#ef4444', fontSize: 12, marginTop: 4}}>
                  {parseInt(productData.stock) > 0 ? `${productData.stock} en stock` : 'Rupture de stock'}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerCard}>
            <Image
              source={{ uri: productData.seller?.avatar || 'https://via.placeholder.com/48' }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{productData.seller?.name || 'Vendeur inconnu'}</Text>
              <View style={styles.sellerRating}>
                <MaterialCommunityIcons name="star" size={14} color="#eab308" />
                <Text style={styles.sellerRatingText}>
                  {productData.seller?.rating || '0.0'} Note vendeur
                </Text>
              </View>
            </View>
            <Pressable style={styles.chatBtn}>
              <MaterialCommunityIcons name="chat" size={20} color="#137fec" />
            </Pressable>
          </View>
          {hasMultipleSellers && (
            <Pressable
              style={styles.compareBtn}
              onPress={() => onNavigate?.('seller_comparison', { product: productData })}
            >
              <MaterialCommunityIcons name="compare-arrows" size={18} color="#137fec" />
              <Text style={styles.compareBtnText}>Comparer les prix ({3} vendeurs)</Text>
            </Pressable>
          )}
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{productData.description}</Text>
        </View>

        {/* Tech Specs */}
        {(productData.brand || productData.condition) && (
        <View style={styles.specsSection}>
          {productData.brand ? (
          <View style={styles.specCard}>
            <Text style={styles.specLabel}>Marque</Text>
            <Text style={styles.specValue}>{productData.brand}</Text>
          </View>
          ) : null}
          {productData.condition ? (
          <View style={styles.specCard}>
            <Text style={styles.specLabel}>État</Text>
            <Text style={styles.specValue}>{productData.condition}</Text>
          </View>
          ) : null}
        </View>
        )}

        {/* Reviews Section */}
        {productReviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={styles.reviewsSectionTitle}>Avis des clients</Text>
            {productReviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <MaterialCommunityIcons 
                        key={star} 
                        name="star" 
                        size={14} 
                        color={star <= review.rating ? '#eab308' : '#324d67'} 
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('fr-FR') : ''}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <Pressable
            onPress={handleMakeOffer}
            style={[styles.offerBtn, negotiatedPrice && styles.offerBtnNegotiated]}
          >
            <Text style={styles.offerBtnText}>
              {negotiatedPrice ? 'Modifier l\'offre' : 'Faire une offre'}
            </Text>
          </Pressable>
          {productData.stock !== undefined && parseInt(productData.stock) === 0 ? (
          <View style={[styles.addToCartBtn, { backgroundColor: '#64748b' }]}>
            <MaterialCommunityIcons name="cart-off" size={20} color="#cbd5e1" />
            <Text style={[styles.addToCartBtnText, { color: '#cbd5e1' }]}>Rupture</Text>
          </View>
          ) : (
          <Pressable onPress={handleAddToCart} style={styles.addToCartBtn}>
            <MaterialCommunityIcons name="cart-plus" size={20} color="#0E151B" />
            <Text style={styles.addToCartBtnText}>Ajouter au panier</Text>
          </Pressable>
          )}
        </View>
      </View>

      {/* Offer Modal */}
      <Modal
        visible={isOfferModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOfferModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Faire une offre</Text>
              <Pressable onPress={() => setIsOfferModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Quel prix souhaitez-vous proposer pour ce produit ?
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Ex: 130000"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  value={offerAmount}
                  onChangeText={setOfferAmount}
                  autoFocus
                />
                <Text style={styles.currencyLabel}>XAF</Text>
              </View>

              <Text style={styles.priceHint}>
                Prix actuel : {formatPrice(productData.discountPrice || productData.price)}
              </Text>

              <Pressable onPress={handleSubmitOffer} style={styles.submitOfferBtn}>
                <Text style={styles.submitOfferBtnText}>Envoyer l'offre</Text>
              </Pressable>

              <Text style={styles.negotiationInfo}>
                Le vendeur a déjà défini des limites de négociation. Votre offre sera acceptée instantanément si elle est dans la plage autorisée.
              </Text>
            </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: width,
    aspectRatio: 4 / 3,
    backgroundColor: '#1a2632',
  },
  productImage: {
    width: width,
    height: width * 0.75,
  },
  imagePagination: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounter: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  productInfo: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  productBrand: {
    fontSize: 14,
    color: '#2BEE79',
    fontWeight: '600',
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 28,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  discountBadge: {
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  negotiatedBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  negotiatedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#137fec',
  },
  negotiatedPriceText: {
    color: '#22c55e',
  },
  originalPrice: {
    fontSize: 14,
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  reviewsText: {
    fontSize: 13,
    color: '#64748b',
  },
  stockBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  stockText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
  },
  optionsSection: {
    padding: 20,
    gap: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  colorOptionsList: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  colorBtnTextFormat: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a2632',
    borderWidth: 1,
    borderColor: '#324d67',
  },
  colorBtnSelected: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
  },
  colorBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
  },
  modelOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  modelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1a2632',
    borderWidth: 1,
    borderColor: '#324d67',
  },
  modelBtnSelected: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
  },
  modelBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
  },
  modelBtnTextSelected: {
    color: '#fff',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2632',
    borderRadius: 8,
    padding: 4,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    width: 36,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  sellerSection: {
    padding: 20,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2632',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sellerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sellerRatingText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(19, 127, 236, 0.2)',
  },
  compareBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#137fec',
  },
  descriptionSection: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
  },
  specsSection: {
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  specCard: {
    flex: 1,
    backgroundColor: '#1a2632',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  specLabel: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: '#101922',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingBottom: 60,
  },
  bottomBarContent: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  offerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#324d67',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerBtnNegotiated: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  offerBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  addToCartBtn: {
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
  addToCartBtnText: {
    fontSize: 14,
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
    maxHeight: height * 0.8,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101922',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#324d67',
    marginBottom: 12,
  },
  priceInput: {
    flex: 1,
    height: 56,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#137fec',
    marginLeft: 8,
  },
  priceHint: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 24,
  },
  submitOfferBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  submitOfferBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  negotiationInfo: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  reviewsSection: {
    padding: 20,
    paddingTop: 8,
  },
  reviewsSectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#1a2632',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: '#64748b',
  },
  reviewComment: {
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 18,
  },
});

