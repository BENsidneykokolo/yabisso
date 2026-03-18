import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

export default function SearchAddressScreen({ onBack, onAddressFound }) {
  const [searchCode, setSearchCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundAddress, setFoundAddress] = useState(null);

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code unique.');
      return;
    }

    setIsSearching(true);
    setFoundAddress(null);

    try {
      const normalizedCode = searchCode.trim().toUpperCase();
      
      // Fetch all addresses and filter manually (more reliable)
      const addresses = await database.get('addresses').query().fetch();
      
      const found = addresses.find(addr => 
        addr.unique_id && addr.unique_id.toUpperCase() === normalizedCode
      );

      if (found) {
        setFoundAddress(found);
      } else {
        const codesList = addresses.map(a => a.unique_id).filter(Boolean);
        Alert.alert(
          'Code non trouvé',
          `Aucune adresse trouvée avec le code "${normalizedCode}".\n\nCodes disponibles: ${codesList.length > 0 ? codesList.join(', ') : 'aucun'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error searching address:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la recherche.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleNavigate = () => {
    if (foundAddress) {
      onAddressFound?.(foundAddress);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="close" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Rechercher une adresse</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.searchSection}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="map-search" size={48} color="#2BEE79" />
          </View>
          <Text style={styles.title}>Trouver une adresse</Text>
          <Text style={styles.subtitle}>
            Entrez le code unique d'une adresse partagée pour voir son emplacement
          </Text>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="pound" size={24} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="Ex: BZV001358"
              placeholderTextColor="#64748b"
              value={searchCode}
              onChangeText={setSearchCode}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchCode.length > 0 && (
              <Pressable onPress={() => setSearchCode('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#64748b" />
              </Pressable>
            )}
          </View>

          <Pressable
            style={[styles.searchBtn, isSearching && styles.searchBtnDisabled]}
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color="#0E151B" />
            ) : (
              <>
                <MaterialCommunityIcons name="magnify" size={22} color="#0E151B" />
                <Text style={styles.searchBtnText}>Rechercher</Text>
              </>
            )}
          </Pressable>
        </View>

        {foundAddress && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={[
                styles.categoryIcon,
                { backgroundColor: foundAddress.category === 'Maison' ? 'rgba(19, 127, 236, 0.15)' : 'rgba(245, 158, 11, 0.15)' }
              ]}>
                <MaterialCommunityIcons
                  name={foundAddress.category === 'Maison' ? 'home' : (foundAddress.category === 'Travail' ? 'briefcase' : 'map-marker')}
                  size={28}
                  color={foundAddress.category === 'Maison' ? '#137fec' : '#f59e0b'}
                />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{foundAddress.name}</Text>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{foundAddress.unique_id}</Text>
                </View>
              </View>
            </View>

            <View style={styles.resultDetails}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="map-marker" size={18} color="#2BEE79" />
                <Text style={styles.detailText}>
                  {foundAddress.city || 'Ville non renseignée'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="tag" size={18} color="#94A3B8" />
                <Text style={styles.detailText}>{foundAddress.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#94A3B8" />
                <Text style={styles.detailTextCoords}>
                  {foundAddress.latitude?.toFixed(6)}, {foundAddress.longitude?.toFixed(6)}
                </Text>
              </View>
            </View>

            <Pressable style={styles.navigateBtn} onPress={handleNavigate}>
              <MaterialCommunityIcons name="navigation" size={22} color="#0E151B" />
              <Text style={styles.navigateBtnText}>Voir sur la carte</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.helpSection}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#64748b" />
          <Text style={styles.helpText}>
            Le code unique est visible sur chaque carte d'adresse. 
            Partagez ce code avec vos amis pour qu'ils puissent vous retrouver facilement.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
  content: {
    flex: 1,
    padding: 20,
  },
  searchSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(43, 238, 121, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151D26',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2BEE79',
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
  },
  searchBtnDisabled: {
    opacity: 0.7,
  },
  searchBtnText: {
    color: '#0E151B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: '#151D26',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
    marginBottom: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  codeBadge: {
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
  },
  codeBadgeText: {
    color: '#2BEE79',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resultDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 16,
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  detailTextCoords: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2BEE79',
    paddingVertical: 14,
    borderRadius: 14,
  },
  navigateBtnText: {
    color: '#0E151B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 12,
  },
  helpText: {
    flex: 1,
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
  },
});
