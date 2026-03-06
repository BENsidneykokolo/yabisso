import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const historyItems = [
  {
    id: 1,
    name: 'iPhone 13 Pro',
    price: 450000,
    date: '15 Jan 2024',
    status: 'Acheté',
    statusColor: '#22c55e',
    image: null,
  },
  {
    id: 2,
    name: 'Nike Air Max',
    price: 65000,
    date: '10 Jan 2024',
    status: 'Acheté',
    statusColor: '#22c55e',
    image: null,
  },
  {
    id: 3,
    name: 'Samsung Galaxy Watch',
    price: 85000,
    date: '05 Jan 2024',
    status: 'Annulé',
    statusColor: '#ef4444',
    image: null,
  },
  {
    id: 4,
    name: 'MacBook Air',
    price: 680000,
    date: '01 Jan 2024',
    status: 'Acheté',
    statusColor: '#22c55e',
    image: null,
  },
];

export default function MarketplaceHistoryScreen({ onBack }) {
  const formatPrice = (price) => {
    return price.toLocaleString('fr-FR') + ' XAF';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Historique</Text>
        <Pressable style={styles.filterBtn}>
          <MaterialCommunityIcons name="filter-variant" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {historyItems.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.productImage}>
              <MaterialCommunityIcons name="image" size={28} color="#324d67" />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productDate}>{item.date}</Text>
              <View style={styles.productBottom}>
                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
                </View>
              </View>
            </View>
          </View>
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
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1c2630',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#1c2630',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#233648',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  productDate: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#137fec',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
