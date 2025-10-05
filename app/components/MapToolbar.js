'use client';

import { useState, useEffect, useRef } from 'react';

// Estilos de mapa disponibles
const MAP_STYLES = {
  standard: {
    name: 'Estándar',
    icon: '🗺️',
  },
  dark: {
    name: 'Oscuro',
    icon: '🌙',
  },
  safety: {
    name: 'Seguridad',
    icon: '🛡️',
  }
};

// Niveles de seguridad para la leyenda
const SAFETY_LEVELS = [
  { color: 'green', label: 'Zona Segura', borderColor: 'border-green-600', bgColor: 'bg-green-500/20', hoverBg: 'hover:bg-green-50' },
  { color: 'blue', label: 'Seguridad Media', borderColor: 'border-blue-600', bgColor: 'bg-blue-500/20', hoverBg: 'hover:bg-blue-50' },
  { color: 'orange', label: 'Seguridad Regular', borderColor: 'border-orange-600', bgColor: 'bg-orange-500/20', hoverBg: 'hover:bg-orange-50' },
  { color: 'yellow', label: 'Precaución', borderColor: 'border-yellow-600', bgColor: 'bg-yellow-500/20', hoverBg: 'hover:bg-yellow-50' },
  { color: 'red', label: 'Zona Insegura', borderColor: 'border-red-600', bgColor: 'bg-red-500/20', hoverBg: 'hover:bg-red-50' },
];

export default function MapToolbar({ mapStyle, onMapStyleChange, onToggleLegend, showLegend }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'legend' | 'styles' | null
  const toolbarRef = useRef(null);

  // Cerrar paneles al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setActivePanel(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div
      ref={toolbarRef}
      className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-[fadeIn_0.5s_ease-out]"
    >
      {/* Main Toolbar */}
      <div className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl border-2 border-gray-200/50 px-2 py-2 flex items-center gap-1">

        {/* Legend Button */}
        <button
          onClick={() => togglePanel('legend')}
          className={`
            relative px-4 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 group
            ${activePanel === 'legend'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
              : 'hover:bg-gray-100 text-gray-700'
            }
          `}
          title="Leyenda de seguridad"
        >
          <span className="text-lg group-hover:scale-110 transition-transform duration-200">
            🛡️
          </span>
          <span className="text-sm font-semibold hidden sm:inline">
            Leyenda
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Map Style Button */}
        <button
          onClick={() => togglePanel('styles')}
          className={`
            relative px-4 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 group
            ${activePanel === 'styles'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
              : 'hover:bg-gray-100 text-gray-700'
            }
          `}
          title="Estilo del mapa"
        >
          <span className="text-lg group-hover:scale-110 transition-transform duration-200">
            {MAP_STYLES[mapStyle]?.icon || '🗺️'}
          </span>
          <span className="text-sm font-semibold hidden sm:inline">
            {MAP_STYLES[mapStyle]?.name || 'Estilo'}
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300"></div>

        {/* Zoom Info (optional decorative element) */}
        <div className="px-3 py-2 text-xs text-gray-500 font-medium hidden md:flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Zoom</span>
        </div>
      </div>

      {/* Legend Panel */}
      {activePanel === 'legend' && (
        <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-200 p-4 w-72 animate-[slideUp_0.3s_ease-out]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              Niveles de Seguridad
            </h3>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              title="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {SAFETY_LEVELS.map((level, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 group ${level.hoverBg}`}
              >
                <div className={`w-8 h-4 rounded border-2 ${level.borderColor} ${level.bgColor} flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200`}></div>
                <span className="text-xs font-medium text-gray-700">{level.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 italic">
              📍 Haz clic en una zona para ver detalles
            </p>
          </div>
        </div>
      )}

      {/* Map Styles Panel */}
      {activePanel === 'styles' && (
        <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden min-w-[220px] animate-[slideUp_0.3s_ease-out]">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-800">Estilo del Mapa</h3>
            <button
              onClick={() => setActivePanel(null)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              title="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {Object.entries(MAP_STYLES).map(([key, style]) => (
            <button
              key={key}
              onClick={() => {
                onMapStyleChange(key);
                setActivePanel(null);
              }}
              className={`
                w-full px-4 py-3 flex items-center gap-3 transition-all duration-200
                ${mapStyle === key
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-600'
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <span className="text-xl">{style.icon}</span>
              <span className={`text-sm font-medium ${mapStyle === key ? 'text-blue-700 font-bold' : 'text-gray-700'}`}>
                {style.name}
              </span>
              {mapStyle === key && (
                <svg className="w-5 h-5 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
