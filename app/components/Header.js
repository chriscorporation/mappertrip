'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export default function Header({ isAdminMode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newZonesCount, setNewZonesCount] = useState(0);
  const usernameInputRef = useRef(null);

  // Sticky header scroll behavior
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { login, logout, isLoading, error, isAuthenticated, user, clearError } = useAuthStore();

  // Sticky header scroll behavior
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Determinar si el header debe ser sticky (después de 50px de scroll)
          setIsSticky(currentScrollY > 50);

          // Determinar si el header debe ser visible
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down - hide header
            setIsVisible(false);
          } else {
            // Scrolling up - show header
            setIsVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Cargar contador de zonas nuevas (últimas 48 horas)
  useEffect(() => {
    const fetchNewZonesCount = async () => {
      try {
        const response = await fetch('/api/places');
        const data = await response.json();

        // Calcular zonas agregadas en las últimas 48 horas
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));

        const recentZones = data.filter(place => {
          if (!place.created_at) return false;
          const createdAt = new Date(place.created_at);
          return createdAt >= fortyEightHoursAgo;
        });

        setNewZonesCount(recentZones.length);
      } catch (error) {
        console.error('Error loading new zones count:', error);
      }
    };

    fetchNewZonesCount();

    // Actualizar cada 5 minutos
    const interval = setInterval(fetchNewZonesCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await login(username, password);

    if (result.success) {
      setShowLoginModal(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    clearError();
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    if (showLoginModal && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [showLoginModal]);

  // Función para verificar si la ruta está activa
  const isActiveRoute = (route) => pathname === route;

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50
        bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30
        border-b border-gray-200
        flex justify-between items-center
        transition-all duration-300 ease-in-out
        ${isSticky ? 'shadow-lg backdrop-blur-md bg-white/95' : 'shadow-sm'}
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        ${isSticky ? 'px-4 py-2' : 'px-6 py-3'}
      `}>
        <div className="flex items-center gap-6">
          {/* Logo con gradiente y animación - se reduce cuando es sticky */}
          <h1
            onClick={() => router.push('/')}
            className={`
              font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600
              bg-clip-text text-transparent cursor-pointer hover:scale-105
              transition-all duration-300 ease-out animate-gradient bg-[length:200%_auto]
              ${isSticky ? 'text-base' : 'text-lg'}
            `}
          >
            Mapper Trip - Real and secure trips
          </h1>

          {/* Badge de Admin mejorado - se reduce cuando es sticky */}
          {isAdminMode && (
            <span className={`
              relative bg-gradient-to-r from-blue-500 to-purple-600 text-white
              rounded-full font-semibold shadow-md hover:shadow-lg
              transition-all duration-300 hover:scale-105 animate-pulse-slow
              ${isSticky ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}
            `}>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-50"></span>
              <span className="relative">Admin</span>
            </span>
          )}

          {/* Navegación mejorada - se compacta cuando es sticky */}
          <nav className={`flex items-center transition-all duration-300 ${isSticky ? 'gap-0.5' : 'gap-1'}`}>
            <button
              onClick={() => router.push('/')}
              className={`group relative font-medium transition-all duration-300 rounded-lg ${
                isSticky ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
              } ${
                isActiveRoute('/')
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="relative z-10">Trip</span>

              {/* Badge de nuevas zonas */}
              {newZonesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg animate-bounce-subtle">
                  {newZonesCount > 99 ? '99+' : newZonesCount}
                  <span className="absolute inset-0 bg-red-400 rounded-full opacity-75 animate-ping-slow"></span>
                </span>
              )}

              {isActiveRoute('/') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></span>
              )}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
            </button>

            <button
              onClick={() => router.push('/nomadas-digitales')}
              className={`group relative font-medium transition-all duration-300 rounded-lg ${
                isSticky ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
              } ${
                isActiveRoute('/nomadas-digitales')
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="relative z-10">Nómadas digitales</span>
              {isActiveRoute('/nomadas-digitales') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></span>
              )}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
            </button>

            <button
              onClick={() => router.push('/zonas-seguras-para-viajar')}
              className={`group relative font-medium transition-all duration-300 rounded-lg ${
                isSticky ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
              } ${
                isActiveRoute('/zonas-seguras-para-viajar')
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Zonas seguras
              </span>
              {isActiveRoute('/zonas-seguras-para-viajar') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></span>
              )}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
            </button>

            <a
              href="https://vuelahoy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 rounded-lg ${
                isSticky ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1">
                Vuelos
                <svg className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
            </a>

            <button
              onClick={() => router.push('/barrios')}
              className={`group relative font-medium transition-all duration-300 rounded-lg ${
                isSticky ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
              } ${
                isActiveRoute('/barrios')
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="relative z-10">Barrios</span>
              {isActiveRoute('/barrios') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></span>
              )}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
            </button>
          </nav>
        </div>

        {/* Sección de autenticación mejorada - se compacta cuando es sticky */}
        {isAuthenticated ? (
          <div className={`flex items-center animate-fadeIn transition-all duration-300 ${isSticky ? 'gap-2' : 'gap-3'}`}>
            <div className={`flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 transition-all duration-300 ${
              isSticky ? 'px-2 py-1' : 'px-3 py-1.5'
            }`}>
              <svg className={`text-blue-600 transition-all duration-300 ${isSticky ? 'w-3 h-3' : 'w-4 h-4'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className={`font-medium text-gray-700 transition-all duration-300 ${isSticky ? 'text-xs' : 'text-sm'}`}>{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className={`group relative font-semibold text-red-600 hover:text-red-700 transition-all duration-300 rounded-lg hover:bg-red-50 ${
                isSticky ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1">
                <svg className={`group-hover:rotate-12 transition-all duration-300 ${isSticky ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Salir
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(!showLoginModal)}
            className={`group relative font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden ${
              isSticky ? 'px-3 py-1 text-xs' : 'px-5 py-2 text-sm'
            }`}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center gap-2">
              <svg className={`transition-all duration-300 ${isSticky ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Iniciar sesión
            </span>
          </button>
        )}
      </header>

      {/* Modal de login mejorado con animación */}
      {showLoginModal && (
        <>
          {/* Overlay con fade */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={handleCloseModal}
          ></div>

          {/* Modal con slide down */}
          <div className="fixed top-16 right-6 bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 w-80 z-50 animate-slideDown">
            {/* Header del modal */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Iniciar sesión
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm flex items-start gap-2 animate-shake">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    ref={usernameInputRef}
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Tu usuario"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Tu contraseña"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ingresando...
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Estilos para las animaciones */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.4s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.75;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}
