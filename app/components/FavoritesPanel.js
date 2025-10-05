'use client';

import { useState } from 'react';
import { FiHeart, FiX, FiMapPin, FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi';
import { BiShield } from 'react-icons/bi';
import { useFavoritesStore } from '../store/favoritesStore';
import { useToast } from '../store/toastStore';

export default function FavoritesPanel({ onZoneSelect, currentZoneId }) {
  const [isOpen, setIsOpen] = useState(false);
  const { favorites, removeFavorite, clearFavorites, getFavoritesCount } = useFavoritesStore();
  const { showToast } = useToast();

  const getColorInfo = (color) => {
    const colorMap = {
      '#22c55e': { name: 'Segura', textClass: 'text-green-700', bgClass: 'bg-green-100', borderClass: 'border-green-300' },
      '#3b82f6': { name: 'Buena', textClass: 'text-blue-700', bgClass: 'bg-blue-100', borderClass: 'border-blue-300' },
      '#f97316': { name: 'Regular', textClass: 'text-orange-700', bgClass: 'bg-orange-100', borderClass: 'border-orange-300' },
      '#eab308': { name: 'Precaución', textClass: 'text-yellow-700', bgClass: 'bg-yellow-100', borderClass: 'border-yellow-300' },
      '#dc2626': { name: 'Peligrosa', textClass: 'text-red-700', bgClass: 'bg-red-100', borderClass: 'border-red-300' },
    };
    return colorMap[color] || colorMap['#22c55e'];
  };

  const handleRemoveFavorite = (e, zoneId) => {
    e.stopPropagation();
    removeFavorite(zoneId);
    showToast('Zona removida de favoritos', 'info');
  };

  const handleClearAll = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los favoritos?')) {
      clearFavorites();
      showToast('Todos los favoritos han sido eliminados', 'success');
    }
  };

  const handleZoneClick = (zone) => {
    if (onZoneSelect) {
      onZoneSelect(zone);
    }
    setIsOpen(false);
  };

  const favoritesCount = getFavoritesCount();
  const sortedFavorites = [...favorites].sort((a, b) => b.addedAt - a.addedAt);

  return (
    <>
      {/* Botón flotante de favoritos */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-6 bottom-24 z-[1000] bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
          isOpen ? 'scale-110' : ''
        }`}
        aria-label={`Favoritos (${favoritesCount})`}
        title="Ver favoritos"
      >
        <div className="relative p-4">
          <FiHeart className="text-2xl" fill={favoritesCount > 0 ? 'currentColor' : 'none'} />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-pink-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md animate-pulse">
              {favoritesCount}
            </span>
          )}
        </div>
      </button>

      {/* Panel de favoritos */}
      {isOpen && (
        <div className="fixed right-6 bottom-44 z-[1000] w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden animate-[slideUp_0.3s_ease-out]">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiHeart className="text-xl" fill="currentColor" />
              <h3 className="font-bold text-lg">Mis Favoritos</h3>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
                {favoritesCount}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Cerrar panel"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Contenido */}
          <div className="overflow-y-auto max-h-[500px]">
            {favorites.length === 0 ? (
              <div className="p-8 text-center">
                <FiHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-2">No tienes favoritos aún</p>
                <p className="text-gray-400 text-sm">
                  Explora el mapa y guarda tus zonas favoritas
                </p>
              </div>
            ) : (
              <>
                <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <p className="text-xs text-gray-600 font-medium">
                    {favoritesCount} {favoritesCount === 1 ? 'zona guardada' : 'zonas guardadas'}
                  </p>
                  {favoritesCount > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <FiTrash2 className="text-sm" />
                      Limpiar todo
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-200">
                  {sortedFavorites.map((zone) => {
                    const colorInfo = getColorInfo(zone.color);
                    const isActive = currentZoneId === zone.id;

                    return (
                      <div
                        key={zone.id}
                        onClick={() => handleZoneClick(zone)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Título de la zona */}
                            <h4 className="font-semibold text-gray-900 mb-1 truncate flex items-center gap-2">
                              <FiMapPin className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{zone.address}</span>
                            </h4>

                            {/* Badge de seguridad */}
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${colorInfo.bgClass} ${colorInfo.textClass} ${colorInfo.borderClass} border mb-2`}>
                              <BiShield className="text-sm" />
                              {colorInfo.name}
                            </div>

                            {/* Coordenadas */}
                            <p className="text-xs text-gray-500">
                              {zone.lat?.toFixed(4)}, {zone.lng?.toFixed(4)}
                            </p>

                            {/* Fecha de agregado */}
                            <p className="text-xs text-gray-400 mt-1">
                              Agregado el {new Date(zone.addedAt).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Botón de eliminar */}
                          <button
                            onClick={(e) => handleRemoveFavorite(e, zone.id)}
                            className="flex-shrink-0 p-2 hover:bg-red-100 rounded-full transition-colors group"
                            aria-label="Remover de favoritos"
                            title="Remover de favoritos"
                          >
                            <FiX className="text-gray-400 group-hover:text-red-600 transition-colors" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer con info */}
          {favorites.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                💡 Haz clic en una zona para verla en el mapa
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
