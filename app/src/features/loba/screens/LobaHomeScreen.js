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
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const videos = [
  {
    id: 1,
    username: '@LagosEats',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-cZ953z6Pef-m-esMbutiujQzwcQ3gXocj0ErdwM9gmhxLpWo4SKz4VFvkSga_qlHMvvYo8Lkoex8tWespXnC8gKlURT7iGPPII63Uh98f-AX-ZYpjq5WOAHrL1QarS-bIe8awUnOztGtUDF19UvJerb2PYVsQUw5cJLRSU5yM8wnobwysn7cOF3j3h71OchJaZfAHWd1qNkkVk6oEEAlMw63bsadLjh3IsXVs3Db_jad-rzwr27E6XhAExYmUfH2A85zZ_Q7',
    video: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtK8TvWjtBzKDjxuNCgfKCM4VlXkH7Hg9QBzK5eG3Ln-zP7vsQaoci0T6qobNgJTG-5XhMtb5xOpfX-pW4Q51r7E1jBDBkJ8ui72wvXPeaDdJ4XWogDMTXMK4rRBmj96uJkepQcbLbXghuHhcfgXXwVoJgVoNN7_EkMxkinirFlaspT4lpwuIVSIzP4iJEeJQuWKp8mryxMKc8Yr_16eVJt7gdmfV4Zzh-JOxvlDIzL-0kM-4AUc-kHPKVwQ1Aa020PiWFk7KE',
    caption: 'Trying the best suya in the city! 🔥🥩 This place is hidden but worth the trek. #Lagos #Foodie #Yabisso',
    song: 'Burna Boy - Last Last',
    likes: 1200,
    comments: 300,
    progress: 35,
  },
  {
    id: 2,
    username: '@TechGhana',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpQKycPMLIcj6lEgT3yylEk1PYLRLRoGgntAftVcxpaZk_rZCjF9tJVB74QcDXaov6pXlQd0xJc3Hzn42A1xSh9sZDFM8PgyDRwaUsq2dn7Bf4d23hd1L-NEElMtyMOXIXKC3n95_TmtmOznJyFX7p_fI7-3ZxTpsj7scTO5mwqImoclkDwp9xyQN6RBUdjQBm_U_wSO1O_DvULR6bLmrYThfVtAvmsqTQJoZByFXdNIm-IThl8u4qx54KVUdJpCvlTLEejlGP',
    video: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnsmNx5C1-w0Yj3lMlo7-VbFA9OZNzc8vCIqLLNiEWPlqfOQSn40V7O2anTjQdhiVVsOUPd1Fh80S2l0bXDXUxJqhNIq_5GB6gsUsXx0OCuH76RCqW8zwYWx3Z1nuto64008GB7dQ3GGUGAUDYbjA2dXyctAocSS9HrU9BqfKeUCbR0eAsO9ge8eYzPx4BNyZApogpBe7SnsiUhCQ36Q-JA2p3Wz5ZttmMg-YIjNKODC2cU2gW0AhE6WrSmspXkdYVewssDBFD',
    caption: 'Building the future of African tech! 🌍✨ #AfricanTech #Innovation',
    song: 'Wizkid - Essence',
    likes: 2500,
    comments: 180,
    progress: 60,
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

export default function LobaHomeScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('For You');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const renderVideo = ({ item, index }) => (
    <View style={styles.videoContainer}>
      <Image source={{ uri: item.video }} style={styles.videoBackground} />
      <View style={styles.videoGradient} />
      
      <View style={styles.topOverlay}>
        <View style={styles.offlineChip}>
          <MaterialCommunityIcons name="wifi-off" size={14} color="#fbbf24" />
          <Text style={styles.offlineText}>Mode Offline</Text>
        </View>
        
        <View style={styles.tabs}>
          <Text style={[styles.tab, activeTab === 'Following' && styles.tabActive]}>Following</Text>
          <Text style={[styles.tab, activeTab === 'For You' && styles.tabActive]}>For You</Text>
        </View>
        
        <Pressable style={styles.searchBtn}>
          <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.rightActions}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.followBadge}>
            <MaterialCommunityIcons name="plus" size={12} color="#fff" />
          </View>
        </View>
        
        <ActionButton icon="heart" count={item.likes} />
        <ActionButton icon="chat-bubble" count={item.comments} />
        <ActionButton icon="share" count="Share" />
        <ActionButton icon="more-horiz" />
        
        <View style={styles.musicDisc}>
          <View style={styles.musicDiscInner}>
            <Image source={{ uri: item.avatar }} style={styles.musicImage} />
          </View>
        </View>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.caption} numberOfLines={3}>{item.caption}</Text>
        <View style={styles.musicRow}>
          <MaterialCommunityIcons name="music-note" size={14} color="#fff" />
          <Text style={styles.musicText}>{item.song}</Text>
        </View>
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
        
        <View style={styles.tabContainer}>
          <Pressable onPress={() => setActiveTab('Following')}>
            <Text style={[styles.tabText, activeTab === 'Following' && styles.tabTextActive]}>Following</Text>
          </Pressable>
          <View style={styles.tabDivider} />
          <Pressable onPress={() => setActiveTab('For You')}>
            <Text style={[styles.tabText, activeTab === 'For You' && styles.tabTextActive]}>For You</Text>
          </Pressable>
        </View>
        
        <Pressable style={styles.searchBtn}>
          <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={videos}
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

      <View style={styles.bottomNav}>
        <NavButton icon="home" label="Home" />
        <NavButton icon="account-balance-wallet" label="Wallet" />
        <NavButton icon="plus-circle" label="Create" primary />
        <NavButton icon="play-circle" label="Loba" active />
        <NavButton icon="person" label="Profile" />
      </View>
    </SafeAreaView>
  );
}

const ActionButton = ({ icon, count, onPress }) => (
  <Pressable style={styles.actionBtn} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={28} color="#fff" />
    {count && <Text style={styles.actionCount}>{count}</Text>}
  </Pressable>
);

const NavButton = ({ icon, label, active, primary }) => (
  <Pressable style={styles.navBtn}>
    {primary ? (
      <View style={styles.createBtn}>
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </View>
    ) : (
      <MaterialCommunityIcons 
        name={icon} 
        size={22} 
        color={active ? '#fff' : '#94a3b8'} 
      />
    )}
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
  </Pressable>
);

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
    paddingTop: 40,
    paddingBottom: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  tabDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    width,
    height: height - 80,
    backgroundColor: '#000',
  },
  videoBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  videoGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 16,
  },
  offlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  offlineText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tab: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '600',
  },
  tabActive: {
    color: '#fff',
    fontWeight: '700',
  },
  rightActions: {
    position: 'absolute',
    right: 8,
    bottom: 100,
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  followBadge: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  musicDisc: {
    marginTop: 8,
  },
  musicDiscInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#333',
    overflow: 'hidden',
  },
  musicImage: {
    width: '100%',
    height: '100%',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 80,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  caption: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  musicText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  progressBar: {
    position: 'absolute',
    bottom: 72,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#137fec',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  navBtn: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    color: '#94a3b8',
    fontSize: 10,
  },
  navLabelActive: {
    color: '#fff',
  },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
});
