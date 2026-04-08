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
  TouchableOpacity,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

function DatingProfileScreen({ navigation, route, onBack, onNavigate }) {
  const profile = route?.params?.profile || {
    id: '1',
    name: 'Amara',
    age: 26,
    location: 'Lagos, Nigeria',
    distance: '3 km',
    job: 'UX Designer at Yabisso',
    bio: "Tech enthusiast by day, lover of Jollof rice by night. Seeking a hiking partner who doesn't mind stopping for photos every 5 minutes. Let's explore! 🌍✨",
    interests: ['Afrobeats', 'Coding', 'Travel', 'Foodie', 'Photography'],
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChHtnEfmDk48vPhp9ZSbw5y_dNX4Cp3lvcjl1hne-L477stPYhzDFFzrmAof9KSlvlds52rSRtikFAeptFTJazjgGPB6qUkPwq8Uw2QRlybdecuh1Rnh86fmcwhF7QEv_aGPPSvuPXTR_h2lueHcN9vw70G4zcRG06K5sVlUfOm1nQjha8Gj5nnGvtUXu6Csw8CPrUpFUnU68T5IHUuS8Y2P27ua6PPZLZFY2vlUyTwvwCvoDhIc_g8ad7HFYfTKrlZLjGr7Y6',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkDfZ-l0R7Js3Nr5a1Z0hr4bajVLp7-kQJWAm8IojR8_JXOJyq2bpxby7jKelLP0ZoWEp2MVPqVNtDXqH3XRntGk4eX8UbictnxiR8TWFjABMCeDAx-GTs6LfJwgLY27xYT0RRenvhUO1Edwvgf7p5H7z_PDnauOlC0DXmeQUzH7utKcoJMY0RGKMDMoB1tnflJAc_jddf7vqXqxklPtkTn3hEa7148IZ5cjJPlHGKLt55kAtjCmOEmTpYtB7z5fCLPlMWayEJ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBWx8ku9UlGYX4EtlZVvfGpIphjj3eYJhObCBKX-A48FPYUpcOjSSlwrvqkk-B3YB3mXavrUsjJIYGTqNENZvD7fpF2BC7u_bP8f1zjePIJD7Hxsk9ep140iL8fdYGK82uWI4lkqTij9Eq05ou7z9VUs3_TYH7fabXmr6k-g3ttvG02zZ9nsPL1qH8dWOpAzWXFrF5ypJphm2QfScVdFV4tudGdKkjLpWuCC04t2OOr2_LmlD2To2g9Jubkc8k4YulZF13kP7Ew',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrC71uM-q4Ntwmo7g_m-aXkAa_4KL0A0Ax0Rnt6For_8F_A0PS6IV40e5Ejwz48k6ItmT2piYxOeuIUIyUNUn3UhXTRUAus8vM7AaNqHp1WMnW7JxQzYHIg7F_taMQimmUSq73BFLs2-1B-rqSIg2r0egXOg639y-Bc-I5Om4wsCBLmV0fK3O_HufKqFAM4UaNpyZflZUQ0UVsAjNXBPdh_mrs5igHcYxwwquGXA7my4Oq1xwD-ZERd2nqi92ZihJ3gUmd6enM',
    ],
    isOnline: true,
    hasVoiceIntro: true,
    voiceIntroDuration: 15,
    isVerified: true,
  };

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const INTEREST_ICONS = {
    'Afrobeats': 'headphones',
    'Coding': 'terminal',
    'Travel': 'travel_explore',
    'Foodie': 'restaurant',
    'Photography': 'photo_camera',
    'Music': 'music_note',
  };

  const handleSendMessage = () => {
    if (onNavigate) {
      onNavigate('DatingChat', { profile });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentPhotoIndex(index);
            }}
          >
            {profile.photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          <View style={styles.heroOverlay}>
            <View style={styles.topNav}>
              <TouchableOpacity style={styles.navButton} onPress={onBack}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton}>
                <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.pagination}>
              {profile.photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentPhotoIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>

            <View style={styles.heroInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>{profile.name}, {profile.age}</Text>
                {profile.isVerified && (
                  <MaterialCommunityIcons name="check-decagram" size={24} color="#2BEE79" />
                )}
              </View>
              <Text style={styles.jobText}>{profile.job}</Text>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="location-on" size={16} color="#d1d5db" />
                <Text style={styles.locationText}>~{profile.distance} • {profile.location}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {profile.hasVoiceIntro && (
            <View style={styles.voiceSection}>
              <Text style={styles.sectionTitle}>Écoutez l'ambiance</Text>
              <View style={styles.voicePlayer}>
                <View style={styles.voiceThumbnail}>
                  <Image source={{ uri: profile.photos[0] }} style={styles.voiceThumbImage} />
                  <TouchableOpacity
                    style={styles.voicePlayButton}
                    onPress={() => setIsPlayingVoice(!isPlayingVoice)}
                  >
                    <MaterialCommunityIcons
                      name={isPlayingVoice ? "pause" : "play"}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.voiceInfo}>
                  <Text style={styles.voiceTitle}>Écoutez {profile.name}</Text>
                  <View style={styles.waveform}>
                    {[...Array(15)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.waveformBar,
                          { height: Math.random() * 20 + 8 },
                          isPlayingVoice && styles.waveformBarActive,
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.voiceDuration}>
                    {isPlayingVoice ? `0:${Math.floor(profile.voiceIntroDuration / 2).toString().padStart(2, '0')}` : `0:${profile.voiceIntroDuration}`}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.bioSection}>
            <Text style={styles.sectionTitle}>À propos de moi</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>

          <View style={styles.interestsSection}>
            <Text style={styles.sectionTitle}>Centres d'intérêt</Text>
            <View style={styles.interestsGrid}>
              {profile.interests.map((interest, index) => (
                <View key={index} style={styles.interestChip}>
                  <MaterialCommunityIcons
                    name={INTEREST_ICONS[interest] || 'tag'}
                    size={18}
                    color="#facc15"
                  />
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {profile.photos.length > 1 && (
            <View style={styles.photosSection}>
              <Text style={styles.sectionTitle}>Plus de photos</Text>
              <View style={styles.photosGrid}>
                {profile.photos.slice(1).map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={styles.gridPhoto}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.reportButton}>
            <Text style={styles.reportText}>Signaler ce profil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.floatingActions}>
        <TouchableOpacity style={styles.actionButtonSecondary}>
          <MaterialCommunityIcons name="close" size={32} color="#ef4444" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonPrimary}>
          <MaterialCommunityIcons name="heart" size={32} color="#fff" />
        </TouchableOpacity>
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
  heroSection: {
    height: '65%',
    position: 'relative',
  },
  heroImage: {
    width: width,
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 16,
  },
  paginationDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    maxWidth: 40,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  heroInfo: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  jobText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  voiceSection: {
    backgroundColor: '#1c2936',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  voicePlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceThumbnail: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  voiceThumbImage: {
    width: '100%',
    height: '100%',
  },
  voicePlayButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceInfo: {
    flex: 1,
  },
  voiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
    marginTop: 4,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#137fec',
    borderRadius: 2,
  },
  waveformBarActive: {
    backgroundColor: '#2BEE79',
  },
  voiceDuration: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  bioSection: {},
  bioText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },
  interestsSection: {},
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1c2936',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  interestText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  photosSection: {},
  photosGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  gridPhoto: {
    flex: 1,
    aspectRatio: 3/4,
    borderRadius: 12,
    backgroundColor: '#1c2936',
  },
  reportButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 100,
  },
  reportText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
  },
  floatingActions: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 24,
  },
  actionButtonSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1c2936',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  actionButtonPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2BEE79',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});

export default DatingProfileScreen;