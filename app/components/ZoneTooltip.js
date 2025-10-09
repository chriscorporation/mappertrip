'use client';

import { useState, useEffect } from 'react';
import { BiShieldAlt2, BiCamera, BiCheck, BiX } from 'react-icons/bi';

export default function ZoneTooltip({ zone, position, insecurityLevels }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar con pequeño delay para animación suave
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!zone || !position) return null;

  // Obtener información del nivel de seguridad
  const safetyLevel = insecurityLevels?.find(l => l.id === zone.safety_level_id);
  const safetyLabel = safetyLevel?.label || zone.safety_level || 'Sin clasificar';
  const safetyColor = zone.color || safetyLevel?.color || '#6B7280';

  // Determinar si es zona turística
  const isTuristic = zone.is_turistic;

  // Calcular posición del tooltip (evitar que se salga de la pantalla)
  const tooltipStyle = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -120%)', // Centrar horizontalmente y colocar arriba del cursor
    zIndex: 10000,
  };

  // Icono de seguridad según nivel
  const getSafetyIcon = () => {
    const levelId = zone.safety_level_id;
    if (levelId === 1 || levelId === 2) {
      // Zonas seguras
      return <BiCheck className="text-lg" />;
    } else if (levelId >= 4) {
      // Zonas peligrosas
      return <BiX className="text-lg" />;
    } else {
      // Zonas medias
      return <BiShieldAlt2 className="text-lg" />;
    }
  };

  return (
    <div
      style={tooltipStyle}
      className={`
        transition-all duration-300 ease-out pointer-events-none
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden min-w-[240px] max-w-[320px]">
        {/* Header con color del nivel de seguridad */}
        <div
          className="px-4 py-2.5 flex items-center gap-2"
          style={{ backgroundColor: safetyColor }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 text-gray-800">
            {getSafetyIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-sm leading-tight truncate">
              {zone.address || 'Zona sin nombre'}
            </h4>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3 space-y-2">
          {/* Nivel de seguridad */}
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full ring-2 ring-white shadow-md"
              style={{ backgroundColor: safetyColor }}
            />
            <span className="text-xs font-semibold text-gray-700">
              {safetyLabel}
            </span>
          </div>

          {/* Indicador turístico */}
          {isTuristic && (
            <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-2.5 py-1.5">
              <BiCamera className="text-blue-600 text-sm" />
              <span className="text-xs font-medium text-blue-700">
                Zona turística
              </span>
            </div>
          )}

          {/* Tipo de zona */}
          <div className="pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {zone.circle_radius ? 'Zona circular' : 'Zona delimitada'}
              {zone.circle_radius && ` • ${Math.round(zone.circle_radius)}m`}
            </span>
          </div>
        </div>

        {/* Footer hint */}
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Click para ver detalles
          </p>
        </div>
      </div>

      {/* Flecha apuntando hacia abajo */}
      <div
        className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
        style={{ width: 0, height: 0 }}
      >
        <div
          className="absolute"
          style={{
            left: '-6px',
            top: '-8px',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid white',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />
      </div>
    </div>
  );
}
