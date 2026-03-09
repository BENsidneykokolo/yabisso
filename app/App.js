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
import { CartProvider } from './src/features/marketplace/context/CartContext';
import { OrderProvider } from './src/features/marketplace/context/OrderContext';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [screenParams, setScreenParams] = useState({});
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

  const navigate = (screenName, params = {}) => {
    setScreenParams(params);
    setScreen(screenName);
  };

  let content = null;
  if (screen === 'welcome') {
    content = (
      <WelcomeScreen
        onGetStarted={() => navigate('language')}
        onSignIn={() => navigate('login')}
      />
    );
  }
  if (screen === 'language') {
    content = (
      <LanguageScreen
        onBack={() => navigate('welcome')}
        onContinue={() => navigate('signup')}
      />
    );
  }
  if (screen === 'signup') {
    content = (
      <SignupScreen
        onBack={() => navigate('language')}
        onPin={() => navigate('signup_pin')}
        onOfflineSms={() => navigate('signup_sms')}
        onOfflineQr={() => navigate('signup_qr')}
      />
    );
  }
  if (screen === 'login') {
    content = (
      <LoginScreen
        onBack={() => navigate('welcome')}
        onLogin={() => navigate('home')}
        onCreateAccount={() => navigate('signup')}
      />
    );
  }
  if (screen === 'signup_pin') {
    content = (
      <PinSignupScreen
        onBack={() => navigate('signup')}
        onOk={() => navigate('home')}
      />
    );
  }
  if (screen === 'signup_sms') {
    content = (
      <SmsSignupScreen
        onBack={() => navigate('signup')}
        onOk={() => navigate('home')}
      />
    );
  }
  if (screen === 'signup_qr') {
    content = (
      <QrSignupScreen
        onBack={() => navigate('signup')}
        onOk={() => navigate('home')}
      />
    );
  }
  if (screen === 'home') {
    content = (
      <HomeScreen
        onSignOut={() => navigate('signup')}
        onOpenWallet={() => {
          setWalletActiveTab('home');
          setActiveTab('Portefeuille');
          navigate('wallet');
        }}
        onOpenAssistant={() => {
          setActiveTab('Assistant IA');
          navigate('assistant');
        }}
        onOpenProfile={() => {
          setActiveTab('Profil');
          navigate('profile');
        }}
        onOpenMarket={() => navigate('marketplace_home')}
        onOpenQr={() => navigate('home_qr')}
        onOpenSettings={() => navigate('home_settings')}
        onOpenNotifications={() => navigate('home_notifications')}
        onOpenLoba={() => navigate('loba_home')}
        onOpenOrders={() => navigate('orders')}
        onOpenRestaurant={() => navigate('restaurant_home')}
        onOpenHotel={() => navigate('hotel_home')}
        onOpenServices={() => navigate('services_home')}
        onOpenRealEstate={() => navigate('real_estate_home')}
        showAllServicesOverride={homeShowAllServices}
      />
    );
  }
  if (screen === 'home_qr') {
    content = <QrHubScreen onBack={() => navigate('home')} />;
  }
  if (screen === 'home_settings') {
    content = <HomeSettingsScreen onBack={() => navigate('home')} />;
  }
  if (screen === 'home_notifications') {
    content = <HomeNotificationsScreen onBack={() => navigate('home')} />;
  }
  if (screen === 'wallet') {
    content = <WalletScreen onBack={() => navigate('home')} onOpenHome={() => { setWalletActiveTab('home'); navigate('wallet'); }} onOpenRecharge={() => { setWalletActiveTab('recharge'); navigate('wallet_recharge'); }} onOpenSend={() => { setWalletActiveTab('send'); navigate('wallet_send'); }} onOpenReceive={() => { setWalletActiveTab('receive'); navigate('wallet_receive'); }} onOpenHistory={() => { setWalletActiveTab('history'); navigate('wallet_history'); }} walletMode={walletMode} setWalletMode={setWalletMode} activeTab={walletActiveTab} />;
  }
  if (screen === 'wallet_recharge') {
    content = <RechargeScreen onBack={() => navigate('wallet')} onComplete={() => navigate('wallet')} onOpenQRScan={() => navigate('wallet_kiosque_qr')} onOpenPinEntry={() => navigate('wallet_kiosque_pin')} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') navigate('wallet');
      if (key === 'recharge') navigate('wallet_recharge');
      if (key === 'send') navigate('wallet_send');
      if (key === 'receive') navigate('wallet_receive');
      if (key === 'history') navigate('wallet_history');
    }} />;
  }
  if (screen === 'wallet_kiosque_qr') {
    content = <KiosqueQRScreen onBack={() => navigate('wallet_recharge')} onComplete={() => { setWalletActiveTab('recharge'); navigate('wallet'); }} />;
  }
  if (screen === 'wallet_kiosque_pin') {
    content = <KiosquePinScreen onBack={() => navigate('wallet_recharge')} onComplete={() => { setWalletActiveTab('recharge'); navigate('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send') {
    content = <SendScreen onBack={() => navigate('wallet')} onOpenQRGenerate={() => navigate('wallet_send_qr_generate')} onOpenSelectBeneficiary={() => navigate('wallet_send_beneficiary')} onOpenScanQR={() => navigate('wallet_send_scan')} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') navigate('wallet');
      if (key === 'recharge') navigate('wallet_recharge');
      if (key === 'send') navigate('wallet_send');
      if (key === 'receive') navigate('wallet_receive');
      if (key === 'history') navigate('wallet_history');
    }} />;
  }
  if (screen === 'wallet_send_qr_generate') {
    content = <SendQRGenerateScreen onBack={() => navigate('wallet_send')} onCreateQR={() => navigate('wallet_send_qr_result')} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_qr_result') {
    content = <SendQRResultScreen onBack={() => navigate('wallet_send_qr_generate')} onComplete={() => { setWalletActiveTab('send'); navigate('wallet'); }} amount="5000" walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_beneficiary') {
    content = <SendSelectBeneficiaryScreen onBack={() => navigate('wallet_send')} onSendMoney={() => { setWalletActiveTab('send'); navigate('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_scan') {
    content = <SendScanQRScreen onBack={() => navigate('wallet_send')} onConfirm={() => { setWalletActiveTab('send'); navigate('wallet'); }} onShowPassword={(amount) => {
      navigate('wallet_send_confirm');
    }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_confirm') {
    content = <SendConfirmPaymentScreen onBack={() => navigate('wallet_send_scan')} onConfirm={() => { setWalletActiveTab('send'); navigate('wallet'); }} amount="5000" recipientName="Jean Dupont" walletMode={walletMode} />;
  }
  if (screen === 'wallet_receive') {
    content = <ReceiveScreen onBack={() => navigate('wallet')} onOpenScanQR={() => navigate('wallet_receive_scan')} onOpenNotifications={() => navigate('wallet_receive_notifications')} onOpenRequestPayment={() => navigate('wallet_receive_request')} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') navigate('wallet');
      if (key === 'recharge') navigate('wallet_recharge');
      if (key === 'send') navigate('wallet_send');
      if (key === 'receive') navigate('wallet_receive');
      if (key === 'history') navigate('wallet_history');
    }} />;
  }
  if (screen === 'wallet_receive_scan') {
    content = <ReceiveScanQRScreen onBack={() => navigate('wallet_receive')} onComplete={() => { setWalletActiveTab('receive'); navigate('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_receive_notifications') {
    content = <ReceiveNotificationsScreen onBack={() => navigate('wallet_receive')} walletMode={walletMode} />;
  }
  if (screen === 'wallet_receive_request') {
    content = <ReceiveRequestPaymentScreen onBack={() => navigate('wallet_receive')} onCreateQR={() => navigate('wallet_send_qr_result')} onSendToContact={() => { setWalletActiveTab('receive'); navigate('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_history') {
    content = <HistoryScreen onBack={() => navigate('wallet')} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') navigate('wallet');
      if (key === 'recharge') navigate('wallet_recharge');
      if (key === 'send') navigate('wallet_send');
      if (key === 'receive') navigate('wallet_receive');
      if (key === 'history') navigate('wallet_history');
    }} />;
  }
  if (screen === 'assistant') {
    content = <AssistantScreen onBack={() => navigate('home')} onNavigate={(screenName) => {
      if (screenName === 'home') navigate('home');
      if (screenName === 'wallet') { setWalletActiveTab('home'); navigate('wallet'); }
      if (screenName === 'profile') navigate('profile');
      if (screenName === 'services') { setHomeShowAllServices(true); navigate('home'); }
      if (screenName === 'settings') navigate('home_settings');
    }} />;
  }
  if (screen === 'profile') {
    content = (
      <ProfileScreen
        onBack={() => navigate('home')}
        onOpenHome={() => navigate('profile')}
        onOpenAccount={() => navigate('profile_account')}
        onOpenSecurity={() => navigate('profile_security')}
        onOpenNotifications={() => navigate('profile_notifications')}
        onOpenLanguage={() => navigate('profile_language')}
        onOpenSupport={() => navigate('profile_support')}
        onOpenLogout={() => navigate('profile_logout')}
        onOpenWallet={() => {
          setWalletActiveTab('home');
          setActiveTab('Portefeuille');
          navigate('wallet');
        }}
        onOpenBlockedUser={() => navigate('blocked_user')}
      />
    );
  }
  if (screen === 'profile_account') {
    content = <AccountScreen onBack={() => navigate('profile')} onOpenHome={() => navigate('profile')} onOpenSecurity={() => navigate('profile_security')} onOpenSupport={() => navigate('profile_support')} onOpenLogout={() => navigate('profile_logout')} />;
  }
  if (screen === 'profile_security') {
    content = <SecurityScreen onBack={() => navigate('profile')} onOpenHome={() => navigate('profile')} onOpenAccount={() => navigate('profile_account')} onOpenSupport={() => navigate('profile_support')} onOpenLogout={() => navigate('profile_logout')} />;
  }
  if (screen === 'profile_notifications') {
    content = (
      <NotificationsScreen
        onBack={() => navigate('profile')}
        onOpenHome={() => navigate('profile')}
        onOpenAccount={() => navigate('profile_account')}
        onOpenSecurity={() => navigate('profile_security')}
        onOpenSupport={() => navigate('profile_support')}
        onOpenNotifications={() => navigate('profile_notifications')}
        onOpenLogout={() => navigate('profile_logout')}
        onOpenEditProfile={() => navigate('profile_edit')}
      />
    );
  }
  if (screen === 'profile_language') {
    content = <LanguageSettingsScreen onBack={() => navigate('profile')} />;
  }
  if (screen === 'profile_support') {
    content = <SupportScreen onBack={() => navigate('profile')} onOpenHome={() => navigate('profile')} onOpenAccount={() => navigate('profile_account')} onOpenSecurity={() => navigate('profile_security')} onOpenLogout={() => navigate('profile_logout')} />;
  }
  if (screen === 'profile_logout') {
    content = (
      <LogoutScreen
        onBack={() => navigate('profile')}
        onConfirm={() => navigate('welcome')}
      />
    );
  }
  if (screen === 'profile_edit') {
    content = (
      <EditProfileScreen
        onBack={() => navigate('profile')}
        onOpenHome={() => navigate('profile')}
        onOpenAccount={() => navigate('profile_account')}
        onOpenSecurity={() => navigate('profile_security')}
        onOpenSupport={() => navigate('profile_support')}
        onOpenNotifications={() => navigate('profile_notifications')}
        onOpenLogout={() => navigate('profile_logout')}
      />
    );
  }
  if (screen === 'market_seller') {
    content = (
      <SellerProfileScreen
        onBack={() => navigate('home')}
        onOpenAddProduct={() => navigate('market_add_product')}
      />
    );
  }
  if (screen === 'market_add_product') {
    content = (
      <AddProductScreen
        onBack={() => navigate('market_seller')}
        onOpenSellerProfile={() => navigate('market_seller')}
      />
    );
  }
  if (screen === 'marketplace_home') {
    content = (
      <MarketplaceHomeScreen
        onBack={() => navigate('home')}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={(screenName, params) => {
          let target = screenName;
          if (screenName === 'product_details') target = 'marketplace_product_details';
          if (screenName === 'category_page') target = 'marketplace_category_page';
          if (screenName === 'product_list') target = 'marketplace_product_list';
          navigate(target, params);
        }}
      />
    );
  }
  if (screen === 'marketplace_product_list') {
    content = (
      <ProductListScreen
        onBack={() => navigate('marketplace_home')}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={(screenName, params) => {
          let target = screenName;
          if (screenName === 'product_details') target = 'marketplace_product_details';
          if (screenName === 'category_page') target = 'marketplace_category_page';
          if (screenName === 'marketplace_home') target = 'marketplace_home';
          if (screenName === 'cart') target = 'cart';
          if (screenName === 'seller_comparison') target = 'seller_comparison';
          if (screenName === 'orders') target = 'orders';
          if (screenName === 'new_arrivals') target = 'new_arrivals';
          navigate(target, params);
        }}
      />
    );
  }
  if (screen === 'marketplace_category_page') {
    content = (
      <CategoryPageScreen
        onBack={() => navigate('marketplace_product_list')}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={(screenName, params) => {
          let target = screenName;
          if (screenName === 'product_details') target = 'marketplace_product_details';
          if (screenName === 'marketplace_home') target = 'marketplace_home';
          if (screenName === 'product_list') target = 'marketplace_product_list';
          if (screenName === 'new_arrivals') target = 'new_arrivals';
          if (screenName === 'cart') target = 'cart';
          if (screenName === 'orders') target = 'orders';
          navigate(target, params);
        }}
      />
    );
  }
  if (screen === 'new_arrivals') {
    content = (
      <NewArrivalsScreen
        onBack={() => navigate('marketplace_home')}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={(screenName, params) => {
          let target = screenName;
          if (screenName === 'product_details') target = 'marketplace_product_details';
          if (screenName === 'category_page') target = 'marketplace_category_page';
          if (screenName === 'product_list') target = 'marketplace_product_list';
          if (screenName === 'marketplace_home') target = 'marketplace_home';
          if (screenName === 'cart') target = 'cart';
          if (screenName === 'orders') target = 'orders';
          navigate(target, params);
        }}
      />
    );
  }
  if (screen === 'marketplace_product_details') {
    content = (
      <ProductDetailsScreen
        product={screenParams?.product}
        onBack={() => navigate('marketplace_product_list')}
        onNavigate={(action, data) => navigate(action, data)}
      />
    );
  }
  if (screen === 'cart') {
    content = (
      <CartScreen
        onBack={() => navigate('marketplace_home')}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'checkout') {
    content = (
      <CheckoutScreen
        onBack={() => navigate('cart')}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'order_status') {
    content = (
      <OrderStatusScreen
        onBack={() => navigate('orders')}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'orders') {
    content = (
      <OrdersScreen
        onBack={() => navigate('marketplace_home')}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'delivery_tracking') {
    content = (
      <DeliveryTrackingScreen
        onBack={() => navigate('order_status')}
      />
    );
  }
  if (screen === 'seller_comparison') {
    content = (
      <SellerComparisonScreen
        onBack={() => navigate('marketplace_product_details')}
        onNavigate={(action, data) => {
          if (action === 'select_seller') {
            navigate('marketplace_product_details');
          }
        }}
      />
    );
  }
  if (screen === 'blocked_user') {
    content = (
      <BlockedUserScreen
        onBack={() => navigate('home')}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_home') {
    content = (
      <LobaHomeScreen
        onBack={() => navigate('home')}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_feed') {
    content = (
      <LobaFeedScreen
        onBack={() => navigate('loba_home')}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_profile') {
    content = (
      <LobaProfileScreen
        onBack={() => navigate('loba_home')}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_stories') {
    content = (
      <LobaStoriesScreen
        onBack={() => navigate('loba_feed')}
        onClose={() => navigate('loba_feed')}
      />
    );
  }
  if (screen === 'loba_record') {
    content = (
      <LobaRecordScreen
        onBack={() => navigate('loba_home')}
        onClose={() => navigate('loba_home')}
      />
    );
  }

  // Restaurant Screens
  if (screen === 'restaurant_home') {
    content = (
      <RestaurantHomeScreen
        onBack={() => navigate('home')}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'restaurant_details') {
    content = (
      <RestaurantDetailsScreen
        onBack={() => navigate('restaurant_home')}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'food_details') {
    content = (
      <FoodItemDetailsScreen
        onBack={() => navigate('restaurant_details')}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'food_checkout') {
    content = (
      <FoodCheckoutScreen
        onBack={() => navigate('restaurant_details')}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Hotel Screens
  if (screen === 'hotel_home') {
    content = (
      <HotelHomeScreen
        onBack={() => navigate('home')}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Services Screens
  if (screen === 'services_home') {
    content = (
      <ServicesHomeScreen
        onBack={() => navigate('home')}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Real Estate Screens
  if (screen === 'real_estate_home') {
    content = (
      <RealEstateHomeScreen
        onBack={() => navigate('home')}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Marketplace Notifications
  if (screen === 'marketplace_notifications') {
    content = (
      <MarketplaceNotificationsScreen
        onBack={() => navigate('marketplace_home')}
      />
    );
  }

  // Marketplace Favorites
  if (screen === 'marketplace_favorites') {
    content = (
      <MarketplaceFavoritesScreen
        onBack={() => navigate('marketplace_home')}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Marketplace History
  if (screen === 'marketplace_history') {
    content = (
      <MarketplaceHistoryScreen
        onBack={() => navigate('marketplace_home')}
      />
    );
  }

  // Marketplace Settings
  if (screen === 'marketplace_settings') {
    content = (
      <MarketplaceSettingsScreen
        onBack={() => navigate('marketplace_home')}
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
      <CartProvider>
        <OrderProvider>
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
        </OrderProvider>
      </CartProvider>
    </DatabaseProvider>
  );
}
