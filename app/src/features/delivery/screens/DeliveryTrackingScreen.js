import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockTracking = {
  id: 'DHL-2026-0512-001',
  status: 'in_transit',
  stages: [
    { id: 1, title: 'Colis récupéré', time: '10 Mai 2026 - 09:00', completed: true },
    { id: 2, title: 'En transit vers Abidjan', time: '10 Mai 2026 - 14:00', completed: true },
    { id: 3, title: 'Arrivé au centre de tri', time: '11 Mai 2026 - 08:00', completed: true },
    { id: 4, title: 'En livraison', time: 'Prévu: 12 Mai 2026 - 14:00', completed: false },
    { id: 5, title: 'Livré', time: '', completed: false },
  ],
  driver: { name: 'Kouadio Bernard', phone: '+225 07 12 34 56 78', vehicle: 'DHL-001' },
};

const DeliveryTrackingScreen = ({ onNavigate, onBack }) => {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Suivre ma livraison</Text>
        </View>

        <View style={styles.trackingCard}>
          <Text style={styles.trackingId}>{mockTracking.id}</Text>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons name="truck-delivery" size={24} color="#4CAF50" />
            <Text style={styles.statusText}>En cours de livraison</Text>
          </View>
        </View>

        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map" size={64} color="#2A3444" />
          <Text style={styles.mapText}>Carte en cours de chargement...</Text>
          <View style={styles.mapRoute}>
            <View style={styles.routePoint}>
              <MaterialCommunityIcons name="circle" size={12} color="#4CAF50" />
              <Text style={styles.routeText}>Abidjan</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#F44336" />
              <Text style={styles.routeText}>Bouaké</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suivi du colis</Text>
          {mockTracking.stages.map((stage, index) => (
            <View key={stage.id} style={styles.trackingStage}>
              <View style={styles.stageIndicator}>
                <View style={[styles.stageDot, stage.completed && styles.stageDotCompleted]}>
                  {stage.completed && <MaterialCommunityIcons name="check" size={12} color="#FFF" />}
                </View>
                {index < mockTracking.stages.length - 1 && (
                  <View style={[styles.stageLine, stage.completed && styles.stageLineCompleted]} />
                )}
              </View>
              <View style={styles.stageContent}>
                <Text style={[styles.stageTitle, stage.completed && styles.stageTitleCompleted]}>
                  {stage.title}
                </Text>
                {stage.time && <Text style={styles.stageTime}>{stage.time}</Text>}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Livreur</Text>
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <MaterialCommunityIcons name="account" size={32} color="#FFF" />
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{mockTracking.driver.name}</Text>
              <Text style={styles.driverVehicle}>{mockTracking.driver.vehicle}</Text>
            </View>
            <TouchableOpacity style={styles.callButton}>
              <MaterialCommunityIcons name="phone" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  trackingCard: { backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 16 },
  trackingId: { fontSize: 14, color: '#888', marginBottom: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { marginLeft: 8, color: '#4CAF50', fontSize: 16, fontWeight: '500' },
  mapPlaceholder: { backgroundColor: '#1A2332', padding: 24, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  mapText: { color: '#888', marginTop: 8 },
  mapRoute: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  routePoint: { alignItems: 'center' },
  routeText: { color: '#FFF', marginTop: 4, fontSize: 12 },
  routeLine: { width: 100, height: 2, backgroundColor: '#2A3444', marginHorizontal: 8 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  trackingStage: { flexDirection: 'row', marginBottom: 8 },
  stageIndicator: { alignItems: 'center', width: 24 },
  stageDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A3444', alignItems: 'center', justifyContent: 'center' },
  stageDotCompleted: { backgroundColor: '#4CAF50' },
  stageLine: { width: 2, flex: 1, backgroundColor: '#2A3444', marginVertical: 4 },
  stageLineCompleted: { backgroundColor: '#4CAF50' },
  stageContent: { flex: 1, marginLeft: 12 },
  stageTitle: { fontSize: 16, color: '#888' },
  stageTitleCompleted: { color: '#FFF' },
  stageTime: { fontSize: 12, color: '#666', marginTop: 4 },
  driverCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12 },
  driverAvatar: { backgroundColor: '#2196F3', padding: 12, borderRadius: 25 },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 16, color: '#FFF', fontWeight: '500' },
  driverVehicle: { fontSize: 14, color: '#888', marginTop: 4 },
  callButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 25 },
});

export default DeliveryTrackingScreen;