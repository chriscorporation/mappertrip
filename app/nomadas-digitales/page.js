import Header from '../components/Header';
import AnimatedImage from '../components/AnimatedImage';
import ExploreButton from '../components/ExploreButton';
import Breadcrumbs from '../components/Breadcrumbs';

export const metadata = {
  title: 'Herramientas para Nómadas Digitales - Viaja Informado y Seguro',
  description: 'Plataforma diseñada para viajeros internacionales y nómadas digitales. Descubre Airbnbs seguros, cafés con wifi, espacios de coworking y zonas instagramables en Latinoamérica.',
  openGraph: {
    title: 'Herramientas para Nómadas Digitales - Viaja Informado y Seguro',
    description: 'Tu compañero perfecto en cada aventura. Información de locales, mejores Airbnbs, cafés con wifi, coworking y zonas instagramables.',
  },
};

export default function NomadasDigitales() {
  return (
    <div className="flex flex-col h-screen overflow-y-auto">
      <Header isAdminMode={false} />
      <Breadcrumbs />

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
                    <ExploreButton />
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-8">
                <div className="mx-auto md:mr-0 rounded-3xl overflow-hidden relative" style={{ width: '100%', maxWidth: '600px', height: '90vh' }}>
                  <AnimatedImage
                    src="/images/digital-nomads.png"
                    alt="Coworking space para nómadas digitales"
                    direction="horizontal"
                    speed={0.5}
                    className="block"
                    style={{ width: '200%', maxWidth: 'none', height: '100%', objectFit: 'cover' }}
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
