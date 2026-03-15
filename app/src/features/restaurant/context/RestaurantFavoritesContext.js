import React, { createContext, useContext, useState } from 'react';

const RestaurantFavoritesContext = createContext();

export const useRestaurantFavorites = () => useContext(RestaurantFavoritesContext);

export const RestaurantFavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = (restaurantId) => {
    setFavorites(prev => {
      if (prev.includes(restaurantId)) return prev;
      return [...prev, restaurantId];
    });
  };

  const removeFavorite = (restaurantId) => {
    setFavorites(prev => prev.filter(id => id !== restaurantId));
  };

  const isFavorite = (restaurantId) => {
    return favorites.includes(restaurantId);
  };

  const toggleFavorite = (restaurantId) => {
    if (isFavorite(restaurantId)) {
      removeFavorite(restaurantId);
    } else {
      addFavorite(restaurantId);
    }
  };

  const getFavorites = () => favorites;

  const clearFavorites = () => setFavorites([]);

  return (
    <RestaurantFavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      toggleFavorite,
      getFavorites,
      clearFavorites,
    }}>
      {children}
    </RestaurantFavoritesContext.Provider>
  );
};