import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Switch} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const serviceTypes = ['Fuite', 'Canalisation', 'WC', 'Robinet', 'Chauffe-eau', 'Autre'];

const ServiceMaisonBookingScreen = ({route, onBack}) => {
  const provider = route?.params?.provider || {name: 'DepannExpress', avatar: 'DE', color: '#2196F3', specialty: 'Plomberie'};
  const [selectedType, setSelectedType] = useState(null);
  const [problemDesc, setProblemDesc] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [address, setAddress] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  const dates = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {day: d.getDate(), weekday: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d.getDay()], full: d.toISOString().split('T')[0]};
  });

  const times = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demande d'Intervention</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artisan</Text>
          <View style={styles.providerRow}>
            <View style={[styles.providerAvatar, {backgroundColor: provider.color + '30'}]}>
              <Text style={[styles.providerAvatarText, {color: provider.color}]}>{provider.avatar}</Text>
            </View>
            <View>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerSpecialty}>{provider.specialty}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type d'Intervention</Text>
          <View style={styles.optionsGrid}>
            {serviceTypes.map((type) => (
              <TouchableOpacity key={type} style={[styles.optionBtn, selectedType === type && styles.optionBtnActive]} onPress={() => setSelectedType(type)}>
                <Text style={[styles.optionText, selectedType === type && styles.optionTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description du Problème</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez votre problème en détail..."
            placeholderTextColor="#8A9BAE"
            value={problemDesc}
            onChangeText={setProblemDesc}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo (optionnel)</Text>
          <TouchableOpacity style={styles.uploadArea}>
            <MaterialCommunityIcons name="camera" size={32} color="#8A9BAE" />
            <Text style={styles.uploadText}>Ajouter une photo du problème</Text>
            <Text style={styles.uploadHint}>Aide l'artisan à mieux évaluer l'intervention</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Souhaitée</Text>
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
          <Text style={styles.sectionTitle}>Horaire Préféré</Text>
          <View style={styles.timeGrid}>
            {times.map((t) => (
              <TouchableOpacity key={t} style={[styles.timeBtn, selectedTime === t && styles.timeBtnActive]} onPress={() => setSelectedTime(t)}>
                <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de l'Intervention</Text>
          <TextInput style={styles.input} placeholder="Entrez votre adresse" placeholderTextColor="#8A9BAE" value={address} onChangeText={setAddress} />
        </View>

        <View style={styles.section}>
          <View style={styles.emergencyRow}>
            <View>
              <Text style={styles.emergencyTitle}>Intervention d'Urgence</Text>
              <Text style={styles.emergencySubtitle}>Disponible 24h/7j - Supplément applicable</Text>
            </View>
            <Switch
              value={isEmergency}
              onValueChange={setIsEmergency}
              trackColor={{false: '#3A4A5A', true: ACCENT + '60'}}
              thumbColor={isEmergency ? ACCENT : '#8A9BAE'}
            />
          </View>
        </View>
        <View style={{height: 120}} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, (!selectedType || !problemDesc || !selectedDate || !selectedTime || !address) && styles.submitBtnDisabled]}
          disabled={!selectedType || !problemDesc || !selectedDate || !selectedTime || !address}
          onPress={() => {}}
        >
          <MaterialCommunityIcons name="check" size={20} color="#FFF" style={{marginRight: 8}} />
          <Text style={styles.submitBtnText}>Soumettre la Demande</Text>
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
  providerAvatar: {width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center'},
  providerAvatarText: {fontSize: 16, fontWeight: 'bold'},
  providerName: {fontSize: 16, color: '#FFFFFF', fontWeight: '600', marginLeft: 12},
  providerSpecialty: {fontSize: 12, color: '#8A9BAE', marginTop: 2},
  optionsGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  optionBtn: {backgroundColor: CARD, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: 'transparent'},
  optionBtnActive: {borderColor: ACCENT, backgroundColor: ACCENT + '20'},
  optionText: {fontSize: 14, color: '#8A9BAE'},
  optionTextActive: {color: ACCENT, fontWeight: '600'},
  textArea: {backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: '#FFFFFF', height: 100},
  uploadArea: {backgroundColor: CARD, borderRadius: 12, paddingVertical: 28, alignItems: 'center', borderWidth: 1, borderColor: '#3A4A5A', borderStyle: 'dashed'},
  uploadText: {fontSize: 14, color: '#FFFFFF', marginTop: 10},
  uploadHint: {fontSize: 12, color: '#8A9BAE', marginTop: 4},
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
  emergencyRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, borderRadius: 12, padding: 16},
  emergencyTitle: {fontSize: 15, color: '#FFFFFF', fontWeight: '500'},
  emergencySubtitle: {fontSize: 12, color: '#8A9BAE', marginTop: 2},
  bottomBar: {position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1A2530', paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#2A3A4A'},
  submitBtn: {backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
  submitBtnDisabled: {backgroundColor: '#3A4A5A'},
  submitBtnText: {color: '#FFF', fontSize: 16, fontWeight: '600'},
});

export default ServiceMaisonBookingScreen;