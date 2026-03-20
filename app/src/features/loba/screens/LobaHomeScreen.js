import React, { useState, useEffect } from 'react';
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
  Modal,
  Alert,
  Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import LobaBottomNav from '../components/LobaBottomNav';
import withObservables from '@nozbe/with-observables';
import { database } from '../../../lib/db';

const { width, height } = Dimensions.get('window');

const initialVideos = [
  {
    id: 1,
    username: '@LagosEats',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-cZ953z6Pef-m-esMbutiujQzwcQ3gXocj0ErdwM9gmhxLpWo4SKz4VFvkSga_qlHMvvYo8Lkoex8tWespXnC8gKlURT7iGPPII63Uh98f-AX-ZYpjq5WOAHrL1QarS-bIe8awUnOztGtUDF19UvJerb2PYVsQUw5cJLRSU5yM8wnobwysn7cOF3j3h71OchJaZfAHWd1qNkkVk6oEEAlMw63bsadLjh3IsXVs3Db_jad-rzwr27E6XhAExYmUfH2A85zZ_Q7',
    video: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtK8TvWjtBzKDjxuNCgfKCM4VlXkH7Hg9QBzK5eG3Ln-zP7vsQaoci0T6qobNgJTG-5XhMtb5xOpfX-pW4Q51r7E1jBDBkJ8ui72wvXPeaDdJ4XWogDMTXMK4rRBmj96uJkepQcbLbXghuHhcfgXXwVoJgVoNN7_EkMxkinirFlaspT4lpwuIVSIzP4iJEeJQuWKp8mryxMKc8Yr_16eVJt7gdmfV4Zzh-JOxvlDIzL-0kM-4AUc-kHPKVwQ1Aa020PiWFk7KE',
    caption: 'Trying the best suya in the city! 🔥🥩 This place is hidden but worth the trek. #Lagos #Foodie #Yabisso',
    song: 'Burna Boy - Last Last',
    likes: 1245,
    comments: 320,
    progress: 35,
    liked: false,
    followed: false,
    saved: false,
  },
  {
    id: 2,
    username: '@TechGhana',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpQKycPMLIcj6lEgT3yylEk1PYLRLRoGgntAftVcxpaZk_rZCjF9tJVB74QcDXaov6pXlQd0xJc3Hzn42A1xSh9sZDFM8PgyDRwaUsq2dn7Bf4d23hd1L-NEElMtyMOXIXKC3n95_TmtmOznJyFX7p_fI7-3ZxTpsj7scTO5mwqImoclkDwp9xyQN6RBUdjQBm_U_wSO1O_DvULR6bLmrYThfVtAvmsqTQJoZByFXdNIm-IThl8u4qx54KVUdJpCvlTLEejlGP',
    video: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnsmNx5C1-w0Yj3lMlo7-VbFA9OZNzc8vCIqLLNiEWPlqfOQSn40V7O2anTjQdhiVVsOUPd1Fh80S2l0bXDXUxJqhNIq_5GB6gsUsXx0OCuH76RCqW8zwYWx3Z1nuto64008GB7dQ3GGUGAUDYbjA2dXyctAocSS9HrU9BqfKeUCbR0eAsO9ge8eYzPx4BNyZApogpBe7SnsiUhCQ36Q-JA2p3Wz5ZttmMg-YIjNKODC2cU2gW0AhE6WrSmspXkdYVewssDBFD',
    caption: 'Building the future of African tech! 🌍✨ #AfricanTech #Innovation',
    song: 'Wizkid - Essence',
    likes: 4500,
    comments: 180,
    progress: 60,
    liked: true,
    followed: true,
    saved: true,
  },
];

const stories = [
  { id: 1, name: 'My Story', avatar: null, isAdd: true },
  { id: 2, name: 'Kofi', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-TBRU0_mExufLGR8WbjZwT73D8huo0YWP6SYqPjZAk5FoKCxcY2A8t0Nap7Xp5YH8oIXXqivTyiUp0PMkOlhAEpLNzEn0wSat0_KocNJoRBP8UO_UbVnKynniyFPcQNV2oJHIzC3kn5U1zQP6gZu6OG7M7sASSxX6b31KMbWHX_7sg8nEv5ylgixyLt8yJXS2mOeeIMPBqzlvi8Yqg69YPD1ZAUT0urSSgkC817TvSwR6BG_s0oM6IKgJ-A5Nmf9K9Smd8Uvd' },
  { id: 3, name: 'Amara', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZtvwVsq92pKVw0nXGx_XhXbbPPsbKmE9-z0m2J9WZN-Q7-x4NnpDNCTcWql6QEdqtk-huBz0JSQ4yHlBVN66Dt7ajEsDc6KiRl1TcDqL_6NXJA7kKwetBmiuyTFoD40GPkBd1Imv0vWcQ_s6TSjUp4ytupfFylDPPvezXmaHhDz1q6H34cCxru3EaSFtY_kxt4CopSle4Saf6hdNyu1qGbocUgyYlvdfuhtCoyvb2aR6EkwlVAG5fPE_gZiWzKySpArm-PMn2' },
  { id: 4, name: 'Tunde', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGUIGCFh4WwJs-zcZagu4DefthTyTr2-oikHgtM3FLsrK4k4WYUIW3b_2GS2oRMPlrv8eKGDXxfztn8o5q7BQclsPNTf-frOgXE6uVDhPJGectXH72Pixv8LHhenb_HjsDFlTAWVA2T0rc2HB-BNRci5_XU2Qc_g06Yyvqs6hoV4uxd6bXODQCANYc3oorUQLGKnZLoYlYEm8QGzI1ygstqinDLD15aIbmIFIc6Vd2DlsNLK2cbVUZiRf0C9BADopfMkgkEuYf' },
  { id: 5, name: 'Nneka', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPs-a2lSM_bmNLNs1GkXRzOsSShLYwv_rSzvZ0vFkTZAC35XyDj_29VltZJ1ki-g5kR08ShBo0wAYd1_SBpqR-NbTCcjwfxTR1y2ffn7FwboHugN7JgcDIanSbRlZ43uL81mGHqHonrY1D85VV3D4PtZBH8kQmrPd_od1JQL8Dby0EiiyRwUpolz3ch6BV0z9kOK4jh7mC5Ka3CNlMw4iBGxyPUB6qeLDVis7qzYzApjaA63kBYEemlMf70N-C6fsqRjJZ4E68' },
];

const posts = [
  {
    id: 1,
    user: { name: 'Kofi Mensah', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpQKycPMLIcj6lEgT3yylEk1PYLRLRoGgntAftVcxpaZk_rZCjF9tJVB74QcDXaov6pXlQd0xJc3Hzn42A1xSh9sZDFM8PgyDRwaUsq2dn7Bf4d23hd1L-NEElMtyMOXIXKC3n95_TmtmOznJyFX7p_fI7-3ZxTpsj7scTO5mwqImoclkDwp9xyQN6RBUdjQBm_U_wSO1O_DvULR6bLmrYThfVtAvmsqTQJoZByFXdNIm-IThl8u4qx54KVUdJpCvlTLEejlGP', location: 'Lagos, Nigeria' },
    time: '2h ago',
    content: 'Loving the vibes at the tech summit today! The future of African innovation is bright 🌍✨ #AfricanTech #Lagos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnsmNx5C1-w0Yj3lMlo7-VbFA9OZNzc8vCIqLLNiEWPlqfOQSn40V7O2anTjQdhiVVsOUPd1Fh80S2l0bXDXUxJqhNIq_5GB6gsUsXx0OCuH76RCqW8zwYWx3Z1nuto64008GB7dQ3GGUGAUDYbjA2dXyctAocSS9HrU9BqfKeUCbR0eAsO9ge8eYzPx4BNyZApogpBe7SnsiUhCQ36Q-JA2p3Wz5ZttmMg-YIjNKODC2cU2gW0AhE6WrSmspXkdYVewssDBFD',
    likes: 46,
    comments: 12,
    liked: false,
  },
  {
    id: 2,
    user: { name: 'Nneka Abiola', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBG9ryT5cFc2G88JO3h8DaDLpspRqDhcS0RuM69yGtOBFp34gclVaDEHtiUxKsmXF99QAH4ibPpFCZLZiC7qyZZgX0nlA7vti6FKPUC1IvhxAFMiQ1zGv4L_xfpATknNKRvL5oCQXc3pvR3IVO2D69QnFQUJLSDWe5UAG1csGXIyUDQ8gT2Ih1Tu145H91SBbk-xQxa9d8GBonlI7z_Xejdsu-dEwIIu7Vxx0KiaWrKHAdT24z_gdzc0FlppLMjqkoCOaY5VFU9', location: '' },
    time: '4h ago',
    content: 'Does anyone know a good React Native developer available for a freelance gig? Need help with an offline-first module. DM me! 💻🚀',
    image: null,
    likes: 8,
    comments: 3,
    liked: false,
  },
];

function LobaHomeScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('For You');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [feedVideos, setFeedVideos] = useState(initialVideos);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    loadSavedVideos();
  }, []);

  const loadSavedVideos = async () => {
    try {
      const savedIdsJson = await SecureStore.getItemAsync('loba_saved_videos');
      if (savedIdsJson) {
        const savedIds = JSON.parse(savedIdsJson);
        setFeedVideos(prev => prev.map(video => ({
          ...video,
          saved: savedIds.includes(video.id)
        })));
      }
    } catch (error) {
      console.log('Error loading saved videos:', error);
    }
  };

  const handleLike = (id) => {
    setFeedVideos(prev => prev.map(video => {
      if (video.id === id) {
        const isLiked = !video.liked;
        return {
          ...video,
          liked: isLiked,
          likes: isLiked ? video.likes + 1 : video.likes - 1
        };
      }
      return video;
    }));
  };

  const handleFollow = (id) => {
    setFeedVideos(prev => prev.map(video => {
      if (video.id === id) {
        return { ...video, followed: !video.followed };
      }
      return video;
    }));
  };

  const handleSave = async (id) => {
    let savedVideos = [];
    setFeedVideos(prev => {
      const updated = prev.map(video => {
        if (video.id === id) {
          const newSaved = !video.saved;
          if (newSaved) {
            savedVideos = [...prev.filter(v => v.saved), video];
          }
          return { ...video, saved: newSaved };
        } else if (video.saved) {
          savedVideos = [...savedVideos, video];
        }
        return video;
      });
      return updated;
    });

    const currentSaved = await SecureStore.getItemAsync('loba_saved_videos');
    const savedIds = currentSaved ? JSON.parse(currentSaved) : [];
    let newSavedIds;
    if (savedIds.includes(id)) {
      newSavedIds = savedIds.filter(savedId => savedId !== id);
    } else {
      newSavedIds = [...savedIds, id];
    }
    await SecureStore.setItemAsync('loba_saved_videos', JSON.stringify(newSavedIds));
  };

  const openShare = (video) => {
    setSelectedVideo(video);
    setIsShareModalVisible(true);
  };

  const openComments = (video) => {
    setSelectedVideo(video);
    setIsCommentsModalVisible(true);
  };

  const handleNativeShare = async () => {
    try {
      if (!selectedVideo) return;
      await Share.share({
        message: `Check out ${selectedVideo.username}'s video on Yabisso: ${selectedVideo.caption}`,
        url: selectedVideo.video,
      });
      setIsShareModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Could not share video');
    }
  };

  const renderVideo = ({ item, index }) => (
    <View style={styles.videoContainer}>
      <Image source={{ uri: item.video }} style={styles.videoBackground} />
      <View style={styles.videoGradient} />

      <View style={styles.rightActions}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <Pressable
            style={[styles.followBadge, item.followed && styles.followBadgeActive]}
            onPress={() => handleFollow(item.id)}
          >
            <MaterialCommunityIcons
              name={item.followed ? "check" : "plus"}
              size={item.followed ? 10 : 12}
              color="#fff"
            />
          </Pressable>
        </View>

        <ActionButton
          icon={item.liked ? "heart" : "heart-outline"}
          color={item.liked ? "#ef4444" : "#fff"}
          count={item.likes}
          onPress={() => handleLike(item.id)}
        />
        <ActionButton
          icon="chat-bubble"
          count={item.comments}
          onPress={() => openComments(item)}
        />
        <ActionButton
          icon={item.saved ? "bookmark" : "bookmark-outline"}
          color={item.saved ? "#fbbf24" : "#fff"}
          count={item.saved ? "Enregistré" : "Enregistrer"}
          onPress={() => handleSave(item.id)}
        />
        <ActionButton
          icon="share"
          count="Partager"
          onPress={() => openShare(item)}
        />

        <View style={styles.musicDisc}>
          <View style={styles.musicDiscInner}>
            <Image source={{ uri: item.avatar }} style={styles.musicImage} />
          </View>
        </View>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.caption} numberOfLines={3}>{item.caption}</Text>
        <Pressable
          style={styles.musicRow}
          onPress={() => Alert.alert('Original Sound', item.song)}
        >
          <MaterialCommunityIcons name="music-note" size={14} color="#fff" />
          <Text style={styles.musicText}>{item.song}</Text>
        </Pressable>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Tabs */}
      <View style={styles.header}>
        <Pressable style={styles.headerChip} onPress={() => onNavigate?.('loba_following')}>
          <Text style={styles.headerChipText}>Abonnements</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#fff" />
        </Pressable>

        <Pressable style={styles.headerChip} onPress={() => onNavigate?.('loba_for_you')}>
          <Text style={styles.headerChipText}>Pour Toi</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#fff" />
        </Pressable>

        <View style={styles.statusChip}>
          <MaterialCommunityIcons name="wifi-off" size={14} color="#fbbf24" />
          <Text style={styles.statusText}>Mode Offline</Text>
        </View>
      </View>

      <FlatList
        data={feedVideos}
        renderItem={renderVideo}
        keyExtractor={item => item.id.toString()}
        pagingEnabled
        vertical
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / height);
          setCurrentVideoIndex(index);
        }}
      />

      {/* Share Modal */}
      <Modal
        visible={isShareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsShareModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsShareModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Partager avec</Text>

            <View style={styles.shareGrid}>
              <ShareOption icon="whatsapp" color="#25D366" label="WhatsApp" onPress={handleNativeShare} />
              <ShareOption icon="facebook" color="#1877F2" label="Facebook" onPress={handleNativeShare} />
              <ShareOption icon="instagram" color="#E4405F" label="Instagram" onPress={handleNativeShare} />
              <ShareOption icon="download" color="#4B5563" label="Enregistrer" onPress={() => Alert.alert('Download', 'Saving to phone...')} />
              <ShareOption icon="link-variant" color="#4B5563" label="Copier le lien" onPress={() => Alert.alert('Link', 'Link copied to clipboard')} />
            </View>

            <Pressable
              style={styles.closeBtn}
              onPress={() => setIsShareModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Annuler</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Comments Modal (Simplified) */}
      <Modal
        visible={isCommentsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCommentsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsCommentsModalVisible(false)}
        >
          <View style={[styles.modalContent, styles.commentsModal]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{selectedVideo?.comments} commentaires</Text>

            <ScrollView style={styles.commentsList}>
              <View style={styles.emptyComments}>
                <MaterialCommunityIcons name="chat-outline" size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyCommentsText}>Chargement des commentaires...</Text>
              </View>
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <Image source={{ uri: selectedVideo?.avatar }} style={styles.userAvatarSmall} />
              <View style={styles.commentInput}>
                <Text style={styles.commentPlaceholder}>Ajouter un commentaire...</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Floating Bottom Navigation */}
      <LobaBottomNav activeTab="home" onNavigate={(tab) => {
        if (tab === 'home') onNavigate?.('loba_home');
        else if (tab === 'friends') onNavigate?.('loba_friends');
        else if (tab === 'create') onNavigate?.('loba_home');
        else if (tab === 'messages') onNavigate?.('loba_messages');
        else if (tab === 'profile') onNavigate?.('loba_profile');
      }} />
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
    paddingTop: 54,
    paddingBottom: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
  },
  headerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  activeIndicator: {
    width: 20,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    marginTop: 4,
    position: 'absolute',
    bottom: -8,
  },
  tabSpacer: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  videoContainer: {
    width,
    height: height,
    backgroundColor: '#000',
  },
  videoBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  videoGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  rightActions: {
    position: 'absolute',
    right: 8,
    bottom: 120,
    alignItems: 'center',
    gap: 20,
    zIndex: 10,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  followBadge: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -11,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  actionItem: {
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  musicDisc: {
    marginTop: 10,
  },
  musicDiscInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    borderWidth: 4,
    borderColor: '#333',
    overflow: 'hidden',
  },
  musicImage: {
    width: '100%',
    height: '100%',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 100,
    zIndex: 10,
  },
  username: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  caption: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  musicText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressBar: {
    position: 'absolute',
    bottom: 86,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#137fec',
  },
  followBadgeActive: {
    backgroundColor: '#22c55e',
    borderColor: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1c2a38',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  commentsModal: {
    minHeight: height * 0.7,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
    marginBottom: 30,
  },
  shareOption: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
  },
  shareIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
  },
  emptyComments: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyCommentsText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  userAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentInput: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  commentPlaceholder: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
});

const ActionButton = ({ icon, color = "#fff", count, onPress }) => (
  <View style={styles.actionItem}>
    <Pressable style={styles.actionBtn} onPress={onPress}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
    </Pressable>
    {count !== undefined && <Text style={styles.actionCount}>{count}</Text>}
  </View>
);

const ShareOption = ({ icon, color, label, onPress }) => (
  <Pressable style={styles.shareOption} onPress={onPress}>
    <View style={[styles.shareIconCircle, { backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.shareLabel}>{label}</Text>
  </Pressable>
);

const enhance = withObservables([], () => ({
  posts: database.get('loba_posts').query().observe(),
}));

export default enhance(LobaHomeScreen);
