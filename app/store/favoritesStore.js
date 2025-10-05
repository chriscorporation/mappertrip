import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store de favoritos con persistencia en localStorage
export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],

      // Añadir zona a favoritos
      addFavorite: (zone) => {
        const { favorites } = get();
        if (!favorites.find(fav => fav.id === zone.id)) {
          set({ favorites: [...favorites, {
            id: zone.id,
            address: zone.address,
            color: zone.color,
            lat: zone.lat,
            lng: zone.lng,
            country_code: zone.country_code,
            addedAt: Date.now()
          }] });
          return true;
        }
        return false;
      },

      // Remover zona de favoritos
      removeFavorite: (zoneId) => {
        set({ favorites: get().favorites.filter(fav => fav.id !== zoneId) });
      },

      // Verificar si una zona está en favoritos
      isFavorite: (zoneId) => {
        return get().favorites.some(fav => fav.id === zoneId);
      },

      // Limpiar todos los favoritos
      clearFavorites: () => {
        set({ favorites: [] });
      },

      // Obtener total de favoritos
      getFavoritesCount: () => {
        return get().favorites.length;
      }
    }),
    {
      name: 'maptrip-favorites-storage', // nombre de la clave en localStorage
      version: 1
    }
  )
);
