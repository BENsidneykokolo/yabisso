import React from 'react';
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const cards = [
  {
    id: 'all-in-one',
    title: 'Une seule app pour tout',
    description: 'Achetez, payez et mangez partout en Afrique, meme hors ligne.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuByfdMc6LN8fJk9RqqdqPUpXyzmxmo9ZoNclGSxvJjFhn0gTT7LuuWoDjZPY1PAG2Q0b-D3zZLVkswL16dE7OaVWFXdKry6fQ6GpniRmq6Z2CD4RehQjVz4YM4OC3TYjq_Doy5n43aW9uwGdNfXChGYBhpzASnCDdPCvt54XZQmLOwVuQrL-B9t1g-uaiQXf1cQxxPkOCV45okZBdrVsghHOEhlagVCvFmRHpV4Jl3SK3hfTv3Zpg50Uql2lq-vH3x7L6dzzK4b',
  },
  {
    id: 'wallet',
    title: 'Portefeuille offline-first',
    description: 'Accedez a vos fonds et faites des transactions partout.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBAPeSSkcmqfUVjtF-XkLb_V3CYRunZ_4bR05z54e_ruhMujMdUI2SsDcMIQpt9ruVePL-KVdms4FcmHPa0kDV1TZ4bLtd6UmaV8iyCfFyIMXI-_falB1vlNpd8yK6HN1-SqtyyR6p-Snk13uLC5CIeLeSvQJCFSC-lu6MjjcIgX4JxjqNz70EsL_2dH4_rpkkQzUFPUkTh_muiT5GfjWLjzdXibPUx-e5kWb5TxrujpeSKW7AU_v9FsL5SCBuYo8ONOzERLhtQ',
  },
  {
    id: 'payments',
    title: 'Paiements securises',
    description: 'Une securite de niveau bancaire pour vos donnees.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCd4G4a07HQEQPCFCW--ML9m15NT-7swvw67HVoas486a2YuwEGthbfpAjh0ZECbATHETSm-fA5ky4w0fIk0XQTdyQPnqcC8PngpsHHazqsQe2Jvgkl88m3BtN_LGb2mi88a1OwaBQ4yMX2D2d94GHukVmGG1YXixMAJTP2hufORxLSVQSpkIAY3mJ_isabCSJ8XUKwkl4UgCZPaw7oUqoOOYOp1maErf5CdcmcAHhfumU5wtXRsIWn8_97Y0T344CTHZ4YD3pb',
  },
];

export default function WelcomeScreen({ onGetStarted, onSignIn }) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.backgroundOrbGreen} />
      <View style={styles.backgroundOrbBlue} />
      <View style={styles.backgroundOrbYellow} />
      <View style={styles.backgroundOrbRed} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBadge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Pret hors ligne</Text>
        </View>

        <View style={styles.brandRow}>
          <View style={styles.brandBars}>
            <View style={[styles.brandBar, styles.brandBarGreen]} />
            <View style={[styles.brandBar, styles.brandBarYellow]} />
            <View style={[styles.brandBar, styles.brandBarRed]} />
          </View>
          <Text style={styles.brandName}>Yabisso</Text>
        </View>

        <Text style={styles.title}>
          La puissance dans <Text style={styles.titleHighlight}>votre poche</Text>
        </Text>
        <Text style={styles.subtitle}>
          Votre super-app offline-first pour le quotidien en Afrique.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardRow}
        >
          {cards.map((card) => (
            <View key={card.id} style={styles.cardWrap}>
              <ImageBackground
                source={{ uri: card.image }}
                style={styles.card}
                imageStyle={styles.cardImage}
              >
                <View style={styles.cardOverlay} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </View>
              </ImageBackground>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Pressable style={styles.primaryButton} onPress={onGetStarted}>
          <Text style={styles.primaryButtonText}>Commencer</Text>
        </Pressable>

        <Pressable onPress={onSignIn}>
          <Text style={styles.signInText}>
            Deja membre ? <Text style={styles.signInLink}>Se connecter</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E151B',
  },
  scrollContent: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  backgroundOrbGreen: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 220,
    height: 180,
    borderRadius: 110,
    backgroundColor: 'rgba(43, 238, 121, 0.15)',
  },
  backgroundOrbBlue: {
    position: 'absolute',
    top: 140,
    right: -60,
    width: 260,
    height: 220,
    borderRadius: 130,
    backgroundColor: 'rgba(73, 159, 255, 0.12)',
  },
  backgroundOrbYellow: {
    position: 'absolute',
    top: 320,
    left: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 214, 102, 0.12)',
  },
  backgroundOrbRed: {
    position: 'absolute',
    bottom: -40,
    left: 80,
    width: 260,
    height: 220,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 105, 97, 0.12)',
  },
  topBadge: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 37, 47, 0.9)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2BEE79',
    marginRight: 6,
  },
  badgeText: {
    color: '#E6EDF3',
    fontSize: 12,
    fontWeight: '600',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 16,
  },
  brandBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 12,
  },
  brandBar: {
    width: 8,
    height: 36,
    borderRadius: 6,
    marginRight: 4,
  },
  brandBarGreen: {
    backgroundColor: '#2BEE79',
  },
  brandBarYellow: {
    backgroundColor: '#FFD166',
  },
  brandBarRed: {
    backgroundColor: '#FF6B6B',
  },
  brandName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 36,
  },
  titleHighlight: {
    color: '#2BEE79',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: '#B6C2CF',
  },
  cardRow: {
    paddingVertical: 26,
  },
  cardWrap: {
    width: 240,
    marginRight: 16,
  },
  card: {
    height: 320,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardImage: {
    borderRadius: 22,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 18, 0.45)',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDescription: {
    color: '#D1DAE5',
    fontSize: 13,
    lineHeight: 18,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#2BEE79',
  },
  primaryButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryButtonText: {
    color: '#0E151B',
    fontSize: 16,
    fontWeight: '700',
  },
  signInText: {
    textAlign: 'center',
    color: '#8A97A6',
    fontSize: 13,
  },
  signInLink: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
});
