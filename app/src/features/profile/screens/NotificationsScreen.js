import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen({ onBack }) {
  const [settings, setSettings] = useState({
    payments: true,
    security: true,
    promos: false,
    chat: true,
    dnd: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alertes importantes</Text>
          <Text style={styles.cardText}>Paiements, securite et verification.</Text>

          <Pressable
            style={styles.toggleRow}
            onPress={() => toggleSetting('payments')}
          >
            <View>
              <Text style={styles.toggleTitle}>Paiements</Text>
              <Text style={styles.toggleSubtitle}>Recharges, envois, retraits</Text>
            </View>
            <View
              style={[
                styles.toggleTrack,
                settings.payments && styles.toggleTrackActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  settings.payments && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>

          <Pressable
            style={styles.toggleRow}
            onPress={() => toggleSetting('security')}
          >
            <View>
              <Text style={styles.toggleTitle}>Securite</Text>
              <Text style={styles.toggleSubtitle}>Connexions, appareils</Text>
            </View>
            <View
              style={[
                styles.toggleTrack,
                settings.security && styles.toggleTrackActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  settings.security && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Promotions</Text>
          <Text style={styles.cardText}>Offres et nouveaux services.</Text>

          <Pressable
            style={styles.toggleRow}
            onPress={() => toggleSetting('promos')}
          >
            <View>
              <Text style={styles.toggleTitle}>Bons plans</Text>
              <Text style={styles.toggleSubtitle}>Remises, cashback</Text>
            </View>
            <View
              style={[
                styles.toggleTrack,
                settings.promos && styles.toggleTrackActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  settings.promos && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>

          <Pressable
            style={styles.toggleRow}
            onPress={() => toggleSetting('chat')}
          >
            <View>
              <Text style={styles.toggleTitle}>Chat & messages</Text>
              <Text style={styles.toggleSubtitle}>Reponses et activite</Text>
            </View>
            <View
              style={[
                styles.toggleTrack,
                settings.chat && styles.toggleTrackActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  settings.chat && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ne pas deranger</Text>
          <Text style={styles.cardText}>Couper toutes les alertes.</Text>
          <Pressable style={styles.toggleRow} onPress={() => toggleSetting('dnd')}>
            <View>
              <Text style={styles.toggleTitle}>Mode silencieux</Text>
              <Text style={styles.toggleSubtitle}>Aucun son, aucune vibration</Text>
            </View>
            <View
              style={[
                styles.toggleTrack,
                settings.dnd && styles.toggleTrackActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  settings.dnd && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
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
  card: {
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#151D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  cardText: { color: '#94A3B8', fontSize: 12, marginTop: 6 },
  toggleRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },
  toggleSubtitle: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  toggleTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
    padding: 3,
    alignItems: 'flex-start',
  },
  toggleTrackActive: {
    backgroundColor: 'rgba(43, 238, 121, 0.35)',
    alignItems: 'flex-end',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  toggleThumbActive: {
    backgroundColor: '#2BEE79',
  },
});
