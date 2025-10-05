'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

// SVG Icon component for Countries
const CountriesIcon = ({ className }) => (
  <div className={className} style={{ width: '24px', height: '24px', position: 'relative' }}>
    <Image
      src="/icons/world-2-svgrepo-com.svg"
      alt="Countries"
      width={24}
      height={24}
      style={{ objectFit: 'contain' }}
    />
  </div>
);

// SVG Icon component for Zones
const ZonesIcon = ({ className }) => (
  <div className={className} style={{ width: '24px', height: '24px', position: 'relative' }}>
    <Image
      src="/icons/arrow-down-right-square-svgrepo-com.svg"
      alt="Zones"
      width={24}
      height={24}
      style={{ objectFit: 'contain' }}
    />
  </div>
);

// SVG Icon component for Airbnb
const AirbnbIcon = ({ className }) => (
  <div className={className} style={{ width: '24px', height: '24px', position: 'relative' }}>
    <Image
      src="/icons/home-alt-svgrepo-com.svg"
      alt="Airbnb"
      width={24}
      height={24}
      style={{ objectFit: 'contain' }}
    />
  </div>
);

// SVG Icon component for CoWorking
const CoworkingIcon = ({ className }) => (
  <div className={className} style={{ width: '24px', height: '24px', position: 'relative' }}>
    <Image
      src="/icons/people-nearby-svgrepo-com.svg"
      alt="CoWorking"
      width={24}
      height={24}
      style={{ objectFit: 'contain' }}
    />
  </div>
);

// SVG Icon component for Instagramable
const InstagramableIcon = ({ className }) => (
  <div className={className} style={{ width: '24px', height: '24px', position: 'relative' }}>
    <Image
      src="/icons/camera-svgrepo-com.svg"
      alt="Instagramable"
      width={24}
      height={24}
      style={{ objectFit: 'contain' }}
    />
  </div>
);

export default function Sidebar({ selectedTab, selectedCountry, isZonesEnabled, places, airbnbs, coworkingPlaces, instagramablePlaces, countries }) {
  const router = useRouter();
  const [hoveredTab, setHoveredTab] = useState(null);
  const [rippleEffect, setRippleEffect] = useState(null);

  // Calcular cantidades para cada tab
  const getTabCount = (tabId) => {
    switch (tabId) {
      case 'countries':
        return countries?.length || 0;
      case 'zones':
        if (!selectedCountry) return 0;
        return places?.filter(p => p.country_code === selectedCountry.country_code).length || 0;
      case 'airbnb':
        if (!selectedCountry) return 0;
        return airbnbs?.filter(a => a.country_code === selectedCountry.country_code).length || 0;
      case 'coworking':
        if (!selectedCountry) return 0;
        return coworkingPlaces?.filter(c => c.country_code === selectedCountry.country_code).length || 0;
      case 'instagramable':
        if (!selectedCountry) return 0;
        return instagramablePlaces?.filter(i => i.country_code === selectedCountry.country_code).length || 0;
      default:
        return 0;
    }
  };

  const tabs = [
    {
      id: 'countries',
      label: 'Countries',
      Icon: CountriesIcon,
      tooltip: 'Explora países de Latinoamérica',
      count: getTabCount('countries')
    },
    {
      id: 'zones',
      label: 'Zones',
      Icon: ZonesIcon,
      disabled: !isZonesEnabled,
      tooltip: isZonesEnabled
        ? 'Zonas seguras y de riesgo'
        : 'Selecciona un país primero',
      count: getTabCount('zones')
    },
    {
      id: 'airbnb',
      label: 'AirBnB',
      Icon: AirbnbIcon,
      disabled: !isZonesEnabled,
      tooltip: isZonesEnabled
        ? 'Alojamientos disponibles'
        : 'Selecciona un país primero',
      count: getTabCount('airbnb')
    },
    {
      id: 'coworking',
      label: 'CoWorking',
      Icon: CoworkingIcon,
      disabled: !isZonesEnabled,
      tooltip: isZonesEnabled
        ? 'Espacios de trabajo'
        : 'Selecciona un país primero',
      count: getTabCount('coworking')
    },
    {
      id: 'instagramable',
      label: 'Instagramable',
      Icon: InstagramableIcon,
      disabled: !isZonesEnabled,
      tooltip: isZonesEnabled
        ? 'Lugares fotogénicos'
        : 'Selecciona un país primero',
      count: getTabCount('instagramable')
    }
  ];

  const handleTabClick = (tabId, disabled) => {
    if (disabled) return;

    // Trigger ripple effect
    setRippleEffect(tabId);
    setTimeout(() => setRippleEffect(null), 600);

    router.push(`/?tab=${tabId}`);
  };

  return (
    <div className="w-[100px] bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-300 flex flex-col shadow-sm">
      {tabs.map((tab, index) => {
        const isActive = selectedTab === tab.id;
        const isHovered = hoveredTab === tab.id;
        const hasRipple = rippleEffect === tab.id;

        return (
          <div
            key={tab.id}
            className="relative group"
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <button
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              disabled={tab.disabled}
              style={{
                animationDelay: `${index * 50}ms`
              }}
              className={`
                w-full relative overflow-hidden
                flex flex-col items-center justify-center py-6 px-2 border-b border-gray-200
                transition-all duration-300 ease-out
                ${isActive
                  ? 'bg-gradient-to-r from-white via-blue-50 to-white border-l-4 border-l-blue-600 shadow-md'
                  : tab.disabled
                    ? 'bg-gray-50/50 text-gray-300'
                    : 'hover:bg-white hover:shadow-sm cursor-pointer transform hover:scale-105'
                }
                ${!tab.disabled && !isActive ? 'hover:-translate-x-1' : ''}
              `}
            >
              {/* Ripple effect on click */}
              {hasRipple && !tab.disabled && (
                <span className="absolute inset-0 bg-blue-400/30 animate-ping rounded-full" />
              )}

              {/* Subtle gradient glow on hover */}
              {!tab.disabled && isHovered && !isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-transparent to-purple-100/50 animate-pulse" />
              )}

              {/* Icon with micro-animation */}
              <div className={`
                relative z-10 mb-1 transition-all duration-300
                ${isActive ? 'scale-110' : ''}
                ${!tab.disabled && isHovered ? 'scale-125 rotate-6' : ''}
                ${tab.disabled ? 'opacity-40 grayscale' : ''}
              `}>
                <tab.Icon className="text-2xl" />
              </div>

              {/* Label */}
              <span className={`
                relative z-10 text-xs font-medium text-center transition-all duration-300
                ${isActive ? 'text-blue-700 font-bold' : ''}
                ${tab.disabled ? 'text-gray-300' : 'text-gray-700'}
                ${!tab.disabled && isHovered ? 'text-blue-600' : ''}
              `}>
                {tab.label}
              </span>

              {/* Count badge - solo mostrar si hay elementos */}
              {tab.count > 0 && (
                <div className={`
                  absolute top-2 right-2 z-20
                  min-w-[20px] h-5 px-1.5 rounded-full
                  flex items-center justify-center
                  text-[10px] font-bold
                  transition-all duration-300 shadow-sm
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-110'
                    : tab.disabled
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                  }
                  ${!tab.disabled && isHovered ? 'scale-125 from-blue-500 to-blue-600' : ''}
                `}>
                  {tab.count > 99 ? '99+' : tab.count}
                </div>
              )}

              {/* Active indicator pulse */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-600 rounded-r-full animate-pulse" />
              )}
            </button>

            {/* Tooltip */}
            {isHovered && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-fadeIn">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                  {tab.tooltip}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
