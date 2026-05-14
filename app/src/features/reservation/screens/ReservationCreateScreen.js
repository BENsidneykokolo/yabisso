import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SERVICE_TYPES = [
  { key: 'coiffeur', label: 'Coiffeur', icon: 'content-cut' },
  { key: 'restaurant', label: 'Restaurant', icon: 'silverware-fork-knife' },
  { key: 'sport', label: 'Salle de sport', icon: 'dumbbell' },
  { key: 'cinema', label: 'Cinema', icon: 'movie' },
  { key: 'hotel', label: 'Hotel', icon: 'bed' },
  { key: 'spa', label: 'SPA', icon: 'spa' },
  { key: 'autres', label: 'Autres', icon: 'dots-horizontal' },
];

export default function ReservationCreateScreen({ onBack, onNavigate, reservation }) {
  const [selectedService, setSelectedService] = useState(reservation?.serviceType?.toLowerCase() || '');
  const [selectedDate, setSelectedDate] = useState(reservation?.date || '');
  const [selectedTime, setSelectedTime] = useState(reservation?.time || '');
  const [location, setLocation] = useState(reservation?.location || '');
  const [notes, setNotes] = useState(reservation?.notes || '');

  const isValid = selectedService && selectedDate && selectedTime && location;

  const handleSubmit = () => {
    if (isValid) {
      onNavigate && onNavigate('ReservationHome');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#E6EDF3" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {reservation ? 'Modifier' : 'Nouvelle'} reservation
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de service</Text>
          <View style={styles.servicesGrid}>
            {SERVICE_TYPES.map((service) => (
              <Pressable
                key={service.key}
                style={[
                  styles.serviceCard,
                  selectedService === service.key && styles.serviceCardActive,
                ]}
                onPress={() => setSelectedService(service.key)}
              >
                <View
                  style={[
                    styles.serviceIcon,
                    selectedService === service.key && styles.serviceIconActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={service.icon}
                    size={22}
                    color={selectedService === service.key ? '#0E151B' : '#7C8A9A'}
                  />
                </View>
                <Text
                  style={[
                    styles.serviceLabel,
                    selectedService === service.key && styles.serviceLabelActive,
                  ]}
                >
                  {service.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="calendar" size={18} color="#7C8A9A" />
            <TextInput
              style={styles.input}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor="#7C8A9A"
              value={selectedDate}
              onChangeText={setSelectedDate}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Heure</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#7C8A9A" />
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor="#7C8A9A"
              value={selectedTime}
              onChangeText={setSelectedTime}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lieu</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#7C8A9A" />
            <TextInput
              style={styles.input}
              placeholder="Adresse du service"
              placeholderTextColor="#7C8A9A"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (optionnel)</Text>
          <View style={[styles.inputContainer, styles.notesContainer]}>
            <MaterialCommunityIcons name="note-text" size={18} color="#7C8A9A" />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Preferences, besoins speciaux..."
              placeholderTextColor="#7C8A9A"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid}
        >
          <MaterialCommunityIcons
            name="check"
            size={20}
            color={isValid ? '#0E151B' : '#7C8A9A'}
          />
          <Text style={[styles.submitButtonText, !isValid && styles.submitButtonTextDisabled]}>
            {reservation ? 'Enregistrer' : 'Creer la reservation'}
          </Text>
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
    marginBottom: 24,
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
  headerSpacer: {
    width: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '30%',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  serviceCardActive: {
    backgroundColor: '#2BEE79',
    borderColor: '#2BEE79',
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  serviceLabel: {
    color: '#7C8A9A',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  serviceLabelActive: {
    color: '#0E151B',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 40, 0.85)',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    paddingVertical: 14,
    marginLeft: 10,
  },
  notesContainer: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 0,
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2BEE79',
    borderRadius: 16,
    paddingVertical: 16,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
  },
  submitButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  submitButtonTextDisabled: {
    color: '#7C8A9A',
  },
});