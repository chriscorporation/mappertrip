'use client';

import { useState, useEffect } from 'react';

export default function HeroBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya cerró el banner anteriormente
    const bannerDismissed = localStorage.getItem('heroBannerDismissed');

    if (!bannerDismissed) {
      // Mostrar banner después de un breve delay para efecto suave
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    // Guardar en localStorage que el usuario cerró el banner
    localStorage.setItem('heroBannerDismissed', 'true');

    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm
        transition-opacity duration-300
        ${isClosing ? 'opacity-0' : 'opacity-100'}
      `}
      onClick={handleDismiss}
    >
      <div
        className={`
          bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto overflow-hidden
          transform transition-all duration-300
          ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Image - Mobile optimized */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500">
          {/* Patrón decorativo sutil */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1.5" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-pattern)"/>
            </svg>
          </div>

          {/* Icono de ubicación grande */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-6 sm:p-8">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-lg"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </div>
          </div>

          {/* Botón cerrar - Posición fixed para que siempre sea accesible */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg transition-all hover:scale-110 active:scale-95"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Contenido del banner */}
        <div className="p-6 sm:p-8">
          {/* Badge de bienvenida */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Información validada en terreno
            </span>
          </div>

          {/* Título principal */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4 leading-tight">
            Viaja con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              seguridad
            </span>
            {' '}por Latinoamérica
          </h2>

          {/* Descripción */}
          <p className="text-gray-600 text-center text-sm sm:text-base mb-6 max-w-xl mx-auto leading-relaxed">
            Descubre zonas seguras y puntos de riesgo en ciudades de América Latina.
            Información <strong className="font-semibold text-gray-900">verificada manualmente</strong> por
            viajeros locales para que explores con confianza.
          </p>

          {/* Features - Grid mobile-first */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Zonas seguras</h3>
                <p className="text-xs text-gray-600">Mapas con nivel de riesgo por barrio</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Coworkings</h3>
                <p className="text-xs text-gray-600">Espacios para nómadas digitales</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Alojamientos</h3>
                <p className="text-xs text-gray-600">Encuentra dónde hospedarte</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleDismiss}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Explorar el mapa
            <svg className="inline-block ml-2 w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Cubrimos 19 países de América Latina
          </p>
        </div>
      </div>
    </div>
  );
}
