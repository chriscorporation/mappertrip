'use client';

import { useRef, useEffect, useState } from 'react';

export default function ZonesPanel({
  selectedCountry,
  places,
  onStartDrawing,
  onDeletePlace,
  onColorChange,
  onGoToPlace,
  placeToDelete,
  onAddPlace
}) {
  const [address, setAddress] = useState('');
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const [notes, setNotes] = useState({});
  const [newNote, setNewNote] = useState({});
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

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
            types: ['geocode'],
            componentRestrictions: { country: selectedCountry.country_code.toLowerCase() }
          }
        );

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
              country_code: selectedCountry.country_code,
            };

            onAddPlace(placeData);
            setAddress('');
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

  // Cargar notas para cada zona
  useEffect(() => {
    const loadNotes = async () => {
      const countryPlaces = places.filter(p => p.country_code === selectedCountry?.country_code);

      for (const place of countryPlaces) {
        try {
          const response = await fetch(`/api/notes?related_type=zone&related_id=${place.id}`);
          const placeNotes = await response.json();
          setNotes(prev => ({ ...prev, [place.id]: placeNotes }));
        } catch (error) {
          console.error('Error loading notes:', error);
        }
      }
    };

    if (selectedCountry && places.length > 0) {
      loadNotes();
    }
  }, [selectedCountry, places]);

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
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Zones</h2>
        <p className="text-xs text-gray-500 mt-1">{selectedCountry.name}</p>
      </div>

      <div className="p-4 border-b border-gray-200">
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Buscar zona o barrio..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

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

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {countryPlaces.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-4">
            No hay zonas creadas para {selectedCountry.name}
          </p>
        ) : (
          countryPlaces.map(place => (
            <div
              key={place.id}
              className={`p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors ${hoverEnabled ? 'cursor-pointer hover:bg-gray-100' : ''}`}
              onMouseEnter={() => hoverEnabled && onGoToPlace(place)}
            >
              <div className="mb-2">
                <h3
                  className="font-semibold text-sm mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => onGoToPlace(place)}
                >
                  {place.address}
                </h3>
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
                        <button
                          onClick={() => handleDeleteNote(note.id, place.id)}
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                          title="Eliminar nota"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

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

                {place.polygon && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Zona delimitada
                    </span>
                  </div>
                )}
              </div>
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
                  <option value="#6b7280" style={{ color: '#6b7280' }}>⚪ Precaución</option>
                  <option value="#dc2626" style={{ color: '#dc2626' }}>🔴 Inseguro</option>
                </select>
                <button
                  onClick={() => onStartDrawing(place.id)}
                  className={`p-2 rounded hover:bg-gray-100 ${place.isDrawing ? 'bg-blue-100' : ''}`}
                  title="Delimitar zona"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <div className="relative">
                  <button
                    onClick={() => onDeletePlace(place.id)}
                    className="p-2 rounded hover:bg-gray-100 text-gray-500"
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
                          className="flex-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => onDeletePlace(place.id, true)}
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
          ))
        )}
      </div>
    </div>
  );
}
