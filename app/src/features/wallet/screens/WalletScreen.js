import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import withObservables from '@nozbe/with-observables';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

function WalletScreen({ onBack, onOpenHome, onOpenRecharge, onOpenSend, onOpenReceive, onOpenHistory, walletMode: propWalletMode, setWalletMode: propSetWalletMode, activeTab: propActiveTab, transactions = [] }) {
  const [activeTabState, setActiveTabState] = useState(propActiveTab || 'home');
  const activeTab = propActiveTab || activeTabState;
  const [walletModeState, setWalletModeState] = useState(propWalletMode || 'fcfa');
  const isFcfa = walletModeState === 'fcfa';

  const handleModeChange = (mode) => {
    setWalletModeState(mode);
    if (propSetWalletMode) {
      propSetWalletMode(mode);
    }
  };

  const filteredTransactions = transactions.filter(tx => tx.walletMode === walletModeState);

  const balance = filteredTransactions.reduce((acc, tx) => {
    const amount = parseInt(tx.amount.replace(/[^0-9]/g, '')) || 0;
    return tx.isPositive ? acc + amount : acc - amount;
  }, 0);

  const formattedBalance = new Intl.NumberFormat('fr-FR').format(balance);

  const navItems = [
    { label: 'Accueil', icon: 'home-variant', key: 'home' },
    { label: 'Recharger', icon: 'cash-plus', key: 'recharge' },
    { label: 'Envoyer', icon: 'send', key: 'send' },
    { label: 'Recevoir', icon: 'qrcode-scan', key: 'receive' },
    { label: 'Historique', icon: 'history', key: 'history' },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Portefeuille</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.modeSwitchContainer}>
          <View style={[styles.modeSwitch, isFcfa && styles.modeSwitchActive]}>
            <Pressable
              style={[styles.modeOption, isFcfa && styles.modeOptionActive]}
              onPress={() => handleModeChange('fcfa')}
            >
              <Text style={[styles.modeText, isFcfa && styles.modeTextActive]}>FCFA</Text>
            </Pressable>
            <Pressable
              style={[styles.modeOption, !isFcfa && styles.modeOptionActive]}
              onPress={() => handleModeChange('points')}
            >
              <Text style={[styles.modeText, !isFcfa && styles.modeTextActive]}>Points</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>{isFcfa ? 'Solde total' : 'Points Yabisso'}</Text>
            <View style={styles.statusChip}>
              <Ionicons name="shield-checkmark" size={12} color="#2BEE79" />
              <Text style={styles.statusText}>Securise</Text>
            </View>
          </View>
          <Text style={styles.balanceValue}>
            {formattedBalance} {isFcfa ? 'FCFA' : 'Points'}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          {[
            { key: 'topup', label: 'Recharger', icon: 'cash-plus', action: () => onOpenRecharge && onOpenRecharge(walletModeState) },
            { key: 'send', label: 'Envoyer', icon: 'send', action: () => onOpenSend && onOpenSend(walletModeState) },
            { key: 'receive', label: 'Recevoir', icon: 'qrcode-scan', action: () => onOpenReceive && onOpenReceive(walletModeState) },
            { key: 'history', label: 'Historique', icon: 'history', action: () => onOpenHistory && onOpenHistory(walletModeState) },
          ].map((item) => (
            <Pressable key={item.key} style={styles.actionCard} onPress={item.action}>
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons name={item.icon} size={18} color="#0E151B" />
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>
            {isFcfa ? 'Dernieres operations' : 'Historique des points'}
          </Text>
          <Text style={styles.sectionLink}>Tout voir</Text>
        </View>

        {filteredTransactions.map((tx) => (
          <View key={tx.id} style={styles.transactionCard}>
            <View style={[styles.transactionIcon, !tx.isPositive && styles.transactionIconNegative]}>
              <MaterialCommunityIcons
                name={tx.isPositive ? 'arrow-down-bold' : 'arrow-up-bold'}
                size={18}
                color={tx.isPositive ? '#2BEE79' : '#F97316'}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{tx.title}</Text>
              <Text style={styles.transactionMeta}>{tx.meta}</Text>
            </View>
            <Text style={tx.isPositive ? styles.transactionAmountPositive : styles.transactionAmountNegative}>
              {tx.amount} {isFcfa ? 'FCFA' : 'Points'}
            </Text>
          </View>
        ))}
      </ScrollView>

      <SafeAreaView style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const getAction = () => {
              if (item.key === 'home') return () => onOpenHome && onOpenHome();
              if (item.key === 'recharge') return () => onOpenRecharge && onOpenRecharge(walletModeState);
              if (item.key === 'send') return () => onOpenSend && onOpenSend(walletModeState);
              if (item.key === 'receive') return () => onOpenReceive && onOpenReceive(walletModeState);
              if (item.key === 'history') return () => onOpenHistory && onOpenHistory(walletModeState);
              return () => { };
            };
            return (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.navItem,
                  pressed && styles.navItemPressed,
                ]}
                onPress={() => {
                  setActiveTabState(item.key);
                  getAction()();
                }}
              >
                <View
                  style={[
                    styles.navIcon,
                    isActive && styles.navIconActive,
                    isActive && styles.navIconCenter,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={isActive ? 20 : 16}
                    color={isActive ? '#0E151B' : '#CBD5F5'}
                  />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
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
  balanceCard: {
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.35)',
  },
  statusText: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: '700',
  },
  balanceValue: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
  },
  balanceSub: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
  },
  modeSwitchContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modeSwitchActive: {
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
  },
  modeOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeOptionActive: {
    backgroundColor: '#2BEE79',
  },
  modeText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#0E151B',
  },
  actionsRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: '#B6C2CF',
    fontSize: 11,
    textAlign: 'center',
  },
  sectionRow: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLink: {
    color: '#1F8EFA',
    fontSize: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.12)',
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
    marginTop: 4,
  },
  transactionAmountPositive: {
    color: '#2BEE79',
    fontWeight: '700',
  },
  transactionAmountNegative: {
    color: '#F97316',
    fontWeight: '700',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  bottomNav: {
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navItemPressed: {
    transform: [{ scale: 0.96 }],
  },
  navIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    backgroundColor: '#2BEE79',
  },
  navIconCenter: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#2BEE79',
    marginTop: -14,
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  navLabelActive: {
    color: '#2BEE79',
  },
});

const enhance = withObservables([], () => ({
  transactions: database.get('wallet_transactions').query().observe(),
}));

export default enhance(WalletScreen);
