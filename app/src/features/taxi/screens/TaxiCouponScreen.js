import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const availableCoupons = [
  { id: '1', code: 'YABISSO10', desc: '-500 FCFA sur votre course', minAmount: 2000, validUntil: '31/05/2026', color: '#22c55e' },
  { id: '2', code: 'NEWUSER', desc: '-1000 FCFA', minAmount: 3000, validUntil: '30/06/2026', color: '#137fec' },
  { id: '3', code: 'WEEKEND20', desc: '-20% sur votre course', minAmount: 5000, validUntil: '15/05/2026', color: '#eab308' },
  { id: '4', code: 'FRIEND50', desc: '-500 FCFA pour vous et un ami', minAmount: 5000, validUntil: '31/12/2026', color: '#8b5cf6' },
];

export default function TaxiCouponScreen({ onBack, onNavigate }) {
  const [inputCode, setInputCode] = useState('');
  const [myCoupons] = useState([{ id: 'm1', code: 'YABISSO10', used: false }]);

  const handleApply = () => {
    if (!inputCode.trim()) { Alert.alert('Erreur', 'Veuillez entrer un code.'); return; }
    const found = availableCoupons.find(c => c.code.toLowerCase() === inputCode.toLowerCase());
    if (found) { Alert.alert('Coupon trouve !', found.desc); onNavigate?.('taxi_fare'); }
    else { Alert.alert('Code invalide', 'Ce code coupon n\'est pas valide.'); }
  };

  const handleRedeem = () => Alert.alert('Redeemre', 'Fonction de redemption en cours...');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Coupons</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Entrer un code coupon</Text>
        <View style={styles.inputRow}>
          <TextInput style={styles.codeInput} placeholder="CODE_COUPON" placeholderTextColor="#64748b" value={inputCode} onChangeText={setInputCode} autoCapitalize="characters" />
          <Pressable style={styles.applyBtn} onPress={handleApply}><Text style={styles.applyBtnText}>Appliquer</Text></Pressable>
        </View>
      </View>

      {myCoupons.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes coupons actifs</Text>
          {myCoupons.map(c => (
            <View key={c.id} style={styles.myCoupon}>
              <MaterialCommunityIcons name="tag" size={22} color="#22c55e" />
              <View style={styles.myCouponInfo}>
                <Text style={styles.myCouponCode}>{c.code}</Text>
                <Text style={styles.myCouponStatus}>Disponible</Text>
              </View>
              <View style={styles.usedBadge}><Text style={styles.usedBadgeText}>Actif</Text></View>
            </View>
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={styles.sectionTitle}>Coupons disponibles</Text>
        {availableCoupons.map(c => (
          <Pressable key={c.id} style={styles.couponCard} onPress={() => Alert.alert(c.code, c.desc)}>
            <View style={[styles.couponIcon, { backgroundColor: c.color + '20' }]}>
              <MaterialCommunityIcons name="tag" size={24} color={c.color} />
            </View>
            <View style={styles.couponInfo}>
              <Text style={styles.couponCode}>{c.code}</Text>
              <Text style={styles.couponDesc}>{c.desc}</Text>
              <Text style={styles.couponMin}>Min. {c.minAmount.toLocaleString()} FCFA - Jusqu'au {c.validUntil}</Text>
            </View>
            <Pressable style={styles.redeemBtn} onPress={handleRedeem}><Text style={styles.redeemBtnText}>Utiliser</Text></Pressable>
          </Pressable>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  inputSection: { paddingHorizontal: 20, marginBottom: 20 },
  inputLabel: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 10 },
  codeInput: { flex: 1, backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 16, color: '#fff', fontSize: 16, letterSpacing: 2, textAlign: 'center' },
  applyBtn: { backgroundColor: '#22c55e', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 16 },
  myCoupon: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)' },
  myCouponInfo: { flex: 1 },
  myCouponCode: { color: '#22c55e', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  myCouponStatus: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  usedBadge: { backgroundColor: '#22c55e', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 },
  usedBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  couponCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  couponIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  couponInfo: { flex: 1 },
  couponCode: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  couponDesc: { color: '#22c55e', fontSize: 13, marginTop: 2 },
  couponMin: { color: '#64748b', fontSize: 11, marginTop: 4 },
  redeemBtn: { backgroundColor: '#137fec', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  redeemBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});