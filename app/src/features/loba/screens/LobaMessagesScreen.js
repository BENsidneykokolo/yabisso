import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LobaBottomNav from '../components/LobaBottomNav';

const INITIAL_CONVERSATIONS = [
  {
    id: '1',
    name: 'Marie K.',
    lastMessage: 'Salut ! Tu es où ?',
    time: '14:32',
    avatar: null,
    unread: 2,
    online: true,
    messages: [
      { id: 'm1', text: 'Salut ! Tu es où ?', sent: false, time: '14:32' },
    ],
  },
  {
    id: '2',
    name: 'Jean P.',
    lastMessage: 'À plus tard !',
    time: '12:15',
    avatar: null,
    unread: 0,
    online: false,
    messages: [],
  },
  {
    id: '3',
    name: 'Groupe Tech Congo',
    lastMessage: 'Alex: La réunion est à 15h',
    time: '11:45',
    avatar: null,
    unread: 5,
    online: false,
    isGroup: true,
    messages: [],
  },
  {
    id: '4',
    name: 'Sarah L.',
    lastMessage: 'Merci pour l\'info !',
    time: 'Hier',
    avatar: null,
    unread: 0,
    online: true,
    messages: [],
  },
  {
    id: '5',
    name: 'Michel B.',
    lastMessage: '👍',
    time: 'Hier',
    avatar: null,
    unread: 0,
    online: false,
    messages: [],
  },
];

export default function LobaMessagesScreen({ onBack, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((acc, conv) => acc + conv.unread, 0);

  const formatConversation = (conversation) => {
    if (selectedConversation?.id === conversation.id) {
      return (
        <View style={styles.chatContainer} key={conversation.id}>
          <View style={styles.chatHeader}>
            <Pressable onPress={() => setSelectedConversation(null)} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </Pressable>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderName}>{conversation.name}</Text>
              <Text style={styles.chatHeaderStatus}>
                {conversation.online ? 'En ligne' : 'Hors ligne'}
              </Text>
            </View>
            <Pressable style={styles.callBtn}>
              <MaterialCommunityIcons name="phone" size={22} color="#2BEE79" />
            </Pressable>
          </View>

          <FlatList
            data={conversation.messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={[styles.messageBubble, item.sent ? styles.sentBubble : styles.receivedBubble]}>
                <Text style={[styles.messageText, item.sent && styles.sentMessageText]}>
                  {item.text}
                </Text>
                <Text style={[styles.messageTime, item.sent && styles.sentMessageTime]}>
                  {item.time}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <MaterialCommunityIcons name="message-text-outline" size={48} color="#1c2a38" />
                <Text style={styles.emptyChatText}>Aucun message</Text>
                <Text style={styles.emptyChatSubtext}>Envoyez un message pour commencer la conversation</Text>
              </View>
            }
          />

          <View style={styles.inputContainer}>
            <Pressable style={styles.attachBtn}>
              <MaterialCommunityIcons name="image" size={24} color="#64748b" />
            </Pressable>
            <TextInput
              style={styles.messageInput}
              placeholder="Message..."
              placeholderTextColor="#64748b"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <Pressable style={styles.sendBtn}>
              <MaterialCommunityIcons name="send" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <Pressable
        key={conversation.id}
        style={styles.conversationCard}
        onPress={() => setSelectedConversation(conversation)}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons name={conversation.isGroup ? 'account-group' : 'account'} size={24} color="#64748b" />
          </View>
          {conversation.online && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.conversationTop}>
            <Text style={styles.conversationName}>{conversation.name}</Text>
            <Text style={styles.conversationTime}>{conversation.time}</Text>
          </View>
          <View style={styles.conversationBottom}>
            <Text style={styles.lastMessage} numberOfLines={1}>{conversation.lastMessage}</Text>
            {conversation.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{conversation.unread}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerBackBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        <Pressable style={styles.editBtn}>
          <MaterialCommunityIcons name="pencil" size={22} color="#2BEE79" />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une conversation..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {totalUnread > 0 && (
        <View style={styles.unreadBanner}>
          <MaterialCommunityIcons name="bell" size={18} color="#f59e0b" />
          <Text style={styles.unreadBannerText}>
            Vous avez {totalUnread} message{totalUnread > 1 ? 's' : ''} non lu{totalUnread > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <ScrollView style={styles.conversationsList} showsVerticalScrollIndicator={false}>
        {filteredConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="message-text-outline" size={64} color="#1c2a38" />
            <Text style={styles.emptyTitle}>Aucune conversation</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Aucun résultat pour cette recherche' : 'Commencez une nouvelle conversation'}
            </Text>
          </View>
        ) : (
          filteredConversations.map(formatConversation)
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <LobaBottomNav activeTab="messages" onNavigate={(tab) => {
        if (tab === 'home') onNavigate?.('loba_home');
        else if (tab === 'create') onNavigate?.('loba_home');
        else if (tab === 'friends') onNavigate?.('loba_friends');
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
  headerBackBtn: {
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
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2632',
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
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  unreadBannerText: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '500',
  },
  conversationsList: {
    flex: 1,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#151D26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#0E151B',
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 14,
  },
  conversationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  conversationTime: {
    color: '#64748b',
    fontSize: 12,
  },
  conversationBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    color: '#64748b',
    fontSize: 14,
  },
  unreadBadge: {
    backgroundColor: '#2BEE79',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#0E151B',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatHeaderStatus: {
    color: '#22c55e',
    fontSize: 12,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  sentBubble: {
    backgroundColor: '#2BEE79',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#151D26',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  sentMessageText: {
    color: '#0E151B',
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sentMessageTime: {
    color: 'rgba(14, 21, 27, 0.6)',
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyChatText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyChatSubtext: {
    color: '#4A5568',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#151D26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#151D26',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
