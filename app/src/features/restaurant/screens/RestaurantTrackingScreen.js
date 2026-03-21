import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const trackingSteps = [
  { id: 1, title: 'Commande passée', time: '14:30', completed: true },
  { id: 2, title: 'Paiement confirmé', time: '14:32', completed: true },
  { id: 3, title: 'En préparation', time: '14:45', completed: true },
  { id: 4, title: 'En livraison', time: '15:10', completed: true },
  { id: 5, title: 'Livrée', time: '--:--', completed: false },
];

const deliveryPerson = {
  name: 'Marc Togo',
  phone: '+237 6XX XXX XXX',
  photo: 'https://via.placeholder.com/100',
  rating: 4.8,
};

export default function RestaurantTrackingScreen({ route, onBack, onNavigate }) {
  const order = route?.params?.order || {
    id: 'CMD-001',
    restaurant: 'Chicken Republic',
    total: 4500,
    items: [
      { name: 'Riz Jollof au Poulet', quantity: 2 },
      { name: 'Plateau Suya', quantity: 1 },
    ],
  };

  const currentStep = 4; // En livraison

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Suivi de commande</Text>
        <Pressable style={styles.homeBtn} onPress={() => onNavigate?.('home')}>
          <MaterialCommunityIcons name="home" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map placeholder */}
        <View style={styles.mapContainer}>
          <MaterialCommunityIcons name="map" size={48} color="#64748b" />
          <Text style={styles.mapText}>Carte en temps réel</Text>
        </View>

        {/* ETA */}
        <View style={styles.etaContainer}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#137fec" />
          <Text style={styles.etaText}>Arrivée dans 15-20 min</Text>
        </View>

        {/* Delivery Person */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryInfo}>
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={32} color="#fff" />
            </View>
            <View style={styles.deliveryDetails}>
              <Text style={styles.deliveryName}>{deliveryPerson.name}</Text>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
                <Text style={styles.ratingText}>{deliveryPerson.rating}</Text>
              </View>
            </View>
          </View>
          <View style={styles.deliveryActions}>
            <Pressable style={styles.actionBtn}>
              <MaterialCommunityIcons name="phone" size={20} color="#137fec" />
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <MaterialCommunityIcons name="message-text" size={20} color="#137fec" />
            </Pressable>
          </View>
        </View>

        {/* Tracking Steps */}
        <View style={styles.trackingContainer}>
          <Text style={styles.sectionTitle}>Statut de la commande</Text>
          
          {trackingSteps.map((step, index) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepIndicator}>
                {step.completed ? (
                  <View style={styles.stepDotCompleted}>
                    <MaterialCommunityIcons name="check" size={12} color="#fff" />
                  </View>
                ) : index === currentStep ? (
                  <View style={styles.stepDotActive} />
                ) : (
                  <View style={styles.stepDot} />
                )}
                {index < trackingSteps.length - 1 && (
                  <View style={[
                    styles.stepLine,
                    step.completed && styles.stepLineCompleted
                  ]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepTitle,
                  step.completed && styles.stepTitleCompleted,
                  index === currentStep && styles.stepTitleActive
                ]}>
                  {step.title}
                </Text>
                {step.completed && (
                  <Text style={styles.stepTime}>{step.time}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Résumé de la commande</Text>
          <Text style={styles.orderId}>Commande #{order.id}</Text>
          <Text style={styles.restaurantName}>{order.restaurant}</Text>
          
          <View style={styles.itemsList}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemText}>{item.quantity}x {item.name}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.total.toLocaleString()} FCA</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  homeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    height: 180,
    backgroundColor: '#1c2630',
    marginHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    color: '#64748b',
    marginTop: 8,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  etaText: {
    color: '#137fec',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c2630',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryDetails: {
    marginLeft: 12,
  },
  deliveryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  deliveryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepIndicator: {
    width: 24,
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#64748b',
  },
  stepDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#137fec',
    borderWidth: 3,
    borderColor: '#137fec',
  },
  stepDotCompleted: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 2,
    height: 30,
    backgroundColor: '#64748b',
    marginTop: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#22c55e',
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  stepTitle: {
    color: '#64748b',
    fontSize: 14,
  },
  stepTitleCompleted: {
    color: '#94a3b8',
  },
  stepTitleActive: {
    color: '#137fec',
    fontWeight: 'bold',
  },
  stepTime: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#1c2630',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 100,
    padding: 16,
    borderRadius: 16,
  },
  orderId: {
    color: '#64748b',
    fontSize: 12,
  },
  restaurantName: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  itemsList: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  itemRow: {
    marginBottom: 8,
  },
  itemText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#137fec',
    fontSize: 16,
    fontWeight: 'bold',
  },
});