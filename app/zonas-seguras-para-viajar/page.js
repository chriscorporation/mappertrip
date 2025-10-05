import Header from '../components/Header';
import AnimatedImage from '../components/AnimatedImage';
import ExploreButton from '../components/ExploreButton';
import { BiShield, BiLaptop, BiCamera, BiHome, BiMap } from 'react-icons/bi';

export const metadata = {
  title: 'Zonas Seguras para Viajar - Información de Barrios y Seguridad',
  description: 'Conoce las zonas más seguras para viajar como nómada digital. Información sobre seguridad, coworking, alojamiento Airbnb y lugares instagramables en cada barrio.',
  openGraph: {
    title: 'Zonas Seguras para Viajar - Información de Barrios y Seguridad',
    description: 'Viaja informado y seguro. Descubre información detallada de cada barrio con datos de locales y viajeros expertos.',
  },
};

export default function ZonasSeguras() {
  const features = [
    {
      id: 'seguridad',
      title: 'Seguridad',
      icon: BiShield,
      description: (
        <>
          Analizamos cada zona combinando <strong className="font-bold text-gray-900">datos locales en tiempo real</strong>, estadísticas oficiales y experiencias compartidas por otros viajeros. Cada área tiene su <strong className="font-bold text-gray-900">calificación de seguridad</strong>, y toda esta información está disponible para que la comunidad viaje mejor informada. Toma decisiones con confianza sobre dónde <strong className="font-bold text-gray-900">alojarte</strong>, <strong className="font-bold text-gray-900">trabajar</strong> y <strong className="font-bold text-gray-900">explorar</strong>.
        </>
      )
    },
    {
      id: 'coworking',
      title: 'CoWorking',
      icon: BiLaptop,
      description: (
        <>
          No todos los cafés son buenos para <strong className="font-bold text-gray-900">trabajar remoto</strong>. Evaluamos cada espacio considerando <strong className="font-bold text-gray-900">WiFi de calidad</strong>, comodidad del mobiliario, nivel de ruido ambiente, disponibilidad de enchufes y la energía del lugar. Encuentra <strong className="font-bold text-gray-900">espacios de coworking</strong> y <strong className="font-bold text-gray-900">cafés para trabajar</strong> donde puedas ser realmente productivo mientras disfrutas de tu entorno.
        </>
      )
    },
    {
      id: 'instagrameable',
      title: 'Instagrameable',
      icon: BiCamera,
      description: (
        <>
          Descubre los <strong className="font-bold text-gray-900">lugares que aman los locales</strong> y que rara vez aparecen en las guías turísticas. <strong className="font-bold text-gray-900">Miradores escondidos</strong>, calles con <strong className="font-bold text-gray-900">arte urbano</strong> vibrante, cafés con personalidad única y esos <strong className="font-bold text-gray-900">rincones fotogénicos</strong> que hacen que cada foto cuente una historia auténtica del lugar que visitas.
        </>
      )
    },
    {
      id: 'airbnb',
      title: 'Airbnb',
      icon: BiHome,
      description: (
        <>
          Antes de hacer tu reserva, verifica si tu <strong className="font-bold text-gray-900">alojamiento está en una zona segura</strong>. Te mostramos la conectividad con <strong className="font-bold text-gray-900">transporte público</strong>, servicios cercanos como supermercados y farmacias, y la vibra general del <strong className="font-bold text-gray-900">barrio</strong>. Porque un <strong className="font-bold text-gray-900">apartamento Airbnb</strong> hermoso merece estar en una ubicación igual de buena.
        </>
      )
    },
    {
      id: 'barrio',
      title: 'Información del Barrio',
      icon: BiMap,
      description: (
        <>
          Conocer el barrio antes de llegar marca la diferencia entre sentirte turista o sentirte como en casa. Ofrecemos <strong className="font-bold text-gray-900">información curada</strong> sobre cada zona: su historia y ambiente, <strong className="font-bold text-gray-900">horarios recomendados</strong>, opciones de <strong className="font-bold text-gray-900">transporte</strong>, <strong className="font-bold text-gray-900">restaurantes locales</strong> favoritos, y todos esos detalles que enriquecen tu <strong className="font-bold text-gray-900">experiencia de viaje</strong>.
        </>
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <Header isAdminMode={false} />

      <section className="pt-6 pb-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="relative py-16 px-8 bg-white overflow-hidden rounded-3xl">
            <div className="relative z-10">
              <div className="mb-10 md:max-w-2xl mx-auto text-center">
                <span className="inline-block mb-5 text-sm text-gray-900 font-bold uppercase tracking-widest">
                  ¿Por qué conocer la zona?
                </span>
                <h1 className="font-heading mb-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                    Un viaje seguro se disfruta más
                  </span>
                </h1>
                <p className="text-gray-500 font-bold text-lg">
                  Sabemos que conocer un nuevo país es una experiencia divertida, pero a veces se puede convertir en estresante si no conocemos bien la zona. Por eso te ayudamos a viajar informado y seguro.
                </p>
              </div>

              <div className="mb-10 flex justify-center">
                <div className="max-w-3xl w-full rounded-3xl overflow-hidden relative" style={{ height: '364px' }}>
                  <AnimatedImage
                    src="/images/digital-nomads-2.png"
                    alt="Zonas seguras para viajar"
                    direction="vertical"
                    speed={0.2}
                    className="block"
                    style={{ width: '100%', maxWidth: 'none', height: 'auto' }}
                  />
                </div>
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="flex flex-wrap -m-3 mb-10">
                  {features.map((feature) => {
                    const IconComponent = feature.icon;
                    return (
                      <div key={feature.id} className="w-full p-3">
                        <div className="w-full block p-10 bg-gray-100 rounded-3xl">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <IconComponent className="text-2xl text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h2 className="font-heading mb-4 text-3xl font-black">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-900">
                                  {feature.title}
                                </span>
                              </h2>
                              <div className="text-gray-500 font-bold">
                                {feature.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center">
                  <ExploreButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
