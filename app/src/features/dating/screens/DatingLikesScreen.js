import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MOCK_LIKES = [
  {
    id: '1',
    name: 'Amara',
    age: 24,
    bio: 'Tech enthusiast, love Jollof rice',
    photos: ['https://lh3.googleusercontent.com/aida-public/AB6AXuChHtnEfmDk48vPhp9ZSbw5y_dNX4Cp3lvcjl1hne-L477stPYhzDFFzrmAof9KSlvlds52rSRtikFAeptFTJazjgGPB6qUkPwq8Uw2QRlybdecuh1Rnh86fmcwhF7QEv_aGPPSvuPXTR_h2lueHcN9vw70G4zcRG06K5sVlUfOm1nQjha8Gj5nnGvtUXu6Csw8CPrUpFUnU68T5IHUuS8Y2P27ua6PPZLZFY2vlUyTwvwCvoDhIc_g8ad7HFYfTKrlZLjGr7Y6'],
    isSuperLike: true,
    time: 'Il y a 2h',
  },
  {
    id: '2',
    name: 'Kofi',
    age: 27,
    bio: 'Software Engineer, love music',
    photos: ['https://lh3.googleusercontent.com/aida-public/AB6AXuB-TBRU0_mExufLGR8WbjZwT73D8huo0YWP6SYqPjZAk5FoKCxcY2A8t0Nap7Xp5YH8oIXXqivTyiUp0PMkOlhAEpLNzEn0wSat0_KocNJoRBP8UO_UbVnKynniyFPcQNV2oJHIzC3kn5U1zQP6gZu6OG7M7sASSxX6b31KMbWHX_7sg8nEv5ylgixyLt8yJXS2mOeeIMPBqzlvi8Yqg69YPD1ZAUT0urSSgkC817TvSwR6BG_s0oM6IKgJ-A5Nmf9K9Smd8Uvd'],
    isSuperLike: false,
    time: 'Il y a 5h',
  },
  {
    id: '3',
    name: 'Nneka',
    age: 23,
    bio: 'Content Creator, adventure seeker',
    photos: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDPs-a2lSM_bmNLNs1GkXRzOsSShLYwv_rSzvZ0vFkTZAC35XyDj_29VltZJ1ki-g5kR08ShBo0wAYd1_SBpqR-NbTCcjwfxTR1y2ffn7FwboHugN7JgcDIanSbRlZ43uL81mGHqHonrY1D85VV3D4PtZBH8kQmrPd_od1JQL8Dby0EiiyRwUpolz3ch6BV0z9kOK4jh7mC5Ka3CNlMw4iBGxyPUB6qeLDVis7qzYzApjaA63kBYEemlMf70N-C6fsqRjJZ4E68'],
    isSuperLike: true,
    time: 'Hier',
  },
  {
    id: '4',
    name: 'Tunde',
    age: 26,
    bio: 'Financial Analyst, football fan',
    photos: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAGUIGCFh4WwJs-zcZagu4DefthTyTr2-oikHgtM3FLsrK4k4WYUIW3b_2GS2oRMPlrv8eKGDXxfztn8o5q7BQclsPNTf-frOgXE6uVDhPJGectXH72Pixv8LHhenb_HjsDFlTAWVA2T0rc2HB-BNRci5_XU2Qc_g06Yyvqs6hoV4uxd6bXODQCANYc3oorUQLGKnZLoYlYEm8QGzI1ygstqinDLD15aIbmIFIc6Vd2DlsNLK2cbVUZiRf0C9BADopfMkgkEuYf'],
    isSuperLike: false,
    time: 'Il y a 3 jours',
  },
];

function DatingLikesScreen({ navigation, onBack, onNavigate }) {
  const [likes] = useState(MOCK_LIKES);

  const renderLike = ({ item }) => (
    <TouchableOpacity
      style={styles.likeCard}
      onPress={() => onNavigate && onNavigate('DatingProfile', { profile: item })}
    >
      <View style={styles.likeImageContainer}>
        <Image source={{ uri: item.photos[0] }} style={styles.likeImage} />
        {item.isSuperLike && (
          <View style={styles.superLikeBadge}>
            <MaterialCommunityIcons name="star" size={12} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.likeInfo}>
        <View style={styles.likeNameRow}>
          <Text style={styles.likeName}>{item.name}, {item.age}</Text>
          {item.isSuperLike && (
            <MaterialCommunityIcons name="star" size={16} color="#facc15" />
          )}
        </View>
        <Text style={styles.likeBio} numberOfLines={1}>{item.bio}</Text>
        <Text style={styles.likeTime}>{item.time}</Text>
      </View>
      <View style={styles.likeActions}>
        <TouchableOpacity style={styles.likeActionButton}>
          <MaterialCommunityIcons name="close" size={20} color="#ef4444" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.likeActionButton, styles.likeActionButtonPrimary]}
          onPress={() => onNavigate && onNavigate('DatingChat', { profile: item })}
        >
          <MaterialCommunityIcons name="heart" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>J'aime</Text>
        <View style={styles.headerButton} />
      </View>

      <FlatList
        data={likes}
        renderItem={renderLike}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="heart-off" size={64} color="#374151" />
            <Text style={styles.emptyTitle}>Aucun like</Text>
            <Text style={styles.emptySubtitle}>Les personnes qui vous ont liked apparaîtront ici</Text>
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
    gap: 12,
  },
  likeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2936',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  likeImageContainer: {
    position: 'relative',
  },
  likeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  superLikeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#137fec',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  likeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  likeBio: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  likeTime: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  likeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  likeActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeActionButtonPrimary: {
    backgroundColor: '#2BEE79',
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

export default DatingLikesScreen;