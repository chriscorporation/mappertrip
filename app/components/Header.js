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
      <header className="bg-white border-b border-gray-300 px-6 py-2 flex justify-between items-center">
        {/* Logo - siempre visible */}
        <img
          src="/images/logotipo-mapper-trip.png"
          alt="Mapper Trip - Real and secure trips"
          onClick={() => router.push('/')}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          style={{ height: '50px' }}
        />

        {/* Global Search - visible en desktop */}
        {!isMobile && places && countries && (
          <GlobalSearch
            places={places}
            countries={countries}
            insecurityLevels={insecurityLevels}
            selectedCountry={selectedCountry}
            onSelectCountry={onSelectCountry}
            onGoToPlace={onGoToPlace}
          />
        )}

        {/* Desktop Menu - solo visible en pantallas grandes */}
        {!isMobile && (
          <div className="flex items-center gap-6">
            {isAdminMode && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Admin</span>
            )}

            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Trip
            </button>
            <button
              onClick={() => router.push('/nomadas-digitales')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Nómadas digitales
            </button>
            <button
              onClick={() => router.push('/zonas-seguras-para-viajar')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Zonas seguras
            </button>
            <button
              onClick={() => router.push('/barrios')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Barrios
            </button>
            <a
              href="https://vuelahoy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Vuelos
            </a>

            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                >
                  Salir
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(!showLoginModal)}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium cursor-pointer"
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
            className="text-gray-800 cursor-pointer hover:text-gray-600 transition-colors"
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
        <div className="absolute top-14 right-0 bg-white border border-gray-300 rounded-lg shadow-xl w-64 z-50">
          <div className="py-2">
            {isAdminMode && (
              <div className="px-4 py-2 border-b border-gray-200">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Admin</span>
              </div>
            )}
            <button
              onClick={() => {
                router.push('/');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Trip
            </button>
            <button
              onClick={() => {
                router.push('/nomadas-digitales');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Nómadas digitales
            </button>
            <button
              onClick={() => {
                router.push('/zonas-seguras-para-viajar');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Zonas seguras
            </button>
            <button
              onClick={() => {
                router.push('/barrios');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Barrios
            </button>
            <a
              href="https://vuelahoy.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Vuelos
            </a>

            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 border-t border-gray-200">
                  <span className="text-sm text-gray-700">{user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 cursor-pointer"
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
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-t border-gray-200"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      )}


      {/* Modal de login sin overlay */}
      {showLoginModal && (
        <div className="absolute top-12 right-6 bg-white border border-gray-300 rounded-lg shadow-xl p-6 w-80 z-50">
          <h2 className="text-lg font-bold mb-4">Iniciar sesión</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                ref={usernameInputRef}
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tu usuario"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tu contraseña"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
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
                className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
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
