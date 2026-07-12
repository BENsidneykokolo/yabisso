import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database } from './src/lib/db';
import KioskAdminLoginScreen from './src/features/kiosk/screens/KioskAdminLoginScreen';
import KioskAdminDashboardScreen from './src/features/kiosk/screens/KioskAdminDashboardScreen';
import KioskDashboardScreen from './src/features/kiosk/screens/KioskDashboardScreen';
import KioskRechargeScreen from './src/features/kiosk/screens/KioskRechargeScreen';
import KioskPointsScreen from './src/features/kiosk/screens/KioskPointsScreen';
import KioskAssistanceScreen from './src/features/kiosk/screens/KioskAssistanceScreen';
import KioskUsersScreen from './src/features/kiosk/screens/KioskUsersScreen';
import KioskStatsScreen from './src/features/kiosk/screens/KioskStatsScreen';
import KioskQRScreen from './src/features/kiosk/screens/KioskQRScreen';
import KioskValidationScreen from './src/features/kiosk/screens/KioskValidationScreen';
import ProductValidationKioskScreen from './src/features/kiosk/screens/ProductValidationKioskScreen';
import ProductValidationScreen from './src/features/kiosk/screens/ProductValidationScreen';
import BleKioskScreen from './src/features/bluetooth/screens/BleKioskScreen';
import { seedDatabase } from './src/lib/db/seed';

export default function App() {
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  const [screen, setScreen] = useState('kiosk_admin_login');
  const [screenParams, setScreenParams] = useState({});

  const navigate = (screenName, params = {}) => {
    setScreen(screenName);
    setScreenParams(params);
  };

  const goBack = () => {
    setScreen('kiosk_admin_login');
    setScreenParams({});
  };

  const replace = (screenName) => {
    setScreen(screenName);
    setScreenParams({});
  };

  let content = null;

  if (screen === 'kiosk_admin_login') {
    content = (
      <KioskAdminLoginScreen
        navigation={{ navigate, goBack, replace }}
      />
    );
  }
  if (screen === 'kiosk_admin_dashboard') {
    content = (
      <KioskAdminDashboardScreen
        navigation={{ navigate, goBack }}
      />
    );
  }
  if (screen === 'kiosk_dashboard') {
    content = (
      <KioskDashboardScreen
        navigation={{ navigate, goBack, replace }}
      />
    );
  }
  if (screen === 'kiosk_recharge') {
    content = (
      <KioskRechargeScreen
        navigation={{ navigate, goBack }}
      />
    );
  }
  if (screen === 'kiosk_points') {
    content = (
      <KioskPointsScreen
        navigation={{ navigate, goBack }}
      />
    );
  }
  if (screen === 'kiosk_assistance') {
    content = (
      <KioskAssistanceScreen
        navigation={{ navigate, goBack }}
      />
    );
  }
  if (screen === 'kiosk_users') {
    content = (
      <KioskUsersScreen
        navigation={{ navigate, goBack }}
      />
    );
  }
  if (screen === 'kiosk_stats') {
    content = (
      <KioskStatsScreen
        navigation={{ navigate, goBack }}
      />
    );
  }
  if (screen === 'kiosk_qr') {
    const qrParams = screenParams?.qrType || 'validation';
    content = (
      <KioskQRScreen
        navigation={{ navigate, goBack }}
        route={{ params: { type: qrParams } }}
      />
    );
  }
  if (screen === 'kiosk_validation') {
    content = (
      <KioskValidationScreen
        navigation={{ navigate, goBack }}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'kiosk_product_validation') {
    content = (
      <ProductValidationKioskScreen
        navigation={{ navigate, goBack }}
      />
    );
  }
  if (screen === 'kiosk_product_validation_manual') {
    content = (
      <ProductValidationScreen
        navigation={{ navigate, goBack }}
      />
    );
  }
  if (screen === 'kiosk_ble') {
    content = (
      <BleKioskScreen
        navigation={{ navigate, goBack }}
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
