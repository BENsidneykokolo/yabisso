import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1, selectedColor = null, selectedModel = null) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => 
          item.id === product.id && 
          item.selectedColor === selectedColor && 
          item.selectedModel === selectedModel
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, {
        ...product,
        quantity,
        selectedColor,
        selectedModel,
      }];
    });
  };

  const removeFromCart = (productId, selectedColor = null, selectedModel = null) => {
    setCartItems((prev) => 
      prev.filter((item) => 
        !(item.id === productId && 
          item.selectedColor === selectedColor && 
          item.selectedModel === selectedModel)
      )
    );
  };

  const updateQuantity = (productId, quantity, selectedColor = null, selectedModel = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor, selectedModel);
      return;
    }

    setCartItems((prev) => 
      prev.map((item) => 
        item.id === productId && 
        item.selectedColor === selectedColor && 
        item.selectedModel === selectedModel
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};
