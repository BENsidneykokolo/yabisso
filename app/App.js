import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database } from './src/lib/db';
import WelcomeScreen from './src/features/onboarding/screens/WelcomeScreen';
import LanguageScreen from './src/features/onboarding/screens/LanguageScreen';
import SignupScreen from './src/features/auth/screens/SignupScreen';
import SmsSignupScreen from './src/features/auth/screens/SmsSignupScreen';
import QrSignupScreen from './src/features/auth/screens/QrSignupScreen';
import PinSignupScreen from './src/features/auth/screens/PinSignupScreen';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import HomeScreen from './src/features/home/screens/HomeScreen';
import QrHubScreen from './src/features/home/screens/QrHubScreen';
import HomeSettingsScreen from './src/features/home/screens/HomeSettingsScreen';
import HomeNotificationsScreen from './src/features/home/screens/HomeNotificationsScreen';
import WalletScreen from './src/features/wallet/screens/WalletScreen';
import AssistantScreen from './src/features/ai/screens/AssistantScreen';
import ProfileScreen from './src/features/profile/screens/ProfileScreen';
import FloatingNav from './src/components/FloatingNav';
import AccountScreen from './src/features/profile/screens/AccountScreen';
import SecurityScreen from './src/features/profile/screens/SecurityScreen';
import NotificationsScreen from './src/features/profile/screens/NotificationsScreen';
import LanguageSettingsScreen from './src/features/profile/screens/LanguageSettingsScreen';
import SupportScreen from './src/features/profile/screens/SupportScreen';
import LogoutScreen from './src/features/profile/screens/LogoutScreen';
import AddProductScreen from './src/features/marketplace/screens/AddProductScreen';
import SellerProfileScreen from './src/features/marketplace/screens/SellerProfileScreen';
import MarketplaceHomeScreen from './src/features/marketplace/screens/MarketplaceHomeScreen';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [activeTab, setActiveTab] = useState('Accueil');
  const [homeShowAllServices, setHomeShowAllServices] = useState(false);

  let content = null;
  if (screen === 'welcome') {
    content = (
      <WelcomeScreen
        onGetStarted={() => setScreen('language')}
        onSignIn={() => setScreen('login')}
      />
    );
  }
  if (screen === 'language') {
    content = (
      <LanguageScreen
        onBack={() => setScreen('welcome')}
        onContinue={() => setScreen('signup')}
      />
    );
  }
  if (screen === 'signup') {
    content = (
      <SignupScreen
        onBack={() => setScreen('language')}
        onPin={() => setScreen('signup_pin')}
        onOfflineSms={() => setScreen('signup_sms')}
        onOfflineQr={() => setScreen('signup_qr')}
      />
    );
  }
  if (screen === 'login') {
    content = (
      <LoginScreen
        onBack={() => setScreen('welcome')}
        onLogin={() => setScreen('home')}
        onCreateAccount={() => setScreen('signup')}
      />
    );
  }
  if (screen === 'signup_pin') {
    content = (
      <PinSignupScreen
        onBack={() => setScreen('signup')}
        onOk={() => setScreen('home')}
      />
    );
  }
  if (screen === 'signup_sms') {
    content = (
      <SmsSignupScreen
        onBack={() => setScreen('signup')}
        onOk={() => setScreen('home')}
      />
    );
  }
  if (screen === 'signup_qr') {
    content = (
      <QrSignupScreen
        onBack={() => setScreen('signup')}
        onOk={() => setScreen('home')}
      />
    );
  }
  if (screen === 'home') {
    content = (
        <HomeScreen
          onSignOut={() => setScreen('signup')}
          onOpenWallet={() => {
            setActiveTab('Portefeuille');
            setScreen('wallet');
          }}
          onOpenAssistant={() => {
            setActiveTab('Assistant IA');
            setScreen('assistant');
          }}
          onOpenProfile={() => {
            setActiveTab('Profil');
            setScreen('profile');
          }}
          onOpenMarket={() => setScreen('marketplace_home')}
          onOpenQr={() => setScreen('home_qr')}
          onOpenSettings={() => setScreen('home_settings')}
          onOpenNotifications={() => setScreen('home_notifications')}
          showAllServicesOverride={homeShowAllServices}
        />
      );
  }
  if (screen === 'home_qr') {
    content = <QrHubScreen onBack={() => setScreen('home')} />;
  }
  if (screen === 'home_settings') {
    content = <HomeSettingsScreen onBack={() => setScreen('home')} />;
  }
  if (screen === 'home_notifications') {
    content = <HomeNotificationsScreen onBack={() => setScreen('home')} />;
  }
  if (screen === 'wallet') {
    content = <WalletScreen onBack={() => setScreen('home')} />;
  }
  if (screen === 'assistant') {
    content = <AssistantScreen onBack={() => setScreen('home')} />;
  }
  if (screen === 'profile') {
    content = (
      <ProfileScreen
        onBack={() => setScreen('home')}
        onOpenAccount={() => setScreen('profile_account')}
        onOpenSecurity={() => setScreen('profile_security')}
        onOpenNotifications={() => setScreen('profile_notifications')}
        onOpenLanguage={() => setScreen('profile_language')}
        onOpenSupport={() => setScreen('profile_support')}
        onOpenLogout={() => setScreen('profile_logout')}
        onOpenWallet={() => {
          setActiveTab('Portefeuille');
          setScreen('wallet');
        }}
      />
    );
  }
  if (screen === 'profile_account') {
    content = <AccountScreen onBack={() => setScreen('profile')} />;
  }
  if (screen === 'profile_security') {
    content = <SecurityScreen onBack={() => setScreen('profile')} />;
  }
  if (screen === 'profile_notifications') {
    content = <NotificationsScreen onBack={() => setScreen('profile')} />;
  }
  if (screen === 'profile_language') {
    content = <LanguageSettingsScreen onBack={() => setScreen('profile')} />;
  }
  if (screen === 'profile_support') {
    content = <SupportScreen onBack={() => setScreen('profile')} />;
  }
  if (screen === 'profile_logout') {
    content = (
      <LogoutScreen
        onBack={() => setScreen('profile')}
        onConfirm={() => setScreen('welcome')}
      />
    );
  }
  if (screen === 'market_seller') {
    content = (
      <SellerProfileScreen
        onBack={() => setScreen('home')}
        onOpenAddProduct={() => setScreen('market_add_product')}
      />
    );
  }
  if (screen === 'market_add_product') {
    content = (
      <AddProductScreen
        onBack={() => setScreen('market_seller')}
        onOpenSellerProfile={() => setScreen('market_seller')}
      />
    );
  }
  if (screen === 'marketplace_home') {
    content = (
      <MarketplaceHomeScreen
        onBack={() => setScreen('home')}
        onNavigate={(screenName) => {
          if (screenName === 'wallet') setScreen('wallet');
          else if (screenName === 'profile') setScreen('profile');
          else if (screenName === 'cart') setScreen('cart');
          else if (screenName === 'orders') setScreen('orders');
        }}
      />
    );
  }

  const showFloatingNav =
    screen === 'wallet' ||
    screen === 'assistant' ||
    screen === 'profile' ||
    screen === 'profile_account' ||
    screen === 'profile_security' ||
    screen === 'profile_notifications' ||
    screen === 'profile_language' ||
    screen === 'profile_support' ||
    screen === 'profile_logout' ||
    screen === 'marketplace_home' ||
    screen === 'market_seller' ||
    screen === 'market_add_product';

  return (
    <DatabaseProvider database={database}>
      <View style={{ flex: 1 }}>
        {content}
        {showFloatingNav && (
          <FloatingNav
            activeTab={activeTab}
            onSelect={(label) => {
              setActiveTab(label);
              if (label === 'Accueil') {
                setHomeShowAllServices(false);
                setScreen('home');
                return;
              }
              if (label === 'Services') {
                setHomeShowAllServices(true);
                setScreen('home');
                return;
              }
              if (label === 'Portefeuille') {
                setScreen('wallet');
                return;
              }
              if (label === 'Assistant IA') {
                setScreen('assistant');
                return;
              }
              if (label === 'Profil') {
                setScreen('profile');
              }
            }}
          />
        )}
        <StatusBar style="light" />
      </View>
    </DatabaseProvider>
  );
}
