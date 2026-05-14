import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const cartItems = [
  { id: '1', name: 'Paracétamol 500mg', price: 1200, qty: 2, icon: 'pill', color: '#EF4444' },
  { id: '2', name: 'Vitamine C 1000mg', price: 2500, qty: 1, icon: 'fruit-citrus', color: '#F97316' },
  { id: '4', name: 'Zinc + Magnésium', price: 3200, qty: 1, icon: 'pill', color: '#F97316' },
];

export default function PharmacyCartScreen({ onBack, onNavigate }) {
  const [items, setItems] = useState(cartItems);

  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const updateQty = (id, delta) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return newQty === 0 ? null : { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (id) => {
    Alert.alert('Supprimer', 'Retirer ce produit du panier ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setItems(items.filter(i => i.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Panier ({items.length})</Text>
          <Pressable onPress={() => onNavigate?.('pharmacy_home')}>
            <MaterialCommunityIcons name="plus" size={24} color="#137fec" />
          </Pressable>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="cart-outline" size={80} color="#2a3a4a" />
            <Text style={styles.emptyTitle}>Panier vide</Text>
            <Text style={styles.emptySubtitle}>Ajoutez des médicaments à votre panier</Text>
            <Pressable style={styles.exploreBtn} onPress={() => onNavigate?.('pharmacy_home')}>
              <Text style={styles.exploreBtnText}>Explorer</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.itemsContainer}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={[styles.itemIcon, { backgroundColor: item.color + '22' }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{(item.price * item.qty).toLocaleString()} FCFA</Text>
                </View>
                <View style={styles.itemControls}>
                  <Pressable style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
                    <MaterialCommunityIcons name="minus" size={16} color="#fff" />
                  </Pressable>
                  <Text style={styles.qtyValue}>{item.qty}</Text>
                  <Pressable style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
                    <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                  </Pressable>
                </View>
                <Pressable onPress={() => removeItem(item.id)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {items.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Récapitulatif</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Sous-total ({items.length} articles)</Text><Text style={styles.summaryValue}>{total.toLocaleString()} FCFA</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Livraison</Text><Text style={styles.summaryValue}>2 000 FCFA</Text></View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total</Text><Text style={styles.summaryTotalValue}>{(total + 2000).toLocaleString()} FCFA</Text></View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.bottomCTA}>
          <Pressable style={styles.ctaBtn} onPress={() => onNavigate?.('pharmacy_checkout', { items, total })}>
            <MaterialCommunityIcons name="cart-check" size={20} color="#fff" />
            <Text style={styles.ctaBtnText}>Passer la commande</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#64748b', marginTop: 8 },
  exploreBtn: { marginTop: 24, backgroundColor: '#EF4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  exploreBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  itemsContainer: { paddingHorizontal: 16, marginTop: 16 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2630', borderRadius: 12, padding: 12, marginBottom: 10 },
  itemIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  itemPrice: { fontSize: 14, color: '#EF4444', marginTop: 2 },
  itemControls: { flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 10 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#137fec', alignItems: 'center', justifyContent: 'center' },
  qtyValue: { fontSize: 16, fontWeight: 'bold', color: '#fff', minWidth: 20, textAlign: 'center' },
  summarySection: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  summaryCard: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontSize: 14, color: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 8 },
  summaryTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  summaryTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#2BEE79' },
  bottomSpacer: { height: 100 },
  bottomCTA: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12, backgroundColor: '#101922' },
  ctaBtn: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});