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

const EMPTY_STATE = {
  icon: 'ticket-outline',
  title: 'Panier Vide',
  subtitle: 'Ajoutez des paris pour voir vos selections ici',
};

const BettingBetSlipScreen = ({ navigation, route }) => {
  const initialBets = route.params?.bets || [];
  const [bets, setBets] = useState(initialBets);
  const [betType, setBetType] = useState('single');
  const [stake, setStake] = useState('10');

  const removeBet = (index) => {
    setBets(prev => prev.filter((_, i) => i !== index));
  };

  const totalOdds = bets.reduce((acc, b) => acc * b.odds, 1);
  const stakeValue = parseFloat(stake) || 0;
  const totalStake = betType === 'combine' ? stakeValue : stakeValue * bets.length;
  const potentialWin = totalOdds * stakeValue;

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="ticket-outline" size={80} color={COLORS.card} />
      <Text style={styles.emptyTitle}>Panier Vide</Text>
      <Text style={styles.emptySubtitle}>Ajoutez des paris depuis les matches pour commencer</Text>
      <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.exploreButtonText}>Explorer les Paris</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBetItem = (bet, index) => (
    <View key={index} style={styles.betItem}>
      <View style={styles.betHeader}>
        <View style={styles.matchInfo}>
          <Text style={styles.matchLabel}>{bet.match?.home || 'Team'} vs {bet.match?.away || 'Team'}</Text>
          <Text style={styles.selectionText}>{bet.selection || bet.market}</Text>
        </View>
        <TouchableOpacity onPress={() => removeBet(index)} style={styles.removeButton}>
          <Ionicons name="close" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.betFooter}>
        <View style={styles.oddsContainer}>
          <Text style={styles.oddsLabel}>Cote</Text>
          <Text style={styles.oddsValue}>{typeof bet.odds === 'number' ? bet.odds.toFixed(2) : bet.odds}</Text>
        </View>
        <View style={styles.stakeContainer}>
          <Text style={styles.stakeLabel}>Mise</Text>
          <View style={styles.stakeInputWrapper}>
            <TextInput
              style={styles.stakeInput}
              value={stake}
              onChangeText={setStake}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textSecondary}
            />
            <Text style={styles.currencyText}>€</Text>
          </View>
        </View>
        <View style={styles.winContainer}>
          <Text style={styles.winLabel}>Gain</Text>
          <Text style={styles.winValue}>
            {(typeof bet.odds === 'number' ? bet.odds : parseFloat(bet.odds) || 0) * stakeValue.toFixed(2)} €
          </Text>
        </View>
      </View>
    </View>
  );

  if (bets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Panier de Paris</Text>
          <View style={{ width: 24 }} />
        </View>
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panier de Paris</Text>
        <TouchableOpacity onPress={() => setBets([])}>
          <Text style={styles.clearText}>Vider</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, betType === 'single' && styles.toggleButtonActive]}
            onPress={() => setBetType('single')}
          >
            <MaterialCommunityIcons name="ticket-outline" size={18} color={betType === 'single' ? COLORS.text : COLORS.textSecondary} />
            <Text style={[styles.toggleText, betType === 'single' && styles.toggleTextActive]}>Simple</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, betType === 'combine' && styles.toggleButtonActive]}
            onPress={() => setBetType('combine')}
          >
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={18} color={betType === 'combine' ? COLORS.text : COLORS.textSecondary} />
            <Text style={[styles.toggleText, betType === 'combine' && styles.toggleTextActive]}>Combine</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.betsList}>
          {bets.map(renderBetItem)}
        </View>

        <TouchableOpacity style={styles.addMoreButton}>
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.addMoreText}>Ajouter un autre pari</Text>
        </TouchableOpacity>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cote Totale</Text>
            <Text style={styles.summaryValue}>{totalOdds.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Mise Totale</Text>
            <Text style={styles.summaryValue}>{totalStake.toFixed(2)} €</Text>
          </View>
          <View style={[styles.summaryRow, styles.gainRow]}>
            <Text style={styles.gainLabel}>Gain Potentiel</Text>
            <Text style={styles.gainValue}>{potentialWin.toFixed(2)} €</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.placeBetButton}>
          <View style={styles.placeBetContent}>
            <Text style={styles.placeBetText}>Placer le Pari</Text>
            <View style={styles.placeBetInfo}>
              <Text style={styles.placeBetStake}>{totalStake.toFixed(2)} €</Text>
              <Text style={styles.placeBetGain}>Gain {potentialWin.toFixed(2)} €</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  backButton: { padding: 4 },
  clearText: { color: COLORS.orange, fontSize: 14, fontWeight: '500' },
  scrollView: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { color: COLORS.text, fontSize: 22, fontWeight: 'bold', marginTop: 20 },
  emptySubtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  exploreButton: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  exploreButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  toggleContainer: { flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 12, padding: 4, marginBottom: 16 },
  toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  toggleButtonActive: { backgroundColor: COLORS.primary },
  toggleText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  toggleTextActive: { color: COLORS.text, fontWeight: '600' },
  betsList: { paddingHorizontal: 16, gap: 12 },
  betItem: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16 },
  betHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  matchInfo: { flex: 1 },
  matchLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  selectionText: { color: COLORS.primary, fontSize: 13, marginTop: 2 },
  removeButton: { padding: 4 },
  betFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  oddsContainer: { alignItems: 'center' },
  oddsLabel: { color: COLORS.textSecondary, fontSize: 11 },
  oddsValue: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  stakeContainer: { alignItems: 'center' },
  stakeLabel: { color: COLORS.textSecondary, fontSize: 11 },
  stakeInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 8, paddingHorizontal: 8 },
  stakeInput: { color: COLORS.text, fontSize: 15, fontWeight: '600', textAlign: 'center', minWidth: 50, paddingVertical: 4 },
  currencyText: { color: COLORS.textSecondary, fontSize: 13 },
  winContainer: { alignItems: 'center' },
  winLabel: { color: COLORS.textSecondary, fontSize: 11 },
  winValue: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  addMoreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed' },
  addMoreText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
  summaryCard: { backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 14 },
  summaryValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  gainRow: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 8, paddingTop: 12 },
  gainLabel: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  gainValue: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  placeBetButton: { backgroundColor: COLORS.primary, marginHorizontal: 16, marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  placeBetContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  placeBetText: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  placeBetInfo: { alignItems: 'flex-end' },
  placeBetStake: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  placeBetGain: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
});

export default BettingBetSlipScreen;