import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const FAVORITES_KEY = 'user_favorites';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const saved = await SecureStore.getItemAsync(FAVORITES_KEY);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading favorites:', e);
    }
  };

  const saveFavorites = async (newFavorites) => {
    try {
      await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (e) {
      console.log('Error saving favorites:', e);
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(f => f.id === productId);
  };

  const toggleFavorite = async (product) => {
    const isFav = isFavorite(product.id);
    let newFavorites;
    
    if (isFav) {
      newFavorites = favorites.filter(f => f.id !== product.id);
    } else {
      newFavorites = [...favorites, { ...product, addedAt: new Date().toISOString() }];
    }
    
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
    return !isFav;
  };

  const addToCart = (product, quantity = 1, selectedColor = null, selectedModel = null, negotiatedPrice = null) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => 
          item.id === product.id && 
          item.selectedColor === selectedColor && 
          item.selectedModel === selectedModel
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        // Always prefer the negotiated price if provided
        if (negotiatedPrice !== null) {
          updated[existingIndex].negotiatedPrice = negotiatedPrice;
        }
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, {
        ...product,
        quantity,
        selectedColor,
        selectedModel,
        negotiatedPrice,
      }];
    });
  };

  const removeFromCart = (productId, selectedColor = null, selectedModel = null, negotiatedPrice = null) => {
    setCartItems((prev) => 
      prev.filter((item) => 
        !(item.id === productId && 
          item.selectedColor === selectedColor && 
          item.selectedModel === selectedModel &&
          item.negotiatedPrice === negotiatedPrice)
      )
    );
  };

  const updateQuantity = (productId, quantity, selectedColor = null, selectedModel = null, negotiatedPrice = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor, selectedModel, negotiatedPrice);
      return;
    }

    setCartItems((prev) => 
      prev.map((item) => 
        item.id === productId && 
        item.selectedColor === selectedColor && 
        item.selectedModel === selectedModel &&
        item.negotiatedPrice === negotiatedPrice
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
      const price = item.negotiatedPrice || item.discountPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      favorites,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      isFavorite,
      toggleFavorite,
    }}>
      {children}
    </CartContext.Provider>
  );
};
