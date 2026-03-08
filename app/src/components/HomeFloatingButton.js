import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const navItems = [
  { label: 'Accueil', icon: 'home-variant' },
  { label: 'Portefeuille', icon: 'wallet' },
  { label: 'Assistant IA', icon: 'robot' },
  { label: 'Services', icon: 'view-grid' },
  { label: 'Profil', icon: 'account' },
];

export default function HomeFloatingButton({ activeTab, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      {open && (
        <View style={styles.menuContainer}>
          <View style={styles.menu}>
            {navItems.map((item) => {
              const isActive = activeTab === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuItem}
                  onPress={() => {
                    onSelect(item.label);
                    setOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={22}
                      color={isActive ? '#0E151B' : '#E6EDF3'}
                    />
                  </View>
                  <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => setOpen((prev) => !prev)}
      >
        <MaterialCommunityIcons
          name={open ? 'close' : 'home'}
          size={24}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: -26,
    top: '75%',
    alignItems: 'flex-end',
  },
  menuContainer: {
    marginRight: 26,
    marginBottom: 12,
  },
  menu: {
    flexDirection: 'row',
    backgroundColor: '#0E151B',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(43, 238, 121, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: '#2BEE79',
  },
  menuLabel: {
    color: '#E6EDF3',
    fontSize: 10,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#0E151B',
    fontWeight: '700',
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#DC2626',
  },
});
