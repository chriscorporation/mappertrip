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
      className={`p-6 bg-white border border-gray-200 rounded-2xl transition-all duration-300 group relative ${
        hasZones
          ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
          : 'opacity-40 cursor-default'
      }`}
      disabled={!hasZones}
    >
      {hasZones && zoneCount > 0 && (
        <div className="absolute top-3 right-3 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
          {zoneCount} {zoneCount === 1 ? 'zona' : 'zonas'}
        </div>
      )}

      <div className="text-center mt-2">
        <div className={`text-6xl mb-4 transition-transform duration-300 ${
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
