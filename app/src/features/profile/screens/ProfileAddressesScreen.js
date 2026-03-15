import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

export default function ProfileAddressesScreen({ onBack, onNavigate, onAddAddress, onSelectAddress }) {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addressCollection = database.get('addresses');
        const allAddresses = await addressCollection.query().fetch();
        setAddresses(allAddresses);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mes Adresses</Text>
        <Pressable onPress={onAddAddress} style={styles.addBtnHeader}>
          <MaterialCommunityIcons name="plus" size={24} color="#2BEE79" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2BEE79" style={{ marginTop: 50 }} />
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <MaterialCommunityIcons name="map-marker-off" size={64} color="#1c2a38" />
            </View>
            <Text style={styles.emptyTitle}>Aucune adresse enregistrée</Text>
            <Text style={styles.emptySubtitle}>Ajoutez vos adresses pour faciliter vos livraisons et vos partages.</Text>
            <Pressable style={styles.addBtnLarge} onPress={onAddAddress}>
              <Text style={styles.addBtnText}>Ajouter une adresse</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {addresses.map((addr) => (
              <Pressable 
                key={addr.id} 
                style={styles.addressCard}
                onPress={() => onSelectAddress?.(addr)}
              >
                <View style={[
                  styles.categoryIcon, 
                  { backgroundColor: addr.category === 'Maison' ? 'rgba(19, 127, 236, 0.15)' : 'rgba(245, 158, 11, 0.15)' }
                ]}>
                  <MaterialCommunityIcons 
                    name={addr.category === 'Maison' ? 'home' : (addr.category === 'Travail' ? 'briefcase' : 'map-marker')} 
                    size={22} 
                    color={addr.category === 'Maison' ? '#137fec' : '#f59e0b'} 
                  />
                </View>
                <View style={styles.addressInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.addressName}>{addr.name}</Text>
                    <View style={styles.idBadge}>
                      <Text style={styles.idBadgeText}>{addr.uniqueId}</Text>
                    </View>
                  </View>
                  <Text style={styles.fullAddress} numberOfLines={1}>{addr.fullAddress || 'Coordonnées GPS uniquement'}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#64748b" />
              </Pressable>
            ))}
            
            <Pressable style={styles.addMoreBtn} onPress={onAddAddress}>
              <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#2BEE79" />
              <Text style={styles.addMoreText}>Ajouter une autre adresse</Text>
            </Pressable>
          </View>
        )}
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
  addBtnHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#151D26',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 32,
  },
  addBtnLarge: {
    backgroundColor: '#2BEE79',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  addBtnText: {
    color: '#0E151B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    gap: 16,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151D26',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  addressInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  idBadge: {
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.2)',
  },
  idBadgeText: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fullAddress: {
    fontSize: 13,
    color: '#94A3B8',
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'rgba(43, 238, 121, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 20,
    marginTop: 8,
  },
  addMoreText: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
