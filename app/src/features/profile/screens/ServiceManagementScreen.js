import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useServicePreferences } from '../../../hooks/useServicePreferences';
import { ALL_SERVICES } from '../../../constants/Services';

/**
 * Écran permettant à l'utilisateur d'activer ou de désactiver chaque service.
 */
export default function ServiceManagementScreen({ onBack }) {
  const { preferences, toggleService, loading } = useServicePreferences();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <Text style={styles.headerTitle}>Mes Services</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introSection}>
          <Text style={styles.sectionTitle}>Gestion des Services</Text>
          <Text style={styles.sectionSubtitle}>
            Sélectionnez les services que vous souhaitez voir apparaître sur votre tableau de bord.
          </Text>
        </View>

        <View style={styles.serviceList}>
          {ALL_SERVICES.map((service) => {
            const serviceColor = service.color || '#64748B';
            const isEnabled = preferences[service.key] !== false;
            
            return (
              <View key={service.key} style={styles.serviceRow}>
                <View style={[styles.serviceIconContainer, { backgroundColor: serviceColor + '20' }]}>
                  <MaterialCommunityIcons name={service.icon || 'circle'} size={20} color={serviceColor} />
                </View>
                
                <View style={styles.serviceTexts}>
                  <Text style={styles.serviceLabel}>{service.labelFr}</Text>
                  <Text style={styles.serviceCategory}>
                    {service.isBase ? 'Grille principale' : 'Services hub'}
                  </Text>
                </View>

                <Switch
                  value={isEnabled}
                  onValueChange={() => toggleService(service.key)}
                  trackColor={{ false: '#2D3748', true: '#2BEE79' }}
                  thumbColor={isEnabled ? '#ffffff' : '#718096'}
                  ios_backgroundColor="#2D3748"
                />
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0E151B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
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
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  introSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  serviceList: {
    backgroundColor: '#151D26',
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTexts: {
    flex: 1,
    marginLeft: 15,
  },
  serviceLabel: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  serviceCategory: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 100,
  },
});
