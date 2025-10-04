'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Map country codes to flag emojis
const countryFlags = {
  'AR': '🇦🇷',
  'BO': '🇧🇴',
  'BR': '🇧🇷',
  'CL': '🇨🇱',
  'CO': '🇨🇴',
  'CR': '🇨🇷',
  'CU': '🇨🇺',
  'EC': '🇪🇨',
  'SV': '🇸🇻',
  'GT': '🇬🇹',
  'HN': '🇭🇳',
  'MX': '🇲🇽',
  'NI': '🇳🇮',
  'PA': '🇵🇦',
  'PY': '🇵🇾',
  'PE': '🇵🇪',
  'PR': '🇵🇷',
  'DO': '🇩🇴',
  'UY': '🇺🇾',
  'VE': '🇻🇪'
};

export default function CountryQuickSelector({
  countries,
  selectedCountry,
  onSelectCountry,
  places
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectorRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count zones per country
  const getZoneCount = (countryCode) => {
    return places.filter(p => p.country_code === countryCode).length;
  };

  const handleCountrySelect = (country) => {
    onSelectCountry(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={selectorRef} className="relative country-quick-selector">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-gray-200
          px-4 py-3 hover:scale-105 transition-all duration-300 group
          flex items-center gap-3 min-w-[200px]
        "
        title="Cambiar país rápidamente"
      >
        {selectedCountry ? (
          <>
            <span className="text-2xl animate-[fadeIn_0.3s_ease-out]">
              {countryFlags[selectedCountry.country_code] || '🌎'}
            </span>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-800 leading-tight">
                {selectedCountry.name}
              </p>
              <p className="text-xs text-gray-500">
                {getZoneCount(selectedCountry.country_code)} {getZoneCount(selectedCountry.country_code) === 1 ? 'zona' : 'zonas'}
              </p>
            </div>
          </>
        ) : (
          <>
            <span className="text-2xl">🌎</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-800">
                Seleccionar país
              </p>
            </div>
          </>
        )}

        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="
          absolute top-full mt-2 left-0 w-full
          bg-white/98 backdrop-blur-md rounded-xl shadow-2xl border-2 border-gray-200
          overflow-hidden z-50 animate-[fadeIn_0.2s_ease-out]
          max-h-[400px] flex flex-col
        ">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 bg-gray-50/80">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200
                "
                autoFocus
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto max-h-[320px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const zoneCount = getZoneCount(country.country_code);
                const isSelected = selectedCountry?.country_code === country.country_code;

                return (
                  <button
                    key={country.id}
                    onClick={() => handleCountrySelect(country)}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 transition-all duration-200
                      ${isSelected
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-600'
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                      }
                    `}
                  >
                    <span className="text-2xl flex-shrink-0">
                      {countryFlags[country.country_code] || '🌎'}
                    </span>

                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                        {country.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          {zoneCount} {zoneCount === 1 ? 'zona' : 'zonas'}
                        </span>
                        {zoneCount > 0 && (
                          <span className="text-xs">
                            {zoneCount >= 10 ? '🔥' : zoneCount >= 5 ? '⭐' : '📍'}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <p className="text-sm">No se encontraron países</p>
                <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
              </div>
            )}
          </div>

          {/* Footer with stats */}
          {filteredCountries.length > 0 && (
            <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                <span className="font-semibold">{filteredCountries.length}</span> {filteredCountries.length === 1 ? 'país disponible' : 'países disponibles'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
