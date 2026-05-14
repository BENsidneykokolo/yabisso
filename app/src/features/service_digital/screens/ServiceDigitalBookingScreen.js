import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const serviceOptions = ['Site web', 'App mobile', 'Design', 'SEO', 'E-commerce', 'Autre'];

const timelines = ['Urgent (<1 sem)', '1-2 semaines', '2-4 semaines', '1-2 mois', '>2 mois'];

const budgets = ['< 500€', '500-1500€', '1500-3000€', '3000-5000€', '> 5000€'];

const ServiceDigitalBookingScreen = ({route, onBack}) => {
  const freelancer = route?.params?.freelancer || {name: 'Alex Dev', avatar: 'AD', specialty: 'Création site web', color: '#2196F3'};
  const [selectedService, setSelectedService] = useState(null);
  const [projectDetails, setProjectDetails] = useState('');
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Demande</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Freelance</Text>
          <View style={styles.freelancerRow}>
            <View style={[styles.avatarBox, {backgroundColor: freelancer.color + '30'}]}>
              <Text style={[styles.avatarText, {color: freelancer.color}]}>{freelancer.avatar}</Text>
            </View>
            <View>
              <Text style={styles.freelancerName}>{freelancer.name}</Text>
              <Text style={styles.freelancerSpecialty}>{freelancer.specialty}</Text>
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
          <Text style={styles.sectionTitle}>Description du Projet</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez votre projet en détail..."
            placeholderTextColor="#8A9BAE"
            value={projectDetails}
            onChangeText={setProjectDetails}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Délai Souhaité</Text>
          <View style={styles.optionsGrid}>
            {timelines.map((tl) => (
              <TouchableOpacity key={tl} style={[styles.optionBtn, selectedTimeline === tl && styles.optionBtnActive]} onPress={() => setSelectedTimeline(tl)}>
                <Text style={[styles.optionText, selectedTimeline === tl && styles.optionTextActive]}>{tl}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <View style={styles.optionsGrid}>
            {budgets.map((bud) => (
              <TouchableOpacity key={bud} style={[styles.optionBtn, selectedBudget === bud && styles.optionBtnActive]} onPress={() => setSelectedBudget(bud)}>
                <Text style={[styles.optionText, selectedBudget === bud && styles.optionTextActive]}>{bud}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fichiers (optionnel)</Text>
          <TouchableOpacity style={styles.uploadArea}>
            <MaterialCommunityIcons name="upload" size={28} color="#8A9BAE" />
            <Text style={styles.uploadText}>Cliquez pour ajouter des fichiers</Text>
            <Text style={styles.uploadHint}>PDF, images, zip (max 10Mo)</Text>
          </TouchableOpacity>
        </View>
        <View style={{height: 120}} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, (!selectedService || !projectDetails || !selectedTimeline || !selectedBudget) && styles.submitBtnDisabled]}
          disabled={!selectedService || !projectDetails || !selectedTimeline || !selectedBudget}
          onPress={() => {}}
        >
          <MaterialCommunityIcons name="send" size={20} color="#FFF" style={{marginRight: 8}} />
          <Text style={styles.submitBtnText}>Envoyer la Demande</Text>
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
  freelancerRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, padding: 14},
  avatarBox: {width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center'},
  avatarText: {fontSize: 16, fontWeight: 'bold'},
  freelancerName: {fontSize: 16, color: '#FFFFFF', fontWeight: '600', marginLeft: 12},
  freelancerSpecialty: {fontSize: 12, color: '#8A9BAE', marginTop: 2},
  optionsGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  optionBtn: {backgroundColor: CARD, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: 'transparent'},
  optionBtnActive: {borderColor: ACCENT, backgroundColor: ACCENT + '20'},
  optionText: {fontSize: 14, color: '#8A9BAE'},
  optionTextActive: {color: ACCENT, fontWeight: '600'},
  textArea: {backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: '#FFFFFF', height: 120},
  uploadArea: {backgroundColor: CARD, borderRadius: 12, paddingVertical: 28, alignItems: 'center', borderWidth: 1, borderColor: '#3A4A5A', borderStyle: 'dashed'},
  uploadText: {fontSize: 14, color: '#FFFFFF', marginTop: 10},
  uploadHint: {fontSize: 12, color: '#8A9BAE', marginTop: 4},
  bottomBar: {position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1A2530', paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: '#2A3A4A'},
  submitBtn: {backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
  submitBtnDisabled: {backgroundColor: '#3A4A5A'},
  submitBtnText: {color: '#FFF', fontSize: 16, fontWeight: '600'},
});

export default ServiceDigitalBookingScreen;