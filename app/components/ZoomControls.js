'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiMinus, FiMaximize2 } from 'react-icons/fi';

/**
 * ZoomControls - Controles de zoom mejorados con indicador de escala
 *
 * Proporciona controles intuitivos de zoom con:
 * - Botones de zoom in/out con animaciones suaves
 * - Indicador visual del nivel de zoom actual
 * - Presets de zoom rápido (ciudad, barrio, calle)
 * - Indicador de escala en metros/kilómetros
 */
export default function ZoomControls({ map }) {
  const [currentZoom, setCurrentZoom] = useState(3.5);
  const [scale, setScale] = useState('');

  // Actualizar zoom cuando cambie el mapa
  useEffect(() => {
    if (!map) return;

    const zoomListener = map.addListener('zoom_changed', () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      calculateScale(zoom);
    });

    // Inicializar zoom actual
    const initialZoom = map.getZoom();
    setCurrentZoom(initialZoom);
    calculateScale(initialZoom);

    return () => {
      if (zoomListener) {
        window.google.maps.event.removeListener(zoomListener);
      }
    };
  }, [map]);

  // Calcular escala aproximada basada en el nivel de zoom
  const calculateScale = (zoom) => {
    // Fórmula aproximada para Google Maps
    // A zoom 0, la escala es ~40,000 km
    // Cada nivel de zoom duplica el acercamiento
    const metersPerPixel = 156543.03392 * Math.cos(0) / Math.pow(2, zoom);
    const scaleMeters = metersPerPixel * 100; // Asumiendo una barra de 100px

    if (scaleMeters >= 1000) {
      setScale(`${Math.round(scaleMeters / 1000)} km`);
    } else {
      setScale(`${Math.round(scaleMeters)} m`);
    }
  };

  // Obtener el nombre del nivel de zoom
  const getZoomLevelName = (zoom) => {
    if (zoom < 5) return 'Continente';
    if (zoom < 8) return 'País';
    if (zoom < 11) return 'Región';
    if (zoom < 14) return 'Ciudad';
    if (zoom < 16) return 'Barrio';
    if (zoom < 18) return 'Calle';
    return 'Edificio';
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

  const handleZoomPreset = (zoomLevel, name) => {
    if (map) {
      map.setZoom(zoomLevel);
      // Pequeño feedback visual
      const button = document.activeElement;
      if (button) {
        button.classList.add('scale-95');
        setTimeout(() => button.classList.remove('scale-95'), 150);
      }
    }
  };

  const handleResetView = () => {
    if (map) {
      map.setCenter({ lat: 0, lng: -70 });
      map.setZoom(3.5);
    }
  };

  if (!map) return null;

  return (
    <div className="fixed bottom-24 right-6 z-10 flex flex-col gap-3">
      {/* Indicador de nivel de zoom y escala */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-200 p-4 text-center min-w-[140px] transition-all duration-300 hover:shadow-xl">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Nivel de Zoom
        </div>
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-1">
          {currentZoom.toFixed(1)}
        </div>
        <div className="text-xs font-bold text-gray-600 mb-3">
          {getZoomLevelName(currentZoom)}
        </div>

        {/* Barra de escala */}
        <div className="border-t-2 border-gray-300 pt-3 mt-2">
          <div className="flex items-center justify-center gap-2">
            <div className="flex-1 h-1 bg-gradient-to-r from-gray-300 to-gray-600 rounded-full"></div>
            <div className="text-xs font-bold text-gray-700">{scale}</div>
          </div>
        </div>
      </div>

      {/* Controles de zoom */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          disabled={currentZoom >= 21}
          className="w-full p-4 flex items-center justify-center bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group border-b border-gray-200"
          title="Acercar (Zoom In)"
        >
          <FiPlus className="w-5 h-5 text-gray-700 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          disabled={currentZoom <= 1}
          className="w-full p-4 flex items-center justify-center bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group"
          title="Alejar (Zoom Out)"
        >
          <FiMinus className="w-5 h-5 text-gray-700 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
        </button>
      </div>

      {/* Presets de zoom rápido */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-200 p-3 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center mb-2">
          Vista Rápida
        </div>

        {/* Preset: Ciudad */}
        <button
          onClick={() => handleZoomPreset(12, 'Ciudad')}
          className="w-full px-3 py-2 text-xs font-bold text-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
          title="Vista de ciudad (Zoom 12)"
        >
          🏙️ Ciudad
        </button>

        {/* Preset: Barrio */}
        <button
          onClick={() => handleZoomPreset(15, 'Barrio')}
          className="w-full px-3 py-2 text-xs font-bold text-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
          title="Vista de barrio (Zoom 15)"
        >
          🏘️ Barrio
        </button>

        {/* Preset: Calle */}
        <button
          onClick={() => handleZoomPreset(17, 'Calle')}
          className="w-full px-3 py-2 text-xs font-bold text-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
          title="Vista de calle (Zoom 17)"
        >
          🛣️ Calle
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="w-full px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center justify-center gap-2"
          title="Restablecer vista inicial"
        >
          <FiMaximize2 className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
