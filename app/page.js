'use client';

import { useState, useRef, useEffect } from 'react';
import GoogleMap from './components/GoogleMap';
import Sidebar from './components/Sidebar';
import CountriesPanel from './components/CountriesPanel';
import ZonesPanel from './components/ZonesPanel';
import AirbnbPanel from './components/AirbnbPanel';

export default function Home() {
  const [address, setAddress] = useState('');
  const [airbnbLink, setAirbnbLink] = useState('');
  const [airbnbLocation, setAirbnbLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [airbnbs, setAirbnbs] = useState([]);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [selectedTab, setSelectedTab] = useState('countries');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        setTimeout(initAutocomplete, 100);
        return;
      }

      // Solo crear si no existe
      if (!autocompleteRef.current && inputRef.current) {
        // Crear el autocomplete
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['sublocality', 'locality', 'administrative_area_level_3'], // Priorizar barrios y ciudades
            // Sin restricciones de país - búsqueda global
          }
        );

        // Listener cuando se selecciona un lugar
        const listener = autocompleteRef.current.addListener('place_changed', async () => {
          const place = autocompleteRef.current.getPlace();

          if (place.geometry) {
            const placeData = {
              id: Date.now(),
              address: place.formatted_address,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              placeId: place.place_id,
              polygon: null,
              isDrawing: false,
              color: '#22c55e',
              country_code: selectedCountry?.country_code || 'AR',
            };

            setPlaces(prev => [placeData, ...prev]);
            setSelectedPlace(placeData);
            setAddress('');
          }
        });

        // Cleanup function
        return () => {
          if (listener) {
            window.google.maps.event.removeListener(listener);
          }
        };
      }
    };

    initAutocomplete();
  }, []);

  const handleStartDrawing = (placeId) => {
    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        return { ...p, isDrawing: !p.isDrawing };
      }
      return { ...p, isDrawing: false };
    }));
  };

  const handleSavePolygon = async (placeId, polygon) => {
    const place = places.find(p => p.id === placeId);

    // Guardar en Supabase
    if (place) {
      try {
        const response = await fetch('/api/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: place.address,
            lat: place.lat,
            lng: place.lng,
            placeId: place.placeId,
            polygon,
            color: place.color,
            country_code: selectedCountry?.country_code || 'AR'
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Error guardando:', error);
          return;
        }

        const savedPlace = await response.json();

        // Actualizar el estado con el ID de Supabase
        setPlaces(prev => prev.map(p =>
          p.id === placeId ? { ...savedPlace, isDrawing: false } : p
        ));
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const confirmDelete = async () => {
    if (!placeToDelete) return;

    const place = places.find(p => p.id === placeToDelete);

    setPlaces(prev => prev.filter(p => p.id !== placeToDelete));

    // Solo eliminar de Supabase si tiene polígono guardado
    if (place && place.polygon) {
      await fetch(`/api/places?id=${placeToDelete}`, {
        method: 'DELETE'
      });
    }

    setPlaceToDelete(null);
  };

  const handleColorChange = async (placeId, color) => {
    const place = places.find(p => p.id === placeId);

    setPlaces(prev => prev.map(p =>
      p.id === placeId ? { ...p, color } : p
    ));

    // Solo actualizar en Supabase si tiene polígono guardado
    if (place && place.polygon) {
      await fetch('/api/places', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: place.id,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          placeId: place.placeId,
          polygon: place.polygon,
          color
        })
      });
    }
  };

  const handleGoToPlace = (place) => {
    setSelectedPlace(place);
  };

  const handleViewAirbnbLocation = async () => {
    if (!airbnbLink) return;

    try {
      const response = await fetch('/api/scrape-airbnb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: airbnbLink })
      });

      const data = await response.json();

      if (response.ok && data.lat && data.lng) {
        setAirbnbLocation({
          lat: data.lat,
          lng: data.lng
        });
        setSelectedPlace({
          lat: data.lat,
          lng: data.lng
        });
      } else {
        alert(data.error || 'No se encontraron coordenadas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener ubicación');
    }
  };

  // Cargar lugares y airbnbs desde Supabase al iniciar
  useEffect(() => {
    let isMounted = true;

    const loadPlaces = async () => {
      try {
        const response = await fetch('/api/places');
        const loadedPlaces = await response.json();

        if (isMounted && loadedPlaces && loadedPlaces.length > 0) {
          const placesWithDrawing = loadedPlaces.map(p => ({
            id: p.id,
            address: p.address,
            lat: parseFloat(p.lat),
            lng: parseFloat(p.lng),
            placeId: p.place_id,
            polygon: p.polygon,
            color: p.color,
            country_code: p.country_code,
            isDrawing: false
          }));
          setPlaces(placesWithDrawing);
        }
      } catch (error) {
        console.error('Error loading places:', error);
      }
    };

    const loadAirbnbs = async () => {
      try {
        const response = await fetch('/api/airbnb');
        const loadedAirbnbs = await response.json();
        if (isMounted && loadedAirbnbs) {
          setAirbnbs(loadedAirbnbs);
        }
      } catch (error) {
        console.error('Error loading airbnbs:', error);
      }
    };

    loadPlaces();
    loadAirbnbs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setSelectedTab('zones');

    // Primero calcular bounds para zonas
    const countryPlaces = places.filter(p => p.country_code === country.country_code);

    // Esperar a que el estado se actualice antes de ajustar el mapa
    setTimeout(() => {
      if (countryPlaces.length > 0) {
        if (countryPlaces.length === 1) {
          // Si solo hay una zona, centrar en ella
          setSelectedPlace(countryPlaces[0]);
        } else {
          // Si hay múltiples zonas, ajustar el mapa para ver todas
          setSelectedPlace({
            fitBounds: true,
            places: countryPlaces
          });
        }
      }
    }, 100);
  };

  const handleDeletePlace = (placeId, confirm = false) => {
    if (confirm) {
      const place = places.find(p => p.id === placeId);
      setPlaces(prev => prev.filter(p => p.id !== placeId));

      if (place && place.polygon) {
        fetch(`/api/places?id=${placeId}`, { method: 'DELETE' });
      }
      setPlaceToDelete(null);
    } else {
      setPlaceToDelete(placeToDelete === placeId ? null : placeId);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar con tabs */}
      <Sidebar
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        selectedCountry={selectedCountry}
        isZonesEnabled={!!selectedCountry}
      />

      {/* Panel de contenido según tab seleccionado */}
      {selectedTab === 'countries' && (
        <CountriesPanel
          selectedCountry={selectedCountry}
          onSelectCountry={handleSelectCountry}
        />
      )}

      {selectedTab === 'zones' && (
        <ZonesPanel
          selectedCountry={selectedCountry}
          places={places}
          onStartDrawing={handleStartDrawing}
          onDeletePlace={handleDeletePlace}
          onColorChange={handleColorChange}
          onGoToPlace={handleGoToPlace}
          placeToDelete={placeToDelete}
          onAddPlace={(placeData) => {
            setPlaces(prev => [placeData, ...prev]);
            setSelectedPlace(placeData);
          }}
        />
      )}

      {selectedTab === 'airbnb' && (
        <AirbnbPanel
          onGoToLocation={setSelectedPlace}
          selectedCountry={selectedCountry}
        />
      )}

      {/* Panel viejo temporal - lo quitaremos después */}
      <div className="w-1/3 p-8 bg-gray-50 overflow-y-auto hidden">
        <h1 className="text-2xl font-bold mb-2">Airbnb</h1>
        <div className="mb-6">
          <label htmlFor="airbnb" className="block text-sm font-medium text-gray-700 mb-2">
            Link de Airbnb
          </label>
          <input
            id="airbnb"
            type="text"
            value={airbnbLink}
            onChange={(e) => setAirbnbLink(e.target.value)}
            placeholder="https://www.airbnb.com/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleViewAirbnbLocation}
            className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver ubicación
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6">Buscador de Direcciones</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              ref={inputRef}
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ingresa una dirección..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tarjetas de lugares */}
          <div className="space-y-3">
            {places.map(place => (
              <div key={place.id} className="p-4 bg-white rounded-lg shadow">
                <div className="mb-3">
                  <h3
                    className="font-semibold text-sm mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleGoToPlace(place)}
                  >
                    {place.address}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Lat: {place.lat?.toFixed(6)}, Lng: {place.lng?.toFixed(6)}
                  </p>
                  {place.polygon && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Zona delimitada
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-around items-center pt-3 border-t border-gray-200">
                  <input
                    type="color"
                    value={place.color}
                    onChange={(e) => handleColorChange(place.id, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-2 border-gray-300"
                    title="Color del polígono"
                  />
                  <button
                    onClick={() => handleStartDrawing(place.id)}
                    className={`p-2 rounded hover:bg-gray-100 ${place.isDrawing ? 'bg-blue-100' : ''}`}
                    title="Delimitar zona"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setPlaceToDelete(placeToDelete === place.id ? null : place.id)}
                      className="p-2 rounded hover:bg-red-100 text-red-600"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {placeToDelete === place.id && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-3 w-48 z-10 border border-gray-200">
                        <p className="text-xs text-gray-700 mb-3">¿Eliminar este lugar?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPlaceToDelete(null)}
                            className="flex-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={confirmDelete}
                            className="flex-1 px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho - Mapa de Google */}
      <div className="w-2/3">
        <GoogleMap
          selectedPlace={selectedPlace}
          places={places}
          airbnbs={airbnbs.filter(a => a.country_code === selectedCountry?.country_code)}
          airbnbLocation={airbnbLocation}
          onSavePolygon={handleSavePolygon}
        />
      </div>

    </div>
  );
}
