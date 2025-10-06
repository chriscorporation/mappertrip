'use client';

import { useState, useEffect } from 'react';

export default function MobileWarningModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Detectar si la pantalla es menor a 600px
    const checkDevice = () => {
      const isSmallScreen = window.innerWidth < 600;
      return isSmallScreen;
    };

    // Función para actualizar el estado del modal
    const updateModalState = () => {
      setIsOpen(checkDevice());
    };

    // Verificar al montar
    updateModalState();

    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener('resize', updateModalState);

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('resize', updateModalState);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50 flex items-center justify-center p-4"
      style={{
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh'
      }}
    >
      {/* Overlay */}
      <div
        className="absolute bg-gray-600 bg-opacity-20"
        style={{
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh'
        }}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-lg overflow-y-auto"
        style={{
          maxWidth: 'min(90vw, 28rem)',
          maxHeight: '90vh',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <svg
              className="w-16 h-16 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center mb-3">
            Vista de Escritorio
          </h2>

          {/* Message */}
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
            Esta aplicación está optimizada para computadoras de escritorio. Para una mejor experiencia, por favor accede desde un dispositivo con pantalla más grande.
          </p>

          {/* Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
