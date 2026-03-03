import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function WalletScreen({ onBack }) {
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

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Solde total</Text>
            <View style={styles.statusChip}>
              <Ionicons name="shield-checkmark" size={12} color="#2BEE79" />
              <Text style={styles.statusText}>Securise</Text>
            </View>
          </View>
          <Text style={styles.balanceValue}>215 450 FCFA</Text>
          <Text style={styles.balanceSub}>Points Yabisso: 1 240</Text>
        </View>

        <View style={styles.actionsRow}>
          {[
            { key: 'topup', label: 'Recharger', icon: 'cash-plus' },
            { key: 'send', label: 'Envoyer', icon: 'send' },
            { key: 'receive', label: 'Recevoir', icon: 'qrcode-scan' },
            { key: 'history', label: 'Historique', icon: 'history' },
          ].map((item) => (
            <Pressable key={item.key} style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons name={item.icon} size={18} color="#0E151B" />
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Dernieres operations</Text>
          <Text style={styles.sectionLink}>Tout voir</Text>
        </View>

        <View style={styles.transactionCard}>
          <View style={styles.transactionIcon}>
            <MaterialCommunityIcons name="arrow-down-bold" size={18} color="#2BEE79" />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>Recharge</Text>
            <Text style={styles.transactionMeta}>Aujourd'hui · Mobile Money</Text>
          </View>
          <Text style={styles.transactionAmountPositive}>+15 000 FCFA</Text>
        </View>

        <View style={styles.transactionCard}>
          <View style={[styles.transactionIcon, styles.transactionIconNegative]}>
            <MaterialCommunityIcons name="arrow-up-bold" size={18} color="#F97316" />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>Paiement livraison</Text>
            <Text style={styles.transactionMeta}>Hier · Yabisso Delivery</Text>
          </View>
          <Text style={styles.transactionAmountNegative}>-3 200 FCFA</Text>
        </View>

        <View style={styles.transactionCard}>
          <View style={styles.transactionIcon}>
            <MaterialCommunityIcons name="arrow-down-bold" size={18} color="#2BEE79" />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>Cashback</Text>
            <Text style={styles.transactionMeta}>Hier · Bonus</Text>
          </View>
          <Text style={styles.transactionAmountPositive}>+450 FCFA</Text>
        </View>
      </ScrollView>
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
});
