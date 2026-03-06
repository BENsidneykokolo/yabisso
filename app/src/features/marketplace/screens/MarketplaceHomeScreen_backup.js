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
  { label: 'Nouveauté', icon: 'sparkles' },
  { label: 'Commande', icon: 'shopping' },
  { label: 'Panier', icon: 'cart' },
];

const categories = [
  { name: 'Téléphones', icon: 'smartphone', color: '#137fec' },
  { name: 'Mode', icon: 'tshirt-crew', color: '#eab308' },
  { name: 'Maison', icon: 'sofa', color: '#22c55e' },
  { name: 'Beauté', icon: 'face-woman', color: '#ef4444' },
  { name: 'Accessoire', icon: 'watch', color: '#8b5cf6' },
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
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    { label: 'Accueil', icon: 'home', screen: null },
    { label: 'Boutique', icon: 'store', screen: 'marketplace_home' },
    { label: 'Catégories', icon: 'view-grid', screen: 'category_page' },
    { label: 'Nouveautés', icon: 'sparkles', screen: 'new_arrivals' },
    { label: 'Mes commandes', icon: 'shopping', screen: 'orders' },
    { label: 'Panier', icon: 'cart', screen: 'cart' },
    { label: 'Favoris', icon: 'heart', screen: null },
    { label: 'Historique', icon: 'history', screen: null },
    { label: 'Paramètres', icon: 'cog', screen: null },
    { label: 'Aide & Support', icon: 'help-circle', screen: null },
  ];

  const handleMenuPress = (item) => {
    setShowMenu(false);
    if (item.screen) {
      if (item.screen === 'marketplace_home') {
        // Already on home
      } else {
        onNavigate?.(item.screen);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.userInfo}>
                <Pressable style={styles.menuBtn} onPress={() => setShowMenu(true)}>
                  <MaterialCommunityIcons name="menu" size={26} color="#fff" />
                </Pressable>
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
            {/* Categories */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Catégories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoriesRow}>
                  {categories.map((cat, index) => (
                    <View key={index} style={styles.categoryItem}>
                      <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                        <MaterialCommunityIcons name={cat.icon} size={20} color="#fff" />
                      </View>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Deals */}
            <View style={styles.dealsSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.dealsRow}>
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
                </View>
              </ScrollView>
            </View>

            {/* Products Grid */}
            <View style={styles.productsSection}>
              <View style={styles.productsHeader}>
                <Text style={styles.sectionTitle}>Produits populaires</Text>
                <Pressable>
                  <Text style={styles.seeAll}>Voir tout</Text>
                </Pressable>
              </View>
              <View style={styles.productsGrid}>
                {products.map((product) => (
                  <Pressable 
                    key={product.id} 
                    style={styles.productCard}
                    onPress={() => onNavigate?.('product_details')}
                  >
                    <View style={styles.productImage}>
                      <MaterialCommunityIcons name="image" size={40} color="#324d67" />
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.productBrand}>{product.brand}</Text>
                      <Text style={styles.productPrice}>{product.price}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Voice Modal */}
        <Modal visible={showVoiceModal} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setShowVoiceModal(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Recherche vocale</Text>
              <Text style={styles.modalSubtitle}>Parler maintenant...</Text>
              <View style={styles.voiceWaveContainer}>
                {[1,2,3,4,5].map(i => (
                  <View key={i} style={[styles.voiceWave, { height: 20 + Math.random() * 30 }]} />
                ))}
              </View>
              <Pressable style={styles.voiceCancelBtn} onPress={() => setShowVoiceModal(false)}>
                <Text style={styles.voiceCancelText}>Annuler</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Camera Modal */}
        <Modal visible={showCameraModal} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setShowCameraModal(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Scanner</Text>
              <Text style={styles.modalSubtitle}> Scanner un code QR ou produit</Text>
              <View style={styles.cameraOptions}>
                <Pressable style={styles.cameraOptionBtn}>
                  <View style={styles.cameraOptionIcon}>
                    <MaterialCommunityIcons name="qrcode-scan" size={32} color="#fff" />
                  </View>
                  <Text style={styles.cameraOptionText}>Scanner QR</Text>
                </Pressable>
                <Pressable style={styles.cameraOptionBtn}>
                  <View style={styles.cameraOptionIcon}>
                    <MaterialCommunityIcons name="camera" size={32} color="#fff" />
                  </View>
                  <Text style={styles.cameraOptionText}>Photo produit</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Menu Modal */}
        <Modal visible={showMenu} transparent animationType="slide">
          <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <View style={styles.menuUserInfo}>
                  <View style={styles.menuAvatar}>
                    <MaterialCommunityIcons name="account" size={28} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.menuUserName}>Alex</Text>
                    <Text style={styles.menuUserEmail}>alex@yabisso.com</Text>
                  </View>
                </View>
                <Pressable onPress={() => setShowMenu(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </Pressable>
              </View>
              
              <View style={styles.menuItems}>
                {menuItems.map((item, index) => (
                  <Pressable 
                    key={index} 
                    style={styles.menuItem}
                    onPress={() => handleMenuPress(item)}
                  >
                    <MaterialCommunityIcons name={item.icon} size={22} color="#94a3b8" />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
                  </Pressable>
                ))}
              </View>

              <View style={styles.menuFooter}>
                <Text style={styles.menuFooterText}>Yabisso Marché v1.0</Text>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Bottom Navigation */}
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
                    setActiveTab(item.label);
                    if (item.label === 'Boutique') {
                      // Already on marketplace home
                    } else if (item.label === 'Catégories') {
                      onNavigate?.('category_page');
                    } else if (item.label === 'Panier') {
                      onNavigate?.('cart');
                    } else if (item.label === 'Nouveauté') {
                      onNavigate?.('new_arrivals');
                    } else if (item.label === 'Commande') {
                      onNavigate?.('orders');
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#101922',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1c2630',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  location: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  notificationBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1c2630',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#1c2630',
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusChipSecondary: {
    backgroundColor: 'rgba(19, 127, 236, 0.15)',
  },
  statusTextGreen: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    color: '#137fec',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#fff',
  },
  searchRight: {
    flexDirection: 'row',
    gap: 8,
  },
  searchMini: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#233648',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  categoriesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#94a3b8',
  },
  dealsSection: {
    marginTop: 20,
  },
  dealsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dealCard: {
    width: 260,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dealContent: {
    flex: 1,
    backgroundColor: '#1c2630',
    padding: 16,
    justifyContent: 'center',
  },
  dealTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  dealTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  dealSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  productsSection: {
    marginTop: 24,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: '#137fec',
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    height: 100,
    backgroundColor: '#233648',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  productBrand: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#137fec',
    marginTop: 8,
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContent: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#1a2632',
    height: '100%',
    paddingTop: 50,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#324d67',
  },
  menuUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuUserEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  menuItems: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: '#e2e8f0',
  },
  menuFooter: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  menuFooterText: {
    fontSize: 12,
    color: '#64748b',
  },
});
