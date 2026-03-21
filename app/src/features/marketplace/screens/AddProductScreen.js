import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';

const CATEGORIES = [
  { id: 'fruits', name: 'Fruits & Légumes', icon: 'food-apple' },
  { id: 'electronics', name: 'Électronique', icon: 'cellphone' },
  { id: 'fashion', name: 'Mode & Vêtements', icon: 'tshirt-crew' },
  { id: 'home', name: 'Maison & Décoration', icon: 'home' },
  { id: 'beauty', name: 'Beauté & Santé', icon: 'spa' },
  { id: 'sports', name: 'Sports & Loisirs', icon: 'basketball' },
  { id: 'services', name: 'Services', icon: 'account-wrench' },
  { id: 'other', name: 'Autres', icon: 'dots-horizontal' },
];

const TAGS = ['Bio', 'Frais', 'Local', 'Promo', 'Nouveau', 'Top Vente'];

const DELIVERY_OPTIONS = [
  { key: 'pickup', label: 'Retrait', icon: 'storefront-outline' },
  { key: 'delivery', label: 'Livraison', icon: 'truck-outline' },
  { key: 'instant', label: 'Express', icon: 'flash-outline' },
];

export default function AddProductScreen({ onBack, onOpenSellerProfile, productToEdit }) {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState(null);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState(['pickup']);
  const [isVisible, setIsVisible] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [shopInfo, setShopInfo] = useState({ name: 'Ma Boutique', location: 'Centre-ville' });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadShopInfo();
    loadProducts();
    if (productToEdit) {
      populateForm(productToEdit);
    }
  }, [productToEdit]);

  const loadShopInfo = async () => {
    try {
      const saved = await SecureStore.getItemAsync('seller_shop_info');
      if (saved) {
        setShopInfo(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading shop info:', e);
    }
  };

  const loadProducts = async () => {
    try {
      const saved = await SecureStore.getItemAsync('seller_products');
      if (saved) {
        setProducts(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading products:', e);
    }
  };

  const populateForm = (product) => {
    setProductName(product.name || '');
    setCategory(product.category ? CATEGORIES.find(c => c.id === product.category) : null);
    setPrice(product.price?.toString() || '');
    setStock(product.stock?.toString() || '');
    setDescription(product.description || '');
    setSelectedTags(product.tags || []);
    setDeliveryOptions(product.delivery || ['pickup']);
    setIsVisible(product.isVisible ?? true);
    setPhotos(product.photos || []);
  };

  const pickImage = async (index) => {
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

    if (!result.canceled) {
      const newPhotos = [...photos];
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  const takePhoto = async (index) => {
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

    if (!result.canceled) {
      const newPhotos = [...photos];
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  const showPhotoOptions = (index) => {
    Alert.alert(
      'Ajouter une photo',
      'Choisissez comment ajouter une photo',
      [
        { text: 'Prendre une photo', onPress: () => takePhoto(index) },
        { text: 'Choisir dans la galerie', onPress: () => pickImage(index) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleDelivery = (option) => {
    if (deliveryOptions.includes(option)) {
      setDeliveryOptions(deliveryOptions.filter(o => o !== option));
    } else {
      setDeliveryOptions([...deliveryOptions, option]);
    }
  };

  const validateForm = () => {
    if (!productName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du produit');
      return false;
    }
    if (!category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide');
      return false;
    }
    if (!stock || parseInt(stock) < 0) {
      Alert.alert('Erreur', 'Veuillez entrer une quantité en stock');
      return false;
    }
    return true;
  };

  const saveProduct = async (publish = true) => {
    if (!validateForm()) return;

    const newProduct = {
      id: productToEdit?.id || `prod_${Date.now()}`,
      name: productName.trim(),
      category: category.id,
      categoryName: category.name,
      price: parseFloat(price),
      stock: parseInt(stock),
      description: description.trim(),
      tags: selectedTags,
      delivery: deliveryOptions,
      isVisible: publish ? isVisible : false,
      photos: photos,
      createdAt: productToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedProducts;
    if (productToEdit) {
      updatedProducts = products.map(p => p.id === productToEdit.id ? newProduct : p);
    } else {
      updatedProducts = [newProduct, ...products];
    }

    try {
      await SecureStore.setItemAsync('seller_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      
      Alert.alert(
        'Succès',
        publish ? 'Produit publié avec succès!' : 'Produit enregistré en brouillon',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le produit');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {productToEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </Text>
          <Pressable style={styles.headerChip} onPress={onOpenSellerProfile}>
            <Text style={styles.headerChipText}>Profil</Text>
          </Pressable>
        </View>

        <View style={styles.shopCard}>
          <View style={styles.shopIcon}>
            <MaterialCommunityIcons name="storefront" size={18} color="#0E151B" />
          </View>
          <View style={styles.shopInfo}>
            <Text style={styles.shopTitle}>{shopInfo.name}</Text>
            <Text style={styles.shopMeta}>Boutique active · {shopInfo.location}</Text>
          </View>
          <View style={styles.statusChip}>
            <Text style={styles.statusText}>OUVERT</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Photos du produit</Text>
          <Text style={styles.sectionLink}>{photos.filter(p => p).length}/5</Text>
        </View>
        <View style={styles.photoRow}>
          {[0, 1, 2].map((index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.photoCard}
              onPress={() => showPhotoOptions(index)}
            >
              {photos[index] ? (
                <Image source={{ uri: photos[index] }} style={styles.photoImage} />
              ) : (
                <>
                  <View style={styles.photoIcon}>
                    <Ionicons name="image" size={18} color="#2BEE79" />
                  </View>
                  <Text style={styles.photoLabel}>
                    {index === 0 ? 'Couverture' : `Photo ${index + 1}`}
                  </Text>
                  <Pressable style={styles.photoButton}>
                    <Text style={styles.photoButtonText}>Ajouter</Text>
                  </Pressable>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Infos produit</Text>
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Nom du produit *</Text>
          <TextInput
            placeholder="Ex: Mangues bio"
            placeholderTextColor="#6B7A8B"
            style={styles.textInput}
            value={productName}
            onChangeText={setProductName}
          />
          <View style={styles.inputDivider} />
          <Text style={styles.inputLabel}>Categorie *</Text>
          <TouchableOpacity 
            style={styles.selectInput}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={[styles.selectValue, !category && styles.selectPlaceholder]}>
              {category ? category.name : 'Sélectionner une catégorie'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.inputDivider} />
          <View style={styles.inlineRow}>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>Prix (FCFA) *</Text>
              <TextInput
                placeholder="1500"
                placeholderTextColor="#6B7A8B"
                style={styles.textInput}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>Stock *</Text>
              <TextInput
                placeholder="50"
                placeholderTextColor="#6B7A8B"
                style={styles.textInput}
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>
          </View>
          <View style={styles.inputDivider} />
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            placeholder="Décrivez votre produit..."
            placeholderTextColor="#6B7A8B"
            style={[styles.textInput, styles.textArea]}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <Text style={styles.sectionTitle}>Tags (max 3)</Text>
        <View style={styles.tagsRow}>
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagChip,
                selectedTags.includes(tag) && styles.tagChipActive
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.tagTextActive
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Options de livraison</Text>
        <View style={styles.optionsRow}>
          {DELIVERY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionCard,
                deliveryOptions.includes(option.key) && styles.optionCardActive
              ]}
              onPress={() => toggleDelivery(option.key)}
            >
              <Ionicons
                name={option.icon}
                size={18}
                color={deliveryOptions.includes(option.key) ? '#0E151B' : '#94A3B8'}
              />
              <Text style={[
                styles.optionLabel,
                deliveryOptions.includes(option.key) && styles.optionLabelActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.sectionTitle}>Visibilité</Text>
            <Text style={styles.switchHint}>
              {isVisible ? 'Produit visible immédiatement' : 'Produit masqué'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.switchTrack, isVisible && styles.switchTrackActive]}
            onPress={() => setIsVisible(!isVisible)}
          >
            <View style={[styles.switchThumb, isVisible && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => saveProduct(true)}
          >
            <Text style={styles.primaryButtonText}>
              {productToEdit ? 'Mettre à jour' : 'Publier le produit'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => saveProduct(false)}
          >
            <Text style={styles.secondaryButtonText}>Enregistrer brouillon</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une catégorie</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    category?.id === cat.id && styles.categoryItemActive
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <MaterialCommunityIcons 
                    name={cat.icon} 
                    size={22} 
                    color={category?.id === cat.id ? '#2BEE79' : '#94A3B8'} 
                  />
                  <Text style={[
                    styles.categoryText,
                    category?.id === cat.id && styles.categoryTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.35)',
  },
  headerChipText: {
    color: '#2BEE79',
    fontSize: 12,
    fontWeight: '700',
  },
  shopCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shopInfo: {
    flex: 1,
  },
  shopTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  shopMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.12)',
  },
  statusText: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionRow: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLink: {
    color: '#94A3B8',
    fontSize: 12,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: '31%',
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(20, 27, 35, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  photoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photoLabel: {
    color: '#CBD5F5',
    fontSize: 11,
    textAlign: 'center',
  },
  photoButton: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.16)',
  },
  photoButtonText: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: '700',
  },
  inputCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    color: '#F8FAFC',
    fontSize: 14,
    paddingVertical: 6,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  selectValue: {
    color: '#F8FAFC',
    fontSize: 14,
  },
  inputDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inlineField: {
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 10,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 40, 50, 0.8)',
  },
  tagChipActive: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  tagText: {
    color: '#CBD5F5',
    fontSize: 12,
  },
  tagTextActive: {
    color: '#0E151B',
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 10,
  },
  optionCardActive: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  optionLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 6,
  },
  optionLabelActive: {
    color: '#0E151B',
    fontWeight: '700',
  },
  switchRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchHint: {
    color: '#7C8A9A',
    fontSize: 11,
    marginTop: 4,
  },
  switchTrack: {
    width: 52,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#2BEE79',
    padding: 4,
    alignItems: 'flex-end',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0E151B',
  },
  switchTrackActive: {
    backgroundColor: '#2BEE79',
    alignItems: 'flex-end',
  },
  switchThumbActive: {
    backgroundColor: '#fff',
  },
  footerButtons: {
    marginTop: 28,
  },
  selectPlaceholder: {
    color: '#6B7A8B',
  },
  photoImage: {
    width: '100%',
    height: 60,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a2633',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryItemActive: {
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: 15,
    marginLeft: 12,
  },
  categoryTextActive: {
    color: '#2BEE79',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#2BEE79',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryButtonText: {
    color: '#E6EDF3',
    fontSize: 14,
    fontWeight: '600',
  },
});
