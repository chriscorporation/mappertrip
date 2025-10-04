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
                w-full text-left px-5 py-4 border-b border-gray-100
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
              <div className="flex items-center gap-4">
                <span className="text-3xl transition-transform duration-200 hover:scale-110">{getFlagEmoji(country.country_code)}</span>
                <div>
                  <p className="font-semibold text-gray-900 tracking-tight">
                    {country.name} <span className="font-bold text-blue-600">({zoneCount})</span>
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mt-0.5">{country.country_code}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
