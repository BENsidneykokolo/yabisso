import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import OfflineSignupChoiceModal from '../components/OfflineSignupChoiceModal';

export default function SignupScreen({
  onBack,
  onPin,
  onOfflineSms,
  onOfflineQr,
  onOfflineBle,
  onKioskMode,
}) {
  const [showOfflineChoice, setShowOfflineChoice] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.backgroundOrbBlue} />
      <View style={styles.backgroundOrbYellow} />

      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'<'} </Text>
        </Pressable>
        <Text style={styles.topTitle}>Creer un compte</Text>
        <View style={{ width: 64 }} />
      </View>

      <View style={styles.brandStrip}>
        <View style={[styles.strip, styles.stripBlue]} />
        <View style={[styles.strip, styles.stripRed]} />
        <View style={[styles.strip, styles.stripYellow]} />
        <View style={[styles.strip, styles.stripGreen]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Inscrivez-vous pour acceder a votre portefeuille, la livraison et plus.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nom complet</Text>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Jean Dupont"
              placeholderTextColor="#7E8DA0"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email ou telephone</Text>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="nom@exemple.com"
              placeholderTextColor="#7E8DA0"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="********"
              placeholderTextColor="#7E8DA0"
              style={styles.input}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="********"
              placeholderTextColor="#7E8DA0"
              style={styles.input}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.roleSection}>
          <Text style={styles.roleTitle}>Choisissez votre statut</Text>
          <Text style={styles.roleSubtitle}>
            Selectionnez le profil qui correspond a votre fonction.
          </Text>

          <Pressable
            style={[
              styles.roleCard,
              selectedRole === 'user' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('user')}
          >
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Utilisateur</Text>
            </View>
            <Text style={styles.roleCardTitle}>Utilisateur</Text>
            <Text style={styles.roleCardDesc}>
              Pour les utilisateurs qui achetent, payent et utilisent les services.
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.roleCard,
              selectedRole === 'partner' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('partner')}
          >
            <View style={[styles.roleBadge, styles.roleBadgePartner]}>
              <Text style={styles.roleBadgeText}>Partner</Text>
            </View>
            <Text style={styles.roleCardTitle}>Partner</Text>
            <Text style={styles.roleCardDesc}>
              Pour proposer des services ou vendre (plombier, vendeur, hotel, etc.).
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.roleCard,
              selectedRole === 'kiosk' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('kiosk')}
          >
            <View style={[styles.roleBadge, styles.roleBadgeKiosk]}>
              <Text style={styles.roleBadgeText}>Kiosque</Text>
            </View>
            <Text style={styles.roleCardTitle}>Kiosque</Text>
            <Text style={styles.roleCardDesc}>
              Pour vendre les recharges Yabisso, valider les users offline et recharger des points.
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.roleCard,
              selectedRole === 'affiliate' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('affiliate')}
          >
            <View style={[styles.roleBadge, styles.roleBadgeAffiliate]}>
              <Text style={styles.roleBadgeText}>Affilier</Text>
            </View>
            <Text style={styles.roleCardTitle}>Affilier</Text>
            <Text style={styles.roleCardDesc}>
              Pour promouvoir Yabisso et gagner des commissions sur chaque parrainage.
            </Text>
          </Pressable>
        </View>

        <Text style={styles.legal}>
          En creant un compte, vous acceptez nos Conditions et notre Politique de
          confidentialite.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            if (selectedRole === 'kiosk') {
              if (onKioskMode) onKioskMode();
              else setShowOfflineChoice(true);
            } else {
              setShowOfflineChoice(true);
            }
          }}
        >
          <Text style={styles.primaryButtonText}>
            {selectedRole === 'kiosk' ? 'Activer Mode Kiosque' : "S'inscrire"}
          </Text>
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Ou continuer avec</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton}>
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable style={styles.socialButton}>
            <Text style={styles.socialText}>Apple</Text>
          </Pressable>
        </View>

        <Text style={styles.signInText}>
          Vous avez deja un compte ? <Text style={styles.signInLink}>Se connecter</Text>
        </Text>
      </ScrollView>

      <OfflineSignupChoiceModal
        visible={showOfflineChoice}
        onClose={() => setShowOfflineChoice(false)}
        onPin={() => {
          setShowOfflineChoice(false);
          if (onPin) {
            onPin();
          }
        }}
        onSms={() => {
          setShowOfflineChoice(false);
          if (onOfflineSms) {
            onOfflineSms();
          }
        }}
        onQr={() => {
          setShowOfflineChoice(false);
          if (onOfflineQr) {
            onOfflineQr();
          }
        }}
        onBle={() => {
          setShowOfflineChoice(false);
          if (onOfflineBle) {
            onOfflineBle();
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  backgroundOrbBlue: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 260,
    height: 220,
    borderRadius: 130,
    backgroundColor: 'rgba(73, 159, 255, 0.12)',
  },
  backgroundOrbYellow: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 220,
    height: 200,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 214, 102, 0.12)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 1,
  },
  backButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  backText: {
    color: '#E6EDF3',
    fontSize: 18,
    fontWeight: '600',
  },
  topTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  brandStrip: {
    flexDirection: 'row',
    height: 4,
  },
  strip: {
    flex: 1,
  },
  stripBlue: {
    backgroundColor: '#137FEC',
  },
  stripRed: {
    backgroundColor: '#EF4444',
  },
  stripYellow: {
    backgroundColor: '#EAB308',
  },
  stripGreen: {
    backgroundColor: '#22C55E',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 48,
  },
  subtitle: {
    color: '#9FB0C3',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#E6EDF3',
    fontSize: 13,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 38, 51, 0.9)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(50, 77, 103, 0.7)',
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    paddingVertical: 12,
    fontSize: 15,
  },
  legal: {
    color: '#7C8A9A',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    color: '#7C8A9A',
    fontSize: 12,
    marginHorizontal: 10,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(50, 77, 103, 0.7)',
    alignItems: 'center',
    marginHorizontal: 6,
    backgroundColor: 'rgba(25, 38, 51, 0.9)',
  },
  socialText: {
    color: '#E6EDF3',
    fontSize: 14,
    fontWeight: '600',
  },
  signInText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#8A97A6',
    fontSize: 13,
  },
  signInLink: {
    color: '#137FEC',
    fontWeight: '600',
  },
  roleSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  roleTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  roleSubtitle: {
    color: '#8A97A6',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  roleCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(50, 77, 103, 0.7)',
    backgroundColor: 'rgba(25, 38, 51, 0.9)',
    padding: 14,
    marginBottom: 10,
  },
  roleCardActive: {
    borderColor: '#137FEC',
    backgroundColor: 'rgba(19, 127, 236, 0.12)',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  roleBadgePartner: {
    backgroundColor: 'rgba(234, 179, 8, 0.18)',
  },
  roleBadgeKiosk: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
  },
  roleBadgeAffiliate: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
  },
  roleBadgeText: {
    color: '#E6EDF3',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  roleCardTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  roleCardDesc: {
    color: '#9FB0C3',
    fontSize: 12,
    lineHeight: 18,
  },
});
