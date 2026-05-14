import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const serviceOptions = ['Audit', 'Conseil', 'Formation', 'Accompagnement', 'Autre'];

const consultationTypes = ['Visio', 'Téléphone', 'En présentiel'];

const ServiceProBookingScreen = ({route, onBack}) => {
  const agency = route?.params?.agency || {name: 'Cabinet Alpha', specialty: 'Comptabilité'};
  const [selectedService, setSelectedService] = useState(null);
  const [consultType, setConsultType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');

  const dates = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 2);
    return {day: d.getDate(), weekday: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d.getDay()], full: d.toISOString().split('T')[0]};
  });

  const times = ['09:00', '10:30', '14:00', '15:30', '17:00'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demande de Consultation</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agence</Text>
          <View style={styles.agencyRow}>
            <View style={styles.agencyLogo}>
              <Text style={styles.agencyLogoText}>{agency.logo || 'CA'}</Text>
            </View>
            <View>
              <Text style={styles.agencyName}>{agency.name}</Text>
              <Text style={styles.agencySpecialty}>{agency.specialty}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de Service</Text>
          <View style={styles.optionsGrid}>
            {serviceOptions.map((svc) => (
              <TouchableOpacity key={svc} style={[styles.optionBtn, selectedService === svc && styles.optionBtnActive]} onPress={() => setSelectedService(svc)}>
                <Text style={[styles.optionText, selectedService === svc && styles.optionTextActive]}>{svc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de Consultation</Text>
          <View style={styles.typesRow}>
            {consultationTypes.map((type) => (
              <TouchableOpacity key={type} style={[styles.typeBtn, consultType === type && styles.typeBtnActive]} onPress={() => setConsultType(type)}>
                <MaterialCommunityIcons name={type === 'Visio' ? 'video' : type === 'Téléphone' ? 'phone' : 'account-group'} size={20} color={consultType === type ? ACCENT : '#8A9BAE'} />
                <Text style={[styles.typeText, consultType === type && styles.typeTextActive]}>{type}</Text>
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
            {times.map((t) => (
              <TouchableOpacity key={t} style={[styles.timeBtn, selectedTime === t && styles.timeBtnActive]} onPress={() => setSelectedTime(t)}>
                <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes / Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez votre besoin..."
            placeholderTextColor="#8A9BAE"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>
        <View style={{height: 120}} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.sendBtn, (!selectedService || !consultType || !selectedDate || !selectedTime) && styles.sendBtnDisabled]}
          disabled={!selectedService || !consultType || !selectedDate || !selectedTime}
          onPress={() => {}}
        >
          <MaterialCommunityIcons name="check" size={20} color="#FFF" style={{marginRight: 8}} />
          <Text style={styles.sendBtnText}>Envoyer la Demande</Text>
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
  agencyRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, padding: 14},
  agencyLogo: {width: 44, height: 44, borderRadius: 12, backgroundColor: ACCENT + '30', justifyContent: 'center', alignItems: 'center'},
  agencyLogoText: {fontSize: 16, color: ACCENT, fontWeight: 'bold'},
  agencyName: {fontSize: 16, color: '#FFFFFF', fontWeight: '600', marginLeft: 12},
  agencySpecialty: {fontSize: 12, color: '#8A9BAE', marginTop: 2},
  optionsGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  optionBtn: {backgroundColor: CARD, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: 'transparent'},
  optionBtnActive: {borderColor: ACCENT, backgroundColor: ACCENT + '20'},
  optionText: {fontSize: 14, color: '#8A9BAE'},
  optionTextActive: {color: ACCENT, fontWeight: '600'},
  typesRow: {flexDirection: 'row'},
  typeBtn: {flex: 1, backgroundColor: CARD, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: 'transparent'},
  typeBtnActive: {borderColor: ACCENT, backgroundColor: ACCENT + '20'},
  typeText: {fontSize: 13, color: '#8A9BAE', marginTop: 6},
  typeTextActive: {color: ACCENT, fontWeight: '600'},
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
  textArea: {backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: '#FFFFFF', height: 120},
  bottomBar: {position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1A2530', paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#2A3A4A'},
  sendBtn: {backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
  sendBtnDisabled: {backgroundColor: '#3A4A5A'},
  sendBtnText: {color: '#FFF', fontSize: 16, fontWeight: '600'},
});

export default ServiceProBookingScreen;