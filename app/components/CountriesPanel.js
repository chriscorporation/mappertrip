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

// Componente skeleton para loading
const CountrySkeleton = ({ delay = 0 }) => (
  <div
    className="w-full px-4 py-3 border-b border-gray-100 animate-pulse"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-200 rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

export default function CountriesPanel({ selectedCountry, onSelectCountry, places = [] }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filtrar países por búsqueda
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.country_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const totalZones = places.length;
  const countriesWithZones = countries.filter(country =>
    places.some(p => p.country_code === country.country_code)
  ).length;

  if (loading) {
    return (
      <div className="w-80 bg-gradient-to-b from-white to-gray-50 border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="h-7 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <CountrySkeleton key={i} delay={i * 100} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gradient-to-b from-white to-gray-50 border-r border-gray-300 flex flex-col" data-tour-id="countries-panel">
      {/* Header con gradiente sutil */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Countries
        </h2>
        <p className="text-xs text-gray-600 mt-1">Selecciona un país para ver zonas seguras</p>

        {/* Estadísticas visuales */}
        <div className="mt-3 flex gap-2">
          <div className="flex-1 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Países activos</div>
            <div className="text-lg font-bold text-blue-600">{countriesWithZones}</div>
          </div>
          <div className="flex-1 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total zonas</div>
            <div className="text-lg font-bold text-purple-600">{totalZones}</div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar país..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Lista de países con animaciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredCountries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm">No se encontraron países</p>
          </div>
        ) : (
          filteredCountries.map((country, index) => {
            const zoneCount = places.filter(p => p.country_code === country.country_code).length;
            const isDisabled = zoneCount === 0;
            const isSelected = selectedCountry?.id === country.id;

            return (
              <button
                key={country.id}
                onClick={() => !isDisabled && onSelectCountry(country)}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'backwards'
                }}
                className={`
                  w-full text-left px-4 py-3 border-b border-gray-100
                  transition-all duration-300 ease-out
                  animate-[slideIn_0.4s_ease-out]
                  group relative
                  ${isDisabled
                    ? 'opacity-40 cursor-default'
                    : 'cursor-pointer'
                  }
                  ${isSelected
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-600 shadow-md'
                    : !isDisabled && 'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 hover:shadow-sm hover:-translate-y-0.5 hover:scale-[1.01]'
                  }
                `}
              >
                {/* Efecto de brillo en hover */}
                {!isDisabled && !isSelected && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-400/10 to-purple-400/10 pointer-events-none"></div>
                )}

                <div className="flex items-center gap-3 relative z-10">
                  {/* Bandera con animación en hover */}
                  <span className={`
                    text-2xl transition-transform duration-300
                    ${!isDisabled && 'group-hover:scale-110 group-hover:rotate-6'}
                    ${isSelected && 'scale-110'}
                  `}>
                    {getFlagEmoji(country.country_code)}
                  </span>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">
                        {country.name}
                      </p>
                      {/* Badge con animación de pulso para países con zonas */}
                      {zoneCount > 0 && (
                        <span className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                          ${isSelected
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          }
                          transition-all duration-300
                          group-hover:scale-110
                        `}>
                          {zoneCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      {country.country_code}
                      {zoneCount === 0 && (
                        <span className="text-amber-600 font-medium">• Sin cobertura aún</span>
                      )}
                    </p>
                  </div>

                  {/* Icono de flecha para países seleccionados */}
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-blue-600 animate-[bounce_1s_ease-in-out_infinite]"
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
          })
        )}
      </div>

      {/* Footer con ayuda contextual */}
      {filteredCountries.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Cada zona es validada manualmente por nuestro equipo en terreno.
            </p>
          </div>
        </div>
      )}

      {/* Keyframes CSS-in-JS para animación slideIn */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
