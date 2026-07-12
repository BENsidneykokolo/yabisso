import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AI_FEATURES = [
  { key: 'contentModeration', label: 'Modération automatique', desc: 'Détection contenus inappropriés', icon: 'shield-search', color: '#FF5252', enabled: true, accuracy: 94 },
  { key: 'productPricing', label: 'Suggestions de prix', desc: 'Prix optimal pour les produits', icon: 'tag-multiple', color: '#FFA726', enabled: true, accuracy: 87 },
  { key: 'fraudDetection', label: 'Détection de fraude', desc: 'Bloque les transactions suspectes', icon: 'alert-decagram', color: '#AB47BC', enabled: true, accuracy: 96 },
  { key: 'demandForecast', label: 'Prédiction de demande', desc: 'Anticipe les pics d\'usage', icon: 'chart-bell-curve', color: '#42A5F5', enabled: true, accuracy: 82 },
  { key: 'recommendations', label: 'Recommandations', desc: 'Suggestions personnalisées Loba', icon: 'robot-love', color: '#2BEE79', enabled: true, accuracy: 89 },
  { key: 'sentimentAnalysis', label: 'Analyse sentiments', desc: 'Évalue l\'humeur des avis', icon: 'emoticon-happy', color: '#26C6DA', enabled: false, accuracy: 78 },
  { key: 'chatbotSupport', label: 'Chatbot support', desc: 'Assistant IA dans le chat', icon: 'robot', color: '#7E57C2', enabled: false, accuracy: 71 },
  { key: 'voiceTranslation', label: 'Traduction vocale', desc: 'Traduit les messages audio', icon: 'translate', color: '#EC407A', enabled: false, accuracy: 68 },
];

const RECENT_DECISIONS = [
  { time: 'Il y a 2 min', action: 'Post bloqué', reason: 'Contenu inapproprié', confidence: 96, type: 'block' },
  { time: 'Il y a 8 min', action: 'Prix suggéré', reason: 'Produit: iPhone 11 → 285 000 FCFA', confidence: 87, type: 'suggest' },
  { time: 'Il y a 15 min', action: 'Transaction bloquée', reason: 'Pattern frauduleux détecté', confidence: 99, type: 'block' },
  { time: 'Il y a 32 min', action: 'Recommandation', reason: '12 utilisateurs ont vu cette suggestion', confidence: 89, type: 'suggest' },
  { time: 'Il y a 1h', action: 'Post approuvé', reason: 'Aucun risque détecté', confidence: 92, type: 'approve' },
];

const TRAINING_DATA = [
  { label: 'Posts analysés', value: 1247, icon: 'post', color: '#2BEE79' },
  { label: 'Produits optimisés', value: 892, icon: 'shopping', color: '#FFA726' },
  { label: 'Fraudes bloquées', value: 34, icon: 'shield-alert', color: '#FF5252' },
  { label: 'Recommandations', value: 5621, icon: 'robot-love', color: '#AB47BC' },
];

export default function SuperAdminAIScreen({ onBack }) {
  const [features, setFeatures] = useState(AI_FEATURES);
  const [autoMode, setAutoMode] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiThinking, setAiThinking] = useState(false);

  function toggleFeature(key) {
    setFeatures(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  }

  async function askAI() {
    if (!prompt.trim()) return;
    setAiThinking(true);
    setAiResponse('');
    setTimeout(() => {
      const responses = [
        `D'après l'analyse de vos données, je recommande d'activer la modération IA sur les nouveaux posts du marché. 23 contenus suspects ont été détectés cette semaine.\n\nAction suggérée: Activer "Modération automatique" avec seuil 85%.`,
        `Tendance détectée: Forte croissance des commandes taxi entre 18h-20h (+34%).\n\nRecommandation: Augmenter le nombre de chauffeurs disponibles aux heures de pointe. Réduire le temps d'attente moyen estimé: 4.2 min.`,
        `Analyse fraude: 3 comptes suspects identifiés pour multi-comptes (signaux: même device fingerprint, IP identique, comportements synchronisés).\n\nAction: Suspendre les comptes en attendant vérification manuelle.`,
        `Performance des kiosques: Kiosque #2 (Marché Central) a 23% de panne ce mois.\n\nDiagnostic probable: Problème de connectivité réseau. Recommandation: Vérifier l'antenne WiFi et activer le mode offline-first.`,
      ];
      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
      setAiThinking(false);
    }, 1500);
  }

  const enabledCount = features.filter(f => f.enabled).length;
  const avgAccuracy = Math.round(features.filter(f => f.enabled).reduce((sum, f) => sum + f.accuracy, 0) / Math.max(enabledCount, 1));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Intelligence Artificielle</Text>
          <Text style={styles.subtitle}>{enabledCount}/{features.length} modèles actifs</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="brain" size={28} color="#0E151B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Yabisso AI Engine</Text>
              <Text style={styles.heroSubtitle}>Moteur IA central</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: autoMode ? '#2BEE79' : '#8B9BAE' }]} />
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{avgAccuracy}%</Text>
              <Text style={styles.heroStatLabel}>Précision moyenne</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{TRAINING_DATA.reduce((s, d) => s + d.value, 0).toLocaleString()}</Text>
              <Text style={styles.heroStatLabel}>Données traitées</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{confidenceThreshold}%</Text>
              <Text style={styles.heroStatLabel}>Seuil confiance</Text>
            </View>
          </View>
        </View>

        <View style={styles.autoModeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Mode automatique</Text>
            <Text style={styles.desc}>L'IA prend des décisions seule</Text>
          </View>
          <Switch
            value={autoMode}
            onValueChange={setAutoMode}
            trackColor={{ false: '#37474F', true: '#2BEE7988' }}
            thumbColor={autoMode ? '#2BEE79' : '#8B9BAE'}
          />
        </View>

        <Text style={styles.section}>Modèles IA</Text>
        <View style={styles.featuresGrid}>
          {features.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.featureCard, !f.enabled && { opacity: 0.5 }]}
              onPress={() => toggleFeature(f.key)}
            >
              <View style={[styles.featureIcon, { backgroundColor: f.color + '22' }]}>
                <MaterialCommunityIcons name={f.icon} size={20} color={f.color} />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
              <View style={styles.featureFooter}>
                <View style={styles.accuracyBar}>
                  <View style={[styles.accuracyFill, { width: f.accuracy + '%', backgroundColor: f.color }]} />
                </View>
                <Text style={styles.accuracyText}>{f.accuracy}%</Text>
              </View>
              {f.enabled && <View style={[styles.enabledDot, { backgroundColor: f.color }]} />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.section}>Données d'entraînement</Text>
        <View style={styles.trainingRow}>
          {TRAINING_DATA.map((d, i) => (
            <View key={i} style={styles.trainingCard}>
              <MaterialCommunityIcons name={d.icon} size={20} color={d.color} />
              <Text style={styles.trainingValue}>{d.value.toLocaleString()}</Text>
              <Text style={styles.trainingLabel}>{d.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Décisions récentes</Text>
        <View style={styles.decisionsCard}>
          {RECENT_DECISIONS.map((d, i) => (
            <View key={i} style={[styles.decisionRow, i < RECENT_DECISIONS.length - 1 && styles.decisionBorder]}>
              <View style={[styles.decisionIcon, { backgroundColor: d.type === 'block' ? '#FF525222' : d.type === 'suggest' ? '#42A5F522' : '#2BEE7922' }]}>
                <MaterialCommunityIcons
                  name={d.type === 'block' ? 'close' : d.type === 'suggest' ? 'lightbulb' : 'check'}
                  size={16}
                  color={d.type === 'block' ? '#FF5252' : d.type === 'suggest' ? '#42A5F5' : '#2BEE79'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.decisionAction}>{d.action}</Text>
                <Text style={styles.decisionReason}>{d.reason}</Text>
                <Text style={styles.decisionTime}>{d.time} • Confiance: {d.confidence}%</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Assistant IA</Text>
        <View style={styles.chatCard}>
          <Text style={styles.label}>Posez une question à Yabisso AI</Text>
          <TextInput
            style={[styles.input, { marginTop: 8, minHeight: 80, textAlignVertical: 'top' }]}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Ex: Quels contenus devraient être supprimés cette semaine ?"
            placeholderTextColor="#8B9BAE"
            multiline
          />
          <TouchableOpacity
            style={[styles.askBtn, aiThinking && { opacity: 0.6 }]}
            onPress={askAI}
            disabled={aiThinking}
          >
            <MaterialCommunityIcons name={aiThinking ? 'loading' : 'magic-staff'} size={18} color="#0E151B" />
            <Text style={styles.askBtnText}>{aiThinking ? 'Réflexion...' : 'Demander à l\'IA'}</Text>
          </TouchableOpacity>

          {aiResponse ? (
            <View style={styles.responseBox}>
              <View style={styles.responseHeader}>
                <MaterialCommunityIcons name="brain" size={16} color="#2BEE79" />
                <Text style={styles.responseLabel}>Réponse IA</Text>
              </View>
              <Text style={styles.responseText}>{aiResponse}</Text>
            </View>
          ) : null}
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
  heroCard: { backgroundColor: '#2BEE79', borderRadius: 16, padding: 16, marginBottom: 16 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  heroIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#0E151B', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#0E151B', fontSize: 16, fontWeight: '700' },
  heroSubtitle: { color: '#0E151B99', fontSize: 12 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  heroStats: { flexDirection: 'row', backgroundColor: '#0E151B22', borderRadius: 12, padding: 12 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: '#0E151B', fontSize: 16, fontWeight: '700' },
  heroStatLabel: { color: '#0E151B99', fontSize: 10, marginTop: 2, textAlign: 'center' },
  heroStatDivider: { width: 1, backgroundColor: '#0E151B33' },
  autoModeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 12, padding: 14, marginBottom: 16, gap: 12 },
  label: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  desc: { color: '#8B9BAE', fontSize: 12, marginTop: 2 },
  section: { color: '#8B9BAE', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10, marginTop: 8, letterSpacing: 0.5 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  featureCard: { width: '48.5%', backgroundColor: '#16213e', borderRadius: 12, padding: 12, position: 'relative' },
  featureIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  featureLabel: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  featureDesc: { color: '#8B9BAE', fontSize: 11, marginTop: 2, marginBottom: 8 },
  featureFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  accuracyBar: { flex: 1, height: 4, backgroundColor: '#0E151B', borderRadius: 2, overflow: 'hidden' },
  accuracyFill: { height: '100%', borderRadius: 2 },
  accuracyText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  enabledDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
  trainingRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  trainingCard: { flex: 1, backgroundColor: '#16213e', borderRadius: 10, padding: 10, alignItems: 'center' },
  trainingValue: { color: '#FFF', fontSize: 14, fontWeight: '700', marginTop: 6 },
  trainingLabel: { color: '#8B9BAE', fontSize: 10, marginTop: 2, textAlign: 'center' },
  decisionsCard: { backgroundColor: '#16213e', borderRadius: 12, padding: 8, marginBottom: 16 },
  decisionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, paddingHorizontal: 8 },
  decisionBorder: { borderBottomWidth: 1, borderBottomColor: '#0E151B' },
  decisionIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  decisionAction: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  decisionReason: { color: '#B0BEC5', fontSize: 12, marginTop: 2 },
  decisionTime: { color: '#8B9BAE', fontSize: 11, marginTop: 4 },
  chatCard: { backgroundColor: '#16213e', borderRadius: 12, padding: 14, marginBottom: 16 },
  input: { backgroundColor: '#0E151B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#FFF', fontSize: 14 },
  askBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2BEE79', borderRadius: 10, paddingVertical: 12, marginTop: 10 },
  askBtnText: { color: '#0E151B', fontSize: 13, fontWeight: '700' },
  responseBox: { backgroundColor: '#0E151B', borderRadius: 10, padding: 12, marginTop: 12, borderLeftWidth: 3, borderLeftColor: '#2BEE79' },
  responseHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  responseLabel: { color: '#2BEE79', fontSize: 12, fontWeight: '700' },
  responseText: { color: '#FFF', fontSize: 13, lineHeight: 19 },
});
