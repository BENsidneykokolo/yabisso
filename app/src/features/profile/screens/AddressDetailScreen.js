import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

export default function AddressDetailScreen({ address, onBack }) {
  const [showFullQR, setShowFullQR] = useState(false);

  const handleShare = async () => {
    try {
      // Construction du message de partage
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`;
      const message = `Yabisso Adresse : ${address.name}\nNuméro Unique : ${address.uniqueId}\n\nLocalisation : ${mapUrl}`;
      
      await Share.share({
        message: message,
        title: `Partager l'adresse : ${address.name}`,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager l\'adresse');
    }
  };

  const copyId = () => {
    // Dans une vraie app, on utiliserait Clipboard.setString
    Alert.alert('Copié', `Le numéro unique ${address.uniqueId} a été copié.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Détails de l'adresse</Text>
        <Pressable onPress={handleShare} style={styles.shareBtnHeader}>
          <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.addressHero}>
          <View style={[
            styles.heroIconBg,
            { backgroundColor: address.category === 'Maison' ? 'rgba(19, 127, 236, 0.15)' : 'rgba(245, 158, 11, 0.15)' }
          ]}>
            <MaterialCommunityIcons 
              name={address.category === 'Maison' ? 'home' : (address.category === 'Travail' ? 'briefcase' : 'map-marker')} 
              size={40} 
              color={address.category === 'Maison' ? '#137fec' : '#f59e0b'} 
            />
          </View>
          <Text style={styles.heroName}>{address.name}</Text>
          <View style={styles.heroIdContainer}>
            <Text style={styles.heroIdText}>{address.uniqueId}</Text>
            <Pressable onPress={copyId}>
              <MaterialCommunityIcons name="content-copy" size={16} color="#2BEE79" style={{ marginLeft: 8 }} />
            </Pressable>
          </View>
        </View>

        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>QR Code Unique</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={address.qrPayload}
              size={200}
              backgroundColor="#fff"
              color="#0E151B"
            />
          </View>
          <Text style={styles.qrHint}>
            Faites scanner ce code pour partager instantanément votre position précise.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Localisation GPS</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="latitude" size={20} color="#94A3B8" />
              <Text style={styles.infoText}>Latitude: {address.latitude.toFixed(6)}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="longitude" size={20} color="#94A3B8" />
              <Text style={styles.infoText}>Longitude: {address.longitude.toFixed(6)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsGrid}>
          <Pressable style={styles.actionCard} onPress={handleShare}>
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
              <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
            </View>
            <Text style={styles.actionLabel}>WhatsApp</Text>
          </Pressable>
          
          <Pressable style={styles.actionCard} onPress={handleShare}>
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(19, 127, 236, 0.15)' }]}>
              <MaterialCommunityIcons name="message-text" size={24} color="#137fec" />
            </View>
            <Text style={styles.actionLabel}>SMS / Chat</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => Alert.alert('Facebook', 'Partage sur Facebook non configuré.')}>
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(24, 119, 242, 0.15)' }]}>
              <MaterialCommunityIcons name="facebook" size={24} color="#1877F2" />
            </View>
            <Text style={styles.actionLabel}>Facebook</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={() => Alert.alert('Loba', 'Partage sur Loba en cours de développement.')}>
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}>
              <MaterialCommunityIcons name="video" size={24} color="#a78bfa" />
            </View>
            <Text style={styles.actionLabel}>Loba</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  shareBtnHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  addressHero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  heroIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.2)',
  },
  heroIdText: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
  },
  qrHint: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: '#151D26',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#151D26',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
});
