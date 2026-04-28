// app/src/features/profile/screens/StorageManagementScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalStorageService } from '../../../lib/services/GlobalStorageService';

const MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

export default function StorageManagementScreen({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [storageData, setStorageData] = useState(null);
  const [clearing, setClearing] = useState(null); // key of category being cleared

  const loadStorage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GlobalStorageService.getTotalUsage();
      setStorageData(data);
    } catch (e) {
      console.error('[StorageScreen] Erreur chargement:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStorage();
  }, [loadStorage]);

  const handleClearCategory = (cat) => {
    if (!cat.clearable) return;
    Alert.alert(
      `Vider le cache ${cat.label} ?`,
      `${cat.sizeFormatted} seront libérés. Les fichiers pourront être retéléchargés via Mesh ou Internet.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            setClearing(cat.key);
            await GlobalStorageService.clearCategory(cat.key);
            await loadStorage();
            setClearing(null);
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Vider tout le cache ?',
      'Tous les médias téléchargés seront supprimés. Ils pourront être retéléchargés automatiquement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout vider',
          style: 'destructive',
          onPress: async () => {
            setClearing('all');
            await GlobalStorageService.clearAllCache();
            await loadStorage();
            setClearing(null);
          },
        },
      ]
    );
  };

  const usagePercent = storageData
    ? Math.min((storageData.totalBytes / MAX_STORAGE_BYTES) * 100, 100)
    : 0;

  const getBarColor = () => {
    if (usagePercent > 90) return '#EF4444';
    if (usagePercent > 70) return '#F59E0B';
    return '#2BEE79';
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Stockage</Text>
          <Pressable style={styles.refreshButton} onPress={loadStorage}>
            <Ionicons name="refresh" size={20} color="#94A3B8" />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2BEE79" />
            <Text style={styles.loadingText}>Analyse du stockage...</Text>
          </View>
        ) : (
          <>
            {/* Circular Usage Display */}
            <View style={styles.usageCard}>
              <View style={styles.circleContainer}>
                <View style={styles.circleOuter}>
                  <View style={[styles.circleProgress, { 
                    borderColor: getBarColor(),
                    transform: [{ rotate: `${(usagePercent / 100) * 360}deg` }]
                  }]} />
                  <View style={styles.circleInner}>
                    <Text style={styles.circlePercent}>{usagePercent.toFixed(0)}%</Text>
                    <Text style={styles.circleLabel}>utilisé</Text>
                  </View>
                </View>
              </View>

              <View style={styles.usageDetails}>
                <View style={styles.usageRow}>
                  <Text style={styles.usageLabel}>Utilisé</Text>
                  <Text style={[styles.usageValue, { color: getBarColor() }]}>
                    {storageData?.totalFormatted || '0 B'}
                  </Text>
                </View>
                <View style={styles.usageDivider} />
                <View style={styles.usageRow}>
                  <Text style={styles.usageLabel}>Limite</Text>
                  <Text style={styles.usageValue}>10 GB</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${usagePercent}%`, backgroundColor: getBarColor() },
                  ]}
                />
              </View>
              <Text style={styles.progressHint}>
                {usagePercent > 90
                  ? '⚠️ Stockage presque plein — nettoyage LRU automatique activé'
                  : usagePercent > 50
                  ? '💡 Stockage modéré — tout va bien'
                  : '✅ Stockage disponible — transferts Mesh actifs'}
              </Text>
            </View>

            {/* Category Breakdown */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Par service</Text>
              <Pressable onPress={handleClearAll}>
                <Text style={styles.clearAllText}>Tout vider</Text>
              </Pressable>
            </View>

            {storageData?.categories?.map((cat) => (
              <Pressable
                key={cat.key}
                style={styles.categoryRow}
                onPress={() => handleClearCategory(cat)}
                disabled={!cat.clearable || clearing === cat.key}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                  <MaterialCommunityIcons name={cat.icon} size={22} color={cat.color} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                  <View style={styles.categoryMeta}>
                    <Text style={styles.categorySize}>{cat.sizeFormatted}</Text>
                    <Text style={styles.categoryDot}>·</Text>
                    <Text style={styles.categoryCount}>
                      {cat.fileCount} {cat.key === 'database' ? 'enregistrements' : 'fichiers'}
                    </Text>
                  </View>
                  {/* Mini progress relative to total */}
                  {storageData.totalBytes > 0 && (
                    <View style={styles.miniBarBg}>
                      <View
                        style={[
                          styles.miniBarFill,
                          {
                            width: `${Math.max(
                              (cat.sizeBytes / storageData.totalBytes) * 100,
                              cat.sizeBytes > 0 ? 2 : 0
                            )}%`,
                            backgroundColor: cat.color,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
                {cat.clearable ? (
                  clearing === cat.key ? (
                    <ActivityIndicator size="small" color={cat.color} />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color="#6B7280" />
                  )
                ) : (
                  <Ionicons name="lock-closed" size={16} color="#374151" />
                )}
              </Pressable>
            ))}

            {/* Info Card */}
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="information-outline" size={18} color="#60A5FA" />
              <Text style={styles.infoText}>
                Le nettoyage automatique (LRU) supprime les fichiers non consultés depuis 7 jours
                lorsque le stockage dépasse 10 GB. Les favoris ne sont jamais supprimés.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  loadingContainer: {
    paddingTop: 80,
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 16,
    fontSize: 14,
  },

  /* Usage Card */
  usageCard: {
    backgroundColor: '#151D26',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  circleOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: '#1C2733',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circleProgress: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  circleInner: {
    alignItems: 'center',
  },
  circlePercent: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
  },
  circleLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  usageDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  usageRow: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  usageLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  usageValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  usageDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#1F2937',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1C2733',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  progressHint: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },

  /* Section Header */
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  clearAllText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Category Rows */
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#151D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  categorySize: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryDot: {
    color: '#374151',
    marginHorizontal: 6,
  },
  categoryCount: {
    color: '#6B7280',
    fontSize: 11,
  },
  miniBarBg: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#1C2733',
    marginTop: 6,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: 3,
    borderRadius: 1.5,
  },

  /* Info Card */
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
});
