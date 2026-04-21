import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Animated,
  Easing
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 3 statuts: NOT_DOWNLOADED, DOWNLOADING, DOWNLOADED
const PACK_STATUS = {
  NOT_DOWNLOADED: 'NOT_DOWNLOADED',
  DOWNLOADING: 'DOWNLOADING',
  DOWNLOADED: 'DOWNLOADED'
};

export default function PacksScreen({ onBack }) {
  // States des packs
  const [lobaPackStatus, setLobaPackStatus] = useState(PACK_STATUS.NOT_DOWNLOADED);
  const [walletPackStatus, setWalletPackStatus] = useState(PACK_STATUS.DOWNLOADED);
  const [mapsPackStatus, setMapsPackStatus] = useState(PACK_STATUS.DOWNLOADED);

  const [downloadProgress, setDownloadProgress] = useState(0);
  
  // Animation for the shimmer/progress overlay
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Charger le statut initial depuis le stockage local
    const loadState = async () => {
      try {
        const lobaState = await AsyncStorage.getItem('@pack_loba_status');
        if (lobaState) setLobaPackStatus(lobaState);
      } catch (e) {
        // keep defaults
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    // Animation pour le shimmer "Downloading"
    if (lobaPackStatus === PACK_STATUS.DOWNLOADING) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ])
      ).start();

      // Simuler un téléchargement
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setDownloadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setLobaPackStatus(PACK_STATUS.DOWNLOADED);
          AsyncStorage.setItem('@pack_loba_status', PACK_STATUS.DOWNLOADED);
        }
      }, 600);

      return () => clearInterval(interval);
    }
  }, [lobaPackStatus]);

  const handleDownloadLoba = () => {
    setLobaPackStatus(PACK_STATUS.DOWNLOADING);
    setDownloadProgress(0);
  };

  const handleRemoveLoba = async () => {
    setLobaPackStatus(PACK_STATUS.NOT_DOWNLOADED);
    await AsyncStorage.removeItem('@pack_loba_status');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <Text style={styles.headerTitle}>Packs Hors-Ligne</Text>
        <View style={styles.settingsBtn}>
          <MaterialIcons name="settings" size={20} color="#E6EDF3" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Gérez vos contenus pour l'utilisation sans internet</Text>

        {/* 1. Pack Loba (Status Variable) */}
        <View style={[styles.packCard, lobaPackStatus === PACK_STATUS.DOWNLOADING && styles.packCardDownloading]}>
          <View style={styles.packHeader}>
            <View style={[styles.iconContainer, { color: '#ef4444' }]}>
              <MaterialIcons name="shopping-bag" size={28} color="#137fec" />
            </View>
            <View style={styles.packInfo}>
              <View style={styles.packTitleRow}>
                <Text style={styles.packTitle}>Pack Loba</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>50 MB</Text>
                </View>
              </View>
              <Text style={styles.packDesc}>Articles marketplace & médias communautaires pour navigation locale.</Text>
            </View>
          </View>

          {/* États du Pack Loba */}
          {lobaPackStatus === PACK_STATUS.NOT_DOWNLOADED && (
             <View style={styles.actionRow}>
               <View style={styles.statusIndicator}>
                 <View style={[styles.dot, { backgroundColor: '#475569' }]} />
                 <Text style={styles.statusText}>Non téléchargé</Text>
               </View>
               <Pressable style={styles.downloadBtn} onPress={handleDownloadLoba}>
                 <MaterialIcons name="file-download" size={18} color="#0E151B" />
                 <Text style={styles.downloadBtnText}>Télécharger</Text>
               </Pressable>
             </View>
          )}

          {lobaPackStatus === PACK_STATUS.DOWNLOADING && (
            <View style={styles.progressSection}>
               <View style={styles.progressHeader}>
                 <Text style={styles.downloadingText}>Téléchargement...</Text>
                 <Text style={styles.progressValue}>{(50 * (downloadProgress/100)).toFixed(1)} / 50.0 MB</Text>
               </View>
               <View style={styles.progressBarBg}>
                 <View style={[styles.progressBarFill, { width: `${downloadProgress}%` }]} />
               </View>
               <View style={styles.cancelRow}>
                 <Pressable onPress={handleRemoveLoba}>
                    <Text style={styles.cancelText}>ANNULER</Text>
                 </Pressable>
               </View>
            </View>
          )}

          {lobaPackStatus === PACK_STATUS.DOWNLOADED && (
            <View style={styles.actionRow}>
               <View style={[styles.statusIndicatorReady, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                 <MaterialCommunityIcons name="check-circle" size={14} color="#22c55e" />
                 <Text style={[styles.statusText, { color: '#22c55e', fontWeight:'bold' }]}>Prêt pour hors-ligne</Text>
               </View>
               <Pressable style={styles.removeBtn} onPress={handleRemoveLoba}>
                 <MaterialIcons name="delete" size={18} color="#E6EDF3" />
                 <Text style={styles.removeBtnText}>Supprimer</Text>
               </Pressable>
             </View>
          )}
        </View>

        {/* 2. Pack Wallet (Mock Downloaded) */}
        <View style={styles.packCard}>
          <View style={styles.packHeader}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="account-balance-wallet" size={28} color="#eab308" />
            </View>
            <View style={styles.packInfo}>
              <View style={styles.packTitleRow}>
                <Text style={styles.packTitle}>Pack Wallet</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>12.5 MB</Text>
                </View>
              </View>
              <Text style={styles.packDesc}>Transactions sécurisées hors-ligne & historique des soldes.</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
             <View style={[styles.statusIndicatorReady, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
               <MaterialCommunityIcons name="check-circle" size={14} color="#22c55e" />
               <Text style={[styles.statusText, { color: '#22c55e', fontWeight:'bold' }]}>Prêt pour hors-ligne</Text>
             </View>
             <Pressable style={styles.removeBtn} onPress={() => {}}>
               <MaterialIcons name="delete" size={18} color="#E6EDF3" />
               <Text style={styles.removeBtnText}>Supprimer</Text>
             </Pressable>
           </View>
        </View>

        {/* 3. Pack Maps (Mock Downloaded) */}
        <View style={styles.packCard}>
          <View style={styles.packHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="map-marker-path" size={28} color="#22c55e" />
            </View>
            <View style={styles.packInfo}>
              <View style={styles.packTitleRow}>
                <Text style={styles.packTitle}>Cartes Ville</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>120 MB</Text>
                </View>
              </View>
              <Text style={styles.packDesc}>Cartes routières détaillées pour la navigation P2P locale.</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
             <View style={[styles.statusIndicatorReady, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
               <MaterialCommunityIcons name="check-circle" size={14} color="#22c55e" />
               <Text style={[styles.statusText, { color: '#22c55e', fontWeight:'bold' }]}>Prêt pour hors-ligne</Text>
             </View>
             <Pressable style={styles.removeBtn} onPress={() => {}}>
               <MaterialIcons name="delete" size={18} color="#E6EDF3" />
               <Text style={styles.removeBtnText}>Supprimer</Text>
             </Pressable>
           </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C2632',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 24,
  },
  packCard: {
    backgroundColor: '#1C2632',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  packCardDownloading: {
    borderColor: 'rgba(19, 127, 236, 0.4)',
    borderWidth: 1.5,
  },
  packHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#23303e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  packInfo: {
    flex: 1,
  },
  packTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  packTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  packDesc: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicatorReady: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  downloadBtnText: {
    color: '#0E151B',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#233648',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  removeBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  progressSection: {
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  downloadingText: {
    color: '#137fec',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressValue: {
    color: '#94a3b8',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#2b3a4a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#137fec',
    borderRadius: 4,
  },
  cancelRow: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  cancelText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});
