import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

const FILTERS = ['Tous', 'Foot', 'Basketball', 'Tennis'];

const LIVE_MATCHES = [
  { id: '1', home: 'PSG', away: 'Marseille', homeLogo: '⚽', awayLogo: '⚽️', score: '2 - 1', time: '67\'', competition: 'Ligue 1', odds: { home: 1.42, draw: 4.50, away: 6.00 }, markets: 45, sport: 'foot' },
  { id: '2', home: 'Liverpool', away: 'Arsenal', homeLogo: '⚽', awayLogo: '⚽️', score: '1 - 1', time: '34\'', competition: 'Premier League', odds: { home: 2.10, draw: 3.40, away: 3.80 }, markets: 38, sport: 'foot' },
  { id: '3', home: 'Real Madrid', away: 'Barcelona', homeLogo: '⚽', awayLogo: '⚽️', score: '0 - 0', time: '12\'', competition: 'La Liga', odds: { home: 2.80, draw: 3.20, away: 2.50 }, markets: 52, sport: 'foot' },
  { id: '4', home: 'Lakers', away: 'Celtics', homeLogo: '🏀', awayLogo: '🏀️', score: '78 - 82', time: 'Q3 5:32', competition: 'NBA', odds: { home: 1.90, draw: 2.10, away: 2.80 }, markets: 32, sport: 'basketball' },
  { id: '5', home: 'Djokovic', away: 'Nadal', homeLogo: '🎾', awayLogo: '🎾️', score: '1 - 0', time: 'Set 2', competition: 'ATP', odds: { home: 1.50, draw: null, away: 2.60 }, markets: 18, sport: 'tennis' },
  { id: '6', home: 'Bayern', away: 'Dortmund', homeLogo: '⚽', awayLogo: '⚽️', score: '1 - 2', time: '89\'', competition: 'Bundesliga', odds: { home: 1.85, draw: 3.60, away: 4.20 }, markets: 41, sport: 'foot' },
];

const BettingLiveScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [selectedBets, setSelectedBets] = useState([]);

  const filteredMatches = activeFilter === 'Tous'
    ? LIVE_MATCHES
    : LIVE_MATCHES.filter(m => m.sport === activeFilter.toLowerCase().replace('ball', '').replace('nis', ''));

  const addToBetSlip = (match, selection, odds) => {
    setSelectedBets(prev => [...prev, { match, selection, odds, potentialWin: odds * 10 }]);
  };

  const renderMatchCard = (match) => (
    <TouchableOpacity
      key={match.id}
      style={styles.matchCard}
      onPress={() => navigation.navigate('MatchDetail', { match })}
    >
      <View style={styles.matchHeader}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN DIRECT</Text>
        </View>
        <Text style={styles.competition}>{match.competition}</Text>
      </View>

      <View style={styles.teamsContainer}>
        <View style={styles.teamColumn}>
          <Text style={styles.teamLogo}>{match.homeLogo}</Text>
          <Text style={styles.teamName}>{match.home}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{match.score}</Text>
          <Text style={styles.matchTime}>{match.time}</Text>
        </View>
        <View style={styles.teamColumn}>
          <Text style={styles.teamLogo}>{match.awayLogo}</Text>
          <Text style={styles.teamName}>{match.away}</Text>
        </View>
      </View>

      <View style={styles.oddsContainer}>
        <TouchableOpacity style={[styles.oddButton, styles.homeOdd]} onPress={() => addToBetSlip(match, `${match.home} win`, match.odds.home)}>
          <Text style={styles.oddLabel}>1</Text>
          <Text style={styles.oddValue}>{match.odds.home.toFixed(2)}</Text>
        </TouchableOpacity>
        {match.odds.draw && (
          <TouchableOpacity style={styles.oddButton} onPress={() => addToBetSlip(match, 'Draw', match.odds.draw)}>
            <Text style={styles.oddLabel}>X</Text>
            <Text style={styles.oddValue}>{match.odds.draw.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.oddButton, styles.awayOdd]} onPress={() => addToBetSlip(match, `${match.away} win`, match.odds.away)}>
          <Text style={styles.oddLabel}>2</Text>
          <Text style={styles.oddValue}>{match.odds.away.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.marketsFooter}>
        <MaterialCommunityIcons name="chart-line" size={14} color={COLORS.textSecondary} />
        <Text style={styles.marketsText}>{match.markets} markets</Text>
        <TouchableOpacity style={styles.viewMarketsButton}>
          <Text style={styles.viewMarketsText}>Voir marchés</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>En Direct</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredMatches.map(renderMatchCard)}
      </ScrollView>

      {selectedBets.length > 0 && (
        <TouchableOpacity
          style={styles.betSlipButton}
          onPress={() => navigation.navigate('BetSlip', { bets: selectedBets })}
        >
          <View style={styles.betSlipContent}>
            <MaterialCommunityIcons name="ticket-percent" size={20} color={COLORS.text} />
            <Text style={styles.betSlipText}>{selectedBets.length} pari(s)</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  filtersContainer: { paddingVertical: 8 },
  filtersList: { paddingHorizontal: 16, gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.surface },
  filterButtonActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  filterTextActive: { color: COLORS.text, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  matchCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  liveText: { color: '#ef4444', fontSize: 11, fontWeight: '600' },
  competition: { color: COLORS.textSecondary, fontSize: 12 },
  teamsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  teamColumn: { alignItems: 'center', flex: 1 },
  teamLogo: { fontSize: 32, marginBottom: 8 },
  teamName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  scoreContainer: { alignItems: 'center', backgroundColor: COLORS.card, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  score: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
  matchTime: { color: COLORS.orange, fontSize: 12, marginTop: 4 },
  oddsContainer: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  oddButton: { flex: 1, backgroundColor: COLORS.card, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  homeOdd: { borderTopColor: COLORS.primary, borderTopWidth: 3 },
  awayOdd: { borderTopColor: COLORS.orange, borderTopWidth: 3 },
  oddLabel: { color: COLORS.textSecondary, fontSize: 12 },
  oddValue: { color: COLORS.text, fontSize: 16, fontWeight: '600', marginTop: 2 },
  marketsFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  marketsText: { color: COLORS.textSecondary, fontSize: 12, flex: 1 },
  viewMarketsButton: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewMarketsText: { color: COLORS.primary, fontSize: 12, fontWeight: '500' },
  betSlipButton: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: COLORS.primary, borderRadius: 14, overflow: 'hidden' },
  betSlipContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  betSlipText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
});

export default BettingLiveScreen;