'use client';

import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BiDollar, BiShield, BiMapAlt, BiInfoCircle, BiMapPin } from 'react-icons/bi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import MapPreview from './MapPreview';
import SkeletonLoader from './SkeletonLoader';
import ZoneComparison from './ZoneComparison';

export default function ZonesPanel({
  selectedCountry,
  places,
  safetyFilters = [],
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
  onUpdatePlace
}) {
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedZonesForComparison, setSelectedZonesForComparison] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const cardRefs = useRef({});
  const perplexityPanelRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const previousPlacesCountRef = useRef(places.length);
  const pollingIntervalRef = useRef(null);

  // Detectar cuando se agrega una nueva zona y hacer scroll + seleccionar
  useEffect(() => {
    const countryPlaces = places.filter(p => p.country_code === selectedCountry?.country_code);
    const previousCount = previousPlacesCountRef.current;

    // Si se agregó una nueva zona
    if (countryPlaces.length > previousCount) {
      // Hacer scroll al inicio
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      // Seleccionar la primera zona (más reciente)
      if (countryPlaces.length > 0) {
        const newestPlace = countryPlaces[0];
        setTimeout(() => {
          onGoToPlace(newestPlace);
        }, 100);
      }
    }

    previousPlacesCountRef.current = countryPlaces.length;
  }, [places, selectedCountry, onGoToPlace]);

  // Detectar cuando las zonas terminan de cargar
  useEffect(() => {
    if (selectedCountry && places.length > 0) {
      // Simular delay de carga inicial para mostrar skeleton (efecto visual)
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else if (selectedCountry) {
      setInitialLoading(true);
    }
  }, [selectedCountry, places]);

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
            const countryPlaces = places.filter(p => p.country_code === selectedCountry.country_code);
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

            const placeData = {
              id: Date.now(),
              address: place.formatted_address,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              placeId: place.place_id,
              polygon: null,
              isDrawing: false,
              color: '#22c55e',
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

  // Cargar notas bajo demanda
  const loadNotesForPlace = async (placeId) => {
    if (notes[placeId]) return; // Ya están cargadas

    try {
      const response = await fetch(`/api/notes?related_type=zone&related_id=${placeId}`);
      const placeNotes = await response.json();
      setNotes(prev => ({ ...prev, [placeId]: placeNotes }));
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

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

  const handleToggleZoneComparison = (zone) => {
    setSelectedZonesForComparison(prev => {
      const isSelected = prev.some(z => z.id === zone.id);
      if (isSelected) {
        return prev.filter(z => z.id !== zone.id);
      } else {
        // Cargar datos de Perplexity para la zona si no los tiene
        if (!zone.perplexityData) {
          fetch(`/api/perplexity-notes?zone_id=${zone.id}`)
            .then(res => res.json())
            .then(data => {
              zone.perplexityData = data;
            })
            .catch(err => console.error('Error loading zone data:', err));
        }
        return [...prev, zone];
      }
    });
  };

  const handleRemoveFromComparison = (zoneId) => {
    setSelectedZonesForComparison(prev => prev.filter(z => z.id !== zoneId));
    if (selectedZonesForComparison.length <= 1) {
      setShowComparison(false);
    }
  };

  if (!selectedCountry) {
    return (
      <div className="w-80 bg-white border-r border-gray-300 p-4">
        <h2 className="text-xl font-bold mb-4">Zones</h2>
        <p className="text-gray-500 text-sm">Selecciona un país primero</p>
      </div>
    );
  }

  // Mapeo de filtros de seguridad a colores
  const safetyLevelToColor = {
    'safe': '#22c55e',      // green-500
    'medium': '#3b82f6',    // blue-500
    'regular': '#eab308',   // yellow-500
    'caution': '#f97316',   // orange-500
    'unsafe': '#ef4444'     // red-500
  };

  // Filtrar lugares por país
  let countryPlaces = places.filter(p => p.country_code === selectedCountry.country_code);

  // Aplicar filtros de seguridad si hay alguno activo
  if (safetyFilters.length > 0) {
    const filterColors = safetyFilters.map(filter => safetyLevelToColor[filter]);
    countryPlaces = countryPlaces.filter(place =>
      filterColors.includes(place.color)
    );
  }

  return (
    <div className="flex">
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Zones</h2>
            <p className="text-xs text-gray-500 mt-1">{selectedCountry.name}</p>
          </div>
          {selectedZonesForComparison.length > 0 && (
            <button
              onClick={() => setShowComparison(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Comparar ({selectedZonesForComparison.length})
            </button>
          )}
        </div>
      </div>

      {initialLoading && countryPlaces.length === 0 ? (
        <SkeletonLoader variant="zone-list" count={5} />
      ) : (
        <>
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

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {pendingPlace && (
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-400">
            <input
              type="text"
              value={pendingPlaceName}
              onChange={(e) => setPendingPlaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pendingPlaceName.trim()) {
                  const placeData = {
                    id: Date.now(),
                    address: pendingPlaceName.trim(),
                    lat: pendingPlace.lat,
                    lng: pendingPlace.lng,
                    placeId: null,
                    polygon: null,
                    isDrawing: false,
                    color: '#22c55e',
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
                  const placeData = {
                    id: Date.now(),
                    address: pendingPlaceName.trim(),
                    lat: pendingCircle.lat,
                    lng: pendingCircle.lng,
                    placeId: null,
                    polygon: null,
                    circle_radius: circleRadius,
                    isDrawing: false,
                    color: '#8b5cf6',
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
          <p className="text-gray-500 text-sm text-center mt-4">
            No hay zonas creadas para {selectedCountry.name}
          </p>
        ) : (
          countryPlaces.map(place => {
            const isSelectedForComparison = selectedZonesForComparison.some(z => z.id === place.id);

            return (
            <div
              key={place.id}
              ref={el => cardRefs.current[place.id] = el}
              className={`bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${hoverEnabled ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''} ${
                highlightedPlace === place.id
                  ? 'border-2 border-blue-500 shadow-md'
                  : isSelectedForComparison
                  ? 'border-2 border-purple-500 shadow-md'
                  : 'border-gray-200'
              }`}
              onMouseEnter={() => hoverEnabled && onGoToPlace(place)}
            >
              {/* Vista previa del mapa estilo Airbnb */}
              <div className="relative">
                <MapPreview place={place} className="w-full h-32 sm:h-36" />
                {/* Checkbox de comparación en la esquina superior derecha */}
                <label
                  className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelectedForComparison}
                    onChange={() => handleToggleZoneComparison(place)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                  />
                </label>
              </div>

              <div className="p-3">
              <div className="mb-2">
                <div className="flex items-start justify-between">
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
                      className="font-semibold text-sm mb-1 cursor-pointer hover:text-blue-600 transition-colors flex-1"
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
                      // Cargar notas primero
                      await loadNotesForPlace(place.id);

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
                <p className="text-xs text-gray-500">
                  Lat: {place.lat?.toFixed(6)}, Lng: {place.lng?.toFixed(6)}
                </p>

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
                  {place.polygon && !place.isDrawing && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                      ✓ Zona delimitada
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
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 w-fit">
                          ⭕ Radio: {(place.circle_radius / 1000).toFixed(1)}km
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              {isAdminMode && (
                <div className="flex justify-around items-center pt-2 border-t border-gray-200 px-3 pb-3">
                  <select
                    value={place.color}
                    onChange={(e) => onColorChange(place.id, e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded cursor-pointer"
                    style={{ color: place.color }}
                  >
                    <option value="#22c55e" style={{ color: '#22c55e' }}>🟢 Seguro</option>
                    <option value="#3b82f6" style={{ color: '#3b82f6' }}>🔵 Medio</option>
                    <option value="#f97316" style={{ color: '#f97316' }}>🟠 Regular</option>
                    <option value="#eab308" style={{ color: '#eab308' }}>🟡 Precaución</option>
                    <option value="#dc2626" style={{ color: '#dc2626' }}>🔴 Inseguro</option>
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
            </div>
          );
          })
        )}
      </div>
      </>
      )}
    </div>

      {/* Zone Comparison Modal */}
      {showComparison && (
        <ZoneComparison
          zones={selectedZonesForComparison}
          onClose={() => setShowComparison(false)}
          onRemoveZone={handleRemoveFromComparison}
        />
      )}
    </div>

      {/* Panel flotante de Perplexity */}
      {showPerplexityPanel && (
        <div
          ref={perplexityPanelRef}
          className="w-96 bg-white shadow-2xl border-l border-gray-300 overflow-y-auto"
          role="complementary"
          aria-label="Panel de información de la zona"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-400" title={`Información sobre ${selectedZoneAddress}`}>
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

          <div className="p-4 space-y-6" role="region" aria-label="Información detallada de la zona">
            {loadingPerplexity ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-sm text-gray-500">Esperando respuesta...</p>
              </div>
            ) : (
              <>
            {/* Rent */}
            {perplexityData?.rent && (
              <div role="article" aria-labelledby="rent-heading">
                <div className="flex items-center gap-2 mb-2">
                  <BiDollar className="text-base text-gray-600 flex-shrink-0" aria-hidden="true" />
                  <h3 id="rent-heading" className="font-semibold text-sm text-gray-700">Costo de renta promedio</h3>
                </div>
                <span
                  className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"
                  title={`Costo promedio de renta mensual: $${Math.round(perplexityData.rent)} USD`}
                  aria-label={`Costo de renta: ${Math.round(perplexityData.rent)} dólares por mes`}
                >
                  ${Math.round(perplexityData.rent)} USD/mes
                </span>
                <p className="text-xs text-gray-500 mt-2">Monoambiente (máx. 2 personas)</p>
              </div>
            )}

            {/* Secure */}
            {perplexityData?.secure && (
              <div role="article" aria-labelledby="security-heading">
                <div className="flex items-center gap-2 mb-2">
                  <BiShield className="text-lg text-blue-600" aria-hidden="true" />
                  <h3 id="security-heading" className="font-semibold text-sm text-gray-700">Seguridad</h3>
                </div>
                <span
                  className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 ${
                    perplexityData.secure.toLowerCase().includes('buena') || perplexityData.secure.toLowerCase().includes('aceptable')
                      ? 'text-green-700'
                      : perplexityData.secure.toLowerCase().includes('media')
                      ? 'text-blue-600'
                      : 'text-red-600'
                  }`}
                  title={`Nivel de seguridad de la zona: ${perplexityData.secure}`}
                  aria-label={`Seguridad: ${perplexityData.secure}`}
                >
                  {perplexityData.secure}
                </span>
              </div>
            )}

            {/* Tourism */}
            {perplexityData?.tourism && (
              <div role="article" aria-labelledby="tourism-heading">
                <div className="flex items-center gap-2 mb-2">
                  <BiMapAlt className="text-lg text-purple-600" aria-hidden="true" />
                  <h3 id="tourism-heading" className="font-semibold text-sm text-gray-700">Turismo</h3>
                </div>
                <div
                  className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  title="Información turística de la zona"
                >
                  <ReactMarkdown>{perplexityData.tourism}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Notes */}
            {perplexityData?.notes && (
              <div role="article" aria-labelledby="notes-heading">
                <div className="flex items-center gap-2 mb-2">
                  <BiInfoCircle className="text-lg text-gray-600" aria-hidden="true" />
                  <h3 id="notes-heading" className="font-semibold text-sm text-gray-700">Notas Generales</h3>
                </div>
                <div
                  className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  title="Notas generales sobre la zona"
                >
                  <ReactMarkdown>{perplexityData.notes}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Places */}
            {perplexityData?.places && (
              <div role="article" aria-labelledby="places-heading">
                <div className="flex items-center gap-2 mb-2">
                  <BiMapPin className="text-lg text-red-600" aria-hidden="true" />
                  <h3 id="places-heading" className="font-semibold text-sm text-gray-700">Lugares de Interés</h3>
                </div>
                <div
                  className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none"
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
                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
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

            {/* No data message */}
            {!perplexityData?.notes && !perplexityData?.rent && !perplexityData?.tourism && !perplexityData?.secure && !perplexityData?.places && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No hay información disponible para esta zona</p>
              </div>
            )}
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
