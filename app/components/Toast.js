'use client';

import { useEffect } from 'react';
import { BiCheckCircle, BiXCircle, BiInfoCircle, BiErrorCircle } from 'react-icons/bi';

/**
 * Sistema de notificaciones Toast mobile-first estilo Airbnb
 * Muestra mensajes de feedback visual elegantes y no intrusivos
 */
export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <BiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />;
      case 'error':
        return <BiXCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <BiErrorCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />;
      case 'info':
        return <BiInfoCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />;
      default:
        return <BiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-green-200';
      case 'error':
        return 'bg-white border-red-200';
      case 'warning':
        return 'bg-white border-amber-200';
      case 'info':
        return 'bg-white border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div
      className={`
        ${getBackgroundColor()}
        fixed top-20 left-1/2 transform -translate-x-1/2 z-[100]
        px-4 py-3 sm:px-6 sm:py-4
        rounded-2xl border-2 shadow-2xl
        flex items-center gap-3
        animate-slide-down-fade
        max-w-[calc(100vw-2rem)] sm:max-w-md
        backdrop-blur-sm bg-opacity-95
      `}
    >
      {getIcon()}
      <p className="text-sm sm:text-base font-medium text-gray-800 flex-1 pr-2">
        {message}
      </p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        aria-label="Cerrar notificación"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
