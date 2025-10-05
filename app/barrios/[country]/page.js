import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Header from '../../components/Header';
import PerplexityNotesDisplay from '../../components/PerplexityNotesDisplay';
import BackButton from './BackButton';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Generate static params for all countries
export async function generateStaticParams() {
  const { data: countries } = await supabase
    .from('countries')
    .select('name');

  if (!countries) return [];

  return countries.map((country) => ({
    country: country.name.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { data: countries } = await supabase
    .from('countries')
    .select('name, country_code');

  const foundCountry = countries?.find(c => {
    const slug = c.name.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
    return slug === resolvedParams.country;
  });

  if (!foundCountry) {
    return {
      title: 'País no encontrado',
    };
  }

  return {
    title: `Barrios de ${foundCountry.name} - Guía para Nómadas Digitales`,
    description: `Descubre los mejores barrios de ${foundCountry.name} para nómadas digitales. Información sobre seguridad, coworking, alojamiento y lugares de interés.`,
    openGraph: {
      title: `Barrios de ${foundCountry.name} - Guía para Nómadas Digitales`,
      description: `Explora barrios seguros y recomendados en ${foundCountry.name} con información de locales y viajeros expertos.`,
    },
  };
}

async function getCountryData(countrySlug) {
  // Get country info
  const { data: countries } = await supabase
    .from('countries')
    .select('name, country_code');

  const country = countries?.find(c => {
    const slug = c.name.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
    return slug === countrySlug;
  });

  if (!country) return null;

  // Get zones for this country
  const { data: places } = await supabase
    .from('geoplaces')
    .select('id, address, lat, lng, country_code, orientation')
    .eq('country_code', country.country_code);

  // Get perplexity notes for each zone
  const zonesWithNotes = await Promise.all(
    (places || []).map(async (zone) => {
      const { data: notesData } = await supabase
        .from('perplexity_notes')
        .select('*')
        .eq('zone_id', zone.id)
        .single();

      return { ...zone, perplexityNotes: notesData };
    })
  );

  return {
    country,
    zones: zonesWithNotes
  };
}

export default async function BarriosPais({ params }) {
  const resolvedParams = await params;
  const data = await getCountryData(resolvedParams.country);

  if (!data) {
    notFound();
  }

  const { country, zones } = data;

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <Header isAdminMode={false} />

      <section className="pt-6 pb-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="relative py-16 px-8 bg-white overflow-hidden rounded-3xl">
            <div className="relative z-10">
              <div className="mb-10 md:max-w-2xl mx-auto text-center">
                <span className="inline-block mb-5 text-sm text-gray-900 font-bold uppercase tracking-widest">
                  Barrios de {country.name}
                </span>
                <h1 className="font-heading mb-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                    Información detallada
                  </span>
                </h1>
                <p className="text-gray-500 font-bold text-lg">
                  Descubre cada <strong className="font-bold text-gray-900">barrio</strong> de {country.name} con información valiosa de <strong className="font-bold text-gray-900">locales</strong> y <strong className="font-bold text-gray-900">viajeros expertos</strong>. Conoce los mejores lugares para <strong className="font-bold text-gray-900">hospedarte</strong>, <strong className="font-bold text-gray-900">trabajar</strong> y <strong className="font-bold text-gray-900">explorar</strong> con seguridad.
                </p>
              </div>

              <div className="max-w-7xl mx-auto">
                {zones.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No hay barrios disponibles para este país</p>
                    <BackButton />
                  </div>
                ) : (
                  <div className="flex flex-col gap-8 mb-10">
                    {zones.map((zone) => {
                      const notes = zone.perplexityNotes;

                      return (
                        <div key={zone.id} className="w-full">
                          <div className="w-full block p-10 bg-white border-2 border-gray-200 rounded-3xl shadow-lg">
                            <div className="mb-6">
                              <h2 className="font-heading mb-2 text-3xl font-black">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-900">
                                  {zone.address} {zone.orientation ? `(${zone.orientation})` : ''}
                                </span>
                              </h2>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(zone.address + ' @' + zone.lat + ',' + zone.lng)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Ver en Google Maps
                              </a>
                            </div>

                            <PerplexityNotesDisplay perplexityData={notes} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-center">
                  <BackButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
