import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const navItems = [
  { label: 'Accueil', icon: 'home-variant' },
  { label: 'Portefeuille', icon: 'wallet' },
  { label: 'Assistant IA', icon: 'robot' },
  { label: 'Services', icon: 'view-grid' },
  { label: 'Profil', icon: 'account' },
];

export default function FloatingNav({ activeTab, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      {open && (
        <View style={styles.menu}>
          {navItems.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.menuItem,
                  isActive && styles.menuItemActive,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => {
                  onSelect(item.label);
                  setOpen(false);
                }}
              >
                <View style={styles.menuIcon}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={18}
                    color={isActive ? '#0E151B' : '#E6EDF3'}
                  />
                </View>
                <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
          open && styles.fabOpen,
        ]}
        onPress={() => setOpen((prev) => !prev)}
      >
        <MaterialCommunityIcons
          name={open ? 'close' : 'menu'}
          size={22}
          color="#0E151B"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    alignItems: 'flex-end',
  },
  menu: {
    marginBottom: 12,
    backgroundColor: 'rgba(22, 29, 37, 0.98)',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  menuItemActive: {
    backgroundColor: '#2BEE79',
  },
  menuItemPressed: {
    transform: [{ scale: 0.98 }],
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuLabel: {
    color: '#E6EDF3',
    fontSize: 12,
    fontWeight: '600',
  },
  menuLabelActive: {
    color: '#0E151B',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2BEE79',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  fabPressed: {
    transform: [{ scale: 0.98 }],
  },
  fabOpen: {
    backgroundColor: '#F5B84C',
  },
});
