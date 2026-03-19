import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const createOptions = [
  {
    id: 'video',
    icon: 'video-plus',
    label: 'Vidéo',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  {
    id: 'photo',
    icon: 'image-plus',
    label: 'Photo',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
  },
  {
    id: 'story',
    icon: 'chat-processing',
    label: 'Story',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  {
    id: 'live',
    icon: 'broadcast',
    label: 'Live',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
  },
];

export default function LobaCreateScreen({ onBack, onNavigate }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionPress = (option) => {
    setSelectedOption(option.id);
    if (option.id === 'video') {
      onNavigate?.('loba_record');
    } else if (option.id === 'photo') {
      onNavigate?.('loba_record');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={28} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Créer</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Qu'est-ce que tu veux créer ?</Text>
          <Text style={styles.subtitle}>
            Choisis le type de contenu que tu veux publier
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {createOptions.map((option, index) => (
            <Pressable
              key={option.id}
              style={[
                styles.optionCard,
                selectedOption === option.id && styles.optionCardSelected,
              ]}
              onPress={() => handleOptionPress(option)}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.bgColor }]}>
                <MaterialCommunityIcons
                  name={option.icon}
                  size={36}
                  color={option.color}
                />
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <View style={[styles.selectionIndicator, selectedOption === option.id && { backgroundColor: option.color }]} />
            </Pressable>
          ))}
        </View>

        <View style={styles.advancedSection}>
          <Text style={styles.advancedTitle}>Options avancées</Text>
          
          <Pressable style={styles.advancedOption}>
            <View style={[styles.advancedIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <MaterialCommunityIcons name="movie-open" size={24} color="#6366f1" />
            </View>
            <View style={styles.advancedInfo}>
              <Text style={styles.advancedLabel}>Court métrage</Text>
              <Text style={styles.advancedDesc}>Créer une vidéo de 3-60 secondes</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#64748b" />
          </Pressable>

          <Pressable style={styles.advancedOption}>
            <View style={[styles.advancedIcon, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
              <MaterialCommunityIcons name="playlist-music" size={24} color="#0ea5e9" />
            </View>
            <View style={styles.advancedInfo}>
              <Text style={styles.advancedLabel}>Clip musical</Text>
              <Text style={styles.advancedDesc}>Synchroniser audio et vidéo</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#64748b" />
          </Pressable>

          <Pressable style={styles.advancedOption}>
            <View style={[styles.advancedIcon, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
              <MaterialCommunityIcons name="creation" size={24} color="#a855f7" />
            </View>
            <View style={styles.advancedInfo}>
              <Text style={styles.advancedLabel}>Effets AR</Text>
              <Text style={styles.advancedDesc}>Ajouter des filtres 3D</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#64748b" />
          </Pressable>
        </View>

        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <MaterialCommunityIcons name="lightbulb" size={20} color="#f59e0b" />
            <Text style={styles.tipText}>
              Les vidéos les plus populaires durent entre 15-30 secondes
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            onPress={() => onNavigate?.('loba_home')}
          >
            <View style={styles.navIcon}>
              <MaterialCommunityIcons name="home-variant" size={22} color="#CBD5F5" />
            </View>
            <Text style={styles.navLabel}>Accueil</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => onNavigate?.('loba_friends')}
          >
            <View style={styles.navIcon}>
              <MaterialCommunityIcons name="account-group" size={22} color="#CBD5F5" />
            </View>
            <Text style={styles.navLabel}>Ami</Text>
          </Pressable>

          <Pressable
            style={[styles.navItem, styles.navItemCreate]}
            onPress={() => {}}
          >
            <View style={styles.createBtnActive}>
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            </View>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => onNavigate?.('loba_messages')}
          >
            <View style={styles.navIcon}>
              <MaterialCommunityIcons name="message-text" size={22} color="#CBD5F5" />
            </View>
            <Text style={styles.navLabel}>Message</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => onNavigate?.('loba_profile')}
          >
            <View style={styles.navIcon}>
              <MaterialCommunityIcons name="account-circle" size={22} color="#CBD5F5" />
            </View>
            <Text style={styles.navLabel}>Moi</Text>
          </Pressable>
        </View>
      </View>
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
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleSection: {
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#151D26',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#2BEE79',
    backgroundColor: 'rgba(43, 238, 121, 0.05)',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  selectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  advancedSection: {
    marginBottom: 24,
  },
  advancedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 16,
  },
  advancedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151D26',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  advancedIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  advancedInfo: {
    flex: 1,
  },
  advancedLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  advancedDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  tipsSection: {
    marginTop: 'auto',
    marginBottom: 100,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  tipText: {
    flex: 1,
    color: '#f59e0b',
    fontSize: 13,
    lineHeight: 18,
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  bottomNav: {
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navItemCreate: {
    marginTop: -20,
  },
  navIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnActive: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2BEE79',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
});
