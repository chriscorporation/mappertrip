import { create } from 'zustand';

/**
 * Store global para gestionar notificaciones toast
 * Permite mostrar múltiples toasts desde cualquier componente
 */
export const useToastStore = create((set) => ({
  toasts: [],

  showToast: (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }]
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  }
}));
