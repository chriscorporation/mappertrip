'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export default function Header({ isAdminMode }) {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <h1
            onClick={() => router.push('/')}
            className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-rose-500 transition-all duration-200"
          >
            Mapper Trip
          </h1>
          {isAdminMode && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">Admin</span>
          )}

          <nav className="flex items-center gap-1 ml-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200"
            >
              Trip
            </button>
            <button
              onClick={() => router.push('/nomadas-digitales')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200"
            >
              Nómadas digitales
            </button>
            <button
              onClick={() => router.push('/zonas-seguras-para-viajar')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200"
            >
              Zonas seguras
            </button>
            <a
              href="https://vuelahoy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200"
            >
              Vuelos
            </a>
            <button
              onClick={() => router.push('/barrios')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200"
            >
              Barrios
            </button>
          </nav>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-full border border-gray-300 transition-all duration-200"
            >
              Salir
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(!showLoginModal)}
            className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-full border border-gray-300 transition-all duration-200"
          >
            Iniciar sesión
          </button>
        )}
      </header>

      {/* Modal de login sin overlay */}
      {showLoginModal && (
        <div className="absolute top-20 right-8 bg-white border border-gray-200 rounded-2xl shadow-2xl p-8 w-96 z-50">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Bienvenido a Mapper Trip</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all outline-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all outline-none"
                placeholder="Tu contraseña"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl hover:from-rose-600 hover:to-pink-600 flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
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
                className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-200"
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
