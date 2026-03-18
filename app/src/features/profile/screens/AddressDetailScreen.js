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
  Clipboard,
  Linking,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { database } from '../../../lib/db';

export default function AddressDetailScreen({ address, onBack, onNavigate }) {
  const handleCopyCode = () => {
    try {
      if (Clipboard && Clipboard.setString) {
        Clipboard.setString(address.unique_id);
        Alert.alert('Copié !', `Le code "${address.unique_id}" a été copié.`);
      } else {
        Alert.alert('Code', address.unique_id);
      }
    } catch (error) {
      Alert.alert('Code', address.unique_id);
    }
  };

  const handleShare = async () => {
    try {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`;
      const message = `Yabisso Adresse : ${address.name}\nCode Unique : ${address.unique_id}\nVille : ${address.city || 'Non renseignée'}\n\nLocalisation : ${mapUrl}`;
      
      await Share.share({
        message: message,
        title: `Partager l'adresse : ${address.name}`,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager l\'adresse');
    }
  };

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate('address_map', { addressData: address });
    } else {
      const label = encodeURIComponent(address.name || 'Destination');
      const url = Platform.select({
        android: `google.navigation:q=${address.latitude},${address.longitude}&label=${label}`,
        ios: `comgooglemaps://?daddr=${address.latitude},${address.longitude}&directionsmode=driving&label=${label}`,
      });

      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${address.latitude},${address.longitude}`;
          Linking.openURL(webUrl);
        }
      });
    }
  };

  const copyCoords = () => {
    const coords = `${address.latitude.toFixed(8)}, ${address.longitude.toFixed(8)}`;
    try {
      if (Clipboard && Clipboard.setString) {
        Clipboard.setString(coords);
        Alert.alert('Copié !', 'Les coordonnées ont été copiées.');
      }
    } catch (error) {
      Alert.alert('Coordonnées', coords);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer l\'adresse',
      `Êtes-vous sûr de vouloir supprimer "${address.name}" ?\n\nCette action est irréversible.`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                await address.destroyPermanently();
              });
              Alert.alert('Succès', 'Adresse supprimée avec succès.', [
                { text: 'OK', onPress: () => onBack() }
              ]);
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'adresse.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Détails</Text>
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
              size={48} 
              color={address.category === 'Maison' ? '#137fec' : '#f59e0b'} 
            />
          </View>
          <Text style={styles.heroName}>{address.name}</Text>
          <Pressable style={styles.heroIdContainer} onPress={handleCopyCode}>
            <Text style={styles.heroIdText}>{address.unique_id}</Text>
            <MaterialCommunityIcons name="content-copy" size={18} color="#2BEE79" />
          </Pressable>
          {address.city && (
            <View style={styles.cityBadge}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#94A3B8" />
              <Text style={styles.cityBadgeText}>{address.city}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <Pressable style={styles.actionCard} onPress={handleCopyCode}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(43, 238, 121, 0.15)' }]}>
                <MaterialCommunityIcons name="content-copy" size={24} color="#2BEE79" />
              </View>
              <Text style={styles.actionLabel}>Copier le code</Text>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={handleNavigate}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(19, 127, 236, 0.15)' }]}>
                <MaterialCommunityIcons name="navigation" size={24} color="#137fec" />
              </View>
              <Text style={styles.actionLabel}>Voir sur carte</Text>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={handleShare}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
                <MaterialCommunityIcons name="share-variant" size={24} color="#25D366" />
              </View>
              <Text style={styles.actionLabel}>Partager</Text>
            </Pressable>

            <Pressable style={styles.actionCard} onPress={copyCoords}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.actionLabel}>Copier coordonnées</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>QR Code pour partage rapide</Text>
          <Text style={styles.qrSubtitle}>
            Faites scanner ce code pour partager instantanément votre position
          </Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={address.qr_payload}
              size={200}
              backgroundColor="#fff"
              color="#0E151B"
            />
          </View>
          <Pressable style={styles.shareQrBtn} onPress={handleShare}>
            <MaterialCommunityIcons name="share" size={20} color="#2BEE79" />
            <Text style={styles.shareQrBtnText}>Partager le QR Code</Text>
          </Pressable>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations GPS</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBg}>
                <MaterialCommunityIcons name="latitude" size={18} color="#2BEE79" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Latitude</Text>
                <Text style={styles.infoValue}>{address.latitude.toFixed(8)}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconBg}>
                <MaterialCommunityIcons name="longitude" size={18} color="#2BEE79" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Longitude</Text>
                <Text style={styles.infoValue}>{address.longitude.toFixed(8)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Partager via</Text>
          <View style={styles.socialGrid}>
            <Pressable style={styles.socialCard} onPress={handleShare}>
              <View style={[styles.socialIconBg, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
                <MaterialCommunityIcons name="whatsapp" size={28} color="#25D366" />
              </View>
              <Text style={styles.socialLabel}>WhatsApp</Text>
            </Pressable>

            <Pressable style={styles.socialCard} onPress={handleShare}>
              <View style={[styles.socialIconBg, { backgroundColor: 'rgba(19, 127, 236, 0.15)' }]}>
                <MaterialCommunityIcons name="message-text" size={28} color="#137fec" />
              </View>
              <Text style={styles.socialLabel}>SMS</Text>
            </Pressable>

            <Pressable style={styles.socialCard} onPress={handleShare}>
              <View style={[styles.socialIconBg, { backgroundColor: 'rgba(24, 119, 242, 0.15)' }]}>
                <MaterialCommunityIcons name="facebook" size={28} color="#1877F2" />
              </View>
              <Text style={styles.socialLabel}>Facebook</Text>
            </Pressable>

            <Pressable style={styles.socialCard} onPress={() => Alert.alert('Loba', 'Fonctionnalité en cours de développement.')}>
              <View style={[styles.socialIconBg, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}>
                <MaterialCommunityIcons name="video" size={28} color="#a78bfa" />
              </View>
              <Text style={styles.socialLabel}>Loba</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.dangerZone}>
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444" />
            <Text style={styles.deleteBtnText}>Supprimer cette adresse</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
  },
  heroIdText: {
    color: '#2BEE79',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  cityBadgeText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 16,
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#151D26',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
  },
  shareQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
  },
  shareQrBtnText: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: '600',
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
    paddingVertical: 8,
  },
  infoIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 8,
  },
  shareSection: {
    marginBottom: 24,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialCard: {
    width: '23%',
    backgroundColor: '#151D26',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  socialIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  socialLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  dangerZone: {
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
