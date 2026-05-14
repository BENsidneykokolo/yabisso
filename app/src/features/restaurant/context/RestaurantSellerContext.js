import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { database } from '../../../lib/db';
import { Q } from '@nozbe/watermelondb';

const RestaurantSellerContext = createContext();

export function RestaurantSellerProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    revenue: 0,
    todayRevenue: 0,
  });
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRestaurant();
    loadOrders();
    loadCouriers();
  }, []);

  const loadRestaurant = async () => {
    try {
      const saved = await SecureStore.getItemAsync('restaurant_shop_info');
      if (saved) {
        setRestaurant(JSON.parse(saved));
      }
    } catch (e) {
      console.error('[SellerContext] Erreur load restaurant:', e);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const saved = await SecureStore.getItemAsync('restaurant_seller_orders');
      if (saved) {
        setOrders(JSON.parse(saved));
        calculateStats(JSON.parse(saved));
      }
    } catch (e) {
      console.error('[SellerContext] Erreur load orders:', e);
    }
    setLoading(false);
  };

  const loadCouriers = async () => {
    try {
      const saved = await SecureStore.getItemAsync('restaurant_couriers');
      if (saved) {
        setCouriers(JSON.parse(saved));
      } else {
        const defaultCouriers = [
          { id: 'c1', name: 'Jean Kouamé', phone: '+237 6XX XXX XXX', vehicle: 'moto', avatar: null, available: true },
          { id: 'c2', name: 'Marie Fotso', phone: '+237 6XX XXX XXX', vehicle: 'moto', avatar: null, available: true },
          { id: 'c3', name: 'Paul Nguema', phone: '+237 6XX XXX XXX', vehicle: 'voiture', avatar: null, available: false },
        ];
        setCouriers(defaultCouriers);
        await SecureStore.setItemAsync('restaurant_couriers', JSON.stringify(defaultCouriers));
      }
    } catch (e) {
      console.error('[SellerContext] Erreur load couriers:', e);
    }
  };

  const calculateStats = (orderList) => {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    
    let totalOrders = orderList.length;
    let pendingOrders = orderList.filter(o => o.status === 'new' || o.status === 'pending').length;
    let activeOrders = orderList.filter(o => o.status === 'preparing' || o.status === 'ready' || o.status === 'assigned').length;
    let completedOrders = orderList.filter(o => o.status === 'delivered' || o.status === 'completed').length;
    
    let revenue = 0;
    let todayRevenue = 0;
    
    orderList.forEach(o => {
      if (o.status === 'delivered' || o.status === 'completed') {
        revenue += parseInt(o.total || 0);
        if (o.createdAt >= todayStart) {
          todayRevenue += parseInt(o.total || 0);
        }
      }
    });
    
    setStats({ totalOrders, pendingOrders, activeOrders, completedOrders, revenue, todayRevenue });
  };

  const addOrder = async (order) => {
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      status: 'new',
      createdAt: Date.now(),
      items: order.items || [],
    };
    
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    calculateStats(updatedOrders);
    
    await SecureStore.setItemAsync('restaurant_seller_orders', JSON.stringify(updatedOrders));
    
    return newOrder;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus, updatedAt: Date.now() } : o
    );
    setOrders(updatedOrders);
    calculateStats(updatedOrders);
    await SecureStore.setItemAsync('restaurant_seller_orders', JSON.stringify(updatedOrders));
  };

  const assignCourier = async (orderId, courierId) => {
    const courier = couriers.find(c => c.id === courierId);
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, courierId, courierName: courier?.name, status: 'assigned', updatedAt: Date.now() } : o
    );
    setOrders(updatedOrders);
    calculateStats(updatedOrders);
    await SecureStore.setItemAsync('restaurant_seller_orders', JSON.stringify(updatedOrders));
    
    const notification = {
      id: Date.now().toString(),
      type: 'courier_assigned',
      title: 'Livreur assigné',
      message: `${courier?.name} a été assigné à la commande`,
      orderId,
      createdAt: Date.now(),
      read: false,
    };
    
    const saved = await SecureStore.getItemAsync('restaurant_seller_notifications') || '[]';
    const notifications = JSON.parse(saved);
    notifications.unshift(notification);
    await SecureStore.setItemAsync('restaurant_seller_notifications', JSON.stringify(notifications));
  };

  const getOrderById = (orderId) => {
    return orders.find(o => o.id === orderId);
  };

  const value = {
    restaurant,
    orders,
    stats,
    couriers,
    loading,
    addOrder,
    updateOrderStatus,
    assignCourier,
    getOrderById,
    loadOrders,
    setRestaurant,
  };

  return (
    <RestaurantSellerContext.Provider value={value}>
      {children}
    </RestaurantSellerContext.Provider>
  );
}

export function useRestaurantSeller() {
  const context = useContext(RestaurantSellerContext);
  if (!context) {
    throw new Error('useRestaurantSeller must be used within RestaurantSellerProvider');
  }
  return context;
}

export default RestaurantSellerContext;