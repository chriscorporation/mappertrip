'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ onSelectCountry }) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Cargar países al montar
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };
    loadCountries();
  }, []);

  // Filtrar países cuando cambia la búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCountries([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = countries.filter(country =>
      country.name.toLowerCase().includes(query)
    );
    setFilteredCountries(filtered);
  }, [searchQuery, countries]);

  // Cerrar cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enfocar input cuando se expande
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSelectCountry = (country) => {
    if (onSelectCountry) {
      onSelectCountry(country);
    }
    setIsExpanded(false);
    setSearchQuery('');
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button - Estilo Airbnb */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-full border
          transition-all duration-300 ease-in-out
          ${isExpanded
            ? 'bg-white border-gray-300 shadow-xl w-80'
            : 'bg-white border-gray-300 shadow-md hover:shadow-lg w-64'
          }
        `}
      >
        {/* Ícono de búsqueda */}
        <svg
          className={`transition-all ${isExpanded ? 'w-5 h-5 text-gray-600' : 'w-4 h-4 text-gray-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {!isExpanded ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-700 font-medium">Buscar destino</span>
            <div className="w-px h-5 bg-gray-300" />
            <span className="text-gray-400">Cualquier país</span>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar países, ciudades..."
            className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
          />
        )}
      </button>

      {/* Dropdown de resultados - Animación suave */}
      {isExpanded && filteredCountries.length > 0 && (
        <div className="absolute top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideDown">
          <div className="max-h-80 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.id}
                onClick={() => handleSelectCountry(country)}
                className="w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {country.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{country.name}</div>
                  <div className="text-xs text-gray-500">{country.country_code}</div>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {isExpanded && searchQuery && filteredCountries.length === 0 && (
        <div className="absolute top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 text-center z-50 animate-slideDown">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">No se encontraron destinos</p>
          <p className="text-xs text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
        </div>
      )}
    </div>
  );
}
