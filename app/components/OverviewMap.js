'use client';

import { useEffect, useRef, useState } from 'react';

export default function OverviewMap({ mainMap, selectedCountry }) {
  const overviewMapRef = useRef(null);
  const [overviewMap, setOverviewMap] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const rectangleRef = useRef(null);

  useEffect(() => {
    if (!window.google?.maps || !overviewMapRef.current) return;

    // Crear el mini-mapa de overview
    const overview = new window.google.maps.Map(overviewMapRef.current, {
      center: { lat: 0, lng: -70 }, // Centrado en Latinoamérica
      zoom: 3,
      disableDefaultUI: true,
      gestureHandling: 'none',
      zoomControl: false,
      clickableIcons: false,
      draggable: false,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e9ff' }] },
        { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#cbd5e0', weight: 1 }] }
      ]
    });

    setOverviewMap(overview);

    return () => {
      if (rectangleRef.current) {
        rectangleRef.current.setMap(null);
      }
    };
  }, []);

  // Sincronizar el overview map con el mapa principal
  useEffect(() => {
    if (!mainMap || !overviewMap) return;

    const updateOverviewRectangle = () => {
      const bounds = mainMap.getBounds();
      if (!bounds) return;

      // Eliminar rectángulo anterior
      if (rectangleRef.current) {
        rectangleRef.current.setMap(null);
      }

      // Crear nuevo rectángulo que muestre el viewport actual
      const rectangle = new window.google.maps.Rectangle({
        bounds: bounds,
        map: overviewMap,
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        strokeColor: '#2563eb',
        strokeWeight: 2,
        strokeOpacity: 0.8,
      });

      rectangleRef.current = rectangle;
    };

    // Actualizar cuando cambian los bounds del mapa principal
    const listener = mainMap.addListener('bounds_changed', updateOverviewRectangle);

    // Actualizar inmediatamente
    updateOverviewRectangle();

    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [mainMap, overviewMap]);

  // Centrar overview map en el país seleccionado
  useEffect(() => {
    if (!overviewMap || !selectedCountry) return;

    // Coordenadas aproximadas de los países de Latinoamérica
    const countryCoordinates = {
      'AR': { lat: -38.4161, lng: -63.6167, zoom: 4 },
      'BO': { lat: -16.2902, lng: -63.5887, zoom: 5 },
      'BR': { lat: -14.2350, lng: -51.9253, zoom: 4 },
      'CL': { lat: -35.6751, lng: -71.5430, zoom: 4 },
      'CO': { lat: 4.5709, lng: -74.2973, zoom: 5 },
      'CR': { lat: 9.7489, lng: -83.7534, zoom: 7 },
      'CU': { lat: 21.5218, lng: -77.7812, zoom: 6 },
      'DO': { lat: 18.7357, lng: -70.1627, zoom: 7 },
      'EC': { lat: -1.8312, lng: -78.1834, zoom: 6 },
      'SV': { lat: 13.7942, lng: -88.8965, zoom: 8 },
      'GT': { lat: 15.7835, lng: -90.2308, zoom: 7 },
      'HN': { lat: 15.2000, lng: -86.2419, zoom: 7 },
      'MX': { lat: 23.6345, lng: -102.5528, zoom: 5 },
      'NI': { lat: 12.8654, lng: -85.2072, zoom: 7 },
      'PA': { lat: 8.5380, lng: -80.7821, zoom: 7 },
      'PY': { lat: -23.4425, lng: -58.4438, zoom: 6 },
      'PE': { lat: -9.1900, lng: -75.0152, zoom: 5 },
      'PR': { lat: 18.2208, lng: -66.5901, zoom: 9 },
      'UY': { lat: -32.5228, lng: -55.7658, zoom: 6 },
      'VE': { lat: 6.4238, lng: -66.5897, zoom: 5 }
    };

    const coords = countryCoordinates[selectedCountry.country_code];
    if (coords) {
      overviewMap.setCenter({ lat: coords.lat, lng: coords.lng });
      overviewMap.setZoom(coords.zoom);
    }
  }, [overviewMap, selectedCountry]);

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border-2 border-gray-300 transition-all duration-300 z-[1000] ${
        isCollapsed ? 'w-14 h-14' : 'w-64 h-48'
      }`}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Botón de colapsar/expandir */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -top-3 -right-3 bg-white border-2 border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all duration-200 hover:scale-110 z-10"
        title={isCollapsed ? 'Expandir mini-mapa' : 'Colapsar mini-mapa'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-gray-700 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          {isCollapsed ? (
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z" clipRule="evenodd" />
          )}
        </svg>
      </button>

      {!isCollapsed && (
        <>
          {/* Etiqueta del mini-mapa */}
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md z-10 border border-gray-200">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-bold text-gray-700">Vista General</span>
            </div>
          </div>

          {/* Contenedor del mini-mapa */}
          <div
            ref={overviewMapRef}
            className="w-full h-full rounded-xl overflow-hidden"
          />

          {/* Indicador del país seleccionado */}
          {selectedCountry && (
            <div className="absolute bottom-2 left-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1.5 rounded-lg shadow-lg z-10 border border-blue-400">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">{selectedCountry.flag}</span>
                <span className="text-xs font-semibold">{selectedCountry.name}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Versión colapsada - Icono de mapa */}
      {isCollapsed && (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-blue-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}
