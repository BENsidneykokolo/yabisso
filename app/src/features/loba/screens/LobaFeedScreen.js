import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  FlatList,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const stories = [
  { id: 1, name: 'My Story', avatar: null, isAdd: true },
  { id: 2, name: 'Kofi', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-TBRU0_mExufLGR8WbjZwT73D8huo0YWP6SYqPjZAk5FoKCxcY2A8t0Nap7Xp5YH8oIXXqivTyiUp0PMkOlhAEpLNzEn0wSat0_KocNJoRBP8UO_UbVnKynniyFPcQNV2oJHIzC3kn5U1zQP6gZu6OG7M7sASSxX6b31KMbWHX_7sg8nEv5ylgixyLt8yJXS2mOeeIMPBqzlvi8Yqg69YPD1ZAUT0urSSgkC817TvSwR6BG_s0oM6IKgJ-A5Nmf9K9Smd8Uvd' },
  { id: 3, name: 'Amara', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZtvwVsq92pKVw0nXGx_XhXbbPPsbKmE9-z0m2J9WZN-Q7-x4NnpDNCTcWql6QEdqtk-huBz0JSQ4yHlBVN66Dt7ajEsDc6KiRl1TcDqL_6NXJA7kKwetBmiuyTFoD40GPkBd1Imv0vWcQ_s6TSjUp4ytupfFylDPPvezXmaHhDz1q6H34cCxru3EaSFtY_kxt4CopSle4Saf6hdNyu1qGbocUgyYlvdfuhtCoyvb2aR6EkwlVAG5fPE_gZiWzKySpArm-PMn2' },
  { id: 4, name: 'Tunde', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGUIGCFh4WwJs-zcZagu4DefthTyTr2-oikHgtM3FLsrK4k4WYUIW3b_2GS2oRMPlrv8eKGDXxfztn8o5q7BQclsPNTf-frOgXE6uVDhPJGectXH72Pixv8LHhenb_HjsDFlTAWVA2T0rc2HB-BNRci5_XU2Qc_g06Yyvqs6hoV4uxd6bXODQCANYc3oorUQLGKnZLoYlYEm8QGzI1ygstqinDLD15aIbmIFIc6Vd2DlsNLK2cbVUZiRf0C9BADopfMkgkEuYf', viewed: true },
  { id: 5, name: 'Nneka', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPs-a2lSM_bmNLNs1GkXRzOsSShLYwv_rSzvZ0vFkTZAC35XyDj_29VltZJ1ki-g5kR08ShBo0wAYd1_SBpqR-NbTCcjwfxTR1y2ffn7FwboHugN7JgcDIanSbRlZ43uL81mGHqHonrY1D85VV3D4PtZBH8kQmrPd_od1JQL8Dby0EiiyRwUpolz3ch6BV0z9kOK4jh7mC5Ka3CNlMw4iBGxyPUB6qeLDVis7qzYzApjaA63kBYEemlMf70N-C6fsqRjJZ4E68' },
];


import withObservables from '@nozbe/with-observables';
import { database } from '../../../lib/db';

function LobaFeedScreen({ onBack, onNavigate, posts = [] }) {
  const [activeTabNav, setActiveTabNav] = React.useState('Loba');
  
  const displayPosts = posts.map(p => ({
    id: p.id,
    user: {
      name: p.username,
      avatar: p.avatar,
      location: '',
    },
    time: '2h ago',
    content: p.content,
    image: p.imageUrl || p.videoUrl,
    isVideo: !!p.videoUrl,
    videoDuration: '0:00',
    likes: p.likes,
    comments: p.comments,
    liked: p.isLiked,
    saved: false,
  })).reverse();

  const [feedPosts, setFeedPosts] = React.useState(displayPosts);

  React.useEffect(() => {
    setFeedPosts(displayPosts);
  }, [posts]);

  const handleLike = (id) => {
    setFeedPosts(prev => prev.map(post => {
      if (post.id === id) {
        const isLiked = !post.liked;
        return {
          ...post,
          liked: isLiked,
          likes: isLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  const handleShare = async (post) => {
    try {
      await Share.share({
        message: `Check out this post from ${post.user.name} on Yabisso: ${post.content}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share post');
    }
  };

  const handleSave = (id) => {
    setFeedPosts(prev => prev.map(post => {
      if (post.id === id) {
        return { ...post, saved: !post.saved };
      }
      return post;
    }));
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Yabisso Social</Text>
        <View style={styles.topBarRight}>
          <Pressable style={styles.iconBtn}>
            <MaterialCommunityIcons name="magnify" size={26} color="#fff" />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <MaterialCommunityIcons name="chat-bubble-outline" size={26} color="#fff" />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>
      </View>

      <View style={styles.storiesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesScroll}
        >
          {stories.map((story) => (
            <View key={story.id} style={styles.storyItem}>
              <View
                style={[
                  styles.storyRing,
                  story.isAdd && styles.storyRingDashed,
                  story.viewed && styles.storyRingViewed,
                ]}
              >
                {story.isAdd ? (
                  <View style={styles.addStory}>
                    <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                  </View>
                ) : (
                  <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
                )}
              </View>
              <Text style={styles.storyName} numberOfLines={1}>
                {story.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={feedPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => handleLike(item.id)}
            onShare={() => handleShare(item)}
            onSave={() => handleSave(item.id)}
            onComment={() => Alert.alert('Commentaires', 'Chargement des commentaires...')}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedList}
      />

      <Pressable style={styles.fab}>
        <MaterialCommunityIcons name="pencil" size={28} color="#fff" />
      </Pressable>

      {/* Floating Bottom Navigation */}
      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const isActive = activeTabNav === item.label;
            return (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.navItem,
                  pressed && styles.navItemPressed,
                ]}
                onPress={() => {
                  if (item.label === 'Home') onBack?.();
                  else if (item.label === 'Profile') onNavigate?.('profile');
                  else {
                    setActiveTabNav(item.label);
                  }
                }}
              >
                <View style={[
                  styles.navIcon,
                  isActive && styles.navIconActive,
                  item.primary && styles.navIconCenter,
                ]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={isActive || item.primary ? 22 : 18}
                    color={isActive ? '#0E151B' : '#E6EDF3'}
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
    </SafeAreaView>
  );
}

const PostCard = ({ post, onLike, onShare, onSave, onComment }) => (
  <View style={styles.postCard}>
    <View style={styles.postHeader}>
      <View style={styles.postUser}>
        <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.user.name}</Text>
          <View style={styles.postMeta}>
            <Text style={styles.postTime}>{post.time}</Text>
            {post.user.location && (
              <>
                <Text style={styles.postLocation}> • {post.user.location}</Text>
                <MaterialCommunityIcons name="cloud-check-outline" size={12} color="#92adc9" />
              </>
            )}
          </View>
        </View>
      </View>
      <Pressable>
        <MaterialCommunityIcons name="dots-vertical" size={24} color="#92adc9" />
      </Pressable>
    </View>

    <Text style={styles.postContent}>{post.content}</Text>

    {post.image && (
      <View style={styles.mediaContainer}>
        <Image source={{ uri: post.image }} style={styles.postMedia} />
        {post.isVideo && (
          <>
            <View style={styles.playButton}>
              <MaterialCommunityIcons name="play" size={32} color="#fff" />
            </View>
            <View style={styles.videoDuration}>
              <Text style={styles.videoDurationText}>{post.videoDuration}</Text>
            </View>
          </>
        )}
      </View>
    )}

    {!post.image && post.id === 2 && (
      <View style={styles.gradientCard}>
        <Text style={styles.gradientCardText}>{post.content}</Text>
      </View>
    )}

    <View style={styles.reactionBar}>
      <View style={styles.reactionButtons}>
        <Pressable style={styles.reactionBtn} onPress={onLike}>
          <MaterialCommunityIcons
            name={post.liked ? 'heart' : 'heart-outline'}
            size={24}
            color={post.liked ? '#ef4444' : '#92adc9'}
          />
          <Text style={styles.reactionCount}>{post.likes}</Text>
        </Pressable>
        <Pressable style={styles.reactionBtn} onPress={onComment}>
          <MaterialCommunityIcons name="chat-bubble-outline" size={24} color="#92adc9" />
          <Text style={styles.reactionCount}>{post.comments}</Text>
        </Pressable>
        <Pressable style={styles.reactionBtn} onPress={onShare}>
          <MaterialCommunityIcons name="send" size={24} color="#92adc9" />
        </Pressable>
      </View>
      <Pressable onPress={onSave}>
        <MaterialCommunityIcons
          name={post.saved ? "bookmark" : "bookmark-outline"}
          size={24}
          color={post.saved ? "#fbbf24" : "#92adc9"}
        />
      </Pressable>
    </View>

    {post.id === 1 && (
      <View style={styles.likedBy}>
        <Text style={styles.likedByText}>
          Aimé par <Text style={styles.likedByName}>Amara</Text> et <Text style={styles.likedByName}>45 autres</Text>
        </Text>
      </View>
    )}
  </View>
);

const navItems = [
  { label: 'Home', icon: 'home-variant' },
  { label: 'Wallet', icon: 'wallet' },
  { label: 'Create', icon: 'plus', primary: true },
  { label: 'Loba', icon: 'play-circle', active: true },
  { label: 'Profile', icon: 'account' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111a22',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#111a22',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#111a22',
  },
  storiesContainer: {
    backgroundColor: '#111a22',
    paddingVertical: 12,
  },
  storiesScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    backgroundColor: 'transparent',
  },
  storyRingDashed: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  storyRingViewed: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  addStory: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#111a22',
  },
  storyName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  feedList: {
    paddingBottom: 150,
  },
  postCard: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTime: {
    color: '#92adc9',
    fontSize: 12,
  },
  postLocation: {
    color: '#92adc9',
    fontSize: 12,
  },
  postContent: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  postMedia: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -28,
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoDurationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gradientCard: {
    margin: 16,
    marginTop: 0,
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(79,70,229,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  gradientCardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
  },
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  reactionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reactionCount: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  likedBy: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  likedByText: {
    color: '#92adc9',
    fontSize: 14,
  },
  likedByName: {
    color: '#fff',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 36,
    zIndex: 30,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    backgroundColor: '#3B82F6',
  },
  navIconCenter: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    marginTop: -14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navLabel: {
    color: '#E6EDF3',
    fontSize: 10,
    opacity: 0.6,
  },
  navLabelActive: {
    color: '#2BEE79',
    opacity: 1,
    fontWeight: '700',
  },
});

const enhance = withObservables([], () => ({
  posts: database.get('loba_posts').query().observe(),
}));

export default enhance(LobaFeedScreen);
