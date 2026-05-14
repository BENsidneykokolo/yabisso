import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TaxiCompleteScreen({ onNavigate }) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    setTimeout(() => onNavigate?.('taxi_rating'), 2000);
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="check-circle" size={100} color="#22c55e" />
        </View>
        <Text style={styles.title}>Vous etes arrive !</Text>
        <Text style={styles.subtitle}>Course terminee avec succes</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E151B' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { marginBottom: 24 },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#64748b', fontSize: 16 },
});