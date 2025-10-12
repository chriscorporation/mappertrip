'use client';

import { useEffect, useState } from 'react';

export default function Toast({ id, message, type = 'info', duration = 4000, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-close después del duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Duración de la animación de salida
  };

  // Configuración de estilos por tipo
  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const config = styles[type] || styles.info;

  return (
    <div
      className={`
        flex items-center gap-3 ${config.bg} text-white
        px-4 py-3 rounded-lg shadow-2xl
        max-w-md w-full
        transform transition-all duration-300 ease-out
        ${isExiting
          ? 'translate-x-full opacity-0'
          : 'translate-x-0 opacity-100'
        }
        hover:shadow-3xl cursor-pointer
        border border-white/20
      `}
      onClick={handleClose}
      role="alert"
    >
      {/* Icono */}
      <div className="flex-shrink-0 bg-white/20 rounded-full p-1.5">
        {config.icon}
      </div>

      {/* Mensaje */}
      <p className="flex-1 text-sm font-medium leading-tight">
        {message}
      </p>

      {/* Botón de cerrar */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
        aria-label="Cerrar notificación"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Barra de progreso */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg overflow-hidden w-full">
        <div
          className="h-full bg-white/50 animate-shrink"
          style={{
            animation: `shrink ${duration}ms linear`,
          }}
        />
      </div>
    </div>
  );
}
