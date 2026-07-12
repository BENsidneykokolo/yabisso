import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database } from './src/lib/db';
import SuperAdminLoginScreen from './src/features/admin/screens/SuperAdminLoginScreen';
import SuperAdminDashboardScreen from './src/features/admin/screens/SuperAdminDashboardScreen';
import SuperAdminUsersScreen from './src/features/admin/screens/SuperAdminUsersScreen';
import SuperAdminServicesScreen from './src/features/admin/screens/SuperAdminServicesScreen';
import SuperAdminContentModerationScreen from './src/features/admin/screens/SuperAdminContentModerationScreen';
import SuperAdminAnalyticsScreen from './src/features/admin/screens/SuperAdminAnalyticsScreen';
import SuperAdminSettingsScreen from './src/features/admin/screens/SuperAdminSettingsScreen';
import SuperAdminKiosksScreen from './src/features/admin/screens/SuperAdminKiosksScreen';
import SuperAdminNotificationsScreen from './src/features/admin/screens/SuperAdminNotificationsScreen';
import SuperAdminAIScreen from './src/features/admin/screens/SuperAdminAIScreen';
import { seedDatabase } from './src/lib/db/seed';

export default function App() {
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  const [screen, setScreen] = useState('super_admin_login');
  const [screenParams, setScreenParams] = useState({});

  const navigate = (screenName, params = {}) => {
    setScreen(screenName);
    setScreenParams(params);
  };

  const goBack = () => {
    setScreen('super_admin_login');
    setScreenParams({});
  };

  let content = null;

  if (screen === 'super_admin_login') {
    content = (
      <SuperAdminLoginScreen
        onBack={() => {}}
        onLoginSuccess={() => navigate('super_admin_dashboard')}
      />
    );
  }
  if (screen === 'super_admin_dashboard') {
    content = (
      <SuperAdminDashboardScreen
        onBack={() => goBack()}
        onNavigate={(s, p) => navigate(s, p)}
        onLogout={() => navigate('super_admin_login')}
      />
    );
  }
  if (screen === 'super_admin_users') {
    content = (
      <SuperAdminUsersScreen
        onBack={() => goBack()}
        onNavigate={(s, p) => navigate(s, p)}
      />
    );
  }
  if (screen === 'super_admin_services') {
    content = (
      <SuperAdminServicesScreen
        onBack={() => goBack()}
        onNavigate={(s, p) => navigate(s, p)}
      />
    );
  }
  if (screen === 'super_admin_content') {
    content = (
      <SuperAdminContentModerationScreen
        onBack={() => goBack()}
        onNavigate={(s, p) => navigate(s, p)}
      />
    );
  }
  if (screen === 'super_admin_analytics') {
    content = (
      <SuperAdminAnalyticsScreen
        onBack={() => goBack()}
        onNavigate={(s, p) => navigate(s, p)}
      />
    );
  }
  if (screen === 'super_admin_settings') {
    content = (
      <SuperAdminSettingsScreen
        onBack={() => goBack()}
        onNavigate={(s, p) => navigate(s, p)}
      />
    );
  }
  if (screen === 'super_admin_kiosks') {
    content = (
      <SuperAdminKiosksScreen
        onBack={() => goBack()}
        onNavigate={(s, p) => navigate(s, p)}
        onOpenKioskAdmin={() => {}}
      />
    );
  }
  if (screen === 'super_admin_notifications') {
    content = (
      <SuperAdminNotificationsScreen
        onBack={() => goBack()}
        onNavigate={(s, p) => navigate(s, p)}
      />
    );
  }
  if (screen === 'super_admin_ai') {
    content = (
      <SuperAdminAIScreen
        onBack={() => goBack()}
        onNavigate={(s, p) => navigate(s, p)}
      />
    );
  }

  return (
    <DatabaseProvider database={database}>
      <View style={{ flex: 1 }}>
        {content}
        <StatusBar style="light" />
      </View>
    </DatabaseProvider>
  );
}
