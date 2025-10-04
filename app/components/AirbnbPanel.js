'use client';

import { useEffect, useState } from 'react';
import { BiMapPin, BiStar, BiDollar, BiLinkExternal } from 'react-icons/bi';
import { useAuthStore } from '../store/authStore';

export default function AirbnbPanel({ onGoToLocation, selectedCountry }) {
  const { isAuthenticated } = useAuthStore();
  const isAdminMode = isAuthenticated;
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

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            AirBnB
          </h2>
          <p className="text-xs text-gray-500 mt-1 animate-pulse">Cargando propiedades...</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
        <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          AirBnB
        </h2>
        <p className="text-xs text-gray-600 mt-1 font-medium">
          {airbnbs.length} {airbnbs.length === 1 ? 'propiedad' : 'propiedades'}
        </p>
      </div>

      {isAdminMode && (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
          <input
            type="text"
            value={airbnbLink}
            onChange={(e) => setAirbnbLink(e.target.value)}
            placeholder="https://www.airbnb.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm mb-2 transition-all duration-300 hover:border-pink-300"
          />
          <button
            onClick={handleScrapeAirbnb}
            disabled={!airbnbLink || !selectedCountry || scraping}
            className="w-full px-3 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed cursor-pointer text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {scraping ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Scrapeando...</span>
              </>
            ) : (
              <>
                <span>+</span>
                <span>Agregar Airbnb</span>
              </>
            )}
          </button>
          {!selectedCountry && (
            <p className="text-xs text-red-600 mt-2 animate-pulse">⚠️ Selecciona un país primero</p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {airbnbs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="text-6xl mb-4 animate-bounce">🏠</div>
            <p className="text-gray-600 font-medium mb-2">No hay propiedades aún</p>
            <p className="text-xs text-gray-500">
              {isAdminMode ? 'Agrega una propiedad de Airbnb usando el formulario de arriba' : 'Aún no se han agregado propiedades de Airbnb'}
            </p>
          </div>
        ) : (
          airbnbs.map((airbnb, index) => (
            <div
              key={airbnb.id}
              className="p-3 bg-gradient-to-br from-white to-pink-50 rounded-xl border border-pink-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-1 hover:border-pink-300 cursor-pointer animate-[fadeIn_0.5s_ease-out] group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <h3
                className="font-semibold text-sm mb-3 cursor-pointer text-gray-800 hover:text-pink-600 transition-all duration-200 line-clamp-2 group-hover:translate-x-1"
                onClick={() => onGoToLocation({ lat: airbnb.lat, lng: airbnb.lng })}
                title={airbnb.title}
              >
                {airbnb.title}
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <BiMapPin className="text-sm text-pink-600" />
                  <span className="font-medium text-gray-700 bg-pink-50 px-2 py-1 rounded-full">
                    {airbnb.country_code || 'Argentina'}
                  </span>
                </div>

                {airbnb.ranking && (
                  <div className="flex items-center gap-2 text-xs">
                    <BiStar className="text-sm text-yellow-500" />
                    <span className="font-bold text-gray-800 bg-yellow-50 px-2 py-1 rounded-full">
                      {airbnb.ranking}
                    </span>
                    {airbnb.evaluations && (
                      <span className="text-gray-500">({airbnb.evaluations} reseñas)</span>
                    )}
                  </div>
                )}

                {airbnb.price && (
                  <div className="flex items-center gap-2 text-xs">
                    <BiDollar className="text-sm text-green-600" />
                    <span className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                      {airbnb.price}
                    </span>
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
                        {isAdminMode && (
                          <button
                            onClick={() => handleDeleteNote(note.id, airbnb.id)}
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
                )}

                {airbnb.original_url && (
                  <a
                    href={airbnb.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-pink-600 hover:text-pink-800 transition-all duration-200 mt-2 cursor-pointer font-medium bg-pink-50 px-2 py-1 rounded-lg hover:bg-pink-100 border border-pink-200 hover:border-pink-300 transform hover:scale-105"
                  >
                    <BiLinkExternal className="text-sm" />
                    <span>Ver en Airbnb</span>
                  </a>
                )}
              </div>

              {isAdminMode && (
                <div className="flex justify-end mt-3 pt-3 border-t border-pink-100">
                  <div className="relative">
                    <button
                      onClick={() => handleDeleteAirbnb(airbnb.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer transition-all duration-200 transform hover:scale-110"
                      title="Eliminar propiedad"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {airbnbToDelete === airbnb.id && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl p-4 w-52 z-10 border-2 border-red-200 animate-[fadeIn_0.2s_ease-out]">
                        <p className="text-xs text-gray-700 mb-3 font-medium">¿Eliminar esta propiedad?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAirbnbToDelete(null)}
                            className="flex-1 px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-all duration-200 font-medium"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleDeleteAirbnb(airbnb.id, true)}
                            className="flex-1 px-3 py-1.5 text-xs text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-lg hover:from-red-700 hover:to-rose-700 cursor-pointer transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {airbnb.error && (
                <div className="mt-3 text-xs text-red-700 bg-gradient-to-r from-red-50 to-rose-50 p-3 rounded-lg border border-red-200 flex items-center gap-2 animate-pulse">
                  <span className="text-base">⚠️</span>
                  <span className="font-medium">{airbnb.error}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
