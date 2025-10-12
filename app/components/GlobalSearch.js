'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalSearch({ places = [], countries = [], insecurityLevels = [], selectedCountry, onSelectCountry, onGoToPlace }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search results filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results = [];

    // Filter active places (exclude active = null)
    const activePlaces = places.filter(p => p.active !== null);

    // Search zones by address or country
    activePlaces.forEach(place => {
      const addressMatch = place.address?.toLowerCase().includes(query);
      const countryMatch = place.country_code?.toLowerCase().includes(query);

      // Find country name for this place
      const country = countries.find(c => c.country_code === place.country_code);
      const countryNameMatch = country?.name?.toLowerCase().includes(query);

      // Find safety level name
      const safetyLevel = insecurityLevels.find(l => l.id === place.safety_level_id);
      const safetyLevelMatch = safetyLevel?.level?.toLowerCase().includes(query);

      if (addressMatch || countryMatch || countryNameMatch || safetyLevelMatch) {
        results.push({
          type: 'zone',
          data: place,
          country: country,
          safetyLevel: safetyLevel,
          matchReason: addressMatch ? 'address' : countryNameMatch ? 'country' : safetyLevelMatch ? 'safety' : 'code'
        });
      }
    });

    // Search countries
    countries.forEach(country => {
      const nameMatch = country.name?.toLowerCase().includes(query);
      const codeMatch = country.country_code?.toLowerCase().includes(query);

      if (nameMatch || codeMatch) {
        const zoneCount = activePlaces.filter(p => p.country_code === country.country_code).length;
        if (zoneCount > 0) {
          results.push({
            type: 'country',
            data: country,
            zoneCount: zoneCount
          });
        }
      }
    });

    return results.slice(0, 8); // Limit to 8 results
  }, [searchQuery, places, countries, insecurityLevels]);

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % searchResults.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
        break;
      case 'Enter':
        event.preventDefault();
        handleSelectResult(searchResults[highlightedIndex]);
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (resultsRef.current && highlightedIndex >= 0) {
      const highlightedElement = resultsRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchResults]);

  const handleSelectResult = (result) => {
    if (result.type === 'zone') {
      // Navigate to zones tab and select the zone
      const country = countries.find(c => c.country_code === result.data.country_code);
      if (country && onSelectCountry) {
        onSelectCountry(country);
      }

      // Wait a bit for the navigation to complete, then go to place
      setTimeout(() => {
        if (onGoToPlace) {
          onGoToPlace(result.data);
        }
      }, 300);
    } else if (result.type === 'country' && onSelectCountry) {
      onSelectCountry(result.data);
    }

    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md mx-4">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar zonas o países... (⌘K)"
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
        />

        {/* Search Icon */}
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

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchQuery && searchResults.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50"
        >
          {searchResults.map((result, index) => (
            <button
              key={`${result.type}-${result.data.id || result.data.country_code}-${index}`}
              onClick={() => handleSelectResult(result)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                highlightedIndex === index ? 'bg-purple-50' : ''
              }`}
            >
              {result.type === 'zone' ? (
                <div className="flex items-start gap-3">
                  {/* Zone Icon */}
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: result.data.color + '30', border: `2px solid ${result.data.color}` }}
                  >
                    <svg className="w-4 h-4" style={{ color: result.data.color }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Zone Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {result.data.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        {getFlagEmoji(result.data.country_code)}
                        {result.country?.name}
                      </span>
                      {result.safetyLevel && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
                            backgroundColor: result.data.color + '20',
                            color: result.data.color
                          }}>
                            {result.safetyLevel.level}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Country Flag */}
                  <div className="text-2xl flex-shrink-0">
                    {getFlagEmoji(result.data.country_code)}
                  </div>

                  {/* Country Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {result.data.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.zoneCount} {result.zoneCount === 1 ? 'zona' : 'zonas'}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {isOpen && searchQuery && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl p-4 z-50">
          <div className="text-center text-sm text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No se encontraron resultados
          </div>
        </div>
      )}
    </div>
  );
}
