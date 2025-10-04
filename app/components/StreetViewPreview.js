'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Componente flotante que muestra un preview de Google Street View
 * cuando el usuario hace hover sobre una zona en el mapa
 */
export default function StreetViewPreview({ position, isVisible, onClose }) {
  const streetViewRef = useRef(null);
  const panoramaRef = useRef(null);
  const [hasStreetView, setHasStreetView] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isVisible || !position || !window.google) {
      return;
    }

    setIsLoading(true);
    setHasStreetView(null);

    // Crear servicio de Street View para verificar disponibilidad
    const streetViewService = new window.google.maps.StreetViewService();

    // Buscar panorama cercano (radio de 50 metros)
    streetViewService.getPanorama(
      { location: position, radius: 50 },
      (data, status) => {
        if (status === window.google.maps.StreetViewStatus.OK) {
          setHasStreetView(true);
          setIsLoading(false);

          // Crear o actualizar el panorama
          if (!panoramaRef.current && streetViewRef.current) {
            const panorama = new window.google.maps.StreetViewPanorama(
              streetViewRef.current,
              {
                position: data.location.latLng,
                pov: {
                  heading: 0,
                  pitch: 0
                },
                zoom: 1,
                addressControl: false,
                linksControl: false,
                panControl: false,
                enableCloseButton: false,
                zoomControl: true,
                fullscreenControl: false,
                motionTracking: false,
                motionTrackingControl: false,
              }
            );
            panoramaRef.current = panorama;
          } else if (panoramaRef.current) {
            // Si ya existe, solo actualizar la posición
            panoramaRef.current.setPosition(data.location.latLng);
          }
        } else {
          setHasStreetView(false);
          setIsLoading(false);
        }
      }
    );

    // Cleanup
    return () => {
      if (panoramaRef.current) {
        // No destruir el panorama para reutilizarlo
        // panoramaRef.current = null;
      }
    };
  }, [position, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-24 z-40 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-3 border-white overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <h3 className="font-bold text-sm">Vista de la Zona</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-all duration-200 group"
            title="Cerrar vista"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Street View Container */}
        <div className="relative w-[400px] h-[300px] bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-gray-600 font-semibold text-sm">Cargando vista...</p>
              </div>
            </div>
          )}

          {!isLoading && hasStreetView === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 font-semibold text-sm mb-1">Street View no disponible</p>
                <p className="text-gray-500 text-xs">No hay imágenes de esta zona</p>
              </div>
            </div>
          )}

          <div
            ref={streetViewRef}
            className={`w-full h-full ${isLoading || hasStreetView === false ? 'invisible' : 'visible'}`}
          />
        </div>

        {/* Footer con indicador */}
        {hasStreetView && !isLoading && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-emerald-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Arrastra para explorar la zona</span>
            </div>
          </div>
        )}
      </div>

      {/* Indicador de ayuda */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md border border-gray-200">
          💡 Usa la rueda del ratón para hacer zoom
        </p>
      </div>
    </div>
  );
}
