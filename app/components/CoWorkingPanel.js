'use client';

import { useRef, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { BiCoffee, BiMapPin, BiTrash, BiWifi } from 'react-icons/bi';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';

export default function CoWorkingPanel({
  selectedCountry,
  coworkingPlaces,
  onAddCoworkingPlace,
  onDeleteCoworkingPlace,
  onGoToPlace,
  mapBounds
}) {
  const { isAuthenticated } = useAuthStore();
  const isAdminMode = isAuthenticated;
  const [searchQuery, setSearchQuery] = useState('');
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        setTimeout(initAutocomplete, 100);
        return;
      }

      if (!autocompleteRef.current && inputRef.current && selectedCountry && mapBounds) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            componentRestrictions: { country: selectedCountry.country_code.toLowerCase() },
            bounds: mapBounds,
            strictBounds: false
          }
        );

        const listener = autocompleteRef.current.addListener('place_changed', async () => {
          const place = autocompleteRef.current.getPlace();

          if (place.geometry) {
            const placeData = {
              id: Date.now(),
              title: place.name,
              description: place.formatted_address,
              link: place.url || '',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              place_id: place.place_id,
              country_code: selectedCountry.country_code,
            };

            onAddCoworkingPlace(placeData);
            setSearchQuery('');
          }
        });

        return () => {
          if (listener) {
            window.google.maps.event.removeListener(listener);
          }
        };
      }
    };

    initAutocomplete();
  }, [selectedCountry, onAddCoworkingPlace, mapBounds]);

  // Actualizar bounds cuando cambia el mapa
  useEffect(() => {
    if (autocompleteRef.current && mapBounds) {
      autocompleteRef.current.setBounds(mapBounds);
    }
  }, [mapBounds]);

  if (!selectedCountry) {
    return (
      <div className="w-80 bg-white border-r border-gray-300 p-4">
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          CoWorking
        </h2>
        <p className="text-gray-500 text-sm">Selecciona un país primero</p>
      </div>
    );
  }

  const countryPlaces = coworkingPlaces.filter(p => p.country_code === selectedCountry.country_code);

  return (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
          <HiOutlineOfficeBuilding className="text-blue-600" />
          CoWorking
        </h2>
        <p className="text-xs text-gray-600 mt-1 font-medium">{selectedCountry.name}</p>
      </div>

      {isAdminMode && (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-white to-blue-50">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cafés, oficinas, espacios..."
            className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 hover:border-blue-300"
          />
          <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
            <BiWifi className="text-sm" />
            Espacios para trabajar remotamente
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {countryPlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-6xl mb-4 animate-bounce">☕</div>
            <p className="text-gray-500 text-sm text-center font-medium">
              No hay espacios agregados
            </p>
            <p className="text-gray-400 text-xs text-center mt-1">
              {selectedCountry.name}
            </p>
          </div>
        ) : (
          countryPlaces.map((place, index) => (
            <div
              key={place.id}
              className="p-3 bg-gradient-to-br from-white to-blue-50 rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-[fadeIn_0.3s_ease-out]"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => onGoToPlace(place)}
            >
              <div className="mb-2">
                <h3 className="font-bold text-sm mb-2 text-gray-800 hover:text-blue-600 transition-colors duration-200 flex items-start gap-2 hover:translate-x-1">
                  <BiCoffee className="text-blue-500 text-lg flex-shrink-0 mt-0.5" />
                  <span className="flex-1">{place.title}</span>
                </h3>
                <div className="flex items-start gap-1.5 mb-2">
                  <BiMapPin className="text-gray-400 text-sm flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 flex-1">{place.description}</p>
                </div>
                {place.link && (
                  <a
                    href={place.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full hover:from-blue-200 hover:to-cyan-200 transition-all duration-200 hover:scale-105 border border-blue-200"
                  >
                    <BiMapPin className="text-sm" />
                    Ver en Google Maps
                  </a>
                )}
              </div>
              {isAdminMode && (
                <div className="flex justify-end items-center pt-2 border-t border-blue-100 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlaceToDelete(placeToDelete === place.id ? null : place.id);
                    }}
                    className="p-2 rounded-lg hover:bg-blue-100 text-blue-500 transition-all duration-200 hover:scale-110 relative"
                    title="Eliminar"
                  >
                    <BiTrash className="h-5 w-5" />
                    {placeToDelete === place.id && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-3 w-48 z-10 border-2 border-blue-200 animate-[fadeIn_0.2s_ease-out]">
                        <p className="text-xs text-gray-700 mb-3 font-medium">¿Eliminar este lugar?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlaceToDelete(null);
                            }}
                            className="flex-1 px-2 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCoworkingPlace(place.id);
                              setPlaceToDelete(null);
                            }}
                            className="flex-1 px-2 py-1.5 text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 hover:scale-105 font-semibold"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
