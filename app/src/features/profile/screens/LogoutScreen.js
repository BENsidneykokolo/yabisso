import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LogoutScreen({ onBack, onConfirm }) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.title}>Se deconnecter ?</Text>
          <Text style={styles.subtitle}>
            Vous allez quitter votre session actuelle.
          </Text>
          <View style={styles.actionsRow}>
            <Pressable style={styles.secondaryButton} onPress={onBack}>
              <Text style={styles.secondaryText}>Annuler</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={onConfirm}>
              <Text style={styles.primaryText}>Confirmer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'absolute',
    top: 20,
    left: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#151D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#94A3B8', fontSize: 12, marginTop: 8 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryText: { color: '#E6EDF3', fontSize: 12, fontWeight: '600' },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F97316',
  },
  primaryText: { color: '#0E151B', fontSize: 12, fontWeight: '700' },
});
