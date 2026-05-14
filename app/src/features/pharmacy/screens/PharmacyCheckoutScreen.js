import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const paymentMethods = [
  { id: 'wallet', label: 'Portefeuille Yabisso', icon: 'wallet', desc: 'Solde: 150 000 FCFA' },
  { id: 'orange', label: 'Orange Money', icon: 'cellphone', desc: 'Paiement mobile' },
  { id: 'mtn', label: 'MTN MoMo', icon: 'cellphone', desc: 'Paiement mobile' },
  { id: 'cash', label: 'Paiement à la livraison', icon: 'cash', desc: 'Payer au livreur' },
];

export default function PharmacyCheckoutScreen({ onBack, onNavigate, route }) {
  const items = route?.params?.items || [{ id: '1', name: 'Paracétamol 500mg', price: 1200, qty: 2 }];
  const subtotal = route?.params?.total || items.reduce((s, i) => s + (i.price * i.qty), 0);
  const delivery = 2000;
  const total = subtotal + delivery;
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet');

  const handleConfirm = () => {
    if (paymentMethod === 'cash') {
      Alert.alert(
        'Commande confirmée',
        `Votre commande a été envoyée. Vous paierez ${total.toLocaleString()} FCFA au livreur lors de la livraison. Délai estimé : 30-45 min.`,
        [{ text: 'OK', onPress: () => onNavigate?.('pharmacy_order') }]
      );
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavigate?.('pharmacy_order');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Commande</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.successBanner}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="pill" size={32} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Commande prête</Text>
          <Text style={styles.successSubtitle}>Vérifiez les détails avant de confirmer</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
          <View style={styles.itemsCard}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <MaterialCommunityIcons name="pill" size={18} color="#EF4444" />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>x{item.qty}</Text>
                <Text style={styles.itemPrice}>{(item.price * item.qty).toLocaleString()} FCFA</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          {paymentMethods.map((method) => (
            <Pressable key={method.id} style={[styles.paymentCard, paymentMethod === method.id && styles.paymentCardActive]} onPress={() => setPaymentMethod(method.id)}>
              <MaterialCommunityIcons name={method.icon} size={22} color={paymentMethod === method.id ? '#EF4444' : '#64748b'} />
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, paymentMethod === method.id && styles.paymentLabelActive]}>{method.label}</Text>
                <Text style={styles.paymentDesc}>{method.desc}</Text>
              </View>
              <View style={[styles.radioCircle, paymentMethod === method.id && styles.radioCircleActive]}>
                {paymentMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Sous-total</Text><Text style={styles.summaryValue}>{subtotal.toLocaleString()} FCFA</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Livraison</Text><Text style={styles.summaryValue}>{delivery.toLocaleString()} FCFA</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Délai estimé</Text><Text style={styles.summaryValue}>30-45 min</Text></View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total</Text><Text style={styles.summaryTotalValue}>{total.toLocaleString()} FCFA</Text></View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomCTA}>
        <Pressable style={styles.ctaBtn} onPress={handleConfirm} disabled={loading}>
          {loading ? (
            <MaterialCommunityIcons name="loading" size={24} color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="check-bold" size={20} color="#fff" />
              <Text style={styles.ctaBtnText}>Confirmer - {total.toLocaleString()} FCFA</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  successBanner: { alignItems: 'center', paddingVertical: 24, marginHorizontal: 16, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  successSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  itemsCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemName: { flex: 1, marginLeft: 10, fontSize: 14, color: '#fff' },
  itemQty: { fontSize: 13, color: '#64748b', marginRight: 12 },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#EF4444' },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
  paymentCardActive: { borderColor: '#EF4444' },
  paymentInfo: { flex: 1, marginLeft: 12 },
  paymentLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
  paymentLabelActive: { color: '#EF4444' },
  paymentDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#64748b', alignItems: 'center', justifyContent: 'center' },
  radioCircleActive: { borderColor: '#EF4444' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444' },
  summaryCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontSize: 14, color: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 8 },
  summaryTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  summaryTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#2BEE79' },
  bottomSpacer: { height: 100 },
  bottomCTA: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12, backgroundColor: '#101922' },
  ctaBtn: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});