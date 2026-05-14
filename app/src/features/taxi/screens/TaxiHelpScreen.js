import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const faqs = [
  { q: 'Comment commander un taxi ?', a: 'Entrez votre point de depart et destination, selectionnez un type de vehicule, puis cliquez sur Confirmer.' },
  { q: 'Comment payer ma course ?', a: 'Vous pouvez payer avec Yabisso Wallet, Orange Money, MTN MoMo ou en especes au chauffeur.' },
  { q: 'Puis-je annuler ma course ?', a: 'Oui, vous pouvez annuler avant que le chauffeur n\'accepte. Apres, des frais d\'annulation peuvent s\'appliquer.' },
  { q: 'Comment devenir chauffeur Yabisso ?', a: 'Contactez l\'equipe Yabisso pour obtenir un code d\'acces chauffeur. Vous devez avoir un vehicule en bon etat.' },
  { q: 'Comment contacter le support ?', a: 'Appelez le +225 07 00 00 00 00 ou ecrivez a support@yabisso.com' },
];

export default function TaxiHelpScreen({ onBack, onNavigate }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Aide et support</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#64748b" />
        <TextInput style={styles.searchInput} placeholder="Rechercher dans l'aide..." placeholderTextColor="#64748b" value={search} onChangeText={setSearch} />
      </View>

      <View style={styles.quickActions}>
        <Pressable style={styles.quickBtn} onPress={() => onNavigate?.('taxi_emergency')}><MaterialCommunityIcons name="alert-circle" size={22} color="#ef4444" /><Text style={styles.quickBtnLabel}>Urgence</Text></Pressable>
        <Pressable style={styles.quickBtn} onPress={() => {}}><MaterialCommunityIcons name="phone" size={22} color="#22c55e" /><Text style={styles.quickBtnLabel}>Appeler</Text></Pressable>
        <Pressable style={styles.quickBtn} onPress={() => {}}><MaterialCommunityIcons name="email" size={22} color="#137fec" /><Text style={styles.quickBtnLabel}>Email</Text></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={styles.sectionTitle}>Questions frequentes</Text>
        {filtered.map((faq, i) => (
          <Pressable key={i} style={styles.faqCard} onPress={() => setExpanded(expanded === i ? null : i)}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <MaterialCommunityIcons name={expanded === i ? 'chevron-up' : 'chevron-down'} size={20} color="#64748b" />
            </View>
            {expanded === i && <Text style={styles.faqAnswer}>{faq.a}</Text>}
          </Pressable>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  quickActions: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 16, marginBottom: 8, gap: 10 },
  quickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#1c2630', borderRadius: 12, paddingVertical: 14 },
  quickBtnLabel: { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 16 },
  faqCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16, marginBottom: 10 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQuestion: { flex: 1, color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginRight: 10 },
  faqAnswer: { color: '#94A3B8', fontSize: 13, lineHeight: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
});