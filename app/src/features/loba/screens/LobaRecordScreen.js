import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const modes = ['Photo', '15s Video', '60s Video', 'Templates'];
const tools = [
  { id: 'flip', icon: 'flip-camera-ios', label: 'Flip' },
  { id: 'flash', icon: 'flash-off', label: 'Flash' },
  { id: 'speed', icon: 'speedometer', label: 'Speed' },
  { id: 'beauty', icon: 'face-recognition', label: 'Beauty' },
  { id: 'timer', icon: 'timer-outline', label: 'Timer' },
];

export default function LobaRecordScreen({ onBack, onClose }) {
  const [activeMode, setActiveMode] = useState('15s Video');
  const [isRecording, setIsRecording] = useState(false);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ1jPjQc0navX4Agb9HCplTY31-_AIi58tsPW2oAvdu7zaqY7OlfG1IKzQM0cuVXCvkbXwPyuEbGyBAc5iGiekoDsaD6dcf5uIXFTgmfWR8qoTqT4J8g1JF8DXE9vqIAsxjF7V90z3vIz047VnofIO7UgtauG5p-Ay6NpWWQm9zRygm4porl0tBbilKiAWlHgykzqLsRlZZ188w613xXHrSre9sAgvwqu8YV5MQBDmQmZww5WizZRQaAKCDiPlXNvdg_s965g6' }}
        style={styles.cameraBackground}
      />
      <View style={styles.gradientOverlay} />

      <SafeAreaView style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.progressBar}>
            <View style={styles.progressSegment}>
              <View style={[styles.progressFill, { width: '66%' }]} />
            </View>
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>

          <View style={styles.header}>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </Pressable>

            <Pressable style={styles.soundBtn}>
              <MaterialCommunityIcons name="music-note" size={20} color="#fff" />
              <View style={styles.soundInfo}>
                <Text style={styles.soundTitle}>Afrobeats Top 50</Text>
                <Text style={styles.soundSubtitle}>Tap to change</Text>
              </View>
            </Pressable>

            <View style={styles.placeholder} />
          </View>
        </View>

        <View style={styles.middleSection}>
          <View style={styles.toolsSidebar}>
            {tools.map((tool) => (
              <View key={tool.id} style={styles.toolItem}>
                <Pressable style={styles.toolBtn}>
                  <MaterialCommunityIcons name={tool.icon} size={24} color="#fff" />
                </Pressable>
                <Text style={styles.toolLabel}>{tool.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.modeSelector}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modesScroll}
            >
              {modes.map((mode) => (
                <Pressable
                  key={mode}
                  style={[
                    styles.modeBtn,
                    activeMode === mode && styles.modeBtnActive,
                  ]}
                  onPress={() => setActiveMode(mode)}
                >
                  <Text
                    style={[
                      styles.modeText,
                      activeMode === mode && styles.modeTextActive,
                    ]}
                  >
                    {mode}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.mainControls}>
            <View style={styles.sideControl}>
              <Pressable style={styles.effectsBtn}>
                <View style={styles.effectsGradient}>
                  <MaterialCommunityIcons name="auto-fix" size={20} color="#fff" />
                </View>
                <Text style={styles.effectsLabel}>Effects</Text>
              </Pressable>
            </View>

            <View style={styles.centerControl}>
              <Pressable
                style={styles.shutterBtn}
                onPress={() => setIsRecording(!isRecording)}
              >
                <View style={styles.shutterOuter}>
                  <View
                    style={[
                      styles.shutterInner,
                      isRecording && styles.shutterRecording,
                    ]}
                  >
                    {isRecording && <View style={styles.recordDot} />}
                  </View>
                </View>
              </Pressable>
            </View>

            <View style={styles.sideControl}>
              <Pressable style={styles.uploadBtn}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3r_WVYWr1iKoNlMkBBpTiVh8pWWzloUGPxc_mZVsyLftkV_s-AAl_nxaFngzDL-A07dM3BuahcFgwnfLhWBoazRSf1fMVIAxXTWXdavS8VkdV2V8HbNB0VBVWxXIkaWCoajgkhvoP-tiH0Zo_vZx3wHCcAZEeJBrDt_wyWj23p6Lm05LSuUyj7MUNRa04iuhkEtjCLgX5dt3-mA3A1vT6CnI3DhN4OfzOlw8pM-hWIy1INwk8KJsWf1HbKO3GcNr3TLz7YxoL' }}
                  style={styles.uploadThumb}
                />
                <View style={styles.uploadOverlay}>
                  <MaterialCommunityIcons name="upload" size={14} color="rgba(255,255,255,0.8)" />
                </View>
              </Pressable>
              <Text style={styles.uploadLabel}>Upload</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  cameraBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    paddingTop: 16,
  },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#137fec',
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxWidth: 160,
  },
  soundInfo: {
    gap: 2,
  },
  soundTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  soundSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  placeholder: {
    width: 40,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  toolsSidebar: {
    position: 'absolute',
    right: 16,
    top: '30%',
    alignItems: 'center',
    gap: 20,
  },
  toolItem: {
    alignItems: 'center',
    gap: 4,
  },
  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  toolLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  bottomSection: {
    paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modeSelector: {
    paddingVertical: 12,
  },
  modesScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  modeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sideControl: {
    flex: 1,
    alignItems: 'center',
  },
  centerControl: {
    flex: 1,
    alignItems: 'center',
  },
  effectsBtn: {
    alignItems: 'center',
    gap: 6,
  },
  effectsGradient: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectsLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
  },
  shutterBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  shutterRecording: {
    backgroundColor: '#ef4444',
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  recordDot: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  uploadBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  uploadThumb: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
});
