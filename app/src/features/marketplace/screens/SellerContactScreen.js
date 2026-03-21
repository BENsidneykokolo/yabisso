import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SellerContactScreen({ onBack, seller }) {
  const sellerInfo = seller || {
    name: 'Ma Boutique',
    location: 'Centre-ville, Rue principale',
    phone: '+237 6XX XXX XXX',
    email: 'boutique@email.com',
    hours: '8h - 20h',
    avatar: null,
    rating: 4.6,
    reviewCount: 128,
    verified: true,
    memberSince: 'Janvier 2024',
  };

  const handleCall = () => {
    if (sellerInfo.phone) {
      Linking.openURL(`tel:${sellerInfo.phone}`);
    }
  };

  const handleWhatsApp = () => {
    const phone = sellerInfo.phone.replace(/\D/g, '');
    Linking.openURL(`whatsapp://send?phone=${phone}`);
  };

  const handleEmail = () => {
    if (sellerInfo.email) {
      Linking.openURL(`mailto:${sellerInfo.email}`);
    }
  };

  const handleLocation = () => {
    const address = encodeURIComponent(sellerInfo.location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Contacter</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.profileCard}>
          {sellerInfo.avatar ? (
            <Image source={{ uri: sellerInfo.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="storefront" size={32} color="#0E151B" />
            </View>
          )}
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#2BEE79" />
            <Text style={styles.verifiedText}>Vérifié</Text>
          </View>
          
          <Text style={styles.sellerName}>{sellerInfo.name}</Text>
          
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FACC15" />
            <Text style={styles.ratingText}>{sellerInfo.rating}</Text>
            <Text style={styles.reviewCount}>({sellerInfo.reviewCount} avis)</Text>
          </View>
          
          <Text style={styles.memberSince}>Membre depuis {sellerInfo.memberSince}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="call" size={22} color="#2BEE79" />
            </View>
            <Text style={styles.actionLabel}>Appeler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#25D366' }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>WhatsApp</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#EA4335' }]}>
              <Ionicons name="mail" size={22} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations de contact</Text>
          
          <TouchableOpacity style={styles.infoItem} onPress={handleLocation}>
            <View style={styles.infoIcon}>
              <Ionicons name="location" size={20} color="#2BEE79" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <Text style={styles.infoValue}>{sellerInfo.location}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6B7A8B" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoItem} onPress={handleCall}>
            <View style={styles.infoIcon}>
              <Ionicons name="call" size={20} color="#2BEE79" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{sellerInfo.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6B7A8B" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoItem} onPress={handleEmail}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail" size={20} color="#2BEE79" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{sellerInfo.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6B7A8B" />
          </TouchableOpacity>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={20} color="#2BEE79" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Horaires d'ouverture</Text>
              <Text style={styles.infoValue}>{sellerInfo.hours}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Autres options</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons name="message-text" size={20} color="#2BEE79" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>Envoyer un message</Text>
              <Text style={styles.optionSubtext}>Discuter directement avec le vendeur</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIcon}>
              <Ionicons name="qr-code" size={20} color="#2BEE79" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>Scanner QR code</Text>
              <Text style={styles.optionSubtext}>Scanner le code du vendeur</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons name="share-variant" size={20} color="#2BEE79" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>Partager le profil</Text>
              <Text style={styles.optionSubtext}>Partager les coordonnées</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionIcon}>
              <MaterialCommunityIcons name="flag" size={20} color="#2BEE79" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>Signaler un problème</Text>
              <Text style={styles.optionSubtext}>Signaler un comportement suspect</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.safetyTip}>
          <Ionicons name="shield-checkmark" size={20} color="#2BEE79" />
          <Text style={styles.safetyText}>
            Ne partagez jamais vos codes PIN ou mots de passe. Yabisso ne vous demandera jamais vos informations bancaires par téléphone.
          </Text>
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
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  placeholder: {
    width: 40,
  },
  profileCard: {
    marginTop: 24,
    padding: 24,
    borderRadius: 22,
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 28,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  verifiedText: {
    color: '#2BEE79',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  sellerName: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    color: '#FACC15',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  reviewCount: {
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: 6,
  },
  memberSince: {
    color: '#6B7A8B',
    fontSize: 12,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#E6EDF3',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#6B7A8B',
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '500',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  optionSubtext: {
    color: '#6B7A8B',
    fontSize: 12,
    marginTop: 2,
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.2)',
  },
  safetyText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: 12,
    lineHeight: 18,
  },
});