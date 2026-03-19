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
  Modal,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LobaBottomNav from '../components/LobaBottomNav';

const { width } = Dimensions.get('window');

const tabs = [
  { id: 'posts', icon: 'view-grid' },
  { id: 'media', icon: 'view-agenda' },
  { id: 'saved', icon: 'bookmark-outline' },
  { id: 'tagged', icon: 'account-badge' },
];

const SUGGESTED_USERS = [
  { id: '1', name: 'Marie K.', username: '@mariek', followers: 1234 },
  { id: '2', name: 'Jean P.', username: '@jeanp', followers: 567 },
  { id: '3', name: 'Sarah L.', username: '@sarahl', followers: 2345 },
  { id: '4', name: 'Michel B.', username: '@michelb', followers: 890 },
  { id: '5', name: 'Emma R.', username: '@emmar', followers: 4567 },
  { id: '6', name: 'Alex T.', username: '@alext', followers: 2345 },
  { id: '7', name: 'Lisa M.', username: '@lisam', followers: 1234 },
  { id: '8', name: 'Kevin J.', username: '@kevinj', followers: 6789 },
];

const gridImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQhIYrsn0BgO3o2NSHOl0rqWaVVjO8DaNG_JMTJLCRg8306mCppb5GKTf1dKIMI5DQNoJvE6xmSRw5Bfif5oTg6ENE0ViWBUCXChpCJPORs11wgFaIL3GxZNCxUoANlXiohrIy6Yb9r6k89wP9DhKzkn0KKwAhcFf4c1sd07XrdKgzvSdVle8g9AG5vQRmQ39kA2vZ1v6jspFjVsy7WIy79Jp4Joc363N-kIwK7ugZIUMlmI0mQ9PO6o7HWAMLvEOEh7ii7-zv',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAQnm0J4W3ojbwB5YouVN9xJuYOe7EF_v7o6Y9hduBLIUUlf37tJocB4KK6a9f8ZY1bVqY8kDIl9MPxcjQdX0pNhB1lkJwh6h1jrs_dwbsmbo9ChpctMPudLcJyuB9UMkFt1RhR8YN6NIYV7Jh-W4tr-PvYgK5yHyrS-4RMYkB2mc21q9EcytKvrwRjRKwB_Okh6e6zKEpgD9azZFX3RUipCk38ReL_-KprzGEJ-K1hCg-BCFijTneqiZ_TQC5DCVeA1sxfjQTc',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC3n2wNiPTDjtato8BkkVdKW-HBNk4c4y1swtCxnfJ410aQWPOAhEHfduI3imdO7IdUv0AlIhFjbi7Q9D8OdWoCJaleRr8XMT7SPffJD_fim3zs9DUxh__KBomL8Q3h2m17Lshefm6lBz9WamQch0LnCSrtGAvo92Kvx2JPOtJDyYcDMbM-sYuSeDwEiIK3TqrXvHIDWPSyTZOnEQMU2pf-TS5hw8iDA48eafAVFopqA06mjOrl8w-IlHV-ug7fc-_uuyHXUAfU',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuACIttrprtvC7hWxkJ_r_-2bGP-qX5smKdQTmJqqBz8pfZPdxIoHW4QfUnNTYzIbvlE8mDzefKNDt34TVWUIjI_hhYGGkqvowgFGTvmQJN_Q0x0TLLCe4nkrte0T-SUQ8kE5F6Hf6MpMuOONGPiT3naszHr38I_0_t_sNNE9n7kHnPdxOGn98-nsielgSoDXpuzalRxCyY0FIRfTLDxzo-IVel9skKbXkYBbg3hkTx9TFC2-KRiSr6cVgfc6tLiqMVKpUXGem_f',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAeFgFbuP0z-LX2rrNxKsxsUFciYZyyq3HzuODJHR8ge5Z4nXooieW9E9nnmsSCs6xCgNwHGppe87JAAVAUwbj36KAB8UjWgdPGpk-ZYz3dpqIR40xM0ezNrTed4szkkZ5PUhcyfP9s6fglUwoEHX6wtNUTitgnXWrT3qZXgjqCKs3UJP1h-9s7oJOFQW9ZX1VKIdYQkSFXrKt6K6IQCqNgKySu53KT_Q6S0vRxqbPeAA_1ubn7m3qIYFjsz4sP89qnv7UzVmTo',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC2SjzuGzCAz8iefODvm5HB-lStpCm3TdWA2lNlCA75pIdtszPQSrwQIrTPCEFpg0xSTfu6UlwfGmy6L0Z1vzX56H8ujYbIxnb4j4n2o9zn9SIyVm_fkcNwFRlZFWM8-P1hVUmmg6pAvqyFwMEuJeWxEE-chepKvxqhN2xE7t8xzuY1zw4WzkzmkoMB2bI3qxQTbakKhyUUJUYnKHRAe-lrsfM6fqxaB-J_0b4i0ugVHMJA-tU6OsIqJ_HIuPyyKkc-m0pYxItl',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC4hxg0KRvBtN1MZ2lOh9tpZaQvLK7hFMoSDjTmGD-QJA7SD1Z1l6SMa9l6aSnwbIx5Kt7BF0IkpYeQIFGf2Qxo7FVff7jpEXkmadHrGGJSnHq4fx-gO1Pfm7C4r7rQp8G7XAMAyCVXRTr3X5j5Eu1-3nbWhZ8YGbDXkQJNWqYHOr8T2ii3TxiwTFd42WPLJMhUBwZ0ltqtS_wKVN7wmDb760_nJVhC2eLZhWuaZ9vU2UksPol1-jJxlgTQXeOxnrEGkpixfPic',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBfOWQk8zTHbGRb-z1OzjV0saxvoQwVe3c3KbYOBpFPJwjC3jlgZT7VxWCnQLreT9sCkL41xAzabRq42IGH3D5NsE2ZQ23-s-8PKChRe-SzFIKwVQVk1Kh4oAr7NDPh5ugqbmHmdK4ak7u9eSLNEZBhaYGZMwnPBLd2Gxo-7kK73fsLuJULDST41NXEYfLx5DJ0aFyFnH2Yu96V5gXN2UtVQhKpmm8jZ9_hBn713ZVzSD4XlxMOvnWuyl3UXl1N5PdieOcgC25k',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDiCVfHhbG9YjXbl22e_bK5OSff1x-RBqj2Pr0sKDqRV6gsFJ11g_1G3RVtlJg_taasO0_tKz5IXQfkxU3SNNuT7yDUWGLTZdqgxk0XDEGb14xMfAlnIbltrgsvlIiTNXF4z1KJyiTjw70Z-BkSV2LVFGGYpsbfVgE16o4m9f-bQVMlj5UJT0rl-npUNPgEw8dOIJeYSjzzBth_69ZMAdgG0a3wWGdgqPEQDrvr6KKvxbFcRdO3-opAxJ7q6eQlTmg7RV82zBTk',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDA1LZJQdG-Ao68nDihYhyMtBM7Fi_ZsB7O0LGtR9ibaQzmNBXfNYSf1bYhgC-N5YR68XYaXOOKh4KpinT43PFqN5cYF_K5r894zggbTSHe1qMMNMS5dElmUGN5MsvmtzU-lLs0FRDd7JCV24HoQ1-Qe_u-kFKu0tEfoPvnsWoi7EKVnK65jJLWN7aILa7OpbKlB0AjB-h1lxtu6CkPuoxlb_VRSEZKpwfSXS0S3N5Dk_DBwhd3pCVmsTgSRprXm38PEBKbVxN4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDTj-22Z5RTDTXJjVWSbyoXIh6kln45LOuE1Af87Ta5tC-dWFQeBx8anv57xkHHCwQdK9FBRFJ0bT7KIeZ1syqPSp6FmEmgdylH6ATBdpNs0jXjwFVmoxQbUxfACGdapT5YkQr4D3ltFYAw9iAHMan3HgNJQd59bPWTj_VCaxOYYe8TwVXNRr3oU9MLur7PIb8-tJyTbYqRZMOdRPE2E_A9O1sjdlBKiIaASwiyis7zuvFLOrAlkJj4L_cEJlFLGraWnwqbjsVn',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDk5SJ3Tc5X_VwZmdpoSrCJyibK9xnVGwAGja_ZyEg7W4plNlvww5mOQqxsTanuZCq61qg-zV-GtLo0_6bUavdbmVKVTcFI2kZe40whoyhP_SNE3LjCaAwdvEljSRhqbDyMi3j-lyGqem7rYkO1j4Fnxem9Y4YZaJKJm7_15p7GLLAUGeG_wW4Dj5Z-y6TcHhNL2AAzXS7T9zi0p40xRGg8d2WBv_zgc8NB3CB5rgJVVSA8cMl1jW_3EHpd9M-Er7uVbVhIdlOa',
];

export default function LobaProfileScreen({ onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [userFollowerCounts, setUserFollowerCounts] = useState(() => {
    const counts = {};
    SUGGESTED_USERS.forEach(user => {
      counts[user.id] = 0;
    });
    return counts;
  });
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showPostsModal, setShowPostsModal] = useState(false);

  const formatFollowers = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const toggleFollow = (userId, listType) => {
    if (listType === 'followers') {
      if (followers.includes(userId)) {
        setFollowers(prev => prev.filter(id => id !== userId));
        setUserFollowerCounts(prev => ({
          ...prev,
          [userId]: Math.max(0, (prev[userId] || 0) - 1)
        }));
      } else {
        setFollowers(prev => [...prev, userId]);
        setUserFollowerCounts(prev => ({
          ...prev,
          [userId]: (prev[userId] || 0) + 1
        }));
      }
    } else {
      if (following.includes(userId)) {
        setFollowing(prev => prev.filter(id => id !== userId));
        setUserFollowerCounts(prev => ({
          ...prev,
          [userId]: Math.max(0, (prev[userId] || 0) - 1)
        }));
      } else {
        setFollowing(prev => [...prev, userId]);
        setUserFollowerCounts(prev => ({
          ...prev,
          [userId]: (prev[userId] || 0) + 1
        }));
      }
    }
  };

  const getUserById = (id) => SUGGESTED_USERS.find(u => u.id === id);

  const renderUserItem = ({ item, listType }) => {
    const user = getUserById(item);
    if (!user) return null;
    const isFollowing = listType === 'followers' ? following.includes(item) : followers.includes(item);
    
    return (
      <View style={styles.userListItem}>
        <View style={styles.userAvatarSmall}>
          <MaterialCommunityIcons name="account" size={24} color="#64748b" />
        </View>
        <View style={styles.userListInfo}>
          <Text style={styles.userListName}>{user.name}</Text>
          <Text style={styles.userListUsername}>{user.username}</Text>
          <View style={styles.followerCountRow}>
            <MaterialCommunityIcons name="account-multiple" size={12} color="#64748b" />
            <Text style={styles.followerCountText}>
              {formatFollowers(userFollowerCounts[item] || 0)} abonné{(userFollowerCounts[item] || 0) !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <Pressable
          style={[styles.followBtnSmall, isFollowing && styles.followingBtnSmall]}
          onPress={() => toggleFollow(item, listType === 'followers' ? 'followers' : 'following')}
        >
          <Text style={[styles.followBtnSmallText, isFollowing && styles.followingBtnSmallText]}>
            {isFollowing ? 'Abonné' : 'Suivre'}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerRight}>
            <View style={styles.offlineChip}>
              <MaterialCommunityIcons name="cloud-check-outline" size={14} color="#22c55e" />
              <Text style={styles.offlineText}>En cache</Text>
            </View>
            <Pressable style={styles.iconBtn}>
              <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <MaterialCommunityIcons name="cog" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerGradient} />
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQhIYrsn0BgO3o2NSHOl0rqWaVVjO8DaNG_JMTJLCRg8306mCppb5GKTf1dKIMI5DQNoJvE6xmSRw5Bfif5oTg6ENE0ViWBUCXChpCJPORs11wgFaIL3GxZNCxUoANlXiohrIy6Yb9r6k89wP9DhKzkn0KKwAhcFf4c1sd07XrdKgzvSdVle8g9AG5vQRmQ39kA2vZ1v6jspFjVsy7WIy79Jp4Joc363N-kIwK7ugZIUMlmI0mQ9PO6o7HWAMLvEOEh7ii7-zv' }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.addBadge}>
              <MaterialCommunityIcons name="plus" size={14} color="#fff" />
            </View>
          </View>

          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>Kwame Osei</Text>
              <MaterialCommunityIcons name="check-decagram" size={20} color="#137fec" />
            </View>
            <Text style={styles.username}>@kwame_tech</Text>
            <Text style={styles.bio}>
              Building digital bridges in Accra 🇬🇭 {'\n'}
              Tech enthusiast | <Text style={styles.hashtag}>#YabissoBuilder</Text> | Coffee lover
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Pressable style={styles.editBtn}>
              <Text style={styles.editBtnText}>Modifier le profil</Text>
            </Pressable>
            <Pressable style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>Partager</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsBox}>
            <Pressable style={styles.statItem} onPress={() => setShowPostsModal(true)}>
              <Text style={styles.statNumber}>{posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statItem} onPress={() => setShowFollowersModal(true)}>
              <Text style={styles.statNumber}>{formatFollowers(followers.length)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statItem} onPress={() => setShowFollowingModal(true)}>
              <Text style={styles.statNumber}>{formatFollowers(following.length)}</Text>
              <Text style={styles.statLabel}>Abonnements</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={24}
                color={activeTab === tab.id ? '#137fec' : '#64748b'}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.grid}>
          {gridImages.slice(0, posts).map((image, index) => (
            <View key={index} style={styles.gridItem}>
              <Image source={{ uri: image }} style={styles.gridImage} />
              {index % 3 === 0 && (
                <View style={styles.videoBadge}>
                  <MaterialCommunityIcons name="play" size={16} color="#fff" />
                </View>
              )}
              {index === 1 && posts > 1 && (
                <View style={styles.carouselBadge}>
                  <MaterialCommunityIcons name="image-multiple" size={14} color="#fff" />
                </View>
              )}
            </View>
          ))}
          {posts === 0 && (
            <View style={styles.emptyGrid}>
              <MaterialCommunityIcons name="image-plus-outline" size={64} color="#1c2a38" />
              <Text style={styles.emptyGridText}>Aucun post</Text>
              <Text style={styles.emptyGridSubtext}>Appuyez sur Posts pour en ajouter</Text>
            </View>
          )}
        </View>

        <View style={styles.loadingIndicator}>
          <View style={styles.spinner} />
        </View>
      </ScrollView>

      <Modal
        visible={showFollowersModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFollowersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>Followers</Text>
                <Pressable onPress={() => setShowFollowersModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </Pressable>
              </View>
            </View>
            <FlatList
              data={followers}
              keyExtractor={item => item}
              renderItem={({ item }) => renderUserItem({ item, listType: 'followers' })}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <MaterialCommunityIcons name="account-group-outline" size={48} color="#64748b" />
                  <Text style={styles.emptyListText}>Aucun follower</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPostsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPostsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>Mes Posts</Text>
                <Pressable onPress={() => setShowPostsModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </Pressable>
              </View>
            </View>
            <View style={styles.postsModalContent}>
              <View style={styles.postCountCard}>
                <MaterialCommunityIcons name="image-multiple" size={48} color="#2BEE79" />
                <Text style={styles.postCountNumber}>{posts}</Text>
                <Text style={styles.postCountLabel}>posts publiés</Text>
              </View>
              
              <View style={styles.postActions}>
                <Pressable style={styles.postActionBtn} onPress={() => setPosts(p => p + 1)}>
                  <MaterialCommunityIcons name="plus" size={24} color="#2BEE79" />
                  <Text style={styles.postActionText}>Ajouter un post</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.postActionBtn, posts > 0 && styles.postActionBtnDanger]} 
                  onPress={() => posts > 0 && setPosts(p => p - 1)}
                >
                  <MaterialCommunityIcons name="minus" size={24} color={posts > 0 ? '#ef4444' : '#64748b'} />
                  <Text style={[styles.postActionText, posts > 0 && styles.postActionTextDanger]}>Retirer un post</Text>
                </Pressable>
              </View>
              
              <View style={styles.postHint}>
                <MaterialCommunityIcons name="information-outline" size={16} color="#64748b" />
                <Text style={styles.postHintText}>Appuyez sur + pour incrementer le nombre de posts</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFollowingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFollowingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>Abonnements</Text>
                <Pressable onPress={() => setShowFollowingModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </Pressable>
              </View>
            </View>
            <FlatList
              data={following}
              keyExtractor={item => item}
              renderItem={({ item }) => renderUserItem({ item, listType: 'following' })}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <MaterialCommunityIcons name="account-plus-outline" size={48} color="#64748b" />
                  <Text style={styles.emptyListText}>Vous ne suivez personne</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      <LobaBottomNav activeTab="profile" onNavigate={(tab) => {
        if (tab === 'home') onNavigate?.('loba_home');
        else if (tab === 'create') onNavigate?.('loba_home');
        else if (tab === 'friends') onNavigate?.('loba_friends');
        else if (tab === 'messages') onNavigate?.('loba_messages');
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    zIndex: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  offlineText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    width: '100%',
    height: 200,
    backgroundColor: '#1e293b',
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,41,59,0.8)',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -60,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarRing: {
    padding: 3,
    borderRadius: 60,
    backgroundColor: '#eab308',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: '#101922',
  },
  addBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  username: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  bio: {
    color: '#cbd5e1',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  hashtag: {
    color: '#137fec',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
    maxWidth: 320,
  },
  editBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    color: '#101922',
    fontSize: 14,
    fontWeight: 'bold',
  },
  shareBtn: {
    flex: 1,
    height: 42,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  statsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(28,38,48,0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemClickable: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#137fec',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
    paddingBottom: 150,
  },
  gridItem: {
    width: (width - 3) / 3,
    aspectRatio: 1,
    padding: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  emptyGrid: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyGridText: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyGridSubtext: {
    color: '#475569',
    fontSize: 14,
  },
  videoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  carouselBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  loadingIndicator: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#137fec',
    borderTopColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1c2a38',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    minHeight: 300,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  userListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  userAvatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1c2a38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userListInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userListName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  userListUsername: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  followerCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  followerCountText: {
    color: '#64748b',
    fontSize: 12,
  },
  followBtnSmall: {
    backgroundColor: '#2BEE79',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingBtnSmall: {
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
  },
  followBtnSmallText: {
    color: '#0E151B',
    fontSize: 13,
    fontWeight: '600',
  },
  followingBtnSmallText: {
    color: '#2BEE79',
  },
  emptyList: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 12,
  },
  emptyListText: {
    color: '#64748b',
    fontSize: 14,
  },
  postsModalContent: {
    padding: 20,
  },
  postCountCard: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.2)',
    marginBottom: 24,
  },
  postCountNumber: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 12,
  },
  postCountLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  postActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  postActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
  },
  postActionBtnDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  postActionText: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: '600',
  },
  postActionTextDanger: {
    color: '#ef4444',
  },
  postHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  postHintText: {
    color: '#64748b',
    fontSize: 13,
  },
});
