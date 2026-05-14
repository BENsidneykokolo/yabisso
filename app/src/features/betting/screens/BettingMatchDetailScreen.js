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

const BettingMatchDetailScreen = ({ navigation, route }) => {
  const { match } = route.params;
  const [selectedMarkets, setSelectedMarkets] = useState([]);

  const markets = [
    {
      name: '1X2',
      shortName: 'Resultat Final',
      options: [
        { label: match.home, subLabel: '1', odds: match.odds.home, key: 'home' },
        { label: 'Match Nul', subLabel: 'X', odds: match.odds.draw, key: 'draw' },
        { label: match.away, subLabel: '2', odds: match.odds.away, key: 'away' },
      ],
    },
    {
      name: 'Double Chance',
      shortName: 'Chance Double',
      options: [
        { label: `${match.home} or Draw`, subLabel: '1X', odds: (match.odds.home * match.odds.draw / (match.odds.home + match.odds.draw)).toFixed(2), key: 'homeDraw' },
        { label: `${match.away} or Draw`, subLabel: 'X2', odds: (match.odds.away * match.odds.draw / (match.odds.home + match.odds.draw)).toFixed(2), key: 'awayDraw' },
        { label: `${match.home} or ${match.away}`, subLabel: '12', odds: (match.odds.home * match.odds.away / (match.odds.home + match.odds.away)).toFixed(2), key: 'homeAway' },
      ],
    },
    {
      name: 'Over/Under',
      shortName: 'Buts Totals',
      options: [
        { label: 'Over 2.5', subLabel: 'O2.5', odds: 1.85, key: 'over25' },
        { label: 'Under 2.5', subLabel: 'U2.5', odds: 1.95, key: 'under25' },
        { label: 'Over 3.5', subLabel: 'O3.5', odds: 2.10, key: 'over35' },
      ],
    },
    {
      name: 'Both Teams To Score',
      shortName: 'Buts',
      options: [
        { label: 'Oui', subLabel: '+2.5', odds: 1.75, key: 'yes' },
        { label: 'Non', subLabel: '-2.5', odds: 2.05, key: 'no' },
      ],
    },
    {
      name: 'Half Time/Full Time',
      shortName: 'MT/FT',
      options: [
        { label: `${match.home}/${match.home}`, subLabel: '1/1', odds: 2.20, key: 'homeHome' },
        { label: `${match.home}/Draw`, subLabel: '1/X', odds: 8.50, key: 'homeDraw' },
        { label: 'Draw/Draw', subLabel: 'X/X', odds: 10.0, key: 'drawDraw' },
        { label: `Draw/${match.home}`, subLabel: 'X/1', odds: 5.50, key: 'drawHome' },
        { label: `Draw/${match.away}`, subLabel: 'X/2', odds: 6.00, key: 'drawAway' },
        { label: `${match.away}/${match.away}`, subLabel: '2/2', odds: 3.20, key: 'awayAway' },
      ],
    },
  ];

  const toggleMarket = (market, option) => {
    const selection = { match, market: market.name, option: option.label, odds: option.odds };
    setSelectedMarkets(prev => {
      const existingIndex = prev.findIndex(s => s.key === option.key);
      if (existingIndex >= 0) {
        return prev.filter((_, i) => i !== existingIndex);
      }
      return [...prev, selection];
    });
  };

  const isSelected = (key) => selectedMarkets.some(s => s.key === key);

  const totalOdds = selectedMarkets.reduce((acc, s) => acc * s.odds, 1);
  const potentialWin = totalOdds * 10;

  const renderMarket = (market) => (
    <View key={market.name} style={styles.marketSection}>
      <View style={styles.marketHeader}>
        <Text style={styles.marketName}>{market.name}</Text>
        <Text style={styles.marketShortName}>{market.shortName}</Text>
      </View>
      <View style={styles.optionsGrid}>
        {market.options.map((option) => {
          const selected = isSelected(option.key);
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
              onPress={() => toggleMarket(market, option)}
            >
              <Text style={styles.optionSubLabel}>{option.subLabel}</Text>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={[styles.optionOdds, selected && styles.optionOddsSelected]}>
                {typeof option.odds === 'number' ? option.odds.toFixed(2) : option.odds}
              </Text>
              {selected && (
                <View style={styles.selectedCheck}>
                  <Ionicons name="checkmark" size={12} color={COLORS.text} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Match</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.matchCard}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>
          
          <View style={styles.matchInfo}>
            <Text style={styles.competition}>{match.competition || 'Match International'}</Text>
            <Text style={styles.venue}>Stade de France</Text>
          </View>

          <View style={styles.teamsSection}>
            <View style={styles.team}>
              <Text style={styles.teamLogo}>{match.homeLogo}</Text>
              <Text style={styles.teamName}>{match.home}</Text>
            </View>
            <View style={styles.scoreSection}>
              <Text style={styles.score}>{match.score}</Text>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>{match.time}</Text>
              </View>
            </View>
            <View style={styles.team}>
              <Text style={styles.teamLogo}>{match.awayLogo}</Text>
              <Text style={styles.teamName}>{match.away}</Text>
            </View>
          </View>
        </View>

        {markets.map(renderMarket)}

        <View style={{ height: 100 }} />
      </ScrollView>

      {selectedMarkets.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.addToSlipButton}
            onPress={() => navigation.navigate('BetSlip', { bets: selectedMarkets })}
          >
            <View style={styles.addToSlipContent}>
              <MaterialCommunityIcons name="ticket-percent" size={20} color={COLORS.text} />
              <Text style={styles.addToSlipText}>Ajouter au panier</Text>
            </View>
            <View style={styles.oddsInfo}>
              <Text style={styles.oddsMultiplier}>{totalOdds.toFixed(2)}</Text>
              <Text style={styles.potentialWinLabel}>Gain {potentialWin.toFixed(2)} €</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  backButton: { padding: 4 },
  shareButton: { padding: 4 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  matchCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 20 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  liveText: { color: '#ef4444', fontSize: 12, fontWeight: '600' },
  matchInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  competition: { color: COLORS.primary, fontSize: 13 },
  venue: { color: COLORS.textSecondary, fontSize: 13 },
  teamsSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  team: { alignItems: 'center', flex: 1 },
  teamLogo: { fontSize: 40, marginBottom: 8 },
  teamName: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  scoreSection: { alignItems: 'center' },
  score: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },
  timeBadge: { backgroundColor: COLORS.orange, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 6 },
  timeText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  marketSection: { marginBottom: 20 },
  marketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  marketName: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  marketShortName: { color: COLORS.textSecondary, fontSize: 12 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionCard: { width: '31%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  optionCardSelected: { borderColor: COLORS.primary, backgroundColor: 'rgba(34,197,94,0.15)' },
  optionSubLabel: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 2 },
  optionLabel: { color: COLORS.text, fontSize: 12, fontWeight: '500', textAlign: 'center', marginBottom: 4 },
  optionOdds: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  optionOddsSelected: { color: COLORS.text },
  selectedCheck: { position: 'absolute', top: 6, right: 6, backgroundColor: COLORS.primary, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  addToSlipButton: { backgroundColor: COLORS.primary, borderRadius: 14, overflow: 'hidden' },
  addToSlipContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 },
  addToSlipText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  oddsInfo: { position: 'absolute', right: 16, top: 14, alignItems: 'flex-end' },
  oddsMultiplier: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  potentialWinLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
});

export default BettingMatchDetailScreen;