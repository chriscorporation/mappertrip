'use client';

import { useState, useEffect } from 'react';

export default function MapLayersControl({
  airbnbs = [],
  coworkingPlaces = [],
  instagramablePlaces = [],
  places = [],
  onLayersChange
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [layers, setLayers] = useState({
    zones: true,
    airbnbs: true,
    coworking: true,
    instagramable: true,
  });

  // Notificar cambios al componente padre
  useEffect(() => {
    if (onLayersChange) {
      onLayersChange(layers);
    }
  }, [layers, onLayersChange]);

  // Cargar preferencias guardadas
  useEffect(() => {
    const savedLayers = localStorage.getItem('mapLayers');
    if (savedLayers) {
      try {
        setLayers(JSON.parse(savedLayers));
      } catch (e) {
        console.error('Error loading map layers:', e);
      }
    }
  }, []);

  // Guardar preferencias
  const toggleLayer = (layerName) => {
    const newLayers = { ...layers, [layerName]: !layers[layerName] };
    setLayers(newLayers);
    localStorage.setItem('mapLayers', JSON.stringify(newLayers));
  };

  const allLayersEnabled = Object.values(layers).every(v => v);
  const toggleAll = () => {
    const newValue = !allLayersEnabled;
    const newLayers = {
      zones: newValue,
      airbnbs: newValue,
      coworking: newValue,
      instagramable: newValue,
    };
    setLayers(newLayers);
    localStorage.setItem('mapLayers', JSON.stringify(newLayers));
  };

  // Contar elementos
  const counts = {
    zones: places?.length || 0,
    airbnbs: airbnbs?.length || 0,
    coworking: coworkingPlaces?.length || 0,
    instagramable: instagramablePlaces?.length || 0,
  };

  const totalActive = Object.entries(layers).filter(([key, value]) => value).length;

  if (!isVisible) return null;

  return (
    <div className="absolute top-36 right-6 z-20 flex flex-col items-end gap-2">
      {/* Botón principal compacto */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-gray-200 px-4 py-3 hover:scale-105 transition-all duration-300 group flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]"
          title="Control de capas del mapa"
        >
          <span className="text-xl group-hover:scale-110 transition-transform duration-200 inline-block">
            🗂️
          </span>
          <span className="text-sm font-semibold text-gray-700">
            Capas ({totalActive}/4)
          </span>
        </button>
      )}

      {/* Panel expandido */}
      {isExpanded && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-200 p-4 min-w-[280px] animate-[fadeIn_0.2s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">🗂️</span>
              <h3 className="font-bold text-sm text-gray-800">Control de Capas</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
                title="Minimizar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
                title="Cerrar panel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Botón toggle all */}
          <button
            onClick={toggleAll}
            className={`
              w-full mb-3 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-between
              ${allLayersEnabled
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>{allLayersEnabled ? '✓ Todas activas' : 'Activar todas'}</span>
            <span className="text-xs opacity-80">{totalActive}/4</span>
          </button>

          {/* Layer toggles */}
          <div className="space-y-2">
            {/* Zonas de Seguridad */}
            <button
              onClick={() => toggleLayer('zones')}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 group
                ${layers.zones
                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 shadow-sm'
                  : 'bg-gray-50 border-2 border-gray-200 opacity-60 hover:opacity-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${layers.zones
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md'
                    : 'bg-gray-300'
                  }
                `}>
                  <span className="text-lg">{layers.zones ? '🛡️' : '🔒'}</span>
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${layers.zones ? 'text-purple-900' : 'text-gray-600'}`}>
                    Zonas de Seguridad
                  </p>
                  <p className="text-xs text-gray-500">{counts.zones} zonas</p>
                </div>
              </div>
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${layers.zones ? 'border-purple-600 bg-purple-600' : 'border-gray-400'}
              `}>
                {layers.zones && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>

            {/* Airbnbs */}
            <button
              onClick={() => toggleLayer('airbnbs')}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 group
                ${layers.airbnbs
                  ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-300 shadow-sm'
                  : 'bg-gray-50 border-2 border-gray-200 opacity-60 hover:opacity-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${layers.airbnbs
                    ? 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-md'
                    : 'bg-gray-300'
                  }
                `}>
                  <span className="text-lg">{layers.airbnbs ? '🏠' : '🔒'}</span>
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${layers.airbnbs ? 'text-pink-900' : 'text-gray-600'}`}>
                    Airbnbs
                  </p>
                  <p className="text-xs text-gray-500">{counts.airbnbs} propiedades</p>
                </div>
              </div>
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${layers.airbnbs ? 'border-pink-600 bg-pink-600' : 'border-gray-400'}
              `}>
                {layers.airbnbs && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>

            {/* Coworking */}
            <button
              onClick={() => toggleLayer('coworking')}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 group
                ${layers.coworking
                  ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-300 shadow-sm'
                  : 'bg-gray-50 border-2 border-gray-200 opacity-60 hover:opacity-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${layers.coworking
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md'
                    : 'bg-gray-300'
                  }
                `}>
                  <span className="text-lg">{layers.coworking ? '💼' : '🔒'}</span>
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${layers.coworking ? 'text-cyan-900' : 'text-gray-600'}`}>
                    Coworking
                  </p>
                  <p className="text-xs text-gray-500">{counts.coworking} espacios</p>
                </div>
              </div>
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${layers.coworking ? 'border-cyan-600 bg-cyan-600' : 'border-gray-400'}
              `}>
                {layers.coworking && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>

            {/* Instagramable */}
            <button
              onClick={() => toggleLayer('instagramable')}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 group
                ${layers.instagramable
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-sm'
                  : 'bg-gray-50 border-2 border-gray-200 opacity-60 hover:opacity-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${layers.instagramable
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-600 shadow-md'
                    : 'bg-gray-300'
                  }
                `}>
                  <span className="text-lg">{layers.instagramable ? '📸' : '🔒'}</span>
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${layers.instagramable ? 'text-amber-900' : 'text-gray-600'}`}>
                    Instagrameables
                  </p>
                  <p className="text-xs text-gray-500">{counts.instagramable} lugares</p>
                </div>
              </div>
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${layers.instagramable ? 'border-amber-600 bg-amber-600' : 'border-gray-400'}
              `}>
                {layers.instagramable && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          </div>

          {/* Info footer */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 italic text-center">
              💡 Haz clic para mostrar/ocultar capas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
