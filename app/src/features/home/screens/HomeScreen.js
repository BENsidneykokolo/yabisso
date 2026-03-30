import React, { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useServicePreferences } from '../../../hooks/useServicePreferences';
import { ALL_SERVICES } from '../../../constants/Services';


export default function HomeScreen({
  onOpenWallet,
  onOpenAssistant,
  onOpenProfile,
  onOpenMarket,
  showAllServicesOverride,
  onOpenQr,
  onOpenSettings,
  onOpenNotifications,
  onOpenLoba,
  onOpenOrders,
  onOpenRestaurant,
  onOpenHotel,
  onOpenServices,
  onOpenRealEstate,
  onOpenChat,
  onOpenPharmacy,
}) {
  const { baseVisible, extraVisible, visibleServices, loading } = useServicePreferences();
  const [activeTab, setActiveTab] = useState('Accueil');
  const [showAllServices, setShowAllServices] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const isExpanded = showAllServices;

  useEffect(() => {
    if (typeof showAllServicesOverride === 'boolean') {
      setShowAllServices(showAllServicesOverride);
      setActiveTab(showAllServicesOverride ? 'Services' : 'Accueil');
    }
  }, [showAllServicesOverride]);

  const navItems = [
    { label: 'Accueil', icon: 'home-variant' },
    { label: 'Portefeuille', icon: 'wallet' },
    { label: 'Assistant IA', icon: 'robot' },
    { label: 'Services', icon: 'view-grid' },
    { label: 'Commande', icon: 'shopping' },
    { label: 'Profil', icon: 'account' },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topSpacer} />
        <View style={styles.headerRow}>
          <Pressable style={styles.profileRow} onPress={onOpenProfile}>
            <View style={styles.avatar}>
              <View style={styles.avatarDot} />
            </View>
            <View>
              <Text style={styles.welcome}>
                {isExpanded ? 'BON RETOUR' : 'BON RETOUR'}
              </Text>
              <Text style={styles.name}>Kwesi</Text>
            </View>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.actionButton} onPress={onOpenQr}>
              <Ionicons name="qr-code" size={18} color="#E6EDF3" />
            </Pressable>
            <Pressable style={styles.actionButton} onPress={onOpenSettings}>
              <Ionicons name="settings-outline" size={18} color="#E6EDF3" />
            </Pressable>
            <Pressable style={styles.actionButton} onPress={onOpenNotifications}>
              <Ionicons name="notifications-outline" size={18} color="#E6EDF3" />
              <View style={styles.actionDot} />
            </Pressable>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusChip, styles.statusOnline]}>
            <Ionicons name="wifi" size={14} color="#2BEE79" />
            <Text style={styles.statusText}>
              {isExpanded ? 'EN LIGNE' : 'EN LIGNE'}
            </Text>
          </View>
          <View style={[styles.statusChip, styles.statusSync]}>
            <Ionicons name="sync" size={14} color="#FACC15" />
            <Text style={styles.statusText}>
              {isExpanded ? 'SYNCHRO DONNEES' : 'SYNCHRO DONNEES'}
            </Text>
          </View>
          <View style={[styles.statusChip, styles.statusSms]}>
            <Ionicons name="chatbubble-ellipses" size={14} color="#64748B" />
            <Text style={styles.statusTextMuted}>
              {isExpanded ? 'MODE SMS' : 'MODE SMS'}
            </Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#7C8A9A" />
          <Text style={styles.searchPlaceholder}>
            {isExpanded
              ? 'Rechercher un service (ex: resto)'
              : 'Rechercher un service (ex: resto)'}
          </Text>
          <View style={styles.searchRight}>
            <Pressable style={styles.searchMini} onPress={() => setShowCameraModal(true)}>
              <Ionicons name="camera" size={14} color="#CBD5F5" />
            </Pressable>
            <Pressable style={styles.searchMini} onPress={() => setShowVoiceModal(true)}>
              <Ionicons name="mic" size={14} color="#CBD5F5" />
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Services</Text>
          {visibleServices.length > 16 && (
            <Pressable
              onPress={() => {
                if (isExpanded) {
                  setShowAllServices(false);
                } else {
                  setShowAllServices(true);
                  setActiveTab('Services');
                }
              }}
            >
              <Text style={styles.sectionLink}>
                {isExpanded ? 'Masquer' : 'Tout voir'}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.servicesGrid}>
          {(showAllServices ? visibleServices : visibleServices.slice(0, 16)).map((item) => (
            <Pressable
              key={`${item.key}_v2`}
              style={({ pressed }) => [
                styles.serviceItem,
                pressed && styles.serviceItemPressed,
              ]}
              onPress={() => {
                // Handlers unifiés pour tous les services
                if (item.key === 'market') onOpenMarket?.();
                if (item.key === 'loba') onOpenLoba?.();
                if (item.key === 'food') onOpenRestaurant?.();
                if (item.key === 'hotels') onOpenHotel?.();
                if (item.key === 'services') onOpenServices?.();
                if (item.key === 'realestate' || item.key === 'appartements') onOpenRealEstate?.();
                if (item.key === 'wallet') {
                  onOpenWallet?.();
                  setActiveTab('Portefeuille');
                }
                if (item.key === 'chatbot') {
                  onOpenAssistant?.();
                  setActiveTab('Assistant IA');
                }
                if (item.key === 'chat') onOpenChat?.();
                if (item.key === 'pharmacy') onOpenPharmacy?.();
              }}
            >
              <View style={[styles.serviceIcon, { backgroundColor: item.color }]}>
                <MaterialCommunityIcons name={item.icon} size={22} color="#0E151B" />
              </View>
              <Text style={styles.serviceLabel} numberOfLines={1}>
                {item.labelFr || item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {showAllServices && (
          <View style={styles.allServicesSection}>
            <Text style={styles.sectionHint}>Supplementaires disponibles sur Yabisso</Text>
          </View>
        )}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Tendances</Text>
          <Text style={styles.sectionLink}>Tout voir</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.trendingRow}>
            <View style={[styles.trendingCard, styles.trendingCardWide]}>
              <View style={styles.trendingBadge}>
                <Text style={styles.trendingBadgeText}>EVENEMENT</Text>
              </View>
              <Text style={styles.trendingTitle}>AfroBeats Fest</Text>
              <Text style={styles.trendingSubtitle}>-20% sur les billets</Text>
            </View>
            <View style={[styles.trendingCard, styles.trendingCardTall]}>
              <View style={[styles.trendingBadge, styles.trendingBadgeLive]}>
                <Text style={styles.trendingBadgeText}>EN DIRECT</Text>
              </View>
              <Text style={styles.trendingTitle}>Weekend live</Text>
              <Text style={styles.trendingSubtitle}>Jusqua 50% de gain</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>En vedette</Text>
          <Text style={styles.sectionLink}>Tout voir</Text>
        </View>

        <View style={styles.featuredRow}>
          <View style={[styles.featuredCard, styles.featuredBlue]}>
            <View style={styles.featuredPill}>
              <Text style={styles.featuredPillText}>SUPER APP</Text>
            </View>
            <Text style={styles.featuredTitle}>Portefeuille Yabisso</Text>
            <Text style={styles.featuredSubtitle}>Cashback a chaque transaction</Text>
          </View>
          <View style={[styles.featuredCard, styles.featuredPurple]}>
            <View style={styles.featuredPill}>
              <Text style={styles.featuredPillText}>IA CHAT</Text>
            </View>
            <Text style={styles.featuredTitle}>Assistant intelligent</Text>
            <Text style={styles.featuredSubtitle}>Aide en quelques secondes</Text>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
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
                  if (item.label === 'Services') {
                    setShowAllServices(true);
                  }
                  if (item.label === 'Accueil') {
                    setShowAllServices(false);
                  }
                  if (item.label === 'Portefeuille') {
                    onOpenWallet?.();
                  }
                  if (item.label === 'Assistant IA') {
                    onOpenAssistant?.();
                  }
                  if (item.label === 'Commande') {
                    onOpenOrders?.();
                  }
                  if (item.label === 'Profil') {
                    onOpenProfile?.();
                  }
                }}
              >
                <View
                  style={[
                    styles.navIcon,
                    isActive && styles.navIconActive,
                    isActive && styles.navIconCenter,
                  ]}
                >
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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  topSpacer: {
    height: 20,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#C6D1DC',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  avatarDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2BEE79',
    borderWidth: 2,
    borderColor: '#0E151B',
  },
  welcome: {
    color: '#9FB0C3',
    fontSize: 11,
    letterSpacing: 1,
  },
  name: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  actionDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4F',
    borderWidth: 1,
    borderColor: '#0E151B',
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  statusChip: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusOnline: {
    backgroundColor: 'rgba(43, 238, 121, 0.12)',
    borderColor: 'rgba(43, 238, 121, 0.4)',
  },
  statusSync: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderColor: 'rgba(250, 204, 21, 0.4)',
  },
  statusSms: {
    backgroundColor: 'rgba(30, 40, 50, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusText: {
    color: '#E6EDF3',
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextMuted: {
    color: '#7C8A9A',
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
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
  searchPlaceholder: {
    color: '#7C8A9A',
    flex: 1,
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
  sectionRow: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 6,
  },
  sectionLink: {
    color: '#1F8EFA',
    fontSize: 12,
  },
  sectionHint: {
    color: '#8A97A6',
    fontSize: 12,
    marginBottom: 12,
  },
  allServicesSection: {
    marginTop: 10,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },
  serviceItem: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  serviceItemPressed: {
    transform: [{ scale: 0.96 }],
  },
  serviceIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: {
    color: '#B6C2CF',
    fontSize: 11,
    textAlign: 'center',
  },
  trendingRow: {
    flexDirection: 'row',
  },
  trendingCard: {
    height: 140,
    borderRadius: 18,
    padding: 16,
    marginRight: 16,
    backgroundColor: 'rgba(35, 47, 63, 0.9)',
  },
  trendingCardWide: {
    width: 220,
  },
  trendingCardTall: {
    width: 160,
  },
  trendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5B84C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  trendingBadgeLive: {
    backgroundColor: '#F97316',
  },
  trendingBadgeText: {
    color: '#0E151B',
    fontSize: 10,
    fontWeight: '700',
  },
  trendingTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  trendingSubtitle: {
    color: '#B6C2CF',
    fontSize: 12,
    marginTop: 6,
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredCard: {
    width: '48%',
    borderRadius: 18,
    padding: 16,
    minHeight: 140,
    justifyContent: 'flex-end',
  },
  featuredBlue: {
    backgroundColor: '#1E3A8A',
  },
  featuredPurple: {
    backgroundColor: '#5B21B6',
  },
  featuredPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  featuredPillText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  featuredTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  featuredSubtitle: {
    color: '#D1DAE5',
    fontSize: 11,
    marginTop: 6,
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
    backgroundColor: '#2BEE79',
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
    backgroundColor: '#1a242d',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(19, 127, 236, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#92adc9',
    fontSize: 14,
    marginBottom: 24,
  },
  voiceWaveContainer: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  voiceWave: {
    width: 4,
    height: 20,
    backgroundColor: '#137fec',
    marginHorizontal: 3,
    borderRadius: 2,
  },
  voiceCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  voiceCancelText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
