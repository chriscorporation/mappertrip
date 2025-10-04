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
      className={`p-6 bg-white rounded-3xl transition-all duration-300 ease-out group border border-gray-100 ${
        hasZones
          ? 'hover:shadow-xl hover:-translate-y-1 hover:border-gray-200 cursor-pointer'
          : 'opacity-40 cursor-default'
      }`}
      disabled={!hasZones}
    >
      <div className="text-center">
        <div className={`text-6xl mb-4 transition-all duration-300 ease-out ${
          hasZones ? 'transform group-hover:scale-110' : ''
        }`}>
          {getFlagEmoji(country.country_code)}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-1 transition-colors duration-300 group-hover:text-blue-600">
          {country.name}
        </h3>
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          {country.country_code}
        </p>
      </div>
    </button>
  );
}
