'use client';

import { useState } from 'react';

export default function SafetyFilters({ onFilterChange, activeFilters = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const safetyLevels = [
    {
      id: 'safe',
      label: 'Seguro',
      icon: '✓',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      bgLight: 'bg-green-50',
      description: 'Zonas de alta seguridad'
    },
    {
      id: 'medium',
      label: 'Medio',
      icon: '◐',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      bgLight: 'bg-blue-50',
      description: 'Seguridad moderada'
    },
    {
      id: 'regular',
      label: 'Regular',
      icon: '○',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700',
      bgLight: 'bg-yellow-50',
      description: 'Precaución estándar'
    },
    {
      id: 'caution',
      label: 'Precaución',
      icon: '⚠',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-700',
      bgLight: 'bg-orange-50',
      description: 'Mayor precaución requerida'
    },
    {
      id: 'unsafe',
      label: 'No seguro',
      icon: '✕',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
      bgLight: 'bg-red-50',
      description: 'Evitar si es posible'
    }
  ];

  const toggleFilter = (filterId) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId];
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  const isActive = (filterId) => activeFilters.includes(filterId);

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Mobile: Botón expandible */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium text-gray-900">
              Filtros de seguridad
            </span>
            {activeFilters.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                {activeFilters.length}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Panel expandible mobile */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-96' : 'max-h-0'}
          `}
        >
          <div className="px-4 pb-4 space-y-2">
            {safetyLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => toggleFilter(level.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive(level.id)
                    ? `${level.bgLight} border-2 ${level.borderColor} shadow-sm`
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                  ${isActive(level.id) ? level.color : 'bg-gray-300'}
                `}>
                  {level.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-semibold text-sm ${isActive(level.id) ? level.textColor : 'text-gray-700'}`}>
                    {level.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {level.description}
                  </div>
                </div>
                {isActive(level.id) && (
                  <svg className={`w-5 h-5 ${level.textColor}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}

            {activeFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: Chips horizontales estilo Airbnb */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <span className="text-sm font-medium text-gray-700 flex-shrink-0">
              Nivel de seguridad:
            </span>

            {safetyLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => toggleFilter(level.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 flex-shrink-0
                  ${isActive(level.id)
                    ? `${level.color} text-white shadow-md hover:shadow-lg ${level.hoverColor}`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }
                `}
              >
                <span className="font-medium text-sm">{level.icon}</span>
                <span className="font-medium text-sm">{level.label}</span>
                {isActive(level.id) && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}

            {activeFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors flex-shrink-0 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
