import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

const modes = ['Photo', '15s Video', '60s Video', 'Templates'];
const tools = [
  { id: 'flip', icon: 'flip-camera-ios', label: 'Flip' },
  { id: 'flash', icon: 'flash-off', label: 'Flash' },
  { id: 'speed', icon: 'speedometer', label: 'Speed' },
  { id: 'beauty', icon: 'face-recognition', label: 'Beauty' },
  { id: 'timer', icon: 'timer-outline', label: 'Timer' },
];

const filters = [
  { id: 'none', label: 'Normal', color: 'transparent' },
  { id: 'warm', label: 'Chaud', color: 'rgba(255, 100, 0, 0.15)' },
  { id: 'cool', label: 'Frais', color: 'rgba(0, 100, 255, 0.15)' },
  { id: 'sepia', label: 'Sépia', color: 'rgba(112, 66, 20, 0.3)' },
  { id: 'mono', label: 'B&W', color: 'rgba(0, 0, 0, 0.4)' },
  { id: 'vintage', label: 'Vintage', color: 'rgba(100, 50, 0, 0.2)' },
  { id: 'cyan', label: 'Cyan', color: 'rgba(0, 255, 255, 0.1)' },
];

export default function LobaRecordScreen({ onBack, onClose, onCapture }) {
  const [activeMode, setActiveMode] = useState('15s Video');
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  const cameraRef = useRef(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) await requestCameraPermission();
      if (!micPermission?.granted) await requestMicPermission();
    })();
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      setRecordingProgress(0);
      interval = setInterval(() => {
        setRecordingProgress((prev) => {
          const max = activeMode === '15s Video' ? 15000 : 60000;
          const next = prev + 100;
          if (next >= max) {
            stopRecording();
            return max;
          }
          return next;
        });
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, activeMode]);

  const toggleFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: activeMode === '15s Video' ? 15 : 60,
          quality: '720p',
        });
        console.log('Video recorded:', video.uri);
        onCapture?.({ uri: video.uri, type: 'video', filter: activeFilter });
      } catch (error) {
        console.error('Failed to record video', error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      console.log('Photo taken:', photo.uri);
      onCapture?.({ uri: photo.uri, type: 'image', filter: activeFilter });
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      onCapture?.({ 
        uri: asset.uri, 
        type: asset.type === 'video' ? 'video' : 'image',
        filter: filters[0],
      });
    }
  };

  if (!cameraPermission || !micPermission) {
    return <View style={styles.container} />;
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Nous avons besoin des permissions Caméra et Micro</Text>
        <Pressable style={styles.permissionBtn} onPress={() => {
          requestCameraPermission();
          requestMicPermission();
        }}>
          <Text style={styles.permissionBtnText}>Autoriser</Text>
        </Pressable>
      </View>
    );
  }

  const progressPercent = activeMode === '15s Video' 
    ? (recordingProgress / 15000) * 100 
    : (recordingProgress / 60000) * 100;

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.cameraBackground}
        facing={facing}
        enableTorch={flash === 'on'}
        mode={activeMode === 'Photo' ? 'picture' : 'video'}
      >
        <View style={[styles.filterOverlay, { backgroundColor: activeFilter.color }]} />
      </CameraView>
      <View style={styles.gradientOverlay} />

      <SafeAreaView style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.progressBar}>
            <View style={styles.progressSegment}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          <View style={styles.header}>
            <Pressable style={styles.closeBtn} onPress={onClose || onBack}>
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
            <View style={styles.toolItem}>
              <Pressable style={styles.toolBtn} onPress={toggleFacing}>
                <MaterialCommunityIcons name="camera-flip-outline" size={24} color="#fff" />
              </Pressable>
              <Text style={styles.toolLabel}>Flip</Text>
            </View>
            <View style={styles.toolItem}>
              <Pressable style={styles.toolBtn} onPress={toggleFlash}>
                <MaterialCommunityIcons name={flash === 'on' ? "flash" : "flash-off"} size={24} color={flash === 'on' ? "#fbbf24" : "#fff"} />
              </Pressable>
              <Text style={styles.toolLabel}>Flash</Text>
            </View>
            <View style={styles.toolItem}>
              <Pressable style={styles.toolBtn}>
                <MaterialCommunityIcons name="speedometer" size={24} color="#fff" />
              </Pressable>
              <Text style={styles.toolLabel}>Speed</Text>
            </View>
            <View style={styles.toolItem}>
              <Pressable style={[styles.toolBtn, showFilterPicker && { backgroundColor: '#2BEE79' }]} onPress={() => setShowFilterPicker(!showFilterPicker)}>
                <MaterialCommunityIcons name="palette-outline" size={24} color={showFilterPicker ? "#000" : "#fff"} />
              </Pressable>
              <Text style={styles.toolLabel}>Filtres</Text>
            </View>
            <View style={styles.toolItem}>
              <Pressable style={styles.toolBtn}>
                <MaterialCommunityIcons name="timer-outline" size={24} color="#fff" />
              </Pressable>
              <Text style={styles.toolLabel}>Timer</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          {showFilterPicker && (
            <View style={styles.filterPickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {filters.map(filter => (
                  <Pressable 
                    key={filter.id} 
                    style={[styles.filterBtn, activeFilter.id === filter.id && styles.filterBtnActive]} 
                    onPress={() => setActiveFilter(filter)}
                  >
                    <View style={[styles.filterThumb, { backgroundColor: filter.color }]} />
                    <Text style={[styles.filterText, activeFilter.id === filter.id && styles.filterTextActive]}>{filter.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

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
                onPress={() => {
                  if (activeMode === 'Photo') {
                    takePicture();
                  } else if (!isRecording) {
                    // Simple tap on video mode does nothing or starts toggle recording
                    startRecording();
                  } else {
                    stopRecording();
                  }
                }}
                onLongPress={() => {
                  if (activeMode !== 'Photo') {
                    startRecording();
                  }
                }}
                onPressOut={() => {
                  if (isRecording) {
                    stopRecording();
                  }
                }}
              >
                <View style={styles.shutterOuter}>
                  <View
                    style={[
                      styles.shutterInner,
                      isRecording && styles.shutterRecording,
                      activeMode === 'Photo' && { backgroundColor: '#fff', borderRadius: 32 }
                    ]}
                  >
                    {isRecording && <View style={styles.recordDot} />}
                  </View>
                </View>
              </Pressable>
            </View>

            <View style={styles.sideControl}>
              <Pressable style={styles.uploadBtn} onPress={pickFromGallery}>
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
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  filterPickerContainer: {
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterBtn: {
    alignItems: 'center',
    gap: 6,
    width: 60,
  },
  filterThumb: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: '#333',
  },
  filterBtnActive: {
    transform: [{ scale: 1.1 }],
  },
  filterText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#2BEE79',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#101922',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionBtn: {
    backgroundColor: '#2BEE79',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
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
