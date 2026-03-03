import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const languages = [
  { id: 'en-UK', name: 'Anglais (Royaume-Uni)', native: 'Anglais' },
  { id: 'fr-FR', name: 'Francais (France)', native: 'Francais' },
  { id: 'ln-CD', name: 'Lingala (Congo)', native: 'Lingala' },
  { id: 'sw-TZ', name: 'Kiswahili (Afrique de l\'Est)', native: 'Swahili' },
  { id: 'am-ET', name: 'Amharique (Ethiopie)', native: 'Amharique' },
  { id: 'ha-NG', name: 'Haoussa (Afrique de l\'Ouest)', native: 'Haoussa' },
  { id: 'yo-NG', name: 'Yoruba (Nigeria)', native: 'Yoruba' },
];

export default function LanguageScreen({ onBack, onContinue }) {
  const [selected, setSelected] = useState('en-UK');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'<'} Retour</Text>
        </Pressable>
        <Text style={styles.topTitle}>Langue</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bienvenue sur Yabisso</Text>
        <Text style={styles.subtitle}>
          Choisissez votre langue pour personnaliser votre experience.
        </Text>

        <View style={styles.list}>
          {languages.map((lang) => {
            const isActive = selected === lang.id;
            return (
              <Pressable
                key={lang.id}
                style={[styles.card, isActive && styles.cardActive]}
                onPress={() => setSelected(lang.id)}
              >
                <View style={[styles.radio, isActive && styles.radioActive]} />
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{lang.name}</Text>
                  <Text style={styles.cardSubtitle}>{lang.native}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>Continuer</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(14, 21, 27, 0.95)',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    color: '#E6EDF3',
    fontSize: 14,
  },
  topTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 210,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9FB0C3',
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    marginTop: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    marginBottom: 12,
  },
  cardActive: {
    borderColor: '#2BEE79',
    backgroundColor: 'rgba(43, 238, 121, 0.08)',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4A5B6C',
    marginRight: 12,
  },
  radioActive: {
    borderColor: '#2BEE79',
    backgroundColor: '#2BEE79',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#9FB0C3',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 54,
    backgroundColor: 'rgba(14, 21, 27, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  primaryButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
  },
});
