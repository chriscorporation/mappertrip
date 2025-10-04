'use client';

import { useEffect } from 'react';

/**
 * Toast Component - Notificaciones visuales modernas con animaciones
 * Tipos: success, error, info, warning
 */
export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      gradient: 'from-emerald-500 to-teal-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      bgGlow: 'bg-emerald-500/20'
    },
    error: {
      gradient: 'from-red-500 to-pink-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      bgGlow: 'bg-red-500/20'
    },
    warning: {
      gradient: 'from-amber-500 to-orange-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgGlow: 'bg-amber-500/20'
    },
    info: {
      gradient: 'from-blue-500 to-purple-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGlow: 'bg-blue-500/20'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className="fixed top-20 right-6 z-[9999] animate-toast-slide-in">
      <div className="relative group">
        {/* Glow effect de fondo */}
        <div className={`absolute inset-0 ${style.bgGlow} blur-xl rounded-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-300`} />

        {/* Toast content */}
        <div className={`relative bg-white shadow-2xl rounded-2xl p-4 pr-12 min-w-[300px] max-w-md border border-gray-100 backdrop-blur-sm`}>
          <div className="flex items-start gap-3">
            {/* Icon con gradiente */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} text-white flex items-center justify-center shadow-lg`}>
              {style.icon}
            </div>

            {/* Message */}
            <div className="flex-1 pt-1.5">
              <p className="text-sm font-medium text-gray-800 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-lg"
              aria-label="Cerrar notificación"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          {duration && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-2xl overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${style.gradient} animate-toast-progress`}
                style={{ animationDuration: `${duration}ms` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
