import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const photoSlots = ['Couverture', 'Detail 1', 'Detail 2'];
const tags = ['Bio', 'Frais', 'Local', 'Promo'];
const deliveryOptions = [
  { key: 'pickup', label: 'Retrait', icon: 'storefront-outline' },
  { key: 'delivery', label: 'Livraison', icon: 'truck-outline' },
  { key: 'instant', label: 'Express', icon: 'flash-outline' },
];

export default function AddProductScreen({ onBack, onOpenSellerProfile }) {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Nouveau produit</Text>
          <Pressable style={styles.headerChip} onPress={onOpenSellerProfile}>
            <Text style={styles.headerChipText}>Profil</Text>
          </Pressable>
        </View>

        <View style={styles.shopCard}>
          <View style={styles.shopIcon}>
            <MaterialCommunityIcons name="storefront" size={18} color="#0E151B" />
          </View>
          <View style={styles.shopInfo}>
            <Text style={styles.shopTitle}>Marche Yabisso</Text>
            <Text style={styles.shopMeta}>Boutique active · Centre-ville</Text>
          </View>
          <View style={styles.statusChip}>
            <Text style={styles.statusText}>OUVERT</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Photos du produit</Text>
          <Text style={styles.sectionLink}>3/5</Text>
        </View>
        <View style={styles.photoRow}>
          {photoSlots.map((slot) => (
            <View key={slot} style={styles.photoCard}>
              <View style={styles.photoIcon}>
                <Ionicons name="image" size={18} color="#2BEE79" />
              </View>
              <Text style={styles.photoLabel}>{slot}</Text>
              <Pressable style={styles.photoButton}>
                <Text style={styles.photoButtonText}>Ajouter</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Infos produit</Text>
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Nom du produit</Text>
          <TextInput
            placeholder="Ex: Mangues bio"
            placeholderTextColor="#6B7A8B"
            style={styles.textInput}
          />
          <View style={styles.inputDivider} />
          <Text style={styles.inputLabel}>Categorie</Text>
          <Pressable style={styles.selectInput}>
            <Text style={styles.selectValue}>Fruits & Legumes</Text>
            <Ionicons name="chevron-down" size={16} color="#94A3B8" />
          </Pressable>
          <View style={styles.inputDivider} />
          <View style={styles.inlineRow}>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>Prix</Text>
              <TextInput
                placeholder="1500"
                placeholderTextColor="#6B7A8B"
                style={styles.textInput}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>Stock</Text>
              <TextInput
                placeholder="50"
                placeholderTextColor="#6B7A8B"
                style={styles.textInput}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.inputDivider} />
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            placeholder="Decrivez votre produit..."
            placeholderTextColor="#6B7A8B"
            style={[styles.textInput, styles.textArea]}
            multiline
          />
        </View>

        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.tagsRow}>
          {tags.map((tag, index) => (
            <View key={tag} style={[styles.tagChip, index === 0 && styles.tagChipActive]}>
              <Text style={[styles.tagText, index === 0 && styles.tagTextActive]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Logistique</Text>
        <View style={styles.optionsRow}>
          {deliveryOptions.map((option, index) => (
            <View
              key={option.key}
              style={[styles.optionCard, index === 1 && styles.optionCardActive]}
            >
              <Ionicons
                name={option.icon}
                size={18}
                color={index === 1 ? '#0E151B' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.optionLabel,
                  index === 1 && styles.optionLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.sectionTitle}>Visibilite</Text>
            <Text style={styles.switchHint}>Produit visible immediatement</Text>
          </View>
          <View style={styles.switchTrack}>
            <View style={styles.switchThumb} />
          </View>
        </View>

        <View style={styles.footerButtons}>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Publier le produit</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Enregistrer brouillon</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
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
  headerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.35)',
  },
  headerChipText: {
    color: '#2BEE79',
    fontSize: 12,
    fontWeight: '700',
  },
  shopCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shopInfo: {
    flex: 1,
  },
  shopTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  shopMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.12)',
  },
  statusText: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionRow: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLink: {
    color: '#94A3B8',
    fontSize: 12,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: '31%',
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(20, 27, 35, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  photoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photoLabel: {
    color: '#CBD5F5',
    fontSize: 11,
    textAlign: 'center',
  },
  photoButton: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 238, 121, 0.16)',
  },
  photoButtonText: {
    color: '#2BEE79',
    fontSize: 10,
    fontWeight: '700',
  },
  inputCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    color: '#F8FAFC',
    fontSize: 14,
    paddingVertical: 6,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  selectValue: {
    color: '#F8FAFC',
    fontSize: 14,
  },
  inputDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inlineField: {
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 10,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 40, 50, 0.8)',
  },
  tagChipActive: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  tagText: {
    color: '#CBD5F5',
    fontSize: 12,
  },
  tagTextActive: {
    color: '#0E151B',
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 10,
  },
  optionCardActive: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  optionLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 6,
  },
  optionLabelActive: {
    color: '#0E151B',
    fontWeight: '700',
  },
  switchRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchHint: {
    color: '#7C8A9A',
    fontSize: 11,
    marginTop: 4,
  },
  switchTrack: {
    width: 52,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#2BEE79',
    padding: 4,
    alignItems: 'flex-end',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0E151B',
  },
  footerButtons: {
    marginTop: 28,
  },
  primaryButton: {
    backgroundColor: '#2BEE79',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryButtonText: {
    color: '#E6EDF3',
    fontSize: 14,
    fontWeight: '600',
  },
});
