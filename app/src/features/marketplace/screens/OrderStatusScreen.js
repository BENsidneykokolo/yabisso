import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrders } from '../context/OrderContext';

export default function OrderStatusScreen({ onBack, onNavigate, route }) {
  const { orders } = useOrders();
  const orderId = route?.params?.orderId;
  const order = orders.find(o => o.id === orderId) || {
    id: '####',
    products: [],
    status: 'pending',
    timeline: [],
    delivery: { arrivingBy: 'Calcul en cours...', addressType: 'Chargement...', address: '...' }
  };

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('fr-FR') + ' XAF';
  };

  // Timeline Mock data if not present
  const timeline = order.timeline?.length > 0 ? order.timeline : [
    { step: 'placed', title: 'Commande passée', date: order.date || 'Aujourd\'hui', completed: true },
    { step: 'payment', title: 'Paiement confirmé', date: 'Confirmation en cours', completed: true },
    { step: 'transit', title: 'En cours', date: 'Préparation du colis', completed: true, active: true },
    { step: 'delivered', title: 'Livré', date: 'Bientôt disponible', completed: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Commande #{order.id}</Text>
        <Pressable style={styles.helpBtn}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color="#92adc9" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Offline Context */}
        <View style={styles.offlineContext}>
          <MaterialCommunityIcons name="wifi-off" size={16} color="#92adc9" />
          <Text style={styles.offlineText}>Dernière mise à jour: à l'instant</Text>
        </View>

        {/* Products Section */}
        {order.products.map((product, index) => (
          <View key={index} style={styles.productCard}>
            <Image source={{ uri: product.image || 'https://via.placeholder.com/90' }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <View style={styles.sellerCompact}>
                <Image 
                  source={{ uri: product.sellerAvatar || 'https://via.placeholder.com/16' }} 
                  style={styles.sellerMiniAvatar} 
                />
                <Text style={styles.productBrand}>{product.brand || 'Ma Boutique'}</Text>
                {product.sellerRating && (
                  <View style={styles.sellerRating}>
                    <MaterialCommunityIcons name="star" size={10} color="#eab308" />
                    <Text style={styles.sellerRatingText}>{product.sellerRating}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              {product.description && (
                <Text style={styles.productDescription} numberOfLines={1}>
                  {product.description}
                </Text>
              )}
              <Text style={styles.productVariant}>
                Qté: {product.quantity} • {product.selectedColor || 'N/A'}{product.selectedModel ? ` • ${product.selectedModel}` : ''}
              </Text>
              <Text style={styles.productPrice}>
                {formatPrice(product.negotiatedPrice || product.price)}
              </Text>
            </View>
          </View>
        ))}

        {/* Map Preview */}
        <View style={styles.mapPreview}>
          <View style={styles.mapPlaceholder}>
            <MaterialCommunityIcons name="map" size={40} color="#324d67" />
          </View>
          <View style={styles.mapOverlay}>
            <View style={styles.mapMarker}>
              <MaterialCommunityIcons name="local-shipping" size={20} color="#fff" />
            </View>
            <View style={styles.mapInfo}>
              <Text style={styles.mapLabel}>Position actuelle</Text>
              <Text style={styles.mapLocation}>Douala, Akwa</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Chronologie</Text>

          {timeline.map((item, index) => (
            <View key={item.step} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.timelineDot,
                  item.completed && styles.timelineDotCompleted,
                  item.active && styles.timelineDotActive,
                ]}>
                  {item.completed ? (
                    <MaterialCommunityIcons
                      name={item.step === 'payment' ? 'credit-card' : item.step === 'transit' ? 'local-shipping' : 'check'}
                      size={16}
                      color={item.active ? '#fff' : '#22c55e'}
                    />
                  ) : (
                    <MaterialCommunityIcons name="package" size={16} color="#64748b" />
                  )}
                </View>
                {index < timeline.length - 1 && (
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
                  styles.timelineStepDate,
                  item.active && styles.timelineStepDateActive,
                ]}>
                  {item.date}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Details */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>Mode</Text>
            <Text style={styles.deliveryValue}>{order.deliveryMethod || 'Express'}</Text>
          </View>
          <View style={styles.deliveryDivider} />
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>Livrer à</Text>
            <View style={styles.deliveryAddress}>
              <Text style={styles.deliveryAddressType}>Mon Adresse</Text>
              <Text style={styles.deliveryAddressText}>{order.seller || 'Yabisso Hub'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <Pressable style={styles.contactBtn}>
            <MaterialCommunityIcons name="chat" size={20} color="#fff" />
            <Text style={styles.contactBtnText}>Contacter le vendeur</Text>
          </Pressable>
          <Pressable
            style={styles.trackBtn}
            onPress={() => onNavigate?.('delivery_tracking')}
          >
            <MaterialCommunityIcons name="map-marker-path" size={20} color="#0E151B" />
            <Text style={styles.trackBtnText}>Suivre la livraison</Text>
          </Pressable>
        </View>
      </View>
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
    paddingBottom: 12,
    backgroundColor: '#101922',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  offlineContext: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    opacity: 0.6,
    paddingVertical: 12,
  },
  offlineText: {
    fontSize: 12,
    color: '#92adc9',
    fontWeight: '500',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#324d67',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  sellerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sellerMiniAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#324d67',
  },
  productBrand: {
    fontSize: 11,
    color: '#2BEE79',
    fontWeight: '600',
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sellerRatingText: {
    fontSize: 9,
    color: '#eab308',
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 18,
  },
  productDescription: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontStyle: 'italic',
  },
  productVariant: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#137fec',
    marginTop: 4,
  },
  mapPreview: {
    height: 160,
    backgroundColor: '#1a2632',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mapMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#137fec',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  mapInfo: {
    flex: 1,
  },
  mapLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mapLocation: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  timelineCard: {
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  timelineTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
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
    paddingBottom: 24,
  },
  timelineStepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  timelineStepTitleActive: {
    color: '#137fec',
    fontSize: 15,
  },
  timelineStepTitlePending: {
    color: '#64748b',
  },
  timelineStepDate: {
    fontSize: 12,
    color: '#92adc9',
    marginTop: 4,
  },
  timelineStepDateActive: {
    color: '#137fec',
  },
  deliveryCard: {
    backgroundColor: '#192633',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#92adc9',
    fontWeight: '500',
  },
  deliveryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  deliveryDivider: {
    height: 1,
    backgroundColor: '#324d67',
    marginVertical: 4,
  },
  deliveryAddress: {
    alignItems: 'flex-end',
  },
  deliveryAddressType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  deliveryAddressText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'right',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 150,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#101922',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingBottom: 60,
  },
  bottomBarContent: {
    flexDirection: 'row',
    gap: 12,
  },
  contactBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#324d67',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  trackBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0E151B',
  },
});
