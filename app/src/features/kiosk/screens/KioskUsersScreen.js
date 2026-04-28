// app/src/features/kiosk/screens/KioskUsersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

function KioskUsersScreen({ navigation }) {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadPendingRegistrations();
  }, []);

  const loadPendingRegistrations = async () => {
    try {
      const pending = await database.get('sync_queue')
        .query(Q.where('action', Q.like('%signup%')))
        .fetch();
      
      setPendingRegistrations(pending.map(p => ({
        id: p.id,
        data: JSON.parse(p.payloadJson || '{}'),
        status: p.status,
        createdAt: p.createdAt,
      })));
    } catch (e) {
      console.log('[KioskUsers] Erreur:', e);
    }
  };

  const handleAcceptRegistration = async (user) => {
    try {
      await database.write(async () => {
        const profiles = await database.get('profiles').query().fetch();
        const existing = profiles.find(p => p.phone === user.data?.phone);
        
        if (existing) {
          await existing.update(p => {
            p.status = 'active';
          });
        } else {
          await database.get('profiles').create(p => {
            p.phone = user.data?.phone || '';
            p.deviceId = user.data?.deviceId || '';
            p.status = 'active';
            p.createdAt = Date.now();
            p.updatedAt = Date.now();
          });
        }
        
        // Update sync queue
        const queueItem = await database.get('sync_queue').find(user.id);
        await queueItem.update(q => {
          q.status = 'synced';
        });
      });
      
      Alert.alert('Succès', 'Inscription acceptée!');
      loadPendingRegistrations();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de valider');
    }
  };

  const handleRejectRegistration = (user) => {
    Alert.prompt(
      'Rejet d\'inscription',
      'Motif du rejet:',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Rejeter', 
          onPress: async (reason) => {
            try {
              await database.write(async () => {
                const queueItem = await database.get('sync_queue').find(user.id);
                await queueItem.update(q => {
                  q.status = 'rejected';
                });
              });
              Alert.alert('Succès', 'Inscription rejetée');
              loadPendingRegistrations();
            } catch (e) {
              Alert.alert('Erreur', 'Impossible de rejeter');
            }
          }
        },
      ],
      'plain-text'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Gestion Users</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable 
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            En attente ({pendingRegistrations.length})
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'accepted' && styles.tabActive]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.tabTextActive]}>
            Acceptés
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'rejected' && styles.tabActive]}
          onPress={() => setActiveTab('rejected')}
        >
          <Text style={[styles.tabText, activeTab === 'rejected' && styles.tabTextActive]}>
            Rejetés
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'pending' && (
          pendingRegistrations.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-check" size={60} color="#666" />
              <Text style={styles.emptyText}>Aucune inscription en attente</Text>
            </View>
          ) : (
            pendingRegistrations.map((user, index) => (
              <View key={index} style={styles.userCard}>
                <View style={styles.userIcon}>
                  <MaterialCommunityIcons name="account" size={24} color="#2BEE79" />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userPhone}>{user.data?.phone || 'Numéro inconnu'}</Text>
                  <Text style={styles.userDate}>
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                  <Text style={styles.userStatus}>Statut: En attente</Text>
                </View>
                <View style={styles.userActions}>
                  <Pressable 
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRegistration(user)}
                  >
                    <Ionicons name="checkmark" size={20} color="#000" />
                  </Pressable>
                  <Pressable 
                    style={styles.rejectButton}
                    onPress={() => handleRejectRegistration(user)}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </Pressable>
                </View>
              </View>
            ))
          )
        )}

        {activeTab === 'accepted' && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-check" size={60} color="#2BEE79" />
            <Text style={styles.emptyText}>Aucun utilisateur accepté</Text>
          </View>
        )}

        {activeTab === 'rejected' && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-remove" size={60} color="#FF4444" />
            <Text style={styles.emptyText}>Aucun utilisateur rejeté</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8, backgroundColor: '#16213e' },
  backButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', margin: 16, backgroundColor: '#16213e', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#2BEE79' },
  tabText: { color: '#666', fontSize: 12 },
  tabTextActive: { color: '#000', fontWeight: 'bold' },
  content: { flex: 1, padding: 16, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#aaa', fontSize: 16, marginTop: 16 },
  userCard: { flexDirection: 'row', backgroundColor: '#16213e', borderRadius: 12, padding: 16, marginBottom: 12 },
  userIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' },
  userInfo: { flex: 1, marginLeft: 12 },
  userPhone: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  userDate: { color: '#aaa', fontSize: 12, marginTop: 4 },
  userStatus: { color: '#FFD166', fontSize: 12, marginTop: 4 },
  userActions: { flexDirection: 'column', gap: 8 },
  acceptButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2BEE79', justifyContent: 'center', alignItems: 'center' },
  rejectButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF4444', justifyContent: 'center', alignItems: 'center' },
});

export default KioskUsersScreen;