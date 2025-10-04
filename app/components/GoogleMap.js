'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import SkeletonLoader from './SkeletonLoader';

export default function GoogleMap({ selectedPlace, places, safetyFilters = [], airbnbs, airbnbLocation, onSavePolygon, onPolygonClick, onBoundsChanged, coworkingPlaces, instagramablePlaces, mapClickMode, onMapClick, highlightedPlace, pendingCircle, circleRadius, editingCircleId, editingRadius }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
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

      // Crear el mapa usando la API global de Google Maps
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom: 3.5,
      });

      setMap(newMap);
      setMapLoading(false);

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
        // Si ya está renderizado, solo actualizar opciones
        if (polygonsRef.current[place.id]) {
          const existingPolygon = polygonsRef.current[place.id];
          existingPolygon.setOptions({
            fillColor: place.color || '#eb4034',
            strokeColor: place.color || '#eb4034',
          });
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
  }, [places, map]);

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

  // Ocultar/mostrar polígonos según mapClickMode y safetyFilters
  useEffect(() => {
    if (!map) return;

    // Mapeo de filtros de seguridad a colores
    const safetyLevelToColor = {
      'safe': '#22c55e',      // green-500
      'medium': '#3b82f6',    // blue-500
      'regular': '#eab308',   // yellow-500
      'caution': '#f97316',   // orange-500
      'unsafe': '#ef4444'     // red-500
    };

    const filterColors = safetyFilters.length > 0
      ? safetyFilters.map(filter => safetyLevelToColor[filter])
      : [];

    Object.keys(polygonsRef.current).forEach(placeId => {
      const polygon = polygonsRef.current[placeId];
      if (!polygon) return;

      const place = places.find(p => p.id === parseInt(placeId));
      if (!place) return;

      // Ocultar si está en mapClickMode
      if (mapClickMode) {
        polygon.setVisible(false);
        return;
      }

      // Si hay filtros activos, solo mostrar polígonos que coincidan
      if (filterColors.length > 0) {
        polygon.setVisible(filterColors.includes(place.color));
      } else {
        polygon.setVisible(true);
      }
    });
  }, [mapClickMode, map, safetyFilters, places]);

  // Renderizar círculos y aplicar filtros de seguridad
  useEffect(() => {
    if (!map || !places) return;

    // Mapeo de filtros de seguridad a colores
    const safetyLevelToColor = {
      'safe': '#22c55e',      // green-500
      'medium': '#3b82f6',    // blue-500
      'regular': '#eab308',   // yellow-500
      'caution': '#f97316',   // orange-500
      'unsafe': '#ef4444'     // red-500
    };

    const filterColors = safetyFilters.length > 0
      ? safetyFilters.map(filter => safetyLevelToColor[filter])
      : [];

    places.forEach(place => {
      // Si el lugar tiene circle_radius
      if (place.circle_radius) {
        // Determinar el radio a usar (editingRadius si se está editando, o el radio guardado)
        const radiusToUse = editingCircleId === place.id ? editingRadius : place.circle_radius;

        // Determinar si el círculo debe ser visible según los filtros
        const shouldBeVisible = filterColors.length === 0 || filterColors.includes(place.color);

        // Si ya está renderizado, solo actualizar opciones
        if (circlesRef.current[place.id]) {
          const existingCircle = circlesRef.current[place.id];
          existingCircle.setOptions({
            fillColor: place.color || '#8b5cf6',
            strokeColor: place.color || '#8b5cf6',
            radius: radiusToUse,
            visible: shouldBeVisible,
          });
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
          visible: shouldBeVisible,
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
  }, [places, map, editingCircleId, editingRadius, safetyFilters]);

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

  return (
    <>
      {mapLoading && (
        <div className="absolute inset-0 z-10">
          <SkeletonLoader variant="map" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />

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
