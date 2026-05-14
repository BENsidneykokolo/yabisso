import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
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

const LIVE_MATCHES = [
  { id: '1', home: 'PSG', away: 'Marseille', homeLogo: '⚽', awayLogo: '⚽️', score: '2 - 1', time: '67\'', odds: { home: 1.42, draw: 4.50, away: 6.00 }, markets: 45 },
  { id: '2', home: 'Liverpool', away: 'Arsenal', homeLogo: '⚽', awayLogo: '⚽️', score: '1 - 1', time: '34\'', odds: { home: 2.10, draw: 3.40, away: 3.80 }, markets: 38 },
  { id: '3', home: 'Real Madrid', away: 'Barcelona', homeLogo: '⚽', awayLogo: '⚽️', score: '0 - 0', time: '12\'', odds: { home: 2.80, draw: 3.20, away: 2.50 }, markets: 52 },
];

const UPCOMING_MATCHES = [
  { id: '4', home: 'Bayern', away: 'Dortmund', homeLogo: '⚽', awayLogo: '⚽️', date: 'Demain 20h', league: 'Bundesliga', odds: { home: 1.65, draw: 3.80, away: 4.50 } },
  { id: '5', home: 'Juventus', away: 'Inter', homeLogo: '⚽', awayLogo: '⚽️', date: 'Demain 20h45', league: 'Serie A', odds: { home: 2.20, draw: 3.20, away: 3.40 } },
  { id: '6', home: 'Chelsea', away: 'Man City', homeLogo: '⚽', awayLogo: '⚽️', date: 'Ven. 21h', league: 'Premier League', odds: { home: 3.20, draw: 3.20, away: 2.30 } },
];

const LEAGUES = [
  { id: 'l1', name: 'Ligue 1', icon: '🏆', color: '#1e40af' },
  { id: 'pl', name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#1e3a8a' },
  { id: 'cl', name: 'Champions League', icon: '🌟', color: '#7c3aed' },
  { id: 'll', name: 'La Liga', icon: '💚', color: '#059669' },
];

const BettingHomeScreen = ({ navigation }) => {
  const [balance, setBalance] = useState('1,250.00');
  const [selectedBets, setSelectedBets] = useState([]);

  const addToBetSlip = (match, selection, odds) => {
    setSelectedBets(prev => [...prev, { match, selection, odds, potentialWin: odds * 10 }]);
  };

  const renderLiveMatchCard = (match) => (
    <TouchableOpacity
      key={match.id}
      style={styles.liveCard}
      onPress={() => navigation.navigate('MatchDetail', { match })}
    >
      <View style={styles.liveCardHeader}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN DIRECT</Text>
        </View>
        <Text style={styles.matchTime}>{match.time}</Text>
      </View>
      <View style={styles.teamsRow}>
        <View style={styles.team}>
          <Text style={styles.teamLogo}>{match.homeLogo}</Text>
          <Text style={styles.teamName}>{match.home}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{match.score}</Text>
        </View>
        <View style={styles.team}>
          <Text style={styles.teamLogo}>{match.awayLogo}</Text>
          <Text style={styles.teamName}>{match.away}</Text>
        </View>
      </View>
      <View style={styles.oddsRow}>
        <TouchableOpacity style={styles.oddButton} onPress={() => addToBetSlip(match, `${match.home} win`, match.odds.home)}>
          <Text style={styles.oddLabel}>1</Text>
          <Text style={styles.oddValue}>{match.odds.home.toFixed(2)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.oddButton} onPress={() => addToBetSlip(match, 'Draw', match.odds.draw)}>
          <Text style={styles.oddLabel}>X</Text>
          <Text style={styles.oddValue}>{match.odds.draw.toFixed(2)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.oddButton} onPress={() => addToBetSlip(match, `${match.away} win`, match.odds.away)}>
          <Text style={styles.oddLabel}>2</Text>
          <Text style={styles.oddValue}>{match.odds.away.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.marketsText}>{match.markets} markets</Text>
    </TouchableOpacity>
  );

  const renderUpcomingMatch = (match) => (
    <TouchableOpacity
      key={match.id}
      style={styles.upcomingCard}
      onPress={() => navigation.navigate('MatchDetail', { match })}
    >
      <View style={styles.upcomingHeader}>
        <Text style={styles.leagueBadge}>{match.league}</Text>
        <Text style={styles.matchDate}>{match.date}</Text>
      </View>
      <View style={styles.teamsRow}>
        <Text style={styles.upcomingTeam}>{match.home}</Text>
        <Text style={styles.vsText}>vs</Text>
        <Text style={styles.upcomingTeam}>{match.away}</Text>
      </View>
      <View style={styles.oddsRow}>
        <TouchableOpacity style={styles.oddButton} onPress={() => addToBetSlip(match, `${match.home} win`, match.odds.home)}>
          <Text style={styles.oddLabel}>1</Text>
          <Text style={styles.oddValue}>{match.odds.home.toFixed(2)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.oddButton} onPress={() => addToBetSlip(match, 'Draw', match.odds.draw)}>
          <Text style={styles.oddLabel}>X</Text>
          <Text style={styles.oddValue}>{match.odds.draw.toFixed(2)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.oddButton} onPress={() => addToBetSlip(match, `${match.away} win`, match.odds.away)}>
          <Text style={styles.oddLabel}>2</Text>
          <Text style={styles.oddValue}>{match.odds.away.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paris Sportifs</Text>
        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('MyBets')}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet" size={20} color={COLORS.primary} />
            <Text style={styles.balanceLabel}>Solde Yabisso</Text>
          </View>
          <Text style={styles.balanceAmount}>{balance} €</Text>
          <View style={styles.balanceButtons}>
            <TouchableOpacity style={styles.depositButton}>
              <MaterialCommunityIcons name="arrow-down" size={16} color={COLORS.text} />
              <Text style={styles.depositText}>Depot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.withdrawButton}>
              <MaterialCommunityIcons name="arrow-up" size={16} color={COLORS.text} />
              <Text style={styles.withdrawText}>Retirer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.liveIndicatorHeader}>
            <View style={[styles.liveDot, styles.liveDotLarge]} />
            <Text style={styles.sectionTitle}>En Direct</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('LiveNow')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {LIVE_MATCHES.map(renderLiveMatchCard)}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>A Venir</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Live')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.upcomingList}>
          {UPCOMING_MATCHES.map(renderUpcomingMatch)}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Competitions Populaires</Text>
        </View>

        <View style={styles.leaguesGrid}>
          {LEAGUES.map((league) => (
            <TouchableOpacity
              key={league.id}
              style={[styles.leagueCard, { borderLeftColor: league.color }]}
              onPress={() => {}}
            >
              <Text style={styles.leagueIcon}>{league.icon}</Text>
              <Text style={styles.leagueName}>{league.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {selectedBets.length > 0 && (
        <TouchableOpacity
          style={styles.betSlipButton}
          onPress={() => navigation.navigate('BetSlip', { bets: selectedBets })}
        >
          <View style={styles.betSlipContent}>
            <View style={styles.betSlipInfo}>
              <MaterialCommunityIcons name="ticket-percent" size={20} color={COLORS.text} />
              <Text style={styles.betSlipText}>{selectedBets.length} pari(s)</Text>
            </View>
            <View style={styles.betSlipOdds}>
              <Text style={styles.oddsMultiplier}>
                {selectedBets.reduce((acc, b) => acc * b.odds, 1).toFixed(2)}
              </Text>
              <Text style={styles.potentialWinLabel}>Gain possible</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  notificationButton: { padding: 8 },
  scrollView: { flex: 1 },
  balanceCard: { backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 8, borderRadius: 16, padding: 16 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceLabel: { fontSize: 14, color: COLORS.textSecondary },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
  balanceButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  depositButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 10 },
  withdrawButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.card, paddingVertical: 12, borderRadius: 10 },
  depositText: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  withdrawText: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  liveIndicatorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  liveDotLarge: { width: 10, height: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  seeAllText: { color: COLORS.primary, fontSize: 14 },
  horizontalScroll: { paddingLeft: 16 },
  liveCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginRight: 12, width: 220 },
  liveCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveText: { color: '#ef4444', fontSize: 11, fontWeight: '600' },
  matchTime: { color: COLORS.textSecondary, fontSize: 12 },
  teamsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  team: { alignItems: 'center', flex: 1 },
  teamLogo: { fontSize: 24, marginBottom: 4 },
  teamName: { color: COLORS.text, fontSize: 11, fontWeight: '500' },
  scoreBox: { backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  scoreText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  oddsRow: { flexDirection: 'row', gap: 6 },
  oddButton: { flex: 1, backgroundColor: COLORS.card, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  oddLabel: { color: COLORS.textSecondary, fontSize: 11 },
  oddValue: { color: COLORS.primary, fontSize: 14, fontWeight: '600', marginTop: 2 },
  marketsText: { color: COLORS.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 8 },
  upcomingList: { paddingHorizontal: 16, gap: 12 },
  upcomingCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
  upcomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  leagueBadge: { backgroundColor: COLORS.card, color: COLORS.primary, fontSize: 11, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontWeight: '500' },
  matchDate: { color: COLORS.textSecondary, fontSize: 12 },
  upcomingTeam: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  vsText: { color: COLORS.textSecondary, fontSize: 12 },
  leaguesGrid: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  leagueCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, borderLeftWidth: 4 },
  leagueIcon: { fontSize: 20, marginBottom: 8 },
  leagueName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  betSlipButton: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.primary, marginHorizontal: 16, marginBottom: 16, borderRadius: 14, overflow: 'hidden' },
  betSlipContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  betSlipInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  betSlipText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  betSlipOdds: { alignItems: 'flex-end' },
  oddsMultiplier: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  potentialWinLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
});

export default BettingHomeScreen;