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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const productImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCcH_wkhL9Vsdh3YOxVm8TuEpTlNbPnwEr08XwJFX8cQOKmYsov5xRS4oviF8wwFiErmeKAJE8wqc7HHjgknnv4KzHoszV5hLciu_pQp54wIA4QipzyT5tU4G2ungf-XnZCIvC9vCT45QSSAR-hngMPz8OFZUvmLzbxqjSGIQUG4VDjviScm2kUyCw6UrlhV9Adzej29zBtQdbaPpoRjqKgFgwvA_zZkcDHFEgZmG4fpm8r4dpAVhMvIcrZ3SkKgmzuYEaulaXF',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBfgHwLBJYnKOIi77C-_Sub2wi5GCxAz-jHhpFfPrUaukNGy5WGNRlmJR6oagwn8EYnl7ubFbaeCTCDBVcPKrlgoQEshxuYSjDdBGTlaEIBTFYaVt0vU0hsku0xAbwE3KA0DE8nNKDjqpLBbKMvDakt6iueX_DWwGovpVBJ26mrdAPAzgryouPISp-fsshxnYmqFCGjSZ1oiRnvU6kTUAdIcc13nI26JriXy3ACLrtL-xvws54ccMqRcc3HmlevActSwl1ZzC00',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCjDSfJdVhAYoYewkB82Q1-Z_x9BohKCiN8EC6mgyvPViIv9kcSYFglwML0si1AN9N4K5JQ2q6B_gp1LvHQN99hUJ2czMutNFJC6YFDjX23pytL4Qgww6HApufV2fJGa0V5OwB-EkHrzs9y-yzbzOB1TboMc9tiRHnxU-mT5ZiLQmfSSOIDre1uuamWN23IxpqcTA1uq9muQ8F0acC1GdMx-3JsPGt7av2v-k2mufWHqs-rUrrLUmAN5UOaPEJjwnYAVOfb4pew',
];

const colors = [
  { name: 'Noir', hex: '#111' },
  { name: 'Bleu', hex: '#3b82f6' },
  { name: 'Rouge', hex: '#ef4444' },
];

const models = ['Pro', 'Lite'];

const seller = {
  name: 'AfroTech Gadgets',
  rating: 4.9,
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfP1XcHRc3TIXpPSJheCZysqWJvrjr8ogTi23p8gkj_y9Gus9Vnkdk_2JbC9lTTl0YW9JnAgjoIBFR_t2yhFMoaxHdvrwnjWpf0NiHvt-A6zystcwF-5V9Sf6kJzA7WSiNr5L_8ITk8a7spRp-GDOSyGfWbqKqcDF4-feL8lbYZGuQAnBBoutUAhHRc4CKTJaVo_tNa2e2IJv-byJxStXf3NhGsWHfjPFNLMTQJ_l1TAIWNz4D_fz8CBRY3Ion5sX20pr25wZ6',
};

const hasMultipleSellers = true;

export default function ProductDetailsScreen({ onBack, onNavigate, product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const productData = product || {
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
  };

  const formatPrice = (price) => {
    return price.toLocaleString('fr-FR') + ' XAF';
  };

  const handleAddToCart = () => {
    if (onNavigate) {
      onNavigate('add_to_cart', {
        product: productData,
        quantity,
        selectedColor: selectedColor.name,
        selectedModel,
      });
    }
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
    Alert.alert('Faire une offre', 'Fonctionnalité de négociationcoming soon...');
  };

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
              onPress={() => setIsFavorite(!isFavorite)}
              style={styles.actionBtn}
            >
              <MaterialCommunityIcons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#ef4444" : "#fff"}
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
            {productImages.map((image, index) => (
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
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{productData.name}</Text>
            <View style={styles.priceContainer}>
              {productData.discount > 0 && (
                <Text style={styles.discountBadge}>-{productData.discount}%</Text>
              )}
              <Text style={styles.price}>
                {formatPrice(productData.discountPrice || productData.price)}
              </Text>
              {productData.discount > 0 && (
                <Text style={styles.originalPrice}>
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
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Couleur</Text>
            <View style={styles.colorOptions}>
              {colors.map((color) => (
                <Pressable
                  key={color.name}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorBtn,
                    { backgroundColor: color.hex },
                    selectedColor.name === color.name && styles.colorBtnSelected,
                  ]}
                >
                  {selectedColor.name === color.name && (
                    <MaterialCommunityIcons name="check" size={16} color="#fff" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Model */}
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Modèle</Text>
            <View style={styles.modelOptions}>
              {models.map((model) => (
                <Pressable
                  key={model}
                  onPress={() => setSelectedModel(model)}
                  style={[
                    styles.modelBtn,
                    selectedModel === model && styles.modelBtnSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.modelBtnText,
                      selectedModel === model && styles.modelBtnTextSelected,
                    ]}
                  >
                    {model}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Quantité</Text>
            <View style={styles.quantityContainer}>
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityBtn}
              >
                <MaterialCommunityIcons name="minus" size={18} color="#0E151B" />
              </Pressable>
              <Text style={styles.quantityText}>{quantity}</Text>
              <Pressable
                onPress={() => setQuantity(quantity + 1)}
                style={styles.quantityBtn}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#0E151B" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerCard}>
            <Image
              source={{ uri: productData.seller.avatar }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{productData.seller.name}</Text>
              <View style={styles.sellerRating}>
                <MaterialCommunityIcons name="star" size={14} color="#eab308" />
                <Text style={styles.sellerRatingText}>
                  {productData.seller.rating} Note vendeur
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
              onPress={() => onNavigate?.('seller_comparison')}
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
        <View style={styles.specsSection}>
          <View style={styles.specCard}>
            <Text style={styles.specLabel}>Batterie</Text>
            <Text style={styles.specValue}>{productData.specs.battery}</Text>
          </View>
          <View style={styles.specCard}>
            <Text style={styles.specLabel}>Connectivité</Text>
            <Text style={styles.specValue}>{productData.specs.connectivity}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <Pressable onPress={handleMakeOffer} style={styles.offerBtn}>
            <Text style={styles.offerBtnText}>Faire une offre</Text>
          </Pressable>
          <Pressable onPress={handleAddToCart} style={styles.addToCartBtn}>
            <MaterialCommunityIcons name="cart-plus" size={20} color="#0E151B" />
            <Text style={styles.addToCartBtnText}>Ajouter au panier</Text>
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
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#137fec',
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
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  colorBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorBtnSelected: {
    borderColor: '#137fec',
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
});
