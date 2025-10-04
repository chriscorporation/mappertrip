'use client';

/**
 * SkeletonLoader Component - Sistema de skeleton loaders mobile-first estilo Airbnb
 *
 * Componente reutilizable que muestra placeholders animados durante las cargas,
 * mejorando la percepción de velocidad y reduciendo la ansiedad de espera.
 *
 * Inspiración: Airbnb es pionero en skeleton loaders elegantes que mejoran la UX
 */

export default function SkeletonLoader({ variant = 'card', count = 3 }) {
  // Variante para cards de países estilo Airbnb
  if (variant === 'country-card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="animate-pulse">
            {/* Imagen skeleton */}
            <div className="bg-gray-200 h-48 rounded-2xl mb-3"></div>

            {/* Título skeleton */}
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Variante para lista de zonas
  if (variant === 'zone-list') {
    return (
      <div className="space-y-3 p-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            {/* Color indicator skeleton */}
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>

            {/* Contenido skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded-lg w-1/2"></div>
            </div>

            {/* Botones skeleton */}
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Variante para mapa
  if (variant === 'map') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Icono de mapa skeleton */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded-2xl"></div>
          </div>
          {/* Texto skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded-lg w-32 mx-auto"></div>
            <div className="h-3 bg-gray-300 rounded-lg w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Variante para cards genéricos (default)
  return (
    <div className="space-y-4 p-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-32 rounded-2xl"></div>
        </div>
      ))}
    </div>
  );
}
