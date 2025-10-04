'use client';

import { useState } from 'react';
import { BiDollar, BiShield, BiMapAlt, BiX } from 'react-icons/bi';
import { HiOutlineSparkles } from 'react-icons/hi';

export default function ZoneComparison({ zones, onClose, onRemoveZone }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!zones || zones.length === 0) return null;

  const getSafetyColor = (color) => {
    const colorMap = {
      '#22c55e': { bg: 'bg-green-50', text: 'text-green-700', label: 'Seguro' },
      '#3b82f6': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Medio' },
      '#eab308': { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Precaución' },
      '#f97316': { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Regular' },
      '#ef4444': { bg: 'bg-red-50', text: 'text-red-700', label: 'Inseguro' },
      '#dc2626': { bg: 'bg-red-50', text: 'text-red-700', label: 'Inseguro' },
    };
    return colorMap[color] || { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Desconocido' };
  };

  const getSecurityLevel = (secureText) => {
    if (!secureText) return { emoji: '❓', label: 'No disponible' };
    const lower = secureText.toLowerCase();
    if (lower.includes('buena') || lower.includes('aceptable')) {
      return { emoji: '✅', label: secureText };
    } else if (lower.includes('media')) {
      return { emoji: '⚠️', label: secureText };
    } else {
      return { emoji: '⚠️', label: secureText };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end lg:items-center justify-center">
      <div className="bg-white w-full lg:w-auto lg:max-w-6xl lg:mx-4 rounded-t-3xl lg:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">Comparar Zonas</h2>
            <p className="text-xs lg:text-sm text-gray-500 mt-0.5">
              {zones.length} {zones.length === 1 ? 'zona seleccionada' : 'zonas seleccionadas'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar comparación"
          >
            <BiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Mobile: Swipeable Cards */}
        <div className="lg:hidden flex-1 overflow-hidden">
          {/* Dots Indicator */}
          {zones.length > 1 && (
            <div className="flex justify-center gap-1.5 py-3">
              {zones.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeIndex ? 'w-6 bg-gray-800' : 'w-1.5 bg-gray-300'
                  }`}
                  aria-label={`Ver zona ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Swipeable Container */}
          <div
            className="flex transition-transform duration-300 ease-out h-full overflow-y-auto pb-20"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {zones.map((zone, idx) => (
              <div key={zone.id} className="w-full flex-shrink-0 px-4">
                <ZoneCard
                  zone={zone}
                  onRemove={() => onRemoveZone(zone.id)}
                  getSafetyColor={getSafetyColor}
                  getSecurityLevel={getSecurityLevel}
                  isMobile={true}
                />
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {zones.length > 1 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  activeIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                ← Anterior
              </button>
              <button
                onClick={() => setActiveIndex(Math.min(zones.length - 1, activeIndex + 1))}
                disabled={activeIndex === zones.length - 1}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  activeIndex === zones.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden lg:flex gap-6 p-6 overflow-x-auto">
          {zones.map((zone) => (
            <div key={zone.id} className="flex-shrink-0" style={{ width: '320px' }}>
              <ZoneCard
                zone={zone}
                onRemove={() => onRemoveZone(zone.id)}
                getSafetyColor={getSafetyColor}
                getSecurityLevel={getSecurityLevel}
                isMobile={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ZoneCard({ zone, onRemove, getSafetyColor, getSecurityLevel, isMobile }) {
  const safetyInfo = getSafetyColor(zone.color);
  const securityInfo = getSecurityLevel(zone.perplexityData?.secure);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header with Remove Button */}
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>

          {/* Zone Type Badge */}
          <div className="absolute top-3 left-3">
            {zone.polygon ? (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900">
                🗺️ Zona delimitada
              </span>
            ) : zone.circle_radius ? (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900">
                ⭕ Radio {(zone.circle_radius / 1000).toFixed(1)}km
              </span>
            ) : (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900">
                📍 Punto
              </span>
            )}
          </div>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-colors"
            aria-label="Quitar de comparación"
          >
            <BiX className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        {/* Title */}
        <div className="p-4 pb-3">
          <h3 className="font-bold text-base lg:text-lg text-gray-900 line-clamp-2">
            {zone.address}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {zone.lat?.toFixed(4)}, {zone.lng?.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {/* Safety Level */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BiShield className="text-gray-600 text-sm" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Nivel de Seguridad
            </span>
          </div>
          <div className={`${safetyInfo.bg} ${safetyInfo.text} px-4 py-2.5 rounded-xl`}>
            <span className="text-sm font-bold">{safetyInfo.label}</span>
          </div>
        </div>

        {/* Security Info */}
        {zone.perplexityData?.secure && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineSparkles className="text-gray-600 text-sm" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Evaluación IA
              </span>
            </div>
            <div className="bg-blue-50 px-4 py-2.5 rounded-xl flex items-center gap-2">
              <span className="text-lg">{securityInfo.emoji}</span>
              <span className="text-sm font-medium text-blue-900">{securityInfo.label}</span>
            </div>
          </div>
        )}

        {/* Rent Price */}
        {zone.perplexityData?.rent && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BiDollar className="text-gray-600 text-sm" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Costo de Renta
              </span>
            </div>
            <div className="bg-green-50 px-4 py-2.5 rounded-xl">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-green-900">
                  ${Math.round(zone.perplexityData.rent)}
                </span>
                <span className="text-sm text-green-700">USD/mes</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Monoambiente (1-2 personas)</p>
            </div>
          </div>
        )}

        {/* Tourism Info */}
        {zone.perplexityData?.tourism && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BiMapAlt className="text-gray-600 text-sm" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Turismo
              </span>
            </div>
            <div className="bg-purple-50 px-4 py-2.5 rounded-xl">
              <p className="text-xs text-purple-900 leading-relaxed line-clamp-3">
                {zone.perplexityData.tourism}
              </p>
            </div>
          </div>
        )}

        {/* Touristic Badge */}
        {zone.is_turistic && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-base">🎯</span>
            <span className="text-xs font-medium text-amber-900">Zona Turística</span>
          </div>
        )}

        {/* No Data Message */}
        {!zone.perplexityData?.secure && !zone.perplexityData?.rent && !zone.perplexityData?.tourism && (
          <div className="bg-gray-50 rounded-xl px-4 py-6 text-center">
            <p className="text-xs text-gray-500">
              No hay información adicional disponible para esta zona
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
