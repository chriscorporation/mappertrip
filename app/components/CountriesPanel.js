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
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Countries</h2>
        <p className="text-sm text-gray-500 mt-2">Selecciona un país para ver zonas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {countries.map(country => {
            const zoneCount = places.filter(p => p.country_code === country.country_code).length;
            const isDisabled = zoneCount === 0;

            return (
              <button
                key={country.id}
                onClick={() => !isDisabled && onSelectCountry(country)}
                className={`
                  w-full text-left px-5 py-4 rounded-xl
                  transition-all duration-200
                  ${isDisabled
                    ? 'opacity-40 cursor-default bg-gray-50'
                    : 'cursor-pointer shadow-sm hover:shadow-md'
                  }
                  ${selectedCountry?.id === country.id
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-md'
                    : !isDisabled && 'bg-white border border-gray-200 hover:border-gray-300 hover:-translate-y-0.5'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl transition-transform duration-200 hover:scale-110">
                    {getFlagEmoji(country.country_code)}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-base mb-0.5">
                      {country.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{country.country_code}</p>
                      <span className="text-xs text-gray-400">•</span>
                      <span className={`text-xs font-medium ${
                        selectedCountry?.id === country.id ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {zoneCount} {zoneCount === 1 ? 'zona' : 'zonas'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
