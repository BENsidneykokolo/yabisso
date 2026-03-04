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
import RechargeScreen from './src/features/wallet/screens/RechargeScreen';
import KiosqueQRScreen from './src/features/wallet/screens/KiosqueQRScreen';
import KiosquePinScreen from './src/features/wallet/screens/KiosquePinScreen';
import SendScreen from './src/features/wallet/screens/SendScreen';
import SendQRGenerateScreen from './src/features/wallet/screens/SendQRGenerateScreen';
import SendQRResultScreen from './src/features/wallet/screens/SendQRResultScreen';
import SendScanQRScreen from './src/features/wallet/screens/SendScanQRScreen';
import SendSelectBeneficiaryScreen from './src/features/wallet/screens/SendSelectBeneficiaryScreen';
import SendConfirmPaymentScreen from './src/features/wallet/screens/SendConfirmPaymentScreen';
import ReceiveScreen from './src/features/wallet/screens/ReceiveScreen';
import ReceiveScanQRScreen from './src/features/wallet/screens/ReceiveScanQRScreen';
import ReceiveNotificationsScreen from './src/features/wallet/screens/ReceiveNotificationsScreen';
import ReceiveRequestPaymentScreen from './src/features/wallet/screens/ReceiveRequestPaymentScreen';
import HistoryScreen from './src/features/wallet/screens/HistoryScreen';
import AssistantScreen from './src/features/ai/screens/AssistantScreen';
import ProfileScreen from './src/features/profile/screens/ProfileScreen';
import FloatingNav from './src/components/FloatingNav';
import AccountScreen from './src/features/profile/screens/AccountScreen';
import SecurityScreen from './src/features/profile/screens/SecurityScreen';
import NotificationsScreen from './src/features/profile/screens/NotificationsScreen';
import LanguageSettingsScreen from './src/features/profile/screens/LanguageSettingsScreen';
import SupportScreen from './src/features/profile/screens/SupportScreen';
import LogoutScreen from './src/features/profile/screens/LogoutScreen';
import EditProfileScreen from './src/features/profile/screens/EditProfileScreen';
import AddProductScreen from './src/features/marketplace/screens/AddProductScreen';
import SellerProfileScreen from './src/features/marketplace/screens/SellerProfileScreen';
import MarketplaceHomeScreen from './src/features/marketplace/screens/MarketplaceHomeScreen';
import ProductListScreen from './src/features/marketplace/screens/ProductListScreen';
import CategoryPageScreen from './src/features/marketplace/screens/CategoryPageScreen';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [activeTab, setActiveTab] = useState('Accueil');
  const [homeShowAllServices, setHomeShowAllServices] = useState(false);
  const [walletMode, setWalletMode] = useState('fcfa');
  const [walletActiveTab, setWalletActiveTab] = useState('home');

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
            setWalletActiveTab('home');
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
    content = <WalletScreen onBack={() => setScreen('home')} onOpenHome={() => { setWalletActiveTab('home'); setScreen('wallet'); }} onOpenRecharge={() => { setWalletActiveTab('recharge'); setScreen('wallet_recharge'); }} onOpenSend={() => { setWalletActiveTab('send'); setScreen('wallet_send'); }} onOpenReceive={() => { setWalletActiveTab('receive'); setScreen('wallet_receive'); }} onOpenHistory={() => { setWalletActiveTab('history'); setScreen('wallet_history'); }} walletMode={walletMode} setWalletMode={setWalletMode} activeTab={walletActiveTab} />;
  }
  if (screen === 'wallet_recharge') {
    content = <RechargeScreen onBack={() => setScreen('wallet')} onComplete={() => setScreen('wallet')} onOpenQRScan={() => setScreen('wallet_kiosque_qr')} onOpenPinEntry={() => setScreen('wallet_kiosque_pin')} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') setScreen('wallet');
      if (key === 'recharge') setScreen('wallet_recharge');
      if (key === 'send') setScreen('wallet_send');
      if (key === 'receive') setScreen('wallet_receive');
      if (key === 'history') setScreen('wallet_history');
    }} />;
  }
  if (screen === 'wallet_kiosque_qr') {
    content = <KiosqueQRScreen onBack={() => setScreen('wallet_recharge')} onComplete={() => { setWalletActiveTab('recharge'); setScreen('wallet'); }} />;
  }
  if (screen === 'wallet_kiosque_pin') {
    content = <KiosquePinScreen onBack={() => setScreen('wallet_recharge')} onComplete={() => { setWalletActiveTab('recharge'); setScreen('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send') {
    content = <SendScreen onBack={() => setScreen('wallet')} onOpenQRGenerate={() => setScreen('wallet_send_qr_generate')} onOpenSelectBeneficiary={() => setScreen('wallet_send_beneficiary')} onOpenScanQR={() => setScreen('wallet_send_scan')} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') setScreen('wallet');
      if (key === 'recharge') setScreen('wallet_recharge');
      if (key === 'send') setScreen('wallet_send');
      if (key === 'receive') setScreen('wallet_receive');
      if (key === 'history') setScreen('wallet_history');
    }} />;
  }
  if (screen === 'wallet_send_qr_generate') {
    content = <SendQRGenerateScreen onBack={() => setScreen('wallet_send')} onCreateQR={() => setScreen('wallet_send_qr_result')} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_qr_result') {
    content = <SendQRResultScreen onBack={() => setScreen('wallet_send_qr_generate')} onComplete={() => { setWalletActiveTab('send'); setScreen('wallet'); }} amount="5000" walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_beneficiary') {
    content = <SendSelectBeneficiaryScreen onBack={() => setScreen('wallet_send')} onSendMoney={() => { setWalletActiveTab('send'); setScreen('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_scan') {
    content = <SendScanQRScreen onBack={() => setScreen('wallet_send')} onConfirm={() => { setWalletActiveTab('send'); setScreen('wallet'); }} onShowPassword={(amount) => {
      setScreen('wallet_send_confirm');
    }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_confirm') {
    content = <SendConfirmPaymentScreen onBack={() => setScreen('wallet_send_scan')} onConfirm={() => { setWalletActiveTab('send'); setScreen('wallet'); }} amount="5000" recipientName="Jean Dupont" walletMode={walletMode} />;
  }
  if (screen === 'wallet_receive') {
    content = <ReceiveScreen onBack={() => setScreen('wallet')} onOpenScanQR={() => setScreen('wallet_receive_scan')} onOpenNotifications={() => setScreen('wallet_receive_notifications')} onOpenRequestPayment={() => setScreen('wallet_receive_request')} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') setScreen('wallet');
      if (key === 'recharge') setScreen('wallet_recharge');
      if (key === 'send') setScreen('wallet_send');
      if (key === 'receive') setScreen('wallet_receive');
      if (key === 'history') setScreen('wallet_history');
    }} />;
  }
  if (screen === 'wallet_receive_scan') {
    content = <ReceiveScanQRScreen onBack={() => setScreen('wallet_receive')} onComplete={() => { setWalletActiveTab('receive'); setScreen('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_receive_notifications') {
    content = <ReceiveNotificationsScreen onBack={() => setScreen('wallet_receive')} walletMode={walletMode} />;
  }
  if (screen === 'wallet_receive_request') {
    content = <ReceiveRequestPaymentScreen onBack={() => setScreen('wallet_receive')} onCreateQR={() => setScreen('wallet_send_qr_result')} onSendToContact={() => { setWalletActiveTab('receive'); setScreen('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_history') {
    content = <HistoryScreen onBack={() => setScreen('wallet')} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') setScreen('wallet');
      if (key === 'recharge') setScreen('wallet_recharge');
      if (key === 'send') setScreen('wallet_send');
      if (key === 'receive') setScreen('wallet_receive');
      if (key === 'history') setScreen('wallet_history');
    }} />;
  }
  if (screen === 'assistant') {
    content = <AssistantScreen onBack={() => setScreen('home')} onNavigate={(screenName) => {
      if (screenName === 'home') setScreen('home');
      if (screenName === 'wallet') { setWalletActiveTab('home'); setScreen('wallet'); }
      if (screenName === 'profile') setScreen('profile');
      if (screenName === 'services') { setHomeShowAllServices(true); setScreen('home'); }
      if (screenName === 'settings') setScreen('home_settings');
    }} />;
  }
  if (screen === 'profile') {
    content = (
      <ProfileScreen
        onBack={() => setScreen('home')}
        onOpenHome={() => setScreen('profile')}
        onOpenAccount={() => setScreen('profile_account')}
        onOpenSecurity={() => setScreen('profile_security')}
        onOpenNotifications={() => setScreen('profile_notifications')}
        onOpenLanguage={() => setScreen('profile_language')}
        onOpenSupport={() => setScreen('profile_support')}
        onOpenLogout={() => setScreen('profile_logout')}
        onOpenWallet={() => {
          setWalletActiveTab('home');
          setActiveTab('Portefeuille');
          setScreen('wallet');
        }}
      />
    );
  }
  if (screen === 'profile_account') {
    content = <AccountScreen onBack={() => setScreen('profile')} onOpenHome={() => setScreen('profile')} onOpenSecurity={() => setScreen('profile_security')} onOpenSupport={() => setScreen('profile_support')} onOpenLogout={() => setScreen('profile_logout')} />;
  }
  if (screen === 'profile_security') {
    content = <SecurityScreen onBack={() => setScreen('profile')} onOpenHome={() => setScreen('profile')} onOpenAccount={() => setScreen('profile_account')} onOpenSupport={() => setScreen('profile_support')} onOpenLogout={() => setScreen('profile_logout')} />;
  }
  if (screen === 'profile_notifications') {
    content = (
      <NotificationsScreen 
        onBack={() => setScreen('profile')} 
        onOpenHome={() => setScreen('profile')}
        onOpenAccount={() => setScreen('profile_account')}
        onOpenSecurity={() => setScreen('profile_security')}
        onOpenSupport={() => setScreen('profile_support')}
        onOpenNotifications={() => setScreen('profile_notifications')}
        onOpenLogout={() => setScreen('profile_logout')}
        onOpenEditProfile={() => setScreen('profile_edit')}
      />
    );
  }
  if (screen === 'profile_language') {
    content = <LanguageSettingsScreen onBack={() => setScreen('profile')} />;
  }
  if (screen === 'profile_support') {
    content = <SupportScreen onBack={() => setScreen('profile')} onOpenHome={() => setScreen('profile')} onOpenAccount={() => setScreen('profile_account')} onOpenSecurity={() => setScreen('profile_security')} onOpenLogout={() => setScreen('profile_logout')} />;
  }
  if (screen === 'profile_logout') {
    content = (
      <LogoutScreen
        onBack={() => setScreen('profile')}
        onConfirm={() => setScreen('welcome')}
      />
    );
  }
  if (screen === 'profile_edit') {
    content = (
      <EditProfileScreen
        onBack={() => setScreen('profile')}
        onOpenHome={() => setScreen('profile')}
        onOpenAccount={() => setScreen('profile_account')}
        onOpenSecurity={() => setScreen('profile_security')}
        onOpenSupport={() => setScreen('profile_support')}
        onOpenNotifications={() => setScreen('profile_notifications')}
        onOpenLogout={() => setScreen('profile_logout')}
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
          if (screenName === 'wallet') { setWalletActiveTab('home'); setScreen('wallet'); }
          else if (screenName === 'profile') setScreen('profile');
          else if (screenName === 'cart') setScreen('cart');
          else if (screenName === 'orders') setScreen('orders');
          else if (screenName === 'product_list') setScreen('marketplace_product_list');
          else if (screenName === 'category_page') setScreen('marketplace_category_page');
        }}
      />
    );
  }
  if (screen === 'marketplace_product_list') {
    content = (
      <ProductListScreen
        onBack={() => setScreen('marketplace_home')}
        onNavigate={(screenName) => {
          if (screenName === 'marketplace_home') setScreen('marketplace_home');
          if (screenName === 'category_page') setScreen('marketplace_category_page');
        }}
      />
    );
  }
  if (screen === 'marketplace_category_page') {
    content = (
      <CategoryPageScreen
        onBack={() => setScreen('marketplace_product_list')}
        onNavigate={(screenName) => {
          if (screenName === 'marketplace_home') setScreen('marketplace_home');
        }}
      />
    );
  }

  const showFloatingNav =
    screen === 'wallet' ||
    screen === 'wallet_recharge' ||
    screen === 'wallet_kiosque_qr' ||
    screen === 'wallet_kiosque_pin' ||
    screen === 'wallet_send' ||
    screen === 'wallet_send_qr_generate' ||
    screen === 'wallet_send_qr_result' ||
    screen === 'wallet_send_beneficiary' ||
    screen === 'wallet_send_scan' ||
    screen === 'wallet_send_confirm' ||
    screen === 'wallet_receive' ||
    screen === 'wallet_receive_scan' ||
    screen === 'wallet_receive_notifications' ||
    screen === 'wallet_receive_request' ||
    screen === 'wallet_history' ||
    screen === 'profile' ||
    screen === 'profile_account' ||
    screen === 'profile_security' ||
    screen === 'profile_notifications' ||
    screen === 'profile_language' ||
    screen === 'profile_support' ||
    screen === 'profile_logout' ||
    screen === 'marketplace_home' ||
    screen === 'marketplace_product_list' ||
    screen === 'marketplace_category_page' ||
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
                setWalletActiveTab('home');
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
