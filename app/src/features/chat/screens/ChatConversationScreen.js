import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const mockMessages = [
  { id: '1', from: 'them', text: 'Salut! Comment ça va?', time: '09:30' },
  { id: '2', from: 'me', text: 'Ça va bien merci! Et toi?', time: '09:32' },
  { id: '3', from: 'them', text: 'Super! La commande est prête.', time: '09:35' },
  { id: '4', from: 'me', text: 'Ok parfait, je viendrai la chercher vers 15h.', time: '09:37' },
  { id: '5', from: 'them', text: 'Ok je te rappelle demain', time: '09:41' },
];

export default function ChatConversationScreen({ onBack, conversation }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg = {
      id: String(messages.length + 1),
      from: 'me',
      text: message.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMsg]);
    setMessage('');
  };

  const convName = conversation?.name || 'Conversation';

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{convName[0]}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{convName}</Text>
            {conversation?.online && (
              <Text style={styles.headerStatus}>En ligne</Text>
            )}
          </View>
        </View>
        <Pressable style={styles.headerAction}>
          <MaterialCommunityIcons name="phone-outline" size={22} color="#2BEE79" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.bubble, msg.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}
            >
              <Text style={[styles.bubbleText, msg.from === 'me' && styles.bubbleTextMe]}>
                {msg.text}
              </Text>
              <Text style={[styles.bubbleTime, msg.from === 'me' && styles.bubbleTimeMe]}>
                {msg.time}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <Pressable style={styles.attachButton}>
            <MaterialCommunityIcons name="attachment" size={22} color="#64748B" />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Écrire un message..."
            placeholderTextColor="#64748B"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <Pressable
            style={[styles.sendButton, message.trim() && styles.sendButtonActive]}
            onPress={sendMessage}
          >
            <Ionicons
              name="send"
              size={18}
              color={message.trim() ? '#0E151B' : '#64748B'}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(30,40,50,0.9)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1C2733',
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { color: '#F8FAFC', fontWeight: '700' },
  headerName: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  headerStatus: { color: '#2BEE79', fontSize: 11, marginTop: 2 },
  headerAction: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  messagesContent: { padding: 16, gap: 8 },
  bubble: {
    maxWidth: '75%', padding: 12, borderRadius: 18,
    marginBottom: 4,
  },
  bubbleThem: {
    backgroundColor: '#151D26',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  bubbleMe: {
    backgroundColor: '#2BEE79',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleText: { color: '#E2E8F0', fontSize: 14, lineHeight: 20 },
  bubbleTextMe: { color: '#0E151B' },
  bubbleTime: { color: '#64748B', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  bubbleTimeMe: { color: 'rgba(14,21,27,0.6)' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  attachButton: { paddingVertical: 8 },
  input: {
    flex: 1,
    backgroundColor: '#151D26',
    borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
    color: '#F8FAFC', fontSize: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: 100,
  },
  sendButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1C2733',
    alignItems: 'center', justifyContent: 'center',
  },
  sendButtonActive: { backgroundColor: '#2BEE79' },
});
