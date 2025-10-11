'use client';

import { useState, useEffect } from 'react';
import { BiChevronRight, BiWorld, BiMapAlt, BiCurrentLocation } from 'react-icons/bi';
import { useRouter } from 'next/navigation';

export default function StickyBreadcrumb({ selectedCountry, selectedTab, places, highlightedPlace }) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Detectar scroll para aplicar efecto de elevación
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Obtener información de la zona destacada si existe
  const highlightedZone = highlightedPlace && places
    ? places.find(p => p.id === highlightedPlace)
    : null;

  // Determinar el contenido del breadcrumb según el contexto
  const getBreadcrumbItems = () => {
    const items = [];

    // Siempre mostrar "Inicio" / "MapTrips"
    items.push({
      id: 'home',
      label: 'MapTrips',
      icon: BiWorld,
      action: () => router.push('/?tab=countries'),
      isActive: selectedTab === 'countries' && !selectedCountry
    });

    // Si hay país seleccionado
    if (selectedCountry) {
      items.push({
        id: 'country',
        label: selectedCountry.country_name || selectedCountry.name,
        icon: BiMapAlt,
        action: () => router.push('/?tab=zones'),
        isActive: selectedTab === 'zones' && !highlightedZone,
        badge: places?.filter(p => p.country_code === selectedCountry.country_code && p.active !== null).length || 0,
        badgeLabel: 'zonas'
      });
    }

    // Si hay una zona específica destacada
    if (highlightedZone) {
      items.push({
        id: 'zone',
        label: highlightedZone.address?.split(',')[0] || 'Zona',
        icon: BiCurrentLocation,
        isActive: true,
        safetyLevel: highlightedZone.safety_level,
        color: highlightedZone.color
      });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  // Si solo hay un item (home) y no está seleccionado, no mostrar breadcrumb
  if (breadcrumbItems.length === 1 && !breadcrumbItems[0].isActive) {
    return null;
  }

  return (
    <div
      className={`
        sticky top-0 z-[999] bg-white border-b transition-all duration-300
        ${isScrolled ? 'shadow-lg border-gray-300' : 'shadow-sm border-gray-200'}
      `}
    >
      <div className="max-w-full px-6 py-3">
        <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isHovered = hoveredItem === item.id;

            return (
              <div key={item.id} className="flex items-center gap-2 flex-shrink-0">
                {/* Breadcrumb Item */}
                <button
                  onClick={item.action}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  disabled={!item.action}
                  className={`
                    group flex items-center gap-2 px-3 py-1.5 rounded-lg
                    transition-all duration-300 relative overflow-hidden
                    ${item.isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                    }
                    ${item.action ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {/* Efecto de hover brillante */}
                  {isHovered && item.action && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 animate-pulse" />
                  )}

                  {/* Icono */}
                  <item.icon
                    className={`
                      text-lg transition-all duration-300 relative z-10
                      ${item.isActive ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}
                      ${isHovered ? 'scale-110 rotate-6' : ''}
                    `}
                  />

                  {/* Label */}
                  <span
                    className={`
                      text-sm font-medium transition-all duration-300 relative z-10 max-w-xs truncate
                      ${item.isActive ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-600'}
                    `}
                  >
                    {item.label}
                  </span>

                  {/* Badge de contador */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`
                        relative z-10 ml-1 px-2 py-0.5 rounded-full text-xs font-semibold
                        transition-all duration-300
                        ${item.isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 group-hover:bg-blue-600 group-hover:text-white'
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Indicador de nivel de seguridad para zonas */}
                  {item.color && (
                    <div
                      className="relative z-10 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                      title={item.safetyLevel}
                    />
                  )}
                </button>

                {/* Separador */}
                {!isLast && (
                  <BiChevronRight
                    className={`
                      text-gray-400 transition-all duration-300
                      ${isHovered ? 'text-blue-500 scale-110' : ''}
                    `}
                  />
                )}
              </div>
            );
          })}

          {/* Información contextual adicional */}
          {selectedCountry && (
            <div className="ml-auto flex items-center gap-3 px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <BiMapAlt className="text-gray-500 text-sm" />
                <span className="text-xs font-medium text-gray-600">
                  {selectedCountry.country_code?.toUpperCase()}
                </span>
              </div>
              {highlightedZone && (
                <>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: highlightedZone.color }}
                    />
                    <span className="text-xs text-gray-600">
                      {highlightedZone.safety_level}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </nav>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
