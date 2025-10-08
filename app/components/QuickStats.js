'use client';

import { useState, useEffect } from 'react';

export default function QuickStats({ places, selectedCountry }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState({
    totalCountries: 0,
    totalZones: 0,
    safeZones: 0,
    riskZones: 0,
  });

  useEffect(() => {
    // Filtrar lugares activos
    const activePlaces = places.filter(p => p.active !== null);

    // Calcular estadísticas
    const countries = new Set(activePlaces.map(p => p.country_code)).size;
    const total = activePlaces.length;

    // Contar zonas seguras (safety_level_id 1 o 2) vs zonas de riesgo (3+)
    const safe = activePlaces.filter(p => p.safety_level_id <= 2).length;
    const risk = activePlaces.filter(p => p.safety_level_id >= 3).length;

    setStats({
      totalCountries: countries,
      totalZones: total,
      safeZones: safe,
      riskZones: risk,
    });
  }, [places]);

  // Si hay país seleccionado, mostrar stats de ese país
  const countryStats = selectedCountry ? (() => {
    const countryPlaces = places.filter(p =>
      p.country_code === selectedCountry.country_code && p.active !== null
    );
    const safe = countryPlaces.filter(p => p.safety_level_id <= 2).length;
    const risk = countryPlaces.filter(p => p.safety_level_id >= 3).length;

    return {
      totalZones: countryPlaces.length,
      safeZones: safe,
      riskZones: risk,
    };
  })() : null;

  return (
    <div className="absolute bottom-6 left-6 z-40">
      {/* Collapsed State - Button to expand */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-white rounded-full shadow-xl px-5 py-3 flex items-center gap-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 group"
          aria-label="Ver estadísticas"
        >
          <svg
            className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
            Stats
          </span>
        </button>
      )}

      {/* Expanded State - Stats Panel */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-white font-bold text-sm">
                {countryStats ? selectedCountry.name : 'Estadísticas Globales'}
              </h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stats Content */}
          <div className="p-5 space-y-4">
            {/* Global stats (always show) */}
            {!countryStats && (
              <>
                <StatItem
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  label="Países cubiertos"
                  value={stats.totalCountries}
                  color="blue"
                />

                <StatItem
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  label="Zonas mapeadas"
                  value={stats.totalZones}
                  color="purple"
                />
              </>
            )}

            {/* Country-specific or global zone breakdown */}
            <StatItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Zonas seguras"
              value={countryStats ? countryStats.safeZones : stats.safeZones}
              color="green"
              showBar
              percentage={countryStats
                ? Math.round((countryStats.safeZones / countryStats.totalZones) * 100)
                : Math.round((stats.safeZones / stats.totalZones) * 100)
              }
            />

            <StatItem
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              label="Zonas de precaución"
              value={countryStats ? countryStats.riskZones : stats.riskZones}
              color="red"
              showBar
              percentage={countryStats
                ? Math.round((countryStats.riskZones / countryStats.totalZones) * 100)
                : Math.round((stats.riskZones / stats.totalZones) * 100)
              }
            />

            {/* Country total zones if showing country stats */}
            {countryStats && (
              <StatItem
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                label="Total zonas"
                value={countryStats.totalZones}
                color="purple"
              />
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Validado manualmente por nuestro equipo en terreno
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para cada estadística individual
function StatItem({ icon, label, value, color, showBar, percentage }) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      bar: 'bg-blue-500',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      bar: 'bg-purple-500',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      bar: 'bg-green-500',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      bar: 'bg-red-500',
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="flex items-center gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
      <div className={`${colors.bg} ${colors.text} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
        {showBar && percentage !== undefined && !isNaN(percentage) && (
          <div className="mt-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`${colors.bar} h-full rounded-full transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
      {showBar && percentage !== undefined && !isNaN(percentage) && (
        <div className={`text-sm font-bold ${colors.text}`}>
          {percentage}%
        </div>
      )}
    </div>
  );
}
