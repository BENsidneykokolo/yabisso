import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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

const routeInfo = {
  from: { city: 'Abidjan', country: 'Cote d\'Ivoire', code: 'ABJ' },
  to: { city: 'Casablanca', country: 'Maroc', code: 'CMN' },
  distance: '4 230 km',
  duration: '5h 45min',
};

export default function FlightsMapScreen({ onBack, onNavigate }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carte du vol</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color={COLORS.skyBlue} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.graticule} />
          <View style={styles.graticule} />
          <View style={styles.graticule} />
          <View style={styles.graticule} />

          <View style={styles.departureMarker}>
            <View style={styles.markerDot} />
            <View style={styles.markerPulse} />
            <View style={styles.markerLabel}>
              <Text style={styles.markerCode}>{routeInfo.from.code}</Text>
              <Text style={styles.markerCity}>{routeInfo.from.city}</Text>
            </View>
          </View>

          <View style={styles.arrivalMarker}>
            <View style={[styles.markerDot, { backgroundColor: COLORS.green }]} />
            <View style={[styles.markerPulse, { backgroundColor: COLORS.green + '30' }]} />
            <View style={[styles.markerLabel, { alignItems: 'flex-end' }]}>
              <Text style={styles.markerCode}>{routeInfo.to.code}</Text>
              <Text style={styles.markerCity}>{routeInfo.to.city}</Text>
            </View>
          </View>

          <View style={styles.flightPath}>
            <View style={styles.pathDots}>
              {[...Array(20)].map((_, i) => (
                <View key={i} style={[styles.pathDot, { opacity: 0.3 + (i * 0.03) }]} />
              ))}
            </View>
            <MaterialCommunityIcons name="airplane" size={24} color={COLORS.skyBlue} style={styles.planeIcon} />
          </View>
        </View>

        <View style={styles.compass}>
          <MaterialCommunityIcons name="compass" size={32} color={COLORS.lightGray} />
        </View>

        <TouchableOpacity style={styles.mapControls}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.mapControls, { bottom: 120 }]}>
          <Ionicons name="remove" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoPanel}>
        <View style={styles.routeInfoRow}>
          <View style={styles.cityInfo}>
            <View style={[styles.cityCodeBox, { backgroundColor: COLORS.skyBlue + '20' }]}>
              <Text style={styles.cityCodeText}>{routeInfo.from.code}</Text>
            </View>
            <View>
              <Text style={styles.cityName}>{routeInfo.from.city}</Text>
              <Text style={styles.countryName}>{routeInfo.from.country}</Text>
            </View>
          </View>

          <View style={styles.routeStats}>
            <Text style={styles.distanceText}>{routeInfo.distance}</Text>
            <View style={styles.routeLine}>
              <View style={styles.routeDots} />
              <MaterialCommunityIcons name="airplane" size={16} color={COLORS.skyBlue} />
              <View style={styles.routeDots} />
            </View>
            <Text style={styles.durationText}>{routeInfo.duration}</Text>
          </View>

          <View style={styles.cityInfo}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cityName}>{routeInfo.to.city}</Text>
              <Text style={styles.countryName}>{routeInfo.to.country}</Text>
            </View>
            <View style={[styles.cityCodeBox, { backgroundColor: COLORS.green + '20' }]}>
              <Text style={[styles.cityCodeText, { color: COLORS.green }]}>{routeInfo.to.code}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="airplane" size={20} color={COLORS.skyBlue} />
            <View>
              <Text style={styles.detailLabel}>Compagnie</Text>
              <Text style={styles.detailValue}>Royal Air Maroc</Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.skyBlue} />
            <View>
              <Text style={styles.detailLabel}>Heure depart</Text>
              <Text style={styles.detailValue}>22:45</Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock" size={20} color={COLORS.skyBlue} />
            <View>
              <Text style={styles.detailLabel}>Heure arrivee</Text>
              <Text style={styles.detailValue}>05:30 +1j</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  shareBtn: { padding: 4 },
  mapContainer: { flex: 1, position: 'relative' },
  mapPlaceholder: { flex: 1, backgroundColor: '#0A1628', position: 'relative', overflow: 'hidden' },
  graticule: { position: 'absolute', height: 1, width: '100%', backgroundColor: '#1A2A40', top: '25%' },
  departureMarker: { position: 'absolute', left: 40, top: '35%', alignItems: 'center' },
  arrivalMarker: { position: 'absolute', right: 60, top: '60%', alignItems: 'center' },
  markerDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.skyBlue, zIndex: 2 },
  markerPulse: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.skyBlue + '30', zIndex: 1 },
  markerLabel: { position: 'absolute', top: 24, width: 60 },
  markerCode: { fontSize: 14, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  markerCity: { fontSize: 10, color: COLORS.lightGray, textAlign: 'center' },
  flightPath: { position: 'absolute', left: '12%', right: '18%', top: '46%', alignItems: 'center' },
  pathDots: { flexDirection: 'row', width: '100%', justifyContent: 'center' },
  pathDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.skyBlue, marginHorizontal: 12 },
  planeIcon: { transform: [{ rotate: '20deg' }], marginTop: 8 },
  compass: { position: 'absolute', right: 16, top: 16 },
  mapControls: { position: 'absolute', right: 16, bottom: 180, width: 40, height: 40, borderRadius: 8, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  infoPanel: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingTop: 24 },
  routeInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cityInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cityCodeBox: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cityCodeText: { fontSize: 14, fontWeight: '700', color: COLORS.skyBlue },
  cityName: { fontSize: 14, color: COLORS.white, fontWeight: '600' },
  countryName: { fontSize: 11, color: COLORS.gray },
  routeStats: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  distanceText: { fontSize: 11, color: COLORS.gray, marginBottom: 4 },
  routeLine: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  routeDots: { flex: 1, height: 1, backgroundColor: COLORS.border },
  durationText: { fontSize: 11, color: COLORS.gray, marginTop: 4 },
  detailsCard: { backgroundColor: COLORS.inputBg, borderRadius: 14, padding: 14, flexDirection: 'row' },
  detailItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 8 },
  detailLabel: { fontSize: 10, color: COLORS.gray },
  detailValue: { fontSize: 12, color: COLORS.white, fontWeight: '600' },
});