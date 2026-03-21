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

export default function SellerProfileScreen({ onBack, onOpenAddProduct, onEditProduct, onContact }) {
  const [shopInfo, setShopInfo] = useState({
    name: 'Ma Boutique',
    location: 'Centre-ville',
    phone: '',
    description: '',
    hours: '8h - 20h',
    avatar: null,
    banner: null,
  });
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ products: 0, followers: 0, sales: 0, rating: 0 });
  const [showEditShop, setShowEditShop] = useState(false);
  const [editShopData, setEditShopData] = useState(shopInfo);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    loadShopInfo();
    loadProducts();
  }, []);

  const loadShopInfo = async () => {
    try {
      const saved = await SecureStore.getItemAsync('seller_shop_info');
      if (saved) {
        const data = JSON.parse(saved);
        setShopInfo(data);
        setEditShopData(data);
      }
    } catch (e) {
      console.log('Error loading shop info:', e);
    }
  };

  const loadProducts = async () => {
    try {
      const saved = await SecureStore.getItemAsync('seller_products');
      if (saved) {
        const productsData = JSON.parse(saved);
        setProducts(productsData);
        setStats(prev => ({ ...prev, products: productsData.length }));
      }
    } catch (e) {
      console.log('Error loading products:', e);
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
      const newData = { ...editShopData };
      if (type === 'avatar') {
        newData.avatar = result.assets[0].uri;
      } else {
        newData.banner = result.assets[0].uri;
      }
      setEditShopData(newData);
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
      const newData = { ...editShopData };
      if (type === 'avatar') {
        newData.avatar = result.assets[0].uri;
      } else {
        newData.banner = result.assets[0].uri;
      }
      setEditShopData(newData);
    }
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

  const saveShopInfo = async () => {
    try {
      await SecureStore.setItemAsync('seller_shop_info', JSON.stringify(editShopData));
      setShopInfo(editShopData);
      setShowEditShop(false);
      Alert.alert('Succès', 'Informations de la boutique mises à jour');
    } catch (e) {
      console.log('Error saving shop info:', e);
      Alert.alert('Erreur', 'Impossible de sauvegarder les informations');
    }
  };

  const handleQuickUpdate = async (type, uri) => {
    const newData = { ...shopInfo };
    if (type === 'avatar') newData.avatar = uri;
    else newData.banner = uri;
    try {
      await SecureStore.setItemAsync('seller_shop_info', JSON.stringify(newData));
      setShopInfo(newData);
    } catch (e) {
      console.log('Error quick updating:', e);
    }
  };

  const quickPickImage = async (type) => {
    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'banner' ? [3, 1] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await handleQuickUpdate(type, result.assets[0].uri);
    }
  };

  const quickTakePhoto = async (type) => {
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: type === 'banner' ? [3, 1] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await handleQuickUpdate(type, result.assets[0].uri);
    }
  };

  const showQuickImageOptions = (type) => {
    Alert.alert(
      type === 'avatar' ? 'Photo de profil' : 'Bannière',
      'Choisissez comment ajouter une image',
      [
        { text: 'Prendre une photo', onPress: () => quickTakePhoto(type) },
        { text: 'Choisir dans la galerie', onPress: () => quickPickImage(type) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const deleteProduct = (productId) => {
    Alert.alert(
      'Supprimer le produit',
      'Êtes-vous sûr de vouloir supprimer ce produit?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updated = products.filter(p => p.id !== productId);
            setProducts(updated);
            await SecureStore.setItemAsync('seller_products', JSON.stringify(updated));
            setStats(prev => ({ ...prev, products: updated.length }));
          },
        },
      ]
    );
  };

  const toggleProductVisibility = async (productId) => {
    const updated = products.map(p => 
      p.id === productId ? { ...p, isVisible: !p.isVisible } : p
    );
    setProducts(updated);
    await SecureStore.setItemAsync('seller_products', JSON.stringify(updated));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? 'star' : 'star-outline'}
        size={14}
        color="#FACC15"
      />
    ));
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Profil vendeur</Text>
          <Pressable style={styles.iconButton} onPress={() => setShowEditShop(true)}>
            <Ionicons name="settings-outline" size={18} color="#E6EDF3" />
          </Pressable>
        </View>

        <View style={styles.coverCard}>
          {shopInfo.banner ? (
            <Image source={{ uri: shopInfo.banner }} style={styles.bannerImage} />
          ) : (
            <View style={styles.bannerPlaceholder} />
          )}
          <Pressable style={styles.editBannerBtn} onPress={() => showQuickImageOptions('banner')}>
            <Ionicons name="camera" size={16} color="#fff" />
          </Pressable>
          <View style={styles.coverBadge}>
            <Text style={styles.coverBadgeText}>VERIFIE</Text>
          </View>
          <View style={styles.coverContent}>
            <Pressable style={styles.avatarContainer} onPress={() => showQuickImageOptions('avatar')}>
              {shopInfo.avatar ? (
                <Image source={{ uri: shopInfo.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <MaterialCommunityIcons name="storefront" size={28} color="#0E151B" />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="pencil" size={10} color="#fff" />
              </View>
            </Pressable>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{shopInfo.name}</Text>
              <Text style={styles.profileMeta}>{shopInfo.location} · {shopInfo.hours}</Text>
              <View style={styles.ratingRow}>
                {renderStars(stats.rating || 4.5)}
                <Text style={styles.ratingText}>{stats.rating || 4.6} ({stats.followers || 128} avis)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.products}</Text>
            <Text style={styles.statLabel}>Produits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.followers >= 1000 ? `${(stats.followers/1000).toFixed(1)}k` : stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.sales >= 1000 ? `${(stats.sales/1000).toFixed(1)}k` : stats.sales}</Text>
            <Text style={styles.statLabel}>Ventes</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Suivre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => onContact?.(shopInfo)}>
            <Text style={styles.secondaryButtonText}>Contacter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButtonSmall} onPress={onOpenAddProduct}>
            <Ionicons name="add" size={18} color="#0E151B" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'products' && styles.tabActive]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
              Produits ({products.length})
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
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
              Avis
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'products' && (
          <View style={styles.productsSection}>
            {products.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="package-variant" size={48} color="#4B5563" />
                <Text style={styles.emptyText}>Aucun produit</Text>
                <Text style={styles.emptySubtext}>Ajoutez votre premier produit</Text>
                <TouchableOpacity style={styles.emptyButton} onPress={onOpenAddProduct}>
                  <Text style={styles.emptyButtonText}>Ajouter un produit</Text>
                </TouchableOpacity>
              </View>
            ) : (
              products.map((product) => (
                <View key={product.id} style={styles.productItem}>
                  <View style={styles.productItemImage}>
                    {product.photos?.[0] ? (
                      <Image source={{ uri: product.photos[0] }} style={styles.productImg} />
                    ) : (
                      <Ionicons name="image" size={20} color="#4B5563" />
                    )}
                  </View>
                  <View style={styles.productItemInfo}>
                    <Text style={styles.productItemName}>{product.name}</Text>
                    <Text style={styles.productItemCategory}>{product.categoryName}</Text>
                    <View style={styles.productItemRow}>
                      <Text style={styles.productItemPrice}>{product.price} FCA</Text>
                      <Text style={styles.productItemStock}>Stock: {product.stock}</Text>
                    </View>
                  </View>
                  <View style={styles.productItemActions}>
                    <TouchableOpacity 
                      style={[styles.visibilityBtn, !product.isVisible && styles.visibilityBtnOff]}
                      onPress={() => toggleProductVisibility(product.id)}
                    >
                      <Ionicons 
                        name={product.isVisible ? 'eye' : 'eye-off'} 
                        size={16} 
                        color={product.isVisible ? '#2BEE79' : '#EF4444'} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.editBtn}
                      onPress={() => onEditProduct?.(product)}
                    >
                      <Ionicons name="pencil" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteBtn}
                      onPress={() => deleteProduct(product.id)}
                    >
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-list" size={48} color="#4B5563" />
            <Text style={styles.emptyText}>Aucune commande</Text>
            <Text style={styles.emptySubtext}>Vos commandes apparaîtront ici</Text>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.reviewsSection}>
            {[
              { id: '1', name: 'Ama', comment: 'Produits frais, livraison rapide. Je recommande.', rating: 5, date: 'Il y a 2j' },
              { id: '2', name: 'Kofi', comment: 'Belle presentation, un peu de retard sur la livraison.', rating: 4, date: 'Il y a 5j' },
            ].map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewInitial}>{review.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <View style={styles.ratingRowSmall}>
                      {renderStars(review.rating)}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <Text style={styles.reviewText}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showEditShop} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier la boutique</Text>
              <TouchableOpacity onPress={() => setShowEditShop(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Photos de la boutique</Text>
              
              <View style={styles.imageUploadRow}>
                <View style={styles.imageUploadGroup}>
                  <Text style={styles.imageUploadLabel}>Photo de profil</Text>
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
                <Text style={styles.inputLabel}>Nom de la boutique</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editShopData.name}
                  onChangeText={(text) => setEditShopData({...editShopData, name: text})}
                  placeholder="Ma Boutique"
                  placeholderTextColor="#6B7A8B"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Localisation</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editShopData.location}
                  onChangeText={(text) => setEditShopData({...editShopData, location: text})}
                  placeholder="Centre-ville"
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
                  placeholder="8h - 20h"
                  placeholderTextColor="#6B7A8B"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={editShopData.description}
                  onChangeText={(text) => setEditShopData({...editShopData, description: text})}
                  placeholder="Décrivez votre boutique..."
                  placeholderTextColor="#6B7A8B"
                  multiline
                  numberOfLines={3}
                />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={saveShopInfo}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  ratingText: {
    color: '#CBD5F5',
    fontSize: 11,
    marginLeft: 6,
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
    flex: 1.2,
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
    flex: 1.2,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 10,
  },
  secondaryButtonText: {
    color: '#E6EDF3',
    fontSize: 13,
    fontWeight: '600',
  },
  iconButtonSmall: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
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
  featuredRow: {
    flexDirection: 'row',
  },
  productCard: {
    width: 160,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 12,
  },
  productBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(250, 204, 21, 0.18)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productBadgeText: {
    color: '#FACC15',
    fontSize: 9,
    fontWeight: '700',
  },
  productImage: {
    marginTop: 16,
    height: 70,
    borderRadius: 16,
    backgroundColor: 'rgba(43, 238, 121, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  productPrice: {
    color: '#2BEE79',
    fontSize: 12,
    marginTop: 6,
  },
  reviewCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reviewInitial: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  ratingRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  reviewDate: {
    color: '#7C8A9A',
    fontSize: 10,
  },
  reviewText: {
    color: '#CBD5F5',
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
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
  productItemRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },
  productItemPrice: {
    color: '#2BEE79',
    fontSize: 13,
    fontWeight: '700',
  },
  productItemStock: {
    color: '#7C8A9A',
    fontSize: 11,
  },
  productItemActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
  },
  visibilityBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
  },
  visibilityBtnOff: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  editBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  reviewsSection: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: '#2BEE79',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  emptyButtonText: {
    color: '#0E151B',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  modalContent: {
    backgroundColor: '#1a2633',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 54,
    paddingTop: 12,
    maxHeight: '80%',
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
    padding: 10,
  },
  inputGroup: {
    marginBottom: 6,
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
  saveButton: {
    backgroundColor: '#2BEE79',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
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
