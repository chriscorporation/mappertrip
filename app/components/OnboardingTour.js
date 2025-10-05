'use client';

import { useEffect, useState } from 'react';
import { useOnboardingStore } from '../store/onboardingStore';
import { useAppStore } from '../store/appStore';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: '¡Bienvenido a MapTrips! 🌎',
    description: 'Tu plataforma de seguridad para viajeros en América Latina. Te mostraremos cómo funciona en solo unos pasos.',
    position: 'center',
    highlight: null,
  },
  {
    id: 'countries',
    title: 'Selecciona un país 🗺️',
    description: 'Explora los 19 países de América Latina que cubrimos. Toda nuestra información está validada manualmente sobre el terreno.',
    position: 'left',
    highlight: 'countries-panel',
  },
  {
    id: 'safety-colors',
    title: 'Sistema de colores de seguridad 🛡️',
    description: 'Usamos un código de colores para indicar niveles de seguridad: Verde (Seguro), Amarillo (Precaución), Naranja (Cuidado), Rojo (Evitar).',
    position: 'center',
    highlight: null,
  },
  {
    id: 'zones',
    title: 'Zonas mapeadas 📍',
    description: 'Cada zona ha sido verificada por nuestro equipo. Encuentra áreas seguras para alojarte, trabajar y explorar.',
    position: 'left',
    highlight: 'zones-panel',
  },
  {
    id: 'map',
    title: 'Mapa interactivo 🗺️',
    description: 'Navega por el mapa, haz zoom, y explora las zonas de seguridad. Haz clic en cualquier zona para ver más detalles.',
    position: 'right',
    highlight: 'google-map',
  },
  {
    id: 'complete',
    title: '¡Listo para explorar! ✨',
    description: 'Ya conoces lo básico. Comienza seleccionando un país para ver sus zonas de seguridad. ¡Viaja seguro!',
    position: 'center',
    highlight: null,
  },
];

export default function OnboardingTour() {
  const { isActive, currentStep, nextStep, prevStep, skipTour, completeTour, hasCompletedTour, startTour } = useOnboardingStore();
  const { _hasHydrated } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const currentStepData = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Only run on client after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-start tour for first-time visitors
  useEffect(() => {
    if (!mounted || !_hasHydrated) return;

    if (!hasCompletedTour && !isActive) {
      // Delay to ensure page is loaded
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mounted, _hasHydrated, hasCompletedTour, isActive, startTour]);

  // Calculate tooltip position based on highlighted element
  useEffect(() => {
    if (!currentStepData?.highlight) return;

    const updatePosition = () => {
      const element = document.querySelector(`[data-tour-id="${currentStepData.highlight}"]`);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const position = currentStepData.position;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.right + 20;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.left - 20;
          break;
        case 'top':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.top - 20;
          left = rect.left + rect.width / 2;
          break;
        default:
          top = window.innerHeight / 2;
          left = window.innerWidth / 2;
      }

      setTooltipPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep, currentStepData]);

  const handleNext = () => {
    if (isLastStep) {
      completeTour();
    } else {
      nextStep();
    }
  };

  if (!mounted || !isActive) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300 animate-[fadeIn_0.3s_ease-in-out]" />

      {/* Spotlight highlight for specific elements */}
      {currentStepData.highlight && (
        <>
          <style dangerouslySetInnerHTML={{
            __html: `
              [data-tour-id="${currentStepData.highlight}"] {
                position: relative !important;
                z-index: 10000 !important;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6) !important;
                border-radius: 8px !important;
              }
            `
          }} />
        </>
      )}

      {/* Tooltip */}
      <div
        className={`fixed z-[10001] transition-all duration-300 ${
          currentStepData.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
        }`}
        style={
          currentStepData.position !== 'center'
            ? {
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                transform:
                  currentStepData.position === 'right'
                    ? 'translate(-100%, -50%)'
                    : currentStepData.position === 'left'
                    ? 'translate(0, -50%)'
                    : currentStepData.position === 'bottom'
                    ? 'translate(-50%, -100%)'
                    : 'translate(-50%, 0)',
              }
            : {}
        }
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-[400px] animate-[scaleIn_0.3s_ease-out]">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 pr-8">
              {currentStepData.title}
            </h3>
            <button
              onClick={skipTour}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Cerrar tour"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-blue-500'
                    : index < currentStep
                    ? 'w-2 bg-blue-300'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={skipTour}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Omitir
            </button>

            <div className="flex gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Anterior
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                {isLastStep ? '¡Comenzar! 🚀' : 'Siguiente'}
              </button>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center mt-4 text-xs text-gray-500">
            Paso {currentStep + 1} de {TOUR_STEPS.length}
          </div>
        </div>

        {/* Arrow pointer for non-center positions */}
        {currentStepData.position !== 'center' && (
          <div
            className={`absolute w-0 h-0 ${
              currentStepData.position === 'left'
                ? 'border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white -left-2 top-1/2 -translate-y-1/2'
                : currentStepData.position === 'right'
                ? 'border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white -right-2 top-1/2 -translate-y-1/2'
                : currentStepData.position === 'top'
                ? 'border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white -top-2 left-1/2 -translate-x-1/2'
                : 'border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white -bottom-2 left-1/2 -translate-x-1/2'
            }`}
          />
        )}
      </div>

      {/* Global animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `
      }} />
    </>
  );
}
