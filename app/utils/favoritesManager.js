/**
 * Favorites Manager - Sistema de favoritos usando localStorage
 * Permite a los usuarios marcar zonas como favoritas sin sobrecargar la UI
 */

const FAVORITES_KEY = 'maptrip_favorites';

/**
 * Obtiene todos los IDs de zonas marcadas como favoritas
 * @returns {number[]} Array de IDs de zonas favoritas
 */
export function getFavorites() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
}

/**
 * Marca o desmarca una zona como favorita
 * @param {number} zoneId - ID de la zona
 * @returns {boolean} true si ahora es favorita, false si se eliminó
 */
export function toggleFavorite(zoneId) {
  if (typeof window === 'undefined') return false;

  try {
    const favorites = getFavorites();
    const index = favorites.indexOf(zoneId);

    if (index > -1) {
      // Ya es favorita, eliminarla
      favorites.splice(index, 1);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return false;
    } else {
      // No es favorita, agregarla
      favorites.push(zoneId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
}

/**
 * Verifica si una zona es favorita
 * @param {number} zoneId - ID de la zona
 * @returns {boolean} true si es favorita
 */
export function isFavorite(zoneId) {
  const favorites = getFavorites();
  return favorites.includes(zoneId);
}

/**
 * Elimina una zona de favoritos
 * @param {number} zoneId - ID de la zona
 */
export function removeFavorite(zoneId) {
  if (typeof window === 'undefined') return;

  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(id => id !== zoneId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
}

/**
 * Limpia todos los favoritos
 */
export function clearFavorites() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('Error clearing favorites:', error);
  }
}
