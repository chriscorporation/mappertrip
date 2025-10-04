'use client';

import { useMemo } from 'react';

/**
 * MapPreview - Componente de vista previa de mapa estilo Airbnb
 *
 * Genera un thumbnail estático del mapa usando Google Maps Static API
 * Optimizado para mobile-first, muestra una vista previa visual de la zona
 * antes de que el usuario interactúe con el mapa principal.
 */
export default function MapPreview({ place, className = '' }) {
  // Generar URL de mapa estático usando Google Maps Static API
  const mapUrl = useMemo(() => {
    if (!place || !place.lat || !place.lng) return null;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const size = '280x160'; // Tamaño optimizado para cards mobile
    const zoom = place.circle_radius ? 13 : 14; // Zoom según tipo de zona
    const center = `${place.lat},${place.lng}`;

    // Estilo del mapa (light mode, estilo Airbnb)
    const style = [
      'feature:poi|visibility:off', // Ocultar POIs para limpieza visual
      'feature:transit|visibility:simplified',
      'feature:road|element:labels|visibility:simplified',
    ].map(s => `style=${encodeURIComponent(s)}`).join('&');

    // Marcador personalizado según el color de la zona
    const markerColor = place.color ? place.color.replace('#', '0x') : '0x22c55e';
    const marker = `color:${markerColor}|${center}`;

    // Si tiene círculo, dibujarlo en el mapa estático
    let path = '';
    if (place.circle_radius) {
      // Generar puntos del círculo para path
      const radius = place.circle_radius;
      const points = 32; // Número de puntos para aproximar el círculo
      const circlePoints = [];

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const dx = radius * Math.cos(angle);
        const dy = radius * Math.sin(angle);

        // Convertir metros a grados (aproximación)
        const deltaLat = dy / 111320;
        const deltaLng = dx / (111320 * Math.cos(place.lat * Math.PI / 180));

        const lat = place.lat + deltaLat;
        const lng = place.lng + deltaLng;
        circlePoints.push(`${lat},${lng}`);
      }

      const pathColor = place.color ? place.color.replace('#', '0x') : '0x8b5cf6';
      path = `&path=color:${pathColor}80|weight:2|fillcolor:${pathColor}20|${circlePoints.join('|')}`;
    }

    // Si tiene polígono, dibujarlo en el mapa estático
    if (place.polygon && place.polygon.length > 0) {
      const pathColor = place.color ? place.color.replace('#', '0x') : '0xeb4034';
      const polygonPoints = place.polygon.map(coord => `${coord[1]},${coord[0]}`).join('|');
      path = `&path=color:${pathColor}|weight:3|fillcolor:${pathColor}26|${polygonPoints}`;
    }

    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${size}&maptype=roadmap&markers=${marker}&${style}${path}&key=${apiKey}`;
  }, [place]);

  if (!mapUrl) return null;

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <img
        src={mapUrl}
        alt={`Vista previa del mapa de ${place.address}`}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
      {/* Overlay sutil con gradiente estilo Airbnb */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

      {/* Indicador de tipo de zona */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium shadow-sm">
        {place.circle_radius ? '⭕ Circular' : place.polygon ? '📍 Delimitada' : '📌 Punto'}
      </div>
    </div>
  );
}
