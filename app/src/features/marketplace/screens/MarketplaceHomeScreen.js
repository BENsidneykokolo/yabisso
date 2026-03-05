import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const bottomNavItems = [
  { label: 'Boutique', icon: 'store' },
  { label: 'Catégories', icon: 'view-grid' },
  { label: 'Chatbot', icon: 'robot' },
  { label: 'Nouveauté', icon: 'sparkles' },
  { label: 'Commande', icon: 'shopping' },
];

const categories = [
  { name: 'Téléphones', icon: 'smartphone', color: '#137fec' },
  { name: 'Mode', icon: 'tshirt-crew', color: '#eab308' },
  { name: 'Maison', icon: 'sofa', color: '#22c55e' },
  { name: 'Beauté', icon: 'face-woman', color: '#ef4444' },
];

const products = [
  { id: 1, name: 'iPhone 13 Pro', brand: 'Apple', price: '450k' },
  { id: 2, name: 'Air Zoom Pegasus', brand: 'Nike', price: '65k' },
  { id: 3, name: 'Galaxy Watch 5', brand: 'Samsung', price: '120k' },
  { id: 4, name: 'MacBook Air', brand: 'Apple', price: '680k' },
];

const deals = [
  { id: 1, title: 'Grande Vente', subtitle: 'Électronique & Accessoires', tag: 'PROMO -50%', tagColor: '#ef4444' },
  { id: 2, title: 'Tech Deals', subtitle: 'Arrivages récents', tag: 'NOUVEAU', tagColor: '#eab308' },
];

export default function MarketplaceHomeScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Boutique');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons name="account" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.greeting}>Bonjour, Alex</Text>
                  <Text style={styles.location}>Abidjan, CI</Text>
                </View>
              </View>
              <Pressable style={styles.notificationBtn}>
                <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
                <View style={styles.notificationDot} />
              </Pressable>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusChip}>
                <MaterialCommunityIcons name="wifi" size={14} color="#22c55e" />
                <Text style={styles.statusTextGreen}>Online</Text>
              </View>
              <View style={[styles.statusChip, styles.statusChipSecondary]}>
                <MaterialCommunityIcons name="cloud-check-outline" size={14} color="#137fec" />
                <Text style={styles.statusText}>Syncronisé</Text>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={18} color="#7C8A9A" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un service (ex: resto)"
                placeholderTextColor="#7C8A9A"
                value={searchText}
                onChangeText={setSearchText}
              />
              <View style={styles.searchRight}>
                <Pressable style={styles.searchMini} onPress={() => setShowVoiceModal(true)}>
                  <MaterialCommunityIcons name="microphone" size={14} color="#CBD5F5" />
                </Pressable>
                <Pressable style={styles.searchMini} onPress={() => setShowCameraModal(true)}>
                  <MaterialCommunityIcons name="camera" size={14} color="#CBD5F5" />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dealsCarousel}>
              {deals.map((deal) => (
                <View key={deal.id} style={styles.dealCard}>
                  <View style={styles.dealContent}>
                    <View style={[styles.dealTag, { backgroundColor: deal.tagColor }]}>
                      <Text style={styles.dealTagText}>{deal.tag}</Text>
                    </View>
                    <Text style={styles.dealTitle}>{deal.title}</Text>
                    <Text style={styles.dealSubtitle}>{deal.subtitle}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Catégories</Text>
                <Pressable onPress={() => onNavigate?.('product_list')}>
                  <Text style={styles.seeAll}>Voir tout</Text>
                </Pressable>
              </View>
              <View style={styles.categoriesGrid}>
                {categories.map((cat) => (
                  <Pressable key={cat.name} style={styles.categoryItem} onPress={() => onNavigate?.('product_list')}>
                    <View style={[styles.categoryIcon, { borderColor: cat.color }]}>
                      <MaterialCommunityIcons name={cat.icon} size={28} color={cat.color} />
                    </View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Populaires</Text>
              <View style={styles.productsGrid}>
                {products.map((product) => (
                  <Pressable 
                    key={product.id} 
                    style={styles.productCard}
                    onPress={() => onNavigate?.('product_details')}
                  >
                    <View style={styles.productImage}>
                      <Pressable 
                        style={styles.favoriteBtn}
                        onPress={(e) => e.stopPropagation()}
                      >
                        <MaterialCommunityIcons name="heart-outline" size={18} color="#fff" />
                      </Pressable>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productBrand}>{product.brand}</Text>
                      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                      <View style={styles.productBottom}>
                        <Text style={styles.productPrice}>{product.price} FCFA</Text>
                        <Pressable 
                          style={styles.addBtn}
                          onPress={(e) => e.stopPropagation()}
                        >
                          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <SafeAreaView style={styles.bottomNavWrapper}>
          <View style={styles.bottomNav}>
            {bottomNavItems.map((item) => {
              const isActive = activeTab === item.label;
              return (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [
                    styles.navItem,
                    pressed && styles.navItemPressed,
                  ]}
                  onPress={() => {
                    if (item.label === 'Boutique') {
                      // Already on marketplace home
                    } else if (item.label === 'Catégories') {
                      onNavigate?.('category_page');
                    } else {
                      setActiveTab(item.label);
                    }
                  }}
                >
                  <View style={[
                    styles.navIcon,
                    isActive && styles.navIconActive,
                    isActive && styles.navIconCenter,
                  ]}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={isActive ? 20 : 16}
                      color={isActive ? '#0E151B' : '#CBD5F5'}
                    />
                  </View>
                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SafeAreaView>

        {/* Voice Search Modal */}
        <Modal
          visible={showVoiceModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowVoiceModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowVoiceModal(false)}
          >
            <View style={styles.modalContent}>
              <Pressable style={styles.closeModalBtn} onPress={() => setShowVoiceModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
              
              <View style={styles.voiceIconContainer}>
                <MaterialCommunityIcons name="microphone" size={64} color="#137fec" />
              </View>
              
              <Text style={styles.modalTitle}>Recherche vocale</Text>
              <Text style={styles.modalSubtitle}>Parlez maintenant...</Text>
              
              <View style={styles.voiceWaveContainer}>
                <View style={styles.voiceWave} />
                <View style={styles.voiceWave} />
                <View style={styles.voiceWave} />
              </View>
              
              <Pressable style={styles.voiceCancelBtn} onPress={() => setShowVoiceModal(false)}>
                <Text style={styles.voiceCancelText}>Annuler</Text>
              </Pressable>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Camera Search Modal */}
        <Modal
          visible={showCameraModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCameraModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowCameraModal(false)}
          >
            <View style={styles.modalContent}>
              <Pressable style={styles.closeModalBtn} onPress={() => setShowCameraModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
              
              <Text style={styles.modalTitle}>Recherche par image</Text>
              <Text style={styles.modalSubtitle}>Prenez une photo ou importez une image</Text>
              
              <View style={styles.cameraOptions}>
                <Pressable style={styles.cameraOptionBtn}>
                  <View style={styles.cameraOptionIcon}>
                    <MaterialCommunityIcons name="camera" size={32} color="#fff" />
                  </View>
                  <Text style={styles.cameraOptionText}>Appareil photo</Text>
                </Pressable>
                
                <Pressable style={styles.cameraOptionBtn}>
                  <View style={styles.cameraOptionIcon}>
                    <MaterialCommunityIcons name="image" size={32} color="#fff" />
                  </View>
                  <Text style={styles.cameraOptionText}>Galerie</Text>
                </Pressable>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#101922',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  location: {
    fontSize: 12,
    color: '#94a3b8',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusChipSecondary: {
    backgroundColor: '#1a2632',
    borderColor: '#324d67',
  },
  statusTextGreen: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
  },
  searchContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#7C8A9A',
  },
  searchRight: {
    flexDirection: 'row',
  },
  searchMini: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 100,
  },
  dealsCarousel: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  dealCard: {
    width: 280,
    height: 160,
    backgroundColor: '#1a2632',
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
  },
  dealContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: '#324d67',
  },
  dealTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  dealTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  dealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  dealSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
    color: '#137fec',
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#1a2632',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#324d67',
  },
  productImage: {
    aspectRatio: 1,
    backgroundColor: '#324d67',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 12,
    gap: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#94a3b8',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#137fec',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  bottomNav: {
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navItemPressed: {
    transform: [{ scale: 0.96 }],
  },
  navIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    backgroundColor: '#3B82F6',
  },
  navIconCenter: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    marginTop: -14,
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  navLabelActive: {
    color: '#2BEE79',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a2632',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#324d67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
  },
  voiceWaveContainer: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  voiceWave: {
    width: 8,
    height: 40,
    backgroundColor: '#137fec',
    borderRadius: 4,
  },
  voiceCancelBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#324d67',
  },
  voiceCancelText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  cameraOptions: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 24,
  },
  cameraOptionBtn: {
    alignItems: 'center',
    gap: 12,
  },
  cameraOptionIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOptionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});
