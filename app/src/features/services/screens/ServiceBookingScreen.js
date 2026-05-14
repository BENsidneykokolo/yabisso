import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable, StyleSheet, SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const paymentMethods = [
  { id: 'wallet', label: 'Portefeuille Yabisso', icon: 'wallet', desc: 'Solde disponible: 45 000 FCFA' },
  { id: 'orange', label: 'Orange Money', icon: 'cellphone', desc: 'Paiement mobile' },
  { id: 'mtn', label: 'MTN MoMo', icon: 'cellphone', desc: 'Paiement mobile' },
  { id: 'cash', label: 'Paiement sur place', icon: 'cash', desc: 'Payer directement au prestataire' },
  { id: 'card', label: 'Carte bancaire', icon: 'credit-card', desc: 'Visa / Mastercard' },
];

const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const timeSlots = Array.from({ length: 12 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`);

export default function ServiceBookingScreen({ onBack, onNavigate, route }) {
  const params = route?.params || {};
  const provider = params.provider || { name: 'CleanPro Services', price: 'À partir de 5 000 FCFA' };

  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [activeTab, setActiveTab] = useState('Réservations');

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return { day: d.getDate(), month: d.toLocaleDateString('fr-FR', { month: 'short' }), weekday: d.toLocaleDateString('fr-FR', { weekday: 'short' }), full: d.toISOString().split('T')[0] };
  });

  const handleConfirm = () => {
    onNavigate?.('service_checkout', { provider, address, instructions, date: selectedDate, time: selectedTime, paymentMethod });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Réserver un service</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Provider Info */}
        <View style={styles.providerCard}>
          <View style={styles.providerImage}>
            <MaterialCommunityIcons name="account" size={32} color="#64748b" />
          </View>
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerPrice}>{provider.price}</Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.datesRow}>
              {dates.map((date) => {
                const isSelected = selectedDate === date.full;
                return (
                  <Pressable
                    key={date.full}
                    style={[styles.dateCard, isSelected && styles.dateCardActive]}
                    onPress={() => setSelectedDate(date.full)}
                  >
                    <Text style={[styles.dateWeekday, isSelected && styles.dateTextActive]}>{date.weekday}</Text>
                    <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>{date.day}</Text>
                    <Text style={[styles.dateMonth, isSelected && styles.dateTextActive]}>{date.month}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Heure</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <Pressable
                  key={time}
                  style={[styles.timeSlot, isSelected && styles.timeSlotActive]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, isSelected && styles.timeTextActive]}>{time}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#137fec" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Entrez votre adresse complète"
              placeholderTextColor="#64748b"
              value={address}
              onChangeText={setAddress}
            />
          </View>
          <Pressable style={styles.useCurrentLocation}>
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#137fec" />
            <Text style={styles.useLocationText}>Utiliser ma position actuelle</Text>
          </Pressable>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions spéciales</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="note-text" size={20} color="#64748b" style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Instructions pour le prestataire (optionnel)"
              placeholderTextColor="#64748b"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          {paymentMethods.map((method) => {
            const isSelected = paymentMethod === method.id;
            return (
              <Pressable
                key={method.id}
                style={[styles.paymentCard, isSelected && styles.paymentCardActive]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <MaterialCommunityIcons name={method.icon} size={24} color={isSelected ? '#137fec' : '#64748b'} />
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentLabel, isSelected && styles.paymentLabelActive]}>{method.label}</Text>
                  <Text style={styles.paymentDesc}>{method.desc}</Text>
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <Pressable
          style={[styles.ctaBtn, (!selectedDate || !selectedTime || !address) && styles.ctaBtnDisabled]}
          onPress={handleConfirm}
          disabled={!selectedDate || !selectedTime || !address}
        >
          <MaterialCommunityIcons name="check" size={20} color="#fff" />
          <Text style={styles.ctaBtnText}>Continuer</Text>
        </Pressable>
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {[
            { label: 'Accueil', icon: 'home' },
            { label: 'Réservations', icon: 'calendar-check' },
            { label: 'Favoris', icon: 'heart' },
            { label: 'Profil', icon: 'account' },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={styles.navItem}
              onPress={() => {
                setActiveTab(item.label);
                if (item.label === 'Accueil') onNavigate?.('services_home');
                else if (item.label === 'Réservations') onNavigate?.('services_orders');
                else if (item.label === 'Favoris') onNavigate?.('services_favorites');
                else if (item.label === 'Profil') onNavigate?.('services_profile');
              }}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={item.label === activeTab ? 20 : 16}
                color={item.label === activeTab ? '#0E151B' : '#CBD5F5'}
              />
              <Text style={[styles.navLabel, item.label === activeTab && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  providerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', marginHorizontal: 16, borderRadius: 12, padding: 12, marginBottom: 8 },
  providerImage: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center' },
  providerInfo: { flex: 1, marginLeft: 12 },
  providerName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  providerPrice: { fontSize: 14, color: '#2BEE79', marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  datesRow: { flexDirection: 'row', gap: 8 },
  dateCard: { width: 70, backgroundColor: '#1c2630', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  dateCardActive: { borderColor: '#137fec', backgroundColor: 'rgba(19, 127, 236, 0.1)' },
  dateWeekday: { fontSize: 12, color: '#64748b' },
  dateDay: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginVertical: 4 },
  dateMonth: { fontSize: 12, color: '#64748b' },
  dateTextActive: { color: '#137fec' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: { width: '22%', backgroundColor: '#1c2630', borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  timeSlotActive: { borderColor: '#137fec', backgroundColor: 'rgba(19, 127, 236, 0.1)' },
  timeText: { fontSize: 14, color: '#64748b' },
  timeTextActive: { color: '#137fec', fontWeight: '600' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#1c2630', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15, color: '#fff', minHeight: 40 },
  useCurrentLocation: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  useLocationText: { fontSize: 13, color: '#137fec' },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
  paymentCardActive: { borderColor: '#137fec' },
  paymentInfo: { flex: 1, marginLeft: 12 },
  paymentLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
  paymentLabelActive: { color: '#137fec' },
  paymentDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#64748b', alignItems: 'center', justifyContent: 'center' },
  radioCircleActive: { borderColor: '#137fec' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#137fec' },
  bottomSpacer: { height: 160 },
  bottomCTA: { position: 'absolute', left: 0, right: 0, bottom: 90, paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#101922' },
  ctaBtn: { backgroundColor: '#137fec', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaBtnDisabled: { backgroundColor: '#2a3a4a' },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  bottomNavWrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24 },
  bottomNav: { backgroundColor: 'rgba(22, 29, 37, 0.98)', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  navItem: { alignItems: 'center', flex: 1 },
  navIcon: { width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.18)', marginBottom: 6, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#2BEE79' },
  navLabel: { color: '#6B7280', fontSize: 10 },
  navLabelActive: { color: '#2BEE79' },
});