import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ServiceCheckoutScreen({ onBack, onNavigate, route }) {
  const params = route?.params || {};
  const { provider, address, instructions, date, time, paymentMethod } = params;

  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (paymentMethod === 'cash') {
      Alert.alert(
        'Réservation confirmée',
        `Votre réservation a été envoyée. Vous paierez directement au prestataire le jour du rendez-vous.`,
        [{ text: 'OK', onPress: () => onNavigate?.('services_orders', { confirmed: true }) }]
      );
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavigate?.('services_orders', { confirmed: true });
    }, 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getPaymentLabel = (method) => {
    const labels = { wallet: 'Portefeuille Yabisso', orange: 'Orange Money', mtn: 'MTN MoMo', card: 'Carte bancaire', cash: 'Paiement sur place' };
    return labels[method] || method;
  };

  const getPaymentIcon = (method) => {
    const icons = { wallet: 'wallet', orange: 'cellphone', mtn: 'cellphone', card: 'credit-card', cash: 'cash' };
    return icons[method] || 'wallet';
  };

  const getPaymentColor = (method) => {
    const colors = { wallet: '#137fec', orange: '#ff6600', mtn: '#ffcc00', card: '#8B5CF6', cash: '#2BEE79' };
    return colors[method] || '#137fec';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Confirmation</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.successBanner}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check" size={32} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Prêt à confirmer</Text>
          <Text style={styles.successSubtitle}>Vérifiez les détails de votre réservation</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prestataire</Text>
          <View style={styles.card}>
            <View style={styles.providerImage}>
              <MaterialCommunityIcons name="account" size={28} color="#64748b" />
            </View>
            <View>
              <Text style={styles.cardTitle}>{provider?.name || 'CleanPro Services'}</Text>
              <Text style={styles.cardSubtitle}>{provider?.price || 'À partir de 5 000 FCFA'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date et heure</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="calendar" size={20} color="#137fec" />
              <Text style={styles.cardText}>{formatDate(date)}</Text>
            </View>
            <View style={[styles.row, { marginTop: 8 }]}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#137fec" />
              <Text style={styles.cardText}>{time || '09:00'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#2BEE79" />
              <Text style={styles.cardText}>{address || 'Abidjan, Cocody Riviera'}</Text>
            </View>
            {instructions && (
              <View style={[styles.row, { marginTop: 8 }]}>
                <MaterialCommunityIcons name="note-text" size={20} color="#64748b" />
                <Text style={styles.cardTextMuted}>{instructions}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <MaterialCommunityIcons name={getPaymentIcon(paymentMethod)} size={20} color={getPaymentColor(paymentMethod)} />
              <Text style={styles.cardText}>{getPaymentLabel(paymentMethod)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de service</Text>
              <Text style={styles.summaryValue}>5 000 FCFA</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de déplacement</Text>
              <Text style={styles.summaryValue}>0 FCFA</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>5 000 FCFA</Text>
            </View>
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
              <Text style={styles.ctaBtnText}>Confirmer la réservation</Text>
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
  successBanner: { alignItems: 'center', paddingVertical: 24, marginHorizontal: 16, backgroundColor: 'rgba(19, 127, 236, 0.08)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(19, 127, 236, 0.2)' },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#137fec', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  successSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  card: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cardSubtitle: { fontSize: 13, color: '#2BEE79', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardText: { fontSize: 15, color: '#fff' },
  cardTextMuted: { fontSize: 14, color: '#64748b' },
  providerImage: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center' },
  summaryCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontSize: 14, color: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 8 },
  summaryTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  summaryTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#2BEE79' },
  bottomSpacer: { height: 100 },
  bottomCTA: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12, backgroundColor: '#101922' },
  ctaBtn: { backgroundColor: '#2BEE79', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaBtnText: { color: '#0E151B', fontSize: 17, fontWeight: 'bold' },
});