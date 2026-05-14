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
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function NotebookDetailScreen({ onBack, onNavigate, note }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.preview || note?.content || '');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isSaved, setIsSaved] = useState(true);

  const handleSave = () => {
    setIsSaved(true);
  };

  const handleContentChange = (text) => {
    setContent(text);
    setIsSaved(false);
  };

  const handleTitleChange = (text) => {
    setTitle(text);
    setIsSaved(false);
  };

  const toolbarActions = [
    { icon: 'format-bold', label: 'Gras' },
    { icon: 'format-italic', label: 'Italique' },
    { icon: 'format-list-bulleted', label: 'Liste' },
    { icon: 'image-plus', label: 'Image' },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#E6EDF3" />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.pinButton, isPinned && styles.pinButtonActive]}
              onPress={() => setIsPinned(!isPinned)}
            >
              <MaterialCommunityIcons
                name="pin"
                size={18}
                color={isPinned ? '#2BEE79' : '#7C8A9A'}
              />
            </Pressable>
          </View>
          <Pressable style={styles.moreButton}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color="#E6EDF3" />
          </Pressable>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Titre de la note"
          placeholderTextColor="#4A5568"
          value={title}
          onChangeText={handleTitleChange}
        />

        <View style={styles.contentContainer}>
          <TextInput
            style={styles.contentInput}
            placeholder="Commencez a ecrire..."
            placeholderTextColor="#4A5568"
            value={content}
            onChangeText={handleContentChange}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.toolbar}>
          {toolbarActions.map((action, index) => (
            <Pressable key={index} style={styles.toolbarButton}>
              <MaterialCommunityIcons name={action.icon} size={20} color="#7C8A9A" />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.statusContainer}>
          {isSaved ? (
            <>
              <MaterialCommunityIcons name="check-circle" size={14} color="#2BEE79" />
              <Text style={styles.statusText}>Enregistre</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="circle-medium" size={14} color="#F97316" />
              <Text style={styles.statusText}>Non enregistre</Text>
            </>
          )}
        </View>
        <View style={styles.actionButtons}>
          <Pressable style={styles.shareButton}>
            <MaterialCommunityIcons name="share-variant" size={18} color="#7C8A9A" />
          </Pressable>
          <Pressable
            style={[styles.saveButton, !isSaved && styles.saveButtonActive]}
            onPress={handleSave}
          >
            <MaterialCommunityIcons
              name="content-save"
              size={18}
              color={isSaved ? '#7C8A9A' : '#0E151B'}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  pinButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pinButtonActive: {
    borderColor: 'rgba(43, 238, 121, 0.3)',
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  titleInput: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    padding: 0,
  },
  contentContainer: {
    minHeight: 300,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  contentInput: {
    color: '#B6C2CF',
    fontSize: 15,
    lineHeight: 24,
    minHeight: 280,
    padding: 0,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  toolbarButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#7C8A9A',
    fontSize: 12,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  saveButtonActive: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
});