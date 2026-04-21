import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width, height } = Dimensions.get('window');

import { useLobaPublish } from '../hooks/useLobaPublish';

export default function LobaPreviewScreen({ media, onBack, onUpload }) {
  const [caption, setCaption] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [compress, setCompress] = useState(true);
  const { publishPost, isPublishing } = useLobaPublish();
  const videoPlayer = useVideoPlayer(
    media.type === 'video' ? { uri: media.uri } : null,
    p => { p.loop = true; p.muted = false; p.play(); }
  );
  
  const handleUpload = async () => {
    // 1. Déclenche la publication en arrière-plan (DB + Mesh) avec l'option compress
    publishPost({
      uri: media.uri,
      type: media.type,
      caption,
      filter: media.filter,
      compress
    });

    // 2. Navigation immédiate (non-bloquant)
    if (onUpload) {
        onUpload(); // On signale au parent qu'on a fini
    } else {
        onBack?.();
    }
  };

  return (
    <View style={styles.container}>
      {media.type === 'video' ? (
        <VideoView player={videoPlayer} style={styles.previewMedia} contentFit="cover" />
      ) : (
        <Image source={{ uri: media.uri }} style={styles.previewMedia} />
      )}
      
      <View style={[styles.filterOverlay, { backgroundColor: media.filter?.color || 'transparent' }]} />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Review</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.sidebar}>
          <ToolButton icon="text" label="Texte" />
          <ToolButton icon="sticker-emoji" label="Stickers" />
          <ToolButton icon="palette-outline" label="Filtres" />
          <ToolButton icon="crop" label="Recadrer" />
          <ToolButton icon="music" label="Son" />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.bottomSection}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="Ajouter une légende..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={caption}
              onChangeText={setCaption}
              multiline
            />
          </View>

          <View style={styles.compressRow}>
            <View style={styles.compressTextCol}>
              <MaterialCommunityIcons name="folder-zip-outline" size={20} color={compress ? "#22c55e" : "rgba(255,255,255,0.5)"} />
              <Text style={styles.compressLabel}>Compresser au max (Mesh)</Text>
            </View>
            <Switch
              value={compress}
              onValueChange={setCompress}
              trackColor={{ false: '#333', true: 'rgba(34, 197, 94, 0.5)' }}
              thumbColor={compress ? '#22c55e' : '#f4f3f4'}
              disabled={isPublishing}
            />
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.draftBtn}>
              <Text style={styles.draftBtnText}>Brouillon</Text>
            </Pressable>
            <Pressable style={[styles.uploadBtn, isPublishing && { opacity: 0.7 }]} onPress={handleUpload} disabled={isPublishing}>
              {isPublishing ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <MaterialCommunityIcons name="cloud-upload" size={20} color="#000" />
              )}
              <Text style={styles.uploadBtnText}>
                {isPublishing ? 'Compression...' : 'Publier'}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const ToolButton = ({ icon, label, onPress }) => (
  <Pressable style={styles.toolBtn} onPress={onPress}>
    <View style={styles.iconCircle}>
      <MaterialCommunityIcons name={icon} size={24} color="#fff" />
    </View>
    <Text style={styles.toolLabel}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewMedia: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  overlay: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  sidebar: {
    position: 'absolute',
    right: 16,
    top: 100,
    gap: 20,
  },
  toolBtn: {
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  toolLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  inputContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  captionInput: {
    color: '#fff',
    fontSize: 16,
    minHeight: 40,
    maxHeight: 100,
  },
  compressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  compressTextCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compressLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    gap: 12,
  },
  draftBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadBtn: {
    flex: 2,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2BEE79',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
});
