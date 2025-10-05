import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useHistoryStore = create(
  persist(
    (set, get) => ({
      visitedZones: [],
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      // Agregar una zona al historial (máximo 10 zonas recientes)
      addVisitedZone: (zone) => {
        const { visitedZones } = get();

        // Eliminar duplicados (si ya existe, moverlo al inicio)
        const filtered = visitedZones.filter(z => z.id !== zone.id);

        // Agregar al inicio y mantener solo las últimas 10
        const updated = [
          {
            id: zone.id,
            address: zone.address,
            country_code: zone.country_code,
            color: zone.color,
            lat: zone.lat,
            lng: zone.lng,
            visitedAt: new Date().toISOString()
          },
          ...filtered
        ].slice(0, 10);

        set({ visitedZones: updated });
      },

      // Limpiar historial
      clearHistory: () => {
        set({ visitedZones: [] });
      },

      // Eliminar una zona específica del historial
      removeFromHistory: (zoneId) => {
        const { visitedZones } = get();
        set({ visitedZones: visitedZones.filter(z => z.id !== zoneId) });
      }
    }),
    {
      name: 'maptrip-history',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
