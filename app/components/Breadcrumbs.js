'use client';

import { useRouter } from 'next/navigation';
import { BiHome, BiChevronRight } from 'react-icons/bi';

export default function Breadcrumbs({ selectedCountry, selectedTab, places }) {
  const router = useRouter();

  // Determinar el conteo de zonas del país seleccionado
  const countryZonesCount = selectedCountry
    ? places.filter(p => p.country_code === selectedCountry.country_code).length
    : 0;

  // Función para obtener el nombre de la pestaña actual
  const getTabName = (tab) => {
    const tabNames = {
      'countries': 'Países',
      'zones': 'Zonas',
      'airbnb': 'Alojamientos',
      'coworking': 'Co-working',
      'instagramable': 'Lugares Fotogénicos'
    };
    return tabNames[tab] || '';
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-2.5">
        <nav className="flex items-center space-x-1 text-sm">
          {/* Botón Home */}
          <button
            onClick={() => router.push('/?tab=countries')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
            aria-label="Ir a inicio"
          >
            <BiHome className="text-lg group-hover:scale-110 transition-transform" />
            <span className="font-medium">Inicio</span>
          </button>

          {/* Si hay un país seleccionado */}
          {selectedCountry && (
            <>
              <BiChevronRight className="text-gray-400" />
              <button
                onClick={() => router.push('/?tab=zones')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium group"
              >
                <span className="text-base" role="img" aria-label="flag">
                  {selectedCountry.country_code === 'MX' && '🇲🇽'}
                  {selectedCountry.country_code === 'CO' && '🇨🇴'}
                  {selectedCountry.country_code === 'AR' && '🇦🇷'}
                  {selectedCountry.country_code === 'BR' && '🇧🇷'}
                  {selectedCountry.country_code === 'PE' && '🇵🇪'}
                  {selectedCountry.country_code === 'CL' && '🇨🇱'}
                  {selectedCountry.country_code === 'UY' && '🇺🇾'}
                  {selectedCountry.country_code === 'EC' && '🇪🇨'}
                  {selectedCountry.country_code === 'CR' && '🇨🇷'}
                  {selectedCountry.country_code === 'PA' && '🇵🇦'}
                  {selectedCountry.country_code === 'GT' && '🇬🇹'}
                  {selectedCountry.country_code === 'HN' && '🇭🇳'}
                  {selectedCountry.country_code === 'SV' && '🇸🇻'}
                  {selectedCountry.country_code === 'NI' && '🇳🇮'}
                  {selectedCountry.country_code === 'PY' && '🇵🇾'}
                  {selectedCountry.country_code === 'BO' && '🇧🇴'}
                  {selectedCountry.country_code === 'VE' && '🇻🇪'}
                  {selectedCountry.country_code === 'DO' && '🇩🇴'}
                  {selectedCountry.country_code === 'CU' && '🇨🇺'}
                  {!['MX', 'CO', 'AR', 'BR', 'PE', 'CL', 'UY', 'EC', 'CR', 'PA', 'GT', 'HN', 'SV', 'NI', 'PY', 'BO', 'VE', 'DO', 'CU'].includes(selectedCountry.country_code) && '🌎'}
                </span>
                <span className="group-hover:scale-105 transition-transform">
                  {selectedCountry.name}
                </span>
                {countryZonesCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold group-hover:bg-blue-200 transition-colors">
                    {countryZonesCount}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Si hay un tab seleccionado diferente de countries y zones */}
          {selectedCountry && selectedTab && !['countries', 'zones'].includes(selectedTab) && (
            <>
              <BiChevronRight className="text-gray-400" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 font-semibold">
                <span className="text-base" role="img" aria-label="icon">
                  {selectedTab === 'airbnb' && '🏠'}
                  {selectedTab === 'coworking' && '💼'}
                  {selectedTab === 'instagramable' && '📸'}
                </span>
                <span>{getTabName(selectedTab)}</span>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Línea decorativa animada */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
    </div>
  );
}
