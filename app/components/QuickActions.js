'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BiMap, BiShield, BiSearch, BiHome, BiWorld } from 'react-icons/bi';

export default function QuickActions({ selectedTab, selectedCountry, onQuickAction }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Ocultar botón al hacer scroll down, mostrar al hacer scroll up (comportamiento Airbnb)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
        setIsOpen(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Definir acciones contextuales según el tab actual
  const getContextualActions = () => {
    const actions = [];

    // Acción: Volver a inicio
    if (selectedTab !== 'countries') {
      actions.push({
        icon: BiHome,
        label: 'Inicio',
        color: 'bg-gray-700',
        action: () => {
          router.push('/?tab=countries');
          setIsOpen(false);
        }
      });
    }

    // Acción: Ver países
    if (selectedTab === 'zones' && selectedCountry) {
      actions.push({
        icon: BiWorld,
        label: 'Ver países',
        color: 'bg-blue-600',
        action: () => {
          router.push('/?tab=countries');
          setIsOpen(false);
        }
      });
    }

    // Acción: Ver zonas de seguridad
    if (selectedTab === 'countries' || (selectedTab !== 'zones' && selectedCountry)) {
      actions.push({
        icon: BiShield,
        label: 'Zonas seguras',
        color: 'bg-green-600',
        action: () => {
          if (selectedCountry) {
            router.push('/?tab=zones');
          } else {
            router.push('/zonas-seguras-para-viajar');
          }
          setIsOpen(false);
        }
      });
    }

    // Acción: Ver mapa completo
    actions.push({
      icon: BiMap,
      label: 'Mapa completo',
      color: 'bg-purple-600',
      action: () => {
        router.push('/');
        setIsOpen(false);
      }
    });

    return actions;
  };

  const actions = getContextualActions();

  // No mostrar si no hay acciones contextuales
  if (actions.length === 0) return null;

  return (
    <>
      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-20 transition-opacity duration-300 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contenedor de acciones rápidas */}
      <div
        className={`
          fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3
          transition-all duration-300 ease-out
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}
        `}
      >
        {/* Acciones contextuales - Se muestran cuando está abierto */}
        <div
          className={`
            flex flex-col-reverse gap-3 transition-all duration-300 ease-out origin-bottom-right
            ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}
          `}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`
                ${action.color} text-white shadow-lg hover:shadow-xl
                px-4 py-3 rounded-full flex items-center gap-3
                transform transition-all duration-200 hover:scale-105 active:scale-95
                text-sm font-medium
                animate-slide-up-fade
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <action.icon className="text-xl flex-shrink-0" />
              <span className="whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Botón principal FAB - Siempre visible */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            bg-gradient-to-br from-rose-500 to-pink-600 text-white
            w-14 h-14 rounded-full shadow-2xl hover:shadow-3xl
            flex items-center justify-center
            transform transition-all duration-300 hover:scale-110 active:scale-95
            ${isOpen ? 'rotate-45' : 'rotate-0'}
          `}
          aria-label="Acciones rápidas"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up-fade {
          animation: slide-up-fade 0.3s ease-out forwards;
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </>
  );
}
