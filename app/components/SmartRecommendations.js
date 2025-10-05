'use client';

import { useState, useEffect } from 'react';
import { useRecommendationsStore } from '../store/recommendationsStore';
import { FiChevronRight, FiSettings, FiX, FiMapPin, FiStar, FiTrendingUp } from 'react-icons/fi';

export default function SmartRecommendations({ zones, coworkingPlaces, instagramablePlaces, onZoneSelect, selectedCountry }) {
  const {
    isPanelOpen,
    userProfile,
    prioritySafety,
    interests,
    hasSeenWelcome,
    setUserProfile,
    setPrioritySafety,
    toggleInterest,
    openPanel,
    closePanel,
    togglePanel,
    markWelcomeSeen,
    getTopRecommendations
  } = useRecommendationsStore();

  const [showSettings, setShowSettings] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Perfiles disponibles
  const profiles = [
    { id: 'tourist', name: 'Turista', icon: '🎭', description: 'Atracciones y lugares icónicos' },
    { id: 'digital_nomad', name: 'Nómada Digital', icon: '💻', description: 'Coworking y WiFi' },
    { id: 'family', name: 'Familia', icon: '👨‍👩‍👧', description: 'Zonas muy seguras' },
    { id: 'backpacker', name: 'Mochilero', icon: '🎒', description: 'Económico y auténtico' },
    { id: 'business', name: 'Negocios', icon: '💼', description: 'Profesional y conectado' }
  ];

  // Intereses disponibles
  const availableInterests = [
    { id: 'coworking', name: 'Coworking', icon: '💼' },
    { id: 'instagramable', name: 'Instagrameable', icon: '📸' },
    { id: 'quiet', name: 'Tranquilo', icon: '🌿' },
    { id: 'nightlife', name: 'Vida Nocturna', icon: '🌃' },
    { id: 'transport', name: 'Transporte', icon: '🚇' }
  ];

  // Calcular recomendaciones cuando cambian las zonas o preferencias
  useEffect(() => {
    if (!zones || zones.length === 0) {
      setRecommendations([]);
      return;
    }

    // Filtrar zonas del país seleccionado si existe
    const filteredZones = selectedCountry
      ? zones.filter(z => z.country_code === selectedCountry.country_code)
      : zones;

    const topRecommendations = getTopRecommendations(
      filteredZones,
      coworkingPlaces || [],
      instagramablePlaces || [],
      5
    );

    setRecommendations(topRecommendations);
  }, [zones, coworkingPlaces, instagramablePlaces, userProfile, prioritySafety, interests, selectedCountry]);

  // Mostrar bienvenida solo la primera vez
  useEffect(() => {
    if (!hasSeenWelcome && recommendations.length > 0) {
      const timer = setTimeout(() => {
        openPanel();
        markWelcomeSeen();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome, recommendations]);

  if (recommendations.length === 0) return null;

  return (
    <>
      {/* Botón flotante de acceso rápido */}
      {!isPanelOpen && (
        <button
          onClick={openPanel}
          className="fixed bottom-28 left-6 z-30 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110 border-2 border-white group animate-[fadeIn_0.5s_ease-out]"
          title="Recomendaciones personalizadas"
        >
          <div className="relative">
            <FiStar className="text-2xl" />
            {/* Badge de notificación */}
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {recommendations.length}
            </span>
          </div>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Recomendaciones para ti
          </span>
        </button>
      )}

      {/* Panel de recomendaciones */}
      {isPanelOpen && (
        <div className={`fixed bottom-6 left-6 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-purple-200 transition-all duration-300 animate-[fadeIn_0.3s_ease-out] ${
          isMinimized ? 'w-80' : 'w-96'
        }`}>
          {/* Header del panel */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white px-5 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <FiStar className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Recomendaciones</h3>
                  <p className="text-xs text-white/80">Personalizadas para ti</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                  title="Configurar preferencias"
                >
                  <FiSettings className={`text-lg transition-transform duration-300 ${showSettings ? 'rotate-90' : ''}`} />
                </button>
                <button
                  onClick={closePanel}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                  title="Cerrar"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
            </div>
          </div>

          {/* Configuración de preferencias */}
          {showSettings && (
            <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 max-h-96 overflow-y-auto">
              {/* Selector de perfil */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <span>👤</span> Tu perfil de viajero
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {profiles.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => setUserProfile(profile.id)}
                      className={`p-3 rounded-lg text-left transition-all duration-200 ${
                        userProfile === profile.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md transform scale-105'
                          : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{profile.icon}</span>
                        <span className="text-xs font-bold">{profile.name}</span>
                      </div>
                      <p className="text-xs opacity-80">{profile.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prioridad de seguridad */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>🛡️</span> Prioridad de seguridad
                  </span>
                  <span className="text-purple-600 font-bold">{prioritySafety}/5</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={prioritySafety}
                  onChange={(e) => setPrioritySafety(parseInt(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Flexible</span>
                  <span>Crítico</span>
                </div>
              </div>

              {/* Intereses */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <span>💡</span> Tus intereses
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                        interests.includes(interest.id)
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md transform scale-105'
                          : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                      }`}
                    >
                      <span className="mr-1">{interest.icon}</span>
                      {interest.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista de recomendaciones */}
          {!isMinimized && (
            <div className="p-4 max-h-96 overflow-y-auto">
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiMapPin className="mx-auto text-4xl mb-2 opacity-50" />
                  <p className="text-sm">No hay zonas disponibles</p>
                  <p className="text-xs mt-1">Selecciona un país para ver recomendaciones</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((zone, index) => (
                    <div
                      key={zone.id}
                      className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                      onClick={() => {
                        onZoneSelect(zone);
                        closePanel();
                      }}
                    >
                      {/* Ranking badge */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                            index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-800 group-hover:text-purple-700 transition-colors line-clamp-1">
                              {zone.address}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          <FiTrendingUp className="text-xs" />
                          {zone.recommendationScore}%
                        </div>
                      </div>

                      {/* Color indicator */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded border-2"
                          style={{
                            backgroundColor: `${zone.color}20`,
                            borderColor: zone.color
                          }}
                        />
                        <span className="text-xs font-medium text-gray-600">
                          {zone.color === '#22c55e' ? 'Muy Segura' :
                           zone.color === '#3b82f6' ? 'Seguridad Media' :
                           zone.color === '#f97316' ? 'Regular' :
                           zone.color === '#eab308' ? 'Precaución' :
                           'Insegura'}
                        </span>
                      </div>

                      {/* Match reasons */}
                      {zone.matchReasons && zone.matchReasons.length > 0 && (
                        <div className="space-y-1">
                          {zone.matchReasons.map((reason, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                              <span className="flex-shrink-0 mt-0.5">•</span>
                              <span className="flex-1">{reason}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Ver en mapa button */}
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 group-hover:scale-105">
                          <FiMapPin className="text-sm" />
                          Ver en el mapa
                          <FiChevronRight className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer con tip */}
          {!showSettings && !isMinimized && (
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-b-2xl border-t border-purple-100">
              <div className="flex items-center gap-2 text-xs text-purple-700">
                <span className="text-base">💡</span>
                <p>
                  <span className="font-semibold">Tip:</span> Configura tus preferencias para mejores recomendaciones
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
