import React, { useState, useEffect } from 'react';
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
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import RestaurantSyncService from '../services/RestaurantSyncService';
import OfflineValidationService from '../../kiosk/services/OfflineValidationService';

const categories = [
  { id: 'african', name: 'African', icon: 'food' },
  { id: 'burger', name: 'Burger', icon: 'food-variant' },
  { id: 'pizza', name: 'Pizza', icon: 'pizza' },
  { id: 'healthy', name: 'Healthy', icon: 'leaf' },
  { id: 'asian', name: 'Asian', icon: 'bowl-mix' },
  { id: 'drinks', name: 'Boissons', icon: 'cup' },
];

export default function RestaurantSellerScreen({ onBack, onNavigate }) {
  const [shopInfo, setShopInfo] = useState({
    name: '',
    location: '',
    phone: '',
    description: '',
    category: [],
    hours: '9h - 21h',
    delivery: true,
    deliveryFee: '500',
    minOrder: '1000',
    avatar: null,
    banner: null,
  });
  const [products, setProducts] = useState([]);
  const [showEditShop, setShowEditShop] = useState(false);
  const [editShopData, setEditShopData] = useState(shopInfo);
  const [activeTab, setActiveTab] = useState('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    photos: [],
  });

  // Charger les données au montage
  useEffect(() => {
    loadShopInfo();
    loadProducts();
  }, []);

  // Fonction pour charger depuis WatermelonDB avec fallback SecureStore
  const loadShopInfo = async () => {
    try {
      // Essayer d'abord WatermelonDB
      const localRestaurants = await RestaurantSyncService.loadRestaurants();
      if (localRestaurants.length > 0) {
        const restaurant = localRestaurants[0];
        setShopInfo({
          name: restaurant.name || '',
          location: restaurant.location || '',
          phone: restaurant.phone || '',
          description: restaurant.description || '',
          category: restaurant.category || [],
          hours: restaurant.hours || '9h - 21h',
          delivery: restaurant.delivery || true,
          deliveryFee: restaurant.deliveryFee || '500',
          minOrder: restaurant.minOrder || '1000',
          avatar: restaurant.avatar || null,
          banner: restaurant.banner || null,
        });
        setEditShopData({
          name: restaurant.name || '',
          location: restaurant.location || '',
          phone: restaurant.phone || '',
          description: restaurant.description || '',
          category: restaurant.category || [],
          hours: restaurant.hours || '9h - 21h',
          delivery: restaurant.delivery || true,
          deliveryFee: restaurant.deliveryFee || '500',
          minOrder: restaurant.minOrder || '1000',
          avatar: restaurant.avatar || null,
          banner: restaurant.banner || null,
        });
        return;
      }
    } catch (e) {
      console.log('[RestaurantSeller] Erreur load WatermelonDB, fallback SecureStore:', e);
    }

    // Fallback SecureStore
    try {
      const saved = await SecureStore.getItemAsync('restaurant_shop_info');
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data.category === 'string') {
          data.category = data.category ? [data.category] : [];
        } else if (!data.category) {
          data.category = [];
        }
        setShopInfo(data);
        setEditShopData(data);
      }
    } catch (e) {
      console.log('Error loading shop info:', e);
    }
  };

  // Fonction pour charger les produits depuis WatermelonDB avec fallback
  const loadProducts = async () => {
    try {
      // Essayer d'abord WatermelonDB
      const localProducts = await RestaurantSyncService.loadProducts('local');
      if (localProducts.length > 0) {
        setProducts(localProducts);
        return;
      }
    } catch (e) {
      console.log('[RestaurantSeller] Erreur load produits WatermelonDB:', e);
    }

    // Fallback SecureStore
    try {
      const saved = await SecureStore.getItemAsync('restaurant_products');
      if (saved) {
        const productsData = JSON.parse(saved);
        setProducts(productsData);
      }
    } catch (e) {
      console.log('Error loading products:', e);
    }
  };

const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    const product = {
      ...newProduct,
      id: Date.now().toString(),
      categoryName: newProduct.category,
      sellerId: 'local',
      sellerName: shopInfo.name || 'Mon Restaurant',
    };
    
    // Sauvegarder dans WatermelonDB
    try {
      await RestaurantSyncService.saveProduct(product, 'local');
      await RestaurantSyncService.addToSyncQueue('create_product', product);
      
      // Créer demande de validation
      await OfflineValidationService.createValidationRequest('restaurant', product);
    } catch (e) {
      console.log('[RestaurantSeller] Erreur save WatermelonDB:', e);
    }

    // Mise à jour UI
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    
    // Garder SecureStore pour compatibilité
    await SecureStore.setItemAsync('restaurant_products', JSON.stringify(updatedProducts));
    
    setNewProduct({ name: '', price: '', description: '', category: '', photos: [] });
    setShowAddProduct(false);
    Alert.alert(
      'Succès', 
      'Plat ajouté ! En attente de validation par un kiosque pour être visible par tous.'
    );
  };

  const saveShopInfo = async () => {
    try {
      // Sauvegarder dans WatermelonDB
      try {
        await RestaurantSyncService.saveRestaurant(editShopData);
        await RestaurantSyncService.addToSyncQueue('create_restaurant', editShopData);
      } catch (e) {
        console.log('[RestaurantSeller] Erreur save WatermelonDB:', e);
      }

      // Garder SecureStore pour compatibilité
      await SecureStore.setItemAsync('restaurant_shop_info', JSON.stringify(editShopData));
      setShopInfo(editShopData);
      setShowEditShop(false);
      Alert.alert('Succès', 'Informations sauvegardées localement !');
    } catch (e) {
      console.log('Error saving shop info:', e);
      Alert.alert('Erreur', 'Impossible de sauvegarder les informations');
    }
  };

  const requestPermissions = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Autorisez l\'accès à la caméra pour prendre des photos.');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Autorisez l\'accès à la galerie pour ajouter des photos.');
        return false;
      }
    }
    return true;
  };

  const pickImage = async (type) => {
    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'banner' ? [3, 1] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'product') {
        setNewProduct({...newProduct, photos: [result.assets[0].uri]});
      } else {
        const newData = { ...editShopData };
        if (type === 'avatar') {
          newData.avatar = result.assets[0].uri;
        } else {
          newData.banner = result.assets[0].uri;
        }
        setEditShopData(newData);
      }
    }
  };

  const takePhoto = async (type) => {
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: type === 'banner' ? [3, 1] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'product') {
        setNewProduct({...newProduct, photos: [result.assets[0].uri]});
      } else {
        const newData = { ...editShopData };
        if (type === 'avatar') {
          newData.avatar = result.assets[0].uri;
        } else {
          newData.banner = result.assets[0].uri;
        }
        setEditShopData(newData);
      }
    }
  };

  const showProductImageOptions = () => {
    Alert.alert(
      'Photo du plat',
      'Choisissez comment ajouter une image',
      [
        { text: 'Prendre une photo', onPress: () => takePhoto('product') },
        { text: 'Choisir dans la galerie', onPress: () => pickImage('product') },
        { text: 'Supprimer', onPress: () => setNewProduct({...newProduct, photos: []}) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const showImageOptions = (type) => {
    Alert.alert(
      type === 'avatar' ? 'Photo de profil' : 'Bannière',
      'Choisissez comment ajouter une image',
      [
        { text: 'Prendre une photo', onPress: () => takePhoto(type) },
        { text: 'Choisir dans la galerie', onPress: () => pickImage(type) },
        { text: 'Supprimer', onPress: () => {
          const newData = { ...editShopData };
          if (type === 'avatar') newData.avatar = null;
          else newData.banner = null;
          setEditShopData(newData);
        }},
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const isShopCreated = shopInfo.name && shopInfo.name.length > 0;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Mon Restaurant</Text>
          <Pressable style={styles.iconButton} onPress={() => setShowEditShop(true)}>
            <Ionicons name="settings-outline" size={18} color="#E6EDF3" />
          </Pressable>
        </View>

        {!isShopCreated ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="store-plus" size={64} color="#2BEE79" />
            </View>
            <Text style={styles.emptyTitle}>Créer votre restaurant</Text>
            <Text style={styles.emptyText}>
              Créez votre restaurant virtuel et commencez à vendre vos plats sur Yabisso
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={() => setShowEditShop(true)}>
              <Text style={styles.createButtonText}>Créer mon restaurant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.coverCard}>
              {shopInfo.banner ? (
                <Image source={{ uri: shopInfo.banner }} style={styles.bannerImage} />
              ) : (
                <View style={styles.bannerPlaceholder} />
              )}
              <Pressable style={styles.editBannerBtn} onPress={() => showImageOptions('banner')}>
                <Ionicons name="camera" size={16} color="#fff" />
              </Pressable>
              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeText}>OUVERT</Text>
              </View>
              <View style={styles.coverContent}>
                <Pressable style={styles.avatarContainer} onPress={() => showImageOptions('avatar')}>
                  {shopInfo.avatar ? (
                    <Image source={{ uri: shopInfo.avatar }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatar}>
                      <MaterialCommunityIcons name="silverware-fork-knife" size={28} color="#0E151B" />
                    </View>
                  )}
                  <View style={styles.avatarEditBadge}>
                    <Ionicons name="pencil" size={10} color="#fff" />
                  </View>
                </Pressable>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{shopInfo.name}</Text>
                  <Text style={styles.profileMeta}>{(shopInfo.category || []).join(', ')} · {shopInfo.location}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="clock" size={14} color="#94A3B8" />
                      <Text style={styles.metaText}>{shopInfo.hours}</Text>
                    </View>
                    {shopInfo.delivery && (
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="truck" size={14} color="#94A3B8" />
                        <Text style={styles.metaText}>Livraison {shopInfo.deliveryFee} FCA</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{products.length}</Text>
                <Text style={styles.statLabel}>Plats</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Commandes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Notes</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Statistiques</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowEditShop(true)}>
                <Text style={styles.secondaryButtonText}>Modifier</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabRow}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'products' && styles.tabActive]}
                onPress={() => setActiveTab('products')}
              >
                <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
                  Mes Plats ({products.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
                onPress={() => setActiveTab('orders')}
              >
                <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
                  Commandes
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'products' && (
              <View style={styles.productsSection}>
                {products.map((product) => (
                  <View key={product.id} style={styles.productItem}>
                    <View style={styles.productItemImage}>
                      {product.photos?.[0] ? (
                        <Image source={{ uri: product.photos[0] }} style={styles.productImg} />
                      ) : (
                        <MaterialCommunityIcons name="food" size={20} color="#4B5563" />
                      )}
                    </View>
                    <View style={styles.productItemInfo}>
                      <Text style={styles.productItemName}>{product.name}</Text>
                      <Text style={styles.productItemCategory}>{product.categoryName}</Text>
                      <Text style={styles.productItemPrice}>{product.price} FCA</Text>
                    </View>
                    <View style={styles.productItemActions}>
                      <TouchableOpacity style={styles.editBtn}>
                        <Ionicons name="pencil" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <TouchableOpacity 
                  style={styles.addProductBtn}
                  onPress={() => setShowAddProduct(true)}
                >
                  <Ionicons name="add" size={18} color="#0E151B" />
                  <Text style={styles.addProductBtnText}>Ajouter un plat</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'orders' && (
              <View style={styles.emptyProducts}>
                <MaterialCommunityIcons name="receipt" size={48} color="#4B5563" />
                <Text style={styles.emptyText}>Aucune commande</Text>
                <Text style={styles.emptySubtext}>Vos commandes apparaîtront ici</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showEditShop}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditShop(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isShopCreated ? 'Modifier le restaurant' : 'Créer mon restaurant'}
              </Text>
              <TouchableOpacity onPress={() => setShowEditShop(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Photos du restaurant</Text>
              
              <View style={styles.imageUploadRow}>
                <View style={styles.imageUploadGroup}>
                  <Text style={styles.imageUploadLabel}>Logo</Text>
                  <TouchableOpacity 
                    style={styles.imageUploadBox}
                    onPress={() => showImageOptions('avatar')}
                  >
                    {editShopData.avatar ? (
                      <Image source={{ uri: editShopData.avatar }} style={styles.imagePreview} />
                    ) : (
                      <View style={styles.imageUploadPlaceholder}>
                        <Ionicons name="person" size={24} color="#94A3B8" />
                        <Text style={styles.imageUploadText}>Ajouter</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.imageUploadGroup}>
                  <Text style={styles.imageUploadLabel}>Bannière</Text>
                  <TouchableOpacity 
                    style={styles.imageUploadBox}
                    onPress={() => showImageOptions('banner')}
                  >
                    {editShopData.banner ? (
                      <Image source={{ uri: editShopData.banner }} style={styles.imagePreview} />
                    ) : (
                      <View style={styles.imageUploadPlaceholder}>
                        <Ionicons name="image" size={24} color="#94A3B8" />
                        <Text style={styles.imageUploadText}>Ajouter</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du restaurant</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editShopData.name}
                  onChangeText={(text) => setEditShopData({...editShopData, name: text})}
                  placeholder="Mon Restaurant"
                  placeholderTextColor="#6B7A8B"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catégories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                  {categories.map((cat) => {
                    const currentCategories = Array.isArray(editShopData.category) ? editShopData.category : [];
                    const isSelected = currentCategories.includes(cat.name);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                        onPress={() => {
                          let newCategories = [...currentCategories];
                          if (isSelected) {
                            newCategories = newCategories.filter(c => c !== cat.name);
                          } else {
                            newCategories.push(cat.name);
                          }
                          setEditShopData({...editShopData, category: newCategories});
                        }}
                      >
                        <MaterialCommunityIcons 
                          name={cat.icon} 
                          size={18} 
                          color={isSelected ? '#0E151B' : '#94A3B8'} 
                        />
                        <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Localisation</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editShopData.location}
                  onChangeText={(text) => setEditShopData({...editShopData, location: text})}
                  placeholder="Centre-ville, Rue principale"
                  placeholderTextColor="#6B7A8B"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Téléphone</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editShopData.phone}
                  onChangeText={(text) => setEditShopData({...editShopData, phone: text})}
                  placeholder="+237 6XX XXX XXX"
                  placeholderTextColor="#6B7A8B"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Horaires</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editShopData.hours}
                  onChangeText={(text) => setEditShopData({...editShopData, hours: text})}
                  placeholder="9h - 21h"
                  placeholderTextColor="#6B7A8B"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Frais de livraison (FCA)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editShopData.deliveryFee}
                  onChangeText={(text) => setEditShopData({...editShopData, deliveryFee: text})}
                  placeholder="500"
                  placeholderTextColor="#6B7A8B"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Commande minimum (FCA)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editShopData.minOrder}
                  onChangeText={(text) => setEditShopData({...editShopData, minOrder: text})}
                  placeholder="1000"
                  placeholderTextColor="#6B7A8B"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={editShopData.description}
                  onChangeText={(text) => setEditShopData({...editShopData, description: text})}
                  placeholder="Décrivez votre restaurant..."
                  placeholderTextColor="#6B7A8B"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveShopInfo}>
                <Text style={styles.saveButtonText}>
                  {isShopCreated ? 'Enregistrer' : 'Créer mon restaurant'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddProduct}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddProduct(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un plat</Text>
              <TouchableOpacity onPress={() => setShowAddProduct(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Photos du plat (max 5)</Text>
              
              <View style={styles.imageUploadRow}>
                {newProduct.photos?.map((photo, index) => (
                  <View key={index} style={styles.productPhotoContainer}>
                    <Image source={{ uri: photo }} style={styles.productPhoto} />
                    <Pressable 
                      style={styles.removePhotoBtn}
                      onPress={() => {
                        const newPhotos = [...newProduct.photos];
                        newPhotos.splice(index, 1);
                        setNewProduct({...newProduct, photos: newPhotos});
                      }}
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </Pressable>
                  </View>
                ))}
                {(!newProduct.photos || newProduct.photos.length < 5) && (
                  <TouchableOpacity 
                    style={styles.addPhotoBtn}
                    onPress={showProductImageOptions}
                  >
                    <Ionicons name="camera" size={24} color="#94A3B8" />
                    <Text style={styles.addPhotoText}>{newProduct.photos?.length || 0}/5</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du plat</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newProduct.name}
                  onChangeText={(text) => setNewProduct({...newProduct, name: text})}
                  placeholder="Ex: Poulet DG"
                  placeholderTextColor="#6B7A8B"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prix (FCFA)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newProduct.price}
                  onChangeText={(text) => setNewProduct({...newProduct, price: text})}
                  placeholder="Ex: 2500"
                  placeholderTextColor="#6B7A8B"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Catégorie</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryChip, newProduct.category === cat.name && styles.categoryChipActive]}
                      onPress={() => setNewProduct({...newProduct, category: cat.name})}
                    >
                      <MaterialCommunityIcons 
                        name={cat.icon} 
                        size={18} 
                        color={newProduct.category === cat.name ? '#0E151B' : '#94A3B8'} 
                      />
                      <Text style={[styles.categoryChipText, newProduct.category === cat.name && styles.categoryChipTextActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                  value={newProduct.description}
                  onChangeText={(text) => setNewProduct({...newProduct, description: text})}
                  placeholder="Décrivez votre plat..."
                  placeholderTextColor="#6B7A8B"
                  multiline
                />
              </View>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleAddProduct}
              >
                <Text style={styles.saveButtonText}>Ajouter le plat</Text>
              </TouchableOpacity>
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: '#2BEE79',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 32,
  },
  createButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
  },
  coverCard: {
    marginTop: 20,
    borderRadius: 22,
    padding: 18,
    paddingTop: 80,
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  coverBadge: {
    position: 'absolute',
    top: 18,
    left: 18,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 5,
  },
  coverBadgeText: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: '700',
  },
  coverContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  profileMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 10,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  actionRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2BEE79',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryButtonText: {
    color: '#E6EDF3',
    fontSize: 13,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2BEE79',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0E151B',
    fontWeight: '700',
  },
  productsSection: {
    marginTop: 8,
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySubtext: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 8,
  },
  addProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2BEE79',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  addProductBtnText: {
    color: '#0E151B',
    fontSize: 14,
    fontWeight: '600',
  },
  productItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  productItemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  productItemInfo: {
    flex: 1,
  },
  productItemName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  productItemCategory: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  productItemPrice: {
    color: '#2BEE79',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  productItemActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
  },
  editBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
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
    paddingBottom: 20,
    paddingTop: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  imageUploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  imageUploadGroup: {
    flex: 1,
  },
  imageUploadLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  imageUploadBox: {
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imageUploadPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalInput: {
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderRadius: 12,
    padding: 14,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  categoryChipText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  categoryChipTextActive: {
    color: '#0E151B',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2BEE79',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
  productPhotoContainer: {
    position: 'relative',
    marginRight: 8,
  },
  productPhoto: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  bannerPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
  },
  editBannerBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#0E151B',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
  },
});