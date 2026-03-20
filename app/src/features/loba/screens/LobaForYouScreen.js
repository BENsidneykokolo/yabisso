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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import withObservables from '@nozbe/with-observables';
import { database } from '../../../lib/db';
import LobaBottomNav from '../components/LobaBottomNav';

const { width, height } = Dimensions.get('window');

const forYouVideos = [
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
    tags: ['food', 'lagos', 'nigerian'],
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
    tags: ['tech', 'innovation', 'ghana'],
  },
  {
    id: 3,
    username: '@CongoVibes',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkdN0I7I4vR0nS9cY8hKmP2tGjL5wZ1qX3nL6oK9pQ8rT4vW2xY1zA0bC8dE6fG9hI2jK1lM0nO9pQ8rT4vW2xY',
    video: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtK8TvWjtBzKDjxuNCgfKCM4VlXkH7Hg9QBzK5eG3Ln-zP7vsQaoci0T6qobNgJTG-5XhMtb5xOpfX-pW4Q51r7E1jBDBkJ8ui72wvXPeaDdJ4XWogDMTXMK4rRBmj96uJkepQcbLbXghuHhcfgXXwVoJgVoNN7_EkMxkinirFlaspT4lpwuIVSIzP4iJEeJQuWKp8mryxMKc8Yr_16eVJt7gdmfV4Zzh-JOxvlDIzL-0kM-4AUc-kHPKVwQ1Aa020PiWFk7KE',
    caption: 'Congolese rhythms are taking over the world! 🎶💃 #CongoMusic #Afrobeats',
    song: 'Fally Ipupa - Noki',
    likes: 8900,
    comments: 450,
    progress: 80,
    liked: false,
    followed: false,
    saved: false,
    tags: ['music', 'congo', 'afrobeats'],
  },
  {
    id: 4,
    username: '@KenyaRun',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuEjemploAvatar123456789',
    video: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnsmNx5C1-w0Yj3lMlo7-VbFA9OZNzc8vCIqLLNiEWPlqfOQSn40V7O2anTjQdhiVVsOUPd1Fh80S2l0bXDXUxJqhNIq_5GB6gsUsXx0OCuH76RCqW8zwYWx3Z1nuto64008GB7dQ3GGUGAUDYbjA2dXyctAocSS9HrU9BqfKeUCbR0eAsO9ge8eYzPx4BNyZApogpBe7SnsiUhCQ36Q-JA2p3Wz5ZttmMg-YIjNKODC2cU2gW0AhE6WrSmspXkdYVewssDBFD',
    caption: 'Morning run in Nairobi! 🏃‍♂️🌅 The weather is perfect today #KenyaRun #Fitness',
    song: 'Sauti Sol - Melodious',
    likes: 2100,
    comments: 89,
    progress: 45,
    liked: false,
    followed: true,
    saved: false,
    tags: ['fitness', 'kenya', 'running'],
  },
  {
    id: 5,
    username: '@SenegalStyle',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnotherExampleAvatarSenegal',
    video: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtK8TvWjtBzKDjxuNCgfKCM4VlXkH7Hg9QBzK5eG3Ln-zP7vsQaoci0T6qobNgJTG-5XhMtb5xOpfX-pW4Q51r7E1jBDBkJ8ui72wvXPeaDdJ4XWogDMTXMK4rRBmj96uJkepQcbLbXghuHhcfgXXwVoJgVoNN7_EkMxkinirFlaspT4lpwuIVSIzP4iJEeJQuWKp8mryxMKc8Yr_16eVJt7gdmfV4Zzh-JOxvlDIzL-0kM-4AUc-kHPKVwQ1Aa020PiWFk7KE',
    caption: 'Traditional Wolof dress for the cultural festival! 🇸🇳✨ #Senegal #Culture #Fashion',
    song: 'Doudou N\'Diaye Rose',
    likes: 5600,
    comments: 234,
    progress: 20,
    liked: true,
    followed: false,
    saved: true,
    tags: ['fashion', 'senegal', 'culture'],
  },
];

const userInterests = ['Food', 'Tech', 'Music', 'Fashion', 'Sports', 'Travel', 'Comedy', 'Education'];

function LobaForYouScreen({ onBack, onNavigate }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [feedVideos, setFeedVideos] = useState(forYouVideos);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showInterests, setShowInterests] = useState(false);

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

  const handleSave = (id) => {
    setFeedVideos(prev => prev.map(video => {
      if (video.id === id) {
        return { ...video, saved: !video.saved };
      }
      return video;
    }));
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

  const toggleInterest = (interest) => {
    Alert.alert('Intérêt', `${interest} ajouté à vos préférences!`);
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
        <View style={styles.usernameRow}>
          <Text style={styles.username}>@{item.username.split('@')[1]}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusChip}>
          <MaterialCommunityIcons name="wifi-off" size={14} color="#fbbf24" />
          <Text style={styles.statusText}>Mode Offline</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Pour Toi</Text>
          <Pressable onPress={() => setShowInterests(true)} style={styles.filterBtn}>
            <MaterialCommunityIcons name="tune-variant" size={20} color="#fff" />
          </Pressable>
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

      <Modal
        visible={showInterests}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInterests(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowInterests(false)}>
          <View style={styles.interestsModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Vos intérêts</Text>
            <Text style={styles.modalSubtitle}>Personnalisez votre feed "Pour Toi"</Text>
            
            <View style={styles.interestsGrid}>
              {userInterests.map((interest, index) => (
                <Pressable 
                  key={index} 
                  style={styles.interestChip}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text style={styles.interestText}>{interest}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.doneBtn} onPress={() => setShowInterests(false)}>
              <Text style={styles.doneBtnText}>Terminé</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

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
        else if (tab === 'create') onNavigate?.('loba_create');
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
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    alignItems: 'center',
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
  interestsModal: {
    backgroundColor: '#1c2a38',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 350,
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
    marginBottom: 8,
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  interestChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  interestText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  doneBtn: {
    backgroundColor: '#137fec',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

export default enhance(LobaForYouScreen);