'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import CountryQuickSelector from './CountryQuickSelector';
import QuickStatsPanel from './QuickStatsPanel';
import MapSearchBox from './MapSearchBox';

// Estilos de mapa predefinidos
const MAP_STYLES = {
  standard: {
    name: 'Estándar',
    icon: '🗺️',
    styles: []
  },
  dark: {
    name: 'Oscuro',
    icon: '🌙',
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }]
      }
    ]
  },
  safety: {
    name: 'Seguridad',
    icon: '🛡️',
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
      { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#bdbdbd' }]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#eeeeee' }]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#757575' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#e5e5e5' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9e9e9e' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#757575' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#dadada' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#616161' }]
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9e9e9e' }]
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [{ color: '#e5e5e5' }]
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{ color: '#eeeeee' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#c9c9c9' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9e9e9e' }]
      }
    ]
  }
};

export default function GoogleMap({ selectedPlace, places, airbnbs, airbnbLocation, onSavePolygon, onPolygonClick, onBoundsChanged, coworkingPlaces, instagramablePlaces, mapClickMode, onMapClick, highlightedPlace, pendingCircle, circleRadius, editingCircleId, editingRadius, countries, selectedCountry, onSelectCountry }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [mapStyle, setMapStyle] = useState('standard');
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showDensityIndicator, setShowDensityIndicator] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    safe: true,
    medium: true,
    regular: true,
    caution: true,
    unsafe: true
  });
  const [showFABMenu, setShowFABMenu] = useState(false);
  const [marker, setMarker] = useState(null);
  const [airbnbMarker, setAirbnbMarker] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [vertexToDelete, setVertexToDelete] = useState(null);
  const [deleteModalPosition, setDeleteModalPosition] = useState(null);
  const polygonsRef = useRef({});
  const circlesRef = useRef({});
  const tempCircleRef = useRef(null);
  const airbnbMarkersRef = useRef([]);
  const animationFrameRef = useRef(null);
  const boundsChangeTimeoutRef = useRef(null);
  const mapClickListenerRef = useRef(null);
  const tempMarkerRef = useRef(null);

  // Helper function to get filter category from color
  const getFilterCategory = (color) => {
    const colorMap = {
      '#22c55e': 'safe',      // green
      '#3b82f6': 'medium',    // blue
      '#f97316': 'regular',   // orange
      '#eab308': 'caution',   // yellow
      '#dc2626': 'unsafe'     // red
    };
    return colorMap[color] || 'safe';
  };

  // Cargar estilo de mapa desde localStorage
  useEffect(() => {
    const savedStyle = localStorage.getItem('mapStyle');
    if (savedStyle && MAP_STYLES[savedStyle]) {
      setMapStyle(savedStyle);
    }
  }, []);

  // Cerrar selector de estilo al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStyleSelector && !event.target.closest('.map-style-selector')) {
        setShowStyleSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStyleSelector]);

  // Aplicar estilo al mapa cuando cambia
  useEffect(() => {
    if (!map) return;

    const styleConfig = MAP_STYLES[mapStyle];
    if (styleConfig) {
      map.setOptions({ styles: styleConfig.styles });
      // Guardar preferencia
      localStorage.setItem('mapStyle', mapStyle);
    }
  }, [map, mapStyle]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      // Verificar si el script ya está cargado
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // Crear y cargar el script de Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,drawing`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    };

    const initMap = async () => {
      if (!mapRef.current) return;

      // Coordenadas por defecto (Centrado en Latinoamérica completa)
      const position = {
        lat: 0,
        lng: -70,
      };

      // Obtener estilo guardado o usar standard
      const savedStyle = localStorage.getItem('mapStyle') || 'standard';
      const initialStyle = MAP_STYLES[savedStyle] ? MAP_STYLES[savedStyle].styles : [];

      // Crear el mapa usando la API global de Google Maps
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom: 3.5,
        styles: initialStyle,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP,
        },
      });

      setMap(newMap);

      // Ocultar loader una vez que el mapa esté listo
      window.google.maps.event.addListenerOnce(newMap, 'tilesloaded', () => {
        setTimeout(() => setIsMapLoading(false), 300);
      });

      // Listener para cambios en los bounds del mapa con debounce
      newMap.addListener('bounds_changed', () => {
        // Limpiar timeout anterior
        if (boundsChangeTimeoutRef.current) {
          clearTimeout(boundsChangeTimeoutRef.current);
        }

        // Esperar 500ms después del último cambio antes de actualizar
        boundsChangeTimeoutRef.current = setTimeout(() => {
          const bounds = newMap.getBounds();
          if (bounds && onBoundsChanged) {
            onBoundsChanged(bounds);
          }
        }, 500);
      });

      // Esperar a que la librería drawing esté disponible
      const waitForDrawing = () => {
        return new Promise((resolve) => {
          const checkDrawing = () => {
            if (window.google?.maps?.drawing?.DrawingManager) {
              resolve();
            } else {
              setTimeout(checkDrawing, 100);
            }
          };
          checkDrawing();
        });
      };

      await waitForDrawing();

      // Crear el Drawing Manager
      const newDrawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#eb4034',
          fillOpacity: 0.15,
          strokeWeight: 3,
          strokeColor: '#eb4034',
          editable: true,
          draggable: false,
        },
      });

      newDrawingManager.setMap(newMap);
      setDrawingManager(newDrawingManager);

      // Listener cuando se completa un polígono
      window.google.maps.event.addListener(newDrawingManager, 'overlaycomplete', (event) => {
        if (event.type === 'polygon') {
          const polygon = event.overlay;
          const path = polygon.getPath();
          const coordinates = [];

          for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            coordinates.push([point.lng(), point.lat()]);
          }

          // Cerrar el polígono
          coordinates.push([...coordinates[0]]);

          setCurrentPolygon({
            overlay: polygon,
            coordinates: coordinates
          });

          // Deshabilitar el modo de dibujo después de completar
          newDrawingManager.setDrawingMode(null);
        }
      });
    };

    loadGoogleMaps();
  }, []);

  // Actualizar el mapa cuando se selecciona un lugar
  useEffect(() => {
    if (!map || !selectedPlace) return;

    // Si es fitBounds, ajustar para ver todos los puntos
    if (selectedPlace.fitBounds && selectedPlace.places) {
      // Función para intentar fitBounds
      const attemptFitBounds = () => {
        const bounds = new window.google.maps.LatLngBounds();
        let hasValidBounds = false;

        selectedPlace.places.forEach(place => {
          // Siempre extender con el punto central
          bounds.extend({ lat: place.lat, lng: place.lng });
          hasValidBounds = true;

          // Si la zona tiene un círculo, extender bounds con los bordes del círculo
          if (place.circle_radius && circlesRef.current[place.id]) {
            const circle = circlesRef.current[place.id];
            const circleBounds = circle.getBounds();
            if (circleBounds) {
              bounds.extend(circleBounds.getNorthEast());
              bounds.extend(circleBounds.getSouthWest());
            }
          }

          // Si la zona tiene un polígono, extender bounds con todos los vértices
          if (place.polygon && polygonsRef.current[place.id]) {
            const polygon = polygonsRef.current[place.id];
            const path = polygon.getPath();
            if (path) {
              for (let i = 0; i < path.getLength(); i++) {
                bounds.extend(path.getAt(i));
              }
            }
          }
        });

        if (hasValidBounds) {
          // Aplicar bounds con padding
          const padding = { top: 50, right: 50, bottom: 50, left: 50 };
          map.fitBounds(bounds, padding);

          // Forzar redibujado de overlays después de fitBounds
          setTimeout(() => {
            window.google.maps.event.trigger(map, 'resize');
          }, 100);
        }
      };

      // Verificar si todas las formas (polígonos/círculos) están renderizadas
      const allShapesRendered = selectedPlace.places.every(place => {
        if (place.polygon) {
          return polygonsRef.current[place.id] !== undefined;
        }
        if (place.circle_radius) {
          return circlesRef.current[place.id] !== undefined;
        }
        return true; // Si no tiene ninguna forma, considerar como renderizado
      });

      console.log('[GoogleMap] fitBounds requested for', selectedPlace.places.length, 'places');
      console.log('[GoogleMap] All shapes rendered:', allShapesRendered);
      console.log('[GoogleMap] Polygons ref:', Object.keys(polygonsRef.current).length);
      console.log('[GoogleMap] Circles ref:', Object.keys(circlesRef.current).length);

      if (allShapesRendered) {
        // Si todas las formas están listas, ejecutar fitBounds inmediatamente
        console.log('[GoogleMap] Executing fitBounds immediately');
        attemptFitBounds();
      } else {
        // Si no todas las formas están listas, esperar un poco más
        // Intentar múltiples veces con delays incrementales
        console.log('[GoogleMap] Waiting for shapes to render...');
        let attempts = 0;
        const maxAttempts = 5;
        const attemptInterval = setInterval(() => {
          attempts++;
          const nowAllShapesRendered = selectedPlace.places.every(place => {
            if (place.polygon) {
              return polygonsRef.current[place.id] !== undefined;
            }
            if (place.circle_radius) {
              return circlesRef.current[place.id] !== undefined;
            }
            return true;
          });

          console.log(`[GoogleMap] Attempt ${attempts}/${maxAttempts}, shapes rendered:`, nowAllShapesRendered);

          if (nowAllShapesRendered || attempts >= maxAttempts) {
            clearInterval(attemptInterval);
            console.log('[GoogleMap] Executing fitBounds after', attempts, 'attempts');
            attemptFitBounds();
          }
        }, 200); // Intentar cada 200ms

        return () => clearInterval(attemptInterval);
      }
      return;
    }

    const position = {
      lat: selectedPlace.lat,
      lng: selectedPlace.lng,
    };

    // Cancelar animación previa si existe
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Animación personalizada con aceleración
    const start = map.getCenter();
    const startLat = start.lat();
    const startLng = start.lng();
    const targetLat = position.lat;
    const targetLng = position.lng;
    const duration = 600; // 600ms de duración
    const startTime = performance.now();

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      const currentLat = startLat + (targetLat - startLat) * eased;
      const currentLng = startLng + (targetLng - startLng) * eased;

      map.setCenter({ lat: currentLat, lng: currentLng });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Determinar el tipo de lugar primero
    const isCoworking = coworkingPlaces?.some(p => p.id === selectedPlace.id);
    const isInstagramable = instagramablePlaces?.some(p => p.id === selectedPlace.id);

    // Ajustar zoom según el tipo de lugar
    const currentZoom = map.getZoom();
    let targetZoom = 13; // Zoom por defecto para zonas y Airbnb

    if (isCoworking || isInstagramable) {
      targetZoom = 17; // Zoom mucho mayor para coworking e instagramable
    }

    if (currentZoom !== targetZoom) {
      map.setZoom(targetZoom);
    }

    // Forzar redibujado de overlays después de centrar
    setTimeout(() => {
      window.google.maps.event.trigger(map, 'resize');
    }, 100);

    // Eliminar el marcador anterior si existe
    if (marker) {
      marker.setMap(null);
    }

    // Determinar el icono según el tipo de lugar
    let iconConfig;

    if (isCoworking) {
      // Icono de personas para coworking
      iconConfig = {
        url: '/icons/people-nearby-svgrepo-com.svg',
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32),
      };
    } else if (isInstagramable) {
      // Icono de cámara para instagramable
      iconConfig = {
        url: '/icons/camera-svgrepo-com.svg',
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32),
      };
    } else {
      // Icono de flecha por defecto (para Airbnb y zonas)
      iconConfig = {
        url: '/icons/arrow-down-right-square-svgrepo-com.svg',
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32),
      };
    }

    // Crear el marcador en el centro
    const newMarker = new window.google.maps.Marker({
      position: position,
      map: map,
      title: selectedPlace.address || selectedPlace.title || selectedPlace.description,
      animation: window.google.maps.Animation.DROP,
      icon: iconConfig
    });

    setMarker(newMarker);
  }, [selectedPlace, map]);

  // Mostrar ubicación de Airbnb con punto verde
  useEffect(() => {
    if (!map || !airbnbLocation) return;

    // Eliminar marcador anterior de Airbnb si existe
    if (airbnbMarker) {
      airbnbMarker.setMap(null);
    }

    const position = {
      lat: airbnbLocation.lat,
      lng: airbnbLocation.lng,
    };

    // Crear marcador verde para Airbnb
    const newAirbnbMarker = new window.google.maps.Marker({
      position: position,
      map: map,
      title: 'Ubicación Airbnb',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#00FF00',
        fillOpacity: 1,
        strokeColor: '#00CC00',
        strokeWeight: 2,
      },
    });

    setAirbnbMarker(newAirbnbMarker);
  }, [airbnbLocation, map]);

  // Manejar el modo de dibujo cuando se activa desde las tarjetas
  useEffect(() => {
    if (!drawingManager || !places) return;

    const drawingPlace = places.find(p => p.isDrawing);

    if (drawingPlace) {
      // Cambiar cursor a crosshair
      if (mapRef.current) {
        mapRef.current.style.cursor = 'crosshair';
      }

      // Si ya tiene polígono, solo hacerlo editable sin borrar
      if (drawingPlace.polygon && polygonsRef.current[drawingPlace.id]) {
        polygonsRef.current[drawingPlace.id].setEditable(true);
        drawingManager.setDrawingMode(null);
      } else {
        // Si no tiene polígono, activar modo de dibujo
        // Limpiar polígono temporal si existe
        if (currentPolygon && !drawingPlace.polygon) {
          currentPolygon.overlay.setMap(null);
          setCurrentPolygon(null);
        }

        // Actualizar opciones del polígono con el color seleccionado
        drawingManager.setOptions({
          polygonOptions: {
            fillColor: drawingPlace.color,
            fillOpacity: 0.15,
            strokeWeight: 3,
            strokeColor: drawingPlace.color,
            editable: true,
            draggable: false,
          }
        });

        // Activar modo de dibujo
        drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
      }
    } else {
      // Restaurar cursor normal solo si no está en mapClickMode
      if (mapRef.current && !mapClickMode) {
        mapRef.current.style.cursor = '';
      }

      // Desactivar modo de dibujo y edición en todos los polígonos
      drawingManager.setDrawingMode(null);
      Object.values(polygonsRef.current).forEach(polygon => {
        if (polygon) polygon.setEditable(false);
      });
    }
  }, [places, drawingManager, mapClickMode]);

  // Guardar el polígono cuando se completa
  useEffect(() => {
    if (!currentPolygon || !places) return;

    const drawingPlace = places.find(p => p.isDrawing);
    if (drawingPlace && !drawingPlace.polygon) { // Solo guardar si NO tiene polígono (es nuevo)
      onSavePolygon(drawingPlace.id, currentPolygon.coordinates);

      // Guardar referencia del overlay para poder mostrarlo/ocultarlo
      polygonsRef.current[drawingPlace.id] = currentPolygon.overlay;
    }
  }, [currentPolygon]);

  // Mostrar polígonos guardados y actualizar colores
  useEffect(() => {
    if (!map || !places) return;

    places.forEach(place => {
      // Si el lugar tiene un polígono guardado
      if (place.polygon) {
        const filterCategory = getFilterCategory(place.color);
        const isVisible = activeFilters[filterCategory];

        // Si ya está renderizado, solo actualizar opciones
        if (polygonsRef.current[place.id]) {
          const existingPolygon = polygonsRef.current[place.id];
          existingPolygon.setOptions({
            fillColor: place.color || '#eb4034',
            strokeColor: place.color || '#eb4034',
          });
          existingPolygon.setVisible(isVisible && !mapClickMode);
          return;
        }

        // Si no está renderizado, crearlo
        const coordinates = place.polygon.map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));

        const polygon = new window.google.maps.Polygon({
          paths: coordinates,
          fillColor: place.color || '#eb4034',
          fillOpacity: 0.15,
          strokeWeight: 3,
          strokeColor: place.color || '#eb4034',
          editable: false,
          map: map,
        });

        // Add hover effect to polygon
        polygon.addListener('mouseover', function() {
          if (!polygon.getEditable()) {
            polygon.setOptions({
              fillOpacity: 0.35,
              strokeWeight: 4,
            });
          }
        });

        polygon.addListener('mouseout', function() {
          if (!polygon.getEditable()) {
            const isHighlighted = highlightedPlace === place.id;
            polygon.setOptions({
              fillOpacity: isHighlighted ? 0.25 : 0.15,
              strokeWeight: isHighlighted ? 5 : 3,
            });
          }
        });

        // Variable para rastrear el vértice seleccionado
        let selectedVertex = null;

        // Listener para detectar clic en vértices o en el polígono
        window.google.maps.event.addListener(polygon, 'click', (event) => {
          if (event.vertex !== undefined && polygon.getEditable()) {
            selectedVertex = event.vertex;
          } else if (!polygon.getEditable() && onPolygonClick) {
            // Click en el polígono (no en vértice) cuando no está en modo edición
            onPolygonClick(place.id);
          }
        });

        // Listener para detectar doble clic en vértices
        window.google.maps.event.addListener(polygon, 'dblclick', (event) => {
          if (event.vertex !== undefined && polygon.getEditable()) {
            const path = polygon.getPath();
            if (path.getLength() > 3) { // Mantener al menos 3 puntos
              // Obtener posición en píxeles de la pantalla
              const overlay = new window.google.maps.OverlayView();
              overlay.draw = function() {};
              overlay.setMap(map);

              // Esperar a que el overlay esté listo
              window.google.maps.event.addListenerOnce(overlay, 'projection_changed', () => {
                const projection = overlay.getProjection();
                const point = projection.fromLatLngToContainerPixel(event.latLng);

                setVertexToDelete({ polygon, vertex: event.vertex, path });
                setDeleteModalPosition({ x: point.x, y: point.y });

                // Limpiar el overlay
                overlay.setMap(null);
              });
            } else {
              alert('El polígono debe tener al menos 3 puntos');
            }
          }
        });

        // Listener para detectar tecla Delete
        const handleKeyDown = (e) => {
          if (e.key === 'Delete' && selectedVertex !== null && polygon.getEditable()) {
            const path = polygon.getPath();
            if (path.getLength() > 3) { // Mantener al menos 3 puntos
              path.removeAt(selectedVertex);
              selectedVertex = null;
            }
          }
        };

        // Listener para detectar tecla Enter para guardar
        const handleKeyDownSave = (e) => {
          if (e.key === 'Enter' && polygon.getEditable()) {
            savePolygonEdit(place.id, polygon);
            polygon.setEditable(false);
          }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keydown', handleKeyDownSave);
        polygon.keydownListener = handleKeyDown;
        polygon.keydownSaveListener = handleKeyDownSave;

        polygonsRef.current[place.id] = polygon;
      }
    });

    // Limpiar polígonos de lugares eliminados
    Object.keys(polygonsRef.current).forEach(placeId => {
      if (!places.find(p => p.id === parseInt(placeId))) {
        const polygon = polygonsRef.current[placeId];
        polygon.setMap(null);
        // Limpiar listeners de teclado
        if (polygon.keydownListener) {
          document.removeEventListener('keydown', polygon.keydownListener);
        }
        if (polygon.keydownSaveListener) {
          document.removeEventListener('keydown', polygon.keydownSaveListener);
        }
        delete polygonsRef.current[placeId];
      }
    });
  }, [places, map, activeFilters, mapClickMode]);

  // Actualizar estilo del polígono resaltado
  useEffect(() => {
    if (!map) return;

    // Actualizar todos los polígonos según si están resaltados o no
    Object.keys(polygonsRef.current).forEach(placeId => {
      const polygon = polygonsRef.current[placeId];
      if (!polygon) return;

      const place = places.find(p => p.id === parseInt(placeId));
      if (!place) return;

      const isHighlighted = highlightedPlace === parseInt(placeId);
      const isEditing = place.isDrawing;

      polygon.setOptions({
        strokeWeight: isHighlighted || isEditing ? 5 : 3,
        strokeOpacity: 1,
        strokeColor: isEditing ? '#8b5cf6' : (isHighlighted ? '#FFEB3B' : (place.color || '#eb4034')),
        fillOpacity: isHighlighted || isEditing ? 0.25 : 0.15,
      });
    });
  }, [highlightedPlace, places, map]);

  // Ocultar/mostrar polígonos según mapClickMode
  useEffect(() => {
    if (!map) return;

    Object.values(polygonsRef.current).forEach(polygon => {
      if (!polygon) return;
      polygon.setVisible(!mapClickMode);
    });
  }, [mapClickMode, map]);

  // Renderizar círculos
  useEffect(() => {
    if (!map || !places) return;

    places.forEach(place => {
      // Si el lugar tiene circle_radius
      if (place.circle_radius) {
        const filterCategory = getFilterCategory(place.color);
        const isVisible = activeFilters[filterCategory];

        // Determinar el radio a usar (editingRadius si se está editando, o el radio guardado)
        const radiusToUse = editingCircleId === place.id ? editingRadius : place.circle_radius;

        // Si ya está renderizado, solo actualizar opciones
        if (circlesRef.current[place.id]) {
          const existingCircle = circlesRef.current[place.id];
          existingCircle.setOptions({
            fillColor: place.color || '#8b5cf6',
            strokeColor: place.color || '#8b5cf6',
            radius: radiusToUse,
          });
          existingCircle.setVisible(isVisible);
          return;
        }

        // Si no está renderizado, crearlo
        const circle = new window.google.maps.Circle({
          strokeColor: place.color || '#8b5cf6',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: place.color || '#8b5cf6',
          fillOpacity: 0.35,
          map: map,
          center: { lat: place.lat, lng: place.lng },
          radius: radiusToUse,
        });

        // Add hover effect to circle
        circle.addListener('mouseover', function() {
          circle.setOptions({
            fillOpacity: 0.5,
            strokeWeight: 3,
          });
        });

        circle.addListener('mouseout', function() {
          circle.setOptions({
            fillOpacity: 0.35,
            strokeWeight: 2,
          });
        });

        // Add click event to circle
        circle.addListener('click', function() {
          if (onPolygonClick) {
            onPolygonClick(place.id);
          }
        });

        circlesRef.current[place.id] = circle;
      }
    });

    // Limpiar círculos de lugares eliminados
    Object.keys(circlesRef.current).forEach(placeId => {
      if (!places.find(p => p.id === parseInt(placeId))) {
        const circle = circlesRef.current[placeId];
        circle.setMap(null);
        delete circlesRef.current[placeId];
      }
    });
  }, [places, map, editingCircleId, editingRadius, activeFilters]);

  // Renderizar círculo temporal mientras se ajusta el radio
  useEffect(() => {
    if (!map) return;

    // Limpiar círculo temporal anterior
    if (tempCircleRef.current) {
      tempCircleRef.current.setMap(null);
      tempCircleRef.current = null;
    }

    // Crear nuevo círculo temporal si hay pendingCircle
    if (pendingCircle) {
      const circle = new window.google.maps.Circle({
        strokeColor: '#8b5cf6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#8b5cf6',
        fillOpacity: 0.35,
        map: map,
        center: { lat: pendingCircle.lat, lng: pendingCircle.lng },
        radius: circleRadius,
      });

      tempCircleRef.current = circle;
    }
  }, [pendingCircle, circleRadius, map]);

  // Función para guardar ediciones del polígono
  const savePolygonEdit = (placeId, polygon) => {
    const path = polygon.getPath();
    const coordinates = [];

    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push([point.lng(), point.lat()]);
    }

    // Cerrar el polígono
    coordinates.push([...coordinates[0]]);

    onSavePolygon(placeId, coordinates);
  };

  // Crear una clave única basada en los IDs de airbnbs para evitar recreaciones innecesarias
  const airbnbsKey = useMemo(() => {
    if (!airbnbs) return '';
    return airbnbs.map(a => a.id).sort().join(',');
  }, [airbnbs]);

  // Renderizar marcadores de Airbnb
  useEffect(() => {
    if (!map) return;

    // Limpiar marcadores anteriores
    airbnbMarkersRef.current.forEach(m => m.setMap(null));
    airbnbMarkersRef.current = [];

    if (!airbnbs || airbnbs.length === 0) return;

    // Crear nuevos marcadores para cada Airbnb con InfoWindow personalizado
    airbnbs.forEach(airbnb => {
      if (!airbnb.lat || !airbnb.lng) return;

      const priceLabel = airbnb.price ? airbnb.price.replace(/\s*MXN/, '') : '?';

      // Crear un contenedor con pestaña (pico)
      const container = document.createElement('div');
      container.style.cssText = `
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      `;

      // Crear el ícono de casa
      const homeIcon = document.createElement('img');
      homeIcon.src = '/icons/home-alt-svgrepo-com.svg';
      homeIcon.style.cssText = `
        width: 24px;
        height: 24px;
        margin-bottom: 4px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      `;

      // Crear el div de precio
      const priceDiv = document.createElement('div');
      priceDiv.style.cssText = `
        background: #374151;
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: bold;
        border: 1px solid #1f2937;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        z-index: 999999;
        position: relative;
      `;
      priceDiv.textContent = priceLabel;

      // Crear la pestaña/pico
      const pointer = document.createElement('div');
      pointer.style.cssText = `
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #374151;
        margin-top: -1px;
      `;

      container.appendChild(homeIcon);
      container.appendChild(priceDiv);
      container.appendChild(pointer);

      // Usar OverlayView para el marcador personalizado
      class PriceOverlay extends window.google.maps.OverlayView {
        constructor(position, div) {
          super();
          this.position = position;
          this.div = div;
        }

        onAdd() {
          const panes = this.getPanes();
          panes.floatPane.appendChild(this.div);
        }

        draw() {
          const projection = this.getProjection();
          const point = projection.fromLatLngToDivPixel(this.position);
          if (point) {
            this.div.style.left = point.x - (this.div.offsetWidth / 2) + 'px';
            this.div.style.top = point.y - this.div.offsetHeight - 15 + 'px';
            this.div.style.position = 'absolute';
          }
        }

        onRemove() {
          if (this.div.parentNode) {
            this.div.parentNode.removeChild(this.div);
          }
        }
      }

      const overlay = new PriceOverlay(
        new window.google.maps.LatLng(parseFloat(airbnb.lat), parseFloat(airbnb.lng)),
        container
      );
      overlay.setMap(map);

      airbnbMarkersRef.current.push(overlay);
    });

    // Forzar redibujado de overlays con un pequeño zoom in/out después de 1 segundo
    if (airbnbs.length > 0) {
      setTimeout(() => {
        const currentZoom = map.getZoom();
        map.setZoom(currentZoom + 0.0001);
        setTimeout(() => {
          map.setZoom(currentZoom);
        }, 10);
      }, 1000);
    }

    return () => {
      airbnbMarkersRef.current.forEach(m => m.setMap(null));
      airbnbMarkersRef.current = [];
    };
  }, [map, airbnbsKey]);

  // Manejar el modo de clic del mapa
  useEffect(() => {
    if (!map) return;

    // Limpiar listener anterior si existe
    if (mapClickListenerRef.current) {
      window.google.maps.event.removeListener(mapClickListenerRef.current);
      mapClickListenerRef.current = null;
    }

    // Limpiar marcador temporal anterior si existe
    if (tempMarkerRef.current) {
      tempMarkerRef.current.setMap(null);
      tempMarkerRef.current = null;
    }

    // Si el modo está activo, agregar listener
    if (mapClickMode && onMapClick) {
      mapClickListenerRef.current = map.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        // Crear marcador rojo temporal arrastrable
        if (tempMarkerRef.current) {
          tempMarkerRef.current.setMap(null);
        }

        tempMarkerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          animation: window.google.maps.Animation.DROP,
          draggable: true,
        });

        // Listener para cuando se arrastra el marcador
        tempMarkerRef.current.addListener('dragend', (dragEvent) => {
          const newLat = dragEvent.latLng.lat();
          const newLng = dragEvent.latLng.lng();
          onMapClick(newLat, newLng);
        });

        onMapClick(lat, lng);
      });
    }

    // Cambiar cursor del mapa
    if (mapRef.current) {
      mapRef.current.style.cursor = mapClickMode ? 'crosshair' : '';
    }

    // Ocultar polígonos cuando está activo el modo
    Object.values(polygonsRef.current).forEach(polygon => {
      if (polygon) {
        polygon.setVisible(!mapClickMode);
      }
    });

    return () => {
      if (mapClickListenerRef.current) {
        window.google.maps.event.removeListener(mapClickListenerRef.current);
        mapClickListenerRef.current = null;
      }
      if (tempMarkerRef.current) {
        tempMarkerRef.current.setMap(null);
        tempMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.style.cursor = '';
      }
      // Mostrar polígonos nuevamente
      Object.values(polygonsRef.current).forEach(polygon => {
        if (polygon) {
          polygon.setVisible(true);
        }
      });
    };
  }, [map, mapClickMode, onMapClick]);

  // Manejar tecla Escape para cerrar el menú FAB
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showFABMenu) {
        setShowFABMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showFABMenu]);

  // Calcular densidad de seguridad basada en las zonas visibles
  const calculateSafetyDensity = useMemo(() => {
    if (!places || places.length === 0) return { safe: 0, unsafe: 0, total: 0, percentage: 0 };

    const countryPlaces = selectedCountry
      ? places.filter(p => p.country_code === selectedCountry.country_code)
      : places;

    const safeZones = countryPlaces.filter(p => p.color === '#22c55e' || p.color === '#3b82f6').length;
    const unsafeZones = countryPlaces.filter(p => p.color === '#dc2626' || p.color === '#eab308').length;
    const total = countryPlaces.length;
    const percentage = total > 0 ? Math.round((safeZones / total) * 100) : 0;

    return { safe: safeZones, unsafe: unsafeZones, total, percentage };
  }, [places, selectedCountry]);

  return (
    <>
      <div className="relative w-full h-full">
        {/* Loading skeleton */}
        {isMapLoading && (
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 flex items-center justify-center animate-pulse">
            <div className="text-center">
              <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-semibold text-lg">Cargando mapa...</p>
              <p className="text-gray-500 text-sm mt-2">Preparando zonas de seguridad</p>
            </div>
          </div>
        )}

        {/* Map container */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Floating Safety Legend */}
        {!isMapLoading && showLegend && (
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-200 p-4 max-w-xs z-20 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                Niveles de Seguridad
              </h3>
              <button
                onClick={() => setShowLegend(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Ocultar leyenda"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 transition-all duration-200 group">
                <div className="w-8 h-4 rounded border-2 border-green-600 bg-green-500/20 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                <span className="text-xs font-medium text-gray-700">Zona Segura</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 group">
                <div className="w-8 h-4 rounded border-2 border-blue-600 bg-blue-500/20 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                <span className="text-xs font-medium text-gray-700">Seguridad Media</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 transition-all duration-200 group">
                <div className="w-8 h-4 rounded border-2 border-orange-600 bg-orange-500/20 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                <span className="text-xs font-medium text-gray-700">Seguridad Regular</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-50 transition-all duration-200 group">
                <div className="w-8 h-4 rounded border-2 border-yellow-600 bg-yellow-500/20 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                <span className="text-xs font-medium text-gray-700">Precaución</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 group">
                <div className="w-8 h-4 rounded border-2 border-red-600 bg-red-500/20 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200"></div>
                <span className="text-xs font-medium text-gray-700">Zona Insegura</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">
                📍 Haz clic en una zona para ver detalles
              </p>
            </div>
          </div>
        )}

        {/* Show legend button when hidden */}
        {!isMapLoading && !showLegend && (
          <button
            onClick={() => setShowLegend(true)}
            className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border-2 border-gray-200 p-3 z-20 hover:scale-110 transition-all duration-300 group animate-[fadeIn_0.3s_ease-out]"
            title="Mostrar leyenda"
          >
            <span className="text-2xl group-hover:scale-125 transition-transform duration-200 inline-block">🛡️</span>
          </button>
        )}

        {/* Safety Filters */}
        {!isMapLoading && (
          <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-gray-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔍</span>
                <span className="text-xs font-bold text-gray-700">Filtros de Seguridad</span>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, safe: !prev.safe }))}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300
                    ${activeFilters.safe
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }
                  `}
                  title="Mostrar/Ocultar zonas seguras"
                >
                  <span className={activeFilters.safe ? 'animate-pulse' : ''}>🟢</span>
                  <span>Seguro</span>
                  {!activeFilters.safe && <span className="ml-auto text-xs opacity-60">✕</span>}
                </button>

                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, medium: !prev.medium }))}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300
                    ${activeFilters.medium
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }
                  `}
                  title="Mostrar/Ocultar zonas de seguridad media"
                >
                  <span className={activeFilters.medium ? 'animate-pulse' : ''}>🔵</span>
                  <span>Medio</span>
                  {!activeFilters.medium && <span className="ml-auto text-xs opacity-60">✕</span>}
                </button>

                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, regular: !prev.regular }))}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300
                    ${activeFilters.regular
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }
                  `}
                  title="Mostrar/Ocultar zonas de seguridad regular"
                >
                  <span className={activeFilters.regular ? 'animate-pulse' : ''}>🟠</span>
                  <span>Regular</span>
                  {!activeFilters.regular && <span className="ml-auto text-xs opacity-60">✕</span>}
                </button>

                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, caution: !prev.caution }))}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300
                    ${activeFilters.caution
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-400 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }
                  `}
                  title="Mostrar/Ocultar zonas de precaución"
                >
                  <span className={activeFilters.caution ? 'animate-pulse' : ''}>🟡</span>
                  <span>Precaución</span>
                  {!activeFilters.caution && <span className="ml-auto text-xs opacity-60">✕</span>}
                </button>

                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, unsafe: !prev.unsafe }))}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300
                    ${activeFilters.unsafe
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }
                  `}
                  title="Mostrar/Ocultar zonas inseguras"
                >
                  <span className={activeFilters.unsafe ? 'animate-pulse' : ''}>🔴</span>
                  <span>Inseguro</span>
                  {!activeFilters.unsafe && <span className="ml-auto text-xs opacity-60">✕</span>}
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => setActiveFilters({ safe: true, medium: true, regular: true, caution: true, unsafe: true })}
                  className="w-full px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-xs font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
                  title="Mostrar todas las zonas"
                >
                  Mostrar Todas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Style Selector */}
        {!isMapLoading && (
          <div className="absolute top-6 left-6 z-20 map-style-selector">
            {/* Main button */}
            <button
              onClick={() => setShowStyleSelector(!showStyleSelector)}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-gray-200 px-4 py-3 hover:scale-105 transition-all duration-300 group flex items-center gap-2"
              title="Cambiar estilo del mapa"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200 inline-block">
                {MAP_STYLES[mapStyle].icon}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {MAP_STYLES[mapStyle].name}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showStyleSelector ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showStyleSelector && (
              <div className="absolute top-full mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden min-w-[200px] animate-[fadeIn_0.2s_ease-out]">
                {Object.entries(MAP_STYLES).map(([key, style]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setMapStyle(key);
                      setShowStyleSelector(false);
                    }}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 transition-all duration-200
                      ${mapStyle === key
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-600'
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-xl">{style.icon}</span>
                    <span className={`text-sm font-medium ${mapStyle === key ? 'text-blue-700 font-bold' : 'text-gray-700'}`}>
                      {style.name}
                    </span>
                    {mapStyle === key && (
                      <svg className="w-5 h-5 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Country Quick Selector - Positioned at top center */}
        {!isMapLoading && countries && countries.length > 0 && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 animate-[fadeIn_0.4s_ease-out]">
            <CountryQuickSelector
              countries={countries}
              selectedCountry={selectedCountry}
              onSelectCountry={onSelectCountry}
              places={places}
            />
          </div>
        )}

        {/* Map Search Box - Positioned below country selector */}
        {!isMapLoading && map && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4 animate-[fadeIn_0.5s_ease-out]">
            <MapSearchBox
              map={map}
              onPlaceSelected={(place) => {
                console.log('Lugar seleccionado:', place);
              }}
            />
          </div>
        )}

        {/* Quick Stats Panel - Bottom right */}
        {!isMapLoading && (
          <QuickStatsPanel
            places={places}
            selectedCountry={selectedCountry}
          />
        )}

        {/* Safety Density Indicator - Bottom center */}
        {!isMapLoading && showDensityIndicator && calculateSafetyDensity.total > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-[fadeIn_0.6s_ease-out]">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-200 p-4 min-w-[320px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <h3 className="font-bold text-sm text-gray-800">Índice de Seguridad</h3>
                </div>
                <button
                  onClick={() => setShowDensityIndicator(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  title="Ocultar indicador"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Barra de progreso de densidad */}
              <div className="relative mb-3">
                <div className="h-10 bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 rounded-full overflow-hidden shadow-inner border-2 border-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                    style={{ width: `${calculateSafetyDensity.percentage}%` }}
                  >
                    <span className="text-white font-bold text-sm drop-shadow-lg">
                      {calculateSafetyDensity.percentage}% Seguro
                    </span>
                  </div>
                </div>
              </div>

              {/* Estadísticas detalladas */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 border border-green-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-lg">🛡️</span>
                  </div>
                  <p className="text-xl font-bold text-green-700">{calculateSafetyDensity.safe}</p>
                  <p className="text-xs text-green-600 font-medium">Seguras</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-2 border border-red-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <p className="text-xl font-bold text-red-700">{calculateSafetyDensity.unsafe}</p>
                  <p className="text-xs text-red-600 font-medium">Riesgosas</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-lg">📍</span>
                  </div>
                  <p className="text-xl font-bold text-blue-700">{calculateSafetyDensity.total}</p>
                  <p className="text-xs text-blue-600 font-medium">Total</p>
                </div>
              </div>

              {/* Recomendación visual */}
              <div className={`mt-3 p-2 rounded-lg text-center ${
                calculateSafetyDensity.percentage >= 70
                  ? 'bg-green-50 border border-green-200'
                  : calculateSafetyDensity.percentage >= 40
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-xs font-semibold ${
                  calculateSafetyDensity.percentage >= 70
                    ? 'text-green-700'
                    : calculateSafetyDensity.percentage >= 40
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}>
                  {calculateSafetyDensity.percentage >= 70
                    ? '✅ Zona predominantemente segura'
                    : calculateSafetyDensity.percentage >= 40
                    ? '⚡ Zona mixta - Revisar con cuidado'
                    : '🚨 Precaución - Pocas zonas seguras'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botón para mostrar indicador cuando está oculto */}
        {!isMapLoading && !showDensityIndicator && calculateSafetyDensity.total > 0 && (
          <button
            onClick={() => setShowDensityIndicator(true)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border-2 border-gray-200 px-4 py-2 z-20 hover:scale-110 transition-all duration-300 group animate-[fadeIn_0.3s_ease-out] flex items-center gap-2"
            title="Mostrar índice de seguridad"
          >
            <span className="text-xl">📊</span>
            <span className="text-sm font-semibold text-gray-700">Índice</span>
          </button>
        )}

        {/* Floating Action Button (FAB) con menú de acciones rápidas */}
        {!isMapLoading && (
          <div className="fixed bottom-8 right-8 z-30 flex flex-col-reverse items-end gap-3">
            {/* Menú de acciones expandido */}
            {showFABMenu && (
              <div className="flex flex-col gap-2 mb-2 animate-[fadeIn_0.2s_ease-out]">
                {/* Acción: Toggle Leyenda */}
                <button
                  onClick={() => {
                    setShowLegend(!showLegend);
                    setShowFABMenu(false);
                  }}
                  className="group flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-gray-200 pl-4 pr-6 py-3 hover:scale-105 hover:shadow-xl transition-all duration-300"
                  title={showLegend ? "Ocultar leyenda" : "Mostrar leyenda"}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full text-white shadow-md group-hover:scale-110 transition-transform duration-200">
                    <span className="text-lg">{showLegend ? '🔒' : '🛡️'}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {showLegend ? 'Ocultar Leyenda' : 'Mostrar Leyenda'}
                  </span>
                </button>

                {/* Acción: Toggle Indicador de Densidad */}
                {calculateSafetyDensity.total > 0 && (
                  <button
                    onClick={() => {
                      setShowDensityIndicator(!showDensityIndicator);
                      setShowFABMenu(false);
                    }}
                    className="group flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-gray-200 pl-4 pr-6 py-3 hover:scale-105 hover:shadow-xl transition-all duration-300"
                    title={showDensityIndicator ? "Ocultar índice" : "Mostrar índice"}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full text-white shadow-md group-hover:scale-110 transition-transform duration-200">
                      <span className="text-lg">📊</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                      {showDensityIndicator ? 'Ocultar Índice' : 'Mostrar Índice'}
                    </span>
                  </button>
                )}

                {/* Acción: Restablecer Vista */}
                <button
                  onClick={() => {
                    if (map) {
                      map.setCenter({ lat: 0, lng: -70 });
                      map.setZoom(3.5);
                    }
                    setShowFABMenu(false);
                  }}
                  className="group flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-gray-200 pl-4 pr-6 py-3 hover:scale-105 hover:shadow-xl transition-all duration-300"
                  title="Restablecer vista del mapa"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full text-white shadow-md group-hover:scale-110 transition-transform duration-200">
                    <span className="text-lg">🌎</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    Vista Inicial
                  </span>
                </button>

                {/* Acción: Atajos de Teclado */}
                <button
                  onClick={() => {
                    alert('⌨️ Atajos de Teclado:\n\n' +
                      '• Delete: Eliminar punto del polígono\n' +
                      '• Enter: Guardar polígono editado\n' +
                      '• Doble clic: Eliminar vértice del polígono\n' +
                      '• Esc: Cerrar menú de acciones rápidas');
                    setShowFABMenu(false);
                  }}
                  className="group flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-gray-200 pl-4 pr-6 py-3 hover:scale-105 hover:shadow-xl transition-all duration-300"
                  title="Ver atajos de teclado"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 rounded-full text-white shadow-md group-hover:scale-110 transition-transform duration-200">
                    <span className="text-lg">⌨️</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    Atajos
                  </span>
                </button>
              </div>
            )}

            {/* Botón FAB principal */}
            <button
              onClick={() => setShowFABMenu(!showFABMenu)}
              className={`
                group w-16 h-16 flex items-center justify-center
                bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600
                rounded-full shadow-2xl border-3 border-white
                hover:scale-110 hover:rotate-90
                transition-all duration-300
                ${showFABMenu ? 'rotate-45 scale-110' : 'rotate-0'}
              `}
              title="Acciones rápidas"
            >
              <svg
                className="w-8 h-8 text-white transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d={showFABMenu ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"}
                />
              </svg>
            </button>

            {/* Indicador de ayuda pulsante */}
            {!showFABMenu && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar punto */}
      {vertexToDelete && deleteModalPosition && (
        <div
          className="fixed bg-white rounded-lg shadow-xl p-3 w-48 z-50 border border-gray-200"
          style={{
            left: `${deleteModalPosition.x}px`,
            top: `${deleteModalPosition.y}px`,
            transform: 'translate(-50%, -100%) translateY(-10px)'
          }}
        >
          <p className="text-xs text-gray-700 mb-3">¿Eliminar este punto?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setVertexToDelete(null);
                setDeleteModalPosition(null);
              }}
              className="flex-1 px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (vertexToDelete) {
                  vertexToDelete.path.removeAt(vertexToDelete.vertex);
                  setVertexToDelete(null);
                  setDeleteModalPosition(null);
                }
              }}
              className="flex-1 px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
