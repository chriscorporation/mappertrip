'use client';

import { useEffect, useState } from 'react';

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

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Countries</h2>
          <p className="text-xs text-gray-500 mt-1">Selecciona un país para ver zonas</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="px-4 py-3 border-b border-gray-100 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Countries</h2>
        <p className="text-xs text-gray-500 mt-1">Selecciona un país para ver zonas</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {countries.map(country => {
          const zoneCount = places.filter(p => p.country_code === country.country_code).length;
          const isDisabled = zoneCount === 0;

          return (
            <button
              key={country.id}
              onClick={() => !isDisabled && onSelectCountry(country)}
              className={`
                w-full text-left px-4 py-3 border-b border-gray-100
                transition-colors
                ${isDisabled
                  ? 'opacity-40 cursor-default'
                  : 'cursor-pointer'
                }
                ${selectedCountry?.id === country.id
                  ? 'bg-blue-50 border-l-4 border-l-blue-600'
                  : !isDisabled && 'hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFlagEmoji(country.country_code)}</span>
                <div>
                  <p className="font-medium">
                    {country.name} <strong>({zoneCount})</strong>
                  </p>
                  <p className="text-xs text-gray-500">{country.country_code}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
