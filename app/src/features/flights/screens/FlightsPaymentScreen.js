import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#0E151B',
  card: '#1A2332',
  skyBlue: '#38BDF8',
  green: '#22c55e',
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  border: '#374151',
  inputBg: '#111827',
  orange: '#F97316',
};

const paymentMethods = [
  { id: 'wallet', label: 'Portefeuille Yabisso', icon: 'wallet', color: COLORS.skyBlue, balance: '52 500 FCFA' },
  { id: 'orange', label: 'Orange Money', icon: 'cellphone', color: '#FF6600', balance: '120 000 FCFA' },
  { id: 'momo', label: 'MTN MoMo', icon: 'cellphone', color: '#FFD700', balance: '85 000 FCFA' },
  { id: 'cash', label: 'Paiement en especes', icon: 'cash', color: COLORS.green },
];

export default function FlightsPaymentScreen({ onBack, onNavigate }) {
  const [selectedMethod, setSelectedMethod] = useState('wallet');

  const total = 298000;

  const renderPaymentMethod = (method) => {
    const isSelected = selectedMethod === method.id;
    return (
      <TouchableOpacity
        key={method.id}
        style={[styles.methodCard, isSelected && styles.methodCardActive]}
        onPress={() => setSelectedMethod(method.id)}
      >
        <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
          <MaterialCommunityIcons name={method.icon} size={24} color={method.color} />
        </View>
        <View style={styles.methodInfo}>
          <Text style={[styles.methodLabel, isSelected && styles.methodLabelActive]}>{method.label}</Text>
          {method.balance && <Text style={styles.methodBalance}>{method.balance}</Text>}
        </View>
        <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <MaterialCommunityIcons name="airplane" size={20} color={COLORS.skyBlue} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryRoute}>Abidjan - Casablanca</Text>
              <Text style={styles.summaryDates}>15 Jan - 22 Jan 2026</Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>298 000 FCFA</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais de service</Text>
            <Text style={[styles.summaryValue, { color: COLORS.green }]}>0 FCFA</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Montant total</Text>
            <Text style={styles.totalValue}>{total.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {selectedMethod === 'orange' && (
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.skyBlue} />
            <Text style={styles.infoText}>
              Vous allez recevoir une demande de paiement sur votre telephone Orange Money.
            </Text>
          </View>
        )}

        {selectedMethod === 'momo' && (
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.skyBlue} />
            <Text style={styles.infoText}>
              Vous allez recevoir une demande de paiement sur votre MTN MoMo.
            </Text>
          </View>
        )}

        <View style={styles.secureNote}>
          <MaterialCommunityIcons name="lock" size={16} color={COLORS.gray} />
          <Text style={styles.secureText}>Paiement securise et chiffre</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={() => onNavigate && onNavigate('FlightsConfirmation')}>
          <MaterialCommunityIcons name="lock" size={18} color={COLORS.white} />
          <Text style={styles.payBtnText}>Payer {total.toLocaleString('fr-FR')} FCFA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  content: { flex: 1, paddingHorizontal: 16 },
  summaryCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  summaryIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  summaryInfo: { flex: 1 },
  summaryRoute: { fontSize: 15, color: COLORS.white, fontWeight: '600' },
  summaryDates: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  summaryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  summaryLabel: { fontSize: 14, color: COLORS.lightGray, flex: 1 },
  summaryValue: { fontSize: 14, color: COLORS.white },
  totalLabel: { fontSize: 16, color: COLORS.white, fontWeight: '700', flex: 1 },
  totalValue: { fontSize: 20, color: COLORS.green, fontWeight: '700' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 12 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10, gap: 12 },
  methodCardActive: { borderWidth: 2, borderColor: COLORS.skyBlue },
  methodIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 15, color: COLORS.white, fontWeight: '500' },
  methodLabelActive: { fontWeight: '600' },
  methodBalance: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: COLORS.skyBlue },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.skyBlue },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 16, gap: 10 },
  infoText: { flex: 1, fontSize: 13, color: COLORS.lightGray, lineHeight: 18 },
  secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 },
  secureText: { fontSize: 12, color: COLORS.gray },
  footer: { padding: 16, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.green, borderRadius: 12, paddingVertical: 16, gap: 8 },
  payBtnText: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
});