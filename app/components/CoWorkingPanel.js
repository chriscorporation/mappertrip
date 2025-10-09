'use client';

import { useRef, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

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
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [notes, setNotes] = useState({});
  const [newNote, setNewNote] = useState({});

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

  // Las notas ahora vienen incluidas en el objeto place.notes desde la API
  // Este useEffect se mantiene solo para sincronizar el estado local cuando cambian los lugares
  useEffect(() => {
    const syncNotes = () => {
      if (!selectedCountry || !coworkingPlaces.length) return;

      const countryPlaces = coworkingPlaces.filter(p => p.country_code === selectedCountry.country_code);
      const updatedNotes = {};

      countryPlaces.forEach(place => {
        if (place.notes) {
          updatedNotes[place.id] = place.notes;
        }
      });

      setNotes(updatedNotes);
    };

    syncNotes();
  }, [coworkingPlaces, selectedCountry]);

  const handleAddNote = async (placeId) => {
    const noteText = newNote[placeId]?.trim();
    if (!noteText) return;

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_text: noteText,
          related_type: 'coworking',
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
        <h2 className="text-xl font-bold mb-4">CoWorking</h2>
        <p className="text-gray-500 text-sm">Selecciona un país primero</p>
      </div>
    );
  }

  const countryPlaces = coworkingPlaces.filter(p => p.country_code === selectedCountry.country_code);

  return (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200 shadow-sm">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">CoWorking</h2>
          <p className="text-xs text-gray-600 mt-1">{selectedCountry.name}</p>
        </div>
      </div>

      {isAdminMode && (
        <div className="p-4 border-b border-gray-200">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cafés, oficinas, museos..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <p className="text-xs text-gray-400 mt-2">Busca lugares de interés en el área visible del mapa</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {countryPlaces.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-4">
            No hay lugares agregados para {selectedCountry.name}
          </p>
        ) : (
          countryPlaces.map(place => (
            <div
              key={place.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="mb-2">
                <h3
                  className="font-semibold text-sm mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => onGoToPlace(place)}
                >
                  {place.title}
                </h3>
                <p className="text-xs text-gray-600">{place.description}</p>
                {place.link && (
                  <a
                    href={place.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Ver en Google Maps
                  </a>
                )}
              </div>

              {/* Notas */}
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

              {/* Input para añadir nota */}
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

              {isAdminMode && (
                <div className="flex justify-end items-center pt-2 border-t border-gray-200 mt-2">
                  <button
                    onClick={() => onDeleteCoworkingPlace(place.id)}
                    className="p-2 rounded hover:bg-gray-200 text-gray-500 cursor-pointer"
                    title="Eliminar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
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
