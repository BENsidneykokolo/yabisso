import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ApartmentPaymentScreen({ onBack, onNavigate, route }) {
  const property = route?.params?.property || { name: 'Appartement luxe à Cocody', price: 850000 };
  const paymentMethod = route?.params?.paymentMethod || 'wallet';
  const [loading, setLoading] = useState(false);

  const paymentMethods = {
    wallet: { label: 'Portefeuille Yabisso', icon: 'wallet', color: '#137fec' },
    orange: { label: 'Orange Money', icon: 'cellphone', color: '#ff6600' },
    mtn: { label: 'MTN MoMo', icon: 'cellphone', color: '#ffcc00' },
    cash: { label: 'Paiement sur place', icon: 'cash', color: '#2BEE79' },
  };

  const method = paymentMethods[paymentMethod] || paymentMethods.wallet;

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Succès', 'Votre réservation a été confirmée !', [
        { text: 'OK', onPress: () => onNavigate?.('real_estate_home') }
      ]);
    }, 2000);
  };

  const total = property.price * 2;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Paiement</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.successBanner}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="home" size={32} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Réservation prête</Text>
          <Text style={styles.successSubtitle}>Confirmez pour finaliser votre location</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du bien</Text>
          <View style={styles.card}>
            <View style={styles.propertyIcon}>
              <MaterialCommunityIcons name="home" size={28} color="#137fec" />
            </View>
            <View>
              <Text style={styles.cardTitle}>{property.name}</Text>
              <Text style={styles.cardSubtitle}>{property.sqft || 150} m²</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Loyer mensuel</Text><Text style={styles.summaryValue}>{property.price.toLocaleString()} FCFA</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Caution</Text><Text style={styles.summaryValue}>{property.price.toLocaleString()} FCFA</Text></View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total</Text><Text style={styles.summaryTotalValue}>{total.toLocaleString()} FCFA</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          <View style={[styles.paymentCard, { borderColor: method.color }]}>
            <MaterialCommunityIcons name={method.icon} size={24} color={method.color} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>{method.label}</Text>
              {paymentMethod === 'wallet' ? (
                <Text style={styles.paymentBalance}>Solde: 150 000 FCFA</Text>
              ) : (
                <Text style={styles.paymentBalance}>Prêt à payer</Text>
              )}
            </View>
            <View style={[styles.radioCircleActive, { borderColor: method.color }]}><View style={[styles.radioInner, { backgroundColor: method.color }]} /></View>
          </View>
        </View>

        <View style={styles.termsCard}>
          <MaterialCommunityIcons name="information" size={20} color="#64748b" />
          <Text style={styles.termsText}>En confirmant, vous acceptez les conditions de location. La caution sera restituée à la fin de votre bail.</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomCTA}>
        <Pressable style={styles.ctaBtn} onPress={handlePay} disabled={loading}>
          {loading ? (
            <MaterialCommunityIcons name="loading" size={24} color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="check-bold" size={20} color="#fff" />
              <Text style={styles.ctaBtnText}>Payer {total.toLocaleString()} FCFA</Text>
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
  successBanner: { alignItems: 'center', paddingVertical: 24, marginHorizontal: 16, backgroundColor: 'rgba(19,127,236,0.08)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(19,127,236,0.2)' },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#137fec', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  successSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  card: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  propertyIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(19,127,236,0.1)', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cardSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  summaryCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontSize: 14, color: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 8 },
  summaryTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  summaryTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#2BEE79' },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: '#137fec' },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  paymentBalance: { fontSize: 13, color: '#2BEE79', marginTop: 2 },
  radioCircleActive: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#137fec', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#137fec' },
  termsCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 16, marginTop: 20, backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, marginHorizontal: 16, borderRadius: 12 },
  termsText: { flex: 1, fontSize: 13, color: '#64748b', lineHeight: 18 },
  bottomSpacer: { height: 100 },
  bottomCTA: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12, backgroundColor: '#101922' },
  ctaBtn: { backgroundColor: '#2BEE79', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaBtnText: { color: '#0E151B', fontSize: 17, fontWeight: 'bold' },
});