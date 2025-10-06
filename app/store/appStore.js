import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      selectedCountry: null,
      _hasHydrated: false,
      initialZoomDone: {}, // No se persiste - se resetea en cada carga de página

      setSelectedCountry: (country) => set({ selectedCountry: country }),

      clearSelectedCountry: () => set({ selectedCountry: null }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setInitialZoomDone: (countryCode) =>
        set((state) => ({
          initialZoomDone: { ...state.initialZoomDone, [countryCode]: true }
        })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedCountry: state.selectedCountry,
        _hasHydrated: state._hasHydrated,
        // initialZoomDone NO se incluye, por lo que NO se persiste
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
