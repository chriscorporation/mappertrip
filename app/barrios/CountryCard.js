'use client';

import { useRouter } from 'next/navigation';

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
      className={`p-6 bg-white rounded-2xl border border-gray-200 transition-all duration-300 ease-in-out group ${
        hasZones
          ? 'hover:shadow-xl hover:scale-105 hover:border-gray-300 cursor-pointer'
          : 'opacity-40 cursor-default'
      }`}
      disabled={!hasZones}
    >
      <div className="text-center">
        <div className={`text-6xl mb-4 transition-transform duration-300 ${
          hasZones ? 'transform group-hover:scale-125' : ''
        }`}>
          {getFlagEmoji(country.country_code)}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1 transition-colors duration-300 group-hover:text-blue-600">
          {country.name}
        </h3>
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          {country.country_code}
        </p>
        {hasZones && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
              {zoneCount} {zoneCount === 1 ? 'zona' : 'zonas'}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
