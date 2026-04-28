// app/src/features/services/screens/ServicesSellerScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import ServicesSyncService from '../services/ServicesSyncService';
import OfflineValidationService from '../../kiosk/services/OfflineValidationService';

const serviceCategories = [
  { id: 'home', name: 'Maison', icon: 'home' },
  { id: 'beauty', name: 'Beauté', icon: 'lipstick' },
  { id: 'education', name: 'Éducation', icon: 'school' },
  { id: 'tech', name: 'Tech', icon: 'laptop' },
  { id: 'health', name: 'Santé', icon: 'medical-bag' },
  { id: 'delivery', name: 'Livraison', icon: 'truck' },
  { id: 'events', name: 'Événements', icon: 'party-popper' },
  { id: 'other', name: 'Autre', icon: 'dots-horizontal' },
];

export default function ServicesSellerScreen({ onBack, onNavigate }) {
  const [shopInfo, setShopInfo] = useState({
    name: '',
    phone: '',
    description: '',
    category: [],
    city: '',
    avatar: null,
    banner: null,
  });
  const [offers, setOffers] = useState([]);
  const [showEditShop, setShowEditShop] = useState(false);
  const [editShopData, setEditShopData] = useState(shopInfo);
  const [activeTab, setActiveTab] = useState('offers');
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOffer, setNewOffer] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    duration: '',
    photos: [],
  });

  // Charger les données au montage
  useEffect(() => {
    loadShopInfo();
    loadOffers();
  }, []);

  // Charger depuis WatermelonDB avec fallback SecureStore
  const loadShopInfo = async () => {
    try {
      const localServices = await ServicesSyncService.loadServices();
      if (localServices.length > 0) {
        const service = localServices[0];
        setShopInfo({
          name: service.name || '',
          phone: service.phone || '',
          description: service.description || '',
          category: service.category ? [service.category] : [],
          city: service.city || '',
          avatar: service.avatar || null,
          banner: service.banner || null,
        });
        setEditShopData({
          name: service.name || '',
          phone: service.phone || '',
          description: service.description || '',
          category: service.category ? [service.category] : [],
          city: service.city || '',
          avatar: service.avatar || null,
          banner: service.banner || null,
        });
        return;
      }
    } catch (e) {
      console.log('[ServicesSeller] Erreur load WatermelonDB:', e);
    }

    // Fallback SecureStore
    try {
      const saved = await SecureStore.getItemAsync('services_shop_info');
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

  const loadOffers = async () => {
    try {
      const localOffers = await ServicesSyncService.loadOffers('local');
      if (localOffers.length > 0) {
        setOffers(localOffers);
        return;
      }
    } catch (e) {
      console.log('[ServicesSeller] Erreur load offers:', e);
    }

    // Fallback SecureStore
    try {
      const saved = await SecureStore.getItemAsync('services_offers');
      if (saved) {
        const offersData = JSON.parse(saved);
        setOffers(offersData);
      }
    } catch (e) {
      console.log('Error loading offers:', e);
    }
  };

  const handleAddOffer = async () => {
    if (!newOffer.name || !newOffer.price || !newOffer.category) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    const offer = {
      ...newOffer,
      id: Date.now().toString(),
      sellerId: 'local',
      sellerName: shopInfo.name || 'Mon Service',
    };
    
    // Sauvegarder dans WatermelonDB
    try {
      await ServicesSyncService.saveOffer(offer, 'local');
      await ServicesSyncService.addToSyncQueue('create_offer', offer);
      
      // Créer demande de validation
      await OfflineValidationService.createValidationRequest('services', offer);
    } catch (e) {
      console.log('[ServicesSeller] Erreur save WatermelonDB:', e);
    }

    const updatedOffers = [...offers, offer];
    setOffers(updatedOffers);
    
    // Garder SecureStore pour compatibilité
    await SecureStore.setItemAsync('services_offers', JSON.stringify(updatedOffers));
    
    setNewOffer({ name: '', price: '', description: '', category: '', duration: '', photos: [] });
    setShowAddOffer(false);
    Alert.alert('Succès', 'Service ajouté et sauvegardé localement !');
  };

  const saveShopInfo = async () => {
    try {
      try {
        await ServicesSyncService.saveService(editShopData);
        await ServicesSyncService.addToSyncQueue('create_service', editShopData);
      } catch (e) {
        console.log('[ServicesSeller] Erreur save WatermelonDB:', e);
      }

      await SecureStore.setItemAsync('services_shop_info', JSON.stringify(editShopData));
      setShopInfo(editShopData);
      setShowEditShop(false);
      Alert.alert('Succès', 'Informations sauvegardées localement !');
    } catch (e) {
      console.log('Error saving shop info:', e);
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    }
  };

  const requestPermissions = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Autorisez la caméra pour prendre des photos.');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Autorisez la galerie pour ajouter des photos.');
        return false;
      }
    }
    return true;
  };

  const pickImage = async (type) => {
    const hasPermission = await requestPermissions(type === 'camera' ? 'camera' : 'gallery');
    if (!hasPermission) return;

    const result = type === 'camera' 
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsMultiple: true });

    if (!result.canceled) {
      const images = type === 'camera' ? [result.assets[0].uri] : result.assets.map(a => a.uri);
      setNewOffer(prev => ({ ...prev, photos: [...prev.photos, ...images].slice(0, 5) }));
    }
  };

  const removePhoto = (index) => {
    setNewOffer(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mes Services</Text>
        <Pressable onPress={() => setShowEditShop(true)} style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Shop Info Card */}
      <View style={styles.shopCard}>
        <View style={styles.shopAvatarContainer}>
          {shopInfo.avatar ? (
            <Image source={{ uri: shopInfo.avatar }} style={styles.shopAvatar} />
          ) : (
            <View style={styles.shopAvatarPlaceholder}>
              <Ionicons name="business" size={40} color="#666" />
            </View>
          )}
        </View>
        <Text style={styles.shopName}>{shopInfo.name || 'Mon Service'}</Text>
        <Text style={styles.shopCategory}>
          {shopInfo.category?.join(', ') || 'Aucune catégorie'}
        </Text>
        <Text style={styles.shopDesc} numberOfLines={2}>
          {shopInfo.description || 'Décrivez votre service...'}
        </Text>
        {shopInfo.phone && (
          <Text style={styles.shopPhone}>📞 {shopInfo.phone}</Text>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable 
          style={[styles.tab, activeTab === 'offers' && styles.tabActive]} 
          onPress={() => setActiveTab('offers')}
        >
          <Text style={[styles.tabText, activeTab === 'offers' && styles.tabTextActive]}>
            Mes Offres
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]} 
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
            Commandes
          </Text>
        </Pressable>
      </View>

      {/* Offers List */}
      <ScrollView style={styles.content}>
        {offers.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="#666" />
            <Text style={styles.emptyText}>Aucune offre ajoutée</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez vos services pour attirer des clients
            </Text>
          </View>
        ) : (
          offers.map((offer, index) => (
            <View key={index} style={styles.offerCard}>
              <View style={styles.offerInfo}>
                <Text style={styles.offerName}>{offer.name}</Text>
                <Text style={styles.offerCategory}>{offer.category}</Text>
                <Text style={styles.offerDesc}>{offer.description}</Text>
                <Text style={styles.offerPrice}>{offer.price} FCFA</Text>
                {offer.duration && (
                  <Text style={styles.offerDuration}>⏱ {offer.duration}h</Text>
                )}
              </View>
              <View style={styles.offerStatus}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Offline</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Add Offer Button */}
        <Pressable style={styles.addButton} onPress={() => setShowAddOffer(true)}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter une offre</Text>
        </Pressable>
      </ScrollView>

      {/* Edit Shop Modal */}
      <Modal visible={showEditShop} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier mon service</Text>
              <Pressable onPress={() => setShowEditShop(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>
            <ScrollView>
              <Text style={styles.inputLabel}>Nom du service *</Text>
              <TextInput
                style={styles.input}
                value={editShopData.name}
                onChangeText={text => setEditShopData(prev => ({ ...prev, name: text }))}
                placeholder="Ex: Bâtiment Net Services"
              />
              
              <Text style={styles.inputLabel}>Téléphone *</Text>
              <TextInput
                style={styles.input}
                value={editShopData.phone}
                onChangeText={text => setEditShopData(prev => ({ ...prev, phone: text }))}
                placeholder="+237 000 000 000"
                keyboardType="phone-pad"
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editShopData.description}
                onChangeText={text => setEditShopData(prev => ({ ...prev, description: text }))}
                placeholder="Décrivez votre service..."
                multiline
              />
              
              <Text style={styles.inputLabel}>Catégorie</Text>
              <View style={styles.categoryGrid}>
                {serviceCategories.map(cat => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      editShopData.category?.includes(cat.id) && styles.categoryChipActive
                    ]}
                    onPress={() => {
                      const cats = editShopData.category || [];
                      const newCats = cats.includes(cat.id) 
                        ? cats.filter(c => c !== cat.id)
                        : [...cats, cat.id];
                      setEditShopData(prev => ({ ...prev, category: newCats }));
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={cat.icon} 
                      size={20} 
                      color={editShopData.category?.includes(cat.id) ? '#fff' : '#666'} 
                    />
                    <Text style={[
                      styles.categoryChipText,
                      editShopData.category?.includes(cat.id) && styles.categoryChipTextActive
                    ]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <Pressable style={styles.saveButton} onPress={saveShopInfo}>
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Add Offer Modal */}
      <Modal visible={showAddOffer} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle offre</Text>
              <Pressable onPress={() => setShowAddOffer(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>
            <ScrollView>
              <Text style={styles.inputLabel}>Nom de l'offre *</Text>
              <TextInput
                style={styles.input}
                value={newOffer.name}
                onChangeText={text => setNewOffer(prev => ({ ...prev, name: text }))}
                placeholder="Ex: Ménage domicile"
              />
              
              <Text style={styles.inputLabel}>Prix (FCFA) *</Text>
              <TextInput
                style={styles.input}
                value={newOffer.price}
                onChangeText={text => setNewOffer(prev => ({ ...prev, price: text }))}
                placeholder="5000"
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Catégorie *</Text>
              <View style={styles.categoryGrid}>
                {serviceCategories.map(cat => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      newOffer.category === cat.id && styles.categoryChipActive
                    ]}
                    onPress={() => setNewOffer(prev => ({ ...prev, category: cat.id }))}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      newOffer.category === cat.id && styles.categoryChipTextActive
                    ]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>Durée (heures)</Text>
              <TextInput
                style={styles.input}
                value={newOffer.duration}
                onChangeText={text => setNewOffer(prev => ({ ...prev, duration: text }))}
                placeholder="2"
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newOffer.description}
                onChangeText={text => setNewOffer(prev => ({ ...prev, description: text }))}
                placeholder="Décrivez cette offre..."
                multiline
              />
              
              <Text style={styles.inputLabel}>Photos (max 5)</Text>
              <View style={styles.photoSection}>
                <View style={styles.photoGrid}>
                  {newOffer.photos.map((photo, index) => (
                    <View key={index} style={styles.photoContainer}>
                      <Image source={{ uri: photo }} style={styles.photoPreview} />
                      <Pressable style={styles.removePhotoBtn} onPress={() => removePhoto(index)}>
                        <Ionicons name="close-circle" size={24} color="#FF4444" />
                      </Pressable>
                    </View>
                  ))}
                  {newOffer.photos.length < 5 && (
                    <>
                      <Pressable style={styles.addPhotoBtn} onPress={() => pickImage('camera')}>
                        <Ionicons name="camera" size={24} color="#666" />
                      </Pressable>
                      <Pressable style={styles.addPhotoBtn} onPress={() => pickImage('gallery')}>
                        <Ionicons name="images" size={24} color="#666" />
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            </ScrollView>
            <Pressable style={styles.saveButton} onPress={handleAddOffer}>
              <Text style={styles.saveButtonText}>Ajouter l'offre</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#16213e' },
  backButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  editButton: { padding: 8 },
  shopCard: { margin: 16, padding: 20, backgroundColor: '#16213e', borderRadius: 16, alignItems: 'center' },
  shopAvatarContainer: { marginBottom: 12 },
  shopAvatar: { width: 80, height: 80, borderRadius: 40 },
  shopAvatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  shopName: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  shopCategory: { color: '#2BEE79', fontSize: 14, marginBottom: 8 },
  shopDesc: { color: '#aaa', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  shopPhone: { color: '#FFD166', fontSize: 14 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#333' },
  tabActive: { borderBottomColor: '#2BEE79' },
  tabText: { color: '#666', fontSize: 16 },
  tabTextActive: { color: '#2BEE79', fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#fff', fontSize: 18, marginTop: 16 },
  emptySubtext: { color: '#666', fontSize: 14, marginTop: 8 },
  offerCard: { flexDirection: 'row', backgroundColor: '#16213e', borderRadius: 12, padding: 16, marginBottom: 12 },
  offerInfo: { flex: 1 },
  offerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  offerCategory: { color: '#2BEE79', fontSize: 12, marginBottom: 4 },
  offerDesc: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  offerPrice: { color: '#FFD166', fontSize: 16, fontWeight: 'bold' },
  offerDuration: { color: '#aaa', fontSize: 12, marginTop: 4 },
  offerStatus: { justifyContent: 'center' },
  statusBadge: { backgroundColor: '#FF6B6B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2BEE79', padding: 16, borderRadius: 12, marginVertical: 20 },
  addButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  inputLabel: { color: '#aaa', fontSize: 14, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#16213e', color: '#fff', padding: 14, borderRadius: 12, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  categoryChipActive: { backgroundColor: '#2BEE79', borderColor: '#2BEE79' },
  categoryChipText: { color: '#aaa', fontSize: 12, marginLeft: 6 },
  categoryChipTextActive: { color: '#000' },
  photoSection: { marginTop: 8 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoContainer: { position: 'relative' },
  photoPreview: { width: 80, height: 80, borderRadius: 8 },
  removePhotoBtn: { position: 'absolute', top: -8, right: -8 },
  addPhotoBtn: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#16213e', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333', borderStyle: 'dashed' },
  saveButton: { backgroundColor: '#2BEE79', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

export default ServicesSellerScreen;