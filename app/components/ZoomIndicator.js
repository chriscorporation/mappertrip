'use client';

import { useState, useEffect } from 'react';
import { BiZoomIn, BiZoomOut, BiCurrentLocation } from 'react-icons/bi';

export default function ZoomIndicator({ map }) {
  const [zoomLevel, setZoomLevel] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!map) return;

    const handleZoomChanged = () => {
      const currentZoom = map.getZoom();
      setZoomLevel(currentZoom);

      // Mostrar el indicador cuando cambia el zoom
      setIsVisible(true);
      setHasInteracted(true);

      // Ocultar automáticamente después de 3 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    };

    // Listener para cambios de zoom
    const listener = map.addListener('zoom_changed', handleZoomChanged);

    // Obtener zoom inicial
    handleZoomChanged();

    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [map]);

  // Determinar el contexto según el nivel de zoom
  const getZoomContext = (zoom) => {
    if (!zoom) return { level: 'Desconocido', description: '', color: 'gray', recommendation: '' };

    if (zoom <= 4) {
      return {
        level: 'Continental',
        description: 'Vista de continentes',
        color: 'blue',
        recommendation: 'Acerca para ver países',
        icon: '🌎'
      };
    } else if (zoom <= 6) {
      return {
        level: 'Regional',
        description: 'Vista de múltiples países',
        color: 'indigo',
        recommendation: 'Acerca para ver ciudades',
        icon: '🗺️'
      };
    } else if (zoom <= 10) {
      return {
        level: 'Nacional',
        description: 'Vista de país completo',
        color: 'purple',
        recommendation: 'Nivel ideal para ver zonas',
        icon: '📍'
      };
    } else if (zoom <= 13) {
      return {
        level: 'Ciudad',
        description: 'Vista de ciudad y zonas',
        color: 'green',
        recommendation: '✓ Zoom ideal para zonas de seguridad',
        icon: '🏙️'
      };
    } else if (zoom <= 16) {
      return {
        level: 'Barrio',
        description: 'Vista detallada de barrios',
        color: 'emerald',
        recommendation: 'Excelente para explorar áreas',
        icon: '🏘️'
      };
    } else {
      return {
        level: 'Calle',
        description: 'Vista de calles individuales',
        color: 'teal',
        recommendation: 'Máximo detalle disponible',
        icon: '🛣️'
      };
    }
  };

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom();
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom();
      map.setZoom(currentZoom - 1);
    }
  };

  const handleResetZoom = () => {
    if (map) {
      // Zoom óptimo para ver zonas de seguridad
      map.setZoom(11);
    }
  };

  if (!map || zoomLevel === null) return null;

  const context = getZoomContext(zoomLevel);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600',
    teal: 'from-teal-500 to-teal-600',
    gray: 'from-gray-500 to-gray-600',
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40">
      {/* Indicador principal */}
      <div
        className={`
          bg-white rounded-2xl shadow-2xl border border-gray-200
          transition-all duration-500 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => {
          // Solo ocultar si el usuario ya ha interactuado
          if (hasInteracted) {
            const timer = setTimeout(() => setIsVisible(false), 2000);
            return () => clearTimeout(timer);
          }
        }}
      >
        {/* Header con gradiente según nivel */}
        <div className={`bg-gradient-to-r ${colorClasses[context.color]} px-5 py-3 rounded-t-2xl`}>
          <div className="flex items-center justify-between gap-6">
            {/* Nivel de zoom */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">{context.icon}</div>
              <div>
                <div className="text-white font-bold text-sm flex items-center gap-2">
                  Nivel {Math.round(zoomLevel)}
                  <span className="text-white/80 font-normal">• {context.level}</span>
                </div>
                <div className="text-white/90 text-xs">{context.description}</div>
              </div>
            </div>

            {/* Controles de zoom */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-all duration-200 hover:scale-110"
                aria-label="Alejar"
                title="Alejar"
              >
                <BiZoomOut className="text-lg" />
              </button>

              <button
                onClick={handleResetZoom}
                className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-all duration-200 hover:scale-110"
                aria-label="Zoom óptimo"
                title="Ir a zoom óptimo para zonas"
              >
                <BiCurrentLocation className="text-lg" />
              </button>

              <button
                onClick={handleZoomIn}
                className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-all duration-200 hover:scale-110"
                aria-label="Acercar"
                title="Acercar"
              >
                <BiZoomIn className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Recomendación contextual */}
        <div className="px-5 py-3 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs text-gray-600 font-medium text-center">
              {context.recommendation}
            </p>
          </div>
        </div>

        {/* Barra de progreso visual del zoom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colorClasses[context.color]} transition-all duration-300`}
            style={{ width: `${(zoomLevel / 21) * 100}%` }}
          />
        </div>
      </div>

      {/* Indicador compacto cuando está oculto (aparece al hacer hover en el área) */}
      {!isVisible && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300"
          onMouseEnter={() => setIsVisible(true)}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2 border border-gray-200 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-lg">{context.icon}</span>
              <span className="text-xs font-semibold text-gray-700">
                Nivel {Math.round(zoomLevel)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
