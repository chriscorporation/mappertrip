'use client';

import { useState, useEffect } from 'react';
import { BiPlus, BiMinus } from 'react-icons/bi';

export default function MapZoomControl({ map }) {
  const [zoom, setZoom] = useState(3.5);
  const [scale, setScale] = useState('');

  useEffect(() => {
    if (!map) return;

    // Listener para actualizar el zoom y escala cuando cambia
    const zoomListener = map.addListener('zoom_changed', () => {
      const currentZoom = map.getZoom();
      setZoom(currentZoom);
      updateScale(currentZoom);
    });

    // Actualizar escala inicial
    updateScale(map.getZoom());

    return () => {
      if (window.google?.maps?.event) {
        window.google.maps.event.removeListener(zoomListener);
      }
    };
  }, [map]);

  // Calcular la escala basada en el nivel de zoom
  // Aproximación basada en latitud 0° (ecuador)
  const updateScale = (zoomLevel) => {
    // Escala aproximada en metros por pixel a nivel del ecuador
    // Zoom 0 = ~156,000 km por pixel
    // Cada nivel de zoom divide la escala por 2
    const metersPerPixel = 156543.03392 * Math.cos(0) / Math.pow(2, zoomLevel);

    // Calcular una escala de referencia visual (100px en pantalla)
    const referencePixels = 100;
    const metersAtReference = metersPerPixel * referencePixels;

    let scaleText = '';
    if (metersAtReference >= 1000) {
      const km = Math.round(metersAtReference / 1000);
      if (km >= 1000) {
        scaleText = `${(km / 1000).toFixed(1)} k km`;
      } else if (km >= 100) {
        scaleText = `${Math.round(km / 100) * 100} km`;
      } else if (km >= 10) {
        scaleText = `${Math.round(km / 10) * 10} km`;
      } else {
        scaleText = `${km} km`;
      }
    } else {
      const meters = Math.round(metersAtReference);
      if (meters >= 100) {
        scaleText = `${Math.round(meters / 100) * 100} m`;
      } else if (meters >= 10) {
        scaleText = `${Math.round(meters / 10) * 10} m`;
      } else {
        scaleText = `${meters} m`;
      }
    }

    setScale(scaleText);
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

  if (!map) return null;

  return (
    <div className="fixed top-24 left-6 z-[999] flex flex-col gap-3">
      {/* Controles de Zoom */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 21}
          className="w-10 h-10 flex items-center justify-center border-b border-gray-200 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white group"
          aria-label="Acercar zoom"
        >
          <BiPlus className="text-xl text-gray-600 group-hover:text-blue-600 transition-colors" />
        </button>

        <button
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white group"
          aria-label="Alejar zoom"
        >
          <BiMinus className="text-xl text-gray-600 group-hover:text-blue-600 transition-colors" />
        </button>
      </div>

      {/* Indicador de Escala */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 px-3 py-2">
        <div className="flex flex-col items-center gap-1">
          {/* Barra de escala visual */}
          <div className="relative w-24 h-1 bg-gray-300 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500" />
            {/* Marcas de división */}
            <div className="absolute top-0 left-1/4 w-px h-full bg-white/50" />
            <div className="absolute top-0 left-2/4 w-px h-full bg-white" />
            <div className="absolute top-0 left-3/4 w-px h-full bg-white/50" />
          </div>

          {/* Texto de escala */}
          <div className="text-xs font-semibold text-gray-700">
            {scale}
          </div>

          {/* Hint visual */}
          <div className="text-[10px] text-gray-400 tracking-tight">
            escala aprox.
          </div>
        </div>
      </div>
    </div>
  );
}
