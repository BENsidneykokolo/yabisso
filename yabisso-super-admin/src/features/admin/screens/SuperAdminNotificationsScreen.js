import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AUDIENCES = [
  { key: 'all', label: 'Tous les utilisateurs', icon: 'account-group', count: 1247 },
  { key: 'active', label: 'Utilisateurs actifs (7j)', icon: 'account-check', count: 892 },
  { key: 'merchants', label: 'Marchands', icon: 'store', count: 156 },
  { key: 'drivers', label: 'Chauffeurs taxi', icon: 'car', count: 78 },
  { key: 'kiosks', label: 'Opérateurs kiosques', icon: 'store-24-hour', count: 3 },
  { key: 'beta', label: 'Testeurs beta', icon: 'test-tube', count: 24 },
];

const CHANNELS = [
  { key: 'push', label: 'Push', icon: 'bell-ring', color: '#2BEE79' },
  { key: 'sms', label: 'SMS', icon: 'message-text', color: '#42A5F5' },
  { key: 'inapp', label: 'In-App', icon: 'application', color: '#AB47BC' },
  { key: 'email', label: 'Email', icon: 'email', color: '#FFA726' },
];

const TEMPLATES = [
  { id: 1, icon: 'rocket-launch', color: '#2BEE79', title: 'Lancement fonctionnalité', text: 'Découvrez la nouvelle fonctionnalité X sur Yabisso !' },
  { id: 2, icon: 'wrench', color: '#FFA726', title: 'Maintenance planifiée', text: 'L\'application sera en maintenance de 02h à 04h.' },
  { id: 3, icon: 'sale', color: '#FF5252', title: 'Promotion marché', text: '-20% sur tous les produits du marché ce weekend !' },
  { id: 4, icon: 'shield-alert', color: '#AB47BC', title: 'Alerte sécurité', text: 'Nouveau protocole de sécurité activé sur votre compte.' },
];

export default function SuperAdminNotificationsScreen({ onBack }) {
  const [audience, setAudience] = useState('all');
  const [channels, setChannels] = useState(['push', 'inapp']);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  function toggleChannel(key) {
    setChannels(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]);
  }

  function useTemplate(t) {
    setTitle(t.title);
    setBody(t.text);
  }

  async function send() {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Erreur', 'Titre et message requis');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      const audienceObj = AUDIENCES.find(a => a.key === audience);
      Alert.alert(
        'Notification envoyée',
        `${audienceObj.count} utilisateurs notifiés via ${channels.join(', ')}`,
        [{ text: 'OK', onPress: () => { setTitle(''); setBody(''); } }]
      );
    }, 1200);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Broadcast multi-canal</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.section}>1. Audience cible</Text>
        <View style={styles.audienceCard}>
          {AUDIENCES.map((a, i) => (
            <TouchableOpacity
              key={a.key}
              style={[styles.audienceRow, i < AUDIENCES.length - 1 && styles.audienceBorder]}
              onPress={() => setAudience(a.key)}
            >
              <MaterialCommunityIcons name={a.icon} size={20} color={audience === a.key ? '#2BEE79' : '#8B9BAE'} />
              <Text style={[styles.audienceLabel, audience === a.key && { color: '#FFF', fontWeight: '700' }]}>{a.label}</Text>
              <Text style={styles.audienceCount}>{a.count}</Text>
              {audience === a.key && <MaterialCommunityIcons name="check-circle" size={18} color="#2BEE79" />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.section}>2. Canaux d'envoi</Text>
        <View style={styles.channelsRow}>
          {CHANNELS.map(c => {
            const active = channels.includes(c.key);
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.channelChip, active && { backgroundColor: c.color + '22', borderColor: c.color }]}
                onPress={() => toggleChannel(c.key)}
              >
                <MaterialCommunityIcons name={c.icon} size={18} color={active ? c.color : '#8B9BAE'} />
                <Text style={[styles.channelText, active && { color: c.color, fontWeight: '700' }]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.section}>3. Modèles rapides</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templatesScroll}>
          {TEMPLATES.map(t => (
            <TouchableOpacity key={t.id} style={styles.templateCard} onPress={() => useTemplate(t)}>
              <View style={[styles.templateIcon, { backgroundColor: t.color + '22' }]}>
                <MaterialCommunityIcons name={t.icon} size={20} color={t.color} />
              </View>
              <Text style={styles.templateTitle}>{t.title}</Text>
              <Text style={styles.templateText} numberOfLines={2}>{t.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.section}>4. Message</Text>
        <View style={styles.composer}>
          <Text style={styles.label}>Titre</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Titre de la notification"
            placeholderTextColor="#8B9BAE"
            maxLength={60}
          />
          <Text style={[styles.charCount, title.length > 50 && { color: '#FFA726' }]}>{title.length}/60</Text>

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
            value={body}
            onChangeText={setBody}
            placeholder="Écrivez votre message..."
            placeholderTextColor="#8B9BAE"
            multiline
            maxLength={300}
          />
          <Text style={[styles.charCount, body.length > 250 && { color: '#FFA726' }]}>{body.length}/300</Text>
        </View>

        <TouchableOpacity
          style={[styles.sendBtn, sending && { opacity: 0.6 }]}
          onPress={send}
          disabled={sending}
        >
          <MaterialCommunityIcons name={sending ? 'loading' : 'send'} size={20} color="#0E151B" />
          <Text style={styles.sendBtnText}>{sending ? 'Envoi en cours...' : 'Envoyer la notification'}</Text>
        </TouchableOpacity>

        <View style={styles.history}>
          <Text style={styles.section}>Historique récent</Text>
          {[
            { title: 'Maintenance terminée', sent: 1247, time: 'Il y a 2h', channels: ['push', 'inapp'] },
            { title: 'Bienvenue sur Yabisso 0.0.6', sent: 342, time: 'Hier', channels: ['push'] },
            { title: 'Promotion restaurant -30%', sent: 892, time: 'Il y a 3 jours', channels: ['push', 'sms', 'inapp'] },
          ].map((h, i) => (
            <View key={i} style={styles.historyRow}>
              <View style={styles.historyIcon}>
                <MaterialCommunityIcons name="bell-check" size={18} color="#2BEE79" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle}>{h.title}</Text>
                <Text style={styles.historyMeta}>{h.sent} destinataires • {h.time} • {h.channels.join(' + ')}</Text>
              </View>
            </View>
          ))}
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
  content: { flex: 1, paddingHorizontal: 16 },
  section: { color: '#8B9BAE', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10, marginTop: 10, letterSpacing: 0.5 },
  audienceCard: { backgroundColor: '#16213e', borderRadius: 12, padding: 8, marginBottom: 10 },
  audienceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
  audienceBorder: { borderBottomWidth: 1, borderBottomColor: '#0E151B' },
  audienceLabel: { flex: 1, color: '#B0BEC5', fontSize: 13 },
  audienceCount: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  channelsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  channelChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: '#16213e', borderWidth: 1, borderColor: 'transparent' },
  channelText: { color: '#8B9BAE', fontSize: 13, fontWeight: '600' },
  templatesScroll: { gap: 10, paddingRight: 16, paddingBottom: 6 },
  templateCard: { width: 160, backgroundColor: '#16213e', borderRadius: 12, padding: 12 },
  templateIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  templateTitle: { color: '#FFF', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  templateText: { color: '#8B9BAE', fontSize: 11, lineHeight: 14 },
  composer: { backgroundColor: '#16213e', borderRadius: 12, padding: 12, marginBottom: 12 },
  label: { color: '#FFF', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: '#0E151B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#FFF', fontSize: 14 },
  charCount: { color: '#8B9BAE', fontSize: 11, textAlign: 'right', marginTop: 4 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2BEE79', borderRadius: 12, paddingVertical: 14, marginBottom: 20 },
  sendBtnText: { color: '#0E151B', fontSize: 14, fontWeight: '700' },
  history: { marginTop: 10 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#16213e', borderRadius: 10, padding: 12, marginBottom: 8 },
  historyIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2BEE7922', alignItems: 'center', justifyContent: 'center' },
  historyTitle: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  historyMeta: { color: '#8B9BAE', fontSize: 11, marginTop: 2 },
});
