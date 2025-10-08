'use client';

import { useState, useEffect } from 'react';
import { BiMapAlt, BiBuilding, BiCamera, BiShieldAlt2, BiX } from 'react-icons/bi';

export default function AccommodationSuggestions({
  currentZone,
  nearbyZones,
  nearbyCoworking,
  nearbyInstagramable,
  onClose,
  onNavigate
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Mostrar widget solo si hay datos relevantes
    if (currentZone || nearbyZones?.length > 0) {
      setTimeout(() => setIsVisible(true), 200);
    }
  }, [currentZone, nearbyZones]);

  if (!isVisible || (!currentZone && (!nearbyZones || nearbyZones.length === 0))) {
    return null;
  }

  // Determinar si la zona actual es segura
  const isCurrentZoneSafe = currentZone && currentZone.safety_level_id <= 2;
  const hasNearbyAmenities = (nearbyCoworking?.length || 0) + (nearbyInstagramable?.length || 0) > 0;

  return (
    <div
      className={`
        fixed top-20 right-6 z-[999]
        bg-white rounded-xl shadow-2xl border border-gray-200
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
        ${isExpanded ? 'w-96' : 'w-80'}
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BiMapAlt className="text-xl text-white" />
          <h3 className="text-white font-bold text-sm">
            Sugerencias de Alojamiento
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          aria-label="Cerrar"
        >
          <BiX className="text-xl" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Current Zone Assessment */}
        {currentZone && (
          <div
            className={`
              rounded-lg p-3 border-2
              ${isCurrentZoneSafe
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
              }
            `}
          >
            <div className="flex items-start gap-2">
              <BiShieldAlt2
                className={`
                  text-xl mt-0.5
                  ${isCurrentZoneSafe ? 'text-green-600' : 'text-amber-600'}
                `}
              />
              <div className="flex-1">
                <h4
                  className={`
                    font-semibold text-sm mb-1
                    ${isCurrentZoneSafe ? 'text-green-800' : 'text-amber-800'}
                  `}
                >
                  {isCurrentZoneSafe ? 'Zona Segura' : 'Zona de Precaución'}
                </h4>
                <p
                  className={`
                    text-xs
                    ${isCurrentZoneSafe ? 'text-green-700' : 'text-amber-700'}
                  `}
                >
                  {currentZone.address}
                </p>
                <p
                  className={`
                    text-xs mt-1
                    ${isCurrentZoneSafe ? 'text-green-600' : 'text-amber-600'}
                  `}
                >
                  {isCurrentZoneSafe
                    ? 'Esta zona ha sido validada como segura para alojamiento por nuestro equipo.'
                    : 'Recomendamos explorar zonas cercanas más seguras para tu alojamiento.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nearby Safe Zones */}
        {nearbyZones && nearbyZones.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-gray-600 uppercase tracking-wide">
              Zonas Seguras Cercanas
            </h4>
            <div className="space-y-2">
              {nearbyZones.slice(0, 3).map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => onNavigate(zone)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-4 h-4 rounded-full mt-0.5 ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: zone.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors truncate">
                        {zone.address}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {zone.safety_level}
                      </p>
                      {zone.distance && (
                        <p className="text-xs text-blue-600 mt-1">
                          A {zone.distance} km
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Amenities */}
        {hasNearbyAmenities && (
          <div className="pt-3 border-t border-gray-200">
            <h4 className="font-semibold text-xs text-gray-600 uppercase tracking-wide mb-2">
              Cerca de ti
            </h4>
            <div className="flex flex-wrap gap-2">
              {nearbyCoworking && nearbyCoworking.length > 0 && (
                <div className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-medium">
                  <BiBuilding className="text-sm" />
                  <span>{nearbyCoworking.length} coworking{nearbyCoworking.length > 1 ? 's' : ''}</span>
                </div>
              )}
              {nearbyInstagramable && nearbyInstagramable.length > 0 && (
                <div className="flex items-center gap-1.5 bg-pink-100 text-pink-700 px-3 py-1.5 rounded-full text-xs font-medium">
                  <BiCamera className="text-sm" />
                  <span>{nearbyInstagramable.length} lugar{nearbyInstagramable.length > 1 ? 'es' : ''}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Todas las zonas han sido validadas manualmente por nuestro equipo en terreno.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
