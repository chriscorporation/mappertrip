'use client';

import { useEffect, useState } from 'react';

// Definición de achievements/logros
const ACHIEVEMENTS = [
  {
    id: 'first_zone',
    name: 'Primer Explorador',
    description: 'Visitaste tu primera zona',
    icon: '🎯',
    requirement: (stats) => stats.zonesVisited >= 1,
    points: 10,
  },
  {
    id: 'five_zones',
    name: 'Viajero Curioso',
    description: 'Exploraste 5 zonas diferentes',
    icon: '🗺️',
    requirement: (stats) => stats.zonesVisited >= 5,
    points: 25,
  },
  {
    id: 'ten_zones',
    name: 'Explorador Activo',
    description: 'Visitaste 10 zonas',
    icon: '🌟',
    requirement: (stats) => stats.zonesVisited >= 10,
    points: 50,
  },
  {
    id: 'first_country',
    name: 'Aventurero Internacional',
    description: 'Exploraste tu primer país',
    icon: '🌎',
    requirement: (stats) => stats.countriesVisited >= 1,
    points: 15,
  },
  {
    id: 'three_countries',
    name: 'Nómada Digital',
    description: 'Visitaste 3 países',
    icon: '✈️',
    requirement: (stats) => stats.countriesVisited >= 3,
    points: 40,
  },
  {
    id: 'five_countries',
    name: 'Globetrotter',
    description: 'Exploraste 5 países',
    icon: '🌍',
    requirement: (stats) => stats.countriesVisited >= 5,
    points: 75,
  },
  {
    id: 'used_comparison',
    name: 'Analista Estratégico',
    description: 'Usaste la comparación de zonas',
    icon: '📊',
    requirement: (stats) => stats.usedComparison,
    points: 20,
  },
  {
    id: 'used_heatmap',
    name: 'Detective de Seguridad',
    description: 'Activaste el mapa de calor',
    icon: '🔥',
    requirement: (stats) => stats.usedHeatmap,
    points: 20,
  },
  {
    id: 'added_favorite',
    name: 'Coleccionista',
    description: 'Guardaste tu primera zona favorita',
    icon: '⭐',
    requirement: (stats) => stats.favoritesCount >= 1,
    points: 15,
  },
  {
    id: 'power_user',
    name: 'Usuario Experto',
    description: 'Exploraste 20 zonas',
    icon: '👑',
    requirement: (stats) => stats.zonesVisited >= 20,
    points: 100,
  },
];

// Niveles basados en puntos totales
const LEVELS = [
  { level: 1, name: 'Turista Novato', minPoints: 0, icon: '🎒', color: 'from-gray-400 to-gray-500' },
  { level: 2, name: 'Viajero Explorador', minPoints: 50, icon: '🧭', color: 'from-blue-400 to-blue-500' },
  { level: 3, name: 'Aventurero Experto', minPoints: 150, icon: '🗺️', color: 'from-green-400 to-green-500' },
  { level: 4, name: 'Nómada Profesional', minPoints: 300, icon: '✈️', color: 'from-purple-400 to-purple-500' },
  { level: 5, name: 'Maestro Globetrotter', minPoints: 500, icon: '👑', color: 'from-yellow-400 to-yellow-500' },
];

export default function ExplorationProgress({ onZoneVisit, onCountryVisit, onFeatureUse }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState({
    zonesVisited: 0,
    countriesVisited: 0,
    usedComparison: false,
    usedHeatmap: false,
    favoritesCount: 0,
    totalPoints: 0,
    unlockedAchievements: [],
  });
  const [newAchievement, setNewAchievement] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Cargar stats desde localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('explorationStats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Error loading exploration stats:', e);
      }
    }
  }, []);

  // Guardar stats en localStorage
  useEffect(() => {
    localStorage.setItem('explorationStats', JSON.stringify(stats));
  }, [stats]);

  // Función para actualizar stats y verificar nuevos logros
  const updateStats = (newStats) => {
    setStats((prevStats) => {
      const updatedStats = { ...prevStats, ...newStats };

      // Verificar nuevos logros
      ACHIEVEMENTS.forEach((achievement) => {
        if (
          !updatedStats.unlockedAchievements.includes(achievement.id) &&
          achievement.requirement(updatedStats)
        ) {
          // Desbloquear logro
          updatedStats.unlockedAchievements = [
            ...updatedStats.unlockedAchievements,
            achievement.id,
          ];
          updatedStats.totalPoints += achievement.points;

          // Mostrar notificación de nuevo logro
          setNewAchievement(achievement);
          setShowCelebration(true);

          // Ocultar notificación después de 5 segundos
          setTimeout(() => {
            setShowCelebration(false);
            setTimeout(() => setNewAchievement(null), 300);
          }, 5000);
        }
      });

      return updatedStats;
    });
  };

  // Exponer función para rastrear zona visitada
  useEffect(() => {
    if (onZoneVisit) {
      window.trackZoneVisit = (zoneId) => {
        const visitedZones = JSON.parse(localStorage.getItem('visitedZones') || '[]');
        if (!visitedZones.includes(zoneId)) {
          visitedZones.push(zoneId);
          localStorage.setItem('visitedZones', JSON.stringify(visitedZones));
          updateStats({ zonesVisited: visitedZones.length });
        }
      };
    }
  }, [onZoneVisit]);

  // Exponer función para rastrear país visitado
  useEffect(() => {
    if (onCountryVisit) {
      window.trackCountryVisit = (countryCode) => {
        const visitedCountries = JSON.parse(localStorage.getItem('visitedCountries') || '[]');
        if (!visitedCountries.includes(countryCode)) {
          visitedCountries.push(countryCode);
          localStorage.setItem('visitedCountries', JSON.stringify(visitedCountries));
          updateStats({ countriesVisited: visitedCountries.length });
        }
      };
    }
  }, [onCountryVisit]);

  // Exponer función para rastrear uso de features
  useEffect(() => {
    window.trackFeatureUse = (featureName) => {
      if (featureName === 'comparison') {
        updateStats({ usedComparison: true });
      } else if (featureName === 'heatmap') {
        updateStats({ usedHeatmap: true });
      }
    };
  }, []);

  // Actualizar favoritos count
  useEffect(() => {
    const checkFavorites = () => {
      const favorites = JSON.parse(localStorage.getItem('favoriteZones') || '[]');
      if (favorites.length !== stats.favoritesCount) {
        updateStats({ favoritesCount: favorites.length });
      }
    };

    // Verificar cada segundo si cambió
    const interval = setInterval(checkFavorites, 1000);
    return () => clearInterval(interval);
  }, [stats.favoritesCount]);

  // Calcular nivel actual
  const getCurrentLevel = () => {
    const level = [...LEVELS]
      .reverse()
      .find((l) => stats.totalPoints >= l.minPoints);
    return level || LEVELS[0];
  };

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const nextLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
    return nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNextLevel = nextLevel
    ? ((stats.totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  return (
    <>
      {/* Badge flotante compacto */}
      <div className="fixed top-20 right-6 z-40 animate-[fadeIn_0.5s_ease-out]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            relative group flex items-center gap-3 px-4 py-3
            bg-gradient-to-r ${currentLevel.color}
            rounded-full shadow-xl border-3 border-white
            hover:scale-105 transition-all duration-300
            ${isExpanded ? 'ring-4 ring-purple-300' : ''}
          `}
          title="Ver progreso de exploración"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
            {currentLevel.icon}
          </span>
          <div className="text-white">
            <p className="text-xs font-bold leading-tight">Nivel {currentLevel.level}</p>
            <p className="text-xs opacity-90 leading-tight">{stats.totalPoints} pts</p>
          </div>

          {/* Indicador de nuevo logro */}
          {newAchievement && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
          )}
        </button>

        {/* Panel expandido */}
        {isExpanded && (
          <div className="absolute top-full right-0 mt-3 w-80 bg-white/98 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className={`bg-gradient-to-r ${currentLevel.color} p-5 text-white relative overflow-hidden`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{currentLevel.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg">{currentLevel.name}</h3>
                      <p className="text-xs opacity-90">Nivel {currentLevel.level}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Barra de progreso al siguiente nivel */}
                {nextLevel && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{stats.totalPoints} pts</span>
                      <span>{nextLevel.minPoints} pts</span>
                    </div>
                    <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-1000 ease-out"
                        style={{ width: `${progressToNextLevel}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1 opacity-90">
                      {nextLevel.minPoints - stats.totalPoints} pts para {nextLevel.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Patrón decorativo de fondo */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>📊</span> Tu Exploración
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">Zonas</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.zonesVisited}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-600 font-medium mb-1">Países</p>
                  <p className="text-2xl font-bold text-green-700">{stats.countriesVisited}</p>
                </div>
              </div>
            </div>

            {/* Logros */}
            <div className="p-4 max-h-64 overflow-y-auto">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🏆</span> Logros ({stats.unlockedAchievements.length}/{ACHIEVEMENTS.length})
              </h4>
              <div className="space-y-2">
                {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = stats.unlockedAchievements.includes(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300
                        ${isUnlocked
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-sm'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                        }
                      `}
                    >
                      <span className={`text-2xl ${isUnlocked ? 'animate-pulse' : 'grayscale'}`}>
                        {achievement.icon}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-bold
                        ${isUnlocked ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-300 text-gray-600'}
                      `}>
                        +{achievement.points}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notificación de nuevo logro desbloqueado */}
      {showCelebration && newAchievement && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          {/* Confeti de fondo */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-[confetti_3s_ease-out_forwards]"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  width: '10px',
                  height: '10px',
                  background: ['#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'][i % 5],
                  animationDelay: `${Math.random() * 0.5}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>

          {/* Card de logro */}
          <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border-4 border-yellow-400 p-6 max-w-sm animate-[bounceIn_0.6s_ease-out] text-center">
            <div className="mb-4">
              <span className="text-6xl inline-block animate-[spin_1s_ease-in-out]">🎉</span>
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">¡Logro Desbloqueado!</h3>
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-4 mb-3">
              <span className="text-4xl mb-2 inline-block">{newAchievement.icon}</span>
              <h4 className="text-xl font-bold text-gray-800 mb-1">{newAchievement.name}</h4>
              <p className="text-sm text-gray-600">{newAchievement.description}</p>
            </div>
            <div className="bg-yellow-400 text-yellow-900 rounded-full px-4 py-2 inline-block font-black text-lg">
              +{newAchievement.points} puntos
            </div>
            <button
              onClick={() => {
                setShowCelebration(false);
                setTimeout(() => setNewAchievement(null), 300);
              }}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Estilos para animaciones personalizadas */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bounceIn {
          0% {
            transform: scale(0.3) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) rotate(5deg);
          }
          70% {
            transform: scale(0.9) rotate(-3deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
