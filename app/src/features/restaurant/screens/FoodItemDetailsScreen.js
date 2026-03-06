import React, { useState } from 'react';
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

export default function FoodItemDetailsScreen({ route, onBack, onNavigate }) {
  const item = route?.params?.item || {
    name: 'Jollof Rice with Chicken',
    description: 'Spicy jollof rice served with grilled chicken and plantain',
    price: 2500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCMuFdHBFHKEQCZ_ATpmykF0FFHAsz5YpP7dGRRAUO067AlV39Kd5qULKKcqYxYSMvPE9cXjc_W60-NMQ1DKNgqPsDdaZnT4S4PTF9eUDt3n6gISdNHIQNJxnCPweghBGkJ3Sj-RvXM8d-rC-DTufcQYG-QIS6LBv0ywXyeZ-bUpLkuGLCxhlaLpEY3W0t6e80s8kEHUo4pevA_b9VKfR72Th2fy6fDkR66-DgkCK5jm18uvXerSNjKJXNsccyDEal4RpEsIKx',
  };

  const [quantity, setQuantity] = useState(1);
  const [addOns, setAddOns] = useState([]);

  const addOnItems = [
    { id: 1, name: 'Extra Chicken', price: 500 },
    { id: 2, name: 'Plantain', price: 300 },
    { id: 3, name: 'Soft Drink', price: 200 },
  ];

  const toggleAddOn = (addon) => {
    if (addOns.find(a => a.id === addon.id)) {
      setAddOns(addOns.filter(a => a.id !== addon.id));
    } else {
      setAddOns([...addOns, addon]);
    }
  };

  const totalPrice = (item.price + addOns.reduce((sum, a) => sum + a.price, 0)) * quantity;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: item.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          
          <View style={styles.heroHeader}>
            <Pressable style={styles.backBtn} onPress={onBack}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable style={styles.actionBtn}>
                <MaterialCommunityIcons name="heart-outline" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Item Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          </View>
          
          <Text style={styles.itemDescription}>{item.description}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FBBF24" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionLabel}>Quantity</Text>
            <View style={styles.quantityRow}>
              <Pressable 
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <MaterialCommunityIcons name="minus" size={20} color="#fff" />
              </Pressable>
              <Text style={styles.quantityText}>{quantity}</Text>
              <Pressable 
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Add-ons */}
          <View style={styles.addonsSection}>
            <Text style={styles.sectionLabel}>Add-ons</Text>
            {addOnItems.map((addon) => (
              <Pressable 
                key={addon.id} 
                style={styles.addonItem}
                onPress={() => toggleAddOn(addon)}
              >
                <View style={styles.addonLeft}>
                  <View style={[
                    styles.checkbox,
                    addOns.find(a => a.id === addon.id) && styles.checkboxActive
                  ]}>
                    {addOns.find(a => a.id === addon.id) && (
                      <MaterialCommunityIcons name="check" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.addonName}>{addon.name}</Text>
                </View>
                <Text style={styles.addonPrice}>+₦{addon.price}</Text>
              </Pressable>
            ))}
          </View>

          {/* Special Instructions */}
          <View style={styles.instructionsSection}>
            <Text style={styles.sectionLabel}>Special Instructions</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPlaceholder}>
                Add a note (e.g., extra spicy, no onions)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalPrice}>₦{totalPrice.toLocaleString()}</Text>
          </View>
          <Pressable 
            style={styles.addToCartBtn}
            onPress={() => onNavigate?.('food_checkout')}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
            <MaterialCommunityIcons name="cart-plus" size={20} color="#fff" />
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
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroHeader: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  popularBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#137fec',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#FBBF24',
    fontWeight: 'bold',
  },
  quantitySection: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2630',
    borderRadius: 12,
    alignSelf: 'flex-start',
    padding: 4,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 24,
  },
  addonsSection: {
    marginTop: 24,
  },
  addonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c2630',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  addonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#137fec',
    borderColor: '#137fec',
  },
  addonName: {
    fontSize: 15,
    color: '#fff',
  },
  addonPrice: {
    fontSize: 15,
    color: '#64748b',
  },
  instructionsSection: {
    marginTop: 24,
  },
  inputContainer: {
    backgroundColor: '#1c2630',
    borderRadius: 12,
    padding: 16,
  },
  inputPlaceholder: {
    color: '#64748b',
    fontSize: 14,
  },
  bottomSpacer: {
    height: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1c2630',
    borderTopWidth: 1,
    borderTopColor: '#324d67',
    padding: 16,
    paddingBottom: 32,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
