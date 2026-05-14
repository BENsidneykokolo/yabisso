import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, SafeAreaView, Switch, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ApartmentBookingScreen({ onBack, onNavigate, route }) {
  const property = route?.params?.property || { name: 'Appartement luxe à Cocody', price: 850000, priceType: 'rent', sqft: 150 };
  const [duration, setDuration] = useState('6 mois');
  const [moveInDate, setMoveInDate] = useState('');
  const [furnished, setFurnished] = useState(true);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [loading, setLoading] = useState(false);

  const durations = ['1 mois', '3 mois', '6 mois', '12 mois', 'Location permanente'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Réserver / Louer</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.propertyCard}>
          <View style={styles.propertyImage}>
            <MaterialCommunityIcons name="home" size={32} color="#64748b" />
          </View>
          <View>
            <Text style={styles.propertyName}>{property.name}</Text>
            <Text style={styles.propertyPrice}>{property.price.toLocaleString()} FCFA/mois</Text>
            <Text style={styles.propertySize}>{property.sqft} m²</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durée de location</Text>
          <View style={styles.durationsRow}>
            {durations.map((d) => (
              <Pressable key={d} style={[styles.durationChip, duration === d && styles.durationChipActive]} onPress={() => setDuration(d)}>
                <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>{d}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date d'emménagement</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="calendar" size={20} color="#137fec" style={{ marginRight: 10 }} />
            <TextInput style={styles.input} placeholder="JJ/MM/AAAA" placeholderTextColor="#64748b" value={moveInDate} onChangeText={setMoveInDate} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <MaterialCommunityIcons name="sofa" size={22} color="#2BEE79" />
              <View>
                <Text style={styles.toggleLabel}>Meublé</Text>
                <Text style={styles.toggleDesc}>Appartement entièrement meublé</Text>
              </View>
            </View>
            <Switch value={furnished} onValueChange={setFurnished} trackColor={{ false: '#2a3a4a', true: '#137fec' }} thumbColor="#fff" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions spéciales</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="note-text" size={20} color="#64748b" style={{ marginRight: 10 }} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Instructions, demandes spéciales..." placeholderTextColor="#64748b" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          {[
            { id: 'wallet', label: 'Portefeuille Yabisso', icon: 'wallet' },
            { id: 'orange', label: 'Orange Money', icon: 'cellphone' },
            { id: 'mtn', label: 'MTN MoMo', icon: 'cellphone' },
            { id: 'cash', label: 'Paiement sur place', icon: 'cash' },
          ].map((method) => (
            <Pressable key={method.id} style={[styles.paymentCard, paymentMethod === method.id && styles.paymentCardActive]} onPress={() => setPaymentMethod(method.id)}>
              <MaterialCommunityIcons name={method.icon} size={22} color={paymentMethod === method.id ? '#137fec' : '#64748b'} />
              <Text style={[styles.paymentLabel, paymentMethod === method.id && styles.paymentLabelActive]}>{method.label}</Text>
              <View style={[styles.radioCircle, paymentMethod === method.id && styles.radioCircleActive]}>{paymentMethod === method.id && <View style={styles.radioInner} />}</View>
            </Pressable>
          ))}
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Loyer mensuel</Text><Text style={styles.summaryValue}>{property.price.toLocaleString()} FCFA</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Caution (1 mois)</Text><Text style={styles.summaryValue}>{property.price.toLocaleString()} FCFA</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Frais d'agence</Text><Text style={styles.summaryValue}>0 FCFA</Text></View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total à payer</Text><Text style={styles.summaryTotalValue}>{(property.price * 2).toLocaleString()} FCFA</Text></View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomCTA}>
        <Pressable style={styles.ctaBtn} onPress={() => {
          if (paymentMethod === 'cash') {
            Alert.alert(
              'Réservation confirmée',
              `Votre réservation pour "${property.name}" a été envoyée. Vous paierez ${(property.price * 2).toLocaleString()} FCFA sur place lors de votre emménagement le ${moveInDate || '[date à confirmer]'}.`,
              [{ text: 'OK', onPress: () => onNavigate?.('real_estate_home') }]
            );
          } else {
            onNavigate?.('apartment_payment', { property, paymentMethod });
          }
        }}>
          <MaterialCommunityIcons name="check" size={20} color="#fff" />
          <Text style={styles.ctaBtnText}>{paymentMethod === 'cash' ? 'Confirmer la réservation' : 'Continuer vers le paiement'}</Text>
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
  propertyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', marginHorizontal: 16, borderRadius: 12, padding: 12, marginBottom: 8 },
  propertyImage: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center' },
  propertyName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  propertyPrice: { fontSize: 14, color: '#137fec', marginTop: 2 },
  propertySize: { fontSize: 12, color: '#64748b', marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  durationsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durationChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1c2630', borderWidth: 1, borderColor: 'transparent' },
  durationChipActive: { borderColor: '#137fec', backgroundColor: 'rgba(19,127,236,0.1)' },
  durationText: { fontSize: 13, color: '#64748b' },
  durationTextActive: { color: '#137fec', fontWeight: '600' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15, color: '#fff', minHeight: 40 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1c2630', borderRadius: 12, padding: 14 },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
  toggleDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
  paymentCardActive: { borderColor: '#137fec' },
  paymentLabel: { flex: 1, marginLeft: 12, fontSize: 15, color: '#fff' },
  paymentLabelActive: { color: '#137fec' },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#64748b', alignItems: 'center', justifyContent: 'center' },
  radioCircleActive: { borderColor: '#137fec' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#137fec' },
  summarySection: { paddingHorizontal: 16, marginTop: 24 },
  summaryCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontSize: 14, color: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 8 },
  summaryTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  summaryTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#2BEE79' },
  bottomSpacer: { height: 100 },
  bottomCTA: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12, backgroundColor: '#101922' },
  ctaBtn: { backgroundColor: '#137fec', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});