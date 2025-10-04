'use client';

import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BiDollar, BiShield, BiMapAlt, BiInfoCircle, BiMapPin } from 'react-icons/bi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';

export default function ZonesPanel({
  selectedCountry,
  places,
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

  if (!selectedCountry) {
    return (
      <div className="w-80 bg-white border-r border-gray-300 p-4">
        <h2 className="text-xl font-bold mb-4">Zones</h2>
        <p className="text-gray-500 text-sm">Selecciona un país primero</p>
      </div>
    );
  }

  const countryPlaces = places.filter(p => p.country_code === selectedCountry.country_code);

  return (
    <div className="flex">
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Zones</h2>
        <p className="text-xs text-gray-500 mt-1">{selectedCountry.name}</p>
      </div>

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

                {/* Safety Status Badge */}
                <div className="mb-2">
                  {place.color === '#22c55e' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="animate-pulse mr-1.5">🟢</span> Zona Segura
                    </span>
                  )}
                  {place.color === '#3b82f6' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="animate-pulse mr-1.5">🔵</span> Seguridad Media
                    </span>
                  )}
                  {place.color === '#f97316' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="animate-pulse mr-1.5">🟠</span> Seguridad Regular
                    </span>
                  )}
                  {place.color === '#eab308' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="animate-pulse mr-1.5">🟡</span> Precaución
                    </span>
                  )}
                  {place.color === '#dc2626' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="animate-pulse mr-1.5">🔴</span> Zona Insegura
                    </span>
                  )}
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

          <div className="p-4 space-y-4" role="region" aria-label="Información detallada de la zona">
            {loadingPerplexity ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-sm text-gray-500">Esperando respuesta...</p>
              </div>
            ) : (
              <>
            {/* Secure - Prioridad #1 según GOAL.md */}
            {perplexityData?.secure && (
              <div
                role="article"
                aria-labelledby="security-heading"
                className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-[fadeIn_0.5s_ease-out]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiShield className="text-2xl text-blue-600" aria-hidden="true" />
                  </div>
                  <h3 id="security-heading" className="font-bold text-base text-gray-800">Nivel de Seguridad</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                      perplexityData.secure.toLowerCase().includes('buena') || perplexityData.secure.toLowerCase().includes('aceptable')
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300'
                        : perplexityData.secure.toLowerCase().includes('media')
                        ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-2 border-blue-300'
                        : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-300'
                    }`}
                    title={`Nivel de seguridad de la zona: ${perplexityData.secure}`}
                    aria-label={`Seguridad: ${perplexityData.secure}`}
                  >
                    {perplexityData.secure.toLowerCase().includes('buena') || perplexityData.secure.toLowerCase().includes('aceptable') ? '🛡️' :
                     perplexityData.secure.toLowerCase().includes('media') ? '⚠️' : '🚨'} {perplexityData.secure}
                  </span>
                </div>
              </div>
            )}

            {/* Rent */}
            {perplexityData?.rent && (
              <div
                role="article"
                aria-labelledby="rent-heading"
                className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-[fadeIn_0.6s_ease-out]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiDollar className="text-2xl text-emerald-600" aria-hidden="true" />
                  </div>
                  <h3 id="rent-heading" className="font-bold text-base text-gray-800">Costo de Renta</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-2xl font-extrabold text-emerald-700"
                      title={`Costo promedio de renta mensual: $${Math.round(perplexityData.rent)} USD`}
                      aria-label={`Costo de renta: ${Math.round(perplexityData.rent)} dólares por mes`}
                    >
                      ${Math.round(perplexityData.rent)}
                    </span>
                    <span className="text-sm font-medium text-emerald-600">USD/mes</span>
                  </div>
                  <p className="text-xs text-gray-600 bg-white/60 rounded-lg px-3 py-1.5 inline-block">
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
                className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-[fadeIn_0.7s_ease-out]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiMapAlt className="text-2xl text-purple-600" aria-hidden="true" />
                  </div>
                  <h3 id="tourism-heading" className="font-bold text-base text-gray-800">Turismo</h3>
                </div>
                <div
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none bg-white/40 rounded-lg p-3"
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
                className="bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-[fadeIn_0.8s_ease-out]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiMapPin className="text-2xl text-rose-600" aria-hidden="true" />
                  </div>
                  <h3 id="places-heading" className="font-bold text-base text-gray-800">Lugares de Interés</h3>
                </div>
                <div
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none bg-white/40 rounded-lg p-3"
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
                className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-[fadeIn_0.9s_ease-out]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiInfoCircle className="text-2xl text-gray-600" aria-hidden="true" />
                  </div>
                  <h3 id="notes-heading" className="font-bold text-base text-gray-800">Notas Generales</h3>
                </div>
                <div
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none bg-white/40 rounded-lg p-3"
                  title="Notas generales sobre la zona"
                >
                  <ReactMarkdown>{perplexityData.notes}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* No data message */}
            {!perplexityData?.notes && !perplexityData?.rent && !perplexityData?.tourism && !perplexityData?.secure && !perplexityData?.places && (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm text-gray-600 font-medium">No hay información disponible para esta zona</p>
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
