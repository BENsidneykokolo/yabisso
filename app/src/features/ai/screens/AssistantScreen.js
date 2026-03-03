import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const suggestions = [
  'Trouver un restaurant',
  'Reserver un taxi',
  'Acheter un produit',
  'Verifier mon solde',
];

export default function AssistantScreen({ onBack }) {
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topSpacer} />
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <Text style={styles.headerTitle}>Assistant IA</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={() => setShowMenuModal(true)}>
            <Ionicons name="menu" size={22} color="#E6EDF3" />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.robotContainer}>
            <MaterialCommunityIcons name="robot" size={80} color="#2BEE79" />
          </View>
          <Text style={styles.heroTitle}>Comment puis-je vous aider ?</Text>
        </View>

        <View style={styles.suggestionsSection}>
          <View style={styles.suggestionsRow}>
            {suggestions.map((suggestion, index) => (
              <Pressable key={index} style={styles.suggestionChip}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Pressable style={styles.attachButton} onPress={() => setShowToolsModal(true)}>
            <Ionicons name="add" size={20} color="#7C8A9A" />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Tapez votre message..."
            placeholderTextColor="#7C8A9A"
          />
          <Pressable style={styles.micButton}>
            <Ionicons name="mic" size={20} color="#0E151B" />
          </Pressable>
        </View>
      </View>

      {/* Tools Modal */}
      <Modal
        visible={showToolsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowToolsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowToolsModal(false)}
        >
          <View style={styles.modalContent}>
            <Pressable style={styles.closeModalBtn} onPress={() => setShowToolsModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </Pressable>

            <Text style={styles.modalTitle}>Ajouter</Text>

            <View style={styles.toolsGrid}>
              <Pressable style={styles.toolItem}>
                <View style={[styles.toolIcon, { backgroundColor: '#2BEE79' }]}>
                  <MaterialCommunityIcons name="camera" size={24} color="#0E151B" />
                </View>
                <Text style={styles.toolText}>Camera</Text>
              </Pressable>

              <Pressable style={styles.toolItem}>
                <View style={[styles.toolIcon, { backgroundColor: '#3B82F6' }]}>
                  <MaterialCommunityIcons name="image" size={24} color="#fff" />
                </View>
                <Text style={styles.toolText}>Photo</Text>
              </Pressable>

              <Pressable style={styles.toolItem}>
                <View style={[styles.toolIcon, { backgroundColor: '#F59E0B' }]}>
                  <MaterialCommunityIcons name="file-document" size={24} color="#fff" />
                </View>
                <Text style={styles.toolText}>Fichier</Text>
              </Pressable>

              <Pressable style={styles.toolItem}>
                <View style={[styles.toolIcon, { backgroundColor: '#EF4444' }]}>
                  <MaterialCommunityIcons name="map-marker" size={24} color="#fff" />
                </View>
                <Text style={styles.toolText}>Position</Text>
              </Pressable>

              <Pressable style={styles.toolItem}>
                <View style={[styles.toolIcon, { backgroundColor: '#8B5CF6' }]}>
                  <MaterialCommunityIcons name="contacts" size={24} color="#fff" />
                </View>
                <Text style={styles.toolText}>Contact</Text>
              </Pressable>

              <Pressable style={styles.toolItem}>
                <View style={[styles.toolIcon, { backgroundColor: '#EC4899' }]}>
                  <MaterialCommunityIcons name="microphone" size={24} color="#fff" />
                </View>
                <Text style={styles.toolText}>Audio</Text>
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={showMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <Pressable 
          style={styles.menuOverlay} 
          onPress={() => setShowMenuModal(false)}
        >
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <MaterialCommunityIcons name="robot" size={28} color="#2BEE79" />
              </View>
              <Text style={styles.menuTitle}>Yabisso AI</Text>
            </View>

            <Pressable style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <MaterialCommunityIcons name="plus" size={20} color="#2BEE79" />
              </View>
              <Text style={styles.menuItemText}>Nouvelle discussion</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <MaterialCommunityIcons name="history" size={20} color="#B6C2CF" />
              </View>
              <Text style={styles.menuItemText}>Historique des discussions</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <MaterialCommunityIcons name="magnify" size={20} color="#B6C2CF" />
              </View>
              <Text style={styles.menuItemText}>Rechercher</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <MaterialCommunityIcons name="view-grid" size={20} color="#B6C2CF" />
              </View>
              <Text style={styles.menuItemText}>Categories</Text>
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <MaterialCommunityIcons name="cog" size={20} color="#B6C2CF" />
              </View>
              <Text style={styles.menuItemText}>Parametres</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  topSpacer: {
    height: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
  },
  robotContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  suggestionsSection: {
    marginTop: 40,
    width: '100%',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  suggestionText: {
    color: '#2BEE79',
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    paddingVertical: 8,
  },
  attachButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a242d',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  toolItem: {
    alignItems: 'center',
    gap: 8,
    width: 80,
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolText: {
    color: '#B6C2CF',
    fontSize: 12,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContent: {
    backgroundColor: '#1a242d',
    width: '75%',
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    color: '#E6EDF3',
    fontSize: 15,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
});
