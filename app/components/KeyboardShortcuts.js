'use client';

import { useState, useEffect } from 'react';

export default function KeyboardShortcuts({ onShortcut }) {
  const [showModal, setShowModal] = useState(false);

  const shortcuts = [
    { key: '?', description: 'Mostrar/ocultar atajos', category: 'General' },
    { key: 'Esc', description: 'Cerrar modales', category: 'General' },
    { key: '1', description: 'Ver países', category: 'Navegación' },
    { key: '2', description: 'Ver zonas', category: 'Navegación' },
    { key: '3', description: 'Ver Airbnb', category: 'Navegación' },
    { key: '4', description: 'Ver CoWorking', category: 'Navegación' },
    { key: '5', description: 'Ver Instagramable', category: 'Navegación' },
    { key: '/', description: 'Buscar zonas', category: 'Búsqueda' },
  ];

  useEffect(() => {
    const handleKeyPress = (e) => {
      // No interceptar si el usuario está escribiendo en un input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Permitir Esc para salir de inputs
        if (e.key === 'Escape') {
          e.target.blur();
          onShortcut?.('escape');
        }
        return;
      }

      // Toggle modal con ?
      if (e.key === '?') {
        e.preventDefault();
        setShowModal(prev => !prev);
        return;
      }

      // Cerrar modal con Esc
      if (e.key === 'Escape') {
        if (showModal) {
          setShowModal(false);
        } else {
          onShortcut?.('escape');
        }
        return;
      }

      // Navegación por números
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        onShortcut?.(e.key);
        return;
      }

      // Búsqueda con /
      if (e.key === '/') {
        e.preventDefault();
        onShortcut?.('search');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onShortcut, showModal]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {});

  return (
    <>
      {/* Botón flotante minimalista */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-30 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-gray-300 p-3 hover:scale-110 transition-all duration-300 group"
        title="Atajos de teclado (presiona ?)"
      >
        <span className="text-xl group-hover:scale-125 transition-transform duration-200 inline-block">⌨️</span>
      </button>

      {/* Modal de atajos */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span>⌨️</span> Atajos de Teclado
                  </h2>
                  <p className="text-sm text-blue-100 mt-1">Navega más rápido con estos atajos</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Cerrar (Esc)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Shortcuts grouped by category */}
            <div className="p-6 space-y-6">
              {Object.entries(groupedShortcuts).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    {category === 'General' && '⚡'}
                    {category === 'Navegación' && '🧭'}
                    {category === 'Búsqueda' && '🔍'}
                    {category === 'Mapa' && '🗺️'}
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                      >
                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                          {shortcut.description}
                        </span>
                        <kbd className="px-3 py-1.5 bg-white border-2 border-gray-300 rounded-lg shadow-sm text-sm font-mono font-bold text-gray-700 group-hover:border-blue-400 group-hover:shadow-md transition-all duration-200">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer tip */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-100 p-4 rounded-b-2xl border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                💡 <span className="font-semibold">Tip:</span> Presiona <kbd className="px-2 py-1 bg-white rounded border border-gray-300 text-xs font-mono">?</kbd> en cualquier momento para ver esta ayuda
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
