import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const blockData = {
  status: 'suspended',
  reason: 'Abus de grèves de livraison',
  dateOfAction: '17 oct 2023',
  referenceId: '#YAB-992-BLK',
  timeRemaining: '6 jours, 23 heures',
  unlockDate: '24 oct 2023',
  progress: 15,
};

export default function BlockedUserScreen({ onBack, onNavigate }) {
  const handleContactSupport = () => {
    // Navigate to support
  };

  const handleReturnHome = () => {
    onNavigate?.('home');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1a1a1a" />
        </Pressable>
        <Text style={styles.headerTitle}>Statut Marketplace</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Hero Illustration */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="lock-person" size={60} color="#ef4444" />
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Suspendu</Text>
          </View>
        </View>

        {/* Headline */}
        <View style={styles.headlineSection}>
          <Text style={styles.headlineTitle}>Accès restreint</Text>
          <Text style={styles.headlineDescription}>
            Nous avons temporairement suspendu votre accès au marketplace pour assurer l'équité envers nos partenaires de livraison.
          </Text>
        </View>

        {/* Timer Card */}
        <View style={styles.timerCard}>
          <View style={styles.timerAccent} />
          <View style={styles.timerContent}>
            <View style={styles.timerHeader}>
              <Text style={styles.timerLabel}>Temps restant</Text>
              <MaterialCommunityIcons name="timer" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.timerValue}>{blockData.timeRemaining}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${blockData.progress}%` }]} />
            </View>
            <Text style={styles.timerSubtext}>
              Débloque le {blockData.unlockDate}
            </Text>
          </View>
        </View>

        {/* Case Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Détails du dossier</Text>
          <View style={styles.detailsCard}>
            {/* Reason */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialCommunityIcons name="gavel" size={20} color="#ef4444" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Raison</Text>
                <Text style={styles.detailValue}>{blockData.reason}</Text>
              </View>
            </View>

            {/* Date */}
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, styles.detailIconBlue]}>
                <MaterialCommunityIcons name="calendar" size={20} color="#137fec" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date de l'action</Text>
                <Text style={styles.detailValue}>{blockData.dateOfAction}</Text>
              </View>
            </View>

            {/* Reference */}
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <View style={[styles.detailIcon, styles.detailIconOrange]}>
                <MaterialCommunityIcons name="info" size={20} color="#f59e0b" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>ID de référence</Text>
                <Text style={[styles.detailValue, styles.detailValueMono]}>
                  {blockData.referenceId}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Help Block */}
        <View style={styles.helpBlock}>
          <View style={styles.helpIcon}>
            <MaterialCommunityIcons name="help-outline" size={24} color="#64748b" />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpText}>
              Notre système a signalé l'utilisation répétée de "Chauffeur indisponible" comme raison d'annulation alors que les chauffeurs étaient actifs. Pour protéger les notes des chauffeurs, nous examinons manuellement ces modèles.
            </Text>
            <Pressable style={styles.helpLink}>
              <Text style={styles.helpLinkText}>Lire les règles communautaires</Text>
              <MaterialCommunityIcons name="open-in-new" size={14} color="#137fec" />
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.supportBtn} onPress={handleContactSupport}>
          <MaterialCommunityIcons name="support-agent" size={20} color="#fff" />
          <Text style={styles.supportBtnText}>Contacter le support</Text>
        </Pressable>
        <Pressable style={styles.homeBtn} onPress={handleReturnHome}>
          <Text style={styles.homeBtnText}>Retour à l'accueil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    backgroundColor: '#f6f7f8',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    position: 'relative',
  },
  heroIcon: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101922',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headlineSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headlineTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  headlineDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  timerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  timerAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#f59e0b',
  },
  timerContent: {
    padding: 20,
    paddingLeft: 24,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  timerSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'right',
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailIconBlue: {
    backgroundColor: '#eff6ff',
  },
  detailIconOrange: {
    backgroundColor: '#fffbeb',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  detailValueMono: {
    fontFamily: 'monospace',
  },
  helpBlock: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    gap: 12,
  },
  helpIcon: {
    marginTop: 2,
  },
  helpContent: {
    flex: 1,
  },
  helpText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  helpLinkText: {
    fontSize: 12,
    color: '#137fec',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 150,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingBottom: 60,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 14,
  },
  supportBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  homeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});
