import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Animated, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TaxiRatingScreen({ onBack, onNavigate, route }) {
  const params = route?.params || {};
  const { price, driver, pickup, destination } = params;
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const tipOptions = [0, 500, 1000, 2000];

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }).start();
  }, []);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Note requise', 'Veuillez donner une note au chauffeur.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => setShowReceipt(true), 1000);
  };

  if (showReceipt) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.receiptContainer}>
          <View style={styles.receiptHeader}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#22c55e" />
            <Text style={styles.receiptTitle}>Course terminee</Text>
            <Text style={styles.receiptSubtitle}>Merci d'avoir utilise Yabisso Taxi</Text>
          </View>
          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Course</Text><Text style={styles.receiptValue}>{pickup} - {destination}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Chauffeur</Text><Text style={styles.receiptValue}>{driver?.name || 'Chauffeur'}</Text></View>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Montant</Text><Text style={styles.receiptPrice}>{price?.toLocaleString() || '0'} FCFA</Text></View>
            {tip > 0 && <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Pourboire</Text><Text style={[styles.receiptValue, { color: '#22c55e' }]}>+{tip.toLocaleString()} FCFA</Text></View>}
            <View style={styles.receiptDivider} />
            <View style={styles.receiptRow}><Text style={styles.receiptTotalLabel}>Total paye</Text><Text style={styles.receiptTotal}>{((price || 0) + tip).toLocaleString()} FCFA</Text></View>
          </View>
          <Pressable style={styles.doneBtn} onPress={() => onNavigate?.('taxi_home')}><Text style={styles.doneBtnText}>Retour a l'accueil</Text></Pressable>
          <Pressable style={styles.shareBtn} onPress={() => Alert.alert('Partager', 'Fonction de partage en cours...')}><MaterialCommunityIcons name="share-variant" size={18} color="#fff" /><Text style={styles.shareBtnText}>Partager le trajet</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}>
          <MaterialCommunityIcons name="check-circle" size={80} color="#22c55e" />
          <Text style={styles.thanksTitle}>Merci !</Text>
          <Text style={styles.thanksSubtitle}>Votre avis compte pour nous</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}><Ionicons name="close" size={22} color="#fff" /></Pressable>
        <Text style={styles.headerTitle}>Notez votre course</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.driverCard}>
          <View style={styles.driverPhoto}><MaterialCommunityIcons name="account" size={48} color="#64748b" /></View>
          <Text style={styles.driverName}>{driver?.name || 'Chauffeur'}</Text>
          <Text style={styles.driverPlate}>{driver?.plate || 'AB-1234-CC'}</Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.sectionLabel}>Comment etait votre course ?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <Pressable key={star} onPress={() => setRating(star)}>
                <Ionicons name={rating >= star ? 'star' : 'star-outline'} size={40} color={rating >= star ? '#eab308' : '#2a3a4a'} />
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingText}>{rating > 0 ? (rating === 5 ? 'Excellent' : rating === 4 ? 'Tres bien' : rating === 3 ? 'Correct' : rating === 2 ? 'Moyen' : 'Mauvais') : 'Tapez pour noter'}</Text>
        </View>

        <View style={styles.tipSection}>
          <Text style={styles.sectionLabel}>Laisser un pourboire</Text>
          <Text style={styles.tipSublabel}>Reconnaissable pour un bon service</Text>
          <View style={styles.tipRow}>
            {tipOptions.map(amount => (
              <Pressable key={amount} style={[styles.tipChip, tip === amount && styles.tipChipActive, amount === 0 && tip > 0 && styles.tipChipInactive]} onPress={() => setTip(amount)}>
                <Text style={[styles.tipChipText, tip === amount && styles.tipChipTextActive]}>
                  {amount === 0 ? 'Non merci' : `${amount.toLocaleString()} FCFA`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Course</Text><Text style={styles.summaryValue}>{(price || 0).toLocaleString()} FCFA</Text></View>
          {tip > 0 && <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Pourboire</Text><Text style={[styles.summaryValue, { color: '#22c55e' }]}>+{tip.toLocaleString()} FCFA</Text></View>}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total</Text><Text style={styles.summaryTotal}>{((price || 0) + tip).toLocaleString()} FCFA</Text></View>
        </View>

        <Pressable style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]} onPress={handleSubmit}>
          <MaterialCommunityIcons name="check-bold" size={20} color="#fff" />
          <Text style={styles.submitBtnText}>Envoyer mon avis</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1c2630', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  thanksTitle: { color: '#F8FAFC', fontSize: 28, fontWeight: '700', marginTop: 16 },
  thanksSubtitle: { color: '#64748b', fontSize: 16, marginTop: 8 },
  receiptContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  receiptHeader: { alignItems: 'center', marginBottom: 32 },
  receiptTitle: { color: '#F8FAFC', fontSize: 24, fontWeight: '700', marginTop: 16 },
  receiptSubtitle: { color: '#64748b', fontSize: 14, marginTop: 6 },
  receiptCard: { backgroundColor: '#1c2630', borderRadius: 16, padding: 20 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  receiptLabel: { color: '#64748b', fontSize: 14 },
  receiptValue: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  receiptDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 12 },
  receiptPrice: { color: '#F8FAFC', fontSize: 14, fontWeight: '700' },
  receiptTotalLabel: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  receiptTotal: { color: '#22c55e', fontSize: 20, fontWeight: '700' },
  doneBtn: { backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1c2630', borderRadius: 12, paddingVertical: 14, marginTop: 12 },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  driverCard: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  driverPhoto: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#233648', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  driverName: { color: '#F8FAFC', fontSize: 20, fontWeight: '700' },
  driverPlate: { color: '#22c55e', fontSize: 16, fontWeight: '700', marginTop: 4 },
  ratingSection: { alignItems: 'center', marginBottom: 28 },
  sectionLabel: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  ratingText: { color: '#64748b', fontSize: 14 },
  tipSection: { marginBottom: 24 },
  tipSublabel: { color: '#64748b', fontSize: 13, marginBottom: 12, marginTop: -8 },
  tipRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  tipChip: { backgroundColor: '#1c2630', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: 'transparent' },
  tipChipActive: { borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)' },
  tipChipInactive: { opacity: 0.5 },
  tipChipText: { color: '#F8FAFC', fontSize: 13, fontWeight: '600' },
  tipChipTextActive: { color: '#22c55e' },
  summarySection: { backgroundColor: '#1c2630', borderRadius: 12, padding: 16, marginBottom: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#64748b', fontSize: 14 },
  summaryValue: { color: '#F8FAFC', fontSize: 14 },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 8 },
  summaryTotalLabel: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  summaryTotal: { color: '#22c55e', fontSize: 18, fontWeight: '700' },
  submitBtn: { backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnDisabled: { backgroundColor: '#2a3a4a' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});