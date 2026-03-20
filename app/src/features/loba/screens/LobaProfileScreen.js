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
  Modal,
  FlatList,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LobaBottomNav from '../components/LobaBottomNav';

const { width } = Dimensions.get('window');

const tabs = [
  { id: 'posts', icon: 'view-grid' },
  { id: 'media', icon: 'view-agenda' },
  { id: 'saved', icon: 'bookmark-outline', activeIcon: 'bookmark' },
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
  const [savedVideos, setSavedVideos] = useState([]);
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Kwame Osei',
    username: '@kwame_tech',
    bio: "Building digital bridges in Accra 🇬🇭 \nTech enthusiast | #YabissoBuilder | Coffee lover",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQhIYrsn0BgO3o2NSHOl0rqWaVVjO8DaNG_JMTJLCRg8306mCppb5GKTf1dKIMI5DQNoJvE6xmSRw5Bfif5oTg6ENE0ViWBUCXChpCJPORs11wgFaIL3GxZNCxUoANlXiohrIy6Yb9r6k89wP9DhKzkn0KKwAhcFf4c1sd07XrdKgzvSdVle8g9AG5vQRmQ39kA2vZ1v6jspFjVsy7WIy79Jp4Joc363N-kIwK7ugZIUMlmI0mQ9PO6o7HWAMLvEOEh7ii7-zv',
    avatarUri: null,
  });
  const [editForm, setEditForm] = useState({
    name: 'Kwame Osei',
    username: '@kwame_tech',
    bio: "Building digital bridges in Accra 🇬🇭 \nTech enthusiast | #YabissoBuilder | Coffee lover",
  });

  const defaultProfile = {
    name: 'Kwame Osei',
    username: '@kwame_tech',
    bio: "Building digital bridges in Accra 🇬🇭 \nTech enthusiast | #YabissoBuilder | Coffee lover",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQhIYrsn0BgO3o2NSHOl0rqWaVVjO8DaNG_JMTJLCRg8306mCppb5GKTf1dKIMI5DQNoJvE6xmSRw5Bfif5oTg6ENE0ViWBUCXChpCJPORs11wgFaIL3GxZNCxUoANlXiohrIy6Yb9r6k89wP9DhKzkn0KKwAhcFf4c1sd07XrdKgzvSdVle8g9AG5vQRmQ39kA2vZ1v6jspFjVsy7WIy79Jp4Joc363N-kIwK7ugZIUMlmI0mQ9PO6o7HWAMLvEOEh7ii7-zv',
    avatarUri: null,
  };

  const defaultFollowerCounts = () => {
    const counts = {};
    SUGGESTED_USERS.forEach(user => {
      counts[user.id] = 0;
    });
    return counts;
  };

  useEffect(() => {
    loadUserData();
    loadSavedVideos();
  }, []);

  useEffect(() => {
    loadSavedVideos();
  }, [activeTab]);

  const loadSavedVideos = async () => {
    try {
      const savedVideosData = await SecureStore.getItemAsync('loba_saved_videos');
      if (savedVideosData) {
        const savedIds = JSON.parse(savedVideosData);
        const saved = savedIds.map(id => ({
          id,
          thumbnail: `https://lh3.googleusercontent.com/aida-public/AB6AXuDQhIYrsn0BgO3o2NSHOl0rqWaVVjO8DaNG_JMTJLCRg8306mCppb5GKTf1dKIMI5DQNoJvE6xmSRw5Bfif5oTg6ENE0ViWBUCXChpCJPORs11wgFaIL3GxZNCxUoANlXiohrIy6Yb9r6k89wP9DhKzkn0KKwAhcFf4c1sd07XrdKgzvSdVle8g9AG5vQRmQ39kA2vZ1v6jspFjVsy7WIy79Jp4Joc363N-kIwK7ugZIUMlmI0mQ9PO6o7HWAMLvEOEh7ii7-zv`,
        }));
        setSavedVideos(saved);
      }
    } catch (error) {
      console.log('Error loading saved videos:', error);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      saveUserData();
    }
  }, [profile, posts, followers, following, userFollowerCounts, isLoaded]);

  const loadUserData = async () => {
    try {
      const savedProfile = await SecureStore.getItemAsync('loba_profile');
      const savedPosts = await SecureStore.getItemAsync('loba_posts');
      const savedFollowers = await SecureStore.getItemAsync('loba_followers');
      const savedFollowing = await SecureStore.getItemAsync('loba_following');
      const savedFollowerCounts = await SecureStore.getItemAsync('loba_follower_counts');

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setEditForm({
          name: parsedProfile.name,
          username: parsedProfile.username,
          bio: parsedProfile.bio,
        });
      }

      if (savedPosts) setPosts(JSON.parse(savedPosts));
      if (savedFollowers) setFollowers(JSON.parse(savedFollowers));
      if (savedFollowing) setFollowing(JSON.parse(savedFollowing));
      if (savedFollowerCounts) setUserFollowerCounts(JSON.parse(savedFollowerCounts));
      
      setIsLoaded(true);
    } catch (error) {
      console.log('Error loading user data:', error);
      setIsLoaded(true);
    }
  };

  const saveUserData = async () => {
    try {
      await SecureStore.setItemAsync('loba_profile', JSON.stringify(profile));
      await SecureStore.setItemAsync('loba_posts', JSON.stringify(posts));
      await SecureStore.setItemAsync('loba_followers', JSON.stringify(followers));
      await SecureStore.setItemAsync('loba_following', JSON.stringify(following));
      await SecureStore.setItemAsync('loba_follower_counts', JSON.stringify(userFollowerCounts));
    } catch (error) {
      console.log('Error saving user data:', error);
    }
  };

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

  const openEditModal = () => {
    setEditForm({
      name: profile.name,
      username: profile.username,
      bio: profile.bio,
    });
    setShowEditModal(true);
  };

  const saveProfile = () => {
    const updatedProfile = {
      ...profile,
      name: editForm.name,
      username: editForm.username,
      bio: editForm.bio,
    };
    setProfile(updatedProfile);
    setShowEditModal(false);
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l\'accès à la galerie photo pour changer votre photo de profil.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfile({
          ...profile,
          avatarUri: result.assets[0].uri,
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger l\'image');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l\'accès à la caméra pour prendre une photo.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfile({
          ...profile,
          avatarUri: result.assets[0].uri,
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  const shareProfile = async () => {
    try {
      const shareUrl = `https://yabisso.app/${profile.username}`;
      const shareMessage = `Découvrez le profil de ${profile.name} sur Yabisso!\n${profile.bio}\n\n${shareUrl}`;
      
      const { Share } = require('react-native');
      await Share.share({
        message: shareMessage,
        title: `Profil ${profile.name}`,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le profil');
    }
  };

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
            <Pressable style={styles.iconBtn} onPress={() => setShowShareModal(true)}>
              <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => onNavigate?.('loba_settings')}>
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
                source={{ uri: profile.avatarUri || profile.avatar }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.addBadge}>
              <MaterialCommunityIcons name="plus" size={14} color="#fff" />
            </View>
          </View>

          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.name}</Text>
              <MaterialCommunityIcons name="check-decagram" size={20} color="#137fec" />
            </View>
            <Text style={styles.username}>{profile.username}</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>

          <View style={styles.actionButtons}>
            <Pressable style={styles.editBtn} onPress={openEditModal}>
              <Text style={styles.editBtnText}>Modifier le profil</Text>
            </Pressable>
            <Pressable style={styles.shareBtn} onPress={() => setShowShareModal(true)}>
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
                name={activeTab === tab.id && tab.activeIcon ? tab.activeIcon : tab.icon}
                size={24}
                color={activeTab === tab.id ? '#137fec' : '#64748b'}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.grid}>
          {activeTab === 'posts' && gridImages.slice(0, posts).map((image, index) => (
            <View key={`post-${index}`} style={styles.gridItem}>
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
          {activeTab === 'posts' && posts === 0 && (
            <View style={styles.emptyGrid}>
              <MaterialCommunityIcons name="image-plus-outline" size={64} color="#1c2a38" />
              <Text style={styles.emptyGridText}>Aucun post</Text>
              <Text style={styles.emptyGridSubtext}>Appuyez sur Posts pour en ajouter</Text>
            </View>
          )}
          {activeTab === 'saved' && savedVideos.length > 0 && savedVideos.map((video, index) => (
            <View key={`saved-${video.id}`} style={styles.gridItem}>
              <Image source={{ uri: video.thumbnail }} style={styles.gridImage} />
              <View style={styles.savedBadge}>
                <MaterialCommunityIcons name="bookmark" size={16} color="#fbbf24" />
              </View>
            </View>
          ))}
          {activeTab === 'saved' && savedVideos.length === 0 && (
            <View style={styles.emptyGrid}>
              <MaterialCommunityIcons name="bookmark-outline" size={64} color="#1c2a38" />
              <Text style={styles.emptyGridText}>Aucun enregistrement</Text>
              <Text style={styles.emptyGridSubtext}>Les vidéos que vous enregistrez apparaîtront ici</Text>
            </View>
          )}
          {activeTab === 'media' && gridImages.slice(0, posts).map((image, index) => (
            <View key={`media-${index}`} style={styles.gridItem}>
              <Image source={{ uri: image }} style={styles.gridImage} />
            </View>
          ))}
          {activeTab === 'tagged' && (
            <View style={styles.emptyGrid}>
              <MaterialCommunityIcons name="account-badge-outline" size={64} color="#1c2a38" />
              <Text style={styles.emptyGridText}>Aucune publication taguée</Text>
              <Text style={styles.emptyGridSubtext}>Les posts où vous êtes tagué apparaîtront ici</Text>
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
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '90%' }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>Modifier le profil</Text>
                  <Pressable onPress={() => setShowEditModal(false)}>
                    <MaterialCommunityIcons name="close" size={24} color="#fff" />
                  </Pressable>
                </View>
              </View>
              <ScrollView 
                style={styles.editForm}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.editAvatarSection}>
                  <Pressable onPress={() => setShowPhotoOptions(true)}>
                    <View style={styles.editAvatarRing}>
                      <Image 
                        source={{ uri: profile.avatarUri || profile.avatar }} 
                        style={styles.editAvatar} 
                      />
                      <View style={styles.editAvatarOverlay}>
                        <MaterialCommunityIcons name="camera" size={24} color="#fff" />
                      </View>
                    </View>
                  </Pressable>
                  <Pressable style={styles.changePhotoBtn} onPress={() => setShowPhotoOptions(true)}>
                    <Text style={styles.changePhotoText}>Changer photo</Text>
                  </Pressable>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nom</Text>
                  <View style={styles.formInputWrapper}>
                    <MaterialCommunityIcons name="account" size={20} color="#64748b" />
                    <TextInput
                      style={styles.formInput}
                      value={editForm.name}
                      onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                      placeholder="Votre nom"
                      placeholderTextColor="#64748b"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nom d'utilisateur</Text>
                  <View style={styles.formInputWrapper}>
                    <MaterialCommunityIcons name="at" size={20} color="#64748b" />
                    <TextInput
                      style={styles.formInput}
                      value={editForm.username}
                      onChangeText={(text) => setEditForm({ ...editForm, username: text })}
                      placeholder="@votre_username"
                      placeholderTextColor="#64748b"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Bio</Text>
                  <View style={[styles.formInputWrapper, styles.bioInputWrapper]}>
                    <MaterialCommunityIcons name="text" size={20} color="#64748b" style={{ alignSelf: 'flex-start', marginTop: 12 }} />
                    <TextInput
                      style={[styles.formInput, styles.bioInput]}
                      value={editForm.bio}
                      onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
                      placeholder="Parlez-nous de vous..."
                      placeholderTextColor="#64748b"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <Pressable style={styles.saveBtn} onPress={saveProfile}>
                  <Text style={styles.saveBtnText}>Enregistrer</Text>
                </Pressable>
                
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showPhotoOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoOptions(false)}
      >
        <Pressable 
          style={styles.photoOptionsOverlay}
          onPress={() => setShowPhotoOptions(false)}
        >
          <View style={styles.photoOptionsContent}>
            <Text style={styles.photoOptionsTitle}>Changer la photo</Text>
            
            <Pressable style={styles.photoOption} onPress={() => { takePhoto(); setShowPhotoOptions(false); }}>
              <View style={[styles.photoOptionIcon, { backgroundColor: '#137fec20' }]}>
                <MaterialCommunityIcons name="camera" size={24} color="#137fec" />
              </View>
              <View style={styles.photoOptionText}>
                <Text style={styles.photoOptionLabel}>Prendre une photo</Text>
                <Text style={styles.photoOptionDesc}>Utiliser la caméra</Text>
              </View>
            </Pressable>

            <Pressable style={styles.photoOption} onPress={() => { pickImage(); setShowPhotoOptions(false); }}>
              <View style={[styles.photoOptionIcon, { backgroundColor: '#2BEE7920' }]}>
                <MaterialCommunityIcons name="image" size={24} color="#2BEE79" />
              </View>
              <View style={styles.photoOptionText}>
                <Text style={styles.photoOptionLabel}>Choisir dans la galerie</Text>
                <Text style={styles.photoOptionDesc}>Sélectionner une photo existante</Text>
              </View>
            </Pressable>

            {profile.avatarUri && (
              <Pressable style={styles.photoOption} onPress={() => { 
                setProfile({ ...profile, avatarUri: null }); 
                setShowPhotoOptions(false); 
              }}>
                <View style={[styles.photoOptionIcon, { backgroundColor: '#ef444420' }]}>
                  <MaterialCommunityIcons name="delete" size={24} color="#ef4444" />
                </View>
                <View style={styles.photoOptionText}>
                  <Text style={[styles.photoOptionLabel, { color: '#ef4444' }]}>Supprimer la photo</Text>
                  <Text style={styles.photoOptionDesc}>Revenir à la photo par défaut</Text>
                </View>
              </Pressable>
            )}

            <Pressable style={styles.photoOptionsCancel} onPress={() => setShowPhotoOptions(false)}>
              <Text style={styles.photoOptionsCancelText}>Annuler</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showShareModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>Partager le profil</Text>
                <Pressable onPress={() => setShowShareModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </Pressable>
              </View>
            </View>
            <View style={styles.shareContent}>
              <View style={styles.shareProfileCard}>
                <View style={styles.shareAvatarRing}>
                  <Image source={{ uri: profile.avatar }} style={styles.shareAvatar} />
                </View>
                <Text style={styles.shareName}>{profile.name}</Text>
                <Text style={styles.shareUsername}>{profile.username}</Text>
              </View>

              <View style={styles.shareOptions}>
                <Pressable style={styles.shareOption} onPress={shareProfile}>
                  <View style={[styles.shareIconCircle, { backgroundColor: '#25D36620' }]}>
                    <MaterialCommunityIcons name="whatsapp" size={28} color="#25D366" />
                  </View>
                  <Text style={styles.shareOptionText}>WhatsApp</Text>
                </Pressable>

                <Pressable style={styles.shareOption} onPress={shareProfile}>
                  <View style={[styles.shareIconCircle, { backgroundColor: '#1877F220' }]}>
                    <MaterialCommunityIcons name="facebook" size={28} color="#1877F2" />
                  </View>
                  <Text style={styles.shareOptionText}>Facebook</Text>
                </Pressable>

                <Pressable style={styles.shareOption} onPress={shareProfile}>
                  <View style={[styles.shareIconCircle, { backgroundColor: '#E4405F20' }]}>
                    <MaterialCommunityIcons name="instagram" size={28} color="#E4405F" />
                  </View>
                  <Text style={styles.shareOptionText}>Instagram</Text>
                </Pressable>

                <Pressable style={styles.shareOption} onPress={shareProfile}>
                  <View style={[styles.shareIconCircle, { backgroundColor: '#1DA1F220' }]}>
                    <MaterialCommunityIcons name="twitter" size={28} color="#1DA1F2" />
                  </View>
                  <Text style={styles.shareOptionText}>Twitter</Text>
                </Pressable>

                <Pressable style={styles.shareOption} onPress={shareProfile}>
                  <View style={[styles.shareIconCircle, { backgroundColor: '#0A66C220' }]}>
                    <MaterialCommunityIcons name="linkedin" size={28} color="#0A66C2" />
                  </View>
                  <Text style={styles.shareOptionText}>LinkedIn</Text>
                </Pressable>

                <Pressable style={styles.shareOption} onPress={shareProfile}>
                  <View style={[styles.shareIconCircle, { backgroundColor: '#4B556320' }]}>
                    <MaterialCommunityIcons name="link-variant" size={28} color="#4B5563" />
                  </View>
                  <Text style={styles.shareOptionText}>Copier le lien</Text>
                </Pressable>
              </View>

              <Pressable style={styles.shareDirectBtn} onPress={shareProfile}>
                <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
                <Text style={styles.shareDirectBtnText}>Partager directement</Text>
              </Pressable>
            </View>
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
  savedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
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
  keyboardAvoid: {
    flex: 1,
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
  editForm: {
    padding: 20,
  },
  editAvatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  editAvatarRing: {
    padding: 3,
    borderRadius: 60,
    backgroundColor: '#eab308',
  },
  editAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#1c2a38',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: 8,
  },
  changePhotoText: {
    color: '#137fec',
    fontSize: 14,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151D26',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  formInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  bioInputWrapper: {
    alignItems: 'flex-start',
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 0,
  },
  saveBtn: {
    backgroundColor: '#137fec',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareContent: {
    padding: 20,
  },
  shareProfileCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.2)',
    marginBottom: 24,
  },
  shareAvatarRing: {
    padding: 3,
    borderRadius: 50,
    backgroundColor: '#eab308',
    marginBottom: 12,
  },
  shareAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#1c2a38',
  },
  shareName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shareUsername: {
    color: '#94a3b8',
    fontSize: 14,
  },
  shareOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
    marginBottom: 24,
  },
  shareOption: {
    alignItems: 'center',
    gap: 8,
    width: 80,
  },
  shareIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareOptionText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
  },
  shareDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2BEE79',
    height: 50,
    borderRadius: 25,
  },
  shareDirectBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoOptionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  photoOptionsContent: {
    backgroundColor: '#1c2a38',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  photoOptionsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 16,
  },
  photoOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOptionText: {
    flex: 1,
  },
  photoOptionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  photoOptionDesc: {
    color: '#64748b',
    fontSize: 13,
  },
  photoOptionsCancel: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  photoOptionsCancelText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  editAvatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
