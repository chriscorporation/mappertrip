'use client';

import { useEffect, useState } from 'react';

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Tiempo mínimo de visualización (500ms) para evitar parpadeos
    const minDisplayTime = 500;
    const startTime = Date.now();

    // Detectar cuando la página está completamente cargada
    const handleLoad = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      // Esperar el tiempo restante antes de ocultar
      setTimeout(() => {
        setIsLoading(false);
        // Remover del DOM después de la animación de salida (300ms)
        setTimeout(() => {
          setShouldRender(false);
        }, 300);
      }, remainingTime);
    };

    // Si el documento ya está cargado
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      // Esperar a que cargue
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 transition-opacity duration-300 ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo animado */}
        <div className="relative">
          {/* Círculo de fondo con pulso */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />

          {/* Icono de mapa con animación */}
          <div className="relative bg-white rounded-full p-6 shadow-2xl">
            <svg
              className="w-16 h-16 text-blue-600 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
        </div>

        {/* Texto del logo */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MapperTrip
          </h1>
          <p className="text-sm text-gray-600 animate-pulse">
            Cargando zonas seguras...
          </p>
        </div>

        {/* Barra de progreso animada */}
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-loading-bar" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
