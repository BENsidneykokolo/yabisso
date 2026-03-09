import React, { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  const addOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              statusLabel:
                status === 'livre' ? 'Livrée' : status === 'annule' ? 'Annulée' : 'En cours',
              statusColor:
                status === 'livre' ? '#22C55E' : status === 'annule' ? '#EF4444' : '#EAB308',
            }
          : order
      )
    );
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};
