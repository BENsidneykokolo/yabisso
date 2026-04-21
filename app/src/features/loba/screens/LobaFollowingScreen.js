import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  Modal,
  Alert,
  Share,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as SecureStore from 'expo-secure-store';
import LobaBottomNav from '../components/LobaBottomNav';
import { useMeshConnection } from '../../bluetooth/hooks/useMeshConnection';
import withObservables from '@nozbe/with-observables';
import { database } from '../../../lib/db';

const { width, height } = Dimensions.get('window');



const followedCreators = [
  { id: 1, name: 'Kofi Mensah', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpQKycPMLIcj6lEgT3yylEk1PYLRLRoGgntAftVcxpaZk_rZCjF9tJVB74QcDXaov6pXlQd0xJc3Hzn42A1xSh9sZDFM8PgyDRwaUsq2dn7Bf4d23hd1L-NEElMtyMOXIXKC3n95_TmtmOznJyFX7p_fI7-3ZxTpsj7scTO5mwqImoclkDwp9xyQN6RBUdjQBm_U_wSO1O_DvULR6bLmrYThfVtAvmsqTQJoZByFXdNIm-IThl8u4qx54KVUdJpCvlTLEejlGP', following: true },
  { id: 2, name: 'Amara Design', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZtvwVsq92pKVw0nXGx_XhXbbPPsbKmE9-z0m2J9WZN-Q7-x4NnpDNCTcWql6QEdqtk-huBz0JSQ4yHlBVN66Dt7ajEsDc6KiRl1TcDqL_6NXJA7kKwetBmiuyTFoD40GPkBd1Imv0vWcQ_s6TSjUp4ytupfFylDPPvezXmaHhDz1q6H34cCxru3EaSFtY_kxt4CopSle4Saf6hdNyu1qGbocUgyYlvdfuhtCoyvb2aR6EkwlVAG5fPE_gZiWzKySpArm-PMn2', following: true },
  { id: 3, name: 'Tunde Tech', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGUIGCFh4WwJs-zcZagu4DefthTyTr2-oikHgtM3FLsrK4k4WYUIW3b_2GS2oRMPlrv8eKGDXxfztn8o5q7BQclsPNTf-frOgXE6uVDhPJGectXH72Pixv8LHhenb_HjsDFlTAWVA2T0rc2HB-BNRci5_XU2Qc_g06Yyvqs6hoV4uxd6bXODQCANYc3oorUQLGKnZLoYlYEm8QGzI1ygstqinDLD15aIbmIFIc6Vd2DlsNLK2cbVUZiRf0C9BADopfMkgkEuYf', following: true },
  { id: 4, name: 'Nneka\'s Kitchen', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPs-a2lSM_bmNLNs1GkXRzOsSShLYwv_rSzvZ0vFkTZAC35XyDj_29VltZJ1ki-g5kR08ShBo0wAYd1_SBpqR-NbTCcjwfxTR1y2ffn7FwboHugN7JgcDIanSbRlZ43uL81mGHqHonrY1D85VV3D4PtZBH8kQmrPd_od1JQL8Dby0EiiyRwUpolz3ch6BV0z9kOK4jh7mC5Ka3CNlMw4iBGxyPUB6qeLDVis7qzYzApjaA63kBYEemlMf70N-C6fsqRjJZ4E68', following: true },
  { id: 5, name: 'Marathon Mike', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuEjemploRunnerAvatar123', following: false },
];

const VideoPlayerItem = ({ source, shouldPlay, style }) => {
  const player = useVideoPlayer(source, p => {
    p.loop = true;
    p.muted = false;
  });
  React.useEffect(() => {
    if (shouldPlay) player.play();
    else player.pause();
  }, [shouldPlay]);
  return <VideoView player={player} style={style} contentFit="cover" />;
};

function LobaFollowingScreen({ onBack, onNavigate, videos = [] }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  const displayPosts = [
    ...videos.map(p => ({
      id: p.id,
      username: p.username,
      avatar: p.avatar,
      video: p.videoUrl || p.imageUrl,
      type: p.videoUrl ? 'video' : 'photo',
      caption: p.content,
      song: 'Original Sound - ' + p.username,
      likes: p.likes,
      comments: p.comments,
      progress: 0,
      liked: p.isLiked,
      followed: true,
      saved: false,
      filterColor: p.filterColor,
      time: 'Maintenant',
    })).reverse()
  ];

  const [feedVideos, setFeedVideos] = useState(displayPosts);
  const meshState = useMeshConnection();

  React.useEffect(() => {
    setFeedVideos(displayPosts);
    loadSavedVideos();
  }, [videos]);

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
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

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
    setFeedVideos(prev => prev.map(video => {
      if (video.id === id) {
        return { ...video, saved: !video.saved };
      }
      return video;
    }));
    try {
      const savedIdsJson = await SecureStore.getItemAsync('loba_saved_videos');
      let savedIds = savedIdsJson ? JSON.parse(savedIdsJson) : [];
      
      const video = feedVideos.find(v => v.id === id);
      if (video?.saved) {
        savedIds = savedIds.filter(savedId => savedId !== id);
      } else {
        if (!savedIds.includes(id)) {
           savedIds.push(id);
           Alert.alert('Sauvegardé', 'Cette publication a été ajoutée à vos favoris.');
        }
      }
      await SecureStore.setItemAsync('loba_saved_videos', JSON.stringify(savedIds));
    } catch (e) {
      console.log('Error saving video:', e);
    }
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
      });
      setIsShareModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager');
    }
  };

  const renderVideo = ({ item, index }) => {
    const isCloseToVisible = Math.abs(index - currentVideoIndex) <= 1;
    return (
    <View style={[styles.videoContainer, { height: height }]}>
      {item.type === 'video' ? (
        isCloseToVisible ? (
          <VideoPlayerItem
            source={{ uri: item.video }}
            shouldPlay={index === currentVideoIndex}
            style={styles.videoBackground}
          />
        ) : (
          <View style={[styles.videoBackground, { backgroundColor: '#000' }]} />
        )
      ) : (
        <Image source={{ uri: item.video }} style={styles.videoBackground} />
      )}
      <View style={[styles.filterOverlay, { backgroundColor: item.filterColor || 'transparent' }]} />
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
        <View style={styles.usernameRow}>
          <View>
            <Text style={styles.username}>@{item.username.split('@')[1]}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          {!item.followed && (
            <Pressable style={styles.followBtnSmall} onPress={() => handleFollow(item.id)}>
              <Text style={styles.followBtnText}>Suivre</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.caption} numberOfLines={3}>{item.caption}</Text>
        <Pressable style={styles.musicRow} onPress={() => Alert.alert('Son original', item.song)}>
          <MaterialCommunityIcons name="music-note" size={14} color="#fff" />
          <Text style={styles.musicText}>{item.song}</Text>
        </Pressable>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
      </View>
    </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', width: width, height: height, top: 0, left: 0 }}>
      <View style={styles.header}>
        <View style={styles.statusChip}>
          {meshState.isConnected ? (
            <MaterialCommunityIcons name="bluetooth-connect" size={14} color="#22c55e" />
          ) : (
            <MaterialCommunityIcons name="wifi-off" size={14} color="#fbbf24" />
          )}
          <Text style={[styles.statusText, meshState.isConnected && { color: '#22c55e' }]}>
            {meshState.isConnected ? `Mesh Actif (${meshState.peerCount})` : 'Mode Offline'}
          </Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Abonnements</Text>
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
      </View>

      <Modal
        visible={isShareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsShareModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsShareModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Partager avec</Text>

            <View style={styles.shareGrid}>
              <ShareOption icon="whatsapp" color="#25D366" label="WhatsApp" onPress={handleNativeShare} />
              <ShareOption icon="facebook" color="#1877F2" label="Facebook" onPress={handleNativeShare} />
              <ShareOption icon="instagram" color="#E4405F" label="Instagram" onPress={handleNativeShare} />
              <ShareOption icon="download" color="#4B5563" label="Enregistrer" onPress={() => Alert.alert('Enregistrer', 'Vidéo enregistrée!')} />
              <ShareOption icon="link-variant" color="#4B5563" label="Copier le lien" onPress={() => Alert.alert('Lien', 'Lien copié!')} />
            </View>

            <Pressable style={styles.closeBtn} onPress={() => setIsShareModalVisible(false)}>
              <Text style={styles.closeBtnText}>Annuler</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={isCommentsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCommentsModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsCommentsModalVisible(false)}>
          <View style={[styles.modalContent, styles.commentsModal]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{selectedVideo?.comments} commentaires</Text>

            <View style={styles.commentsList}>
              <View style={styles.emptyComments}>
                <MaterialCommunityIcons name="chat-outline" size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyCommentsText}>Chargement des commentaires...</Text>
              </View>
            </View>

            <View style={styles.commentInputContainer}>
              <Image source={{ uri: selectedVideo?.avatar }} style={styles.userAvatarSmall} />
              <View style={styles.commentInput}>
                <Text style={styles.commentPlaceholder}>Ajouter un commentaire...</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>

      <LobaBottomNav activeTab="home" onNavigate={(tab) => {
        if (tab === 'home') onNavigate?.('loba_home');
        else if (tab === 'friends') onNavigate?.('loba_friends');
        else if (tab === 'create') onNavigate?.('loba_record');
        else if (tab === 'messages') onNavigate?.('loba_messages');
        else if (tab === 'profile') onNavigate?.('loba_profile');
      }} />
    </View>
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
    paddingTop: 50,
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
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  followedCreatorsSection: {
    paddingTop: 90,
    paddingBottom: 16,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  creatorsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  creatorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
    minWidth: 100,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  creatorName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  creatorCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
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
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
    zIndex: 5,
  },
  videoGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 6,
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
  actionBtn: {
    padding: 4,
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
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  username: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  followBtnSmall: {
    backgroundColor: '#137fec',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },
  followBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
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
      <MaterialCommunityIcons name={icon} size={28} color={color} />
    </Pressable>
    {count !== undefined && <Text style={styles.actionCount}>{typeof count === 'number' ? count.toLocaleString() : count}</Text>}
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
  videos: database.get('loba_posts').query().observe(),
}));

export default enhance(LobaFollowingScreen);