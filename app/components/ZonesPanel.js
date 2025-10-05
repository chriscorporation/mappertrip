'use client';

import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BiDollar, BiShield, BiMapAlt, BiInfoCircle, BiMapPin } from 'react-icons/bi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FiLayers, FiCheck } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../store/toastStore';
import { useComparisonStore } from '../store/comparisonStore';
import SkeletonLoader from './SkeletonLoader';

// Componente para card de comparación
function ComparisonCard({ place, index, onDataLoaded, isRecommended, recommendationReason }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/api/perplexity-notes?zone_id=${place.id}`);
        const perplexityData = await response.json();
        setData(perplexityData);
        // Notificar al padre que se cargaron los datos
        if (onDataLoaded) {
          onDataLoaded(place.id, perplexityData);
        }
      } catch (error) {
        console.error('Error loading comparison data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [place.id, onDataLoaded]);

  const getColorClasses = (color) => {
    const colorMap = {
      '#22c55e': { bg: 'from-green-500 to-emerald-500', text: 'text-green-700', badge: 'bg-green-100' },
      '#3b82f6': { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-700', badge: 'bg-blue-100' },
      '#f97316': { bg: 'from-orange-500 to-amber-500', text: 'text-orange-700', badge: 'bg-orange-100' },
      '#eab308': { bg: 'from-yellow-500 to-amber-400', text: 'text-yellow-700', badge: 'bg-yellow-100' },
      '#dc2626': { bg: 'from-red-500 to-rose-500', text: 'text-red-700', badge: 'bg-red-100' },
    };
    return colorMap[color] || colorMap['#22c55e'];
  };

  const colorClasses = getColorClasses(place.color);
  const animationDelay = `${index * 0.1}s`;

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-[fadeIn_0.4s_ease-out] relative ${
        isRecommended ? 'border-4 border-yellow-400 ring-4 ring-yellow-200' : 'border-2 border-gray-200'
      }`}
      style={{ animationDelay }}
    >
      {/* Badge de recomendación */}
      {isRecommended && (
        <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
          <HiOutlineSparkles className="text-lg" />
          <span className="font-bold text-sm">Recomendada</span>
        </div>
      )}
      {/* Header con gradiente según nivel de seguridad */}
      <div className={`bg-gradient-to-r ${colorClasses.bg} text-white p-4`}>
        <h3 className="font-bold text-lg mb-1">{place.address}</h3>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Lat: {place.lat?.toFixed(4)}, Lng: {place.lng?.toFixed(4)}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-3 py-2">
            {/* Security badge skeleton */}
            <div className="bg-gray-100 rounded-lg p-3 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/3 animate-shimmer"></div>
              <div className="h-6 bg-gray-300 rounded w-2/3 animate-shimmer"></div>
            </div>

            {/* Rent card skeleton */}
            <div className="bg-gray-100 rounded-lg p-3 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/3 animate-shimmer"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2 animate-shimmer"></div>
            </div>

            {/* Tourism card skeleton */}
            <div className="bg-gray-100 rounded-lg p-3 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4 animate-shimmer"></div>
              <div className="h-4 bg-gray-300 rounded w-full animate-shimmer"></div>
              <div className="h-4 bg-gray-300 rounded w-full animate-shimmer"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 animate-shimmer"></div>
            </div>

            {/* Button skeleton */}
            <div className="h-10 bg-gray-300 rounded-lg w-full animate-shimmer"></div>
          </div>
        ) : (
          <>
            {/* Nivel de Seguridad */}
            <div className={`${colorClasses.badge} rounded-lg p-3`}>
              <div className="flex items-center gap-2 mb-2">
                <BiShield className={`text-lg ${colorClasses.text}`} />
                <span className="text-xs font-semibold text-gray-600">Seguridad</span>
              </div>
              <p className={`text-sm font-bold ${colorClasses.text}`}>
                {data?.secure || 'No disponible'}
              </p>
            </div>

            {/* Costo de Renta */}
            {data?.rent && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BiDollar className="text-lg text-emerald-700" />
                  <span className="text-xs font-semibold text-gray-600">Renta Mensual</span>
                </div>
                <p className="text-2xl font-extrabold text-emerald-700">
                  ${Math.round(data.rent)}
                  <span className="text-sm font-medium text-emerald-600 ml-1">USD</span>
                </p>
              </div>
            )}

            {/* Turismo (versión resumida) */}
            {data?.tourism && (
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BiMapAlt className="text-lg text-purple-700" />
                  <span className="text-xs font-semibold text-gray-600">Turismo</span>
                </div>
                <p className="text-xs text-gray-700 line-clamp-3">
                  {data.tourism}
                </p>
              </div>
            )}

            {/* Indicador de radio circular si aplica */}
            {place.circle_radius && (
              <div className="bg-purple-50 rounded-lg p-2 flex items-center gap-2">
                <span className="text-lg">⭕</span>
                <span className="text-xs font-medium text-purple-700">
                  Radio: {(place.circle_radius / 1000).toFixed(1)}km
                </span>
              </div>
            )}

            {/* Razón de recomendación */}
            {isRecommended && recommendationReason && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <HiOutlineSparkles className="text-lg text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-yellow-900 mb-1">¿Por qué esta zona?</p>
                    <p className="text-xs text-yellow-800">{recommendationReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón para ver más en Google Maps */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all text-xs font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Ver en Google Maps
            </a>
          </>
        )}
      </div>
    </div>
  );
}

// Componente de recomendaciones inteligentes
function SmartRecommendations({ placesData, selectedPlaces }) {
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    // Solo generar recomendación cuando tengamos datos de todas las zonas
    const allDataLoaded = selectedPlaces.every(place =>
      placesData[place.id] !== undefined
    );

    if (!allDataLoaded || selectedPlaces.length === 0) {
      setRecommendation(null);
      return;
    }

    // Analizar y generar recomendaciones
    const analysis = selectedPlaces.map(place => {
      const data = placesData[place.id];

      // Calcular score de seguridad (0-100)
      let securityScore = 50;
      const secureText = data?.secure?.toLowerCase() || '';
      if (secureText.includes('buena') || secureText.includes('alta') || secureText.includes('segur') || secureText.includes('aceptable')) {
        securityScore = 85;
      } else if (secureText.includes('media') || secureText.includes('moderada')) {
        securityScore = 60;
      } else if (secureText.includes('baja') || secureText.includes('peligro') || secureText.includes('insegur')) {
        securityScore = 25;
      }

      // Calcular score de precio (más barato = mejor)
      const rentValue = data?.rent || 1000;
      const priceScore = Math.max(0, 100 - (rentValue / 20)); // Normalizar

      // Calcular score de turismo
      const tourismScore = data?.tourism ? 70 : 30;

      return {
        place,
        data,
        securityScore,
        priceScore,
        rentValue,
        tourismScore,
        overallScore: (securityScore * 0.5) + (priceScore * 0.3) + (tourismScore * 0.2)
      };
    });

    // Encontrar la mejor opción según diferentes criterios
    const bestOverall = analysis.reduce((best, current) =>
      current.overallScore > best.overallScore ? current : best
    );

    const bestSecurity = analysis.reduce((best, current) =>
      current.securityScore > best.securityScore ? current : best
    );

    const bestPrice = analysis.reduce((best, current) =>
      current.rentValue < best.rentValue ? current : best
    );

    setRecommendation({
      bestOverall,
      bestSecurity,
      bestPrice,
      analysis
    });
  }, [placesData, selectedPlaces]);

  if (!recommendation) return null;

  return (
    <div className="mb-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-lg animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
          <HiOutlineSparkles className="text-2xl text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Recomendaciones Inteligentes</h3>
          <p className="text-sm text-gray-600">Análisis basado en seguridad, precio y atractivos turísticos</p>
        </div>
      </div>

      {/* Grid de recomendaciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mejor Opción General */}
        <div className="bg-white rounded-xl p-4 border-2 border-indigo-300 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏆</span>
            <h4 className="font-bold text-gray-800 text-sm">Mejor Opción General</h4>
          </div>
          <p className="text-xs text-gray-700 font-semibold mb-2 line-clamp-2">
            {recommendation.bestOverall.place.address}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Seguridad:</span>
              <span className="font-bold text-green-700">{recommendation.bestOverall.securityScore}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Precio:</span>
              <span className="font-bold text-emerald-700">${Math.round(recommendation.bestOverall.rentValue)}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Puntuación:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${recommendation.bestOverall.overallScore}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-indigo-700">{Math.round(recommendation.bestOverall.overallScore)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Más Segura */}
        <div className="bg-white rounded-xl p-4 border-2 border-green-300 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🛡️</span>
            <h4 className="font-bold text-gray-800 text-sm">Más Segura</h4>
          </div>
          <p className="text-xs text-gray-700 font-semibold mb-2 line-clamp-2">
            {recommendation.bestSecurity.place.address}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Nivel:</span>
              <span className="font-bold text-green-700">{recommendation.bestSecurity.data?.secure || 'N/A'}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Seguridad:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${recommendation.bestSecurity.securityScore}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-green-700">{recommendation.bestSecurity.securityScore}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 italic">Prioridad máxima en seguridad para tu estadía</p>
        </div>

        {/* Más Económica */}
        <div className="bg-white rounded-xl p-4 border-2 border-emerald-300 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💰</span>
            <h4 className="font-bold text-gray-800 text-sm">Más Económica</h4>
          </div>
          <p className="text-xs text-gray-700 font-semibold mb-2 line-clamp-2">
            {recommendation.bestPrice.place.address}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Renta mensual:</span>
              <span className="font-bold text-emerald-700 text-lg">${Math.round(recommendation.bestPrice.rentValue)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Seguridad:</span>
              <span className={`font-bold ${
                recommendation.bestPrice.securityScore > 70 ? 'text-green-600' :
                recommendation.bestPrice.securityScore > 50 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {recommendation.bestPrice.data?.secure || 'N/A'}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 italic">Mejor relación calidad-precio</p>
        </div>
      </div>

      {/* Insight adicional */}
      <div className="mt-5 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-200">
        <div className="flex items-start gap-3">
          <BiInfoCircle className="text-2xl text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-sm text-gray-800 mb-1">💡 Consejo para Viajeros</h5>
            <p className="text-xs text-gray-700">
              {recommendation.bestOverall.place.id === recommendation.bestSecurity.place.id ? (
                <>La zona <strong>{recommendation.bestOverall.place.address.split(',')[0]}</strong> destaca tanto en seguridad como en valor general. Es una excelente elección balanceada para tu estadía.</>
              ) : (
                <>Si tu prioridad es la <strong>seguridad</strong>, elige <strong>{recommendation.bestSecurity.place.address.split(',')[0]}</strong>. Si buscas <strong>ahorrar</strong>, considera <strong>{recommendation.bestPrice.place.address.split(',')[0]}</strong>. Para el <strong>mejor balance</strong>, opta por <strong>{recommendation.bestOverall.place.address.split(',')[0]}</strong>.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ZonesPanel({
  selectedCountry,
  places,
  onStartDrawing,
  onDeletePlace,
  onColorChange,
  onTuristicChange,
  onGoToPlace,
  placeToDelete,
  highlightedPlace,
  onAddPlace,
  onMapClickModeChange,
  pendingCircle,
  setPendingCircle,
  circleRadius,
  setCircleRadius,
  editingCircleId,
  setEditingCircleId,
  editingRadius,
  setEditingRadius,
  onUpdatePlace
}) {
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
  const { addZoneToComparison, isZoneInComparison, comparedZones } = useComparisonStore();
  const isAdminMode = isAuthenticated;
  const [address, setAddress] = useState('');
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const [notes, setNotes] = useState({});
  const [newNote, setNewNote] = useState({});
  const [perplexityData, setPerplexityData] = useState(null);
  const [selectedZoneAddress, setSelectedZoneAddress] = useState('');
  const [showPerplexityPanel, setShowPerplexityPanel] = useState(false);
  const [loadingPerplexity, setLoadingPerplexity] = useState(false);
  const [loadingAI, setLoadingAI] = useState({});
  const [duplicateError, setDuplicateError] = useState('');
  const [mapClickMode, setMapClickMode] = useState(false);
  const [circleMode, setCircleMode] = useState(false);
  const [pendingPlace, setPendingPlace] = useState(null);
  const [pendingPlaceName, setPendingPlaceName] = useState('');
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [streetViewPlace, setStreetViewPlace] = useState(null);
  const [streetViewLoading, setStreetViewLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [comparisonData, setComparisonData] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const cardRefs = useRef({});
  const perplexityPanelRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const previousPlacesCountRef = useRef(places.length);
  const pollingIntervalRef = useRef(null);
  const streetViewPanoramaRef = useRef(null);
  const streetViewDivRef = useRef(null);

  // Cargar favoritos desde localStorage al montar el componente
  useEffect(() => {
    const savedFavorites = localStorage.getItem('maptrip_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Guardar favoritos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('maptrip_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorito
  const toggleFavorite = (placeId) => {
    setFavorites(prev => {
      const isRemoving = prev.includes(placeId);

      if (isRemoving) {
        toast.info('Zona eliminada de favoritos');
        return prev.filter(id => id !== placeId);
      } else {
        toast.success('Zona añadida a favoritos');
        return [...prev, placeId];
      }
    });
  };

  // Detectar cuando se agrega una nueva zona y hacer scroll + seleccionar
  useEffect(() => {
    const countryPlaces = places.filter(p => p.country_code === selectedCountry?.country_code);
    const previousCount = previousPlacesCountRef.current;

    // Si se agregó una nueva zona
    if (countryPlaces.length > previousCount) {
      // Hacer scroll al inicio
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      // Seleccionar la primera zona (más reciente)
      if (countryPlaces.length > 0) {
        const newestPlace = countryPlaces[0];
        setTimeout(() => {
          onGoToPlace(newestPlace);
        }, 100);
      }
    }

    previousPlacesCountRef.current = countryPlaces.length;
  }, [places, selectedCountry, onGoToPlace]);

  // Initialize Street View when streetViewPlace changes
  useEffect(() => {
    if (!streetViewPlace || !window.google?.maps) return;

    const initStreetView = () => {
      setStreetViewLoading(true);

      if (!streetViewDivRef.current) return;

      const streetViewService = new window.google.maps.StreetViewService();
      const location = { lat: streetViewPlace.lat, lng: streetViewPlace.lng };

      // Check if Street View is available at this location
      streetViewService.getPanorama(
        { location, radius: 50 },
        (data, status) => {
          setStreetViewLoading(false);

          if (status === 'OK') {
            // Create or update panorama
            if (!streetViewPanoramaRef.current) {
              streetViewPanoramaRef.current = new window.google.maps.StreetViewPanorama(
                streetViewDivRef.current,
                {
                  position: location,
                  pov: { heading: 0, pitch: 0 },
                  zoom: 1,
                  addressControl: false,
                  linksControl: true,
                  panControl: true,
                  enableCloseButton: false,
                  fullscreenControl: true,
                  motionTracking: false,
                  motionTrackingControl: false,
                }
              );
            } else {
              streetViewPanoramaRef.current.setPosition(location);
              streetViewPanoramaRef.current.setPov({ heading: 0, pitch: 0 });
            }
          }
        }
      );
    };

    // Small delay to ensure the div is mounted
    const timeoutId = setTimeout(initStreetView, 100);
    return () => clearTimeout(timeoutId);
  }, [streetViewPlace]);

  // Cleanup polling interval on unmount or panel close
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showPerplexityPanel && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [showPerplexityPanel]);

  // Notificar cuando cambia el modo de clic del mapa
  useEffect(() => {
    if (onMapClickModeChange) {
      const isActive = mapClickMode || circleMode;
      onMapClickModeChange(isActive, (lat, lng) => {
        if (circleMode) {
          setPendingCircle({ lat, lng });
        } else if (mapClickMode) {
          setPendingPlace({ lat, lng });
        }
      });
    }
  }, [mapClickMode, circleMode]);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        setTimeout(initAutocomplete, 100);
        return;
      }

      if (!autocompleteRef.current && inputRef.current && selectedCountry) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            componentRestrictions: { country: selectedCountry.country_code.toLowerCase() }
          }
        );

        const listener = autocompleteRef.current.addListener('place_changed', async () => {
          const place = autocompleteRef.current.getPlace();

          if (place.geometry) {
            // Verificar si ya existe una zona con la misma dirección en el estado local
            const countryPlaces = places.filter(p => p.country_code === selectedCountry.country_code);
            const isDuplicate = countryPlaces.some(p =>
              p.address.toLowerCase() === place.formatted_address.toLowerCase() ||
              p.placeId === place.place_id
            );

            if (isDuplicate) {
              setDuplicateError('Esta zona ya existe');
              setTimeout(() => setDuplicateError(''), 3000);
              setAddress('');
              return;
            }

            const placeData = {
              id: Date.now(),
              address: place.formatted_address,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              placeId: place.place_id,
              polygon: null,
              isDrawing: false,
              color: '#22c55e',
              country_code: selectedCountry.country_code,
            };

            onAddPlace(placeData);
            setAddress('');
            setDuplicateError('');
          }
        });

        return () => {
          if (listener) {
            window.google.maps.event.removeListener(listener);
          }
        };
      }
    };

    initAutocomplete();
  }, [selectedCountry, onAddPlace]);

  // Cargar notas bajo demanda
  const loadNotesForPlace = async (placeId) => {
    if (notes[placeId]) return; // Ya están cargadas

    try {
      const response = await fetch(`/api/notes?related_type=zone&related_id=${placeId}`);
      const placeNotes = await response.json();
      setNotes(prev => ({ ...prev, [placeId]: placeNotes }));
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Scroll a la card cuando se resalta
  useEffect(() => {
    if (highlightedPlace && cardRefs.current[highlightedPlace]) {
      cardRefs.current[highlightedPlace].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [highlightedPlace]);

  const handleAddNote = async (placeId) => {
    const noteText = newNote[placeId]?.trim();
    if (!noteText) return;

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_text: noteText,
          related_type: 'zone',
          related_id: placeId
        })
      });

      const savedNote = await response.json();
      setNotes(prev => ({
        ...prev,
        [placeId]: [...(prev[placeId] || []), savedNote]
      }));
      setNewNote(prev => ({ ...prev, [placeId]: '' }));
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleDeleteNote = async (noteId, placeId) => {
    try {
      await fetch(`/api/notes?id=${noteId}`, { method: 'DELETE' });
      setNotes(prev => ({
        ...prev,
        [placeId]: prev[placeId].filter(note => note.id !== noteId)
      }));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleUpdateRadius = async (placeId, newRadius) => {
    try {
      await fetch('/api/places', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: placeId,
          circle_radius: newRadius
        })
      });

      // Actualizar el estado del padre
      if (onUpdatePlace) {
        onUpdatePlace(placeId, { circle_radius: newRadius });
      }

      setEditingCircleId(null);
    } catch (error) {
      console.error('Error updating radius:', error);
    }
  };

  const handleUpdateTitle = async (placeId, newTitle) => {
    if (!newTitle.trim()) {
      setEditingTitleId(null);
      return;
    }

    try {
      await fetch('/api/places', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: placeId,
          address: newTitle.trim()
        })
      });

      // Actualizar el estado del padre
      if (onUpdatePlace) {
        onUpdatePlace(placeId, { address: newTitle.trim() });
      }

      setEditingTitleId(null);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  if (!selectedCountry) {
    return (
      <div className="w-80 bg-white border-r border-gray-300 p-4">
        <h2 className="text-xl font-bold mb-4">Zones</h2>
        <p className="text-gray-500 text-sm">Selecciona un país primero</p>
      </div>
    );
  }

  const countryPlaces = places.filter(p => p.country_code === selectedCountry.country_code);
  const displayedPlaces = showOnlyFavorites
    ? countryPlaces.filter(p => favorites.includes(p.id))
    : countryPlaces;
  const favoritesCount = countryPlaces.filter(p => favorites.includes(p.id)).length;

  const handleToggleCompareSelection = (place) => {
    setSelectedForCompare(prev => {
      const exists = prev.find(p => p.id === place.id);
      if (exists) {
        return prev.filter(p => p.id !== place.id);
      } else if (prev.length < 3) {
        return [...prev, place];
      }
      return prev;
    });
  };

  const handleCompare = async () => {
    // Cargar datos de Perplexity para todas las zonas seleccionadas
    const compareDataPromises = selectedForCompare.map(async (place) => {
      try {
        const response = await fetch(`/api/perplexity-notes?zone_id=${place.id}`);
        const data = await response.json();
        return { place, data };
      } catch (error) {
        console.error('Error loading data for comparison:', error);
        return { place, data: null };
      }
    });

    await Promise.all(compareDataPromises);
    setShowCompareModal(true);
  };

  return (
    <div className="flex relative">
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col" data-tour-id="zones-panel">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Zones</h2>
        <p className="text-xs text-gray-500 mt-1">{selectedCountry.name}</p>
      </div>

      {isAdminMode && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Buscar zona o barrio..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={() => {
                setMapClickMode(!mapClickMode);
                if (circleMode) setCircleMode(false);
              }}
              className={`p-2 rounded-lg border ${mapClickMode ? 'bg-blue-100 border-blue-500' : 'border-gray-300 hover:bg-gray-100'} cursor-pointer`}
              title="Seleccionar ubicación en el mapa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => {
                setCircleMode(!circleMode);
                if (mapClickMode) setMapClickMode(false);
              }}
              className={`p-2 rounded-lg border ${circleMode ? 'bg-purple-100 border-purple-500' : 'border-gray-300 hover:bg-gray-100'} cursor-pointer`}
              title="Crear zona circular"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
          </div>
          {duplicateError && (
            <p className="text-xs text-red-600 mt-1">{duplicateError}</p>
          )}
          {mapClickMode && (
            <p className="text-xs text-blue-600 mt-1">Haz clic en el mapa para seleccionar una ubicación</p>
          )}
          {circleMode && (
            <p className="text-xs text-purple-600 mt-1">Haz clic en el mapa para crear una zona circular</p>
          )}
        </div>
      )}

      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 space-y-2">
        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={hoverEnabled}
            onChange={(e) => setHoverEnabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span>Activar roll over</span>
        </label>

        {/* Filtro de favoritos */}
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
            showOnlyFavorites
              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-md hover:shadow-lg'
              : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{showOnlyFavorites ? 'Ver Todas' : 'Solo Favoritos'}</span>
          </div>
          {favoritesCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              showOnlyFavorites ? 'bg-white/30' : 'bg-amber-100 text-amber-800'
            }`}>
              {favoritesCount}
            </span>
          )}
        </button>

        {countryPlaces.length >= 2 && (
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              if (compareMode) {
                setSelectedForCompare([]);
              }
            }}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
              compareMode
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:shadow-lg'
                : 'bg-white border border-purple-300 text-purple-700 hover:bg-purple-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            {compareMode ? 'Cancelar Comparación' : 'Comparar Zonas'}
          </button>
        )}
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {pendingPlace && (
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-400">
            <input
              type="text"
              value={pendingPlaceName}
              onChange={(e) => setPendingPlaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pendingPlaceName.trim()) {
                  const placeData = {
                    id: Date.now(),
                    address: pendingPlaceName.trim(),
                    lat: pendingPlace.lat,
                    lng: pendingPlace.lng,
                    placeId: null,
                    polygon: null,
                    isDrawing: false,
                    color: '#22c55e',
                    country_code: selectedCountry.country_code,
                  };
                  onAddPlace(placeData);
                  setPendingPlace(null);
                  setPendingPlaceName('');
                  setMapClickMode(false);
                }
              }}
              placeholder="Nombre de la zona..."
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
            <p className="text-xs text-gray-600 mt-2">
              Lat: {pendingPlace.lat.toFixed(6)}, Lng: {pendingPlace.lng.toFixed(6)}
            </p>
          </div>
        )}
        {pendingCircle && (
          <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-400">
            <input
              type="text"
              value={pendingPlaceName}
              onChange={(e) => setPendingPlaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pendingPlaceName.trim()) {
                  const placeData = {
                    id: Date.now(),
                    address: pendingPlaceName.trim(),
                    lat: pendingCircle.lat,
                    lng: pendingCircle.lng,
                    placeId: null,
                    polygon: null,
                    circle_radius: circleRadius,
                    isDrawing: false,
                    color: '#8b5cf6',
                    country_code: selectedCountry.country_code,
                  };
                  onAddPlace(placeData);
                  setPendingCircle(null);
                  setPendingPlaceName('');
                  setCircleMode(false);
                }
              }}
              placeholder="Título de la zona circular..."
              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-3"
              autoFocus
            />
            <label className="block text-xs text-gray-700 mb-1">
              Radio: {(circleRadius / 1000).toFixed(1)}km
            </label>
            <input
              type="range"
              min="1000"
              max="3000"
              step="100"
              value={circleRadius}
              onChange={(e) => setCircleRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-600 mt-2">
              Lat: {pendingCircle.lat.toFixed(6)}, Lng: {pendingCircle.lng.toFixed(6)}
            </p>
          </div>
        )}
        {displayedPlaces.length === 0 && !pendingPlace ? (
          <p className="text-gray-500 text-sm text-center mt-4">
            {showOnlyFavorites ? 'No hay zonas favoritas' : `No hay zonas creadas para ${selectedCountry.name}`}
          </p>
        ) : (
          displayedPlaces.map(place => (
            <div
              key={place.id}
              ref={el => cardRefs.current[place.id] = el}
              className={`p-3 bg-gradient-to-br from-white to-gray-50 rounded-xl transition-all duration-300 ease-out transform relative ${
                hoverEnabled ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:from-blue-50 hover:to-cyan-50' : ''
              } ${
                highlightedPlace === place.id
                  ? 'border-2 border-blue-400 shadow-md scale-[1.02]'
                  : selectedForCompare.find(p => p.id === place.id)
                  ? 'border-2 border-purple-400 shadow-md'
                  : 'border border-gray-200'
              }`}
              onMouseEnter={() => hoverEnabled && onGoToPlace(place)}
            >
              {/* Botón de favorito */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(place.id);
                }}
                className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${
                  favorites.includes(place.id)
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 shadow-lg scale-110 hover:scale-125'
                    : 'bg-white/80 backdrop-blur-sm border-2 border-gray-300 hover:border-amber-400 hover:scale-110'
                }`}
                title={favorites.includes(place.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-colors ${
                    favorites.includes(place.id) ? 'text-white' : 'text-gray-400'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>

              {/* Botón de agregar a comparación rápida */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (comparedZones.length >= 3 && !isZoneInComparison(place.id)) {
                    toast.info('Máximo 3 zonas para comparar');
                    return;
                  }
                  addZoneToComparison(place);
                  if (!isZoneInComparison(place.id)) {
                    toast.success(`${place.address} agregada al comparador`);
                  }
                }}
                className={`absolute top-2 right-12 z-10 w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isZoneInComparison(place.id)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg scale-110 hover:scale-125'
                    : 'bg-white/80 backdrop-blur-sm border-2 border-gray-300 hover:border-blue-400 hover:scale-110'
                }`}
                title={isZoneInComparison(place.id) ? 'Ya en comparador' : 'Agregar al comparador'}
              >
                {isZoneInComparison(place.id) ? (
                  <FiCheck className="text-white text-lg" />
                ) : (
                  <FiLayers className="text-gray-400 text-lg" />
                )}
              </button>

              {compareMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCompareSelection(place);
                  }}
                  className={`absolute top-2 right-12 z-10 w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    selectedForCompare.find(p => p.id === place.id)
                      ? 'bg-purple-500 border-purple-600 shadow-lg scale-110'
                      : 'bg-white border-gray-300 hover:border-purple-400'
                  }`}
                  title={selectedForCompare.find(p => p.id === place.id) ? 'Deseleccionar' : 'Seleccionar para comparar'}
                >
                  {selectedForCompare.find(p => p.id === place.id) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )}
              <div className="mb-2">
                <div className="flex items-start justify-between mb-2">
                  {editingTitleId === place.id ? (
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateTitle(place.id, tempTitle);
                        } else if (e.key === 'Escape') {
                          setEditingTitleId(null);
                        }
                      }}
                      onBlur={() => handleUpdateTitle(place.id, tempTitle)}
                      className="flex-1 px-2 py-1 text-sm font-semibold border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <h3
                      className="font-semibold text-sm mb-1 cursor-pointer hover:text-blue-600 transition-all duration-200 flex-1 hover:translate-x-1"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingTitleId(place.id);
                        setTempTitle(place.address);
                      }}
                      onClick={async () => {
                    // Limpiar intervalo previo si existe
                    if (pollingIntervalRef.current) {
                      clearInterval(pollingIntervalRef.current);
                      pollingIntervalRef.current = null;
                    }

                    // Posicionar en el mapa
                    onGoToPlace(place);

                    // Cargar datos de Perplexity con spinner
                    setLoadingPerplexity(true);
                    setShowPerplexityPanel(true);
                    setSelectedZoneAddress(place.address);
                    setPerplexityData(null);

                    try {
                      // Cargar notas primero
                      await loadNotesForPlace(place.id);

                      // Función para cargar datos de Perplexity
                      const loadPerplexityData = async () => {
                        const response = await fetch(`/api/perplexity-notes?zone_id=${place.id}`);
                        const data = await response.json();

                        // Verificar si hay datos disponibles
                        const hasData = data && (data.notes || data.rent || data.tourism || data.secure || data.places);

                        if (hasData) {
                          setPerplexityData(data);
                          setLoadingPerplexity(false);

                          // Limpiar el intervalo
                          if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                            pollingIntervalRef.current = null;
                          }

                          // Scroll al inicio del panel
                          setTimeout(() => {
                            if (perplexityPanelRef.current) {
                              perplexityPanelRef.current.scrollTop = 0;
                            }
                          }, 0);
                        }

                        return hasData;
                      };

                      // Intentar cargar datos inmediatamente
                      const hasData = await loadPerplexityData();

                      // Si no hay datos, iniciar polling cada 5 segundos
                      if (!hasData) {
                        pollingIntervalRef.current = setInterval(async () => {
                          await loadPerplexityData();
                        }, 5000);
                      }
                    } catch (error) {
                      console.error('Error loading perplexity data:', error);
                      setLoadingPerplexity(false);
                    }
                  }}
                    >
                      {place.address}
                    </h3>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStreetViewPlace(streetViewPlace?.id === place.id ? null : place);
                      }}
                      className={`text-gray-400 hover:text-purple-600 transition-all duration-200 hover:scale-110 ${
                        streetViewPlace?.id === place.id ? 'text-purple-600 scale-110' : ''
                      }`}
                      title="Ver Street View"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        <circle cx="12" cy="9" r="1" fill="white"/>
                      </svg>
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver en Google Maps"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Street View Preview */}
                {streetViewPlace?.id === place.id && (
                  <div className="mt-3 rounded-lg overflow-hidden border-2 border-purple-300 shadow-lg animate-[fadeIn_0.3s_ease-out]">
                    {streetViewLoading ? (
                      <div className="h-48 bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                          <p className="text-sm text-purple-600 font-medium">Cargando Street View...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div
                          ref={streetViewDivRef}
                          className="h-48 w-full bg-gray-100"
                          style={{ minHeight: '192px' }}
                        ></div>
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-md">
                          <p className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            Vista de Calle
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStreetViewPlace(null);
                          }}
                          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-white transition-colors"
                          title="Cerrar Street View"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-3 py-2 border-t border-purple-200">
                      <p className="text-xs text-purple-700">
                        <span className="font-semibold">💡 Tip:</span> Usa los controles para explorar la zona visualmente
                      </p>
                    </div>
                  </div>
                )}

                {/* Favorite Badge - visible cuando está en favoritos */}
                {favorites.includes(place.id) && (
                  <div className="mb-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-2 border-amber-300 shadow-sm animate-[fadeIn_0.3s_ease-out]">
                      <span className="mr-1.5">⭐</span> Favorito
                    </span>
                  </div>
                )}

                {/* Safety Status Badge */}
                <div className="mb-2">
                  {place.color === '#22c55e' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="animate-pulse mr-1.5">🟢</span> Zona Segura
                    </span>
                  )}
                  {place.color === '#3b82f6' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="animate-pulse mr-1.5">🔵</span> Seguridad Media
                    </span>
                  )}
                  {place.color === '#f97316' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="animate-pulse mr-1.5">🟠</span> Seguridad Regular
                    </span>
                  )}
                  {place.color === '#eab308' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="animate-pulse mr-1.5">🟡</span> Precaución
                    </span>
                  )}
                  {place.color === '#dc2626' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                      <span className="animate-pulse mr-1.5">🔴</span> Zona Insegura
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Lat: {place.lat?.toFixed(6)}, Lng: {place.lng?.toFixed(6)}
                </p>

                {notes[place.id] && notes[place.id].length > 0 && (
                  <ul className="mt-2 text-xs text-gray-600 space-y-1">
                    {notes[place.id].map(note => (
                      <li key={note.id} className="flex items-start justify-between group">
                        <div className="flex items-start">
                          <span className="mr-1">•</span>
                          <span>{note.note_text}</span>
                        </div>
                        {isAdminMode && (
                          <button
                            onClick={() => handleDeleteNote(note.id, place.id)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 cursor-pointer"
                            title="Eliminar nota"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {isAdminMode && (
                  <input
                    type="text"
                    value={newNote[place.id] || ''}
                    onChange={(e) => setNewNote(prev => ({ ...prev, [place.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddNote(place.id);
                      }
                    }}
                    placeholder="Añadir nota..."
                    className="w-full mt-2 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                )}

                <div className="mt-2 flex gap-2 flex-col">
                  {place.polygon && !place.isDrawing && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200 w-fit shadow-sm hover:shadow transition-all duration-200">
                      <span className="mr-1">✓</span> Zona delimitada
                    </span>
                  )}
                  {place.isDrawing && (
                    <div className="w-full">
                      <p className="text-xs text-purple-600 mb-2">Editando polígono...</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onStartDrawing(null)}
                          className="flex-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            // Trigger save via Enter key simulation
                            const event = new KeyboardEvent('keydown', { key: 'Enter' });
                            document.dispatchEvent(event);
                          }}
                          className="flex-1 px-2 py-1 text-xs text-white bg-purple-600 rounded hover:bg-purple-700 cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  )}
                  {place.circle_radius && (
                    <>
                      {editingCircleId === place.id ? (
                        <div
                          className="w-full"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateRadius(place.id, editingRadius);
                            }
                          }}
                        >
                          <label className="block text-xs text-gray-700 mb-1">
                            Radio: {(editingRadius / 1000).toFixed(1)}km
                          </label>
                          <input
                            type="range"
                            min="1000"
                            max="3000"
                            step="100"
                            value={editingRadius}
                            onChange={(e) => setEditingRadius(parseInt(e.target.value))}
                            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => setEditingCircleId(null)}
                              className="flex-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleUpdateRadius(place.id, editingRadius)}
                              className="flex-1 px-2 py-1 text-xs text-white bg-purple-600 rounded hover:bg-purple-700 cursor-pointer"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200 w-fit shadow-sm hover:shadow transition-all duration-200">
                          <span className="mr-1">⭕</span> Radio: {(place.circle_radius / 1000).toFixed(1)}km
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              {isAdminMode && (
                <div className="flex justify-around items-center pt-2 border-t border-gray-200">
                  <select
                    value={place.color}
                    onChange={(e) => onColorChange(place.id, e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded cursor-pointer"
                    style={{ color: place.color }}
                  >
                    <option value="#22c55e" style={{ color: '#22c55e' }}>🟢 Seguro</option>
                    <option value="#3b82f6" style={{ color: '#3b82f6' }}>🔵 Medio</option>
                    <option value="#f97316" style={{ color: '#f97316' }}>🟠 Regular</option>
                    <option value="#eab308" style={{ color: '#eab308' }}>🟡 Precaución</option>
                    <option value="#dc2626" style={{ color: '#dc2626' }}>🔴 Inseguro</option>
                  </select>
                  {place.circle_radius ? (
                    <button
                      onClick={() => {
                        setEditingCircleId(editingCircleId === place.id ? null : place.id);
                        setEditingRadius(place.circle_radius);
                      }}
                      className={`p-2 rounded hover:bg-purple-100 text-purple-600 cursor-pointer ${editingCircleId === place.id ? 'bg-purple-100' : ''}`}
                      title="Editar radio"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartDrawing(place.id)}
                      className={`p-2 rounded hover:bg-gray-100 cursor-pointer ${place.isDrawing ? 'bg-blue-100' : ''}`}
                      title="Delimitar zona"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  )}
                  <label
                    className="flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer"
                    title="Lugar turístico"
                  >
                    <input
                      type="checkbox"
                      checked={place.is_turistic || false}
                      onChange={(e) => onTuristicChange(place.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  <button
                    onClick={async () => {
                      setLoadingAI(prev => ({ ...prev, [place.id]: true }));

                      setTimeout(() => {
                        setLoadingAI(prev => ({ ...prev, [place.id]: false }));
                      }, 10000);

                      try {
                        await fetch('/api/perplexity-populate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            zone_id: place.id
                          })
                        });
                      } catch (error) {
                        console.error('Error populating with AI:', error);
                      }
                    }}
                    className="p-2 rounded hover:bg-purple-100 text-purple-600 cursor-pointer"
                    title="Regenerar información con IA"
                  >
                    {loadingAI[place.id] ? (
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    ) : (
                      <HiOutlineSparkles className="h-5 w-5" />
                    )}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => onDeletePlace(place.id)}
                      className="p-2 rounded hover:bg-gray-100 text-gray-500 cursor-pointer"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {placeToDelete === place.id && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-3 w-48 z-10 border border-gray-200">
                        <p className="text-xs text-gray-700 mb-3">¿Eliminar esta zona?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onDeletePlace(null)}
                            className="flex-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => onDeletePlace(place.id, true)}
                            className="flex-1 px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700 cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      </div>

      {/* Botón flotante sticky para comparar */}
      {compareMode && selectedForCompare.length >= 2 && (
        <div className="sticky bottom-4 left-4 right-4 z-30 px-4 animate-[fadeIn_0.3s_ease-out]">
          <button
            onClick={handleCompare}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 border-2 border-purple-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Comparar {selectedForCompare.length} Zonas
          </button>
        </div>
      )}

      {/* Modal de comparación */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Comparación de Zonas
                </h2>
                <p className="text-purple-100 text-sm mt-1">Compara hasta 3 zonas lado a lado</p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Panel de recomendaciones inteligentes */}
              <SmartRecommendations
                placesData={comparisonData}
                selectedPlaces={selectedForCompare}
              />

              {/* Grid de comparación */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedForCompare.map((place, index) => {
                  // Determinar si esta zona está recomendada
                  const allDataLoaded = selectedForCompare.every(p => comparisonData[p.id]);
                  let isRecommended = false;
                  let recommendationReason = '';

                  if (allDataLoaded && Object.keys(comparisonData).length > 0) {
                    // Calcular scores para determinar recomendación
                    const analysis = selectedForCompare.map(p => {
                      const data = comparisonData[p.id];
                      let securityScore = 50;
                      const secureText = data?.secure?.toLowerCase() || '';
                      if (secureText.includes('buena') || secureText.includes('alta') || secureText.includes('segur') || secureText.includes('aceptable')) {
                        securityScore = 85;
                      } else if (secureText.includes('media') || secureText.includes('moderada')) {
                        securityScore = 60;
                      } else if (secureText.includes('baja') || secureText.includes('peligro') || secureText.includes('insegur')) {
                        securityScore = 25;
                      }
                      const rentValue = data?.rent || 1000;
                      const priceScore = Math.max(0, 100 - (rentValue / 20));
                      const tourismScore = data?.tourism ? 70 : 30;
                      return {
                        id: p.id,
                        overallScore: (securityScore * 0.5) + (priceScore * 0.3) + (tourismScore * 0.2),
                        securityScore,
                        rentValue
                      };
                    });

                    const bestOverall = analysis.reduce((best, current) =>
                      current.overallScore > best.overallScore ? current : best
                    );

                    if (place.id === bestOverall.id) {
                      isRecommended = true;
                      recommendationReason = `Esta zona ofrece el mejor balance entre seguridad (${Math.round(bestOverall.securityScore)}%), precio ($${Math.round(bestOverall.rentValue)}/mes) y atractivos turísticos.`;
                    }
                  }

                  return (
                    <ComparisonCard
                      key={place.id}
                      place={place}
                      index={index}
                      onDataLoaded={(id, data) => {
                        setComparisonData(prev => ({ ...prev, [id]: data }));
                      }}
                      isRecommended={isRecommended}
                      recommendationReason={recommendationReason}
                    />
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCompareModal(false);
                  setCompareMode(false);
                  setSelectedForCompare([]);
                  setComparisonData({});
                }}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cerrar y Resetear
              </button>
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Continuar Comparando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel flotante de Perplexity */}
      {showPerplexityPanel && (
        <div
          ref={perplexityPanelRef}
          className="w-96 bg-white shadow-2xl border-l border-gray-300 overflow-y-auto"
          role="complementary"
          aria-label="Panel de información de la zona"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-400" title={`Información sobre ${selectedZoneAddress}`}>
              {selectedZoneAddress}
            </h2>
            <button
              onClick={() => setShowPerplexityPanel(false)}
              className="p-2 hover:bg-gray-100 rounded cursor-pointer"
              title="Cerrar panel de información"
              aria-label="Cerrar panel de información"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4" role="region" aria-label="Información detallada de la zona">
            {loadingPerplexity ? (
              <SkeletonLoader variant="perplexity-panel" />
            ) : (
              <>
            {/* Visual Safety Score Gauge - New Feature */}
            {perplexityData?.secure && (
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-300 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <BiShield className="text-xl text-gray-600" />
                  EVALUACIÓN DE SEGURIDAD
                </h3>
                {(() => {
                  const secureText = perplexityData.secure.toLowerCase();
                  let safetyScore = 50;
                  let scoreColor = 'from-yellow-400 to-orange-500';
                  let bgColor = 'bg-yellow-50';
                  let textColor = 'text-yellow-800';
                  let icon = '⚠️';
                  let label = 'Media';

                  if (secureText.includes('buena') || secureText.includes('aceptable') || secureText.includes('alta') || secureText.includes('segur')) {
                    safetyScore = 85;
                    scoreColor = 'from-green-400 to-emerald-500';
                    bgColor = 'bg-green-50';
                    textColor = 'text-green-800';
                    icon = '🛡️';
                    label = 'Alta';
                  } else if (secureText.includes('media') || secureText.includes('moderada')) {
                    safetyScore = 60;
                    scoreColor = 'from-blue-400 to-cyan-500';
                    bgColor = 'bg-blue-50';
                    textColor = 'text-blue-800';
                    icon = '🔷';
                    label = 'Media';
                  } else if (secureText.includes('baja') || secureText.includes('peligro') || secureText.includes('insegur') || secureText.includes('riesgo')) {
                    safetyScore = 25;
                    scoreColor = 'from-red-400 to-rose-500';
                    bgColor = 'bg-red-50';
                    textColor = 'text-red-800';
                    icon = '🚨';
                    label = 'Baja';
                  }

                  return (
                    <>
                      <div className="relative mb-4">
                        {/* Progress Bar Background */}
                        <div className="h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          {/* Animated Progress Fill */}
                          <div
                            className={`h-full bg-gradient-to-r ${scoreColor} transition-all duration-1000 ease-out flex items-center justify-end pr-3`}
                            style={{ width: `${safetyScore}%` }}
                          >
                            <span className="text-white font-bold text-sm drop-shadow-lg">
                              {safetyScore}%
                            </span>
                          </div>
                        </div>
                        {/* Score Labels */}
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Riesgo Alto</span>
                          <span>Seguridad Óptima</span>
                        </div>
                      </div>
                      {/* Security Level Badge */}
                      <div className={`${bgColor} rounded-xl p-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{icon}</span>
                          <div>
                            <p className="text-xs text-gray-600 font-medium">Nivel de Seguridad</p>
                            <p className={`text-sm font-bold ${textColor}`}>{label}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${textColor} bg-white/60`}>
                          {perplexityData.secure}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Secure - Prioridad #1 según GOAL.md */}
            {perplexityData?.secure && (
              <div
                role="article"
                aria-labelledby="security-heading"
                className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-[fadeIn_0.5s_ease-out]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiShield className="text-2xl text-blue-600" aria-hidden="true" />
                  </div>
                  <h3 id="security-heading" className="font-bold text-base text-gray-800">Nivel de Seguridad</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                      perplexityData.secure.toLowerCase().includes('buena') || perplexityData.secure.toLowerCase().includes('aceptable')
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300'
                        : perplexityData.secure.toLowerCase().includes('media')
                        ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-2 border-blue-300'
                        : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-300'
                    }`}
                    title={`Nivel de seguridad de la zona: ${perplexityData.secure}`}
                    aria-label={`Seguridad: ${perplexityData.secure}`}
                  >
                    {perplexityData.secure.toLowerCase().includes('buena') || perplexityData.secure.toLowerCase().includes('aceptable') ? '🛡️' :
                     perplexityData.secure.toLowerCase().includes('media') ? '⚠️' : '🚨'} {perplexityData.secure}
                  </span>
                </div>
              </div>
            )}

            {/* Rent */}
            {perplexityData?.rent && (
              <div
                role="article"
                aria-labelledby="rent-heading"
                className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-[fadeIn_0.6s_ease-out]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiDollar className="text-2xl text-emerald-600" aria-hidden="true" />
                  </div>
                  <h3 id="rent-heading" className="font-bold text-base text-gray-800">Costo de Renta</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-2xl font-extrabold text-emerald-700"
                      title={`Costo promedio de renta mensual: $${Math.round(perplexityData.rent)} USD`}
                      aria-label={`Costo de renta: ${Math.round(perplexityData.rent)} dólares por mes`}
                    >
                      ${Math.round(perplexityData.rent)}
                    </span>
                    <span className="text-sm font-medium text-emerald-600">USD/mes</span>
                  </div>
                  <p className="text-xs text-gray-600 bg-white/60 rounded-lg px-3 py-1.5 inline-block">
                    📐 Monoambiente (máx. 2 personas)
                  </p>
                </div>
              </div>
            )}

            {/* Tourism */}
            {perplexityData?.tourism && (
              <div
                role="article"
                aria-labelledby="tourism-heading"
                className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-[fadeIn_0.7s_ease-out]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiMapAlt className="text-2xl text-purple-600" aria-hidden="true" />
                  </div>
                  <h3 id="tourism-heading" className="font-bold text-base text-gray-800">Turismo</h3>
                </div>
                <div
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none bg-white/40 rounded-lg p-3"
                  title="Información turística de la zona"
                >
                  <ReactMarkdown>{perplexityData.tourism}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Places */}
            {perplexityData?.places && (
              <div
                role="article"
                aria-labelledby="places-heading"
                className="bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-[fadeIn_0.8s_ease-out]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiMapPin className="text-2xl text-rose-600" aria-hidden="true" />
                  </div>
                  <h3 id="places-heading" className="font-bold text-base text-gray-800">Lugares de Interés</h3>
                </div>
                <div
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none bg-white/40 rounded-lg p-3"
                  title="Lugares de interés en la zona"
                >
                  <ReactMarkdown
                    components={{
                      strong: ({children, ...props}) => {
                        const text = typeof children === 'string' ? children : children?.[0];
                        if (typeof text === 'string') {
                          const searchUrl = `https://www.google.com/maps/search/?q=${encodeURIComponent(text + ', ' + selectedZoneAddress)}`;
                          return (
                            <strong>
                              <a
                                href={searchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors duration-200"
                                title={`Buscar ${text} en Google Maps`}
                                aria-label={`Buscar ${text} en Google Maps, se abrirá en una nueva ventana`}
                              >
                                {text}
                              </a>
                            </strong>
                          );
                        }
                        return <strong>{children}</strong>;
                      }
                    }}
                  >
                    {perplexityData.places}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Notes */}
            {perplexityData?.notes && (
              <div
                role="article"
                aria-labelledby="notes-heading"
                className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-[fadeIn_0.9s_ease-out]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiInfoCircle className="text-2xl text-gray-600" aria-hidden="true" />
                  </div>
                  <h3 id="notes-heading" className="font-bold text-base text-gray-800">Notas Generales</h3>
                </div>
                <div
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none bg-white/40 rounded-lg p-3"
                  title="Notas generales sobre la zona"
                >
                  <ReactMarkdown>{perplexityData.notes}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* No data message */}
            {!perplexityData?.notes && !perplexityData?.rent && !perplexityData?.tourism && !perplexityData?.secure && !perplexityData?.places && (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm text-gray-600 font-medium">No hay información disponible para esta zona</p>
              </div>
            )}
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
