'use client';

import { useState, useEffect } from 'react';
import { BiMapAlt, BiX, BiRightArrowAlt, BiShieldAlt2, BiCheckCircle, BiErrorCircle, BiInfoCircle } from 'react-icons/bi';

export default function SafeRoutePlanner({
  isOpen,
  onClose,
  map,
  places = [],
  selectedCountry,
  onRouteAnalyzed
}) {
  const [step, setStep] = useState('origin'); // 'origin', 'destination', 'analyzing', 'results'
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeSafety, setRouteSafety] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [mapClickListener, setMapClickListener] = useState(null);

  // Limpiar cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setStep('origin');
      setOrigin(null);
      setDestination(null);
      setRoute(null);
      setRouteSafety(null);

      // Limpiar ruta del mapa
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }

      // Remover listener del mapa
      if (mapClickListener) {
        window.google?.maps?.event?.removeListener(mapClickListener);
        setMapClickListener(null);
      }
    }
  }, [isOpen, directionsRenderer, mapClickListener]);

  // Configurar listener de clics en el mapa
  useEffect(() => {
    if (!isOpen || !map) return;

    // Remover listener anterior si existe
    if (mapClickListener) {
      window.google.maps.event.removeListener(mapClickListener);
    }

    // Agregar nuevo listener solo si estamos en modo selección
    if (step === 'origin' || step === 'destination') {
      const listener = map.addListener('click', (e) => {
        const location = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };

        if (step === 'origin') {
          setOrigin(location);
          setStep('destination');
        } else if (step === 'destination') {
          setDestination(location);
          setStep('analyzing');
          calculateRoute(origin, location);
        }
      });

      setMapClickListener(listener);
    }

    return () => {
      if (mapClickListener) {
        window.google.maps.event.removeListener(mapClickListener);
      }
    };
  }, [isOpen, map, step, origin]);

  // Calcular ruta usando Directions API
  const calculateRoute = async (origin, destination) => {
    if (!window.google || !map) return;

    const directionsService = new window.google.maps.DirectionsService();

    // Crear o reutilizar renderer
    let renderer = directionsRenderer;
    if (!renderer) {
      renderer = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4F46E5',
          strokeWeight: 5,
          strokeOpacity: 0.7
        }
      });
      setDirectionsRenderer(renderer);
    } else {
      renderer.setMap(map);
    }

    try {
      const result = await directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      setRoute(result);
      renderer.setDirections(result);

      // Analizar seguridad de la ruta
      analyzeRouteSafety(result);
    } catch (error) {
      console.error('Error calculando ruta:', error);
      setStep('origin');
      alert('No se pudo calcular la ruta. Intenta con otros puntos.');
    }
  };

  // Analizar si la ruta cruza zonas peligrosas
  const analyzeRouteSafety = (routeResult) => {
    if (!routeResult || !places.length) return;

    const routePath = routeResult.routes[0].overview_path;
    const crossedZones = [];
    const countryPlaces = places.filter(p => p.country_code === selectedCountry?.country_code);

    // Verificar cada punto de la ruta contra cada zona
    countryPlaces.forEach(place => {
      // Solo analizar zonas con polígonos o círculos
      if (place.polygon && place.polygon.length > 0) {
        const polygon = new window.google.maps.Polygon({
          paths: place.polygon
        });

        for (let point of routePath) {
          if (window.google.maps.geometry.poly.containsLocation(point, polygon)) {
            if (!crossedZones.find(z => z.id === place.id)) {
              crossedZones.push(place);
            }
            break;
          }
        }
      } else if (place.circle_radius && place.lat && place.lng) {
        const center = new window.google.maps.LatLng(place.lat, place.lng);

        for (let point of routePath) {
          const distance = window.google.maps.geometry.spherical.computeDistanceBetween(point, center);
          if (distance <= place.circle_radius) {
            if (!crossedZones.find(z => z.id === place.id)) {
              crossedZones.push(place);
            }
            break;
          }
        }
      }
    });

    // Calcular nivel de seguridad general de la ruta
    let safetyLevel = 'safe';
    let safetyScore = 100;

    if (crossedZones.length > 0) {
      // Encontrar el nivel de inseguridad más alto
      const maxDangerLevel = Math.max(...crossedZones.map(z => z.safety_level_id || 1));

      if (maxDangerLevel >= 4) {
        safetyLevel = 'danger';
        safetyScore = 30;
      } else if (maxDangerLevel >= 3) {
        safetyLevel = 'caution';
        safetyScore = 60;
      } else {
        safetyLevel = 'safe';
        safetyScore = 90;
      }
    }

    setRouteSafety({
      level: safetyLevel,
      score: safetyScore,
      crossedZones: crossedZones,
      distance: routeResult.routes[0].legs[0].distance.text,
      duration: routeResult.routes[0].legs[0].duration.text
    });

    setStep('results');
  };

  const reset = () => {
    setStep('origin');
    setOrigin(null);
    setDestination(null);
    setRoute(null);
    setRouteSafety(null);

    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <BiMapAlt className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Planificador de Rutas Seguras</h2>
              <p className="text-sm text-white/80">
                {selectedCountry ? selectedCountry.name : 'Analiza la seguridad de tus rutas'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <BiX className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Instrucciones */}
          {(step === 'origin' || step === 'destination') && (
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <BiInfoCircle className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    {step === 'origin' ? 'Paso 1: Selecciona el origen' : 'Paso 2: Selecciona el destino'}
                  </h3>
                  <p className="text-sm text-blue-700">
                    Haz clic en el mapa para {step === 'origin' ? 'marcar tu punto de partida' : 'marcar tu destino'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estado de selección */}
          <div className="space-y-3 mb-6">
            <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${origin ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${origin ? 'bg-green-500' : 'bg-gray-400'}`}>
                {origin ? <BiCheckCircle className="text-white text-xl" /> : <span className="text-white font-bold">A</span>}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">Origen</p>
                {origin ? (
                  <p className="text-xs text-gray-500">
                    {origin.lat.toFixed(6)}, {origin.lng.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">Pendiente de selección</p>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <BiRightArrowAlt className="text-3xl text-gray-400" />
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${destination ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${destination ? 'bg-green-500' : 'bg-gray-400'}`}>
                {destination ? <BiCheckCircle className="text-white text-xl" /> : <span className="text-white font-bold">B</span>}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">Destino</p>
                {destination ? (
                  <p className="text-xs text-gray-500">
                    {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">Pendiente de selección</p>
                )}
              </div>
            </div>
          </div>

          {/* Analizando */}
          {step === 'analyzing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Analizando seguridad de la ruta...</p>
            </div>
          )}

          {/* Resultados */}
          {step === 'results' && routeSafety && (
            <div className="space-y-4">
              {/* Safety Score */}
              <div className={`rounded-xl p-6 border-2 ${
                routeSafety.level === 'safe' ? 'bg-green-50 border-green-300' :
                routeSafety.level === 'caution' ? 'bg-yellow-50 border-yellow-300' :
                'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-start gap-4">
                  {routeSafety.level === 'safe' ? (
                    <BiCheckCircle className="text-4xl text-green-600 flex-shrink-0" />
                  ) : routeSafety.level === 'caution' ? (
                    <BiErrorCircle className="text-4xl text-yellow-600 flex-shrink-0" />
                  ) : (
                    <BiErrorCircle className="text-4xl text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold mb-2 ${
                      routeSafety.level === 'safe' ? 'text-green-900' :
                      routeSafety.level === 'caution' ? 'text-yellow-900' :
                      'text-red-900'
                    }`}>
                      {routeSafety.level === 'safe' ? '✓ Ruta Segura' :
                       routeSafety.level === 'caution' ? '⚠ Ruta con Precaución' :
                       '⚠ Ruta Peligrosa'}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      routeSafety.level === 'safe' ? 'text-green-800' :
                      routeSafety.level === 'caution' ? 'text-yellow-800' :
                      'text-red-800'
                    }`}>
                      {routeSafety.level === 'safe'
                        ? 'Esta ruta no cruza zonas de alto riesgo. Es segura para transitar.'
                        : routeSafety.level === 'caution'
                        ? 'Esta ruta cruza algunas zonas que requieren precaución. Mantente alerta.'
                        : 'Esta ruta cruza zonas peligrosas. Se recomienda buscar una alternativa.'}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className={`font-semibold ${
                          routeSafety.level === 'safe' ? 'text-green-900' :
                          routeSafety.level === 'caution' ? 'text-yellow-900' :
                          'text-red-900'
                        }`}>Distancia:</span>
                        <span className="ml-2 text-gray-700">{routeSafety.distance}</span>
                      </div>
                      <div>
                        <span className={`font-semibold ${
                          routeSafety.level === 'safe' ? 'text-green-900' :
                          routeSafety.level === 'caution' ? 'text-yellow-900' :
                          'text-red-900'
                        }`}>Duración:</span>
                        <span className="ml-2 text-gray-700">{routeSafety.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zonas cruzadas */}
              {routeSafety.crossedZones.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <BiShieldAlt2 className="text-indigo-600" />
                    Zonas que cruza esta ruta ({routeSafety.crossedZones.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {routeSafety.crossedZones.map((zone) => (
                      <div key={zone.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: zone.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{zone.address}</p>
                          <p className="text-xs text-gray-500">{zone.safety_level || 'Sin clasificar'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón para planificar otra ruta */}
              <button
                onClick={reset}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <BiMapAlt className="text-xl" />
                Planificar otra ruta
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Las rutas se calculan con Google Maps
          </p>
          {(step === 'origin' || step === 'destination') && (
            <button
              onClick={reset}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Reiniciar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
