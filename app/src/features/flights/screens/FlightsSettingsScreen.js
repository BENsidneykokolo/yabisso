import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#0E151B',
  card: '#1A2332',
  skyBlue: '#38BDF8',
  green: '#22c55e',
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  border: '#374151',
  inputBg: '#111827',
};

const currencies = [
  { code: 'XOF', label: 'FCFA (XOF)', symbol: 'FCFA' },
  { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { code: 'USD', label: 'Dollar US (USD)', symbol: '$' },
];

const cabinClasses = [
  { id: 'economique', label: 'Economique' },
  { id: 'premium', label: 'Premium Economique' },
  { id: 'affaires', label: 'Affaires' },
  { id: 'premiere', label: 'Premiere' },
];

export default function FlightsSettingsScreen({ onBack, onNavigate }) {
  const [currency, setCurrency] = useState('XOF');
  const [defaultClass, setDefaultClass] = useState('economique');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [promoEmails, setPromoEmails] = useState(true);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showClass, setShowClass] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parametres des vols</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences generales</Text>

          <TouchableOpacity style={styles.settingCard} onPress={() => setShowCurrency(!showCurrency)}>
            <MaterialCommunityIcons name="currency-usd" size={22} color={COLORS.skyBlue} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Devise par defaut</Text>
              <Text style={styles.settingValue}>
                {currencies.find(c => c.code === currency)?.label}
              </Text>
            </View>
            <Ionicons name={showCurrency ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {showCurrency && (
            <View style={styles.dropdown}>
              {currencies.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={styles.dropdownItem}
                  onPress={() => { setCurrency(c.code); setShowCurrency(false); }}
                >
                  <Text style={[styles.dropdownText, currency === c.code && styles.dropdownTextActive]}>
                    {c.label}
                  </Text>
                  {currency === c.code && <Ionicons name="checkmark" size={18} color={COLORS.skyBlue} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.settingCard} onPress={() => setShowClass(!showClass)}>
            <MaterialCommunityIcons name="seat-passenger" size={22} color={COLORS.skyBlue} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Classe par defaut</Text>
              <Text style={styles.settingValue}>
                {cabinClasses.find(c => c.id === defaultClass)?.label}
              </Text>
            </View>
            <Ionicons name={showClass ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {showClass && (
            <View style={styles.dropdown}>
              {cabinClasses.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.dropdownItem}
                  onPress={() => { setDefaultClass(c.id); setShowClass(false); }}
                >
                  <Text style={[styles.dropdownText, defaultClass === c.id && styles.dropdownTextActive]}>
                    {c.label}
                  </Text>
                  {defaultClass === c.id && <Ionicons name="checkmark" size={18} color={COLORS.skyBlue} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <Ionicons name="mail-outline" size={22} color={COLORS.skyBlue} />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleLabel}>Notifications par e-mail</Text>
                <Text style={styles.toggleSub}>Recevez les confirmations par e-mail</Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.skyBlue + '60' }}
              thumbColor={emailNotifications ? COLORS.skyBlue : COLORS.gray}
            />
          </View>

          <View style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.skyBlue} />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleLabel}>Notifications push</Text>
                <Text style={styles.toggleSub}>Alertes en temps reel</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.skyBlue + '60' }}
              thumbColor={pushNotifications ? COLORS.skyBlue : COLORS.gray}
            />
          </View>

          <View style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <MaterialCommunityIcons name="tag" size={22} color={COLORS.skyBlue} />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleLabel}>Alertes de prix</Text>
                <Text style={styles.toggleSub}>Etes informe des baisses de prix</Text>
              </View>
            </View>
            <Switch
              value={priceAlerts}
              onValueChange={setPriceAlerts}
              trackColor={{ false: COLORS.border, true: COLORS.green + '60' }}
              thumbColor={priceAlerts ? COLORS.green : COLORS.gray}
            />
          </View>

          <View style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <MaterialCommunityIcons name="offer" size={22} color={COLORS.skyBlue} />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleLabel}>E-mails promotionnels</Text>
                <Text style={styles.toggleSub}>Offres speciales et promotions</Text>
              </View>
            </View>
            <Switch
              value={promoEmails}
              onValueChange={setPromoEmails}
              trackColor={{ false: COLORS.border, true: COLORS.skyBlue + '60' }}
              thumbColor={promoEmails ? COLORS.skyBlue : COLORS.gray}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aide et support</Text>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color={COLORS.skyBlue} />
            <Text style={styles.menuText}>FAQ Vols</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="chat-question-outline" size={22} color={COLORS.skyBlue} />
            <Text style={styles.menuText}>Contacter le support</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="file-document-outline" size={22} color={COLORS.skyBlue} />
            <Text style={styles.menuText}>Conditions de reservation</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Yabisso Flights v1.0.0</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  content: { flex: 1, paddingHorizontal: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.lightGray, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  settingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 12, color: COLORS.gray },
  settingValue: { fontSize: 14, color: COLORS.white, fontWeight: '500', marginTop: 2 },
  dropdown: { backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 8, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14 },
  dropdownText: { fontSize: 14, color: COLORS.lightGray },
  dropdownTextActive: { color: COLORS.skyBlue, fontWeight: '600' },
  toggleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  toggleInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTextContainer: { flex: 1 },
  toggleLabel: { fontSize: 14, color: COLORS.white, fontWeight: '500' },
  toggleSub: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  menuText: { flex: 1, fontSize: 14, color: COLORS.white, fontWeight: '500' },
  versionInfo: { alignItems: 'center', marginTop: 10 },
  versionText: { fontSize: 12, color: COLORS.gray },
});