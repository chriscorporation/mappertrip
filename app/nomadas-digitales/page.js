'use client';

import { useEffect, useRef } from 'react';
import Header from '../components/Header';
import { useAuthStore } from '../store/authStore';

export default function NomadasDigitales() {
  const { isAuthenticated } = useAuthStore();
  const isAdminMode = isAuthenticated;
  const imageRef = useRef(null);

  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    // Esperar a que la imagen cargue para obtener sus dimensiones reales
    const handleImageLoad = () => {
      const container = img.parentElement;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const imgNaturalWidth = img.naturalWidth;
      const imgNaturalHeight = img.naturalHeight;

      // Calcular el ancho que la imagen tendría al 100% del alto del contenedor
      const scaledImgWidth = (imgNaturalWidth / imgNaturalHeight) * containerHeight;

      // Calcular cuánto necesitamos desplazar para ver toda la imagen
      // El máximo desplazamiento en píxeles es la diferencia entre el ancho escalado y el contenedor
      const maxScrollPx = scaledImgWidth - containerWidth;

      let position = 0;
      let direction = 1;
      const speed = 0.5; // Velocidad en píxeles por frame

      const animate = () => {
        position += speed * direction;

        // Cambiar dirección cuando llega a los límites
        if (position >= 0) {
          position = 0;
          direction = -1;
        } else if (position <= -maxScrollPx) {
          position = -maxScrollPx;
          direction = 1;
        }

        img.style.transform = `translateX(${position}px)`;
        requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);

      return animationId;
    };

    if (img.complete) {
      const animationId = handleImageLoad();
      return () => cancelAnimationFrame(animationId);
    } else {
      img.addEventListener('load', handleImageLoad);
      return () => img.removeEventListener('load', handleImageLoad);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-y-auto">
      <Header isAdminMode={isAdminMode} />

      <section className="pt-6 pb-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8 p-8 bg-white rounded-3xl">
            <div className="flex flex-wrap lg:items-center -m-8">
              <div className="w-full md:w-1/2 p-8">
                <div className="md:max-w-lg mx-auto">
                  <span className="inline-block mb-3 text-sm text-blue-500 font-bold uppercase tracking-widest">
                    Hecho por un nómada
                  </span>
                  <h1 className="font-heading mb-4 text-5xl text-gray-900 font-black tracking-tight">
                    <span>Herramientas para </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">nómadas digitales</span>
                  </h1>
                  <p className="mb-4 text-lg text-gray-700 leading-relaxed">
                    Somos tu compañero perfecto en cada aventura. Una plataforma diseñada para <strong className="font-bold text-gray-900">viajeros internacionales</strong> y <strong className="font-bold text-gray-900">nómadas digitales</strong> que buscan vivir <strong className="font-bold text-gray-900">experiencias auténticas y seguras</strong> en cada destino. Descubre información de valor alimentada por <strong className="font-bold text-gray-900">locales</strong>, encuentra los mejores <strong className="font-bold text-gray-900">Airbnbs</strong>, <strong className="font-bold text-gray-900">cafés con wifi</strong>, <strong className="font-bold text-gray-900">espacios de coworking</strong> y <strong className="font-bold text-gray-900">zonas instagramables</strong>.
                  </p>
                  <p className="mb-6 text-lg text-gray-700 leading-relaxed">
                    Ya sea que estés buscando el <strong className="font-bold text-gray-900">mejor café para trabajar</strong>, una <strong className="font-bold text-gray-900">zona segura para hospedarte</strong>, o ese lugar perfecto para capturar momentos únicos, nuestra comunidad de <strong className="font-bold text-gray-900">viajeros expertos</strong> ha reunido toda la información que necesitas. Actualmente cubrimos información valiosa de <strong className="font-bold text-gray-900">países de Latinoamérica</strong> y próximamente expandiremos nuestra cobertura a <strong className="font-bold text-gray-900">Europa</strong>. Convierte cada viaje en una historia inolvidable con <strong className="font-bold text-gray-900">recomendaciones confiables</strong> de quienes ya vivieron la experiencia.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => window.location.href = '/'}
                      className="px-6 py-3 text-sm text-white font-bold bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 rounded-full cursor-pointer transition-colors"
                    >
                      Explorar destinos seguros
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-8">
                <div className="mx-auto md:mr-0 rounded-3xl overflow-hidden relative" style={{ width: '100%', maxWidth: '600px', height: '90vh' }}>
                  <img
                    ref={imageRef}
                    className="block"
                    style={{ width: '200%', maxWidth: 'none', height: '100%', objectFit: 'cover' }}
                    src="/images/digital-nomads.png"
                    alt="Coworking space para nómadas digitales"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
