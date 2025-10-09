'use client';

import { useEffect, useRef, useState } from 'react';
import { BiStreetView, BiX } from 'react-icons/bi';

export default function StreetViewPreview({ lat, lng, address }) {
  const thumbnailRef = useRef(null);
  const modalPanoramaRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [streetViewAvailable, setStreetViewAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar thumbnail de Street View
  useEffect(() => {
    if (!window.google || !thumbnailRef.current || !lat || !lng) return;

    const streetViewService = new window.google.maps.StreetViewService();
    const location = { lat: parseFloat(lat), lng: parseFloat(lng) };

    // Verificar si Street View está disponible en la ubicación
    streetViewService.getPanorama(
      { location, radius: 50 },
      (data, status) => {
        if (status === 'OK') {
          setStreetViewAvailable(true);

          // Crear thumbnail de Street View
          const panorama = new window.google.maps.StreetViewPanorama(
            thumbnailRef.current,
            {
              position: location,
              pov: { heading: 0, pitch: 0 },
              zoom: 0,
              addressControl: false,
              linksControl: false,
              panControl: false,
              enableCloseButton: false,
              fullscreenControl: false,
              motionTracking: false,
              motionTrackingControl: false,
            }
          );

          // Esperar a que el panorama cargue
          window.google.maps.event.addListenerOnce(panorama, 'pano_changed', () => {
            setIsLoading(false);
          });
        } else {
          setStreetViewAvailable(false);
          setIsLoading(false);
        }
      }
    );
  }, [lat, lng]);

  // Inicializar panorama del modal cuando se abre
  useEffect(() => {
    if (!isModalOpen || !window.google || !modalPanoramaRef.current || !lat || !lng) return;

    const location = { lat: parseFloat(lat), lng: parseFloat(lng) };

    const panorama = new window.google.maps.StreetViewPanorama(
      modalPanoramaRef.current,
      {
        position: location,
        pov: { heading: 0, pitch: 0 },
        zoom: 0,
        addressControl: true,
        linksControl: true,
        panControl: true,
        enableCloseButton: false,
        fullscreenControl: true,
        motionTracking: true,
        motionTrackingControl: true,
      }
    );

    return () => {
      // Limpiar listeners
      window.google.maps.event.clearInstanceListeners(panorama);
    };
  }, [isModalOpen, lat, lng]);

  if (!streetViewAvailable && !isLoading) {
    return null; // No mostrar nada si Street View no está disponible
  }

  return (
    <>
      {/* Thumbnail clickeable */}
      <div className="relative group">
        <div
          ref={thumbnailRef}
          className="w-full h-48 rounded-xl overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-blue-400 transition-all duration-200"
          onClick={() => streetViewAvailable && setIsModalOpen(true)}
        />

        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {streetViewAvailable && !isLoading && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-2">
              <BiStreetView className="text-blue-600 text-lg" />
              <span className="text-xs font-semibold text-gray-700">Click para explorar</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Street View expandido */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl h-[80vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BiStreetView className="text-white text-2xl" />
                  <div>
                    <h3 className="text-white font-bold text-lg">Vista de calle</h3>
                    <p className="text-white/80 text-sm">{address}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200"
                  aria-label="Cerrar vista de calle"
                >
                  <BiX className="text-white text-2xl" />
                </button>
              </div>
            </div>

            {/* Panorama de Street View */}
            <div ref={modalPanoramaRef} className="w-full h-full" />
          </div>
        </div>
      )}
    </>
  );
}
