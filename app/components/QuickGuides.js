'use client';

import { useState, useRef, useEffect } from 'react';
import { BiShield, BiPhone, BiCar, BiInfoCircle, BiFirstAid } from 'react-icons/bi';

export default function QuickGuides({ zone, countryCode }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Verificar si puede hacer scroll
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [zone]);

  // Números de emergencia por país (datos de ejemplo, se pueden ampliar)
  const emergencyNumbers = {
    'MX': { police: '911', ambulance: '911', fire: '911' },
    'CO': { police: '123', ambulance: '123', fire: '119' },
    'AR': { police: '911', ambulance: '107', fire: '100' },
    'BR': { police: '190', ambulance: '192', fire: '193' },
    'CL': { police: '133', ambulance: '131', fire: '132' },
    'PE': { police: '105', ambulance: '116', fire: '116' },
    'UY': { police: '911', ambulance: '105', fire: '104' },
    'EC': { police: '911', ambulance: '911', fire: '911' },
    'BO': { police: '110', ambulance: '118', fire: '119' },
    'PY': { police: '911', ambulance: '141', fire: '132' },
    'VE': { police: '171', ambulance: '171', fire: '171' },
  };

  const currentEmergency = emergencyNumbers[countryCode] || { police: '911', ambulance: '911', fire: '911' };

  // Determinar nivel de seguridad basado en el color
  const getSafetyLevel = (color) => {
    const colorMap = {
      '#22c55e': 'safe',
      '#3b82f6': 'medium',
      '#eab308': 'regular',
      '#f97316': 'caution',
      '#dc2626': 'unsafe',
      '#ef4444': 'unsafe'
    };
    return colorMap[color] || 'medium';
  };

  const safetyLevel = getSafetyLevel(zone.color);

  // Guías según nivel de seguridad
  const guides = [
    {
      icon: BiShield,
      title: 'Seguridad',
      color: 'blue',
      tips: safetyLevel === 'safe'
        ? ['Zona segura para caminar de día y noche', 'Presencia policial regular', 'Baja tasa de criminalidad']
        : safetyLevel === 'medium'
        ? ['Zona moderadamente segura', 'Evita mostrar objetos de valor', 'Mantente en áreas iluminadas de noche']
        : safetyLevel === 'regular'
        ? ['Ten precaución en todo momento', 'No camines solo de noche', 'Usa transporte seguro']
        : safetyLevel === 'caution'
        ? ['Zona de precaución elevada', 'Evita salir de noche', 'No muestres objetos de valor']
        : ['Zona de alto riesgo', 'Evita visitar si es posible', 'Usa solo transporte privado confiable']
    },
    {
      icon: BiPhone,
      title: 'Emergencias',
      color: 'red',
      tips: [
        `Policía: ${currentEmergency.police}`,
        `Ambulancia: ${currentEmergency.ambulance}`,
        `Bomberos: ${currentEmergency.fire}`,
        'Guarda contacto de tu embajada'
      ]
    },
    {
      icon: BiCar,
      title: 'Transporte',
      color: 'green',
      tips: safetyLevel === 'safe' || safetyLevel === 'medium'
        ? ['Uber/DiDi disponibles', 'Transporte público seguro', 'Taxis oficiales recomendados']
        : ['Usa solo apps de transporte', 'Evita taxis de calle', 'No uses transporte público de noche', 'Verifica placa del vehículo']
    },
    {
      icon: BiFirstAid,
      title: 'Salud',
      color: 'purple',
      tips: [
        'Hospitales cercanos disponibles',
        'Farmacias 24h en la zona',
        'Agua embotellada recomendada',
        'Seguro de viaje esencial'
      ]
    },
    {
      icon: BiInfoCircle,
      title: 'Tips Generales',
      color: 'yellow',
      tips: [
        'Mantén copias de documentos',
        'Comparte tu ubicación con contactos',
        'Aprende frases básicas en español',
        'Respeta las costumbres locales'
      ]
    }
  ];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    yellow: 'bg-yellow-50 border-yellow-200'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600'
  };

  return (
    <div className="w-full bg-white border-t border-gray-200 py-4 px-3">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Guías Rápidas</h3>
        <p className="text-xs text-gray-500">Información esencial para tu seguridad</p>
      </div>

      <div className="relative">
        {/* Botón scroll izquierda */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-gray-50 transition-all duration-200 hover:scale-110"
            aria-label="Scroll hacia la izquierda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Container de cards deslizables */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {guides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <div
                key={index}
                className={`flex-shrink-0 w-64 sm:w-72 p-4 rounded-xl border-2 ${colorClasses[guide.color]} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 snap-start`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`text-xl ${iconColorClasses[guide.color]}`} />
                  <h4 className="font-semibold text-sm text-gray-800">{guide.title}</h4>
                </div>
                <ul className="space-y-2">
                  {guide.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Botón scroll derecha */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 hover:bg-gray-50 transition-all duration-200 hover:scale-110"
            aria-label="Scroll hacia la derecha"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Indicadores de scroll en mobile */}
      <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
        {guides.map((_, index) => (
          <div
            key={index}
            className="w-1.5 h-1.5 rounded-full bg-gray-300 transition-colors duration-200"
          />
        ))}
      </div>
    </div>
  );
}
