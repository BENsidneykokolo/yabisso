import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const StreamingSettingsScreen = ({ navigation }) => {
  const [videoQuality, setVideoQuality] = useState('Auto');
  const [downloadQuality, setDownloadQuality] = useState('1080p');
  const [subtitles, setSubtitles] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [trailers, setTrailers] = useState(true);

  const qualityOptions = ['Auto', '1080p', '720p', '480p', '360p'];

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const renderOption = (label, value, options, onSelect) => (
    <View style={styles.optionRow}>
      <Text style={styles.optionLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionPill, value === opt && styles.optionPillActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.optionText, value === opt && styles.optionTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSwitch = (label, value, onToggle, subtitle = null) => (
    <View style={styles.switchRow}>
      <View style={styles.switchInfo}>
        <Text style={styles.switchLabel}>{label}</Text>
        {subtitle && <Text style={styles.switchSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#333', true: '#137fec' }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderSection('Qualité vidéo', (
          <>
            {renderOption('Streaming', videoQuality, qualityOptions, setVideoQuality)}
          </>
        ))}

        {renderSection('Téléchargements', (
          <>
            {renderOption('Qualité', downloadQuality, qualityOptions, setDownloadQuality)}
            {renderSwitch('Wi-Fi uniquement', wifiOnly, setWifiOnly, 'Télécharger uniquement avec connexion Wi-Fi')}
          </>
        ))}

        {renderSection('Lecture', (
          <>
            {renderSwitch('Lecture automatique', autoplay, setAutoplay, 'Lancer le prochain épisode automatiquement')}
            {renderSwitch('Aperçu vidéo', trailers, setTrailers, 'Lire un extrait au survol')}
          </>
        ))}

        {renderSection('Sous-titres', (
          <>
            {renderSwitch('Afficher les sous-titres', subtitles, setSubtitles)}
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Langue des sous-titres</Text>
              <View style={styles.settingValue}>
                <Text style={styles.settingValueText}>Français</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
              </View>
            </TouchableOpacity>
          </>
        ))}

        {renderSection('Notifications', (
          <>
            {renderSwitch('Notifications push', notifications, setNotifications)}
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Recommandations</Text>
              <View style={styles.settingValue}>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
              </View>
            </TouchableOpacity>
          </>
        ))}

        {renderSection('Langue', (
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Langue de l'application</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>Français</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        ))}

        {renderSection('Compte', (
          <>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Gérer mon abonnement</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Confidentialité</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Aide</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          </>
        ))}

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <TouchableOpacity>
            <Text style={styles.terms}>Conditions d'utilisation</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.terms}>Politique de confidentialité</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#137fec', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  sectionContent: { backgroundColor: '#1E2A36', borderRadius: 16, padding: 4 },
  optionRow: { paddingVertical: 14, paddingHorizontal: 16 },
  optionLabel: { fontSize: 15, color: '#fff', marginBottom: 12 },
  optionPill: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#162230', borderRadius: 20, marginRight: 10 },
  optionPillActive: { backgroundColor: '#137fec' },
  optionText: { color: '#888', fontSize: 14 },
  optionTextActive: { color: '#fff', fontWeight: 'bold' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#162230' },
  switchInfo: { flex: 1, marginRight: 16 },
  switchLabel: { fontSize: 15, color: '#fff' },
  switchSubtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#162230' },
  settingLabel: { fontSize: 15, color: '#fff' },
  settingValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValueText: { color: '#888', fontSize: 14 },
  footer: { alignItems: 'center', marginTop: 32, gap: 8 },
  version: { color: '#666', fontSize: 12 },
  terms: { color: '#888', fontSize: 13 },
  bottomPadding: { height: 50 },
});

export default StreamingSettingsScreen;