import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const mockConversations = [
  { id: '1', name: 'Kwame A.', lastMessage: 'Ok je te rappelle demain', time: '09:41', unread: 2, online: true },
  { id: '2', name: 'Ama K.', lastMessage: 'Le colis est parti 📦', time: 'Hier', unread: 0, online: false },
  { id: '3', name: 'Kofi M.', lastMessage: 'Merci pour la commande!', time: 'Lun.', unread: 0, online: true },
  { id: '4', name: 'Grupo Marché', lastMessage: 'Livraison à 15h', time: 'Mar.', unread: 5, online: false },
  { id: '5', name: 'Support Yabisso', lastMessage: 'Votre ticket #1204 a été résolu', time: 'Mar.', unread: 0, online: true },
];

export default function ChatHomeScreen({ onBack, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        <Pressable style={styles.headerAction}>
          <MaterialCommunityIcons name="pencil-plus-outline" size={22} color="#2BEE79" />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une conversation..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filtered.map((conv) => (
          <Pressable
            key={conv.id}
            style={({ pressed }) => [styles.convRow, pressed && styles.convRowPressed]}
            onPress={() => onNavigate?.('chat_conversation', { conversation: conv })}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{conv.name[0]}</Text>
              </View>
              {conv.online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.convInfo}>
              <View style={styles.convTopRow}>
                <Text style={styles.convName}>{conv.name}</Text>
                <Text style={styles.convTime}>{conv.time}</Text>
              </View>
              <View style={styles.convBottomRow}>
                <Text style={styles.convPreview} numberOfLines={1}>{conv.lastMessage}</Text>
                {conv.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{conv.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(30,40,50,0.9)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  headerAction: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#151D26',
    marginHorizontal: 20, marginVertical: 12,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { flex: 1, color: '#F8FAFC', marginLeft: 8, fontSize: 14 },
  scrollContent: { paddingBottom: 40 },
  convRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  convRowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  avatarContainer: { position: 'relative', marginRight: 14 },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#1C2733',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#2BEE79', borderWidth: 2, borderColor: '#0E151B',
  },
  convInfo: { flex: 1 },
  convTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  convTime: { color: '#64748B', fontSize: 12 },
  convBottomRow: { flexDirection: 'row', alignItems: 'center' },
  convPreview: { color: '#94A3B8', fontSize: 13, flex: 1 },
  unreadBadge: {
    backgroundColor: '#2BEE79',
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 8,
  },
  unreadText: { color: '#0E151B', fontSize: 11, fontWeight: '700' },
});
