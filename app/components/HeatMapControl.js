'use client';

import { useEffect, useState } from 'react';

/**
 * HeatMapControl - Control para gestionar la visualización de mapa de calor de criminalidad
 *
 * Este componente permite activar/desactivar una capa de calor que muestra la densidad
 * de zonas peligrosas basándose en las zonas inseguras del mapa.
 */
export default function HeatMapControl({ map, places, selectedCountry, isMapLoading }) {
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [heatMapLayer, setHeatMapLayer] = useState(null);
  const [intensity, setIntensity] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Track heatmap feature usage
  useEffect(() => {
    if (showHeatMap && window.trackFeatureUse) {
      window.trackFeatureUse('heatmap');
    }
  }, [showHeatMap]);

  // Crear y actualizar la capa de calor cuando se activa o cambian los datos
  useEffect(() => {
    if (!map || !window.google?.maps?.visualization?.HeatmapLayer) return;

    // Si showHeatMap está desactivado, eliminar la capa
    if (!showHeatMap) {
      if (heatMapLayer) {
        heatMapLayer.setMap(null);
        setHeatMapLayer(null);
      }
      return;
    }

    // Filtrar lugares según el país seleccionado y nivel de peligro
    const filteredPlaces = selectedCountry
      ? places.filter(p => p.country_code === selectedCountry.country_code)
      : places;

    // Obtener puntos de calor basados en zonas inseguras (rojas y amarillas)
    const heatMapData = [];

    filteredPlaces.forEach(place => {
      // Solo incluir zonas inseguras (rojo) y de precaución (amarillo)
      if (place.color === '#dc2626' || place.color === '#eab308' || place.color === '#f97316') {
        const center = { lat: place.lat, lng: place.lng };

        // Determinar el peso basado en el nivel de peligro
        let weight = 1;
        if (place.color === '#dc2626') {
          weight = 3; // Zonas rojas tienen más peso
        } else if (place.color === '#eab308') {
          weight = 2; // Zonas amarillas tienen peso medio
        } else if (place.color === '#f97316') {
          weight = 1.5; // Zonas naranjas tienen peso bajo-medio
        }

        // Añadir punto central con peso
        heatMapData.push({
          location: new window.google.maps.LatLng(center.lat, center.lng),
          weight: weight
        });

        // Si tiene polígono, añadir puntos adicionales en los vértices para mejor distribución
        if (place.polygon && place.polygon.length > 0) {
          place.polygon.forEach((coord, index) => {
            // Solo tomar algunos vértices para no saturar (cada 2 vértices)
            if (index % 2 === 0) {
              heatMapData.push({
                location: new window.google.maps.LatLng(coord[1], coord[0]),
                weight: weight * 0.7 // Menor peso en los bordes
              });
            }
          });
        }

        // Si tiene círculo, añadir puntos alrededor del círculo
        if (place.circle_radius) {
          const radius = place.circle_radius;
          const numPoints = 8; // 8 puntos alrededor del círculo

          for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * 2 * Math.PI;
            const offsetLat = (radius / 111320) * Math.cos(angle); // Conversión aproximada de metros a grados
            const offsetLng = (radius / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);

            heatMapData.push({
              location: new window.google.maps.LatLng(
                center.lat + offsetLat,
                center.lng + offsetLng
              ),
              weight: weight * 0.6 // Menor peso en el perímetro
            });
          }
        }
      }
    });

    // Si no hay datos de calor, no crear la capa
    if (heatMapData.length === 0) {
      if (heatMapLayer) {
        heatMapLayer.setMap(null);
        setHeatMapLayer(null);
      }
      return;
    }

    // Crear o actualizar la capa de calor
    if (heatMapLayer) {
      heatMapLayer.setData(heatMapData);
      heatMapLayer.setOptions({
        radius: 30,
        opacity: intensity,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });
    } else {
      const newHeatMapLayer = new window.google.maps.visualization.HeatmapLayer({
        data: heatMapData,
        map: map,
        radius: 30,
        opacity: intensity,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });
      setHeatMapLayer(newHeatMapLayer);
    }
  }, [map, showHeatMap, places, selectedCountry, intensity]);

  // Actualizar opacidad cuando cambia la intensidad
  useEffect(() => {
    if (heatMapLayer) {
      heatMapLayer.setOptions({ opacity: intensity });
    }
  }, [intensity, heatMapLayer]);

  // Cerrar configuración al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettings && !event.target.closest('.heatmap-control')) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  // No mostrar el control si el mapa está cargando
  if (isMapLoading) return null;

  return (
    <div className="absolute top-32 right-6 z-20 heatmap-control">
      {/* Botón principal del control */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowHeatMap(!showHeatMap)}
          className={`
            flex items-center gap-3 px-4 py-3 w-full transition-all duration-300
            ${showHeatMap
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
              : 'hover:bg-gray-50'
            }
          `}
          title={showHeatMap ? "Desactivar mapa de calor" : "Activar mapa de calor"}
        >
          <span className={`text-xl ${showHeatMap ? 'animate-pulse' : ''}`}>🔥</span>
          <div className="flex flex-col items-start">
            <span className={`text-sm font-semibold ${showHeatMap ? 'text-white' : 'text-gray-700'}`}>
              Mapa de Calor
            </span>
            <span className={`text-xs ${showHeatMap ? 'text-white/80' : 'text-gray-500'}`}>
              {showHeatMap ? 'Activado' : 'Desactivado'}
            </span>
          </div>
          {showHeatMap && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              className="ml-auto p-1 hover:bg-white/20 rounded-full transition-colors"
              title="Configuración"
            >
              <svg
                className={`w-4 h-4 text-white transition-transform duration-300 ${showSettings ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </button>

        {/* Panel de configuración */}
        {showHeatMap && showSettings && (
          <div className="p-4 bg-white border-t-2 border-gray-200 animate-[fadeIn_0.2s_ease-out]">
            <div className="space-y-3">
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
                  <span>Intensidad</span>
                  <span className="text-orange-600">{Math.round(intensity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.1"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-blue-200 via-purple-300 to-red-400 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-orange-500
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:transition-all
                    [&::-webkit-slider-thumb]:hover:scale-125"
                />
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold">💡 Información:</span> El mapa de calor muestra la densidad de zonas peligrosas.
                  Las áreas rojas indican mayor concentración de riesgo.
                </p>
              </div>

              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <span className="text-lg">⚠️</span>
                <p className="text-xs font-medium text-orange-800">
                  Basado en zonas inseguras registradas
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indicador de ayuda flotante cuando está activado */}
      {showHeatMap && !showSettings && (
        <div className="mt-2 bg-gradient-to-r from-orange-50 to-red-50 backdrop-blur-sm rounded-lg shadow-md border border-orange-200 p-3 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-start gap-2">
            <span className="text-base mt-0.5">🌡️</span>
            <div>
              <p className="text-xs font-semibold text-orange-800 mb-1">
                Mapa de Densidad Activo
              </p>
              <p className="text-xs text-orange-700 leading-relaxed">
                Las áreas más rojas indican mayor concentración de zonas peligrosas
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
