'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import SkeletonLoader from './SkeletonLoader';

// Función para convertir country_code a emoji de bandera
const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

// Mapeo de países a imágenes representativas (usando Unsplash)
const countryImages = {
  'ar': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=400&h=250&fit=crop',  // Buenos Aires
  'bo': 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=400&h=250&fit=crop',  // Bolivia - Salar de Uyuni
  'br': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=250&fit=crop',  // Rio de Janeiro
  'cl': 'https://images.unsplash.com/photo-1489171078254-c3365d6e359f?w=400&h=250&fit=crop',  // Chile - Torres del Paine
  'co': 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=400&h=250&fit=crop',  // Colombia - Cartagena
  'cr': 'https://images.unsplash.com/photo-1621738458786-69b3f98d9446?w=400&h=250&fit=crop',  // Costa Rica
  'cu': 'https://images.unsplash.com/photo-1553204688-09b6149fe1ec?w=400&h=250&fit=crop',  // Cuba - Habana
  'do': 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400&h=250&fit=crop',  // República Dominicana
  'ec': 'https://images.unsplash.com/photo-1612808329838-ab7e0089c0b7?w=400&h=250&fit=crop',  // Ecuador - Quito
  'sv': 'https://images.unsplash.com/photo-1612965110667-df66638b6b25?w=400&h=250&fit=crop',  // El Salvador
  'gt': 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400&h=250&fit=crop',  // Guatemala
  'hn': 'https://images.unsplash.com/photo-1620121684840-edffcfc4b878?w=400&h=250&fit=crop',  // Honduras
  'mx': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400&h=250&fit=crop',  // México
  'ni': 'https://images.unsplash.com/photo-1562599838-8cc871c241a5?w=400&h=250&fit=crop',  // Nicaragua
  'pa': 'https://images.unsplash.com/photo-1571675792259-3ed6c2789c20?w=400&h=250&fit=crop',  // Panamá
  'py': 'https://images.unsplash.com/photo-1616783943977-2e88c2e9a7d5?w=400&h=250&fit=crop',  // Paraguay
  'pe': 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=250&fit=crop',  // Perú - Machu Picchu
  'uy': 'https://images.unsplash.com/photo-1589802829032-ba87050b4e98?w=400&h=250&fit=crop',  // Uruguay - Montevideo
  've': 'https://images.unsplash.com/photo-1589802829032-ba87050b4e98?w=400&h=250&fit=crop',  // Venezuela
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop'  // Travel default
};

export default function CountriesPanel({ selectedCountry, onSelectCountry, places = [] }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  if (loading) {
    return (
      <div className="w-full sm:w-80 lg:w-96 bg-white border-r border-gray-200">
        <SkeletonLoader variant="country-card" count={4} />
      </div>
    );
  }

  return (
    <div className="w-full sm:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* Header con diseño limpio */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Explora destinos
        </h2>
        <p className="text-sm text-gray-600">
          Descubre zonas seguras en Latinoamérica
        </p>
      </div>

      {/* Grid de cards - Mobile first */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth snap-y snap-mandatory"
        style={{
          scrollPaddingTop: '16px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="space-y-4">
          {countries.map(country => {
            const zoneCount = places.filter(p => p.country_code === country.country_code).length;
            const isDisabled = zoneCount === 0;
            const imageUrl = countryImages[country.country_code.toLowerCase()] || countryImages['default'];

            return (
              <button
                key={country.id}
                onClick={() => !isDisabled && onSelectCountry(country)}
                disabled={isDisabled}
                className={`
                  w-full text-left rounded-xl overflow-hidden snap-center
                  transition-all duration-300 group
                  ${isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  }
                  ${selectedCountry?.id === country.id
                    ? 'ring-2 ring-blue-600 shadow-lg'
                    : 'shadow-md'
                  }
                `}
                style={{
                  scrollSnapAlign: 'center',
                  scrollMarginTop: '16px',
                }}
              >
                {/* Imagen del país - Aspecto ratio 16:10 estilo Airbnb */}
                <div className="relative h-44 sm:h-48 w-full bg-gray-200 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={country.name}
                    fill
                    className={`
                      object-cover
                      ${!isDisabled && 'group-hover:scale-110'}
                      transition-transform duration-500
                    `}
                    sizes="(max-width: 640px) 100vw, 384px"
                  />

                  {/* Overlay gradient sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                  {/* Badge con emoji de bandera */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
                    <span className="text-xl">{getFlagEmoji(country.country_code)}</span>
                  </div>

                  {/* Badge de zonas disponibles */}
                  {zoneCount > 0 && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                      {zoneCount} {zoneCount === 1 ? 'zona' : 'zonas'}
                    </div>
                  )}

                  {/* Indicador de selección */}
                  {selectedCountry?.id === country.id && (
                    <div className="absolute bottom-3 right-3 bg-blue-600 text-white rounded-full p-2 shadow-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Contenido de la card */}
                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 truncate">
                    {country.name}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {country.country_code}
                  </p>

                  {/* Mensaje de disponibilidad */}
                  {isDisabled ? (
                    <p className="text-xs text-gray-400 mt-2 italic">
                      Próximamente disponible
                    </p>
                  ) : (
                    <p className="text-xs text-blue-600 font-medium mt-2 group-hover:text-blue-700">
                      Ver zonas seguras →
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
