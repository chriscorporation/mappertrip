'use client';

import { useEffect, useRef, useState, useMemo } from 'react';

export default function GoogleMap({ selectedPlace, places, airbnbs, airbnbLocation, onSavePolygon, onPolygonClick, onBoundsChanged, coworkingPlaces, instagramablePlaces, mapClickMode, onMapClick, highlightedPlace }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [airbnbMarker, setAirbnbMarker] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const polygonsRef = useRef({});
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
      const bounds = new window.google.maps.LatLngBounds();
      selectedPlace.places.forEach(place => {
        bounds.extend({ lat: place.lat, lng: place.lng });
      });
      map.fitBounds(bounds);

      // Añadir padding para que no queden pegados a los bordes
      const padding = { top: 50, right: 50, bottom: 50, left: 50 };
      map.fitBounds(bounds, padding);

      // Forzar redibujado de overlays después de fitBounds
      setTimeout(() => {
        window.google.maps.event.trigger(map, 'resize');
      }, 100);
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
      // Icono de café/comunidad para coworking
      iconConfig = {
        path: 'M2 21h19v-3H2v3m16-6c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3h-3c-1.66 0-3 1.34-3 3v8c0 1.66 1.34 3 3 3m-9-8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3m0 1c-2 0-6 1-6 3v3h12v-3c0-2-4-3-6-3z',
        fillColor: '#8b5cf6',
        fillOpacity: 1,
        strokeColor: '#6d28d9',
        strokeWeight: 2,
        scale: 1.2,
        anchor: new window.google.maps.Point(12, 24),
      };
    } else if (isInstagramable) {
      // Icono de cámara para instagramable
      iconConfig = {
        path: 'M4 4h3l2-2h6l2 2h3c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2m8 3c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5m0 1.8c1.77 0 3.2 1.43 3.2 3.2s-1.43 3.2-3.2 3.2S8.8 13.77 8.8 12s1.43-3.2 3.2-3.2z',
        fillColor: '#ec4899',
        fillOpacity: 1,
        strokeColor: '#be185d',
        strokeWeight: 2,
        scale: 1.2,
        anchor: new window.google.maps.Point(12, 24),
      };
    } else {
      // Icono de casa por defecto (para Airbnb y zonas)
      iconConfig = {
        path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
        fillColor: '#ffffff',
        fillOpacity: 1,
        strokeColor: '#3b82f6',
        strokeWeight: 2,
        scale: 1.5,
        anchor: new window.google.maps.Point(12, 24),
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
      // Desactivar modo de dibujo y edición en todos los polígonos
      drawingManager.setDrawingMode(null);
      Object.values(polygonsRef.current).forEach(polygon => {
        if (polygon) polygon.setEditable(false);
      });
    }
  }, [places, drawingManager]);

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
      // Si el lugar tiene un polígono guardado pero no está renderizado
      if (place.polygon && !polygonsRef.current[place.id]) {
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
              if (confirm('¿Eliminar este punto del polígono?')) {
                path.removeAt(event.vertex);
                selectedVertex = null;
              }
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

        document.addEventListener('keydown', handleKeyDown);
        polygon.keydownListener = handleKeyDown;

        // Listener para guardar cambios cuando se edita
        window.google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
          savePolygonEdit(place.id, polygon);
        });

        window.google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
          savePolygonEdit(place.id, polygon);
        });

        // Listener para eliminar vértices
        window.google.maps.event.addListener(polygon.getPath(), 'remove_at', () => {
          savePolygonEdit(place.id, polygon);
        });

        polygonsRef.current[place.id] = polygon;
      } else if (place.polygon && polygonsRef.current[place.id]) {
        // Actualizar el color si el polígono ya existe
        polygonsRef.current[place.id].setOptions({
          fillColor: place.color || '#eb4034',
          strokeColor: place.color || '#eb4034',
        });
      }
    });

    // Limpiar polígonos de lugares eliminados
    Object.keys(polygonsRef.current).forEach(placeId => {
      if (!places.find(p => p.id === parseInt(placeId))) {
        const polygon = polygonsRef.current[placeId];
        polygon.setMap(null);
        // Limpiar listener de teclado
        if (polygon.keydownListener) {
          document.removeEventListener('keydown', polygon.keydownListener);
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

      polygon.setOptions({
        strokeWeight: isHighlighted ? 5 : 3,
        strokeOpacity: 1,
        strokeColor: isHighlighted ? '#FFEB3B' : (place.color || '#eb4034'),
        fillOpacity: isHighlighted ? 0.25 : 0.15,
      });
    });
  }, [highlightedPlace, places, map]);

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

  return <div ref={mapRef} className="w-full h-full" />;
}
