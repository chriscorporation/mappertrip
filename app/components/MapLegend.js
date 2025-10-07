'use client';

import { useState, useEffect } from 'react';
import { BiShieldAlt2, BiChevronDown, BiChevronUp } from 'react-icons/bi';

export default function MapLegend() {
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

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-[1000]
        bg-white rounded-xl shadow-2xl border border-gray-200
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isExpanded ? 'w-64' : 'w-auto'}
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
          {insecurityLevels.map((level, index) => (
            <div
              key={level.id}
              className="flex items-center gap-3 group"
              style={{
                animation: isExpanded ? `slideIn 0.3s ease-out ${index * 0.05}s both` : 'none'
              }}
            >
              {/* Color indicator */}
              <div
                className="w-5 h-5 rounded-md shadow-sm border-2 border-white ring-1 ring-gray-200 transition-transform group-hover:scale-110"
                style={{ backgroundColor: level.color }}
              />

              {/* Label */}
              <span className="text-sm text-gray-700 font-medium">
                {level.label}
              </span>
            </div>
          ))}

          {/* Info text */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              Estas zonas han sido validadas manualmente por nuestro equipo en terreno.
            </p>
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
      `}</style>
    </div>
  );
}
