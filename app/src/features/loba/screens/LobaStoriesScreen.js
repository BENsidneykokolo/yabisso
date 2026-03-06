import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const stories = [
  {
    id: 1,
    user: {
      name: 'Kofi Tech',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqGbYrSUO24nUIfiRid6ifRv2rFghwzv6E1gEh_OblK4Y-h7AQzC7_kFBTuU5jPOjvEulBCmwRfoGuPRul1mZcAtTDbAva-51173siecgdFFrZv6o_9ouLF46vFZGgAhNMpd7QMse9AXgtjPFbh2WHhEWixjkU_I0O5MFxK1ei824q6LnmdziyYjJ4VEJH0KSvdWJULaDHq2TurIBY-19W-K_FMDk7hZKfK3a8pS57RnRVmbqtbfhDghBl4F5IIlSyxOsuXolf',
    },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB-q5_v-rpF4EQ4-7rvGOr9ykjqRKg7uS8BL4AnLJjlynE4AV0rKHCafQxasNrclMRqXQBk0hEyxYlzXLP7_KYGAg6vIixZM6Zluy-bo1KOaVMoVPpwfw9mf3abFt-L7hT7WhjXBBKnYvCaQgQOoNVYxvbdpH37u2YNnplN_TbnO5wZC-3pvZq6-laxPK85bb14mKQH9OVhJADJLXPN5Ucw-tU6dOIssIqVhFn2C0oZl7lnug_Jo92CT4b1wFQ_uhg_hWA0MDH',
    time: '45m ago',
    progress: 65,
  },
  {
    id: 2,
    user: {
      name: 'Amara',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZtvwVsq92pKVw0nXGx_XhXbbPPsbKmE9-z0m2J9WZN-Q7-x4NnpDNCTcWql6QEdqtk-huBz0JSQ4yHlBVN66Dt7ajEsDc6KiRl1TcDqL_6NXJA7kKwetBmiuyTFoD40GPkBd1Imv0vWcQ_s6TSjUp4ytupfFylDPPvezXmaHhDz1q6H34cCxru3EaSFtY_kxt4CopSle4Saf6hdNyu1qGbocUgyYlvdfuhtCoyvb2aR6EkwlVAG5fPE_gZiWzKySpArm-PMn2',
    },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2SjzuGzCAz8iefODvm5HB-lStpCm3TdWA2lNlCA75pIdtszPQSrwQIrTPCEFpg0xSTfu6UlwfGmy6L0Z1vzX56H8ujYbIxnb4j4n2o9zn9SIyVm_fkcNwFRlZFWM8-P1hVUmmg6pAvqyFwMEuJeWxEE-chepKvxqhN2xE7t8xzuY1zw4WzkzmkoMB2bI3qxQTbakKhyUUJUYnKHRAe-lrsfM6fqxaB-J_0b4i0ugVHMJA-tU6OsIqJ_HIuPyyKkc-m0pYxItl',
    time: '2h ago',
    progress: 0,
  },
  {
    id: 3,
    user: {
      name: 'Tunde',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGUIGCFh4WwJs-zcZagu4DefthTyTr2-oikHgtM3FLsrK4k4WYUIW3b_2GS2oRMPlrv8eKGDXxfztn8o5q7BQclsPNTf-frOgXE6uVDhPJGectXH72Pixv8LHhenb_HjsDFlTAWVA2T0rc2HB-BNRci5_XU2Qc_g06Yyvqs6hoV4uxd6bXODQCANYc3oorUQLGKnZLoYlYEm8QGzI1ygstqinDLD15aIbmIFIc6Vd2DlsNLK2cbVUZiRf0C9BADopfMkgkEuYf',
    },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiCVfHhbG9YjXbl22e_bK5OSff1x-RBqj2Pr0sKDqRV6gsFJ11g_1G3RVtlJg_taasO0_tKz5IXQfkxU3SNNuT7yDUWGLTZdqgxk0XDEGb14xMfAlnIbltrgsvlIiTNXF4z1KJyiTjw70Z-BkSV2LVFGGYpsbfVgE16o4m9f-bQVMlj5UJT0rl-npUNPgEw8dOIJeYSjzzBth_69ZMAdgG0a3wWGdgqPEQDrvr6KKvxbFcRdO3-opAxJ7q6eQlTmg7RV82zBTk',
    time: '5h ago',
    progress: 0,
  },
];

export default function LobaStoriesScreen({ onBack, onClose }) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(stories[0].progress);

  const currentStory = stories[currentStoryIndex];

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(stories[currentStoryIndex - 1].progress);
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: currentStory.image }}
        style={styles.storyBackground}
      />
      <View style={styles.gradientOverlay} />

      <View style={styles.touchZones}>
        <Pressable style={styles.touchZone} onPress={handlePrevious} />
        <Pressable style={styles.touchZone} onPress={handleNext} />
        <Pressable style={styles.touchZone} onPress={handleNext} />
      </View>

      <SafeAreaView style={styles.content}>
        <View style={styles.progressContainer}>
          {stories.map((story, index) => (
            <View key={story.id} style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  index < currentStoryIndex && styles.progressComplete,
                  index === currentStoryIndex && { width: `${progress}%` },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarRing}>
              <Image source={{ uri: currentStory.user.avatar }} style={styles.avatar} />
            </View>
            <View style={styles.userText}>
              <Text style={styles.userName}>{currentStory.user.name}</Text>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{currentStory.time}</Text>
                <MaterialCommunityIcons name="cloud-off-outline" size={14} color="rgba(255,255,255,0.6)" />
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.actionBtn}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color="rgba(255,255,255,0.9)" />
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.seeMore}>
            <MaterialCommunityIcons name="keyboard-arrow-up" size={24} color="#fff" />
            <Text style={styles.seeMoreText}>Voir plus</Text>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPlaceholder}>Répondre à {currentStory.user.name}...</Text>
            </View>
            <View style={styles.reactionBtns}>
              <Pressable style={styles.reactionBtn}>
                <MaterialCommunityIcons name="heart" size={26} color="#ef4444" />
              </Pressable>
              <Pressable style={styles.reactionBtn}>
                <MaterialCommunityIcons name="fire" size={26} color="#fbbf24" />
              </Pressable>
              <Pressable style={styles.sendBtn}>
                <MaterialCommunityIcons name="send" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  touchZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 10,
  },
  touchZone: {
    flex: 1,
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 6,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    width: '0%',
  },
  progressComplete: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 22,
    backgroundColor: '#137fec',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#000',
  },
  userText: {
    gap: 2,
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  seeMore: {
    alignItems: 'center',
    opacity: 0.8,
  },
  seeMoreText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inputPlaceholder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  reactionBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
