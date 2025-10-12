'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import GlobalSearch from './GlobalSearch';

export default function Header({ isAdminMode, places, countries, insecurityLevels, selectedCountry, onSelectCountry, onGoToPlace }) {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const usernameInputRef = useRef(null);

  const { login, logout, isLoading, error, isAuthenticated, user, clearError } = useAuthStore();

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <header className="bg-gradient-to-r from-blue-50 via-white to-purple-50 backdrop-blur-sm border-b border-gray-200 shadow-sm px-6 py-2 flex justify-between items-center relative">
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

        {/* Logo - siempre visible */}
        <img
          src="/images/logotipo-mapper-trip.png"
          alt="Mapper Trip - Real and secure trips"
          onClick={() => router.push('/')}
          className="cursor-pointer hover:scale-105 transition-all duration-300 relative z-10 drop-shadow-sm"
          style={{ height: '50px' }}
        />

        {/* Global Search - visible en desktop */}
        {!isMobile && places && countries && (
          <div className="relative z-10">
            <GlobalSearch
              places={places}
              countries={countries}
              insecurityLevels={insecurityLevels}
              selectedCountry={selectedCountry}
              onSelectCountry={onSelectCountry}
              onGoToPlace={onGoToPlace}
            />
          </div>
        )}

        {/* Desktop Menu - solo visible en pantallas grandes */}
        {!isMobile && (
          <div className="flex items-center gap-6 relative z-10">
            {isAdminMode && (
              <span className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full shadow-sm font-semibold">
                Admin
              </span>
            )}

            <button
              onClick={() => router.push('/')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors cursor-pointer hover:scale-105 transform duration-200"
            >
              Trip
            </button>
            <button
              onClick={() => router.push('/nomadas-digitales')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors cursor-pointer hover:scale-105 transform duration-200"
            >
              Nómadas digitales
            </button>
            <button
              onClick={() => router.push('/zonas-seguras-para-viajar')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors cursor-pointer hover:scale-105 transform duration-200"
            >
              Zonas seguras
            </button>
            <button
              onClick={() => router.push('/barrios')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors cursor-pointer hover:scale-105 transform duration-200"
            >
              Barrios
            </button>
            <a
              href="https://vuelahoy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors cursor-pointer hover:scale-105 transform duration-200"
            >
              Vuelos
            </a>

            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700 font-medium">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 rounded-full font-medium hover:from-red-600 hover:to-red-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  Salir
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(!showLoginModal)}
                className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        )}

        {/* Mobile Menu - solo visible en pantallas pequeñas */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-800 cursor-pointer hover:text-blue-600 transition-colors relative z-10 hover:scale-110 transform duration-200"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
      </header>

      {/* Mobile Dropdown Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="absolute top-14 right-0 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl w-64 z-50 overflow-hidden">
          <div className="py-2">
            {isAdminMode && (
              <div className="px-4 py-2 border-b border-gray-100">
                <span className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full shadow-sm font-semibold">
                  Admin
                </span>
              </div>
            )}
            <button
              onClick={() => {
                router.push('/');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all"
            >
              Trip
            </button>
            <button
              onClick={() => {
                router.push('/nomadas-digitales');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all"
            >
              Nómadas digitales
            </button>
            <button
              onClick={() => {
                router.push('/zonas-seguras-para-viajar');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all"
            >
              Zonas seguras
            </button>
            <button
              onClick={() => {
                router.push('/barrios');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all"
            >
              Barrios
            </button>
            <a
              href="https://vuelahoy.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all"
            >
              Vuelos
            </a>

            {isAuthenticated ? (
              <>
                <div className="px-4 py-3 border-t border-gray-100">
                  <span className="text-sm text-gray-700 font-medium">{user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer transition-all"
                >
                  Salir
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 cursor-pointer border-t border-gray-100 transition-all"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      )}


      {/* Modal de login sin overlay */}
      {showLoginModal && (
        <div className="absolute top-12 right-6 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-6 w-80 z-50 animate-fadeIn">
          <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Iniciar sesión
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1">
                Usuario
              </label>
              <input
                ref={usernameInputRef}
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Tu usuario"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Tu contraseña"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
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
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                disabled={isLoading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
