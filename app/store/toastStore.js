import { create } from 'zustand';

/**
 * Toast Store - Gestión global de notificaciones toast
 */
export const useToastStore = create((set) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();

    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }]
    }));

    // Auto-remove después de la duración
    if (duration) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  }
}));

/**
 * Hook personalizado para usar toasts fácilmente
 */
export const useToast = () => {
  const { addToast } = useToastStore();

  return {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
  };
};
