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
      className={`p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl transition-all duration-300 ease-out group relative overflow-hidden ${
        hasZones
          ? 'hover:shadow-xl hover:-translate-y-1 hover:from-blue-50 hover:to-cyan-50 cursor-pointer border-2 border-transparent hover:border-blue-200'
          : 'opacity-40 cursor-default border-2 border-transparent'
      }`}
      disabled={!hasZones}
    >
      {/* Subtle shine effect on hover */}
      {hasZones && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      )}

      <div className="text-center relative z-10">
        <div className={`text-6xl mb-4 transition-all duration-300 ${
          hasZones ? 'transform group-hover:scale-125 group-hover:rotate-3' : ''
        }`}>
          {getFlagEmoji(country.country_code)}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1 transition-colors duration-300 group-hover:text-blue-700">
          {country.name}
        </h3>
        <p className="text-xs text-gray-500 uppercase tracking-wider transition-colors duration-300 group-hover:text-blue-600">
          {country.country_code}
        </p>
      </div>
    </button>
  );
}
