'use client';

import { useEffect, useState, useMemo } from 'react';
import { CountriesSkeletonLoader } from './SkeletonLoader';

// Función para convertir country_code a emoji de bandera
const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

export default function CountriesPanel({ selectedCountry, onSelectCountry, places = [] }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyWithZones, setShowOnlyWithZones] = useState(false);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  // Filtrar y buscar países
  const filteredCountries = useMemo(() => {
    let filtered = countries;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(country =>
        country.name.toLowerCase().includes(query) ||
        country.country_code.toLowerCase().includes(query)
      );
    }

    // Filtrar por países con zonas
    if (showOnlyWithZones) {
      filtered = filtered.filter(country => {
        const zoneCount = places.filter(p => p.country_code === country.country_code).length;
        return zoneCount > 0;
      });
    }

    return filtered;
  }, [countries, searchQuery, showOnlyWithZones, places]);

  // Estadísticas
  const stats = useMemo(() => {
    const totalCountries = countries.length;
    const countriesWithZones = countries.filter(country => {
      const zoneCount = places.filter(p => p.country_code === country.country_code).length;
      return zoneCount > 0;
    }).length;

    return { totalCountries, countriesWithZones };
  }, [countries, places]);

  if (loading) {
    return <CountriesSkeletonLoader />;
  }

  return (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      {/* Header con título */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Countries</h2>
        <p className="text-xs text-gray-500 mt-1">Selecciona un país para ver zonas</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar país..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Toggle para mostrar solo países con zonas */}
        <label className="flex items-center gap-2 mt-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={showOnlyWithZones}
              onChange={(e) => setShowOnlyWithZones(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
          </div>
          <span className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors">
            Solo con zonas activas
          </span>
        </label>

        {/* Estadísticas */}
        <div className="mt-3 flex gap-2 text-xs">
          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5 text-center">
            <div className="font-bold text-blue-700">{stats.countriesWithZones}</div>
            <div className="text-blue-600 text-[10px]">Con zonas</div>
          </div>
          <div className="flex-1 bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 text-center">
            <div className="font-bold text-gray-700">{stats.totalCountries}</div>
            <div className="text-gray-600 text-[10px]">Total</div>
          </div>
        </div>
      </div>

      {/* Lista de países */}
      <div className="flex-1 overflow-y-auto">
        {filteredCountries.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm">No se encontraron países</p>
          </div>
        ) : (
          filteredCountries.map(country => {
            const zoneCount = places.filter(p => p.country_code === country.country_code).length;
            const isDisabled = zoneCount === 0;

            return (
              <button
                key={country.id}
                onClick={() => !isDisabled && onSelectCountry(country)}
                className={`
                  w-full text-left px-4 py-3 border-b border-gray-100
                  transition-all duration-200
                  ${isDisabled
                    ? 'opacity-40 cursor-default'
                    : 'cursor-pointer'
                  }
                  ${selectedCountry?.id === country.id
                    ? 'bg-blue-50 border-l-4 border-l-blue-600 shadow-sm'
                    : !isDisabled && 'hover:bg-gray-50 hover:shadow-sm'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFlagEmoji(country.country_code)}</span>
                  <div className="flex-1">
                    <p className="font-medium">
                      {country.name}
                    </p>
                    <p className="text-xs text-gray-500">{country.country_code}</p>
                  </div>
                  {zoneCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {zoneCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
