/**
 * SkeletonLoader Component
 * Componente de carga moderna con animación shimmer para mejorar la UX
 * mientras se cargan datos. Proporciona feedback visual inmediato.
 */

export default function SkeletonLoader({ variant = 'default' }) {
  if (variant === 'comparison-card') {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg animate-[fadeIn_0.4s_ease-out]">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-4 space-y-2">
          <div className="h-6 bg-gray-400/50 rounded-lg w-3/4 animate-shimmer"></div>
          <div className="h-4 bg-gray-400/50 rounded-lg w-1/2 animate-shimmer"></div>
        </div>

        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Security badge */}
          <div className="bg-gray-100 rounded-lg p-3 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/3 animate-shimmer"></div>
            <div className="h-6 bg-gray-300 rounded w-2/3 animate-shimmer"></div>
          </div>

          {/* Rent card */}
          <div className="bg-gray-100 rounded-lg p-3 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/3 animate-shimmer"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 animate-shimmer"></div>
          </div>

          {/* Tourism card */}
          <div className="bg-gray-100 rounded-lg p-3 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/4 animate-shimmer"></div>
            <div className="h-4 bg-gray-300 rounded w-full animate-shimmer"></div>
            <div className="h-4 bg-gray-300 rounded w-full animate-shimmer"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 animate-shimmer"></div>
          </div>

          {/* Button */}
          <div className="h-10 bg-gray-300 rounded-lg w-full animate-shimmer"></div>
        </div>
      </div>
    );
  }

  if (variant === 'perplexity-panel') {
    return (
      <div className="p-4 space-y-4">
        {/* Security section */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse-soft"></div>
            <div className="h-6 bg-gray-300 rounded w-1/3 animate-shimmer"></div>
          </div>

          {/* Progress bar skeleton */}
          <div className="space-y-2">
            <div className="h-8 bg-gray-300 rounded-full w-full animate-shimmer"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-300 rounded w-20 animate-shimmer"></div>
              <div className="h-3 bg-gray-300 rounded w-24 animate-shimmer"></div>
            </div>
          </div>

          {/* Badge skeleton */}
          <div className="bg-gray-200 rounded-xl p-3 space-y-2">
            <div className="h-5 bg-gray-300 rounded w-2/3 animate-shimmer"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3 animate-shimmer"></div>
          </div>
        </div>

        {/* Additional cards */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse-soft"></div>
            <div className="h-6 bg-gray-300 rounded w-1/4 animate-shimmer"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-300 rounded w-2/5 animate-shimmer"></div>
            <div className="h-4 bg-gray-300 rounded w-3/5 animate-shimmer"></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse-soft"></div>
            <div className="h-6 bg-gray-300 rounded w-1/5 animate-shimmer"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full animate-shimmer"></div>
            <div className="h-4 bg-gray-300 rounded w-full animate-shimmer"></div>
            <div className="h-4 bg-gray-300 rounded w-4/5 animate-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4 animate-shimmer"></div>
      <div className="h-4 bg-gray-300 rounded w-full animate-shimmer"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6 animate-shimmer"></div>
    </div>
  );
}
