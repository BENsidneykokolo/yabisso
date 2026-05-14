import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const notifications = [
  { id: 1, title: 'Nouveaux biens disponibles', subtitle: '3 appartements ajoutés à Cocody', time: '2 min', icon: 'home-plus' },
  { id: 2, title: 'Baisse de prix', subtitle: 'Appartement Riviera Golf -500k FCFA', time: '15 min', icon: 'tag-check' },
  { id: 3, title: 'Visite confirmée', subtitle: 'Votre visite est confirmée demain 10h', time: '1h', icon: 'calendar-check' },
  { id: 4, title: 'Alerte favori', subtitle: 'Un bien de vos favoris est disponible', time: '2h', icon: 'bell-ring' },
  { id: 5, title: 'Nouvelle photo', subtitle: '12 nouvelles photos ajoutées', time: '3h', icon: 'image-plus' },
];

export default function ApartmentNotificationsScreen({ onBack, onNavigate }) {
  const [items, setItems] = useState(notifications);

  const toggleRead = (id) => {
    setItems(items.map(i => i.id === id ? { ...i, read: !i.read } : i));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable style={styles.allReadBtn} onPress={() => setItems(items.map(i => ({ ...i, read: true })))}>
          <Text style={styles.allReadText}>Tout lire</Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="bell-off-outline" size={80} color="#2a3a4a" />
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptySubtitle}>Les notifications concernant vos biens s'afficheront ici</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={[styles.card, !item.read && styles.cardUnread]} onPress={() => toggleRead(item.id)}>
              <View style={[styles.iconBox, !item.read && styles.iconBoxUnread]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.read ? '#64748b' : '#137fec'} />
              </View>
              <View style={styles.content}>
                <Text style={[styles.title, !item.read && styles.titleUnread]}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  allReadBtn: { backgroundColor: '#137fec', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  allReadText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: '#137fec' },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center' },
  iconBoxUnread: { backgroundColor: 'rgba(19, 127, 236, 0.15)' },
  content: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  titleUnread: { color: '#137fec' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  time: { fontSize: 11, color: '#64748b', marginTop: 4 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#137fec' },
});