import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function QrHubScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>QR Code</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.qrCard}>
          <View style={styles.qrBadge}>
            <MaterialCommunityIcons name="qrcode" size={14} color="#0E151B" />
            <Text style={styles.qrBadgeText}>YABISSO ID</Text>
          </View>
          <View style={styles.qrBox}>
            <View style={styles.qrCorner} />
            <View style={[styles.qrCorner, styles.qrCornerRight]} />
            <View style={[styles.qrCorner, styles.qrCornerBottom]} />
            <View style={[styles.qrCorner, styles.qrCornerBottomRight]} />
            <Text style={styles.qrPlaceholder}>QR</Text>
          </View>
          <Text style={styles.qrTitle}>Scanner ou partager</Text>
          <Text style={styles.qrSubtitle}>Utilise ce code pour paiements et services.</Text>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionCard}>
            <MaterialCommunityIcons name="camera" size={18} color="#0E151B" />
            <Text style={styles.actionLabel}>Scanner</Text>
          </View>
          <View style={styles.actionCard}>
            <MaterialCommunityIcons name="share-variant" size={18} color="#0E151B" />
            <Text style={styles.actionLabel}>Partager</Text>
          </View>
          <View style={styles.actionCard}>
            <MaterialCommunityIcons name="download" size={18} color="#0E151B" />
            <Text style={styles.actionLabel}>Enregistrer</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  scrollContent: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 40 },
  qrCard: {
    marginTop: 24,
    borderRadius: 22,
    padding: 20,
    backgroundColor: '#151D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  qrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2BEE79',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  qrBadgeText: { color: '#0E151B', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  qrBox: {
    marginTop: 18,
    width: 210,
    height: 210,
    borderRadius: 16,
    backgroundColor: '#0E151B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCorner: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 18,
    height: 18,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#2BEE79',
  },
  qrCornerRight: {
    right: 14,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 2,
  },
  qrCornerBottom: {
    top: 'auto',
    bottom: 14,
    borderTopWidth: 0,
    borderBottomWidth: 2,
  },
  qrCornerBottomRight: {
    top: 'auto',
    bottom: 14,
    right: 14,
    left: 'auto',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 2,
    borderBottomWidth: 2,
  },
  qrPlaceholder: { color: '#2BEE79', fontSize: 22, fontWeight: '700' },
  qrTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginTop: 16 },
  qrSubtitle: { color: '#94A3B8', fontSize: 12, marginTop: 6, textAlign: 'center' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  actionCard: {
    width: '31%',
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: '#1C2733',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: { color: '#E6EDF3', fontSize: 11, fontWeight: '600' },
});
