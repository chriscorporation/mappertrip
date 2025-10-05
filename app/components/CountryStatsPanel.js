'use client';

import { useState, useMemo } from 'react';
import { BiShield, BiChart, BiChevronDown, BiChevronUp } from 'react-icons/bi';

export default function CountryStatsPanel({ selectedCountry, places }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calculate statistics for the selected country
  const stats = useMemo(() => {
    if (!selectedCountry) return null;

    const countryPlaces = places.filter(p => p.country_code === selectedCountry.country_code);

    const colorDistribution = {
      '#22c55e': { count: 0, label: 'Seguras', emoji: '🟢', color: 'green' },
      '#3b82f6': { count: 0, label: 'Media', emoji: '🔵', color: 'blue' },
      '#f97316': { count: 0, label: 'Regular', emoji: '🟠', color: 'orange' },
      '#eab308': { count: 0, label: 'Precaución', emoji: '🟡', color: 'yellow' },
      '#dc2626': { count: 0, label: 'Inseguras', emoji: '🔴', color: 'red' }
    };

    countryPlaces.forEach(place => {
      if (colorDistribution[place.color]) {
        colorDistribution[place.color].count++;
      }
    });

    const totalZones = countryPlaces.length;
    const safeZones = colorDistribution['#22c55e'].count + colorDistribution['#3b82f6'].count;
    const unsafeZones = colorDistribution['#dc2626'].count + colorDistribution['#eab308'].count;

    // Calculate safety percentage
    const safetyPercentage = totalZones > 0 ? Math.round((safeZones / totalZones) * 100) : 0;

    return {
      totalZones,
      colorDistribution,
      safetyPercentage,
      safeZones,
      unsafeZones
    };
  }, [selectedCountry, places]);

  if (!selectedCountry || !stats || stats.totalZones === 0) {
    return null;
  }

  return (
    <div className="absolute top-20 right-6 z-20 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden max-w-sm">
        {/* Header */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex items-center justify-between hover:from-blue-100 hover:to-purple-100 transition-all duration-300 group"
        >
          <div className="flex items-center gap-2">
            <BiChart className="text-xl text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="font-bold text-sm text-gray-800">Estadísticas de Seguridad</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 bg-white/60 px-2 py-1 rounded-full">
              {stats.totalZones} zona{stats.totalZones !== 1 ? 's' : ''}
            </span>
            {isCollapsed ? (
              <BiChevronDown className="text-gray-500 text-xl group-hover:text-blue-600 transition-colors" />
            ) : (
              <BiChevronUp className="text-gray-500 text-xl group-hover:text-blue-600 transition-colors" />
            )}
          </div>
        </button>

        {/* Content */}
        {!isCollapsed && (
          <div className="p-4 space-y-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Overall Safety Score */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-300 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <BiShield className="text-xl text-gray-600" />
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Índice General</h4>
              </div>

              {/* Progress bar */}
              <div className="relative mb-3">
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 ${
                      stats.safetyPercentage >= 70
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                        : stats.safetyPercentage >= 40
                        ? 'bg-gradient-to-r from-blue-400 to-cyan-500'
                        : 'bg-gradient-to-r from-orange-400 to-red-500'
                    }`}
                    style={{ width: `${stats.safetyPercentage}%` }}
                  >
                    <span className="text-white font-bold text-xs drop-shadow-lg">
                      {stats.safetyPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety label */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {stats.safeZones} seguras, {stats.unsafeZones} con precaución
                </span>
                <span className={`text-xs font-bold ${
                  stats.safetyPercentage >= 70
                    ? 'text-green-700'
                    : stats.safetyPercentage >= 40
                    ? 'text-blue-700'
                    : 'text-orange-700'
                }`}>
                  {stats.safetyPercentage >= 70 ? 'Favorable' : stats.safetyPercentage >= 40 ? 'Moderado' : 'Cauteloso'}
                </span>
              </div>
            </div>

            {/* Distribution bars */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Distribución por Nivel</h4>
              {Object.entries(stats.colorDistribution).map(([color, data]) => {
                if (data.count === 0) return null;
                const percentage = Math.round((data.count / stats.totalZones) * 100);

                return (
                  <div key={color} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <span>{data.emoji}</span>
                        <span>{data.label}</span>
                      </span>
                      <span className="text-xs font-bold text-gray-600">
                        {data.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ease-out ${
                          data.color === 'green'
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : data.color === 'blue'
                            ? 'bg-gradient-to-r from-blue-400 to-cyan-500'
                            : data.color === 'orange'
                            ? 'bg-gradient-to-r from-orange-400 to-amber-500'
                            : data.color === 'yellow'
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                            : 'bg-gradient-to-r from-red-400 to-rose-500'
                        } group-hover:opacity-80`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info footer */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic text-center">
                📊 Basado en {stats.totalZones} zona{stats.totalZones !== 1 ? 's' : ''} validada{stats.totalZones !== 1 ? 's' : ''} manualmente
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
