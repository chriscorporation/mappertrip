'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as turf from '@turf/turf';
import MapLegend from './MapLegend';
import ZoomIndicator from './ZoomIndicator';
import ZoneTooltip from './ZoneTooltip';
import CompareZones from './CompareZones';
import UserLocationIndicator from './UserLocationIndicator';

export default function GoogleMap({ selectedPlace, places, airbnbs, airbnbLocation, onSavePolygon, onPolygonClick, onBoundsChanged, coworkingPlaces, instagramablePlaces, mapClickMode, onMapClick, highlightedPlace, pendingCircle, circleRadius, editingCircleId, editingRadius, visibleLevels, onToggleLevelVisibility, selectedCountry }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
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
  const [hoveredZone, setHoveredZone] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [insecurityLevels, setInsecurityLevels] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [heatmapLayer, setHeatmapLayer] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [colorPalette, setColorPalette] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showSafeRoutes, setShowSafeRoutes] = useState(false);
  const routeLinesRef = useRef([]);

  // Cargar niveles de inseguridad para tooltips
  useEffect(() => {
    const loadInsecurityLevels = async () => {
      try {
        const response = await fetch('/api/insecurity-levels');
        const levels = await response.json();
        if (levels) {
          setInsecurityLevels(levels);
        }
      } catch (error) {
        console.error('Error loading insecurity levels:', error);
      }
    };

    loadInsecurityLevels();
  }, []);

  // Escuchar cambios de paleta de colores
  useEffect(() => {
    const handlePaletteChange = (event) => {
      setColorPalette(event.detail);
    };

    window.addEventListener('paletteChange', handlePaletteChange);

    return () => {
      window.removeEventListener('paletteChange', handlePaletteChange);
    };
  }, []);

  useEffect(() => {
    const loadGoogleMaps = () => {
      // Verificar si el script ya está cargado
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // Crear y cargar el script de Google Maps con la librería de visualización
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,drawing,visualization`;
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

      // Estilos personalizados para el mapa - enfocado en seguridad y claridad
      const mapStyles = [
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#525252' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { weight: 2 }]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#c9c9c9' }, { weight: 1.2 }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }]
        },
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ visibility: 'on' }, { color: '#e8f5e9' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }]
        },
        {
          featureType: 'road',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#fef7e6' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#fbc02d' }, { weight: 0.8 }]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }]
        },
        {
          featureType: 'transit',
          elementType: 'all',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#e3f2fd' }]
        }
      ];

      // Crear el mapa usando la API global de Google Maps con estilos personalizados
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom: 3.5,
        styles: mapStyles,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      setMap(newMap);

      // Esperar a que la librería visualization esté disponible para el heatmap
      const waitForVisualization = () => {
        return new Promise((resolve) => {
          const checkVisualization = () => {
            if (window.google?.maps?.visualization?.HeatmapLayer) {
              resolve();
            } else {
              setTimeout(checkVisualization, 100);
            }
          };
          checkVisualization();
        });
      };

      waitForVisualization().catch(() => {
        console.warn('Visualization library not available for heatmap');
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
      // Filtrar solo lugares activos (excluir active = null)
      const activePlaces = selectedPlace.places.filter(p => p.active !== null);

      // Función para intentar fitBounds
      const attemptFitBounds = () => {
        setIsNavigating(true);

        const bounds = new window.google.maps.LatLngBounds();
        let hasValidBounds = false;

        activePlaces.forEach(place => {
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
            setIsNavigating(false);
          }, 800);
        } else {
          setIsNavigating(false);
        }
      };

      // Verificar si todas las formas (polígonos/círculos) están renderizadas
      const allShapesRendered = activePlaces.every(place => {
        if (place.polygon) {
          return polygonsRef.current[place.id] !== undefined;
        }
        if (place.circle_radius) {
          return circlesRef.current[place.id] !== undefined;
        }
        return true; // Si no tiene ninguna forma, considerar como renderizado
      });

      console.log('[GoogleMap] fitBounds requested for', activePlaces.length, 'places');
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
          const nowAllShapesRendered = activePlaces.every(place => {
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

    // Indicar que estamos navegando
    setIsNavigating(true);

    // Cancelar animación previa si existe
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Animación personalizada con aceleración mejorada
    const start = map.getCenter();
    const startLat = start.lat();
    const startLng = start.lng();
    const targetLat = position.lat;
    const targetLng = position.lng;
    const startZoom = map.getZoom();
    const duration = 800; // 800ms de duración para suavidad
    const startTime = performance.now();

    // Función de easing mejorada (ease-in-out-quart)
    const easeInOutQuart = (t) => {
      return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    };

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuart(progress);

      const currentLat = startLat + (targetLat - startLat) * eased;
      const currentLng = startLng + (targetLng - startLng) * eased;

      map.setCenter({ lat: currentLat, lng: currentLng });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
        setIsNavigating(false);
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

    // Crear el marcador en el centro con animación mejorada
    const newMarker = new window.google.maps.Marker({
      position: position,
      map: map,
      title: selectedPlace.address || selectedPlace.title || selectedPlace.description,
      animation: window.google.maps.Animation.BOUNCE,
      icon: iconConfig
    });

    // Detener animación de rebote después de 2 segundos para un efecto más sutil
    setTimeout(() => {
      if (newMarker) {
        newMarker.setAnimation(null);
      }
    }, 1400);

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

    // Filtrar solo lugares activos (excluir active = null)
    const activePlaces = places.filter(p => p.active !== null);

    activePlaces.forEach(place => {
      // Si el lugar tiene un polígono guardado
      if (place.polygon) {
        // Verificar si el nivel de seguridad está visible
        const isLevelVisible = visibleLevels ? visibleLevels[place.safety_level_id] !== false : true;

        // Determinar el color a usar (paleta personalizada o color por defecto)
        const displayColor = colorPalette?.colors?.[place.safety_level_id] || place.color || '#FFD700';

        // Si ya está renderizado, solo actualizar opciones y visibilidad
        if (polygonsRef.current[place.id]) {
          const existingPolygon = polygonsRef.current[place.id];
          existingPolygon.setOptions({
            fillColor: displayColor,
            strokeColor: displayColor,
          });
          existingPolygon.setVisible(isLevelVisible);
          return;
        }

        // Si no debe ser visible, no crearlo
        if (!isLevelVisible) return;

        // Si no está renderizado, crearlo
        let coordinates;

        try {
          // Crear polígono de Turf para aplicar buffer negativo (inset)
          const turfPolygon = turf.polygon([place.polygon]);
          // Aplicar buffer negativo de -30 metros (-0.03 km) para crear "aire" entre polígonos
          const buffered = turf.buffer(turfPolygon, -0.03, { units: 'kilometers' });

          if (buffered && buffered.geometry && buffered.geometry.coordinates && buffered.geometry.coordinates[0]) {
            // Usar coordenadas con buffer negativo aplicado
            coordinates = buffered.geometry.coordinates[0].map(coord => ({
              lat: coord[1],
              lng: coord[0]
            }));
          } else {
            // Fallback: usar coordenadas originales si el buffer falla
            coordinates = place.polygon.map(coord => ({
              lat: coord[1],
              lng: coord[0]
            }));
          }
        } catch (error) {
          // Si hay error con Turf, usar coordenadas originales
          console.warn('Error applying buffer to polygon:', error);
          coordinates = place.polygon.map(coord => ({
            lat: coord[1],
            lng: coord[0]
          }));
        }

        const polygon = new window.google.maps.Polygon({
          paths: coordinates,
          fillColor: displayColor,
          fillOpacity: 0.15,
          strokeWeight: 3,
          strokeColor: displayColor,
          editable: false,
          map: map,
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

        // Listener para mostrar tooltip al pasar el mouse
        window.google.maps.event.addListener(polygon, 'mousemove', (event) => {
          if (!polygon.getEditable()) {
            setHoveredZone(place);
            setTooltipPosition({ x: event.domEvent.clientX, y: event.domEvent.clientY });
          }
        });

        // Listener para ocultar tooltip al salir del polígono
        window.google.maps.event.addListener(polygon, 'mouseout', () => {
          setHoveredZone(null);
          setTooltipPosition(null);
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

    // Limpiar polígonos de lugares eliminados o inactivos
    Object.keys(polygonsRef.current).forEach(placeId => {
      const place = places.find(p => p.id === parseInt(placeId));
      // Eliminar si no existe o si está inactivo (active = null)
      if (!place || place.active === null) {
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
  }, [places, map, visibleLevels, colorPalette]);

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
        strokeColor: isEditing ? '#8b5cf6' : (isHighlighted ? '#FFEB3B' : (place.color || '#FFD700')),
        fillOpacity: isHighlighted || isEditing ? 0.25 : 0.15,
        zIndex: isHighlighted ? 1000 : 1,
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

    // Filtrar solo lugares activos (excluir active = null)
    const activePlaces = places.filter(p => p.active !== null);

    activePlaces.forEach(place => {
      // Verificar que NO sea coworking ni instagramable antes de pintar círculo
      const isCoworkingPlace = coworkingPlaces?.some(p => p.id === place.id);
      const isInstagramablePlace = instagramablePlaces?.some(p => p.id === place.id);

      // Si el lugar tiene circle_radius Y NO es coworking ni instagramable
      if (place.circle_radius && !isCoworkingPlace && !isInstagramablePlace) {
        // Verificar si el nivel de seguridad está visible
        const isLevelVisible = visibleLevels ? visibleLevels[place.safety_level_id] !== false : true;

        // Determinar el color a usar (paleta personalizada o color por defecto)
        const displayColor = colorPalette?.colors?.[place.safety_level_id] || place.color || '#8b5cf6';

        // Determinar el radio a usar (editingRadius si se está editando, o el radio guardado)
        const radiusToUse = editingCircleId === place.id ? editingRadius : place.circle_radius;
        const isHighlighted = highlightedPlace === place.id;
        const isEditing = editingCircleId === place.id;

        // Si ya está renderizado, solo actualizar opciones y visibilidad
        if (circlesRef.current[place.id]) {
          const existingCircle = circlesRef.current[place.id];
          existingCircle.setOptions({
            fillColor: displayColor,
            strokeColor: isEditing ? '#8b5cf6' : (isHighlighted ? '#FFEB3B' : displayColor),
            strokeWeight: isHighlighted || isEditing ? 4 : 2,
            fillOpacity: isHighlighted || isEditing ? 0.45 : 0.35,
            radius: radiusToUse,
          });
          existingCircle.setVisible(isLevelVisible);
          return;
        }

        // Si no debe ser visible, no crearlo
        if (!isLevelVisible) return;

        // Si no está renderizado, crearlo
        const circle = new window.google.maps.Circle({
          strokeColor: isEditing ? '#8b5cf6' : (isHighlighted ? '#FFEB3B' : displayColor),
          strokeOpacity: 0.8,
          strokeWeight: isHighlighted || isEditing ? 4 : 2,
          fillColor: displayColor,
          fillOpacity: isHighlighted || isEditing ? 0.45 : 0.35,
          map: map,
          center: { lat: place.lat, lng: place.lng },
          radius: radiusToUse,
        });

        // Agregar listener de clic para seleccionar el círculo
        circle.addListener('click', function() {
          if (onPolygonClick) {
            onPolygonClick(place.id);
          }
        });

        // Listener para mostrar tooltip al pasar el mouse
        circle.addListener('mousemove', function(event) {
          if (!editingCircleId || editingCircleId !== place.id) {
            setHoveredZone(place);
            setTooltipPosition({ x: event.domEvent.clientX, y: event.domEvent.clientY });
          }
        });

        // Listener para ocultar tooltip al salir del círculo
        circle.addListener('mouseout', function() {
          setHoveredZone(null);
          setTooltipPosition(null);
        });

        circlesRef.current[place.id] = circle;
      }
    });

    // Limpiar círculos de lugares eliminados, inactivos o que ahora sean coworking/instagramable
    Object.keys(circlesRef.current).forEach(placeId => {
      const place = places.find(p => p.id === parseInt(placeId));
      const isCoworkingPlace = coworkingPlaces?.some(p => p.id === parseInt(placeId));
      const isInstagramablePlace = instagramablePlaces?.some(p => p.id === parseInt(placeId));

      // Eliminar círculo si el lugar fue eliminado O si está inactivo O si ahora es coworking/instagramable
      if (!place || place.active === null || isCoworkingPlace || isInstagramablePlace) {
        const circle = circlesRef.current[placeId];
        circle.setMap(null);
        delete circlesRef.current[placeId];
      }
    });
  }, [places, map, editingCircleId, editingRadius, highlightedPlace, coworkingPlaces, instagramablePlaces, visibleLevels, colorPalette]);

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

  // Renderizar líneas de conexión entre zonas seguras
  useEffect(() => {
    if (!map) return;

    // Limpiar líneas anteriores
    routeLinesRef.current.forEach(line => line.setMap(null));
    routeLinesRef.current = [];

    // Si no se deben mostrar las rutas, salir
    if (!showSafeRoutes) return;

    // Filtrar solo lugares activos del país seleccionado
    const activePlaces = places.filter(p =>
      p.active !== null &&
      (!selectedCountry || p.country_code === selectedCountry.country_code)
    );

    if (activePlaces.length < 2) return;

    // Agrupar zonas por nivel de seguridad
    const zonesByLevel = {};
    activePlaces.forEach(place => {
      const levelId = place.safety_level_id ?? 0;
      if (!zonesByLevel[levelId]) {
        zonesByLevel[levelId] = [];
      }
      zonesByLevel[levelId].push(place);
    });

    // Para cada nivel de seguridad, conectar zonas cercanas
    Object.entries(zonesByLevel).forEach(([levelId, zones]) => {
      if (zones.length < 2) return;

      // Obtener el nivel de seguridad para determinar el color
      const level = insecurityLevels.find(l => l.id === parseInt(levelId));
      const lineColor = colorPalette?.colors?.[levelId] || level?.color || '#60a5fa';

      // Conectar cada zona con sus vecinas más cercanas (máximo 2 conexiones por zona)
      zones.forEach((zone, index) => {
        // Calcular distancias a todas las demás zonas
        const distances = zones
          .map((otherZone, otherIndex) => {
            if (index === otherIndex) return null;

            // Calcular distancia euclidiana simple
            const latDiff = zone.lat - otherZone.lat;
            const lngDiff = zone.lng - otherZone.lng;
            const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

            return { zone: otherZone, distance, index: otherIndex };
          })
          .filter(d => d !== null)
          .sort((a, b) => a.distance - b.distance);

        // Conectar solo con las 2 zonas más cercanas para evitar saturar el mapa
        const connectionsToMake = distances.slice(0, 2);

        connectionsToMake.forEach(({ zone: targetZone, distance }) => {
          // Evitar líneas duplicadas (solo dibujar si el índice actual es menor)
          const targetIndex = zones.findIndex(z => z.id === targetZone.id);
          if (index >= targetIndex) return;

          // Calcular distancia real en km (aproximación)
          const R = 6371; // Radio de la Tierra en km
          const dLat = (targetZone.lat - zone.lat) * Math.PI / 180;
          const dLon = (targetZone.lng - zone.lng) * Math.PI / 180;
          const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(zone.lat * Math.PI / 180) * Math.cos(targetZone.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distanceKm = R * c;

          // Solo mostrar líneas si la distancia es razonable (< 50km)
          if (distanceKm > 50) return;

          // Crear polyline entre las dos zonas
          const line = new window.google.maps.Polyline({
            path: [
              { lat: zone.lat, lng: zone.lng },
              { lat: targetZone.lat, lng: targetZone.lng }
            ],
            geodesic: true,
            strokeColor: lineColor,
            strokeOpacity: 0.4,
            strokeWeight: 2,
            map: map,
            icons: [{
              icon: {
                path: window.google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                scale: 2,
                strokeColor: lineColor,
                strokeOpacity: 0.6
              },
              offset: '50%'
            }]
          });

          // Crear etiqueta de distancia en el punto medio
          const midLat = (zone.lat + targetZone.lat) / 2;
          const midLng = (zone.lng + targetZone.lng) / 2;

          // Crear overlay personalizado para la etiqueta
          class DistanceLabel extends window.google.maps.OverlayView {
            constructor(position, distance) {
              super();
              this.position = position;
              this.distance = distance;
              this.div = null;
            }

            onAdd() {
              const div = document.createElement('div');
              div.style.cssText = `
                position: absolute;
                background: white;
                color: ${lineColor};
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                border: 1px solid ${lineColor};
                white-space: nowrap;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                pointer-events: none;
              `;
              div.textContent = `${distanceKm.toFixed(1)} km`;
              this.div = div;

              const panes = this.getPanes();
              panes.overlayLayer.appendChild(div);
            }

            draw() {
              const projection = this.getProjection();
              const point = projection.fromLatLngToDivPixel(this.position);
              if (point && this.div) {
                this.div.style.left = point.x - (this.div.offsetWidth / 2) + 'px';
                this.div.style.top = point.y - (this.div.offsetHeight / 2) + 'px';
              }
            }

            onRemove() {
              if (this.div && this.div.parentNode) {
                this.div.parentNode.removeChild(this.div);
                this.div = null;
              }
            }
          }

          const label = new DistanceLabel(
            new window.google.maps.LatLng(midLat, midLng),
            distanceKm
          );
          label.setMap(map);

          routeLinesRef.current.push(line);
          routeLinesRef.current.push(label);
        });
      });
    });

    return () => {
      routeLinesRef.current.forEach(line => line.setMap(null));
      routeLinesRef.current = [];
    };
  }, [map, places, showSafeRoutes, selectedCountry, insecurityLevels, colorPalette]);

  // Crear y actualizar heatmap de densidad de seguridad
  useEffect(() => {
    if (!map || !window.google?.maps?.visualization?.HeatmapLayer) return;

    // Limpiar heatmap anterior si existe
    if (heatmapLayer) {
      heatmapLayer.setMap(null);
    }

    // Si no se debe mostrar el heatmap, salir
    if (!showHeatmap) {
      setHeatmapLayer(null);
      return;
    }

    // Filtrar solo lugares activos del país seleccionado
    const activePlaces = places.filter(p =>
      p.active !== null &&
      (!selectedCountry || p.country_code === selectedCountry.country_code)
    );

    if (activePlaces.length === 0) {
      setHeatmapLayer(null);
      return;
    }

    // Crear puntos ponderados para el heatmap
    const heatmapData = [];

    activePlaces.forEach(place => {
      // Determinar el peso basado en el nivel de seguridad
      // Niveles más seguros (id bajo) = peso positivo (verde)
      // Niveles menos seguros (id alto) = peso negativo simulado con menos intensidad
      let weight = 1;

      // Mapeo de safety_level_id a peso
      // 1 (Seguro) = máximo peso positivo
      // 2 (Medio) = peso medio-alto
      // 3 (Regular) = peso medio
      // 4 (Precaución) = peso bajo
      // 5 (Inseguro) = peso mínimo
      switch(place.safety_level_id) {
        case 1: weight = 5; break;  // Seguro - máxima intensidad verde
        case 2: weight = 3; break;  // Medio - intensidad media-alta
        case 3: weight = 2; break;  // Regular - intensidad media
        case 4: weight = 1; break;  // Precaución - baja intensidad
        case 5: weight = 0.5; break; // Inseguro - mínima intensidad
        default: weight = 1;
      }

      // Agregar puntos del polígono si existe
      if (place.polygon && Array.isArray(place.polygon)) {
        place.polygon.forEach(coord => {
          heatmapData.push({
            location: new window.google.maps.LatLng(coord[1], coord[0]),
            weight: weight
          });
        });
      }

      // Agregar punto central del círculo si existe
      if (place.circle_radius) {
        heatmapData.push({
          location: new window.google.maps.LatLng(place.lat, place.lng),
          weight: weight * 3 // Mayor peso al centro
        });

        // Agregar puntos alrededor del círculo para mejor cobertura
        const steps = 12;
        for (let i = 0; i < steps; i++) {
          const angle = (i / steps) * 2 * Math.PI;
          const radius = place.circle_radius;
          const lat = place.lat + (radius / 111320) * Math.cos(angle);
          const lng = place.lng + (radius / (111320 * Math.cos(place.lat * Math.PI / 180))) * Math.sin(angle);

          heatmapData.push({
            location: new window.google.maps.LatLng(lat, lng),
            weight: weight
          });
        }
      }

      // Si no tiene ni polígono ni círculo, usar punto central
      if (!place.polygon && !place.circle_radius) {
        heatmapData.push({
          location: new window.google.maps.LatLng(place.lat, place.lng),
          weight: weight
        });
      }
    });

    if (heatmapData.length === 0) {
      setHeatmapLayer(null);
      return;
    }

    // Crear gradiente personalizado (verde = seguro, amarillo = medio, rojo = inseguro)
    const gradient = [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(0, 127, 255, 1)',
      'rgba(0, 63, 255, 1)',
      'rgba(0, 0, 255, 1)',
      'rgba(0, 0, 223, 1)',
      'rgba(0, 0, 191, 1)',
      'rgba(0, 255, 0, 1)',
      'rgba(63, 255, 0, 1)',
      'rgba(127, 255, 0, 1)',
      'rgba(191, 255, 0, 1)',
      'rgba(255, 255, 0, 1)'
    ];

    // Crear nueva capa de heatmap
    const newHeatmapLayer = new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map,
      radius: 40, // Radio de influencia de cada punto
      opacity: 0.6, // Opacidad general del heatmap
      gradient: gradient,
      dissipating: true, // Puntos se disipan gradualmente
      maxIntensity: 5 // Intensidad máxima (coincide con el peso de zonas seguras)
    });

    setHeatmapLayer(newHeatmapLayer);

    return () => {
      if (newHeatmapLayer) {
        newHeatmapLayer.setMap(null);
      }
    };
  }, [map, places, showHeatmap, selectedCountry]);

  return (
    <>
      <div ref={mapRef} className="w-full h-full" />

      {/* Navigation Loading Indicator - Subtle feedback during viewport transitions */}
      {isNavigating && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-2xl px-6 py-4 flex items-center gap-3 border border-gray-200 animate-fadeIn">
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <span className="text-sm font-semibold text-gray-700">Navegando...</span>
          </div>
        </div>
      )}

      {/* Zone Tooltip - Contextual information on hover */}
      {hoveredZone && tooltipPosition && (
        <ZoneTooltip
          zone={hoveredZone}
          position={tooltipPosition}
          insecurityLevels={insecurityLevels}
        />
      )}

      {/* Zoom Indicator - Contextual zoom guidance */}
      <ZoomIndicator map={map} />

      {/* Map Legend - Safety Levels */}
      <MapLegend
        visibleLevels={visibleLevels}
        onToggleLevel={onToggleLevelVisibility}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
      />

      {/* Safe Routes Button - Only show when country is selected and has zones */}
      {selectedCountry && places.filter(p => p.country_code === selectedCountry.country_code && p.active !== null).length >= 2 && (
        <button
          onClick={() => setShowSafeRoutes(!showSafeRoutes)}
          className={`absolute top-4 right-4 bg-white rounded-full shadow-xl px-4 py-3 flex items-center gap-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 group z-[999] ${
            showSafeRoutes ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          aria-label="Ver rutas entre zonas"
          title="Muestra conexiones entre zonas del mismo nivel de seguridad"
        >
          <svg
            className={`w-5 h-5 transition-all duration-300 ${
              showSafeRoutes ? 'text-blue-600 rotate-90' : 'text-gray-600 group-hover:text-blue-600'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span className={`text-sm font-semibold transition-colors ${
            showSafeRoutes ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'
          }`}>
            {showSafeRoutes ? 'Ocultar rutas' : 'Ver rutas'}
          </span>
        </button>
      )}

      {/* Compare Zones Button - Only show when country is selected and has zones */}
      {selectedCountry && places.filter(p => p.country_code === selectedCountry.country_code && p.active !== null).length >= 2 && (
        <button
          onClick={() => setIsCompareModalOpen(true)}
          className="absolute top-20 right-4 bg-white rounded-full shadow-xl px-4 py-3 flex items-center gap-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 group z-[999]"
          aria-label="Comparar zonas"
        >
          <svg
            className="w-5 h-5 text-purple-600 group-hover:rotate-12 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
            Comparar
          </span>
        </button>
      )}

      {/* Compare Zones Modal */}
      <CompareZones
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        zones={places}
        selectedCountry={selectedCountry}
      />

      {/* User Location Indicator - Shows user's current position and nearby safety zones */}
      <UserLocationIndicator
        map={map}
        places={places}
        insecurityLevels={insecurityLevels}
        selectedCountry={selectedCountry}
      />

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
