import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const navItems = [
  { label: 'Accueil', icon: 'home-variant', key: 'home' },
  { label: 'Recharger', icon: 'cash-plus', key: 'recharge' },
  { label: 'Envoyer', icon: 'send', key: 'send' },
  { label: 'Recevoir', icon: 'qrcode-scan', key: 'receive' },
  { label: 'Historique', icon: 'history', key: 'history' },
];

export default function WalletBottomNav({ activeTab, onNavigate, walletMode }) {
  const handlePress = (key) => {
    if (onNavigate) {
      onNavigate(key, walletMode);
    }
  };

  return (
    <View style={styles.bottomNavWrapper}>
      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.navItem,
                pressed && styles.navItemPressed,
              ]}
              onPress={() => handlePress(item.key)}
            >
              <View
                style={[
                  styles.navIcon,
                  isActive && styles.navIconActive,
                  isActive && styles.navIconCenter,
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={isActive ? 20 : 16}
                  color={isActive ? '#0E151B' : '#CBD5F5'}
                />
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  bottomNav: {
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 4,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navItemPressed: {
    transform: [{ scale: 0.96 }],
  },
  navIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    backgroundColor: '#2BEE79',
  },
  navIconCenter: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#2BEE79',
    marginTop: -14,
  },
  navLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  navLabelActive: {
    color: '#2BEE79',
  },
});
