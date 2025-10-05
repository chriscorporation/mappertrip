/**
 * User Preferences Manager
 * Manages user preferences using localStorage for persistence across sessions
 */

const PREFERENCES_KEY = 'mappertrip_user_preferences';

const DEFAULT_PREFERENCES = {
  mapStyle: 'standard', // 'standard', 'dark', 'safety'
  mapType: 'roadmap', // 'roadmap', 'satellite', 'hybrid', 'terrain'
  statsPanelCollapsed: false,
  overviewMapCollapsed: true,
  searchFilters: {},
  lastSelectedCountry: null,
  hoverEnabled: false,
};

/**
 * Get all user preferences
 * @returns {Object} User preferences object
 */
export const getPreferences = () => {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return DEFAULT_PREFERENCES;

    const parsed = JSON.parse(stored);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (error) {
    console.error('Error loading preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Get a specific preference value
 * @param {string} key - The preference key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} The preference value
 */
export const getPreference = (key, defaultValue = null) => {
  const prefs = getPreferences();
  return prefs[key] !== undefined ? prefs[key] : defaultValue;
};

/**
 * Set a specific preference
 * @param {string} key - The preference key
 * @param {*} value - The value to set
 */
export const setPreference = (key, value) => {
  if (typeof window === 'undefined') return;

  try {
    const current = getPreferences();
    const updated = { ...current, [key]: value };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving preference:', error);
  }
};

/**
 * Set multiple preferences at once
 * @param {Object} preferences - Object with preference key-value pairs
 */
export const setPreferences = (preferences) => {
  if (typeof window === 'undefined') return;

  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

/**
 * Clear all preferences
 */
export const clearPreferences = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error('Error clearing preferences:', error);
  }
};

/**
 * Reset to default preferences
 */
export const resetPreferences = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(DEFAULT_PREFERENCES));
  } catch (error) {
    console.error('Error resetting preferences:', error);
  }
};
