import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useComparisonStore = create(
  persist(
    (set, get) => ({
      comparedZones: [],
      isDrawerOpen: false,

      // Agregar zona a la comparación (máximo 3)
      addZoneToComparison: (zone) => {
        const { comparedZones } = get();

        // Evitar duplicados
        if (comparedZones.some(z => z.id === zone.id)) {
          return;
        }

        // Límite de 3 zonas
        if (comparedZones.length >= 3) {
          return;
        }

        set({
          comparedZones: [...comparedZones, zone],
          isDrawerOpen: true
        });
      },

      // Eliminar zona de la comparación
      removeZoneFromComparison: (zoneId) => {
        const { comparedZones } = get();
        const filtered = comparedZones.filter(z => z.id !== zoneId);

        set({
          comparedZones: filtered,
          isDrawerOpen: filtered.length > 0
        });
      },

      // Limpiar todas las zonas
      clearComparison: () => {
        set({
          comparedZones: [],
          isDrawerOpen: false
        });
      },

      // Verificar si una zona está en comparación
      isZoneInComparison: (zoneId) => {
        const { comparedZones } = get();
        return comparedZones.some(z => z.id === zoneId);
      },

      // Toggle drawer visibility
      toggleDrawer: () => {
        set((state) => ({ isDrawerOpen: !state.isDrawerOpen }));
      },

      // Abrir drawer
      openDrawer: () => {
        set({ isDrawerOpen: true });
      },

      // Cerrar drawer
      closeDrawer: () => {
        set({ isDrawerOpen: false });
      }
    }),
    {
      name: 'comparison-storage', // nombre en localStorage
      partialize: (state) => ({
        comparedZones: state.comparedZones
      })
    }
  )
);
