import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DeliverySettingsScreen = ({ onNavigate, onBack }) => {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [defaultInsurance, setDefaultInsurance] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres de livraison</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresses par défaut</Text>
          
          <TouchableOpacity style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <MaterialCommunityIcons name="home" size={24} color="#4CAF50" />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Domicile</Text>
              <Text style={styles.addressText}>Abidjan, Plateau, Rue du Commerce</Text>
            </View>
            <MaterialCommunityIcons name="pencil" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <MaterialCommunityIcons name="office-building" size={24} color="#2196F3" />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Bureau</Text>
              <Text style={styles.addressText}>Abidjan, Cocody, Université</Text>
            </View>
            <MaterialCommunityIcons name="pencil" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.addAddressButton}>
            <MaterialCommunityIcons name="plus" size={20} color="#2196F3" />
            <Text style={styles.addAddressText}>Ajouter une adresse</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="email" size={24} color="#2196F3" />
              <View>
                <Text style={styles.settingLabel}>Notifications email</Text>
                <Text style={styles.settingDesc}>Recevoir les mises à jour par email</Text>
              </View>
            </View>
            <Switch
              value={emailNotif}
              onValueChange={setEmailNotif}
              trackColor={{ false: '#2A3444', true: '#2196F3' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="message-text" size={24} color="#4CAF50" />
              <View>
                <Text style={styles.settingLabel}>Notifications SMS</Text>
                <Text style={styles.settingDesc}>Recevoir les alertes par SMS</Text>
              </View>
            </View>
            <Switch
              value={smsNotif}
              onValueChange={setSmsNotif}
              trackColor={{ false: '#2A3444', true: '#2196F3' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="bell" size={24} color="#FF9800" />
              <View>
                <Text style={styles.settingLabel}>Notifications push</Text>
                <Text style={styles.settingDesc}>Recevoir les notifications sur l'app</Text>
              </View>
            </View>
            <Switch
              value={pushNotif}
              onValueChange={setPushNotif}
              trackColor={{ false: '#2A3444', true: '#2196F3' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assurance par défaut</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#4CAF50" />
              <View>
                <Text style={styles.settingLabel}>Activer l'assurance</Text>
                <Text style={styles.settingDesc}>Ajouter automatiquement une assurance à chaque livraison</Text>
              </View>
            </View>
            <Switch
              value={defaultInsurance}
              onValueChange={setDefaultInsurance}
              trackColor={{ false: '#2A3444', true: '#2196F3' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.actionRow}>
            <MaterialCommunityIcons name="history" size={24} color="#2196F3" />
            <Text style={styles.actionText}>Historique des expéditions</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <MaterialCommunityIcons name="help-circle" size={24} color="#FF9800" />
            <Text style={styles.actionText}>Aide et support</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <MaterialCommunityIcons name="file-document" size={24} color="#888" />
            <Text style={styles.actionText}>Conditions générales</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E151B', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 12 },
  addressIcon: { backgroundColor: '#2A3444', padding: 12, borderRadius: 12 },
  addressInfo: { flex: 1, marginLeft: 12 },
  addressLabel: { fontSize: 12, color: '#888' },
  addressText: { fontSize: 14, color: '#FFF', marginTop: 4 },
  addAddressButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderWidth: 1, borderColor: '#2196F3', borderRadius: 12, borderStyle: 'dashed' },
  addAddressText: { marginLeft: 8, color: '#2196F3', fontSize: 14 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 12 },
  settingInfo: { flexDirection: 'row', alignItems: 'center' },
  settingLabel: { fontSize: 16, color: '#FFF', marginLeft: 12 },
  settingDesc: { fontSize: 12, color: '#888', marginLeft: 12, marginTop: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2332', padding: 16, borderRadius: 12, marginBottom: 8 },
  actionText: { flex: 1, marginLeft: 12, fontSize: 16, color: '#FFF' },
});

export default DeliverySettingsScreen;