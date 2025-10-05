'use client';

import { useState, useEffect } from 'react';
import { useHistoryStore } from '../store/historyStore';

const SAFETY_COLORS = {
  '#22c55e': { name: 'Segura', emoji: '🟢', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  '#3b82f6': { name: 'Media', emoji: '🔵', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  '#f97316': { name: 'Regular', emoji: '🟠', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  '#eab308': { name: 'Precaución', emoji: '🟡', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  '#dc2626': { name: 'Insegura', emoji: '🔴', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
};

export default function HistoryPanel({ onGoToZone, countries }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { visitedZones, clearHistory, removeFromHistory, _hasHydrated } = useHistoryStore();

  // Formatear tiempo relativo
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const visited = new Date(timestamp);
    const diffInMinutes = Math.floor((now - visited) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;

    return visited.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  // Obtener nombre del país desde el country_code
  const getCountryName = (countryCode) => {
    const country = countries?.find(c => c.country_code === countryCode);
    return country?.name || countryCode;
  };

  // Actualizar el tiempo relativo cada minuto
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      // Forzar re-render
      setIsMinimized(prev => prev);
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!_hasHydrated) {
    return null;
  }

  return (
    <>
      {/* Botón flotante para abrir el panel */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-32 right-8 z-30 group flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border-2 border-gray-200 pl-4 pr-5 py-3 hover:scale-105 transition-all duration-300 animate-[fadeIn_0.4s_ease-out]"
          title="Ver historial de zonas visitadas"
        >
          <div className="relative">
            <span className="text-xl group-hover:scale-110 transition-transform duration-200 inline-block">
              🕒
            </span>
            {visitedZones.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg animate-pulse">
                {visitedZones.length}
              </div>
            )}
          </div>
          <span className="text-sm font-semibold text-gray-700">Historial</span>
        </button>
      )}

      {/* Panel deslizable */}
      {isOpen && (
        <>
          {/* Overlay oscuro */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-[fadeIn_0.3s_ease-out]"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel principal */}
          <div
            className={`
              fixed right-0 top-0 h-full bg-white shadow-2xl z-50
              flex flex-col transition-all duration-300 ease-out
              ${isMinimized ? 'w-16' : 'w-96'}
              animate-[slideInRight_0.3s_ease-out]
            `}
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50">
              {!isMinimized && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-lg">
                    <span className="text-xl">🕒</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">Historial</h2>
                    <p className="text-xs text-gray-600">
                      {visitedZones.length} {visitedZones.length === 1 ? 'zona visitada' : 'zonas visitadas'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {!isMinimized && (
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-2 hover:bg-white/80 rounded-lg transition-colors duration-200 group"
                    title="Minimizar"
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {isMinimized && (
                  <button
                    onClick={() => setIsMinimized(false)}
                    className="p-2 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                    title="Expandir"
                  >
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200 group"
                  title="Cerrar"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido */}
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto">
                {visitedZones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                      <span className="text-5xl">🕒</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Sin historial</h3>
                    <p className="text-sm text-gray-600">
                      Las zonas que visites aparecerán aquí para acceso rápido
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {visitedZones.map((zone, index) => {
                      const safetyInfo = SAFETY_COLORS[zone.color] || SAFETY_COLORS['#22c55e'];

                      return (
                        <div
                          key={zone.id}
                          className={`
                            relative group rounded-xl border-2 ${safetyInfo.border} ${safetyInfo.bg}
                            p-4 cursor-pointer transition-all duration-300
                            hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
                            animate-[fadeIn_0.3s_ease-out]
                          `}
                          style={{ animationDelay: `${index * 0.05}s` }}
                          onClick={() => {
                            onGoToZone(zone);
                            setIsOpen(false);
                          }}
                        >
                          {/* Badge de posición */}
                          <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">
                            {index + 1}
                          </div>

                          {/* Botón eliminar */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromHistory(zone.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-100 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                            title="Eliminar del historial"
                          >
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          {/* Contenido */}
                          <div className="space-y-2">
                            {/* Nivel de seguridad */}
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{safetyInfo.emoji}</span>
                              <span className={`text-xs font-bold ${safetyInfo.text}`}>
                                {safetyInfo.name}
                              </span>
                            </div>

                            {/* Dirección */}
                            <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 pr-6">
                              {zone.address}
                            </h4>

                            {/* País y tiempo */}
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <span>📍</span>
                                <span className="font-medium">{getCountryName(zone.country_code)}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
                                <span>⏱️</span>
                                <span className="italic">{getRelativeTime(zone.visitedAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Indicador hover */}
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex items-center gap-1 text-xs font-semibold text-purple-600">
                              <span>Ver zona</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Footer con botón limpiar */}
            {!isMinimized && visitedZones.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de que deseas limpiar todo el historial?')) {
                      clearHistory();
                    }
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Limpiar Historial</span>
                </button>
              </div>
            )}
          </div>

          <style jsx>{`
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }
          `}</style>
        </>
      )}
    </>
  );
}
