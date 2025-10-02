'use client';

import { useEffect, useState } from 'react';
import { BiMapPin, BiStar, BiDollar, BiLinkExternal } from 'react-icons/bi';

export default function AirbnbPanel({ onGoToLocation, selectedCountry }) {
  const [airbnbs, setAirbnbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [airbnbLink, setAirbnbLink] = useState('');
  const [scraping, setScraping] = useState(false);
  const [airbnbToDelete, setAirbnbToDelete] = useState(null);
  const [notes, setNotes] = useState({});
  const [newNote, setNewNote] = useState({});

  const loadAirbnbs = async () => {
    try {
      const response = await fetch('/api/airbnb');
      const data = await response.json();
      setAirbnbs(data);
    } catch (error) {
      console.error('Error loading airbnbs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAirbnbs();
  }, []);

  // Cargar notas para cada Airbnb
  useEffect(() => {
    const loadNotes = async () => {
      const countryAirbnbs = airbnbs.filter(a => a.country_code === selectedCountry?.country_code);

      for (const airbnb of countryAirbnbs) {
        try {
          const response = await fetch(`/api/notes?related_type=airbnb&related_id=${airbnb.id}`);
          const airbnbNotes = await response.json();
          setNotes(prev => ({ ...prev, [airbnb.id]: airbnbNotes }));
        } catch (error) {
          console.error('Error loading notes:', error);
        }
      }
    };

    if (selectedCountry && airbnbs.length > 0) {
      loadNotes();
    }
  }, [selectedCountry, airbnbs]);

  const handleAddNote = async (airbnbId) => {
    const noteText = newNote[airbnbId]?.trim();
    if (!noteText) return;

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_text: noteText,
          related_type: 'airbnb',
          related_id: airbnbId
        })
      });

      const savedNote = await response.json();
      setNotes(prev => ({
        ...prev,
        [airbnbId]: [...(prev[airbnbId] || []), savedNote]
      }));
      setNewNote(prev => ({ ...prev, [airbnbId]: '' }));
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleDeleteNote = async (noteId, airbnbId) => {
    try {
      await fetch(`/api/notes?id=${noteId}`, { method: 'DELETE' });
      setNotes(prev => ({
        ...prev,
        [airbnbId]: prev[airbnbId].filter(note => note.id !== noteId)
      }));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleScrapeAirbnb = async () => {
    if (!airbnbLink || !selectedCountry) return;

    setScraping(true);
    try {
      const response = await fetch('/api/scrape-airbnb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: airbnbLink,
          country_code: selectedCountry.country_code,
          original_url: airbnbLink
        })
      });

      const data = await response.json();

      if (response.ok && data.lat && data.lng) {
        setAirbnbLink('');
        await loadAirbnbs();
        onGoToLocation({ lat: data.lat, lng: data.lng });
      } else {
        alert(data.error || 'No se encontraron coordenadas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener ubicación');
    } finally {
      setScraping(false);
    }
  };

  const handleDeleteAirbnb = async (airbnbId, confirm = false) => {
    if (confirm) {
      try {
        await fetch(`/api/airbnb?id=${airbnbId}`, { method: 'DELETE' });
        setAirbnbs(prev => prev.filter(a => a.id !== airbnbId));
        setAirbnbToDelete(null);
      } catch (error) {
        console.error('Error deleting airbnb:', error);
      }
    } else {
      setAirbnbToDelete(airbnbToDelete === airbnbId ? null : airbnbId);
    }
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-300 p-4">
        <h2 className="text-xl font-bold mb-4">AirBnB</h2>
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">AirBnB</h2>
        <p className="text-xs text-gray-500 mt-1">{airbnbs.length} propiedades</p>
      </div>

      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          value={airbnbLink}
          onChange={(e) => setAirbnbLink(e.target.value)}
          placeholder="https://www.airbnb.com/..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-2"
        />
        <button
          onClick={handleScrapeAirbnb}
          disabled={!airbnbLink || !selectedCountry || scraping}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          {scraping ? 'Scrapeando...' : 'Agregar Airbnb'}
        </button>
        {!selectedCountry && (
          <p className="text-xs text-red-600 mt-1">Selecciona un país primero</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {airbnbs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-4">
            No hay propiedades de Airbnb agregadas
          </p>
        ) : (
          airbnbs.map(airbnb => (
            <div key={airbnb.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3
                className="font-semibold text-sm mb-2 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                onClick={() => onGoToLocation({ lat: airbnb.lat, lng: airbnb.lng })}
                title={airbnb.title}
              >
                {airbnb.title}
              </h3>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <BiMapPin className="text-sm" />
                  <span className="font-medium">Argentina</span>
                </div>

                {airbnb.ranking && (
                  <div className="flex items-center gap-2 text-xs">
                    <BiStar className="text-sm" />
                    <span className="font-medium">{airbnb.ranking}</span>
                    {airbnb.evaluations && (
                      <span className="text-gray-500">({airbnb.evaluations})</span>
                    )}
                  </div>
                )}

                {airbnb.price && (
                  <div className="flex items-center gap-2 text-xs">
                    <BiDollar className="text-sm" />
                    <span className="font-medium text-green-700">{airbnb.price}</span>
                  </div>
                )}

                {notes[airbnb.id] && notes[airbnb.id].length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600 space-y-1">
                    {notes[airbnb.id].map(note => (
                      <li key={note.id} className="flex items-start justify-between group">
                        <div className="flex items-start">
                          <span className="mr-1">•</span>
                          <span>{note.note_text}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id, airbnb.id)}
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
                  value={newNote[airbnb.id] || ''}
                  onChange={(e) => setNewNote(prev => ({ ...prev, [airbnb.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNote(airbnb.id);
                    }
                  }}
                  placeholder="Añadir nota..."
                  className="w-full mt-2 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />

                {airbnb.original_url && (
                  <a
                    href={airbnb.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors mt-1"
                  >
                    <BiLinkExternal className="text-sm" />
                    <span>Ver apartamento</span>
                  </a>
                )}
              </div>

              <div className="flex justify-end mt-2 pt-2 border-t border-gray-200">
                <div className="relative">
                  <button
                    onClick={() => handleDeleteAirbnb(airbnb.id)}
                    className="p-2 rounded hover:bg-gray-100 text-gray-500"
                    title="Eliminar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {airbnbToDelete === airbnb.id && (
                    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-3 w-48 z-10 border border-gray-200">
                      <p className="text-xs text-gray-700 mb-3">¿Eliminar este Airbnb?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAirbnbToDelete(null)}
                          className="flex-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDeleteAirbnb(airbnb.id, true)}
                          className="flex-1 px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {airbnb.error && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  ⚠️ {airbnb.error}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
