import React, { createContext, useContext, useState } from 'react';

const RestaurantCartContext = createContext();

export const useRestaurantCart = () => useContext(RestaurantCartContext);

export const RestaurantCartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);

  const addToCart = (item, quantity = 1, addOns = [], notes = '') => {
    setCurrentRestaurant(prev => {
      if (prev && prev.id !== item.restaurantId) {
        // Different restaurant - clear cart first
        setCartItems([]);
        return { id: item.restaurantId, name: item.restaurantName };
      }
      return prev || { id: item.restaurantId, name: item.restaurantName };
    });

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (cartItem) => 
          cartItem.id === item.id && 
          JSON.stringify(cartItem.addOns) === JSON.stringify(addOns)
      );

      const unitPrice = item.price + addOns.reduce((sum, a) => sum + a.price, 0);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].totalPrice = unitPrice * updated[existingIndex].quantity;
        return updated;
      }

      return [...prev, {
        ...item,
        quantity,
        addOns,
        notes,
        totalPrice: unitPrice * quantity
      }];
    });
  };

  const removeFromCart = (itemId, addOns = []) => {
    setCartItems((prev) => 
      prev.filter((item) => 
        !(item.id === itemId && JSON.stringify(item.addOns) === JSON.stringify(addOns))
      )
    );
  };

  const updateQuantity = (itemId, quantity, addOns = []) => {
    if (quantity <= 0) {
      removeFromCart(itemId, addOns);
      return;
    }

    setCartItems((prev) => {
      return prev.map((item) => {
        if (item.id === itemId && JSON.stringify(item.addOns) === JSON.stringify(addOns)) {
          const unitPrice = item.price + item.addOns.reduce((sum, a) => sum + a.price, 0);
          return {
            ...item,
            quantity,
            totalPrice: unitPrice * quantity
          };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCurrentRestaurant(null);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <RestaurantCartContext.Provider value={{
      cartItems,
      currentRestaurant,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </RestaurantCartContext.Provider>
  );
};