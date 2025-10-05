'use client';

import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiMinus, FiMapPin, FiShield, FiTrendingUp, FiClock } from 'react-icons/fi';

// Mapeo de colores a nivel de seguridad
const SAFETY_LEVELS = {
  green: { name: 'Seguro', color: 'emerald', score: 5, emoji: '✅' },
  yellow: { name: 'Precaución', color: 'yellow', score: 3, emoji: '⚠️' },
  orange: { name: 'Medio', color: 'orange', score: 2, emoji: '⚡' },
  red: { name: 'Inseguro', color: 'red', score: 1, emoji: '❌' }
};

const ComparisonDrawer = ({ zones = [], onRemoveZone, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredZone, setHoveredZone] = useState(null);

  // Track comparison feature usage
  useEffect(() => {
    if (zones.length > 0 && window.trackFeatureUse) {
      window.trackFeatureUse('comparison');
    }
  }, [zones.length]);

  // Calcular estadísticas de comparación
  const getComparativeStats = () => {
    if (zones.length === 0) return null;

    const scores = zones.map(z => SAFETY_LEVELS[z.color]?.score || 0);
    const safestZone = zones.find(z => SAFETY_LEVELS[z.color]?.score === Math.max(...scores));
    const riskiestZone = zones.find(z => SAFETY_LEVELS[z.color]?.score === Math.min(...scores));

    return {
      safestZone,
      riskiestZone,
      avgScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    };
  };

  const stats = getComparativeStats();

  if (zones.length === 0) return null;

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-50
      bg-white shadow-2xl border-t-4 border-blue-500
      transform transition-all duration-500 ease-in-out
      ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}
    `}>
      {/* Header del drawer */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-3 cursor-pointer"
           onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
              <FiMapPin className="text-white text-xl" />
            </div>
            <div className="text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                Comparador de Zonas
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {zones.length}/3
                </span>
              </h3>
              <p className="text-xs text-white/80">
                {isExpanded ? 'Click para minimizar' : 'Click para expandir'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {stats && (
              <div className="hidden sm:flex items-center gap-4 text-white/90 text-sm mr-4">
                <div className="flex items-center gap-1">
                  <FiTrendingUp className="text-emerald-300" />
                  <span>Promedio: {stats.avgScore}/5</span>
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
            >
              {isExpanded ? <FiMinus size={20} /> : <FiPlus size={20} />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del drawer */}
      <div className={`
        overflow-hidden transition-all duration-500
        ${isExpanded ? 'max-h-96' : 'max-h-0'}
      `}>
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Resumen comparativo */}
          {stats && zones.length > 1 && (
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <FiShield className="text-xl" />
                  <span className="text-xs font-semibold uppercase">Más Segura</span>
                </div>
                <p className="font-bold text-emerald-900 truncate">{stats.safestZone?.address}</p>
                <p className="text-xs text-emerald-600 mt-1">
                  {SAFETY_LEVELS[stats.safestZone?.color]?.name}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <FiTrendingUp className="text-xl" />
                  <span className="text-xs font-semibold uppercase">Promedio</span>
                </div>
                <p className="font-bold text-blue-900 text-2xl">{stats.avgScore}</p>
                <p className="text-xs text-blue-600 mt-1">de 5.0 puntos</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <FiShield className="text-xl" />
                  <span className="text-xs font-semibold uppercase">Más Riesgosa</span>
                </div>
                <p className="font-bold text-red-900 truncate">{stats.riskiestZone?.address}</p>
                <p className="text-xs text-red-600 mt-1">
                  {SAFETY_LEVELS[stats.riskiestZone?.color]?.name}
                </p>
              </div>
            </div>
          )}

          {/* Grid de zonas comparadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {zones.map((zone, index) => {
              const safetyLevel = SAFETY_LEVELS[zone.color] || SAFETY_LEVELS.yellow;
              const isHovered = hoveredZone === zone.id;
              const isSafest = stats?.safestZone?.id === zone.id;
              const isRiskiest = stats?.riskiestZone?.id === zone.id;

              return (
                <div
                  key={zone.id}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className={`
                    relative rounded-xl overflow-hidden
                    transform transition-all duration-300
                    ${isHovered ? 'scale-105 shadow-2xl' : 'shadow-lg'}
                    ${isSafest ? 'ring-4 ring-emerald-400' : ''}
                    ${isRiskiest ? 'ring-4 ring-red-400' : ''}
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  {/* Badge de posición */}
                  <div className={`
                    absolute top-3 left-3 z-10
                    bg-gradient-to-r from-${safetyLevel.color}-500 to-${safetyLevel.color}-600
                    text-white text-xs font-bold px-3 py-1 rounded-full
                    shadow-lg
                  `}>
                    {safetyLevel.emoji} {safetyLevel.name}
                  </div>

                  {/* Botón de eliminar */}
                  <button
                    onClick={() => onRemoveZone(zone.id)}
                    className="absolute top-3 right-3 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
                  >
                    <FiX size={16} />
                  </button>

                  {/* Header con gradiente según nivel de seguridad */}
                  <div className={`
                    bg-gradient-to-br from-${safetyLevel.color}-500 to-${safetyLevel.color}-600
                    p-4 pt-12
                  `}>
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <FiMapPin className="text-white text-2xl" />
                      </div>
                      <div className="flex-1 text-white">
                        <h4 className="font-bold text-sm leading-tight mb-1">
                          {zone.address}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-white/80">
                          <span>{zone.country_code}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenido de la tarjeta */}
                  <div className="bg-white p-4 space-y-3">
                    {/* Score de seguridad */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600 uppercase">
                        Nivel de Seguridad
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`w-3 h-3 rounded-full ${
                              star <= safetyLevel.score
                                ? `bg-${safetyLevel.color}-500`
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Características */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <FiMapPin className="text-blue-500" />
                        <span className="text-gray-600">
                          Lat: {zone.lat?.toFixed(4)}, Lng: {zone.lng?.toFixed(4)}
                        </span>
                      </div>

                      {zone.is_turistic && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                            📸 Zona Turística
                          </span>
                        </div>
                      )}

                      {zone.circle_radius && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-600">
                            Radio: {(zone.circle_radius / 1000).toFixed(1)} km
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Barra de comparación visual */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Score relativo</span>
                        <span className="font-bold text-gray-700">
                          {safetyLevel.score}/5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-${safetyLevel.color}-400 to-${safetyLevel.color}-600 transition-all duration-500 rounded-full`}
                          style={{ width: `${(safetyLevel.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Efecto hover overlay */}
                  {isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  )}
                </div>
              );
            })}

            {/* Placeholder para agregar más zonas */}
            {zones.length < 3 && (
              <div className="rounded-xl border-3 border-dashed border-gray-300 bg-gray-50 p-8 flex flex-col items-center justify-center text-center min-h-[280px]">
                <div className="bg-gray-200 rounded-full p-4 mb-3">
                  <FiPlus className="text-gray-400 text-3xl" />
                </div>
                <p className="text-gray-500 font-semibold mb-1">
                  Agrega otra zona
                </p>
                <p className="text-xs text-gray-400">
                  Puedes comparar hasta 3 zonas
                </p>
              </div>
            )}
          </div>

          {/* Ayuda contextual */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <FiClock className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Tip: Compara antes de decidir</p>
                <p className="text-xs text-blue-600">
                  Usa este comparador para evaluar diferentes zonas y tomar la mejor decisión sobre dónde alojarte o visitar.
                  Las comparaciones se guardan automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animación de entrada */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ComparisonDrawer;
