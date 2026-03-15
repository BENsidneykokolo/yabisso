import React, { createContext, useContext, useState } from 'react';

const RestaurantOrdersContext = createContext();

export const useRestaurantOrders = () => useContext(RestaurantOrdersContext);

export const RestaurantOrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  const addOrder = (orderData) => {
    const newOrder = {
      id: `CMD-${Date.now()}`,
      ...orderData,
      date: new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      createdAt: Date.now(),
      status: 'en_cours',
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const getOrders = () => orders;

  const clearOrders = () => {
    setOrders([]);
  };

  return (
    <RestaurantOrdersContext.Provider value={{
      orders,
      addOrder,
      updateOrderStatus,
      getOrders,
      clearOrders,
    }}>
      {children}
    </RestaurantOrdersContext.Provider>
  );
};