'use client';

import { useState, useEffect } from 'react';
import { BiShieldAlt2, BiChevronDown, BiChevronUp, BiFilter } from 'react-icons/bi';

export default function MapLegend({ visibleLevels, onToggleLevel, showHeatmap, onToggleHeatmap }) {
  const [insecurityLevels, setInsecurityLevels] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadInsecurityLevels = async () => {
      try {
        const response = await fetch('/api/insecurity-levels');
        const levels = await response.json();
        if (levels) {
          setInsecurityLevels(levels);
          // Show with animation after data loads
          setTimeout(() => setIsVisible(true), 300);
        }
      } catch (error) {
        console.error('Error loading insecurity levels:', error);
      }
    };

    loadInsecurityLevels();
  }, []);

  if (insecurityLevels.length === 0) return null;

  const hiddenCount = insecurityLevels.filter(level => !visibleLevels[level.id]).length;
  const hasFilters = hiddenCount > 0;

  return (
    <div
      className={`
        fixed bottom-6 left-6 z-[1000]
        bg-white rounded-xl shadow-2xl border border-gray-200
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isExpanded ? 'w-72' : 'w-auto'}
      `}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-t-xl transition-colors"
      >
        <div className="flex items-center gap-2">
          <BiShieldAlt2 className="text-xl text-blue-600" />
          <span className="font-semibold text-sm text-gray-800">
            {isExpanded ? 'Niveles de Seguridad' : 'Leyenda'}
          </span>
          {hasFilters && (
            <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
              <BiFilter className="text-sm" />
              {hiddenCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <BiChevronDown className="text-gray-500 text-lg" />
        ) : (
          <BiChevronUp className="text-gray-500 text-lg" />
        )}
      </button>

      {/* Legend Items */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 pb-4 space-y-2">
          {insecurityLevels.map((level, index) => {
            const isVisible = visibleLevels[level.id];

            return (
              <button
                key={level.id}
                onClick={() => onToggleLevel(level.id)}
                className={`
                  w-full flex items-center gap-3 group cursor-pointer
                  transition-all duration-200 rounded-lg px-2 py-1.5 -mx-2
                  ${isVisible ? 'hover:bg-gray-50' : 'hover:bg-blue-50'}
                `}
                style={{
                  animation: isExpanded ? `slideIn 0.3s ease-out ${index * 0.05}s both` : 'none'
                }}
              >
                {/* Checkbox */}
                <div className={`
                  relative w-5 h-5 rounded border-2 flex items-center justify-center
                  transition-all duration-200
                  ${isVisible
                    ? 'border-gray-300 bg-white'
                    : 'border-blue-500 bg-blue-500'
                  }
                `}>
                  {isVisible ? (
                    // Checkmark
                    <svg
                      className="w-3 h-3 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    // X mark when hidden
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>

                {/* Color indicator */}
                <div
                  className={`
                    w-5 h-5 rounded-md shadow-sm border-2 border-white ring-1 ring-gray-200
                    transition-all duration-200
                    ${isVisible ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}
                  `}
                  style={{ backgroundColor: level.color }}
                />

                {/* Label */}
                <span className={`
                  text-sm font-medium flex-1 text-left transition-all duration-200
                  ${isVisible ? 'text-gray-700' : 'text-gray-400 line-through'}
                `}>
                  {level.label}
                </span>
              </button>
            );
          })}

          {/* Info text */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              Click en cada nivel para mostrar u ocultar zonas del mapa. Validadas manualmente por nuestro equipo.
            </p>
          </div>

          {/* Heatmap Toggle */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={onToggleHeatmap}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2">
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                  ${showHeatmap ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'}
                `}>
                  {showHeatmap && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Mapa de Calor
                </span>
              </div>
              <svg
                className={`w-4 h-4 transition-colors duration-200 ${
                  showHeatmap ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </button>
            {showHeatmap && (
              <p className="text-xs text-purple-600 mt-2 leading-relaxed animate-fadeIn">
                Visualiza la densidad de seguridad: verde = zonas seguras concentradas, azul = zonas de precaución.
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
