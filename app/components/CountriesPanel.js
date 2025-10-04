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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900">Países</h2>
        <p className="text-sm text-gray-600 mt-1">Explora zonas seguras en Latinoamérica</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-3">
          {countries.map(country => {
            const zoneCount = places.filter(p => p.country_code === country.country_code).length;
            const isDisabled = zoneCount === 0;

            return (
              <button
                key={country.id}
                onClick={() => !isDisabled && onSelectCountry(country)}
                className={`
                  w-full text-left p-4 rounded-xl bg-white border border-gray-200
                  transition-all duration-200 ease-out
                  ${isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300'
                  }
                  ${selectedCountry?.id === country.id
                    ? 'ring-2 ring-blue-500 border-blue-500 shadow-md'
                    : 'shadow-sm'
                  }
                `}
                disabled={isDisabled}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    text-4xl transition-transform duration-200
                    ${!isDisabled && 'group-hover:scale-110'}
                  `}>
                    {getFlagEmoji(country.country_code)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-gray-900 text-base">
                        {country.name}
                      </p>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {zoneCount} {zoneCount === 1 ? 'zona' : 'zonas'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">
                      {country.country_code}
                    </p>
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
