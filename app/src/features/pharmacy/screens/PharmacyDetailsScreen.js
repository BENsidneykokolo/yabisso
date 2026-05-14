import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const photos = [
  'https://images.unsplash.com/photo-1584308666744-24d5c47f9a68?w=800',
  'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800',
];

export default function PharmacyDetailsScreen({ onBack, onNavigate, route }) {
  const product = route?.params?.product || { id: '1', name: 'Paracétamol 500mg', price: '1,200 XAF', icon: 'pill', color: '#EF4444', stock: true };
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Pressable style={styles.favBtn} onPress={() => setFavorite(!favorite)}>
            <MaterialCommunityIcons name={favorite ? 'heart' : 'heart-outline'} size={24} color={favorite ? '#ef4444' : '#fff'} />
          </Pressable>
        </View>

        <View style={styles.productIconContainer}>
          <MaterialCommunityIcons name={product.icon} size={80} color={product.color} />
        </View>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price}</Text>
            <View style={[styles.stockBadge, !product.stock && styles.stockBadgeOut]}>
              <Text style={[styles.stockText, !product.stock && styles.stockTextOut]}>
                {product.stock ? 'En stock' : 'Rupture'}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.category}>Catégorie: Médicaments</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>Antalgique et antipyrétique. Indiqué pour le traitement des douleurs légères à modérées et de la fièvre. Prendre 1 à 2 comprimés, 1 à 3 fois par jour.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posologie</Text>
            <View style={styles.dosageCard}>
              <MaterialCommunityIcons name="information" size={20} color="#137fec" />
              <Text style={styles.dosageText}>Adultes: 500mg à 1g par prise, max 3g/jour. Enfants: selon poids corporelle. Consulter un médecin.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantité</Text>
            <View style={styles.quantityRow}>
              <Pressable style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <MaterialCommunityIcons name="minus" size={20} color="#fff" />
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.bottomCTA}>
        <Pressable style={styles.cartBtn} onPress={() => onNavigate?.('pharmacy_cart', { product, quantity })}>
          <MaterialCommunityIcons name="cart" size={20} color="#EF4444" />
          <Text style={styles.cartBtnText}>Ajouter au panier</Text>
        </Pressable>
        <Pressable style={styles.buyBtn} onPress={() => onNavigate?.('pharmacy_checkout', { product, quantity })}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color="#fff" />
          <Text style={styles.buyBtnText}>Acheter</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  header: { position: 'absolute', top: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, zIndex: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  favBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  productIconContainer: { height: 200, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1c2630' },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 28, fontWeight: 'bold', color: '#EF4444' },
  stockBadge: { backgroundColor: 'rgba(43,238,121,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  stockBadgeOut: { backgroundColor: 'rgba(239,68,68,0.15)' },
  stockText: { color: '#2BEE79', fontSize: 13, fontWeight: '600' },
  stockTextOut: { color: '#EF4444' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  category: { fontSize: 14, color: '#64748b', marginTop: 4 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  description: { fontSize: 14, color: '#94a3b8', lineHeight: 22 },
  dosageCard: { flexDirection: 'row', backgroundColor: '#1c2630', borderRadius: 12, padding: 14, gap: 10 },
  dosageText: { flex: 1, fontSize: 14, color: '#94a3b8', lineHeight: 20 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#1c2630', borderRadius: 12, padding: 8, alignSelf: 'flex-start' },
  qtyBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#137fec', alignItems: 'center', justifyContent: 'center' },
  qtyValue: { fontSize: 24, fontWeight: 'bold', color: '#fff', minWidth: 40, textAlign: 'center' },
  bottomSpacer: { height: 100 },
  bottomCTA: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12, backgroundColor: '#101922' },
  cartBtn: { flex: 1, backgroundColor: '#1c2630', borderRadius: 12, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#EF4444' },
  cartBtnText: { color: '#EF4444', fontSize: 15, fontWeight: 'bold' },
  buyBtn: { flex: 1, backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  buyBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});