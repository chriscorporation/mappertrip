'use client';

import { useState, useEffect, useRef } from 'react';
import { BiCurrentLocation, BiX, BiShield } from 'react-icons/bi';
import * as turf from '@turf/turf';

export default function UserLocationIndicator({ map, places, insecurityLevels, selectedCountry }) {
  const [isActive, setIsActive] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nearestZone, setNearestZone] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const watchIdRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, []);

  // Calculate nearest zone and safety status
  useEffect(() => {
    if (!userLocation || !places || places.length === 0) {
      setNearestZone(null);
      setSafetyStatus(null);
      return;
    }

    const userPoint = turf.point([userLocation.lng, userLocation.lat]);
    let closestZone = null;
    let minDistance = Infinity;
    let isInsideZone = false;

    // Filter active places
    const activePlaces = places.filter(p => p.active !== null);

    activePlaces.forEach(place => {
      // Check if user is inside a polygon zone
      if (place.polygon && place.polygon.length > 0) {
        try {
          const polygon = turf.polygon([place.polygon]);
          const inside = turf.booleanPointInPolygon(userPoint, polygon);

          if (inside) {
            closestZone = place;
            minDistance = 0;
            isInsideZone = true;
            return; // Exit loop early if inside
          }

          // Calculate distance to polygon boundary
          const distance = turf.pointToLineDistance(userPoint, turf.polygonToLine(polygon), { units: 'meters' });
          if (distance < minDistance) {
            minDistance = distance;
            closestZone = place;
          }
        } catch (error) {
          console.error('Error processing polygon:', error);
        }
      }

      // Check if user is inside a circle zone
      if (place.circle_radius && place.lat && place.lng) {
        const placePoint = turf.point([place.lng, place.lat]);
        const distance = turf.distance(userPoint, placePoint, { units: 'meters' });

        if (distance <= place.circle_radius) {
          closestZone = place;
          minDistance = 0;
          isInsideZone = true;
          return;
        }

        if (distance < minDistance) {
          minDistance = distance;
          closestZone = place;
        }
      }
    });

    setNearestZone(closestZone);

    // Determine safety status
    if (closestZone) {
      const level = insecurityLevels?.find(l => l.id === closestZone.safety_level_id);
      setSafetyStatus({
        level,
        distance: Math.round(minDistance),
        isInside: isInsideZone,
        zoneName: closestZone.address
      });
    } else {
      setSafetyStatus({
        level: null,
        distance: null,
        isInside: false,
        zoneName: null
      });
    }
  }, [userLocation, places, insecurityLevels]);

  const handleActivate = () => {
    if (isActive) {
      // Deactivate
      setIsActive(false);
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      setUserLocation(null);
      setLocationError(null);
      setNearestZone(null);
      setSafetyStatus(null);
    } else {
      // Activate
      if (!navigator.geolocation) {
        setLocationError('La geolocalización no está disponible en tu navegador');
        return;
      }

      setIsLoading(true);
      setLocationError(null);

      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setIsActive(true);
          setIsLoading(false);

          // Center map on user location
          if (map) {
            map.panTo(location);
            map.setZoom(15);
          }

          // Watch for position changes
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              setUserLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              });
            },
            (error) => {
              console.error('Error watching position:', error);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 10000,
              timeout: 5000
            }
          );
        },
        (error) => {
          setIsLoading(false);
          let errorMessage = 'No se pudo obtener tu ubicación';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado';
              break;
          }

          setLocationError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };

  // Render marker and circle on map
  useEffect(() => {
    if (!map || !userLocation || !isActive) return;

    // Remove existing marker and circle
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    // Create user location marker
    const marker = new window.google.maps.Marker({
      position: userLocation,
      map: map,
      title: 'Tu ubicación',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      zIndex: 10000
    });

    // Create 500m radius circle
    const circle = new window.google.maps.Circle({
      strokeColor: safetyStatus?.level ? safetyStatus.level.color : '#4285F4',
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: safetyStatus?.level ? safetyStatus.level.color : '#4285F4',
      fillOpacity: 0.1,
      map: map,
      center: userLocation,
      radius: 500, // 500 meters
      zIndex: 9999
    });

    markerRef.current = marker;
    circleRef.current = circle;
  }, [map, userLocation, isActive, safetyStatus]);

  // Update circle color when safety status changes
  useEffect(() => {
    if (circleRef.current && safetyStatus?.level) {
      circleRef.current.setOptions({
        strokeColor: safetyStatus.level.color,
        fillColor: safetyStatus.level.color,
      });
    }
  }, [safetyStatus]);

  const getSafetyIcon = () => {
    if (!safetyStatus?.level) return '🗺️';

    // Map safety levels to icons
    const safetyIcons = {
      1: '✅', // Safe
      2: '🟢', // Medium-Safe
      3: '🟡', // Regular
      4: '🟠', // Caution
      5: '🔴', // Unsafe
    };

    return safetyIcons[safetyStatus.level.id] || '🗺️';
  };

  return (
    <div className="fixed bottom-24 right-6 z-[1001] flex flex-col items-end gap-2">
      {/* Status Panel - Only show when active */}
      {isActive && safetyStatus && (
        <div
          className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-xs animate-fadeIn"
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getSafetyIcon()}</span>
              <div>
                <h3 className="font-semibold text-sm text-gray-800">
                  {safetyStatus.isInside ? 'Estás en zona' : 'Zona más cercana'}
                </h3>
                {safetyStatus.level && (
                  <p className="text-xs font-medium" style={{ color: safetyStatus.level.color }}>
                    {safetyStatus.level.label}
                  </p>
                )}
              </div>
            </div>
          </div>

          {safetyStatus.zoneName && (
            <div className="text-xs text-gray-600 mb-2 line-clamp-2">
              {safetyStatus.zoneName}
            </div>
          )}

          {!safetyStatus.isInside && safetyStatus.distance !== null && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <BiShield className="text-sm" />
              <span>A {safetyStatus.distance}m de distancia</span>
            </div>
          )}

          {!safetyStatus.level && (
            <p className="text-xs text-gray-500">
              No hay zonas validadas cerca. Radio de búsqueda: 500m
            </p>
          )}
        </div>
      )}

      {/* Error message */}
      {locationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-3 max-w-xs animate-fadeIn">
          <p className="text-xs text-red-700">{locationError}</p>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleActivate}
        disabled={isLoading}
        className={`
          group relative
          ${isActive
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-white hover:bg-gray-50'
          }
          rounded-full shadow-2xl p-4
          transition-all duration-300 hover:scale-105
          border-2 ${isActive ? 'border-blue-600' : 'border-gray-200'}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label={isActive ? 'Desactivar ubicación' : 'Activar ubicación'}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-6 w-6 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : isActive ? (
          <BiX className="h-6 w-6 text-white" />
        ) : (
          <BiCurrentLocation
            className={`h-6 w-6 ${isActive ? 'text-white' : 'text-blue-600'}`}
          />
        )}

        {/* Tooltip */}
        {!isActive && !isLoading && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
              Mi ubicación
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="border-8 border-transparent border-l-gray-900" />
              </div>
            </div>
          </div>
        )}
      </button>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
