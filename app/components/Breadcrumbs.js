'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FiHome, FiChevronRight, FiMap, FiMapPin, FiShield } from 'react-icons/fi';

export default function Breadcrumbs({ customItems = null }) {
  const pathname = usePathname();
  const router = useRouter();

  // Si se pasan items personalizados, usarlos
  if (customItems) {
    return (
      <nav className="flex items-center gap-2 text-sm mb-4 animate-[fadeIn_0.4s_ease-out]">
        {customItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <FiChevronRight className="text-gray-400 flex-shrink-0" size={14} />
            )}
            {item.href ? (
              <button
                onClick={() => router.push(item.href)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
              >
                {item.icon && <span className="text-gray-500 group-hover:text-blue-600 transition-colors">{item.icon}</span>}
                <span className="font-medium">{item.label}</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-1 text-gray-800 font-semibold">
                {item.icon && <span className="text-blue-600">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        ))}
      </nav>
    );
  }

  // Generar breadcrumbs automáticamente basado en la ruta
  const generateBreadcrumbs = () => {
    const items = [];

    // Siempre incluir Home
    items.push({
      label: 'Inicio',
      icon: <FiHome size={14} />,
      href: '/',
    });

    // Parsear la ruta actual
    const segments = pathname.split('/').filter(Boolean);

    // Mapeo de rutas a etiquetas legibles
    const routeLabels = {
      'barrios': { label: 'Barrios', icon: <FiMap size={14} /> },
      'zonas-seguras-para-viajar': { label: 'Zonas Seguras', icon: <FiShield size={14} /> },
      'nomadas-digitales': { label: 'Nómadas Digitales', icon: <FiMapPin size={14} /> },
    };

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      const path = '/' + segments.slice(0, index + 1).join('/');

      // Decodificar segmento para nombres con caracteres especiales
      const decodedSegment = decodeURIComponent(segment);

      // Obtener etiqueta del mapeo o usar el segmento decodificado
      const routeInfo = routeLabels[segment] || {
        label: decodedSegment.charAt(0).toUpperCase() + decodedSegment.slice(1).replace(/-/g, ' '),
        icon: <FiMapPin size={14} />
      };

      items.push({
        label: routeInfo.label,
        icon: routeInfo.icon,
        href: isLast ? null : path,
      });
    });

    return items;
  };

  const breadcrumbItems = generateBreadcrumbs();

  // No mostrar breadcrumbs en la home
  if (pathname === '/') {
    return null;
  }

  return (
    <nav
      className="flex items-center gap-2 text-sm mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200 animate-[fadeIn_0.4s_ease-out] sticky top-0 z-30 shadow-sm"
      aria-label="Breadcrumb"
    >
      <div className="container mx-auto flex items-center gap-2">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <FiChevronRight className="text-gray-400 flex-shrink-0" size={14} />
            )}
            {item.href ? (
              <button
                onClick={() => router.push(item.href)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
              >
                <span className="text-gray-500 group-hover:text-blue-600 transition-colors">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-gray-800 font-semibold bg-blue-50 rounded-lg">
                <span className="text-blue-600">{item.icon}</span>
                <span>{item.label}</span>
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbItems.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              "item": item.href ? `https://mappertrip.com${item.href}` : undefined,
            })),
          }),
        }}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}
