import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable, Switch, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const MusicSettingsScreen = ({ navigation, onNavigate, onBack }) => {
  const [audioQuality, setAudioQuality] = useState('Haute');
  const [wifiOnly, setWifiOnly] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [equalizerPreset, setEqualizerPreset] = useState('Normal');
  const [volume, setVolume] = useState(0.5);

  const qualityOptions = ['Basse', 'Normale', 'Haute', 'Lossless'];
  const equalizerPresets = ['Normal', 'Pop', 'Rock', 'Jazz', 'Classique', 'Hip-Hop', 'Personnalisé'];

  const renderSectionHeader = (title) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderSettingItem = (icon, title, subtitle, rightComponent) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent}
    </View>
  );

  const handleQualityPress = () => {
    Alert.alert(
      'Qualité audio',
      'Sélectionnez la qualité audio',
      qualityOptions.map(q => ({
        text: q,
        onPress: () => setAudioQuality(q),
      }))
    );
  };

  const handleEqualizerPress = () => {
    Alert.alert(
      'Égaliseur',
      'Sélectionnez un préréglage',
      equalizerPresets.map(p => ({
        text: p,
        onPress: () => setEqualizerPreset(p),
      }))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Paramètres audio</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSectionHeader('QUALITÉ AUDIO')}
        <View style={styles.section}>
          {renderSettingItem(
            <MaterialCommunityIcons name="quality-high" size={24} color="#22c55e" />,
            'Qualité de lecture',
            audioQuality,
            <Pressable style={styles.chevronButton} onPress={handleQualityPress}>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </Pressable>
          )}
          <View style={styles.divider} />
          {renderSettingItem(
            <MaterialCommunityIcons name="broadcast" size={24} color="#137fec" />,
            'Qualité de diffusion',
            audioQuality,
            <Pressable style={styles.chevronButton} onPress={handleQualityPress}>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </Pressable>
          )}
        </View>

        {renderSectionHeader('TÉLÉCHARGEMENTS')}
        <View style={styles.section}>
          {renderSettingItem(
            <MaterialCommunityIcons name="wifi" size={24} color="#888" />,
            'Wi-Fi uniquement',
            'Télécharger uniquement avec Wi-Fi',
            <Switch
              value={wifiOnly}
              onValueChange={setWifiOnly}
              trackColor={{ false: '#2a3644', true: '#22c55e' }}
              thumbColor="#fff"
            />
          )}
          <View style={styles.divider} />
          {renderSettingItem(
            <MaterialCommunityIcons name="download-circle" size={24} color="#888" />,
            'Téléchargement automatique',
            'Télécharger les derniers ajouts',
            <Switch
              value={autoDownload}
              onValueChange={setAutoDownload}
              trackColor={{ false: '#2a3644', true: '#22c55e' }}
              thumbColor="#fff"
            />
          )}
        </View>

        {renderSectionHeader('ÉGALISEUR')}
        <View style={styles.section}>
          {renderSettingItem(
            <MaterialCommunityIcons name="equalizer" size={24} color="#F472B6" />,
            'Préréglage',
            equalizerPreset,
            <Pressable style={styles.chevronButton} onPress={handleEqualizerPress}>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </Pressable>
          )}
          <View style={styles.divider} />
          <View style={styles.equalizerControls}>
            <Text style={styles.equalizerLabel}>Volume</Text>
            <Slider
              style={styles.equalizerSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={setVolume}
              minimumTrackTintColor="#22c55e"
              maximumTrackTintColor="#2a3644"
              thumbTintColor="#22c55e"
            />
          </View>
        </View>

        {renderSectionHeader('STOCKAGE')}
        <View style={styles.section}>
          <Pressable style={styles.storageItem} onPress={() => onNavigate?.('downloads')}>
            <View style={styles.storageIcon}>
              <MaterialCommunityIcons name="folder-download" size={24} color="#888" />
            </View>
            <View style={styles.storageInfo}>
              <Text style={styles.storageTitle}>Gérer le stockage</Text>
              <Text style={styles.storageSubtitle}>Voir et supprimer les téléchargements</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.storageInfo2}>
            <Text style={styles.storageStat}>Espace utilisé: 256 MB</Text>
            <Text style={styles.storageStat}>Cache: 45 MB</Text>
          </View>
          <Pressable style={styles.clearCacheButton}>
            <Text style={styles.clearCacheText}>Vider le cache</Text>
          </Pressable>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Yabisso Music v1.0.0</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  section: {
    backgroundColor: '#1a2634',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    color: '#fff',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  chevronButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#0E151B',
    marginLeft: 52,
  },
  equalizerControls: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  equalizerLabel: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 8,
  },
  equalizerSlider: {
    width: '100%',
    height: 40,
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  storageIcon: {
    marginRight: 12,
  },
  storageInfo: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 15,
    color: '#fff',
  },
  storageSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  storageInfo2: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  storageStat: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  clearCacheButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  clearCacheText: {
    fontSize: 14,
    color: '#F472B6',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#666',
  },
});

export default MusicSettingsScreen;
