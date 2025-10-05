'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX, FiMap, FiMapPin, FiGlobe, FiCommand } from 'react-icons/fi';
import { useAppStore } from '../store/appStore';

export default function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { setSelectedCountry } = useAppStore();

  // Cargar países y zonas
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar países
        const countriesRes = await fetch('/api/countries');
        const countriesData = await countriesRes.json();
        setCountries(countriesData);

        // Cargar zonas
        const zonesRes = await fetch('/api/places');
        const zonesData = await zonesRes.json();
        setZones(zonesData);
      } catch (error) {
        console.error('Error loading search data:', error);
      }
    };

    loadData();
  }, []);

  // Escuchar atajo de teclado Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K en Mac o Ctrl+K en Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // ESC para cerrar
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
        setSelectedIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus en el input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filtrar resultados basados en la búsqueda
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // Mostrar países destacados cuando no hay búsqueda
      return {
        countries: countries.slice(0, 5),
        zones: []
      };
    }

    const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filteredCountries = countries.filter(country =>
      country.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query)
    ).slice(0, 5);

    const filteredZones = zones.filter(zone => {
      const zoneName = zone.address?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || '';
      const cityName = zone.city?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || '';
      return zoneName.includes(query) || cityName.includes(query);
    }).slice(0, 8);

    return {
      countries: filteredCountries,
      zones: filteredZones
    };
  }, [searchQuery, countries, zones]);

  // Total de resultados para navegación con teclado
  const totalResults = filteredResults.countries.length + filteredResults.zones.length;

  // Navegación con teclado (arriba/abajo/enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalResults);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalResults) % totalResults);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectResult(selectedIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, totalResults]);

  const handleSelectResult = (index) => {
    const countriesCount = filteredResults.countries.length;

    if (index < countriesCount) {
      // Es un país
      const country = filteredResults.countries[index];
      setSelectedCountry(country);
      router.push('/?tab=zones');
    } else {
      // Es una zona
      const zone = filteredResults.zones[index - countriesCount];
      // Encontrar el país de esta zona
      const country = countries.find(c => c.country_code === zone.country_code);
      if (country) {
        setSelectedCountry(country);
        router.push('/?tab=zones');
      }
    }

    // Cerrar el modal
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  };

  const getSafetyColor = (category) => {
    const colors = {
      'Safe': 'text-green-600 bg-green-50',
      'Medium': 'text-blue-600 bg-blue-50',
      'Regular': 'text-yellow-600 bg-yellow-50',
      'Caution': 'text-orange-600 bg-orange-50',
      'Unsafe': 'text-red-600 bg-red-50',
    };
    return colors[category] || 'text-gray-600 bg-gray-50';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        title="Búsqueda rápida (Cmd+K)"
      >
        <FiSearch className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">Buscar</span>
        <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded text-xs">
          <FiCommand className="w-3 h-3" />
          K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={() => {
          setIsOpen(false);
          setSearchQuery('');
          setSelectedIndex(0);
        }}
      />

      {/* Modal de búsqueda */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4 animate-slideDown">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Input de búsqueda */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
            <FiSearch className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Buscar países, ciudades o zonas..."
              className="flex-1 outline-none text-lg placeholder-gray-400"
            />
            <button
              onClick={() => {
                setIsOpen(false);
                setSearchQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Resultados */}
          <div className="max-h-96 overflow-y-auto">
            {/* Países */}
            {filteredResults.countries.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Países
                </div>
                {filteredResults.countries.map((country, index) => (
                  <button
                    key={country.id}
                    onClick={() => handleSelectResult(index)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      selectedIndex === index
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm flex-shrink-0">
                      {country.country_code}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">{country.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <FiGlobe className="w-3 h-3" />
                        {country.country_code}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Zonas */}
            {filteredResults.zones.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Zonas
                </div>
                {filteredResults.zones.map((zone, index) => {
                  const globalIndex = filteredResults.countries.length + index;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => handleSelectResult(globalIndex)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                        selectedIndex === globalIndex
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
                        <FiMap className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900">{zone.address}</div>
                        <div className="text-sm text-gray-500">
                          {zone.city && `${zone.city} • `}
                          {countries.find(c => c.country_code === zone.country_code)?.name}
                        </div>
                      </div>
                      {zone.category && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSafetyColor(zone.category)}`}>
                          {zone.category}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sin resultados */}
            {totalResults === 0 && searchQuery.trim() && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiSearch className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-gray-600 font-medium mb-1">No se encontraron resultados</div>
                <div className="text-sm text-gray-500">
                  Intenta con otro término de búsqueda
                </div>
              </div>
            )}

            {/* Mensaje inicial */}
            {totalResults > 0 && !searchQuery.trim() && (
              <div className="p-4 text-center border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Empieza a escribir para buscar países, ciudades o zonas
                </div>
              </div>
            )}
          </div>

          {/* Footer con atajos */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">↑</kbd>
                <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">↓</kbd>
                <span>Navegar</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">↵</kbd>
                <span>Seleccionar</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">ESC</kbd>
                <span>Cerrar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
