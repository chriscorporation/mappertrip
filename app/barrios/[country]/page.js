import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Header from '../../components/Header';
import BarriosContent from './BarriosContent';

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

async function getCountryData(countrySlug, page = 1) {
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

  // Get total count of zones for this country
  const { count } = await supabase
    .from('geoplaces')
    .select('*', { count: 'exact', head: true })
    .eq('country_code', country.country_code);

  const limit = 10;
  const totalPages = Math.ceil(count / limit);
  const offset = (page - 1) * limit;

  // Get paginated zones for this country
  const { data: places } = await supabase
    .from('geoplaces')
    .select('id, address, lat, lng, country_code, orientation')
    .eq('country_code', country.country_code)
    .range(offset, offset + limit - 1);

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
    zones: zonesWithNotes,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: count,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}

export default async function BarriosPais({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams?.page || '1', 10);

  const data = await getCountryData(resolvedParams.country, page);

  if (!data) {
    notFound();
  }

  const { country } = data;

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

              <BarriosContent countrySlug={resolvedParams.country} initialData={data} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
