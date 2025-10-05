import { create } from 'zustand';

/**
 * Toast Store - Sistema de notificaciones globales
 *
 * Tipos de toast:
 * - success: Acciones completadas exitosamente (verde)
 * - error: Errores y problemas (rojo)
 * - info: Información general (azul)
 * - warning: Advertencias (amarillo)
 */

export const useToastStore = create((set) => ({
  toasts: [],

  // Añadir una nueva notificación
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();

    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }]
    }));

    // Auto-remover el toast después de la duración especificada
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(toast => toast.id !== id)
      }));
    }, duration);

    return id;
  },

  // Remover un toast específico
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  // Métodos de utilidad para cada tipo
  success: (message, duration) => {
    return useToastStore.getState().addToast(message, 'success', duration);
  },

  error: (message, duration) => {
    return useToastStore.getState().addToast(message, 'error', duration);
  },

  info: (message, duration) => {
    return useToastStore.getState().addToast(message, 'info', duration);
  },

  warning: (message, duration) => {
    return useToastStore.getState().addToast(message, 'warning', duration);
  }
}));
