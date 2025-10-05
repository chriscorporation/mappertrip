import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store para gestionar recomendaciones inteligentes de zonas
export const useRecommendationsStore = create(
  persist(
    (set, get) => ({
      // Preferencias del usuario
      userProfile: 'tourist', // 'tourist', 'digital_nomad', 'family', 'backpacker', 'business'
      prioritySafety: 5, // 1-5 (1 = bajo, 5 = crítico)
      budgetLevel: 'medium', // 'low', 'medium', 'high'
      interests: [], // ['coworking', 'instagramable', 'quiet', 'nightlife', 'transport']

      // Estado del panel
      isPanelOpen: false,
      hasSeenWelcome: false,

      // Acciones
      setUserProfile: (profile) => set({ userProfile: profile }),
      setPrioritySafety: (level) => set({ prioritySafety: level }),
      setBudgetLevel: (level) => set({ budgetLevel: level }),
      setInterests: (interests) => set({ interests }),
      toggleInterest: (interest) => set((state) => {
        const hasInterest = state.interests.includes(interest);
        return {
          interests: hasInterest
            ? state.interests.filter(i => i !== interest)
            : [...state.interests, interest]
        };
      }),
      openPanel: () => set({ isPanelOpen: true }),
      closePanel: () => set({ isPanelOpen: false }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      markWelcomeSeen: () => set({ hasSeenWelcome: true }),

      // Algoritmo de puntuación de zonas
      calculateZoneScore: (zone, coworkingNearby = 0, instagramableNearby = 0) => {
        const state = get();
        let score = 0;

        // Factor de seguridad (peso más alto)
        const safetyWeight = state.prioritySafety * 20; // Hasta 100 puntos
        const safetyScore = {
          '#22c55e': 100, // Verde - Seguro
          '#3b82f6': 80,  // Azul - Medio
          '#f97316': 50,  // Naranja - Regular
          '#eab308': 30,  // Amarillo - Precaución
          '#dc2626': 0    // Rojo - Inseguro
        };
        score += (safetyScore[zone.color] || 0) * (safetyWeight / 100);

        // Factor de perfil de usuario
        const profileBonus = {
          digital_nomad: coworkingNearby * 15,
          tourist: (zone.is_turistic ? 30 : 0) + instagramableNearby * 10,
          family: safetyScore[zone.color] >= 80 ? 25 : 0,
          backpacker: zone.color === '#3b82f6' ? 20 : 0, // Prefiere zonas medias (más económicas)
          business: coworkingNearby * 20
        };
        score += profileBonus[state.userProfile] || 0;

        // Factor de intereses
        if (state.interests.includes('coworking')) {
          score += coworkingNearby * 10;
        }
        if (state.interests.includes('instagramable')) {
          score += instagramableNearby * 8;
        }
        if (state.interests.includes('quiet') && !zone.is_turistic) {
          score += 15;
        }
        if (state.interests.includes('nightlife') && zone.is_turistic) {
          score += 15;
        }

        return Math.min(Math.round(score), 100); // Normalizar a 100
      },

      // Obtener recomendaciones
      getTopRecommendations: (zones, coworkingPlaces = [], instagramablePlaces = [], limit = 5) => {
        const state = get();

        // Calcular puntuaciones para cada zona
        const scoredZones = zones.map(zone => {
          // Contar lugares cercanos (simplificado - dentro de 0.01 grados ≈ 1km)
          const coworkingNearby = coworkingPlaces.filter(cw =>
            Math.abs(cw.lat - zone.lat) < 0.01 && Math.abs(cw.lng - zone.lng) < 0.01
          ).length;

          const instagramableNearby = instagramablePlaces.filter(ig =>
            Math.abs(ig.lat - zone.lat) < 0.01 && Math.abs(ig.lng - zone.lng) < 0.01
          ).length;

          const score = state.calculateZoneScore(zone, coworkingNearby, instagramableNearby);

          return {
            ...zone,
            recommendationScore: score,
            coworkingNearby,
            instagramableNearby,
            matchReasons: state.getMatchReasons(zone, score, coworkingNearby, instagramableNearby)
          };
        });

        // Ordenar por puntuación y retornar top N
        return scoredZones
          .sort((a, b) => b.recommendationScore - a.recommendationScore)
          .slice(0, limit);
      },

      // Obtener razones del match
      getMatchReasons: (zone, score, coworkingNearby, instagramableNearby) => {
        const state = get();
        const reasons = [];

        // Razones de seguridad
        if (zone.color === '#22c55e' && state.prioritySafety >= 4) {
          reasons.push('🛡️ Zona muy segura - Ideal para tu prioridad de seguridad');
        }

        // Razones de perfil
        const profileReasons = {
          digital_nomad: coworkingNearby > 0 ? `💼 ${coworkingNearby} espacios de coworking cercanos` : null,
          tourist: zone.is_turistic ? '🎭 Zona turística con atracciones' : null,
          family: zone.color === '#22c55e' ? '👨‍👩‍👧 Perfecto para familias - Muy seguro' : null,
          backpacker: zone.color === '#3b82f6' ? '🎒 Zona económica y auténtica' : null,
          business: coworkingNearby > 0 ? `🏢 ${coworkingNearby} espacios profesionales` : null
        };

        if (profileReasons[state.userProfile]) {
          reasons.push(profileReasons[state.userProfile]);
        }

        // Razones de intereses
        if (state.interests.includes('instagramable') && instagramableNearby > 0) {
          reasons.push(`📸 ${instagramableNearby} lugares instagrameables cerca`);
        }

        if (state.interests.includes('quiet') && !zone.is_turistic) {
          reasons.push('🌿 Zona tranquila y residencial');
        }

        if (state.interests.includes('nightlife') && zone.is_turistic) {
          reasons.push('🌃 Vida nocturna y entretenimiento');
        }

        // Agregar razón de puntuación alta
        if (score >= 80 && reasons.length === 0) {
          reasons.push('⭐ Alta compatibilidad con tus preferencias');
        }

        return reasons.slice(0, 3); // Máximo 3 razones
      }
    }),
    {
      name: 'maptrip-recommendations',
      partialize: (state) => ({
        userProfile: state.userProfile,
        prioritySafety: state.prioritySafety,
        budgetLevel: state.budgetLevel,
        interests: state.interests,
        hasSeenWelcome: state.hasSeenWelcome
      })
    }
  )
);
