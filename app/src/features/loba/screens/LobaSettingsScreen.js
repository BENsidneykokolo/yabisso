import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const SETTINGS_OPTIONS = [
  {
    category: 'Contenu',
    items: [
      { id: 'private_account', label: 'Compte privé', description: 'Seuls vos abonnés peuvent voir vos posts', type: 'toggle', icon: 'lock-outline' },
      { id: 'show_activity', label: 'Afficher l\'activité', description: 'Permettre aux autres de voir votre activité', type: 'toggle', icon: 'eye-outline' },
      { id: 'allow_messages', label: 'Messages de tous', description: 'Autoriser les messages de n\'importe qui', type: 'toggle', icon: 'message-outline' },
    ],
  },
  {
    category: 'Notifications',
    items: [
      { id: 'push_notifications', label: 'Notifications push', description: 'Recevoir des notifications sur votre téléphone', type: 'toggle', icon: 'bell-outline' },
      { id: 'email_notifications', label: 'Notifications email', description: 'Recevoir des emails pour les nouvelles activités', type: 'toggle', icon: 'email-outline' },
      { id: 'follow_notifications', label: 'Nouveaux followers', description: 'Être notifié quand quelqu\'un vous suit', type: 'toggle', icon: 'account-plus-outline' },
      { id: 'like_notifications', label: 'Likes et commentaires', description: 'Être notifié des interactions sur vos posts', type: 'toggle', icon: 'heart-outline' },
    ],
  },
  {
    category: 'Confidentialité',
    items: [
      { id: 'share_location', label: 'Partage de position', description: 'Autoriser le partage de votre position', type: 'toggle', icon: 'map-marker-outline' },
      { id: 'data_usage', label: 'Utilisation des données', description: 'Utiliser les données pour améliorer les recommandations', type: 'toggle', icon: 'database-outline' },
    ],
  },
  {
    category: 'Compte',
    items: [
      { id: 'download_data', label: 'Télécharger mes données', description: 'Obtenir une copie de toutes vos données', type: 'action', icon: 'download-outline' },
      { id: 'two_factor', label: 'Authentification à deux facteurs', description: 'Ajouter une couche de sécurité supplémentaire', type: 'action', icon: 'shield-check-outline' },
      { id: 'linked_accounts', label: 'Comptes liés', description: 'Gérer les connexions à d\'autres apps', type: 'action', icon: 'link-variant' },
    ],
  },
  {
    category: 'Support',
    items: [
      { id: 'help_center', label: 'Centre d\'aide', description: 'Trouver des réponses à vos questions', type: 'action', icon: 'help-circle-outline' },
      { id: 'report_problem', label: 'Signaler un problème', description: 'Nous informer d\'un bug ou d\'un abus', type: 'action', icon: 'flag-outline' },
      { id: 'about', label: 'À propos de Loba', description: 'Version et informations de l\'application', type: 'action', icon: 'information-outline' },
    ],
  },
];

export default function LobaSettingsScreen({ onBack, onNavigate }) {
  const [settings, setSettings] = useState(() => {
    const saved = {};
    SETTINGS_OPTIONS.forEach(category => {
      category.items.forEach(item => {
        saved[item.id] = true;
      });
    });
    return saved;
  });

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await SecureStore.getItemAsync('loba_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await SecureStore.setItemAsync('loba_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const toggleSetting = (settingId) => {
    const newSettings = { ...settings, [settingId]: !settings[settingId] };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleAction = (item) => {
    switch (item.id) {
      case 'download_data':
        Alert.alert(
          'Télécharger mes données',
          'Cette fonctionnalité sera disponible prochainement.',
          [{ text: 'OK' }]
        );
        break;
      case 'two_factor':
        Alert.alert(
          'Authentification à deux facteurs',
          'Configuration 2FA en cours de développement.',
          [{ text: 'OK' }]
        );
        break;
      case 'linked_accounts':
        Alert.alert(
          'Comptes liés',
          'Gestion des comptes liés en cours de développement.',
          [{ text: 'OK' }]
        );
        break;
      case 'help_center':
        onNavigate?.('support');
        break;
      case 'report_problem':
        Alert.alert(
          'Signaler un problème',
          'Merci de contacter le support via l\'application principale.',
          [{ text: 'OK' }]
        );
        break;
      case 'about':
        Alert.alert(
          'À propos de Loba',
          'Loba by Yabisso\nVersion 1.0.0\n\nVotre plateforme vidéo sociale offline-first',
          [{ text: 'OK' }]
        );
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {SETTINGS_OPTIONS.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.category}</Text>
            <View style={styles.categoryCard}>
              {category.items.map((item, itemIndex) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.settingItem,
                    itemIndex < category.items.length - 1 && styles.settingItemBorder
                  ]}
                  onPress={() => item.type === 'action' && handleAction(item)}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons name={item.icon} size={22} color="#137fec" />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      <Text style={styles.settingDescription}>{item.description}</Text>
                    </View>
                  </View>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={settings[item.id]}
                      onValueChange={() => toggleSetting(item.id)}
                      trackColor={{ false: '#324d67', true: '#2BEE79' }}
                      thumbColor={settings[item.id] ? '#fff' : '#94a3b8'}
                    />
                  ) : (
                    <MaterialCommunityIcons name="chevron-right" size={22} color="#64748b" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Loba by Yabisso</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  category: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  categoryTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryCard: {
    backgroundColor: '#1c2a38',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19,127,236,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    color: '#64748b',
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  footerVersion: {
    color: '#475569',
    fontSize: 12,
    marginTop: 4,
  },
  bottomPadding: {
    height: 100,
  },
});
