import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const DARK = '#0E151B';
const ACCENT = '#FF6B35';
const CARD = '#1A2530';

const services = [
  {name: 'Audit comptable', price: 'Sur devis'},
  {name: 'Déclaration fiscale', price: '150€'},
  {name: 'Paie & RH', price: '200€/mois'},
  {name: 'Conseil financier', price: '250€/h'},
];

const teamMembers = [
  {name: 'Jean Dupont', role: 'Expert-comptable', initials: 'JD'},
  {name: 'Marie Martin', role: 'Conseiller fiscal', initials: 'MM'},
  {name: 'Paul Bernard', role: ' Analyste financier', initials: 'PB'},
];

const ServiceProDetailsScreen = ({route, onNavigate, onBack}) => {
  const agency = route?.params?.agency || {name: 'Cabinet Alpha', logo: 'CA', specialty: 'Comptabilité', rating: 4.8, reviews: 89, location: 'Paris', phone: '01 23 45 67 89', color: '#2196F3'};
  const [contactMsg, setContactMsg] = React.useState('');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={[styles.logoBox, {backgroundColor: agency.color + '30'}]}>
            <Text style={[styles.logoText, {color: agency.color}]}>{agency.logo}</Text>
          </View>
          <Text style={styles.agencyName}>{agency.name}</Text>
          <Text style={styles.agencySpecialty}>{agency.specialty}</Text>
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>{agency.rating}</Text>
            <Text style={styles.reviewCount}>({agency.reviews} avis)</Text>
          </View>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#8A9BAE" />
            <Text style={styles.locationText}>{agency.location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.bioText}>
            Cabinet d'expertise comptable certifié avec plus de 15 ans d'expérience. Nous accompagnons les entreprises dans leur croissance avec des solutions personnalisées et un suivi rigoureux.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Proposés</Text>
          {services.map((svc, i) => (
            <View key={i} style={styles.serviceRow}>
              <MaterialCommunityIcons name="check-circle" size={18} color={ACCENT} style={{marginRight: 10}} />
              <Text style={styles.serviceName}>{svc.name}</Text>
              <Text style={styles.servicePrice}>{svc.price}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Équipe</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {teamMembers.map((member, i) => (
              <View key={i} style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitials}>{member.initials}</Text>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nous Contacter</Text>
          <View style={styles.phoneRow}>
            <MaterialCommunityIcons name="phone" size={20} color={ACCENT} />
            <Text style={styles.phoneText}>{agency.phone}</Text>
          </View>
          <TextInput
            style={styles.contactInput}
            placeholder="Votre message..."
            placeholderTextColor="#8A9BAE"
            value={contactMsg}
            onChangeText={setContactMsg}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => {}}>
            <MaterialCommunityIcons name="send" size={18} color="#FFF" style={{marginRight: 8}} />
            <Text style={styles.sendBtnText}>Envoyer le message</Text>
          </TouchableOpacity>
        </View>
        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: DARK},
  profileHeader: {alignItems: 'center', paddingTop: 50, paddingBottom: 24, paddingHorizontal: 16},
  backBtn: {position: 'absolute', top: 50, left: 16, width: 40, height: 40, justifyContent: 'center', zIndex: 1},
  logoBox: {width: 90, height: 90, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12},
  logoText: {fontSize: 32, fontWeight: 'bold'},
  agencyName: {fontSize: 22, fontWeight: 'bold', color: '#FFFFFF'},
  agencySpecialty: {fontSize: 14, color: '#8A9BAE', marginTop: 4},
  ratingRow: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  ratingText: {fontSize: 16, color: '#FFD700', fontWeight: '600', marginLeft: 4},
  reviewCount: {fontSize: 14, color: '#8A9BAE', marginLeft: 4},
  locationRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  locationText: {fontSize: 14, color: '#8A9BAE', marginLeft: 4},
  section: {paddingHorizontal: 16, marginBottom: 24},
  sectionTitle: {fontSize: 17, fontWeight: '600', color: '#FFFFFF', marginBottom: 12},
  bioText: {fontSize: 14, color: '#8A9BAE', lineHeight: 22},
  serviceRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 10, padding: 14, marginBottom: 8},
  serviceName: {flex: 1, fontSize: 14, color: '#FFFFFF'},
  servicePrice: {fontSize: 14, color: ACCENT, fontWeight: '600'},
  memberCard: {backgroundColor: CARD, borderRadius: 12, padding: 14, marginRight: 12, alignItems: 'center', width: 100},
  memberAvatar: {width: 50, height: 50, borderRadius: 25, backgroundColor: '#3A4A5A', justifyContent: 'center', alignItems: 'center', marginBottom: 8},
  memberInitials: {fontSize: 16, color: '#FFFFFF', fontWeight: '600'},
  memberName: {fontSize: 13, color: '#FFFFFF', fontWeight: '500', textAlign: 'center'},
  memberRole: {fontSize: 11, color: '#8A9BAE', textAlign: 'center', marginTop: 2},
  phoneRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 12},
  phoneText: {fontSize: 16, color: '#FFFFFF', marginLeft: 10},
  contactInput: {backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: '#FFFFFF', height: 100, textAlignVertical: 'top', marginBottom: 12},
  sendBtn: {backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
  sendBtnText: {color: '#FFF', fontSize: 15, fontWeight: '600'},
});

export default ServiceProDetailsScreen;