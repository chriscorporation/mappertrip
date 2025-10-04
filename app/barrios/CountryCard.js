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

export default function CountryCard({
  country,
  zoneCount,
  safeZones = 0,
  unsafeZones = 0,
  regularZones = 0,
  safetyPercentage = 0
}) {
  const router = useRouter();
  const hasZones = zoneCount > 0;

  const slug = country.name.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

  // Determine safety badge based on percentage
  const getSafetyBadge = () => {
    if (!hasZones) return null;

    if (safetyPercentage >= 70) {
      return {
        color: 'from-green-500 to-emerald-500',
        icon: '🛡️',
        text: 'Alta',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (safetyPercentage >= 40) {
      return {
        color: 'from-yellow-500 to-amber-400',
        icon: '⚠️',
        text: 'Media',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    } else {
      return {
        color: 'from-red-500 to-rose-500',
        icon: '🚨',
        text: 'Baja',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
  };

  const safetyBadge = getSafetyBadge();

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

        {/* Safety Score Visual Indicator */}
        {hasZones && safetyBadge && (
          <div className="mt-4 space-y-2 animate-[fadeIn_0.5s_ease-out]">
            {/* Mini Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${safetyBadge.color} transition-all duration-1000 ease-out`}
                style={{ width: `${safetyPercentage}%` }}
              />
            </div>

            {/* Safety Badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${safetyBadge.bgColor} border ${safetyBadge.borderColor} shadow-sm`}>
              <span className="mr-1">{safetyBadge.icon}</span>
              <span className="text-gray-700">{safetyPercentage}% Seguro</span>
            </div>

            {/* Zone Stats */}
            <div className="flex justify-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
                <span className="text-green-600 font-bold">{safeZones}</span>
                <span className="text-gray-500">🟢</span>
              </div>
              {regularZones > 0 && (
                <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
                  <span className="text-orange-600 font-bold">{regularZones}</span>
                  <span className="text-gray-500">🟠</span>
                </div>
              )}
              {unsafeZones > 0 && (
                <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
                  <span className="text-red-600 font-bold">{unsafeZones}</span>
                  <span className="text-gray-500">🔴</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
