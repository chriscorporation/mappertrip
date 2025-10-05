import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOnboardingStore = create(
  persist(
    (set) => ({
      hasCompletedTour: false,
      currentStep: 0,
      isActive: false,

      startTour: () => set({ isActive: true, currentStep: 0 }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({
        currentStep: Math.max(0, state.currentStep - 1)
      })),
      skipTour: () => set({ isActive: false, hasCompletedTour: true }),
      completeTour: () => set({ isActive: false, hasCompletedTour: true }),
      resetTour: () => set({ hasCompletedTour: false, currentStep: 0, isActive: false }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
