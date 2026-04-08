import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MOCK_MESSAGES = [
  {
    id: '1',
    senderId: 'other',
    content: "Hey! I saw you like hiking too? That photo on your profile is amazing! 🏔️",
    time: '09:41',
    type: 'text',
  },
  {
    id: '2',
    senderId: 'me',
    content: "Yes! I go up to the mountains every weekend. It's my favorite way to disconnect.",
    time: '09:42',
    type: 'text',
    read: true,
  },
  {
    id: '3',
    senderId: 'other',
    content: '',
    time: '09:43',
    type: 'voice',
    duration: 45,
    transcription: "Tap to Transcribe",
  },
];

function DatingChatScreen({ navigation, route, onBack, onNavigate }) {
  const profile = route?.params?.profile || {
    id: '1',
    name: 'Amara',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7luEDDgmTNo91fZWSKp-l5jClESLpWnb9DN21Ix8LexGFKq6qDN8dPoF_lEt6_UBh0a1B6t-e-VR_K1V7ZW0st9UCZYjoypFx0K6ALjSCL6xgfNo_C_9bhabzWwr-ahuBFmkwn21OchDmgqrt5GVMu5JirzQBNu0IutQizw9xjm6JpASB1RSP2uCFIA8ej4cqj5sP9Orpn5QngVDRvqeuKyufsFGUlN5Wkq71K4vDV9jG_sApsTfzVvss-C-EyDgF-Wrcf0uR',
    isOnline: true,
  };

  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollViewRef = useRef(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      content: inputText,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      read: false,
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === 'me';
    
    if (item.type === 'voice') {
      return (
        <View style={[styles.messageContainer, !isMe && styles.messageContainerOther]}>
          {!isMe && (
            <Image source={{ uri: profile.avatar }} style={styles.avatarSmall} />
          )}
          <View style={[styles.messageBubble, !isMe && styles.messageBubbleOther]}>
            <View style={styles.voiceMessage}>
              <TouchableOpacity
                style={styles.voicePlayButton}
                onPress={() => setIsPlaying(!isPlaying)}
              >
                <MaterialCommunityIcons
                  name={isPlaying ? "pause" : "play-arrow"}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
              <View style={styles.voiceWaveform}>
                {[...Array(15)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveformBar,
                      { height: Math.random() * 20 + 8 },
                      isPlaying && styles.waveformBarActive,
                    ]}
                  />
                ))}
              </View>
            </View>
            <View style={styles.voiceDurationRow}>
              <Text style={styles.voiceDuration}>0:15</Text>
              <Text style={styles.voiceDuration}>0:45</Text>
            </View>
            {item.transcription && (
              <TouchableOpacity style={styles.transcriptionButton}>
                <MaterialCommunityIcons name="transcribe" size={14} color="#137fec" />
                <Text style={styles.transcriptionText}>{item.transcription}</Text>
              </TouchableOpacity>
            )}
          </View>
          {!isMe && <Text style={styles.messageTime}>{item.time}</Text>}
        </View>
      );
    }
    
    return (
      <View style={[styles.messageContainer, isMe && styles.messageContainerMe]}>
        <View style={[styles.messageBubble, isMe && styles.messageBubbleMe]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {item.content}
          </Text>
        </View>
        <View style={styles.messageMeta}>
          <Text style={styles.messageTime}>{item.time}</Text>
          {isMe && item.read && (
            <MaterialCommunityIcons name="done-all" size={14} color="#137fec" />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            {profile.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          <View>
            <Text style={styles.headerName}>{profile.name}</Text>
            <Text style={styles.headerStatus}>
              {profile.isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.dateDivider}>
        <Text style={styles.dateDividerText}>Aujourd'hui</Text>
      </View>

      <FlatList
        ref={scrollViewRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <MaterialCommunityIcons name="plus-circle" size={28} color="#6b7280" />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Dire quelque chose..."
              placeholderTextColor="#6b7280"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.micButton}>
              <MaterialCommunityIcons 
                name="mic" 
                size={20} 
                color={inputText ? "#137fec" : "#6b7280"} 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <MaterialCommunityIcons name="send" size={20} color="#101922" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: '#101922',
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
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#101922',
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 12,
    color: '#137fec',
  },
  dateDivider: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dateDividerText: {
    backgroundColor: '#1e2936',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    color: '#9ca3af',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageContainerMe: {
    justifyContent: 'flex-end',
  },
  messageContainerOther: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  messageBubbleMe: {
    backgroundColor: '#137fec',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#233648',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 20,
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 200,
  },
  voicePlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
  },
  waveformBar: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    minHeight: 8,
  },
  waveformBarActive: {
    backgroundColor: '#2BEE79',
  },
  voiceDurationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  voiceDuration: {
    fontSize: 10,
    color: '#9ca3af',
  },
  transcriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  transcriptionText: {
    fontSize: 12,
    color: '#137fec',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: '#101922',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  attachButton: {
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1e2936',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  micButton: {
    padding: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
});

export default DatingChatScreen;