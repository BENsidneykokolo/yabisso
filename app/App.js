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
import BleSignupScreen from './src/features/bluetooth/screens/BleSignupScreen';
import BleKioskScreen from './src/features/bluetooth/screens/BleKioskScreen';
import KioskValidationScreen from './src/features/kiosk/screens/KioskValidationScreen';
import ProductValidationKioskScreen from './src/features/kiosk/screens/ProductValidationKioskScreen';
import ChatHomeScreen from './src/features/chat/screens/ChatHomeScreen';
import ChatConversationScreen from './src/features/chat/screens/ChatConversationScreen';
import PharmacyHomeScreen from './src/features/pharmacy/screens/PharmacyHomeScreen';


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
import SellerContactScreen from './src/features/marketplace/screens/SellerContactScreen';
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
import LobaForYouScreen from './src/features/loba/screens/LobaForYouScreen';
import LobaFollowingScreen from './src/features/loba/screens/LobaFollowingScreen';
import LobaProfileScreen from './src/features/loba/screens/LobaProfileScreen';
import LobaStoriesScreen from './src/features/loba/screens/LobaStoriesScreen';
import LobaRecordScreen from './src/features/loba/screens/LobaRecordScreen';
import LobaPreviewScreen from './src/features/loba/screens/LobaPreviewScreen';
import LobaFriendsScreen from './src/features/loba/screens/LobaFriendsScreen';
import LobaMessagesScreen from './src/features/loba/screens/LobaMessagesScreen';
import LobaSettingsScreen from './src/features/loba/screens/LobaSettingsScreen';
import RestaurantHomeScreen from './src/features/restaurant/screens/RestaurantHomeScreen';
import RestaurantSellerScreen from './src/features/restaurant/screens/RestaurantSellerScreen';
import RestaurantDetailsScreen from './src/features/restaurant/screens/RestaurantDetailsScreen';
import FoodItemDetailsScreen from './src/features/restaurant/screens/FoodItemDetailsScreen';
import FoodCheckoutScreen from './src/features/restaurant/screens/FoodCheckoutScreen';
import RestaurantOrdersScreen from './src/features/restaurant/screens/RestaurantOrdersScreen';
import RestaurantTrackingScreen from './src/features/restaurant/screens/RestaurantTrackingScreen';
import HotelHomeScreen from './src/features/hotel/screens/HotelHomeScreen';
import HotelSearchScreen from './src/features/hotel/screens/HotelSearchScreen';
import HotelDetailsScreen from './src/features/hotel/screens/HotelDetailsScreen';
import HotelRoomDetailsScreen from './src/features/hotel/screens/HotelRoomDetailsScreen';
import HotelBookingScreen from './src/features/hotel/screens/HotelBookingScreen';
import HotelPaymentScreen from './src/features/hotel/screens/HotelPaymentScreen';
import HotelReservationScreen from './src/features/hotel/screens/HotelReservationScreen';
import HotelMyBookingsScreen from './src/features/hotel/screens/HotelMyBookingsScreen';
import HotelFavoritesScreen from './src/features/hotel/screens/HotelFavoritesScreen';
import HotelProfileScreen from './src/features/hotel/screens/HotelProfileScreen';
import ServicesHomeScreen from './src/features/services/screens/ServicesHomeScreen';
import RealEstateHomeScreen from './src/features/real_estate/screens/RealEstateHomeScreen';
import MarketplaceNotificationsScreen from './src/features/marketplace/screens/MarketplaceNotificationsScreen';
import MarketplaceFavoritesScreen from './src/features/marketplace/screens/MarketplaceFavoritesScreen';
import MarketplaceHistoryScreen from './src/features/marketplace/screens/MarketplaceHistoryScreen';
import MarketplaceSettingsScreen from './src/features/marketplace/screens/MarketplaceSettingsScreen';
import ProfileAddressesScreen from './src/features/profile/screens/ProfileAddressesScreen';
import AddAddressScreen from './src/features/profile/screens/AddAddressScreen';
import AddressDetailScreen from './src/features/profile/screens/AddressDetailScreen';
import SearchAddressScreen from './src/features/profile/screens/SearchAddressScreen';
import AddressMapScreen from './src/features/profile/screens/AddressMapScreen';
import StorageManagementScreen from './src/features/profile/screens/StorageManagementScreen';
import ServiceManagementScreen from './src/features/profile/screens/ServiceManagementScreen';
import PacksScreen from './src/features/profile/screens/PacksScreen';
import { CartProvider } from './src/features/marketplace/context/CartContext';
import { OrderProvider } from './src/features/marketplace/context/OrderContext';
import { RestaurantCartProvider } from './src/features/restaurant/context/RestaurantCartContext';
import { RestaurantOrdersProvider } from './src/features/restaurant/context/RestaurantOrdersContext';
import { RestaurantFavoritesProvider } from './src/features/restaurant/context/RestaurantFavoritesContext';
import RestaurantFavoritesScreen from './src/features/restaurant/screens/RestaurantFavoritesScreen';
import { seedDatabase } from './src/lib/db/seed';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  const [history, setHistory] = useState([{ screen: 'welcome', params: {} }]);
  const [activeTab, setActiveTab] = useState('Accueil');
  const [homeShowAllServices, setHomeShowAllServices] = useState(false);
  const [walletMode, setWalletMode] = useState('fcfa');
  const [walletActiveTab, setWalletActiveTab] = useState('home');
  const [favorites, setFavorites] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const current = history[history.length - 1];
  const screen = current.screen;
  const screenParams = current.params;

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
    setHistory(prev => [...prev, { screen: screenName, params }]);
  };

  const goBack = () => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const resetTo = (screenName, params = {}) => {
    setHistory([{ screen: screenName, params }]);
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
        onBack={() => goBack()}
        onContinue={() => navigate('signup')}
      />
    );
  }
  if (screen === 'signup') {
    content = (
      <SignupScreen
        onBack={() => goBack()}
        onPin={() => navigate('signup_pin')}
        onOfflineSms={() => navigate('signup_sms')}
        onOfflineQr={() => navigate('signup_qr')}
        onOfflineBle={() => navigate('signup_ble')}
        onKioskMode={() => navigate('kiosk_validation')}
        onKioskProductMode={() => navigate('kiosk_product_validation')}
      />
    );
  }
  if (screen === 'login') {
    content = (
      <LoginScreen
        onBack={() => goBack()}
        onLogin={() => resetTo('home')}
        onCreateAccount={() => navigate('signup')}
      />
    );
  }
  if (screen === 'signup_pin') {
    content = (
      <PinSignupScreen
        onBack={() => goBack()}
        onOk={() => resetTo('home')}
      />
    );
  }
  if (screen === 'signup_sms') {
    content = (
      <SmsSignupScreen
        onBack={() => goBack()}
        onOk={() => resetTo('home')}
      />
    );
  }
  if (screen === 'signup_qr') {
    content = (
      <QrSignupScreen
        onBack={() => goBack()}
        onOk={() => resetTo('home')}
      />
    );
  }
  if (screen === 'signup_ble') {
    content = (
      <BleSignupScreen
        navigation={{ navigate, goBack }}
        route={{ params: screenParams }}
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
  if (screen === 'home') {
    content = (
      <HomeScreen
        onSignOut={() => resetTo('welcome')}
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
        onOpenChat={() => navigate('chat_home')}
        onOpenPharmacy={() => navigate('pharmacy_home')}
        showAllServicesOverride={homeShowAllServices}
      />
    );
  }
  if (screen === 'home_qr') {
    content = <QrHubScreen onBack={() => goBack()} />;
  }
  if (screen === 'home_settings') {
    content = <HomeSettingsScreen onBack={() => goBack()} />;
  }
  if (screen === 'home_notifications') {
    content = <HomeNotificationsScreen onBack={() => goBack()} />;
  }
  if (screen === 'wallet') {
    content = <WalletScreen onBack={() => goBack()} onOpenHome={() => { setWalletActiveTab('home'); navigate('wallet'); }} onOpenRecharge={() => { setWalletActiveTab('recharge'); navigate('wallet_recharge'); }} onOpenSend={() => { setWalletActiveTab('send'); navigate('wallet_send'); }} onOpenReceive={() => { setWalletActiveTab('receive'); navigate('wallet_receive'); }} onOpenHistory={() => { setWalletActiveTab('history'); navigate('wallet_history'); }} walletMode={walletMode} setWalletMode={setWalletMode} activeTab={walletActiveTab} />;
  }
  if (screen === 'wallet_recharge') {
    content = <RechargeScreen onBack={() => goBack()} onComplete={() => navigate('wallet')} onOpenQRScan={() => navigate('wallet_kiosque_qr')} onOpenPinEntry={() => navigate('wallet_kiosque_pin')} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') navigate('wallet');
      if (key === 'recharge') navigate('wallet_recharge');
      if (key === 'send') navigate('wallet_send');
      if (key === 'receive') navigate('wallet_receive');
      if (key === 'history') navigate('wallet_history');
    }} />;
  }
  if (screen === 'wallet_kiosque_qr') {
    content = <KiosqueQRScreen onBack={() => goBack()} onComplete={() => { setWalletActiveTab('recharge'); navigate('wallet'); }} />;
  }
  if (screen === 'wallet_kiosque_pin') {
    content = <KiosquePinScreen onBack={() => goBack()} onComplete={() => { setWalletActiveTab('recharge'); navigate('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send') {
    content = <SendScreen onBack={() => goBack()} onOpenQRGenerate={() => navigate('wallet_send_qr_generate')} onOpenSelectBeneficiary={() => navigate('wallet_send_beneficiary')} onOpenScanQR={() => navigate('wallet_send_scan')} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') navigate('wallet');
      if (key === 'recharge') navigate('wallet_recharge');
      if (key === 'send') navigate('wallet_send');
      if (key === 'receive') navigate('wallet_receive');
      if (key === 'history') navigate('wallet_history');
    }} />;
  }
  if (screen === 'wallet_send_qr_generate') {
    content = <SendQRGenerateScreen onBack={() => goBack()} onCreateQR={() => navigate('wallet_send_qr_result')} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_qr_result') {
    content = <SendQRResultScreen onBack={() => goBack()} onComplete={() => { setWalletActiveTab('send'); navigate('wallet'); }} amount="5000" walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_beneficiary') {
    content = <SendSelectBeneficiaryScreen onBack={() => goBack()} onSendMoney={() => { setWalletActiveTab('send'); navigate('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_scan') {
    content = <SendScanQRScreen onBack={() => goBack()} onConfirm={() => { setWalletActiveTab('send'); navigate('wallet'); }} onShowPassword={(amount) => {
      navigate('wallet_send_confirm');
    }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_send_confirm') {
    content = <SendConfirmPaymentScreen onBack={() => goBack()} onConfirm={() => { setWalletActiveTab('send'); navigate('wallet'); }} amount="5000" recipientName="Jean Dupont" walletMode={walletMode} />;
  }
  if (screen === 'wallet_receive') {
    content = <ReceiveScreen onBack={() => goBack()} onOpenScanQR={() => navigate('wallet_receive_scan')} onOpenNotifications={() => navigate('wallet_receive_notifications')} onOpenRequestPayment={() => navigate('wallet_receive_request')} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') navigate('wallet');
      if (key === 'recharge') navigate('wallet_recharge');
      if (key === 'send') navigate('wallet_send');
      if (key === 'receive') navigate('wallet_receive');
      if (key === 'history') navigate('wallet_history');
    }} />;
  }
  if (screen === 'wallet_receive_scan') {
    content = <ReceiveScanQRScreen onBack={() => goBack()} onComplete={() => { setWalletActiveTab('receive'); navigate('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_receive_notifications') {
    content = <ReceiveNotificationsScreen onBack={() => goBack()} walletMode={walletMode} />;
  }
  if (screen === 'wallet_receive_request') {
    content = <ReceiveRequestPaymentScreen onBack={() => goBack()} onCreateQR={() => navigate('wallet_send_qr_result')} onSendToContact={() => { setWalletActiveTab('receive'); navigate('wallet'); }} walletMode={walletMode} />;
  }
  if (screen === 'wallet_history') {
    content = <HistoryScreen onBack={() => goBack()} walletMode={walletMode} onNavigate={(key, mode) => {
      setWalletActiveTab(key);
      if (key === 'home') navigate('wallet');
      if (key === 'recharge') navigate('wallet_recharge');
      if (key === 'send') navigate('wallet_send');
      if (key === 'receive') navigate('wallet_receive');
      if (key === 'history') navigate('wallet_history');
    }} />;
  }
  if (screen === 'assistant') {
    content = <AssistantScreen onBack={() => goBack()} onNavigate={(screenName) => {
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
        onBack={() => goBack()}
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
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'profile_addresses') {
    content = (
      <ProfileAddressesScreen
        onBack={() => goBack()}
        onAddAddress={() => navigate('profile_add_address')}
        onSelectAddress={(addr) => {
          setSelectedAddress(addr);
          goBack();
        }}
        onSearchAddress={() => navigate('search_address')}
        onViewAddress={(addr) => navigate('profile_address_detail', { address: addr })}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'storage_management') {
    content = (
      <StorageManagementScreen
        onBack={() => goBack()}
      />
    );
  }
  if (screen === 'packs_management') {
    content = (
      <PacksScreen
        onBack={() => goBack()}
      />
    );
  }

  if (screen === 'service_management') {
    content = (
      <ServiceManagementScreen
        onBack={() => goBack()}
      />
    );
  }
  if (screen === 'search_address') {
    content = (
      <SearchAddressScreen
        onBack={() => goBack()}
        onAddressFound={(address) => navigate('address_map', { addressData: address })}
      />
    );
  }
  if (screen === 'address_map') {
    content = (
      <AddressMapScreen
        addressData={screenParams?.addressData}
        onBack={() => goBack()}
      />
    );
  }
  if (screen === 'profile_add_address') {
    content = (
      <AddAddressScreen 
        onBack={() => goBack()} 
        onSave={() => goBack()} 
      />
    );
  }
  if (screen === 'profile_address_detail') {
    content = (
      <AddressDetailScreen 
        address={screenParams?.address} 
        onBack={() => goBack()} 
        onNavigate={(screen, params) => navigate(screen, params)}
      />
    );
  }
  if (screen === 'profile_account') {
    content = <AccountScreen onBack={() => goBack()} onOpenHome={() => navigate('profile')} onOpenSecurity={() => navigate('profile_security')} onOpenSupport={() => navigate('profile_support')} onOpenLogout={() => navigate('profile_logout')} />;
  }
  if (screen === 'profile_security') {
    content = <SecurityScreen onBack={() => goBack()} onOpenHome={() => navigate('profile')} onOpenAccount={() => navigate('profile_account')} onOpenSupport={() => navigate('profile_support')} onOpenLogout={() => navigate('profile_logout')} />;
  }
  if (screen === 'profile_notifications') {
    content = (
      <NotificationsScreen
        onBack={() => goBack()}
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
    content = <LanguageSettingsScreen onBack={() => goBack()} />;
  }
  if (screen === 'profile_support') {
    content = <SupportScreen onBack={() => goBack()} onOpenHome={() => navigate('profile')} onOpenAccount={() => navigate('profile_account')} onOpenSecurity={() => navigate('profile_security')} onOpenLogout={() => navigate('profile_logout')} />;
  }
  if (screen === 'profile_logout') {
    content = (
      <LogoutScreen
        onBack={() => goBack()}
        onConfirm={() => resetTo('welcome')}
      />
    );
  }
  if (screen === 'profile_edit') {
    content = (
      <EditProfileScreen
        onBack={() => goBack()}
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
        onBack={() => goBack()}
        onOpenAddProduct={() => navigate('market_add_product')}
        onEditProduct={(product) => navigate('market_add_product', { product })}
        onContact={(seller) => navigate('market_seller_contact', { seller })}
      />
    );
  }
  if (screen === 'market_seller_contact') {
    content = (
      <SellerContactScreen
        onBack={() => goBack()}
        seller={screenParams?.seller}
      />
    );
  }
  if (screen === 'market_add_product') {
    content = (
      <AddProductScreen
        onBack={() => goBack()}
        onOpenSellerProfile={() => navigate('market_seller')}
        productToEdit={screenParams?.product}
      />
    );
  }
  if (screen === 'marketplace_home') {
    content = (
      <MarketplaceHomeScreen
        onBack={() => goBack()}
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
    const filter = screenParams?.filter || null;
    content = (
      <ProductListScreen
        onBack={() => goBack()}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        filter={filter}
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
        onBack={() => goBack()}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        category={screenParams?.category}
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
        onBack={() => goBack()}
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
        onBack={() => goBack()}
        onNavigate={(action, data) => navigate(action, data)}
      />
    );
  }
  if (screen === 'cart') {
    content = (
      <CartScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'checkout') {
    content = (
      <CheckoutScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'order_status') {
    content = (
      <OrderStatusScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'orders') {
    content = (
      <OrdersScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        filter={screenParams?.filter}
      />
    );
  }
  if (screen === 'delivery_tracking') {
    content = (
      <DeliveryTrackingScreen
        onBack={() => goBack()}
      />
    );
  }
  if (screen === 'seller_comparison') {
    content = (
      <SellerComparisonScreen
        onBack={() => goBack()}
        product={screenParams?.product}
        onNavigate={(action, data) => {
          if (action === 'select_seller' || action === 'product_details') {
            navigate('marketplace_product_details', data);
          }
        }}
      />
    );
  }
  if (screen === 'blocked_user') {
    content = (
      <BlockedUserScreen
        onBack={() => goBack()}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_home') {
    content = (
      <LobaHomeScreen
        onBack={() => goBack()}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_feed') {
    content = (
      <LobaFeedScreen
        onBack={() => goBack()}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_profile') {
    content = (
      <LobaProfileScreen
        onBack={() => goBack()}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_stories') {
    content = (
      <LobaStoriesScreen
        onBack={() => goBack()}
        onClose={() => navigate('loba_feed')}
      />
    );
  }
  if (screen === 'loba_record') {
    content = (
      <LobaRecordScreen
        onBack={() => goBack()}
        onClose={() => navigate('loba_home')}
        onCapture={(media) => navigate('loba_preview', { media })}
      />
    );
  }
  if (screen === 'loba_preview') {
    content = (
      <LobaPreviewScreen
        media={screenParams?.media}
        onBack={() => goBack()}
        onUpload={() => {
          resetTo('loba_home');
        }}
      />
    );
  }
  if (screen === 'loba_friends') {
    content = (
      <LobaFriendsScreen
        onBack={() => goBack()}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_messages') {
    content = (
      <LobaMessagesScreen
        onBack={() => goBack()}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_for_you') {
    content = (
      <LobaForYouScreen
        onBack={() => goBack()}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_following') {
    content = (
      <LobaFollowingScreen
        onBack={() => goBack()}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'loba_settings') {
    content = (
      <LobaSettingsScreen
        onBack={() => goBack()}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }

  // Restaurant Screens
  if (screen === 'restaurant_home') {
    content = (
      <RestaurantHomeScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'restaurant_seller') {
    content = (
      <RestaurantSellerScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'restaurant_details') {
    content = (
      <RestaurantDetailsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'food_details') {
    content = (
      <FoodItemDetailsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'food_checkout') {
    content = (
      <FoodCheckoutScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }

  // Restaurant Orders
  if (screen === 'restaurant_orders') {
    content = (
      <RestaurantOrdersScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Restaurant Tracking
  if (screen === 'restaurant_tracking') {
    content = (
      <RestaurantTrackingScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }

  // Restaurant Favorites
  if (screen === 'restaurant_favorites') {
    content = (
      <RestaurantFavoritesScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Hotel Screens
  if (screen === 'hotel_home') {
    content = (
      <HotelHomeScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'hotel_search') {
    content = (
      <HotelSearchScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'hotel_details') {
    content = (
      <HotelDetailsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'hotel_room_details') {
    content = (
      <HotelRoomDetailsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'hotel_booking') {
    content = (
      <HotelBookingScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'hotel_payment') {
    content = (
      <HotelPaymentScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'hotel_reservation') {
    content = (
      <HotelReservationScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'hotel_bookings') {
    content = (
      <HotelMyBookingsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'hotel_favorites') {
    content = (
      <HotelFavoritesScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'hotel_profile') {
    content = (
      <HotelProfileScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Services Screens
  if (screen === 'services_home') {
    content = (
      <ServicesHomeScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }

  // Real Estate Screens
  if (screen === 'real_estate_home') {
    content = (
      <RealEstateHomeScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }

  // Chat Screens
  if (screen === 'chat_home') {
    content = (
      <ChatHomeScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'chat_conversation') {
    content = (
      <ChatConversationScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        conversation={screenParams?.conversation}
      />
    );
  }

  // Pharmacy Screens
  if (screen === 'pharmacy_home') {
    content = (
      <PharmacyHomeScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Marketplace Notifications
  if (screen === 'marketplace_notifications') {
    content = (
      <MarketplaceNotificationsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Marketplace Favorites
  if (screen === 'marketplace_favorites') {
    content = (
      <MarketplaceFavoritesScreen
        onBack={() => goBack()}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onNavigate={(screenName, params) => {
          let target = screenName;
          if (screenName === 'product_details') target = 'marketplace_product_details';
          navigate(target, params);
        }}
      />
    );
  }

  // Marketplace History
  if (screen === 'marketplace_history') {
    content = (
      <MarketplaceHistoryScreen
        onBack={() => goBack()}
      />
    );
  }

  // Marketplace Settings
  if (screen === 'marketplace_settings') {
    content = (
      <MarketplaceSettingsScreen
        onBack={() => goBack()}
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
          <RestaurantCartProvider>
            <RestaurantOrdersProvider>
            <RestaurantFavoritesProvider>
              <View style={{ flex: 1 }}>
              {content}
            {showFloatingButton && (
              <HomeFloatingButton
                activeTab={activeTab}
                onSelect={(label) => {
                  setActiveTab(label);
                  if (label === 'Accueil') {
                    setHomeShowAllServices(false);
                    navigate('home');
                    return;
                  }
                  if (label === 'Services') {
                    setHomeShowAllServices(true);
                    navigate('home');
                    return;
                  }
                  if (label === 'Portefeuille') {
                    setWalletActiveTab('home');
                    navigate('wallet');
                    return;
                  }
                  if (label === 'Assistant IA') {
                    navigate('assistant');
                    return;
                  }
                  if (label === 'Profil') {
                    navigate('profile');
                  }
                }}
              />
            )}
            <StatusBar style="light" />
          </View>
          </RestaurantFavoritesProvider>
          </RestaurantOrdersProvider>
          </RestaurantCartProvider>
        </OrderProvider>
      </CartProvider>
    </DatabaseProvider>
  );
}
