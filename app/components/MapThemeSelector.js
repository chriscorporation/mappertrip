'use client';

import { useState, useEffect } from 'react';
import { BiPalette, BiChevronDown, BiChevronUp } from 'react-icons/bi';

const MAP_THEMES = {
  light: {
    id: 'light',
    name: 'Claro',
    icon: '☀️',
    description: 'Estilo limpio y brillante',
    styles: [
      {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#525252' }]
      },
      {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { weight: 2 }]
      },
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#c9c9c9' }, { weight: 1.2 }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }]
      },
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ visibility: 'on' }, { color: '#e8f5e9' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#fef7e6' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#fbc02d' }, { weight: 0.8 }]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#e3f2fd' }]
      }
    ]
  },
  dark: {
    id: 'dark',
    name: 'Oscuro',
    icon: '🌙',
    description: 'Ideal para visión nocturna',
    styles: [
      {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#e0e0e0' }]
      },
      {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [{ visibility: 'on' }, { color: '#1a1a1a' }, { weight: 2 }]
      },
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#3a3a3a' }, { weight: 1.2 }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#1a1a1a' }]
      },
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ visibility: 'on' }, { color: '#1e3a1e' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#2a2a2a' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#3a3a1a' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#7a6e1a' }, { weight: 0.8 }]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{ color: '#2a2a2a' }]
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#0a2540' }]
      }
    ]
  },
  satellite: {
    id: 'satellite',
    name: 'Satélite',
    icon: '🛰️',
    description: 'Vista híbrida realista',
    styles: [] // Satellite uses mapTypeId instead
  },
  highContrast: {
    id: 'highContrast',
    name: 'Alto Contraste',
    icon: '🎯',
    description: 'Máxima visibilidad',
    styles: [
      {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#000000' }]
      },
      {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { weight: 3 }]
      },
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#000000' }, { weight: 2 }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
      },
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ visibility: 'on' }, { color: '#d0f0d0' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#f0f0f0' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#ffffcc' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#ffcc00' }, { weight: 1.5 }]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }]
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#c0d6ff' }]
      }
    ]
  }
};

export default function MapThemeSelector({ currentTheme, onThemeChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 400);
  }, []);

  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
    setIsExpanded(false);
  };

  const currentThemeData = MAP_THEMES[currentTheme] || MAP_THEMES.light;

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-[999]
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header/Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <BiPalette className="text-xl text-purple-600 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-semibold text-sm text-gray-800">
              {currentThemeData.icon} {currentThemeData.name}
            </span>
          </div>
          {isExpanded ? (
            <BiChevronDown className="text-gray-500 text-lg transition-transform duration-300" />
          ) : (
            <BiChevronUp className="text-gray-500 text-lg transition-transform duration-300" />
          )}
        </button>

        {/* Theme Options */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="px-3 pb-3 space-y-1 border-t border-gray-100">
            {Object.values(MAP_THEMES).map((theme, index) => {
              const isActive = currentTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                    }
                  `}
                  style={{
                    animation: isExpanded ? `slideIn 0.3s ease-out ${index * 0.05}s both` : 'none'
                  }}
                >
                  {/* Icon */}
                  <span className="text-2xl">{theme.icon}</span>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <div className={`
                      text-sm font-semibold
                      ${isActive ? 'text-purple-700' : 'text-gray-700'}
                    `}>
                      {theme.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {theme.description}
                    </div>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}

            {/* Info text */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed px-2">
                Cambia el estilo visual del mapa según tus preferencias o condiciones de luz.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export { MAP_THEMES };
