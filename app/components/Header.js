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
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-8">
          <h1
            onClick={() => router.push('/')}
            className="text-xl font-bold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors tracking-tight"
          >
            Mapper Trip
          </h1>
          {isAdminMode && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">Admin</span>
          )}

          <nav className="flex items-center gap-6 ml-4">
            <button
              onClick={() => router.push('/')}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              Trip
            </button>
            <button
              onClick={() => router.push('/nomadas-digitales')}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              Nómadas digitales
            </button>
            <button
              onClick={() => router.push('/zonas-seguras-para-viajar')}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              Zonas seguras
            </button>
            <a
              href="https://vuelahoy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              Vuelos
            </a>
            <button
              onClick={() => router.push('/barrios')}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-50"
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
              className="text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Salir
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(!showLoginModal)}
            className="text-sm text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-all"
          >
            Iniciar sesión
          </button>
        )}
      </header>

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
