'use client';

import { BiChevronRight, BiHome, BiWorld } from 'react-icons/bi';
import { useRouter } from 'next/navigation';

// Función para convertir country_code a emoji de bandera
const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

export default function ContextBar({ selectedCountry, zoneCount, onBackToCountries }) {
  const router = useRouter();

  if (!selectedCountry) return null;

  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 shadow-sm">
      {/* Breadcrumb Navigation */}
      <div className="px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => router.push('/?tab=countries')}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors group"
            title="Ir a Countries"
          >
            <BiHome className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Countries</span>
          </button>

          <BiChevronRight className="w-4 h-4 text-gray-400" />

          <div className="flex items-center gap-2 font-medium text-gray-800">
            <span className="text-xl">{getFlagEmoji(selectedCountry.country_code)}</span>
            <span>{selectedCountry.name}</span>
          </div>
        </div>
      </div>

      {/* Country Context Info */}
      <div className="px-4 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-blue-200 shadow-sm">
            <BiWorld className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-gray-700">
              {zoneCount} {zoneCount === 1 ? 'zona' : 'zonas'}
            </span>
          </div>
        </div>

        <button
          onClick={onBackToCountries}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors flex items-center gap-1 group"
        >
          <BiChevronRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          Cambiar país
        </button>
      </div>
    </div>
  );
}
