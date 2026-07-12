import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database } from './src/lib/db';
import { ThemeProvider } from './src/lib/ThemeContext';
import WelcomeScreen from './src/features/onboarding/screens/WelcomeScreen';
import LanguageScreen from './src/features/onboarding/screens/LanguageScreen';
import SignupScreen from './src/features/auth/screens/SignupScreen';
import SmsSignupScreen from './src/features/auth/screens/SmsSignupScreen';
import QrSignupScreen from './src/features/auth/screens/QrSignupScreen';
import PinSignupScreen from './src/features/auth/screens/PinSignupScreen';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import BleSignupScreen from './src/features/bluetooth/screens/BleSignupScreen';
import ChatHomeScreen from './src/features/chat/screens/ChatHomeScreen';
import ChatConversationScreen from './src/features/chat/screens/ChatConversationScreen';
import PharmacyHomeScreen from './src/features/pharmacy/screens/PharmacyHomeScreen';
import PharmacyOnDutyScreen from './src/features/pharmacy/screens/PharmacyOnDutyScreen';
import TaxiHomeScreen from './src/features/taxi/screens/TaxiHomeScreen';
import TaxiFareScreen from './src/features/taxi/screens/TaxiFareScreen';
import TaxiSearchDriverScreen from './src/features/taxi/screens/TaxiSearchDriverScreen';
import TaxiRideScreen from './src/features/taxi/screens/TaxiRideScreen';
import TaxiCompleteScreen from './src/features/taxi/screens/TaxiCompleteScreen';
import TaxiRatingScreen from './src/features/taxi/screens/TaxiRatingScreen';
import TaxiHistoryScreen from './src/features/taxi/screens/TaxiHistoryScreen';
import TaxiFavoritesScreen from './src/features/taxi/screens/TaxiFavoritesScreen';
import TaxiCouponScreen from './src/features/taxi/screens/TaxiCouponScreen';
import TaxiHelpScreen from './src/features/taxi/screens/TaxiHelpScreen';
import TaxiEmergencyScreen from './src/features/taxi/screens/TaxiEmergencyScreen';
import TaxiSettingsScreen from './src/features/taxi/screens/TaxiSettingsScreen';
import TaxiRideReceiptScreen from './src/features/taxi/screens/TaxiRideReceiptScreen';
import TaxiDriverVerificationScreen from './src/features/taxi/screens/TaxiDriverVerificationScreen';
import TaxiDriverHomeScreen from './src/features/taxi/screens/TaxiDriverHomeScreen';
import TaxiDriverRideScreen from './src/features/taxi/screens/TaxiDriverRideScreen';
import TaxiDriverEarningsScreen from './src/features/taxi/screens/TaxiDriverEarningsScreen';
import TaxiDriverProfileScreen from './src/features/taxi/screens/TaxiDriverProfileScreen';

import MusicHomeScreen from './src/features/music/screens/MusicHomeScreen';
import MusicPlayerScreen from './src/features/music/screens/MusicPlayerScreen';
import MusicLibraryScreen from './src/features/music/screens/MusicLibraryScreen';
import MusicSearchScreen from './src/features/music/screens/MusicSearchScreen';
import MusicPlaylistScreen from './src/features/music/screens/MusicPlaylistScreen';
import MusicAlbumScreen from './src/features/music/screens/MusicAlbumScreen';
import MusicQueueScreen from './src/features/music/screens/MusicQueueScreen';
import MusicDownloadsScreen from './src/features/music/screens/MusicDownloadsScreen';
import MusicSettingsScreen from './src/features/music/screens/MusicSettingsScreen';
import MusicArtistScreen from './src/features/music/screens/MusicArtistScreen';

import StreamingHomeScreen from './src/features/streaming/screens/StreamingHomeScreen';
import StreamingPlayerScreen from './src/features/streaming/screens/StreamingPlayerScreen';
import StreamingBrowseScreen from './src/features/streaming/screens/StreamingBrowseScreen';
import StreamingLibraryScreen from './src/features/streaming/screens/StreamingLibraryScreen';
import StreamingDetailsScreen from './src/features/streaming/screens/StreamingDetailsScreen';
import StreamingSearchScreen from './src/features/streaming/screens/StreamingSearchScreen';
import StreamingDownloadsScreen from './src/features/streaming/screens/StreamingDownloadsScreen';
import StreamingSettingsScreen from './src/features/streaming/screens/StreamingSettingsScreen';

import FlightsHomeScreen from './src/features/flights/screens/FlightsHomeScreen';
import FlightsResultsScreen from './src/features/flights/screens/FlightsResultsScreen';
import FlightsDetailsScreen from './src/features/flights/screens/FlightsDetailsScreen';
import FlightsBookingScreen from './src/features/flights/screens/FlightsBookingScreen';
import FlightsPaymentScreen from './src/features/flights/screens/FlightsPaymentScreen';
import FlightsConfirmationScreen from './src/features/flights/screens/FlightsConfirmationScreen';
import FlightsCheckinScreen from './src/features/flights/screens/FlightsCheckinScreen';
import FlightsHistoryScreen from './src/features/flights/screens/FlightsHistoryScreen';
import FlightsMapScreen from './src/features/flights/screens/FlightsMapScreen';
import FlightsSettingsScreen from './src/features/flights/screens/FlightsSettingsScreen';

import BettingHomeScreen from './src/features/betting/screens/BettingHomeScreen';
import BettingLiveScreen from './src/features/betting/screens/BettingLiveScreen';
import BettingMatchDetailScreen from './src/features/betting/screens/BettingMatchDetailScreen';
import BettingBetSlipScreen from './src/features/betting/screens/BettingBetSlipScreen';
import BettingMyBetsScreen from './src/features/betting/screens/BettingMyBetsScreen';
import BettingResultsScreen from './src/features/betting/screens/BettingResultsScreen';
import BettingLiveNowScreen from './src/features/betting/screens/BettingLiveNowScreen';
import BettingSettingsScreen from './src/features/betting/screens/BettingSettingsScreen';

import TransportHomeScreen from './src/features/transport/screens/TransportHomeScreen';
import TransportResultsScreen from './src/features/transport/screens/TransportResultsScreen';
import TransportDetailsScreen from './src/features/transport/screens/TransportDetailsScreen';
import TransportBookingScreen from './src/features/transport/screens/TransportBookingScreen';
import TransportPaymentScreen from './src/features/transport/screens/TransportPaymentScreen';
import TransportConfirmationScreen from './src/features/transport/screens/TransportConfirmationScreen';
import TransportHistoryScreen from './src/features/transport/screens/TransportHistoryScreen';

import DeliveryHomeScreen from './src/features/delivery/screens/DeliveryHomeScreen';
import DeliveryQuoteScreen from './src/features/delivery/screens/DeliveryQuoteScreen';
import DeliveryBookingScreen from './src/features/delivery/screens/DeliveryBookingScreen';
import DeliveryTrackingScreen from './src/features/delivery/screens/DeliveryTrackingScreen';
import DeliveryHistoryScreen from './src/features/delivery/screens/DeliveryHistoryScreen';
import DeliverySettingsScreen from './src/features/delivery/screens/DeliverySettingsScreen';

import FormationHomeScreen from './src/features/formation/screens/FormationHomeScreen';
import FormationCoursesScreen from './src/features/formation/screens/FormationCoursesScreen';
import FormationDetailsScreen from './src/features/formation/screens/FormationDetailsScreen';
import FormationPlayerScreen from './src/features/formation/screens/FormationPlayerScreen';
import FormationMyCoursesScreen from './src/features/formation/screens/FormationMyCoursesScreen';
import FormationSearchScreen from './src/features/formation/screens/FormationSearchScreen';

import SwapHomeScreen from './src/features/swap/screens/SwapHomeScreen';
import SwapItemDetailScreen from './src/features/swap/screens/SwapItemDetailScreen';
import SwapPostScreen from './src/features/swap/screens/SwapPostScreen';

import NotebookHomeScreen from './src/features/notebook/screens/NotebookHomeScreen';
import NotebookDetailScreen from './src/features/notebook/screens/NotebookDetailScreen';
import NotebookSearchScreen from './src/features/notebook/screens/NotebookSearchScreen';

import ReservationHomeScreen from './src/features/reservation/screens/ReservationHomeScreen';
import ReservationDetailsScreen from './src/features/reservation/screens/ReservationDetailsScreen';
import ReservationCreateScreen from './src/features/reservation/screens/ReservationCreateScreen';

import ServicePersoHomeScreen from './src/features/service_perso/screens/ServicePersoHomeScreen';
import ServicePersoListScreen from './src/features/service_perso/screens/ServicePersoListScreen';
import ServicePersoDetailsScreen from './src/features/service_perso/screens/ServicePersoDetailsScreen';
import ServicePersoBookingScreen from './src/features/service_perso/screens/ServicePersoBookingScreen';

import ServiceProHomeScreen from './src/features/service_pro/screens/ServiceProHomeScreen';
import ServiceProListScreen from './src/features/service_pro/screens/ServiceProListScreen';
import ServiceProDetailsScreen from './src/features/service_pro/screens/ServiceProDetailsScreen';
import ServiceProBookingScreen from './src/features/service_pro/screens/ServiceProBookingScreen';

import ServiceDigitalHomeScreen from './src/features/service_digital/screens/ServiceDigitalHomeScreen';
import ServiceDigitalListScreen from './src/features/service_digital/screens/ServiceDigitalListScreen';
import ServiceDigitalDetailsScreen from './src/features/service_digital/screens/ServiceDigitalDetailsScreen';
import ServiceDigitalBookingScreen from './src/features/service_digital/screens/ServiceDigitalBookingScreen';

import ServiceMaisonHomeScreen from './src/features/service_maison/screens/ServiceMaisonHomeScreen';
import ServiceMaisonListScreen from './src/features/service_maison/screens/ServiceMaisonListScreen';
import ServiceMaisonDetailsScreen from './src/features/service_maison/screens/ServiceMaisonDetailsScreen';
import ServiceMaisonBookingScreen from './src/features/service_maison/screens/ServiceMaisonBookingScreen';

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
import SellerDashboardScreen from './src/features/marketplace/screens/SellerDashboardScreen';
import SellerOrdersScreen from './src/features/marketplace/screens/SellerOrdersScreen';
import SellerNotificationsScreen from './src/features/marketplace/screens/SellerNotificationsScreen';
import SellerAnalyticsScreen from './src/features/marketplace/screens/SellerAnalyticsScreen';
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
import MarketplaceDeliveryTrackingScreen from './src/features/marketplace/screens/DeliveryTrackingScreen';
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
import LobaPacksScreen from './src/features/loba/screens/LobaPacksScreen';
import RestaurantHomeScreen from './src/features/restaurant/screens/RestaurantHomeScreen';
import RestaurantSellerScreen from './src/features/restaurant/screens/RestaurantSellerScreen';
import RestaurantSellerDashboard from './src/features/restaurant/screens/RestaurantSellerDashboard';
import RestaurantSellerOrdersScreen from './src/features/restaurant/screens/RestaurantSellerOrdersScreen';
import RestaurantSellerOrderDetailScreen from './src/features/restaurant/screens/RestaurantSellerOrderDetailScreen';
import RestaurantSellerAssignCourierScreen from './src/features/restaurant/screens/RestaurantSellerAssignCourierScreen';
import RestaurantSellerNotificationsScreen from './src/features/restaurant/screens/RestaurantSellerNotificationsScreen';
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
import HotelNotificationsScreen from './src/features/hotel/screens/HotelNotificationsScreen';
import HotelHistoryScreen from './src/features/hotel/screens/HotelHistoryScreen';
import ServicesHomeScreen from './src/features/services/screens/ServicesHomeScreen';
import ServiceDetailsScreen from './src/features/services/screens/ServiceDetailsScreen';
import ServiceBookingScreen from './src/features/services/screens/ServiceBookingScreen';
import ServiceCheckoutScreen from './src/features/services/screens/ServiceCheckoutScreen';
import ServicesOrdersScreen from './src/features/services/screens/ServicesOrdersScreen';
import ServicesFavoritesScreen from './src/features/services/screens/ServicesFavoritesScreen';
import ServicesNotificationsScreen from './src/features/services/screens/ServicesNotificationsScreen';
import ServicesProfileScreen from './src/features/services/screens/ServicesProfileScreen';
import ServicesProvidersScreen from './src/features/services/screens/ServicesProvidersScreen';
import ServicesSellerScreen from './src/features/services/screens/ServicesSellerScreen';
import RealEstateHomeScreen from './src/features/real_estate/screens/RealEstateHomeScreen';
import ApartmentNotificationsScreen from './src/features/real_estate/screens/ApartmentNotificationsScreen';
import PharmacyDetailsScreen from './src/features/pharmacy/screens/PharmacyDetailsScreen';
import PharmacyCartScreen from './src/features/pharmacy/screens/PharmacyCartScreen';
import PharmacyCheckoutScreen from './src/features/pharmacy/screens/PharmacyCheckoutScreen';
import PharmacyOrderScreen from './src/features/pharmacy/screens/PharmacyOrderScreen';
import ApartmentDetailsScreen from './src/features/real_estate/screens/ApartmentDetailsScreen';
import ApartmentBookingScreen from './src/features/real_estate/screens/ApartmentBookingScreen';
import ApartmentPaymentScreen from './src/features/real_estate/screens/ApartmentPaymentScreen';
import ApartmentFavoritesScreen from './src/features/real_estate/screens/ApartmentFavoritesScreen';
import ApartmentSearchScreen from './src/features/real_estate/screens/ApartmentSearchScreen';
import AssistantHistoryScreen from './src/features/ai/screens/AssistantHistoryScreen';
import AssistantSettingsScreen from './src/features/ai/screens/AssistantSettingsScreen';
import PharmacyProfileScreen from './src/features/pharmacy/screens/PharmacyProfileScreen';
import ApartmentProfileScreen from './src/features/real_estate/screens/ApartmentProfileScreen';
import ApartmentListingsScreen from './src/features/real_estate/screens/ApartmentListingsScreen';
import RestaurantSellerMenuScreen from './src/features/restaurant/screens/RestaurantSellerMenuScreen';
import DatingHomeScreen from './src/features/dating/screens/DatingHomeScreen';
import DatingProfileScreen from './src/features/dating/screens/DatingProfileScreen';
import DatingLikesScreen from './src/features/dating/screens/DatingLikesScreen';
import DatingChatsScreen from './src/features/dating/screens/DatingChatsScreen';
import DatingChatScreen from './src/features/dating/screens/DatingChatScreen';
import DatingFiltersScreen from './src/features/dating/screens/DatingFiltersScreen';
import DatingEditProfileScreen from './src/features/dating/screens/DatingEditProfileScreen';
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
        onOpenTaxi={() => navigate('taxi_home')}
        onOpenMusic={() => navigate('music_home')}
        onOpenStreaming={() => navigate('streaming_home')}
        onOpenFlights={() => navigate('flights_home')}
        onOpenBetting={() => navigate('betting_home')}
        onOpenTransport={() => navigate('transport_home')}
        onOpenDelivery={() => navigate('delivery_home')}
        onOpenFormation={() => navigate('formation_home')}
        onOpenSwap={() => navigate('swap_home')}
        onOpenNotebook={() => navigate('notebook_home')}
        onOpenReservation={() => navigate('reservation_home')}
        onOpenServicePerso={() => navigate('service_perso_home')}
        onOpenServicePro={() => navigate('service_pro_home')}
        onOpenServiceDigital={() => navigate('service_digital_home')}
        onOpenServiceMaison={() => navigate('service_maison_home')}
        onOpenWallet={() => navigate('wallet')}
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
      if (screenName === 'settings') navigate('assistant_settings');
      if (screenName === 'history') navigate('assistant_history');
    }} />;
  }
  if (screen === 'assistant_history') {
    content = (
      <AssistantHistoryScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'assistant_settings') {
    content = (
      <AssistantSettingsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
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
        onNavigate={(screenName) => navigate(screenName)}
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
  if (screen === 'seller_dashboard') {
    content = (
      <SellerDashboardScreen
        onBack={() => goBack()}
        onNavigate={(screenName) => navigate(screenName)}
      />
    );
  }
  if (screen === 'seller_orders') {
    content = (
      <SellerOrdersScreen
        onBack={() => goBack()}
      />
    );
  }
  if (screen === 'seller_notifications') {
    content = (
      <SellerNotificationsScreen
        onBack={() => goBack()}
      />
    );
  }
  if (screen === 'seller_analytics') {
    content = (
      <SellerAnalyticsScreen
        onBack={() => goBack()}
      />
    );
  }
  if (screen === 'seller_profile') {
    content = (
      <SellerProfileScreen
        onBack={() => goBack()}
        onOpenAddProduct={() => navigate('market_add_product')}
        onEditProduct={(product) => navigate('market_add_product', { product })}
        onContact={(seller) => navigate('market_seller_contact', { seller })}
        onOpenDashboard={() => navigate('seller_dashboard')}
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
  if (screen === 'loba_packs') {
    content = (
      <LobaPacksScreen
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
  if (screen === 'restaurant_seller_dashboard') {
    content = (
      <RestaurantSellerDashboard
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'restaurant_seller_orders') {
    content = (
      <RestaurantSellerOrdersScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'restaurant_seller_order_detail') {
    content = (
      <RestaurantSellerOrderDetailScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        orderId={screenParams?.orderId}
      />
    );
  }
  if (screen === 'restaurant_seller_assign_courier') {
    content = (
      <RestaurantSellerAssignCourierScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        orderId={screenParams?.orderId}
      />
    );
  }
  if (screen === 'restaurant_seller_notifications') {
    content = (
      <RestaurantSellerNotificationsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'restaurant_seller_couriers') {
    content = (
      <RestaurantSellerMenuScreen
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
  if (screen === 'hotel_notifications') {
    content = (
      <HotelNotificationsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'hotel_history') {
    content = (
      <HotelHistoryScreen
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
  if (screen === 'service_details') {
    content = (
      <ServiceDetailsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'service_booking') {
    content = (
      <ServiceBookingScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'service_checkout') {
    content = (
      <ServiceCheckoutScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'services_orders') {
    content = (
      <ServicesOrdersScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'services_favorites') {
    content = (
      <ServicesFavoritesScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'services_notifications') {
    content = (
      <ServicesNotificationsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'services_profile') {
    content = (
      <ServicesProfileScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'services_providers') {
    content = (
      <ServicesProvidersScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Real Estate / Appartements Screens
  if (screen === 'real_estate_home') {
    content = (
      <RealEstateHomeScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'apartment_details') {
    content = (
      <ApartmentDetailsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'apartment_booking') {
    content = (
      <ApartmentBookingScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'apartment_payment') {
    content = (
      <ApartmentPaymentScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'apartment_favorites') {
    content = (
      <ApartmentFavoritesScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'apartment_search') {
    content = (
      <ApartmentSearchScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'apartment_notifications') {
    content = (
      <ApartmentNotificationsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
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
  if (screen === 'pharmacy_details') {
    content = (
      <PharmacyDetailsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'pharmacy_cart') {
    content = (
      <PharmacyCartScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'pharmacy_checkout') {
    content = (
      <PharmacyCheckoutScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'pharmacy_order') {
    content = (
      <PharmacyOrderScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'pharmacy_profile') {
    content = (
      <PharmacyProfileScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Dating Screens
  if (screen === 'dating_home') {
    content = (
      <DatingHomeScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'dating_profile') {
    content = (
      <DatingProfileScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'dating_likes') {
    content = (
      <DatingLikesScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'dating_chats') {
    content = (
      <DatingChatsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'dating_chat') {
    content = (
      <DatingChatScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
        route={{ params: screenParams }}
      />
    );
  }
  if (screen === 'dating_filters') {
    content = (
      <DatingFiltersScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'dating_edit_profile') {
    content = (
      <DatingEditProfileScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Apartment Profile & Listings
  if (screen === 'apartment_profile') {
    content = (
      <ApartmentProfileScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }
  if (screen === 'apartment_listings') {
    content = (
      <ApartmentListingsScreen
        onBack={() => goBack()}
        onNavigate={(screenName, params) => navigate(screenName, params)}
      />
    );
  }

  // Restaurant Seller Menu (couriers)
  if (screen === 'restaurant_seller_menu') {
    content = (
      <RestaurantSellerMenuScreen
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

  // ============ TAXI SCREENS ============
  if (screen === 'taxi_home') {
    content = <TaxiHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />;
  }
  if (screen === 'taxi_fare') {
    content = <TaxiFareScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />;
  }
  if (screen === 'taxi_search_driver') {
    content = <TaxiSearchDriverScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />;
  }
  if (screen === 'taxi_ride') {
    content = <TaxiRideScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />;
  }
  if (screen === 'taxi_complete') {
    content = <TaxiCompleteScreen onNavigate={(s, p) => navigate(s, p)} />;
  }
  if (screen === 'taxi_rating') {
    content = <TaxiRatingScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />;
  }
  if (screen === 'taxi_history') {
    content = <TaxiHistoryScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />;
  }
  if (screen === 'taxi_favorites') {
    content = <TaxiFavoritesScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />;
  }
  if (screen === 'taxi_coupon') {
    content = <TaxiCouponScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />;
  }
  if (screen === 'taxi_help') {
    content = <TaxiHelpScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />;
  }
  if (screen === 'taxi_emergency') {
    content = <TaxiEmergencyScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />;
  }
  if (screen === 'taxi_settings') {
    content = <TaxiSettingsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />;
  }
  if (screen === 'taxi_receipt') {
    content = <TaxiRideReceiptScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />;
  }
  if (screen === 'taxi_on_duty') {
    content = <PharmacyOnDutyScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />;
  }
  if (screen === 'taxi_driver_verification') {
    content = <TaxiDriverVerificationScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />;
  }
  if (screen === 'taxi_driver_home') {
    content = <TaxiDriverHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />;
  }
  if (screen === 'taxi_driver_ride') {
    content = <TaxiDriverRideScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />;
  }
  if (screen === 'taxi_driver_earnings') {
    content = <TaxiDriverEarningsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />;
  }
  if (screen === 'taxi_driver_profile') {
    content = <TaxiDriverProfileScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />;
  }

  // ============ MUSIC SCREENS ============
  if (screen === 'music_home') { content = <MusicHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'music_player') { content = <MusicPlayerScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'music_library') { content = <MusicLibraryScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'music_search') { content = <MusicSearchScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'music_playlist') { content = <MusicPlaylistScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'music_album') { content = <MusicAlbumScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'music_queue') { content = <MusicQueueScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'music_downloads') { content = <MusicDownloadsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'music_settings') { content = <MusicSettingsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'music_artist') { content = <MusicArtistScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }

  // ============ STREAMING SCREENS ============
  if (screen === 'streaming_home') { content = <StreamingHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'streaming_player') { content = <StreamingPlayerScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'streaming_browse') { content = <StreamingBrowseScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'streaming_library') { content = <StreamingLibraryScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'streaming_details') { content = <StreamingDetailsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'streaming_search') { content = <StreamingSearchScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'streaming_downloads') { content = <StreamingDownloadsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'streaming_settings') { content = <StreamingSettingsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }

  // ============ FLIGHTS SCREENS ============
  if (screen === 'flights_home') { content = <FlightsHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'flights_results') { content = <FlightsResultsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'flights_details') { content = <FlightsDetailsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'flights_booking') { content = <FlightsBookingScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'flights_payment') { content = <FlightsPaymentScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'flights_confirmation') { content = <FlightsConfirmationScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'flights_checkin') { content = <FlightsCheckinScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'flights_history') { content = <FlightsHistoryScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'flights_map') { content = <FlightsMapScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'flights_settings') { content = <FlightsSettingsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }

  // ============ BETTING SCREENS ============
  if (screen === 'betting_home') { content = <BettingHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'betting_live') { content = <BettingLiveScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'betting_match') { content = <BettingMatchDetailScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'betting_slip') { content = <BettingBetSlipScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'betting_my_bets') { content = <BettingMyBetsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'betting_results') { content = <BettingResultsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'betting_live_now') { content = <BettingLiveNowScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'betting_settings') { content = <BettingSettingsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }

  // ============ TRANSPORT SCREENS ============
  if (screen === 'transport_home') { content = <TransportHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'transport_results') { content = <TransportResultsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'transport_details') { content = <TransportDetailsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'transport_booking') { content = <TransportBookingScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'transport_payment') { content = <TransportPaymentScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'transport_confirmation') { content = <TransportConfirmationScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'transport_history') { content = <TransportHistoryScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }

  // ============ DELIVERY SCREENS ============
  if (screen === 'delivery_home') { content = <DeliveryHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'delivery_quote') { content = <DeliveryQuoteScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'delivery_booking') { content = <DeliveryBookingScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'delivery_tracking') { content = <DeliveryTrackingScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'delivery_history') { content = <DeliveryHistoryScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'delivery_settings') { content = <DeliverySettingsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }

  // ============ FORMATION SCREENS ============
  if (screen === 'formation_home') { content = <FormationHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'formation_courses') { content = <FormationCoursesScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'formation_details') { content = <FormationDetailsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'formation_player') { content = <FormationPlayerScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'formation_my_courses') { content = <FormationMyCoursesScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'formation_search') { content = <FormationSearchScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }

  // ============ SWAP SCREENS ============
  if (screen === 'swap_home') { content = <SwapHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'swap_item') { content = <SwapItemDetailScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'swap_post') { content = <SwapPostScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }

  // ============ NOTEBOOK SCREENS ============
  if (screen === 'notebook_home') { content = <NotebookHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'notebook_detail') { content = <NotebookDetailScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'notebook_search') { content = <NotebookSearchScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }

  // ============ RESERVATION SCREENS ============
  if (screen === 'reservation_home') { content = <ReservationHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'reservation_details') { content = <ReservationDetailsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'reservation_create') { content = <ReservationCreateScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }

  // ============ SERVICE_PERSO SCREENS ============
  if (screen === 'service_perso_home') { content = <ServicePersoHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'service_perso_list') { content = <ServicePersoListScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'service_perso_details') { content = <ServicePersoDetailsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'service_perso_booking') { content = <ServicePersoBookingScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }

  // ============ SERVICE_PRO SCREENS ============
  if (screen === 'service_pro_home') { content = <ServiceProHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'service_pro_list') { content = <ServiceProListScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'service_pro_details') { content = <ServiceProDetailsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'service_pro_booking') { content = <ServiceProBookingScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }

  // ============ SERVICE_DIGITAL SCREENS ============
  if (screen === 'service_digital_home') { content = <ServiceDigitalHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'service_digital_list') { content = <ServiceDigitalListScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'service_digital_details') { content = <ServiceDigitalDetailsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'service_digital_booking') { content = <ServiceDigitalBookingScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }

  // ============ SERVICE_MAISON SCREENS ============
  if (screen === 'service_maison_home') { content = <ServiceMaisonHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'service_maison_list') { content = <ServiceMaisonListScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'service_maison_details') { content = <ServiceMaisonDetailsScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }
  if (screen === 'service_maison_booking') { content = <ServiceMaisonBookingScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }

  // ============ MISSING ROUTES (previously had screens but no routes) ============
  if (screen === 'wallet') { content = <WalletScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'wallet_history') { content = <HistoryScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'real_estate_home') { content = <RealEstateHomeScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} />; }
  if (screen === 'assistant') { content = <AssistantScreen onBack={() => goBack()} onNavigate={(s, p) => navigate(s, p)} route={currentRoute} />; }

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
    <ThemeProvider>
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
    </ThemeProvider>
    );
}
