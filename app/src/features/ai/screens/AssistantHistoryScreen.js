import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const conversations = [
  { id: 1, title: 'Réservation restaurant', preview: 'Je veux réserver un restaurant pour 2...', time: '2h', unread: true },
  { id: 2, title: 'Commande pharmacy', preview: 'Commander du paracétamol ASAP', time: '5h', unread: true },
  { id: 3, title: 'Transfert d\'argent', preview: 'Comment envoyer de l\'argent à...', time: '1j', unread: false },
  { id: 4, title: ' Recherche d\'hôtel', preview: 'Trouver un hôtel à Cocody pour...', time: '2j', unread: false },
  { id: 5, title: 'Aide commande', preview: 'Ma commande marketplace n\'est pas...', time: '3j', unread: false },
  { id: 6, title: 'Problème wallet', preview: 'Mon solde n\'apparaît pas correctement', time: '1 sem', unread: false },
];

export default function AssistantHistoryScreen({ onBack, onNavigate }) {
  const [searchText, setSearchText] = useState('');

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(searchText.toLowerCase()) ||
    c.preview.toLowerCase().includes(searchText.toLowerCase())
  );

  const clearHistory = () => {
    Alert.alert('Confirmation', 'Effacer tout l\'historique ?');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Historique</Text>
          <Pressable onPress={clearHistory}>
            <MaterialCommunityIcons name="delete-outline" size={24} color="#ef4444" />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
          <TextInput style={styles.searchInput} placeholder="Rechercher dans l'historique..." placeholderTextColor="#64748b" value={searchText} onChangeText={setSearchText} />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#64748b" />
            </Pressable>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{conversations.length}</Text>
            <Text style={styles.statLabel}>Discussions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{conversations.filter(c => c.unread).length}</Text>
            <Text style={styles.statLabel}>Non lues</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>Ce mois</Text>
          </View>
        </View>

        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionTitle}>Discussions récentes</Text>
          {filtered.map((conv) => (
            <Pressable
              key={conv.id}
              style={styles.convCard}
              onPress={() => onNavigate?.('assistant')}
            >
              <View style={styles.convIcon}>
                <MaterialCommunityIcons name="chat-processing" size={22} color="#2BEE79" />
                {conv.unread && <View style={styles.unreadDot} />}
              </View>
              <View style={styles.convContent}>
                <View style={styles.convHeader}>
                  <Text style={styles.convTitle}>{conv.title}</Text>
                  <Text style={styles.convTime}>{conv.time}</Text>
                </View>
                <Text style={styles.convPreview} numberOfLines={1}>{conv.preview}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 12, marginHorizontal: 16, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#fff' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 16, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#1c2630', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  sectionsContainer: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  convCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 10 },
  convIcon: { position: 'relative' },
  unreadDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  convContent: { flex: 1, marginLeft: 12 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  convTime: { fontSize: 12, color: '#64748b' },
  convPreview: { fontSize: 13, color: '#64748b', marginTop: 4 },
  bottomSpacer: { height: 40 },
});