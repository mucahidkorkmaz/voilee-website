import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface FavoriteItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  imageUrl?: string | null;
  collection?: string | null;
  addedAt: number;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  favoriteIds: Set<number>;
  isFavorite: (id: number) => boolean;
  addFavorite: (item: Omit<FavoriteItem, "addedAt">) => void;
  removeFavorite: (id: number) => void;
  toggleFavorite: (item: Omit<FavoriteItem, "addedAt">) => void;
  clearFavorites: () => void;
  favoritesCount: number;
}

const STORAGE_KEY = "voilee_favorites";

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setFavorites(parsed);
      }
    } catch (err) {
      console.error("Failed to read favorites from storage", err);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error("Failed to persist favorites", err);
    }
  }, [favorites, isLoaded]);

  const favoriteIds = new Set(favorites.map((f) => f.id));

  const isFavorite = useCallback(
    (id: number) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const addFavorite = useCallback((item: Omit<FavoriteItem, "addedAt">) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) return prev;
      return [{ ...item, addedAt: Date.now() }, ...prev];
    });
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const toggleFavorite = useCallback((item: Omit<FavoriteItem, "addedAt">) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) {
        return prev.filter((f) => f.id !== item.id);
      }
      return [{ ...item, addedAt: Date.now() }, ...prev];
    });
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        clearFavorites,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
