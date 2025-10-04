'use client';

import { useRouter } from 'next/navigation';

/**
 * Componente de Breadcrumbs estilo Airbnb - Mobile-first
 * Muestra la navegación contextual según la sección activa
 * @param {Array} items - Array de objetos con {label, href?, onClick?}
 */
export default function Breadcrumbs({ items = [] }) {
  const router = useRouter();

  if (!items || items.length === 0) return null;

  const handleClick = (item, e) => {
    e.preventDefault();

    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <nav
      className="sticky top-[57px] sm:top-[65px] z-30 bg-white border-b border-gray-100 shadow-sm"
      aria-label="Breadcrumb"
    >
      <div className="px-4 sm:px-6 py-2.5 sm:py-3">
        <ol className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isClickable = !isLast && (item.href || item.onClick);

            return (
              <li key={index} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Breadcrumb item */}
                {isClickable ? (
                  <button
                    onClick={(e) => handleClick(item, e)}
                    className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1"
                    aria-label={`Ir a ${item.label}`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span
                    className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                      isLast
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}

                {/* Separador - Solo si no es el último */}
                {!isLast && (
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* CSS para ocultar scrollbar pero mantener scroll horizontal */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
}
