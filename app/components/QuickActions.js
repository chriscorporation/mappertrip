'use client';

import { useState, useEffect } from 'react';
import {
  BiShareAlt,
  BiDownload,
  BiStats,
  BiMapPin,
  BiLayerPlus,
  BiReset,
  BiX
} from 'react-icons/bi';

export default function QuickActions({
  selectedCountry,
  selectedPlace,
  places,
  onResetZoom,
  onToggleMapType,
  currentMapType = 'roadmap'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(null);

  // Cerrar menú al presionar Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const showNotification = (message) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 2500);
  };

  // Compartir zona actual
  const handleShareZone = () => {
    if (!selectedPlace || !selectedCountry) return;

    const shareUrl = `${window.location.origin}/?zone=${selectedPlace.id}&country=${selectedCountry.country_code}&lat=${selectedPlace.lat}&lng=${selectedPlace.lng}&tab=zones`;

    if (navigator.share) {
      navigator.share({
        title: `Zona en ${selectedCountry.name}`,
        text: `Mira esta zona de seguridad en ${selectedPlace.address}`,
        url: shareUrl
      }).catch(() => {
        // Si falla, copiar al portapapeles
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }

    setIsOpen(false);
  };

  // Copiar al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showNotification('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Exportar zonas del país (JSON)
  const handleExportZones = () => {
    if (!selectedCountry) return;

    const countryZones = places.filter(p => p.country_code === selectedCountry.country_code);

    const exportData = {
      country: selectedCountry.name,
      country_code: selectedCountry.country_code,
      total_zones: countryZones.length,
      export_date: new Date().toISOString(),
      zones: countryZones.map(zone => ({
        id: zone.id,
        address: zone.address,
        lat: zone.lat,
        lng: zone.lng,
        color: zone.color,
        is_turistic: zone.is_turistic,
        has_polygon: !!zone.polygon,
        has_circle: !!zone.circle_radius
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mappertrip-${selectedCountry.country_code}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Zonas exportadas correctamente');
    setIsOpen(false);
  };

  // Copiar coordenadas actuales
  const handleCopyCoordinates = () => {
    if (!selectedPlace) return;

    const coords = `${selectedPlace.lat}, ${selectedPlace.lng}`;
    copyToClipboard(coords);
    setIsOpen(false);
  };

  // Toggle entre roadmap y satellite
  const handleToggleMapType = () => {
    if (onToggleMapType) {
      onToggleMapType();
      showNotification(currentMapType === 'roadmap' ? 'Vista satélite activada' : 'Vista mapa activada');
    }
    setIsOpen(false);
  };

  // Resetear zoom al país
  const handleResetZoom = () => {
    if (onResetZoom) {
      onResetZoom();
      showNotification('Vista restablecida');
    }
    setIsOpen(false);
  };

  // Ver estadísticas rápidas
  const handleShowStats = () => {
    if (!selectedCountry) return;

    const countryZones = places.filter(p => p.country_code === selectedCountry.country_code);
    const colors = {
      green: countryZones.filter(z => z.color === 'green').length,
      yellow: countryZones.filter(z => z.color === 'yellow').length,
      orange: countryZones.filter(z => z.color === 'orange').length,
      red: countryZones.filter(z => z.color === 'red').length,
      blue: countryZones.filter(z => z.color === 'blue').length
    };

    const statsMessage = `
${selectedCountry.name}: ${countryZones.length} zonas
🟢 Seguras: ${colors.green}
🟡 Regulares: ${colors.yellow}
🟠 Precaución: ${colors.orange}
🔴 Peligrosas: ${colors.red}
🔵 Turísticas: ${colors.blue}
    `.trim();

    alert(statsMessage);
    setIsOpen(false);
  };

  // Acciones disponibles según contexto
  const actions = [
    {
      id: 'share',
      icon: BiShareAlt,
      label: 'Compartir zona',
      onClick: handleShareZone,
      enabled: !!selectedPlace && !!selectedCountry,
      color: 'text-blue-600',
      bgHover: 'hover:bg-blue-50'
    },
    {
      id: 'export',
      icon: BiDownload,
      label: 'Exportar zonas',
      onClick: handleExportZones,
      enabled: !!selectedCountry,
      color: 'text-green-600',
      bgHover: 'hover:bg-green-50'
    },
    {
      id: 'stats',
      icon: BiStats,
      label: 'Ver estadísticas',
      onClick: handleShowStats,
      enabled: !!selectedCountry,
      color: 'text-purple-600',
      bgHover: 'hover:bg-purple-50'
    },
    {
      id: 'coords',
      icon: BiMapPin,
      label: 'Copiar coordenadas',
      onClick: handleCopyCoordinates,
      enabled: !!selectedPlace,
      color: 'text-orange-600',
      bgHover: 'hover:bg-orange-50'
    },
    {
      id: 'maptype',
      icon: BiLayerPlus,
      label: currentMapType === 'roadmap' ? 'Vista satélite' : 'Vista mapa',
      onClick: handleToggleMapType,
      enabled: true,
      color: 'text-teal-600',
      bgHover: 'hover:bg-teal-50'
    },
    {
      id: 'reset',
      icon: BiReset,
      label: 'Restablecer vista',
      onClick: handleResetZoom,
      enabled: !!selectedCountry,
      color: 'text-gray-600',
      bgHover: 'hover:bg-gray-50'
    }
  ];

  const enabledActions = actions.filter(a => a.enabled);

  return (
    <>
      {/* Toast de notificación */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] animate-[slideDown_0.3s_ease-out]">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            <span className="text-sm font-medium">{showToast}</span>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-3">
        {/* Menú de acciones (expandido) */}
        {isOpen && (
          <div className="flex flex-col gap-2 animate-[scaleIn_0.2s_ease-out]">
            {enabledActions.map((action, index) => (
              <button
                key={action.id}
                onClick={action.onClick}
                style={{ animationDelay: `${index * 30}ms` }}
                className={`
                  group flex items-center gap-3 bg-white rounded-full shadow-lg
                  px-4 py-3 transition-all duration-200
                  animate-[slideInRight_0.3s_ease-out_both]
                  ${action.bgHover}
                  hover:shadow-xl hover:scale-105 hover:-translate-x-1
                `}
              >
                <span className={`text-xs font-medium text-gray-700 whitespace-nowrap group-hover:${action.color} transition-colors`}>
                  {action.label}
                </span>
                <action.icon className={`text-xl ${action.color} group-hover:scale-110 transition-transform`} />
              </button>
            ))}
          </div>
        )}

        {/* Botón principal FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-14 h-14 rounded-full shadow-2xl
            flex items-center justify-center
            transition-all duration-300 ease-out
            ${isOpen
              ? 'bg-red-500 hover:bg-red-600 rotate-90'
              : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 hover:scale-110'
            }
            hover:shadow-xl active:scale-95
          `}
          aria-label={isOpen ? 'Cerrar menú de acciones' : 'Abrir menú de acciones'}
        >
          {isOpen ? (
            <BiX className="text-white text-3xl transition-transform duration-200" />
          ) : (
            <div className="relative">
              <BiLayerPlus className="text-white text-2xl transition-transform duration-200" />
              {/* Pulse indicator cuando hay acciones disponibles */}
              {enabledActions.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
          )}
        </button>

        {/* Indicador de número de acciones disponibles */}
        {!isOpen && enabledActions.length > 0 && (
          <div className="absolute -top-2 -left-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
            {enabledActions.length}
          </div>
        )}
      </div>

      {/* Overlay cuando está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[999] animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
