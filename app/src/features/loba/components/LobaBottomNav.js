import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const navItems = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'wallet', icon: 'account-balance-wallet', label: 'Wallet' },
  { id: 'create', icon: 'plus-circle', label: 'Create', primary: true },
  { id: 'loba', icon: 'play-circle', label: 'Loba' },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

export default function LobaBottomNav({ activeTab = 'loba', onNavigate }) {
  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        
        return (
          <Pressable
            key={item.id}
            style={styles.navItem}
            onPress={() => onNavigate && onNavigate(item.id)}
          >
            {item.primary ? (
              <View style={styles.createBtn}>
                <MaterialCommunityIcons name="plus" size={24} color="#fff" />
              </View>
            ) : (
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color={isActive ? '#fff' : '#94a3b8'}
              />
            )}
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    color: '#94a3b8',
    fontSize: 10,
  },
  navLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
});
