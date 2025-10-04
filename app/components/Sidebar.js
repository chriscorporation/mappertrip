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

export default function Sidebar({ selectedTab, selectedCountry, isZonesEnabled }) {
  const router = useRouter();
  const [hoveredTab, setHoveredTab] = useState(null);
  const [rippleEffect, setRippleEffect] = useState(null);

  const tabs = [
    {
      id: 'countries',
      label: 'Countries',
      Icon: CountriesIcon,
      tooltip: 'Explora países de Latinoamérica'
    },
    {
      id: 'zones',
      label: 'Zones',
      Icon: ZonesIcon,
      disabled: !isZonesEnabled,
      tooltip: isZonesEnabled
        ? 'Zonas seguras y de riesgo'
        : 'Selecciona un país primero'
    },
    {
      id: 'airbnb',
      label: 'AirBnB',
      Icon: AirbnbIcon,
      disabled: !isZonesEnabled,
      tooltip: isZonesEnabled
        ? 'Alojamientos disponibles'
        : 'Selecciona un país primero'
    },
    {
      id: 'coworking',
      label: 'CoWorking',
      Icon: CoworkingIcon,
      disabled: !isZonesEnabled,
      tooltip: isZonesEnabled
        ? 'Espacios de trabajo'
        : 'Selecciona un país primero'
    },
    {
      id: 'instagramable',
      label: 'Instagramable',
      Icon: InstagramableIcon,
      disabled: !isZonesEnabled,
      tooltip: isZonesEnabled
        ? 'Lugares fotogénicos'
        : 'Selecciona un país primero'
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
