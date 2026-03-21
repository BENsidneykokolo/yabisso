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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function LobaPreviewScreen({ media, onBack, onUpload }) {
  const [caption, setCaption] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const handleUpload = () => {
    onUpload?.({
      uri: media.uri,
      type: media.type,
      caption,
      filter: media.filter,
    });
  };

  return (
    <View style={styles.container}>
      {media.type === 'video' ? (
        <Video
          source={{ uri: media.uri }}
          style={styles.previewMedia}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted={false}
        />
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

          <View style={styles.actions}>
            <Pressable style={styles.draftBtn}>
              <Text style={styles.draftBtnText}>Brouillon</Text>
            </Pressable>
            <Pressable style={styles.uploadBtn} onPress={handleUpload}>
              <MaterialCommunityIcons name="cloud-upload" size={20} color="#000" />
              <Text style={styles.uploadBtnText}>Publier</Text>
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  captionInput: {
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  actions: {
    flexDirection: 'row',
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
