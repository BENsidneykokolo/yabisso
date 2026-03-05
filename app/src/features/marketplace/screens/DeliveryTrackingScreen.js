import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const orderData = {
  id: 'YAB-2938',
  eta: '12 - 15',
  etaTime: '11:45',
  driver: {
    name: 'Kofi Mensah',
    rating: 4.9,
    vehicle: 'Yamaha Ace 125',
    phone: '+237 612 34 56 78',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH_VegiTqrYP2PhRN55m2dSI6UN1FdCaXeKQW2oie78dXVvFN4oX_PjMHZVj2EZgV-i53OOIses8AGprf5RMMx1rjLbizrPSrKWMObc7Hm3u8ebDdEhqsqaSWL2rYaWmuY1MHbPYGLiJGuoVnzDHv7n6q0AvIwXcqhoJgc19F0WOqG0j5nffaIqHTMVRKsT3j0vX4MxmPnE8Be80N9VahW--AEDC4W1X9Pt2OrrQzIOWoDlQ3YkVtGPUTkVSToIjdslJSGXCmk',
  },
  pickupLocation: "Mama Olie's Kitchen",
  status: [
    { step: 'confirmed', title: 'Commande confirmée', time: '11:15', completed: true },
    { step: 'picked', title: 'Ramassé', time: '11:30', subtitle: "Mama Olie's Kitchen", completed: true },
    { step: 'delivery', title: 'En livraison', time: '', subtitle: 'Le livreur est en route vers chez vous', completed: true, active: true },
    { step: 'arriving', title: 'Arrivée', time: 'Est. 11:45', completed: false },
  ],
  summary: {
    items: 2,
    total: '24.50',
  },
};

export default function DeliveryTrackingScreen({ onBack, onNavigate }) {
  const [showSummary, setShowSummary] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapSection}>
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map" size={60} color="#324d67" />
        </View>
        
        {/* Header Overlay */}
        <View style={styles.mapHeader}>
          <Pressable onPress={onBack} style={styles.headerBtn}>
            <MaterialCommunityIcons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Suivre #{orderData.id}</Text>
          <Pressable style={styles.headerBtn}>
            <MaterialCommunityIcons name="headset-mic" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Driver Marker */}
        <View style={styles.driverMarker}>
          <View style={styles.driverMarkerInner}>
            <MaterialCommunityIcons name="motorbike" size={20} color="#fff" />
          </View>
          <View style={styles.driverLabel}>
            <Text style={styles.driverLabelText}>Kofi • 5 mins</Text>
          </View>
        </View>

        {/* Destination Marker */}
        <View style={styles.destinationMarker}>
          <View style={styles.destinationMarkerInner}>
            <MaterialCommunityIcons name="home" size={20} color="#fff" />
          </View>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <Pressable style={styles.mapControlBtn}>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ETA */}
          <View style={styles.etaSection}>
            <View>
              <Text style={styles.etaLabel}>Arrivée estimée</Text>
              <Text style={styles.etaTime}>
                {orderData.eta} <Text style={styles.etaTimeUnit}>mins</Text>
              </Text>
            </View>
            <View style={styles.etaBadge}>
              <Text style={styles.etaBadgeText}>{orderData.etaTime}</Text>
            </View>
          </View>

          {/* Driver Card */}
          <View style={styles.driverCard}>
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Image source={{ uri: orderData.driver.avatar }} style={styles.driverImage} />
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{orderData.driver.name}</Text>
                <View style={styles.driverRating}>
                  <MaterialCommunityIcons name="star" size={14} color="#eab308" />
                  <Text style={styles.ratingText}>{orderData.driver.rating}</Text>
                  <Text style={styles.vehicleText}> • {orderData.driver.vehicle}</Text>
                </View>
              </View>
            </View>
            <View style={styles.driverActions}>
              <Pressable style={styles.actionBtn}>
                <MaterialCommunityIcons name="chat" size={20} color="#137fec" />
              </Pressable>
              <Pressable style={[styles.actionBtn, styles.callBtn]}>
                <MaterialCommunityIcons name="phone" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timelineSection}>
            <Text style={styles.timelineTitle}>Statut de la livraison</Text>
            
            {orderData.status.map((item, index) => (
              <View key={item.step} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    item.completed && styles.timelineDotCompleted,
                    item.active && styles.timelineDotActive,
                  ]}>
                    {item.completed ? (
                      <MaterialCommunityIcons 
                        name={
                          item.step === 'confirmed' ? 'check' : 
                          item.step === 'picked' ? 'store' : 
                          item.step === 'delivery' ? 'local-shipping' : 'location-on'
                        } 
                        size={16} 
                        color={item.active ? '#fff' : '#22c55e'} 
                      />
                    ) : (
                      <MaterialCommunityIcons name="location-on" size={16} color="#64748b" />
                    )}
                  </View>
                  {index < orderData.status.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      item.completed && styles.timelineLineCompleted,
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineStepTitle,
                    item.active && styles.timelineStepTitleActive,
                    !item.completed && !item.active && styles.timelineStepTitlePending,
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={[
                    styles.timelineStepTime,
                    item.active && styles.timelineStepTimeActive,
                  ]}>
                    {item.time}
                    {item.subtitle && ` • ${item.subtitle}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Order Summary Toggle */}
          <Pressable 
            style={styles.summaryToggle}
            onPress={() => setShowSummary(!showSummary)}
          >
            <View>
              <Text style={styles.summaryTitle}>Résumé de la commande</Text>
              <Text style={styles.summarySubtitle}>
                {orderData.summary.items} articles • {orderData.summary.total}€
              </Text>
            </View>
            <MaterialCommunityIcons 
              name={showSummary ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
              size={24} 
              color="#64748b" 
            />
          </Pressable>

          {/* Help Text */}
          <View style={styles.helpSection}>
            <Text style={styles.helpText}>
              Besoin d'aide? <Text style={styles.helpLink}>Signaler un problème</Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  mapSection: {
    height: '50%',
    backgroundColor: '#1e3a5f',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#162d4d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(25, 38, 51, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  driverMarker: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  driverMarkerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  driverLabel: {
    backgroundColor: 'rgba(25, 38, 51, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  driverLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  destinationMarker: {
    position: 'absolute',
    top: '55%',
    left: '65%',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  destinationMarkerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  mapControls: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    gap: 8,
  },
  mapControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#192633',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#101922',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#233345',
    alignSelf: 'center',
    marginBottom: 12,
  },
  etaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  etaLabel: {
    fontSize: 13,
    color: '#92adc9',
    marginBottom: 4,
  },
  etaTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  etaTimeUnit: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#64748b',
  },
  etaBadge: {
    backgroundColor: '#192633',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  etaBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#137fec',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    position: 'relative',
  },
  driverImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#192633',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#192633',
  },
  driverDetails: {
    marginLeft: 12,
    flex: 1,
  },
  driverName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  vehicleText: {
    fontSize: 13,
    color: '#64748b',
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    backgroundColor: '#22c55e',
  },
  timelineSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a2632',
    borderWidth: 2,
    borderColor: '#324d67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
  },
  timelineDotActive: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#324d67',
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#22c55e',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineStepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  timelineStepTitleActive: {
    color: '#137fec',
    fontWeight: 'bold',
  },
  timelineStepTitlePending: {
    color: '#64748b',
  },
  timelineStepTime: {
    fontSize: 12,
    color: '#92adc9',
    marginTop: 4,
  },
  timelineStepTimeActive: {
    color: '#137fec',
  },
  summaryToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  summarySubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  helpSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 13,
    color: '#64748b',
  },
  helpLink: {
    color: '#ef4444',
    fontWeight: '600',
  },
});
