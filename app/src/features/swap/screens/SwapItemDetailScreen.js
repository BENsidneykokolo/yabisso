import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SwapItemDetailScreen({ onBack, onNavigate, item }) {
  const mockItem = item || {
    id: '1',
    title: 'iPhone 13 Pro',
    description: 'Telephone en excellent etat, batterie a 92%, vendu avec originaux. Achete il y a 8 mois, tres peu utilise. Les accessories incluent le cable lightning et le chargeur.',
    category: 'electronique',
    condition: 'Très bon',
    image: null,
    owner: { name: 'Jean M.', avatar: null, rating: 4.8, exchanges: 12 },
    location: 'Douala, Cameroon',
    postedDate: '2024-01-15',
  };

  const conditionColors = {
    'Neuf': '#2BEE79',
    'Très bon': '#1F8EFA',
    'Bon': '#F97316',
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>Detail</Text>
          <Pressable style={styles.shareButton}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#E6EDF3" />
          </Pressable>
        </View>

        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons name="image" size={60} color="#4A5568" />
          <Text style={styles.imagePlaceholderText}>Photo de l'article</Text>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.titleRow}>
            <Text style={styles.itemTitle}>{mockItem.title}</Text>
            <View style={[styles.conditionBadge, { backgroundColor: `${conditionColors[mockItem.condition]}20` }]}>
              <Text style={[styles.conditionText, { color: conditionColors[mockItem.condition] }]}>
                {mockItem.condition}
              </Text>
            </View>
          </View>

          <View style={styles.categoryRow}>
            <MaterialCommunityIcons name="tag" size={14} color="#7C8A9A" />
            <Text style={styles.categoryText}>
              {mockItem.category.charAt(0).toUpperCase() + mockItem.category.slice(1)}
            </Text>
          </View>

          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#7C8A9A" />
            <Text style={styles.locationText}>{mockItem.location}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{mockItem.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Proprietaire</Text>
          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <MaterialCommunityIcons name="account" size={24} color="#7C8A9A" />
            </View>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{mockItem.owner.name}</Text>
              <View style={styles.ownerStats}>
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{mockItem.owner.rating}</Text>
                </View>
                <Text style={styles.exchangesText}>
                  {mockItem.owner.exchanges} echanges
                </Text>
              </View>
            </View>
            <Pressable style={styles.messageButton}>
              <MaterialCommunityIcons name="message-text" size={18} color="#0E151B" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Text style={styles.postedDate}>
            Publi{e} le {mockItem.postedDate || '15/01/2024'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.swapButton} onPress={() => onNavigate && onNavigate('SwapOffer', { item: mockItem })}>
          <MaterialCommunityIcons name="swap-horizontal" size={20} color="#0E151B" />
          <Text style={styles.swapButtonText}>Proposer un echange</Text>
        </Pressable>
      </View>
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
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 20,
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 40, 50, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  imagePlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  imagePlaceholderText: {
    color: '#7C8A9A',
    marginTop: 10,
    fontSize: 14,
  },
  contentSection: {
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    color: '#7C8A9A',
    fontSize: 13,
    marginLeft: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    color: '#7C8A9A',
    fontSize: 13,
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    color: '#B6C2CF',
    fontSize: 14,
    lineHeight: 22,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ownerName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  ownerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  exchangesText: {
    color: '#7C8A9A',
    fontSize: 12,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postedDate: {
    color: '#7C8A9A',
    fontSize: 12,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
  },
  swapButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});