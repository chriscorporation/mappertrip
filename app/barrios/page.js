import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';
import ExploreButton from '../components/ExploreButton';
import CountryCard from './CountryCard';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const metadata = {
  title: 'Barrios Seguros por País - Guía para Nómadas Digitales',
  description: 'Explora barrios seguros en países de Latinoamérica. Información detallada compartida por locales y viajeros expertos para una experiencia de viaje segura y auténtica.',
  openGraph: {
    title: 'Barrios Seguros por País - Guía para Nómadas Digitales',
    description: 'Descubre información confiable sobre barrios seguros en tu próximo destino. Datos valiosos de locales y viajeros expertos.',
  },
};

async function getCountriesData() {
  const [countriesRes, placesRes] = await Promise.all([
    supabase.from('countries').select('*'),
    supabase.from('geoplaces').select('country_code, color')
  ]);

  const countries = countriesRes.data || [];
  const places = placesRes.data || [];

  // Count zones per country and calculate safety statistics
  const countriesWithCounts = countries.map(country => {
    const countryPlaces = places.filter(p => p.country_code === country.country_code);

    // Calculate safety statistics
    const safeZones = countryPlaces.filter(p => p.color === '#22c55e' || p.color === '#3b82f6').length;
    const unsafeZones = countryPlaces.filter(p => p.color === '#dc2626' || p.color === '#eab308').length;
    const regularZones = countryPlaces.filter(p => p.color === '#f97316').length;
    const totalZones = countryPlaces.length;
    const safetyPercentage = totalZones > 0 ? Math.round((safeZones / totalZones) * 100) : 0;

    return {
      ...country,
      zoneCount: totalZones,
      safeZones,
      unsafeZones,
      regularZones,
      safetyPercentage
    };
  });

  return countriesWithCounts;
}

export default async function Barrios() {
  const countries = await getCountriesData();

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <Header isAdminMode={false} />

      <section className="pt-6 pb-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="relative py-16 px-8 bg-white overflow-hidden rounded-3xl">
            <div className="relative z-10">
              <div className="mb-10 md:max-w-2xl mx-auto text-center">
                <span className="inline-block mb-5 text-sm text-gray-900 font-bold uppercase tracking-widest">
                  Información por cada barrio
                </span>
                <h1 className="font-heading mb-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                    Barrios seguros
                  </span>
                </h1>
                <p className="text-gray-500 font-bold text-lg">
                  Explora información detallada y confiable sobre cada barrio de tu próximo destino. Descubre datos valiosos compartidos por <strong className="font-bold text-gray-900">locales</strong> y <strong className="font-bold text-gray-900">viajeros expertos</strong> para que tu experiencia sea segura, auténtica y memorable desde el momento en que llegas.
                </p>
              </div>

              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {countries.map((country) => (
                    <CountryCard
                      key={country.id}
                      country={country}
                      zoneCount={country.zoneCount}
                      safeZones={country.safeZones}
                      unsafeZones={country.unsafeZones}
                      regularZones={country.regularZones}
                      safetyPercentage={country.safetyPercentage}
                    />
                  ))}
                </div>

                <div className="flex justify-center mt-10">
                  <ExploreButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
