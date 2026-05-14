import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const orderStatusSteps = [
  { icon: 'check-circle', label: 'Confirmée', time: '14:32', done: true },
  { icon: 'pharmacy', label: 'Préparation', time: '14:40', done: true },
  { icon: 'truck-delivery', label: 'En livraison', time: '15:05', done: false },
  { icon: 'home', label: 'Livrée', time: '~15:25', done: false },
];

const orderItems = [
  { id: '1', name: 'Paracétamol 500mg', qty: 2, price: 1200 },
  { id: '2', name: 'Vitamine C 1000mg', qty: 1, price: 2500 },
];

export default function PharmacyOrderScreen({ onBack, onNavigate }) {
  const total = orderItems.reduce((s, i) => s + (i.price * i.qty), 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Suivi de commande</Text>
          <Pressable onPress={() => onNavigate?.('pharmacy_home')}>
            <MaterialCommunityIcons name="home" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.orderIdCard}>
          <MaterialCommunityIcons name="pill" size={28} color="#EF4444" />
          <View style={styles.orderIdInfo}>
            <Text style={styles.orderIdLabel}>Commande #PHM-2026-0158</Text>
            <Text style={styles.orderIdTime}>Livrée estimée à ~15:25</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>En cours</Text>
          </View>
        </View>

        <View style={styles.trackingSection}>
          <Text style={styles.sectionTitle}>Suivi en temps réel</Text>
          <View style={styles.timeline}>
            {orderStatusSteps.map((step, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={[styles.timelineDot, step.done ? styles.timelineDotDone : styles.timelineDotPending]}>
                  <MaterialCommunityIcons name={step.icon} size={18} color={step.done ? '#2BEE79' : '#64748b'} />
                </View>
                {i < orderStatusSteps.length - 1 && (
                  <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                )}
                <View style={styles.timelineInfo}>
                  <Text style={[styles.timelineLabel, step.done && styles.timelineLabelDone]}>{step.label}</Text>
                  <Text style={styles.timelineTime}>{step.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map-marker" size={40} color="#EF4444" />
          <Text style={styles.mapText}>Carte de livraison en temps réel</Text>
          <Text style={styles.mapSubtext}>Votre livreur est en route</Text>
          <Pressable style={styles.callBtn}>
            <MaterialCommunityIcons name="phone" size={18} color="#fff" />
            <Text style={styles.callBtnText}>Appeler le livreur</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles commandés</Text>
          <View style={styles.itemsCard}>
            {orderItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <MaterialCommunityIcons name="pill" size={16} color="#EF4444" />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>x{item.qty}</Text>
                <Text style={styles.itemPrice}>{(item.price * item.qty).toLocaleString()} FCFA</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total payé</Text><Text style={styles.summaryTotalValue}>{(total + 2000).toLocaleString()} FCFA</Text></View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  orderIdCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: '#1c2630', borderRadius: 16, padding: 16, marginBottom: 16 },
  orderIdInfo: { flex: 1, marginLeft: 12 },
  orderIdLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  orderIdTime: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusBadge: { backgroundColor: 'rgba(43,238,121,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { color: '#2BEE79', fontSize: 12, fontWeight: '600' },
  trackingSection: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  timeline: { backgroundColor: '#1c2630', borderRadius: 16, padding: 16 },
  timelineItem: { flexDirection: 'row', alignItems: 'center' },
  timelineDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: 'rgba(43,238,121,0.15)' },
  timelineDotPending: { backgroundColor: 'rgba(100,116,139,0.15)' },
  timelineLine: { width: 2, height: 40, backgroundColor: '#2a3a4a', marginLeft: 17 },
  timelineLineDone: { backgroundColor: '#2BEE79' },
  timelineInfo: { marginLeft: 16 },
  timelineLabel: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  timelineLabelDone: { color: '#fff' },
  timelineTime: { fontSize: 12, color: '#64748b', marginTop: 2 },
  mapPlaceholder: { marginHorizontal: 16, backgroundColor: '#1c2630', borderRadius: 16, padding: 40, alignItems: 'center' },
  mapText: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  mapSubtext: { fontSize: 13, color: '#64748b', marginTop: 4 },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#137fec', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 16 },
  callBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  itemsCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemName: { flex: 1, marginLeft: 10, fontSize: 14, color: '#fff' },
  itemQty: { fontSize: 13, color: '#64748b', marginRight: 12 },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#EF4444' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryTotalLabel: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  summaryTotalValue: { fontSize: 16, fontWeight: 'bold', color: '#2BEE79' },
  bottomSpacer: { height: 40 },
});