import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@yabisso_theme';

const lightTheme = {
  primary: '#0E151B',
  secondary: '#151D26',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0E151B',
  textSecondary: '#64748B',
  border: 'rgba(0, 0, 0, 0.1)',
  accent: '#3B82F6',
};

const darkTheme = {
  primary: '#0E151B',
  secondary: '#151D26',
  background: '#0E151B',
  surface: '#1C2733',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: 'rgba(255, 255, 255, 0.08)',
  accent: '#3B82F6',
};

const ThemeContext = createContext({
  isDark: true,
  theme: darkTheme,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export { lightTheme, darkTheme };