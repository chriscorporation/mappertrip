'use client';

import { useRouter } from 'next/navigation';
import AnimatedCounter from '../components/AnimatedCounter';

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

export default function CountryCard({ country, zoneCount }) {
  const router = useRouter();
  const hasZones = zoneCount > 0;

  const slug = country.name.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

  return (
    <button
      onClick={() => hasZones && router.push(`/barrios/${slug}`)}
      className={`p-6 bg-gray-50 rounded-3xl transition-all duration-300 group relative overflow-hidden ${
        hasZones
          ? 'hover:bg-gray-100 hover:shadow-lg cursor-pointer'
          : 'opacity-40 cursor-default'
      }`}
      disabled={!hasZones}
    >
      <div className="text-center">
        <div className={`text-6xl mb-4 transition-transform duration-300 ${
          hasZones ? 'transform group-hover:scale-110' : ''
        }`}>
          {getFlagEmoji(country.country_code)}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">
          {country.name}
        </h3>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          {country.country_code}
        </p>

        {hasZones && (
          <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-gray-200">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-sm font-semibold text-gray-700">
              <AnimatedCounter value={zoneCount} /> {zoneCount === 1 ? 'zona' : 'zonas'}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
