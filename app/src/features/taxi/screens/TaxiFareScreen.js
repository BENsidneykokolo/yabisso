import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Alert, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const paymentMethods = [
  { id: 'wallet', label: 'Portefeuille Yabisso', icon: 'wallet', desc: 'Solde: 150 000 FCFA', color: '#137fec' },
  { id: 'orange', label: 'Orange Money', icon: 'cellphone', desc: 'Paiement mobile', color: '#ff6600' },
  { id: 'mtn', label: 'MTN MoMo', icon: 'cellphone', desc: 'Paiement mobile', color: '#ffcc00' },
  { id: 'cash', label: 'Paiement a la livraison', icon: 'cash', desc: 'Payer au chauffeur', color: '#22c55e' },
];

const vehicleTypes = [
  { id: 'moto', label: 'Moto', desc: 'Rapide, economique', capacity: 1, icon: 'motorbike', color: '#f97316', baseFare: 200, perKm: 80 },
  { id: 'economy', label: 'Economique', desc: 'Voiture compacte', capacity: 3, icon: 'car-side', color: '#3b82f6', baseFare: 500, perKm: 150 },
  { id: 'comfort', label: 'Confort', desc: 'Voiture spacieuse', capacity: 4, icon: 'car', color: '#8b5cf6', baseFare: 800, perKm: 200 },
  { id: 'premium', label: 'Premium', desc: 'Vehicule haut de gamme', capacity: 4, icon: 'car-sports', color: '#eab308', baseFare: 1500, perKm: 350 },
];

export default function TaxiFareScreen({ onBack, onNavigate, route }) {
  const params = route?.params || {};
  const { pickup, destination, price, distance, vehicleType, pickupCoords, destCoords } = params;
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleType || 'economy');
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [loading, setLoading] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const veh = vehicleTypes.find(v => v.id === selectedVehicle);
  const calculatedPrice = () => {
    const dist = parseFloat(distance) || 5;
    return Math.round((veh.baseFare + dist * veh.perKm) / 50) * 50 - discount;
  };

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === 'yabisso10') { setDiscount(500); Alert.alert('Coupon applique', '-500 FCFA sur votre course'); }
    else if (couponCode.toLowerCase() === 'newuser') { setDiscount(1000); Alert.alert('Coupon applique', '-1000 FCFA sur votre premiere course'); }
    else { Alert.alert('Code invalide', 'Ce code coupon n\'est pas valide.'); }
  };

  const handleBook = () => {
    setLoading(true);
    onNavigate?.('taxi_search_driver', { pickup, destination, price: calculatedPrice(), distance, vehicleType: selectedVehicle, paymentMethod: selectedPayment, pickupCoords, destCoords });
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="chevron-back" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Details de la course</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tripCard}>
          <View style={styles.tripRow}>
            <View style={styles.tripDotGreen} />
            <View>
              <Text style={styles.tripLabel}>Depart</Text>
              <Text style={styles.tripAddress}>{pickup || 'Lieu de depart'}</Text>
            </View>
          </View>
          <View style={styles.tripLine} />
          <View style={styles.tripRow}>
            <View style={styles.tripDotRed} />
            <View>
              <Text style={styles.tripLabel}>Arrivee</Text>
              <Text style={styles.tripAddress}>{destination || 'Destination'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de vehicule</Text>
          <View style={styles.vehicleGrid}>
            {vehicleTypes.map(v => (
              <Pressable key={v.id} style={[styles.vehicleCard, selectedVehicle === v.id && { borderColor: v.color, backgroundColor: v.color + '15' }]} onPress={() => setSelectedVehicle(v.id)}>
                <MaterialCommunityIcons name={v.icon} size={30} color={selectedVehicle === v.id ? v.color : '#64748b'} />
                <Text style={[styles.vehicleName, selectedVehicle === v.id && { color: v.color }]}>{v.label}</Text>
                <Text style={styles.vehicleDesc}>{v.desc}</Text>
                <Text style={styles.vehicleCap}>{v.capacity} pers</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          {paymentMethods.map(m => (
            <Pressable key={m.id} style={[styles.paymentCard, selectedPayment === m.id && { borderColor: m.color }]} onPress={() => setSelectedPayment(m.id)}>
              <MaterialCommunityIcons name={m.icon} size={22} color={selectedPayment === m.id ? m.color : '#64748b'} />
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, selectedPayment === m.id && { color: m.color }]}>{m.label}</Text>
                <Text style={styles.paymentDesc}>{m.desc}</Text>
              </View>
              <View style={[styles.radioCircle, selectedPayment === m.id && { borderColor: m.color }]}>
                {selectedPayment === m.id && <View style={[styles.radioInner, { backgroundColor: m.color }]} />}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Pressable style={styles.couponRow} onPress={() => setShowCoupon(!showCoupon)}>
            <MaterialCommunityIcons name="tag-outline" size={20} color="#eab308" />
            <Text style={styles.couponText}>Ajouter un coupon</Text>
            <MaterialCommunityIcons name={showCoupon ? 'chevron-up' : 'chevron-down'} size={20} color="#64748b" />
          </Pressable>
          {showCoupon && (
            <View style={styles.couponInput}>
              <TextInput style={styles.couponField} placeholder="Code coupon" placeholderTextColor="#64748b" value={couponCode} onChangeText={setCouponCode} autoCapitalize="characters" />
              <Pressable style={styles.applyBtn} onPress={handleApplyCoupon}><Text style={styles.applyBtnText}>Appliquer</Text></Pressable>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recapitulatif</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Distance estimee</Text><Text style={styles.summaryValue}>{distance || '5'} km</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tarif de base</Text><Text style={styles.summaryValue}>{veh.baseFare.toLocaleString()} FCFA</Text></View>
            {discount > 0 && <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Coupon applique</Text><Text style={[styles.summaryValue, { color: '#22c55e' }]}>-{discount.toLocaleString()} FCFA</Text></View>}
            <View style={styles.divider} />
            <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total estime</Text><Text style={styles.summaryTotalValue}>{calculatedPrice().toLocaleString()} FCFA</Text></View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomCTA}>
        <Pressable style={styles.bookBtn} onPress={handleBook} disabled={loading}>
          {loading ? (
            <MaterialCommunityIcons name="loading" size={24} color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="car" size={20} color="#fff" />
              <Text style={styles.bookBtnText}>Rechercher un chauffeur</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  tripCard: { marginHorizontal: 20, backgroundColor: '#1c2630', borderRadius: 16, padding: 16, marginTop: 8 },
  tripRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tripDotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', marginTop: 4 },
  tripDotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444', marginTop: 4 },
  tripLine: { width: 2, height: 24, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 5, marginVertical: 4 },
  tripLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  tripAddress: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  vehicleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vehicleCard: { width: '48%', backgroundColor: '#1c2630', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center' },
  vehicleName: { color: '#F8FAFC', fontSize: 14, fontWeight: '700', marginTop: 8 },
  vehicleDesc: { color: '#64748b', fontSize: 11, marginTop: 2 },
  vehicleCap: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
  paymentInfo: { flex: 1, marginLeft: 12 },
  paymentLabel: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  paymentDesc: { color: '#64748b', fontSize: 12, marginTop: 2 },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#64748b', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  couponRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, gap: 10 },
  couponText: { flex: 1, color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  couponInput: { flexDirection: 'row', marginTop: 10, gap: 10 },
  couponField: { flex: 1, backgroundColor: '#1c2630', borderRadius: 10, paddingHorizontal: 14, color: '#fff', fontSize: 14 },
  applyBtn: { backgroundColor: '#eab308', borderRadius: 10, paddingHorizontal: 20, justifyContent: 'center' },
  applyBtnText: { color: '#0E151B', fontWeight: '700', fontSize: 14 },
  summaryCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#64748b', fontSize: 14 },
  summaryValue: { color: '#F8FAFC', fontSize: 14 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 8 },
  summaryTotalLabel: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  summaryTotalValue: { color: '#22c55e', fontSize: 18, fontWeight: '700' },
  bottomCTA: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 34, paddingTop: 12, backgroundColor: '#0E151B' },
  bookBtn: { backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});