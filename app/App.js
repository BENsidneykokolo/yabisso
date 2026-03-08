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
import HomeFloatingButton from './src/components/HomeFloatingButton';
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
import NewArrivalsScreen from './src/features/marketplace/screens/NewArrivalsScreen';
import ProductDetailsScreen from './src/features/marketplace/screens/ProductDetailsScreen';
import CartScreen from './src/features/marketplace/screens/CartScreen';
import CheckoutScreen from './src/features/marketplace/screens/CheckoutScreen';
import OrderStatusScreen from './src/features/marketplace/screens/OrderStatusScreen';
import DeliveryTrackingScreen from './src/features/marketplace/screens/DeliveryTrackingScreen';
import SellerComparisonScreen from './src/features/marketplace/screens/SellerComparisonScreen';
import BlockedUserScreen from './src/features/marketplace/screens/BlockedUserScreen';
import OrdersScreen from './src/features/marketplace/screens/OrdersScreen';
import LobaHomeScreen from './src/features/loba/screens/LobaHomeScreen';
import LobaFeedScreen from './src/features/loba/screens/LobaFeedScreen';
import LobaProfileScreen from './src/features/loba/screens/LobaProfileScreen';
import LobaStoriesScreen from './src/features/loba/screens/LobaStoriesScreen';
import LobaRecordScreen from './src/features/loba/screens/LobaRecordScreen';
import RestaurantHomeScreen from './src/features/restaurant/screens/RestaurantHomeScreen';
import RestaurantDetailsScreen from './src/features/restaurant/screens/RestaurantDetailsScreen';
import FoodItemDetailsScreen from './src/features/restaurant/screens/FoodItemDetailsScreen';
import FoodCheckoutScreen from './src/features/restaurant/screens/FoodCheckoutScreen';
import HotelHomeScreen from './src/features/hotel/screens/HotelHomeScreen';
import ServicesHomeScreen from './src/features/services/screens/ServicesHomeScreen';
import RealEstateHomeScreen from './src/features/real_estate/screens/RealEstateHomeScreen';
import MarketplaceNotificationsScreen from './src/features/marketplace/screens/MarketplaceNotificationsScreen';
import MarketplaceFavoritesScreen from './src/features/marketplace/screens/MarketplaceFavoritesScreen';
import MarketplaceHistoryScreen from './src/features/marketplace/screens/MarketplaceHistoryScreen';
import MarketplaceSettingsScreen from './src/features/marketplace/screens/MarketplaceSettingsScreen';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [activeTab, setActiveTab] = useState('Accueil');
  const [homeShowAllServices, setHomeShowAllServices] = useState(false);
  const [walletMode, setWalletMode] = useState('fcfa');
  const [walletActiveTab, setWalletActiveTab] = useState('home');
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

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
        onOpenLoba={() => setScreen('loba_home')}
        onOpenOrders={() => setScreen('orders')}
        onOpenRestaurant={() => setScreen('restaurant_home')}
        onOpenHotel={() => setScreen('hotel_home')}
        onOpenServices={() => setScreen('services_home')}
        onOpenRealEstate={() => setScreen('real_estate_home')}
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
        onOpenBlockedUser={() => setScreen('blocked_user')}
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
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={(screenName) => {
          if (screenName === 'wallet') { setWalletActiveTab('home'); setScreen('wallet'); }
          else if (screenName === 'profile') setScreen('profile');
          else if (screenName === 'cart') setScreen('cart');
          else if (screenName === 'orders') setScreen('orders');
          else if (screenName === 'order_status') setScreen('order_status');
          else if (screenName === 'product_list') setScreen('marketplace_product_list');
          else if (screenName === 'category_page' || screenName === 'marketplace_category_page') setScreen('marketplace_category_page');
          else if (screenName === 'product_details') setScreen('marketplace_product_details');
          else if (screenName === 'new_arrivals') setScreen('new_arrivals');
          else if (screenName === 'marketplace_notifications') setScreen('marketplace_notifications');
          else if (screenName === 'marketplace_favorites') setScreen('marketplace_favorites');
          else if (screenName === 'marketplace_history') setScreen('marketplace_history');
          else if (screenName === 'marketplace_settings') setScreen('marketplace_settings');
        }}
      />
    );
  }
  if (screen === 'marketplace_product_list') {
    content = (
      <ProductListScreen
        onBack={() => setScreen('marketplace_home')}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={(screenName) => {
          if (screenName === 'marketplace_home') setScreen('marketplace_home');
          if (screenName === 'category_page' || screenName === 'marketplace_category_page') setScreen('marketplace_category_page');
          if (screenName === 'marketplace_product_details') setScreen('marketplace_product_details');
          if (screenName === 'seller_comparison') setScreen('seller_comparison');
          if (screenName === 'cart') setScreen('cart');
          if (screenName === 'orders') setScreen('orders');
          if (screenName === 'new_arrivals') setScreen('new_arrivals');
        }}
      />
    );
  }
  if (screen === 'marketplace_category_page') {
    content = (
      <CategoryPageScreen
        onBack={() => setScreen('marketplace_product_list')}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={(screenName) => {
          if (screenName === 'marketplace_home') setScreen('marketplace_home');
          if (screenName === 'new_arrivals') setScreen('new_arrivals');
          if (screenName === 'product_list') setScreen('marketplace_product_list');
          if (screenName === 'cart') setScreen('cart');
          if (screenName === 'orders') setScreen('orders');
        }}
      />
    );
  }
  if (screen === 'new_arrivals') {
    content = (
      <NewArrivalsScreen
        onBack={() => setScreen('marketplace_home')}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={(screenName) => {
          if (screenName === 'marketplace_home') setScreen('marketplace_home');
          if (screenName === 'category_page' || screenName === 'marketplace_category_page') setScreen('marketplace_category_page');
          if (screenName === 'cart') setScreen('cart');
          if (screenName === 'orders') setScreen('orders');
          if (screenName === 'product_list') setScreen('marketplace_product_list');
        }}
      />
    );
  }
  if (screen === 'marketplace_product_details') {
    content = (
      <ProductDetailsScreen
        onBack={() => setScreen('marketplace_product_list')}
        onNavigate={(action, data) => {
          if (action === 'cart') setScreen('cart');
          if (action === 'seller_comparison') setScreen('seller_comparison');
        }}
      />
    );
  }
  if (screen === 'cart') {
    content = (
      <CartScreen
        onBack={() => setScreen('marketplace_home')}
        onNavigate={(screenName) => {
          if (screenName === 'checkout') setScreen('checkout');
          if (screenName === 'marketplace_home') setScreen('marketplace_home');
          if (screenName === 'category_page' || screenName === 'marketplace_category_page') setScreen('marketplace_category_page');
          if (screenName === 'new_arrivals') setScreen('new_arrivals');
          if (screenName === 'orders') setScreen('orders');
        }}
      />
    );
  }
  if (screen === 'checkout') {
    content = (
      <CheckoutScreen
        onBack={() => setScreen('cart')}
        onNavigate={(screenName) => {
          if (screenName === 'home') setScreen('home');
          if (screenName === 'order_status') setScreen('order_status');
        }}
      />
    );
  }
  if (screen === 'order_status') {
    content = (
      <OrderStatusScreen
        onBack={() => setScreen('orders')}
        onNavigate={(screenName) => {
          if (screenName === 'delivery_tracking') setScreen('delivery_tracking');
        }}
      />
    );
  }
  if (screen === 'orders') {
    content = (
      <OrdersScreen
        onBack={() => setScreen('marketplace_home')}
        onNavigate={(screenName, params) => {
          if (screenName === 'order_status') setScreen('order_status');
          if (screenName === 'delivery_tracking') setScreen('delivery_tracking');
          if (screenName === 'marketplace_home') setScreen('marketplace_home');
          if (screenName === 'category_page' || screenName === 'marketplace_category_page') setScreen('marketplace_category_page');
          if (screenName === 'cart') setScreen('cart');
          if (screenName === 'new_arrivals') setScreen('new_arrivals');
        }}
      />
    );
  }
  if (screen === 'delivery_tracking') {
    content = (
      <DeliveryTrackingScreen
        onBack={() => setScreen('order_status')}
      />
    );
  }
  if (screen === 'seller_comparison') {
    content = (
      <SellerComparisonScreen
        onBack={() => setScreen('marketplace_product_details')}
        onNavigate={(action, data) => {
          if (action === 'select_seller') {
            setScreen('marketplace_product_details');
          }
        }}
      />
    );
  }
  if (screen === 'blocked_user') {
    content = (
      <BlockedUserScreen
        onBack={() => setScreen('home')}
        onNavigate={(screenName) => {
          if (screenName === 'home') setScreen('home');
        }}
      />
    );
  }
  if (screen === 'loba_home') {
    content = (
      <LobaHomeScreen
        onBack={() => setScreen('home')}
        onNavigate={(screenName) => {
          if (screenName === 'feed') setScreen('loba_feed');
          if (screenName === 'profile') setScreen('loba_profile');
        }}
      />
    );
  }
  if (screen === 'loba_feed') {
    content = (
      <LobaFeedScreen
        onBack={() => setScreen('loba_home')}
        onNavigate={(screenName) => {
          if (screenName === 'home') setScreen('loba_home');
          if (screenName === 'profile') setScreen('loba_profile');
        }}
      />
    );
  }
  if (screen === 'loba_profile') {
    content = (
      <LobaProfileScreen
        onBack={() => setScreen('loba_home')}
        onNavigate={(screenName) => {
          if (screenName === 'home') setScreen('loba_home');
          if (screenName === 'feed') setScreen('loba_feed');
        }}
      />
    );
  }
  if (screen === 'loba_stories') {
    content = (
      <LobaStoriesScreen
        onBack={() => setScreen('loba_feed')}
        onClose={() => setScreen('loba_feed')}
      />
    );
  }
  if (screen === 'loba_record') {
    content = (
      <LobaRecordScreen
        onBack={() => setScreen('loba_home')}
        onClose={() => setScreen('loba_home')}
      />
    );
  }

  // Restaurant Screens
  if (screen === 'restaurant_home') {
    content = (
      <RestaurantHomeScreen
        onBack={() => setScreen('home')}
        onNavigate={(screenName, params) => {
          if (screenName === 'restaurant_details') setScreen('restaurant_details');
          if (screenName === 'orders') setScreen('orders');
          if (screenName === 'cart') setScreen('cart');
        }}
      />
    );
  }
  if (screen === 'restaurant_details') {
    content = (
      <RestaurantDetailsScreen
        onBack={() => setScreen('restaurant_home')}
        onNavigate={(screenName, params) => {
          if (screenName === 'food_details') setScreen('food_details');
          if (screenName === 'food_checkout') setScreen('food_checkout');
        }}
      />
    );
  }
  if (screen === 'food_details') {
    content = (
      <FoodItemDetailsScreen
        onBack={() => setScreen('restaurant_details')}
        onNavigate={(screenName) => {
          if (screenName === 'food_checkout') setScreen('food_checkout');
        }}
      />
    );
  }
  if (screen === 'food_checkout') {
    content = (
      <FoodCheckoutScreen
        onBack={() => setScreen('restaurant_details')}
        onNavigate={(screenName) => {
          if (screenName === 'order_status') setScreen('order_status');
        }}
      />
    );
  }

  // Hotel Screens
  if (screen === 'hotel_home') {
    content = (
      <HotelHomeScreen
        onBack={() => setScreen('home')}
        onNavigate={(screenName, params) => {
          if (screenName === 'hotel_rooms') setScreen('hotel_rooms');
        }}
      />
    );
  }

  // Services Screens
  if (screen === 'services_home') {
    content = (
      <ServicesHomeScreen
        onBack={() => setScreen('home')}
        onNavigate={(screenName, params) => {
          if (screenName === 'service_booking') setScreen('service_booking');
        }}
      />
    );
  }

  // Real Estate Screens
  if (screen === 'real_estate_home') {
    content = (
      <RealEstateHomeScreen
        onBack={() => setScreen('home')}
        onNavigate={(screenName, params) => {
          if (screenName === 'property_details') setScreen('property_details');
        }}
      />
    );
  }

  // Marketplace Notifications
  if (screen === 'marketplace_notifications') {
    content = (
      <MarketplaceNotificationsScreen
        onBack={() => setScreen('marketplace_home')}
      />
    );
  }

  // Marketplace Favorites
  if (screen === 'marketplace_favorites') {
    content = (
      <MarketplaceFavoritesScreen
        onBack={() => setScreen('marketplace_home')}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={(screenName) => {
          if (screenName === 'product_details') setScreen('marketplace_product_details');
        }}
      />
    );
  }

  // Marketplace History
  if (screen === 'marketplace_history') {
    content = (
      <MarketplaceHistoryScreen
        onBack={() => setScreen('marketplace_home')}
      />
    );
  }

  // Marketplace Settings
  if (screen === 'marketplace_settings') {
    content = (
      <MarketplaceSettingsScreen
        onBack={() => setScreen('marketplace_home')}
      />
    );
  }

  const showFloatingButton =
    screen !== 'welcome' &&
    screen !== 'language' &&
    screen !== 'signup' &&
    screen !== 'signup_pin' &&
    screen !== 'signup_sms' &&
    screen !== 'signup_qr' &&
    screen !== 'login' &&
    screen !== 'home';

  return (
    <DatabaseProvider database={database}>
      <View style={{ flex: 1 }}>
        {content}
        {showFloatingButton && (
          <HomeFloatingButton
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
