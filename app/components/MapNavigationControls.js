'use client';

import { useState, useEffect } from 'react';
import {
  BiCurrentLocation,
  BiPlus,
  BiMinus,
  BiRefresh,
  BiNavigation,
  BiChevronRight,
  BiChevronLeft
} from 'react-icons/bi';

export default function MapNavigationControls({
  map,
  selectedCountry,
  places,
  onResetView
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Escuchar cambios de zoom del mapa
  useEffect(() => {
    if (!map) return;

    const zoomListener = map.addListener('zoom_changed', () => {
      setCurrentZoom(map.getZoom());
    });

    // Obtener zoom inicial
    setCurrentZoom(map.getZoom());

    return () => {
      if (zoomListener) {
        window.google.maps.event.removeListener(zoomListener);
      }
    };
  }, [map]);

  // Obtener ubicación del usuario
  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setUserLocation(userPos);

        // Centrar mapa en ubicación del usuario
        if (map) {
          map.panTo(userPos);
          map.setZoom(15);
        }

        setIsLocating(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Controles de zoom
  const handleZoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1);
    }
  };

  // Resetear vista del país
  const handleResetCountryView = () => {
    if (onResetView) {
      onResetView();
    }
  };

  // Resetear rotación (volver al norte)
  const handleResetRotation = () => {
    if (map) {
      map.setHeading(0);
      map.setTilt(0);
    }
  };

  if (!map) return null;

  return (
    <div className="absolute top-24 left-4 z-30">
      {/* Botón principal - Toggle */}
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            bg-white rounded-full shadow-lg p-3
            hover:shadow-xl transition-all duration-300 hover:scale-110
            border border-gray-200 group relative
            ${isExpanded ? 'bg-blue-50 border-blue-300' : ''}
          `}
          aria-label={isExpanded ? 'Cerrar controles' : 'Abrir controles'}
          title={isExpanded ? 'Cerrar controles' : 'Controles de navegación'}
        >
          {isExpanded ? (
            <BiChevronLeft className="text-xl text-blue-600" />
          ) : (
            <BiNavigation className="text-xl text-gray-600 group-hover:text-blue-600 transition-colors" />
          )}
        </button>

        {/* Panel de controles expandido */}
        {isExpanded && (
          <div className="absolute left-16 top-0 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-slideInLeft overflow-hidden">
            <div className="flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2">
                <h3 className="text-white font-semibold text-sm">Navegación</h3>
              </div>

              {/* Controles */}
              <div className="p-3 space-y-2">
                {/* Mi Ubicación */}
                <ControlButton
                  onClick={handleGetUserLocation}
                  icon={<BiCurrentLocation className={isLocating ? 'animate-spin' : ''} />}
                  label="Mi Ubicación"
                  color="green"
                  disabled={isLocating}
                />

                {/* Separador */}
                <div className="border-t border-gray-200 my-2" />

                {/* Zoom In */}
                <ControlButton
                  onClick={handleZoomIn}
                  icon={<BiPlus />}
                  label={`Acercar (${Math.round(currentZoom || 0)})`}
                  color="blue"
                  disabled={currentZoom >= 21}
                />

                {/* Zoom Out */}
                <ControlButton
                  onClick={handleZoomOut}
                  icon={<BiMinus />}
                  label="Alejar"
                  color="blue"
                  disabled={currentZoom <= 2}
                />

                {/* Separador */}
                <div className="border-t border-gray-200 my-2" />

                {/* Reset Vista País */}
                {selectedCountry && (
                  <ControlButton
                    onClick={handleResetCountryView}
                    icon={<BiRefresh />}
                    label="Vista inicial"
                    color="purple"
                  />
                )}

                {/* Reset Rotación */}
                <ControlButton
                  onClick={handleResetRotation}
                  icon={<BiNavigation className="transform rotate-0" />}
                  label="Resetear norte"
                  color="orange"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para cada botón de control
function ControlButton({ onClick, icon, label, color = 'blue', disabled = false }) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      text: 'text-blue-700',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50 hover:bg-green-100',
      text: 'text-green-700',
      icon: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-50 hover:bg-purple-100',
      text: 'text-purple-700',
      icon: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-50 hover:bg-orange-100',
      text: 'text-orange-700',
      icon: 'text-orange-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg
        transition-all duration-200
        ${disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
          : `${colors.bg} ${colors.text} hover:scale-105 hover:shadow-md active:scale-95`
        }
      `}
    >
      <div className={`text-xl ${disabled ? 'text-gray-400' : colors.icon}`}>
        {icon}
      </div>
      <span className="text-sm font-medium whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}
