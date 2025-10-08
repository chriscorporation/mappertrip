'use client';

/**
 * SkeletonLoader - Componente reutilizable para estados de carga
 * Proporciona feedback visual profesional durante la carga de contenido
 */

// Skeleton para lista de países
export function CountriesSkeletonLoader() {
  return (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col animate-fadeIn">
      {/* Header skeleton */}
      <div className="p-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-100 rounded w-48 animate-pulse"></div>
      </div>

      {/* Search bar skeleton */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="h-9 bg-gray-200 rounded-lg animate-pulse mb-3"></div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-9 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-14 bg-blue-50 border border-blue-200 rounded-lg animate-pulse"></div>
          <div className="flex-1 h-14 bg-gray-100 border border-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Country cards skeleton */}
      <div className="flex-1 overflow-y-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="px-4 py-3 border-b border-gray-100"
            style={{
              animation: `fadeIn 0.4s ease-out ${i * 0.05}s both`
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-12 animate-pulse"></div>
              </div>
              <div className="h-6 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Skeleton para lista de zonas
export function ZonesSkeletonLoader() {
  return (
    <div className="w-96 bg-white border-r border-gray-300 flex flex-col animate-fadeIn">
      {/* Header skeleton */}
      <div className="p-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-100 rounded w-40 animate-pulse"></div>
      </div>

      {/* Add zone form skeleton */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="h-10 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex-1 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Zone cards skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            style={{
              animation: `slideIn 0.4s ease-out ${i * 0.08}s both`
            }}
          >
            {/* Title */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Stats row */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1 h-8 bg-gray-100 rounded animate-pulse"></div>
              <div className="flex-1 h-8 bg-gray-100 rounded animate-pulse"></div>
              <div className="flex-1 h-8 bg-gray-100 rounded animate-pulse"></div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <div className="flex-1 h-9 bg-blue-100 rounded-lg animate-pulse"></div>
              <div className="h-9 w-9 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
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

// Skeleton para lista de lugares (Airbnb, Coworking, Instagramable)
export function PlacesSkeletonLoader({ title = "Places" }) {
  return (
    <div className="w-96 bg-white border-r border-gray-300 flex flex-col animate-fadeIn">
      {/* Header skeleton */}
      <div className="p-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-100 rounded w-48 animate-pulse"></div>
      </div>

      {/* Search/Filter skeleton */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="h-9 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Place cards skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
            style={{
              animation: `slideUp 0.4s ease-out ${i * 0.06}s both`
            }}
          >
            <div className="flex gap-3">
              {/* Image placeholder */}
              <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>

              {/* Content */}
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>

            {/* Button skeleton */}
            <div className="mt-3 h-8 bg-blue-100 rounded-lg animate-pulse"></div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Skeleton genérico para listas simples
export function ListSkeletonLoader({ items = 5, withImage = false }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
          style={{
            animation: `fadeIn 0.3s ease-out ${i * 0.05}s both`
          }}
        >
          {withImage && (
            <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
          )}
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
