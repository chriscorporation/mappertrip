'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PerplexityNotesDisplay from '../../components/PerplexityNotesDisplay';
import Paginator from '../../components/Paginator';
import BackButton from './BackButton';
import StreetViewPreview from '../../components/StreetViewPreview';

export default function BarriosContent({ countrySlug, initialData }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

  const [data, setData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [loading, setLoading] = useState(false);

  // Sincronizar cuando cambia el parámetro de URL
  useEffect(() => {
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [pageFromUrl]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/barrios?country=${countrySlug}&page=${currentPage}&limit=10`);
        const newData = await response.json();
        setData(newData);
      } catch (error) {
        console.error('Error fetching barrios:', error);
      } finally {
        setLoading(false);
      }
    };

    // Cargar datos si la página actual es diferente de la inicial
    if (currentPage !== initialData.pagination.currentPage) {
      fetchData();
    }
  }, [currentPage, countrySlug, initialData.pagination.currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Actualizar URL con el parámetro page
    router.push(`/barrios/${countrySlug}?page=${newPage}`, { scroll: false });
    // Scroll to top when page changes
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const { country, zones, pagination } = data;

  return (
    <div className="max-w-7xl mx-auto">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-gray-700 font-medium">Cargando barrios...</span>
            </div>
          </div>
        </div>
      )}

      {zones.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay barrios disponibles para este país</p>
          <BackButton />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-8 mb-10">
            {zones.map((zone) => {
              const notes = zone.perplexityNotes;

              return (
                <div key={zone.id} className="w-full">
                  <div className="w-full block p-10 bg-white border-2 border-gray-200 rounded-3xl shadow-lg">
                    {/* Layout: 2 columnas en desktop, 1 en mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Columna izquierda: Info y datos (8/12 en desktop) */}
                      <div className="lg:col-span-8">
                        <div className="mb-6">
                          <h2 className="font-heading mb-2 text-3xl font-black">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-900">
                              {zone.address} {zone.orientation ? `(${zone.orientation})` : ''}
                            </span>
                          </h2>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(zone.address + ' @' + zone.lat + ',' + zone.lng)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Ver en Google Maps
                          </a>
                        </div>

                        <PerplexityNotesDisplay perplexityData={notes} />
                      </div>

                      {/* Columna derecha: Street View Preview (4/12 en desktop) */}
                      <div className="lg:col-span-4">
                        <div className="sticky top-6">
                          <StreetViewPreview
                            lat={zone.lat}
                            lng={zone.lng}
                            address={zone.address}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginador */}
          {pagination && pagination.totalPages > 1 && (
            <Paginator
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <div className="flex justify-center mt-8">
        <BackButton />
      </div>
    </div>
  );
}
