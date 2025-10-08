'use client';

import { useEffect, useRef, useState } from 'react';
import { BiMap, BiX, BiCurrentLocation } from 'react-icons/bi';

export default function MiniMap({ selectedCountry, places, onNavigateToPlace, currentPlace }) {
  const miniMapRef = useRef(null);
  const [miniMapInstance, setMiniMapInstance] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const markersRef = useRef([]);

  // Inicializar minimapa cuando se expande
  useEffect(() => {
    if (!isExpanded || !selectedCountry || !window.google || !miniMapRef.current) return;

    // Obtener zonas del país seleccionado
    const countryPlaces = places.filter(p => p.country_code === selectedCountry.country_code);
    if (countryPlaces.length === 0) return;

    // Calcular bounds del país
    const bounds = new window.google.maps.LatLngBounds();
    countryPlaces.forEach(place => {
      if (place.polygon && place.polygon.length > 0) {
        place.polygon.forEach(coord => {
          bounds.extend({ lat: coord.lat, lng: coord.lng });
        });
      } else if (place.lat && place.lng) {
        bounds.extend({ lat: parseFloat(place.lat), lng: parseFloat(place.lng) });
      }
    });

    // Crear minimapa
    const mapInstance = new window.google.maps.Map(miniMapRef.current, {
      center: bounds.getCenter(),
      zoom: 6,
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      styles: [
        { featureType: 'all', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', elementType: 'all', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f0f0f0' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e6ff' }] },
      ],
    });

    // Ajustar vista a las zonas
    mapInstance.fitBounds(bounds);

    setMiniMapInstance(mapInstance);

    return () => {
      // Limpiar marcadores
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [isExpanded, selectedCountry, places]);

  // Renderizar marcadores de zonas
  useEffect(() => {
    if (!miniMapInstance || !selectedCountry) return;

    // Limpiar marcadores previos
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const countryPlaces = places.filter(p => p.country_code === selectedCountry.country_code);

    countryPlaces.forEach(place => {
      let position;

      // Calcular posición central
      if (place.polygon && place.polygon.length > 0) {
        const avgLat = place.polygon.reduce((sum, coord) => sum + coord.lat, 0) / place.polygon.length;
        const avgLng = place.polygon.reduce((sum, coord) => sum + coord.lng, 0) / place.polygon.length;
        position = { lat: avgLat, lng: avgLng };
      } else if (place.lat && place.lng) {
        position = { lat: parseFloat(place.lat), lng: parseFloat(place.lng) };
      } else {
        return;
      }

      // Crear marcador simple
      const marker = new window.google.maps.Marker({
        position,
        map: miniMapInstance,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: currentPlace?.id === place.id ? 8 : 5,
          fillColor: place.color || '#4285F4',
          fillOpacity: currentPlace?.id === place.id ? 1 : 0.7,
          strokeColor: '#ffffff',
          strokeWeight: currentPlace?.id === place.id ? 3 : 2,
        },
        title: place.address || 'Zona',
        clickable: true,
      });

      // Click en marcador para navegar
      marker.addListener('click', () => {
        onNavigateToPlace(place);
        setIsExpanded(false);
      });

      markersRef.current.push(marker);
    });
  }, [miniMapInstance, selectedCountry, places, onNavigateToPlace, currentPlace]);

  // No mostrar si no hay país seleccionado
  if (!selectedCountry) return null;

  const countryPlaces = places.filter(p => p.country_code === selectedCountry.country_code);
  if (countryPlaces.length === 0) return null;

  return (
    <div className="absolute top-6 right-6 z-40">
      {/* Botón colapsado */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-white rounded-full shadow-xl px-4 py-3 flex items-center gap-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 group"
          aria-label="Abrir minimapa"
        >
          <BiMap className="text-xl text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
            Navegación
          </span>
        </button>
      )}

      {/* Minimapa expandido */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BiMap className="text-white text-lg" />
              <div>
                <h3 className="text-white font-bold text-sm">Navegación Rápida</h3>
                <p className="text-white/80 text-xs">{selectedCountry.name}</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
              aria-label="Cerrar"
            >
              <BiX className="text-xl" />
            </button>
          </div>

          {/* Mapa */}
          <div className="relative">
            <div
              ref={miniMapRef}
              className="w-full h-64 bg-gray-100"
            />

            {/* Overlay de ayuda */}
            <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
              <div className="flex items-start gap-2">
                <BiCurrentLocation className="text-blue-600 text-sm mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700 leading-tight">
                  Click en cualquier punto para navegar a esa zona
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              {countryPlaces.length} {countryPlaces.length === 1 ? 'zona mapeada' : 'zonas mapeadas'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
