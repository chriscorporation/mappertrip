'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export default function Header({ isAdminMode }) {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const usernameInputRef = useRef(null);
  const searchInputRef = useRef(null);

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
    setMobileMenuOpen(false);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    clearError();
    setUsername('');
    setPassword('');
  };

  const handleNavClick = (action) => {
    action();
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (showLoginModal && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [showLoginModal]);

  // Detectar scroll para efecto sticky con shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevenir scroll del body cuando el menú mobile está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Auto-focus en el input de búsqueda cuando se abre
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  // Búsqueda en tiempo real de países y ciudades
  useEffect(() => {
    const searchCountries = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch('/api/countries');
        const countries = await response.json();

        const filteredResults = countries.filter(country =>
          country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.country_code.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(filteredResults.slice(0, 5)); // Mostrar solo los primeros 5 resultados
      } catch (error) {
        console.error('Error searching countries:', error);
      }
    };

    const debounceTimer = setTimeout(searchCountries, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchResultClick = (country) => {
    setShowSearchBar(false);
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/?tab=countries`);
    // Trigger country selection if there's a way to do it
  };

  return (
    <>
      {/* Header sticky con animación de shadow al hacer scroll */}
      <header className={`
        sticky top-0 z-40 bg-white border-b border-gray-200 transition-all duration-300
        ${isScrolled ? 'shadow-md' : ''}
      `}>
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-3">
            {/* Logo - Centrado en mobile, izquierda en desktop */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <h1
                onClick={() => router.push('/')}
                className="text-base sm:text-lg font-bold text-gray-800 cursor-pointer hover:text-gray-600 transition-colors truncate"
              >
                Mapper Trip
              </h1>
              {isAdminMode && (
                <span className="hidden sm:inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Admin
                </span>
              )}
            </div>

            {/* Barra de búsqueda estilo Airbnb - Centrada en desktop */}
            <div className="hidden lg:flex flex-1 justify-center max-w-2xl mx-auto">
              <div className="relative w-full max-w-md">
                <button
                  onClick={() => setShowSearchBar(!showSearchBar)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-300 rounded-full hover:shadow-md transition-all duration-200 text-sm text-gray-700 hover:border-gray-400"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="flex-1 text-left text-gray-600">Buscar países...</span>
                </button>
              </div>
            </div>

            {/* Botón de búsqueda mobile */}
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Navegación desktop - Oculta en mobile */}
            <nav className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Trip
              </button>
              <button
                onClick={() => router.push('/nomadas-digitales')}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Nómadas digitales
              </button>
              <button
                onClick={() => router.push('/zonas-seguras-para-viajar')}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Zonas seguras
              </button>
              <a
                href="https://vuelahoy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Vuelos
              </a>
              <button
                onClick={() => router.push('/barrios')}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Barrios
              </button>
            </nav>

            {/* Botón de auth desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-700">{user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(!showLoginModal)}
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Iniciar sesión
                </button>
              )}
            </div>

            {/* Botón hamburguesa mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 transition-transform duration-300"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Modal de búsqueda expandido - Estilo Airbnb */}
        {showSearchBar && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-50 transition-opacity duration-300"
              onClick={() => {
                setShowSearchBar(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            ></div>

            {/* Panel de búsqueda */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl border-b border-gray-200 animate-slide-down">
              <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Input de búsqueda */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar países o ciudades..."
                    className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
                  />
                  <button
                    onClick={() => {
                      setShowSearchBar(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {searchResults.map((country, index) => (
                      <button
                        key={country.country_code}
                        onClick={() => handleSearchResultClick(country)}
                        className={`
                          w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left
                          ${index !== 0 ? 'border-t border-gray-100' : ''}
                        `}
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {country.flag || country.country_code.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{country.name}</div>
                          <div className="text-xs text-gray-500">{country.country_code.toUpperCase()}</div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {searchQuery && searchResults.length === 0 && (
                  <div className="mt-4 text-center text-gray-500 py-8">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">No se encontraron resultados para &quot;{searchQuery}&quot;</p>
                  </div>
                )}

                {/* Sugerencias cuando no hay búsqueda */}
                {!searchQuery && (
                  <div className="mt-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Destinos populares</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['Colombia', 'México', 'Argentina', 'Perú'].map((country) => (
                        <button
                          key={country}
                          onClick={() => setSearchQuery(country)}
                          className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors text-left border border-gray-200"
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Menú mobile - Animación suave desde arriba */}
        <div
          className={`
            lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg
            transition-all duration-300 ease-in-out overflow-hidden
            ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}
          `}
        >
          <nav className="flex flex-col py-4 px-4 space-y-1">
            <button
              onClick={() => handleNavClick(() => router.push('/'))}
              className="text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Trip
            </button>
            <button
              onClick={() => handleNavClick(() => router.push('/nomadas-digitales'))}
              className="text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Nómadas digitales
            </button>
            <button
              onClick={() => handleNavClick(() => router.push('/zonas-seguras-para-viajar'))}
              className="text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Zonas seguras
            </button>
            <a
              href="https://vuelahoy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Vuelos
            </a>
            <button
              onClick={() => handleNavClick(() => router.push('/barrios'))}
              className="text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Barrios
            </button>

            {/* Divisor */}
            <div className="h-px bg-gray-200 my-2"></div>

            {/* Auth en mobile */}
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-600">
                  {user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-left px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
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
                className="text-left px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
              >
                Iniciar sesión
              </button>
            )}

            {isAdminMode && (
              <div className="px-4 py-2">
                <span className="inline-block text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  Admin Mode
                </span>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Modal de login - Mejorado para mobile */}
      {showLoginModal && (
        <>
          {/* Overlay semi-transparente */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity duration-300"
            onClick={handleCloseModal}
          ></div>

          {/* Modal centrado en mobile, esquina en desktop */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:items-start sm:justify-end sm:p-6 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm pointer-events-auto transform transition-all duration-300 sm:mt-6">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Iniciar sesión</h2>

              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario
                  </label>
                  <input
                    ref={usernameInputRef}
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="Tu usuario"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="Tu contraseña"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
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
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
