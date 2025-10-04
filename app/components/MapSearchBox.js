'use client';

import { useEffect, useRef, useState } from 'react';

export default function MapSearchBox({ map, onPlaceSelected }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    if (!map || !window.google || !inputRef.current) return;

    // Crear el Autocomplete de Google Places
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'name', 'formatted_address', 'place_id'],
      types: ['geocode', 'establishment'],
    });

    // Listener cuando el usuario selecciona un lugar
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry || !place.geometry.location) {
        console.log('No se encontró geometría para el lugar');
        return;
      }

      // Obtener las coordenadas del lugar
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      // Centrar el mapa en el lugar seleccionado
      map.panTo({ lat, lng });

      // Ajustar el zoom dependiendo del tipo de lugar
      const viewport = place.geometry.viewport;
      if (viewport) {
        map.fitBounds(viewport);
      } else {
        map.setZoom(15); // Zoom por defecto para lugares sin viewport
      }

      // Crear un marcador temporal en el lugar
      const marker = new window.google.maps.Marker({
        map: map,
        position: { lat, lng },
        animation: window.google.maps.Animation.DROP,
        title: place.name || place.formatted_address,
      });

      // Eliminar el marcador después de 5 segundos con fade out
      setTimeout(() => {
        marker.setAnimation(null);
        setTimeout(() => marker.setMap(null), 300);
      }, 5000);

      // Callback opcional
      if (onPlaceSelected) {
        onPlaceSelected({
          lat,
          lng,
          name: place.name,
          address: place.formatted_address,
          placeId: place.place_id
        });
      }

      // Limpiar el input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = '';
          setHasValue(false);
        }
      }, 300);
    });

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [map, onPlaceSelected]);

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      setHasValue(false);
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative group">
      {/* Contenedor del input con efectos */}
      <div
        className={`
          relative flex items-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg
          transition-all duration-300 border-2
          ${isFocused
            ? 'border-blue-500 shadow-2xl scale-105'
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
      >
        {/* Icono de búsqueda */}
        <div className="absolute left-4 flex items-center pointer-events-none">
          <svg
            className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar ciudad, dirección o lugar..."
          className="
            w-full pl-12 pr-12 py-3.5 text-sm font-medium text-gray-700
            placeholder-gray-400 bg-transparent rounded-2xl
            focus:outline-none
          "
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setHasValue(e.target.value.length > 0)}
        />

        {/* Botón de limpiar */}
        {hasValue && (
          <button
            onClick={handleClear}
            className="absolute right-4 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 animate-[fadeIn_0.2s_ease-out]"
            title="Limpiar búsqueda"
          >
            <svg
              className="w-4 h-4 text-gray-500 hover:text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Indicador de ayuda cuando está enfocado */}
      {isFocused && !hasValue && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-blue-50 text-blue-700 text-xs px-4 py-2 rounded-lg shadow-md animate-[fadeIn_0.2s_ease-out] border border-blue-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              💡 Escribe una ciudad, calle o punto de interés para navegar
            </span>
          </div>
        </div>
      )}

      {/* Efecto de brillo animado cuando está enfocado */}
      {isFocused && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20 blur-xl animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
