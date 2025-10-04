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
      <div className="w-80 bg-white border-r border-gray-300 p-4">
        <h2 className="text-xl font-bold mb-4">Countries</h2>
        <p className="text-gray-500">Cargando...</p>
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
                transition-all duration-300 ease-out
                ${isDisabled
                  ? 'opacity-40 cursor-default'
                  : 'cursor-pointer group'
                }
                ${selectedCountry?.id === country.id
                  ? 'bg-blue-50 border-l-4 border-l-blue-600 shadow-sm'
                  : !isDisabled && 'hover:bg-gray-50 hover:shadow-md hover:border-l-4 hover:border-l-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className={`text-2xl transition-transform duration-300 ${!isDisabled && 'group-hover:scale-125'}`}>
                  {getFlagEmoji(country.country_code)}
                </span>
                <div className="flex-1">
                  <p className={`font-medium transition-colors duration-200 ${!isDisabled && 'group-hover:text-gray-900'}`}>
                    {country.name} <strong className="text-blue-600">({zoneCount})</strong>
                  </p>
                  <p className="text-xs text-gray-500">{country.country_code}</p>
                </div>
                {!isDisabled && (
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-all duration-300 ${selectedCountry?.id === country.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
