'use client';

import { useState, useEffect } from 'react';

// Definición de temas de mapa personalizados
export const MAP_THEMES = {
  standard: {
    name: 'Standard',
    icon: '🗺️',
    description: 'Vista estándar de Google Maps',
    styles: []
  },
  highContrast: {
    name: 'High Contrast',
    icon: '⚡',
    description: 'Mayor contraste para mejor legibilidad',
    styles: [
      {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#000000' }]
      },
      {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#ffffff' }, { weight: 3 }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#333333' }, { weight: 1 }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#4da6ff' }]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#e0e0e0' }]
      }
    ]
  },
  night: {
    name: 'Night Mode',
    icon: '🌙',
    description: 'Tema oscuro para ambientes con poca luz',
    styles: [
      {
        featureType: 'all',
        elementType: 'geometry',
        stylers: [{ color: '#242f3e' }]
      },
      {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#746855' }]
      },
      {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#242f3e' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#283d6a' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
      }
    ]
  },
  traveler: {
    name: 'Traveler Friendly',
    icon: '✈️',
    description: 'Optimizado para viajeros, destaca landmarks',
    styles: [
      {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#525252' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#f5f1e6' }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#faf8f3' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#b3d9ff' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#4d7a99' }]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#ffe4b3' }]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#cc8800' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#c8e6c9' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#2e7d32' }]
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{ color: '#ffccbc' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#ffd699' }]
      }
    ]
  }
};

export default function MapThemeSelector({ onThemeChange, currentTheme = 'standard' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeSelect = (themeKey) => {
    setSelectedTheme(themeKey);
    onThemeChange(themeKey);
    setIsOpen(false);
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-lg shadow-lg px-4 py-2.5 flex items-center gap-2 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 group"
        aria-label="Cambiar tema del mapa"
      >
        <span className="text-lg">{MAP_THEMES[selectedTheme]?.icon}</span>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {MAP_THEMES[selectedTheme]?.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel de opciones */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu desplegable */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-800">Map Theme</h3>
              <p className="text-xs text-gray-600 mt-0.5">Choose your preferred map style</p>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto">
              {Object.entries(MAP_THEMES).map(([key, theme]) => {
                const isSelected = selectedTheme === key;

                return (
                  <button
                    key={key}
                    onClick={() => handleThemeSelect(key)}
                    className={`
                      w-full text-left p-3 rounded-lg mb-2 transition-all duration-200
                      ${isSelected
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-400 shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{theme.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                            {theme.name}
                          </span>
                          {isSelected && (
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                          {theme.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Los temas mejoran la visibilidad según tus preferencias
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
