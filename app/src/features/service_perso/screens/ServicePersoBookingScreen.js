import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const serviceOptions = ['Coupe Femme', 'Coupe Homme', 'Coloration', 'Brushing', 'Soin capillaire'];

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

const ServicePersoBookingScreen = ({route, onBack}) => {
  const provider = route?.params?.provider || {name: 'Marie Claire', priceMin: 35, priceMax: 80};
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const dates = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {day: d.getDate(), weekday: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d.getDay()], full: d.toISOString().split('T')[0]};
  });

  const estimate = selectedService ? (selectedService === 'Coupe Femme' ? 35 : selectedService === 'Coloration' ? 60 : 40) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Réservation</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prestataire</Text>
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerAvatarText}>{provider.avatar || 'MC'}</Text>
            </View>
            <Text style={styles.providerName}>{provider.name}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service</Text>
          <View style={styles.optionsGrid}>
            {serviceOptions.map((svc) => (
              <TouchableOpacity key={svc} style={[styles.optionBtn, selectedService === svc && styles.optionBtnActive]} onPress={() => setSelectedService(svc)}>
                <Text style={[styles.optionText, selectedService === svc && styles.optionTextActive]}>{svc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dates.map((d) => (
              <TouchableOpacity key={d.full} style={[styles.dateCard, selectedDate === d.full && styles.dateCardActive]} onPress={() => setSelectedDate(d.full)}>
                <Text style={[styles.dateWeekday, selectedDate === d.full && styles.dateTextActive]}>{d.weekday}</Text>
                <Text style={[styles.dateDay, selectedDate === d.full && styles.dateTextActive]}>{d.day}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horaire</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((t) => (
              <TouchableOpacity key={t} style={[styles.timeBtn, selectedTime === t && styles.timeBtnActive]} onPress={() => setSelectedTime(t)}>
                <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse</Text>
          <TextInput style={styles.input} placeholder="Entrez votre adresse" placeholderTextColor="#8A9BAE" value={address} onChangeText={setAddress} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (optionnel)</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Ajoutez des instructions spéciales..." placeholderTextColor="#8A9BAE" value={notes} onChangeText={setNotes} multiline numberOfLines={4} textAlignVertical="top" />
        </View>

        {estimate && (
          <View style={styles.estimateSection}>
            <Text style={styles.sectionTitle}>Estimation du Prix</Text>
            <View style={styles.estimateCard}>
              <Text style={styles.estimateService}>{selectedService}</Text>
              <Text style={styles.estimatePrice}>~{estimate}€</Text>
            </View>
          </View>
        )}
        <View style={{height: 120}} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.confirmBtn, (!selectedService || !selectedDate || !selectedTime) && styles.confirmBtnDisabled]}
          disabled={!selectedService || !selectedDate || !selectedTime}
          onPress={() => {}}
        >
          <MaterialCommunityIcons name="check" size={20} color="#FFF" style={{marginRight: 8}} />
          <Text style={styles.confirmBtnText}>Confirmer la Réservation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: DARK},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16},
  backBtn: {width: 40, height: 40, justifyContent: 'center'},
  headerTitle: {fontSize: 18, fontWeight: '600', color: '#FFFFFF'},
  section: {paddingHorizontal: 16, marginBottom: 24},
  sectionTitle: {fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 12},
  providerRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, padding: 14},
  providerAvatar: {width: 44, height: 44, borderRadius: 22, backgroundColor: ACCENT + '30', justifyContent: 'center', alignItems: 'center'},
  providerAvatarText: {fontSize: 16, color: ACCENT, fontWeight: 'bold'},
  providerName: {fontSize: 16, color: '#FFFFFF', fontWeight: '600', marginLeft: 12},
  optionsGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  optionBtn: {backgroundColor: CARD, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: 'transparent'},
  optionBtnActive: {borderColor: ACCENT, backgroundColor: ACCENT + '20'},
  optionText: {fontSize: 14, color: '#8A9BAE'},
  optionTextActive: {color: ACCENT, fontWeight: '600'},
  dateCard: {backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginRight: 10, alignItems: 'center', minWidth: 56, borderWidth: 1, borderColor: 'transparent'},
  dateCardActive: {borderColor: ACCENT, backgroundColor: ACCENT + '20'},
  dateWeekday: {fontSize: 12, color: '#8A9BAE'},
  dateDay: {fontSize: 18, color: '#FFFFFF', fontWeight: '600', marginTop: 4},
  dateTextActive: {color: ACCENT},
  timeGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  timeBtn: {backgroundColor: CARD, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: 'transparent'},
  timeBtnActive: {borderColor: ACCENT, backgroundColor: ACCENT + '20'},
  timeText: {fontSize: 14, color: '#8A9BAE'},
  timeTextActive: {color: ACCENT, fontWeight: '600'},
  input: {backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: '#FFFFFF'},
  textArea: {height: 100, paddingTop: 14},
  estimateSection: {paddingHorizontal: 16, marginBottom: 24},
  estimateCard: {backgroundColor: CARD, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between'},
  estimateService: {fontSize: 15, color: '#FFFFFF'},
  estimatePrice: {fontSize: 18, color: ACCENT, fontWeight: 'bold'},
  bottomBar: {position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1A2530', paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#2A3A4A'},
  confirmBtn: {backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
  confirmBtnDisabled: {backgroundColor: '#3A4A5A'},
  confirmBtnText: {color: '#FFF', fontSize: 16, fontWeight: '600'},
});

export default ServicePersoBookingScreen;