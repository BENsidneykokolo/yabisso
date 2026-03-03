import React, { useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

const SUPER_ADMIN_SMS = 'CHANGE_ME';

export default function SmsSignupScreen({ onBack, onOk }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const pinDigits = pin.slice(0, 6).split('');

  const sendSmsDirect = (to, body) =>
    new Promise((resolve, reject) => {
      SmsAndroid.sms(to, body, 'sendDirect', (err, message) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(message);
      });
    });

  const handleSendSms = async () => {
    setError('');
    setStatus('');

    const cleanedPhone = phone.replace(/[^\d+]/g, '').trim();
    if (!cleanedPhone) {
      setError('Entrez un numero valide.');
      return;
    }

    if (SUPER_ADMIN_SMS === 'CHANGE_ME') {
      setError('Numero admin SMS non configure.');
      return;
    }

    if (Platform.OS !== 'android') {
      setError('Disponible uniquement sur Android.');
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: 'Permission SMS',
          message: 'Yabisso a besoin d\'envoyer un SMS pour activer votre compte.',
          buttonPositive: 'OK',
          buttonNegative: 'Annuler',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setError('Permission SMS requise.');
        return;
      }

      setStatus('Envoi en cours...');
      const payload = `YABISSO_SIGNUP|${cleanedPhone}|${Date.now()}`;
      await sendSmsDirect(SUPER_ADMIN_SMS, payload);
      setStatus('SMS envoye. En attente du code PIN.');
    } catch (err) {
      setStatus('');
      setError('Inscription echouee, rechargez vos credits SMS.');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'<'} Retour</Text>
        </Pressable>
        <Text style={styles.topTitle}>Inscription via SMS</Text>
        <View style={{ width: 64 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Inscription hors ligne</Text>
        <Text style={styles.subtitle}>
          Entrez votre numero. Nous envoyons un SMS chiffre pour activer votre
          compte.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Numero de telephone</Text>
          <TextInput
            placeholder="+243 000 000 000"
            placeholderTextColor="#8A97A6"
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={handleSendSms}
        >
          <Text style={styles.primaryButtonText}>Envoyer le SMS</Text>
        </Pressable>

        {!!status && <Text style={styles.statusText}>{status}</Text>}
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.pinSection}>
          <Text style={styles.pinTitle}>Code PIN</Text>
          <Text style={styles.pinSubtitle}>
            Saisissez le code recu par SMS.
          </Text>
          <View style={styles.pinRow}>
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <View key={item} style={styles.pinBox}>
                <Text style={styles.pinDigit}>{pinDigits[item] || ''}</Text>
              </View>
            ))}
          </View>
          <TextInput
            placeholder="Code PIN"
            placeholderTextColor="#8A97A6"
            style={styles.pinInput}
            keyboardType="number-pad"
            value={pin}
            onChangeText={setPin}
            maxLength={6}
          />
          <Pressable style={styles.primaryButton} onPress={onOk}>
            <Text style={styles.primaryButtonText}>OK</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.pinLink}>Renvoyer le code</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    color: '#E6EDF3',
    fontSize: 14,
  },
  topTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9FB0C3',
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  field: {
    marginTop: 20,
  },
  label: {
    color: '#E6EDF3',
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(24, 32, 40, 0.9)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  primaryButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 15,
    fontWeight: '700',
  },
  statusText: {
    color: '#2BEE79',
    fontSize: 12,
    marginTop: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 10,
  },
  pinSection: {
    marginTop: 28,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 32, 40, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  pinTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  pinSubtitle: {
    color: '#9FB0C3',
    fontSize: 12,
    marginTop: 6,
    marginBottom: 14,
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pinBox: {
    width: 42,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 21, 27, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigit: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  pinInput: {
    marginBottom: 12,
    backgroundColor: 'rgba(14, 21, 27, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pinLink: {
    color: '#2BEE79',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
