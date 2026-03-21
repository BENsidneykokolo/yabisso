import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ImageBackground,
  StatusBar,
  Dimensions,
  PanResponder,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import LobaBottomNav from '../components/LobaBottomNav';
import * as ImagePicker from 'expo-image-picker';
import { Audio, Video } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import { database } from '../../../lib/db';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';

function LobaMessagesScreen({ onBack, onNavigate, friends = [] }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState({ name: 'Moi', username: '@moi' });
  const [isCalling, setIsCalling] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('front');
  const [activeEmojis, setActiveEmojis] = useState([]);
  const [permission, requestPermission] = useCameraPermissions();
  const [connectivity, setConnectivity] = useState({ type: 'offline', label: 'Hors ligne', icon: 'cloud-off-outline' });
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [playingAudioUri, setPlayingAudioUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerContent, setViewerContent] = useState(null);
  const [tempMedia, setTempMedia] = useState(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [photoOverlays, setPhotoOverlays] = useState([]);
  const [showTextModal, setShowTextModal] = useState(false);
  const [activeText, setActiveText] = useState('');
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoRotation, setPhotoRotation] = useState(0);
  const [photoOffsetX, setPhotoOffsetX] = useState(0);
  const [photoOffsetY, setPhotoOffsetY] = useState(0);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  const [photoPaths, setPhotoPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeColor, setActiveColor] = useState('#fff');
  const cameraRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadUserProfile();

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      updateConnectivity(state);
    });

    return () => unsubscribe();
  }, []);

  const updateConnectivity = (state) => {
    if (state.isConnected) {
      setConnectivity({ type: 'online', label: 'En ligne', icon: 'wifi' });
    } else {
      // Simulate Mesh/Direct discovery if no internet
      simulateMeshDiscovery();
    }
  };

  const simulateMeshDiscovery = () => {
    // In a real app, this would check Bluetooth Mesh or WiFi Direct native modules
    const rand = Math.random();
    if (rand > 0.6) {
      setConnectivity({ type: 'mesh', label: 'Mesh Bluetooth', icon: 'bluetooth-connect' });
    } else if (rand > 0.3) {
      setConnectivity({ type: 'direct', label: 'WiFi Direct', icon: 'wifi-direct' });
    } else {
      setConnectivity({ type: 'offline', label: 'Hors ligne', icon: 'cloud-off-outline' });
    }
  };

  useEffect(() => {
    if (activeEmojis.length > 0) {
      const timer = setTimeout(() => {
        setActiveEmojis(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeEmojis]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isDrawingMode || isCropMode,
      onMoveShouldSetPanResponder: () => isDrawingMode || isCropMode,
      onPanResponderGrant: (evt) => {
        if (isDrawingMode) {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath(`M${locationX},${locationY}`);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (isDrawingMode) {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
        } else if (isCropMode) {
          setPhotoOffsetX(prev => prev + gestureState.dx / 10);
          setPhotoOffsetY(prev => prev + gestureState.dy / 10);
        }
      },
      onPanResponderRelease: () => {
        if (isDrawingMode && currentPath) {
          setPhotoPaths((prev) => [...prev, { d: currentPath, color: activeColor }]);
          setCurrentPath('');
        }
      },
    })
  ).current;

  const createOverlayPanResponder = (id) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !isDrawingMode && !isCropMode,
      onMoveShouldSetPanResponder: () => !isDrawingMode && !isCropMode,
      onPanResponderMove: (evt, gestureState) => {
        setPhotoOverlays(prev => prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              xPercent: item.xPercent + (gestureState.dx / Dimensions.get('window').width) * 100,
              yPercent: item.yPercent + (gestureState.dy / Dimensions.get('window').height) * 100,
            };
          }
          return item;
        }));
      },
    });
  };

  const addEmoji = (emoji) => {
    const id = Date.now();
    const x = Math.random() * (Dimensions.get('window').width - 40);
    setActiveEmojis(prev => [...prev.slice(-10), { id, emoji, x }]);
  };

  const loadUserProfile = async () => {
    try {
      const savedProfile = await SecureStore.getItemAsync('loba_profile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const saved = await SecureStore.getItemAsync('loba_conversations');
      if (saved) {
        setConversations(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading conversations:', error);
    }
  };

  const saveConversations = async (newConversations) => {
    try {
      await SecureStore.setItemAsync('loba_conversations', JSON.stringify(newConversations));
    } catch (error) {
      console.log('Error saving conversations:', error);
    }
  };

  const getTimeString = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getDateString = () => {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageText = newMessage.trim();
    const timeString = getTimeString();
    const dateString = getDateString();

    const newMsg = {
      id: `msg_${Date.now()}`,
      text: messageText,
      sent: true,
      time: timeString,
      date: dateString,
      type: 'text',
    };

    saveMessageToConv(newMsg);
    setNewMessage('');
  };

  const saveMessageToConv = (newMsg) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMsg.text || 'Média',
          time: newMsg.time,
          date: newMsg.date,
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    setSelectedConversation(updatedConversations.find(c => c.id === selectedConversation.id));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setTempMedia({ uri: result.assets[0].uri, type: result.assets[0].type === 'video' ? 'video' : 'image' });
      setShowPhotoPreview(true);
      setShowAttachmentMenu(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await requestPermission();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour utiliser la caméra');
      return;
    }
    setShowCamera(true);
    setShowAttachmentMenu(false);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: true,
        });
        setTempMedia({ uri: photo.uri, type: 'image' });
        setShowCamera(false);
        setShowPhotoPreview(true);
      } catch (e) {
        console.error('Failed to capture photo', e);
      }
    }
  };

  const handleSendMedia = () => {
    if (!tempMedia) return;
    sendMediaMessage(
      tempMedia.uri, 
      tempMedia.type, 
      mediaCaption || (tempMedia.type === 'video' ? 'Vidéo' : 'Photo'),
      photoOverlays,
      photoZoom,
      photoPaths,
      photoRotation,
      photoOffsetX,
      photoOffsetY
    );
    setTempMedia(null);
    setMediaCaption('');
    setPhotoOverlays([]);
    setPhotoPaths([]);
    setPhotoZoom(1);
    setPhotoRotation(0);
    setPhotoOffsetX(0);
    setPhotoOffsetY(0);
    setIsDrawingMode(false);
    setIsCropMode(false);
    setShowPhotoPreview(false);
  };

  const addTextOverlay = () => {
    if (activeText.trim()) {
      setPhotoOverlays([...photoOverlays, { 
        id: `text_${Date.now()}_${Math.random()}`,
        type: 'text', 
        content: activeText, 
        xPercent: 35 + Math.random() * 10,
        yPercent: 35 + Math.random() * 10, 
        color: activeColor,
        size: 32 
      }]);
      setActiveText('');
      setShowTextModal(false);
    }
  };

  const addSticker = (emoji) => {
    setPhotoOverlays([...photoOverlays, { 
      id: Date.now(),
      type: 'sticker', 
      content: emoji, 
      xPercent: 50, 
      yPercent: 50, 
      size: 80 
    }]);
    setShowEmojiPicker(false);
  };

  const toggleCrop = () => {
    setIsCropMode(!isCropMode);
    setIsDrawingMode(false);
    setShowEmojiPicker(false);
  };

  const rotatePhoto = () => {
    setPhotoRotation(prev => (prev + 90) % 360);
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      sendMediaMessage(result.assets[0].uri, 'document', result.assets[0].name);
    }
  };

  const sendMediaMessage = (uri, type, fileName = '', overlays = [], zoom = 1, paths = [], rotation = 0, offsetX = 0, offsetY = 0) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      uri,
      type,
      fileName,
      overlays,
      zoom,
      paths,
      rotation,
      offsetX,
      offsetY,
      sent: true,
      time: getTimeString(),
      date: getDateString(),
    };
    saveMessageToConv(newMsg);
    setShowAttachmentMenu(false);
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    sendMediaMessage(uri, 'audio');
    setRecording(null);
  };

  const shareLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    let location = await Location.getCurrentPositionAsync({});
    const uri = `https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`;
    sendMediaMessage(uri, 'location');
  };

  const pickContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
      });
      if (data.length > 0) {
        sendMediaMessage('', 'contact', data[0].name);
      }
    }
  };

  const playAudio = async (uri) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      if (playingAudioUri === uri) {
        setPlayingAudioUri(null);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setPlayingAudioUri(uri);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingAudioUri(null);
        }
      });
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };

  const openViewer = (item) => {
    setViewerContent(item);
    setShowViewer(true);
  };

  const startConversation = async (friend) => {
    const existingConv = conversations.find(c => c.friendId === friend.id);
    
    if (existingConv) {
      setSelectedConversation(existingConv);
      setShowNewChatModal(false);
      setSearchQuery('');
      return;
    }

    const newConv = {
      id: `conv_${Date.now()}`,
      friendId: friend.id,
      name: friend.name,
      username: friend.username,
      phone: friend.phone || '',
      messages: [],
      lastMessage: '',
      time: '',
      date: '',
      unread: 0,
      online: Math.random() > 0.5,
      createdAt: new Date().toISOString(),
    };

    const updatedConversations = [newConv, ...conversations];
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    setSelectedConversation(newConv);
    setShowNewChatModal(false);
    setSearchQuery('');
  };

  const filteredFriends = (friends || []).filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((acc, conv) => acc + conv.unread, 0);

  const renderConversationItem = ({ item }) => (
    <Pressable
      style={styles.conversationCard}
      onPress={() => setSelectedConversation(item)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <MaterialCommunityIcons name="account" size={24} color="#64748b" />
        </View>
        <View style={[
          styles.onlineDot, 
          connectivity.type === 'offline' && { backgroundColor: '#64748b' }
        ]} />
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationTop}>
          <Text style={styles.conversationName}>{item.name}</Text>
          <View style={styles.connectivityRow}>
            {connectivity.type !== 'offline' && (
              <MaterialCommunityIcons name={connectivity.icon} size={10} color="#22c55e" />
            )}
            <Text style={styles.conversationTime}>{item.time || ''}</Text>
          </View>
        </View>
        <View style={styles.conversationBottom}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'Pas encore de messages'}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  const renderMessageBubble = ({ item }) => {
    const isImage = item.type === 'image';
    const isVideo = item.type === 'video';
    const isAudio = item.type === 'audio';
    const isDoc = item.type === 'document';
    const isLoc = item.type === 'location';
    const isContact = item.type === 'contact';
    const isPoll = item.type === 'poll';
    const isEvent = item.type === 'event';

    return (
      <View style={[
        styles.messageBubble, 
        item.sent ? styles.sentBubble : styles.receivedBubble,
        (isImage || isVideo) && styles.mediaBubble
      ]}>
        {item.text && (
          <Text style={[styles.messageText, item.sent && styles.sentMessageText]}>
            {item.text}
          </Text>
        )}

        {(isImage || isVideo) && (
          <Pressable 
            style={styles.bubbleMediaContainer}
            onPress={() => openViewer(item)}
          >
            <View style={{ overflow: 'hidden', borderRadius: 12 }}>
              <ImageBackground 
                source={{ uri: item.uri }} 
                style={[styles.bubbleImage, { transform: [{ scale: item.zoom || 1 }, { rotate: `${item.rotation || 0}deg` }, { translateX: (item.offsetX || 0) / 4.5 }, { translateY: (item.offsetY || 0) / 4.5 }] }]} 
                imageStyle={{ borderRadius: 12 }}
              >
                {item.overlays?.map(overlay => (
                  <View key={overlay.id} style={[styles.overlayItem, { top: `${overlay.yPercent}%`, left: `${overlay.xPercent}%` }]}>
                    <Text style={[
                      styles.overlayText, 
                      { fontSize: overlay.size / 4.5 },
                      overlay.type === 'text' && { color: overlay.color }
                    ]}>
                      {overlay.content}
                    </Text>
                  </View>
                ))}
                {item.paths && (
                  <Svg style={StyleSheet.absoluteFill}>
                    {item.paths.map((path, index) => (
                      <Path key={index} d={path.d} stroke={path.color} strokeWidth={2} fill="none" scale={1/4.5} />
                    ))}
                  </Svg>
                )}
                {isVideo && (
                  <View style={styles.playIconOverlay}>
                    <MaterialCommunityIcons name="play-circle" size={48} color="#fff" />
                  </View>
                )}
              </ImageBackground>
            </View>
          </Pressable>
        )}

        {isAudio && (
          <Pressable 
            style={styles.audioBubbleContainer}
            onPress={() => playAudio(item.uri)}
          >
            <MaterialCommunityIcons 
              name={playingAudioUri === item.uri ? "pause" : "play"} 
              size={24} 
              color={item.sent ? "#fff" : "#1c2a38"} 
            />
            <View style={styles.audioWaveformMock}>
              {playingAudioUri === item.uri && <View style={styles.audioProgressMock} />}
            </View>
            <Text style={[styles.audioDuration, item.sent && { color: '#fff' }]}>0:12</Text>
          </Pressable>
        )}

        {isDoc && (
          <Pressable style={styles.docBubbleContainer} onPress={() => Linking.openURL(item.uri)}>
            <MaterialCommunityIcons name="file-document-outline" size={32} color={item.sent ? "#fff" : "#137FEC"} />
            <View style={styles.docInfo}>
              <Text style={[styles.docName, item.sent && { color: '#fff' }]} numberOfLines={1}>
                {item.fileName || 'Document.pdf'}
              </Text>
              <Text style={[styles.docSize, item.sent && { color: 'rgba(255,255,255,0.7)' }]}>1.2 MB</Text>
            </View>
          </Pressable>
        )}

        {isLoc && (
          <Pressable style={styles.locBubbleContainer} onPress={() => Linking.openURL(item.uri)}>
            <View style={styles.locMapMock}>
              <MaterialCommunityIcons name="map-marker" size={32} color="#EF4444" />
            </View>
            <View style={styles.locFooter}>
              <Text style={[styles.locTitle, item.sent && { color: '#fff' }]}>Ma localisation</Text>
              <Text style={[styles.locSub, item.sent && { color: 'rgba(255,255,255,0.7)' }]}>Partagée en direct</Text>
            </View>
          </Pressable>
        )}

        {isContact && (
          <View style={styles.contactBubbleContainer}>
            <View style={styles.contactAvatarMock}>
              <MaterialCommunityIcons name="account" size={24} color="#64748b" />
            </View>
            <Text style={[styles.contactName, item.sent && { color: '#fff' }]}>{item.fileName}</Text>
          </View>
        )}

        {isPoll && (
          <View style={styles.pollBubbleContainer}>
            <Text style={[styles.pollTitle, item.sent && { color: '#fff' }]}>📊 {item.fileName}</Text>
            <View style={styles.pollOption}>
              <View style={styles.pollBar} />
              <Text style={[styles.pollOptionText, item.sent && { color: '#fff' }]}>Option A</Text>
            </View>
            <View style={styles.pollOption}>
              <View style={[styles.pollBar, { width: '40%' }]} />
              <Text style={[styles.pollOptionText, item.sent && { color: '#fff' }]}>Option B</Text>
            </View>
          </View>
        )}

        {isEvent && (
          <View style={styles.eventBubbleContainer}>
            <View style={styles.eventDateBox}>
              <Text style={styles.eventMonth}>MAR</Text>
              <Text style={styles.eventDay}>25</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={[styles.eventTitle, item.sent && { color: '#fff' }]}>{item.fileName}</Text>
              <Text style={[styles.eventSub, item.sent && { color: 'rgba(255,255,255,0.7)' }]}>18:00 • Paris</Text>
            </View>
          </View>
        )}

        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, item.sent && styles.sentMessageTime]}>
            {item.time}
          </Text>
          {item.sent && (
            <MaterialCommunityIcons
              name="check-all"
              size={14}
              color={item.sent ? "#2BEE79" : "rgba(14, 21, 27, 0.6)"}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    );
  };

  const ChatView = () => (
    <View style={styles.chatContainer}>
      <View style={styles.chatHeader}>
        <Pressable onPress={() => setSelectedConversation(null)} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>{selectedConversation.name}</Text>
          <View style={styles.connectivityRow}>
            <MaterialCommunityIcons 
              name={connectivity.icon} 
              size={12} 
              color={connectivity.type === 'offline' ? '#64748b' : '#22c55e'} 
            />
            <Text style={[
              styles.chatHeaderStatus, 
              connectivity.type === 'offline' && { color: '#64748b' }
            ]}>
              {connectivity.label}
            </Text>
          </View>
        </View>
        <View style={styles.chatHeaderActions}>
          <Pressable 
            style={styles.callBtn}
            onPress={() => setIsCalling(true)}
          >
            <MaterialCommunityIcons name="phone" size={22} color="#2BEE79" />
          </Pressable>
          <Pressable 
            style={[styles.callBtn, { marginLeft: 12 }]}
            onPress={() => {
              setIsCalling(true);
              setIsVideoCall(true);
            }}
          >
            <MaterialCommunityIcons name="video" size={22} color="#137FEC" />
          </Pressable>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={selectedConversation.messages}
        keyExtractor={item => item.id}
        renderItem={renderMessageBubble}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <MaterialCommunityIcons name="message-text-outline" size={48} color="#1c2a38" />
            <Text style={styles.emptyChatText}>Pas encore de messages</Text>
            <Text style={styles.emptyChatSubtext}>
              Envoyez un message pour commencer la conversation avec {selectedConversation.name}
            </Text>
          </View>
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {showAttachmentMenu && (
        <View style={styles.attachmentMenu}>
          <View style={styles.attachmentRow}>
            <AttachmentItem icon="camera" label="Caméra" color="#EF4444" onPress={takePhoto} />
            <AttachmentItem icon="image" label="Galerie" color="#137FEC" onPress={pickImage} />
            <AttachmentItem icon="microphone" label="Audio" color="#22C55E" onPress={startRecording} />
            <AttachmentItem icon="file-document" label="Document" color="#8B5CF6" onPress={pickDocument} />
          </View>
          <View style={styles.attachmentRow}>
            <AttachmentItem icon="map-marker" label="Lieu" color="#F97316" onPress={shareLocation} />
            <AttachmentItem icon="account" label="Contact" color="#10B981" onPress={pickContact} />
            <AttachmentItem icon="chart-bar" label="Sondage" color="#06B6D4" onPress={() => sendMediaMessage('', 'poll', 'Nouveau sondage')} />
            <AttachmentItem icon="calendar" label="Événement" color="#EC4899" onPress={() => sendMediaMessage('', 'event', 'Nouvel événement')} />
          </View>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Pressable 
          style={styles.attachBtn}
          onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
        >
          <MaterialCommunityIcons name={showAttachmentMenu ? "close" : "plus"} size={26} color="#64748b" />
        </Pressable>
        
        {isRecording ? (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Enregistrement...</Text>
            <Pressable onPress={stopRecording} style={styles.stopRecordingBtn}>
              <MaterialCommunityIcons name="stop" size={24} color="#EF4444" />
            </Pressable>
          </View>
        ) : (
          <TextInput
            style={styles.messageInput}
            placeholder="Message..."
            placeholderTextColor="#64748b"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
        )}

        <Pressable 
          style={[styles.sendBtn, !newMessage.trim() && !isRecording && styles.sendBtnDisabled]}
          onPress={isRecording ? stopRecording : sendMessage}
          disabled={!newMessage.trim() && !isRecording}
        >
          <MaterialCommunityIcons name={isRecording ? "check" : "send"} size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );

  const AttachmentItem = ({ icon, label, color, onPress }) => (
    <Pressable style={styles.attachmentItem} onPress={onPress}>
      <View style={[styles.attachmentIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#fff" />
      </View>
      <Text style={styles.attachmentLabel}>{label}</Text>
    </Pressable>
  );

  const FullscreenViewer = () => (
    <Modal visible={showViewer} transparent animationType="fade">
      <View style={styles.viewerOverlay}>
        <Pressable style={styles.viewerClose} onPress={() => setShowViewer(false)}>
          <MaterialCommunityIcons name="close" size={32} color="#fff" />
        </Pressable>
        
        {viewerContent?.type === 'image' && (
          <View style={styles.viewerMainContainer}>
            <ImageBackground 
              source={{ uri: viewerContent.uri }} 
              style={[styles.viewerMain, { transform: [{ scale: viewerContent.zoom || 1 }, { rotate: `${viewerContent.rotation || 0}deg` }, { translateX: viewerContent.offsetX || 0 }, { translateY: viewerContent.offsetY || 0 }] }]} 
              resizeMode="contain" 
            >
              {viewerContent.overlays?.map(overlay => (
                <View key={overlay.id} style={[styles.overlayItem, { top: `${overlay.yPercent}%`, left: `${overlay.xPercent}%` }]}>
                  <Text style={[
                    styles.overlayText, 
                    { fontSize: overlay.size },
                    overlay.type === 'text' && { color: overlay.color }
                  ]}>
                    {overlay.content}
                  </Text>
                </View>
              ))}
              {viewerContent.paths && (
                <Svg style={StyleSheet.absoluteFill}>
                  {viewerContent.paths.map((path, index) => (
                    <Path key={index} d={path.d} stroke={path.color} strokeWidth={5} fill="none" />
                  ))}
                </Svg>
              )}
            </ImageBackground>
          </View>
        )}
        
        {viewerContent?.type === 'video' && (
          <Video
            source={{ uri: viewerContent.uri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="contain"
            shouldPlay
            useNativeControls
            style={styles.viewerMain}
          />
        )}
      </View>
    </Modal>
  );

  const PhotoPreviewModal = () => (
    <Modal visible={showPhotoPreview} transparent animationType="slide">
      <SafeAreaView style={styles.previewContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.previewHeader}>
          <Pressable onPress={() => {
            setShowPhotoPreview(false);
            setTempMedia(null);
            setMediaCaption('');
            setPhotoOverlays([]);
            setPhotoZoom(1);
          }} style={styles.previewClose}>
            <MaterialCommunityIcons name="close" size={28} color="#fff" />
          </Pressable>
          <View style={styles.previewHeaderActions}>
            <MaterialCommunityIcons name="information-outline" size={24} color="rgba(255,255,255,0.5)" />
          </View>
        </View>

        <View style={styles.previewMain}>
          {tempMedia?.type === 'video' ? (
            <Video
              source={{ uri: tempMedia.uri }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              shouldPlay
              isLooping
              style={styles.previewImage}
            />
          ) : (
            <View style={styles.previewImageContainer}>
              <ImageBackground 
                source={{ uri: tempMedia?.uri }} 
                style={[styles.previewImage, { transform: [{ scale: photoZoom }, { rotate: `${photoRotation}deg` }, { translateX: photoOffsetX }, { translateY: photoOffsetY }] }]} 
                resizeMode="contain" 
              >
                {photoOverlays.map(item => (
                  <View 
                    key={item.id} 
                    {...createOverlayPanResponder(item.id).panHandlers}
                    style={[styles.overlayItem, { top: `${item.yPercent}%`, left: `${item.xPercent}%` }]}
                  >
                    <Text style={[
                      styles.overlayText, 
                      item.type === 'text' ? { fontSize: item.size, color: item.color } : { fontSize: item.size }
                    ]}>
                      {item.content}
                    </Text>
                  </View>
                ))}
                <Svg style={StyleSheet.absoluteFill}>
                  {photoPaths.map((path, index) => (
                    <Path key={index} d={path.d} stroke={path.color} strokeWidth={5} fill="none" />
                  ))}
                  {currentPath && (
                    <Path d={currentPath} stroke={activeColor} strokeWidth={5} fill="none" />
                  )}
                </Svg>
                <View 
                  style={StyleSheet.absoluteFill} 
                  pointerEvents={isDrawingMode || isCropMode ? 'auto' : 'none'}
                  {...(isDrawingMode || isCropMode ? panResponder.panHandlers : {})} 
                />
              </ImageBackground>
            </View>
          )}
        </View>

        {showEmojiPicker && (
          <View style={styles.emojiPickerContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['✅', '❌', '🔥', '😂', '😎', '❤️', '👏', '👍', '🙏', '🎉', '😡', '🤔', '💯', '✨', '🌍'].map(emoji => (
                <Pressable key={emoji} onPress={() => addSticker(emoji)} style={styles.emojiPickerItem}>
                  <Text style={styles.emojiPickerText}>{emoji}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {isDrawingMode && (
          <View style={styles.colorPickerContainer}>
            {['#fff', '#000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#EC4899'].map(color => (
              <Pressable 
                key={color} 
                onPress={() => setActiveColor(color)} 
                style={[styles.colorItem, { backgroundColor: color }, activeColor === color && styles.colorItemActive]} 
              />
            ))}
            <Pressable onPress={() => setPhotoPaths([])} style={styles.clearImgBtn}>
              <MaterialCommunityIcons name="delete-sweep" size={24} color="#fff" />
            </Pressable>
          </View>
        )}

        <Modal visible={showTextModal} transparent animationType="fade">
          <View style={styles.textModalContainer}>
            <TextInput
              style={styles.overlayTextInput}
              autoFocus
              value={activeText}
              onChangeText={setActiveText}
              onSubmitEditing={addTextOverlay}
              placeholder="Saisissez du texte..."
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <Pressable style={styles.textModalBtn} onPress={addTextOverlay}>
              <Text style={styles.textModalBtnText}>OK</Text>
            </Pressable>
          </View>
        </Modal>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.previewFooter}
        >
          <View style={styles.editingBar}>
            <Pressable onPress={rotatePhoto} style={styles.editToolBtn}>
              <MaterialCommunityIcons name="rotate-right" size={28} color="#fff" />
              <Text style={styles.editToolText}>Pivoter</Text>
            </Pressable>
            <Pressable onPress={toggleCrop} style={styles.editToolBtn}>
              <MaterialCommunityIcons name="crop" size={28} color={isCropMode ? "#2BEE79" : "#fff"} />
              <Text style={[styles.editToolText, isCropMode && { color: "#2BEE79" }]}>Recadrer</Text>
            </Pressable>
            <Pressable onPress={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setIsDrawingMode(false);
            }} style={styles.editToolBtn}>
              <MaterialCommunityIcons name="sticker-emoji" size={28} color={showEmojiPicker ? "#2BEE79" : "#fff"} />
              <Text style={[styles.editToolText, showEmojiPicker && { color: "#2BEE79" }]}>Sticker</Text>
            </Pressable>
            <Pressable onPress={() => {
              setShowTextModal(true);
              setIsDrawingMode(false);
              setShowEmojiPicker(false);
            }} style={styles.editToolBtn}>
              <MaterialCommunityIcons name="format-text" size={28} color="#fff" />
              <Text style={styles.editToolText}>Texte</Text>
            </Pressable>
            <Pressable onPress={() => {
              setIsDrawingMode(!isDrawingMode);
              setShowEmojiPicker(false);
            }} style={styles.editToolBtn}>
              <MaterialCommunityIcons name="pencil" size={28} color={isDrawingMode ? "#2BEE79" : "#fff"} />
              <Text style={[styles.editToolText, isDrawingMode && { color: "#2BEE79" }]}>Dessin</Text>
            </Pressable>
          </View>

          <View style={styles.captionContainer}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" style={{ marginRight: 12 }} />
            <TextInput
              style={styles.captionInput}
              placeholder="Ajouter une légende..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={mediaCaption}
              onChangeText={setMediaCaption}
              multiline
            />
            <Pressable style={styles.sendMediaBtn} onPress={handleSendMedia}>
              <MaterialCommunityIcons name="send" size={24} color="#fff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  const CameraCaptureModal = () => (
    <Modal visible={showCamera} transparent animationType="slide">
      <View style={styles.cameraContainer}>
        <StatusBar hidden />
        <CameraView 
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={cameraFacing}
        >
          <SafeAreaView style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <Pressable onPress={() => setShowCamera(false)} style={styles.cameraCloseBtn}>
                <MaterialCommunityIcons name="close" size={28} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.cameraFooter}>
              <Pressable 
                style={styles.cameraActionBtnSmall}
                onPress={() => setCameraFacing(prev => prev === 'front' ? 'back' : 'front')}
              >
                <MaterialCommunityIcons name="camera-flip" size={26} color="#fff" />
              </Pressable>

              <Pressable style={styles.shutterBtn} onPress={capturePhoto}>
                <View style={styles.shutterInner} />
              </Pressable>

              <View style={styles.cameraActionBtnSmall}>
                {/* Space for gallery or flash */}
                <MaterialCommunityIcons name="flash-off" size={26} color="#fff" />
              </View>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    </Modal>
  );

  const CallScreen = () => (
    <View style={styles.callScreen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.callOverlay}>
        <View style={styles.callHeader}>
          <MaterialCommunityIcons name="lock" size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.callHeaderTitle}>Chiffré de bout en bout</Text>
        </View>

        <View style={styles.callUserInfo}>
          <View style={styles.callAvatarPlaceholder}>
            <MaterialCommunityIcons name="account" size={100} color="#64748b" />
          </View>
          <Text style={styles.callName}>{selectedConversation?.name}</Text>
          <Text style={styles.callStatus}>Appel en cours...</Text>
        </View>

        <View style={styles.callActions}>
          <View style={styles.callActionRow}>
            <Pressable 
              style={styles.callActionBtn}
              onPress={() => setIsSpeakerOn(!isSpeakerOn)}
            >
              <MaterialCommunityIcons 
                name={isSpeakerOn ? "volume-high" : "volume-medium"} 
                size={28} 
                color={isSpeakerOn ? "#2BEE79" : "#fff"} 
              />
              <Text style={[styles.callActionText, isSpeakerOn && { color: '#2BEE79' }]}>Haut-parleur</Text>
            </Pressable>
            <Pressable 
              style={styles.callActionBtn}
              onPress={async () => {
                if (!permission?.granted) {
                  const { granted } = await requestPermission();
                  if (granted) setIsVideoCall(true);
                } else {
                  setIsVideoCall(true);
                }
              }}
            >
              <MaterialCommunityIcons name="video-outline" size={28} color="#fff" />
              <Text style={styles.callActionText}>Vidéo</Text>
            </Pressable>
            <Pressable 
              style={styles.callActionBtn}
              onPress={() => setIsMuted(!isMuted)}
            >
              <MaterialCommunityIcons 
                name={isMuted ? "microphone-off" : "microphone"} 
                size={28} 
                color={isMuted ? "#ef4444" : "#fff"} 
              />
              <Text style={[styles.callActionText, isMuted && { color: '#ef4444' }]}>Muet</Text>
            </Pressable>
          </View>

          <Pressable 
            style={styles.endCallBtn}
            onPress={() => setIsCalling(false)}
          >
            <MaterialCommunityIcons name="phone-hangup" size={32} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const VideoCallScreen = () => (
    <View style={styles.callScreen}>
      <StatusBar barStyle="light-content" />
      <CameraView style={StyleSheet.absoluteFill} facing={cameraFacing}>
        <View style={styles.videoOverlay}>
          {activeEmojis.map(item => (
            <View key={item.id} style={[styles.emojiEffect, { left: item.x }]}>
              <Text style={styles.emojiText}>{item.emoji}</Text>
            </View>
          ))}
          <View style={styles.videoHeader}>
            <Pressable onPress={() => setIsVideoCall(false)} style={styles.videoBackBtn}>
              <MaterialCommunityIcons name="chevron-down" size={32} color="#fff" />
            </Pressable>
            <View style={styles.videoInfo}>
              <Text style={styles.videoName}>{selectedConversation?.name}</Text>
              <Text style={styles.videoStatus}>00:15</Text>
            </View>
          </View>

          <View style={[styles.miniPreview, { right: 20, top: 120 }]}>
            <View style={styles.miniAvatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={40} color="#64748b" />
            </View>
          </View>

          <View style={styles.videoActions}>
            <View style={styles.emojiBar}>
              {['❤️', '😂', '🔥', '👏', '😮'].map(emoji => (
                <Pressable key={emoji} onPress={() => addEmoji(emoji)} style={styles.emojiBtnShort}>
                  <Text style={styles.emojiBtnText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.callActionRow}>
              <Pressable 
                style={styles.videoActionBtn}
                onPress={() => setCameraFacing(prev => prev === 'front' ? 'back' : 'front')}
              >
                <MaterialCommunityIcons 
                  name={cameraFacing === 'front' ? "camera-flip" : "camera-flip-outline"} 
                  size={24} 
                  color="#fff" 
                />
              </Pressable>
              <Pressable 
                style={styles.videoActionBtn}
                onPress={() => setIsMuted(!isMuted)}
              >
                <MaterialCommunityIcons 
                  name={isMuted ? "microphone-off" : "microphone"} 
                  size={24} 
                  color={isMuted ? "#ef4444" : "#fff"} 
                />
              </Pressable>
              <Pressable 
                style={[styles.endCallBtn, { width: 64, height: 64 }]}
                onPress={() => {
                  setIsCalling(false);
                  setIsVideoCall(false);
                }}
              >
                <MaterialCommunityIcons name="phone-hangup" size={28} color="#fff" />
              </Pressable>
              <Pressable 
                style={styles.videoActionBtn} 
                onPress={() => setIsSpeakerOn(!isSpeakerOn)}
              >
                <MaterialCommunityIcons 
                  name={isSpeakerOn ? "video-off-outline" : "video-outline"} 
                  size={24} 
                  color={isSpeakerOn ? "#2BEE79" : "#fff"} 
                />
              </Pressable>
              <Pressable style={styles.videoActionBtn}>
                <MaterialCommunityIcons name="star-outline" size={24} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );

  const ConversationsList = () => (
    <>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerBackBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        <Pressable style={styles.editBtn} onPress={() => setShowNewChatModal(true)}>
          <MaterialCommunityIcons name="plus" size={22} color="#2BEE79" />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
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
            {totalUnread} message{totalUnread > 1 ? 's' : ''} non lu{totalUnread > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={filteredConversations}
        keyExtractor={item => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.conversationsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="message-text-outline" size={64} color="#1c2a38" />
            <Text style={styles.emptyTitle}>Aucune conversation</Text>
            <Text style={styles.emptySubtitle}>
              Appuyez sur + pour commencer une conversation
            </Text>
          </View>
        }
      />

      <LobaBottomNav activeTab="messages" onNavigate={(tab) => {
        if (tab === 'home') onNavigate?.('loba_home');
        else if (tab === 'create') onNavigate?.('loba_record');
        else if (tab === 'friends') onNavigate?.('loba_friends');
        else if (tab === 'profile') onNavigate?.('loba_profile');
      }} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isCalling ? (
        isVideoCall ? VideoCallScreen() : CallScreen()
      ) : (
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {selectedConversation ? ChatView() : ConversationsList()}
        </KeyboardAvoidingView>
      )}

      <PhotoPreviewModal />
      <FullscreenViewer />
      <CameraCaptureModal />

      <Modal
        visible={showNewChatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>Nouvelle conversation</Text>
                <Pressable onPress={() => {
                  setShowNewChatModal(false);
                  setSearchQuery('');
                }}>
                  <MaterialCommunityIcons name="close" size={24} color="#fff" />
                </Pressable>
              </View>
            </View>

            <View style={styles.modalSearch}>
              <View style={styles.searchInputWrapper}>
                <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher un ami..."
                  placeholderTextColor="#64748b"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            <FlatList
              data={filteredFriends}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.friendItem}
                  onPress={() => startConversation(item)}
                >
                  <View style={styles.friendAvatar}>
                    <MaterialCommunityIcons name="account" size={24} color="#64748b" />
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{item.name}</Text>
                    <Text style={styles.friendUsername}>{item.username}</Text>
                  </View>
                  <MaterialCommunityIcons name="message-outline" size={22} color="#2BEE79" />
                </Pressable>
              )}
              contentContainerStyle={styles.friendsList}
              ListEmptyComponent={
                <View style={styles.emptyFriends}>
                  <Text style={styles.emptyFriendsText}>Aucun ami trouvé</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
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
    paddingBottom: 100,
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
    paddingTop: 50,
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
    maxWidth: '80%',
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
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
  },
  sentMessageTime: {
    color: 'rgba(14, 21, 27, 0.6)',
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
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
    paddingBottom: 30,
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
  sendBtnDisabled: {
    backgroundColor: '#324d67',
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
    maxHeight: '80%',
    minHeight: 400,
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
  modalSearch: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  friendsList: {
    padding: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#151D26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  friendUsername: {
    color: '#64748b',
    fontSize: 13,
  },
  emptyFriends: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFriendsText: {
    color: '#64748b',
    fontSize: 14,
  },
  callScreen: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  callOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 60,
    alignItems: 'center',
  },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  callHeaderTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  callUserInfo: {
    alignItems: 'center',
  },
  callAvatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1C2A38',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  callName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  callStatus: {
    color: '#2BEE79',
    fontSize: 16,
    letterSpacing: 1,
  },
  callActions: {
    width: '100%',
    alignItems: 'center',
    gap: 40,
  },
  callActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    width: '100%',
  },
  callActionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  callActionText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  endCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  videoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    gap: 16,
  },
  videoBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  miniPreview: {
    position: 'absolute',
    width: 100,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#1C2A38',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  miniAvatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoActions: {
    paddingHorizontal: 20,
  },
  videoActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCallAction: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  emojiBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },
  emojiBtnShort: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnText: {
    fontSize: 24,
  },
  emojiEffect: {
    position: 'absolute',
    bottom: 100,
    zIndex: 100,
  },
  emojiText: {
    fontSize: 40,
  },
  connectivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mediaBubble: {
    padding: 0,
    backgroundColor: 'transparent',
    maxWidth: '80%',
  },
  bubbleMediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bubbleImage: {
    width: 200,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    padding: 10,
  },
  audioBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    minWidth: 150,
  },
  audioWaveformMock: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 1,
  },
  audioDuration: {
    fontSize: 12,
    color: '#64748b',
  },
  docBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  docSize: {
    fontSize: 12,
    color: '#64748b',
  },
  locBubbleContainer: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  locMapMock: {
    height: 100,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locFooter: {
    padding: 8,
  },
  locTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  locSub: {
    fontSize: 11,
    color: '#64748b',
  },
  contactBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  contactAvatarMock: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  pollBubbleContainer: {
    padding: 12,
    minWidth: 200,
  },
  pollTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  pollOption: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginBottom: 6,
    overflow: 'hidden',
  },
  pollBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '60%',
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
  },
  pollOptionText: {
    fontSize: 13,
    color: '#1e293b',
  },
  eventBubbleContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  eventDateBox: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  eventMonth: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  eventDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  eventSub: {
    fontSize: 12,
    color: '#64748b',
  },
  attachmentMenu: {
    backgroundColor: '#0E151B',
    padding: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  attachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  attachmentItem: {
    alignItems: 'center',
    width: '25%',
  },
  attachmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  attachmentLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  stopRecordingBtn: {
    padding: 4,
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerMain: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  viewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  audioProgressMock: {
    height: '100%',
    width: '40%',
    backgroundColor: '#3b82f6',
    borderRadius: 1,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 10,
  },
  previewHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  previewIcon: {
    padding: 4,
  },
  previewMain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewFooter: {
    paddingBottom: 20,
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
  },
  captionInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendMediaBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  previewImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  overlayItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayTextInput: {
    width: '100%',
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  textModalBtn: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#25D366',
    borderRadius: 25,
  },
  textModalBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editingBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  editToolBtn: {
    alignItems: 'center',
    gap: 4,
  },
  editToolText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  viewerMainContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  emojiPickerItem: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  emojiPickerText: {
    fontSize: 32,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  colorItem: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorItemActive: {
    borderColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
  clearImgBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    padding: 20,
    flexDirection: 'row',
  },
  cameraCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingTop: 20,
  },
  shutterBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  cameraActionBtnSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const enhance = withObservables([], () => ({
  friends: database.get('loba_friends').query().observe(),
}));

export default enhance(LobaMessagesScreen);
