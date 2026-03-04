import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import WalletBottomNav from '../../../components/WalletBottomNav';

export default function HistoryScreen({ onBack, walletMode = 'fcfa', onNavigate }) {
  const [activeTab, setActiveTab] = useState('all');

  const isFcfa = walletMode === 'fcfa';
  const currency = isFcfa ? 'FCFA' : 'Points';
  const fcfaBalance = '215 450';
  const pointsBalance = '1 240';

  const fcfaTransactions = [
    { id: 1, type: 'recharge', title: 'Recharge Mobile Money', meta: "Aujourd'hui · MTN MoMo", amount: '+15 000', positive: true, icon: 'cash-plus' },
    { id: 2, type: 'payment', title: 'Paiement livraison', meta: 'Hier · Yabisso Delivery', amount: '-3 200', positive: false, icon: 'truck-delivery' },
    { id: 3, type: 'cashback', title: 'Cashback', meta: 'Hier · Bonus', amount: '+450', positive: true, icon: 'gift' },
    { id: 4, type: 'send', title: 'Transfert vers Jean', meta: 'Il y a 2 jours', amount: '-5 000', positive: false, icon: 'send' },
    { id: 5, type: 'receive', title: 'Recu de Marie', meta: 'Il y a 3 jours', amount: '+10 000', positive: true, icon: 'download' },
    { id: 6, type: 'payment', title: 'Achat produit', meta: 'Il y a 5 jours · Marketplace', amount: '-8 500', positive: false, icon: 'shopping' },
    { id: 7, type: 'recharge', title: 'Recharge Kiosque', meta: 'Il y a 1 semaine', amount: '+20 000', positive: true, icon: 'store' },
    { id: 8, type: 'payment', title: 'Paiement restaurant', meta: 'Il y a 1 semaine', amount: '-2 500', positive: false, icon: 'food' },
  ];

  const pointsTransactions = [
    { id: 1, type: 'recharge', title: 'Achat Pack Points', meta: "Aujourd'hui", amount: '+500', positive: true, icon: 'package-variant' },
    { id: 2, type: 'use', title: 'Utilisation service', meta: 'Hier · Reservation', amount: '-200', positive: false, icon: 'ticket' },
    { id: 3, type: 'bonus', title: 'Bonus fidelite', meta: 'Il y a 3 jours', amount: '+50', positive: true, icon: 'star' },
    { id: 4, type: 'use', title: 'Echange pack', meta: 'Il y a 1 semaine', amount: '-300', positive: false, icon: 'swap-horizontal' },
  ];

  const filterTransactions = () => {
    if (activeTab === 'fcfa') return fcfaTransactions.map(t => ({ ...t, currency: 'FCFA' }));
    if (activeTab === 'points') return pointsTransactions.map(t => ({ ...t, currency: 'Points' }));
    return [...fcfaTransactions.map(t => ({ ...t, currency: 'FCFA' })), ...pointsTransactions.map(t => ({ ...t, currency: 'Points' }))];
  };

  const transactions = filterTransactions();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Historique</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.balanceSummary}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Solde FCA</Text>
            <Text style={styles.balanceValue}>215 450</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Points</Text>
            <Text style={[styles.balanceValue, styles.pointsValue]}>1 240 Points</Text>
          </View>
        </View>

        <View style={styles.filterTabs}>
          <Pressable
            style={[styles.filterTab, activeTab === 'all' && styles.filterTabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.filterTabText, activeTab === 'all' && styles.filterTabTextActive]}>Tout</Text>
          </Pressable>
          <Pressable
            style={[styles.filterTab, activeTab === 'fcfa' && styles.filterTabActive]}
            onPress={() => setActiveTab('fcfa')}
          >
            <Text style={[styles.filterTabText, activeTab === 'fcfa' && styles.filterTabTextActive]}>FCFA</Text>
          </Pressable>
          <Pressable
            style={[styles.filterTab, activeTab === 'points' && styles.filterTabActive]}
            onPress={() => setActiveTab('points')}
          >
            <Text style={[styles.filterTabText, activeTab === 'points' && styles.filterTabTextActive]}>Points</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.transactionCard}>
              <View style={[styles.transactionIcon, !tx.positive && styles.transactionIconNegative]}>
                <MaterialCommunityIcons
                  name={tx.icon}
                  size={20}
                  color={tx.positive ? '#2BEE79' : '#F97316'}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{tx.title}</Text>
                <Text style={styles.transactionMeta}>{tx.meta}</Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={[styles.amountValue, tx.positive ? styles.amountPositive : styles.amountNegative]}>
                  {tx.amount}
                </Text>
                <Text style={styles.amountCurrency}>{tx.currency}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <WalletBottomNav activeTab="history" onNavigate={onNavigate} walletMode={walletMode} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  balanceSummary: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  balanceLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  balanceValue: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  pointsValue: {
    color: '#FFD700',
  },
  filterTabs: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#2BEE79',
  },
  filterTabText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#0E151B',
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionIconNegative: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionMeta: {
    color: '#7C8A9A',
    fontSize: 11,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  amountPositive: {
    color: '#2BEE79',
  },
  amountNegative: {
    color: '#F97316',
  },
  amountCurrency: {
    color: '#7C8A9A',
    fontSize: 10,
    marginTop: 2,
  },
});
