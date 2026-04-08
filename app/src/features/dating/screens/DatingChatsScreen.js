import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MOCK_CHATS = [
  {
    id: '1',
    name: 'Amara',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7luEDDgmTNo91fZWSKp-l5jClESLpWnb9DN21Ix8LexGFKq6qDN8dPoF_lEt6_UBh0a1B6t-e-VR_K1V7ZW0st9UCZYjoypFx0K6ALjSCL6xgfNo_C_9bhabzWwr-ahuBFmkwn21OchDmgqrt5GVMu5JirzQBNu0IutQizw9xjm6JpASB1RSP2uCFIA8ej4cqj5sP9Orpn5QngVDRvqeuKyufsFGUlN5Wkq71K4vDV9jG_sApsTfzVvss-C-EyDgF-Wrcf0uR',
    lastMessage: "Yes! I go up to the mountains every weekend...",
    time: '09:42',
    isOnline: true,
    unreadCount: 2,
  },
  {
    id: '2',
    name: 'Kofi',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-TBRU0_mExufLGR8WbjZwT73D8huo0YWP6SYqPjZAk5FoKCxcY2A8t0Nap7Xp5YH8oIXXqivTyiUp0PMkOlhAEpLNzEn0wSat0_KocNJoRBP8UO_UbVnKynniyFPcQNV2oJHIzC3kn5U1zQP6gZu6OG7M7sASSxX6b31KMbWHX_7sg8nEv5ylgixyLt8yJXS2mOeeIMPBqzlvi8Yqg69YPD1ZAUT0urSSgkC817TvSwR6BG_s0oM6IKgJ-A5Nmf9K9Smd8Uvd',
    lastMessage: 'Hey! Wanna grab coffee this weekend?',
    time: 'Hier',
    isOnline: false,
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Nneka',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPs-a2lSM_bmNLNs1GkXRzOsSShLYwv_rSzvZ0vFkTZAC35XyDj_29VltZJ1ki-g5kR08ShBo0wAYd1_SBpqR-NbTCcjwfxTR1y2ffn7FwboHugN7JgcDIanSbRlZ43uL81mGHqHonrY1D85VV3D4PtZBH8kQmrPd_od1JQL8Dby0EiiyRwUpolz3ch6BV0z9kOK4jh7mC5Ka3CNlMw4iBGxyPUB6qeLDVis7qzYzApjaA63kBYEemlMf70N-C6fsqRjJZ4E68',
    lastMessage: "That sounds amazing! Let's do it 🎉",
    time: 'Mardi',
    isOnline: true,
    unreadCount: 0,
  },
];

function DatingChatsScreen({ navigation, onBack, onNavigate }) {
  const [chats] = useState(MOCK_CHATS);

  const renderChat = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => onNavigate && onNavigate('DatingChat', { profile: item })}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <View style={styles.chatPreview}>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussions</Text>
        <View style={styles.headerButton} />
      </View>

      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="chat-outline" size={64} color="#374151" />
            <Text style={styles.emptyTitle}>Aucune discussion</Text>
            <Text style={styles.emptySubtitle}>
              Les matchs apparaîtront ici
            </Text>
          </View>
        }
      />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    padding: 16,
    gap: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#1c2936',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#1c2936',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  chatTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
    color: '#9ca3af',
  },
  unreadBadge: {
    backgroundColor: '#2BEE79',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#101922',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DatingChatsScreen;