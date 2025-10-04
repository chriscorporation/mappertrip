'use client';

import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      {/* Mobile-first: contenido compacto */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Grid principal - Mobile: 2 columnas, Tablet: 3, Desktop: 5 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 mb-8">

          {/* Sección: Explorar */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Explorar</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push('/')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors block"
                >
                  Mapa de zonas
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/barrios')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors block"
                >
                  Barrios
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/zonas-seguras-para-viajar')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors block"
                >
                  Zonas seguras
                </button>
              </li>
            </ul>
          </div>

          {/* Sección: Nómadas */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Nómadas</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push('/nomadas-digitales')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors block"
                >
                  Nómadas digitales
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/?tab=coworking')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors block"
                >
                  Coworkings
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/?tab=airbnb')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors block"
                >
                  Alojamientos
                </button>
              </li>
            </ul>
          </div>

          {/* Sección: Descubrir */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Descubrir</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push('/?tab=instagramable')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors block"
                >
                  Lugares destacados
                </button>
              </li>
              <li>
                <a
                  href="https://vuelahoy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors block"
                >
                  Vuelos
                </a>
              </li>
            </ul>
          </div>

          {/* Sección: Soporte (columna completa en mobile) */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Soporte</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:info@mappertrip.com"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors block"
                >
                  Contacto
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/chriscorporation/mappertrip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors block"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Sección: Newsletter CTA (destacado) */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Mantente informado</h3>
            <p className="text-xs text-gray-600 mb-3">
              Recibe actualizaciones sobre nuevas zonas y destinos seguros
            </p>
            <button
              onClick={() => window.open('mailto:info@mappertrip.com?subject=Suscripción a Newsletter', '_blank')}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              Suscribirse
            </button>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">

            {/* Copyright y branding */}
            <div className="text-center sm:text-left">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} <span className="font-semibold">Mapper Trip</span>. Todos los derechos reservados.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Información validada manualmente en terreno por viajeros locales
              </p>
            </div>

            {/* Redes sociales (placeholder - se pueden activar cuando estén disponibles) */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/chriscorporation/mappertrip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
