import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ReceiveNotificationsScreen({ onBack, onComplete }) {
  const [requests, setRequests] = useState([
    { id: '1', from: 'Jean Dupont', amount: '5000', status: 'pending', time: 'Il y a 2 min' },
    { id: '2', from: 'Marie Kwame', amount: '2000', status: 'pending', time: 'Il y a 15 min' },
    { id: '3', from: 'Paul Okonkwo', amount: '10000', status: 'accepted', time: 'Il y a 1h' },
  ]);

  const handleAccept = (id) => {
    setRequests(requests.map(r => 
      r.id === id ? { ...r, status: 'accepted' } : r
    ));
    Alert.alert('Succès', 'Paiement accepté! Le montant a été ajouté à votre portefeuille.');
  };

  const handleDecline = (id) => {
    setRequests(requests.map(r => 
      r.id === id ? { ...r, status: 'declined' } : r
    ));
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const historyRequests = requests.filter(r => r.status !== 'pending');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Paiements recus</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {pendingRequests.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>En attente</Text>
              {pendingRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {request.from.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.requestDetails}>
                      <Text style={styles.requestName}>{request.from}</Text>
                      <Text style={styles.requestTime}>{request.time}</Text>
                    </View>
                  </View>
                  <View style={styles.requestActions}>
                    <Text style={styles.requestAmount}>{request.amount}FCFA</Text>
                    <View style={styles.actionButtons}>
                      <Pressable style={styles.acceptButton} onPress={() => handleAccept(request.id)}>
                        <Ionicons name="checkmark" size={18} color="#0E151B" />
                      </Pressable>
                      <Pressable style={styles.declineButton} onPress={() => handleDecline(request.id)}>
                        <Ionicons name="close" size={18} color="#F8FAFC" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          {historyRequests.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Historique</Text>
              {historyRequests.map((request) => (
                <View key={request.id} style={styles.historyCard}>
                  <View style={styles.requestInfo}>
                    <View style={[styles.avatar, styles.avatarHistory]}>
                      <Text style={[styles.avatarText, styles.avatarTextHistory]}>
                        {request.from.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.requestDetails}>
                      <Text style={styles.requestName}>{request.from}</Text>
                      <Text style={styles.requestTime}>{request.time}</Text>
                    </View>
                  </View>
                  <View style={styles.historyStatus}>
                    <Text style={[styles.requestAmount, styles.historyAmount]}>
                      {request.amount}FCFA
                    </Text>
                    <View style={[styles.statusBadge, request.status === 'accepted' ? styles.statusAccepted : styles.statusDeclined]}>
                      <Text style={styles.statusText}>
                        {request.status === 'accepted' ? 'Accepté' : 'Refusé'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          {requests.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="bell-off-outline" size={60} color="#4B5563" />
              <Text style={styles.emptyText}>Aucune notification de paiement</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
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
  headerSpacer: {
    width: 40,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarHistory: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarText: {
    color: '#2BEE79',
    fontSize: 14,
    fontWeight: '700',
  },
  avatarTextHistory: {
    color: '#94A3B8',
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  requestTime: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestAmount: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  historyStatus: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusAccepted: {
    backgroundColor: 'rgba(43, 238, 121, 0.2)',
  },
  statusDeclined: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2BEE79',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 16,
  },
});
