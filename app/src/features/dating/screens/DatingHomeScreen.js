import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
  PanResponder,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MOCK_PROFILES = [
  {
    id: '1',
    name: 'Amara',
    age: 24,
    location: 'Lagos, Nigeria',
    distance: '3 km',
    job: 'UX Designer',
    bio: "Tech enthusiast by day, lover of Jollof rice by night. Seeking a hiking partner who doesn't mind stopping for photos every 5 minutes. Let's explore! 🌍✨",
    interests: ['Afrobeats', 'Coding', 'Travel', 'Foodie', 'Photography'],
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChHtnEfmDk48vPhp9ZSbw5y_dNX4Cp3lvcjl1hne-L477stPYhzDFFzrmAof9KSlvlds52rSRtikFAeptFTJazjgGPB6qUkPwq8Uw2QRlybdecuh1Rnh86fmcwhF7QEv_aGPPSvuPXTR_h2lueHcN9vw70G4zcRG06K5sVlUfOm1nQjha8Gj5nnGvtUXu6Csw8CPrUpFUnU68T5IHUuS8Y2P27ua6PPZLZFY2vlUyTwvwCvoDhIc_g8ad7HFYfTKrlZLjGr7Y6',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkDfZ-l0R7Js3Nr5a1Z0hr4bajVLp7-kQJWAm8IojR8_JXOJyq2bpxby7jKelLP0ZoWEp2MVPqVNtDXqH3XRntGk4eX8UbictnxiR8TWFjABMCeDAx-GTs6LfJwgLY27xYT0RRenvhUO1Edwvgf7p5H7z_PDnauOlC0DXmeQUzH7utKcoJMY0RGKMDMoB1tnflJAc_jddf7vqXqxklPtkTn3hEa7148IZ5cjJPlHGKLt55kAtjCmOEmTpYtB7z5fCLPlMWayEJ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBWx8ku9UlGYX4EtlZVvfGpIphjj3eYJhObCBKX-A48FPYUpcOjSSlwrvqkk-B3YB3mXavrUsjJIYGTqNENZvD7fpF2BC7u_bP8f1zjePIJD7Hxsk9ep140iL8fdYGK82uWI4lkqTij9Eq05ou7z9VUs3_TYH7fabXmr6k-g3ttvG02zZ9nsPL1qH8dWOpAzWXFrF5ypJphm2QfScVdFV4tudGdKkjLpWuCC04t2OOr2_LmlD2To2g9Jubkc8k4YulZF13kP7Ew',
    ],
    isOnline: true,
    hasVoiceIntro: true,
    voiceIntroDuration: 15,
    isVerified: true,
  },
  {
    id: '2',
    name: 'Kofi',
    age: 27,
    location: 'Accra, Ghana',
    distance: '5 km',
    job: 'Software Engineer',
    bio: 'Looking for someone who loves music and good food. I play guitar in my free time. Let\'s grab a coffee!',
    interests: ['Music', 'Guitar', 'Cooking', 'Movies', 'Gaming'],
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB-TBRU0_mExufLGR8WbjZwT73D8huo0YWP6SYqPjZAk5FoKCxcY2A8t0Nap7Xp5YH8oIXXqivTyiUp0PMkOlhAEpLNzEn0wSat0_KocNJoRBP8UO_UbVnKynniyFPcQNV2oJHIzC3kn5U1zQP6gZu6OG7M7sASSxX6b31KMbWHX_7sg8nEv5ylgixyLt8yJXS2mOeeIMPBqzlvi8Yqg69YPD1ZAUT0urSSgkC817TvSwR6BG_s0oM6IKgJ-A5Nmf9K9Smd8Uvd',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCDdF4GJr5TL-LLyFiIwcuNKyfSfSLTOJFz20rubwFJksgaersHVsbPj2oBZoXdCAwekh6OAcjRVnTos8Gy5XmPBjAwvHIBnRA40SMyyFusIlcbfIGVwfelWSTqbfJUW3IIb1GslydDBQY8ewNZHmuJquSX9qxlpLBWX71TnuPXu9Bqb45WkkAW8B1FzSybQ1hMiNz0B-BQvzRMsXt6APM8n8EvXvzgg5G_zt_UnMT8hUEuNxvyF8mmGRgKJ11-AvJxI2YvSm-Z',
    ],
    isOnline: false,
    hasVoiceIntro: true,
    voiceIntroDuration: 22,
    isVerified: false,
  },
  {
    id: '3',
    name: 'Nneka',
    age: 23,
    location: 'Lagos, Nigeria',
    distance: '2 km',
    job: 'Content Creator',
    bio: 'Adventure seeker! Love exploring new places and trying different foods. Always down for a road trip公路',
    interests: ['Travel', 'Photography', 'Fashion', 'Music', 'Art'],
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPs-a2lSM_bmNLNs1GkXRzOsSShLYwv_rSzvZ0vFkTZAC35XyDj_29VltZJ1ki-g5kR08ShBo0wAYd1_SBpqR-NbTCcjwfxTR1y2ffn7FwboHugN7JgcDIanSbRlZ43uL81mGHqHonrY1D85VV3D4PtZBH8kQmrPd_od1JQL8Dby0EiiyRwUpolz3ch6BV0z9kOK4jh7mC5Ka3CNlMw4iBGxyPUB6qeLDVis7qzYzApjaA63kBYEemlMf70N-C6fsqRjJZ4E68',
    ],
    isOnline: true,
    hasVoiceIntro: false,
    voiceIntroDuration: 0,
    isVerified: true,
  },
  {
    id: '4',
    name: 'Tunde',
    age: 26,
    location: 'Ibadan, Nigeria',
    distance: '8 km',
    job: 'Financial Analyst',
    bio: 'Passionate about football and good conversations. Looking for something real.',
    interests: ['Football', 'Finance', 'Business', 'Music', 'Reading'],
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAGUIGCFh4WwJs-zcZagu4DefthTyTr2-oikHgtM3FLsrK4k4WYUIW3b_2GS2oRMPlrv8eKGDXxfztn8o5q7BQclsPNTf-frOgXE6uVDhPJGectXH72Pixv8LHhenb_HjsDFlTAWVA2T0rc2HB-BNRci5_XU2Qc_g06Yyvqs6hoV4uxd6bXODQCANYc3oorUQLGKnZLoYlYEm8QGzI1ygstqinDLD15aIbmIFIc6Vd2DlsNLK2cbVUZiRf0C9BADopfMkgkEuYf',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrC71uM-q4Ntwmo7g_m-aXkAa_4KL0A0Ax0Rnt6For_8F_A0PS6IV40e5Ejwz48k6ItmT2piYxOeuIUIyUNUn3UhXTRUAus8vM7AaNqHp1WMnW7JxQzYHIg7F_taMQimmUSq73BFLs2-1B-rqSIg2r0egXOg639y-Bc-I5Om4wsCBLmV0fK3O_HufKqFAM4UaNpyZflZUQ0UVsAjNXBPdh_mrs5igHcYxwwquGXA7my4Oq1xwD-ZERd2nqi92ZihJ3gUmd6enM',
    ],
    isOnline: false,
    hasVoiceIntro: true,
    voiceIntroDuration: 18,
    isVerified: false,
  },
];

const INTEREST_ICONS = {
  'Afrobeats': 'headphones',
  'Coding': 'terminal',
  'Travel': 'travel_explore',
  'Foodie': 'restaurant',
  'Photography': 'photo_camera',
  'Music': 'music_note',
  'Guitar': 'guitar',
  'Cooking': 'restaurant_menu',
  'Movies': 'movie',
  'Gaming': 'sports_esports',
  'Fashion': 'checkroom',
  'Art': 'palette',
  'Football': 'sports_soccer',
  'Finance': 'account_balance',
  'Business': 'business_center',
  'Reading': 'menu_book',
};

function DatingHomeScreen({ navigation, onBack, onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [superLikedProfiles, setSuperLikedProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  
  const swipeAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleSwipe = (direction) => {
    const currentProfile = profiles[currentIndex];
    
    if (direction === 'right') {
      setLikedProfiles(prev => [...prev, currentProfile.id]);
      
      const isMatch = Math.random() > 0.5;
      if (isMatch) {
        setMatchedProfile(currentProfile);
        setMatches(prev => [...prev, currentProfile]);
        setShowMatchModal(true);
      }
    } else if (direction === 'up') {
      setSuperLikedProfiles(prev => [...prev, currentProfile.id]);
      setMatchedProfile(currentProfile);
      setMatches(prev => [...prev, currentProfile]);
      setShowMatchModal(true);
    }
    
    Animated.timing(swipeAnim, {
      toValue: { x: direction === 'left' ? -width : direction === 'right' ? width : 0, y: direction === 'up' ? -height : 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(prev => prev + 1);
      swipeAnim.setValue({ x: 0, y: 0 });
      rotateAnim.setValue(0);
    });
  };

  const handleLike = () => handleSwipe('right');
  const handleSkip = () => handleSwipe('left');
  const handleSuperLike = () => handleSwipe('up');

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        swipeAnim.setValue({ x: gestureState.dx, y: gestureState.dy });
        rotateAnim.setValue(gestureState.dx / 20);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 100) {
          handleLike();
        } else if (gestureState.dx < -100) {
          handleSkip();
        } else if (gestureState.dy < -100) {
          handleSuperLike();
        } else {
          Animated.spring(swipeAnim, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
          rotateAnim.setValue(0);
        }
      },
    })
  ).current;

  const rotate = rotateAnim.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  const handleProfilePress = (profile) => {
    if (onNavigate) {
      onNavigate('DatingProfile', { profile });
    }
  };

  const handleNavigate = (screen, params) => {
    if (onNavigate) {
      onNavigate(screen, params);
    }
  };

  if (currentIndex >= profiles.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="heart-off" size={80} color="#2BEE79" />
          <Text style={styles.emptyTitle}>Plus de profils</Text>
          <Text style={styles.emptySubtitle}>Revenez plus tard pour de nouvelles rencontres</Text>
          <Pressable style={styles.refreshButton} onPress={() => setCurrentIndex(0)}>
            <Text style={styles.refreshButtonText}>Actualiser</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Yabisso Dating</Text>
        <Pressable style={styles.headerButton} onPress={() => handleNavigate('DatingFilters')}>
          <MaterialCommunityIcons name="tune" size={24} color="#fff" />
          <View style={styles.filterDot} />
        </Pressable>
      </View>

      <View style={styles.cardContainer} {...panResponder.panHandlers}>
        <View style={styles.backgroundCards}>
          {currentIndex + 1 < profiles.length && (
            <View style={styles.backgroundCard}>
              <Image
                source={{ uri: profiles[currentIndex + 1]?.photos[0] }}
                style={styles.backgroundCardImage}
              />
            </View>
          )}
        </View>

        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: swipeAnim.x },
                { translateY: swipeAnim.y },
                { rotate: rotate },
              ],
            },
          ]}
        >
          <Pressable style={styles.cardPressable} onPress={() => handleProfilePress(currentProfile)}>
            <Image
              source={{ uri: currentProfile.photos[0] }}
              style={styles.cardImage}
            />
            <View style={styles.cardGradient} />
            
            <View style={styles.offlineBadge}>
              <MaterialCommunityIcons name="bolt" size={14} color="#eab308" />
              <Text style={styles.offlineBadgeText}>Disponible Hors Ligne</Text>
            </View>
            
            <View style={styles.distanceBadge}>
              <MaterialCommunityIcons name="near-me" size={14} color="#fff" />
              <Text style={styles.distanceBadgeText}>{currentProfile.distance}</Text>
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.cardName}>{currentProfile.name}, {currentProfile.age}</Text>
                {currentProfile.isVerified && (
                  <MaterialCommunityIcons name="check-decagram" size={20} color="#2BEE79" />
                )}
              </View>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="location-on" size={16} color="#e5e7eb" />
                <Text style={styles.cardLocation}>{currentProfile.location}</Text>
              </View>
              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{currentProfile.job}</Text>
                </View>
                {currentProfile.interests.slice(0, 2).map((interest, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      <View style={styles.actionButtons}>
        <Pressable style={styles.actionButton} onPress={handleSkip}>
          <View style={[styles.actionButtonInner, styles.skipButton]}>
            <MaterialCommunityIcons name="close" size={32} color="#ef4444" />
          </View>
          <Text style={styles.actionButtonLabel}>Passer</Text>
        </Pressable>

        <Pressable style={styles.actionButtonCenter} onPress={handleSuperLike}>
          <View style={[styles.actionButtonInner, styles.superLikeButton]}>
            <MaterialCommunityIcons name="star" size={28} color="#137fec" />
          </View>
          <Text style={styles.actionButtonLabelCenter}>Intro</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleLike}>
          <View style={[styles.actionButtonInner, styles.likeButton]}>
            <MaterialCommunityIcons name="heart" size={32} color="#22c55e" />
          </View>
          <Text style={styles.actionButtonLabel}>J'aime</Text>
        </Pressable>
      </View>

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => handleNavigate('DatingHome')}>
          <MaterialCommunityIcons name="card-text" size={26} color="#2BEE79" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Explorer</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => handleNavigate('DatingLikes')}>
          <MaterialCommunityIcons name="star" size={26} color="#9ca3af" />
          <Text style={styles.navLabel}>J'aime</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => handleNavigate('DatingChats')}>
          <View style={styles.navIconContainer}>
            <MaterialCommunityIcons name="chat" size={26} color="#9ca3af" />
            {matches.length > 0 && (
              <View style={styles.chatBadge}>
                <Text style={styles.chatBadgeText}>{matches.length}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navLabel}>Discussions</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => handleNavigate('DatingEditProfile')}>
          <MaterialCommunityIcons name="account" size={26} color="#9ca3af" />
          <Text style={styles.navLabel}>Profil</Text>
        </Pressable>
      </View>

      <Modal visible={showMatchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.matchModal}>
            <Text style={styles.matchTitle}>C'est un match! 🎉</Text>
            <View style={styles.matchAvatars}>
              <Image source={{ uri: currentProfile.photos[0] }} style={styles.matchAvatar} />
              <MaterialCommunityIcons name="heart" size={30} color="#ef4444" style={styles.matchHeart} />
            </View>
            <Text style={styles.matchName}>Vous et {matchedProfile?.name} vous êtes plu!</Text>
            <View style={styles.matchButtons}>
              <Pressable style={styles.matchSendButton} onPress={() => {
                setShowMatchModal(false);
                handleNavigate('DatingChat', { profile: matchedProfile });
              }}>
                <Text style={styles.matchSendButtonText}>Envoyer un message</Text>
              </Pressable>
              <Pressable style={styles.matchKeepSwipingButton} onPress={() => setShowMatchModal(false)}>
                <Text style={styles.matchKeepSwipingText}>Continuer à swiper</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 12,
    backgroundColor: '#101922',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backgroundCards: {
    position: 'absolute',
    width: '90%',
    height: '60%',
  },
  backgroundCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#192633',
    borderRadius: 20,
    opacity: 0.5,
    transform: [{ scale: 0.95 }, { translateY: 20 }],
  },
  backgroundCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    opacity: 0.3,
  },
  card: {
    width: '100%',
    height: '100%',
    maxHeight: 500,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#192633',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  cardPressable: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(to top, rgba(16,25,34,0.9), transparent)',
  },
  offlineBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  offlineBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  distanceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 4,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardLocation: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e5e7eb',
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonCenter: {
    alignItems: 'center',
    marginTop: -10,
  },
  actionButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16,25,34,0.5)',
    borderWidth: 1,
  },
  skipButton: {
    borderColor: 'rgba(239,68,68,0.3)',
  },
  superLikeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#137fec',
    borderWidth: 0,
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  likeButton: {
    borderColor: 'rgba(34,197,94,0.3)',
  },
  actionButtonLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#6b7280',
    marginTop: 4,
  },
  actionButtonLabelCenter: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#137fec',
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: '#192633',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    width: 64,
  },
  navIconContainer: {
    position: 'relative',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#2BEE79',
  },
  chatBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#22c55e',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chatBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 24,
    backgroundColor: '#2BEE79',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#101922',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchModal: {
    backgroundColor: '#192633',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  matchAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  matchAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#2BEE79',
  },
  matchHeart: {
    marginHorizontal: -20,
    zIndex: 1,
  },
  matchName: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 24,
  },
  matchButtons: {
    width: '100%',
    gap: 12,
  },
  matchSendButton: {
    backgroundColor: '#2BEE79',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  matchSendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#101922',
  },
  matchKeepSwipingButton: {
    paddingVertical: 12,
  },
  matchKeepSwipingText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default DatingHomeScreen;