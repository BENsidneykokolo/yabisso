import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
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
  { id: '1', home: 'PSG', away: 'Marseille', homeLogo: '⚽', awayLogo: '⚽️', score: '2 - 1', time: '67\'', competition: 'Ligue 1', odds: { home: 1.42, draw: 4.50, away: 6.00 }, trend: 'up' },
  { id: '2', home: 'Liverpool', away: 'Arsenal', homeLogo: '⚽', awayLogo: '⚽️', score: '1 - 1', time: '34\'', competition: 'Premier League', odds: { home: 2.10, draw: 3.40, away: 3.80 }, trend: 'stable' },
  { id: '3', home: 'Real Madrid', away: 'Barcelona', homeLogo: '⚽', awayLogo: '⚽️', score: '0 - 0', time: '12\'', competition: 'La Liga', odds: { home: 2.80, draw: 3.20, away: 2.50 }, trend: 'down' },
  { id: '4', home: 'Bayern', away: 'Dortmund', homeLogo: '⚽', awayLogo: '⚽️', score: '1 - 2', time: '89\'', competition: 'Bundesliga', odds: { home: 1.85, draw: 3.60, away: 4.20 }, trend: 'up' },
];

const LiveMatchCard = ({ match, onPress }) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]);
    Animated.loop(pulse).start();
  }, []);

  const getTrendIcon = () => {
    if (match.trend === 'up') return 'trending-up';
    if (match.trend === 'down') return 'trending-down';
    return 'trending-flat';
  };

  const getTrendColor = () => {
    if (match.trend === 'up') return COLORS.primary;
    if (match.trend === 'down') return '#ef4444';
    return COLORS.yellow;
  };

  return (
    <Animated.View style={[styles.liveMatchCard, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity onPress={onPress} style={styles.cardTouchable}>
        <View style={styles.matchHeader}>
          <View style={styles.liveIndicatorContainer}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>
          <View style={styles.competitionBadge}>
            <Text style={styles.competitionText}>{match.competition}</Text>
          </View>
        </View>

        <View style={styles.teamsSection}>
          <View style={styles.teamColumn}>
            <Text style={styles.teamLogo}>{match.homeLogo}</Text>
            <Text style={styles.teamName}>{match.home}</Text>
          </View>
          <View style={styles.scoreColumn}>
            <Text style={styles.score}>{match.score}</Text>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={12} color={COLORS.orange} />
              <Text style={styles.timeText}>{match.time}</Text>
            </View>
          </View>
          <View style={styles.teamColumn}>
            <Text style={styles.teamLogo}>{match.awayLogo}</Text>
            <Text style={styles.teamName}>{match.away}</Text>
          </View>
        </View>

        <View style={styles.oddsSection}>
          <View style={styles.oddItem}>
            <Text style={styles.oddLabel}>1</Text>
            <Text style={styles.oddValue}>{match.odds.home.toFixed(2)}</Text>
          </View>
          <View style={styles.oddItem}>
            <Text style={styles.oddLabel}>X</Text>
            <Text style={styles.oddValue}>{match.odds.draw.toFixed(2)}</Text>
          </View>
          <View style={styles.oddItem}>
            <Text style={styles.oddLabel}>2</Text>
            <Text style={styles.oddValue}>{match.odds.away.toFixed(2)}</Text>
          </View>
          <View style={styles.trendBadge}>
            <Ionicons name={getTrendIcon()} size={14} color={getTrendColor()} />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {match.trend === 'up' ? '+0.05' : match.trend === 'down' ? '-0.03' : '0'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const BettingLiveNowScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const filters = ['Tous', 'Foot', 'Basketball', 'Tennis'];

  const filteredMatches = selectedFilter === 'Tous'
    ? LIVE_MATCHES
    : LIVE_MATCHES;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>En Direct</Text>
          <View style={styles.liveBadgeSmall}>
            <View style={styles.liveDotSmall} />
            <Text style={styles.liveBadgeSmallText}>LIVE</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setAutoRefresh(!autoRefresh)} style={styles.refreshButton}>
          <MaterialCommunityIcons
            name="refresh"
            size={22}
            color={autoRefresh ? COLORS.primary : COLORS.textSecondary}
          />
        </TouchableOpacity>
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
        <View style={styles.inPlaySection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="play-circle" size={20} color={COLORS.orange} />
            <Text style={styles.sectionTitle}>In-Play</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Paris disponibles en direct</Text>
        </View>

        {filteredMatches.map((match) => (
          <LiveMatchCard
            key={match.id}
            match={match}
            onPress={() => navigation.navigate('MatchDetail', { match })}
          />
        ))}

        <View style={styles.oddsChangeSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Changements de Cotes</Text>
          </View>
          
          {filteredMatches.map((match) => (
            <View key={`odds-${match.id}`} style={styles.oddsChangeCard}>
              <Text style={styles.oddsMatchName}>{match.home} vs {match.away}</Text>
              <View style={styles.oddsChangeRow}>
                <Text style={styles.oddsChangeLabel}>Cote initiale</Text>
                <Text style={styles.oddsChangeValue}>{(match.odds.home - 0.05).toFixed(2)}</Text>
              </View>
              <View style={styles.oddsChangeRow}>
                <Text style={styles.oddsChangeLabel}>Cote actuelle</Text>
                <View style={styles.currentOddsContainer}>
                  <Text style={styles.currentOddsValue}>{match.odds.home.toFixed(2)}</Text>
                  <View style={[styles.arrowBadge, { backgroundColor: match.trend === 'up' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)' }]}>
                    <Ionicons
                      name={match.trend === 'up' ? 'arrow-up' : 'arrow-down'}
                      size={12}
                      color={match.trend === 'up' ? COLORS.primary : '#ef4444'}
                    />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  backButton: { padding: 4 },
  refreshButton: { padding: 4 },
  liveBadgeSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(239,68,68,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  liveDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444' },
  liveBadgeSmallText: { color: '#ef4444', fontSize: 10, fontWeight: 'bold' },
  filtersContainer: { paddingVertical: 8 },
  filtersList: { paddingHorizontal: 16, gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.surface },
  filterButtonActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  filterTextActive: { color: COLORS.text, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  inPlaySection: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  sectionSubtitle: { color: COLORS.textSecondary, fontSize: 12, marginLeft: 28 },
  liveMatchCard: { backgroundColor: COLORS.surface, borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  cardTouchable: { padding: 16 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  liveIndicatorContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  liveText: { color: '#ef4444', fontSize: 12, fontWeight: '600' },
  competitionBadge: { backgroundColor: 'rgba(34,197,94,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  competitionText: { color: COLORS.primary, fontSize: 12, fontWeight: '500' },
  teamsSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  teamColumn: { alignItems: 'center', flex: 1 },
  teamLogo: { fontSize: 32, marginBottom: 8 },
  teamName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  scoreColumn: { alignItems: 'center' },
  score: { color: COLORS.text, fontSize: 26, fontWeight: 'bold' },
  timeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  timeText: { color: COLORS.orange, fontSize: 12, fontWeight: '500' },
  oddsSection: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 12, padding: 12 },
  oddItem: { alignItems: 'center', flex: 1 },
  oddLabel: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 2 },
  oddValue: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'center' },
  trendText: { fontSize: 11, fontWeight: '600' },
  oddsChangeSection: { marginTop: 16 },
  oddsChangeCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  oddsMatchName: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  oddsChangeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  oddsChangeLabel: { color: COLORS.textSecondary, fontSize: 12 },
  oddsChangeValue: { color: COLORS.textSecondary, fontSize: 12, textDecorationLine: 'line-through' },
  currentOddsContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  currentOddsValue: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold' },
  arrowBadge: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
});

export default BettingLiveNowScreen;