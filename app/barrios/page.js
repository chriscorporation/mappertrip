'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuthStore } from '../store/authStore';

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

export default function Barrios() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const isAdminMode = isAuthenticated;
  const [countries, setCountries] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, placesRes] = await Promise.all([
          fetch('/api/countries'),
          fetch('/api/places')
        ]);

        if (countriesRes.ok) {
          const countriesData = await countriesRes.json();
          setCountries(countriesData);
        }

        if (placesRes.ok) {
          const placesData = await placesRes.json();
          setPlaces(placesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <Header isAdminMode={isAdminMode} />

      <section className="pt-6 pb-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="relative py-16 px-8 bg-white overflow-hidden rounded-3xl">
            <div className="relative z-10">
              <div className="mb-10 md:max-w-2xl mx-auto text-center">
                <span className="inline-block mb-5 text-sm text-gray-900 font-bold uppercase tracking-widest">
                  Información por cada barrio
                </span>
                <h2 className="font-heading mb-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                    Barrios seguros
                  </span>
                </h2>
                <p className="text-gray-500 font-bold text-lg">
                  Explora información detallada y confiable sobre cada barrio de tu próximo destino. Descubre datos valiosos compartidos por <strong className="font-bold text-gray-900">locales</strong> y <strong className="font-bold text-gray-900">viajeros expertos</strong> para que tu experiencia sea segura, auténtica y memorable desde el momento en que llegas.
                </p>
              </div>

              <div className="max-w-5xl mx-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-500">Cargando países...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {countries.map((country) => {
                      const zoneCount = places.filter(p => p.country_code === country.country_code).length;
                      const hasZones = zoneCount > 0;

                      const slug = country.name.toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/\s+/g, '-')
                        .replace(/[^\w-]+/g, '');

                      return (
                        <button
                          key={country.id}
                          onClick={() => hasZones && router.push(`/barrios/${slug}`)}
                          className={`p-6 bg-gray-50 rounded-3xl transition-colors group ${
                            hasZones
                              ? 'hover:bg-gray-100 cursor-pointer'
                              : 'opacity-40 cursor-default'
                          }`}
                          disabled={!hasZones}
                        >
                          <div className="text-center">
                            <div className={`text-6xl mb-4 transition-transform ${
                              hasZones ? 'transform group-hover:scale-110' : ''
                            }`}>
                              {getFlagEmoji(country.country_code)}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              {country.name}
                            </h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                              {country.country_code}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 text-sm text-white font-bold bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 rounded-full cursor-pointer transition-colors"
                  >
                    Explorar destinos seguros
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
