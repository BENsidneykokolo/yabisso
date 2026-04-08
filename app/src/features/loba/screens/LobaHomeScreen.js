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
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import LobaBottomNav from '../components/LobaBottomNav';
import withObservables from '@nozbe/with-observables';
import { database } from '../../../lib/db';
import { P2PAutoSync } from '../../bluetooth/services/P2PAutoSync';
import { useMeshConnection } from '../../bluetooth/hooks/useMeshConnection';
import { useWifiDirect } from '../hooks/useWifiDirect';
import { Q } from '@nozbe/watermelondb';
const { width, height } = Dimensions.get('window');


const stories = [
  { id: 1, name: 'My Story', avatar: null, isAdd: true },
  { id: 2, name: 'Kofi', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-TBRU0_mExufLGR8WbjZwT73D8huo0YWP6SYqPjZAk5FoKCxcY2A8t0Nap7Xp5YH8oIXXqivTyiUp0PMkOlhAEpLNzEn0wSat0_KocNJoRBP8UO_UbVnKynniyFPcQNV2oJHIzC3kn5U1zQP6gZu6OG7M7sASSxX6b31KMbWHX_7sg8nEv5ylgixyLt8yJXS2mOeeIMPBqzlvi8Yqg69YPD1ZAUT0urSSgkC817TvSwR6BG_s0oM6IKgJ-A5Nmf9K9Smd8Uvd' },
  { id: 3, name: 'Amara', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZtvwVsq92pKVw0nXGx_XhXbbPPsbKmE9-z0m2J9WZN-Q7-x4NnpDNCTcWql6QEdqtk-huBz0JSQ4yHlBVN66Dt7ajEsDc6KiRl1TcDqL_6NXJA7kKwetBmiuyTFoD40GPkBd1Imv0vWcQ_s6TSjUp4ytupfFylDPPvezXmaHhDz1q6H34cCxru3EaSFtY_kxt4CopSle4Saf6hdNyu1qGbocUgyYlvdfuhtCoyvb2aR6EkwlVAG5fPE_gZiWzKySpArm-PMn2' },
  { id: 4, name: 'Tunde', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGUIGCFh4WwJs-zcZagu4DefthTyTr2-oikHgtM3FLsrK4k4WYUIW3b_2GS2oRMPlrv8eKGDXxfztn8o5q7BQclsPNTf-frOgXE6uVDhPJGectXH72Pixv8LHhenb_HjsDFlTAWVA2T0rc2HB-BNRci5_XU2Qc_g06Yyvqs6hoV4uxd6bXODQCANYc3oorUQLGKnZLoYlYEm8QGzI1ygstqinDLD15aIbmIFIc6Vd2DlsNLK2cbVUZiRf0C9BADopfMkgkEuYf' },
  { id: 5, name: 'Nneka', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPs-a2lSM_bmNLNs1GkXRzOsSShLYwv_rSzvZ0vFkTZAC35XyDj_29VltZJ1ki-g5kR08ShBo0wAYd1_SBpqR-NbTCcjwfxTR1y2ffn7FwboHugN7JgcDIanSbRlZ43uL81mGHqHonrY1D85VV3D4PtZBH8kQmrPd_od1JQL8Dby0EiiyRwUpolz3ch6BV0z9kOK4jh7mC5Ka3CNlMw4iBGxyPUB6qeLDVis7qzYzApjaA63kBYEemlMf70N-C6fsqRjJZ4E68' },
];


function LobaHomeScreen({ onBack, onNavigate, posts = [] }) {
  const [activeTab, setActiveTab] = useState('For You');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Merge DB posts with initial mock videos
  const getDisplayPosts = () => [
    ...posts.map(p => ({
      id: p.id,
      username: p.username,
      avatar: p.avatar,
      video: p.localMediaPath || p.videoUrl || p.imageUrl,
      type: p.videoUrl || (p.localMediaPath && p.localMediaPath.endsWith('.mp4')) ? 'video' : 'photo',
      caption: p.content,
      song: 'Original Sound - ' + p.username,
      likes: p.likes,
      comments: p.comments,
      progress: 0,
      liked: p.isLiked,
      followed: false,
      saved: false,
      filterColor: p.filterColor,
    }))
  ];

  const meshState = useMeshConnection();
  const wifiState = useWifiDirect();

  const [p2pLogModal, setP2pLogModal] = useState(false);

  const [feedVideos, setFeedVideos] = useState(getDisplayPosts());

  useEffect(() => {
    P2PAutoSync.start();
    // Popup d'autorisation demandé par l'utilisateur
    P2PAutoSync.requestWifiDirectActivation();
    return () => P2PAutoSync.stop();
  }, []);

  useEffect(() => {
    setFeedVideos(getDisplayPosts());
    loadSavedVideos();
  }, [posts]);

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
        url: selectedVideo.video,
      });
      setIsShareModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Could not share video');
    }
  };

  const renderVideo = ({ item, index }) => {
    // Logique de source prioritaire : Local (Mesh) > Cloud (Internet)
    const hasLocalMedia = item.localMediaPath || item.video || item.videoUrl;
    const videoSource = item.localMediaPath 
      ? { uri: item.localMediaPath } 
      : (item.videoUrl ? { uri: item.videoUrl } : { uri: item.video });

    const isCloseToVisible = Math.abs(index - currentVideoIndex) <= 1;
    
    return (
    <View style={[styles.videoContainer, { height: height }]}>
      {!hasLocalMedia ? (
        /* MediaPlaceholder */
        <View style={[styles.videoBackground, styles.mediaPlaceholder]}>
          <View style={styles.placeholderContent}>
            <MaterialCommunityIcons name="cloud-download-outline" size={48} color="rgba(255,255,255,0.3)" />
            <Text style={styles.placeholderText}>Contenu en attente...</Text>
            <Text style={styles.placeholderSubText}>Ce média sera disponible dès qu'un transfert P2P sera terminé</Text>
            <View style={styles.placeholderProgressBar}>
              <Animated.View style={[styles.placeholderProgressFill, { width: '30%' }]} />
            </View>
          </View>
        </View>
      ) : index === currentVideoIndex ? (
        item.type === 'video' ? (
          <Video
            source={videoSource}
            style={styles.videoBackground}
            resizeMode={ResizeMode.COVER}
            shouldPlay={true}
            isLooping={true}
            isMuted={false}
          />
        ) : (
          <Image source={{ uri: item.video || item.localMediaPath }} style={styles.videoBackground} />
        )
      ) : (
        /* Pour les voisins ou posts éloignés : Image fixe uniquement pour préserver la RAM */
        <Image source={{ uri: item.video || item.localMediaPath }} style={[styles.videoBackground, { opacity: 0.6 }]} />
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
          icon="comment-text"
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
  };

  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', width: width, height: height, top: 0, left: 0 }}>
      {/* Header Statut & Actions */}
      <View style={styles.header}>
        <Pressable 
          style={styles.refreshBtn} 
          onPress={() => P2PAutoSync.forceRefresh()}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
        </Pressable>

        <Pressable 
          style={styles.statusChip} 
          onPress={() => setP2pLogModal(true)}
        >
          {wifiState.connectedPeer ? (
             <MaterialCommunityIcons name="wifi-star" size={14} color="#22c55e" />
          ) : wifiState.isDiscovering ? (
             <ActivityIndicator size={10} color="#fbbf24" style={{ marginRight: 4 }} />
          ) : meshState.isConnected ? (
            <MaterialCommunityIcons name="bluetooth-connect" size={14} color="#22c55e" />
          ) : (
            <MaterialCommunityIcons name="wifi-off" size={14} color="#fbbf24" />
          )}
          <Text style={[styles.statusText, (wifiState.connectedPeer || meshState.isConnected) && { color: '#22c55e' }]}>
            {wifiState.connectedPeer 
              ? 'WiFi P2P Connecté' 
              : wifiState.isDiscovering 
                ? 'Recherche...' 
                : meshState.isConnected 
                  ? `Mesh Actif (${meshState.peerCount})` 
                  : 'Mode Offline'}
          </Text>
        </Pressable>
      </View>
 
      {/* Mesh Status Text Overlay (Discret) */}
      {meshState.isConnected && !wifiState.connectedPeer && (
        <View style={styles.meshOverlay}>
          <Text style={styles.meshOverlayText}>Diffusion locale (Mesh) active ✨</Text>
        </View>
      )}

      {/* Propagation Status Bar (Background Mesh) */}
      {posts.some(p => p.isPropagating) && (
        <View style={styles.propagationBar}>
          <MaterialCommunityIcons name="broadcast" size={18} color="#A855F7" />
          <Text style={styles.propagationText}>Diffusion locale en cours (Mesh)...</Text>
          <View style={styles.propagationLoader}>
             <Animated.View style={[styles.propagationFill, { width: '60%' }]} /> 
          </View>
        </View>
      )}

      {feedVideos.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#101922' }}>
          <MaterialCommunityIcons name="image-off-outline" size={64} color="rgba(255,255,255,0.1)" />
          <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 16 }}>Aucune publication pour le moment</Text>
          <Text style={{ color: 'rgba(255,255,255,0.2)', marginTop: 8, fontSize: 12 }}>Les nouveaux uploads apparaîtront ici</Text>
        </View>
      ) : (
        <FlatList
          data={feedVideos}
          renderItem={renderVideo}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          pagingEnabled
          vertical
          showsVerticalScrollIndicator={false}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={2}
          removeClippedSubviews={true}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.y / height);
            setCurrentVideoIndex(index);
          }}
        />
      )}
      </View>

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
  propagationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: 'absolute',
    top: 90,
    left: 16,
    right: 16,
    zIndex: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    gap: 8,
  },
  propagationText: {
    color: '#d8b4fe',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  propagationLoader: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  propagationFill: {
    height: '100%',
    backgroundColor: '#A855F7',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    width: '100%',
  },
  refreshBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
  },
  statusChip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  meshOverlay: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  meshOverlayText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
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
  propagationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    borderRadius: 12,
    zIndex: 30,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  propagationText: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  propagationLoader: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  propagationFill: {
    height: '100%',
    backgroundColor: '#A855F7',
  },
  mediaPlaceholder: {
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  placeholderSubText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  placeholderProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 24,
    overflow: 'hidden',
  },
  placeholderProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
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
  posts: database.get('loba_posts').query(
    Q.sortBy('created_at', Q.desc),
    Q.take(30)
  ).observe(),
}));

export default enhance(LobaHomeScreen);
