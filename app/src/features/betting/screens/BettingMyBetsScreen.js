import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#0E151B',
  surface: '#1a2332',
  card: '#243447',
  primary: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#334155',
};

const TABS = ['En cours', 'Gagnes', 'Perdus', 'Historique'];

const MOCK_BETS = [
  { id: '1', date: '12 Mai 2026', matches: 'PSG vs OM', selection: 'PSG win', odds: 1.42, stake: 25, result: 'won', payout: 35.50 },
  { id: '2', date: '11 Mai 2026', matches: 'Liverpool vs Arsenal', selection: 'Liverpool win', odds: 2.10, stake: 50, result: 'pending', payout: null },
  { id: '3', date: '10 Mai 2026', matches: 'Real vs Barca', selection: 'Draw', odds: 3.20, stake: 30, result: 'lost', payout: 0 },
  { id: '4', date: '09 Mai 2026', matches: 'Bayern vs BVB', selection: 'Over 2.5', odds: 1.85, stake: 40, result: 'won', payout: 74.00 },
  { id: '5', date: '08 Mai 2026', matches: 'Juventus vs Inter', selection: 'Inter win', odds: 3.40, stake: 20, result: 'won', payout: 68.00 },
  { id: '6', date: '07 Mai 2026', matches: 'Lakers vs Celtics', selection: 'Lakers win', odds: 1.90, stake: 35, result: 'lost', payout: 0 },
];

const BettingMyBetsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('En cours');
  const [dateRange, setDateRange] = useState('All');

  const filteredBets = MOCK_BETS.filter(bet => {
    if (activeTab === 'En cours') return bet.result === 'pending';
    if (activeTab === 'Gagnes') return bet.result === 'won';
    if (activeTab === 'Perdus') return bet.result === 'lost';
    return true;
  });

  const renderResultBadge = (result) => {
    const config = {
      won: { bg: 'rgba(34,197,94,0.2)', color: COLORS.primary, label: 'Gagne' },
      lost: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444', label: 'Perdu' },
      pending: { bg: 'rgba(234,179,8,0.2)', color: COLORS.yellow, label: 'En cours' },
    };
    const { bg, color, label } = config[result] || config.pending;
    return (
      <View style={[styles.resultBadge, { backgroundColor: bg }]}>
        <Text style={[styles.resultText, { color }]}>{label}</Text>
      </View>
    );
  };

  const renderBetCard = (bet) => (
    <TouchableOpacity key={bet.id} style={styles.betCard}>
      <View style={styles.betHeader}>
        <Text style={styles.betDate}>{bet.date}</Text>
        {renderResultBadge(bet.result)}
      </View>
      
      <View style={styles.matchSection}>
        <Text style={styles.matchName}>{bet.matches}</Text>
        <Text style={styles.selectionText}>{bet.selection}</Text>
      </View>

      <View style={styles.oddsRow}>
        <View style={styles.oddsItem}>
          <Text style={styles.oddsLabel}>Cote</Text>
          <Text style={styles.oddsValue}>{bet.odds.toFixed(2)}</Text>
        </View>
        <View style={styles.oddsItem}>
          <Text style={styles.oddsLabel}>Mise</Text>
          <Text style={styles.oddsValue}>{bet.stake} €</Text>
        </View>
        <View style={styles.oddsItem}>
          <Text style={styles.oddsLabel}>Gain</Text>
          <Text style={[styles.oddsValue, bet.result === 'won' && styles.wonOddsValue]}>
            {bet.payout !== null ? `${bet.payout.toFixed(2)} €` : '—'}
          </Text>
        </View>
      </View>

      {bet.result !== 'pending' && (
        <View style={styles.statusRow}>
          <MaterialCommunityIcons
            name={bet.result === 'won' ? 'check-circle' : 'close-circle'}
            size={16}
            color={bet.result === 'won' ? COLORS.primary : '#ef4444'}
          />
          <Text style={[styles.statusText, { color: bet.result === 'won' ? COLORS.primary : '#ef4444' }]}>
            {bet.result === 'won' ? `+${(bet.payout - bet.stake).toFixed(2)} €` : `-${bet.stake} €`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="ticket-outline" size={60} color={COLORS.card} />
      <Text style={styles.emptyTitle}>Aucun Pari</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'En cours' ? 'Vos paris en cours apparaitront ici' :
         activeTab === 'Gagnes' ? 'Vos paris gagnants apparaitront ici' :
         activeTab === 'Perdus' ? 'Vos paris perdus apparaitront ici' :
         'Aucun historique disponible'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Paris</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsList}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.dateFilterContainer}>
        <View style={styles.dateFilter}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <TextInput style={styles.dateInput} value={dateRange} onChangeText={setDateRange} placeholder="Filtrer par date" placeholderTextColor={COLORS.textSecondary} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredBets.length > 0 ? filteredBets.map(renderBetCard) : renderEmptyState()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  backButton: { padding: 4 },
  tabsContainer: { paddingVertical: 8 },
  tabsList: { paddingHorizontal: 16, gap: 8 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.surface },
  tabButtonActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: COLORS.text, fontWeight: '600' },
  dateFilterContainer: { paddingHorizontal: 16, marginBottom: 16 },
  dateFilter: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  dateInput: { flex: 1, color: COLORS.text, fontSize: 14, marginLeft: 8 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  betCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12 },
  betHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  betDate: { color: COLORS.textSecondary, fontSize: 13 },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  resultText: { fontSize: 12, fontWeight: '600' },
  matchSection: { marginBottom: 12 },
  matchName: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  selectionText: { color: COLORS.primary, fontSize: 13 },
  oddsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 10, padding: 12 },
  oddsItem: { alignItems: 'center', flex: 1 },
  oddsLabel: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 4 },
  oddsValue: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  wonOddsValue: { color: COLORS.primary },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 8 },
  statusText: { fontSize: 13, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8 },
});

export default BettingMyBetsScreen;