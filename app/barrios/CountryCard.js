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
      className={`relative p-6 bg-gray-50 rounded-3xl transition-all duration-200 group ${
        hasZones
          ? 'hover:bg-gray-100 hover:shadow-md cursor-pointer'
          : 'opacity-40 cursor-default'
      }`}
      disabled={!hasZones}
    >
      {hasZones && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-gray-700 bg-white rounded-full shadow-sm border border-gray-200">
            {zoneCount}
          </span>
        </div>
      )}

      <div className="text-center">
        <div className={`text-6xl mb-4 transition-transform duration-200 ${
          hasZones ? 'transform group-hover:scale-110' : ''
        }`}>
          {getFlagEmoji(country.country_code)}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">
          {country.name}
        </h3>
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          {country.country_code}
        </p>
      </div>
    </button>
  );
}
