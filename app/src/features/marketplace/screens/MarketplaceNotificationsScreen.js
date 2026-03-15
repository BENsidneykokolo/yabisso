import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const notifications = [
  {
    id: 1,
    type: 'order',
    title: 'Commande livrée',
    message: 'Votre commande #CMD-8821 a été livrée',
    time: 'Il y a 2h',
    icon: 'check-circle',
    iconColor: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    action: 'orders',
    filter: 'livre',
  },
  {
    id: 2,
    type: 'promo',
    title: 'Promotion',
    message: 'Profitez de -50% sur tous les articles',
    time: 'Il y a 5h',
    icon: 'gift',
    iconColor: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    action: 'product_list',
    filter: 'promo',
  },
  {
    id: 3,
    type: 'update',
    title: 'Mise à jour',
    message: 'Une nouvelle version est disponible',
    time: 'Hier',
    icon: 'information',
    iconColor: '#137fec',
    bgColor: 'rgba(19, 127, 236, 0.15)',
    action: null,
  },
  {
    id: 4,
    type: 'payment',
    title: 'Paiement',
    message: 'Vous avez reçu 5000 XAF de Jean',
    time: 'Hier',
    icon: 'wallet',
    iconColor: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    action: 'wallet',
  },
  {
    id: 5,
    type: 'delivery',
    title: 'En cours',
    message: 'Votre commande est en livraison',
    time: 'Aujourd hui',
    icon: 'truck-delivery',
    iconColor: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    action: 'orders',
    filter: 'en_cours',
  },
  {
    id: 6,
    type: 'new',
    title: 'Nouveauté',
    message: 'Découvrez les nouveaux articles',
    time: 'Aujourd hui',
    icon: 'sparkles',
    iconColor: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    action: 'new_arrivals',
  },
];

export default function MarketplaceNotificationsScreen({ onBack, onNavigate }) {
  const handleNotificationPress = (notification) => {
    if (!notification.action) {
      Alert.alert('Info', notification.message);
      return;
    }

    onNavigate?.(notification.action, { filter: notification.filter });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Tout lu</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {notifications.map((notification) => (
          <Pressable 
            key={notification.id} 
            style={styles.notificationCard}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={[styles.iconContainer, { backgroundColor: notification.bgColor }]}>
              <MaterialCommunityIcons 
                name={notification.icon} 
                size={24} 
                color={notification.iconColor} 
              />
            </View>
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
            </View>
          </Pressable>
        ))}
        
        <View style={styles.bottomSpacer} />
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
    backgroundColor: '#1c2630',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  markAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markAllText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#1c2630',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationTime: {
    fontSize: 12,
    color: '#64748b',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});
