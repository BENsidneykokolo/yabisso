import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
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

const PAST_RESULTS = [
  { id: '1', home: 'PSG', away: 'Marseille', score: '3 - 1', date: '11 Mai', competition: 'Ligue 1', result: 'won', payout: 142.00, odds: 1.42 },
  { id: '2', home: 'Liverpool', away: 'Chelsea', score: '2 - 2', date: '10 Mai', competition: 'Premier League', result: 'lost', payout: 0, odds: 2.30 },
  { id: '3', home: 'Real Madrid', away: 'Sevilla', score: '4 - 0', date: '09 Mai', competition: 'La Liga', result: 'won', payout: 85.50, odds: 1.71 },
  { id: '4', home: 'Bayern', away: 'Leverkusen', score: '2 - 1', date: '08 Mai', competition: 'Bundesliga', result: 'won', payout: 123.00, odds: 1.85 },
  { id: '5', home: 'Juventus', away: 'Inter', score: '1 - 1', date: '07 Mai', competition: 'Serie A', result: 'lost', payout: 0, odds: 3.20 },
  { id: '6', home: 'Lakers', away: 'Warriors', score: '108 - 105', date: '06 Mai', competition: 'NBA', result: 'won', payout: 95.00, odds: 1.90 },
  { id: '7', home: 'Djokovic', away: 'Nadal', score: '2 - 1', date: '05 Mai', competition: 'ATP', result: 'won', payout: 75.00, odds: 1.50 },
  { id: '8', home: 'Barca', away: 'Atletico', score: '1 - 2', date: '04 Mai', competition: 'La Liga', result: 'lost', payout: 0, odds: 2.80 },
];

const BettingResultsScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Gagnes', 'Perdus', 'Jour', 'Semaine', 'Mois'];

  const filteredResults = PAST_RESULTS.filter(r => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Gagnes') return r.result === 'won';
    if (selectedFilter === 'Perdus') return r.result === 'lost';
    return true;
  });

  const renderResultCard = (result) => (
    <TouchableOpacity key={result.id} style={styles.resultCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.competitionBadge}>{result.competition}</Text>
        <Text style={styles.dateText}>{result.date}</Text>
      </View>

      <View style={styles.matchSection}>
        <View style={styles.teamContainer}>
          <Text style={styles.teamLogo}>⚽</Text>
          <Text style={styles.teamName}>{result.home}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{result.score}</Text>
          <View style={[styles.resultBadge, { backgroundColor: result.result === 'won' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)' }]}>
            <Text style={[styles.resultText, { color: result.result === 'won' ? COLORS.primary : '#ef4444' }]}>
              {result.result === 'won' ? 'Gagne' : 'Perdu'}
            </Text>
          </View>
        </View>
        <View style={styles.teamContainer}>
          <Text style={styles.teamLogo}>⚽️</Text>
          <Text style={styles.teamName}>{result.away}</Text>
        </View>
      </View>

      <View style={styles.footerSection}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Cote</Text>
          <Text style={styles.footerValue}>{result.odds.toFixed(2)}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Gain</Text>
          <Text style={[styles.footerValue, result.payout > 0 && styles.wonFooterValue]}>
            {result.payout > 0 ? `${result.payout.toFixed(2)} €` : '—'}
          </Text>
        </View>
        <View style={styles.payoutBadge}>
          <Ionicons name={result.payout > 0 ? 'trending-up' : 'trending-neutral'} size={14} color={result.payout > 0 ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.payoutText, { color: result.payout > 0 ? COLORS.primary : COLORS.textSecondary }]}>
            {result.payout > 0 ? `+${result.payout} €` : '0 €'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const calculateStats = () => {
    const total = PAST_RESULTS.length;
    const won = PAST_RESULTS.filter(r => r.result === 'won').length;
    const totalPayout = PAST_RESULTS.reduce((acc, r) => acc + (r.payout || 0), 0);
    const winRate = total > 0 ? ((won / total) * 100).toFixed(1) : 0;
    return { total, won, totalPayout, winRate };
  };

  const stats = calculateStats();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resultats</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="download-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Paris</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.winRate}%</Text>
          <Text style={styles.statLabel}>Taux Victoire</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.yellow }]}>{stats.totalPayout.toFixed(0)} €</Text>
          <Text style={styles.statLabel}>Gains Totals</Text>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredResults.map(renderResultCard)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  backButton: { padding: 4 },
  statsCard: { flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 14, padding: 16, marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  filtersContainer: { paddingVertical: 8 },
  filtersList: { paddingHorizontal: 16, gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.surface },
  filterButtonActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  filterTextActive: { color: COLORS.text, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  resultCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  competitionBadge: { color: COLORS.primary, fontSize: 12, backgroundColor: 'rgba(34,197,94,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontWeight: '500' },
  dateText: { color: COLORS.textSecondary, fontSize: 12 },
  matchSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  teamContainer: { alignItems: 'center', flex: 1 },
  teamLogo: { fontSize: 28, marginBottom: 6 },
  teamName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  scoreContainer: { alignItems: 'center' },
  score: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  resultBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  resultText: { fontSize: 11, fontWeight: '600' },
  footerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 10, padding: 12 },
  footerItem: { alignItems: 'center' },
  footerLabel: { color: COLORS.textSecondary, fontSize: 11 },
  footerValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  wonFooterValue: { color: COLORS.primary },
  payoutBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  payoutText: { fontSize: 13, fontWeight: '600' },
});

export default BettingResultsScreen;