import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function RestaurantSellerAssignCourier({ onBack, onNavigate, orderId }) {
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);

  useEffect(() => {
    loadCouriers();
  }, []);

  const loadCouriers = async () => {
    try {
      const saved = await SecureStore.getItemAsync('restaurant_couriers');
      if (saved) {
        setCouriers(JSON.parse(saved));
      } else {
        const defaultCouriers = [
          { id: 'c1', name: 'Jean Kouamé', phone: '+237 6XX XXX XXX', vehicle: 'moto', available: true },
          { id: 'c2', name: 'Marie Fotso', phone: '+237 6XX XXX XXX', vehicle: 'moto', available: true },
          { id: 'c3', name: 'Paul Nguema', phone: '+237 6XX XXX XXX', vehicle: 'voiture', available: false },
        ];
        setCouriers(defaultCouriers);
      }
    } catch (e) {
      console.error('[AssignCourier] Erreur load:', e);
    }
  };

  const handleAssign = () => {
    if (!selectedCourier) {
      Alert.alert('Erreur', 'Veuillez sélectionner un livreur');
      return;
    }

    const courier = couriers.find(c => c.id === selectedCourier);
    
    Alert.alert(
      'Confirmer l\'assignation',
      `Voulez-vous assigner ${courier?.name} à cette commande ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const saved = await SecureStore.getItemAsync('restaurant_seller_orders');
              if (saved) {
                const orders = JSON.parse(saved);
                const updated = orders.map(o => 
                  o.id === orderId ? { ...o, status: 'assigned', courierId: selectedCourier, courierName: courier?.name, updatedAt: Date.now() } : o
                );
                await SecureStore.setItemAsync('restaurant_seller_orders', JSON.stringify(updated));
                
                // Notification
                const notification = {
                  id: Date.now().toString(),
                  type: 'courier_assigned',
                  title: 'Livreur assigné',
                  message: `${courier?.name} a été assigné à la commande #${orderId?.slice(-6)}`,
                  orderId,
                  createdAt: Date.now(),
                  read: false,
                };
                const notifs = JSON.parse(await SecureStore.getItemAsync('restaurant_seller_notifications') || '[]');
                notifs.unshift(notification);
                await SecureStore.setItemAsync('restaurant_seller_notifications', JSON.stringify(notifs));
                
                onBack();
              }
            } catch (e) {
              console.error('[AssignCourier] Erreur save:', e);
              Alert.alert('Erreur', 'Impossible d\'assigner le livreur');
            }
          },
        },
      ]
    );
  };

  const getVehicleIcon = (vehicle) => {
    switch (vehicle) {
      case 'moto': return 'motorbike';
      case 'voiture': return 'car';
      case 'velo': return 'bicycle';
      default: return 'bicycle';
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
        </Pressable>
        <Text style={styles.headerTitle}>Assigner un livreur</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <MaterialCommunityIcons name="information-outline" size={20} color="#94A3B8" />
        <Text style={styles.infoText}>
          Sélectionnez un livreur disponible pour cette commande
        </Text>
      </View>

      {/* Couriers List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {couriers.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-off" size={64} color="#4B5563" />
            <Text style={styles.emptyTitle}>Aucun livreur</Text>
            <Text style={styles.emptySubtext}>Aucun livreur n'est disponible</Text>
          </View>
        ) : (
          couriers.map((courier) => (
            <TouchableOpacity
              key={courier.id}
              style={[styles.courierCard, selectedCourier === courier.id && styles.courierCardSelected]}
              onPress={() => setSelectedCourier(courier.id)}
              disabled={!courier.available}
            >
              <View style={styles.courierLeft}>
                <View style={[
                  styles.courierAvatar,
                  !courier.available && styles.courierAvatarUnavailable
                ]}>
                  <MaterialCommunityIcons 
                    name={getVehicleIcon(courier.vehicle)} 
                    size={24} 
                    color={courier.available ? '#2BEE79' : '#94A3B8'} 
                  />
                </View>
                <View style={styles.courierInfo}>
                  <Text style={[
                    styles.courierName,
                    !courier.available && styles.courierNameUnavailable
                  ]}>
                    {courier.name}
                  </Text>
                  <View style={styles.courierMeta}>
                    <Text style={styles.courierVehicle}>
                      {courier.vehicle === 'moto' ? 'Moto' : courier.vehicle === 'voiture' ? 'Voiture' : 'Vélo'}
                    </Text>
                    {courier.phone && (
                      <>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.courierPhone}>{courier.phone}</Text>
                      </>
                    )}
                  </View>
                  {!courier.available && (
                    <View style={styles.unavailableBadge}>
                      <Text style={styles.unavailableText}>Indisponible</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.courierRight}>
                {courier.available ? (
                  <View style={[
                    styles.radioButton,
                    selectedCourier === courier.id && styles.radioButtonSelected
                  ]}>
                    {selectedCourier === courier.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                ) : (
                  <View style={[styles.radioButton, styles.radioButtonDisabled]}>
                    <View style={styles.radioButtonX} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Add Courier Button */}
        <TouchableOpacity style={styles.addCourierButton}>
          <Ionicons name="add-circle-outline" size={24} color="#2BEE79" />
          <Text style={styles.addCourierText}>Ajouter un livreur</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.confirmButton,
            !selectedCourier && styles.confirmButtonDisabled
          ]}
          onPress={handleAssign}
          disabled={!selectedCourier}
        >
          <Ionicons name="checkmark-circle" size={22} color="#0E151B" />
          <Text style={styles.confirmButtonText}>Confirmer l'assignation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 13,
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
  },
  courierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(24, 32, 40, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  courierCardSelected: {
    borderColor: '#2BEE79',
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
  },
  courierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courierAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierAvatarUnavailable: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  courierInfo: {
    flex: 1,
  },
  courierName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  courierNameUnavailable: {
    color: '#94A3B8',
  },
  courierMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  courierVehicle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  metaDot: {
    color: '#94A3B8',
    fontSize: 12,
  },
  courierPhone: {
    color: '#94A3B8',
    fontSize: 12,
  },
  unavailableBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  unavailableText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '600',
  },
  courierRight: {
    paddingLeft: 12,
  },
  radioButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#2BEE79',
  },
  radioButtonDisabled: {
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2BEE79',
  },
  radioButtonX: {
    width: 12,
    height: 2,
    backgroundColor: '#94A3B8',
  },
  addCourierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addCourierText: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#0E151B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2BEE79',
    paddingVertical: 16,
    borderRadius: 16,
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(43, 238, 121, 0.3)',
  },
  confirmButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
  },
});