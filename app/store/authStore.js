import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return { success: true };
      } else {
        set({
          isLoading: false,
          error: data.error || 'Credenciales incorrectas'
        });
        return { success: false, error: data.error };
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Error al conectar con el servidor'
      });
      return { success: false, error: 'Error al conectar con el servidor' };
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));
