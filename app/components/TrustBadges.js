'use client';

import { useState, useEffect } from 'react';

export default function TrustBadges() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Mostrar badges después de 100px de scroll
      if (currentScrollY > 100) {
        setHasScrolled(true);
      }

      // Auto-hide/show basado en dirección del scroll
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        // Scroll hacia abajo - ocultar
        setIsVisible(false);
      } else {
        // Scroll hacia arriba - mostrar
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const badges = [
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'Validación manual',
      subtext: 'En terreno',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: '19 países',
      subtext: 'Latinoamérica',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      text: 'Información segura',
      subtext: 'Verificada',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      text: 'Actualización continua',
      subtext: 'Al día',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div
      className={`
        sticky top-[57px] sm:top-[65px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100
        transition-all duration-300 ease-in-out
        ${isVisible && hasScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
      `}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        {/* Grid responsive de badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl
                ${badge.bgColor} ${badge.borderColor} border
                transition-all duration-300 hover:shadow-md hover:scale-[1.02]
                group cursor-default
              `}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Icono */}
              <div className={`
                ${badge.color} flex-shrink-0
                group-hover:scale-110 transition-transform duration-300
              `}>
                {badge.icon}
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <div className={`
                  ${badge.color} font-semibold text-xs sm:text-sm leading-tight truncate
                `}>
                  {badge.text}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 leading-tight truncate">
                  {badge.subtext}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
