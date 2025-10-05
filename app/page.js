'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleMap from './components/GoogleMap';
import Sidebar from './components/Sidebar';
import CountriesPanel from './components/CountriesPanel';
import ZonesPanel from './components/ZonesPanel';
import AirbnbPanel from './components/AirbnbPanel';
import CoWorkingPanel from './components/CoWorkingPanel';
import InstagramablePlacesPanel from './components/InstagramablePlacesPanel';
import Header from './components/Header';
import CountryQuickSelector from './components/CountryQuickSelector';
import RealTimeMetrics from './components/RealTimeMetrics';
import OnboardingTour from './components/OnboardingTour';
import HistoryPanel from './components/HistoryPanel';
import ComparisonDrawer from './components/ComparisonDrawer';
import ExplorationProgress from './components/ExplorationProgress';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { useToast } from './store/toastStore';
import { useHistoryStore } from './store/historyStore';
import { useComparisonStore } from './store/comparisonStore';
import { FiLayers } from 'react-icons/fi';

// Home page component with tab-based navigation for countries, zones, airbnb, coworking, and instagramable places
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { selectedCountry, setSelectedCountry, _hasHydrated } = useAppStore();
  const { addVisitedZone } = useHistoryStore();
  const toast = useToast();
  const { comparedZones, isDrawerOpen, removeZoneFromComparison, clearComparison, openDrawer, closeDrawer } = useComparisonStore();
  const isAdminMode = isAuthenticated;

  const [airbnbLocation, setAirbnbLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [airbnbs, setAirbnbs] = useState([]);
  const [coworkingPlaces, setCoworkingPlaces] = useState([]);
  const [instagramablePlaces, setInstagramablePlaces] = useState([]);
  const [countries, setCountries] = useState([]);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [selectedTab, setSelectedTab] = useState('countries');
  const [highlightedPlace, setHighlightedPlace] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [mapClickMode, setMapClickMode] = useState(false);
  const [mapClickCallback, setMapClickCallback] = useState(null);
  const [pendingCircle, setPendingCircle] = useState(null);
  const [circleRadius, setCircleRadius] = useState(1000);
  const [editingCircleId, setEditingCircleId] = useState(null);
  const [editingRadius, setEditingRadius] = useState(1000);

  // Sync selectedTab with URL on mount and when searchParams change
  useEffect(() => {
    // Esperar a que Zustand termine de hidratar desde localStorage
    if (!_hasHydrated) return;

    const tab = searchParams.get('tab');

    // Si no hay tab en URL, no hacer nada (usar default)
    if (!tab) return;

    if (['countries', 'zones', 'airbnb', 'coworking', 'instagramable'].includes(tab)) {
      // Si es tab zones pero no hay país seleccionado, redirigir a countries
      if (tab === 'zones' && !selectedCountry) {
        router.push('/?tab=countries');
        return;
      }
      setSelectedTab(tab);
    }
  }, [searchParams, selectedCountry, router, _hasHydrated]);

  // Efecto para ajustar viewport cuando se carga la página en /?tab=zones con país seleccionado
  useEffect(() => {
    console.log('[page.js] Viewport effect triggered - hasHydrated:', _hasHydrated, 'country:', selectedCountry?.name, 'places:', places.length, 'tab:', selectedTab);

    // Solo ejecutar si:
    // 1. Zustand ha terminado de hidratar
    // 2. Hay un país seleccionado
    // 3. Los places ya se cargaron desde Supabase
    // 4. Estamos en el tab de zones
    if (!_hasHydrated || !selectedCountry || places.length === 0 || selectedTab !== 'zones') {
      return;
    }

    // Filtrar zonas del país seleccionado (incluyendo polígonos y círculos)
    const countryPlaces = places.filter(p => p.country_code === selectedCountry.country_code);

    console.log('[page.js] Country places found:', countryPlaces.length);
    if (countryPlaces.length === 0) return;

    // Delay más largo para asegurar que el mapa Y las formas (polígonos/círculos) estén renderizados
    // Este timing es crítico para que fitBounds pueda acceder a las referencias de las formas
    console.log('[page.js] Scheduling fitBounds in 800ms...');
    const timeoutId = setTimeout(() => {
      if (countryPlaces.length === 1) {
        // Si solo hay una zona, centrar en ella
        console.log('[page.js] Setting single place viewport');
        setSelectedPlace(countryPlaces[0]);
      } else {
        // Si hay múltiples zonas, ajustar el mapa para ver todas (polígonos + círculos)
        console.log('[page.js] Setting fitBounds viewport for', countryPlaces.length, 'places');
        setSelectedPlace({
          fitBounds: true,
          places: countryPlaces
        });
      }
      // Limpiar después para no persistir el estado y permitir zoom manual del usuario
      setTimeout(() => {
        console.log('[page.js] Clearing selectedPlace');
        setSelectedPlace(null);
      }, 2000);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [_hasHydrated, selectedCountry, places, selectedTab]);

  const handleStartDrawing = (placeId) => {
    // Limpiar selección del mapa al iniciar dibujo
    setSelectedPlace(null);
    setHighlightedPlace(null);

    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        return { ...p, isDrawing: !p.isDrawing };
      }
      return { ...p, isDrawing: false };
    }));
  };

  const handleSavePolygon = async (placeId, polygon) => {
    // Primero intentar encontrar por ID
    let place = places.find(p => p.id === placeId);

    // Si no lo encuentra por ID (puede ser ID temporal), buscar por isDrawing
    if (!place) {
      place = places.find(p => p.isDrawing);
    }

    // Actualizar polígono en Supabase
    if (place) {
      try {
        const response = await fetch('/api/places', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: place.id,
            polygon
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Error guardando polígono:', error);
          return;
        }

        const savedPlace = await response.json();

        // Actualizar el estado - buscar por ID real de Supabase
        setPlaces(prev => prev.map(p =>
          p.id === place.id ? { ...savedPlace, isDrawing: false } : p
        ));
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const confirmDelete = async () => {
    if (!placeToDelete) return;

    // Primero eliminar de Supabase
    const response = await fetch(`/api/places?id=${placeToDelete}`, {
      method: 'DELETE'
    });

    // Solo actualizar estado local si la eliminación en Supabase fue exitosa
    if (response.ok) {
      setPlaces(prev => prev.filter(p => p.id !== placeToDelete));
      toast.success('Zona eliminada correctamente');
    } else {
      console.error('Error al eliminar zona de Supabase');
      toast.error('Error al eliminar la zona');
    }

    setPlaceToDelete(null);
  };

  const handleColorChange = async (placeId, color) => {
    setPlaces(prev => prev.map(p =>
      p.id === placeId ? { ...p, color } : p
    ));

    // Actualizar en Supabase
    await fetch('/api/places', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: placeId,
        color
      })
    });
  };

  const handleGoToPlace = (place) => {
    setSelectedPlace(place);
    // Agregar al historial si es una zona válida
    if (place && place.id && place.address) {
      addVisitedZone(place);
      // Track zone visit for gamification
      if (window.trackZoneVisit) {
        window.trackZoneVisit(place.id);
      }
    }
  };

  const handleTuristicChange = async (placeId, is_turistic) => {
    setPlaces(prev => prev.map(p =>
      p.id === placeId ? { ...p, is_turistic } : p
    ));

    // Actualizar en Supabase
    await fetch('/api/places', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: placeId,
        is_turistic
      })
    });
  };

  const handleUpdatePlace = (placeId, updates) => {
    setPlaces(prev => prev.map(p =>
      p.id === placeId ? { ...p, ...updates } : p
    ));
  };

  // Cargar lugares, airbnbs y coworking places desde Supabase al iniciar
  useEffect(() => {
    let isMounted = true;

    const loadPlaces = async () => {
      try {
        const response = await fetch('/api/places');
        const loadedPlaces = await response.json();

        if (isMounted && loadedPlaces && loadedPlaces.length > 0) {
          const placesWithDrawing = loadedPlaces.map(p => ({
            id: p.id,
            address: p.address,
            lat: parseFloat(p.lat),
            lng: parseFloat(p.lng),
            placeId: p.place_id,
            polygon: p.polygon,
            color: p.color,
            country_code: p.country_code,
            is_turistic: p.is_turistic || false,
            circle_radius: p.circle_radius,
            isDrawing: false
          }));
          setPlaces(placesWithDrawing);
        }
      } catch (error) {
        console.error('Error loading places:', error);
      }
    };

    const loadAirbnbs = async () => {
      try {
        const response = await fetch('/api/airbnb');
        const loadedAirbnbs = await response.json();
        if (isMounted && loadedAirbnbs) {
          setAirbnbs(loadedAirbnbs);
        }
      } catch (error) {
        console.error('Error loading airbnbs:', error);
      }
    };

    const loadCoworkingPlaces = async () => {
      try {
        const response = await fetch('/api/coworking');
        const loadedCoworking = await response.json();
        if (isMounted && loadedCoworking) {
          setCoworkingPlaces(loadedCoworking);
        }
      } catch (error) {
        console.error('Error loading coworking places:', error);
      }
    };

    const loadInstagramablePlaces = async () => {
      try {
        const response = await fetch('/api/instagramable');
        const loadedInstagramable = await response.json();
        if (isMounted && loadedInstagramable) {
          setInstagramablePlaces(loadedInstagramable);
        }
      } catch (error) {
        console.error('Error loading instagramable places:', error);
      }
    };

    const loadCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        const data = await response.json();
        if (isMounted && data) {
          setCountries(data);
        }
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };

    loadPlaces();
    loadAirbnbs();
    loadCoworkingPlaces();
    loadInstagramablePlaces();
    loadCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    router.push('/?tab=zones');

    // Track country visit for gamification
    if (window.trackCountryVisit) {
      window.trackCountryVisit(country.country_code);
    }

    // Primero calcular bounds para zonas
    const countryPlaces = places.filter(p => p.country_code === country.country_code);

    // Esperar a que el estado se actualice antes de ajustar el mapa
    setTimeout(() => {
      if (countryPlaces.length > 0) {
        if (countryPlaces.length === 1) {
          // Si solo hay una zona, centrar en ella
          setSelectedPlace(countryPlaces[0]);
        } else {
          // Si hay múltiples zonas, ajustar el mapa para ver todas
          setSelectedPlace({
            fitBounds: true,
            places: countryPlaces
          });
        }
      }
    }, 100);
  };

  const handleDeletePlace = (placeId, confirm = false) => {
    if (confirm) {
      const place = places.find(p => p.id === placeId);
      setPlaces(prev => prev.filter(p => p.id !== placeId));

      if (place && place.polygon) {
        fetch(`/api/places?id=${placeId}`, { method: 'DELETE' });
      }
      setPlaceToDelete(null);
    } else {
      setPlaceToDelete(placeToDelete === placeId ? null : placeId);
    }
  };

  const handleAddCoworkingPlace = async (placeData) => {
    try {
      const response = await fetch('/api/coworking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(placeData)
      });

      if (response.ok) {
        const savedPlace = await response.json();
        setCoworkingPlaces(prev => [savedPlace, ...prev]);
        setSelectedPlace(savedPlace);
        toast.success('Coworking añadido correctamente');
      } else {
        toast.error('Error al añadir coworking');
      }
    } catch (error) {
      console.error('Error adding coworking place:', error);
      toast.error('Error al añadir coworking');
    }
  };

  const handleDeleteCoworkingPlace = async (placeId) => {
    try {
      const response = await fetch(`/api/coworking?id=${placeId}`, { method: 'DELETE' });
      if (response.ok) {
        setCoworkingPlaces(prev => prev.filter(p => p.id !== placeId));
        toast.success('Coworking eliminado correctamente');
      } else {
        toast.error('Error al eliminar coworking');
      }
    } catch (error) {
      console.error('Error deleting coworking place:', error);
      toast.error('Error al eliminar coworking');
    }
  };

  const handleAddInstagramablePlace = async (placeData) => {
    try {
      const response = await fetch('/api/instagramable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(placeData)
      });

      if (response.ok) {
        const savedPlace = await response.json();
        setInstagramablePlaces(prev => [savedPlace, ...prev]);
        setSelectedPlace(savedPlace);
        toast.success('Lugar instagrameable añadido correctamente');
      } else {
        toast.error('Error al añadir lugar instagrameable');
      }
    } catch (error) {
      console.error('Error adding instagramable place:', error);
      toast.error('Error al añadir lugar instagrameable');
    }
  };

  const handleDeleteInstagramablePlace = async (placeId) => {
    try {
      const response = await fetch(`/api/instagramable?id=${placeId}`, { method: 'DELETE' });
      if (response.ok) {
        setInstagramablePlaces(prev => prev.filter(p => p.id !== placeId));
        toast.success('Lugar instagrameable eliminado correctamente');
      } else {
        toast.error('Error al eliminar lugar instagrameable');
      }
    } catch (error) {
      console.error('Error deleting instagramable place:', error);
      toast.error('Error al eliminar lugar instagrameable');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Spacer for fixed header */}
      <div className="h-[52px]"></div>

      {/* Dynamic contextual banner */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent_50%)]" />
        </div>

        <div className="relative px-4 py-2 flex items-center justify-center gap-3">
          {selectedCountry ? (
            <>
              <div className="flex items-center gap-2 animate-[fadeIn_0.4s_ease-in-out]">
                <span className="text-2xl" role="img" aria-label="location">📍</span>
                <span className="font-semibold text-sm sm:text-base">
                  {selectedCountry.name}
                </span>
              </div>

              <div className="h-4 w-px bg-white/30" />

              <div className="flex items-center gap-2 animate-[fadeIn_0.5s_ease-in-out]">
                <span className="text-xl" role="img" aria-label="zones">🛡️</span>
                <span className="text-xs sm:text-sm font-medium">
                  {places.filter(p => p.country_code === selectedCountry.country_code).length}
                  {places.filter(p => p.country_code === selectedCountry.country_code).length === 1 ? ' zona mapeada' : ' zonas mapeadas'}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 animate-[fadeIn_0.4s_ease-in-out]">
              <span className="text-xl" role="img" aria-label="world">🌎</span>
              <span className="text-sm font-medium">
                Selecciona un país para explorar zonas de seguridad
              </span>
            </div>
          )}
        </div>

        {/* Subtle bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Header */}
      <Header isAdminMode={isAdminMode} />

      {/* Contenido principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar con tabs */}
        <Sidebar
        selectedTab={selectedTab}
        selectedCountry={selectedCountry}
        isZonesEnabled={!!selectedCountry}
      />

      {/* Panel de contenido según tab seleccionado */}
      {selectedTab === 'countries' && (
        <CountriesPanel
          selectedCountry={selectedCountry}
          onSelectCountry={handleSelectCountry}
          places={places}
        />
      )}

      {selectedTab === 'zones' && (
        <ZonesPanel
          selectedCountry={selectedCountry}
          places={places}
          onStartDrawing={handleStartDrawing}
          onDeletePlace={handleDeletePlace}
          onColorChange={handleColorChange}
          onTuristicChange={handleTuristicChange}
          onGoToPlace={handleGoToPlace}
          placeToDelete={placeToDelete}
          highlightedPlace={highlightedPlace}
          onAddPlace={async (placeData) => {
            try {
              // Crear registro en Supabase inmediatamente
              const bodyData = {
                address: placeData.address,
                lat: placeData.lat,
                lng: placeData.lng,
                placeId: placeData.placeId,
                polygon: null, // Sin polígono todavía
                color: placeData.color,
                country_code: placeData.country_code
              };

              // Incluir circle_radius si existe
              if (placeData.circle_radius !== undefined) {
                bodyData.circle_radius = placeData.circle_radius;
              }

              const response = await fetch('/api/places', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
              });

              if (!response.ok) {
                console.error('Error creando zona');
                toast.error('Error al crear la zona');
                return;
              }

              const savedPlace = await response.json();

              // Actualizar estado con ID de Supabase
              setPlaces(prev => [savedPlace, ...prev]);

              // Hacer zoom a la nueva zona, pero limpiar después para no persistir
              setSelectedPlace(savedPlace);
              setTimeout(() => setSelectedPlace(null), 1000);

              // Mostrar toast de éxito
              toast.success('Zona creada correctamente');

              // Iniciar proceso de Perplexity en background
              try {
                await fetch('/api/perplexity-populate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    zone_id: savedPlace.id
                  })
                });
                toast.info('Generando información de la zona con IA...');
              } catch (error) {
                console.error('Error populating zone with AI:', error);
              }
            } catch (error) {
              console.error('Error:', error);
              toast.error('Error inesperado al crear la zona');
            }
          }}
          onMapClickModeChange={(isActive, callback) => {
            setMapClickMode(isActive);
            setMapClickCallback(() => callback);
          }}
          pendingCircle={pendingCircle}
          setPendingCircle={setPendingCircle}
          circleRadius={circleRadius}
          setCircleRadius={setCircleRadius}
          editingCircleId={editingCircleId}
          setEditingCircleId={setEditingCircleId}
          editingRadius={editingRadius}
          setEditingRadius={setEditingRadius}
          onUpdatePlace={handleUpdatePlace}
        />
      )}

      {selectedTab === 'airbnb' && (
        <AirbnbPanel
          onGoToLocation={setSelectedPlace}
          selectedCountry={selectedCountry}
        />
      )}

      {selectedTab === 'coworking' && (
        <CoWorkingPanel
          selectedCountry={selectedCountry}
          coworkingPlaces={coworkingPlaces}
          onAddCoworkingPlace={handleAddCoworkingPlace}
          onDeleteCoworkingPlace={handleDeleteCoworkingPlace}
          onGoToPlace={handleGoToPlace}
          mapBounds={mapBounds}
        />
      )}

      {selectedTab === 'instagramable' && (
        <InstagramablePlacesPanel
          selectedCountry={selectedCountry}
          instagramablePlaces={instagramablePlaces}
          onAddInstagramablePlace={handleAddInstagramablePlace}
          onDeleteInstagramablePlace={handleDeleteInstagramablePlace}
          onGoToPlace={handleGoToPlace}
          mapBounds={mapBounds}
        />
      )}

      {/* Panel derecho - Mapa de Google */}
      <div className="flex-1">
        <GoogleMap
          selectedPlace={selectedPlace}
          places={places}
          airbnbs={airbnbs.filter(a => a.country_code === selectedCountry?.country_code)}
          airbnbLocation={airbnbLocation}
          onSavePolygon={handleSavePolygon}
          onPolygonClick={(placeId) => {
            setHighlightedPlace(placeId);
            router.push('/?tab=zones');
            // Agregar al historial cuando se hace clic en una zona
            const clickedPlace = places.find(p => p.id === placeId);
            if (clickedPlace) {
              addVisitedZone(clickedPlace);
              // Track zone visit for gamification
              if (window.trackZoneVisit) {
                window.trackZoneVisit(placeId);
              }
            }
          }}
          onBoundsChanged={setMapBounds}
          coworkingPlaces={coworkingPlaces}
          instagramablePlaces={instagramablePlaces}
          mapClickMode={mapClickMode}
          onMapClick={(lat, lng) => {
            if (mapClickCallback) {
              mapClickCallback(lat, lng);
            }
          }}
          highlightedPlace={highlightedPlace}
          pendingCircle={pendingCircle}
          circleRadius={circleRadius}
          editingCircleId={editingCircleId}
          editingRadius={editingRadius}
          countries={countries}
          selectedCountry={selectedCountry}
          onSelectCountry={handleSelectCountry}
        />
      </div>
      </div>

      {/* Real-time metrics panel */}
      <RealTimeMetrics places={places} selectedCountry={selectedCountry} />

      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* History Panel */}
      <HistoryPanel onGoToZone={handleGoToPlace} countries={countries} />

      {/* Comparison Drawer */}
      {isDrawerOpen && (
        <ComparisonDrawer
          zones={comparedZones}
          onRemoveZone={removeZoneFromComparison}
          onClose={closeDrawer}
        />
      )}

      {/* Floating Comparison Button - Only show if there are zones to compare */}
      {comparedZones.length > 0 && !isDrawerOpen && (
        <button
          onClick={openDrawer}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 border-2 border-white group"
          title="Abrir comparador de zonas"
        >
          <div className="relative">
            <FiLayers className="text-2xl" />
            {/* Badge con contador */}
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {comparedZones.length}
            </span>
          </div>
          <span className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {comparedZones.length} zona{comparedZones.length > 1 ? 's' : ''} para comparar
          </span>
        </button>
      )}

      {/* Exploration Progress Badge */}
      <ExplorationProgress />

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando...</div>}>
      <HomeContent />
    </Suspense>
  );
}
