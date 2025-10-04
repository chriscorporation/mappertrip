'use client';

import { useState } from 'react';

export default function QuickStatsPanel({ places, selectedCountry }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!selectedCountry) return null;

  // Filtrar zonas del país seleccionado
  const countryPlaces = places.filter(p => p.country_code === selectedCountry.country_code);

  // Contar por nivel de seguridad
  const stats = {
    safe: countryPlaces.filter(p => p.color === '#22c55e').length,      // verde
    medium: countryPlaces.filter(p => p.color === '#3b82f6').length,    // azul
    regular: countryPlaces.filter(p => p.color === '#f97316').length,   // naranja
    caution: countryPlaces.filter(p => p.color === '#eab308').length,   // amarillo
    unsafe: countryPlaces.filter(p => p.color === '#dc2626').length,    // rojo
  };

  const total = countryPlaces.length;

  if (total === 0) return null;

  // Calcular porcentaje de zonas seguras (verde + azul)
  const safePercentage = total > 0 ? Math.round(((stats.safe + stats.medium) / total) * 100) : 0;

  return (
    <div className="absolute bottom-24 right-6 z-20 animate-[fadeIn_0.4s_ease-out]">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden max-w-xs">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-bold text-sm">Estadísticas Rápidas</h3>
                <p className="text-xs opacity-90">{selectedCountry.name}</p>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 space-y-3 animate-[fadeIn_0.3s_ease-out]">
            {/* Total Zones */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Total de Zonas</span>
                <span className="text-2xl font-extrabold text-gray-800">{total}</span>
              </div>
            </div>

            {/* Safety Score */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Índice de Seguridad</span>
                <span className={`text-lg font-extrabold ${
                  safePercentage >= 70 ? 'text-green-600' :
                  safePercentage >= 40 ? 'text-blue-600' :
                  'text-orange-600'
                }`}>
                  {safePercentage}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${
                    safePercentage >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    safePercentage >= 40 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                    'bg-gradient-to-r from-orange-400 to-amber-500'
                  }`}
                  style={{ width: `${safePercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5 text-center">
                {safePercentage >= 70 ? '✨ Alta seguridad general' :
                 safePercentage >= 40 ? '⚖️ Seguridad moderada' :
                 '⚠️ Evalúa cuidadosamente'}
              </p>
            </div>

            {/* Breakdown by level */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-700 mb-2">Desglose por Nivel</p>

              {stats.safe > 0 && (
                <div className="flex items-center justify-between group hover:bg-green-50 p-2 rounded-lg transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base group-hover:scale-125 transition-transform duration-200">🟢</span>
                    <span className="text-xs font-medium text-gray-700">Seguro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-gray-200 rounded-full w-16 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                        style={{ width: `${(stats.safe / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-green-600 min-w-[24px] text-right">{stats.safe}</span>
                  </div>
                </div>
              )}

              {stats.medium > 0 && (
                <div className="flex items-center justify-between group hover:bg-blue-50 p-2 rounded-lg transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base group-hover:scale-125 transition-transform duration-200">🔵</span>
                    <span className="text-xs font-medium text-gray-700">Medio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-gray-200 rounded-full w-16 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-500"
                        style={{ width: `${(stats.medium / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-blue-600 min-w-[24px] text-right">{stats.medium}</span>
                  </div>
                </div>
              )}

              {stats.regular > 0 && (
                <div className="flex items-center justify-between group hover:bg-orange-50 p-2 rounded-lg transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base group-hover:scale-125 transition-transform duration-200">🟠</span>
                    <span className="text-xs font-medium text-gray-700">Regular</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-gray-200 rounded-full w-16 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500"
                        style={{ width: `${(stats.regular / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-orange-600 min-w-[24px] text-right">{stats.regular}</span>
                  </div>
                </div>
              )}

              {stats.caution > 0 && (
                <div className="flex items-center justify-between group hover:bg-yellow-50 p-2 rounded-lg transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base group-hover:scale-125 transition-transform duration-200">🟡</span>
                    <span className="text-xs font-medium text-gray-700">Precaución</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-gray-200 rounded-full w-16 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 transition-all duration-500"
                        style={{ width: `${(stats.caution / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-yellow-600 min-w-[24px] text-right">{stats.caution}</span>
                  </div>
                </div>
              )}

              {stats.unsafe > 0 && (
                <div className="flex items-center justify-between group hover:bg-red-50 p-2 rounded-lg transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base group-hover:scale-125 transition-transform duration-200">🔴</span>
                    <span className="text-xs font-medium text-gray-700">Inseguro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 bg-gray-200 rounded-full w-16 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-rose-500 transition-all duration-500"
                        style={{ width: `${(stats.unsafe / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-red-600 min-w-[24px] text-right">{stats.unsafe}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer tip */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center italic">
                💡 Usa estos datos para decisiones informadas
              </p>
            </div>
          </div>
        )}

        {/* Collapsed state */}
        {!isExpanded && (
          <div className="p-3 flex items-center justify-center gap-3 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-gray-800">{total}</span>
              <span className="text-xs text-gray-600">zonas</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <span className={`text-base font-bold ${
                safePercentage >= 70 ? 'text-green-600' :
                safePercentage >= 40 ? 'text-blue-600' :
                'text-orange-600'
              }`}>
                {safePercentage}%
              </span>
              <span className="text-xs text-gray-600">seguro</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
