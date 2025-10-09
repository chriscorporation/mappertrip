'use client';

import { useState, useEffect } from 'react';
import { BiX, BiChevronDown, BiShieldAlt2, BiInfoCircle, BiTrendingUp } from 'react-icons/bi';

export default function CompareZones({ isOpen, onClose, zones, selectedCountry }) {
  const [zone1, setZone1] = useState(null);
  const [zone2, setZone2] = useState(null);
  const [insecurityLevels, setInsecurityLevels] = useState([]);

  useEffect(() => {
    const loadInsecurityLevels = async () => {
      try {
        const response = await fetch('/api/insecurity-levels');
        const levels = await response.json();
        if (levels) {
          setInsecurityLevels(levels);
        }
      } catch (error) {
        console.error('Error loading insecurity levels:', error);
      }
    };

    loadInsecurityLevels();
  }, []);

  // Filter zones for current country
  const countryZones = zones.filter(z =>
    z.country_code === selectedCountry?.country_code && z.active !== null
  );

  // Get safety level info
  const getSafetyLevelInfo = (levelId) => {
    return insecurityLevels.find(l => l.id === levelId) || {};
  };

  // Reset selections when modal closes
  useEffect(() => {
    if (!isOpen) {
      setZone1(null);
      setZone2(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <BiTrendingUp className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Comparar Zonas</h2>
              <p className="text-sm text-white/80">
                {selectedCountry ? selectedCountry.name : 'Selecciona un país primero'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <BiX className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {countryZones.length < 2 ? (
            <div className="text-center py-12">
              <BiInfoCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Se necesitan al menos 2 zonas para comparar en {selectedCountry?.name || 'este país'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Zone 1 Selector */}
              <ZoneSelector
                label="Zona 1"
                zones={countryZones}
                selectedZone={zone1}
                otherZone={zone2}
                onSelect={setZone1}
                color="blue"
                getSafetyLevelInfo={getSafetyLevelInfo}
              />

              {/* Zone 2 Selector */}
              <ZoneSelector
                label="Zona 2"
                zones={countryZones}
                selectedZone={zone2}
                otherZone={zone1}
                onSelect={setZone2}
                color="purple"
                getSafetyLevelInfo={getSafetyLevelInfo}
              />
            </div>
          )}

          {/* Comparison Results */}
          {zone1 && zone2 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BiShieldAlt2 className="text-blue-600" />
                Comparación de Seguridad
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ComparisonCard
                  zone={zone1}
                  getSafetyLevelInfo={getSafetyLevelInfo}
                  color="blue"
                />
                <ComparisonCard
                  zone={zone2}
                  getSafetyLevelInfo={getSafetyLevelInfo}
                  color="purple"
                />
              </div>

              {/* Winner/Recommendation */}
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-green-900 mb-2">Recomendación</h4>
                    <p className="text-sm text-green-800 leading-relaxed">
                      {getRecommendation(zone1, zone2, getSafetyLevelInfo)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Todas las zonas han sido validadas manualmente por nuestro equipo en terreno
          </p>
        </div>
      </div>
    </div>
  );
}

// Zone Selector Component
function ZoneSelector({ label, zones, selectedZone, otherZone, onSelect, color, getSafetyLevelInfo }) {
  const [isOpen, setIsOpen] = useState(false);

  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50',
    purple: 'border-purple-500 bg-purple-50',
  };

  return (
    <div className={`border-2 ${colorClasses[color]} rounded-xl p-4`}>
      <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:border-gray-400 transition-colors"
        >
          {selectedZone ? (
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedZone.color }}
              />
              <span className="text-sm font-medium text-gray-700 truncate">
                {selectedZone.address}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Selecciona una zona...</span>
          )}
          <BiChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
            {zones
              .filter(z => z.id !== otherZone?.id)
              .map(zone => {
                const safetyInfo = getSafetyLevelInfo(zone.safety_level_id);
                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      onSelect(zone);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: zone.color }}
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {zone.address}
                      </p>
                      <p className="text-xs text-gray-500">
                        {safetyInfo.label || 'Sin clasificar'}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// Comparison Card Component
function ComparisonCard({ zone, getSafetyLevelInfo, color }) {
  const safetyInfo = getSafetyLevelInfo(zone.safety_level_id);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Zone Header */}
      <div className={`bg-gradient-to-r ${colorClasses[color]} px-4 py-3`}>
        <h4 className="text-white font-bold text-sm truncate">{zone.address}</h4>
      </div>

      {/* Zone Details */}
      <div className="p-4 space-y-3">
        {/* Safety Level */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Nivel de Seguridad</span>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: zone.color }}
            />
            <span className="text-sm font-bold" style={{ color: zone.color }}>
              {safetyInfo.label || 'N/A'}
            </span>
          </div>
        </div>

        {/* Type */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Tipo</span>
          <span className="text-sm font-medium text-gray-800">
            {zone.is_turistic ? '🏖️ Turística' : '🏘️ Residencial'}
          </span>
        </div>

        {/* Shape Type */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Cobertura</span>
          <span className="text-sm font-medium text-gray-800">
            {zone.polygon ? '📐 Polígono' : zone.circle_radius ? `⭕ Radio ${Math.round(zone.circle_radius)}m` : '📍 Punto'}
          </span>
        </div>

        {/* Notes */}
        {zone.notes && zone.notes.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-600 block mb-2">Notas (últimas 2)</span>
            <div className="space-y-2">
              {zone.notes.slice(0, 2).map((note, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-700 line-clamp-2">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Recommendation Logic
function getRecommendation(zone1, zone2, getSafetyLevelInfo) {
  const level1 = getSafetyLevelInfo(zone1.safety_level_id);
  const level2 = getSafetyLevelInfo(zone2.safety_level_id);

  // Lower safety_level_id = safer (1 is safest, 5 is most dangerous)
  if (zone1.safety_level_id < zone2.safety_level_id) {
    return `Se recomienda "${zone1.address}" por ser una zona más segura (${level1.label}) comparada con "${zone2.address}" (${level2.label}). ${zone1.is_turistic ? 'Además, es una zona turística.' : ''}`;
  } else if (zone2.safety_level_id < zone1.safety_level_id) {
    return `Se recomienda "${zone2.address}" por ser una zona más segura (${level2.label}) comparada con "${zone1.address}" (${level1.label}). ${zone2.is_turistic ? 'Además, es una zona turística.' : ''}`;
  } else {
    // Same safety level
    if (zone1.is_turistic && !zone2.is_turistic) {
      return `Ambas zonas tienen el mismo nivel de seguridad (${level1.label}), pero "${zone1.address}" es turística, lo que puede ofrecer más servicios y actividades.`;
    } else if (zone2.is_turistic && !zone1.is_turistic) {
      return `Ambas zonas tienen el mismo nivel de seguridad (${level2.label}), pero "${zone2.address}" es turística, lo que puede ofrecer más servicios y actividades.`;
    } else {
      return `Ambas zonas tienen características similares con nivel de seguridad ${level1.label}. La elección puede depender de otros factores como proximidad a lugares de interés o preferencias personales.`;
    }
  }
}
