import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SuperAdminService from '../services/SuperAdminService';

export default function SuperAdminSettingsScreen({ onBack }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiKey, setAiKey] = useState('');
  const [maintenanceMsg, setMaintenanceMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await SuperAdminService.getSettings();
    setSettings(data);
    setAiKey(data.aiApiKey || '');
    setMaintenanceMsg(data.maintenanceMessage || '');
    setLoading(false);
  }

  async function toggle(key) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    const result = await SuperAdminService.updateSettings({ [key]: !settings[key] });
    if (result.success) Alert.alert('Succès', 'Paramètre mis à jour');
  }

  async function saveAiKey() {
    const result = await SuperAdminService.updateSettings({ aiApiKey: aiKey });
    if (result.success) Alert.alert('Succès', 'Clé API IA enregistrée');
  }

  async function saveMaintenance() {
    const result = await SuperAdminService.updateSettings({ maintenanceMessage: maintenanceMsg });
    if (result.success) Alert.alert('Succès', 'Message de maintenance enregistré');
  }

  if (loading || !settings) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Paramètres</Text>
        </View>
        <Text style={styles.emptyText}>Chargement...</Text>
      </View>
    );
  }

  const settingGroups = [
    {
      title: 'Général',
      items: [
        { key: 'maintenanceMode', label: 'Mode maintenance', desc: 'Affiche un message aux utilisateurs', icon: 'wrench', color: '#FFA726' },
        { key: 'allowNewSignups', label: 'Nouvelles inscriptions', desc: 'Autoriser la création de comptes', icon: 'account-plus', color: '#2BEE79' },
        { key: 'requirePhoneVerification', label: 'Vérification téléphone', desc: 'Obligatoire à l\'inscription', icon: 'phone-check', color: '#42A5F5' },
      ],
    },
    {
      title: 'Sécurité',
      items: [
        { key: 'kioskModeEnabled', label: 'Mode kiosque', desc: 'Active les kiosques de paiement', icon: 'store', color: '#AB47BC' },
        { key: 'aIModeration', label: 'Modération IA', desc: 'Auto-modération des contenus', icon: 'robot', color: '#26C6DA' },
        { key: 'twoFactorAuth', label: '2FA admin', desc: 'Authentification à deux facteurs', icon: 'shield-key', color: '#FF5252' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Paramètres</Text>
          <Text style={styles.subtitle}>Configuration de l'application</Text>
        </View>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <MaterialCommunityIcons name="refresh" size={22} color="#2BEE79" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {settingGroups.map((group, gi) => (
          <View key={gi} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, i) => (
                <View key={item.key} style={[styles.row, i < group.items.length - 1 && styles.rowBorder]}>
                  <View style={[styles.rowIcon, { backgroundColor: item.color + '22' }]}>
                    <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Text style={styles.rowDesc}>{item.desc}</Text>
                  </View>
                  <Switch
                    value={settings[item.key]}
                    onValueChange={() => toggle(item.key)}
                    trackColor={{ false: '#37474F', true: '#2BEE7988' }}
                    thumbColor={settings[item.key] ? '#2BEE79' : '#8B9BAE'}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Intelligence Artificielle</Text>
          <View style={styles.groupCard}>
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: '#26C6DA22' }]}>
                <MaterialCommunityIcons name="key-variant" size={20} color="#26C6DA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Clé API IA (Gemini / OpenAI)</Text>
                <Text style={styles.rowDesc}>Utilisée pour la modération automatique</Text>
              </View>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={aiKey}
                onChangeText={setAiKey}
                placeholder="sk-..."
                placeholderTextColor="#8B9BAE"
                secureTextEntry
              />
              <TouchableOpacity style={styles.saveBtn} onPress={saveAiKey}>
                <Text style={styles.saveBtnText}>Sauver</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Maintenance</Text>
          <View style={styles.groupCard}>
            <Text style={styles.rowLabel}>Message affiché aux utilisateurs</Text>
            <TextInput
              style={[styles.input, { marginTop: 8, minHeight: 80, textAlignVertical: 'top' }]}
              value={maintenanceMsg}
              onChangeText={setMaintenanceMsg}
              placeholder="L'application est en maintenance, merci de votre patience..."
              placeholderTextColor="#8B9BAE"
              multiline
            />
            <TouchableOpacity style={[styles.saveBtn, { marginTop: 8, alignSelf: 'flex-end' }]} onPress={saveMaintenance}>
              <Text style={styles.saveBtnText}>Sauver le message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Zone danger</Text>
          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() => Alert.alert('Action irréversible', 'Vider le cache de tous les utilisateurs ?', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Confirmer', style: 'destructive', onPress: () => Alert.alert('Cache vidé') },
            ])}
          >
            <MaterialCommunityIcons name="cached" size={18} color="#FF5252" />
            <Text style={styles.dangerBtnText}>Vider le cache global</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() => Alert.alert('Action irréversible', 'Forcer la synchro de tous les appareils ?', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Confirmer', onPress: () => Alert.alert('Synchro forcée') },
            ])}
          >
            <MaterialCommunityIcons name="sync" size={18} color="#FFA726" />
            <Text style={styles.dangerBtnText}>Forcer la synchronisation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Yabisso v:0.0.7</Text>
          <Text style={styles.footerText}>Build: 2026.06.02</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#8B9BAE', fontSize: 13, marginTop: 2 },
  refreshBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#8B9BAE', textAlign: 'center', marginTop: 60 },
  content: { flex: 1, paddingHorizontal: 16 },
  group: { marginBottom: 20 },
  groupTitle: { color: '#8B9BAE', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  groupCard: { backgroundColor: '#16213e', borderRadius: 12, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#0E151B' },
  rowIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  rowDesc: { color: '#8B9BAE', fontSize: 12, marginTop: 2 },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: { flex: 1, backgroundColor: '#0E151B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#FFF', fontSize: 13 },
  saveBtn: { backgroundColor: '#2BEE79', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  saveBtnText: { color: '#0E151B', fontSize: 13, fontWeight: '700' },
  dangerZone: { backgroundColor: '#FF525215', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FF525244' },
  dangerTitle: { color: '#FF5252', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  dangerBtnText: { color: '#FF5252', fontSize: 14, fontWeight: '600' },
  footer: { alignItems: 'center', paddingVertical: 16, gap: 2 },
  footerText: { color: '#8B9BAE', fontSize: 11 },
});
