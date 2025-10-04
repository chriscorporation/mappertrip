'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * PullToRefresh - Componente mobile-first estilo Airbnb
 *
 * Permite a los usuarios hacer pull-to-refresh en contenido scrollable
 * con animaciones fluidas y feedback visual elegante.
 *
 * @param {Function} onRefresh - Función async que se ejecuta al hacer refresh
 * @param {ReactNode} children - Contenido scrollable
 * @param {number} threshold - Distancia en px para activar refresh (default: 80)
 * @param {string} className - Clases CSS adicionales
 */
export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className = ''
}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef(null);
  const isPulling = useRef(false);

  const handleTouchStart = (e) => {
    // Solo activar si estamos al inicio del scroll
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    // Solo permitir pull hacia abajo y cuando estamos en el tope
    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      // Aplicar resistencia: más difícil de jalar mientras más lejos
      const resistance = 0.5;
      const adjustedDistance = distance * resistance;
      setPullDistance(Math.min(adjustedDistance, threshold * 1.5));

      // Prevenir scroll nativo mientras se hace pull
      if (adjustedDistance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current) return;

    isPulling.current = false;

    // Si superamos el threshold, activar refresh
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold); // Mantener el indicador visible

      try {
        await onRefresh();
      } catch (error) {
        console.error('Error during refresh:', error);
      } finally {
        // Animación de cierre suave
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 300);
      }
    } else {
      // No se alcanzó el threshold, volver a 0
      setPullDistance(0);
    }

    setStartY(0);
  };

  // Limpiar estado si el usuario cancela el touch
  useEffect(() => {
    const handleTouchCancel = () => {
      isPulling.current = false;
      setPullDistance(0);
    };

    window.addEventListener('touchcancel', handleTouchCancel);
    return () => window.removeEventListener('touchcancel', handleTouchCancel);
  }, []);

  // Calcular progreso para animaciones (0 a 1)
  const progress = Math.min(pullDistance / threshold, 1);

  // Calcular rotación del icono (0 a 360 grados)
  const rotation = progress * 180;

  // Determinar si debe mostrar el indicador
  const showIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div className={`relative ${className}`}>
      {/* Indicador de Pull-to-Refresh */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10"
        style={{
          height: showIndicator ? `${Math.min(pullDistance, threshold)}px` : '0px',
          opacity: showIndicator ? 1 : 0,
          transform: `translateY(${showIndicator ? '0' : '-20px'})`,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {/* Icono de refresh */}
          <div
            className={`transition-transform duration-200 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: isRefreshing ? 'rotate(0deg)' : `rotate(${rotation}deg)`,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>

          {/* Texto de estado */}
          {showIndicator && (
            <span className="text-xs text-gray-600 font-medium">
              {isRefreshing
                ? 'Actualizando...'
                : progress >= 1
                ? 'Suelta para actualizar'
                : 'Desliza para actualizar'}
            </span>
          )}

          {/* Barra de progreso */}
          {!isRefreshing && pullDistance > 10 && (
            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-100 rounded-full"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Contenedor scrollable */}
      <div
        ref={containerRef}
        className="overflow-y-auto h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          // Agregar padding top cuando el indicador está visible para evitar overlap
          paddingTop: showIndicator ? `${Math.min(pullDistance, threshold)}px` : '0',
          transition: isRefreshing || pullDistance === 0 ? 'padding-top 0.3s ease' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
