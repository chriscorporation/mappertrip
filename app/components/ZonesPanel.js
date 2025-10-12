'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { BiDollar, BiShield, BiMapAlt, BiInfoCircle, BiMapPin, BiCircle, BiError, BiErrorCircle, BiXCircle, BiShieldAlt2, BiRightArrowCircle } from 'react-icons/bi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import { cleanPostalCode } from '../utils/postalCodeRegex';
import ContextBar from './ContextBar';
import SafeRoutePlanner from './SafeRoutePlanner';

export default function ZonesPanel({
  selectedCountry,
  places,
  insecurityLevels = [],
  onStartDrawing,
  onDeletePlace,
  onColorChange,
  onTuristicChange,
  onGoToPlace,
  placeToDelete,
  highlightedPlace,
  onAddPlace,
  onMapClickModeChange,
  pendingCircle,
  setPendingCircle,
  circleRadius,
  setCircleRadius,
  editingCircleId,
  setEditingCircleId,
  editingRadius,
  setEditingRadius,
  onUpdatePlace,
  map
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const isAdminMode = isAuthenticated;
  const [address, setAddress] = useState('');
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const [notes, setNotes] = useState({});
  const [newNote, setNewNote] = useState({});
  const [perplexityData, setPerplexityData] = useState(null);
  const [selectedZoneAddress, setSelectedZoneAddress] = useState('');
  const [showPerplexityPanel, setShowPerplexityPanel] = useState(false);
  const [loadingPerplexity, setLoadingPerplexity] = useState(false);
  const [loadingAI, setLoadingAI] = useState({});
  const [duplicateError, setDuplicateError] = useState('');
  const [mapClickMode, setMapClickMode] = useState(false);
  const [circleMode, setCircleMode] = useState(false);
  const [pendingPlace, setPendingPlace] = useState(null);
  const [pendingPlaceName, setPendingPlaceName] = useState('');
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const cardRefs = useRef({});
  const perplexityPanelRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const previousPlacesCountRef = useRef(places.length);
  const pollingIntervalRef = useRef(null);

  // Detectar cuando se agrega una nueva zona y hacer scroll
  useEffect(() => {
    const countryPlaces = places.filter(p => p.country_code === selectedCountry?.country_code);
    const previousCount = previousPlacesCountRef.current;

    // Si se agregó una nueva zona
    if (countryPlaces.length > previousCount) {
      // Hacer scroll al inicio
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }

    previousPlacesCountRef.current = countryPlaces.length;
  }, [places, selectedCountry]);

  // Cleanup polling interval on unmount or panel close
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showPerplexityPanel && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [showPerplexityPanel]);

  // Notificar cuando cambia el modo de clic del mapa
  useEffect(() => {
    if (onMapClickModeChange) {
      const isActive = mapClickMode || circleMode;
      onMapClickModeChange(isActive, (lat, lng) => {
        if (circleMode) {
          setPendingCircle({ lat, lng });
        } else if (mapClickMode) {
          setPendingPlace({ lat, lng });
        }
      });
    }
  }, [mapClickMode, circleMode]);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        setTimeout(initAutocomplete, 100);
        return;
      }

      if (!autocompleteRef.current && inputRef.current && selectedCountry) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            componentRestrictions: { country: selectedCountry.country_code.toLowerCase() }
          }
        );

        const listener = autocompleteRef.current.addListener('place_changed', async () => {
          const place = autocompleteRef.current.getPlace();

          if (place.geometry) {
            // Verificar si ya existe una zona con la misma dirección en el estado local
            const countryPlaces = places.filter(p => {
    if (!p || !selectedCountry) return false;
    // Mostrar todas EXCEPTO las que tienen active = null (no matchearon con geo_json)
    return p.country_code === selectedCountry.country_code && p.active !== null;
  });
            const isDuplicate = countryPlaces.some(p =>
              p.address.toLowerCase() === place.formatted_address.toLowerCase() ||
              p.placeId === place.place_id
            );

            if (isDuplicate) {
              setDuplicateError('Esta zona ya existe');
              setTimeout(() => setDuplicateError(''), 3000);
              setAddress('');
              return;
            }

            // Limpiar el formatted_address eliminando códigos postales según el país
            const cleanAddress = cleanPostalCode(place.formatted_address, selectedCountry.country_code);

            const defaultLevel = insecurityLevels.find(l => l.id === 0) || insecurityLevels[0];
            const placeData = {
              id: Date.now(),
              address: cleanAddress,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              placeId: place.place_id,
              polygon: null,
              isDrawing: true, // Activar modo de dibujo automáticamente
              insecurity_level_id: 0, // Default: seguro
              color: defaultLevel?.color || '#00C853',
              country_code: selectedCountry.country_code,
            };

            onAddPlace(placeData);
            setAddress('');
            setDuplicateError('');
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
  }, [selectedCountry, onAddPlace]);

  // Las notas ahora vienen incluidas en el objeto place.notes desde la API
  // Este useEffect se mantiene solo para sincronizar el estado local cuando cambian los lugares
  useEffect(() => {
    const syncNotes = () => {
      if (!selectedCountry || !places.length) return;

      const countryPlaces = places.filter(p => {
    if (!p || !selectedCountry) return false;
    // Mostrar todas EXCEPTO las que tienen active = null (no matchearon con geo_json)
    return p.country_code === selectedCountry.country_code && p.active !== null;
  });
      const updatedNotes = {};

      countryPlaces.forEach(place => {
        if (place.notes) {
          updatedNotes[place.id] = place.notes;
        }
      });

      setNotes(updatedNotes);
    };

    syncNotes();
  }, [places, selectedCountry]);

  // Scroll a la card cuando se resalta
  useEffect(() => {
    if (highlightedPlace && cardRefs.current[highlightedPlace]) {
      cardRefs.current[highlightedPlace].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [highlightedPlace]);

  const handleAddNote = async (placeId) => {
    const noteText = newNote[placeId]?.trim();
    if (!noteText) return;

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_text: noteText,
          related_type: 'zone',
          related_id: placeId
        })
      });

      const savedNote = await response.json();
      setNotes(prev => ({
        ...prev,
        [placeId]: [...(prev[placeId] || []), savedNote]
      }));
      setNewNote(prev => ({ ...prev, [placeId]: '' }));
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleDeleteNote = async (noteId, placeId) => {
    try {
      await fetch(`/api/notes?id=${noteId}`, { method: 'DELETE' });
      setNotes(prev => ({
        ...prev,
        [placeId]: prev[placeId].filter(note => note.id !== noteId)
      }));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleUpdateRadius = async (placeId, newRadius) => {
    try {
      await fetch('/api/places', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: placeId,
          circle_radius: newRadius
        })
      });

      // Actualizar el estado del padre
      if (onUpdatePlace) {
        onUpdatePlace(placeId, { circle_radius: newRadius });
      }

      setEditingCircleId(null);
    } catch (error) {
      console.error('Error updating radius:', error);
    }
  };

  const handleUpdateTitle = async (placeId, newTitle) => {
    if (!newTitle.trim()) {
      setEditingTitleId(null);
      return;
    }

    try {
      await fetch('/api/places', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: placeId,
          address: newTitle.trim()
        })
      });

      // Actualizar el estado del padre
      if (onUpdatePlace) {
        onUpdatePlace(placeId, { address: newTitle.trim() });
      }

      setEditingTitleId(null);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  // Función para alternar filtros
  const toggleFilter = (levelId) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(levelId)) {
        newFilters.delete(levelId);
      } else {
        newFilters.add(levelId);
      }
      return newFilters;
    });
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setActiveFilters(new Set());
  };

  if (!selectedCountry) {
    return (
      <div className="w-80 bg-white border-r border-gray-300 p-4">
        <h2 className="text-xl font-bold mb-4">Zones</h2>
        <p className="text-gray-500 text-sm">Selecciona un país primero</p>
      </div>
    );
  }

  const countryPlaces = places.filter(p => {
    if (!p || !selectedCountry) return false;
    // Mostrar todas EXCEPTO las que tienen active = null (no matchearon con geo_json)
    const matchesCountry = p.country_code === selectedCountry.country_code && p.active !== null;

    // Si hay filtros activos, aplicarlos
    if (activeFilters.size > 0) {
      return matchesCountry && activeFilters.has(p.safety_level_id);
    }

    return matchesCountry;
  });

  return (
    <div className="flex">
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      {/* Context Bar with Breadcrumb Navigation */}
      <ContextBar
        selectedCountry={selectedCountry}
        zoneCount={countryPlaces.length}
        onBackToCountries={() => router.push('/?tab=countries')}
      />

      {isAdminMode && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Buscar zona o barrio..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={() => {
                setMapClickMode(!mapClickMode);
                if (circleMode) setCircleMode(false);
              }}
              className={`p-2 rounded-lg border ${mapClickMode ? 'bg-blue-100 border-blue-500' : 'border-gray-300 hover:bg-gray-100'} cursor-pointer`}
              title="Seleccionar ubicación en el mapa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => {
                setCircleMode(!circleMode);
                if (mapClickMode) setMapClickMode(false);
              }}
              className={`p-2 rounded-lg border ${circleMode ? 'bg-purple-100 border-purple-500' : 'border-gray-300 hover:bg-gray-100'} cursor-pointer`}
              title="Crear zona circular"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
          </div>
          {duplicateError && (
            <p className="text-xs text-red-600 mt-1">{duplicateError}</p>
          )}
          {mapClickMode && (
            <p className="text-xs text-blue-600 mt-1">Haz clic en el mapa para seleccionar una ubicación</p>
          )}
          {circleMode && (
            <p className="text-xs text-purple-600 mt-1">Haz clic en el mapa para crear una zona circular</p>
          )}
        </div>
      )}

      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={hoverEnabled}
            onChange={(e) => setHoverEnabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span>Activar roll over</span>
        </label>
      </div>

      {/* Quick Filters Section */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-left group"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-xs font-semibold text-gray-700">
              Filtros rápidos
            </span>
            {activeFilters.size > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {activeFilters.size}
              </span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showFilters && (
          <div className="mt-3 space-y-2 animate-fadeIn">
            {insecurityLevels.map((level) => {
              const isActive = activeFilters.has(level.id);
              const count = places.filter(p =>
                p.country_code === selectedCountry?.country_code &&
                p.active !== null &&
                p.safety_level_id === level.id
              ).length;

              if (count === 0) return null;

              return (
                <button
                  key={level.id}
                  onClick={() => toggleFilter(level.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all duration-200
                    ${isActive
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: level.color }}
                    />
                    <span className={`text-xs font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                      {level.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                      {count}
                    </span>
                    {isActive && (
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}

            {activeFilters.size > 0 && (
              <button
                onClick={clearAllFilters}
                className="w-full mt-2 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Safe Route Planner Button */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <button
          onClick={() => setShowRoutePlanner(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
        >
          <BiRightArrowCircle className="text-xl" />
          <span className="text-sm">Planificar Ruta Segura</span>
        </button>
        <p className="text-xs text-gray-600 text-center mt-2">
          Verifica si tu ruta cruza zonas seguras
        </p>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {pendingPlace && (
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-400">
            <input
              type="text"
              value={pendingPlaceName}
              onChange={(e) => setPendingPlaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pendingPlaceName.trim()) {
                  const defaultLevel = insecurityLevels.find(l => l.id === 0) || insecurityLevels[0];
                  const placeData = {
                    id: Date.now(),
                    address: pendingPlaceName.trim(),
                    lat: pendingPlace.lat,
                    lng: pendingPlace.lng,
                    placeId: null,
                    polygon: null,
                    isDrawing: true, // Activar modo de dibujo automáticamente
                    insecurity_level_id: 0, // Default: seguro
                    color: defaultLevel?.color || '#00C853',
                    country_code: selectedCountry.country_code,
                  };
                  onAddPlace(placeData);
                  setPendingPlace(null);
                  setPendingPlaceName('');
                  setMapClickMode(false);
                }
              }}
              placeholder="Nombre de la zona..."
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
            <p className="text-xs text-gray-600 mt-2">
              Lat: {pendingPlace.lat.toFixed(6)}, Lng: {pendingPlace.lng.toFixed(6)}
            </p>
          </div>
        )}
        {pendingCircle && (
          <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-400">
            <input
              type="text"
              value={pendingPlaceName}
              onChange={(e) => setPendingPlaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pendingPlaceName.trim()) {
                  const medioLevel = insecurityLevels.find(l => l.id === 1) || insecurityLevels[0];
                  const placeData = {
                    id: Date.now(),
                    address: pendingPlaceName.trim(),
                    lat: pendingCircle.lat,
                    lng: pendingCircle.lng,
                    placeId: null,
                    polygon: null,
                    circle_radius: circleRadius,
                    isDrawing: false,
                    insecurity_level_id: 1, // Default: medio (azul) para círculos
                    color: medioLevel?.color || '#2196F3',
                    country_code: selectedCountry.country_code,
                  };
                  onAddPlace(placeData);
                  setPendingCircle(null);
                  setPendingPlaceName('');
                  setCircleMode(false);
                }
              }}
              placeholder="Título de la zona circular..."
              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-3"
              autoFocus
            />
            <label className="block text-xs text-gray-700 mb-1">
              Radio: {(circleRadius / 1000).toFixed(1)}km
            </label>
            <input
              type="range"
              min="1000"
              max="3000"
              step="100"
              value={circleRadius}
              onChange={(e) => setCircleRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-600 mt-2">
              Lat: {pendingCircle.lat.toFixed(6)}, Lng: {pendingCircle.lng.toFixed(6)}
            </p>
          </div>
        )}
        {countryPlaces.length === 0 && !pendingPlace ? (
          <div className="text-center mt-8">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-sm mb-2">
              {activeFilters.size > 0
                ? 'No hay zonas con los filtros seleccionados'
                : `No hay zonas creadas para ${selectedCountry.name}`
              }
            </p>
            {activeFilters.size > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          countryPlaces.map(place => (
            <div
              key={place.id}
              ref={el => cardRefs.current[place.id] = el}
              className={`p-3 bg-gradient-to-br from-white to-gray-50 rounded-xl transition-all duration-300 ease-out transform ${
                hoverEnabled ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:from-blue-50 hover:to-cyan-50' : ''
              } ${
                highlightedPlace === place.id
                  ? 'border-2 border-blue-400 shadow-md scale-[1.02]'
                  : 'border border-gray-200'
              }`}
              onMouseEnter={() => hoverEnabled && onGoToPlace(place)}
            >
              <div className="mb-2">
                <div className="flex items-start justify-between mb-2">
                  {editingTitleId === place.id ? (
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateTitle(place.id, tempTitle);
                        } else if (e.key === 'Escape') {
                          setEditingTitleId(null);
                        }
                      }}
                      onBlur={() => handleUpdateTitle(place.id, tempTitle)}
                      className="flex-1 px-2 py-1 text-sm font-semibold border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <h3
                      className="font-semibold text-sm mb-1 cursor-pointer hover:text-blue-600 transition-all duration-200 flex-1 hover:translate-x-1"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingTitleId(place.id);
                        setTempTitle(place.address);
                      }}
                      onClick={async () => {
                    // Limpiar intervalo previo si existe
                    if (pollingIntervalRef.current) {
                      clearInterval(pollingIntervalRef.current);
                      pollingIntervalRef.current = null;
                    }

                    // Posicionar en el mapa
                    onGoToPlace(place);

                    // Cargar datos de Perplexity con spinner
                    setLoadingPerplexity(true);
                    setShowPerplexityPanel(true);
                    setSelectedZoneAddress(place.address);
                    setPerplexityData(null);

                    try {
                      // Función para cargar datos de Perplexity
                      const loadPerplexityData = async () => {
                        const response = await fetch(`/api/perplexity-notes?zone_id=${place.id}`);
                        const data = await response.json();

                        // Verificar si hay datos disponibles
                        const hasData = data && (data.notes || data.rent || data.tourism || data.secure || data.places);

                        if (hasData) {
                          setPerplexityData(data);
                          setLoadingPerplexity(false);

                          // Limpiar el intervalo
                          if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                            pollingIntervalRef.current = null;
                          }

                          // Scroll al inicio del panel
                          setTimeout(() => {
                            if (perplexityPanelRef.current) {
                              perplexityPanelRef.current.scrollTop = 0;
                            }
                          }, 0);
                        }

                        return hasData;
                      };

                      // Intentar cargar datos inmediatamente
                      const hasData = await loadPerplexityData();

                      // Si no hay datos, iniciar polling cada 5 segundos
                      if (!hasData) {
                        pollingIntervalRef.current = setInterval(async () => {
                          await loadPerplexityData();
                        }, 5000);
                      }
                    } catch (error) {
                      console.error('Error loading perplexity data:', error);
                      setLoadingPerplexity(false);
                    }
                  }}
                    >
                      {place.address}
                    </h3>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Ver en Google Maps"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>

                {/* Safety Status Badge - Dinámico desde BD */}
                <div className="mb-2">
                  {(() => {
                    const currentLevel = insecurityLevels.find(l => l.id === (place.safety_level_id ?? 0));
                    if (!currentLevel) return null;

                    return (
                      <span
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                        style={{
                          background: `linear-gradient(to right, ${currentLevel.gradient_from}, ${currentLevel.gradient_to})`,
                          color: '#ffffff'
                        }}
                      >
                        <BiCircle className="animate-pulse mr-1.5" /> {currentLevel.name}
                      </span>
                    );
                  })()}
                </div>

                {isAdminMode && (
                  <p className="text-xs text-gray-500">
                    Lat: {place.lat?.toFixed(6)}, Lng: {place.lng?.toFixed(6)}
                  </p>
                )}

                {notes[place.id] && notes[place.id].length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600 space-y-1">
                    {notes[place.id].map(note => (
                      <li key={note.id} className="flex items-start justify-between group">
                        <div className="flex items-start">
                          <span className="mr-1">•</span>
                          <span>{note.note_text}</span>
                        </div>
                        {isAdminMode && (
                          <button
                            onClick={() => handleDeleteNote(note.id, place.id)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 cursor-pointer"
                            title="Eliminar nota"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {isAdminMode && (
                  <input
                    type="text"
                    value={newNote[place.id] || ''}
                    onChange={(e) => setNewNote(prev => ({ ...prev, [place.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddNote(place.id);
                      }
                    }}
                    placeholder="Añadir nota..."
                    className="w-full mt-2 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                )}

                <div className="mt-2 flex gap-2 flex-col">
                  {isAdminMode && place.polygon && !place.isDrawing && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200 w-fit shadow-sm hover:shadow transition-all duration-200">
                      <span className="mr-1">✓</span> Zona delimitada
                    </span>
                  )}
                  {place.isDrawing && (
                    <div className="w-full">
                      <p className="text-xs text-purple-600 mb-2">Editando polígono...</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onStartDrawing(null)}
                          className="flex-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            // Trigger save via Enter key simulation
                            const event = new KeyboardEvent('keydown', { key: 'Enter' });
                            document.dispatchEvent(event);
                          }}
                          className="flex-1 px-2 py-1 text-xs text-white bg-purple-600 rounded hover:bg-purple-700 cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  )}
                  {place.circle_radius && (
                    <>
                      {editingCircleId === place.id ? (
                        <div
                          className="w-full"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateRadius(place.id, editingRadius);
                            }
                          }}
                        >
                          <label className="block text-xs text-gray-700 mb-1">
                            Radio: {(editingRadius / 1000).toFixed(1)}km
                          </label>
                          <input
                            type="range"
                            min="1000"
                            max="3000"
                            step="100"
                            value={editingRadius}
                            onChange={(e) => setEditingRadius(parseInt(e.target.value))}
                            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => setEditingCircleId(null)}
                              className="flex-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleUpdateRadius(place.id, editingRadius)}
                              className="flex-1 px-2 py-1 text-xs text-white bg-purple-600 rounded hover:bg-purple-700 cursor-pointer"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200 w-fit shadow-sm hover:shadow transition-all duration-200">
                          <span className="mr-1">⭕</span> Radio: {(place.circle_radius / 1000).toFixed(1)}km
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              {isAdminMode && (
                <div className="flex justify-around items-center pt-2 border-t border-gray-200">
                  <select
                    value={place.safety_level_id ?? 0}
                    onChange={(e) => onColorChange(place.id, parseInt(e.target.value))}
                    className="text-xs px-2 py-1 border border-gray-300 rounded cursor-pointer"
                    style={{
                      color: insecurityLevels.find(l => l.id === (place.safety_level_id ?? 0))?.color || place.color
                    }}
                  >
                    {insecurityLevels.map(level => {
                      const emoji = ['🟢', '🔵', '🔵', '🟡', '🔴'][level.id] || '⚪';
                      return (
                        <option
                          key={level.id}
                          value={level.id}
                          style={{ color: level.color }}
                        >
                          {emoji} {level.name}
                        </option>
                      );
                    })}
                  </select>
                  {place.circle_radius ? (
                    <button
                      onClick={() => {
                        setEditingCircleId(editingCircleId === place.id ? null : place.id);
                        setEditingRadius(place.circle_radius);
                      }}
                      className={`p-2 rounded hover:bg-purple-100 text-purple-600 cursor-pointer ${editingCircleId === place.id ? 'bg-purple-100' : ''}`}
                      title="Editar radio"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartDrawing(place.id)}
                      className={`p-2 rounded hover:bg-gray-100 cursor-pointer ${place.isDrawing ? 'bg-blue-100' : ''}`}
                      title="Delimitar zona"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  )}
                  <label
                    className="flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer"
                    title="Lugar turístico"
                  >
                    <input
                      type="checkbox"
                      checked={place.is_turistic || false}
                      onChange={(e) => onTuristicChange(place.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <button
                    onClick={async () => {
                      setLoadingAI(prev => ({ ...prev, [place.id]: true }));

                      setTimeout(() => {
                        setLoadingAI(prev => ({ ...prev, [place.id]: false }));
                      }, 10000);

                      try {
                        await fetch('/api/perplexity-populate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            zone_id: place.id
                          })
                        });
                      } catch (error) {
                        console.error('Error populating with AI:', error);
                      }
                    }}
                    className="p-2 rounded hover:bg-purple-100 text-purple-600 cursor-pointer"
                    title="Regenerar información con IA"
                  >
                    {loadingAI[place.id] ? (
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    ) : (
                      <HiOutlineSparkles className="h-5 w-5" />
                    )}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => onDeletePlace(place.id)}
                      className="p-2 rounded hover:bg-gray-100 text-gray-500 cursor-pointer"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {placeToDelete === place.id && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-3 w-48 z-10 border border-gray-200">
                        <p className="text-xs text-gray-700 mb-3">¿Eliminar esta zona?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onDeletePlace(null)}
                            className="flex-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => onDeletePlace(place.id, true)}
                            className="flex-1 px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700 cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      </div>

      {/* Panel flotante de Perplexity */}
      {showPerplexityPanel && (
        <div
          ref={perplexityPanelRef}
          className="w-96 bg-white shadow-2xl border-l border-gray-300 overflow-y-auto"
          role="complementary"
          aria-label="Panel de información de la zona"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-600" title={`Información sobre ${selectedZoneAddress}`}>
              {selectedZoneAddress}
            </h2>
            <button
              onClick={() => setShowPerplexityPanel(false)}
              className="p-2 hover:bg-gray-100 rounded cursor-pointer"
              title="Cerrar panel de información"
              aria-label="Cerrar panel de información"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="p-3 space-y-3" role="region" aria-label="Información detallada de la zona">
            {loadingPerplexity ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-sm text-gray-500">Esperando respuesta...</p>
              </div>
            ) : (
              <>
            {/* Visual Safety Score Gauge - New Feature */}
            {perplexityData?.secure && (
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 rounded-lg p-3 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <BiShield className="text-base text-gray-600" />
                  Evaluación de seguridad
                </h3>
                {(() => {
                  // Obtener la zona actual para usar su nivel de seguridad
                  const currentPlace = places.find(p => p.address === selectedZoneAddress);
                  const safetyLevelId = currentPlace?.safety_level_id ?? 2;

                  // Obtener configuración desde insecurityLevels (base de datos)
                  const currentLevel = insecurityLevels.find(l => l.id === safetyLevelId);

                  // Configuración basada en el nivel de seguridad de la zona
                  let safetyScore = 50;
                  let gradientFrom = currentLevel?.gradient_from || '#60a5fa';
                  let gradientTo = currentLevel?.gradient_to || '#06b6d4';
                  let bgColor = 'bg-blue-50';
                  let textColor = 'text-blue-800';
                  let IconComponent = BiShieldAlt2;
                  let label = currentLevel?.name || 'Seguridad media';

                  // Mapeo de nivel de seguridad a configuración visual
                  switch(safetyLevelId) {
                    case 0: // Seguridad buena
                      safetyScore = 90;
                      bgColor = 'bg-green-50';
                      textColor = 'text-green-800';
                      IconComponent = BiShield;
                      break;
                    case 1: // Seguridad aceptable
                      safetyScore = 70;
                      bgColor = 'bg-blue-50';
                      textColor = 'text-blue-800';
                      IconComponent = BiShieldAlt2;
                      break;
                    case 2: // Seguridad media
                      safetyScore = 50;
                      bgColor = 'bg-blue-50';
                      textColor = 'text-blue-800';
                      IconComponent = BiShieldAlt2;
                      break;
                    case 3: // Seguridad baja
                      safetyScore = 30;
                      bgColor = 'bg-yellow-50';
                      textColor = 'text-yellow-800';
                      IconComponent = BiErrorCircle;
                      break;
                    case 4: // Sin seguridad
                      safetyScore = 15;
                      bgColor = 'bg-red-50';
                      textColor = 'text-red-800';
                      IconComponent = BiXCircle;
                      break;
                    default:
                      // Mantener valores por defecto
                      break;
                  }

                  return (
                    <>
                      <div className="relative mb-3">
                        {/* Progress Bar Background */}
                        <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                          {/* Animated Progress Fill */}
                          <div
                            className="h-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                            style={{
                              width: `${safetyScore}%`,
                              background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`
                            }}
                          >
                            <span className="text-white font-semibold text-xs">
                              {safetyScore}%
                            </span>
                          </div>
                        </div>
                        {/* Score Labels */}
                        <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                          <span>Riesgo alto</span>
                          <span>Seguridad óptima</span>
                        </div>
                      </div>
                      {/* Security Level Badge */}
                      <div className={`${bgColor} rounded-lg p-2 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="text-lg" />
                          <p className="text-xs text-gray-600">Nivel de seguridad</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${textColor} bg-white shadow-sm`}>
                          {label}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}


            {/* Rent */}
            {perplexityData?.rent && (
              <div
                role="article"
                aria-labelledby="rent-heading"
                className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BiDollar className="text-base text-emerald-600" aria-hidden="true" />
                  <h3 id="rent-heading" className="font-semibold text-sm text-gray-700">Costo de renta</h3>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-xl font-bold text-emerald-700"
                      title={`Costo promedio de renta mensual: $${Math.round(perplexityData.rent)} USD`}
                      aria-label={`Costo de renta: ${Math.round(perplexityData.rent)} dólares por mes`}
                    >
                      ${Math.round(perplexityData.rent)}
                    </span>
                    <span className="text-xs font-medium text-emerald-600">USD/mes</span>
                  </div>
                  <p className="text-xs text-gray-600 bg-white/60 rounded px-2 py-1 inline-block">
                    📐 Monoambiente (máx. 2 personas)
                  </p>
                </div>
              </div>
            )}

            {/* Tourism */}
            {perplexityData?.tourism && (
              <div
                role="article"
                aria-labelledby="tourism-heading"
                className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BiMapAlt className="text-base text-purple-600" aria-hidden="true" />
                  <h3 id="tourism-heading" className="font-semibold text-sm text-gray-700">Turismo</h3>
                </div>
                <div
                  className="text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none bg-white/40 rounded p-2"
                  title="Información turística de la zona"
                >
                  <ReactMarkdown>{perplexityData.tourism}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Places */}
            {perplexityData?.places && (
              <div
                role="article"
                aria-labelledby="places-heading"
                className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BiMapPin className="text-base text-rose-600" aria-hidden="true" />
                  <h3 id="places-heading" className="font-semibold text-sm text-gray-700">Lugares de interés</h3>
                </div>
                <div
                  className="text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none bg-white/40 rounded p-2"
                  title="Lugares de interés en la zona"
                >
                  <ReactMarkdown
                    components={{
                      strong: ({children, ...props}) => {
                        const text = typeof children === 'string' ? children : children?.[0];
                        if (typeof text === 'string') {
                          const searchUrl = `https://www.google.com/maps/search/?q=${encodeURIComponent(text + ', ' + selectedZoneAddress)}`;
                          return (
                            <strong>
                              <a
                                href={searchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors duration-200"
                                title={`Buscar ${text} en Google Maps`}
                                aria-label={`Buscar ${text} en Google Maps, se abrirá en una nueva ventana`}
                              >
                                {text}
                              </a>
                            </strong>
                          );
                        }
                        return <strong>{children}</strong>;
                      }
                    }}
                  >
                    {perplexityData.places}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Notes */}
            {perplexityData?.notes && (
              <div
                role="article"
                aria-labelledby="notes-heading"
                className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BiInfoCircle className="text-base text-gray-600" aria-hidden="true" />
                  <h3 id="notes-heading" className="font-semibold text-sm text-gray-700">Notas generales</h3>
                </div>
                <div
                  className="text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none bg-white/40 rounded p-2"
                  title="Notas generales sobre la zona"
                >
                  <ReactMarkdown>{perplexityData.notes}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* No data message */}
            {!perplexityData?.notes && !perplexityData?.rent && !perplexityData?.tourism && !perplexityData?.secure && !perplexityData?.places && (
              <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">📭</div>
                <p className="text-xs text-gray-600">No hay información disponible para esta zona</p>
              </div>
            )}
            </>
            )}
          </div>
        </div>
      )}

      {/* Safe Route Planner Modal */}
      <SafeRoutePlanner
        isOpen={showRoutePlanner}
        onClose={() => setShowRoutePlanner(false)}
        map={map}
        places={places}
        selectedCountry={selectedCountry}
      />
    </div>
  );
}
