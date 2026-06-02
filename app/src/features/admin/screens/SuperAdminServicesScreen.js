// app/src/features/admin/screens/SuperAdminServicesScreen.js
// Status des 27 services de l'app
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SuperAdminService } from '../services/SuperAdminService';

const CATEGORIES = [
  { key: 'all', label: 'Tous', icon: 'apps' },
  { key: 'commerce', label: 'Commerce', icon: 'store', services: ['marketplace', 'restaurant', 'hotel', 'real_estate', 'services', 'pharmacy', 'swap'] },
  { key: 'social', label: 'Social', icon: 'account-group', services: ['loba', 'dating', 'chat'] },
  { key: 'transport', label: 'Transport', icon: 'car', services: ['taxi', 'transport', 'flights', 'delivery'] },
  { key: 'media', label: 'Média', icon: 'play-box', services: ['streaming', 'music', 'formation', 'betting', 'notebook'] },
  { key: 'system', label: 'Système', icon: 'cog', services: ['wallet', 'ai', 'reservation', 'service_perso', 'service_pro', 'service_digital', 'service_maison', 'kiosk', 'admin'] },
];

export default function SuperAdminServicesScreen({ onBack, onNavigate }) {
  const [category, setCategory] = useState('all');
  const result = SuperAdminService.getServicesStatus();
  const [services, setServices] = useState(result.services);

  const filteredServices = category === 'all'
    ? services
    : services.filter(s => {
        const cat = CATEGORIES.find(c => c.key === category);
        return cat && cat.services && cat.services.includes(s.key);
      });

  const toggleService = (serviceKey, newStatus) => {
    Alert.alert(
      newStatus ? 'Activer le service' : 'Désactiver le service',
      `${services.find(s => s.key === serviceKey)?.name} - ${newStatus ? 'visible par les utilisateurs' : 'masqué aux utilisateurs'}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            setServices(prev => prev.map(s =>
              s.key === serviceKey ? { ...s, status: newStatus ? 'active' : 'inactive' } : s
            ));
            SuperAdminService.toggleServiceStatus(serviceKey, newStatus);
          },
        },
      ]
    );
  };

  const renderService = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={[styles.serviceIcon, { backgroundColor: item.status === 'active' ? 'rgba(43, 238, 121, 0.15)' : 'rgba(124, 138, 154, 0.15)' }]}>
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={item.status === 'active' ? '#2BEE79' : '#7C8A9A'}
        />
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <View style={styles.serviceMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account" size={12} color="#7C8A9A" />
            <Text style={styles.metaText}>{item.users.toLocaleString()}</Text>
          </View>
          {item.items > 0 && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="package-variant" size={12} color="#7C8A9A" />
              <Text style={styles.metaText}>{item.items.toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? '#2BEE79' : '#7C8A9A' }]} />
        </View>
      </View>
      <Switch
        value={item.status === 'active'}
        onValueChange={(value) => toggleService(item.key, value)}
        trackColor={{ false: '#1F2937', true: 'rgba(43, 238, 121, 0.4)' }}
        thumbColor={item.status === 'active' ? '#2BEE79' : '#7C8A9A'}
      />
    </View>
  );

  const totalUsers = services.reduce((sum, s) => sum + s.users, 0);
  const activeCount = services.filter(s => s.status === 'active').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Services</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{services.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#2BEE79' }]}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>Actifs</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalUsers.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Utilisateurs</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            style={[styles.tab, category === cat.key && styles.tabActive]}
            onPress={() => setCategory(cat.key)}
          >
            <MaterialCommunityIcons
              name={cat.icon}
              size={16}
              color={category === cat.key ? '#0E151B' : '#7C8A9A'}
            />
            <Text style={[styles.tabText, category === cat.key && styles.tabTextActive]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.key}
        renderItem={renderService}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="apps" size={64} color="#4A5568" />
            <Text style={styles.emptyText}>Aucun service</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 40 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  summaryValue: { color: '#F8FAFC', fontSize: 20, fontWeight: '800' },
  summaryLabel: { color: '#7C8A9A', fontSize: 11, marginTop: 2 },
  tabs: { maxHeight: 50, marginBottom: 8 },
  tabsContent: { paddingHorizontal: 16, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  tabActive: { backgroundColor: '#2BEE79', borderColor: '#2BEE79' },
  tabText: { color: '#7C8A9A', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#0E151B' },
  listContent: { padding: 16, paddingBottom: 80 },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceInfo: { flex: 1 },
  serviceName: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { color: '#7C8A9A', fontSize: 11 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 'auto' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600', marginTop: 16 },
});
