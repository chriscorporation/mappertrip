'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';
import PerplexityNotesDisplay from '../../components/PerplexityNotesDisplay';
import { useAuthStore } from '../../store/authStore';

export default function BarriosPais() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const isAdminMode = isAuthenticated;
  const [country, setCountry] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener información del país
        const countriesRes = await fetch('/api/countries');
        if (countriesRes.ok) {
          const countries = await countriesRes.json();

          // Buscar el país por slug
          const foundCountry = countries.find(c => {
            const slug = c.name.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, '-')
              .replace(/[^\w-]+/g, '');
            return slug === params.country;
          });

          setCountry(foundCountry);

          if (foundCountry) {
            // Obtener zonas del país
            const placesRes = await fetch('/api/places');
            if (placesRes.ok) {
              const places = await placesRes.json();
              const countryZones = places.filter(p => p.country_code === foundCountry.country_code);

              // Obtener las notas de Perplexity para cada zona
              const zonesWithNotes = await Promise.all(
                countryZones.map(async (zone) => {
                  try {
                    const notesRes = await fetch(`/api/perplexity-notes?zone_id=${zone.id}`);
                    if (notesRes.ok) {
                      const notesData = await notesRes.json();
                      return { ...zone, perplexityNotes: notesData };
                    }
                  } catch (error) {
                    console.error(`Error fetching notes for zone ${zone.id}:`, error);
                  }
                  return { ...zone, perplexityNotes: null };
                })
              );

              setZones(zonesWithNotes);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.country) {
      fetchData();
    }
  }, [params.country]);


  if (loading) {
    return (
      <div className="flex flex-col h-screen overflow-y-auto">
        <Header isAdminMode={isAdminMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Cargando barrios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="flex flex-col h-screen overflow-y-auto">
        <Header isAdminMode={isAdminMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-700 text-lg mb-4">País no encontrado</p>
            <button
              onClick={() => router.push('/barrios')}
              className="px-6 py-3 text-sm text-white font-bold bg-blue-500 hover:bg-blue-600 rounded-full cursor-pointer transition-colors"
            >
              Volver a Barrios
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <Header isAdminMode={isAdminMode} />

      <section className="pt-6 pb-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="relative py-16 px-8 bg-white overflow-hidden rounded-3xl">
            <div className="relative z-10">
              <div className="mb-10 md:max-w-2xl mx-auto text-center">
                <span className="inline-block mb-5 text-sm text-gray-900 font-bold uppercase tracking-widest">
                  Barrios de {country.name}
                </span>
                <h2 className="font-heading mb-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                    Información detallada
                  </span>
                </h2>
                <p className="text-gray-500 font-bold text-lg">
                  Descubre cada <strong className="font-bold text-gray-900">barrio</strong> de {country.name} con información valiosa de <strong className="font-bold text-gray-900">locales</strong> y <strong className="font-bold text-gray-900">viajeros expertos</strong>. Conoce los mejores lugares para <strong className="font-bold text-gray-900">hospedarte</strong>, <strong className="font-bold text-gray-900">trabajar</strong> y <strong className="font-bold text-gray-900">explorar</strong> con seguridad.
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                {zones.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No hay barrios disponibles para este país</p>
                    <button
                      onClick={() => router.push('/barrios')}
                      className="px-6 py-3 text-sm text-white font-bold bg-blue-500 hover:bg-blue-600 rounded-full cursor-pointer transition-colors"
                    >
                      Volver a Barrios
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap -m-3 mb-10">
                    {zones.map((zone) => {
                      const notes = zone.perplexityNotes;

                      return (
                        <div key={zone.id} className="w-full p-3">
                          <div className="w-full block p-10 bg-gray-100 rounded-3xl">
                            <h3 className="font-heading mb-6 text-3xl font-black">
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-900">
                                {zone.address}
                              </span>
                            </h3>

                            <PerplexityNotesDisplay perplexityData={notes} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={() => router.push('/barrios')}
                    className="px-6 py-3 text-sm text-white font-bold bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 rounded-full cursor-pointer transition-colors"
                  >
                    Ver todos los países
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
