import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LobaBottomNav from '../components/LobaBottomNav';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';
import { Modal, Alert } from 'react-native';

const SUGGESTED_USERS = [
  { id: '1', name: 'Marie K.', username: '@mariek', avatar: null, mutualFriends: 12, followers: 1234 },
  { id: '2', name: 'Jean P.', username: '@jeanp', avatar: null, mutualFriends: 8, followers: 567 },
  { id: '3', name: 'Sarah L.', username: '@sarahl', avatar: null, mutualFriends: 5, followers: 2345 },
  { id: '4', name: 'Michel B.', username: '@michelb', avatar: null, mutualFriends: 3, followers: 890 },
  { id: '5', name: 'Emma R.', username: '@emmar', avatar: null, mutualFriends: 15, followers: 4567 },
];

const FOLLOWING = [
  { id: '6', name: 'Alex T.', username: '@alext', avatar: null, isOnline: true, followers: 2345 },
  { id: '7', name: 'Lisa M.', username: '@lisam', avatar: null, isOnline: false, followers: 1234 },
  { id: '8', name: 'Kevin J.', username: '@kevinj', avatar: null, isOnline: true, followers: 6789 },
];

const FOLLOWERS = [
  { id: '9', name: 'Nina S.', username: '@ninas', avatar: null, isOnline: false, followers: 456 },
  { id: '10', name: 'Paul D.', username: '@pauld', avatar: null, isOnline: true, followers: 2345 },
];

const ALL_USERS = [...SUGGESTED_USERS, ...FOLLOWING, ...FOLLOWERS];

const defaultFollowerCounts = () => {
  const counts = {};
  ALL_USERS.forEach(user => {
    counts[user.id] = 0;
  });
  return counts;
};

export default function LobaFriendsScreen({ onBack, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('suggestions');
  const [following, setFollowing] = useState([]);
  const [realFriends, setRealFriends] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFriendData, setNewFriendData] = useState({ name: '', phone: '', username: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadFriendsData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveFriendsData();
    }
  }, [following, followers, userFollowerCounts, isLoaded]);

  const loadFriendsData = async () => {
    try {
      const friends = await database.get('loba_friends').query().fetch();
      setRealFriends(friends);
      
      const savedFollowing = await SecureStore.getItemAsync('loba_friends_following');
      if (savedFollowing) setFollowing(JSON.parse(savedFollowing));
      
      setIsLoaded(true);
    } catch (error) {
      console.log('Error loading friends data:', error);
      setIsLoaded(true);
    }
  };

  const handleAddFriend = async () => {
    const { name, phone, username } = newFriendData;
    if (!name || !phone || !username) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      await database.write(async () => {
        await database.get('loba_friends').create(friend => {
          friend.friendId = `user_${Date.now()}`;
          friend.name = name;
          friend.phone = phone;
          friend.username = username.startsWith('@') ? username : `@${username}`;
          friend.status = 'offline';
          friend.lastSeen = Date.now();
        });
      });
      
      setShowAddModal(false);
      setNewFriendData({ name: '', phone: '', username: '' });
      loadFriendsData();
      Alert.alert('Succès', 'Ami ajouté avec succès !');
    } catch (error) {
      console.log('Error adding friend:', error);
      Alert.alert('Erreur', "Impossible de l'ajouter pour le moment");
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

  const toggleFollow = (userId, type) => {
    if (type === 'following') {
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
    } else {
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
    }
  };

  const filteredUsers = SUGGESTED_USERS.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserAvatar = (user, size = 48) => (
    <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <MaterialCommunityIcons name="account" size={size * 0.6} color="#64748b" />
    </View>
  );

  const AddFriendModal = () => (
    <Modal visible={showAddModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ajouter un ami</Text>
          <Text style={styles.modalSubtitle}>Entrez les informations de votre ami pour le trouver.</Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="Nom complet"
            placeholderTextColor="#64748b"
            value={newFriendData.name}
            onChangeText={(text) => setNewFriendData({...newFriendData, name: text})}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Numéro de téléphone"
            placeholderTextColor="#64748b"
            value={newFriendData.phone}
            onChangeText={(text) => setNewFriendData({...newFriendData, phone: text})}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Nom d'utilisateur"
            placeholderTextColor="#64748b"
            value={newFriendData.username}
            onChangeText={(text) => setNewFriendData({...newFriendData, username: text})}
            autoCapitalize="none"
          />

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={handleAddFriend}>
              <Text style={styles.confirmBtnText}>Ajouter</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderUserCard = (user, showFollowers = false) => (
    <View key={user.id} style={styles.userCard}>
      {renderUserAvatar(user)}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userUsername}>{user.username}</Text>
        {showFollowers && user.mutualFriends && (
          <Text style={styles.mutualText}>{user.mutualFriends} amis communs</Text>
        )}
        <View style={styles.followerRow}>
          <MaterialCommunityIcons name="account-multiple" size={14} color="#64748b" />
          <Text style={styles.followerText}>
            {formatFollowers(userFollowerCounts[user.id] || 0)} abonné{(userFollowerCounts[user.id] || 0) !== 1 ? 's' : ''}
          </Text>
        </View>
        {user.isOnline !== undefined && (
          <View style={styles.onlineIndicator}>
            <View style={[styles.statusDot, { backgroundColor: user.isOnline ? '#22c55e' : '#64748b' }]} />
            <Text style={styles.statusText}>{user.isOnline ? 'En ligne' : 'Hors ligne'}</Text>
          </View>
        )}
      </View>
      <Pressable
        style={[styles.followBtn, following.includes(user.id) && styles.followingBtn]}
        onPress={() => toggleFollow(user.id, 'following')}
      >
        <Text style={[styles.followBtnText, following.includes(user.id) && styles.followingBtnText]}>
          {following.includes(user.id) ? 'Abonné' : 'Suivre'}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Amis</Text>
        <Pressable style={styles.addBtn}>
          <MaterialCommunityIcons name="account-plus" size={24} color="#2BEE79" />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des amis..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#64748b" />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'suggestions' && styles.tabActive]}
          onPress={() => setActiveTab('suggestions')}
        >
          <Text style={[styles.tabText, activeTab === 'suggestions' && styles.tabTextActive]}>
            Suggestions
          </Text>
          {activeTab === 'suggestions' && <View style={styles.tabIndicator} />}
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'following' && styles.tabActive]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
            Abonnements ({following.length})
          </Text>
          {activeTab === 'following' && <View style={styles.tabIndicator} />}
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'followers' && styles.tabActive]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[styles.tabText, activeTab === 'followers' && styles.tabTextActive]}>
            Abonnés ({followers.length})
          </Text>
          {activeTab === 'followers' && <View style={styles.tabIndicator} />}
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'suggestions' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggestions pour vous</Text>
            {filteredUsers.map(user => renderUserCard(user, true))}
          </View>
        )}

        {activeTab === 'following' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Abonnements ({following.length})</Text>
            {following.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-group" size={64} color="#1c2a38" />
                <Text style={styles.emptyText}>Vous ne suivez personne</Text>
                <Text style={styles.emptySubtext}>Explorez les suggestions pour trouver des amis</Text>
              </View>
            ) : (
              [...FOLLOWING, ...SUGGESTED_USERS].filter(u => following.includes(u.id)).map(user => (
                <View key={user.id} style={styles.userCard}>
                  {renderUserAvatar(user)}
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userUsername}>{user.username}</Text>
                    <View style={styles.followerRow}>
                      <MaterialCommunityIcons name="account-multiple" size={14} color="#64748b" />
                      <Text style={styles.followerText}>
                        {formatFollowers(userFollowerCounts[user.id] || 0)} abonné{(userFollowerCounts[user.id] || 0) !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View style={styles.onlineIndicator}>
                      <View style={[styles.statusDot, { backgroundColor: user.isOnline ? '#22c55e' : '#64748b' }]} />
                      <Text style={styles.statusText}>{user.isOnline ? 'En ligne' : 'Hors ligne'}</Text>
                    </View>
                  </View>
                  <Pressable
                    style={[styles.followBtn, styles.followingBtn]}
                    onPress={() => toggleFollow(user.id, 'following')}
                  >
                    <Text style={[styles.followBtnText, styles.followingBtnText]}>Abonné</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'followers' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Abonnés ({followers.length})</Text>
            {isLoaded && activeTab === 'followers' && FOLLOWERS.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-group-outline" size={64} color="#1e293b" />
                <Text style={styles.emptyText}>Aucun abonné pour le moment</Text>
                <Text style={styles.emptySubtext}>Partagez votre profil pour gagner des abonnés !</Text>
              </View>
            )}
            {followers.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-group-outline" size={64} color="#1c2a38" />
                <Text style={styles.emptyText}>Aucun abonné</Text>
                <Text style={styles.emptySubtext}>Partagez votre profil pour attirer des abonnés</Text>
              </View>
            ) : (
              [...FOLLOWERS, ...SUGGESTED_USERS].filter(u => followers.includes(u.id)).map(user => (
                <View key={user.id} style={styles.userCard}>
                  {renderUserAvatar(user)}
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userUsername}>{user.username}</Text>
                    <View style={styles.followerRow}>
                      <MaterialCommunityIcons name="account-multiple" size={14} color="#64748b" />
                      <Text style={styles.followerText}>
                        {formatFollowers(userFollowerCounts[user.id] || 0)} abonné{(userFollowerCounts[user.id] || 0) !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View style={styles.onlineIndicator}>
                      <View style={[styles.statusDot, { backgroundColor: user.isOnline ? '#22c55e' : '#64748b' }]} />
                      <Text style={styles.statusText}>{user.isOnline ? 'En ligne' : 'Hors ligne'}</Text>
                    </View>
                  </View>
                  <Pressable
                    style={[styles.followBtn, followers.includes(user.id) && styles.followingBtn]}
                    onPress={() => toggleFollow(user.id, 'followers')}
                  >
                    <Text style={[styles.followBtnText, followers.includes(user.id) && styles.followingBtnText]}>
                      {followers.includes(user.id) ? 'Abonné' : 'Suivre'}
                    </Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <LobaBottomNav activeTab="friends" onNavigate={(tab) => {
        if (tab === 'home') onNavigate?.('loba_home');
        else if (tab === 'create') onNavigate?.('loba_record');
        else if (tab === 'messages') onNavigate?.('loba_messages');
        else if (tab === 'profile') onNavigate?.('loba_profile');
      }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151D26',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#151D26',
    position: 'relative',
  },
  tabActive: {
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
  },
  tabText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#2BEE79',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 3,
    backgroundColor: '#2BEE79',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151D26',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatarPlaceholder: {
    backgroundColor: '#1c2a38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userUsername: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 4,
  },
  mutualText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  followerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  followerText: {
    color: '#64748b',
    fontSize: 12,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  followBtn: {
    backgroundColor: '#2BEE79',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followBtnText: {
    color: '#0E151B',
    fontSize: 13,
    fontWeight: '600',
  },
  followingBtn: {
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
  },
  followingBtnText: {
    color: '#2BEE79',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
